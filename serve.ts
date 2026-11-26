// 本地预览用的极简静态服务器：把 app/ 目录按正确 MIME 类型发给浏览器，不做任何构建。
// 用法：node serve.ts [--port 8090]，然后打开 http://localhost:8090
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), 'app');
const portArg = process.argv.indexOf('--port');
const port = portArg > 0 ? Number(process.argv[portArg + 1]) : 8080;

const mimeTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0]);
  let filePath = join(root, urlPath === '/' ? 'index.html' : urlPath);
  if (!existsSync(filePath) || statSync(filePath).isDirectory()) filePath = join(root, 'index.html');
  res.writeHead(200, { 'content-type': mimeTypes[extname(filePath)] ?? 'application/octet-stream' });
  res.end(readFileSync(filePath));
}).listen(port, () => console.log(`小满家账预览：http://localhost:${port}`));
