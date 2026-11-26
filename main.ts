// 小满家账的参赛交付程序：把 app/ 与 screenshots/ 复制到输出目录，并用 kit 的 buildDossier 生成 dossier.json。
// 只用 Node 标准库；输出目录在评测容器里是 /output，本机自检时用环境变量 MAKEFUN_OUTPUT_DIR 指定。
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoDir, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
const shotsDir = join(repoDir, 'screenshots');
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

// 上限与评测端的 gate 对齐：截图最多 4 张、单张 256KiB；app/ 最多 993 项、16MiB；正文摘录上限 160KiB。
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log('小满家账已交付到', outputDir);
