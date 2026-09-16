(function () {
  const CATEGORIES = ["coordinador", "driver", "performer", "armero"];
  const CATEGORY_LABELS = {
    coordinador: "Stunt Coordinator",
    driver: "Stunt Driver",
    performer: "Stunt Performer",
    armero: "Armero en Set",
  };

  const PHOTO_WARN_BYTES = 5 * 1024 * 1024;
  const VIDEO_WARN_BYTES = 20 * 1024 * 1024;
  const VIDEO_MAX_BYTES = 80 * 1024 * 1024;

  const loginScreen = document.getElementById("adminLoginScreen");
  const loginMount = document.getElementById("adminLoginMount");
  const content = document.getElementById("adminContent");
  const logoutBtn = document.getElementById("logoutBtn");

  let toastTimer = null;
  function showToast(msg) {
    const el = document.getElementById("adminToast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, 4000);
  }

  async function api(path, options = {}) {
    const token = window.OriolAdmin.getToken();
    const res = await fetch(`${window.OriolAdmin.WORKER_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    if (res.status === 401) {
      window.OriolAdmin.clearToken();
      showLogin();
      throw new Error("Sesión caducada, vuelve a iniciar sesión");
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
    return data;
  }

  function showLogin() {
    content.hidden = true;
    logoutBtn.hidden = true;
    loginScreen.hidden = false;
    window.OriolAdmin.renderLoginForm(loginMount, { onSuccess: loadMediaAndRender });
  }

  async function loadMediaAndRender() {
    try {
      const data = await api("/api/media", { method: "GET" });
      loginScreen.hidden = true;
      content.hidden = false;
      logoutBtn.hidden = false;
      renderAll(data);
    } catch (err) {
      if (window.OriolAdmin.getToken()) showToast(`Error: ${err.message}`);
    }
  }

  function renderAll(mediaData) {
    content.innerHTML = "";
    CATEGORIES.forEach((cat) => {
      const section = document.createElement("section");
      section.className = "admin-category";
      section.innerHTML = `
        <h2>${CATEGORY_LABELS[cat]}</h2>
        <div class="admin-subgroup">
          <h3>Fotos</h3>
          <div class="admin-grid" data-photo-grid></div>
        </div>
        <div class="admin-subgroup">
          <h3>Vídeos (showreel)</h3>
          <div class="admin-grid" data-video-grid></div>
        </div>
      `;
      content.appendChild(section);

      const photoGrid = section.querySelector("[data-photo-grid]");
      (mediaData.photos[cat] || []).forEach((photo, i) => {
        photoGrid.appendChild(buildThumb({ src: photo.src, kind: "photo", cat, index: i }));
      });
      photoGrid.appendChild(buildUploadTile({ cat, kind: "photo" }));

      const videoGrid = section.querySelector("[data-video-grid]");
      (mediaData.videos[cat] || []).forEach((video, i) => {
        videoGrid.appendChild(buildThumb({ src: video.poster, kind: "video", cat, index: i }));
      });
      videoGrid.appendChild(buildUploadTile({ cat, kind: "video" }));
    });
  }

  function buildThumb({ src, kind, cat, index }) {
    const div = document.createElement("div");
    div.className = "admin-thumb";
    const img = document.createElement("img");
    img.src = src;
    img.alt = "";
    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "admin-thumb-delete";
    delBtn.setAttribute("aria-label", "Borrar");
    delBtn.innerHTML = "&times;";
    delBtn.addEventListener("click", () => deleteItem(kind, cat, index));
    div.appendChild(img);
    div.appendChild(delBtn);
    return div;
  }

  function buildUploadTile({ cat, kind }) {
    const label = document.createElement("label");
    label.className = "admin-upload";
    const span = document.createElement("span");
    span.textContent = `+ Añadir ${kind === "photo" ? "foto" : "vídeo"}`;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = kind === "photo" ? "image/*" : "video/*";
    label.appendChild(span);
    label.appendChild(input);

    function handle(file) {
      if (!file) return;
      if (kind === "photo") handlePhotoUpload(cat, file);
      else handleVideoUpload(cat, file);
    }

    input.addEventListener("change", () => {
      handle(input.files[0]);
      input.value = "";
    });
    label.addEventListener("dragover", (e) => {
      e.preventDefault();
      label.classList.add("dragover");
    });
    label.addEventListener("dragleave", () => label.classList.remove("dragover"));
    label.addEventListener("drop", (e) => {
      e.preventDefault();
      label.classList.remove("dragover");
      handle(e.dataTransfer.files[0]);
    });
    return label;
  }

  async function deleteItem(kind, cat, index) {
    if (!confirm("¿Seguro que quieres borrar esto? No se puede deshacer.")) return;
    showToast("Borrando…");
    try {
      await api(kind === "photo" ? "/api/photos" : "/api/videos", {
        method: "DELETE",
        body: JSON.stringify({ category: cat, index }),
      });
      showToast("Borrado. Tardará 1-2 min en desaparecer de orioltarrida.com.");
      await loadMediaAndRender();
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  }

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  async function compressImage(file, maxDim = 2000, quality = 0.85) {
    const img = await loadImage(file);
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    URL.revokeObjectURL(img.src);
    return { base64: dataUrl.split(",")[1], ext: "jpg" };
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function extFromFilename(name, fallback) {
    const m = /\.([a-zA-Z0-9]+)$/.exec(name || "");
    return m ? m[1].toLowerCase() : fallback;
  }

  function generatePoster(file) {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;
      video.src = URL.createObjectURL(file);
      video.addEventListener("loadeddata", () => {
        video.currentTime = Math.min(1, (video.duration || 2) / 2);
      });
      video.addEventListener("seeked", () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        URL.revokeObjectURL(video.src);
        resolve(dataUrl.split(",")[1]);
      });
      video.addEventListener("error", () => reject(new Error("No se pudo generar el poster del vídeo")));
    });
  }

  async function handlePhotoUpload(cat, file) {
    if (file.size > PHOTO_WARN_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      if (!confirm(`Esta foto pesa ${mb}MB, se recomprimirá automáticamente. ¿Continuar?`)) return;
    }
    showToast("Subiendo foto…");
    try {
      const { base64, ext } = await compressImage(file);
      await api("/api/photos", {
        method: "POST",
        body: JSON.stringify({ category: cat, base64, ext, alt: "" }),
      });
      showToast("Foto añadida. Tardará 1-2 min en verse en orioltarrida.com.");
      await loadMediaAndRender();
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  }

  async function handleVideoUpload(cat, file) {
    if (file.size > VIDEO_MAX_BYTES) {
      showToast(`Vídeo demasiado grande (máx ${(VIDEO_MAX_BYTES / 1024 / 1024).toFixed(0)}MB). Comprímelo antes de subirlo.`);
      return;
    }
    if (file.size > VIDEO_WARN_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      if (!confirm(`Este vídeo pesa ${mb}MB y no se comprime automáticamente. ¿Seguro que quieres subirlo tal cual?`)) return;
    }
    showToast("Subiendo vídeo…");
    try {
      const [base64, posterBase64] = await Promise.all([fileToBase64(file), generatePoster(file)]);
      const ext = extFromFilename(file.name, "mp4");
      await api("/api/videos", {
        method: "POST",
        body: JSON.stringify({ category: cat, base64, posterBase64, ext, posterExt: "jpg" }),
      });
      showToast("Vídeo añadido. Tardará 1-2 min en verse en orioltarrida.com.");
      await loadMediaAndRender();
    } catch (err) {
      showToast(`Error: ${err.message}`);
    }
  }

  logoutBtn.addEventListener("click", () => {
    window.OriolAdmin.clearToken();
    showLogin();
  });

  if (window.OriolAdmin.getToken()) {
    loadMediaAndRender();
  } else {
    showLogin();
  }
})();
