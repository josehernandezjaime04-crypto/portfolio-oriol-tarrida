(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const LANG_KEY = "oriol-portfolio-lang";
  const supported = ["ca", "es", "en"];
  let currentLang = localStorage.getItem(LANG_KEY);
  if (!supported.includes(currentLang)) currentLang = "es";

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
        // Single wrapper div so the CSS grid 0fr/1fr collapse animates one
        // row (the whole block), not one row per paragraph.
        el.innerHTML = `<div>${value.map((p) => `<p>${p}</p>`).join("")}</div>`;
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

    const footerTags = document.getElementById("footerTags");
    if (footerTags && dict["hero.roles"]) {
      footerTags.innerHTML = dict["hero.roles"]
        .split("·")
        .map((role) => `<span class="footer-tag">${role.trim()}</span>`)
        .join("");
    }

    const filmCount = document.getElementById("filmCount");
    if (filmCount && dict["filmography.countLabel"]) {
      const n = document.querySelectorAll(".film-card").length;
      filmCount.innerHTML = `<strong>${n}</strong> ${dict["filmography.countLabel"]}`;
    }
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

  // Subtle 3D tilt on category photos, following the cursor (desktop only)
  if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".category-media").forEach((media) => {
      const MAX_TILT = 5;
      media.addEventListener("mousemove", (e) => {
        const rect = media.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        media.style.transform = `perspective(1400px) rotateX(${(-py * MAX_TILT).toFixed(2)}deg) rotateY(${(px * MAX_TILT).toFixed(2)}deg)`;
      });
      media.addEventListener("mouseleave", () => {
        media.style.transform = "perspective(1400px) rotateX(0deg) rotateY(0deg)";
      });
    });
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

  // ---------------------------------------------------------------
  // Showreel: tab-filtered coverflow video carousel
  // ---------------------------------------------------------------
  const videoLibrary = {
    coordinador: [
      { src: "assets/videos/coordinador/coordinador-1.mp4", poster: "assets/videos/posters/coordinador/coordinador-1.jpg" },
      { src: "assets/videos/coordinador/coordinador-2.mp4", poster: "assets/videos/posters/coordinador/coordinador-2.jpg" },
      { src: "assets/videos/coordinador/coordinador-3.mp4", poster: "assets/videos/posters/coordinador/coordinador-3.jpg" },
      { src: "assets/videos/coordinador/coordinador-4.mp4", poster: "assets/videos/posters/coordinador/coordinador-4.jpg" },
      { src: "assets/videos/coordinador/coordinador-5.mp4", poster: "assets/videos/posters/coordinador/coordinador-5.jpg" },
      { src: "assets/videos/coordinador/coordinador-6.mp4", poster: "assets/videos/posters/coordinador/coordinador-6.jpg" },
      { src: "assets/videos/coordinador/coordinador-7.mp4", poster: "assets/videos/posters/coordinador/coordinador-7.jpg" },
      { src: "assets/videos/coordinador/coordinador-8.mp4", poster: "assets/videos/posters/coordinador/coordinador-8.jpg" },
      { src: "assets/videos/coordinador/coordinador-9.mp4", poster: "assets/videos/posters/coordinador/coordinador-9.jpg" },
      { src: "assets/videos/coordinador/coordinador-10.mp4", poster: "assets/videos/posters/coordinador/coordinador-10.jpg" },
      { src: "assets/videos/coordinador/coordinador-11.mp4", poster: "assets/videos/posters/coordinador/coordinador-11.jpg" },
      { src: "assets/videos/coordinador/coordinador-12.mp4", poster: "assets/videos/posters/coordinador/coordinador-12.jpg" },
      { src: "assets/videos/coordinador/coordinador-13.mp4", poster: "assets/videos/posters/coordinador/coordinador-13.jpg" },
      { src: "assets/videos/coordinador/coordinador-14.mp4", poster: "assets/videos/posters/coordinador/coordinador-14.jpg" },
      { src: "assets/videos/coordinador/coordinador-15.mp4", poster: "assets/videos/posters/coordinador/coordinador-15.jpg" },
      { src: "assets/videos/coordinador/coordinador-16.mp4", poster: "assets/videos/posters/coordinador/coordinador-16.jpg" },
      { src: "assets/videos/coordinador/coordinador-17.mp4", poster: "assets/videos/posters/coordinador/coordinador-17.jpg" },
    ],
    driver: [
      { src: "assets/videos/driver/driver-1.mp4", poster: "assets/videos/posters/driver/driver-1.jpg" },
      { src: "assets/videos/driver/driver-2.mp4", poster: "assets/videos/posters/driver/driver-2.jpg" },
      { src: "assets/videos/driver/driver-3.mp4", poster: "assets/videos/posters/driver/driver-3.jpg" },
      { src: "assets/videos/driver/driver-4.mp4", poster: "assets/videos/posters/driver/driver-4.jpg" },
      { src: "assets/videos/driver/driver-5.mp4", poster: "assets/videos/posters/driver/driver-5.jpg" },
      { src: "assets/videos/driver/driver-6.mp4", poster: "assets/videos/posters/driver/driver-6.jpg" },
      { src: "assets/videos/driver/driver-7.mp4", poster: "assets/videos/posters/driver/driver-7.jpg" },
    ],
    performer: [
      { src: "assets/videos/performer/performer-1.mp4", poster: "assets/videos/posters/performer/performer-1.jpg" },
      { src: "assets/videos/performer/performer-2.mp4", poster: "assets/videos/posters/performer/performer-2.jpg" },
    ],
    armero: [
      { src: "assets/videos/armero/armero-1.mp4", poster: "assets/videos/posters/armero/armero-1.jpg" },
      { src: "assets/videos/armero/armero-2.mp4", poster: "assets/videos/posters/armero/armero-2.jpg" },
      { src: "assets/videos/armero/armero-3.mp4", poster: "assets/videos/posters/armero/armero-3.jpg" },
      { src: "assets/videos/armero/armero-4.mp4", poster: "assets/videos/posters/armero/armero-4.jpg" },
      { src: "assets/videos/armero/armero-5.mp4", poster: "assets/videos/posters/armero/armero-5.jpg" },
      { src: "assets/videos/armero/armero-6.mp4", poster: "assets/videos/posters/armero/armero-6.jpg" },
      { src: "assets/videos/armero/armero-7.mp4", poster: "assets/videos/posters/armero/armero-7.jpg" },
      { src: "assets/videos/armero/armero-8.mp4", poster: "assets/videos/posters/armero/armero-8.jpg" },
      { src: "assets/videos/armero/armero-9.mp4", poster: "assets/videos/posters/armero/armero-9.jpg" },
    ],
  };

  function initShowreel() {
    const track = document.getElementById("showreelTrack");
    if (!track) return;

    const tabs = document.querySelectorAll(".showreel-tab");
    const prevBtn = document.querySelector(".showreel-nav-prev");
    const nextBtn = document.querySelector(".showreel-nav-next");
    const counterEl = document.getElementById("showreelCounter");

    let currentCat = tabs[0] ? tabs[0].dataset.videoCat : "coordinador";
    let currentIndex = 0;
    let entries = []; // { el, video } — kept alive across goTo() so CSS transitions can animate

    // Positive offset = queued up next, waiting on the right.
    // Negative offset = already played, parked on the left.
    function computeOffset(i) {
      const total = entries.length;
      let offset = i - currentIndex;
      const half = Math.floor(total / 2);
      if (offset > half) offset -= total;
      if (offset < -half) offset += total;
      return offset;
    }

    function applyState() {
      entries.forEach((entry, i) => {
        const offset = computeOffset(i);
        entry.el.className =
          "showreel-item " +
          (offset === 0 ? "is-center" : Math.abs(offset) === 1 ? "is-near" : "is-far");
        entry.el.style.setProperty("--offset", offset);

        if (offset === 0) {
          entry.video.muted = true;
          entry.video.controls = true;
          entry.video.currentTime = 0;
          const p = entry.video.play();
          if (p && p.catch) p.catch(() => {});
        } else {
          entry.video.pause();
          entry.video.muted = true;
          entry.video.controls = false;
        }
      });

      if (counterEl) {
        counterEl.innerHTML =
          entries.length > 1
            ? `<strong>${currentIndex + 1}</strong> / ${entries.length}`
            : "";
      }
    }

    function goTo(index) {
      const total = entries.length;
      if (total === 0) return;
      currentIndex = ((index % total) + total) % total;
      applyState();
    }

    function build() {
      track.innerHTML = "";
      entries = [];
      currentIndex = 0;
      const videos = videoLibrary[currentCat] || [];

      if (videos.length === 0) {
        const empty = document.createElement("div");
        empty.className = "showreel-empty";
        empty.innerHTML =
          '<span class="showreel-play" aria-hidden="true"></span><p data-i18n="showreel.soon"></p>';
        empty.querySelector("p").textContent =
          translations[currentLang]["showreel.soon"];
        track.appendChild(empty);
        if (counterEl) counterEl.innerHTML = "";
        return;
      }

      videos.forEach((video, i) => {
        const item = document.createElement("div");
        item.className = "showreel-item";

        const vid = document.createElement("video");
        vid.src = video.src;
        if (video.poster) vid.poster = video.poster;
        vid.playsInline = true;
        vid.muted = true;
        vid.preload = "metadata";
        vid.addEventListener("ended", () => {
          if (computeOffset(i) === 0) goTo(currentIndex + 1);
        });
        item.appendChild(vid);

        item.addEventListener("click", () => {
          if (computeOffset(i) !== 0) goTo(i);
        });

        track.appendChild(item);
        entries.push({ el: item, video: vid });
      });

      applyState();
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        if (tab.dataset.videoCat === currentCat) return;
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        currentCat = tab.dataset.videoCat;
        build();
      });
    });

    if (prevBtn) prevBtn.addEventListener("click", () => goTo(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => goTo(currentIndex + 1));

    build();
  }

  initShowreel();

  // Film cards: zoom in a bit more after hovering for 2s straight
  document.querySelectorAll(".film-card").forEach((card) => {
    let hoverTimer = null;
    card.addEventListener("mouseenter", () => {
      hoverTimer = window.setTimeout(() => card.classList.add("is-focused"), 2000);
    });
    card.addEventListener("mouseleave", () => {
      window.clearTimeout(hoverTimer);
      card.classList.remove("is-focused");
    });
  });

  // Footer year
  document.getElementById("year").textContent = new Date().getFullYear();
})();
