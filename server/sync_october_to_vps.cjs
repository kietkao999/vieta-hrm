const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const localFile = path.resolve(__dirname, 'sync_october_attendance.js');
const remoteFile = '/var/www/vieta-hrm/server/sync_october_attendance.js';

const VPS_HOST = '103.195.238.161';
const VPS_USER = 'root';
const VPS_PASS = 'VietA@Hrm2026!';

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH kết nối VPS thành công! Đang tải sync_october_attendance.js lên VPS...');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const read = fs.createReadStream(localFile);
    const write = sftp.createWriteStream(remoteFile);
    write.on('close', () => {
      console.log('Đã upload script! Đang chạy đồng bộ dữ liệu chấm công trên VPS...');
      conn.exec('cd /var/www/vieta-hrm/server && node sync_october_attendance.js', (err, stream) => {
        if (err) throw err;
        stream.on('close', () => {
          console.log('\nĐã hoàn thành đồng bộ chấm công trên VPS!');
          conn.end();
        }).on('data', d => process.stdout.write(d.toString()));
      });
    });
    read.pipe(write);
  });
}).connect({
  host: VPS_HOST,
  port: 22,
  username: VPS_USER,
  password: VPS_PASS
});
