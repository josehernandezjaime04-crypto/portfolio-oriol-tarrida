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

  // Lightbox for gallery strips
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxClose = document.getElementById("lightboxClose");

  document.querySelectorAll(".gallery-strip img").forEach((img) => {
    img.addEventListener("click", () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add("open");
    });
  });

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
