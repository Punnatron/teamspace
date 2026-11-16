# Portfolio Chat — Backend

Backend ของเว็บ **Chat AI พร้อม Portfolio ของกลุ่ม**
Express 5 + TypeScript + PostgreSQL + LLM (Gemini ผ่าน OpenAI-compatible API) ต่อยอดจากโค้ด Week 11

- เก็บข้อมูล portfolio ของ **กลุ่ม** (ชื่อ แนวคิด จุดเด่น ผลงานร่วมกัน ช่องทางติดต่อ) และ **สมาชิกแต่ละคน** (ชื่อ บทบาท ทักษะ ผลงาน ช่องทางติดต่อ) ใน PostgreSQL
- รับข้อความจาก Chat UI → ส่งต่อให้ AI พร้อม system prompt ที่ใส่ข้อมูล portfolio **ทั้งกลุ่มและสมาชิกทุกคน** → บันทึกประวัติการสนทนาลง PostgreSQL (แยกตามผู้เยี่ยมชม)
- ไม่ใส่ `LLM_API_KEY` = **โหมดออฟไลน์** (ตอบแบบง่ายจากข้อมูล portfolio) ใช้ dev/test ได้โดยไม่เปลืองโควตา
- CI/CD ด้วย **GitLab**: test → build + push image ขึ้น Docker Hub → scan ด้วย Trivy → Render Deploy Hook

```
git push ──▶ GitLab pipeline ──▶ test ──▶ build + push image ──▶ scan ──▶ Render Deploy Hook ──▶ เว็บอัปเดต
```

## โครงสร้าง

```
(root ของ repo)
├── .gitlab-ci.yml           # pipeline CI/CD ของ BE และ FE
├── docker-compose.yml       # db + be + fe ในเครื่อง
├── FE/                      # Frontend (React)
└── BE/
    ├── src/
    │   ├── server.ts        # จุดเริ่มต้น: migrate + โหลด seed แล้วเปิด server
    │   ├── app.ts           # สร้าง Express app (CORS, JSON, routes, error handler)
    │   ├── config.ts        # อ่านค่า environment ทั้งหมด
    │   ├── http/routes.ts   # ทุก endpoint
    │   ├── http/errors.ts   # แปลง error เป็น JSON
    │   ├── db/pool.ts       # connection pool + transaction helper
    │   ├── db/migrations.ts # schema ของฐานข้อมูล
    │   ├── portfolio/       # ตรวจรูปแบบข้อมูล (zod) + อ่าน/เขียน portfolio
    │   ├── chat/            # บันทึก/อ่านประวัติแชต + logic การตอบ
    │   ├── ai/prompt.ts     # persona + กฎ + แปลง portfolio เป็น context ให้ AI
    │   ├── ai/llm.ts        # เรียก LLM
    │   ├── ai/fallback.ts   # คำตอบโหมดออฟไลน์
    │   └── scripts/         # npm run migrate / npm run seed
    ├── seed/portfolio.json  # ⭐ ข้อมูลกลุ่มและสมาชิก — แก้ไฟล์นี้
    ├── tests/               # Vitest + Supertest (ใช้ PostgreSQL จริง)
    ├── Dockerfile
    └── .env.example
```

## ติดตั้งและรันในเครื่อง

ต้องมี **Node.js 22+** และ **Docker** (สำหรับ PostgreSQL)

```bash
cp BE/.env.example BE/.env          # แล้วแก้บรรทัด LLM_API_KEY
```

### วิธีที่ 1: ทั้งระบบด้วย Docker Compose (เหมือน Week 10–11)

```bash
docker-compose up --build -d        # เว็บ http://localhost:8080  ·  API http://localhost:3000/api/health
docker-compose logs --tail=5 be
docker-compose down
```

### วิธีที่ 2: รัน BE ด้วย Node (แก้โค้ดแล้วรีโหลดเอง)

```bash
docker-compose up -d db             # เปิดแค่ PostgreSQL (chat:chat@localhost:5432/chat)
cd BE
npm install
npm run dev                         # http://localhost:3000 — สร้างตาราง + โหลด seed ให้อัตโนมัติ
```

### คำสั่งทั้งหมด (ในโฟลเดอร์ BE)

| คำสั่ง | ทำอะไร |
|---|---|
| `npm run dev` | รันโหมดพัฒนา (tsx watch) |
| `npm run build` / `npm start` | คอมไพล์เป็น `dist/` แล้วรันแบบ production (ใช้ใน Docker) |
| `npm run check` | ตรวจโค้ดด้วย TypeScript |
| `npm test` | รันเทส 21 ข้อ (ต้องมี PostgreSQL — ดูด้านล่าง) |
| `npm run migrate` | สร้าง/อัปเดตตาราง |
| `npm run seed` | บันทึก `seed/portfolio.json` ลงฐานข้อมูล (แทนที่ portfolio เดิม ประวัติแชตไม่หาย) |

**รันเทสในเครื่อง:** เทสใช้ฐานข้อมูล `chat_test` (ข้อมูลในนั้นถูกล้างทุกครั้ง)

```bash
docker-compose up -d db
docker-compose exec db createdb -U chat chat_test   # ครั้งแรกครั้งเดียว
cd BE && npm test
```

ใช้ฐานข้อมูลอื่นได้ด้วย `TEST_DATABASE_URL=postgres://... npm test`

## แก้ข้อมูลกลุ่มและสมาชิก

แก้ `BE/seed/portfolio.json` แล้ว commit + push → pipeline deploy ใหม่ → BE โหลดไฟล์นี้ทับข้อมูลเดิมตอนเปิด (`SEED_MODE=always`) ในเครื่องรัน `npm run seed` หรือ restart ก็ได้ ถ้าไฟล์ผิดรูปแบบ ระบบจะบอกว่าผิดที่ field ไหน (และ `npm test` จะไม่ผ่าน pipeline จึงไม่ deploy ไฟล์เสีย)

- `group` — ชื่อกลุ่ม, สโลแกน, แนวคิด, จุดเด่น
- `projects` — ผลงานที่ทำร่วมกัน
- `contacts` — ช่องทางติดต่อของกลุ่ม (`type` เช่น email, github, facebook, line, phone, website)
- `members[]` — `slug` (a-z, 0-9, - ใช้ใน URL), `name`, `nickname`, `role`, `bio`, `skills`, `avatarUrl`, `projects`, `contacts`

## Environment variables

ดูทั้งหมดใน [`.env.example`](.env.example)

| ตัวแปร | ค่าเริ่มต้น | หมายเหตุ |
|---|---|---|
| `DATABASE_URL` | `postgres://chat:chat@localhost:5432/chat` | บน Render ใช้ Internal Database URL |
| `DATABASE_SSL` | `false` | `true` เมื่อใช้ External URL ของฐานข้อมูลบนคลาวด์ |
| `LLM_API_KEY` | (ว่าง = โหมดออฟไลน์) | สร้างที่ https://aistudio.google.com/apikey |
| `LLM_BASE_URL` / `LLM_MODEL` | Gemini / `gemini-3.5-flash-lite` | |
| `SEED_MODE` | `always` | `always` / `if-empty` (ถ้าแก้ข้อมูลผ่าน `PUT /api/portfolio`) / `off` |
| `CORS_ORIGIN` | `*` | ไม่จำเป็นถ้า FE เรียกผ่าน nginx proxy |
| `CHAT_RATE_LIMIT` | `20` | ข้อความต่อนาทีต่อ IP กันโควตา AI หมด |
| `TRUST_PROXY` | `true` | ใช้ IP จริงจาก `X-Forwarded-For` (BE อยู่หลัง Render + nginx) |
| `LLM_TIMEOUT_MS` | `20000` | ต้องน้อยกว่า 30 วินาทีที่ FE รอ |
| `ADMIN_TOKEN` | (ว่าง = ปิด) | เปิด admin endpoint |

## API

ทุก endpoint ขึ้นต้นด้วย `/api` ตอบเป็น JSON — error มีรูปแบบ `{ "error": "ข้อความ", "details"?: [...] }`
รูปแบบข้อความ `{ id, role, text, createdAt }` เหมือน `Message` ใน FE ของ Week 11

| Method | Path | ใช้ทำอะไร |
|---|---|---|
| GET | `/api/health` | สถานะ server / ฐานข้อมูล / AI |
| GET | `/api/portfolio` | ข้อมูลทั้งหมดของหน้า Portfolio |
| GET | `/api/members` · `/api/members/:slug` | สมาชิกทั้งหมด / รายคน |
| POST | `/api/chat` | ส่งข้อความหา AI |
| GET | `/api/conversations/:id/messages` | ประวัติแชตของบทสนทนา |
| DELETE | `/api/conversations/:id` | ลบบทสนทนา (ปุ่มเริ่มแชตใหม่) |
| PUT | `/api/portfolio` | (admin) แทนที่ portfolio ทั้งชุด |
| GET | `/api/admin/conversations` | (admin) รายการบทสนทนาทั้งหมด |

### `GET /api/portfolio`
```json
{
  "group":    { "name": "...", "tagline": "...", "concept": "...", "highlights": ["..."], "updatedAt": "..." },
  "projects": [{ "id": 1, "title": "...", "description": "...", "tech": ["React"], "url": null }],
  "contacts": [{ "id": 1, "type": "email", "label": "อีเมลกลุ่ม", "value": "group@example.com" }],
  "members": [{
    "id": 1, "slug": "assachi", "name": "...", "nickname": "...", "role": "...", "bio": "...",
    "skills": ["..."], "avatarUrl": null, "projects": [...], "contacts": [...]
  }]
}
```

### `POST /api/chat`
```json
// request — ครั้งแรกไม่ต้องส่ง conversationId
{ "text": "ใครในกลุ่มถนัด ROS2", "conversationId": "uuid (ไม่บังคับ)" }

// response 201
{
  "conversationId": "6f1c...",
  "userMessage":      { "id": 1, "role": "user",      "text": "...", "createdAt": "..." },
  "assistantMessage": { "id": 2, "role": "assistant", "text": "...", "createdAt": "..." }
}
```
- FE เก็บ `conversationId` ไว้ใน `localStorage` แล้วส่งกลับมาทุกครั้ง → AI จำ 10 ข้อความล่าสุดของบทสนทนานั้น และผู้เยี่ยมชมแต่ละคนไม่เห็นแชตของกันและกัน
- `400` ข้อความว่าง/ยาวเกิน 1000 ตัวอักษร/conversationId ไม่ใช่ UUID · `429` ส่งถี่เกินหรือโควตา AI เต็ม · `502` เรียก AI ไม่สำเร็จ (ไม่บันทึกข้อความ)

### `GET /api/conversations/:id/messages`
→ `{ "conversationId": "...", "messages": [Message, ...] }` (ยังไม่มี = `[]`)

### Admin
ตั้ง `ADMIN_TOKEN` แล้วส่ง header `Authorization: Bearer <ADMIN_TOKEN>`

```bash
curl -X PUT https://<ชื่อ-be>.onrender.com/api/portfolio \
  -H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json" \
  --data @seed/portfolio.json
```
(ถ้าใช้วิธีนี้ ให้ตั้ง `SEED_MODE=if-empty` ไม่งั้น deploy ครั้งถัดไปจะโหลดไฟล์ json ทับ)

## สิ่งที่ FE ต้องปรับจาก Week 11

1. **ส่งต่อ `/api` ไปที่ BE** — ใน `FE/nginx/default.conf.template` เปลี่ยน `location /messages` เป็น `location /api` และ**เพิ่มบรรทัด `proxy_set_header X-Forwarded-For`** (ส่ง IP จริงของผู้ใช้ให้ BE ไม่งั้นทุกคนจะใช้โควตา 20 ข้อความ/นาทีร่วมกัน เพราะ BE เห็นทุก request มาจาก nginx ตัวเดียว):
   ```nginx
   location /api {
       resolver ${NGINX_LOCAL_RESOLVERS} valid=10s ipv6=off;
       set $backend ${BE_URL};
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_pass $backend;
       proxy_ssl_server_name on;
       proxy_read_timeout 60s;
   }
   ```
   และใน `FE/vite.config.ts` เปลี่ยน proxy เป็น `'/api': 'http://localhost:3000'`
   (`BE_URL` ยังเป็นกฎเดิม: ขึ้นต้น `https://` และห้ามมี `/` ท้าย)
2. **เรียก API ใหม่** — ตัวอย่าง `FE/src/api.ts`:
   ```ts
   import type { Message, ChatExchange } from './types';

   const KEY = 'conversationId';

   export async function fetchMessages(): Promise<Message[]> {
     const id = localStorage.getItem(KEY);
     if (!id) return [];
     const res = await fetch(`/api/conversations/${id}/messages`, { signal: AbortSignal.timeout(5000) });
     if (!res.ok) throw new Error(`HTTP ${res.status}`);
     return (await res.json()).messages;
   }

   export async function sendMessage(text: string): Promise<ChatExchange> {
     const res = await fetch('/api/chat', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ text, conversationId: localStorage.getItem(KEY) ?? undefined }),
       signal: AbortSignal.timeout(30000),
     });
     const data = await res.json();
     if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
     localStorage.setItem(KEY, data.conversationId);
     return data;
   }

   export async function clearMessages(): Promise<void> {
     const id = localStorage.getItem(KEY);
     localStorage.removeItem(KEY);
     if (id) await fetch(`/api/conversations/${id}`, { method: 'DELETE' });
   }

   export async function fetchPortfolio() {
     const res = await fetch('/api/portfolio', { signal: AbortSignal.timeout(10000) });
     if (!res.ok) throw new Error(`HTTP ${res.status}`);
     return res.json();
   }
   ```
   `updateMessage` / `deleteMessage` รายข้อความของ Week 11 ไม่มีแล้ว (ผู้เยี่ยมชมไม่ควรแก้คำตอบของ AI) — ใช้ `clearMessages` เป็นปุ่ม "เริ่มแชตใหม่"
3. **แสดงคำตอบ AI เป็นข้อความธรรมดา** (`{message.text}` ใน JSX ซึ่ง React escape ให้อยู่แล้ว) — ห้ามใช้ `dangerouslySetInnerHTML` กับคำตอบ AI เพราะผู้ใช้อาจหลอกให้ AI ตอบเป็นโค้ด HTML/JS ได้ (XSS)

## การเชื่อมต่อ AI ทำงานอย่างไร

ทุกครั้งที่มีข้อความเข้า `POST /api/chat`:

1. อ่าน portfolio ล่าสุดจาก PostgreSQL (แก้ข้อมูลแล้ว AI รู้ทันที)
2. `ai/prompt.ts` สร้าง system prompt = **persona** + **กฎ** (ตอบจากข้อมูลเท่านั้น ห้ามแต่ง, ตอบได้ทั้งเรื่องกลุ่มและรายบุคคล, ค้นข้ามสมาชิกทุกคนเมื่อถามเชิงเปรียบเทียบ, กัน prompt injection) + **ข้อมูลกลุ่มและสมาชิกทุกคน** ใน `<portfolio>…</portfolio>`
3. แนบประวัติ 10 ข้อความล่าสุดของบทสนทนานั้น แล้วส่งให้ LLM
4. บันทึกคำถาม + คำตอบเป็นคู่ใน transaction เดียว

แก้บุคลิกบอทได้ที่ `PERSONA` ใน `src/ai/prompt.ts`

## ฐานข้อมูล

| ตาราง | เก็บอะไร |
|---|---|
| `group_info` | ข้อมูลกลุ่ม (แถวเดียว) |
| `members` | สมาชิก |
| `projects` | ผลงาน — `member_id = NULL` คือผลงานกลุ่ม |
| `contacts` | ช่องทางติดต่อ — `member_id = NULL` คือของกลุ่ม |
| `conversations` | 1 แถว = 1 บทสนทนา (1 ผู้เยี่ยมชม) |
| `messages` | ข้อความ `user` / `assistant` ของแต่ละบทสนทนา |
| `schema_migrations` | migration ที่รันไปแล้ว |

## CI/CD (GitLab)

ไฟล์ `.gitlab-ci.yml` ที่ root ของ repo

| stage | job | ทำอะไร | เมื่อไร |
|---|---|---|---|
| test | `test-be` | `npm ci` → `npm run check` → `npm test` (เปิด PostgreSQL 18 เป็น service) | ทุก push |
| test | `test-fe` | `npm ci` → `npm run typecheck` → `npm run build` | ทุก push (ถ้ามีโฟลเดอร์ FE) |
| build | `build-be`, `build-fe` | build image แล้ว push ขึ้น Docker Hub tag `latest` และ `<commit sha>` | branch หลัก |
| scan | `scan-be`, `scan-fe` | Trivy รายงาน HIGH/CRITICAL, ล้มถ้าเจอ CRITICAL ที่แก้ได้ | branch หลัก |
| deploy | `deploy-be`, `deploy-fe` | เรียก Render Deploy Hook ให้ดึง image ใหม่ | branch หลัก |

ถ้า stage ไหนล้ม stage ถัดไปจะไม่ทำ → โค้ดที่เทสไม่ผ่านหรือมีช่องโหว่ร้ายแรงจะไม่ถูก deploy

### ตั้งค่าครั้งแรก

1. **Docker Hub** — สร้าง Personal access token (Account settings → Personal access tokens)
2. **GitLab** → Settings → CI/CD → Variables

   | ชื่อ | ค่า |
   |---|---|
   | `DOCKERHUB_USERNAME` | ชื่อบัญชี Docker Hub |
   | `DOCKERHUB_TOKEN` | token จากข้อ 1 (ติ๊ก Mask) |
   | `RENDER_DEPLOY_HOOK_BE` | ใส่หลังทำข้อ 4 (ติ๊ก Mask) |
   | `RENDER_DEPLOY_HOOK_FE` | ใส่หลังทำข้อ 5 (ติ๊ก Mask) |

   push เข้า `main` หนึ่งครั้งให้ได้ image `portfolio-be` / `portfolio-fe` บน Docker Hub ก่อน (job deploy จะล้มเพราะยังไม่มี hook — ไม่เป็นไร)
3. **Render → New → Postgres** (Free, region Singapore) → คัดลอก **Internal Database URL**
4. **Render → New → Web Service → Existing Image** → `docker.io/<DOCKERHUB_USERNAME>/portfolio-be:latest`
   - Environment: `DATABASE_URL` = URL จากข้อ 3, `LLM_API_KEY`, `LLM_MODEL`, `LLM_BASE_URL`
   - Health Check Path: `/api/health`
   - Settings → Deploy Hook → คัดลอกไปใส่ `RENDER_DEPLOY_HOOK_BE`
5. **Render → Web Service → Existing Image** → `docker.io/<DOCKERHUB_USERNAME>/portfolio-fe:latest`
   - Environment: `BE_URL` = `https://<ชื่อ-be>.onrender.com` (ไม่มี `/` ท้าย)
   - Deploy Hook → `RENDER_DEPLOY_HOOK_FE`
6. push อีกครั้ง → ดูที่ Build → Pipelines ว่าเขียวครบ 4 stage แล้วเปิดเว็บ FE

> Render free plan: service หลับเมื่อไม่มีคนใช้ 15 นาที (เปิดครั้งแรกรอ ~1 นาที) ก่อนนำเสนอให้เปิด `https://<ชื่อ-be>.onrender.com/api/health` ค้างไว้ก่อน — PostgreSQL ฟรีของ Render มีอายุจำกัด (ประมาณ 30 วัน) ถ้าหมดอายุให้สร้างใหม่หรือใช้ [Neon](https://neon.tech) แทน (`DATABASE_SSL=true`)
