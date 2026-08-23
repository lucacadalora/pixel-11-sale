(function () {
  const CFG = window.PIXEL_CONFIG;
  const STORAGE_KEY = "pixel11-reserve";
  const CONTACT_KEY = "pixel11-reserve-contact";

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
      reserve: "reserve",
      reserved: "reserved",
      continue: "continue",
      drawerTitle: "reserve pickup",
      name: "name",
      whatsapp: "whatsapp / phone",
      city: "city",
      note: "note",
      pickupDate: "pickup date",
      pickupWindow: "window",
      anytime: "anytime",
      morning: "morning",
      afternoon: "afternoon",
      evening: "evening",
      cancel: "cancel",
      submit: "send request",
      submitting: "sending…",
      success: "noted – i'll whatsapp you to confirm.",
      error: "didn't go through. try again?",
      total: "total",
      itemAdded: "{n} item added",
      itemsAdded: "{n} items added",
      howTitle: "how this works",
      howBody: [
        "ask is built from official google store singapore, not ishopchangi. 256 gb list: pixel 11 s$1,299, pro s$1,599, pro xl s$1,819, fold s$2,499. higher storage is +s$200 a step.",
        "for 1 phone: official minus 9% gst, minus usd 500 pib, times 1.21 import (ppn 11% + bm 10%), plus rp 5.000.000 markup. my take is the gst refund plus that markup.",
        "two phones on one trip share the usd 500 exemption — ping me and i'll recompute.",
        "reserve a color and storage, pick a window, send the request. i'll ping you on whatsapp."
      ],
      contactTitle: "contact",
      contactBody: "whatsapp is fastest. email if you want a paper trail.",
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
      reserve: "reserve",
      reserved: "reserved",
      continue: "continue",
      drawerTitle: "reservasi ambil",
      name: "nama",
      whatsapp: "whatsapp / telepon",
      city: "kota",
      note: "catatan",
      pickupDate: "tanggal ambil",
      pickupWindow: "jendela",
      anytime: "kapan saja",
      morning: "pagi",
      afternoon: "siang",
      evening: "malam",
      cancel: "batal",
      submit: "send request",
      submitting: "mengirim…",
      success: "tercatat – saya whatsapp untuk konfirmasi.",
      error: "tidak terkirim. coba lagi?",
      total: "total",
      itemAdded: "{n} item ditambah",
      itemsAdded: "{n} item ditambah",
      howTitle: "cara kerjanya",
      howBody: [
        "ask dari harga resmi google store singapura, bukan ishopchangi. 256 gb: pixel 11 s$1.299, pro s$1.599, pro xl s$1.819, fold s$2.499. storage lebih besar +s$200.",
        "untuk 1 hp: resmi minus gst 9%, minus pib usd 500, kali 1,21 bea (ppn 11% + bm 10%), plus markup rp 5.000.000. untung saya = refund gst + markup itu.",
        "dua hp dalam satu trip berbagi pib usd 500 — chat, saya hitung ulang.",
        "reservasi warna dan penyimpanan, pilih jendela, kirim. saya balas di whatsapp."
      ],
      contactTitle: "kontak",
      contactBody: "whatsapp paling cepat. email kalau perlu jejak tertulis.",
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
    form: loadContact(),
    openPrice: null
  };

  function loadSelected() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(raw) ? raw : [];
    } catch {
      return [];
    }
  }

  function saveSelected() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.selected));
  }

  function loadContact() {
    try {
      const raw = JSON.parse(localStorage.getItem(CONTACT_KEY) || "{}");
      return {
        name: raw.name || "",
        whatsapp: raw.whatsapp || "",
        city: raw.city || CFG.cityDefault,
        note: raw.note || "",
        date: "2026-08-23",
        window: "anytime"
      };
    } catch {
      return { name: "", whatsapp: "", city: CFG.cityDefault, note: "", date: "2026-08-23", window: "anytime" };
    }
  }

  function saveContact() {
    localStorage.setItem(
      CONTACT_KEY,
      JSON.stringify({
        name: state.form.name,
        whatsapp: state.form.whatsapp,
        city: state.form.city,
        note: state.form.note
      })
    );
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
    return selectedEntries().reduce((sum, { v }) => sum + v.askIdr, 0);
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
        if (open && window.PIXEL_PRICE && window.PIXEL_PRICE.breakdownRows) {
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
              <p class="sale-price-line">
                <span class="sale-price-k">${t("officialLabel")}</span>
                <span class="sale-price-estimate">${formatIdr(v.estimateIdr)}</span>
              </p>
              <p class="sale-price-line sale-price-line--ask">
                <span class="sale-price-k">${t("askLabel")}</span>
                <span class="sale-price-ask">${formatIdr(v.askIdr)}</span>
                <button type="button" class="price-info" data-price-info="${card.id}" aria-expanded="${open}" aria-label="${t("priceInfo")}">i</button>
              </p>
              <span class="sale-price-note">S$${v.officialSgd}</span>
              ${pop}
            </div>
            <p class="sale-card-storage sale-chip-row">${chips}</p>
            <p class="sale-card-contact">
              <button type="button" class="sale-reserve-btn${picked ? " is-on" : ""}" aria-pressed="${picked}" data-reserve="${card.id}">
                ${picked ? t("reserved") : t("reserve")}
              </button>
            </p>
          </div>
        </li>`;
      })
      .join("");
  }

  function renderBar() {
    const bar = document.getElementById("sale-reserve-bar");
    const confirm = document.getElementById("sale-reserve-confirm");
    const sale = document.querySelector(".sale");
    const n = state.selected.length;
    if (state.success) {
      bar.hidden = true;
      confirm.hidden = false;
      sale.classList.add("has-reserve-bar");
      return;
    }
    confirm.hidden = true;
    if (n === 0) {
      bar.hidden = true;
      sale.classList.remove("has-reserve-bar");
      return;
    }
    bar.hidden = false;
    sale.classList.add("has-reserve-bar");
    const label = (n === 1 ? t("itemAdded") : t("itemsAdded")).replace("{n}", String(n));
    document.getElementById("reserve-count").textContent = label;
    document.getElementById("reserve-total").textContent = formatIdr(selectedTotal());
  }

  function dateChip(iso) {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d, 12));
    const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "UTC" })
      .format(dt)
      .toUpperCase();
    const on = state.form.date === iso ? " is-on" : "";
    return `<button type="button" class="sale-chip sale-chip--date${on}" data-date="${iso}" aria-label="${weekday.toLowerCase()} ${d}">
      <span class="sale-chip-weekday">${weekday}</span>
      <span class="sale-chip-day">${d}</span>
    </button>`;
  }

  function renderSheet() {
    const layer = document.getElementById("sale-reserve-layer");
    if (!layer) return;
    layer.hidden = !state.sheetOpen || state.selected.length === 0;
    document.body.classList.toggle("sheet-open", !layer.hidden);
    if (layer.hidden) return;
    const items = selectedEntries();
    const list = document.getElementById("sale-reserve-items");
    list.innerHTML =
      items
        .map(({ v }) => {
          const title = `${v.model} · ${v.color} · ${v.storage}`;
          return `<li>
            <span class="sale-reserve-item-title">${title}</span>
            <span class="sale-reserve-item-price">${formatIdr(v.askIdr)}</span>
            <button type="button" class="sale-reserve-remove" data-remove="${v.id}" aria-label="remove">×</button>
          </li>`;
        })
        .join("") +
      `<li class="sale-reserve-total">
        <span class="sale-reserve-item-title">${t("total")}</span>
        <span class="sale-reserve-item-price">${formatIdr(selectedTotal())}</span>
      </li>`;
    document.getElementById("chip-dates").innerHTML = state.catalog.pickup.dates.map(dateChip).join("");
    const hours = { anytime: "", morning: "09–12", afternoon: "13–17", evening: "18–21" };
    document.getElementById("chip-windows").innerHTML = state.catalog.pickup.windows
      .map((w) => {
        const on = state.form.window === w.id ? " is-on" : "";
        const h = hours[w.id] ? `<span class="sale-chip--hours">${hours[w.id]}</span>` : "";
        return `<button type="button" class="sale-chip${on}" data-window="${w.id}">${t(w.id)}${h}</button>`;
      })
      .join("");
    document.getElementById("field-name").value = state.form.name;
    document.getElementById("field-whatsapp").value = state.form.whatsapp;
    document.getElementById("field-city").value = state.form.city;
    document.getElementById("field-note").value = state.form.note;
    document.getElementById("sale-reserve-error").hidden = true;
  }

  function toggleReserve(cardId, mediaEl) {
    const existing = state.selected.find((s) => s.cardId === cardId);
    if (existing) {
      state.selected = state.selected.filter((s) => s.cardId !== cardId);
    } else {
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
    const target = document.querySelector(".sale-reserve-target").getBoundingClientRect();
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

  function buildWaMessage() {
    const lines = [];
    lines.push("Pixel 11 reserve");
    lines.push(`name: ${state.form.name}`);
    lines.push(`whatsapp: ${state.form.whatsapp}`);
    lines.push(`city: ${state.form.city}`);
    lines.push(`pickup: ${state.form.date} / ${state.form.window}`);
    if (state.form.note) lines.push(`note: ${state.form.note}`);
    lines.push("");
    selectedEntries().forEach(({ v }) => {
      lines.push(`- ${v.model} ${v.color} ${v.storage} · ${formatIdr(v.askIdr)} (official S$${v.officialSgd})`);
    });
    lines.push("");
    lines.push(`total: ${formatIdr(selectedTotal())}`);
    return lines.join("\n");
  }

  function submitReserve(ev) {
    ev.preventDefault();
    if (!state.form.name.trim() || !state.form.whatsapp.trim()) return;
    saveContact();
    const url =
      "https://wa.me/" +
      CFG.whatsappE164 +
      "?text=" +
      encodeURIComponent(buildWaMessage());
    window.open(url, "_blank", "noopener");
    state.sheetOpen = false;
    state.success = true;
    state.selected = [];
    saveSelected();
    renderGrid();
    renderBar();
    renderSheet();
    setTimeout(() => {
      state.success = false;
      renderBar();
    }, 4200);
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
    const info = e.target.closest("[data-price-info]");
    if (info) {
      e.preventDefault();
      e.stopPropagation();
      const id = info.getAttribute("data-price-info");
      state.openPrice = state.openPrice === id ? null : id;
      renderGrid();
      return;
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
    const open = e.target.closest("[data-open-sheet]");
    if (open) {
      state.sheetOpen = true;
      renderSheet();
      return;
    }
    const close = e.target.closest("[data-close-sheet]");
    if (close) {
      state.sheetOpen = false;
      renderSheet();
      return;
    }
    const remove = e.target.closest("[data-remove]");
    if (remove) {
      state.selected = state.selected.filter((s) => s.id !== remove.dataset.remove);
      saveSelected();
      if (!state.selected.length) state.sheetOpen = false;
      renderGrid();
      renderBar();
      renderSheet();
      return;
    }
    const date = e.target.closest("[data-date]");
    if (date) {
      state.form.date = date.dataset.date;
      renderSheet();
      return;
    }
    const win = e.target.closest("[data-window]");
    if (win) {
      state.form.window = win.dataset.window;
      renderSheet();
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

  function onInput(e) {
    const map = {
      "field-name": "name",
      "field-whatsapp": "whatsapp",
      "field-city": "city",
      "field-note": "note"
    };
    const key = map[e.target.id];
    if (!key) return;
    state.form[key] = e.target.value;
    saveContact();
  }

  function onScroll() {
    const btn = document.getElementById("scroll-to-top");
    btn.classList.toggle("is-visible", window.scrollY > 240);
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

  async function init() {
    if (window.PIXEL_CATALOG_READY) state.catalog = await window.PIXEL_CATALOG_READY;
    else if (window.PIXEL_CATALOG) state.catalog = window.PIXEL_CATALOG;
    else {
      const res = await fetch("catalog.json");
      state.catalog = await res.json();
    }
    document.addEventListener("click", onClick);
    document.addEventListener("input", onInput);
    document.getElementById("sale-reserve-form").addEventListener("submit", submitReserve);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", setNavCurrent);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && state.sheetOpen) {
        state.sheetOpen = false;
        renderSheet();
      }
    });
    document.getElementById("wa-link").href = "https://wa.me/" + CFG.whatsappE164;
    document.getElementById("wa-link").textContent = CFG.whatsappDisplay;
    document.getElementById("mail-link").href = "mailto:" + CFG.email;
    document.getElementById("mail-link").textContent = CFG.email;
    document.getElementById("footer-wa").href = "https://wa.me/" + CFG.whatsappE164;
    document.getElementById("footer-mail").href = "mailto:" + CFG.email;
    applyLocale();
    setNavCurrent();
    onScroll();
  }

  init();
})();
