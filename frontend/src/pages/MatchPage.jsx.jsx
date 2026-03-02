import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MatchPage from "./pages/MatchPage";
import Dashboard from "./pages/Dashboard";
import TaskPage from "./pages/TaskPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<TaskPage />} />
        <Route path="/match" element={<MatchPage />} />  {/* ← Add this */}
      </Routes>
    </Router>
  );
}

export default App;