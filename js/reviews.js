(function () {
  const CFG = window.PIXEL_CONFIG || {};

  const REVIEWS = [];

  const I18N = {
    en: {
      home: "home",
      sale: "pixel 11",
      macMini: "mac mini",
      garage: "garage",
      reviews: "reviews",
      shop: "shop",
      title: "Reviews",
      intro:
        "short notes from people who bought through me. no star walls — just real drops.",
      howTitle: "how this works",
      howBody: [
        "bought something through me? dm on x or linkedin if you want to leave a short note.",
        "nerd reviews collab incoming — separate from these buyer notes."
      ],
      contactTitle: "contact",
      contactBody: "dm me on x or linkedin.",
      empty: "reviews coming soon…",
      nerdTitle: "nerd reviews",
      nerdBody: "collaborative review incoming — not a buyer note.",
      footerHow: "how"
    },
    id: {
      home: "home",
      sale: "pixel 11",
      macMini: "mac mini",
      garage: "garage",
      reviews: "reviews",
      shop: "shop",
      title: "Reviews",
      intro:
        "catatan singkat dari yang beli lewat saya. tanpa bintang palsu — yang ada saja.",
      howTitle: "cara kerjanya",
      howBody: [
        "beli lewat saya? dm di x atau linkedin kalau mau ninggalin catatan singkat.",
        "kolaborasi nerd reviews segera — terpisah dari catatan pembeli."
      ],
      contactTitle: "kontak",
      contactBody: "dm saya di x atau linkedin.",
      empty: "review segera…",
      nerdTitle: "nerd reviews",
      nerdBody: "review kolaborasi segera — bukan catatan pembeli.",
      footerHow: "cara"
    }
  };

  const state = {
    locale: localStorage.getItem("pixel11-locale") || "en"
  };

  function t(key) {
    return (I18N[state.locale] || I18N.en)[key];
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
    const ul = document.getElementById("reviews-grid");
    if (!ul) return;
    if (!REVIEWS.length) {
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
    ul.innerHTML = REVIEWS.map(function (r) {
      const meta = [r.city, r.device].filter(Boolean).join(" · ");
      const photo = r.photo
        ? '<div class="sale-card-media"><img src="' +
          escapeHtml(r.photo) +
          '" alt="" loading="lazy" width="1200" height="900"></div>'
        : "";
      const date = r.date
        ? '<p class="review-card-meta">' + escapeHtml(r.date) + "</p>"
        : "";
      return (
        '<li class="sale-card review-card" data-review="' +
        escapeHtml(r.id) +
        '">' +
        photo +
        '<div class="sale-card-body">' +
        (meta
          ? '<p class="sale-card-category review-card-meta">' +
            escapeHtml(meta) +
            "</p>"
          : "") +
        '<h2 class="sale-card-title">' +
        escapeHtml(r.name || "") +
        "</h2>" +
        '<p class="review-card-quote">' +
        escapeHtml(r.body || "") +
        "</p>" +
        date +
        "</div>" +
        "</li>"
      );
    }).join("");
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
