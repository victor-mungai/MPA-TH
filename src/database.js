const { Pool } = require("pg");

function createDatabase(config, { createPool = (options) => new Pool(options) } = {}) {
  if (!config.connectionString) {
    return {
      close: async () => {},
      isReady: async () => false,
    };
  }

  const pool = createPool({
    connectionString: config.connectionString,
    connectionTimeoutMillis: config.connectionTimeoutMs,
    max: config.maxConnections,
  });

  return {
    close: () => pool.end(),
    isReady: async () => {
      try {
        await pool.query("SELECT 1");
        return true;
      } catch {
        return false;
      }
    },
  };
}

module.exports = { createDatabase };
