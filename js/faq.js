(function () {
  const SPECS = {
    en: `flowchart TD
  pick["1. pick the type you want"] --> chat["2. contact me on whatsapp"]
  chat --> trust{"direct deal or tokopedia?"}
  trust -->|direct| pay["3. deal and pay me"]
  trust -->|tokopedia| tp["we talk first, then i list it"]
  tp --> tpfee["+10% plus tokopedia fees"]
  pay --> fly["4. i go to singapore"]
  tpfee --> fly
  fly --> sched["i work from sg about twice a month"]
  sched --> cap["max 2 devices per visit"]
  cap --> tax["price includes customs tax ~21%"]
  tax --> recv{"jakarta or shipment?"}
  recv -->|jakarta| cod["COD in jakarta area"]
  recv -->|ship| jne["JNE or other courier + insurance"]`,
    id: `flowchart TD
  pick["1. pilih tipe yang kamu mau"] --> chat["2. hubungi saya di whatsapp"]
  chat --> trust{"deal langsung atau tokopedia?"}
  trust -->|langsung| pay["3. deal dan bayar ke saya"]
  trust -->|tokopedia| tp["kita ngobrol dulu, baru saya listing"]
  tp --> tpfee["+10% plus biaya tokopedia"]
  pay --> fly["4. saya ke singapura"]
  tpfee --> fly
  fly --> sched["kerja dari sg sekitar 2 kali sebulan"]
  sched --> cap["maks 2 device per kunjungan"]
  cap --> tax["harga sudah termasuk bea cukai ~21%"]
  tax --> recv{"jakarta atau kirim?"}
  recv -->|jakarta| cod["COD area jakarta"]
  recv -->|ship| jne["JNE atau ekspedisi lain + asuransi"]`
  };

  const NOTES = {
    en: [
      ["what do i pick?", "model, color, storage. start on the sale page, then whatsapp me the exact unit."],
      ["how do we deal?", "i confirm stock on the next singapore trip, then you pay. rekening goes on whatsapp after you reserve, never on this page."],
      ["when do you fly?", "i work from singapore about twice a month. i can bring max 2 devices per visit."],
      ["is tax extra?", "no. the ask already includes customs tax, about 21% of the total."],
      ["how do i receive it?", "COD in the jakarta area, or shipment via JNE / any logistics plus an insurance fee."],
      ["what if i don't trust a direct transfer?", "we can do tokopedia. chat first so i can list the item. +10% because i float the buy with my own money, plus tokopedia fees."]
    ],
    id: [
      ["pilih apa?", "model, warna, penyimpanan. mulai di halaman sale, lalu whatsapp unit yang persis."],
      ["deal-nya bagaimana?", "saya konfirmasi stok di trip singapura berikutnya, lalu kamu bayar. rekening dikirim di whatsapp setelah reservasi, tidak pernah di halaman ini."],
      ["kapan terbang?", "saya kerja dari singapura sekitar dua kali sebulan. maksimal 2 device per kunjungan."],
      ["pajak di luar harga?", "tidak. harga sudah termasuk bea cukai, sekitar 21% dari total."],
      ["cara terima?", "COD area jakarta, atau kirim JNE / ekspedisi lain plus biaya asuransi."],
      ["kalau belum percaya transfer langsung?", "bisa lewat tokopedia. chat dulu supaya saya listing. +10% karena saya belanja dulu pakai uang sendiri, plus biaya tokopedia."]
    ]
  };

  function locale() {
    return localStorage.getItem("pixel11-locale") === "id" ? "id" : "en";
  }

  async function render(loc) {
    const host = document.getElementById("faq-flow");
    const notes = document.getElementById("faq-notes");
    const lang = loc === "id" ? "id" : "en";
    if (notes) {
      notes.innerHTML = NOTES[lang]
        .map(([q, a]) => "<dt>" + q + "</dt><dd>" + a + "</dd>")
        .join("");
    }
    if (!host || !window.mermaid) return;
    try {
      const { svg } = await window.mermaid.render("faqGraph" + Date.now(), SPECS[lang]);
      host.innerHTML = svg;
    } catch (err) {
      host.textContent = "";
      console.warn("faq mermaid", err);
    }
  }

  function boot() {
    if (window.mermaid) {
      window.mermaid.initialize({
        startOnLoad: false,
        securityLevel: "strict",
        theme: "base",
        themeVariables: {
          fontFamily: "Geist Mono, IBM Plex Mono, ui-monospace, monospace",
          fontSize: "14px",
          primaryColor: "#f3f3f3",
          primaryTextColor: "#111111",
          primaryBorderColor: "#111111",
          lineColor: "#111111",
          secondaryColor: "#ffffff",
          tertiaryColor: "#ffffff",
          clusterBkg: "#ffffff",
          clusterBorder: "#111111"
        },
        flowchart: { curve: "linear", htmlLabels: true, padding: 12 }
      });
    }
    render(locale());
  }

  window.PIXEL_FAQ = { render: render };

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
