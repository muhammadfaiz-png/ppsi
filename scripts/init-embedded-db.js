const fs = require('fs');
const path = require('path');
const { PGlite } = require('@electric-sql/pglite');

async function initEmbeddedDb() {
  console.log('[Init-DB] Initializing embedded PostgreSQL database tables...');
  const dataDir = path.join(process.cwd(), 'dev-db');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new PGlite(dataDir);
  await db.waitReady;

  const sqlPath = path.join(process.cwd(), 'prisma', 'init.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  await db.exec(sql);
  console.log('[Init-DB] Tables and indexes created successfully in embedded PostgreSQL.');
  await db.close();
}

if (require.main === module) {
  initEmbeddedDb().catch((err) => {
    console.error('[Init-DB] Error initializing DB:', err);
    process.exit(1);
  });
}

module.exports = { initEmbeddedDb };
