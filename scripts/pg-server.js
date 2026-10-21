const fs = require('fs');
const path = require('path');
const net = require('net');

async function isPortOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function startPgServer() {
  const isOpen = await isPortOpen(5432);
  if (isOpen) {
    console.log('[PG-Server] Port 5432 is already active (PostgreSQL/Docker). No embedded server needed.');
    return;
  }

  console.log('[PG-Server] Port 5432 is inactive. Starting embedded PGlite gateway server...');
  const dataDir = path.join(process.cwd(), 'dev-db');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const { PGlite } = require('@electric-sql/pglite');
  const { fromNodeSocket } = require('pg-gateway/node');

  const db = new PGlite(dataDir);
  await db.waitReady;

  const server = net.createServer(async (socket) => {
    try {
      await fromNodeSocket(socket, {
        serverVersion: '16.3',
        auth: { method: 'trust' },
        handleQuery: async (sql, params) => {
          return await db.query(sql, params);
        },
      });
    } catch (err) {
      // Socket / query error
    }
  });

  server.listen(5432, '127.0.0.1', () => {
    console.log('[PG-Server] Embedded PostgreSQL listening on 127.0.0.1:5432');
  });

  process.on('SIGINT', () => {
    server.close();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    server.close();
    process.exit(0);
  });

  // Keep process alive if executed standalone
  return new Promise(() => {});
}

if (require.main === module) {
  startPgServer().catch((err) => {
    console.error('[PG-Server] Failed to start:', err);
    process.exit(1);
  });
}

module.exports = { startPgServer, isPortOpen };
