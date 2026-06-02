/**
 * server.js — DSW 2026 / UNEMAT
 * Backend com Bun + Express para Gestão de Produtos (Com campo Descrição)
 * Porta: 3003
 */

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3003;

// ─── Middlewares ────────────────────────────────────────────────────────────
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// ─── Banco em memória ───────────────────────────────────────────────────────
let produtos = [
  { id: 1, nome: "Notebook Dell Inspiron", tipo: "notebook",   status: "disponivel", descricao: "Intel i7, 16GB RAM, SSD 512GB" },
  { id: 2, nome: "Projetor Epson",         tipo: "projetor",   status: "emprestado",  descricao: "PowerLite X49+ com entrada HDMI" },
  { id: 3, nome: "Mouse Logitech",         tipo: "periferico", status: "disponivel",  descricao: "Mouse sem fio ergonômico M510" },
  { id: 4, nome: "Teclado Mecânico",       tipo: "periferico", status: "manutencao",  descricao: "Teclado RGB Switch Blue" },
  { id: 5, nome: "Monitor LG 24\"",        tipo: "monitor",    status: "disponivel",  descricao: "Monitor Full HD IPS 75Hz" },
];
let nextId = 6;

const STATUS_VALIDOS = ["disponivel", "emprestado", "manutencao"];

// ─── Rotas ──────────────────────────────────────────────────────────────────

// GET /produtos (Filtros: busca, tipo, status)
app.get("/produtos", (req, res) => {
  const busca = (req.query.busca || "").toLowerCase();
  const tipo = (req.query.tipo || "").toLowerCase();
  const status = req.query.status || "";

  let resultado = produtos;

  // Filtra por nome ou descrição caso haja um termo de busca
  if (busca) {
    resultado = resultado.filter(p => 
      p.nome.toLowerCase().includes(busca) || 
      p.descricao.toLowerCase().includes(busca)
    );
  }
  if (tipo)   resultado = resultado.filter(p => p.tipo.toLowerCase().includes(tipo));
  if (status) resultado = resultado.filter(p => p.status === status);

  return res.json(resultado);
});

// GET /produtos/:id
app.get("/produtos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const produto = produtos.find(p => p.id === id);

  if (!produto) {
    return res.status(404).json({ erro: "Produto não encontrado." });
  }

  return res.json(produto);
});

// POST /produtos
app.post("/produtos", (req, res) => {
  const { nome, tipo, status, descricao } = req.body;

  if (!nome || typeof nome !== "string" || !nome.trim())
    return res.status(400).json({ erro: "Campo 'nome' é obrigatório." });
  if (!tipo || typeof tipo !== "string" || !tipo.trim())
    return res.status(400).json({ erro: "Campo 'tipo' é obrigatório." });
  if (!descricao || typeof descricao !== "string" || !descricao.trim())
    return res.status(400).json({ erro: "Campo 'descrição' é obrigatório." });
  if (status && !STATUS_VALIDOS.includes(status))
    return res.status(400).json({ erro: `Status inválido. Use: ${STATUS_VALIDOS.join(", ")}` });

  const novo = {
    id: nextId++,
    nome: nome.trim(),
    tipo: tipo.trim(),
    status: status || "disponivel",
    descricao: descricao.trim()
  };

  produtos.push(novo);
  return res.status(201).json(novo);
});

// PUT /produtos/:id
app.put("/produtos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const idx = produtos.findIndex(p => p.id === id);

  if (idx === -1) {
    return res.status(404).json({ erro: "Produto não encontrado." });
  }

  const { nome, tipo, status, descricao } = req.body;

  if (!nome || typeof nome !== "string" || !nome.trim())
    return res.status(400).json({ erro: "Campo 'nome' é obrigatório." });
  if (!tipo || typeof tipo !== "string" || !tipo.trim())
    return res.status(400).json({ erro: "Campo 'tipo' é obrigatório." });
  if (!descricao || typeof descricao !== "string" || !descricao.trim())
    return res.status(400).json({ erro: "Campo 'descrição' é obrigatório." });
  if (status && !STATUS_VALIDOS.includes(status))
    return res.status(400).json({ erro: `Status inválido. Use: ${STATUS_VALIDOS.join(", ")}` });

  produtos[idx] = {
    ...produtos[idx],
    nome: nome.trim(),
    tipo: tipo.trim(),
    status: status || produtos[idx].status,
    descricao: descricao.trim()
  };

  return res.json(produtos[idx]);
});

// DELETE /produtos/:id
app.delete("/produtos/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const idx = produtos.findIndex(p => p.id === id);

  if (idx === -1) {
    return res.status(404).json({ erro: "Produto não encontrado." });
  }

  const removido = produtos.splice(idx, 1)[0];
  return res.json({ mensagem: "Produto removido.", produto: removido });
});

// Rota coringa para erros 404
app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada." });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor DSW 2026 rodando com Bun + Express em http://localhost:${PORT}`);
});