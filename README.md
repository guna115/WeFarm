# 🌱 WeFarm — Real-Time Nursery Discovery Platform

A mobile-first platform connecting nursery sellers with nearby buyers. Browse fresh vegetable seedlings, contact sellers directly — no payments, no middlemen.

## ✨ Features

### Buyer Side (No Login)
- 📍 Location-based nearby nursery feed
- 📱 Instagram-style scrolling posts
- 🔍 Search by plant name or nursery
- 🏷️ Category filters (Tomato, Chilli, Brinjal, etc.)
- 📞 Direct Call & WhatsApp buttons
- 🚚 Courier availability indicator
- 📏 Distance from your location

### Seller Side (OTP Login)
- 🔐 Phone OTP authentication (Firebase)
- 📸 Live camera-only photo capture (no gallery)
- 🖼️ Auto watermarking (nursery name + date)
- ✏️ Simple post creation form
- 🗑️ Post management & deletion
- ⏰ Auto-expiry after 5 days

### Platform
- 🌍 Multilingual (English, Telugu, Hindi)
- 🛡️ Rate limiting & spam prevention
- 👨‍💼 Admin panel for moderation
- 🧹 Daily auto-cleanup of expired posts

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Auth | Firebase Phone OTP |
| Storage | Cloudinary |
| Maps | OpenStreetMap, Leaflet.js |
| Image Processing | Sharp |
| Scheduling | node-cron |

## 📁 Project Structure

```
WEFARM/
├── frontend/           # Next.js app
│   ├── app/           # Pages (App Router)
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── services/      # API service layer
│   ├── lib/           # Firebase config
│   └── i18n/          # Language files
│
├── backend/           # Express.js API
│   └── src/
│       ├── routes/    # API endpoints
│       ├── middleware/ # Auth, rate limiting
│       ├── utils/     # Cloudinary, watermark, distance
│       ├── cron/      # Auto-delete scheduler
│       └── config/    # DB connection, schema
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Firebase project (Phone Auth enabled)
- Cloudinary account

### 1. Clone & Install

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Environment Setup

**Frontend** — Copy `.env.local.example` to `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

**Backend** — Copy `.env.example` to `.env`:
```env
DATABASE_URL=postgresql://user:pass@host/db
FIREBASE_PROJECT_ID=your_project_id
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
JWT_SECRET=your_secret
PORT=5000
```

### 3. Database Setup

Run the schema SQL against your PostgreSQL:
```bash
psql $DATABASE_URL -f backend/src/config/schema.sql
```

### 4. Run Development Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
```

Frontend: http://localhost:3000
Backend: http://localhost:5000

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/verify` | — | Verify Firebase token |
| POST | `/api/seller/profile` | ✅ | Create/update profile |
| GET | `/api/seller/profile` | ✅ | Get seller profile |
| GET | `/api/seller/posts` | ✅ | Get seller's posts |
| GET | `/api/posts/nearby` | — | Nearby posts (lat, lng) |
| GET | `/api/posts/search` | — | Search posts |
| POST | `/api/posts/create` | ✅ | Create post |
| DELETE | `/api/posts/:id` | ✅ | Delete post |
| POST | `/api/posts/:id/report` | — | Report post |
| POST | `/api/upload` | ✅ | Upload images |

## 🚢 Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Railway |
| Database | Neon (PostgreSQL) |

## 📄 License

MIT
