# StreamVault

Full-stack video streaming app with a production-grade auth system. Supports email/password auth, Google OAuth, JWT sessions, password reset via email, and a universal video player (YouTube, MP4, HLS).

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, TypeScript, TailwindCSS, shadcn/ui, React Router v6 |
| Backend | FastAPI, Motor (async MongoDB), python-jose (JWT), passlib (bcrypt) |
| Database | MongoDB Atlas |
| Auth | Google OAuth 2.0, JWT (stored in localStorage) |
| Email | Gmail SMTP via aiosmtplib |
| Video | react-player (YouTube/Vimeo), hls.js (HLS/MP4) |

---

## Prerequisites

- Python 3.10+
- Node.js 18+
- A [MongoDB Atlas](https://cloud.mongodb.com) cluster (free tier works)
- A Google Cloud project with OAuth 2.0 credentials
- A Gmail account with an [App Password](https://myaccount.google.com/apppasswords) generated

---

## 1. Clone the repo

```bash
git clone https://github.com/Elizaarora/StreamVault.git
cd StreamVault
```

---

## 2. Backend setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
```

### Create your `.env` file

```bash
cp .env.example .env
```

Edit `backend/.env` and fill in all values (see `.env.example` for field descriptions).

### Run the backend

```bash
# from the backend/ directory, with .venv active
uvicorn main:app --reload --port 8000
```

API → `http://localhost:8000` | Docs → `http://localhost:8000/docs`

---

## 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

App → `http://localhost:5173`

---

## 4. Google OAuth setup

1. Go to [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services** → **Credentials**
2. Create an **OAuth 2.0 Client ID** (type: Web application)
3. Under **Authorized redirect URIs** add: `http://localhost:8000/auth/google/callback`
4. Copy the **Client ID** and **Client Secret** into your `.env`

---

## 5. Gmail SMTP setup

Gmail requires an App Password (not your regular login password):

1. Enable 2-Step Verification on your Google account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Create a new app password (name it "StreamVault")
4. Copy the 16-character password into `SMTP_PASSWORD` in your `.env`
5. Set `SMTP_USER` to your Gmail address

> **Note:** Forgot password only works for email/password accounts. Google OAuth accounts are shown a "use Google Sign-In" message instead.

---

## Project structure

```
StreamVault/
├── backend/
│   ├── core/
│   │   ├── config.py        # pydantic-settings, reads .env
│   │   ├── database.py      # Motor async MongoDB client
│   │   ├── email.py         # Gmail SMTP password reset email
│   │   └── security.py      # bcrypt hashing + JWT helpers
│   ├── models/
│   │   └── user.py          # Pydantic request/response models
│   ├── routers/
│   │   └── auth.py          # All auth endpoints
│   ├── auth.py              # Google OAuth token exchange helpers
│   ├── main.py              # FastAPI app entry point
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ProtectedRoute.tsx
│       │   ├── VideoPlayer.jsx      # Routes YouTube vs MP4/HLS
│       │   ├── YoutubePlayer.jsx    # react-player with Suspense
│       │   ├── Html5Player.jsx      # Custom player: HLS + MP4, full controls
│       │   └── ui/                  # shadcn/ui components
│       ├── context/
│       │   └── AuthContext.tsx
│       ├── hooks/
│       │   └── useAuth.ts
│       ├── lib/
│       │   └── api.ts               # axios instance + all API calls
│       └── pages/
│           ├── Login.tsx
│           ├── Signup.tsx
│           ├── Dashboard.tsx        # Video player UI
│           ├── OAuthCallback.tsx
│           ├── SetupUsername.tsx
│           └── ResetPassword.tsx
└── README.md
```

---

## Auth flows

| Flow | How it works |
|---|---|
| Email signup | POST `/auth/signup` → JWT returned |
| Email login | POST `/auth/login` → JWT returned |
| Google signup | GET `/auth/google?mode=signup` → OAuth → new account created |
| Google signin | GET `/auth/google?mode=signin` → OAuth → existing account matched |
| New Google user | Redirected to `/setup-username` to choose a username |
| Forgot password | POST `/auth/forgot-password` → reset link emailed (email/password accounts only) |
| Reset password | POST `/auth/reset-password` → token verified, password updated |

---

## Video player

The dashboard includes a universal video player. Paste any URL and click **Play Video**:

| URL type | Player used |
|---|---|
| `youtube.com` / `youtu.be` | react-player (YouTube embed) |
| `.mp4` or direct video file | Custom HTML5 player |
| `.m3u8` (HLS stream) | Custom HTML5 player via hls.js |

**Keyboard shortcuts** (HTML5 player): `Space` play/pause · `←` rewind 10s · `→` forward 10s · `M` mute

---

## Known dependency pins

These are pinned intentionally — do not upgrade without testing:

- `bcrypt==3.2.2` — passlib 1.7.4 is incompatible with bcrypt 4+
- `pymongo==4.9.2` — motor 3.6.0 requires pymongo < 4.10
