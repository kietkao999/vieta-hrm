import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { Client } = require('ssh2');
const archiver = require('archiver');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const VPS_HOST = '103.195.238.161';
const VPS_USER = 'root';
const VPS_PASS = 'VietA@Hrm2026!';
const REMOTE_DIR = '/var/www/vieta-hrm';

function executeSSH(conn, cmd) {
  return new Promise((resolve, reject) => {
    console.log(`\n[VPS SSH] > ${cmd}`);
    conn.exec(cmd, (err, stream) => {
      if (err) return reject(err);
      let stdout = '';
      let stderr = '';
      stream.on('close', (code, signal) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          console.error(`[Exit Code ${code}]`, stderr);
          resolve(stdout);
        }
      }).on('data', (data) => {
        process.stdout.write(data.toString());
        stdout += data.toString();
      }).stderr.on('data', (data) => {
        process.stderr.write(data.toString());
        stderr += data.toString();
      });
    });
  });
}

function uploadFile(conn, localPath, remotePath) {
  return new Promise((resolve, reject) => {
    console.log(`\n[SFTP] Đang tải lên: ${localPath} -> ${remotePath}`);
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      const readStream = fs.createReadStream(localPath);
      const writeStream = sftp.createWriteStream(remotePath);
      writeStream.on('close', () => {
        console.log(`[SFTP] Tải lên thành công!`);
        resolve();
      });
      writeStream.on('error', (e) => reject(e));
      readStream.pipe(writeStream);
    });
  });
}

async function createDeployArchive(outputPath) {
  return new Promise((resolve, reject) => {
    console.log('>>> Đang nén mã nguồn hệ thống thành deploy_package.tar.gz ...');
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('tar', {
      gzip: true,
      gzipOptions: { level: 9 }
    });

    output.on('close', () => {
      console.log(`>>> Nén hoàn tất! Kích thước: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
      resolve();
    });

    archive.on('error', (err) => reject(err));
    archive.pipe(output);

    // Thêm thư mục server (bỏ qua node_modules)
    archive.directory(path.join(rootDir, 'server'), 'server', (entry) => {
      if (entry.name.includes('node_modules') || entry.name.includes('.git')) {
        return false;
      }
      return entry;
    });

    // Thêm thư mục client/dist
    archive.directory(path.join(rootDir, 'client', 'dist'), 'client/dist');

    // Thêm package.json gốc
    archive.file(path.join(rootDir, 'package.json'), { name: 'package.json' });

    archive.finalize();
  });
}

async function startDeployment() {
  const archivePath = path.join(rootDir, 'deploy_package.tar.gz');

  try {
    // 1. Tạo file nén
    await createDeployArchive(archivePath);

    // 2. Kết nối SSH
    console.log(`\n>>> Đang kết nối SSH tới máy chủ ${VPS_HOST}...`);
    const conn = new Client();

    await new Promise((resolve, reject) => {
      conn.on('ready', resolve).on('error', reject).connect({
        host: VPS_HOST,
        port: 22,
        username: VPS_USER,
        password: VPS_PASS,
        readyTimeout: 30000
      });
    });

    console.log('>>> Kết nối SSH thành công!');

    // 3. Cài đặt môi trường máy chủ (Node.js 20, Nginx, PM2, UFW)
    console.log('\n>>> Bắt đầu cài đặt môi trường trên VPS Ubuntu ...');
    await executeSSH(conn, 'export DEBIAN_FRONTEND=noninteractive && apt-get update -y');
    await executeSSH(conn, 'curl -fsSL https://deb.nodesource.com/setup_20.x | bash -');
    await executeSSH(conn, 'export DEBIAN_FRONTEND=noninteractive && apt-get install -y nodejs nginx tar gzip curl ufw');
    await executeSSH(conn, 'npm install -g pm2');

    // 4. Tạo thư mục chứa app
    await executeSSH(conn, `mkdir -p ${REMOTE_DIR}`);

    // 5. Tải file code lên VPS
    await uploadFile(conn, archivePath, `${REMOTE_DIR}/deploy_package.tar.gz`);

    // 6. Giải nén trên VPS và cài đặt packages
    console.log('\n>>> Đang giải nén và cấu hình ứng dụng trên máy chủ ...');
    await executeSSH(conn, `cd ${REMOTE_DIR} && tar -xzf deploy_package.tar.gz && rm -f deploy_package.tar.gz`);
    await executeSSH(conn, `cd ${REMOTE_DIR}/server && npm install --omit=dev`);

    // 7. Cấu hình Nginx làm Reverse Proxy
    console.log('\n>>> Đang cấu hình máy chủ Web Nginx ...');
    const nginxConfig = `
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 100M;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
        proxy_cache_bypass \\$http_upgrade;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
    }
}
`;
    await executeSSH(conn, `cat << 'EOF' > /etc/nginx/sites-available/default\n${nginxConfig}\nEOF`);
    await executeSSH(conn, 'nginx -t && systemctl reload nginx');

    // 8. Cấu hình Firewall UFW (Cho phép port 80, 443, 22)
    await executeSSH(conn, 'ufw allow 22/tcp');
    await executeSSH(conn, 'ufw allow 80/tcp');
    await executeSSH(conn, 'ufw allow 443/tcp');
    await executeSSH(conn, 'echo "y" | ufw enable');

    // 9. Khởi động ứng dụng với PM2 (Tự restart khi reboot)
    console.log('\n>>> Khởi động HRM Nệm Việt Á bằng PM2 Daemon ...');
    await executeSSH(conn, `pm2 delete vieta-hrm || true`);
    await executeSSH(conn, `cd ${REMOTE_DIR} && pm2 start server/server.js --name vieta-hrm --env NODE_ENV=production`);
    await executeSSH(conn, 'pm2 save');
    await executeSSH(conn, 'pm2 startup systemd -u root --hp /root || true');

    // 10. Kiểm tra trạng thái máy chủ
    console.log('\n>>> Kiểm tra trạng thái hệ thống ...');
    await executeSSH(conn, 'pm2 list');
    await executeSSH(conn, 'sleep 2 && curl -s http://127.0.0.1:5000/api/health');

    conn.end();

    // Dọn dẹp file nén cục bộ
    if (fs.existsSync(archivePath)) {
      fs.unlinkSync(archivePath);
    }

    console.log('\n===============================================================');
    console.log('🎉 TRIỂN KHAI HOÀN TẤT 100%! HỆ THỐNG ĐÃ SẴN SÀNG HOẠT ĐỘNG!');
    console.log(`👉 Truy cập ngay tại: http://${VPS_HOST}`);
    console.log('===============================================================\n');

  } catch (error) {
    console.error('Lỗi trong quá trình triển khai:', error);
  }
}

startDeployment();
