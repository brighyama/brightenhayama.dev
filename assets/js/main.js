/* =========================================================
   Neuron / constellation background — drifting node network
   with lines between nearby nodes and connections to the cursor.
   No library. Renders once (static) under reduced-motion.
   ========================================================= */
(function () {
  const canvas = document.getElementById("neuro-bg");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const RGB = "74, 222, 128"; // accent green
  const LINK_DIST = 160;
  const MOUSE_DIST = 105;
  const NODE_SPEED = 0.14;

  let w = 0;
  let h = 0;
  let nodes = [];
  let raf = null;
  const mouse = { x: null, y: null };

  function initNodes() {
    const count = Math.round(Math.min(110, Math.max(36, (w * h) / 16000)));
    nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * NODE_SPEED,
        vy: (Math.random() - 0.5) * NODE_SPEED,
      });
    }
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initNodes();
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      if (!reduce) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x <= 0 || n.x >= w) n.vx *= -1;
        if (n.y <= 0 || n.y >= h) n.vy *= -1;
      }
    }

    // node-to-node links — batched into a few opacity buckets so we issue a
    // handful of stroke() calls per frame instead of one per line.
    const BUCKETS = 6;
    const paths = [];
    for (let b = 0; b < BUCKETS; b++) paths.push(new Path2D());
    const linkMax2 = LINK_DIST * LINK_DIST;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < linkMax2) {
          const t = 1 - Math.sqrt(d2) / LINK_DIST;
          let bi = (t * BUCKETS) | 0;
          if (bi >= BUCKETS) bi = BUCKETS - 1;
          paths[bi].moveTo(a.x, a.y);
          paths[bi].lineTo(b.x, b.y);
        }
      }
    }
    ctx.lineWidth = 1;
    for (let b = 0; b < BUCKETS; b++) {
      ctx.strokeStyle = "rgba(" + RGB + "," + ((b + 0.5) / BUCKETS) * 0.22 + ")";
      ctx.stroke(paths[b]);
    }

    // node-to-cursor links — all one opacity, so a single path + stroke.
    if (mouse.x !== null) {
      const mouseMax2 = MOUSE_DIST * MOUSE_DIST;
      const mpath = new Path2D();
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        const dx = a.x - mouse.x;
        const dy = a.y - mouse.y;
        if (dx * dx + dy * dy < mouseMax2) {
          mpath.moveTo(a.x, a.y);
          mpath.lineTo(mouse.x, mouse.y);
        }
      }
      ctx.strokeStyle = "rgba(" + RGB + ", 0.24)";
      ctx.stroke(mpath);
    }

    // nodes
    ctx.fillStyle = "rgba(202, 245, 216, 0.62)";
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.35, 0, Math.PI * 2);
      ctx.fill();
    }

    if (!reduce) raf = window.requestAnimationFrame(draw);
  }

  let resizeTimer = null;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      resize();
      if (reduce) draw();
    }, 150);
  });

  window.addEventListener(
    "mousemove",
    function (e) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (reduce && raf === null) {
        raf = window.requestAnimationFrame(function () {
          draw();
          raf = null;
        });
      }
    },
    { passive: true }
  );
  window.addEventListener("mouseout", function () {
    mouse.x = null;
    mouse.y = null;
    if (reduce) draw();
  });

  resize();
  draw();
})();

/* =========================================================
   Intro automatic transition
   ========================================================= */
(function () {
  const intro = document.querySelector(".intro");
  const content = document.querySelector(".intro-content");
  const about = document.querySelector(".about");
  if (!intro || !content || !about) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const delay = reduce ? 0 : 520;

  function measure() {
    const isSmall = window.innerWidth <= 600;
    const top = isSmall ? 24 : 32;
    const gap = isSmall ? 22 : 30;
    const scale = isSmall ? 0.74 : 0.64;
    const aboutMargin = parseFloat(window.getComputedStyle(about).marginTop) || 0;
    const finalHeight = top + content.offsetHeight * scale + gap - aboutMargin;
    const finalY = top - finalHeight / 2;

    return {
      height: Math.max(220, finalHeight),
      transform: "translateX(-50%) translateY(" + finalY + "px) scale(" + scale + ")",
    };
  }

  function applyFinal(animated) {
    const finalState = measure();

    if (!animated) {
      intro.style.transition = "none";
      content.style.transition = "none";
    }

    intro.style.minHeight = finalState.height + "px";
    content.style.transform = finalState.transform;

    if (!animated) {
      window.requestAnimationFrame(function () {
        intro.style.transition = "";
        content.style.transition = "";
      });
    }
  }

  window.setTimeout(function () {
    const startHeight = intro.offsetHeight;
    intro.style.minHeight = startHeight + "px";

    window.requestAnimationFrame(function () {
      applyFinal(!reduce);
    });
  }, delay);

  window.addEventListener("resize", function () {
    applyFinal(false);
  });
})();

/* =========================================================
   Courses filter
   ========================================================= */
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
      countEl.textContent = visible + (visible === 1 ? " course" : " courses");
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
