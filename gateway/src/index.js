import express from "express";
import cors from "cors";
import morgan from "morgan";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();
app.use(cors());
// IMPORTANT:
// Do NOT use express.json() (or any body parser) globally on a pure proxy gateway.
// If the request body stream is consumed here, http-proxy-middleware may forward
// headers like Content-Length without forwarding the actual bytes, causing the
// upstream (order-service) to hang waiting for a body that never arrives.
app.use(morgan("combined"));

const PORT = parseInt(process.env.PORT || "8081", 10);
const CATALOG_URL = process.env.CATALOG_URL || "http://catalog-service:3001";
const ORDER_URL = process.env.ORDER_URL || "http://order-service:3002";

app.get("/health", (_req, res) => res.json({ ok: true, service: "api-gateway" }));

// NOTE important: when mounting on /api/products, Express strips the mount path.
// So the proxy receives '/' for '/api/products'. We map it to '/products'.
app.use("/api/products", createProxyMiddleware({
  target: CATALOG_URL,
  changeOrigin: true,
  pathRewrite: (path) => (path === "/" ? "/products" : `/products${path}`),
}));

app.use("/api/orders", createProxyMiddleware({
  target: ORDER_URL,
  changeOrigin: true,
  pathRewrite: (path) => (path === "/" ? "/orders" : `/orders${path}`),
}));

app.listen(PORT, () => console.log(`[gateway] listening on :${PORT}`));
