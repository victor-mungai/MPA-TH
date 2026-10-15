const assert = require("node:assert/strict");
const { test } = require("node:test");

const { createDatabase } = require("../src/database");

const config = {
  connectionString: "postgresql://app:secret@database/app",
  connectionTimeoutMs: 1500,
  maxConnections: 12,
};

test("database readiness succeeds after a probe query", async () => {
  let poolOptions;
  let query;
  const database = createDatabase(config, {
    createPool: (options) => {
      poolOptions = options;
      return {
        end: async () => {},
        query: async (statement) => {
          query = statement;
        },
      };
    },
  });

  assert.equal(await database.isReady(), true);
  assert.equal(query, "SELECT 1");
  assert.deepEqual(poolOptions, {
    connectionString: config.connectionString,
    connectionTimeoutMillis: config.connectionTimeoutMs,
    max: config.maxConnections,
  });
});

test("database readiness fails without leaking connection errors", async () => {
  const database = createDatabase(config, {
    createPool: () => ({
      end: async () => {},
      query: async () => {
        throw new Error("connection includes sensitive details");
      },
    }),
  });

  assert.equal(await database.isReady(), false);
});

test("database can be disabled when it is not configured", async () => {
  const database = createDatabase({ ...config, connectionString: null });

  assert.equal(await database.isReady(), false);
  await assert.doesNotReject(database.close());
});
