import pg from "pg";

const { Pool } = pg;

export function createPool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  return new Pool({ connectionString: url });
}

export async function initDb(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      total NUMERIC(12,2) NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id UUID PRIMARY KEY,
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      unit_price NUMERIC(12,2) NOT NULL,
      quantity INT NOT NULL,
      line_total NUMERIC(12,2) NOT NULL
    );
  `);
}
