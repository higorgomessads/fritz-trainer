// ==========================================
// FRITZ TRAINER - AUTENTICAÇÃO
// Supabase Auth
// ==========================================

import { createClient } from
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://bdqtojrlxmhralnpeuch.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkcXRvanJseG1ocmFsbnBldWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU0NTg2NzgsImV4cCI6MjExMTAzNDY3OH0.uVsvGiiuDel9E-ZzhHhJQb5ZHBq-abNuw0B6uyqAm6U";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authTitle = document.getElementById("auth-title");
const authSubtitle = document.getElementById("auth-subtitle");
const tabLogin = document.getElementById("tab-login");
const tabSignup = document.getElementById("tab-signup");
const signupNameGroup = document.getElementById("signup-name-group");
const fullNameInput = document.getElementById("full-name");

const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-button");
const loginMessage = document.getElementById("login-message");

let authMode = "login"; // "login" | "signup"

function showMessage(message, type = "error") {
  if (!loginMessage) return;
  loginMessage.textContent = message;
  loginMessage.style.color = type === "success" ? "#27b85d" : "#ff7777";
}

function setLoading(loading) {
  if (!loginButton) return;
  loginButton.disabled = loading;

  if (loading) {
    loginButton.textContent =
      authMode === "signup" ? "CRIANDO CONTA..." : "AUTENTICANDO...";
  } else {
    loginButton.textContent =
      authMode === "signup" ? "CRIAR CONTA" : "ENTRAR NO PAINEL";
  }
}

function setAuthMode(nextMode) {
  authMode = nextMode === "signup" ? "signup" : "login";
  const isSignup = authMode === "signup";

  tabLogin?.classList.toggle("active", !isSignup);
  tabSignup?.classList.toggle("active", isSignup);
  tabLogin?.setAttribute("aria-selected", String(!isSignup));
  tabSignup?.setAttribute("aria-selected", String(isSignup));

  if (signupNameGroup) {
    signupNameGroup.hidden = !isSignup;
  }

  if (fullNameInput) {
    fullNameInput.required = isSignup;
  }

  if (passwordInput) {
    passwordInput.setAttribute(
      "autocomplete",
      isSignup ? "new-password" : "current-password"
    );
  }

  if (authTitle) {
    authTitle.textContent = isSignup ? "Criar conta" : "Área administrativa";
  }

  if (authSubtitle) {
    authSubtitle.textContent = isSignup
      ? "Cadastre sua conta para solicitar ou acessar o sistema."
      : "Acesse sua conta para gerenciar a academia.";
  }

  setLoading(false);
  showMessage("");
}

async function authorizeAndRedirect(user) {
  if (!user) return false;

  const { data: adminRecord, error } = await supabase
    .from("admins")
    .select("id, nome, ativo")
    .eq("user_id", user.id)
    .eq("ativo", true)
    .maybeSingle();

  if (error) {
    console.error("Erro ao validar permissão administrativa:", error);
    showMessage("Erro ao verificar permissão administrativa.");
    return false;
  }

  if (!adminRecord) {
    await supabase.auth.signOut();
    showMessage("Esta conta não possui acesso administrativo.");
    return false;
  }

  window.location.replace("admin.html");
  return true;
}

async function checkSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    if (data.session?.user) {
      await authorizeAndRedirect(data.session.user);
    }
  } catch (error) {
    console.error("Erro ao verificar sessão:", error);
    showMessage("Não foi possível verificar sua sessão.");
  }
}

tabLogin?.addEventListener("click", () => setAuthMode("login"));
tabSignup?.addEventListener("click", () => setAuthMode("signup"));

if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nome = fullNameInput ? fullNameInput.value.trim() : "";
    const email = emailInput ? emailInput.value.trim() : "";
    const password = passwordInput ? passwordInput.value : "";

    if (!email || !password) {
      showMessage("Preencha o e-mail e a senha.");
      return;
    }

    if (authMode === "signup" && nome.length < 2) {
      showMessage("Digite seu nome completo com pelo menos 2 caracteres.");
      fullNameInput?.focus();
      return;
    }

    if (authMode === "signup" && password.length < 6) {
      showMessage("A senha deve ter pelo menos 6 caracteres.");
      passwordInput?.focus();
      return;
    }

    setLoading(true);
    showMessage("");

    try {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { nome }
          }
        });

        if (error) throw error;

        if (data.session?.user) {
          const allowed = await authorizeAndRedirect(data.session.user);
          if (!allowed) {
            showMessage(
              "Conta criada com sucesso! Para acessar o painel administrativo, ative seu usuário na tabela admins.",
              "success"
            );
            setLoading(false);
          }
        } else {
          loginForm.reset();
          showMessage(
            "Conta criada! Confirme seu e-mail (se solicitado) e depois faça login.",
            "success"
          );
          setLoading(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        if (!data.session?.user) {
          throw new Error("Sessão não iniciada.");
        }

        const allowed = await authorizeAndRedirect(data.session.user);
        if (!allowed) {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Erro na autenticação:", error);

      if (authMode === "signup") {
        const msg = String(error?.message || "").toLowerCase();
        if (msg.includes("rate limit")) {
          showMessage(
            "Muitas tentativas de cadastro seguidas. Aguarde alguns minutos e tente novamente."
          );
        } else if (msg.includes("already registered")) {
          showMessage(
            "Este e-mail já está cadastrado. Tente entrar na aba Entrar."
          );
        } else {
          showMessage(
            error?.message || "Não foi possível criar a conta. Tente novamente."
          );
        }
      } else {
        showMessage("Não foi possível entrar. Confira seu e-mail e sua senha.");
      }

      setLoading(false);
    }
  });
}

setAuthMode("login");
checkSession();