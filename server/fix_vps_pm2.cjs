const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connected. Installing build-essential & fixing sqlite3...');
  
  const cmd = `
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -y
    apt-get install -y build-essential python3 make gcc g++
    cd /var/www/vieta-hrm/server && npm install --build-from-source=sqlite3
    pm2 delete all || true
    cd /var/www/vieta-hrm/server && pm2 start server.js --name vieta-hrm --env NODE_ENV=production
    pm2 save
    sleep 3
    curl -I http://127.0.0.1:5000/api/health
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log(`Command finished with code ${code}`);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data.toString());
    }).stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });
  });
}).on('error', (err) => {
  console.error('SSH Error:', err);
}).connect({
  host: '103.195.238.161',
  port: 22,
  username: 'root',
  password: 'VietA@Hrm2026!'
});
