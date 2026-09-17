// Login compartido por el enlace disimulado del footer (index.html) y por
// admin.html. Cambia WORKER_URL por la URL real de tu Worker desplegado
// (ver portfolio-oriol-tarrida-admin-worker/README.md) — esto no es un
// secreto, es solo la dirección pública de la API.
(function () {
  const WORKER_URL = "https://portfolio-oriol-tarrida-admin.jose-hernandez-dev.workers.dev";
  const TOKEN_KEY = "oriol-admin-token";

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  }

  function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
  }

  async function login(password) {
    const res = await fetch(`${WORKER_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "No se pudo iniciar sesión");
    setToken(data.token);
    return data.token;
  }

  function renderLoginForm(container, { onSuccess } = {}) {
    container.innerHTML = `
      <form class="admin-login-form">
        <h2>Panel admin</h2>
        <label for="adminPasswordInput">Contraseña</label>
        <input type="password" id="adminPasswordInput" autocomplete="current-password" required autofocus>
        <button type="submit">Entrar</button>
        <p class="admin-login-error" hidden></p>
      </form>
    `;
    const form = container.querySelector(".admin-login-form");
    const errorEl = container.querySelector(".admin-login-error");
    const input = container.querySelector("#adminPasswordInput");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorEl.hidden = true;
      const submitBtn = form.querySelector("button[type=submit]");
      submitBtn.disabled = true;
      try {
        const token = await login(input.value);
        if (onSuccess) onSuccess(token);
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.hidden = false;
        input.value = "";
        input.focus();
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  window.OriolAdmin = { WORKER_URL, getToken, setToken, clearToken, login, renderLoginForm };
})();
