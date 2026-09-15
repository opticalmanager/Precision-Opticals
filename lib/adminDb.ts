import { Pool, QueryResult, QueryResultRow } from "pg";

/**
 * Precision Optics - Admin Database Service
 * Connects directly to the PostgreSQL pooler using the server-side DATABASE_URL.
 * This securely bypasses RLS for authorized administrative operations
 * without leaking any credentials to the client.
 */

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.rtyaihaeogqdxvqyycir:data%40precisionoptics2026@aws-0-ap-south-1.pooler.supabase.com:5432/postgres";

declare global {
  // eslint-disable-next-line no-var
  var _precisionAdminPool: Pool | undefined;
}

let pool: Pool;

if (process.env.NODE_ENV === "production") {
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
} else {
  if (!global._precisionAdminPool) {
    global._precisionAdminPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  pool = global._precisionAdminPool;
}

export { pool };

/**
 * Execute a parameterized query against PostgreSQL with automatic error handling
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== "production" && duration > 500) {
      console.warn(`[adminDb] Slow query (${duration}ms):`, text.slice(0, 100));
    }
    return res;
  } catch (error) {
    console.error("[adminDb] Query error:", error, "\nQuery:", text);
    throw error;
  }
}
