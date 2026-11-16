# TEAMSPACE AI

### Different minds. One direction.

TEAMSPACE AI is a team portfolio website with an AI-powered chat interface.

The repository contains the frontend application, backend API, and project documentation.

## Project Structure

```text
AIE312/
├── FE/                     # React + TypeScript + Vite frontend
├── BE/                     # Express + TypeScript backend
├── docs/                   # Project documentation
│   ├── API_CONTRACT.md
│   ├── FRONTEND_SETUP.md
│   └── BACKEND_SETUP.md
├── PROJECT_ROADMAP.md
├── DEVELOPMENT_LOG.md
└── README.md
```

## Components

### Frontend (`FE/`)

- React
- TypeScript
- Vite
- React Router
- Responsive portfolio and chat interface
- Mock API mode for frontend development

### Backend (`BE/`)

- Express
- TypeScript
- PostgreSQL
- Portfolio API
- AI-powered chat API
- Chat history

## Documentation

| Document | Description |
|---|---|
| `docs/FRONTEND_SETUP.md` | Original frontend documentation and setup |
| `docs/BACKEND_SETUP.md` | Original backend documentation and setup |
| `docs/API_CONTRACT.md` | Frontend and backend API contract |
| `PROJECT_ROADMAP.md` | Project roadmap |
| `DEVELOPMENT_LOG.md` | Frontend development history |

## Getting Started

See the component-specific setup guides:

- Frontend: `docs/FRONTEND_SETUP.md`
- Backend: `docs/BACKEND_SETUP.md`

Each component has its own dependencies and environment configuration.

## Environment and Security

- Do not commit `.env` files.
- Do not expose API keys or database credentials.
- Use `.env.example` files as configuration references.
- Keep backend secrets on the server.

## Development Status

The frontend has passed its production build and runtime checks in Mock API mode.

The backend source code is included in `BE/`. Full frontend-backend integration and end-to-end validation remain separate tasks.

---

**TEAMSPACE AI**

*Different minds. One direction.*
