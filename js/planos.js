
/* =========================================
   FRITZ TRAINER - PLANOS
========================================= */

// Coloque o WhatsApp oficial da academia.
// Formato: 5532999999999

const WHATSAPP_NUMBER = "";

document.addEventListener("DOMContentLoaded", () => {

    const planButtons = document.querySelectorAll(
        ".btn-plan[data-plan]"
    );

    planButtons.forEach(button => {

        button.addEventListener("click", (event) => {

            event.preventDefault();

            const planName = button.dataset.plan;

            if (!WHATSAPP_NUMBER) {
                alert(
                    "O WhatsApp da academia ainda não foi configurado."
                );
                return;
            }

            const message =
                `Olá! Gostaria de saber mais sobre o plano ${planName} da FRITZ TRAINER.`;

            const whatsappURL =
                `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

            window.open(
                whatsappURL,
                "_blank",
                "noopener,noreferrer"
            );

        });

    });

});
