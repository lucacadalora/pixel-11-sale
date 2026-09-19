(function () {
  const CFG = window.PIXEL_CONFIG || {};

  const REVIEWS = [
    {
      id: "zaka-2101177783200387265",
      name: "Ahmad Zakaria",
      handle: "za_ka",
      city: "",
      device: "Pixel jastip",
      body: "Thank you ya @lucaxyzz jastipnya. Trusted seller nih...",
      stars: 5,
      photo: "https://pbs.twimg.com/media/HSjiDPUbwAAlayz.jpg",
      date: "19 Sep 2026",
      tweetUrl: "https://x.com/za_ka/status/2101177783200387265",
      tweetId: "2101177783200387265"
    }
  ];

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
        "short notes from people who bought through me. real drops only — including posts from x.",
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
      footerHow: "how",
      starsLabel: "5 stars"
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
        "catatan singkat dari yang beli lewat saya. yang nyata saja — termasuk post dari x.",
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
      footerHow: "cara",
      starsLabel: "5 bintang"
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

  function starsHtml(n) {
    const count = Math.max(0, Math.min(5, Number(n) || 0));
    if (!count) return "";
    return (
      '<p class="review-card-stars" aria-label="' +
      escapeHtml(t("starsLabel")) +
      '">' +
      "★".repeat(count) +
      '<span class="review-card-stars-empty">' +
      "☆".repeat(5 - count) +
      "</span></p>"
    );
  }

  function tweetEmbedHtml(r) {
    if (!r.tweetUrl) return "";
    return (
      '<div class="review-tweet">' +
      '<blockquote class="twitter-tweet" data-dnt="true" data-theme="light">' +
      "<p>" +
      escapeHtml(r.body || "") +
      "</p>" +
      '&mdash; @' +
      escapeHtml(r.handle || "") +
      ' <a href="' +
      escapeHtml(r.tweetUrl) +
      '">' +
      escapeHtml(r.date || "") +
      "</a>" +
      "</blockquote>" +
      "</div>"
    );
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

  function loadTweetWidgets() {
    if (!document.querySelector(".twitter-tweet")) return;
    if (window.twttr && window.twttr.widgets && window.twttr.widgets.load) {
      window.twttr.widgets.load();
      return;
    }
    if (document.getElementById("twitter-wjs")) return;
    const s = document.createElement("script");
    s.id = "twitter-wjs";
    s.async = true;
    s.src = "https://platform.twitter.com/widgets.js";
    document.body.appendChild(s);
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
      const meta = [r.city, r.device, r.handle ? "@" + r.handle : ""]
        .filter(Boolean)
        .join(" · ");
      const photo = r.photo
        ? '<div class="sale-card-media"><img src="' +
          escapeHtml(r.photo) +
          '" alt="" loading="lazy" width="1200" height="900"></div>'
        : "";
      const date = r.date
        ? '<p class="review-card-meta">' + escapeHtml(r.date) + "</p>"
        : "";
      const link = r.tweetUrl
        ? '<p class="review-card-meta"><a class="underline" href="' +
          escapeHtml(r.tweetUrl) +
          '" target="_blank" rel="noopener">view on x</a></p>'
        : "";
      return (
        '<li class="sale-card review-card" data-review="' +
        escapeHtml(r.id) +
        '">' +
        photo +
        '<div class="sale-card-body">' +
        starsHtml(r.stars) +
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
        link +
        tweetEmbedHtml(r) +
        "</div>" +
        "</li>"
      );
    }).join("");
    loadTweetWidgets();
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
