# TEAMSPACE — Frontend & Backend API Contract

> เอกสารข้อเสนอ API Contract สำหรับประสานงานระหว่าง Frontend และ Backend
> **สถานะ:** Proposed / รอทีม Backend ยืนยัน
> **วันที่จัดทำ:** 12 พฤศจิกายน 2026

---

## 1. วัตถุประสงค์

กำหนดรูปแบบการสื่อสารระหว่างหน้า Chat ของ Frontend (React + TypeScript) กับ Backend เพื่อให้ทั้งสองฝั่งใช้ URL, HTTP Method, JSON Request และ JSON Response ตรงกัน

ระหว่างที่ Backend ยังไม่พร้อม Frontend จะใช้ Mock API ต่อไปได้ โดยไม่จำเป็นต้องเปลี่ยนหน้า Chat หรือส่วนแสดงข้อความ

## 2. ขอบเขตและสถานะปัจจุบัน

จากโครงสร้าง Frontend ที่พัฒนาไว้:

- หน้า Chat เรียก `sendChatMessage(question)` จาก `src/services/chatApi.ts`
- มีแนวทางแยก Mock API และ Real API
- Mock API ใช้ข้อมูล Portfolio ของทีมในการจำลองคำตอบ
- Real API ใช้ Fetch API ส่งคำถามไปยัง Backend
- `ChatPage.tsx` จัดการสถานะ Loading, Error และ Retry
- ประวัติแชตถูกเก็บใน `localStorage` ฝั่ง Browser

**หมายเหตุ:** เอกสารนี้อธิบาย Contract ที่เสนอให้ใช้ร่วมกัน
โดยได้ตรวจสอบความสอดคล้องกับ Frontend `chatApi.ts` ฉบับปัจจุบันแล้ว

อย่างไรก็ตาม ยังไม่ได้รับการยืนยันว่า Backend ของทีม
implement ตาม Contract นี้แล้ว จึงยังคงมีสถานะ Proposed
จนกว่าทีม Backend จะยืนยันรายละเอียดการเชื่อมต่อ

## 3. Proposed API Contract

### 3.1 Base URL

สำหรับ Local Development เสนอให้ใช้:

`http://localhost:3000`

Base URL จริงอาจเปลี่ยนตามการตั้งค่าของ Backend หรือระบบ Deploy

### 3.2 ส่งข้อความไปยัง AI

| รายการ | ค่าเสนอ |
|---|---|
| HTTP Method | `POST` |
| Endpoint | `/messages` |
| Full URL (local) | `http://localhost:3000/messages` |
| Content-Type | `application/json` |
| Success status | `200 OK` |

### 3.3 Request

Frontend ส่ง JSON:

```json
{
  "text": "Who are your team members?"
}
```

- `text` ต้องเป็น String
- ต้องไม่เป็นข้อความว่างหลัง trim ช่องว่าง
- Backend ควรตรวจสอบข้อมูลก่อนส่งต่อให้ AI

### 3.4 Success Response

Backend ตอบกลับ JSON:

```json
{
  "reply": "Our team has three members..."
}
```

`reply` ต้องเป็น String และ Frontend จะแสดงค่านี้เป็นข้อความของ Assistant

### 3.5 Error Response (ข้อเสนอ)

รูปแบบ Error ที่แนะนำ:

```json
{
  "error": {
    "code": "INVALID_MESSAGE",
    "message": "The text field is required."
  }
}
```

สถานะ HTTP ที่แนะนำ:

| HTTP Status | ความหมาย | ตัวอย่าง |
|---|---|---|
| `400` | Bad Request | ไม่มี `text` หรือ `text` ไม่ใช่ String |
| `404` | Not Found | เรียก Endpoint ที่ไม่มี |
| `500` | Internal Server Error | Backend เกิดข้อผิดพลาด |
| `503` | Service Unavailable | AI service ยังไม่พร้อมใช้งาน |

Frontend ควรถือว่า Response ที่ `response.ok` เป็น `false` คือคำขอไม่สำเร็จ และแสดง Error พร้อมให้ผู้ใช้ลอง Retry ได้

## 4. CORS

ถ้า Frontend และ Backend ทำงานคนละ Origin เช่น:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`

Backend ต้องตั้งค่า CORS ให้ยอมรับ Origin ของ Frontend และอนุญาต Method `POST`, `OPTIONS` รวมถึง Header `Content-Type`

พอร์ตของ Vite อาจไม่ใช่ `5173` เสมอไป ให้ใช้ Local URL ที่แสดงใน Terminal ขณะรัน `npm run dev` แล้วแจ้ง Origin นั้นให้ผู้พัฒนา Backend

ใน Production ควรกำหนด Origin ของเว็บไซต์ Frontend ที่ Deploy จริง ไม่ควรเปิด CORS กว้างเกินจำเป็น

ตัวอย่าง Local Development ปัจจุบัน:

- Frontend: `http://localhost:5175`
- Backend (proposed): `http://localhost:3000`

หมายเหตุ: Port ของ Frontend อาจเปลี่ยนแปลงได้
ให้ตรวจสอบ URL จริงจาก Terminal ขณะรัน Vite

## 5. Environment Variables ฝั่ง Frontend

ไฟล์ `.env.example` ในโฟลเดอร์ `FE` ควรมี:

```env
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=http://localhost:3000
```

ไฟล์ `.env.local` ใช้ค่าเดียวกันได้ในช่วงที่ Backend ยังไม่พร้อม:

```env
VITE_USE_MOCK_API=true
VITE_API_BASE_URL=http://localhost:3000
```

ความหมาย:
- `VITE_USE_MOCK_API=true` ให้ Frontend ใช้ Mock API
- `VITE_USE_MOCK_API=false` ให้ Frontend เลือก Real API
- `VITE_API_BASE_URL` คือ Base URL ของ Backend

**ข้อควรระวัง:** ห้ามใส่ AI API Key, Database Password, Token หรือ Secret ใน Environment Variable ที่ขึ้นต้นด้วย `VITE_` เพราะค่าดังกล่าวอาจถูกฝังในโค้ดฝั่ง Browser ได้ Secret ต้องเก็บไว้ใน Backend เท่านั้น

หลังแก้ไข `.env.local` ต้อง Restart Vite Dev Server เพื่อให้โหลดค่าใหม่

**หมายเหตุ:** ค่า `VITE_API_BASE_URL` ควรระบุเป็น Base URL
โดยไม่ใส่ `/` ต่อท้าย เช่น:

`http://localhost:3000`

เนื่องจาก Frontend จะนำ URL นี้ไปต่อกับ `/messages`

## 6. ลำดับการทำงานของ Frontend

1. ผู้ใช้พิมพ์ข้อความใน Chat
2. `ChatPage.tsx` เรียก `sendChatMessage(text)`
3. `chatApi.ts` ตรวจค่า `VITE_USE_MOCK_API`
4. ถ้าเป็น `true` จะเรียก Mock API
5. ถ้าเป็น `false` จะเรียก Real API ไปที่ `${VITE_API_BASE_URL}/messages`
6. Backend ประมวลผลและส่ง `{ "reply": "..." }`
7. Frontend นำ `reply` ไปแสดงเป็นข้อความ Assistant
8. ถ้าเกิด Error หน้า Chat จะแสดงข้อความผิดพลาดและมีทางเลือก Retry

## 7. ตัวอย่างการเรียก API ด้วย Fetch

ตัวอย่างนี้เป็นรูปแบบอ้างอิงของ Real API ไม่ใช่คำสั่งให้แทนที่ไฟล์ปัจจุบันทันที:

```ts
async function realSendMessage(text: string): Promise<string> {
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL is not configured.");
  }

  const response = await fetch(`${API_BASE_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    throw new Error(`Chat API failed: ${response.status}`);
  }

  const data: unknown = await response.json();

  if (
    typeof data !== "object" ||
    data === null ||
    !("reply" in data) ||
    typeof data.reply !== "string"
  ) {
    throw new Error("Invalid response from Chat API.");
  }

  return data.reply;
}
```

## 8. Checklist สำหรับ Backend

- [ ] ยืนยัน Base URL สำหรับ Local Development
- [ ] ยืนยัน Endpoint เป็น `POST /messages`
- [ ] ยืนยัน Request ใช้ `{ "text": "..." }`
- [ ] ยืนยัน Success Response ใช้ `{ "reply": "..." }`
- [ ] กำหนด HTTP Status สำหรับ Success และ Error
- [ ] ตรวจสอบข้อความว่างหรือ Request ที่ไม่ถูกต้อง
- [ ] ตั้งค่า CORS ให้ Frontend เรียกได้
- [ ] เก็บ AI API Key ไว้ฝั่ง Server เท่านั้น
- [ ] มีตัวอย่าง Request/Response หรือวิธีทดสอบ API
- [ ] แจ้ง Base URL สำหรับทดสอบเมื่อ Backend พร้อม

## 9. Checklist สำหรับ Frontend ก่อนเปลี่ยนเป็น Real API

- [ ] ได้รับการยืนยัน API Contract จาก Backend
- [ ] ทราบ Base URL ที่ใช้งานได้จริง
- [ ] Backend เปิดใช้งานและทดสอบ Endpoint ได้
- [ ] CORS อนุญาต Origin ของ Frontend
- [ ] ตรวจสอบว่า `chatApi.ts` ฉบับล่าสุดตรงกับ Contract
- [ ] เปลี่ยน `VITE_USE_MOCK_API` เป็น `false` ใน Environment ที่ต้องการทดสอบ
- [ ] Restart Dev Server
- [ ] ทดสอบส่งข้อความและรับคำตอบจริง
- [ ] ทดสอบกรณี Backend ปิดหรือเกิด Error
- [ ] ทดสอบ Retry และตรวจว่า LocalStorage ยังทำงาน
- [ ] รัน `npm run build` อีกครั้ง
- [ ] ตรวจสอบว่า `VITE_API_BASE_URL` ไม่มี `/` ต่อท้าย
- [ ] ทดสอบกรณี Response เป็น JSON ที่ไม่มี `reply`
- [ ] ทดสอบกรณี Backend ส่ง HTTP Error Status

## 10. ข้อความสำหรับส่งให้ทีม Backend

> Frontend ของ TEAMSPACE ขอเสนอ API Contract สำหรับ Chat เป็น `POST /messages`
>
> Request:
> ```json
> { "text": "คำถามจากผู้ใช้" }
> ```
>
> Success Response:
> ```json
> { "reply": "คำตอบจาก AI" }
> ```
>
> ใช้ `Content-Type: application/json` และตอบ `200 OK` เมื่อสำเร็จ
>
> รบกวนยืนยันว่า Backend ใช้รูปแบบนี้ได้หรือไม่ หากมี API ที่ทำไว้แล้ว ขอ Base URL, Endpoint, Method, Request/Response JSON, Error format และสถานะ CORS ด้วย เพื่อให้ Frontend ปรับให้ตรงกับระบบจริง

## 11. ข้อสรุป

ณ วันที่จัดทำเอกสาร Frontend ยังสามารถพัฒนาต่อและทดสอบด้วย Mock API ได้ การเชื่อมต่อ Real API จะเริ่มหลังจาก Backend ยืนยัน Contract และมี Endpoint ที่ทดสอบได้แล้ว

**อย่าเปลี่ยน `VITE_USE_MOCK_API` เป็น `false` จนกว่า Backend จะพร้อมและยืนยันรูปแบบ API แล้ว**
