import express from "express";
import cors from "cors";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import { PRODUCTS } from "./data.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = parseInt(process.env.PORT || "3001", 10);
const GRPC_PORT = parseInt(process.env.GRPC_PORT || "50051", 10);

// REST
app.get("/health", (_req, res) => res.json({ ok: true, service: "catalog-service" }));

app.get("/products", (_req, res) => res.json({ products: PRODUCTS }));

app.get("/products/:id", (req, res) => {
  const p = PRODUCTS.find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "NOT_FOUND" });
  return res.json(p);
});

app.listen(PORT, () => {
  console.log(`[catalog] REST listening on :${PORT}`);
});

// gRPC
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const protoPath = path.join(__dirname, "..", "proto", "catalog.proto");

const packageDef = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const catalogProto = grpc.loadPackageDefinition(packageDef).catalog;

const grpcServer = new grpc.Server();

grpcServer.addService(catalogProto.CatalogService.service, {
  GetProduct: (call, cb) => {
    const p = PRODUCTS.find(x => x.id === call.request.id);
    if (!p) {
      return cb({ code: grpc.status.NOT_FOUND, message: "NOT_FOUND" });
    }
    return cb(null, p);
  },
  ListProducts: (_call, cb) => cb(null, { products: PRODUCTS }),
});

grpcServer.bindAsync(
  `0.0.0.0:${GRPC_PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) {
      console.error("[catalog] gRPC bind error", err);
      process.exit(1);
    }
    grpcServer.start();
    console.log(`[catalog] gRPC listening on :${port}`);
  }
);
