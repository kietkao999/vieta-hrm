const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  const script = `
    import('./src/config/database.js').then(async m => {
      await m.query.run("UPDATE users SET role_id = 4 WHERE username = 'vieta056' OR employee_id IN (SELECT id FROM employees WHERE fullname LIKE '%Bảo Châu%')");
      const u = await m.query.get("SELECT u.username, u.role_id, r.name as role_name, r.display_name, e.fullname, e.code FROM users u JOIN roles r ON u.role_id = r.id LEFT JOIN employees e ON u.employee_id = e.id WHERE u.username = 'vieta056'");
      console.log('>>> KẾT QUẢ KIỂM TRA TRÊN MÁY CHỦ VPS:', u);
      process.exit(0);
    });
  `;

  conn.exec(`node --input-type=module -e "${script.replace(/\n/g, ' ')}"`, (err, stream) => {
    if (err) throw err;
    stream.on('close', () => conn.end())
          .on('data', d => process.stdout.write(d.toString()))
          .stderr.on('data', d => process.stderr.write(d.toString()));
  });
}).connect({
  host: '103.195.238.161',
  port: 22,
  username: 'root',
  password: 'VietA@Hrm2026!'
});
