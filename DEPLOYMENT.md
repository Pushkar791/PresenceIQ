# Deployment Notes

## Recommended Setup

- Deploy `frontend` to Vercel.
- Deploy `backend` to Vercel as a separate project.
- Deploy `python-api` to Render or Railway so OpenCV runs on a persistent service.
- Use MongoDB Atlas for `MONGO_URI`.

## Required Environment Variables

### Frontend

- `VITE_API_URL`
- `VITE_ALLOWED_EMAIL_DOMAIN`
- `VITE_GOOGLE_CLIENT_ID`

### Backend

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `PYTHON_API_URL`
- `ALLOWED_EMAIL_DOMAIN`
- `CORS_ORIGIN`
- `GOOGLE_CLIENT_IDS`

## Google Auth Setup

1. Create a Google Cloud OAuth client for a web application.
2. Add local and deployed frontend origins in the Google Cloud console.
3. Set the same Google web client ID in:
   - `frontend/.env` as `VITE_GOOGLE_CLIENT_ID`
   - `backend/.env` as `GOOGLE_CLIENT_IDS`

## Vercel Project Layout

- `frontend/vercel.json` handles SPA rewrites.
- `backend/vercel.json` exposes the Express app through `server.js`.
- `python-api/vercel.json` exists, but this service is better hosted outside serverless for more predictable image-processing performance.

## Local Development

1. Copy `.env.example` files to `.env` in `frontend` and `backend`.
2. Start MongoDB with `docker compose up -d`.
3. Start the Python API from `python-api`.
4. Run `start_all.ps1` to launch the frontend and backend.
