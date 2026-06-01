/* =========================
   Theme picker
   ========================= */
(function () {
  const swatches = document.querySelectorAll(".theme-swatch");
  if (!swatches.length) return;

  const RANDOM_VARS = [
    "--shell-grad", "--shell-glow", "--shell-accent",
    "--aurora-1", "--aurora-2", "--aurora-3", "--aurora-4"
  ];

  function setActive(theme) {
    swatches.forEach((b) => {
      const on = b.dataset.theme === theme;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-checked", on ? "true" : "false");
    });
  }

  function clearRandomInline() {
    const r = document.documentElement;
    RANDOM_VARS.forEach((p) => r.style.removeProperty(p));
  }

  function applyRandom({ h1, h2 }) {
    const r = document.documentElement;
    const h3 = (h1 + 30) % 360;
    r.setAttribute("data-theme", "random");
    r.style.setProperty("--shell-grad",
      `linear-gradient(135deg, hsla(${h1}, 80%, 55%, 0.55) 0%, hsla(${h2}, 75%, 60%, 0.40) 50%, rgba(255,255,255,0.08) 100%)`);
    r.style.setProperty("--shell-glow", `hsla(${h1}, 80%, 55%, 0.28)`);
    r.style.setProperty("--shell-accent", `hsla(${h2}, 75%, 60%, 0.70)`);
    r.style.setProperty("--aurora-1", `hsla(${h1}, 70%, 55%, 0.32)`);
    r.style.setProperty("--aurora-2", `hsla(${h2}, 70%, 60%, 0.26)`);
    r.style.setProperty("--aurora-3", `hsla(${h3}, 65%, 55%, 0.24)`);
    r.style.setProperty("--aurora-4", `hsla(${h2}, 60%, 50%, 0.20)`);
  }

  function rollRandomHues() {
    const h1 = Math.floor(Math.random() * 360);
    // keep at least 60° between hues so the two colors look distinct
    const h2 = (h1 + 60 + Math.floor(Math.random() * 240)) % 360;
    return { h1, h2 };
  }

  const current = document.documentElement.getAttribute("data-theme") || "ocean";
  setActive(current);

  swatches.forEach((btn) => {
    btn.addEventListener("click", () => {
      const theme = btn.dataset.theme;
      if (!theme) return;

      if (theme === "random") {
        const hues = rollRandomHues();
        applyRandom(hues);
        try {
          localStorage.setItem("site-theme", "random");
          localStorage.setItem("site-theme-random-colors", JSON.stringify(hues));
        } catch (e) {}
      } else {
        clearRandomInline();
        document.documentElement.setAttribute("data-theme", theme);
        try { localStorage.setItem("site-theme", theme); } catch (e) {}
      }

      setActive(theme);
    });
  });
})();

/* =========================
   Project modal
   ========================= */
(function () {
  const modal = document.getElementById("project-modal");
  if (!modal) return;

  const titleEl = document.getElementById("project-modal-title");
  const descEl = document.getElementById("project-modal-description");
  const imgEl = document.getElementById("project-modal-image");
  const linkEl = document.getElementById("project-modal-link");
  let lastFocused = null;

  function openModal(card) {
    titleEl.textContent = card.dataset.title || "";
    descEl.textContent = card.dataset.description || "";
    const url = card.dataset.url || "#";
    linkEl.href = url;
    linkEl.style.display = url && url !== "#" ? "inline-block" : "none";
    const img = card.dataset.image;
    if (img) {
      imgEl.src = img;
      imgEl.alt = card.dataset.title || "";
      imgEl.parentElement.style.display = "";
    } else {
      imgEl.parentElement.style.display = "none";
    }

    lastFocused = document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    modal.querySelector(".project-modal-close").focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll(".project-shell").forEach((card) => {
    card.addEventListener("click", () => openModal(card));
  });

  modal.querySelectorAll("[data-close-modal]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
})();

/* =========================
   Courses filter
   ========================= */
(function () {
  const filterBar = document.getElementById("course-filters");
  const list = document.getElementById("course-list");
  if (!filterBar || !list) return;

  const buttons = filterBar.querySelectorAll(".filter-btn");
  const cards = list.querySelectorAll(".course-card");
  const countEl = document.getElementById("course-count");
  const emptyEl = document.getElementById("course-empty");

  function apply(filter) {
    let visible = 0;
    cards.forEach((card) => {
      const tags = (card.dataset.tags || "").split(/\s+/);
      const show = filter === "all" || tags.indexOf(filter) !== -1;
      card.hidden = !show;
      if (show) visible++;
    });

    if (countEl) {
      countEl.textContent =
        visible + (visible === 1 ? " course" : " courses");
    }
    if (emptyEl) emptyEl.hidden = visible !== 0;
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => {
        const on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
      apply(btn.dataset.filter || "all");
    });
  });

  apply("all");
})();
