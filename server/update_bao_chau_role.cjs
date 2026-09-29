const { Client } = require('ssh2');
const sqlite3 = require('sqlite3');
const path = require('path');
const bcrypt = require('bcryptjs');

const localDbPath = path.resolve(__dirname, 'hrm.db');

async function updateLocal() {
  const db = new sqlite3.Database(localDbPath);
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE users SET role_id = 4 WHERE username = 'vieta056' OR employee_id IN (SELECT id FROM employees WHERE fullname LIKE '%Bảo Châu%')`,
      function(err) {
        if (err) return reject(err);
        console.log(`Local DB updated! Rows changed: ${this.changes}`);
        db.close();
        resolve();
      }
    );
  });
}

async function updateVPS() {
  const conn = new Client();
  return new Promise((resolve, reject) => {
    conn.on('ready', () => {
      console.log('SSH connected. Updating Bao Chau to Role 4 (EMPLOYEE - Cấp 3) on VPS...');
      const cmd = `
        sqlite3 /var/www/vieta-hrm/server/hrm.db "UPDATE users SET role_id = 4 WHERE username = 'vieta056' OR employee_id IN (SELECT id FROM employees WHERE fullname LIKE '%Bảo Châu%');"
        cd /var/www/vieta-hrm/server && node -e "import('./src/config/syncPasswords.js').then(m => m.syncAllUserPasswords())"
        pm2 restart vieta-hrm
        sqlite3 /var/www/vieta-hrm/server/hrm.db "SELECT u.username, u.role_id, r.name, e.fullname FROM users u JOIN roles r ON u.role_id=r.id LEFT JOIN employees e ON u.employee_id=e.id WHERE u.username='vieta056';"
      `;
      conn.exec(cmd, (err, stream) => {
        if (err) return reject(err);
        stream.on('close', (code) => {
          console.log(`VPS update finished with code ${code}`);
          conn.end();
          resolve();
        }).on('data', d => process.stdout.write(d.toString()))
          .stderr.on('data', d => process.stderr.write(d.toString()));
      });
    }).on('error', reject).connect({
      host: '103.195.238.161',
      port: 22,
      username: 'root',
      password: 'VietA@Hrm2026!'
    });
  });
}

async function main() {
  await updateLocal();
  await updateVPS();
  console.log('>>> HOÀN TẤT ĐIỀU CHỈNH PHÂN QUYỀN TRẦN THỊ BẢO CHÂU VỀ CẤP 3 (EMPLOYEE)!');
  process.exit(0);
}

main().catch(console.error);
