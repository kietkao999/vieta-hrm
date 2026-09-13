import { query, initDatabase } from './src/config/database.js';

await initDatabase();

const docs = await query.all('SELECT id, title, category, file_url FROM documents ORDER BY id');
console.log('DANH SÁCH VĂN BẢN HIỆN CÓ:');
console.log(JSON.stringify(docs, null, 2));

process.exit(0);
