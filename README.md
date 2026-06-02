# Gestão de Produtos — CRUD Completo

**Disciplina:** Desenvolvimento de Software para Web — DSW 2026/1  
**Instituição:** UNEMAT — Universidade do Estado de Mato Grosso  
**Professor:** Ivan Luiz Pedroso Pires  

**Integrantes:**
- Lana Emanuelle
- David Costa

---

## Descrição

Aplicação web para gerenciamento de produtos com CRUD completo. O backend é construído com **Bun + Express** e a persistência é feita em memória (array). O frontend utiliza HTML, CSS e JavaScript puro, consumindo a API via `fetch`.

---

## Estrutura do Projeto

```
/
├── backend/
│   ├── server.js       # Servidor Express com todas as rotas REST
│   └── package.json    # Dependências e scripts
└── frontend/
    ├── index.html      # Interface da aplicação
    ├── main.css        # Estilos
    └── main.js         # Lógica do frontend (fetch, DOM)
```

---

## Rotas implementadas

| Método | Rota           | Descrição                                              |
|--------|----------------|--------------------------------------------------------|
| GET    | /produtos      | Lista todos os produtos (filtros: `busca`, `tipo`, `status`) |
| GET    | /produtos/:id  | Retorna um produto pelo ID (404 se não existir)        |
| POST   | /produtos      | Cria um novo produto (status 201 + produto criado)     |
| PUT    | /produtos/:id  | Atualiza um produto existente (404 se não existir)     |
| DELETE | /produtos/:id  | Remove um produto (404 se não existir)                 |

---

## Como instalar e rodar

### Pré-requisitos

- [Bun](https://bun.sh) instalado na máquina  
  Instalar com: `curl -fsSL https://bun.sh/install | bash`

### 1. Instalar dependências do backend

```bash
cd backend
bun install
```

### 2. Iniciar o servidor

```bash
bun run dev
```

O servidor estará disponível em: `http://localhost:3003`

### 3. Abrir o frontend

Abra o arquivo `frontend/index.html` diretamente no navegador, ou use a extensão **Live Server** do VS Code para evitar problemas de CORS.

---

## Exemplos de uso (curl)

```bash
# Listar todos os produtos
curl http://localhost:3003/produtos

# Filtrar por status
curl "http://localhost:3003/produtos?status=disponivel"

# Buscar por nome ou descrição
curl "http://localhost:3003/produtos?busca=notebook"

# Criar produto
curl -X POST http://localhost:3003/produtos \
  -H "Content-Type: application/json" \
  -d '{"nome":"Notebook Dell","tipo":"notebook","status":"disponivel","descricao":"Intel i7, 16GB RAM"}'

# Atualizar produto
curl -X PUT http://localhost:3003/produtos/1 \
  -H "Content-Type: application/json" \
  -d '{"nome":"Notebook Dell XPS","tipo":"notebook","status":"emprestado","descricao":"Atualizado"}'

# Remover produto
curl -X DELETE http://localhost:3003/produtos/1
```
