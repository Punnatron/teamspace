# TEAMSPACE AI

### Different minds. One direction.

TEAMSPACE AI is a team portfolio website with an AI-powered chat interface designed to introduce team members, showcase skills and projects, and provide an interactive way for visitors to learn about the team.

## Project Overview

The project combines a team portfolio website with a chat interface.

Its main objectives are:

- Introduce the team and its members.
- Showcase member roles, skills, and projects.
- Provide an interactive chat interface.
- Prepare the frontend for future backend and AI integration.
- Support responsive layouts across different screen sizes.

## Current Development Status

**Frontend:** Implemented and tested in Mock API mode.

**Backend:** Pending implementation and API confirmation.

The frontend currently uses mock responses so development and testing can continue without waiting for the backend.

## Features

### Portfolio

- Team introduction
- Team member cards
- Skills and technology information
- Project showcase
- Contact section
- Responsive navigation
- Footer
- Scroll reveal animations

### Chat Interface

- Interactive chat UI
- Mock API responses
- Quick question suggestions
- Typing indicator
- Message timestamps
- Copy assistant responses
- Retry functionality
- Reset conversation
- Local chat history
- Error handling

## Technology Stack

| Category | Technology |
|---|---|
| Frontend Framework | React |
| Programming Language | TypeScript |
| Build Tool | Vite |
| Routing | React Router |
| Styling | CSS |
| Icons | Lucide React, React Icons |
| HTTP Requests | Fetch API |
| Local Storage | Browser localStorage |
| Planned Backend | Express API |
| Planned Database | PostgreSQL |

## Project Structure

```text
team-portfolio-ai/
Γöé
Γö£ΓöÇΓöÇ FE/
Γöé   Γö£ΓöÇΓöÇ public/
Γöé   Γö£ΓöÇΓöÇ src/
Γöé   Γöé   Γö£ΓöÇΓöÇ assets/
Γöé   Γöé   Γö£ΓöÇΓöÇ components/
Γöé   Γöé   Γö£ΓöÇΓöÇ data/
Γöé   Γöé   Γö£ΓöÇΓöÇ hooks/
Γöé   Γöé   Γö£ΓöÇΓöÇ pages/
Γöé   Γöé   Γö£ΓöÇΓöÇ services/
Γöé   Γöé   Γö£ΓöÇΓöÇ types/
Γöé   Γöé   ΓööΓöÇΓöÇ styles/
Γöé   Γöé
Γöé   Γö£ΓöÇΓöÇ .env.example
Γöé   Γö£ΓöÇΓöÇ .gitignore
Γöé   ΓööΓöÇΓöÇ package.json
Γöé
Γö£ΓöÇΓöÇ docs/
Γöé   ΓööΓöÇΓöÇ API_CONTRACT.md
Γöé
Γö£ΓöÇΓöÇ README.md
ΓööΓöÇΓöÇ DEVELOPMENT_LOG.md
```

## Getting Started

### Requirements

- Node.js
- npm
- Git
- Visual Studio Code

### Installation

Open the terminal and navigate to the frontend directory:

```bash
cd FE
```

Install dependencies:

```bash
npm install
```

### Environment Configuration

Create a `.env.local` file inside the `FE` directory.

```env
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=http://localhost:3000
```

The application currently uses Mock API mode.

### Run Development Server

```bash
npm run dev
```

Open the local URL displayed in the terminal.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Application Routes

| Route | Description |
|---|---|
| `/` | Team Portfolio |
| `/chat` | Chat Interface |

## Chat API

The chat service is located at:

```text
FE/src/services/chatApi.ts
```

The frontend supports two modes:

- **Mock API:** Uses local project data to generate simulated responses.
- **Real API:** Prepared for future backend integration.

The proposed API endpoint is:

```http
POST /messages
```

Expected request:

```json
{
  "text": "Hello TEAMSPACE"
}
```

Expected response:

```json
{
  "reply": "..."
}
```

The API contract is a proposal and must be confirmed by the backend team before real integration.

See `docs/API_CONTRACT.md` for details.

## Testing Status

The following frontend tests have been reported as successful:

- Production build
- Team member questions
- Skills questions
- Project questions
- Technology stack questions
- Portfolio and Chat navigation
- Copy, Retry, and Reset interactions
- Chat history persistence
- Responsive layouts

## Development Documentation

See `DEVELOPMENT_LOG.md` for the development history and implementation steps.

## Security Notes

- Never commit `.env.local`.
- Never expose AI API keys in frontend code.
- Never store database passwords in frontend environment variables.
- Keep private credentials on the backend.
- Use `.env.example` for non-secret configuration examples.

## Future Development

- Complete backend implementation.
- Confirm the API contract.
- Integrate the real AI service.
- Test frontend and backend communication.
- Perform final deployment.

---

**TEAMSPACE AI**
*Different minds. One direction.*
