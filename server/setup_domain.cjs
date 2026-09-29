const https = require('https');
const { Client } = require('ssh2');

const DUCKDNS_TOKEN = '68c5b05a-8ba5-4f46-950c-e2f7ea4cb912'; // Generic or let's create a duckdns domain
const DOMAIN = 'hrmvieta'; // hrmvieta.duckdns.org

// Let's test registering on duckdns
function updateDuckDNS(domain, ip) {
  return new Promise((resolve) => {
    https.get(`https://www.duckdns.org/update?domains=${domain}&token=a7c4d0ad-114e-40e8-ba62-d922f3e8f804&ip=${ip}`, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => {
        console.log('DuckDNS response:', data.trim());
        resolve(data.trim() === 'OK');
      });
    }).on('error', () => resolve(false));
  });
}

async function setupSSL() {
  const ip = '103.195.238.161';
  console.log('Setting up DuckDNS domain ...');
  // Or configure Nginx for direct domain access
  const conn = new Client();
  conn.on('ready', () => {
    const cmd = `
      # Update Nginx to accept all server names
      cat << 'EOF' > /etc/nginx/sites-available/default
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    client_max_body_size 100M;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
        proxy_cache_bypass \\$http_upgrade;
        proxy_set_header X-Real-IP \\$remote_addr;
        proxy_set_header X-Forwarded-For \\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\$scheme;
    }
}
EOF
      nginx -t && systemctl reload nginx
    `;
    conn.exec(cmd, (err, stream) => {
      if (err) throw err;
      stream.on('close', () => {
        console.log('Nginx updated to accept any domain pointing to this IP!');
        conn.end();
      }).on('data', d => process.stdout.write(d.toString()));
    });
  }).connect({
    host: ip,
    port: 22,
    username: 'root',
    password: 'VietA@Hrm2026!'
  });
}

setupSSL();
