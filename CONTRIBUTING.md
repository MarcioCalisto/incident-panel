# Regras de Versionamento e Contribuição

## Versionamento Semântico (SemVer)

O projeto segue [SemVer 2.0.0](https://semver.org/): `MAJOR.MINOR.PATCH`

| Tipo de mudança | Versão | Exemplo |
|---|---|---|
| Breaking change (API incompatível) | MAJOR | `1.0.0 → 2.0.0` |
| Nova funcionalidade (backward compatível) | MINOR | `1.1.0 → 1.2.0` |
| Correção de bug / refatoração (backward compatível) | PATCH | `1.0.1 → 1.0.2` |

O `package.json` fica em `0.0.0` durante o desenvolvimento inicial. Ao primeiro
deploy, fixa-se em `1.0.0`.

## Conventional Commits

Todos os commits seguem o formato
[Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

### Tipos permitidos

| Tipo | Uso |
|---|---|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `chore` | Tarefas de manutenção (deps, tooling, scripts) |
| `refactor` | Refatoração sem mudança de comportamento |
| `docs` | Mudanças na documentação |
| `style` | Ajustes de formatação / estilo (sem mudança lógica) |
| `test` | Adição ou correção de testes |
| `perf` | Otimização de desempenho |
| `build` | Mudanças no build / dependências |
| `ci` | Mudanças em configurações de CI |
| `revert` | Reverte um commit anterior |

### Escopo

O `<scope>` é opcional mas recomendado. Exemplos: `services`, `components`,
`hook`, `utils`, `lint`, `ci`, `docs`.

### Exemplos

```
feat(components): adicionar filtro de prioridade na lista
fix(services): null-guard do normalizador fromApi
refactor(utils): unificar enum de prioridades em constants.js
chore: adicionar json-server e script de dev
docs: alinhar README ao stack real
ci: adicionar workflow de GitHub Actions
```

## Commit por categoria

Cada pull request ou sequência de commits deve agrupar mudanças por categoria
(funcionalidade, correção, refatoração, documentação, CI, etc). Evite commits
genéricos como "várias correções" ou "atualizações diversas".

## Qualidade de código

Todo commit deve manter o projeto verde:

```
npm run lint
npm run build
```

Hooks de pré-commit (husky + lint-staged) executam o lint automaticamente antes
de cada commit. O GitHub Actions também valida emPull Request.

## Fluxo de desenvolvimento

1. Crie um *branch* a partir de `master`: `git checkout -b feat/minha-funcionalidade`
2. Faça commits pequenos e focados seguindo as regras acima
3. Rode `lint` e `build` localmente
4. Abra um Pull Request descrevendo o *motivo* da mudança
5. Após aprovação, faça merge com *squash* ou merge commit
