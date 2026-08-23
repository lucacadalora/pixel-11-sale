(function () {
  const CFG = window.PIXEL_CONFIG || {};

  function roundAsk(n) {
    const step = CFG.askRoundTo || 50000;
    return Math.round(n / step) * step;
  }

  function officialSgd(modelId, storage) {
    const map = (CFG.officialSgd || {})[modelId] || {};
    const key = String(storage || "256").toLowerCase().replace("1tb", "1tb");
    return map[key] || map["256"] || 0;
  }

  function compute(modelId, storage) {
    const sgd = officialSgd(modelId, storage);
    const gst = CFG.gst == null ? 0.09 : CFG.gst;
    const fxSgd = CFG.fxSgdIdr || 13936;
    const fxUsd = CFG.fxUsdIdr || 17705;
    const pibUsd = CFG.pibUsd == null ? 500 : CFG.pibUsd;
    const importRate = CFG.importRate == null ? 0.21 : CFG.importRate;
    const markupIdr = CFG.markupIdr == null ? 5000000 : CFG.markupIdr;
    const officialIdr = sgd * fxSgd;
    const exGstSgd = sgd / (1 + gst);
    const exGstIdr = exGstSgd * fxSgd;
    const gstRefundIdr = officialIdr - exGstIdr;
    const pibIdr = pibUsd * fxUsd;
    const taxableIdr = Math.max(0, exGstIdr - pibIdr);
    const importIdr = taxableIdr * importRate;
    const askIdr = roundAsk(exGstIdr + importIdr + markupIdr);
    return {
      officialSgd: sgd,
      officialIdr: officialIdr,
      exGstSgd: exGstSgd,
      exGstIdr: exGstIdr,
      gstRefundIdr: gstRefundIdr,
      pibUsd: pibUsd,
      pibIdr: pibIdr,
      taxableIdr: taxableIdr,
      importIdr: importIdr,
      importRate: importRate,
      markupIdr: markupIdr,
      askIdr: askIdr,
      estimateIdr: officialIdr,
      profitIdr: gstRefundIdr + markupIdr
    };
  }

  function idr(n) {
    return "Rp " + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function sgd(n) {
    return "S$" + n.toLocaleString("en-SG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function breakdownLines(p, locale) {
    if (locale === "id") {
      return [
        "harga resmi google store sg " + sgd(p.officialSgd),
        "− refund gst 9% → " + idr(p.exGstIdr),
        "− pib usd 500 (1 hp / 1 kedatangan) → kena pajak " + idr(p.taxableIdr),
        "× 1,21 bea (ppn 11% + bm 10%) → " + idr(p.importIdr),
        "+ markup rp 5.000.000",
        "ask " + idr(p.askIdr),
        "untung saya: refund gst + markup ≈ " + idr(p.profitIdr)
      ];
    }
    return [
      "official google store sg " + sgd(p.officialSgd),
      "− 9% gst refund → " + idr(p.exGstIdr),
      "− usd 500 pib (1 phone / 1 arrival) → taxable " + idr(p.taxableIdr),
      "× 1.21 import (ppn 11% + bm 10%) → " + idr(p.importIdr),
      "+ rp 5.000.000 markup",
      "ask " + idr(p.askIdr),
      "my take: gst refund + markup ≈ " + idr(p.profitIdr)
    ];
  }

  window.PIXEL_PRICE = { compute: compute, breakdownLines: breakdownLines, officialSgd: officialSgd };
})();
