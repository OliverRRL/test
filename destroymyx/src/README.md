# DestroyMyX

Paste your LinkedIn, dating profile, business pitch or bio. Claude roasts it. The crowd judges.

---

## Stack

- **Frontend**: React + Vite (no Tailwind, plain inline styles)
- **Backend**: FastAPI + Uvicorn
- **AI**: Anthropic Claude Sonnet
- **DB**: Supabase (Postgres)
- **Payments**: Lemon Squeezy (TODO — stub in place)
- **Deploy**: Vercel (frontend) + Railway or Fly.io (backend)

---

## Setup

### 1. Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `backend/schema.sql`
3. Copy your Project URL and anon key from Settings → API

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Fill in ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY

uvicorn main:app --reload
# Runs on http://localhost:8000
```

### 3. Frontend

```bash
cd frontend
npm install

cp .env.example .env
# VITE_API_URL=http://localhost:8000

npm run dev
# Runs on http://localhost:5173
```

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
# Push to GitHub, connect repo in Vercel
# Set env var: VITE_API_URL=https://your-backend-url.railway.app
```

### Backend → Railway

1. Push to GitHub
2. New Railway project → Deploy from repo → select `/backend`
3. Add env vars from `.env`
4. Railway auto-detects FastAPI and runs uvicorn

Update `FRONTEND_URL` in Railway env vars to your Vercel URL once deployed.

---

## Payments (TODO)

The unlock flow in `App.jsx` calls `roastCount.unlock()` directly as a placeholder.

To wire up Lemon Squeezy:
1. Create a product at [lemonsqueezy.com](https://lemonsqueezy.com) — one-time $4.99
2. Add a checkout URL button in `UnlockModal`
3. Use Lemon Squeezy webhooks or their JS SDK to confirm payment
4. On success: call `roastCount.unlock()` 

Lemon Squeezy handles GST/VAT automatically — important for AU.

---

## Rate limiting

- `/api/roast` — 10 requests/hour per IP (slowapi)
- Client-side 3-roast limit via localStorage (30-day window)
- Reactions — 60/min per IP

---

## Project structure

```
destroymyx/
├── backend/
│   ├── main.py           # FastAPI app, all routes
│   ├── requirements.txt
│   ├── schema.sql        # Run this in Supabase
│   └── .env.example
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx               # Root, tab routing, unlock modal
        ├── main.jsx
        ├── index.css
        ├── lib/
        │   ├── api.js            # Axios calls to backend
        │   └── constants.js      # Categories, reactions, colours
        ├── hooks/
        │   └── useRoastCount.js  # Free tier limit logic
        └── components/
            ├── UI.jsx            # ScoreMeter, ReactionBar, AdBanner, UnlockModal
            ├── RoastTab.jsx      # Input form + result display
            ├── FeedTab.jsx       # Public feed + reactions
            └── LeaderboardTab.jsx
```
