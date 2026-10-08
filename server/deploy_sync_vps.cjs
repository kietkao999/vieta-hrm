const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const VPS_HOST = '103.195.238.161';
const VPS_USER = 'root';
const VPS_PASS = 'VietA@Hrm2026!';

const filesToUpload = [
  {
    local: path.resolve(__dirname, 'src/controllers/payrollController.js'),
    remote: '/var/www/vieta-hrm/server/src/controllers/payrollController.js'
  },
  {
    local: path.resolve(__dirname, 'src/controllers/attendanceController.js'),
    remote: '/var/www/vieta-hrm/server/src/controllers/attendanceController.js'
  },
  {
    local: path.resolve(__dirname, 'src/routes/payrollRoutes.js'),
    remote: '/var/www/vieta-hrm/server/src/routes/payrollRoutes.js'
  },
  {
    local: path.resolve(__dirname, 'src/config/database.js'),
    remote: '/var/www/vieta-hrm/server/src/config/database.js'
  }
];

// Helper to upload directory recursively
async function uploadDir(sftp, localDir, remoteDir) {
  const entries = fs.readdirSync(localDir, { withFileTypes: true });
  for (const entry of entries) {
    const localPath = path.join(localDir, entry.name);
    const remotePath = `${remoteDir}/${entry.name}`.replace(/\\/g, '/');
    if (entry.isDirectory()) {
      await new Promise(res => {
        sftp.mkdir(remotePath, () => res());
      });
      await uploadDir(sftp, localPath, remotePath);
    } else {
      await new Promise((resolve, reject) => {
        const readStream = fs.createReadStream(localPath);
        const writeStream = sftp.createWriteStream(remotePath);
        writeStream.on('close', resolve);
        writeStream.on('error', reject);
        readStream.pipe(writeStream);
      });
    }
  }
}

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

    // Upload client/dist
    const localDist = path.resolve(__dirname, '../client/dist');
    const remoteDist = '/var/www/vieta-hrm/client/dist';
    if (fs.existsSync(localDist)) {
      console.log('Đang tải thư mục client/dist lên VPS...');
      await uploadDir(sftp, localDist, remoteDist);
      console.log('Đã tải xong client/dist!');
    }

    // Chạy migration cột cut_hours trên payrolls và đồng bộ chấm công tháng 10
    const execCmd = `
      cd /var/www/vieta-hrm/server &&
      node -e "import('./src/config/database.js').then(async ({ query, initDatabase }) => {
        try {
          await query.run('ALTER TABLE payrolls ADD COLUMN cut_hours REAL DEFAULT 0');
          console.log('VPS: Da them cot cut_hours vao payrolls');
        } catch(e) {}
        const { syncAttendanceToPayrollForMonth } = await import('./src/controllers/payrollController.js');
        const res = await syncAttendanceToPayrollForMonth(10, 2026);
        console.log('Kết quả đồng bộ tháng 10/2026:', JSON.stringify(res));

        const cuong = await query.all('SELECT p.id, e.fullname, e.code, p.work_days, p.cut_hours, p.hour_deduction, p.net_salary FROM payrolls p JOIN employees e ON p.employee_id = e.id WHERE (p.month = 10 OR p.month = \\'10\\') AND p.year = 2026 AND (p.cut_hours > 0 OR p.hour_deduction > 0)');
        console.log('Nhân sự có khấu trừ cắt giờ trên VPS:', JSON.stringify(cuong, null, 2));

        process.exit(0);
      });" &&
      pm2 restart all
    `;

    console.log('Đang thực thi đồng bộ dữ liệu và khởi động lại dịch vụ trên VPS...');
    conn.exec(execCmd, (err, stream) => {
      if (err) throw err;
      stream.on('close', () => {
        console.log('\n>>> TRIỂN KHAI VÀ ĐỒNG BỘ VPS HOÀN TẤT THÀNH CÔNG! <<<');
        conn.end();
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
