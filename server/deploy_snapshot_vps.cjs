const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const VPS_HOST = '103.195.238.161';
const VPS_USER = 'root';
const VPS_PASS = 'VietA@Hrm2026!';

const filesToUpload = [
  {
    local: path.resolve(__dirname, 'src/config/database.js'),
    remote: '/var/www/vieta-hrm/server/src/config/database.js'
  },
  {
    local: path.resolve(__dirname, 'src/controllers/payrollController.js'),
    remote: '/var/www/vieta-hrm/server/src/controllers/payrollController.js'
  },
  {
    local: path.resolve(__dirname, 'src/controllers/kpiController.js'),
    remote: '/var/www/vieta-hrm/server/src/controllers/kpiController.js'
  },
  {
    local: path.resolve(__dirname, 'src/controllers/attendanceController.js'),
    remote: '/var/www/vieta-hrm/server/src/controllers/attendanceController.js'
  },
  {
    local: path.resolve(__dirname, 'src/controllers/employeeController.js'),
    remote: '/var/www/vieta-hrm/server/src/controllers/employeeController.js'
  },
  {
    local: path.resolve(__dirname, 'src/controllers/reportController.js'),
    remote: '/var/www/vieta-hrm/server/src/controllers/reportController.js'
  }
];

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH kết nối VPS thành công!');
  conn.sftp(async (err, sftp) => {
    if (err) throw err;

    // Upload server files
    for (const f of filesToUpload) {
      console.log(`Đang tải: ${path.basename(f.local)} -> ${f.remote}`);
      await new Promise((resolve, reject) => {
        const read = fs.createReadStream(f.local);
        const write = sftp.createWriteStream(f.remote);
        write.on('close', resolve);
        write.on('error', reject);
        read.pipe(write);
      });
    }

    // Chạy migration và khởi động lại dịch vụ trên VPS
    const execCmd = `
      cd /var/www/vieta-hrm/server &&
      node -e "import('./src/config/database.js').then(async ({ initDatabase, query }) => {
        await initDatabase();
        console.log('VPS: Da chay initDatabase & backfill snapshot phong ban thanh cong!');
        process.exit(0);
      });" &&
      pm2 restart all
    `;

    console.log('Đang thực thi migration và khởi động lại PM2 trên VPS...');
    conn.exec(execCmd, (err, stream) => {
      if (err) throw err;
      stream.on('close', () => {
        console.log('\n>>> TRIỂN KHAI VÀ ĐỒNG BỘ LÊN MẠNG (VPS) HOÀN TẤT THÀNH CÔNG! <<<');
        conn.end();
        process.exit(0);
      }).on('data', d => process.stdout.write(d.toString()))
        .stderr.on('data', d => process.stderr.write(d.toString()));
    });
  });
}).connect({
  host: VPS_HOST,
  port: 22,
  username: VPS_USER,
  password: VPS_PASS
});
