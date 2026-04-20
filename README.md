# Project Camp - AI-Enabled Project Management Platform

Project Camp is a sophisticated project management solution that leverages **AI (OpenAI GPT-4)** to automate planning and enhance team productivity. It features a robust **Node.js/Express** backend with **MongoDB** for data persistence, **AWS S3** for file storage, and a comprehensive suite of AI-driven project analytics.

---

## 🚀 Key Features

### 🔐 Security & Identity
- **JWT & HTTP-Only Cookies**: Secure session management with access and refresh tokens.
- **Google OAuth 2.0**: Seamless login via Google.
- **RBAC (Role-Based Access Control)**:
  - `admin`: Full control over projects, members, and notes.
  - `project_admin`: Task management and member oversight.
  - `member`: Standard task interaction and collaboration.
- **Email Workflows**: Verified registration and secure password recovery.

### 🤖 AI Assistant (Powered by GPT-4)
- **Task Architect**: Automatically generate task lists and subtasks from project descriptions.
- **Intelligent Resource Allocation**: AI-driven member recommendations based on current workload and skill match.
- **Risk Profiling**: Real-time identification of overdue tasks and potential bottlenecks.
- **Predictive Timelines**: AI-calculated project completion forecasts with confidence scoring.
- **Workload Analysis**: Detailed reports on team balance to prevent burnout.

### 📂 Collaboration & Content
- **Project Workspaces**: Dedicated areas for teams to collaborate.
- **Advanced Task Engine**: Prioritization, status tracking, and automated progress calculation.
- **S3-Powered Attachments**: Secure file uploads (PDF, Images, Docs) directly to AWS.
- **Versioned Notes**: Collaborative project notes with change history and pinning.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Runtime** | Node.js (v20+) |
| **Framework** | Express.js (v5) |
| **Database** | MongoDB (Atlas / Containerized) |
| **AI Layer** | OpenAI API (GPT-4 Turbo) |
| **File Storage** | AWS S3 (SDK v3) |
| **Auth** | Passport.js, JWT, Bcrypt |
| **Mailing** | Nodemailer, Mailgen |
| **DevOps** | Docker, Docker-Compose |

---

## ⚙️ Installation & Setup

### Option 1: Using Docker (Recommended for Local DB)
1. **Clone & Install**:
   ```bash
   git clone <repository-url>
   cd backend
   npm install
   ```
2. **Start MongoDB**:
   ```bash
   docker-compose up -d
   ```
   *This starts MongoDB on port 27017 and Mongo-Express (UI) on port 8081.*

### Option 2: Standard Setup
1. **Configure `.env`**: (Refer to the environment variables section below)
2. **Launch Application**:
   ```bash
   npm run dev
   ```

---

## 🔑 Environment Variables
Required variables in your `.env` file:

```env
PORT=8000
MONGODB_URL=mongodb://root:root123@localhost:27017/projectcamp?authSource=admin
CORS_ORIGIN=http://localhost:3000

# Auth Secrets
ACCESS_TOKEN_SECRET=...
REFRESH_TOKEN_SECRET=...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:8000/api/v1/auth/google/callback

# AI & Storage
OPENAI_API_KEY=...
AWS_REGION=...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Email (Mailtrap/SMTP)
MAIL_TRAP_SMPT_HOST=...
MAIL_TRAP_SMPT_PORT=...
MAIL_TRAP_SMPT_USER=...
MAIL_TRAP_SMPT_PASS=...
```

---

## 📍 API Reference

### 1. Authentication
- `POST /api/v1/auth/register` - Create account
- `POST /api/v1/auth/login` - Local login
- `GET /api/v1/auth/google` - Initiate Google OAuth
- `POST /api/v1/auth/logout` - Clear session/tokens

### 2. Projects & Members
- `POST /api/v1/project` - Create project (Admin)
- `GET /api/v1/project` - Get user projects
- `POST /api/v1/projects/:projectId/members` - Invite member
- `DELETE /api/v1/projects/:projectId/members/:userId` - Remove member

### 3. Task Management
- `POST /api/v1/tasks/:projectId` - Create task with attachments
- `GET /api/v1/tasks/:projectId` - Filtered task list
- `PUT /api/v1/tasks/:projectId/t/:taskId` - Update task status/priority
- `POST /api/v1/tasks/:projectId/st/:taskId` - Add subtask to task

### 4. AI Insights
- `POST /api/v1/ai/suggest-tasks/:projectId` - Generate tasks via AI
- `POST /api/v1/ai/assign-task/:taskId` - Get AI member recommendation
- `GET /api/v1/ai/analyze-risks/:projectId` - Project health check
- `GET /api/v1/ai/predict-timeline/:projectId` - Forecast finish date
- `GET /api/v1/ai/balance-workload/:projectId` - Workload analysis

### 5. Project Notes
- `POST /api/v1/notes/:projectId` - Create pinned/tagged note
- `GET /api/v1/notes/:projectId` - List all project notes
- `PUT /api/v1/notes/:projectId/n/:noteId` - Edit note (creates new version)

---

## 📂 Project Architecture

```text
src/
├── app.js            # Express application setup & middleware
├── index.js          # Server entry point & DB connection
├── controllers/      # Request handlers & Business logic
├── models/           # Mongoose schemas (User, Project, Task, etc.)
├── routes/           # API Route definitions
├── middlewares/      # Auth, Role-check, and File Upload logic
├── config/           # Third-party service configs (AWS, AI, Passport)
├── utils/            # Shared utilities (Mail, API Error handling)
└── validators/       # Input validation schemas
```

## 📄 License
This project is licensed under the MIT License.
