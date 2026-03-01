EduSpark 🌟

EduSpark is a Micro-Commitment Skill Exchange Platform that enables university students to exchange short, skill-based support sessions. It encourages peer learning, responsible collaboration, and accountability using a MERN stack application.

🔹 Project Overview

Many students struggle with:

Lack of structured peer skill exchange

Skill mismatch & unreliable participation

No accountability or trust in informal collaborations

EduSpark solves this by providing:

Short, time-boxed tasks (15–60 minutes)

Skill-based helper matching

Reputation, gamification, and dispute resolution

Real-time availability and priority ranking



  💻 Tech Stack

Frontend: React.js, Redux, Tailwind CSS

Backend: Node.js, Express.js

Database: MongoDB

Authentication: JWT + Email Verification + OTP





🚀 EduSpark Setup Guide

Follow these steps to run EduSpark locally on your machine.

🖥️ Backend Setup
1️⃣ Navigate to Backend Folder
cd backend
2️⃣ Install Dependencies
npm install
3️⃣ Create Environment Variables

Create a file named .env inside the backend folder and add:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000

⚠️ Make sure .env is added to .gitignore (do NOT upload secrets to GitHub).

4️⃣ Start Backend Server
npm run dev

✅ Backend will run at:

http://localhost:5000
💻 Frontend Setup
1️⃣ Navigate to Frontend Folder
cd ../frontend
2️⃣ Install Dependencies
npm install
3️⃣ Start Frontend Server
npm run dev

✅ Frontend will run at:

http://localhost:3000

(If using Vite, it may run on http://localhost:5173
)

📂 Project Structure
ITPMgroupProject/
│
├── backend/
│   ├── controllers/      # Business logic
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── server.js         # Express server entry
│   └── .env              # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Application pages
│   │   ├── context/      # Global state management
│   │   └── App.jsx
│   └── package.json
│
└── README.md

cd backend
npm install



