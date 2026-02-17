# WhatsApp Auto-Reply SaaS – Frontend

React dashboard (Vite + Tailwind) for users and admins.

## User dashboard

- Login / Signup
- Dashboard: overview of conversations, leads, WhatsApp numbers, notifications
- Conversations: table with search and stage filter; detail view with message history
- Leads: table with status, notes, export CSV
- Settings: customize conversation flow messages and enable/disable AI fallback per stage
- Notifications: new lead alerts, mark as read
- Dark/light mode toggle
- Mobile-friendly layout

## Admin dashboard

- Overview: user count, messages sent, leads captured
- Users: create, edit, deactivate
- Usage: messages and leads per user
- Assign WhatsApp: link phone number ID + access token to a user
- Webhook logs: recent events for debugging

## Setup

```bash
cd frontend
npm install
```

Create `.env` (optional):

```env
VITE_API_URL=http://localhost:8000
```

For local dev, the Vite proxy in `vite.config.js` forwards `/api` and `/webhook` to the backend, so you can leave `VITE_API_URL` unset when backend runs on port 8000.

```bash
npm run dev
```

Open http://localhost:3000

## Build & deploy (Vercel / Netlify / Railway)

```bash
npm run build
```

Set `VITE_API_URL` to your backend URL (e.g. `https://your-backend.railway.app`) so the built app calls the correct API.

- **Vercel**: Connect repo, root = `frontend`, build command = `npm run build`, output = `dist`. Add env `VITE_API_URL`.
- **Netlify**: Same; publish directory = `dist`.
- **Railway**: Add a second service; root = `frontend`, build = `npm run build`, static serve from `dist` or use a small static server.

## CORS

Ensure the backend `CORS_ORIGINS` includes your frontend URL (e.g. `https://your-app.vercel.app`).
