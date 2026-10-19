# Painel de Incidentes
Aplicação para registro e acompanhamento de incidentes de TI.
## Stack
React 18, Vite, Supabase (Postgres, Auth, RLS), Vercel.
## Funcionalidades
- Cadastro, edição, remoção e resolução de incidentes
- Filtro por status e busca por texto
- Autenticação por e-mail e senha
- Isolamento de dados por usuário
## Executar localmente
npm install
cp .env.example .env.local # preencha as chaves
npm run dev
## Testes
npm test
## Decisões técnicas
- Validação duplicada: cliente (UX) e banco (garantia)
- RLS no Postgres para isolar dados por usuário
- Camada de serviço isolando o acesso a dados
