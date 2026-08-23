(function () {
  const STEPS = {
    en: [
      {
        n: "01",
        title: "pick the type you want",
        body: "model, color, storage. start on the sale page, then tell me the exact unit."
      },
      {
        n: "02",
        title: "contact me",
        body: "whatsapp is fastest. i confirm it against the next singapore trip."
      },
      {
        n: "03",
        title: "deal and pay",
        body: "rekening goes on whatsapp after you reserve. never on this page.",
        fork: [
          {
            label: "direct",
            text: "transfer to me. usd / eur wire, usdt usdc usdg, or idr."
          },
          {
            label: "tokopedia",
            text: "if you don't trust a direct transfer: we talk first, then i list it. +10% because i float the buy with my own money, plus tokopedia fees."
          }
        ]
      },
      {
        n: "04",
        title: "i go to singapore",
        body: "i work from singapore about twice a month. max 2 devices per visit."
      },
      {
        n: "05",
        title: "customs is in the price",
        body: "the ask already includes tax paid at customs, about 21% of the total."
      },
      {
        n: "06",
        title: "you receive it",
        fork: [
          {
            label: "jakarta",
            text: "cod in the jakarta area."
          },
          {
            label: "elsewhere",
            text: "jne or any logistics, plus an insurance fee."
          }
        ]
      }
    ],
    id: [
      {
        n: "01",
        title: "pilih tipe yang kamu mau",
        body: "model, warna, penyimpanan. mulai di halaman sale, lalu kabari unit yang persis."
      },
      {
        n: "02",
        title: "hubungi saya",
        body: "whatsapp paling cepat. saya cocokkan dengan trip singapura berikutnya."
      },
      {
        n: "03",
        title: "deal dan bayar",
        body: "rekening dikirim di whatsapp setelah reservasi. tidak pernah di halaman ini.",
        fork: [
          {
            label: "langsung",
            text: "transfer ke saya. usd / eur wire, usdt usdc usdg, atau idr."
          },
          {
            label: "tokopedia",
            text: "kalau belum percaya transfer langsung: chat dulu, baru saya listing. +10% karena saya belanja dulu pakai uang sendiri, plus biaya tokopedia."
          }
        ]
      },
      {
        n: "04",
        title: "saya ke singapura",
        body: "kerja dari singapura sekitar dua kali sebulan. maks 2 device per kunjungan."
      },
      {
        n: "05",
        title: "bea cukai sudah masuk harga",
        body: "harga sudah termasuk pajak ke bea cukai, sekitar 21% dari total."
      },
      {
        n: "06",
        title: "kamu terima",
        fork: [
          {
            label: "jakarta",
            text: "cod area jakarta."
          },
          {
            label: "luar kota",
            text: "jne atau ekspedisi lain, plus biaya asuransi."
          }
        ]
      }
    ]
  };

  function locale() {
    return localStorage.getItem("pixel11-locale") === "id" ? "id" : "en";
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function render(loc) {
    const host = document.getElementById("faq-flow");
    const notes = document.getElementById("faq-notes");
    if (notes) notes.innerHTML = "";
    if (!host) return;
    const lang = loc === "id" ? "id" : "en";
    host.innerHTML = STEPS[lang]
      .map((step) => {
        const fork = (step.fork || [])
          .map(
            (p) =>
              '<p class="faq-path"><span class="faq-path-label">' +
              esc(p.label) +
              "</span> " +
              esc(p.text) +
              "</p>"
          )
          .join("");
        const body = step.body
          ? '<p class="faq-body">' + esc(step.body) + "</p>"
          : "";
        return (
          '<li class="faq-step">' +
          '<span class="faq-n">' +
          esc(step.n) +
          "</span>" +
          "<div>" +
          '<p class="faq-title">' +
          esc(step.title) +
          "</p>" +
          body +
          (fork ? '<div class="faq-fork">' + fork + "</div>" : "") +
          "</div>" +
          "</li>"
        );
      })
      .join("");
  }

  window.PIXEL_FAQ = { render: render };

  function boot() {
    const host = document.getElementById("faq-flow");
    if (host && host.tagName !== "OL") {
      const ol = document.createElement("ol");
      ol.id = "faq-flow";
      ol.className = "faq-flow";
      host.replaceWith(ol);
    }
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
