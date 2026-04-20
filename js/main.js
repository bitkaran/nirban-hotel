/* ═══════════════════════════════════════════
   NIRBAN HOTEL — Advanced JS
   Fixed: Scroll jumping, added language translation logic, optimized performance
═══════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  /* ── CUSTOM CURSOR (Disabled on touch devices automatically via CSS) ── */
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  let mx = 0,
    my = 0,
    rx = 0,
    ry = 0;

  if (dot && ring && window.innerWidth > 900) {
    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
    });
    const lerpCursor = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(lerpCursor);
    };
    lerpCursor();

    document
      .querySelectorAll(
        "a, button, select, .feature-card, .menu-card, .branch-card",
      )
      .forEach((el) => {
        el.addEventListener("mouseenter", () => ring.classList.add("hovering"));
        el.addEventListener("mouseleave", () =>
          ring.classList.remove("hovering"),
        );
      });
  }

  /* ── PERFORMANCE OPTIMIZED SCROLL (RAF Throttling) ── */
  const progressBar = document.querySelector(".progress-bar");
  const nav = document.querySelector(".nav");
  let isScrolling = false;

  const handleScroll = () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        // Progress Bar
        if (progressBar) {
          const scrollTop = window.scrollY;
          const docHeight = document.body.scrollHeight - window.innerHeight;
          progressBar.style.width = (scrollTop / docHeight) * 100 + "%";
        }
        // Nav state
        if (nav) {
          nav.classList.toggle("scrolled", window.scrollY > 60);
        }
        isScrolling = false;
      });
      isScrolling = true;
    }
  };
  window.addEventListener("scroll", handleScroll, { passive: true });

  /* ── MENU FILTER ── */
  window.filterMenu = (cat) => {
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    event.currentTarget.classList.add("active");

    document.querySelectorAll(".menu-card").forEach((card, i) => {
      const show = cat === "all" || card.dataset.cat === cat;
      if (show) {
        card.style.display = "flex";
        // Minor timeout to allow display:flex to apply before opacity transition
        setTimeout(() => {
          card.classList.add("visible");
          card.style.animationDelay = (i % 6) * 0.06 + "s";
          card.style.animation = "none";
          requestAnimationFrame(() => {
            card.style.animation = "fadeUp 0.4s var(--ease-out) forwards";
          });
        }, 10);
      } else {
        card.classList.remove("visible");
        setTimeout(() => {
          if (!card.classList.contains("visible")) card.style.display = "none";
        }, 300);
      }
    });
  };

  /* ── SCROLL REVEAL ── */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  /* ── REVIEW CARD AUTO SCROLL (FIXED PAGE JUMP BUG) ── */
  const slider = document.querySelector(".reviews-slider");
  if (slider) {
    let isDown = false,
      startX,
      scrollLeft;
    slider.addEventListener("mousedown", (e) => {
      isDown = true;
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener("mouseleave", () => (isDown = false));
    slider.addEventListener("mouseup", () => (isDown = false));
    slider.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      slider.scrollLeft = scrollLeft - (x - startX) * 1.5;
    });

    // Advance securely inside the element without jumping the window
    let autoIdx = 0;
    const cards = slider.querySelectorAll(".review-card");
    setInterval(() => {
      if (isDown) return; // Don't auto-scroll if user is dragging
      autoIdx = (autoIdx + 1) % cards.length;
      const targetCard = cards[autoIdx];
      // Scroll the container locally
      slider.scrollTo({
        left: targetCard.offsetLeft - slider.offsetLeft,
        behavior: "smooth",
      });
    }, 4000);
  }

  /* ── NUMBER COUNT-UP ANIMATION ── */
  const countUps = document.querySelectorAll("[data-count]");
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const isDecimal = String(target).includes(".");
        const duration = 1600;
        const start = performance.now();
        const animate = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          const val = target * eased;
          el.textContent = isDecimal
            ? val.toFixed(1)
            : Math.round(val).toLocaleString();
          if (t < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        countObserver.unobserve(el);
      });
    },
    { threshold: 0.5 },
  );
  countUps.forEach((el) => countObserver.observe(el));

  /* ── LANGUAGE SWITCHER LOGIC ── */
  const langSelects = document.querySelectorAll(".lang-select");

  langSelects.forEach((select) => {
    select.addEventListener("change", (e) => {
      const selectedLang = e.target.value;
      // Sync all dropdowns
      langSelects.forEach((sel) => (sel.value = selectedLang));

      // Select all nodes containing our translation data attributes
      document.querySelectorAll("[data-hinglish]").forEach((el) => {
        if (el.dataset[selectedLang]) {
          el.innerHTML = el.dataset[selectedLang];
        }
      });
    });
  });

  /* ── MOBILE NAV ACTIVE STATE ── */
  const navItems = document.querySelectorAll(".mobile-bottom-nav .nav-item");
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navItems.forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");
    });
  });
});
