const DEFAULT_TIMEOUT_MS = 15000;

async function fetchWithTimeout(path, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS){
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(path, { ...options, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function apiGet(path){
  const r = await fetchWithTimeout(path);
  const t = await r.text();
  let json;
  try{ json = JSON.parse(t); }catch{ json = { raw: t }; }
  if(!r.ok) throw new Error(json?.error || `HTTP ${r.status}`);
  return json;
}

export async function apiPost(path, body){
  const r = await fetchWithTimeout(path, {
    method: 'POST',
    headers: {'content-type':'application/json'},
    body: JSON.stringify(body)
  });
  const t = await r.text();
  let json;
  try{ json = JSON.parse(t); }catch{ json = { raw: t }; }
  if(!r.ok) throw new Error(json?.error || `HTTP ${r.status}`);
  return json;
}
