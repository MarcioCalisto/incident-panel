# Guia de Estudo: Painel de Incidentes
**React + JavaScript + HTML + CSS + API** · versão final (código funcional de cada arquivo)

> Complementa o `repository.md` (conceitos 1–21 do `IncidentForm`).
> Aqui: arquitetura, cada arquivo, comunicação, regras, boas práticas e depuração.

---

## 0. Arquitetura

```
src/
├── main.jsx                   → monta <App /> no #root
├── App.jsx                    → tela: usa o hook e distribui props
├── components/
│   ├── IncidentForm.jsx       → formulário controlado e validado
│   ├── IncidentList.jsx       → lista + estado vazio
│   └── IncidentItem.jsx       → uma linha (checkbox, título, prioridade, remover)
├── services/
│   ├── http.js                → fetch genérico (URL base, JSON, erros)
│   ├── incidentsApi.js        → endpoints do recurso + normalização dos dados
│   └── useIncidents.js        → hook: estado + loading + erro + ações
└── utils/validateIncident.js  → regras de validação (JS puro)
```

**Responsabilidade de cada camada**

| Camada | Faz | Não faz |
|---|---|---|
| `http.js` | Chamada HTTP, JSON, `ApiError` | Não conhece incidentes |
| `incidentsApi.js` | Rotas e formato dos dados | Não guarda estado |
| `useIncidents.js` | Estado, loading, erro, ações | Não desenha tela |
| `App.jsx` | Compõe a tela | Não conhece URL nem `fetch` |
| Componentes | Desenham e emitem eventos | Não alteram a lista |
| `validateIncident.js` | Regras de validação | Não conhece React |

**Fluxo de dados** (dados descem por props, eventos sobem por callbacks):

```
API ⇄ http.js ⇄ incidentsApi.js ⇄ useIncidents (estado)
                                      │
                                    App.jsx
          ┌───────────────────────────┼──────────────────────┐
     IncidentForm                IncidentList            mensagens
   onSubmit(create)        incidents, onToggle, onRemove  (loading/erro)
          │                          │
   validateIncident            IncidentItem
```

---

## 1. `utils/validateIncident.js`

```js
export const PRIORITES = ["baixa", "alta", "media"];

export function validateIncident(values) {
  const errors = {};
  const title = values.title?.trim() ?? "";
  const description = values.description?.trim() ?? "";

  if (title.length < 5) {
    errors.title = "O título deve ter pelo menos 5 caracteres.";
  } else if (title.length > 80) {
    errors.title = "O título deve ter no máximo 80 caracteres.";
  }

  if (description.length > 500) {
    errors.description = "A descrição deve ter no máximo 500 caracteres.";
  }

  if (!PRIORITES.includes(values.priority)) {
    errors.priority = "Selecione uma prioridade válida.";
  }

  return errors;
}

export const hasErrors = (errors) => Object.keys(errors).length > 0;
```

| Bloco | Explicação |
|---|---|
| `export const` / `export function` | Exportação **nomeada**: importa com `{ }` e nome idêntico |
| `values.title?.trim() ?? ""` | `?.` evita erro com `undefined`; `??` aplica `""` só para `null/undefined`; `trim` ignora espaços nas pontas |
| `errors = {}` | Objeto acumulador: chave = campo, valor = mensagem |
| `.includes(valor)` | Compara de forma estrita (sensível a maiúsculas) |
| `Object.keys(errors).length > 0` | Há erro se existir ao menos uma chave |

**Regras:** função **pura** (mesma entrada, mesma saída, sem efeito colateral), fácil de testar. Validação no front é conveniência de UX; **o backend sempre valida de novo**.

---

## 2. `services/http.js` — camada HTTP

```js
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function request(path, { method = "GET", body, signal } = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    signal,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = data?.detail;
    const message =
      typeof detail === "string" ? detail
      : Array.isArray(detail) ? detail.map((d) => d.msg).join("; ")
      : null;
    throw new ApiError(message ?? `Erro HTTP ${response.status}`, response.status, data);
  }

  return data;
}
```

| Bloco | Explicação |
|---|---|
| `import.meta.env.VITE_API_URL` | Variável de ambiente do Vite. Só chega ao navegador com prefixo `VITE_`. Defina em `.env`. **Nunca ponha segredos**: o bundle é público |
| `class ApiError extends Error` | Erro com `status` e `details`. Permite `e instanceof ApiError && e.status === 404` |
| `super(message)` | Obrigatório antes de usar `this` |
| `{ method = "GET", body, signal } = {}` | Desestruturação com padrões; o `= {}` permite `request("/x")` |
| `headers: body ? {...} : undefined` | Só envia `Content-Type` quando há corpo |
| `JSON.stringify(body)` | Objeto JS → texto JSON |
| `status === 204` | Sem conteúdo (comum em DELETE): não há corpo para ler |
| `.json().catch(() => null)` | Corpo inválido vira `null`, sem explodir |
| `!response.ok` | `ok` = status 200–299. **`fetch` não rejeita em 404/500**, só em falha de rede, por isso o `throw` manual |
| `detail` | FastAPI usa `detail` (singular): string simples ou lista de objetos com `msg` (erro 422) |
| `signal` | Cancelamento via `AbortController` |

**Códigos HTTP:** 200 OK · 201 Created · 204 No Content · 400 Bad Request · 401 não autenticado · 403 sem permissão · 404 não encontrado · 422 validação · 500 erro de servidor.
**Métodos REST:** GET (ler) · POST (criar) · PUT/PATCH (atualizar) · DELETE (remover).

---

## 3. `services/incidentsApi.js` — endpoints e normalização

```js
import { request } from "./http.js";

// Converte o registro da API para o formato interno do front.
const fromApi = (r) => ({
  id: r.id ?? r.Id ?? r._id,
  title: r.title ?? r.Title ?? r.titulo ?? r.Titulo ?? "",
  description: r.description ?? r.Description ?? r.descricao ?? r.Descricao ?? "",
  priority: String(r.priority ?? r.Priority ?? r.prioridade ?? r.Prioridade ?? "media").toLowerCase(),
  resolved: Boolean(r.resolved ?? r.Resolved ?? r.resolvido ?? r.Resolvido),
});

export const incidentsApi = {
  list: async (signal) => (await request("/incidents", { signal })).map(fromApi),
  create: async (payload) =>
    fromApi(await request("/incidents", { method: "POST", body: payload })),
  update: async (id, payload) =>
    fromApi(await request(`/incidents/${id}`, { method: "PATCH", body: payload })),
  remove: (id) => request(`/incidents/${id}`, { method: "DELETE" }),
};
```

**Por que normalizar?** A API pode usar outros nomes de chave (`Id`, `Titulo`...). Converter **uma vez, na fronteira**, mantém o resto do app limpo (`incident.id`, `incident.title`). Se a API também **receber** nomes diferentes no POST/PATCH, converta o `payload` antes de enviar.

**Padrão do objeto `api`:** um objeto com funções nomeadas por ação. Trocar a URL ou o método altera só este arquivo.

**Descobrir o formato real:** F12 → Rede → requisição `GET /incidents` → aba Resposta; ou `console.log(data[0])` temporário dentro de `list`.

---

## 4. `services/useIncidents.js` — hook customizado

```js
import { useCallback, useEffect, useState } from "react";
import { incidentsApi } from "./incidentsApi";

export function useIncidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      setIncidents(await incidentsApi.list(signal));
    } catch (err) {
      if (err.name === "AbortError") return;
      setError(err.message || "Falha ao carregar incidentes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const create = useCallback(async (payload) => {
    const created = await incidentsApi.create(payload);
    setIncidents((prev) => [created, ...prev]);
    return created;
  }, []);

  const update = useCallback(async (id, changes) => {
    const updated = await incidentsApi.update(id, changes);
    setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated } : i)));
    return updated;
  }, []);

  const remove = useCallback(async (id) => {
    await incidentsApi.remove(id);
    setIncidents((prev) => prev.filter((i) => i.id !== id));
  }, []);

  return { incidents, loading, error, reload: () => load(), create, update, remove };
}
```

| Bloco | Explicação |
|---|---|
| **Hook customizado** | Função que começa com `use` e usa outros hooks. Empacota lógica reutilizável |
| 3 estados `incidents/loading/error` | Toda tela com dados remotos precisa tratar: **carregando, erro, sucesso** |
| `useCallback` | Mantém a mesma referência da função entre renderizações; necessário porque `load` está nas dependências do `useEffect` |
| `AbortController` + `return () => controller.abort()` | **Cleanup**: cancela a requisição se o componente sumir, evitando atualizar estado desmontado |
| `err.name === "AbortError"` | Cancelamento não é erro de verdade: ignore |
| `finally` | Roda sempre: garante `loading = false` |
| `create/update/remove` | **Lançam** o erro (não capturam): quem chama decide como mostrar |
| `{ ...i, ...updated }` | Troca o item sem mutar e preserva campos que a API não devolveu |
| `[created, ...prev]` | Novo item no topo, array novo (imutabilidade) |

**Regra de ouro:** primeiro a API confirma, depois o estado muda (estratégia **conservadora**). A variação **otimista** está na seção 9.

---

## 5. `App.jsx` — composição da tela

```jsx
import { useEffect, useState } from "react";
import IncidentForm from "./components/IncidentForm.jsx";
import IncidentList from "./components/IncidentList.jsx";
import { useIncidents } from "./services/useIncidents.js";
import "./index.css";

export default function App() {
  const { incidents, loading, error, reload, create, update, remove } = useIncidents();
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    const pending = incidents.filter((i) => !i.resolved).length;
    document.title = `Incidentes (${pending})`;
  }, [incidents]);

  async function safe(action) {
    setActionError("");
    try {
      await action();
    } catch (e) {
      setActionError(e.message || "Não foi possível concluir a ação.");
    }
  }

  const handleToggle = (id) => {
    const current = incidents.find((i) => i.id === id);
    if (current) safe(() => update(id, { resolved: !current.resolved }));
  };

  const handleRemove = (id) => safe(() => remove(id));

  return (
    <main className="container">
      <h1>Painel de Incidentes</h1>

      <IncidentForm onSubmit={create} />

      {actionError && <p role="alert" className="error">{actionError}</p>}
      {loading && <p role="status">Carregando incidentes...</p>}

      {error && (
        <div role="alert">
          <p className="error">{error}</p>
          <button type="button" onClick={reload}>Tentar novamente</button>
        </div>
      )}

      {!loading && !error && (
        <IncidentList incidents={incidents} onToggle={handleToggle} onRemove={handleRemove} />
      )}
    </main>
  );
}
```

| Bloco | Explicação |
|---|---|
| `useIncidents()` | O `App` só consome; não sabe de URL nem `fetch` |
| `useEffect(..., [incidents])` | Efeito colateral (título da aba) que roda quando a lista muda. `[]` = só ao montar; sem array = todo render |
| `safe(action)` | Envolve ações sem `catch` próprio (toggle/remove) para o erro aparecer na tela em vez de virar *unhandled rejection* |
| `onSubmit={create}` | O `create` do hook é `async` e lança erro; o `catch` do `IncidentForm` mostra a mensagem |
| `{cond && <X />}` | Renderização condicional |
| `!loading && !error &&` | Só mostra a lista quando há sucesso |

**Regras:** não guarde em estado o que pode ser **calculado** (`pending` é derivado de `incidents`). **Importações só do que usa**; nada de estado ou handlers duplicados.

---

## 6. `components/IncidentForm.jsx`

Linha a linha: **`repository.md`, seções 1–21**. Código final:

```jsx
import { useState } from "react";
import { PRIORITES, hasErrors, validateIncident } from "../utils/validateIncident";

const EMPTY = { title: "", description: "", priority: "media" };

export default function IncidentForm({ onSubmit, initialValues = EMPTY }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    const next = { ...values, [name]: value };
    setValues(next);
    if (touched[name]) setErrors(validateIncident(next));
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors(validateIncident(values));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const found = validateIncident(values);
    setErrors(found);
    setTouched({ title: true, description: true, priority: true });
    if (hasErrors(found)) return;

    setSubmitting(true);
    setSubmitError("");
    try {
      await onSubmit({ ...values, title: values.title.trim() });
      setValues(EMPTY);
      setTouched({});
      setErrors({});
    } catch (error) {
      setSubmitError(error.message || "Não foi possível salvar o incidente");
    } finally {
      setSubmitting(false);
    }
  }

  const showError = (name) => touched[name] && errors[name];

  return (
    <form onSubmit={handleSubmit} noValidate className="form">
      <div className="field">
        <label htmlFor="title">Título</label>
        <input
          id="title" name="title" value={values.title}
          onChange={handleChange} onBlur={handleBlur}
          aria-invalid={Boolean(showError("title"))}
          aria-describedby={showError("title") ? "title-error" : undefined}
        />
        {showError("title") && <p id="title-error" role="alert" className="error">{errors.title}</p>}
      </div>

      <div className="field">
        <label htmlFor="description">Descrição</label>
        <textarea
          id="description" name="description" rows={3} value={values.description}
          onChange={handleChange} onBlur={handleBlur}
          aria-invalid={Boolean(showError("description"))}
          aria-describedby={showError("description") ? "description-error" : undefined}
        />
        {showError("description") && <p id="description-error" role="alert" className="error">{errors.description}</p>}
      </div>

      <div className="field">
        <label htmlFor="priority">Prioridade</label>
        <select id="priority" name="priority" value={values.priority}
          onChange={handleChange} onBlur={handleBlur}>
          {PRIORITES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        {showError("priority") && <p id="priority-error" role="alert" className="error">{errors.priority}</p>}
      </div>

      {submitError && <p role="alert" className="error">{submitError}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? "Salvando..." : "Salvar incidente"}
      </button>
    </form>
  );
}
```

**Pontos-chave**
- **Componente controlado:** `value` vem do estado, `onChange` atualiza. O React é a fonte da verdade.
- `name` do input **igual** à chave do estado: é o que faz `[name]: value` funcionar.
- `handleChange` valida `next` (o valor novo), não `values` (o antigo).
- `touched` controla **quando** mostrar o erro (só após sair do campo ou tentar enviar).
- **Contrato com o pai:** `onSubmit` retorna Promise e **lança** erro em caso de falha; senão o `catch` nunca roda.
- `noValidate` desliga os balões nativos do navegador.
- `aria-describedby` só aponta para o id quando o erro existe.
- Após sucesso, limpe `values`, `touched` e `errors`.

---

## 7. `components/IncidentItem.jsx`

```jsx
export default function IncidentItem({ incident, onToggle, onRemove }) {
  const { id, title, priority, resolved } = incident;

  return (
    <li className={resolved ? "item resolved" : "item"}>
      <label>
        <input type="checkbox" checked={Boolean(resolved)} onChange={() => onToggle(id)} />
        <span>{title}</span>
      </label>
      <span className={`badge badge-${priority}`}>{priority}</span>
      <button type="button" onClick={() => onRemove(id)} aria-label={`Remover ${title}`}>
        Remover
      </button>
    </li>
  );
}
```

| Bloco | Explicação |
|---|---|
| Desestruturação nas props e no objeto | Evita repetir `incident.` |
| `className={cond ? "a b" : "a"}` | Classe condicional (o CSS risca o texto de `.resolved`) |
| `checked={Boolean(resolved)}` | Checkbox controlado usa `checked`; sempre booleano para não virar "não controlado" |
| `onChange={() => onToggle(id)}` | **Arrow function**: passa uma função; `onToggle(id)` direto executaria na renderização |
| `<label>` envolvendo o input | Clicar no texto marca o checkbox sem precisar de `htmlFor` |
| `` `badge badge-${priority}` `` | Template string gera `badge-alta`, que o CSS estiliza |
| `type="button"` | Não dispara submit se estiver dentro de um `<form>` |
| `aria-label` | Leitor de tela anuncia "Remover Impressora offline" |

**Comunicação:** o item **não altera nada**. Só avisa o pai (`onToggle`, `onRemove`) — *lifting state up*.
**Convenção:** arquivo, componente e import com o **mesmo nome em PascalCase** (Linux/Vercel diferenciam maiúsculas).

---

## 8. `components/IncidentList.jsx`

```jsx
import IncidentItem from "./IncidentItem.jsx";

export default function IncidentList({ incidents = [], onToggle, onRemove }) {
  if (incidents.length === 0) {
    return <p>Nenhum incidente cadastrado.</p>;
  }

  return (
    <ul className="list">
      {incidents.map((incident) => (
        <IncidentItem
          key={incident.id}
          incident={incident}
          onToggle={onToggle}
          onRemove={onRemove}
        />
      ))}
    </ul>
  );
}
```

- **Early return** para o estado vazio.
- `incidents = []` evita erro se a prop vier `undefined`.
- `.map()` converte dados em elementos; **`key` = id estável e único** (nunca o índice em listas que mudam).
- A lista só **repassa** callbacks (*prop drilling* de um nível).
- `<ul>` só aceita `<li>` como filho direto; o `IncidentItem` devolve `<li>`.

---

## 9. Atualização otimista (evolução)

Atualiza a tela antes da resposta e desfaz se falhar. Dentro de `useIncidents`:

```js
const toggle = useCallback(async (id) => {
  const current = incidents.find((i) => i.id === id);
  if (!current) return;

  setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, resolved: !i.resolved } : i))); // 1. tela
  try {
    await incidentsApi.update(id, { resolved: !current.resolved });                            // 2. servidor
  } catch (err) {
    setIncidents((prev) => prev.map((i) => (i.id === id ? current : i)));                      // 3. reverte
    throw err;
  }
}, [incidents]);
```
Exporte `toggle` no `return` do hook e use `safe(() => toggle(id))` no `App`.
**Quando usar:** ações de baixo risco e alta frequência (marcar, curtir). Para criar/remover, prefira a estratégia conservadora.

---

## 10. API: como rodar e integrar

**API fake rápida (json-server)** — segundo terminal, com o `npm run dev` rodando no primeiro:
```bash
npx json-server db.json --port 8000
```
`db.json`:
```json
{ "incidents": [
  { "id": "1", "title": "Sem acesso ao ERP", "description": "", "priority": "alta", "resolved": false }
] }
```
As rotas já batem com `incidentsApi`: `GET/POST /incidents`, `PATCH/DELETE /incidents/:id`.

**CORS (FastAPI):** liberar a origem do front **no backend**:
```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"],
                   allow_methods=["*"], allow_headers=["*"])
```

**Variável de ambiente:** `.env` com `VITE_API_URL=http://localhost:8000`; no deploy (Vercel), configure no painel e faça novo build.

---

## 11. Conceitos transversais

### JavaScript
- **Desestruturação** `{a, b} = obj`, `[x, y] = arr` · **Spread** `{...obj}`, `[...arr]` (cópia rasa) · **Propriedade computada** `{[k]: v}`.
- **Arrow functions**, **template strings**, `?.`, `??`, `&&`, ternário.
- **Falsy:** `false, 0, "", null, undefined, NaN`. `{0 && <X/>}` renderiza `0`; use `{n > 0 && <X/>}`.
- **Promises:** `async` retorna Promise; `await` só dentro de `async`; `try/catch/finally` trata falhas.
- **Módulos:** `export default` (1 por arquivo, importa sem `{}`) vs nomeada (com `{}`).

### React — regras
1. **Hooks** só no topo do componente (nunca em `if`, loop ou função aninhada).
2. Componente = função com **inicial maiúscula** que retorna JSX com **um único elemento raiz** (ou `<>...</>`).
3. **Props são somente leitura.**
4. O estado atualiza de forma **agendada**: após `setX(v)`, `x` ainda tem o valor antigo naquela execução.
5. Estado que depende do anterior: **atualização funcional** (`prev =>`).
6. **Imutabilidade:** nunca `push` nem `obj.campo = ...`; crie cópias (`map`, `filter`, spread).
7. JSX em camelCase: `className`, `htmlFor`, `onClick`, `onChange`, `rows`, `noValidate`; `aria-*` e `data-*` mantêm hífen.
8. Toda lista com `.map` precisa de `key` estável.
9. **Um bloco de código = um arquivo.** JSX só em `.jsx`.

### HTML usado
- Formulário: `<form>` → `<div class="field">` → `<label for>` + `<input id>`; `label.htmlFor` = `input.id`.
- Semântica: `<main>`, `<h1>`, `<ul><li>`, `<button type="button|submit">`.
- Acessibilidade: `aria-invalid`, `aria-describedby`, `aria-label`, `role="alert"` (erros) e `role="status"` (carregando).

### CSS base
```css
.container { max-width: 640px; margin: 2rem auto; padding: 0 1rem; font-family: system-ui; }
.form  { display: grid; gap: 1rem; }
.field { display: grid; gap: .25rem; }
.error { color: #b00020; font-size: .875rem; margin: 0; }
input[aria-invalid="true"], textarea[aria-invalid="true"] { border-color: #b00020; }
.list  { list-style: none; padding: 0; display: grid; gap: .5rem; }
.item  { display: flex; align-items: center; justify-content: space-between; gap: .75rem;
         padding: .5rem .75rem; border: 1px solid #ddd; border-radius: 8px; }
.item.resolved span:first-of-type { text-decoration: line-through; opacity: .6; }
.badge { padding: .1rem .5rem; border-radius: 999px; font-size: .75rem; }
.badge-alta { background: #fde2e2; } .badge-media { background: #fff3cd; } .badge-baixa { background: #dff5e3; }
button:disabled { opacity: .6; cursor: not-allowed; }
```
`class` no HTML = `className` no JSX. Nome diferente entre JSX e CSS não gera erro, só deixa de aplicar o estilo.

---

## 12. Como depurar (ordem de ataque)

1. **Overlay vermelho do Vite:** erro de compilação. Leia o arquivo e a linha; **corrija sempre a primeira mensagem** (as demais costumam ser consequência).
2. **Console (F12):** `X is not defined` / `not a function` = nome, import ou declaração faltando.
3. **Erro `does not provide an export named 'default'`:** o arquivo não tem `export default`.
4. **Tela em branco:** erro de renderização (ex.: `undefined.map`). Veja o console.
5. **Nada acontece ao clicar:** handler com nome errado (o React não avisa).
6. **Estilo não aplica:** compare `className` com o CSS.
7. **Rede (aba Rede):** sem status = servidor desligado ou porta errada; status 200 bloqueado = falta CORS no backend; **URL com `undefined`** = propriedade com nome errado (`id`, por exemplo); 404 = rota errada; 422 = payload inválido.
8. **"Funciona local, quebra no deploy":** diferença de maiúsculas em nomes de arquivo e variáveis `VITE_` ausentes no painel.
9. **Erro engolido por `catch`:** coloque `console.error(err)` temporário no `catch` para ver a linha real.
10. Ferramentas: `console.log`, React DevTools e `git diff` para ver o que mudou.

---

## 13. Roteiro de estudo
1. Refaça cada arquivo digitando, não copiando.
2. Implemente o `toggle` otimista (seção 9).
3. Crie um backend FastAPI com `GET/POST/PATCH/DELETE /incidents` e CORS.
4. Adicione filtros (todos/pendentes/resolvidos) com valor derivado ou `useMemo`.
5. Escreva testes de `validateIncident` (função pura, ideal para começar).
6. Faça o deploy no Vercel configurando `VITE_API_URL`.