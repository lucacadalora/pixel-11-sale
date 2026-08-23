window.PIXEL_CATALOG_READY = (async function () {
  const cat = await fetch("catalog.json").then((r) => r.json());
  const urls = [
    "js/v1a.json", "js/v1b.json",
    "js/v2a.json", "js/v2b.json",
    "js/v3a.json", "js/v3b.json",
    "js/v4.json"
  ];
  const parts = await Promise.all(urls.map((u) => fetch(u).then((r) => r.json())));
  cat.variants = parts.flat();
  window.PIXEL_CATALOG = cat;
  return cat;
})();
