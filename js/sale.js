(function () {
  const CFG = window.PIXEL_CONFIG;
  const STORAGE_KEY = "pixel11-reserve";
  const MAX_ITEMS = 2;

  const I18N = {
    en: {
      home: "home",
      how: "how",
      sale: "sale",
      shop: "shop",
      title: "Pixel 11",
      intro: "sealed pixel 11 from singapore. official google store sgd. tap i next to the ask if you want the math. jakarta pickup or courier.",
      filterAll: "all",
      filter11: "pixel 11",
      filterPro: "pro",
      filterXl: "pro xl",
      filterFold: "fold",
      add: "add",
      inBag: "in bag",
      bag: "bag",
      checkout: "checkout",
      pay: "pay",
      reserve: "add",
      reserved: "in bag",
      continue: "checkout",
      drawerTitle: "bag",
      cancel: "close",
      success: "paid. i'll ping you on x or linkedin about delivery.",
      error: "couldn't start checkout. try again?",
      paySoon: "pay isn't live yet. stripe key still missing.",
      total: "total",
      itemAdded: "{n} in bag",
      itemsAdded: "{n} in bag",
      howTitle: "how this works",
      howBody: [
        "ask is built from official google store singapore, not ishopchangi. 256 gb list: pixel 11 s$1,299, pro s$1,599, pro xl s$1,819, fold s$2,499. higher storage is +s$200 a step.",
        "for 1 phone: official minus 9% gst, minus usd 500 pib, then bm 10% and ppn 11% on the rest (ppn sits on value + bm), plus rp 5.000.000 markup. my take is the gst refund plus that markup.",
        "two phones on one trip share the usd 500 exemption — ping me and i'll recompute.",
        "add a color and storage (max 2), then pay with card, apple pay, or google pay. i'll ping you on x or linkedin about delivery."
      ],
      contactTitle: "contact",
      contactBody: "dm me on x or linkedin.",
      footerIshop: "google store sg",
      priceInfo: "how this price is built",
      officialLabel: "official",
      askLabel: "ask"
    },
    id: {
      home: "home",
      how: "cara",
      sale: "sale",
      shop: "shop",
      title: "Pixel 11",
      intro: "pixel 11 sealed dari singapura. harga resmi google store sg. ketuk i di samping ask kalau mau lihat hitungannya. ambil jakarta atau kurir.",
      filterAll: "semua",
      filter11: "pixel 11",
      filterPro: "pro",
      filterXl: "pro xl",
      filterFold: "fold",
      add: "add",
      inBag: "in bag",
      bag: "bag",
      checkout: "checkout",
      pay: "pay",
      reserve: "add",
      reserved: "in bag",
      continue: "checkout",
      drawerTitle: "bag",
      cancel: "tutup",
      success: "sudah bayar. saya hubungi di x atau linkedin soal pengiriman.",
      error: "checkout gagal. coba lagi?",
      paySoon: "pay belum hidup. kunci stripe belum dipasang.",
      total: "total",
      itemAdded: "{n} in bag",
      itemsAdded: "{n} in bag",
      howTitle: "cara kerjanya",
      howBody: [
        "ask dari harga resmi google store singapura, bukan ishopchangi. 256 gb: pixel 11 s$1.299, pro s$1.599, pro xl s$1.819, fold s$2.499. storage lebih besar +s$200.",
        "untuk 1 hp: resmi minus gst 9%, minus pib usd 500, lalu bm 10% dan ppn 11% dari sisa (ppn dihitung dari nilai + bm), plus markup rp 5.000.000. untung saya = refund gst + markup itu.",
        "dua hp dalam satu trip berbagi pib usd 500 — chat, saya hitung ulang.",
        "masukkan warna dan penyimpanan (maks 2), lalu bayar dengan kartu, apple pay, atau google pay. saya hubungi di x atau linkedin soal pengiriman."
      ],
      contactTitle: "kontak",
      contactBody: "dm saya di x atau linkedin.",
      footerIshop: "google store sg",
      priceInfo: "cara harga ini disusun",
      officialLabel: "resmi",
      askLabel: "ask"
    }
  };

  const state = {
    catalog: null,
    locale: localStorage.getItem("pixel11-locale") || "en",
    filter: "all",
    selected: loadSelected(),
    storageByCard: {},
    sheetOpen: false,
    success: false,
    paying: false,
    openPrice: null
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
    const digits = String(Math.round(n));
    return "Rp " + digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function variantFor(cardId, storage) {
    const st = (storage || "256").toLowerCase();
    const raw = ((state.catalog && state.catalog.variants) || []).find((v) => v.id === cardId + "-" + st) || {};
    const card = ((state.catalog && state.catalog.cards) || []).find((c) => c.id === cardId) || {};
    const priced = window.PIXEL_PRICE
      ? window.PIXEL_PRICE.compute(card.modelId, storage)
      : { askIdr: raw.askIdr, officialSgd: raw.changiSgd, officialIdr: raw.estimateIdr };
    return Object.assign({}, raw, priced, {
      id: raw.id || cardId + "-" + st,
      modelId: card.modelId,
      model: raw.model || card.category || "",
      color: raw.color || card.title || "",
      storage: raw.storage || storage,
      askIdr: priced.askIdr,
      estimateIdr: priced.officialIdr || priced.estimateIdr,
      officialSgd: priced.officialSgd,
      changiSgd: priced.officialSgd
    });
  }

  function selectedEntries() {
    return state.selected
      .map((sel) => {
        const v = variantFor(sel.cardId, sel.storage);
        return v && v.askIdr ? { sel: sel, v: v } : null;
      })
      .filter(Boolean);
  }

  function selectedTotal() {
    const entries = selectedEntries();
    if (window.PIXEL_PRICE && window.PIXEL_PRICE.computeCart) {
      return window.PIXEL_PRICE.computeCart(
        entries.map(function (e) {
          return { modelId: e.v.modelId, storage: e.sel.storage };
        })
      ).reduce(function (sum, p) { return sum + p.askIdr; }, 0);
    }
    return entries.reduce(function (sum, e) { return sum + e.v.askIdr; }, 0);
  }

  function isPicked(cardId) {
    return state.selected.some((s) => s.cardId === cardId);
  }

  function applyLocale() {
    const L = I18N[state.locale];
    document.documentElement.lang = state.locale === "id" ? "id" : "en";
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = L[el.getAttribute("data-i18n")] || el.textContent;
    });
    const intro = document.getElementById("sale-intro");
    if (intro) intro.textContent = L.intro;
    const how = document.getElementById("how-body");
    if (how) how.innerHTML = L.howBody.map((p) => "<p>" + p + "</p>").join("");
    if (window.PIXEL_FAQ) window.PIXEL_FAQ.render(state.locale);
    document.querySelectorAll(".lang-switcher a").forEach((a) => {
      a.classList.toggle("current", a.dataset.locale === state.locale);
    });
    renderGrid();
    renderBar();
    renderSheet();
  }

  function syncPricePop(animateOpen) {
    document.querySelectorAll(".sale-card").forEach((card) => {
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
    if (!ul || !state.catalog) return;
    const cards = state.catalog.cards.filter((c) => state.filter === "all" || c.filter === state.filter);
    ul.innerHTML = cards
      .map((card) => {
        const storage = state.storageByCard[card.id] || card.defaultStorage;
        const v = variantFor(card.id, storage);
        const picked = isPicked(card.id);
        const open = state.openPrice === card.id;
        const chips = card.storages
          .map((st) => {
            const on = st === storage ? " is-on" : "";
            return `<button type="button" class="sale-chip${on}" data-storage="${st}" data-card="${card.id}">${st}</button>`;
          })
          .join("");
        let pop = "";
        if (window.PIXEL_PRICE && window.PIXEL_PRICE.breakdownRows) {
          const rows = window.PIXEL_PRICE.breakdownRows(v, state.locale);
          pop =
            '<ol class="price-pop">' +
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
            "</ol>";
        }
        return `<li class="sale-card${picked ? " sale-card--picked" : ""}" data-card="${card.id}">
          <div class="sale-card-media">
            <img src="${card.photo}" alt="" loading="lazy" width="1200" height="900">
          </div>
          <div class="sale-card-body">
            <p class="sale-card-category">${card.category}</p>
            <h2 class="sale-card-title">${card.title}</h2>
            <div class="sale-card-price">
              <p class="sale-price-line sale-price-line--ask">
                <span class="sale-price-ask">${formatIdr(v.askIdr)}</span>
                <button type="button" class="price-info" data-price-info="${card.id}" aria-expanded="${open}" aria-label="${t("priceInfo")}">i</button>
              </p>
              ${pop}
            </div>
            <p class="sale-card-storage sale-chip-row">${chips}</p>
            <p class="sale-card-contact">
              <button type="button" class="sale-reserve-btn${picked ? " is-on" : ""}" aria-pressed="${picked}" data-reserve="${card.id}">
                ${picked ? t("inBag") : t("add")}
              </button>
            </p>
          </div>
        </li>`;
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
        .map(({ v }, i) => {
          const title = `${v.model} · ${v.color}`;
          const ask = cartPrices && cartPrices[i] ? cartPrices[i].askIdr : v.askIdr;
          return `<li data-line="${v.id}">
            <span class="sale-reserve-item-title">${title}<span class="sale-reserve-item-meta">${v.storage}</span></span>
            <span class="sale-reserve-item-price">${formatIdr(ask)}</span>
            <button type="button" class="sale-reserve-remove" data-remove="${v.id}" aria-label="remove">×</button>
          </li>`;
        })
        .join("") +
      `<li class="sale-reserve-total">
        <span class="sale-reserve-item-title">${t("total")}</span>
        <span class="sale-reserve-item-price">${formatIdr(selectedTotal())}</span>
      </li>`;
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
    const sel = state.selected.find((s) => s.id === id);
    if (!sel) return;
    const finish = function (animateClose) {
      state.selected = state.selected.filter((s) => s.id !== id);
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

  function toggleReserve(cardId, mediaEl) {
    const existing = state.selected.find((s) => s.cardId === cardId);
    if (existing) {
      state.selected = state.selected.filter((s) => s.cardId !== cardId);
    } else {
      if (state.selected.length >= MAX_ITEMS) {
        state.sheetOpen = true;
        renderSheet();
        return;
      }
      const storage = state.storageByCard[cardId] || "256";
      const v = variantFor(cardId, storage);
      state.selected.push({ id: v.id, cardId: cardId, storage: storage });
      fly(mediaEl);
    }
    saveSelected();
    renderGrid();
    renderBar();
    if (state.sheetOpen) renderSheet();
  }

  function fly(mediaEl) {
    if (!mediaEl || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const start = mediaEl.getBoundingClientRect();
    if (!start.width) return;
    const targetEl = document.getElementById("nav-bag") || document.querySelector(".sale-reserve-target");
    if (!targetEl) return;
    const target = targetEl.getBoundingClientRect();
    const img = mediaEl.querySelector("img");
    const node = document.createElement("div");
    node.className = "sale-add-flight";
    node.style.cssText = `width:${start.width}px;height:${start.height}px;left:${start.left}px;top:${start.top}px;transition:transform .7s ease-in,opacity .7s ease-in;transform-origin:center center;`;
    if (img) node.appendChild(img.cloneNode(true));
    document.body.appendChild(node);
    const dx = target.left - start.left - start.width / 2;
    const dy = target.top - start.top - start.height / 2;
    requestAnimationFrame(() => {
      node.style.transform = `translate(${dx}px, ${dy}px) scale(.14)`;
      node.style.opacity = "0";
    });
    setTimeout(() => node.remove(), 750);
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
          items: state.selected.map((s) => ({ cardId: s.cardId, storage: s.storage }))
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        state.payError = true;
        if (err) {
          err.textContent = res.status === 503 || data.code === "no_stripe" ? t("paySoon") : t("error");
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
    const filter = e.target.closest("[data-filter]");
    if (filter) {
      state.filter = filter.dataset.filter;
      document.querySelectorAll("[data-filter]").forEach((b) => b.classList.toggle("is-on", b === filter));
      renderGrid();
      return;
    }
    const storage = e.target.closest("[data-storage]");
    if (storage) {
      const cardId = storage.dataset.card;
      state.storageByCard[cardId] = storage.dataset.storage;
      const existing = state.selected.find((s) => s.cardId === cardId);
      if (existing) {
        const v = variantFor(cardId, storage.dataset.storage);
        existing.storage = storage.dataset.storage;
        existing.id = v.id;
        saveSelected();
      }
      renderGrid();
      renderBar();
      if (state.sheetOpen) renderSheet();
      return;
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
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    }
  }

  function onScroll() {
    const btn = document.getElementById("scroll-to-top");
    if (btn) btn.classList.toggle("is-visible", window.scrollY > 240);
  }

  function setNavCurrent() {
    document.querySelectorAll(".page-top-nav a").forEach((a) => {
      const href = a.getAttribute("href") || "";
      const current = href === "sale.html";
      a.classList.toggle("current", current);
      if (current) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  function setHref(id, href, text) {
    const el = document.getElementById(id);
    if (!el || !href) return;
    el.href = href;
    if (text) el.textContent = text;
  }

  async function init() {
    if (window.PIXEL_CATALOG_READY) state.catalog = await window.PIXEL_CATALOG_READY;
    else if (window.PIXEL_CATALOG) state.catalog = window.PIXEL_CATALOG;
    else {
      const res = await fetch("catalog.json");
      state.catalog = await res.json();
    }
    document.addEventListener("click", onPriceInfo, true);
    document.addEventListener("click", onClick);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", setNavCurrent);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (state.openPrice) {
          state.openPrice = null;
          syncPricePop(false);
        }
        if (state.sheetOpen) {
          closeSheet(true);
        }
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
    setNavCurrent();
    onScroll();
  }

  init();
})();
