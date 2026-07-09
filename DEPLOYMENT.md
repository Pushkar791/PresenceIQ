# Deployment Notes

## Architecture

| Service | Host | Root folder |
|---------|------|-------------|
| Frontend | Vercel | `frontend` |
| Backend API | Vercel | `backend` |
| Face recognition API | Render | `python-api` |
| Database | MongoDB Atlas | — |

## 1. MongoDB Atlas

1. Create a free cluster.
2. Add `0.0.0.0/0` in **Network Access**.
3. Create a database user.
4. Copy the connection string and add `/smartattend` before the query string:

```
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/smartattend?retryWrites=true&w=majority
```

## 2. Deploy Python API on Render

1. Push this repo to GitHub.
2. Go to [render.com](https://render.com) → **New +** → **Blueprint**.
3. Connect the `PresenceIQ` repo. Render reads `render.yaml`.
4. Deploy the `presenceiq-python-api` service.
5. Copy the Render URL, for example:

```
https://presenceiq-python-api.onrender.com
```

6. Test:

```
https://YOUR-PYTHON-URL.onrender.com/health
```

Expected response:

```json
{"status":"ok"}
```

## 3. Deploy Backend on Vercel

1. **Add New Project** → import repo.
2. **Root Directory:** `backend`
3. Environment variables:

| Name | Example |
|------|---------|
| `MONGO_URI` | Atlas connection string |
| `JWT_SECRET` | long random secret |
| `ALLOWED_EMAIL_DOMAIN` | `chitkara.edu.in` |
| `CORS_ORIGIN` | `https://your-frontend.vercel.app` |
| `PYTHON_API_URL` | `https://presenceiq-python-api.onrender.com` |
| `GOOGLE_CLIENT_IDS` | optional, for Google sign-in |

4. Deploy and copy the backend URL.

Test:

```
https://YOUR-BACKEND-URL.vercel.app/api/health
```

## 4. Deploy Frontend on Vercel

1. **Add New Project** from the same repo.
2. **Root Directory:** `frontend`
3. Environment variables:

| Name | Example |
|------|---------|
| `VITE_API_URL` | `https://YOUR-BACKEND-URL.vercel.app` |
| `VITE_ALLOWED_EMAIL_DOMAIN` | `chitkara.edu.in` |
| `VITE_GOOGLE_CLIENT_ID` | optional |

4. Deploy and copy the frontend URL.

## 5. Connect Frontend and Backend

1. Backend project → set `CORS_ORIGIN` to the frontend URL.
2. Redeploy backend.
3. Redeploy frontend if you changed `VITE_API_URL`.

## 6. Google Auth (after URLs are live)

1. Google Cloud Console → OAuth web client.
2. Authorized JavaScript origins:
   - `https://your-frontend.vercel.app`
   - `http://localhost:5173`
3. Set:
   - frontend `VITE_GOOGLE_CLIENT_ID`
   - backend `GOOGLE_CLIENT_IDS`
4. Redeploy both projects.

## Feature Checklist

| Feature | Needs |
|---------|-------|
| Login / Signup | `MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN` |
| Dashboard | working auth + MongoDB |
| Student enrollment | `PYTHON_API_URL` + Render Python API |
| Live attendance | `PYTHON_API_URL` + enrolled students |

## Local Development

1. Copy `.env.example` files to `.env` in `frontend` and `backend`.
2. Start MongoDB: `docker compose up -d`
3. Start Python API:

```powershell
cd python-api
pip install -r requirements.txt
python app.py
```

4. Run `start_all.ps1`

## Troubleshooting

| Error | Fix |
|-------|-----|
| `bad auth : Authentication failed` | Wrong MongoDB password in `MONGO_URI` |
| `buffering timed out` | MongoDB not connected |
| `Face recognition service is not configured` | Set `PYTHON_API_URL` on backend |
| `Face recognition service is unavailable` | Deploy Python API on Render and use that URL |
| Signup works, enrollment fails | Backend missing `PYTHON_API_URL` or Python API is down |
