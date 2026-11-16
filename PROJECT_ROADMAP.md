# TEAMSPACE AI — PROJECT ROADMAP

**Project:** TEAMSPACE AI
**Tagline:** Different minds. One direction.
**Frontend:** React + TypeScript + Vite
**Backend:** รอทีม Backend ยืนยันเทคโนโลยีและ API
**Repository:** GitHub Private
**Document Status:** In Progress
**Last Updated:** 12 November 2026

---

# 1. PROJECT OVERVIEW

TEAMSPACE AI เป็นเว็บไซต์นำเสนอทีมและผลงานของสมาชิก พร้อมระบบ AI Assistant ที่ช่วยให้ผู้เข้าชมสามารถสอบถามข้อมูลเกี่ยวกับทีม สมาชิก ทักษะ และโปรเจกต์ได้

เป้าหมายของการพัฒนาต่อจากนี้คือทำให้เว็บไซต์มีรูปแบบที่สม่ำเสมอ รองรับภาษาไทยและภาษาอังกฤษ และพร้อมเชื่อมต่อกับ Backend จริง

## Main Objectives

1. ปรับปรุง UI/UX ทุกหน้าให้เป็น Design System เดียวกัน
2. รองรับภาษาไทย (TH) และภาษาอังกฤษ (EN)
3. ทำให้ผู้ใช้สามารถเปลี่ยนภาษาได้จาก Navbar
4. จัดโครงสร้างข้อมูลสมาชิกและโปรเจกต์ให้พร้อมใส่ข้อมูลจริง
5. ตรวจสอบ Responsive Design ทุกขนาดหน้าจอ
6. อัปโหลด Source Code ขึ้น GitHub แบบ Private
7. จัดทำเอกสารสำหรับส่งต่อให้ทีม Backend
8. เชื่อมต่อ AI Chat กับ Backend หลังจากยืนยัน API Contract
9. ทดสอบระบบทั้งหมดก่อนส่งมอบงาน

---

# 2. CURRENT PROJECT STATUS

## Completed Tasks

| Step | Task | Status |
|---|---|---|
| 1 | Setup React + TypeScript + Vite | Completed |
| 2 | Create project folder structure | Completed |
| 3 | Setup React Router | Completed |
| 4 | Create Portfolio data and cards | Completed |
| 5 | Create Chat UI | Completed |
| 6 | Separate Mock API and Real API | Completed |
| 7 | Improve Portfolio components and data types | Completed |
| 8 | Create Contact Section and Footer | Completed |
| 9 | Add Scroll Reveal and animations | Completed |
| 10 | Improve Chat UX and error handling | Completed |
| 11 | Responsive layout | Completed |
| 12 | Frontend testing | Passed |
| 13 | Deployment preparation | Completed |
| 14 | Review Chat API and Mock responses | Completed |
| 15.1–15.4 | Create README, Development Log, root .gitignore and update index.html | Completed |
| 15.5 | Improve Tech Stack Mock Response | Passed |
| 15.6 | Review API Contract | Reviewed; minor edits recommended |
| 15.7 | GitHub Private preparation | Pending |

## Current Frontend Features

- Portfolio Page
- Team Member Cards
- Project Cards
- Contact Section
- Footer
- Chat Page
- Mock Chat API
- Real API structure
- LocalStorage Chat History
- Copy Message
- Retry Message
- Reset Chat
- Loading and Typing Indicator
- Responsive Layout

## Current Mock API

File:

`FE/src/services/chatApi.ts`

Current behavior:

- Uses Mock API when `VITE_USE_MOCK_API=true`
- Uses Real API when `VITE_USE_MOCK_API=false`
- Real API uses Fetch API
- Sends `POST /messages`
- Request format: `{ "text": "..." }`
- Expected response: `{ "reply": "..." }`

The Mock API currently reads data from:

`FE/src/data/portfolio.ts`

---

# 3. STEP 16 — WEBSITE DESIGN SYSTEM & UI/UX IMPROVEMENT

**Goal:** Make all website pages visually consistent and ready for real content.

## STEP 16.1 — Review Existing Frontend Files

Inspect these files before changing the design:

- `FE/src/index.css`
- `FE/src/App.css`
- `FE/src/App.tsx`
- `FE/src/components/layout/Navbar.tsx`
- `FE/src/components/layout/Footer.tsx`
- `FE/src/pages/PortfolioPage.tsx`
- `FE/src/pages/ChatPage.tsx`
- MemberCard CSS
- ProjectCard CSS
- ContactSection CSS

Tasks:

- Identify duplicated CSS.
- Identify inconsistent colors and typography.
- Identify inconsistent spacing.
- Inspect responsive breakpoints.
- Check component structure.
- Preserve existing working features.

## STEP 16.2 — Create a Shared Design System

Create or reorganize CSS files:

- `FE/src/styles/variables.css`
- `FE/src/styles/global.css`
- `FE/src/styles/components.css`
- `FE/src/styles/responsive.css`

Define shared design tokens:

- Primary colors
- Secondary colors
- Background colors
- Text colors
- Border colors
- Typography
- Font sizes
- Spacing
- Border radius
- Button styles
- Card styles
- Hover and focus states
- Responsive breakpoints

All pages should use the same design rules.

## STEP 16.3 — Standardize Portfolio Components

Review and improve:

### Navbar
- Consistent layout.
- Responsive navigation.
- Language switcher.
- Active page indicator.

### Hero Section
- Consistent typography.
- Clear heading hierarchy.
- Responsive layout.

### Team Member Cards
- Consistent card structure.
- Consistent profile image size.
- Consistent role and skills layout.
- Consistent contribution section.
- Consistent social links.
- Consistent hover states.

### Project Cards
- Consistent image or visual area.
- Consistent project title.
- Consistent description.
- Consistent technology tags.

### Contact Section
- Consistent form and button styles.
- Clear contact information.

### Footer
- Consistent spacing.
- Navigation links.
- Copyright information.

### Chat Page
- Match Portfolio colors and typography.
- Consistent buttons and cards.
- Maintain existing chat functions.

## STEP 16.4 — Responsive Design Review

Test:

- Desktop
- Laptop
- Tablet
- Mobile

Check:

- No horizontal overflow.
- No clipped text.
- Cards stack correctly.
- Navbar remains usable.
- Chat input remains accessible.
- Buttons have sufficient touch area.

---

# 4. STEP 17 — BILINGUAL SYSTEM (THAI / ENGLISH)

**Goal:** Allow users to switch the entire website between Thai and English.

## STEP 17.1 — Setup Translation Structure

Suggested files:

```text
FE/src/
├── i18n/
│   ├── index.ts
│   └── locales/
│       ├── en.json
│       └── th.json
│
├── context/
│   └── LanguageContext.tsx
│
└── data/
    └── portfolioTranslations.ts
```

## STEP 17.2 — Language Context

Create a shared language state.

Requirements:

- Supported languages: `en` and `th`
- Default language: English
- Allow users to switch language.
- Store selected language in localStorage.
- Restore selected language after refreshing.
- Update all pages without reloading.

## STEP 17.3 — Translation Files

`en.json` and `th.json` should contain translations for:

- Navbar
- Hero
- About Team
- Team Members
- Projects
- Contact
- Footer
- Chat UI
- Buttons
- Labels
- Error Messages
- Loading Messages
- Empty States

## STEP 17.4 — Translate Dynamic Portfolio Data

Member and project information must support both languages.

Suggested structure:

- Member name
- Member role in English
- Member role in Thai
- Member description in English
- Member description in Thai
- Skills
- Contribution in English
- Contribution in Thai
- Project title
- Project description in both languages
- Technologies

Keep proper nouns and technology names unchanged when appropriate.

## STEP 17.5 — Add Language Switcher

Add a language switcher to Navbar.

Expected behavior:

- EN: show English content.
- TH: show Thai content.
- Selected language remains after refresh.
- All pages update together.

## STEP 17.6 — Bilingual Chat

Update Chat UI and Mock API to support both languages.

Requirements:

- Welcome message changes with selected language.
- Quick questions change with selected language.
- Placeholder changes with selected language.
- Error messages change with selected language.
- Mock responses support Thai and English.
- User can ask questions in either language.

For Real API, coordinate language handling with Backend.

---

# 5. STEP 18 — PORTFOLIO DATA PREPARATION

**Goal:** Prepare the website to receive final team information.

Files:

- `FE/src/data/portfolio.ts`
- `FE/src/data/portfolioTranslations.ts`
- `FE/src/types/portfolio.ts`

Tasks:

1. Review the member data structure.
2. Prepare fields for all three team members.
3. Prepare Thai and English descriptions.
4. Prepare member roles.
5. Prepare skills.
6. Prepare main contributions.
7. Prepare project descriptions.
8. Prepare social links.
9. Validate missing or invalid data.

Do not invent member information.

Keep placeholders until the actual information is provided.

---

# 6. STEP 19 — FRONTEND TESTING

After UI and bilingual development, test the whole application.

## Portfolio Testing

- Navbar navigation
- Hero section
- Member cards
- Project cards
- Contact section
- Footer
- Social links

## Language Testing

- Switch EN to TH
- Switch TH to EN
- Refresh after switching
- Navigate between pages after switching
- Check every visible label
- Check dynamic portfolio content
- Check chat content

## Chat Testing

- Send a message
- Receive a Mock response
- Copy a message
- Retry a message
- Reset chat
- Refresh and restore history
- Test empty input
- Test error state
- Test Thai questions
- Test English questions

## Responsive Testing

- Desktop
- Tablet
- Mobile

## Build Testing

Run from the `FE` directory:

```powershell
npm run build
```

The build must complete without TypeScript or Vite errors.

---

# 7. STEP 20 — GITHUB PRIVATE REPOSITORY

**Goal:** Upload the complete project source code to a private GitHub repository.

## STEP 20.1 — Pre-upload Review

Check the project structure:

```text
team-portfolio-ai/
├── FE/
├── docs/
│   └── API_CONTRACT.md
├── README.md
├── DEVELOPMENT_LOG.md
├── PROJECT_ROADMAP.md
└── .gitignore
```

Check:

- README.md
- DEVELOPMENT_LOG.md
- PROJECT_ROADMAP.md
- API_CONTRACT.md
- Root .gitignore
- FE/.gitignore
- FE/.env.example

## STEP 20.2 — Security Review

Never upload:

- `.env.local`
- API Keys
- Database Passwords
- Private Tokens
- Credentials
- `node_modules`
- Build output unless explicitly required

Keep `.env.example` in the repository.

Check Git status before staging files.

## STEP 20.3 — Create Private Repository

Create a new repository on GitHub.

Suggested repository name:

`teamspace-ai`

Set visibility to:

`Private`

If pushing an existing local repository, do not initialize the remote repository with an additional README, license, or .gitignore. This avoids unnecessary first-push conflicts.

## STEP 20.4 — Git Initial Commit

From the project root:

```powershell
git status
```

Review every file before staging.

Then:

```powershell
git add .
git status
```

Verify that no secret files are staged.

Create the first commit:

```powershell
git commit -m "Initial TEAMSPACE AI frontend"
```

Connect the GitHub remote:

```powershell
git remote add origin YOUR_GITHUB_REPOSITORY_URL
```

Verify:

```powershell
git remote -v
```

Push the current branch using its actual name:

```powershell
git push -u origin HEAD
```

## STEP 20.5 — Verify GitHub Repository

Check:

- Repository visibility is Private.
- Source files are present.
- README renders correctly.
- Documentation files are present.
- `.env.local` is absent.
- `node_modules` is absent.
- `dist` is absent unless intentionally required.

## STEP 20.6 — Team Collaboration

Invite Backend teammate as a collaborator.

Agree on:

- Repository access
- Branch strategy
- Commit message conventions
- Pull Request workflow
- Who owns each folder
- Who is responsible for API changes

Do not share account passwords or personal access tokens.

---

# 8. STEP 21 — BACKEND HANDOFF

**Goal:** Provide the Backend team with the information needed to connect the Frontend to the actual API.

## STEP 21.1 — Prepare Handoff Documents

Share:

- `README.md`
- `docs/API_CONTRACT.md`
- `PROJECT_ROADMAP.md`
- `.env.example`

## STEP 21.2 — Backend Must Confirm

Ask Backend to confirm:

1. Backend framework.
2. Local Base URL.
3. Production Base URL.
4. HTTP Method.
5. Chat Endpoint.
6. Request JSON format.
7. Success Response format.
8. Error Response format.
9. HTTP Status Codes.
10. CORS configuration.
11. AI service integration.
12. Environment variables required by Backend.

## STEP 21.3 — Proposed Chat API

Current proposed contract:

Method:

`POST`

Endpoint:

`/messages`

Request:

```json
{
  "text": "Who are your team members?"
}
```

Success Response:

```json
{
  "reply": "Our team has three members..."
}
```

The contract is still Proposed until Backend confirms it.

## STEP 21.4 — CORS Coordination

Current local Frontend URL observed during development:

`http://localhost:5175`

Proposed Backend URL:

`http://localhost:3000`

The actual Frontend port may change.

Backend must allow the actual Frontend Origin.

## STEP 21.5 — Real API Integration

Only after Backend confirms the contract:

1. Confirm Base URL.
2. Confirm Endpoint.
3. Confirm Request and Response.
4. Confirm CORS.
5. Confirm Backend is running.
6. Update `.env.local`.
7. Set `VITE_USE_MOCK_API=false`.
8. Restart Vite.
9. Test Real API.
10. Test Error Handling.
11. Test Retry.
12. Test Chat History.
13. Run Production Build.

Keep Mock API available as a fallback for frontend development.

Never put AI API Keys or Backend Secrets in `VITE_` variables.

---

# 9. STEP 22 — FINAL INTEGRATION TESTING

Test the complete application after Backend integration.

## Frontend

- Portfolio
- Team Members
- Projects
- Contact
- Footer
- Language Switching
- Responsive Design

## Backend

- API connection
- Request validation
- Success response
- Error response
- CORS
- AI response
- Service unavailable handling

## Integration

- Thai questions
- English questions
- Chat history
- Retry
- Reset
- Network failure
- Invalid response
- Production build

## Final Acceptance Criteria

- [ ] All pages use a consistent design system.
- [ ] Thai and English language switching works.
- [ ] Selected language persists after refresh.
- [ ] Portfolio information is accurate.
- [ ] Chat UI works.
- [ ] Mock API works.
- [ ] Real API works after Backend confirmation.
- [ ] Responsive layout works.
- [ ] No TypeScript errors.
- [ ] Production build succeeds.
- [ ] GitHub repository is Private.
- [ ] No secrets are committed.
- [ ] Backend handoff documentation is complete.

---

# 10. IMPORTANT PROJECT RULES

1. Preserve existing working features.
2. Inspect files before replacing code.
3. Do not invent member or project information.
4. Keep placeholders until real data is available.
5. Do not switch to Real API before Backend confirmation.
6. Keep API Keys and secrets on the Backend.
7. Run `npm run build` after major changes.
8. Use the `FE` folder name consistently.
9. Keep documentation updated.
10. Test before committing changes.

---

# 11. NEW CHAT CONTINUATION GUIDE

If continuing this project in a new ChatGPT conversation:

1. Open this `PROJECT_ROADMAP.md`.
2. Copy the continuation prompt below.
3. Paste it into the new conversation.
4. Upload the latest project ZIP if the assistant needs to inspect the current code.
5. Include any new Backend API information if it has changed.

## Continuation Prompt

I am continuing my existing university team project, TEAMSPACE AI.

Please continue from the previous development work. Do not restart the project or repeat completed steps.

Project details:

- Project name: TEAMSPACE AI
- Tagline: Different minds. One direction.
- Frontend folder: FE
- Tech stack: React, TypeScript, Vite, React Router, CSS, Fetch API
- Backend: Developed by another teammate; API contract is not yet confirmed.
- Main frontend pages: Portfolio (`/`) and Chat (`/chat`).
- Current Chat API supports Mock mode and Real API mode.
- Mock API uses portfolio data.
- Current proposed endpoint: POST /messages
- Proposed request: `{ "text": "..." }`
- Proposed response: `{ "reply": "..." }`
- API Contract status: Proposed / awaiting Backend confirmation.
- GitHub target: Private repository.

Completed work:

- Frontend setup and project structure.
- Portfolio and Chat pages.
- Member and Project cards.
- Contact section and Footer.
- Responsive layout.
- Chat Mock API and Real API separation.
- Chat history using localStorage.
- Copy, Retry, Reset, Loading and Error handling.
- README.md.
- DEVELOPMENT_LOG.md.
- Root .gitignore.
- FE/index.html title and description.
- Tech Stack Mock response improvement.
- Build and Mock Chat tests passed.

Latest known build result:

- `npm run build` passed.
- 2,151 modules transformed.
- Vite build completed successfully.

Current next steps:

1. Continue STEP 16: inspect existing CSS and components.
2. Create a consistent Design System across the whole website.
3. Implement Thai and English language switching.
4. Translate Portfolio, Chat, buttons, labels, errors and Mock responses.
5. Prepare final member and project data structure.
6. Test all pages and responsive layouts.
7. Prepare and upload to GitHub Private.
8. Invite Backend teammate.
9. Handoff API Contract.
10. Integrate Real API only after Backend confirms the contract.

Important instructions:

- Guide me step by step in Thai.
- Explain exactly which file to open or create.
- Provide complete replacement code when necessary.
- Do not modify unrelated working files.
- Inspect existing code before suggesting changes.
- Keep member placeholders until I provide actual information.
- Do not assume Backend API details are confirmed.
- Do not ask me to repeat information already provided here or in the uploaded project.
- After each step, wait for my test result before proceeding.

Please read the uploaded project files and this roadmap, identify the current completed step, and continue from the next unfinished task.