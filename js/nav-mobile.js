(() => {
  const toggleBtn = document.getElementById("nav-toggle");
  const nav = document.getElementById("site-nav");

  if (!toggleBtn || !nav) return;

  function setMenuState(isOpen) {
    nav.classList.toggle("open", isOpen);
    toggleBtn.setAttribute("aria-expanded", String(isOpen));
    toggleBtn.textContent = isOpen ? "✕" : "☰";
  }

  toggleBtn.addEventListener("click", () => {
    const isOpen = nav.classList.contains("open");
    setMenuState(!isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("open")) {
      setMenuState(false);
    }
  });
})();