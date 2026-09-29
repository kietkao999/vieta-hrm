const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const VPS_HOST = '103.195.238.161';
const VPS_USER = 'root';
const VPS_PASS = 'VietA@Hrm2026!';
const REMOTE_DIR = '/var/www/vieta-hrm';

async function deployUpdate() {
  console.log('=== [1/4] Đang Build Frontend Client (Production) ===');
  execSync('npm run build', { cwd: path.join(rootDir, 'client'), stdio: 'inherit' });

  console.log('\n=== [2/4] Đang nén file cập nhật (client/dist & server/src) ===');
  const archivePath = path.join(os.tmpdir(), 'vieta_update.tar.gz');
  if (fs.existsSync(archivePath)) fs.unlinkSync(archivePath);

  execSync(`tar -czf "${archivePath}" client/dist server/src package.json`, {
    cwd: rootDir,
    stdio: 'inherit'
  });
  console.log(`Đã nén thành công: ${(fs.statSync(archivePath).size / 1024 / 1024).toFixed(2)} MB`);

  console.log(`\n=== [3/4] Đang kết nối SSH & tải lên VPS (${VPS_HOST}) ===`);
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

  console.log('SSH kết nối thành công! Đang SFTP file lên VPS...');
  await new Promise((resolve, reject) => {
    conn.sftp((err, sftp) => {
      if (err) return reject(err);
      const readStream = fs.createReadStream(archivePath);
      const writeStream = sftp.createWriteStream(`${REMOTE_DIR}/vieta_update.tar.gz`);
      writeStream.on('close', resolve);
      writeStream.on('error', reject);
      readStream.pipe(writeStream);
    });
  });

  console.log('\n=== [4/4] Đang giải nén & khởi động lại PM2 trên VPS ===');
  const extractCmd = `cd ${REMOTE_DIR} && tar -xzf vieta_update.tar.gz && rm -f vieta_update.tar.gz && pm2 restart vieta-hrm && sleep 2 && pm2 list`;
  
  await new Promise((resolve, reject) => {
    conn.exec(extractCmd, (err, stream) => {
      if (err) return reject(err);
      stream.on('close', () => {
        resolve();
      }).on('data', d => process.stdout.write(d.toString()))
        .stderr.on('data', d => process.stderr.write(d.toString()));
    });
  });

  // Kiểm tra health check
  console.log('\n=== Kiểm tra Health Check trên VPS ===');
  await new Promise((resolve) => {
    conn.exec('curl -s http://127.0.0.1:5000/api/health', (err, stream) => {
      if (err) return resolve();
      stream.on('close', resolve).on('data', d => process.stdout.write(d.toString()));
    });
  });

  conn.end();
  if (fs.existsSync(archivePath)) fs.unlinkSync(archivePath);

  console.log('\n===============================================================');
  console.log('🎉 CẬP NHẬT LÊN MÁY CHỦ THÀNH CÔNG 100%!');
  console.log(`👉 Truy cập website: http://${VPS_HOST}`);
  console.log('===============================================================\n');
}

deployUpdate().catch(err => {
  console.error('Lỗi triển khai:', err);
  process.exit(1);
});
