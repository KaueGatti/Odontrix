# Roteiro de Deploy — Odontrix

Stack: gratuita, sem cartão de crédito, sem expiração — feita pra portfólio ficar no ar de forma permanente.

| Camada | Serviço | Por quê |
|---|---|---|
| Banco (PostgreSQL) | [Neon](https://neon.tech) | Tier gratuito permanente (banco "dorme" quando ocioso, mas nunca é deletado) — diferente do Postgres da Render, que expira em 30 dias |
| Backend (Spring Boot) | [Render](https://render.com) | Web Service com Docker, tier gratuito sem cartão. Dorme após 15min sem uso, acorda em ~30-60s |
| Frontend (React/Vite) | [Vercel](https://vercel.com) ou [Netlify](https://netlify.com) | Deploy em minutos, sem os problemas de cold start do backend |
| Manter backend acordado (opcional) | [cron-job.org](https://cron-job.org) ou UptimeRobot | Ping a cada 10min no health check. Render dá 750h grátis/mês (~730h no mês), cabe tranquilo se for o único serviço na conta |

## Passo a passo

### 1. Banco de dados: Neon (PostgreSQL)
- Criar conta gratuita em neon.tech
- Criar um projeto
- Copiar a connection string
- Usar como variável de ambiente no Spring Boot (`application.properties` / `application.yml`)

### 2. Backend: Render (Web Service com Docker)
- Criar conta em render.com
- Conectar o repositório do GitHub do Odontrix
- Escolher **Web Service** — a Render detecta o Dockerfile automaticamente
- Configurar variáveis de ambiente: connection string do Neon, JWT secret, etc.
- **Atenção:** tier gratuito dorme após 15min sem tráfego, demora ~30-60s pra acordar na próxima requisição

### 3. Evitar cold start (opcional, mas recomendado pra portfólio)
- Cadastrar a URL do backend em um serviço de uptime monitoring (cron-job.org / UptimeRobot)
- Configurar ping a cada 10 minutos no endpoint de health check
- Isso mantém o serviço sempre acordado, dentro do limite gratuito de 750h/mês da Render

### 4. Frontend: Vercel ou Netlify
- Conectar o repositório — ambos detectam Vite automaticamente
- Configurar variável de ambiente apontando pra URL do backend na Render
- Deploy leva minutos, sem cold start no tier gratuito

### 5. Testar o fluxo completo e ajustar CORS
- Erro mais comum: CORS bloqueando chamadas do frontend (Vercel) pro backend (Render), por serem domínios diferentes
- No Spring Boot, configurar explicitamente a origem do frontend deployado nas configurações de CORS
- Só considerar "funcionando" depois de testar o fluxo completo end-to-end (login, alguma operação de CRUD, etc.)

## Depois do deploy no ar

- Atualizar o README do Odontrix com o link da demo funcionando no topo
- Adicionar diagrama de arquitetura (hexagonal / camadas)
- Adicionar prints das telas principais

## Nota

Reserve um bloco de tempo generoso (ex: um sábado inteiro) pra essa primeira tentativa — é normal não funcionar de primeira em variável de ambiente, Dockerfile ou CORS. Isso faz parte do aprendizado de deploy, não é sinal de que algo está errado com você ou com o projeto.
