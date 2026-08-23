const FX_SGD_IDR = 13936;
const FX_USD_IDR = 17705;
const GST = 0.09;
const PIB_USD = 500;
const BM = 0.1;
const PPN = 0.11;
const MARKUP = 5000000;
const ROUND = 50000;

const OFFICIAL_SGD = {
  "pixel-11": { "256": 1299, "512": 1499 },
  "pixel-11-pro": { "256": 1599, "512": 1799, "1tb": 1999 },
  "pixel-11-pro-xl": { "256": 1819, "512": 2019, "1tb": 2219 },
  "pixel-11-pro-fold": { "256": 2499, "512": 2699, "1tb": 2899 }
};

const CARDS = {
  "pixel-11-frost": { modelId: "pixel-11", category: "Pixel 11", title: "Frost", storages: ["256", "512"] },
  "pixel-11-hibiscus": { modelId: "pixel-11", category: "Pixel 11", title: "Hibiscus", storages: ["256", "512"] },
  "pixel-11-pistachio": { modelId: "pixel-11", category: "Pixel 11", title: "Pistachio", storages: ["256", "512"] },
  "pixel-11-obsidian": { modelId: "pixel-11", category: "Pixel 11", title: "Obsidian", storages: ["256", "512"] },
  "pixel-11-pro-canyon": { modelId: "pixel-11-pro", category: "Pixel 11 Pro", title: "Canyon", storages: ["256", "512"] },
  "pixel-11-pro-olive": { modelId: "pixel-11-pro", category: "Pixel 11 Pro", title: "Olive", storages: ["256", "512"] },
  "pixel-11-pro-fog": { modelId: "pixel-11-pro", category: "Pixel 11 Pro", title: "Fog", storages: ["256", "512"] },
  "pixel-11-pro-matte-obsidian": { modelId: "pixel-11-pro", category: "Pixel 11 Pro", title: "Matte Obsidian", storages: ["256", "512", "1tb"] },
  "pixel-11-pro-xl-canyon": { modelId: "pixel-11-pro-xl", category: "Pixel 11 Pro XL", title: "Canyon", storages: ["256", "512"] },
  "pixel-11-pro-xl-olive": { modelId: "pixel-11-pro-xl", category: "Pixel 11 Pro XL", title: "Olive", storages: ["256", "512"] },
  "pixel-11-pro-xl-fog": { modelId: "pixel-11-pro-xl", category: "Pixel 11 Pro XL", title: "Fog", storages: ["256", "512"] },
  "pixel-11-pro-xl-matte-obsidian": { modelId: "pixel-11-pro-xl", category: "Pixel 11 Pro XL", title: "Matte Obsidian", storages: ["256", "512", "1tb"] },
  "pixel-11-pro-fold-obsidian": { modelId: "pixel-11-pro-fold", category: "Pixel 11 Pro Fold", title: "Obsidian", storages: ["256", "512", "1tb"] }
};

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}

function normStorage(raw) {
  const s = String(raw || "").toLowerCase().replace(/\s+/g, "");
  if (s === "256") return "256";
  if (s === "512") return "512";
  if (s === "1tb" || s === "1024" || s === "1t") return "1tb";
  return null;
}

function roundAsk(n) {
  return Math.round(n / ROUND) * ROUND;
}

function askIdr(modelId, storage, skipPib) {
  const sgdAmt = ((OFFICIAL_SGD[modelId] || {})[storage] || 0);
  if (!sgdAmt) return 0;
  const exGstSgd = sgdAmt / (1 + GST);
  const exGstIdr = exGstSgd * FX_SGD_IDR;
  const pib = skipPib ? 0 : PIB_USD * FX_USD_IDR;
  const taxable = Math.max(0, exGstIdr - pib);
  const bm = taxable * BM;
  const ppn = (taxable + bm) * PPN;
  return roundAsk(exGstIdr + bm + ppn + MARKUP);
}

function resolveItem(item, skipPib) {
  if (!item || typeof item !== "object") return null;
  const card = CARDS[item.cardId];
  const storage = normStorage(item.storage);
  if (!card || !storage || card.storages.indexOf(storage) === -1) return null;
  const amount = askIdr(card.modelId, storage, skipPib);
  if (!amount) return null;
  return {
    cardId: item.cardId,
    modelId: card.modelId,
    storage: storage,
    askIdr: amount,
    name: card.category + " " + card.title + " · " + storage
  };
}

function formBody(pairs) {
  const p = new URLSearchParams();
  for (let i = 0; i < pairs.length; i++) p.append(pairs[i][0], pairs[i][1]);
  return p.toString();
}

async function checkout(request, env) {
  if (!env.STRIPE_SECRET_KEY) return json({ error: "stripe isn't connected yet", code: "no_stripe" }, 503);
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad items" }, 400);
  }
  const raw = body && Array.isArray(body.items) ? body.items : null;
  if (!raw || !raw.length || raw.length > 2) return json({ error: "bad items" }, 400);
  const lines = [];
  for (let i = 0; i < raw.length; i++) {
    const line = resolveItem(raw[i], i > 0);
    if (!line) return json({ error: "bad items" }, 400);
    lines.push(line);
  }
  const origin = new URL(request.url).origin;
  const pairs = [
    ["mode", "payment"],
    ["currency", "idr"],
    ["automatic_payment_methods[enabled]", "true"],
    ["success_url", origin + "/success.html?session_id={CHECKOUT_SESSION_ID}"],
    ["cancel_url", origin + "/sale"],
    ["shipping_address_collection[allowed_countries][]", "ID"],
    ["phone_number_collection[enabled]", "true"]
  ];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    pairs.push(["line_items[" + i + "][quantity]", "1"]);
    pairs.push(["line_items[" + i + "][price_data][currency]", "idr"]);
    pairs.push(["line_items[" + i + "][price_data][unit_amount]", String(line.askIdr)]);
    pairs.push(["line_items[" + i + "][price_data][product_data][name]", line.name]);
    pairs.push(["metadata[item_" + i + "]", line.cardId + ":" + line.storage]);
  }
  pairs.push(["metadata[count]", String(lines.length)]);
  const stripe = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + env.STRIPE_SECRET_KEY,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formBody(pairs)
  });
  const data = await stripe.json().catch(() => ({}));
  if (!stripe.ok || !data.url) return json({ error: data.error && data.error.message ? data.error.message : "checkout failed" }, 502);
  return json({ url: data.url });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/health") return json({ ok: true });
    if (url.pathname === "/api/checkout") {
      if (request.method !== "POST") return json({ error: "method" }, 405);
      return checkout(request, env);
    }
    return env.ASSETS.fetch(request);
  }
};
