
document.addEventListener("DOMContentLoaded", () => {
  // =========================================
  // CONFIGURAÇÕES
  // =========================================

  // Número oficial da academia: DDI + DDD + número.
  // Exemplo: 5532999999999
  const WHATSAPP_NUMBER = "";

  // =========================================
  // MENU MOBILE
  // =========================================

  const menuToggle = document.querySelector(".menu-toggle, #menu-toggle");
  const mainNav = document.querySelector(".main-nav, #main-nav");

  function closeMenu() {
    if (!menuToggle || !mainNav) return;

    menuToggle.classList.remove("active");
    mainNav.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
  }

  if (menuToggle && mainNav) {
    menuToggle.setAttribute("aria-expanded", "false");

    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("active");

      menuToggle.classList.toggle("active", isOpen);
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", (event) => {
      const clickedInsideMenu = mainNav.contains(event.target);
      const clickedToggle = menuToggle.contains(event.target);

      if (!clickedInsideMenu && !clickedToggle) closeMenu();
    });
  }

  // =========================================
  // ANO AUTOMÁTICO NO RODAPÉ
  // =========================================

  document.querySelectorAll("#current-year, #year, [data-year]")
    .forEach((element) => {
      element.textContent = new Date().getFullYear();
    });

  // =========================================
  // FORMULÁRIO DE CONTATO
  // =========================================

  const contactForm = document.querySelector("#contact-form");

  if (contactForm) {
    let feedback = contactForm.querySelector(".form-feedback");

    if (!feedback) {
      feedback = document.createElement("p");
      feedback.className = "form-feedback";
      feedback.setAttribute("role", "status");
      feedback.setAttribute("aria-live", "polite");
      contactForm.appendChild(feedback);
    }

    function showFeedback(message, type) {
      feedback.textContent = message;
      feedback.dataset.type = type;
    }

    function getField(...selectors) {
      for (const selector of selectors) {
        const field = contactForm.querySelector(selector);
        if (field) return field;
      }
      return null;
    }

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const nameField = getField('[name="nome"]', '[name="name"]', "#nome", "#name");
      const phoneField = getField('[name="telefone"]', '[name="phone"]', "#telefone", "#phone");
      const interestField = getField('[name="interesse"]', '[name="interest"]', "#interesse", "#interest");

      const name = nameField?.value.trim() || "";
      const phone = phoneField?.value.trim() || "";
      const interest = interestField?.value.trim() || "";

      if (!name) {
        showFeedback("Informe seu nome.", "error");
        nameField?.focus();
        return;
      }

      if (!phone) {
        showFeedback("Informe seu telefone.", "error");
        phoneField?.focus();
        return;
      }

      const phoneDigits = phone.replace(/\D/g, "");

      if (phoneDigits.length < 10 || phoneDigits.length > 13) {
        showFeedback("Confira o número de telefone informado.", "error");
        phoneField?.focus();
        return;
      }

      if (!WHATSAPP_NUMBER) {
        showFeedback(
          "Formulário validado! O WhatsApp oficial da academia ainda precisa ser configurado.",
          "warning"
        );
        return;
      }

      const message = [
        "Olá! Gostaria de informações sobre a FRITZ TRAINER.",
        "",
        `Nome: ${name}`,
        `Telefone: ${phone}`,
        `Interesse: ${interest || "Não informado"}`
      ].join("\n");

      const whatsappURL =
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

      window.open(whatsappURL, "_blank", "noopener,noreferrer");

      showFeedback(
        "Solicitação preparada! Continue a conversa pelo WhatsApp.",
        "success"
      );

      contactForm.reset();
    });
  }

  // =========================================
  // ROLAGEM SUAVE DOS LINKS INTERNOS
  // =========================================

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });

      history.replaceState(null, "", targetId);
    });
  });
});
