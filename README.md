# ⚡ AIVote — Sistema de Votação em IA

> Sistema completo de votação sobre Inteligências Artificiais com dashboard de insights em tempo real.

---

## 🚀 Rodar com Docker (recomendado — 1 comando)

### Pré-requisito único
**Docker Desktop** → https://www.docker.com/products/docker-desktop/

### Iniciar o sistema

```bash
# Clone / extraia o projeto, entre na pasta e rode:
./start.sh

# OU diretamente:
docker-compose up --build
```

**Pronto.** Acesse em → **http://localhost:3000**

> ⏳ Na **primeira execução** o Docker precisa baixar as imagens base e compilar o projeto.  
> Isso leva em torno de **3–5 minutos**. Da segunda vez em diante é quase instantâneo.

---

## 🌐 URLs disponíveis

| Serviço       | URL                                        |
|---------------|--------------------------------------------|
| **Frontend**  | http://localhost:3000                      |
| **API REST**  | http://localhost:8080/api                  |
| **Dashboard** | http://localhost:3000/dashboard            |
| **Banco**     | localhost:5432 (PostgreSQL)                |

---

## 📋 Comandos Docker

```bash
# Subir (primeira vez ou após mudanças)
docker-compose up --build

# Subir em segundo plano
docker-compose up --build -d

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend

# Parar tudo (preserva banco de dados)
docker-compose down

# Parar e APAGAR banco de dados
docker-compose down -v

# Recriar apenas um serviço
docker-compose up --build backend
```

---

## 🗂️ Estrutura

```
ai-voting-system/
├── docker-compose.yml           ← Orquestra tudo
├── .env                         ← Variáveis de ambiente
├── start.sh                     ← Script de atalho
│
├── ai-voting-backend/           ← API Spring Boot
│   ├── Dockerfile
│   └── src/main/
│       ├── java/com/aivoting/
│       │   ├── config/          SecurityConfig, CorsConfig
│       │   ├── controller/      Auth, Vote, Questionnaire, Dashboard
│       │   ├── dto/             Request/Response DTOs
│       │   ├── entity/          User, Vote, QuestionResponse
│       │   ├── repository/      JPA Repositories
│       │   ├── security/        JWT, Filter
│       │   └── service/         Regras de negócio
│       └── resources/
│           ├── application.properties          ← dev (H2)
│           └── application-docker.properties   ← Docker (PostgreSQL)
│
└── ai-voting-frontend/          ← SPA React
    ├── Dockerfile
    ├── nginx.conf               ← Serve React + proxy /api
    └── src/
        ├── api/                 Axios + endpoints
        ├── components/          Navbar, ProtectedRoute
        ├── context/             AuthContext (JWT)
        └── pages/               Home, Login, Register, Vote,
                                 Questionnaire, Dashboard
```

---

## 🎯 Funcionalidades

- **Cadastro e login** com JWT (token salvo em localStorage)
- **Votação** em exatamente 2 IAs (ChatGPT, Claude, Gemini, Grok, Meta AI, Copilot, Não utilizo IA)
- **Questionário** com 6 perguntas sobre hábitos de uso de IA
- **Dashboard público** com gráficos Donut + Barras + Ranking + Progress bars
- **QR Code** na homepage e no dashboard para acesso mobile
- Banco de dados **PostgreSQL persistente** via volume Docker

---

## 🔧 Rodar sem Docker (desenvolvimento)

### Backend
```bash
cd ai-voting-backend
mvn spring-boot:run
# Usa H2 em memória — sem configuração de banco necessária
# → http://localhost:8080
```

### Frontend
```bash
cd ai-voting-frontend
npm install
npm start
# → http://localhost:3000
```

---

## ⚙️ Variáveis de Ambiente (.env)

| Variável           | Padrão          | Descrição                   |
|--------------------|-----------------|------------------------------|
| `POSTGRES_DB`      | `aivoting`      | Nome do banco                |
| `POSTGRES_USER`    | `aivoting`      | Usuário do banco             |
| `POSTGRES_PASSWORD`| `aivoting123`   | Senha do banco               |
| `JWT_SECRET`       | *(ver .env)*    | Chave de assinatura JWT      |

> ⚠️ Em produção, altere `JWT_SECRET` para uma string aleatória longa.
