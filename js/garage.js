(function () {
  const CFG = window.PIXEL_CONFIG || {};

  const CATALOG = {
    cards: []
  };

  const I18N = {
    en: {
      home: "home",
      sale: "pixel 11",
      macMini: "mac mini",
      garage: "garage",
      blog: "blog",
      reviews: "reviews",
      shop: "shop",
      title: "Garage Sale",
      intro:
        "garage sale — personal stuff. local pickup jakarta, or courier by arrangement. items dropping soon.",
      howTitle: "how this works",
      howBody: [
        "see something you want? dm me on x or linkedin to claim it.",
        "local pickup in jakarta, or courier by arrangement."
      ],
      contactTitle: "contact",
      contactBody: "dm me on x or linkedin.",
      empty: "looking around…",
      ask: "ask",
      footerHow: "how"
    },
    id: {
      home: "home",
      sale: "pixel 11",
      macMini: "mac mini",
      garage: "garage",
      blog: "blog",
      reviews: "reviews",
      shop: "shop",
      title: "Garage Sale",
      intro:
        "garage sale — barang pribadi. ambil jakarta, atau kurir. item menyusul.",
      howTitle: "cara kerjanya",
      howBody: [
        "lihat yang kamu mau? dm saya di x atau linkedin untuk klaim.",
        "ambil di jakarta, atau kurir sesuai kesepakatan."
      ],
      contactTitle: "kontak",
      contactBody: "dm saya di x atau linkedin.",
      empty: "masih lihat-lihat…",
      ask: "tanya",
      footerHow: "cara"
    }
  };

  const state = {
    locale: localStorage.getItem("pixel11-locale") || "en"
  };

  function t(key) {
    return (I18N[state.locale] || I18N.en)[key];
  }

  function formatIdr(n) {
    return "Rp " + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function applyLocale() {
    const L = I18N[state.locale] || I18N.en;
    document.documentElement.lang = state.locale === "id" ? "id" : "en";
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = L[el.getAttribute("data-i18n")] || el.textContent;
    });
    const intro = document.getElementById("sale-intro");
    if (intro) intro.textContent = L.intro;
    const how = document.getElementById("how-body");
    if (how) {
      how.innerHTML = L.howBody
        .map(function (p) {
          return "<p>" + p + "</p>";
        })
        .join("");
    }
    document.querySelectorAll(".lang-switcher a").forEach(function (a) {
      a.classList.toggle("current", a.dataset.locale === state.locale);
    });
    renderGrid();
  }

  function renderGrid() {
    const ul = document.getElementById("sale-grid");
    if (!ul) return;
    if (!CATALOG.cards.length) {
      ul.innerHTML =
        '<li class="sale-card sale-card--empty" aria-live="polite">' +
        '<div class="sale-card-body">' +
        '<p class="sale-card-title">' +
        escapeHtml(t("empty")) +
        "</p>" +
        "</div>" +
        "</li>";
      return;
    }
    const xUrl = CFG.xUrl || "https://x.com/lucaxyzz";
    ul.innerHTML = CATALOG.cards
      .map(function (card) {
        const price =
          card.priceIdr != null && card.priceIdr !== ""
            ? '<p class="sale-price-line sale-price-line--ask"><span class="sale-price-ask">' +
              formatIdr(card.priceIdr) +
              "</span></p>"
            : "";
        const note = card.note
          ? '<p class="sale-card-category">' + escapeHtml(card.note) + "</p>"
          : "";
        const photo = card.photo
          ? '<div class="sale-card-media"><img src="' +
            escapeHtml(card.photo) +
            '" alt="" loading="lazy" width="1200" height="900"></div>'
          : "";
        return (
          '<li class="sale-card" data-card="' +
          escapeHtml(card.id) +
          '">' +
          photo +
          '<div class="sale-card-body">' +
          (card.category
            ? '<p class="sale-card-category">' + escapeHtml(card.category) + "</p>"
            : "") +
          '<h2 class="sale-card-title">' +
          escapeHtml(card.title) +
          "</h2>" +
          note +
          '<div class="sale-card-price">' +
          price +
          "</div>" +
          '<p class="sale-card-contact">' +
          '<a class="sale-reserve-btn" href="' +
          escapeHtml(xUrl) +
          '" target="_blank" rel="noopener">' +
          escapeHtml(t("ask")) +
          "</a>" +
          "</p>" +
          "</div>" +
          "</li>"
        );
      })
      .join("");
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function onClick(e) {
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
        behavior: prefersReducedMotion() ? "auto" : "smooth"
      });
    }
  }

  function onScroll() {
    const btn = document.getElementById("scroll-to-top");
    if (btn) btn.classList.toggle("is-visible", window.scrollY > 240);
  }

  function setHref(id, href, text) {
    const el = document.getElementById(id);
    if (!el || !href) return;
    el.href = href;
    if (text) el.textContent = text;
  }

  function init() {
    document.addEventListener("click", onClick);
    window.addEventListener("scroll", onScroll, { passive: true });
    const xUrl = CFG.xUrl || "https://x.com/lucaxyzz";
    const liUrl = CFG.linkedinUrl || "https://www.linkedin.com/in/lucacadalora";
    const xLabel = CFG.xHandle ? "x.com/" + CFG.xHandle : "x.com/lucaxyzz";
    setHref("x-link", xUrl, xLabel);
    setHref("li-link", liUrl, "linkedin.com/in/lucacadalora");
    setHref("footer-x", xUrl);
    setHref("footer-li", liUrl);
    applyLocale();
    onScroll();
  }

  init();
})();
