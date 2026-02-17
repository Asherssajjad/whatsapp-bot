# Deploy to Git + Railway (free tier / trial)

## 1. Push to Git (GitHub)

### Create a new repo on GitHub

1. Go to [github.com/new](https://github.com/new).
2. Name it (e.g. `whatsapp-saas-bot`), leave it empty (no README), create.
3. Copy the repo URL (e.g. `https://github.com/YOUR_USER/whatsapp-saas-bot.git`).

### Push from your machine

In the project folder (where this README is), run:

```bash
# Initialize and first commit (if not already done)
git init
git add .
git commit -m "Initial commit: WhatsApp SaaS backend + frontend"

# Add your GitHub repo as remote (replace with your URL)
git remote add origin https://github.com/YOUR_USER/whatsapp-saas-bot.git

# Push (use main or master depending on your default)
git branch -M main
git push -u origin main
```

If the repo already exists and you already have a remote, just:

```bash
git add .
git commit -m "Add Railway config and deploy docs"
git push
```

---

## 2. Deploy Backend on Railway

Railway gives a **trial with $5 credit** (no free tier anymore). You may need to add a payment method; the app can stay within the trial for light use.

### Create project and add PostgreSQL

1. Go to [railway.app](https://railway.app) and sign in (e.g. with GitHub).
2. **New Project** → **Deploy from GitHub repo** → select your repo.
3. When asked “What do you want to deploy?”, choose **Add a service** first: click **+ New** → **Database** → **PostgreSQL**. Wait until it’s provisioned.
4. Add the backend service: **+ New** → **GitHub Repo** → same repo. This will be your **backend** service.

### Configure the backend service

1. Click the **backend** service (the one from the repo, not the database).
2. **Settings**:
   - **Root Directory**: set to `backend`. The repo has a **Dockerfile** in `backend/` so Railway uses Docker (avoids Railpack build errors). No need to set Start Command.
3. **Variables** (Settings → Variables, or the “Variables” tab):
   - Railway will add `DATABASE_URL` when you connect the DB. **Connect the PostgreSQL service** to this backend service: in the backend service, **Variables** → **Add variable** → **Add reference** → choose `DATABASE_URL` from the PostgreSQL service. So you don’t need to copy the URL; Railway injects it.
   - Add these yourself:

   | Variable            | Value |
   |---------------------|--------|
   | `SECRET_KEY`        | Long random string (e.g. from `openssl rand -hex 32`) |
   | `WHATSAPP_VERIFY_TOKEN` | Any string you’ll use in Meta webhook verification |
   | `APP_URL`           | Your backend URL (see below) |
   | `CORS_ORIGINS`      | Your frontend URL, or `*` to allow all (for testing) |
   | `ADMIN_EMAIL`       | Admin login email, e.g. `ashersajjad98@gmail.com` |
   | `ADMIN_PASSWORD`    | Admin login password (strong password) |
   | `OPENAI_API_KEY`    | (Optional) Your OpenAI key for AI fallback |

4. **Connect PostgreSQL to backend**: In the backend service, **Variables** → **New Variable** → **Add Reference** → select the PostgreSQL service and `DATABASE_URL`. This fills `DATABASE_URL` automatically.
5. **Migrations**: In the backend service, open **Settings** → one-off **Run Command** (or use **Shell** in Railway dashboard) with Root Directory `backend` and run:
   ```bash
   pip install -r requirements.txt && alembic upgrade head
   ```
   Or add a **Deploy** or **Build** step that runs migrations (e.g. in a custom start script that runs `alembic upgrade head` then `uvicorn ...`).

### Migrations and admin user

The Docker image runs `run.sh`, which runs **migrations** (`alembic upgrade head`) then starts the app. No extra step needed.

If you set **ADMIN_EMAIL** and **ADMIN_PASSWORD**, the app creates an **admin user** on first startup (or ensures one exists). Use that email and password to log in and open the Admin dashboard.

3. Generate domain: **Settings** → **Networking** → **Generate Domain**. Copy the URL (e.g. `https://your-backend.up.railway.app`) and set:
   - `APP_URL` = that URL
   - Later, set `CORS_ORIGINS` to your frontend URL.

### Create admin user

After first deploy, create an admin:

- **Option A**: Use Railway **Shell** for the backend service (Root Directory: `backend`), then:
  ```bash
  python scripts/create_admin.py your@email.com
  ```
  (You must have registered that email via the app first.)

- **Option B**: Connect to PostgreSQL with a client and run:
  ```sql
  UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
  ```

---

## 3. Deploy Frontend on Railway (or Vercel)

### Option A: Frontend on Railway (same repo, second service)

1. In the same Railway project, **+ New** → **GitHub Repo** → same repo. This is the **frontend** service.
2. **Settings**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s dist -l $PORT`
3. **Variables**:
   - `VITE_API_URL` = your backend URL (e.g. `https://your-backend.up.railway.app`)
   - (Vite bakes this in at build time.)
4. **Networking** → **Generate Domain**. Use this URL in backend’s `CORS_ORIGINS`.

### Option B: Frontend on Vercel (free)

1. Go to [vercel.com](https://vercel.com), sign in, **Add New** → **Project** → import the same GitHub repo.
2. **Root Directory**: set to `frontend`.
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variable**: `VITE_API_URL` = your Railway backend URL (e.g. `https://your-backend.up.railway.app`).
6. Deploy. Then set backend `CORS_ORIGINS` to your Vercel URL (e.g. `https://your-app.vercel.app`).

---

## 4. WhatsApp webhook

1. In Meta Developer Console, set webhook URL to:  
   `https://your-backend.up.railway.app/webhook`
2. Set “Verify token” to the same value as `WHATSAPP_VERIFY_TOKEN` in Railway.
3. In your app’s Admin dashboard, assign the WhatsApp number and token to a user.

---

## Quick checklist

- [ ] Repo pushed to GitHub
- [ ] Railway project created, PostgreSQL added
- [ ] Backend service: root `backend`, `DATABASE_URL` from PostgreSQL, `SECRET_KEY`, `WHATSAPP_VERIFY_TOKEN`, `APP_URL`, `CORS_ORIGINS`
- [ ] Migrations run (`alembic upgrade head` or via `run.sh`)
- [ ] Backend domain generated and variables updated
- [ ] Frontend deployed (Railway or Vercel), `VITE_API_URL` set
- [ ] Admin user created
- [ ] WhatsApp webhook URL and verify token set in Meta
