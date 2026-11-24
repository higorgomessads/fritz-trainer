/* =========================================
   FRITZ TRAINER - CONTATO
========================================= */

import { createClient } from
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://bdqtojrlxmhralnpeuch.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkcXRvanJseG1ocmFsbnBldWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU0NTg2NzgsImV4cCI6MjExMTAzNDY3OH0.uVsvGiiuDel9E-ZzhHhJQb5ZHBq-abNuw0B6uyqAm6U";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// WhatsApp da academia (preencha com DDI+DDD+número, ex: "5532999999999")
const WHATSAPP_NUMBER = "";

function setFeedback(el, message, type = "neutral") {
  if (!el) return;
  el.textContent = message;
  if (type === "success") {
    el.style.color = "#27b85d";
  } else if (type === "error") {
    el.style.color = "#ff7777";
  } else {
    el.style.color = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  const feedback = document.getElementById("form-feedback");
  const whatsappLinks = document.querySelectorAll("[data-contact-whatsapp]");

  whatsappLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();

      if (!WHATSAPP_NUMBER) {
        alert("WhatsApp ainda não configurado.");
        return;
      }

      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}`,
        "_blank",
        "noopener,noreferrer"
      );
    });
  });

  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nameInput = document.getElementById("name") || form.elements.name;
    const phoneInput = document.getElementById("phone") || form.elements.phone;
    const interestInput =
      document.getElementById("interest") || form.elements.interest;

    const nome = (nameInput?.value || "").trim();
    const telefone = (phoneInput?.value || "").trim();
    const interesse = (interestInput?.value || "").trim();
    const digitsOnly = telefone.replace(/\D/g, "");

    if (nome.length < 2) {
      setFeedback(feedback, "Digite seu nome com pelo menos 2 caracteres.", "error");
      nameInput?.focus();
      return;
    }

    if (digitsOnly.length < 8) {
      setFeedback(feedback, "Digite um telefone ou WhatsApp válido.", "error");
      phoneInput?.focus();
      return;
    }

    if (!interesse) {
      setFeedback(feedback, "Selecione o que você quer saber.", "error");
      interestInput?.focus();
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    const originalButtonHtml = button ? button.innerHTML : "";

    if (button) {
      button.disabled = true;
      button.textContent = "Enviando...";
    }

    setFeedback(feedback, "Enviando seu interesse...", "neutral");

    try {
      const { error } = await supabase.from("contatos").insert([
        {
          nome,
          telefone,
          interesse,
          origem: window.location.pathname || "site",
          status: "novo"
        }
      ]);

      if (error) {
        throw error;
      }

      form.reset();
      setFeedback(
        feedback,
        "Interesse enviado com sucesso! Nossa equipe entrará em contato em breve.",
        "success"
      );
    } catch (error) {
      console.error("Erro ao enviar contato:", error);
      setFeedback(
        feedback,
        "Não foi possível enviar seu interesse agora. Tente novamente.",
        "error"
      );
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML = originalButtonHtml || "ENVIAR INTERESSE <span>↗</span>";
      }
    }
  });
});