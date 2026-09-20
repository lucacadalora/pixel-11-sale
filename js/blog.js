(function () {
  const CFG = window.PIXEL_CONFIG || {};

  const POSTS = [
    {
      id: "first-pixel-drop",
      title: "First Pixel Drop",
      body: "first sealed Pixel + Watch + case landed with a buyer in jakarta. real notes on /reviews.",
      date: "2026-09-19",
      href: "reviews.html"
    },
    {
      id: "pixel-11-series-live",
      title: "Pixel 11 Series Live",
      body: "bag + stripe checkout on /sale. sealed from changi.",
      date: "2026-08-23",
      href: "sale.html"
    },
    {
      id: "building-in-public",
      title: "Building in Public",
      body: "sovereign AI at jatevo.ai · AI software factory at vantis.sh.",
      date: "2026-09-12",
      href: "https://jatevo.ai"
    }
  ].slice().sort(function (a, b) {
    return String(b.date).localeCompare(String(a.date));
  });

  const I18N = {
    en: {
      home: "home",
      sale: "pixel 11",
      macMini: "mac mini",
      garage: "garage",
      blog: "blog",
      reviews: "reviews",
      shop: "shop",
      title: "Notes",
      intro: "notes, snippets, media — projects and short updates.",
      howTitle: "how this works",
      howBody: [
        "short notes from jakarta. projects, drops, and media as they happen."
      ],
      contactTitle: "contact",
      contactBody: "dm me on x or linkedin.",
      empty: "no notes yet…",
      footerHow: "how",
      today: "today",
      yesterday: "yesterday",
      daysAgo: "{n} days ago",
      monthsAgo: "{n} months ago",
      lastYear: "last year",
      yearsAgo: "{n} years ago"
    },
    id: {
      home: "home",
      sale: "pixel 11",
      macMini: "mac mini",
      garage: "garage",
      blog: "blog",
      reviews: "reviews",
      shop: "shop",
      title: "Catatan",
      intro: "catatan, cuplikan, media — proyek dan update singkat.",
      howTitle: "cara kerjanya",
      howBody: [
        "catatan singkat dari jakarta. proyek, drop, dan media saat terjadi."
      ],
      contactTitle: "kontak",
      contactBody: "dm saya di x atau linkedin.",
      empty: "belum ada catatan…",
      footerHow: "cara",
      today: "hari ini",
      yesterday: "kemarin",
      daysAgo: "{n} hari lalu",
      monthsAgo: "{n} bulan lalu",
      lastYear: "tahun lalu",
      yearsAgo: "{n} tahun lalu"
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

  function startOfDay(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  function relativeDate(iso) {
    const L = I18N[state.locale] || I18N.en;
    const then = startOfDay(new Date(iso + "T00:00:00"));
    const now = startOfDay(new Date());
    if (isNaN(then.getTime())) return iso;
    const diffDays = Math.round((now - then) / 86400000);
    if (diffDays <= 0) return L.today;
    if (diffDays === 1) return L.yesterday;
    if (diffDays < 30) return L.daysAgo.replace("{n}", String(diffDays));
    const months =
      (now.getFullYear() - then.getFullYear()) * 12 +
      (now.getMonth() - then.getMonth());
    if (months < 12) {
      const n = Math.max(1, months);
      return L.monthsAgo.replace("{n}", String(n));
    }
    const years = now.getFullYear() - then.getFullYear();
    if (years === 1) return L.lastYear;
    return L.yearsAgo.replace("{n}", String(Math.max(1, years)));
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

  function mediaHtml(post) {
    if (post.image) {
      return (
        '<div class="blog-card-media"><img src="' +
        escapeHtml(post.image) +
        '" alt="" loading="lazy"></div>'
      );
    }
    if (post.youtube) {
      const thumb =
        "https://i.ytimg.com/vi/" +
        encodeURIComponent(post.youtube) +
        "/hqdefault.jpg";
      const href =
        "https://www.youtube.com/watch?v=" + encodeURIComponent(post.youtube);
      return (
        '<div class="blog-card-media"><a href="' +
        escapeHtml(href) +
        '" target="_blank" rel="noopener"><img src="' +
        escapeHtml(thumb) +
        '" alt="" loading="lazy"></a></div>'
      );
    }
    return "";
  }

  function renderGrid() {
    const ul = document.getElementById("blog-grid");
    if (!ul) return;
    if (!POSTS.length) {
      ul.innerHTML =
        '<li class="blog-card" aria-live="polite">' +
        '<p class="blog-card-title">' +
        escapeHtml(t("empty")) +
        "</p>" +
        "</li>";
      return;
    }
    ul.innerHTML = POSTS.map(function (post) {
      const body = post.bodyId && state.locale === "id" ? post.bodyId : post.body;
      const link = post.href
        ? '<a class="underline blog-card-link" href="' +
          escapeHtml(post.href) +
          '"' +
          (String(post.href).indexOf("http") === 0
            ? ' target="_blank" rel="noopener"'
            : "") +
          ">" +
          escapeHtml(post.href.replace(/^https?:\/\//, "")) +
          "</a>"
        : "";
      return (
        '<li class="blog-card" data-post="' +
        escapeHtml(post.id) +
        '">' +
        '<h2 class="blog-card-title">' +
        escapeHtml(post.title) +
        "</h2>" +
        '<p class="blog-card-body">' +
        escapeHtml(body || "") +
        "</p>" +
        mediaHtml(post) +
        link +
        '<p class="blog-card-time">' +
        escapeHtml(relativeDate(post.date)) +
        "</p>" +
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
