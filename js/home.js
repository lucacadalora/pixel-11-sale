(function () {
  const CFG = window.PIXEL_CONFIG || {};
  const I18N = {
    en: {
      home: "home",
      sale: "sale",
      shop: "shop",
      headline: "sovereign AI with jatevo.ai · AI software factory with vantis.sh",
      location: "Jakarta Metropolitan Area",
      connections: "connections",
      aboutTitle: "about",
      expTitle: "experience",
      eduTitle: "education",
      nowTitle: "now selling",
      payTitle: "how you pay me",
      roleVantis: "AI software factory · vantis.sh",
      roleJatevo: "sovereign AI",
      roleShop: "singapore gadgets into indonesia · tokopedia",
      roleItb: "Bachelor, Chemical Engineering",
      nowBody: "sealed pixel 11 from changi. reserve on the sale page. collaborative review incoming with nerd reviews.",
      payBody: "this is my page, not a faceless shop. reserve a phone, then transfer to my personal rekening. i send the account on whatsapp after you reserve, so you know who you are paying.",
      linkSale: "shop pixel 11",
      linkTokped: "tokopedia / gadgetsing",
      linkNerd: "nerd reviews",
      linkLinkedin: "linkedin",
      linkEmail: "email",
      payWire: "wire bank transfer",
      payOnchain: "onchain",
      payLocal: "local",
      payIdr: "IDR transfer to my personal bank account",
      faqTitle: "how this works",
      faqLead: "pick a type, ping me, we deal. then i fly to singapore.",
      intro: [
        "tech entrepreneur. i start and ship companies from indonesia, then get out of the way.",
        "i build AI products (jatevo, vantis) and i also move sealed phones from singapore to jakarta. same person on linkedin, same person you transfer to."
      ]
    },
    id: {
      home: "home",
      sale: "sale",
      shop: "shop",
      headline: "sovereign AI di jatevo.ai · pabrik software AI di vantis.sh",
      location: "Jakarta Metropolitan Area",
      connections: "koneksi",
      aboutTitle: "tentang",
      expTitle: "pengalaman",
      eduTitle: "pendidikan",
      nowTitle: "sedang dijual",
      payTitle: "cara bayar ke saya",
      roleVantis: "pabrik software AI · vantis.sh",
      roleJatevo: "sovereign AI",
      roleShop: "gadget singapura ke indonesia · tokopedia",
      roleItb: "S1 Teknik Kimia",
      nowBody: "pixel 11 sealed dari changi. reservasi di halaman sale. review bareng nerd reviews segera.",
      payBody: "ini halaman saya, bukan toko tanpa muka. reservasi HP, lalu transfer ke rekening pribadi. nomor rekening saya kirim di whatsapp setelah reservasi, supaya jelas ke siapa uangnya.",
      linkSale: "shop pixel 11",
      linkTokped: "tokopedia / gadgetsing",
      linkNerd: "nerd reviews",
      linkLinkedin: "linkedin",
      linkEmail: "email",
      payWire: "transfer bank luar negeri",
      payOnchain: "onchain",
      payLocal: "lokal",
      payIdr: "transfer IDR ke rekening pribadi saya",
      faqTitle: "cara kerjanya",
      faqLead: "pilih tipe, chat saya, kita deal. lalu saya terbang ke singapura.",
      intro: [
        "entrepreneur teknologi. saya mulai dan kirim perusahaan dari indonesia.",
        "saya bangun produk AI (jatevo, vantis) dan juga bawa HP sealed dari singapura ke jakarta. orang yang sama di linkedin, orang yang sama yang menerima transfer."
      ]
    }
  };

  const state = { locale: localStorage.getItem("pixel11-locale") || "en" };

  function applyLocale() {
    const L = I18N[state.locale] || I18N.en;
    document.documentElement.lang = state.locale === "id" ? "id" : "en";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = L[el.getAttribute("data-i18n")] || el.textContent;
    });
    const intro = document.getElementById("home-intro");
    if (intro) intro.innerHTML = L.intro.map((p) => "<p>" + p + "</p>").join("");
    if (window.PIXEL_FAQ) window.PIXEL_FAQ.render(state.locale);
    document.querySelectorAll(".lang-switcher a").forEach((a) => {
      a.classList.toggle("current", a.dataset.locale === state.locale);
    });
  }

  document.addEventListener("click", (e) => {
    const locale = e.target.closest("[data-locale]");
    if (locale) {
      e.preventDefault();
      state.locale = locale.dataset.locale;
      localStorage.setItem("pixel11-locale", state.locale);
      applyLocale();
      return;
    }
    const top = e.target.closest(".scroll-to-top");
    if (top) {
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    }
  });

  window.addEventListener("scroll", () => {
    const btn = document.getElementById("scroll-to-top");
    if (btn) btn.classList.toggle("is-visible", window.scrollY > 240);
  }, { passive: true });

  const wa = document.getElementById("wa-home");
  if (wa && CFG.whatsappE164) wa.href = "https://wa.me/" + CFG.whatsappE164;

  applyLocale();
})();
