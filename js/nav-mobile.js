// ==========================================
// FRITZ TRAINER - MENU MOBILE (.menu-toggle + #main-nav)
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.querySelector(".menu-toggle");
  const nav = document.getElementById("main-nav") || document.querySelector(".main-nav");

  if (!toggleBtn || !nav) return;

  // Evita conflito caso js/main.js já tenha registrado o clique neste botão
  if (toggleBtn.dataset.mobileMenuBound === "true") return;
  toggleBtn.dataset.mobileMenuBound = "true";

  function setMenuOpen(isOpen) {
    nav.classList.toggle("open", isOpen);
    nav.classList.toggle("active", isOpen);
    toggleBtn.classList.toggle("open", isOpen);
    toggleBtn.classList.toggle("active", isOpen);
    toggleBtn.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
  }

  toggleBtn.addEventListener(
    "click",
    (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      const isOpen =
        nav.classList.contains("open") || nav.classList.contains("active");
      setMenuOpen(!isOpen);
    },
    true
  );

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("click", (event) => {
    const isOpen =
      nav.classList.contains("open") || nav.classList.contains("active");
    if (!isOpen) return;
    if (!nav.contains(event.target) && !toggleBtn.contains(event.target)) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    const isOpen =
      nav.classList.contains("open") || nav.classList.contains("active");
    if (event.key === "Escape" && isOpen) {
      setMenuOpen(false);
      toggleBtn.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      setMenuOpen(false);
    }
  });
});