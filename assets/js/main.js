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
    linkEl.innerHTML = (card.dataset.cta || "Visit project") + " &nbsp;&rarr;";
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
