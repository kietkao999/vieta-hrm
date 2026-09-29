const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const localPath = path.resolve(__dirname, 'src/controllers/authController.js');
const remotePath = '/var/www/vieta-hrm/server/src/controllers/authController.js';

const conn = new Client();
conn.on('ready', () => {
  console.log('Uploading updated authController.js to VPS...');
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const readStream = fs.createReadStream(localPath);
    const writeStream = sftp.createWriteStream(remotePath);
    writeStream.on('close', () => {
      console.log('Uploaded authController.js! Restarting PM2...');
      conn.exec('pm2 restart vieta-hrm', (err, stream) => {
        if (err) throw err;
        stream.on('close', () => {
          console.log('PM2 restarted successfully!');
          conn.end();
        }).on('data', d => process.stdout.write(d.toString()));
      });
    });
    readStream.pipe(writeStream);
  });
}).connect({
  host: '103.195.238.161',
  port: 22,
  username: 'root',
  password: 'VietA@Hrm2026!'
});
