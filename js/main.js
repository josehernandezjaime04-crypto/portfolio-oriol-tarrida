(function () {
  const LANG_KEY = "oriol-portfolio-lang";
  const supported = ["ca", "es", "en"];
  let currentLang = localStorage.getItem(LANG_KEY);
  if (!supported.includes(currentLang)) currentLang = "ca";

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.setAttribute("lang", lang);

    const dict = translations[lang];

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const value = dict[key];
      if (value === undefined) return;

      if (Array.isArray(value)) {
        el.innerHTML = value.map((p) => `<p>${p}</p>`).join("");
      } else if (el.classList.contains("more-btn")) {
        const isOpen = el.closest(".category-text").classList.contains("open");
        el.textContent = isOpen ? dict["common.less"] : dict["common.more"];
      } else {
        el.textContent = value;
      }
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      if (dict[key]) el.setAttribute("aria-label", dict[key]);
    });

    document.querySelectorAll(".lang-switch button").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
    });
  }

  document.querySelectorAll(".lang-switch button").forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.getAttribute("data-lang")));
  });

  applyLang(currentLang);

  // Header scroll state
  const header = document.getElementById("siteHeader");
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 20);
  });

  // Mobile nav
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
  mainNav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      mainNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    })
  );

  // "Saber más" toggles
  document.querySelectorAll(".more-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const textBlock = btn.closest(".category-text");
      const isOpen = textBlock.classList.toggle("open");
      const dict = translations[currentLang];
      btn.textContent = isOpen ? dict["common.less"] : dict["common.more"];
    });
  });

  // Lightbox (shared by static images, gallery strips and carousels)
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.classList.add("open");
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightboxImg.src = "";
  }
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  // ---------------------------------------------------------------
  // Auto-advancing carousels (coordinador / armero sections)
  // ---------------------------------------------------------------
  const AUTOPLAY_DELAY = 4000;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initCarousel(sectionEl) {
    const carousel = sectionEl.querySelector(".carousel");
    if (!carousel) return;

    const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
    const thumbs = Array.from(
      sectionEl.querySelectorAll(".gallery-strip img")
    );
    if (slides.length === 0) return;

    let current = 0;
    let timerId = null;

    function goTo(index) {
      current = ((index % slides.length) + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("active", i === current));
      thumbs.forEach((thumb, i) => thumb.classList.toggle("active", i === current));
    }

    function next() {
      goTo(current + 1);
    }

    function startAutoplay() {
      if (prefersReducedMotion) return;
      stopAutoplay();
      timerId = window.setInterval(next, AUTOPLAY_DELAY);
    }

    function stopAutoplay() {
      if (timerId !== null) {
        window.clearInterval(timerId);
        timerId = null;
      }
    }

    // Initial state
    goTo(0);

    // Clicking the large slide opens the lightbox for a bigger view
    slides.forEach((slide) => {
      slide.addEventListener("click", () => openLightbox(slide.src, slide.alt));
    });

    // Clicking (or activating via keyboard) a thumbnail jumps the carousel
    // to that slide and opens the lightbox
    thumbs.forEach((thumb, i) => {
      const activate = () => {
        goTo(i);
        openLightbox(thumb.src, thumb.alt || slides[i].alt);
      };
      thumb.addEventListener("click", activate);
      thumb.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      });
    });

    // Pause on hover and on keyboard focus within the carousel/thumbnails
    const interactiveTargets = [carousel, ...thumbs];
    interactiveTargets.forEach((el) => {
      el.addEventListener("mouseenter", stopAutoplay);
      el.addEventListener("mouseleave", startAutoplay);
      el.addEventListener("focusin", stopAutoplay);
      el.addEventListener("focusout", startAutoplay);
    });

    startAutoplay();
  }

  document.querySelectorAll("[data-carousel]").forEach((carouselEl) => {
    initCarousel(carouselEl.closest(".category"));
  });

  // Contact form -> mailto
  const form = document.getElementById("contactForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("cf-name").value;
    const email = document.getElementById("cf-email").value;
    const message = document.getElementById("cf-message").value;
    const subject = encodeURIComponent(`Contacto web — ${name}`);
    const body = encodeURIComponent(`${message}\n\n${email}`);
    window.location.href = `mailto:oriol@tarrida.org?subject=${subject}&body=${body}`;
  });

  // Footer year
  document.getElementById("year").textContent = new Date().getFullYear();
})();
