import React from "react";
import { Routes, Route } from "react-router-dom";

import SkillsPage from "./pages/profile/SkillsPage";
import RatingForm from "./pages/reputation/RatingForm";
import UserProfile from "./pages/reputation/UserProfile";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<h2 style={{ color: "white", padding: "40px" }}>Home Page</h2>} />

      {/* Skills - don't touch */}
      <Route path="/profile/skills" element={<SkillsPage />} />

      {/* Your module */}
      <Route path="/rate" element={<RatingForm />} />
      <Route path="/profile" element={<UserProfile />} />
    </Routes>
  );
}