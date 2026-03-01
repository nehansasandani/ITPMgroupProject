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


🛠️ Key Functionalities
1️⃣ Task Creation & Scope Control – Core Function
2️⃣ Skill Match and Availability Engine
3️⃣ Dispute Resolution, Admin Control & System Oversight
4️⃣ Trust, Reputation & Gamification



💻 Tech Stack

Frontend: React.js, Redux, Tailwind CSS

Backend: Node.js, Express.js

Database: MongoDB


🚀 Getting Started

2️⃣ Setup Backend
cd backend
npm install

Create a .env file in the backend folder with:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000

Start the backend server:

npm run dev

Server will run at http://localhost:5000

3️⃣ Setup Frontend
cd ../frontend
npm install
npm run dev

Frontend will run at http://localhost:3000 (or the port Vite assigns)

📂 Project Structure
ITPMgroupProject/
│
├─ backend/
│   ├─ controllers/
│   ├─ models/
│   ├─ routes/
│   ├─ server.js
│   └─ .env
│
├─ frontend/
│   ├─ src/
│   │   ├─ components/
│   │   ├─ pages/
│   │   ├─ context/
│   │   └─ App.jsx
│   └─ package.json
│
└─ README.md                                                                                                                                

Deployment (optional): Heroku / Vercel / Netlify
