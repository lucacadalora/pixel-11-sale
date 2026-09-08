(function () {
  const CFG = window.PIXEL_CONFIG;
  const STORAGE_KEY = "mac-mini-reserve";
  const MAX_ITEMS = 2;
  const PHOTO =
    "https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/mac-mini-hero-202410?wid=1200&hei=900&fmt=jpeg&qlt=90";

  const CATALOG = {
    cards: [
      {
        id: "mac-mini-m6-256",
        modelId: "mac-mini-m6",
        category: "MAC MINI",
        title: "16 / 256",
        storages: ["256"],
        defaultStorage: "256",
        photo: PHOTO
      },
      {
        id: "mac-mini-m6-512",
        modelId: "mac-mini-m6",
        category: "MAC MINI",
        title: "16 / 512",
        storages: ["512"],
        defaultStorage: "512",
        photo: PHOTO
      }
    ]
  };

  const I18N = {
    en: {
      home: "home",
      how: "how",
      sale: "sale",
      macMini: "mac mini",
      shop: "shop",
      title: "Mac mini",
      intro:
        "mac mini m6 from singapore. official apple sg. pre-order, available starting 22 september 2026. tap i next to the ask if you want the math. jakarta pickup or courier.",
      add: "add",
      inBag: "in bag",
      bag: "bag",
      pay: "pay",
      drawerTitle: "bag",
      cancel: "close",
      error: "couldn't start checkout. try again?",
      paySoon: "pay isn't live yet. stripe key still missing.",
      total: "total",
      howTitle: "how this works",
      howBody: [
        "ask is built from official apple singapore, not grey. 16 gb / 256 gb list s$1,299; 16 gb / 512 gb s$1,599 (+s$300 storage step).",
        "same math as pixel: official minus 9% gst, minus usd 500 pib, then bm 10% and ppn 11% on the rest (ppn sits on value + bm), plus rp 5.000.000 markup.",
        "pre-order now — units start 22 september 2026. add a config (max 2), then pay with card, apple pay, or google pay. i'll ping you on x or linkedin about delivery."
      ],
      contactTitle: "contact",
      contactBody: "dm me on x or linkedin.",
      footerApple: "apple sg",
      priceInfo: "how this price is built"
    },
    id: {
      home: "home",
      how: "cara",
      sale: "sale",
      macMini: "mac mini",
      shop: "shop",
      title: "Mac mini",
      intro:
        "mac mini m6 dari singapura. harga resmi apple sg. pre-order, tersedia mulai 22 september 2026. ketuk i di samping ask kalau mau lihat hitungannya. ambil jakarta atau kurir.",
      add: "add",
      inBag: "in bag",
      bag: "bag",
      pay: "pay",
      drawerTitle: "bag",
      cancel: "tutup",
      error: "checkout gagal. coba lagi?",
      paySoon: "pay belum hidup. kunci stripe belum dipasang.",
      total: "total",
      howTitle: "cara kerjanya",
      howBody: [
        "ask dari harga resmi apple singapura. 16 gb / 256 gb s$1.299; 16 gb / 512 gb s$1.599 (+s$300).",
        "hitungannya sama seperti pixel: resmi minus gst 9%, minus pib usd 500, lalu bm 10% dan ppn 11% dari sisa (ppn di nilai + bm), plus markup rp 5.000.000.",
        "pre-order sekarang — unit mulai 22 september 2026. masukkan config (maks 2), lalu bayar dengan kartu, apple pay, atau google pay. saya hubungi di x atau linkedin soal pengiriman."
      ],
      contactTitle: "kontak",
      contactBody: "dm saya di x atau linkedin.",
      footerApple: "apple sg",
      priceInfo: "cara harga ini disusun"
    }
  };

  const state = {
    locale: localStorage.getItem("pixel11-locale") || "en",
    selected: loadSelected(),
    sheetOpen: false,
    paying: false,
    openPrice: null,
    payError: false
  };

  function loadSelected() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(raw) ? raw.slice(0, MAX_ITEMS) : [];
    } catch {
      return [];
    }
  }

  function saveSelected() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.selected));
  }

  function t(key) {
    return (I18N[state.locale] || I18N.en)[key];
  }

  function formatIdr(n) {
    return "Rp " + String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function cardById(cardId) {
    return CATALOG.cards.find(function (c) {
      return c.id === cardId;
    });
  }

  function priced(card) {
    const storage = card.defaultStorage;
    const p = window.PIXEL_PRICE
      ? window.PIXEL_PRICE.compute(card.modelId, storage)
      : { askIdr: 0, officialSgd: 0 };
    return Object.assign({}, p, {
      id: card.id,
      modelId: card.modelId,
      model: card.category,
      color: card.title,
      storage: storage,
      askIdr: p.askIdr
    });
  }

  function breakdownRows(p) {
    if (!window.PIXEL_PRICE || !window.PIXEL_PRICE.breakdownRows) return [];
    return window.PIXEL_PRICE.breakdownRows(p, state.locale).map(function (r) {
      return {
        name: String(r.name)
          .replace(/google store/gi, "apple")
          .replace(/google/gi, "apple"),
        cost: r.cost
      };
    });
  }

  function selectedEntries() {
    return state.selected
      .map(function (sel) {
        const card = cardById(sel.cardId);
        if (!card) return null;
        const v = priced(card);
        return v && v.askIdr ? { sel: sel, v: v } : null;
      })
      .filter(Boolean);
  }

  function selectedTotal() {
    const entries = selectedEntries();
    if (window.PIXEL_PRICE && window.PIXEL_PRICE.computeCart) {
      return window.PIXEL_PRICE
        .computeCart(
          entries.map(function (e) {
            return { modelId: e.v.modelId, storage: e.sel.storage };
          })
        )
        .reduce(function (sum, p) {
          return sum + p.askIdr;
        }, 0);
    }
    return entries.reduce(function (sum, e) {
      return sum + e.v.askIdr;
    }, 0);
  }

  function isPicked(cardId) {
    return state.selected.some(function (s) {
      return s.cardId === cardId;
    });
  }

  function applyLocale() {
    const L = I18N[state.locale];
    document.documentElement.lang = state.locale === "id" ? "id" : "en";
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = L[el.getAttribute("data-i18n")] || el.textContent;
    });
    const intro = document.getElementById("sale-intro");
    if (intro) intro.textContent = L.intro;
    const how = document.getElementById("how-body");
    if (how) how.innerHTML = L.howBody.map(function (p) {
      return "<p>" + p + "</p>";
    }).join("");
    document.querySelectorAll(".lang-switcher a").forEach(function (a) {
      a.classList.toggle("current", a.dataset.locale === state.locale);
    });
    renderGrid();
    renderBar();
    renderSheet();
  }

  function syncPricePop(animateOpen) {
    document.querySelectorAll(".sale-card").forEach(function (card) {
      const id = card.getAttribute("data-card");
      const open = state.openPrice === id;
      const pop = card.querySelector(".price-pop");
      const btn = card.querySelector(".price-info");
      if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
      card.classList.toggle("is-price-open", open);
      if (!pop) return;
      if (open && animateOpen) {
        pop.classList.remove("is-open");
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            pop.classList.add("is-open");
          });
        });
      } else {
        pop.classList.toggle("is-open", open);
      }
    });
  }

  function renderGrid() {
    const ul = document.getElementById("sale-grid");
    if (!ul) return;
    ul.innerHTML = CATALOG.cards
      .map(function (card) {
        const v = priced(card);
        const picked = isPicked(card.id);
        const open = state.openPrice === card.id;
        const rows = breakdownRows(v);
        const pop =
          rows.length
            ? '<ol class="price-pop">' +
              rows
                .map(function (r, i) {
                  return (
                    "<li><span class=\"price-n\">" +
                    (i + 1) +
                    "</span><span class=\"price-name\">" +
                    r.name +
                    "</span><span class=\"price-cost\">" +
                    r.cost +
                    "</span></li>"
                  );
                })
                .join("") +
              "</ol>"
            : "";
        return (
          '<li class="sale-card' +
          (picked ? " sale-card--picked" : "") +
          '" data-card="' +
          card.id +
          '">' +
          '<div class="sale-card-media">' +
          '<img src="' +
          card.photo +
          '" alt="" loading="lazy" width="1200" height="900">' +
          "</div>" +
          '<div class="sale-card-body">' +
          '<p class="sale-card-category">' +
          card.category +
          "</p>" +
          '<h2 class="sale-card-title">' +
          card.title +
          "</h2>" +
          '<div class="sale-card-price">' +
          '<p class="sale-price-line sale-price-line--ask">' +
          '<span class="sale-price-ask">' +
          formatIdr(v.askIdr) +
          "</span>" +
          '<button type="button" class="price-info" data-price-info="' +
          card.id +
          '" aria-expanded="' +
          open +
          '" aria-label="' +
          t("priceInfo") +
          '">i</button>' +
          "</p>" +
          pop +
          "</div>" +
          '<p class="sale-card-contact">' +
          '<button type="button" class="sale-reserve-btn' +
          (picked ? " is-on" : "") +
          '" aria-pressed="' +
          picked +
          '" data-reserve="' +
          card.id +
          '">' +
          (picked ? t("inBag") : t("add")) +
          "</button>" +
          "</p>" +
          "</div>" +
          "</li>"
        );
      })
      .join("");
    syncPricePop(false);
  }

  function renderBar() {
    const bag = document.getElementById("nav-bag");
    const n = state.selected.length;
    if (bag) {
      bag.classList.toggle("has-items", n > 0);
      bag.textContent = n ? t("bag") + " " + n : t("bag");
    }
    const bar = document.getElementById("sale-reserve-bar");
    const confirm = document.getElementById("sale-reserve-confirm");
    if (bar) bar.hidden = true;
    if (confirm) confirm.hidden = true;
  }

  function renderSheet() {
    const layer = document.getElementById("sale-reserve-layer");
    if (!layer) return;
    layer.hidden = !state.sheetOpen || state.selected.length === 0;
    document.body.classList.toggle("sheet-open", !layer.hidden);
    renderBar();
    if (layer.hidden) return;
    const items = selectedEntries();
    const cartPrices =
      window.PIXEL_PRICE && window.PIXEL_PRICE.computeCart
        ? window.PIXEL_PRICE.computeCart(
            items.map(function (e) {
              return { modelId: e.v.modelId, storage: e.sel.storage };
            })
          )
        : null;
    const list = document.getElementById("sale-reserve-items");
    list.innerHTML =
      items
        .map(function (entry, i) {
          const v = entry.v;
          const title = v.model + " · " + v.color;
          const ask = cartPrices && cartPrices[i] ? cartPrices[i].askIdr : v.askIdr;
          return (
            '<li data-line="' +
            v.id +
            '">' +
            '<span class="sale-reserve-item-title">' +
            title +
            '<span class="sale-reserve-item-meta">' +
            v.storage +
            "</span></span>" +
            '<span class="sale-reserve-item-price">' +
            formatIdr(ask) +
            "</span>" +
            '<button type="button" class="sale-reserve-remove" data-remove="' +
            v.id +
            '" aria-label="remove">×</button>' +
            "</li>"
          );
        })
        .join("") +
      '<li class="sale-reserve-total">' +
      '<span class="sale-reserve-item-title">' +
      t("total") +
      "</span>" +
      '<span class="sale-reserve-item-price">' +
      formatIdr(selectedTotal()) +
      "</span>" +
      "</li>";
    const err = document.getElementById("sale-reserve-error");
    if (err && !state.payError) err.hidden = true;
    const pay = document.getElementById("sale-pay");
    if (pay) {
      pay.disabled = state.paying;
      pay.textContent = state.paying ? t("pay") + "…" : t("pay");
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function markCardInBag(cardId, on) {
    const card = document.querySelector('.sale-card[data-card="' + cardId + '"]');
    if (!card) return;
    card.classList.toggle("sale-card--picked", on);
    const btn = card.querySelector(".sale-reserve-btn");
    if (!btn) return;
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.textContent = on ? t("inBag") : t("add");
  }

  function updateTotalRow() {
    const el = document.querySelector(".sale-reserve-total .sale-reserve-item-price");
    if (el) el.textContent = formatIdr(selectedTotal());
  }

  function closeSheet(animate) {
    const layer = document.getElementById("sale-reserve-layer");
    if (animate && layer && !prefersReducedMotion()) {
      layer.classList.add("is-closing");
      setTimeout(function () {
        layer.classList.remove("is-closing");
        state.sheetOpen = false;
        renderSheet();
      }, 240);
      return;
    }
    if (layer) layer.classList.remove("is-closing");
    state.sheetOpen = false;
    renderSheet();
  }

  function removeFromBag(id, row) {
    const sel = state.selected.find(function (s) {
      return s.id === id;
    });
    if (!sel) return;
    const finish = function (animateClose) {
      state.selected = state.selected.filter(function (s) {
        return s.id !== id;
      });
      saveSelected();
      markCardInBag(sel.cardId, false);
      renderBar();
      if (!state.selected.length) {
        closeSheet(animateClose);
      } else if (row) {
        row.remove();
        updateTotalRow();
      } else {
        renderSheet();
      }
    };
    if (prefersReducedMotion() || !row) {
      finish(false);
      return;
    }
    row.classList.add("is-out");
    setTimeout(function () {
      finish(true);
    }, 280);
  }

  function fly(mediaEl) {
    if (!mediaEl || prefersReducedMotion()) return;
    const start = mediaEl.getBoundingClientRect();
    if (!start.width) return;
    const targetEl = document.getElementById("nav-bag") || document.querySelector(".sale-reserve-target");
    if (!targetEl) return;
    const target = targetEl.getBoundingClientRect();
    const img = mediaEl.querySelector("img");
    const node = document.createElement("div");
    node.className = "sale-add-flight";
    node.style.cssText =
      "width:" +
      start.width +
      "px;height:" +
      start.height +
      "px;left:" +
      start.left +
      "px;top:" +
      start.top +
      "px;transition:transform .7s ease-in,opacity .7s ease-in;transform-origin:center center;";
    if (img) node.appendChild(img.cloneNode(true));
    document.body.appendChild(node);
    const dx = target.left - start.left - start.width / 2;
    const dy = target.top - start.top - start.height / 2;
    requestAnimationFrame(function () {
      node.style.transform = "translate(" + dx + "px, " + dy + "px) scale(.14)";
      node.style.opacity = "0";
    });
    setTimeout(function () {
      node.remove();
    }, 750);
  }

  function toggleReserve(cardId, mediaEl) {
    const existing = state.selected.find(function (s) {
      return s.cardId === cardId;
    });
    if (existing) {
      state.selected = state.selected.filter(function (s) {
        return s.cardId !== cardId;
      });
    } else {
      if (state.selected.length >= MAX_ITEMS) {
        state.sheetOpen = true;
        renderSheet();
        return;
      }
      const card = cardById(cardId);
      if (!card) return;
      state.selected.push({
        id: card.id,
        cardId: card.id,
        storage: card.defaultStorage
      });
      fly(mediaEl);
    }
    saveSelected();
    renderGrid();
    renderBar();
    if (state.sheetOpen) renderSheet();
  }

  async function startCheckout() {
    const err = document.getElementById("sale-reserve-error");
    if (!state.selected.length || state.paying) return;
    state.paying = true;
    state.payError = false;
    if (err) err.hidden = true;
    renderSheet();
    try {
      const res = await fetch(CFG.checkoutPath || "/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: state.selected.map(function (s) {
            return { cardId: s.cardId, storage: s.storage };
          })
        })
      });
      const data = await res.json().catch(function () {
        return {};
      });
      if (!res.ok || !data.url) {
        state.payError = true;
        if (err) {
          err.textContent =
            res.status === 503 || data.code === "no_stripe" ? t("paySoon") : t("error");
          err.hidden = false;
        }
        return;
      }
      location = data.url;
    } catch {
      state.payError = true;
      if (err) {
        err.textContent = t("error");
        err.hidden = false;
      }
    } finally {
      state.paying = false;
      renderSheet();
    }
  }

  function onPriceInfo(e) {
    const info = e.target.closest("[data-price-info]");
    if (!info) return;
    e.preventDefault();
    e.stopPropagation();
    const id = info.getAttribute("data-price-info");
    state.openPrice = state.openPrice === id ? null : id;
    syncPricePop(!!state.openPrice);
  }

  function onClick(e) {
    if (e.target.closest("[data-price-info]")) return;
    const locale = e.target.closest("[data-locale]");
    if (locale) {
      e.preventDefault();
      state.locale = locale.dataset.locale;
      localStorage.setItem("pixel11-locale", state.locale);
      applyLocale();
      return;
    }
    if (
      state.openPrice &&
      !e.target.closest(".price-pop") &&
      !e.target.closest(".sale-price-line--ask")
    ) {
      state.openPrice = null;
      syncPricePop(false);
    }
    const reserve = e.target.closest("[data-reserve]");
    if (reserve) {
      const card = reserve.closest(".sale-card");
      toggleReserve(reserve.dataset.reserve, card && card.querySelector(".sale-card-media"));
      return;
    }
    const pay = e.target.closest("#sale-pay");
    if (pay) {
      startCheckout();
      return;
    }
    const open = e.target.closest("[data-open-sheet]");
    if (open) {
      if (!state.selected.length) return;
      state.sheetOpen = true;
      renderSheet();
      return;
    }
    const close = e.target.closest("[data-close-sheet]");
    if (close) {
      closeSheet(true);
      return;
    }
    const remove = e.target.closest("[data-remove]");
    if (remove) {
      e.preventDefault();
      removeFromBag(remove.dataset.remove, remove.closest("li"));
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
    document.addEventListener("click", onPriceInfo, true);
    document.addEventListener("click", onClick);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (state.openPrice) {
          state.openPrice = null;
          syncPricePop(false);
        }
        if (state.sheetOpen) closeSheet(true);
      }
    });
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
