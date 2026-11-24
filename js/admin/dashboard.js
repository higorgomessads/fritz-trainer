import { createClient } from
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://bdqtojrlxmhralnpeuch.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkcXRvanJseG1ocmFsbnBldWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU0NTg2NzgsImV4cCI6MjExMTAzNDY3OH0.uVsvGiiuDel9E-ZzhHhJQb5ZHBq-abNuw0B6uyqAm6U";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementos gerais
const navButtons = document.querySelectorAll(".nav-link[data-section]");
const sections = document.querySelectorAll(".admin-section");
const pageTitle = document.getElementById("page-title");
const userNameEl = document.getElementById("user-name");
const userRoleEl = document.getElementById("user-role");
const userAvatarEl = document.getElementById("user-avatar");
const logoutButton = document.getElementById("logout-button");
const mobileMenuBtn = document.getElementById("mobile-menu");
const sidebar = document.getElementById("sidebar");
const adminToast = document.getElementById("admin-message");

// Indicadores do Dashboard
const totalAlunosEl = document.getElementById("total-alunos");
const totalMatriculasEl = document.getElementById("total-matriculas");
const totalVencidasEl = document.getElementById("total-vencidas");
const totalRecebimentosEl = document.getElementById("total-recebimentos");
const recentActivityEl = document.getElementById("recent-activity");

// Alunos
const alunosTableBody = document.getElementById("alunos-table");
const searchAlunosInput = document.getElementById("search-alunos");
const filterAlunosSelect = document.getElementById("filter-alunos");
const newStudentBtn = document.getElementById("new-student-button");
const studentFormContainer = document.getElementById("student-form-container");
const studentForm = document.getElementById("student-form");
const studentFormTitle = document.getElementById("student-form-title");
const cancelStudentBtn = document.getElementById("cancel-student-button");
const studentMessageEl = document.getElementById("student-message");

// Planos
const planosListEl = document.getElementById("planos-list");
const newPlanBtn = document.getElementById("new-plan-button");
const planFormContainer = document.getElementById("plan-form-container");
const planForm = document.getElementById("plan-form");
const cancelPlanBtn = document.getElementById("cancel-plan-button");
const planMessageEl = document.getElementById("plan-message");

// Matrículas e Pagamentos
const matriculasTableBody = document.getElementById("matriculas-table");
const pagamentosTableBody = document.getElementById("pagamentos-table");
const newPaymentBtn = document.getElementById("new-payment-button");
const paymentFormContainer = document.getElementById("payment-form-container");
const paymentForm = document.getElementById("payment-form");
const cancelPaymentBtn = document.getElementById("cancel-payment-button");
const paymentEnrollmentSelect = document.getElementById("payment-enrollment");
const paymentMessageEl = document.getElementById("payment-message");

let alunosCache = [];

function notify(msg) {
  if (!adminToast) return;
  adminToast.textContent = msg;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatCurrency(value) {
  const num = Number(value || 0);
  return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// Proteção da sessão e validação de administrador
async function requireAdminSession() {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !sessionData.session?.user) {
    window.location.replace("login.html");
    return null;
  }

  const user = sessionData.session.user;
  const { data: adminProfile, error: adminError } = await supabase
    .from("admins")
    .select("id, nome, ativo")
    .eq("user_id", user.id)
    .eq("ativo", true)
    .maybeSingle();

  if (adminError || !adminProfile) {
    await supabase.auth.signOut();
    window.location.replace("login.html");
    return null;
  }

  const displayName = adminProfile.nome || user.email || "Administrador";
  if (userNameEl) userNameEl.textContent = displayName;
  if (userRoleEl) userRoleEl.textContent = "Administrador";
  if (userAvatarEl) {
    userAvatarEl.textContent = displayName.slice(0, 2).toUpperCase();
  }

  return { user, adminProfile };
}

// Navegação entre secções e menu mobile
function switchSection(sectionName) {
  navButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.section === sectionName);
  });

  sections.forEach((sec) => {
    sec.classList.toggle("active", sec.id === `${sectionName}-section`);
  });

  const activeBtn = document.querySelector(`.nav-link[data-section="${sectionName}"]`);
  if (pageTitle && activeBtn) {
    pageTitle.textContent = activeBtn.textContent.trim().replace(/^[^\wÀ-ú]+\s*/, "");
  }

  if (sidebar && sidebar.classList.contains("open")) {
    sidebar.classList.remove("open");
  }
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    switchSection(btn.dataset.section);
  });
});

if (mobileMenuBtn && sidebar) {
  mobileMenuBtn.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("open");
    mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
  });
}

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.replace("login.html");
  });
}

// Indicadores do Dashboard
async function loadDashboardStats() {
  try {
    const [{ count: ativosCount }, { data: matriculasData }, { data: pagamentosData }] =
      await Promise.all([
        supabase
          .from("alunos")
          .select("*", { count: "exact", head: true })
          .eq("status", "ativo"),
        supabase.from("matriculas").select("id, status, data_vencimento"),
        supabase.from("pagamentos").select("valor, data_pagamento")
      ]);

    if (totalAlunosEl) totalAlunosEl.textContent = String(ativosCount ?? 0);

    const matriculas = matriculasData ?? [];
    const ativas = matriculas.filter((m) => m.status === "ativa").length;
    const hojeStr = new Date().toISOString().slice(0, 10);
    const vencidas = matriculas.filter(
      (m) =>
        m.status === "vencida" ||
        (m.data_vencimento && m.data_vencimento < hojeStr && m.status !== "cancelada")
    ).length;

    if (totalMatriculasEl) totalMatriculasEl.textContent = String(ativas);
    if (totalVencidasEl) totalVencidasEl.textContent = String(vencidas);

    const mesAtualPrefix = hojeStr.slice(0, 7);
    const totalMes = (pagamentosData ?? [])
      .filter((p) => String(p.data_pagamento || "").startsWith(mesAtualPrefix))
      .reduce((acc, item) => acc + Number(item.valor || 0), 0);

    if (totalRecebimentosEl) totalRecebimentosEl.textContent = formatCurrency(totalMes);

    if (recentActivityEl) {
      recentActivityEl.textContent =
        `Alunos ativos: ${ativosCount ?? 0} • Matrículas ativas: ${ativas} • ` +
        `Recebimentos do mês: ${formatCurrency(totalMes)}.`;
    }
  } catch (err) {
    console.error("Erro ao carregar estatísticas:", err);
  }
}

// Alunos: listagem, pesquisa, filtro e CRUD
function renderAlunos() {
  if (!alunosTableBody) return;

  const termo = (searchAlunosInput?.value || "").trim().toLowerCase();
  const statusFiltro = filterAlunosSelect?.value || "";

  const filtrados = alunosCache.filter((aluno) => {
    const matchNome = !termo || String(aluno.nome || "").toLowerCase().includes(termo);
    const matchStatus = !statusFiltro || aluno.status === statusFiltro;
    return matchNome && matchStatus;
  });

  if (!filtrados.length) {
    alunosTableBody.innerHTML = `<tr><td colspan="5">Nenhum aluno encontrado.</td></tr>`;
    return;
  }

  alunosTableBody.innerHTML = filtrados
    .map(
      (aluno) => `
      <tr>
        <td>${escapeHtml(aluno.nome)}</td>
        <td>${escapeHtml(aluno.telefone || "—")}</td>
        <td>${escapeHtml(aluno.email || "—")}</td>
        <td>${escapeHtml(aluno.status || "ativo")}</td>
        <td>
          <button type="button" data-edit-student="${escapeHtml(aluno.id)}">Editar</button>
          <button type="button" data-delete-student="${escapeHtml(aluno.id)}">Excluir</button>
        </td>
      </tr>
    `
    )
    .join("");
}

async function loadAlunos() {
  if (!alunosTableBody) return;
  alunosTableBody.innerHTML = `<tr><td colspan="5">Carregando alunos...</td></tr>`;

  const { data, error } = await supabase
    .from("alunos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao carregar alunos:", error);
    alunosTableBody.innerHTML = `<tr><td colspan="5">Erro ao carregar alunos.</td></tr>`;
    return;
  }

  alunosCache = data ?? [];
  renderAlunos();
}

function openStudentForm(aluno = null) {
  if (!studentForm || !studentFormContainer) return;
  studentForm.reset();
  if (studentMessageEl) studentMessageEl.textContent = "";

  document.getElementById("student-id").value = aluno?.id || "";
  document.getElementById("student-name").value = aluno?.nome || "";
  document.getElementById("student-phone").value = aluno?.telefone || "";
  document.getElementById("student-email").value = aluno?.email || "";
  document.getElementById("student-birth").value = aluno?.data_nascimento || "";
  document.getElementById("student-address").value = aluno?.endereco || "";
  document.getElementById("student-notes").value = aluno?.observacoes || "";

  if (studentFormTitle) {
    studentFormTitle.textContent = aluno ? "Editar aluno" : "Cadastrar aluno";
  }

  studentFormContainer.hidden = false;
  document.getElementById("student-name").focus();
}

if (newStudentBtn) {
  newStudentBtn.addEventListener("click", () => openStudentForm(null));
}

if (cancelStudentBtn && studentFormContainer) {
  cancelStudentBtn.addEventListener("click", () => {
    studentFormContainer.hidden = true;
  });
}

if (searchAlunosInput) {
  searchAlunosInput.addEventListener("input", renderAlunos);
}

if (filterAlunosSelect) {
  filterAlunosSelect.addEventListener("change", renderAlunos);
}

if (alunosTableBody) {
  alunosTableBody.addEventListener("click", async (event) => {
    const editId = event.target.dataset.editStudent;
    const deleteId = event.target.dataset.deleteStudent;

    if (editId) {
      const aluno = alunosCache.find((item) => item.id === editId);
      if (aluno) openStudentForm(aluno);
    }

    if (deleteId) {
      const confirmar = window.confirm("Deseja realmente excluir este aluno?");
      if (!confirmar) return;

      const { error } = await supabase.from("alunos").delete().eq("id", deleteId);
      if (error) {
        console.error("Erro ao excluir aluno:", error);
        notify("Erro ao excluir aluno.");
        return;
      }

      notify("Aluno excluído com sucesso.");
      await Promise.all([loadAlunos(), loadDashboardStats()]);
    }
  });
}

if (studentForm) {
  studentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (studentMessageEl) studentMessageEl.textContent = "";

    const id = document.getElementById("student-id").value.trim();
    const payload = {
      nome: document.getElementById("student-name").value.trim(),
      telefone: document.getElementById("student-phone").value.trim() || null,
      email: document.getElementById("student-email").value.trim() || null,
      data_nascimento: document.getElementById("student-birth").value || null,
      endereco: document.getElementById("student-address").value.trim() || null,
      observacoes: document.getElementById("student-notes").value.trim() || null,
      status: "ativo"
    };

    if (!payload.nome) {
      if (studentMessageEl) studentMessageEl.textContent = "Informe o nome completo do aluno.";
      return;
    }

    const query = id
      ? supabase.from("alunos").update(payload).eq("id", id)
      : supabase.from("alunos").insert(payload);

    const { error } = await query;

    if (error) {
      console.error("Erro ao salvar aluno:", error);
      if (studentMessageEl) studentMessageEl.textContent = "Erro ao salvar aluno no Supabase.";
      return;
    }

    if (studentMessageEl) studentMessageEl.textContent = "Aluno salvo com sucesso!";
    studentFormContainer.hidden = true;
    notify("Aluno salvo com sucesso.");
    await Promise.all([loadAlunos(), loadDashboardStats()]);
  });
}

// Planos
async function loadPlanos() {
  if (!planosListEl) return;

  const { data, error } = await supabase
    .from("planos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao carregar planos:", error);
    planosListEl.innerHTML = `<p>Erro ao carregar planos.</p>`;
    return;
  }

  if (!data?.length) {
    planosListEl.innerHTML = `<p>Nenhum plano cadastrado ainda.</p>`;
    return;
  }

  planosListEl.innerHTML = data
    .map(
      (plano) => `
      <article class="stat-card">
        <strong>${escapeHtml(plano.nome)}</strong>
        <p>${escapeHtml(plano.descricao || "")}</p>
        <span>${formatCurrency(plano.preco)} • ${escapeHtml(plano.duracao_dias)} dias</span>
      </article>
    `
    )
    .join("");
}

if (newPlanBtn && planForm && planFormContainer) {
  newPlanBtn.addEventListener("click", () => {
    planForm.reset();
    document.getElementById("plan-id").value = "";
    if (planMessageEl) planMessageEl.textContent = "";
    planFormContainer.hidden = false;
  });
}

if (cancelPlanBtn && planFormContainer) {
  cancelPlanBtn.addEventListener("click", () => {
    planFormContainer.hidden = true;
  });
}

if (planForm) {
  planForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (planMessageEl) planMessageEl.textContent = "";

    const payload = {
      nome: document.getElementById("plan-name").value.trim(),
      descricao: document.getElementById("plan-description").value.trim() || null,
      preco: Number(document.getElementById("plan-price").value),
      duracao_dias: Number(document.getElementById("plan-duration").value),
      ativo: true
    };

    const { error } = await supabase.from("planos").insert(payload);
    if (error) {
      console.error("Erro ao salvar plano:", error);
      if (planMessageEl) planMessageEl.textContent = "Erro ao salvar plano.";
      return;
    }

    if (planMessageEl) planMessageEl.textContent = "Plano salvo com sucesso!";
    planFormContainer.hidden = true;
    await loadPlanos();
  });
}

// Matrículas e Pagamentos
async function loadMatriculasEPagamentos() {
  const { data: matriculas, error: matError } = await supabase
    .from("matriculas")
    .select("id, data_inicio, data_vencimento, status, alunos(nome), planos(nome)")
    .order("created_at", { ascending: false });

  if (!matError && matriculasTableBody) {
    if (!matriculas?.length) {
      matriculasTableBody.innerHTML = `<tr><td colspan="5">Nenhuma matrícula cadastrada.</td></tr>`;
    } else {
      matriculasTableBody.innerHTML = matriculas
        .map(
          (m) => `
          <tr>
            <td>${escapeHtml(m.alunos?.nome || "—")}</td>
            <td>${escapeHtml(m.planos?.nome || "—")}</td>
            <td>${escapeHtml(m.data_inicio || "—")}</td>
            <td>${escapeHtml(m.data_vencimento || "—")}</td>
            <td>${escapeHtml(m.status || "—")}</td>
          </tr>
        `
        )
        .join("");
    }

    if (paymentEnrollmentSelect) {
      paymentEnrollmentSelect.innerHTML =
        `<option value="">Selecione uma matrícula</option>` +
        (matriculas ?? [])
          .map(
            (m) =>
              `<option value="${escapeHtml(m.id)}">${escapeHtml(m.alunos?.nome || "Aluno")} — ${escapeHtml(m.planos?.nome || "Plano")}</option>`
          )
          .join("");
    }
  }

  const { data: pagamentos, error: pagError } = await supabase
    .from("pagamentos")
    .select("id, valor, data_pagamento, metodo, matriculas(alunos(nome))")
    .order("data_pagamento", { ascending: false });

  if (!pagError && pagamentosTableBody) {
    if (!pagamentos?.length) {
      pagamentosTableBody.innerHTML = `<tr><td colspan="4">Nenhum pagamento registrado.</td></tr>`;
    } else {
      pagamentosTableBody.innerHTML = pagamentos
        .map(
          (p) => `
          <tr>
            <td>${escapeHtml(p.matriculas?.alunos?.nome || "—")}</td>
            <td>${formatCurrency(p.valor)}</td>
            <td>${escapeHtml(p.data_pagamento || "—")}</td>
            <td>${escapeHtml(p.metodo || "—")}</td>
          </tr>
        `
        )
        .join("");
    }
  }
}

if (newPaymentBtn && paymentForm && paymentFormContainer) {
  newPaymentBtn.addEventListener("click", () => {
    paymentForm.reset();
    document.getElementById("payment-date").value = new Date().toISOString().slice(0, 10);
    if (paymentMessageEl) paymentMessageEl.textContent = "";
    paymentFormContainer.hidden = false;
  });
}

if (cancelPaymentBtn && paymentFormContainer) {
  cancelPaymentBtn.addEventListener("click", () => {
    paymentFormContainer.hidden = true;
  });
}

if (paymentForm) {
  paymentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (paymentMessageEl) paymentMessageEl.textContent = "";

    const payload = {
      matricula_id: paymentEnrollmentSelect.value,
      valor: Number(document.getElementById("payment-value").value),
      data_pagamento: document.getElementById("payment-date").value,
      metodo: document.getElementById("payment-method").value,
      observacoes: document.getElementById("payment-notes").value.trim() || null
    };

    const { error } = await supabase.from("pagamentos").insert(payload);
    if (error) {
      console.error("Erro ao registrar pagamento:", error);
      if (paymentMessageEl) paymentMessageEl.textContent = "Erro ao registrar pagamento.";
      return;
    }

    if (paymentMessageEl) paymentMessageEl.textContent = "Pagamento salvo com sucesso!";
    paymentFormContainer.hidden = true;
    await Promise.all([loadMatriculasEPagamentos(), loadDashboardStats()]);
  });
}

// Inicialização
(async function initAdmin() {
  const authContext = await requireAdminSession();
  if (!authContext) return;

  await Promise.all([
    loadDashboardStats(),
    loadAlunos(),
    loadPlanos(),
    loadMatriculasEPagamentos()
  ]);
})();