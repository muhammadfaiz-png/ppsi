const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

async function main() {
  loadEnv();
  const dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
  console.log(`[DB-Setup] Initializing database with target: ${dbUrl}`);

  const isPostgres = dbUrl.startsWith('postgresql:') || dbUrl.startsWith('postgres:');
  const schemaFile = isPostgres ? 'prisma/schema.postgresql.prisma' : 'prisma/schema.prisma';

  console.log(`[DB-Setup] Using schema: ${schemaFile}`);

  try {
    console.log('[DB-Setup] Pushing schema to database...');
    execSync(`npx prisma db push --schema=${schemaFile} --accept-data-loss`, {
      stdio: 'inherit',
    });

    console.log('[DB-Setup] Generating Prisma Client...');
    execSync(`npx prisma generate --schema=${schemaFile}`, {
      stdio: 'inherit',
    });

    console.log('[DB-Setup] Running seed script...');
    execSync(`npx tsx prisma/seed.ts`, {
      stdio: 'inherit',
    });

    console.log('[DB-Setup] Database setup and seed successfully completed!');
  } catch (err) {
    console.error('[DB-Setup] Database setup failed:', err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
