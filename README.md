Live: https://pixel-11-sale.lucacadalora33.workers.dev/sale

Cart posts to a Cloudflare Worker that creates a Stripe Checkout Session (cards, Apple Pay, Google Pay). Prices are computed on the Worker — do not trust the client.

Set the secret:

```
npx wrangler secret put STRIPE_SECRET_KEY
```

on worker `pixel-11-sale`. A test key is ok.

Enable Apple Pay / Google Pay in the Stripe dashboard.

Hard-refresh https://pixel-11-sale.lucacadalora33.workers.dev/sale

Cloudflare may need to pick up `wrangler.jsonc` if this repo was static-only before.

Public contact: [x.com/lucaxyzz](https://x.com/lucaxyzz) · [linkedin.com/in/lucacadalora](https://www.linkedin.com/in/lucacadalora)
