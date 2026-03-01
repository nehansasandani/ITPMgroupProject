    Eduspark 🚀 – Micro-Commitment Skill Exchange Platform
    Eduspark is a MERN stack platform that allows university students to exchange short, skill-based support sessions

## 🔹 Features

### Core Features
- User registration and profile management for verified university students
- Create and request short, skill-based tasks (15–60 mins)
- Skill-based helper matching
- Real-time availability checking
- Priority ranking engine for helpers
- Match request with timeout and automatic reassignment
- Task urgency and guided task forms to prevent vague requests

### Admin & Oversight
- Dispute resolution system
- Anti-abuse & repeat offender tracking
- Admin dashboard for monitoring and notifications

### Trust & Gamification
- Multi-factor task rating (Clarity • Effort • Time • Communication)
- Dynamic reputation engine with fading old mistakes
- No-show detection and cooldown restrictions
- Leaderboard and trust badges
- Encourages responsible behavior, peer learning, and positive student culture

---

## 🏗️ Project Structure


ITPMgroupProject/
├─ backend/
│ ├─ controllers/  #Route logic
│ ├─ models/ #Mongoose schemas
│ ├─ routes/ # Express routes
│ ├─ server.js # Backend server entry
│ └─ .env # Environment variables
├─ frontend/
│ ├─ public/
│ ├─ src/
│ │ ├─ components/
│ │ ├─ pages/
│ │ └─ App.jsx
│ ├─ package.json
│ └─ vite.config.js
├─ README.md
└─ package.json



---

## ⚡ Getting Started

### Backend Setup

1. Navigate to the backend folder:

```bash
cd backend

Install dependencies:

npm install

Start the backend server:

npm run dev


Frontend Setup

Navigate to the frontend folder:

cd ../frontend

Install dependencies:

npm install

Start the frontend server:

npm run dev

Open in browser:

http://localhost:5173/

