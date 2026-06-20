# CareTrack Clinic — Fullstack

Short repo scaffolding to run the backend API and React frontend locally.

Prerequisites
- Node.js (18+ recommended)
- npm or yarn

Backend
- See `backend` for API server.
- Copy `backend/.env.example` to `backend/.env` and fill values.
- Install and run:

```bash
cd backend
npm install
npm run dev
```

Frontend
- See `frontend` for the React app (Vite).
- Copy `frontend/.env.example` to `frontend/.env` if needed.

```bash
cd frontend
npm install
npm run dev
```

Database seeding

```bash
cd backend
npm run seed
```

Preparing for GitHub
- Create a new GitHub repo and replace the `repository.url` fields in both `package.json` files.
- Then push:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/REPO.git
git branch -M main
git push -u origin main
```
