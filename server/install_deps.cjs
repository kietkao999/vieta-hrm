const { Client } = require('ssh2');

function connectAndRun() {
  const conn = new Client();
  conn.on('ready', () => {
    console.log('Connected to VPS! Running npm install in /var/www/vieta-hrm/server ...');
    const cmd = `
      cd /var/www/vieta-hrm/server
      npm install express bcryptjs cors compression jsonwebtoken multer sqlite3 docx xlsx pdf-lib mammoth sharp --save --omit=dev
      pm2 delete all 2>/dev/null || true
      cd /var/www/vieta-hrm/server && pm2 start server.js --name vieta-hrm --env NODE_ENV=production
      pm2 save
      sleep 3
      curl -s http://127.0.0.1:5000/api/health
    `;
    conn.exec(cmd, (err, stream) => {
      if (err) {
        console.error('Exec error:', err);
        conn.end();
        return;
      }
      stream.on('close', (code) => {
        console.log('\nInstall and restart completed with code', code);
        conn.end();
        process.exit(code === 0 ? 0 : 1);
      }).on('data', d => process.stdout.write(d.toString()))
        .stderr.on('data', d => process.stderr.write(d.toString()));
    });
  }).on('error', (err) => {
    console.error('SSH connection failed, retrying in 2s...', err.message);
    setTimeout(connectAndRun, 2000);
  }).connect({
    host: '103.195.238.161',
    port: 22,
    username: 'root',
    password: 'VietA@Hrm2026!',
    readyTimeout: 30000
  });
}

connectAndRun();
