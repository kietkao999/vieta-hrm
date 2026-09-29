const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('SSH connected. Running fast setup...');
  
  const cmd = `
    sed -i 's/de.archive.ubuntu.com/archive.ubuntu.com/g' /etc/apt/sources.list /etc/apt/sources.list.d/*.sources 2>/dev/null || true
    pkill -9 apt apt-get dpkg 2>/dev/null || true
    dpkg --configure -a 2>/dev/null || true
    
    cd /var/www/vieta-hrm/server
    rm -rf node_modules package-lock.json
    npm install --no-audit --omit=dev
    
    pm2 delete all 2>/dev/null || true
    cd /var/www/vieta-hrm/server && pm2 start server.js --name vieta-hrm --env NODE_ENV=production
    pm2 save
    
    sleep 3
    curl -s http://127.0.0.1:5000/api/health
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    let out = '';
    stream.on('close', (code) => {
      console.log(`\nFast setup finished with code ${code}`);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data.toString());
      out += data.toString();
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
