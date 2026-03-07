import React from "react";
import { Routes, Route } from "react-router-dom";

// Existing - don't touch
import SkillsPage from "./pages/profile/SkillsPage";

// Your module
import RatingForm from "./pages/reputation/RatingForm";
// import Leaderboard from "./pages/reputation/Leaderboard";         // uncomment when ready
// import ReputationDashboard from "./pages/reputation/ReputationDashboard"; // uncomment when ready

export default function AppRoutes() {
  return (
    <Routes>
      {/* Home - displays SkillsPage */}
      <Route path="/" element={<SkillsPage />} />

      {/* Skills page - don't touch */}
      <Route path="/profile/skills" element={<SkillsPage />} />

      {/* Your module routes */}
      <Route path="/rate" element={<RatingForm />} />
      {/* <Route path="/leaderboard" element={<Leaderboard />} /> */}
      {/* <Route path="/reputation" element={<ReputationDashboard />} /> */}
    </Routes>
  );
}