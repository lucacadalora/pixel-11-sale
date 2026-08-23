(function () {
  const COPY = {
    en: {
      pick: { title: "pick the type you want", hint: "model, color, storage" },
      chat: { title: "add to bag, then pay", hint: "card, apple pay, google pay" },
      payQ: "this site or tokopedia?",
      direct: { edge: "direct", title: "checkout here", hint: "stripe · i ping you on x or linkedin" },
      tokped: { edge: "tokopedia", title: "we talk first, then i list it", hint: "+10% plus tokopedia fees" },
      fly: { title: "i go to singapore", hint: "about twice a month · max 2 devices" },
      tax: { title: "price includes customs", hint: "bm 10% then ppn 11%" },
      recvQ: "jakarta or shipment?",
      jkt: { edge: "jakarta", title: "pickup in jakarta area" },
      ship: { edge: "elsewhere", title: "JNE or other courier", hint: "plus insurance" }
    },
    id: {
      pick: { title: "pilih tipe yang kamu mau", hint: "model, warna, penyimpanan" },
      chat: { title: "masukkan ke bag, lalu bayar", hint: "kartu, apple pay, google pay" },
      payQ: "di sini atau tokopedia?",
      direct: { edge: "langsung", title: "checkout di situs ini", hint: "stripe · saya hubungi di x atau linkedin" },
      tokped: { edge: "tokopedia", title: "kita ngobrol dulu, baru saya listing", hint: "+10% plus biaya tokopedia" },
      fly: { title: "saya ke singapura", hint: "sekitar 2 kali sebulan · maks 2 device" },
      tax: { title: "harga sudah termasuk bea cukai", hint: "bm 10% lalu ppn 11%" },
      recvQ: "jakarta atau kirim?",
      jkt: { edge: "jakarta", title: "ambil area jakarta" },
      ship: { edge: "luar kota", title: "JNE atau ekspedisi lain", hint: "plus asuransi" }
    }
  };

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function node(item) {
    const hint = item.hint
      ? '<span class="flow-hint">' + esc(item.hint) + "</span>"
      : "";
    return '<div class="flow-node"><span class="flow-title">' + esc(item.title) + "</span>" + hint + "</div>";
  }

  function rail() {
    return '<div class="flow-rail" aria-hidden="true"></div>';
  }

  function arm(item) {
    const hint = item.hint
      ? '<span class="flow-hint">' + esc(item.hint) + "</span>"
      : "";
    return (
      '<div class="flow-arm">' +
      '<span class="flow-edge">' +
      esc(item.edge) +
      "</span>" +
      '<div class="flow-node"><span class="flow-title">' +
      esc(item.title) +
      "</span>" +
      hint +
      "</div></div>"
    );
  }

  function split(q, a, b) {
    return (
      '<div class="flow-split">' +
      '<p class="flow-q">' +
      esc(q) +
      "</p>" +
      '<div class="flow-arms">' +
      arm(a) +
      arm(b) +
      "</div></div>"
    );
  }

  function locale() {
    return localStorage.getItem("pixel11-locale") === "id" ? "id" : "en";
  }

  function render(loc) {
    const host = document.getElementById("faq-flow");
    const notes = document.getElementById("faq-notes");
    if (notes) notes.innerHTML = "";
    if (!host) return;
    const t = COPY[loc === "id" ? "id" : "en"];
    host.className = "flow";
    host.innerHTML =
      node(t.pick) +
      rail() +
      node(t.chat) +
      rail() +
      split(t.payQ, t.direct, t.tokped) +
      rail() +
      node(t.fly) +
      rail() +
      node(t.tax) +
      rail() +
      split(t.recvQ, t.jkt, t.ship);
  }

  window.PIXEL_FAQ = { render: render };

  function boot() {
    render(locale());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  document.addEventListener("click", (e) => {
    const loc = e.target.closest("[data-locale]");
    if (loc) setTimeout(() => render(loc.dataset.locale), 0);
  });
})();
