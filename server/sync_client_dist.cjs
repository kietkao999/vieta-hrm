const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const VPS_HOST = '103.195.238.161';
const VPS_USER = 'root';
const VPS_PASS = 'VietA@Hrm2026!';

async function run() {
  const archivePath = path.join(os.tmpdir(), 'client_dist.tar.gz');
  console.log('Archiving client/dist ...');
  if (fs.existsSync(archivePath)) fs.unlinkSync(archivePath);
  
  execSync(`tar -czf "${archivePath}" client/dist`, { cwd: rootDir });

  const conn = new Client();
  conn.on('ready', () => {
    console.log('Uploading client_dist.tar.gz to VPS...');
    conn.sftp((err, sftp) => {
      if (err) throw err;
      const readStream = fs.createReadStream(archivePath);
      const writeStream = sftp.createWriteStream('/var/www/vieta-hrm/client_dist.tar.gz');
      writeStream.on('close', () => {
        console.log('Extracting client/dist on VPS...');
        conn.exec('cd /var/www/vieta-hrm && tar -xzf client_dist.tar.gz && rm -f client_dist.tar.gz && pm2 restart vieta-hrm', (err, stream) => {
          if (err) throw err;
          stream.on('close', () => {
            console.log('Client dist successfully synced and PM2 restarted!');
            conn.end();
          }).on('data', d => process.stdout.write(d.toString()));
        });
      });
      readStream.pipe(writeStream);
    });
  }).connect({
    host: VPS_HOST,
    port: 22,
    username: VPS_USER,
    password: VPS_PASS
  });
}

run();
