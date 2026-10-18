# Guia de Estudo: Painel de Incidentes (React + JS + HTML + CSS + API)

> Complementa o `repository.md` (conceitos 1–21 do `IncidentForm`, que continuam válidos).
> Aqui: **todos os arquivos**, como se comunicam, regras, exceções, bugs e boas práticas.

---

## 0. Mapa do projeto

```
src/
├── App.jsx                    → componente raiz, guarda a lista (estado)
├── components/
│   ├── IncidentForm.jsx       → formulário validado (criar incidente)
│   ├── IncidentList.jsx       → recebe a lista e renderiza itens
│   └── IncidentItem.jsx       → 1 linha: checkbox, título, prioridade, remover
├── services/http.js           → camada de comunicação com a API (fetch)
└── utils/validateIncident.js  → regras de validação (JS puro, sem React)
```

**Fluxo de dados (regra de ouro do React: dados descem por props, eventos sobem por callbacks):**

```
App (estado: incidents)
 ├─ IncidentForm  ── onSubmit(dados) ──▶ App adiciona ao estado
 └─ IncidentList  ◀── incidents, onToggle, onRemove
      └─ IncidentItem ── onToggle(id) / onRemove(id) ──▶ App altera o estado
IncidentForm ──usa──▶ validateIncident.js
(futuro) App ──usa──▶ http.js ──▶ API (FastAPI em localhost:8000)
```

Por que separar em camadas? **UI** (components), **regras** (utils), **rede** (services). Cada parte pode ser testada e trocada sem quebrar as outras.

---

## 1. `utils/validateIncident.js` — regras de negócio

```js
export const PRIORITES = ["baixa", "alta", "media"];
export function validateIncident(values) { ... return errors; }
export const hasErrors = (errors) => Object.keys(errors).length > 0;
```

| Bloco | O que faz | Conceito |
|---|---|---|
| `export const` / `export function` | **Exportação nomeada**: importa-se com `{ }` e o nome deve ser idêntico | ES Modules |
| `values.title?.trim() ?? ""` | `?.` não quebra se `title` for `undefined`; `??` usa `""` só se for `null/undefined` | Optional chaining / Nullish coalescing |
| `const errors = {}` | Objeto acumulador: chave = campo, valor = mensagem | Objetos |
| `.includes(valor)` | Verifica se o array contém o valor (comparação estrita, **sensível a maiúsculas**) | Arrays |
| `Object.keys(errors).length > 0` | Se há ao menos uma chave, há erro | Object API |

**Comunicação:** o `IncidentForm` chama `validateIncident(values)` e recebe `{}` (válido) ou `{ title: "..." }`. `hasErrors` transforma isso em `true/false`.

**Regras/exceções**
- Função **pura**: mesma entrada → mesma saída, sem efeitos colaterais. Fácil de testar.
- `.trim()` evita título só com espaços (`"     "` tem 5 caracteres mas é inválido).
- Validação no front é **conveniência de UX**; o backend **sempre** deve validar de novo (o front pode ser burlado).

**Bugs encontrados**
- Arquivo/import: o form importa `valideteIncident` (typo) mas o arquivo é `validateIncident.js` → **o caminho precisa bater exatamente**.
- `PRIORITES` → grafia correta `PRIORITIES` (mude em todos os usos).
- Mensagens: "O título **devo**" → "deve"; "caractere**res**" → "caracteres"; "propriedade válida" → "**prioridade** válida". Faltam pontos finais em duas mensagens.

**Dica:** guarde as mensagens como constantes se forem reutilizadas (ex.: em testes).

---

## 2. `services/http.js` — camada de API

```js
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
export class ApiError extends Error { constructor(message, status, details) {...} }
export async function request(path, { method = 'GET', body, signal } = {}) {...}
```

| Bloco | Explicação |
|---|---|
| `import.meta.env.VITE_API_URL` | Variável de ambiente do **Vite**. Só variáveis com prefixo `VITE_` chegam ao navegador. Defina em `.env` (`VITE_API_URL=https://minha-api.com`). Nunca coloque segredos aqui: o bundle é público |
| `class ApiError extends Error` | Erro customizado que carrega `status` (404, 500...) e `details` (corpo da resposta). Permite `if (e instanceof ApiError && e.status === 404)` |
| `super(message)` | Chama o construtor de `Error`. **Obrigatório antes de usar `this`** |
| `{ method = 'GET', body, signal } = {}` | Desestruturação com valores padrão. O `= {}` final permite chamar `request("/x")` sem 2º argumento |
| `headers: body ? {...} : undefined` | Só envia `Content-Type: application/json` quando há corpo |
| `JSON.stringify(body)` | Objeto JS → texto JSON (obrigatório no `fetch`) |
| `response.status === 204` | "No Content" (ex.: DELETE com sucesso): não há corpo para ler |
| `response.json().catch(() => null)` | Se o corpo não for JSON válido, não explode: vira `null` |
| `!response.ok` | `ok` é `true` para 200–299. **`fetch` NÃO rejeita em 404/500**, só em falha de rede. Por isso o `throw` manual |
| `signal` | Permite cancelar com `AbortController` (útil ao desmontar componente ou trocar busca) |

**Bugs encontrados (graves)**
1. `cosntructor` → `constructor`. Do jeito atual, o JS ignora e usa o construtor padrão: `status` e `details` ficam `undefined` e `name` não é definido.
2. `return full` → `return null`. `full` não existe → `ReferenceError` em toda resposta 204.
3. `data?.details?.toString()` gera `"[object Object]"` se `details` for objeto (comum no FastAPI: `detail` é string ou lista, **no singular**). Prefira `data?.detail ?? data?.message ?? \`Erro HTTP ${status}\``.

**Códigos HTTP essenciais:** 200 OK · 201 Created · 204 No Content · 400 Bad Request · 401 não autenticado · 403 sem permissão · 404 não encontrado · 422 validação (FastAPI) · 500 erro do servidor.

**Métodos REST:** GET (ler) · POST (criar) · PUT/PATCH (atualizar total/parcial) · DELETE (remover).

**CORS:** se o front (`localhost:5173`) chama a API (`localhost:8000`) e dá erro de CORS, a correção é **no backend** (liberar a origem), não no front.

**Uso típico:**
```js
const lista = await request("/incidents");
const novo  = await request("/incidents", { method: "POST", body: { title: "X" } });
await request(`/incidents/${id}`, { method: "DELETE" });
```

---

## 3. `components/IncidentForm.jsx` — formulário controlado

Detalhamento linha a linha: **`repository.md`, seções 1–21**. Resumo do que importa:

- **Componente controlado:** o valor do input vem do estado (`value={values.title}`) e muda via `onChange`. O React é a "fonte da verdade".
- **3 estados de UX:** `values` (dados), `errors` (mensagens), `touched` (quando mostrar). Erro só aparece após o usuário sair do campo ou tentar enviar.
- **`handleChange` usa `next`**, não `values`: o estado só atualiza na próxima renderização, então validar `values` seria validar o dado antigo.
- **`handleSubmit`:** `preventDefault` → validar → marcar tudo como `touched` → se erro, `return` → `try/catch/finally` com `onSubmit`.
- **Contrato com o pai:** `onSubmit` deve **retornar Promise** (ser `async`) e **lançar erro** se falhar, senão o `catch` nunca roda.

**Bugs adicionais (além da tabela do repository.md)**
- `import { useState } from \`react\`` usa **crases**; use aspas `'react'`.
- Campo **priority** não exibe erro (falta `showError("priority")`), e `description` não tem `aria-invalid`/`aria-describedby`.
- `aria-describedby="title-error"` aponta para um id que só existe quando há erro → use `aria-describedby={showError("title") ? "title-error" : undefined}`.
- Após sucesso, falta `setErrors({})`.

**Boas práticas**
- `noValidate` desliga os balões nativos do navegador para você controlar as mensagens.
- `name` do input **deve ser igual** à chave do estado (`title`, `description`, `priority`), é o que faz o `[name]: value` funcionar.
- Botão `disabled` durante envio evita duplo clique (mas o servidor também deve se proteger).

---

## 4. `components/IncidentItem.jsx` — uma linha da lista

```jsx
export default function IncidentItem({ incident, onToggle, onRemove }) {
  const { id, title, priority, resolved } = incident;
  ...
}
```

| Bloco | Explicação |
|---|---|
| `{ incident, onToggle, onRemove }` | Desestruturação das **props** no parâmetro |
| `const { id, title, ... } = incident` | Desestruturação do objeto recebido |
| `className={resolved ? "item resolved" : "item"}` | Ternário para classe condicional (CSS pode riscar o texto de `.resolved`) |
| `<input type="checkbox" checked={resolved} onChange={() => onToggle(id)} />` | Checkbox **controlado**: `checked` (não `value`). A arrow function `() => ...` evita chamar `onToggle` na renderização |
| `<label>` envolvendo o input | Clicar no texto também marca o checkbox (acessibilidade grátis, sem `htmlFor`) |
| `` className={`badge badge-${priority}`} `` | Template string gera `badge badge-alta` → estilize cada prioridade no CSS |
| `type="button"` | Evita comportamento de submit caso o item esteja dentro de um `<form>` |

**Comunicação:** o item **não altera nada**. Ele só avisa o pai (`onToggle(id)`, `onRemove(id)`); quem muda o estado é o `App`. Isso é "elevar o estado" (*lifting state up*).

**Armadilhas**
- `onClick={onRemove(id)}` **executa na renderização** e causa loop. O certo é `onClick={() => onRemove(id)}`.
- Nome do arquivo: está `incidentItem.jsx` (minúsculo) mas é importado como `IncidentItem.jsx`. **Windows/Mac ignoram maiúsculas, Linux (Vercel/CI) não** → build quebra em produção. Padronize **PascalCase** para componentes.
- `arial-label` → `aria-label`. (E como o botão já tem texto "Remover", o `aria-label` só é útil se quiser algo mais específico: `aria-label={\`Remover ${title}\`}`.)
- Se `resolved` vier `undefined`, o checkbox vira *não controlado* e o React avisa. Garanta booleano: `checked={Boolean(resolved)}`.

---

## 5. `components/IncidentList.jsx` — renderização de lista

```jsx
if (incidents.length === 0) return <p>Nenhum incidente cadastrado.</p>;
return <ul>{incidents.map((i) => <IncidentItem key={i.id} ... />)}</ul>;
```

- **Early return:** trata o "estado vazio" antes do caso normal. Melhora UX e legibilidade.
- **`.map()`** transforma array de dados em array de elementos JSX.
- **`key`**: use um **id estável e único** do dado (`incident.id`). Nunca use o índice se a lista puder reordenar/remover (causa bugs de estado nos itens). `key` não chega como prop ao filho.
- **Repasse de props (prop drilling):** a lista só repassa `onToggle`/`onRemove`; não entende o que fazem.
- **Semântica HTML:** `<ul>` só deve ter `<li>` como filho direto, e o `IncidentItem` retorna `<li>` ✔.

**Erros comuns**
- `incident.map` em vez de `incidents.map` (nome da variável, que você já corrigiu).
- `IncidenteItem` (com "e") no import/uso: funciona porque é consistente, mas é typo. Renomeie para `IncidentItem`.
- Se `incidents` vier `undefined` (API ainda carregando), `.length` quebra. Use valor padrão: `{ incidents = [], ... }`.

---

## 6. `App.jsx` — raiz, estado e efeitos

| Bloco | Explicação |
|---|---|
| `useState(initial)` | Lista de incidentes. Valor inicial usado só na 1ª renderização |
| `const [title, setTitle]` | Estado do input simples de "adicionar rápido" |
| `useEffect(() => {...}, [incidents])` | **Efeito colateral** (mexer no `document.title`, fora do React). O array de dependências `[incidents]` faz rodar **após cada mudança da lista**. `[]` = só ao montar; sem array = a cada render |
| `incidents.filter(i => !i.resolved).length` | Conta pendentes |
| `setIncidents((prev) => [next, ...prev])` | Atualização funcional; `[next, ...prev]` coloca o novo no topo **sem mutar** o array |
| `prev.map(i => i.id === id ? { ...i, resolved: !i.resolved } : i)` | Atualiza **um** item de forma imutável (cópia com spread) |
| `prev.filter(i => i.id !== id)` | Remove por id |
| `id: Date.now()` | Id provisório. Com API, o **backend** gera o id |

**Regra de imutabilidade:** nunca faça `incidents.push(...)` nem `incident.resolved = true`. O React compara referências; sem novo objeto/array, **não re-renderiza**.

**Bugs/atenções encontrados**
- **`IncidentForm` não está sendo usado**: o `App` tem um formulário próprio simples. Para usar o validado, veja o exemplo abaixo.
- **Prioridades inconsistentes:** `initial` usa `"Alta"`/`"Baixa"` (maiúscula), o form usa `"media"`/`"alta"`/`"baixa"`. `validateIncident` rejeitaria `"Alta"`, e `badge-Alta` ≠ `badge-alta` no CSS. **Padronize em minúsculas.**
- `className="conteiner"` → `container` (e igual no CSS).
- `import "./index.css"` normalmente fica em `main.jsx`; funciona no `App` também, mas evite duplicar.
- `useEffect` que só altera o título está correto, mas ele poderia ser um valor derivado: `pending` pode ser calculado direto no render (sem estado extra). Nunca guarde em estado o que pode ser calculado.

**Como ligar o `IncidentForm` ao `App`:**
```jsx
import IncidentForm from "./components/IncidentForm";

async function handleCreate(data) {          // async → o form pode usar await
  // com API: const created = await request("/incidents", { method: "POST", body: data });
  const next = { id: Date.now(), resolved: false, ...data };
  setIncidents((prev) => [next, ...prev]);
}

<IncidentForm onSubmit={handleCreate} />
```
Se `handleCreate` lançar erro (`throw new Error("...")`), o `catch` do form mostra a mensagem.

**Carregando da API (padrão `useEffect` + fetch):**
```jsx
useEffect(() => {
  const controller = new AbortController();
  request("/incidents", { signal: controller.signal })
    .then(setIncidents)
    .catch((e) => { if (e.name !== "AbortError") console.error(e); });
  return () => controller.abort();           // cleanup ao desmontar
}, []);
```

---

## 7. Conceitos transversais

### JavaScript
- **Desestruturação** `{a, b} = obj` / `[x, y] = arr` · **Spread** `{...obj}` `[...arr]` (cópia rasa) · **Propriedade computada** `{[k]: v}`.
- **Arrow functions**, **template strings** `` `${x}` ``, `?.`, `??`, `&&`, ternário `? :`.
- **Falsy:** `false, 0, "", null, undefined, NaN`. Cuidado: `{0 && <X/>}` renderiza `0`; use `{n > 0 && <X/>}`.
- **Promises:** `async` sempre retorna Promise; `await` só dentro de `async`; `try/catch` captura rejeições.
- **Módulos:** `export default` (1 por arquivo, importa sem `{}`) vs exportação nomeada (importa com `{}`).

### React — regras
1. **Hooks** só no topo do componente (nunca dentro de `if`, loop ou função aninhada).
2. Componente = função com **inicial maiúscula** retornando JSX; **um único elemento raiz** (ou `<>...</>`).
3. **Props são somente leitura.**
4. **Estado atualiza de forma assíncrona/agendada:** depois de `setX(v)`, `x` ainda tem o valor antigo naquela execução.
5. Use **atualização funcional** (`prev =>`) quando o novo estado depende do anterior.
6. **Não mute** estado; crie cópias.
7. Atributos JSX em camelCase: `className`, `htmlFor`, `onClick`, `onChange`, `rows`, `noValidate`. Atributos `aria-*` e `data-*` ficam com hífen.
8. Toda lista com `.map` precisa de `key`.

### HTML (usado aqui)
- Estrutura de formulário: `<form>` → `<div class="field">` → `<label for>` + `<input id>`. `label.htmlFor` = `input.id`.
- `<ul><li>` para listas; `<main>` e `<h1>` para semântica; `<button type="button|submit">`.
- Acessibilidade: `aria-invalid`, `aria-describedby`, `aria-label`, `role="alert"`.

### CSS — classes que o projeto espera (exemplo base)
```css
.container { max-width: 640px; margin: 2rem auto; padding: 0 1rem; font-family: system-ui; }
.row   { display: flex; gap: .5rem; }
.row input { flex: 1; }
.form  { display: grid; gap: 1rem; }
.field { display: grid; gap: .25rem; }
.error { color: #b00020; font-size: .875rem; margin: 0; }
input[aria-invalid="true"] { border-color: #b00020; }
.list  { list-style: none; padding: 0; display: grid; gap: .5rem; }
.item  { display: flex; align-items: center; justify-content: space-between; gap: .75rem;
         padding: .5rem .75rem; border: 1px solid #ddd; border-radius: 8px; }
.item.resolved span:first-of-type { text-decoration: line-through; opacity: .6; }
.badge { padding: .1rem .5rem; border-radius: 999px; font-size: .75rem; }
.badge-alta  { background: #fde2e2; } .badge-media { background: #fff3cd; } .badge-baixa { background: #dff5e3; }
button:disabled { opacity: .6; cursor: not-allowed; }
```
Dica: **`class` no HTML = `className` no JSX**; um nome diferente entre JSX e CSS (`conteiner` vs `container`) simplesmente não aplica estilo, sem erro algum.

---

## 8. Checklist de erros (copie e corrija)

| Arquivo | Errado | Certo |
|---|---|---|
| IncidentForm | `` from `react` `` | `from 'react'` |
| IncidentForm | `incidentForm` | `IncidentForm` |
| IncidentForm | `initalValues` | `initialValues` |
| IncidentForm | `../utils/valideteIncident` | `../utils/validateIncident` |
| IncidentForm | `notValidate` | `noValidate` |
| IncidentForm | `onChane` / `onBlue` | `onChange` / `onBlur` |
| IncidentForm | `values.decription` | `values.description` |
| IncidentForm | `row={3}` | `rows={3}` |
| IncidentForm | `id="title=error"` | `id="title-error"` |
| IncidentItem | `arial-label` | `aria-label` |
| IncidentItem | arquivo `incidentItem.jsx` | `IncidentItem.jsx` |
| IncidentList | `IncidenteItem` | `IncidentItem` |
| http.js | `cosntructor` | `constructor` |
| http.js | `return full` | `return null` |
| http.js | `data?.details?.toString()` | `data?.detail ?? data?.message` |
| validateIncident | `PRIORITES`, "devo", "caractereres" | `PRIORITIES`, "deve", "caracteres" |
| App | `"Alta"` / `"Baixa"` | `"alta"` / `"baixa"` |
| App | `conteiner` | `container` |

---

## 9. Como depurar (ordem de ataque)

1. **Console do navegador (F12):** erros vermelhos dizem arquivo e linha.
2. **"X is not defined / not a function":** typo de nome ou import errado.
3. **Tela em branco:** erro de renderização (ex.: `undefined.map`). Veja o console.
4. **Nada acontece ao clicar:** handler com typo (`onChane`) — o React **não avisa**.
5. **Estilo não aplica:** conferir `className` × nome no CSS.
6. **Erro de rede:** aba **Network** (status, URL, resposta) e **CORS** no console.
7. **Funciona local, quebra no deploy:** maiúsculas/minúsculas em nomes de arquivo e variáveis `VITE_` não configuradas no Vercel.
8. Use `console.log` ou o **React DevTools** para inspecionar props e estado.

---

## 10. Roteiro de estudo sugerido
1. Refaça o projeto do zero, digitando (não copie).
2. Ligue `IncidentForm` ao `App` (seção 6).
3. Suba uma API (FastAPI) com `GET/POST/PATCH/DELETE /incidents` e troque o estado local por `request(...)`.
4. Adicione estados de **loading** e **erro** na lista.
5. Persistência e filtros (resolvidos/pendentes) com `useMemo` ou valores derivados.
6. Escreva testes simples de `validateIncident` (função pura, ideal para começar).