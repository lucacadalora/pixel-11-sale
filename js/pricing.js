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

  function isOnlineNoGst(modelId) {
    const list = CFG.onlineNoGstModels || [];
    return list.indexOf(modelId) !== -1;
  }

  function storeLabelFor(modelId) {
    return String(modelId || "").indexOf("mac-") === 0 ? "apple" : "google";
  }

  function compute(modelId, storage, opts) {
    const sgdAmt = officialSgd(modelId, storage);
    const gst = CFG.gst == null ? 0.09 : CFG.gst;
    const fxSgd = CFG.fxSgdIdr || 13936;
    const fxUsd = CFG.fxUsdIdr || 17705;
    const pibUsd = CFG.pibUsd == null ? 500 : CFG.pibUsd;
    const bmRate = CFG.bmRate == null ? 0.1 : CFG.bmRate;
    const ppnRate = CFG.ppnRate == null ? 0.11 : CFG.ppnRate;
    const markupIdr = CFG.markupIdr == null ? 5000000 : CFG.markupIdr;
    const fxFeeRate = CFG.fxFeeRate == null ? 0.02 : CFG.fxFeeRate;
    const officialIdr = sgdAmt * fxSgd;
    const online = isOnlineNoGst(modelId);
    const storeLabel = storeLabelFor(modelId);
    const pibIdr = opts && opts.skipPib ? 0 : pibUsd * fxUsd;

    if (online) {
      const fxFeeIdr = officialIdr * fxFeeRate;
      const taxableIdr = Math.max(0, officialIdr - pibIdr);
      const bmIdr = taxableIdr * bmRate;
      const ppnIdr = (taxableIdr + bmIdr) * ppnRate;
      const importIdr = bmIdr + ppnIdr;
      const askIdr = roundAsk(officialIdr + fxFeeIdr + importIdr + markupIdr);
      return {
        onlineNoGst: true,
        storeLabel: storeLabel,
        officialSgd: sgdAmt,
        officialIdr: officialIdr,
        exGstSgd: sgdAmt,
        exGstIdr: officialIdr,
        gstRefundIdr: 0,
        fxFeeRate: fxFeeRate,
        fxFeeIdr: fxFeeIdr,
        pibUsd: pibUsd,
        pibIdr: pibIdr,
        taxableIdr: taxableIdr,
        bmIdr: bmIdr,
        ppnIdr: ppnIdr,
        importIdr: importIdr,
        importRate: bmRate + ppnRate * (1 + bmRate),
        markupIdr: markupIdr,
        askIdr: askIdr,
        estimateIdr: officialIdr,
        profitIdr: fxFeeIdr + markupIdr
      };
    }

    const exGstSgd = sgdAmt / (1 + gst);
    const exGstIdr = exGstSgd * fxSgd;
    const gstRefundIdr = officialIdr - exGstIdr;
    const taxableIdr = Math.max(0, exGstIdr - pibIdr);
    const bmIdr = taxableIdr * bmRate;
    const ppnIdr = (taxableIdr + bmIdr) * ppnRate;
    const importIdr = bmIdr + ppnIdr;
    const askIdr = roundAsk(exGstIdr + importIdr + markupIdr);
    return {
      onlineNoGst: false,
      storeLabel: storeLabel,
      officialSgd: sgdAmt,
      officialIdr: officialIdr,
      exGstSgd: exGstSgd,
      exGstIdr: exGstIdr,
      gstRefundIdr: gstRefundIdr,
      fxFeeRate: fxFeeRate,
      fxFeeIdr: 0,
      pibUsd: pibUsd,
      pibIdr: pibIdr,
      taxableIdr: taxableIdr,
      bmIdr: bmIdr,
      ppnIdr: ppnIdr,
      importIdr: importIdr,
      importRate: bmRate + ppnRate * (1 + bmRate),
      markupIdr: markupIdr,
      askIdr: askIdr,
      estimateIdr: officialIdr,
      profitIdr: gstRefundIdr + markupIdr
    };
  }

  function computeCart(entries) {
    const list = (entries || []).filter(Boolean);
    return list.map(function (e, i) {
      return compute(e.modelId, e.storage, { skipPib: i > 0 });
    });
  }

  function idr(n) {
    return "Rp " + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function sgd(n) {
    return "S$" + n.toLocaleString("en-SG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  function storeName(p, locale) {
    const apple = p.storeLabel === "apple";
    if (locale === "id") {
      return apple ? "resmi apple store sg" : "resmi google store sg";
    }
    return apple ? "official apple store sg" : "official google store sg";
  }

  function breakdownRows(p, locale) {
    if (p.onlineNoGst) {
      if (locale === "id") {
        return [
          { name: storeName(p, locale), cost: sgd(p.officialSgd) },
          { name: "gst tetap (online)", cost: idr(0) },
          { name: "pib usd 500", cost: "− " + idr(p.pibIdr) },
          { name: "kena pajak", cost: idr(p.taxableIdr) },
          { name: "bm 10%", cost: idr(p.bmIdr) },
          { name: "ppn 11%", cost: idr(p.ppnIdr) },
          { name: "bea (bm + ppn)", cost: idr(p.importIdr) },
          { name: "fx 2%", cost: idr(p.fxFeeIdr) },
          { name: "markup", cost: idr(p.markupIdr) },
          { name: "ask", cost: idr(p.askIdr) },
          { name: "untung (fx + markup)", cost: idr(p.profitIdr) }
        ];
      }
      return [
        { name: storeName(p, locale), cost: sgd(p.officialSgd) },
        { name: "gst stays (online)", cost: idr(0) },
        { name: "pib usd 500", cost: "− " + idr(p.pibIdr) },
        { name: "taxable", cost: idr(p.taxableIdr) },
        { name: "bm 10%", cost: idr(p.bmIdr) },
        { name: "ppn 11%", cost: idr(p.ppnIdr) },
        { name: "import (bm + ppn)", cost: idr(p.importIdr) },
        { name: "fx 2%", cost: idr(p.fxFeeIdr) },
        { name: "markup", cost: idr(p.markupIdr) },
        { name: "ask", cost: idr(p.askIdr) },
        { name: "my take (fx + markup)", cost: idr(p.profitIdr) }
      ];
    }
    if (locale === "id") {
      return [
        { name: storeName(p, locale), cost: sgd(p.officialSgd) },
        { name: "refund gst 9%", cost: "− " + idr(p.gstRefundIdr) },
        { name: "setelah gst", cost: idr(p.exGstIdr) },
        { name: "pib usd 500", cost: "− " + idr(p.pibIdr) },
        { name: "kena pajak", cost: idr(p.taxableIdr) },
        { name: "bm 10%", cost: idr(p.bmIdr) },
        { name: "ppn 11%", cost: idr(p.ppnIdr) },
        { name: "bea (bm + ppn)", cost: idr(p.importIdr) },
        { name: "markup", cost: idr(p.markupIdr) },
        { name: "ask", cost: idr(p.askIdr) },
        { name: "untung (gst + markup)", cost: idr(p.profitIdr) }
      ];
    }
    return [
      { name: storeName(p, locale), cost: sgd(p.officialSgd) },
      { name: "gst refund 9%", cost: "− " + idr(p.gstRefundIdr) },
      { name: "after gst", cost: idr(p.exGstIdr) },
      { name: "pib usd 500", cost: "− " + idr(p.pibIdr) },
      { name: "taxable", cost: idr(p.taxableIdr) },
      { name: "bm 10%", cost: idr(p.bmIdr) },
      { name: "ppn 11%", cost: idr(p.ppnIdr) },
      { name: "import (bm + ppn)", cost: idr(p.importIdr) },
      { name: "markup", cost: idr(p.markupIdr) },
      { name: "ask", cost: idr(p.askIdr) },
      { name: "my take (gst + markup)", cost: idr(p.profitIdr) }
    ];
  }

  function breakdownLines(p, locale) {
    return breakdownRows(p, locale).map(function (r) {
      return r.name + "  " + r.cost;
    });
  }

  window.PIXEL_PRICE = {
    compute: compute,
    computeCart: computeCart,
    breakdownRows: breakdownRows,
    breakdownLines: breakdownLines,
    officialSgd: officialSgd
  };
})();
