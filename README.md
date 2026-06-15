# StreamVault

Full-stack authentication system built with FastAPI + React 18. Supports email/password auth, Google OAuth, JWT sessions, and password reset via email.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, TypeScript, TailwindCSS, shadcn/ui, React Router v6 |
| Backend | FastAPI, Motor (async MongoDB), python-jose (JWT), passlib (bcrypt) |
| Database | MongoDB Atlas |
| Auth | Google OAuth 2.0, JWT (stored in localStorage) |
| Email | Gmail SMTP via aiosmtplib |

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

Copy the example and fill in your values:

```bash
cp .env.example .env
```

Edit `backend/.env`:

```env
# MongoDB Atlas connection string
MONGODB_URL=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?appName=Cluster0
DATABASE_NAME=auth_db

# JWT — generate with: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=your-64-char-hex-secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Google OAuth (see setup below)
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# Gmail SMTP (use an App Password, NOT your Gmail login password)
SMTP_USER=you@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
FROM_NAME=StreamVault

# App
FRONTEND_URL=http://localhost:5173
APP_NAME=StreamVault
```

### Run the backend

```bash
# from the backend/ directory, with .venv active
uvicorn main:app --reload --port 8000
```

API is now at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

---

## 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

App is now at `http://localhost:5173`.

---

## 4. Google OAuth setup

1. Go to [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services** → **Credentials**
2. Create an **OAuth 2.0 Client ID** (type: Web application)
3. Under **Authorized redirect URIs** add: `http://localhost:8000/auth/google/callback`
4. Copy the **Client ID** and **Client Secret** into your `.env`

---

## 5. Gmail SMTP setup

Gmail requires an App Password (not your login password):

1. Enable 2-Step Verification on your Google account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Create a new app password (name it anything, e.g. "StreamVault")
4. Copy the 16-character password into `SMTP_PASSWORD` in your `.env`
5. Set `SMTP_USER` to your Gmail address

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
│       │   └── ui/           # shadcn/ui components
│       ├── context/
│       │   └── AuthContext.tsx
│       ├── hooks/
│       │   └── useAuth.ts
│       ├── lib/
│       │   └── api.ts        # axios instance + all API calls
│       └── pages/
│           ├── Login.tsx
│           ├── Signup.tsx
│           ├── Dashboard.tsx
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

## Known dependency pins

These are pinned intentionally — do not upgrade without testing:

- `bcrypt==3.2.2` — passlib 1.7.4 is incompatible with bcrypt 4+
- `pymongo==4.9.2` — motor 3.6.0 requires pymongo < 4.10
