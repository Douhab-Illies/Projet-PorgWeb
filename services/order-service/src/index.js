import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import { CreateOrderSchema } from "./validation.js";
import { createPool, initDb } from "./db.js";
import { createCatalogClient, getProduct } from "./catalogClient.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = parseInt(process.env.PORT || "3002", 10);

const pool = createPool();
await initDb(pool);

const catalogClient = createCatalogClient();

app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1 as ok");
    res.json({ ok: true, service: "order-service", db: "ok" });
  } catch (e) {
    res.status(500).json({ ok: false, service: "order-service", db: "down" });
  }
});

app.get("/orders", async (_req, res) => {
  const orders = await pool.query("SELECT id, created_at, total FROM orders ORDER BY created_at DESC LIMIT 50");
  const items = await pool.query("SELECT order_id, product_id, product_name, unit_price, quantity, line_total FROM order_items");
  const byOrder = new Map();
  for (const row of items.rows) {
    const arr = byOrder.get(row.order_id) || [];
    arr.push(row);
    byOrder.set(row.order_id, arr);
  }
  const result = orders.rows.map(o => ({ ...o, items: byOrder.get(o.id) || [] }));
  res.json({ orders: result });
});

app.get("/orders/:id", async (req, res) => {
  const o = await pool.query("SELECT id, created_at, total FROM orders WHERE id=$1", [req.params.id]);
  if (o.rowCount === 0) return res.status(404).json({ error: "NOT_FOUND" });
  const items = await pool.query(
    "SELECT product_id, product_name, unit_price, quantity, line_total FROM order_items WHERE order_id=$1",
    [req.params.id]
  );
  res.json({ ...o.rows[0], items: items.rows });
});

app.post("/orders", async (req, res) => {
  const parsed = CreateOrderSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "BAD_REQUEST", details: parsed.error.issues });

  const orderId = uuidv4();
  const itemsIn = parsed.data.items;

  // Validate items by calling Catalog in gRPC (bonus)
  const enriched = [];
  for (const it of itemsIn) {
    try {
      const p = await getProduct(catalogClient, it.productId);
      const unit = Number(p.price);
      const qty = it.quantity;
      const line = unit * qty;
      enriched.push({
        product_id: p.id,
        product_name: p.name,
        unit_price: unit,
        quantity: qty,
        line_total: line
      });
    } catch (err) {
      return res.status(400).json({ error: "UNKNOWN_PRODUCT", productId: it.productId });
    }
  }

  const total = enriched.reduce((s, x) => s + x.line_total, 0);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("INSERT INTO orders(id,total) VALUES($1,$2)", [orderId, total.toFixed(2)]);

    for (const row of enriched) {
      await client.query(
        `INSERT INTO order_items(id, order_id, product_id, product_name, unit_price, quantity, line_total)
         VALUES($1,$2,$3,$4,$5,$6,$7)`,
        [uuidv4(), orderId, row.product_id, row.product_name, row.unit_price.toFixed(2), row.quantity, row.line_total.toFixed(2)]
      );
    }
    await client.query("COMMIT");
    console.log(`[order] created order ${orderId} total=${total.toFixed(2)}`);
    res.status(201).json({ id: orderId, total: total.toFixed(2) });
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("[order] create order failed", e);
    res.status(500).json({ error: "INTERNAL_ERROR" });
  } finally {
    client.release();
  }
});

app.listen(PORT, () => console.log(`[order] REST listening on :${PORT}`));
