const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const localFile = path.resolve(__dirname, 'run_update_role.js');
const remoteFile = '/var/www/vieta-hrm/server/run_update_role.js';

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) throw err;
    const read = fs.createReadStream(localFile);
    const write = sftp.createWriteStream(remoteFile);
    write.on('close', () => {
      conn.exec('cd /var/www/vieta-hrm/server && node run_update_role.js && pm2 restart vieta-hrm', (err, stream) => {
        if (err) throw err;
        stream.on('close', () => conn.end())
              .on('data', d => process.stdout.write(d.toString()));
      });
    });
    read.pipe(write);
  });
}).connect({
  host: '103.195.238.161',
  port: 22,
  username: 'root',
  password: 'VietA@Hrm2026!'
});
