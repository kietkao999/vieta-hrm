const { Client } = require('ssh2');

function run() {
  const conn = new Client();
  conn.on('ready', () => {
    console.log('Connected! Starting vieta-hrm on PM2...');
    const cmd = `
      cd /var/www/vieta-hrm/server
      pm2 delete all 2>/dev/null || true
      pm2 start server.js --name vieta-hrm --env NODE_ENV=production
      pm2 save
      sleep 2
      pm2 list
      curl -s http://127.0.0.1:5000/api/health || echo "Curl done"
    `;
    conn.exec(cmd, (err, stream) => {
      if (err) throw err;
      stream.on('close', (code) => {
        console.log('Finished with code', code);
        conn.end();
      }).on('data', d => process.stdout.write(d.toString()))
        .stderr.on('data', d => process.stderr.write(d.toString()));
    });
  }).on('error', (err) => {
    console.error('Connection error, retrying in 2s...', err.message);
    setTimeout(run, 2000);
  }).connect({
    host: '103.195.238.161',
    port: 22,
    username: 'root',
    password: 'VietA@Hrm2026!',
    readyTimeout: 20000
  });
}

run();
