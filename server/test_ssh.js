import { Client } from 'ssh2';

const host = '103.195.238.161';
const passwordsToTry = ['VietA@Root2026!#', 'VietA@Hrm2026!'];

async function testPassword(pwd) {
  return new Promise((resolve) => {
    const conn = new Client();
    conn.on('ready', () => {
      console.log(`>>> Kết nối SSH thành công với mật khẩu: ${pwd}`);
      conn.exec('uname -a && node -v || echo "Chưa có node"', (err, stream) => {
        if (err) {
          conn.end();
          return resolve(false);
        }
        stream.on('close', (code, signal) => {
          conn.end();
          resolve(true);
        }).on('data', (data) => {
          console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
          console.log('STDERR: ' + data);
        });
      });
    }).on('error', (err) => {
      console.log(`Thử mật khẩu "${pwd}" thất bại: ${err.message}`);
      resolve(false);
    }).connect({
      host: host,
      port: 22,
      username: 'root',
      password: pwd,
      readyTimeout: 10000
    });
  });
}

async function run() {
  for (const pwd of passwordsToTry) {
    console.log(`Đang thử kết nối tới ${host} với user: root ...`);
    const success = await testPassword(pwd);
    if (success) {
      console.log('ĐÃ XÁC THỰC THÀNH CÔNG!');
      process.exit(0);
    }
  }
  console.log('Tất cả mật khẩu thử nghiệm đều không khớp. Cần kiểm tra lại mật khẩu từ email của InterData.');
  process.exit(1);
}

run();
