import { Pool, type QueryResult, type QueryResultRow } from "pg";

declare global {
  var postgresPool: Pool | undefined;
}

function createPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL no esta configurada");
  }

  return new Pool({
    connectionString,
    ssl:
      connectionString.includes("localhost") || connectionString.includes("127.0.0.1")
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
  query: <T extends QueryResultRow = QueryResultRow>(
    text: string,
    values?: unknown[]
  ): Promise<QueryResult<T>> => getPool().query<T>(text, values),
  connect: () => getPool().connect(),
  end: () => getPool().end(),
};

export default postgres;