/* ==========================================
   FRITZ TRAINER - SUPABASE
========================================== */

// CONFIGURAÇÕES

const SUPABASE_URL =
    "https://bdqtojrlxmhralnpeuch.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkcXRvanJseG1ocmFsbnBldWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU0NTg2NzgsImV4cCI6MjExMTAzNDY3OH0.uVsvGiiuDel9E-ZzhHhJQb5ZHBq-abNuw0B6uyqAm6U";

// VERIFICAR BIBLIOTECA

if (!window.supabase) {
    console.error("Biblioteca Supabase não encontrada.");
    throw new Error("Supabase não carregado.");
}

// CRIAR CONEXÃO

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// DISPONIBILIZAR CONEXÃO

window.supabaseClient = supabaseClient;

console.log("FRITZ TRAINER: Supabase inicializado.");