(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

  // ---------------------------------------------------------------
  // Header scroll state, scroll progress bar, hero parallax
  // (combined into one rAF-throttled scroll handler for performance)
  // ---------------------------------------------------------------
  const header = document.getElementById("siteHeader");
  const progressBar = document.querySelector(".scroll-progress > span");
  const heroPhoto = document.querySelector(".hero-photo");
  let scrollTicking = false;

  function onScrollFrame() {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 20);

    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) {
      const pct = docHeight > 0 ? (y / docHeight) * 100 : 0;
      progressBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    }

    if (heroPhoto && y < window.innerHeight && !prefersReducedMotion) {
      heroPhoto.style.transform = `translate3d(0, ${y * 0.15}px, 0)`;
    }

    scrollTicking = false;
  }

  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(onScrollFrame);
      scrollTicking = true;
    }
  });
  onScrollFrame();

  // Hero content fade-up on load
  const heroContent = document.querySelector(".hero-content");
  if (heroContent) {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => heroContent.classList.add("loaded"));
    });
  }

  // Scroll-reveal for sections
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in-view"));
  }

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

  function initCarousel(sectionEl) {
    const carousel = sectionEl.querySelector(".carousel");
    if (!carousel) return;

    const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
    const thumbs = Array.from(
      sectionEl.querySelectorAll(".gallery-strip img")
    );
    if (slides.length === 0) return;

    // Alternate pan direction per slide for a more organic Ken Burns feel
    slides.forEach((slide, i) => slide.classList.add(i % 2 === 0 ? "pan-a" : "pan-b"));

    // Build the Instagram-Stories-style segmented progress bar
    const progressEl = carousel.querySelector(".carousel-progress");
    const segments = slides.map(() => {
      const seg = document.createElement("div");
      seg.className = "carousel-progress-seg";
      const fill = document.createElement("span");
      seg.appendChild(fill);
      if (progressEl) progressEl.appendChild(seg);
      return fill;
    });

    const prevBtn = carousel.querySelector(".carousel-arrow-prev");
    const nextBtn = carousel.querySelector(".carousel-arrow-next");

    let current = 0;
    let timerId = null;

    function updateProgress() {
      segments.forEach((fill, i) => {
        fill.classList.remove("filling", "filled");
        fill.style.width = "";
        if (i < current) {
          fill.classList.add("filled");
        } else if (i === current) {
          // force reflow so the transition restarts from 0 every time
          // eslint-disable-next-line no-unused-expressions
          fill.offsetWidth;
          fill.classList.add("filling");
        }
      });
    }

    function goTo(index) {
      current = ((index % slides.length) + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("active", i === current));
      thumbs.forEach((thumb, i) => thumb.classList.toggle("active", i === current));
      updateProgress();
    }

    function next() {
      goTo(current + 1);
    }

    function prev() {
      goTo(current - 1);
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
      // freeze the active segment's fill exactly where it is
      const activeFill = segments[current];
      if (activeFill && activeFill.classList.contains("filling")) {
        const w = getComputedStyle(activeFill).width;
        activeFill.style.width = w;
        activeFill.classList.remove("filling");
      }
    }

    // Initial state
    goTo(0);

    if (prevBtn) prevBtn.addEventListener("click", () => { prev(); startAutoplay(); });
    if (nextBtn) nextBtn.addEventListener("click", () => { next(); startAutoplay(); });

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

  // Contact form -> Formspree (AJAX with mailto fallback)
  const form = document.getElementById("contactForm");
  const formStatus = document.getElementById("formStatus");

  function mailtoFallback() {
    const name = document.getElementById("cf-name").value;
    const email = document.getElementById("cf-email").value;
    const message = document.getElementById("cf-message").value;
    const subject = encodeURIComponent(`Contacto web — ${name}`);
    const body = encodeURIComponent(`${message}\n\n${email}`);
    window.location.href = `mailto:oriol@tarrida.org?subject=${subject}&body=${body}`;
  }

  function setStatus(key) {
    if (!formStatus) return;
    const dict = translations[currentLang];
    formStatus.textContent = dict[key] || "";
    formStatus.dataset.state = key.split(".").pop();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formIsConfigured = !form.action.includes("YOUR_FORM_ID");

    if (!formIsConfigured) {
      // Formspree not set up yet: fall back straight to the user's mail client
      mailtoFallback();
      return;
    }

    const submitBtn = form.querySelector(".submit-btn");
    submitBtn.disabled = true;
    setStatus("contact.form.sending");

    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        if (response.ok) {
          form.reset();
          setStatus("contact.form.success");
        } else {
          throw new Error("Formspree error");
        }
      })
      .catch(() => {
        setStatus("contact.form.error");
        mailtoFallback();
      })
      .finally(() => {
        submitBtn.disabled = false;
      });
  });

  // Footer year
  document.getElementById("year").textContent = new Date().getFullYear();
})();
