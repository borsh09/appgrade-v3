import { existsSync } from 'node:fs';
const explicitEnv = process.argv.find(arg => arg.startsWith('--env-file='))?.slice(11);
if (explicitEnv && !existsSync(explicitEnv)) throw new Error('Указанный файл окружения не найден.');
for (const filename of explicitEnv ? [explicitEnv] : ['.env.local', '.env']) {
  if (existsSync(filename)) process.loadEnvFile(filename);
}
