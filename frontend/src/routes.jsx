import React from "react";
import { Routes, Route } from "react-router-dom";

// Import your pages
import SkillsPage from "./pages/profile/SkillsPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<h2>Home Page</h2>} />

      {/* Skills page */}
      <Route path="/profile/skills" element={<SkillsPage />} />
    </Routes>
  );
}
