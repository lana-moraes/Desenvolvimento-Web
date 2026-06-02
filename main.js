const API = "http://localhost:3003";

// ===== TOAST NOTIFICATIONS =====
function toast(msg, tipo = "success") {
  const el = document.getElementById("toast");
  document.getElementById("toast-msg").textContent = msg;
  el.className = `toast show ${tipo}`;
  setTimeout(() => (el.className = "toast"), 3000);
}

// ===== LABELS DE STATUS =====
function labelStatus(s) {
  const labels = {
    disponivel: "Disponível",
    emprestado: "Emprestado",
    manutencao: "Manutenção",
  };
  return labels[s] || s;
}

// ===== RENDERIZAÇÃO DA TABELA =====
function renderTabela(produtos) {
  const tbody = document.getElementById("tabela-body");

  if (!produtos.length) {
    tbody.innerHTML = `
      <tr><td colspan="6">
        <div class="empty-state">
          <p>Nenhum produto encontrado.</p>
          <p>Adicione um produto acima ou ajuste os filtros.</p>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = produtos
    .map(
      (p) => `
    <tr>
      <td><span class="id-chip">#${p.id}</span></td>
      <td><strong>${p.nome}</strong></td>
      <td>${p.tipo}</td>
      <td>${p.descricao || "-"}</td>
      <td><span class="badge badge-${p.status}">${labelStatus(p.status)}</span></td>
      <td>
        <div class="actions">
          <button class="btn btn-warn btn-sm" onclick="abrirModal(${p.id})">Editar</button>
          <button class="btn btn-danger btn-sm" onclick="deletarProduto(${p.id})">Remover</button>
        </div>
      </td>
    </tr>`
    )
    .join("");
}

// ===== RENDERIZAÇÃO DE STATS =====
function renderStats(produtos) {
  const total = produtos.length;
  const disponivel = produtos.filter((p) => p.status === "disponivel").length;
  const emprestado = produtos.filter((p) => p.status === "emprestado").length;
  const manutencao = produtos.filter((p) => p.status === "manutencao").length;

  document.getElementById("stats").innerHTML = `
    <div class="stat"><span class="stat-val">${total}</span><span class="stat-label">Total</span></div>
    <div class="stat"><span class="stat-val green">${disponivel}</span><span class="stat-label">Disponíveis</span></div>
    <div class="stat"><span class="stat-val orange">${emprestado}</span><span class="stat-label">Emprestados</span></div>
    <div class="stat"><span class="stat-val red">${manutencao}</span><span class="stat-label">Manutenção</span></div>
  `;
}

// ===== LISTAR PRODUTOS =====
async function listarProdutos() {
  const nome = document.getElementById("f-nome").value;
  const tipo = document.getElementById("f-tipo").value;
  const status = document.getElementById("f-status").value;

  const params = new URLSearchParams();
  // Corrigido aqui: mudamos de "nome" para "busca" para alinhar com o server.js
  if (nome) params.append("busca", nome); 
  if (tipo) params.append("tipo", tipo);
  if (status) params.append("status", status);

  try {
    const [resFiltrado, resTodos] = await Promise.all([
      fetch(`${API}/produtos?${params}`),
      fetch(`${API}/produtos`),
    ]);

    const filtrados = await resFiltrado.json();
    const todos = await resTodos.json();

    renderTabela(filtrados);
    renderStats(todos);
  } catch (err) {
    toast(
      "Erro ao conectar com o servidor. Verifique se o server.js está rodando.",
      "error"
    );
    console.error(err);
  }
}

// ===== CRIAR PRODUTO =====
async function criarProduto() {
  const nome = document.getElementById("inp-nome").value.trim();
  const tipo = document.getElementById("inp-tipo").value.trim();
  const status = document.getElementById("inp-status").value;
  const descricao = document.getElementById("inp-descricao").value.trim();

  if (!nome || !tipo || !descricao) {
    toast("Nome, tipo e descrição são obrigatórios.", "error");
    return;
  }

  try {
    const res = await fetch(`${API}/produtos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, tipo, status, descricao }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast(data.erro || "Erro ao criar produto.", "error");
      return;
    }

    toast(`Produto "${data.nome}" criado com ID #${data.id}!`);
    document.getElementById("inp-nome").value = "";
    document.getElementById("inp-tipo").value = "";
    document.getElementById("inp-descricao").value = "";
    listarProdutos();
  } catch (err) {
    toast("Erro ao criar produto.", "error");
    console.error(err);
  }
}

// ===== DELETAR PRODUTO =====
async function deletarProduto(id) {
  if (!confirm(`Tem certeza que deseja remover o produto #${id}?`)) return;

  try {
    const res = await fetch(`${API}/produtos/${id}`, { method: "DELETE" });

    if (!res.ok) {
      const data = await res.json();
      toast(data.erro || "Erro ao remover.", "error");
      return;
    }

    toast("Produto removido com sucesso.");
    listarProdutos();
  } catch (err) {
    toast("Erro ao remover produto.", "error");
    console.error(err);
  }
}

// ===== MODAL DE EDIÇÃO =====
let produtoAtual = null;

async function abrirModal(id) {
  try {
    const res = await fetch(`${API}/produtos/${id}`);

    if (!res.ok) {
      toast("Produto não encontrado.", "error");
      return;
    }

    const p = await res.json();
    produtoAtual = p;

    document.getElementById("edit-id").value = p.id;
    document.getElementById("edit-nome").value = p.nome;
    document.getElementById("edit-tipo").value = p.tipo;
    document.getElementById("edit-status").value = p.status;
    document.getElementById("edit-descricao").value = p.descricao || "";
    document.getElementById("modal-id-chip").textContent = `#${p.id}`;
    document.getElementById("overlay").classList.add("open");
  } catch (err) {
    toast("Erro ao carregar produto.", "error");
    console.error(err);
  }
}

function fecharModal(e) {
  if (e && e.target !== document.getElementById("overlay")) return;
  document.getElementById("overlay").classList.remove("open");
}

// Fechar modal com ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    fecharModal({ target: document.getElementById("overlay") });
  }
});

// ===== SALVAR EDIÇÃO =====
async function salvarEdicao() {
  const id = parseInt(document.getElementById("edit-id").value);
  const nome = document.getElementById("edit-nome").value.trim();
  const tipo = document.getElementById("edit-tipo").value.trim();
  const status = document.getElementById("edit-status").value;
  const descricao = document.getElementById("edit-descricao").value.trim();

  if (!nome || !tipo || !descricao) {
    toast("Nome, tipo e descrição são obrigatórios.", "error");
    return;
  }

  try {
    const res = await fetch(`${API}/produtos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, tipo, status, descricao }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast(data.erro || "Erro ao atualizar.", "error");
      return;
    }

    toast(`Produto #${id} atualizado com sucesso!`);
    document.getElementById("overlay").classList.remove("open");
    listarProdutos();
  } catch (err) {
    toast("Erro ao atualizar produto.", "error");
    console.error(err);
  }
}

// ===== LIMPAR FILTROS =====
function limparFiltros() {
  document.getElementById("f-nome").value = "";
  document.getElementById("f-tipo").value = "";
  document.getElementById("f-status").value = "";
  listarProdutos();
}

// ===== INICIALIZAÇÃO =====
document.addEventListener("DOMContentLoaded", () => {
  listarProdutos();
});