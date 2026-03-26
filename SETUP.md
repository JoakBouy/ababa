# Enjojo Foundation Command Centre — Setup Guide

A fleet management dashboard for Starlink terminals across East Africa. Built with React 19 + Vite on the frontend and a Python FastAPI backend that connects to the Starlink cloud API.

---

## Prerequisites

| Tool | Minimum Version | Notes |
|------|----------------|-------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| Python | 3.11+ | 3.14 works; avoid 3.9 (no pre-built wheels for some deps) |
| pip | 23+ | Comes with Python |
| Git | any | For cloning |

---

## 1. Clone and Install

```bash
git clone <repo-url>
cd Enjojo-Command-
```

**Frontend dependencies:**
```bash
npm install
```

**Backend dependencies:**
```bash
pip install -r server/requirements.txt
```

> On Python 3.12+ use `pip install --upgrade pip` first if you get build errors.

---

## 2. Environment Configuration

Copy the example file:
```bash
cp .env.example .env
```

Open `.env` and configure:

```env
# Set to "remote" for live Starlink data, "mock" for demo data
STARLINK_MODE="mock"

# Your Mapbox token for satellite map tiles (optional — falls back to OpenStreetMap)
VITE_MAPBOX_TOKEN=""

# Dashboard operator login — change in production
# Default credentials: admin@enjojofoundation.org / password123
OPERATOR_ACCOUNTS="admin@enjojofoundation.org:$2b$12$ohGXFZAjFyhMA2BP6i3e1u7tQmjHyZQEIGaaWXfgsrjLkkLSLeaGO"
```

To change the admin password, generate a new bcrypt hash:
```bash
python -c "import bcrypt; print(bcrypt.hashpw(b'your_new_password', bcrypt.gensalt(12)).decode())"
```
Then replace the hash value in `OPERATOR_ACCOUNTS`.

---

## 3. Start the Servers

You need two terminals running simultaneously.

**Terminal 1 — Python backend (port 8000):**
```bash
npm run backend
# equivalent to: uvicorn server.main:app --reload --port 8000
```

**Terminal 2 — React frontend (port 3000):**
```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

**Default login:**
- Email: `admin@enjojofoundation.org`
- Password: `password123`

The Vite dev server proxies all `/api/*` requests to the FastAPI backend automatically — no CORS issues in development.

---

## 4. Connecting Real Starlink Terminals

By default the app runs in **mock mode** with demo data. To connect to your actual Starlink fleet, switch to **remote mode**.

### Step 1 — Install Cookie-Editor

Install the **Cookie-Editor** browser extension:
- [Chrome](https://chrome.google.com/webstore/detail/cookie-editor/hlkenndednhfkekhgcdicdfddnkalmdm)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/cookie-editor/)

### Step 2 — Export Starlink cookies

1. Open a new tab and go to **https://www.starlink.com**
2. Log in with your Starlink account credentials
3. Once logged in, click the **Cookie-Editor** extension icon in your toolbar
4. Click **Export** → **Export as JSON**
5. The full cookie JSON is now in your clipboard

### Step 3 — Link the account in the dashboard

1. Make sure the backend is running (`npm run backend`)
2. Open the dashboard → click **Settings** in the sidebar
3. Under **Linked Starlink Accounts**, click **Link New Account**
4. **Step 1:** Enter your Starlink account email
5. **Step 2:** Follow the on-screen Cookie-Editor instructions (already done above)
6. **Step 3:** Paste the cookie JSON from your clipboard → click **Save Account**

The backend saves the cookies to `server/cookies/<email>.json` and loads the client immediately. No restart needed.

### Step 4 — Enable remote mode

Edit `.env`:
```env
STARLINK_MODE="remote"
```

Restart the backend:
```bash
# Ctrl+C to stop, then:
npm run backend
```

The dashboard now shows your live terminals, real GPS coordinates, live telemetry, and actual WiFi configuration.

> **Cookie expiry:** Starlink session cookies are valid for approximately 15 days. The library auto-refreshes them. When they expire, repeat Step 2–3 to re-export and re-link the account.

---

## 5. Adding Multiple Starlink Accounts

If you manage multiple Starlink accounts (e.g. separate accounts per country), repeat the cookie export and link steps for each account. Each account appears as a separate entry under Settings → Linked Accounts. All their terminals are merged into a single fleet view on the dashboard.

---

## 6. Production Deployment

### Environment

Change these values in `.env` before deploying:

```env
# Generate with: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY="<long-random-string>"

# New bcrypt hash for your production password
OPERATOR_ACCOUNTS="admin@yourorg.org:<bcrypt-hash>"

STARLINK_MODE="remote"
```

### Build the frontend

```bash
npm run build
```

Static files are output to `dist/`. Serve them from any static host (Nginx, Caddy, S3 + CloudFront, Vercel, etc.) or have FastAPI serve them directly.

### Run the backend

```bash
uvicorn server.main:app --host 0.0.0.0 --port 8000
```

For production, run behind a reverse proxy (Nginx/Caddy) with TLS. Example Nginx block:

```nginx
server {
    listen 443 ssl;
    server_name dashboard.yourorg.org;

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
    }

    location / {
        root /var/www/enjojo-command/dist;
        try_files $uri /index.html;
    }
}
```

### Persisting cookies across restarts

The `server/cookies/` directory contains your Starlink session cookies. Back it up and ensure the process user has read/write access. The library creates a `server/cookies/refresh/` subdirectory for auto-refreshed tokens.

---

## 7. Project Structure

```
Enjojo-Command-/
├── src/                    # React frontend
│   ├── pages/              # Dashboard, Terminals, Analytics, Impact, Settings
│   ├── components/         # Layout, ProtectedRoute, ToastContainer, ErrorBoundary
│   ├── contexts/           # AuthContext, ToastContext
│   ├── services/api.ts     # Frontend REST client → FastAPI backend
│   └── utils/              # cn(), leafletSetup
├── server/                 # FastAPI backend
│   ├── main.py             # App entry point, CORS, router registration
│   ├── config.py           # Pydantic settings (reads .env)
│   ├── models/schemas.py   # Pydantic request/response models
│   ├── routes/             # auth, terminals, analytics, accounts
│   ├── services/starlink.py# Mock / Remote / Local service layer
│   └── cookies/            # Starlink session cookie files (gitignored)
├── .env                    # Local config (gitignored)
├── .env.example            # Config template (committed)
└── vite.config.ts          # Dev proxy: /api → localhost:8000
```

---

## 8. Troubleshooting

**`ModuleNotFoundError: No module named 'server'`**
Run the backend from the project root, not from inside `server/`:
```bash
cd Enjojo-Command-   # must be here
uvicorn server.main:app --reload --port 8000
```

**Login returns 401 with correct password**
The bcrypt hash in `config.py` and `.env` must match your password. Regenerate:
```bash
python -c "import bcrypt; print(bcrypt.hashpw(b'password123', bcrypt.gensalt(12)).decode())"
```

**`starlink-client` installation fails**
Make sure you have Python 3.11+ and a recent pip:
```bash
pip install --upgrade pip
pip install -r server/requirements.txt
```

**Remote mode shows mock data / "No Starlink cookie files found"**
- Check that `server/cookies/<email>.json` exists
- Check that the email in the filename exactly matches the email you entered when linking
- Confirm `STARLINK_MODE=remote` in `.env` and that you restarted the backend

**Cookies expired after ~15 days**
Re-export from starlink.com using Cookie-Editor and re-paste in Settings. The old file will be overwritten.

**Map tiles not loading**
Add your Mapbox token to `.env`:
```env
VITE_MAPBOX_TOKEN="pk.eyJ1Ijoi..."
```
Or leave it blank to use the free OpenStreetMap fallback.
