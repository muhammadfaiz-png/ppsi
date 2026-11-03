const { execSync } = require('child_process');

const dbUrl = process.env.DATABASE_URL || '';
const isPostgres = dbUrl.startsWith('postgresql:') || dbUrl.startsWith('postgres:');
const schema = isPostgres ? 'prisma/schema.postgresql.prisma' : 'prisma/schema.prisma';

console.log(`[Vercel Build] Generating Prisma client using ${schema}...`);
execSync(`npx prisma generate --schema=${schema}`, { stdio: 'inherit' });

console.log('[Vercel Build] Running Next.js build...');
execSync('npx next build', { stdio: 'inherit' });

