const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  conn.exec('ps aux | grep -E "apt|dpkg|npm|node"', (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
          .on('data', (d) => process.stdout.write(d.toString()));
  });
}).connect({
  host: '103.195.238.161',
  port: 22,
  username: 'root',
  password: 'VietA@Hrm2026!'
});
