import { Pool } from "pg";

declare global {
  var postgresPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL no está configurada");
  }

  return new Pool({
    connectionString,
    ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
      ? false
      : { rejectUnauthorized: false },
  });
}

const pool = globalThis.postgresPool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalThis.postgresPool = pool;
}

export default pool;