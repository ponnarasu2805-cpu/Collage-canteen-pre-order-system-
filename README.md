# Smart 3D College Canteen Pre-Order System

Tech stack:
- React + Vite
- Three.js via @react-three/fiber and @react-three/drei
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication

## Run locally

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Set `MONGO_URI` and `JWT_SECRET` in `.env`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:5000/api`.

This is a placement-project MVP. Payment is intentionally simulated; do not collect real card/UPI credentials in this demo.
