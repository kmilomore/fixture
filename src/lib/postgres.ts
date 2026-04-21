import { Pool, QueryResultRow, QueryResult } from "pg";

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

function getPool() {
  if (!globalThis.postgresPool) {
    globalThis.postgresPool = createPool();
  }

  return globalThis.postgresPool;
}

const postgres = {
  query: <T extends QueryResultRow = any>(...args: any[]): Promise<QueryResult<T>> =>
    (getPool().query as any)(...args),
  connect: () => getPool().connect(),
  end: () => getPool().end(),
};

export default postgres;
