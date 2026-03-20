# ⚡ AIVote — Sistema de Votação em Inteligências Artificiais

Sistema web completo para votação e coleta de dados sobre uso de IAs, com dashboard de insights em tempo real.

---

## 📦 Tecnologias

| Camada     | Tecnologia                               |
|------------|------------------------------------------|
| Backend    | Java 17, Spring Boot 3.2, Spring Security |
| Auth       | JWT (JSON Web Token)                     |
| Banco      | H2 (dev) · PostgreSQL/MySQL (produção)  |
| ORM        | JPA / Hibernate                          |
| Frontend   | React 18, React Router 6, Axios          |
| Gráficos   | Chart.js + react-chartjs-2               |
| QR Code    | qrcode.react                             |

---

## 🗂️ Estrutura do Projeto

```
ai-voting-system/
├── ai-voting-backend/          # Spring Boot API
│   ├── pom.xml
│   └── src/main/java/com/aivoting/
│       ├── AiVotingApplication.java
│       ├── config/             # CORS, Security
│       ├── controller/         # Auth, Vote, Questionnaire, Dashboard
│       ├── dto/                # Request/Response DTOs
│       ├── entity/             # User, Vote, QuestionResponse
│       ├── repository/         # JPA Repositories
│       ├── security/           # JWT, Filters
│       └── service/            # Business logic
│
└── ai-voting-frontend/         # React SPA
    └── src/
        ├── api/                # Axios + endpoints
        ├── components/         # Navbar, ProtectedRoute
        ├── context/            # AuthContext (JWT)
        └── pages/              # Home, Login, Register, Vote, Questionnaire, Dashboard
```

---

## 🚀 Como Rodar

### Pré-requisitos

- **Java 17+** — [download](https://adoptium.net/)
- **Maven 3.8+** — [download](https://maven.apache.org/)
- **Node.js 18+** — [download](https://nodejs.org/)
- **npm 9+** (já vem com Node)

---

### 1️⃣ Backend (Spring Boot)

```bash
# Entrar na pasta do backend
cd ai-voting-backend

# Compilar e rodar
mvn spring-boot:run
```

O backend iniciará em **http://localhost:8080**

> 💡 O banco H2 em memória é criado automaticamente. Nenhuma configuração adicional necessária para desenvolvimento.
>
> 🔎 Console do H2 (banco de dados): http://localhost:8080/h2-console
> - JDBC URL: `jdbc:h2:mem:aivoting`
> - User: `sa` | Senha: *(vazio)*

---

### 2️⃣ Frontend (React)

```bash
# Em outro terminal, entrar na pasta do frontend
cd ai-voting-frontend

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento
npm start
```

O frontend abrirá em **http://localhost:3000**

---

## 🌐 Endpoints da API

### Autenticação (público)
| Método | Endpoint            | Descrição               |
|--------|---------------------|-------------------------|
| POST   | `/api/auth/register`| Cadastro de novo usuário |
| POST   | `/api/auth/login`   | Login com email/senha    |

### Votação (🔒 requer JWT)
| Método | Endpoint         | Descrição                         |
|--------|------------------|-----------------------------------|
| POST   | `/api/votes`     | Registrar 2 votos                 |
| GET    | `/api/votes/my`  | Ver votos do usuário logado       |
| GET    | `/api/votes/status` | Verificar se já votou          |

### Questionário (🔒 requer JWT)
| Método | Endpoint                 | Descrição                        |
|--------|--------------------------|----------------------------------|
| POST   | `/api/questionnaire`     | Enviar/atualizar respostas       |
| GET    | `/api/questionnaire/my`  | Ver respostas do usuário         |
| GET    | `/api/questionnaire/status` | Verificar se já respondeu    |

### Dashboard (público)
| Método | Endpoint        | Descrição                    |
|--------|-----------------|------------------------------|
| GET    | `/api/dashboard`| Todos os dados para gráficos |

---

## 🗄️ Banco de Dados em Produção

### PostgreSQL

1. Crie o banco:
```sql
CREATE DATABASE aivoting;
```

2. No arquivo `application.properties`, comente as linhas do H2 e descomente:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/aivoting
spring.datasource.driver-class-name=org.postgresql.Driver
spring.datasource.username=seu_usuario
spring.datasource.password=sua_senha
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

3. No `pom.xml`, descomente a dependência do PostgreSQL.

### MySQL

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/aivoting?useSSL=false&serverTimezone=UTC
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.username=seu_usuario
spring.datasource.password=sua_senha
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

---

## 🎯 Regras de Negócio

- ✅ Cada usuário pode votar em **exatamente 2 IAs**
- ✅ Não é possível votar **2x na mesma IA**
- ✅ Votos são **imutáveis** após confirmação
- ✅ Respostas do questionário podem ser **atualizadas**
- ✅ Dashboard é **público** (sem login)
- ✅ Votos e respostas são **vinculados ao usuário autenticado**

---

## 🤖 IAs Disponíveis para Votação

- ChatGPT
- Claude
- Gemini
- Grok
- Meta AI
- Copilot
- Não utilizo IA

---

## 📋 Perguntas do Questionário

1. Onde você mais usa IA?
2. Por que você usa IA?
3. Como você usa IA?
4. Você usa IA para estudar?
5. Você usa IA para trabalho?
6. Com o que você trabalha? *(Direito / Engenharia / TI / Mecânica / Administração / Outros)*

---

## 🔑 Autenticação JWT

O token JWT é gerado no login/cadastro e deve ser enviado no header de todas as requisições protegidas:

```
Authorization: Bearer <seu_token_aqui>
```

O token expira em **24 horas** (configurável em `application.properties`).

---

## 📱 QR Code

O QR Code é gerado automaticamente apontando para `http://localhost:3000`. Para usar em rede local (acesso pelo celular), substitua o IP no arquivo `src/pages/HomePage.js` e `src/pages/DashboardPage.js`:

```js
const SYSTEM_URL = 'http://192.168.1.100:3000'; // Seu IP local
```

---

## 🛠️ Problemas Comuns

**Backend não inicia:**
```bash
# Verifique a versão do Java
java -version  # precisa ser 17+
```

**Erro de CORS:**
- Verifique se o frontend está em `http://localhost:3000`
- Confirme a propriedade `cors.allowed-origins` no `application.properties`

**Frontend não conecta no backend:**
- Verifique se o backend está rodando na porta 8080
- Cheque o arquivo `src/api/index.js` → `API_BASE_URL`

---

## 📄 Licença

MIT — use livremente para fins educacionais e comerciais.
