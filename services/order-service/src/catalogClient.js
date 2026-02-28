import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const protoPath = path.join(__dirname, "..", "proto", "catalog.proto");
const packageDef = protoLoader.loadSync(protoPath, { defaults: true });
const catalogProto = grpc.loadPackageDefinition(packageDef).catalog;

export function createCatalogClient() {
  const host = process.env.CATALOG_GRPC_HOST || "catalog-service";
  const port = process.env.CATALOG_GRPC_PORT || "50051";
  const addr = `${host}:${port}`;
  const client = new catalogProto.CatalogService(addr, grpc.credentials.createInsecure());
  return client;
}

// Important: gRPC calls can otherwise appear to "hang" while the channel is still connecting.
// We wait for readiness and enforce a deadline so the HTTP request returns quickly with an error.
export function getProduct(client, id, timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;

    client.waitForReady(deadline, (readyErr) => {
      if (readyErr) return reject(readyErr);
      client.GetProduct({ id }, { deadline }, (err, resp) => {
        if (err) return reject(err);
        return resolve(resp);
      });
    });
  });
}
