// Enlace disimulado en el footer ("Oriol Tarrida Homedes") que abre el login
// del panel admin. Solo se usa en index.html — admin.html tiene su propio
// flujo de login independiente (por si alguien entra por URL directa).
(function () {
  const link = document.getElementById("footerAdminLink");
  const overlay = document.getElementById("adminLoginOverlay");
  const mount = document.getElementById("adminLoginMount");
  const closeBtn = document.getElementById("adminLoginClose");
  if (!link || !overlay || !mount) return;

  function open() {
    window.OriolAdmin.renderLoginForm(mount, {
      onSuccess: () => {
        window.location.href = "admin.html";
      },
    });
    overlay.classList.add("open");
  }

  function close() {
    overlay.classList.remove("open");
    mount.innerHTML = "";
  }

  link.addEventListener("click", (e) => {
    e.preventDefault();
    open();
  });

  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) close();
  });
})();
