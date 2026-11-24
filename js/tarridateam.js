(function () {
  "use strict";
  // Las solicitudes van al servidor privado de creationsFX (VM creations-fx, Tailscale Funnel).
  const API = (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && new URLSearchParams(location.search).get("api"))
    || "https://creations-fx.tail077ef1.ts.net";
  const LANG_KEY = "oriol-portfolio-lang";
  const MAX_FOTOS = 8;
  const t0 = Date.now();

  const T = {
    es: {
      eyebrow: "Equipo de especialistas",
      intro: "¿Eres especialista de acción? Rellena este formulario con tus datos, tus habilidades y algunas fotos. Revisaremos tu perfil y te contactaremos cuando encaje en un proyecto.",
      "s.personal": "Información personal", "s.especialista": "Especialista", "s.apariencia": "Apariencia y medidas", "s.material": "Fotos y vídeo",
      "f.nombre": "Nombre", "f.apellidos": "Apellidos", "f.genero": "Género", "f.nacimiento": "Fecha de nacimiento", "f.email": "Email", "f.telefono": "Teléfono",
      "g.f": "Femenino", "g.m": "Masculino",
      "f.acting": "Tengo experiencia en interpretación (acting)", "f.tatuajes": "Tengo tatuajes visibles",
      "f.skills": "Skills", "f.idiomas": "Idiomas", "f.permisos": "Permisos de conducir",
      "f.notas": "Cuéntanos tu experiencia (rodajes, formación, especialidades)",
      "f.ojos": "Color de ojos", "f.pelo": "Color de pelo", "f.talla": "Talla de camisa", "f.altura": "Altura (cm)", "f.peso": "Peso (kg)",
      "f.pie": "Pie (talla)", "f.pantalon": "Pantalón (talla)", "f.cintura": "Cintura (cm)", "f.caderas": "Caderas (cm)", "f.pecho": "Pecho (cm)",
      "f.cuello": "Cuello (cm)", "f.cabeza": "Cabeza (cm)", "f.video": "Enlace a tu videobook (YouTube o Vimeo)",
      "fotos.ayuda": "Sube entre 1 y 8 fotos: al menos un primer plano y un cuerpo entero. Se reducen automáticamente antes de enviarlas.",
      "fotos.boton": "Elegir fotos", "fotos.quitar": "Quitar foto",
      consentimiento: 'Acepto que Oriol Tarrida guarde estos datos y fotos para valorar mi perfil y contactarme para proyectos. No se publican ni se ceden a terceros, y puedo pedir que se borren en cualquier momento escribiendo a <a href="mailto:oriol@tarrida.org">oriol@tarrida.org</a>.',
      enviar: "Enviar solicitud", enviando: "Enviando…", cargando: "Cargando opciones…",
      "ok.titulo": "¡Solicitud enviada!", "ok.texto": "Gracias. Hemos recibido tus datos y revisaremos tu perfil. Si encaja en algún proyecto, te contactaremos.", "ok.volver": "Volver a la web",
      "e.campos": "Revisa los campos marcados en rojo.", "e.fotos": "Sube al menos una foto.", "e.maxfotos": "Como máximo 8 fotos.",
      "e.foto": "No se ha podido leer una de las fotos. Prueba con JPG o PNG.", "e.consent": "Tienes que aceptar el tratamiento de tus datos.",
      "e.red": "No se ha podido enviar. Comprueba tu conexión y vuelve a intentarlo.", "e.catalogo": "No se han podido cargar las opciones. Recarga la página.",
    },
    ca: {
      eyebrow: "Equip d'especialistes",
      intro: "Ets especialista d'acció? Omple aquest formulari amb les teves dades, les teves habilitats i algunes fotos. Revisarem el teu perfil i et contactarem quan encaixi en un projecte.",
      "s.personal": "Informació personal", "s.especialista": "Especialista", "s.apariencia": "Aparença i mides", "s.material": "Fotos i vídeo",
      "f.nombre": "Nom", "f.apellidos": "Cognoms", "f.genero": "Gènere", "f.nacimiento": "Data de naixement", "f.email": "Email", "f.telefono": "Telèfon",
      "g.f": "Femení", "g.m": "Masculí",
      "f.acting": "Tinc experiència en interpretació (acting)", "f.tatuajes": "Tinc tatuatges visibles",
      "f.skills": "Skills", "f.idiomas": "Idiomes", "f.permisos": "Permisos de conduir",
      "f.notas": "Explica'ns la teva experiència (rodatges, formació, especialitats)",
      "f.ojos": "Color d'ulls", "f.pelo": "Color de cabell", "f.talla": "Talla de camisa", "f.altura": "Alçada (cm)", "f.peso": "Pes (kg)",
      "f.pie": "Peu (talla)", "f.pantalon": "Pantaló (talla)", "f.cintura": "Cintura (cm)", "f.caderas": "Malucs (cm)", "f.pecho": "Pit (cm)",
      "f.cuello": "Coll (cm)", "f.cabeza": "Cap (cm)", "f.video": "Enllaç al teu videobook (YouTube o Vimeo)",
      "fotos.ayuda": "Puja entre 1 i 8 fotos: almenys un primer pla i un cos sencer. Es redueixen automàticament abans d'enviar-les.",
      "fotos.boton": "Triar fotos", "fotos.quitar": "Treure foto",
      consentimiento: 'Accepto que l\'Oriol Tarrida guardi aquestes dades i fotos per valorar el meu perfil i contactar-me per a projectes. No es publiquen ni es cedeixen a tercers, i puc demanar que s\'esborrin en qualsevol moment escrivint a <a href="mailto:oriol@tarrida.org">oriol@tarrida.org</a>.',
      enviar: "Enviar sol·licitud", enviando: "Enviant…", cargando: "Carregant opcions…",
      "ok.titulo": "Sol·licitud enviada!", "ok.texto": "Gràcies. Hem rebut les teves dades i revisarem el teu perfil. Si encaixa en algun projecte, et contactarem.", "ok.volver": "Tornar a la web",
      "e.campos": "Revisa els camps marcats en vermell.", "e.fotos": "Puja almenys una foto.", "e.maxfotos": "Com a màxim 8 fotos.",
      "e.foto": "No s'ha pogut llegir una de les fotos. Prova amb JPG o PNG.", "e.consent": "Has d'acceptar el tractament de les teves dades.",
      "e.red": "No s'ha pogut enviar. Comprova la connexió i torna-ho a provar.", "e.catalogo": "No s'han pogut carregar les opcions. Recarrega la pàgina.",
    },
    en: {
      eyebrow: "Stunt team",
      intro: "Are you a stunt performer? Fill in this form with your details, your skills and a few photos. We'll review your profile and get in touch when it fits a project.",
      "s.personal": "Personal details", "s.especialista": "Stunt profile", "s.apariencia": "Appearance and measurements", "s.material": "Photos and video",
      "f.nombre": "First name", "f.apellidos": "Last name", "f.genero": "Gender", "f.nacimiento": "Date of birth", "f.email": "Email", "f.telefono": "Phone",
      "g.f": "Female", "g.m": "Male",
      "f.acting": "I have acting experience", "f.tatuajes": "I have visible tattoos",
      "f.skills": "Skills", "f.idiomas": "Languages", "f.permisos": "Driving licences",
      "f.notas": "Tell us about your experience (productions, training, specialities)",
      "f.ojos": "Eye colour", "f.pelo": "Hair colour", "f.talla": "Shirt size", "f.altura": "Height (cm)", "f.peso": "Weight (kg)",
      "f.pie": "Shoe size (EU)", "f.pantalon": "Trouser size (EU)", "f.cintura": "Waist (cm)", "f.caderas": "Hips (cm)", "f.pecho": "Chest (cm)",
      "f.cuello": "Neck (cm)", "f.cabeza": "Head (cm)", "f.video": "Link to your showreel (YouTube or Vimeo)",
      "fotos.ayuda": "Upload 1 to 8 photos: at least one headshot and one full-body shot. They are resized automatically before sending.",
      "fotos.boton": "Choose photos", "fotos.quitar": "Remove photo",
      consentimiento: 'I agree that Oriol Tarrida may keep these details and photos to review my profile and contact me about projects. They are not published or shared with third parties, and I can ask for them to be deleted at any time by writing to <a href="mailto:oriol@tarrida.org">oriol@tarrida.org</a>.',
      enviar: "Send application", enviando: "Sending…", cargando: "Loading options…",
      "ok.titulo": "Application sent!", "ok.texto": "Thank you. We've received your details and will review your profile. If it fits a project, we'll get in touch.", "ok.volver": "Back to the website",
      "e.campos": "Please check the fields marked in red.", "e.fotos": "Upload at least one photo.", "e.maxfotos": "Up to 8 photos.",
      "e.foto": "One of the photos couldn't be read. Try JPG or PNG.", "e.consent": "You need to accept how your data is handled.",
      "e.red": "It couldn't be sent. Check your connection and try again.", "e.catalogo": "The options couldn't be loaded. Reload the page.",
    },
  };

  let lang = localStorage.getItem(LANG_KEY);
  if (!T[lang]) lang = "es";
  const tr = k => T[lang][k] ?? T.es[k] ?? k;

  function aplicarIdioma(l) {
    lang = l;
    try { localStorage.setItem(LANG_KEY, l); } catch (e) { /* sin almacenamiento */ }
    document.documentElement.lang = l;
    const nav = (typeof translations !== "undefined" && translations[l]) || {};
    document.querySelectorAll("[data-i18n]").forEach(e => { const v = nav[e.dataset.i18n]; if (typeof v === "string") e.textContent = v; });
    document.querySelectorAll("[data-i18n-aria]").forEach(e => { const v = nav[e.dataset.i18nAria]; if (v) e.setAttribute("aria-label", v); });
    document.querySelectorAll("[data-t]").forEach(e => {
      const k = e.dataset.t;
      if (k === "consentimiento") e.innerHTML = tr(k);   // texto fijo nuestro, con el enlace al email
      else e.textContent = tr(k);
    });
    document.querySelectorAll(".lang-switch button").forEach(b => b.classList.toggle("active", b.dataset.lang === l));
    document.querySelectorAll(".miniaturas button").forEach(b => b.setAttribute("aria-label", tr("fotos.quitar")));
  }
  document.querySelectorAll(".lang-switch button").forEach(b => b.addEventListener("click", () => aplicarIdioma(b.dataset.lang)));

  // menú móvil
  const navToggle = document.getElementById("navToggle"), mainNav = document.getElementById("mainNav");
  navToggle.addEventListener("click", () => navToggle.setAttribute("aria-expanded", String(mainNav.classList.toggle("open"))));
  document.getElementById("year").textContent = new Date().getFullYear();

  // ---------- catálogos (skills, idiomas, permisos, apariencia) ----------
  const form = document.getElementById("teamForm"), aviso = document.getElementById("aviso");
  function chips(id, lista) {
    const cont = document.getElementById(id), name = cont.dataset.name;
    cont.replaceChildren(...lista.map(v => {
      const l = document.createElement("label"), i = document.createElement("input");
      i.type = "checkbox"; i.name = name; i.value = v;
      l.append(i, document.createTextNode(v)); return l;
    }));
  }
  function opciones(id, lista) {
    const s = document.getElementById(id);
    lista.forEach(v => { const o = document.createElement("option"); o.value = v; o.textContent = v; s.append(o); });
  }
  fetch(API + "/api/catalogos").then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }).then(c => {
    chips("opSkills", c.skills); chips("opIdiomas", c.idiomas); chips("opPermisos", c.permisos);
    opciones("selOjos", c.ojos); opciones("selPelo", c.pelo); opciones("selTalla", c.tallas);
  }).catch(() => {
    const p = document.querySelector("#opSkills .cargando");
    if (p) { p.dataset.t = "e.catalogo"; p.textContent = tr("e.catalogo"); }
  });

  // ---------- fotos: se reducen en el navegador (y así se quitan los datos EXIF, como la ubicación) ----------
  const fotos = [];   // {img, thumb, url}
  const mini = document.getElementById("miniaturas");
  async function cargarImagen(file) {
    if ("createImageBitmap" in window) {
      try { return await createImageBitmap(file, { imageOrientation: "from-image" }); } catch (e) { /* probamos con <img> */ }
    }
    return await new Promise((ok, mal) => {
      const i = new Image(), u = URL.createObjectURL(file);
      i.onload = () => { URL.revokeObjectURL(u); ok(i); };
      i.onerror = () => { URL.revokeObjectURL(u); mal(new Error("imagen")); };
      i.src = u;
    });
  }
  function aJpeg(fuente, lado, calidades, maxBytes) {
    const w = fuente.width, h = fuente.height, k = Math.min(1, lado / Math.max(w, h));
    const c = document.createElement("canvas");
    c.width = Math.round(w * k); c.height = Math.round(h * k);
    c.getContext("2d").drawImage(fuente, 0, 0, c.width, c.height);
    return (async () => {
      let blob;
      for (const q of calidades) {
        blob = await new Promise(r => c.toBlob(r, "image/jpeg", q));
        if (blob && blob.size <= maxBytes) break;
      }
      if (!blob || blob.size > maxBytes) throw new Error("grande");
      return blob;
    })();
  }
  const aBase64 = blob => new Promise((ok, mal) => {
    const r = new FileReader(); r.onload = () => ok(String(r.result).split(",")[1]); r.onerror = mal; r.readAsDataURL(blob);
  });
  function pintarMiniaturas() {
    mini.replaceChildren(...fotos.map((f, i) => {
      const fig = document.createElement("figure"), img = document.createElement("img"), b = document.createElement("button");
      img.src = f.url; img.alt = "";
      b.type = "button"; b.textContent = "×"; b.setAttribute("aria-label", tr("fotos.quitar"));
      b.addEventListener("click", () => { URL.revokeObjectURL(f.url); fotos.splice(i, 1); pintarMiniaturas(); });
      fig.append(img, b); return fig;
    }));
  }
  document.getElementById("fotos").addEventListener("change", async e => {
    aviso.textContent = "";
    const files = [...e.target.files];
    e.target.value = "";
    for (const file of files) {
      if (fotos.length >= MAX_FOTOS) { aviso.textContent = tr("e.maxfotos"); break; }
      try {
        const bmp = await cargarImagen(file);
        const img = await aJpeg(bmp, 1600, [0.85, 0.75, 0.65, 0.55], 1_400_000);
        const thumb = await aJpeg(bmp, 480, [0.8, 0.7, 0.6], 230_000);
        if (bmp.close) bmp.close();
        fotos.push({ img: await aBase64(img), thumb: await aBase64(thumb), url: URL.createObjectURL(thumb) });
        pintarMiniaturas();
      } catch (err) { aviso.textContent = tr("e.foto"); }
    }
  });

  // ---------- envío ----------
  const boton = document.getElementById("btnEnviar");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    aviso.textContent = "";
    form.querySelectorAll(".mal").forEach(x => x.classList.remove("mal"));
    const invalidos = [...form.querySelectorAll("input[required]:not([type=checkbox]), input[type=email], input[type=number], input[type=url]")].filter(i => !i.checkValidity());
    if (invalidos.length) { invalidos.forEach(i => i.classList.add("mal")); invalidos[0].focus(); aviso.textContent = tr("e.campos"); return; }
    if (!fotos.length) { aviso.textContent = tr("e.fotos"); return; }
    if (!form.consentimiento.checked) { aviso.textContent = tr("e.consent"); return; }

    const fd = new FormData(form), d = { t: Date.now() - t0, web: fd.get("web") || "", consentimiento: true };
    for (const k of ["nombre", "apellidos", "genero", "fecha_nacimiento", "email", "telefono", "notas", "color_ojos", "color_pelo", "talla_camisa",
                     "altura_cm", "peso_kg", "pie", "pantalon", "cintura_cm", "caderas_cm", "pecho_cm", "cuello_cm", "cabeza_cm", "video"]) d[k] = (fd.get(k) || "").trim();
    for (const k of ["acting", "tatuajes"]) d[k] = fd.has(k);
    for (const k of ["skills", "idiomas", "permisos"]) d[k] = fd.getAll(k);
    d.fotos = fotos.map(f => ({ img: f.img, thumb: f.thumb }));

    boton.disabled = true; boton.textContent = tr("enviando");
    try {
      const r = await fetch(API + "/api/solicitud", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) });
      const res = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(res.error || tr("e.red"));
      form.hidden = true;
      document.getElementById("teamOk").hidden = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      aviso.textContent = err instanceof TypeError ? tr("e.red") : err.message;
    } finally {
      boton.disabled = false; boton.textContent = tr("enviar");
    }
  });

  aplicarIdioma(lang);
})();
