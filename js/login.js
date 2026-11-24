/* =========================================
   FRITZ TRAINER - LOGIN ADMINISTRATIVO
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("login-form");
    const feedback = document.getElementById("login-feedback");
    const supabase = window.supabaseClient;

    if (!form) return;

    if (!supabase) {
        if (feedback) {
            feedback.textContent = "Sistema de autenticação indisponível.";
        }
        return;
    }

    async function verificarEIrParaAdmin(user) {
        if (!user) return false;

        // Consulta a tabela de administradores/perfis vinculada ao auth.uid()
        const { data: adminProfile, error } = await supabase
            .from("admins")
            .select("id, ativo")
            .eq("user_id", user.id)
            .eq("ativo", true)
            .maybeSingle();

        if (error) {
            console.error("Erro ao verificar permissão de admin:", error);
            return false;
        }

        if (!adminProfile) {
            await supabase.auth.signOut();
            if (feedback) {
                feedback.textContent = "Acesso restrito a administradores.";
            }
            return false;
        }

        window.location.replace("admin.html");
        return true;
    }

    // LOGIN
    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const emailInput = form.querySelector('[name="email"], #email');
        const senhaInput = form.querySelector('[name="senha"], [name="password"], #senha, #password');
        const email = emailInput ? emailInput.value.trim() : "";
        const senha = senhaInput ? senhaInput.value : "";
        const button = form.querySelector('button[type="submit"]');

        if (!email || !senha) {
            if (feedback) feedback.textContent = "Informe seu e-mail e senha.";
            return;
        }

        if (button) {
            button.disabled = true;
            button.textContent = "Entrando...";
        }
        if (feedback) feedback.textContent = "";

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password: senha
            });

            if (error) throw error;
            if (!data.session || !data.user) throw new Error("Sessão não criada.");

            await verificarEIrParaAdmin(data.user);
        } catch (error) {
            console.error("Erro no login:", error);
            if (feedback) feedback.textContent = "E-mail ou senha incorretos.";
        } finally {
            if (button) {
                button.disabled = false;
                button.textContent = "Entrar";
            }
        }
    });

    // VERIFICAR SESSÃO EXISTENTE
    supabase.auth.getSession().then(async ({ data, error }) => {
        if (!error && data.session?.user) {
            await verificarEIrParaAdmin(data.session.user);
        }
    });
});