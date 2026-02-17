# How to Get All Variables for Railway (whatsapp-bot)

Your app crashed because **DATABASE_URL** was not set — the app tried to connect to `localhost` instead of Railway's PostgreSQL. Follow these steps **in order**.

---

## Step 1: Add PostgreSQL (if you haven’t)

1. In your Railway project, click **+ New**.
2. Choose **Database** → **PostgreSQL**.
3. Wait until it shows **Active** (green).
4. You now have a **PostgreSQL** service in the same project as **whatsapp-bot**.

---

## Step 2: Connect PostgreSQL to whatsapp-bot (this fixes the crash)

1. Click your **whatsapp-bot** service (the one that crashed).
2. Open the **Variables** tab.
3. Click **+ New Variable** or **Add Variable**.
4. Choose **Add Reference** (or **Connect to Database**).
5. Select the **PostgreSQL** service.
6. Pick the variable **DATABASE_URL**.
7. Save. You should see something like `${{Postgres.DATABASE_URL}}` — Railway will replace this with the real URL when the app runs.

This is what makes your app use Railway’s database instead of localhost. **Redeploy** the whatsapp-bot service after adding it.

---

## Step 3: Add the rest of the variables (plain values)

In the **whatsapp-bot** service → **Variables** tab, add these **one by one** (click **+ New Variable** each time):

| Variable | Where to get it | Example value |
|----------|------------------|---------------|
| **SECRET_KEY** | You make it up. Use a long random string. | `a1b2c3d4e5f6...` (e.g. 32+ random characters). You can use: https://randomkeygen.com/ (CodeIgniter Encryption Keys) or run in terminal: `openssl rand -hex 32` |
| **ADMIN_EMAIL** | Your admin login email | `ashersajjad98@gmail.com` |
| **ADMIN_PASSWORD** | You choose the password | Any strong password you want (e.g. `MySecurePass123!`) |
| **WHATSAPP_VERIFY_TOKEN** | You make it up (for Meta webhook later) | `my-verify-token` or any string |
| **APP_URL** | Your backend’s public URL (see Step 4) | `https://whatsapp-bot-production-xxxx.up.railway.app` |
| **CORS_ORIGINS** | For testing, use `*`; later your frontend URL | `*` |

Type the **name** exactly (e.g. `SECRET_KEY`) and the **value** in the box, then save.

---

## Step 4: Get APP_URL (after first successful deploy)

1. Click the **whatsapp-bot** service.
2. Go to **Settings** (or the **Networking** / **Public Networking** section).
3. Under **Networking** or **Public URL**, click **Generate Domain** (or **Add Domain**).
4. Railway will give you a URL like:  
   `https://whatsapp-bot-production-xxxx.up.railway.app`
5. Copy that URL and in **Variables** set:  
   **APP_URL** = `https://whatsapp-bot-production-xxxx.up.railway.app`  
   (use your real URL).

If the app was crashing before, add **DATABASE_URL** (Step 2) and the other variables (Step 3), then **Redeploy**. After it stays up, generate the domain and set **APP_URL** (Step 4).

---

## Checklist

- [ ] PostgreSQL service added and running.
- [ ] In **whatsapp-bot** → Variables: **DATABASE_URL** added as a **reference** to Postgres.
- [ ] **SECRET_KEY** = long random string.
- [ ] **ADMIN_EMAIL** = `ashersajjad98@gmail.com`
- [ ] **ADMIN_PASSWORD** = your chosen password.
- [ ] **WHATSAPP_VERIFY_TOKEN** = any string.
- [ ] **CORS_ORIGINS** = `*`
- [ ] After deploy works: **Generate Domain** for whatsapp-bot, then set **APP_URL** = that URL.
- [ ] **Redeploy** whatsapp-bot after changing variables.

After this, the crash from “connection to localhost:5432 refused” should be fixed and you can open the backend URL in the browser and log in with **ashersajjad98@gmail.com** and your **ADMIN_PASSWORD**.
