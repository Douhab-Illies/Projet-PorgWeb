import React, { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "./api.js";

function money(v){
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return n.toFixed(2) + " €";
}

export default function App(){
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [qty, setQty] = useState({}); // productId -> number
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const cart = useMemo(() => {
    return products
      .map(p => ({...p, quantity: Number(qty[p.id] || 0)}))
      .filter(p => p.quantity > 0);
  }, [products, qty]);

  const cartTotal = useMemo(
    () => cart.reduce((s, x) => s + Number(x.price) * x.quantity, 0),
    [cart]
  );

  async function refresh(){
    setErr("");
    const p = await apiGet("/api/products");
    setProducts(p.products || []);
    const o = await apiGet("/api/orders");
    setOrders(o.orders || []);
  }

  useEffect(() => { refresh().catch(e => setErr(String(e.message || e))); }, []);

  async function createOrder(){
    setLoading(true);
    setErr("");
    try{
      const payload = { items: cart.map(x => ({ productId: x.id, quantity: x.quantity })) };
      await apiPost("/api/orders", payload);
      setQty({});
      await refresh();
    }catch(e){
      setErr(String(e.message || e));
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="row" style={{marginBottom: 14}}>
        <div>
          <h1>Microservices 20/20</h1>
          <div className="small">
            Front React + Gateway + 2 microservices (REST + gRPC) + PostgreSQL + Docker + Kubernetes + Sécurité
          </div>
        </div>
        <div className="pill">UI → /api → gateway → services → DB</div>
      </div>

      {err && <div className="card error" style={{marginBottom: 16}}>Erreur: {err}</div>}

      <div className="grid grid-2">
        <div className="card">
          <h2>Catalogue</h2>
          <table className="table">
            <thead>
              <tr><th>Produit</th><th>Prix</th><th style={{width:140}}>Quantité</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.name} <span className="small">({p.id})</span></td>
                  <td>{money(p.price)}</td>
                  <td>
                    <input className="input" type="number" min="0" max="100"
                      value={qty[p.id] ?? 0}
                      onChange={e => setQty(s => ({...s, [p.id]: e.target.value}))}
                      style={{width:120}}
                    />
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="3" className="small">Chargement…</td></tr>
              )}
            </tbody>
          </table>

          <div className="row" style={{marginTop: 14}}>
            <div>
              <div className="small">Panier</div>
              <div><strong>{money(cartTotal)}</strong></div>
            </div>
            <button className="btn" onClick={createOrder} disabled={loading || cart.length === 0}>
              {loading ? "Création…" : "Créer une commande"}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="row">
            <h2>Commandes (PostgreSQL)</h2>
            <button className="btn" onClick={() => refresh().catch(e => setErr(String(e.message || e)))} disabled={loading}>
              Rafraîchir
            </button>
          </div>
          <div className="small" style={{marginBottom: 10}}>Les commandes sont persistées en base via order-service.</div>

          <div style={{maxHeight: 520, overflow:"auto"}}>
            {orders.map(o => (
              <div key={o.id} className="card" style={{marginBottom: 12}}>
                <div className="row">
                  <div>
                    <div><strong>#{o.id}</strong></div>
                    <div className="small">{new Date(o.created_at).toLocaleString()}</div>
                  </div>
                  <div><strong>{money(o.total)}</strong></div>
                </div>
                <div className="small" style={{marginTop:8}}>Items</div>
                <table className="table">
                  <thead>
                    <tr><th>Produit</th><th>PU</th><th>Qté</th><th>Total</th></tr>
                  </thead>
                  <tbody>
                    {(o.items || []).map((it, idx) => (
                      <tr key={idx}>
                        <td>{it.product_name} <span className="small">({it.product_id})</span></td>
                        <td>{money(it.unit_price)}</td>
                        <td>{it.quantity}</td>
                        <td>{money(it.line_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
            {orders.length === 0 && <div className="small">Aucune commande pour le moment.</div>}
          </div>
        </div>
      </div>

      <div className="small" style={{marginTop: 18}}>
        Astuce: pour la démo, ouvre les logs <code>docker compose logs -f order-service</code> (tu verras l&apos;appel gRPC et l&apos;insert DB).
      </div>
    </div>
  );
}
