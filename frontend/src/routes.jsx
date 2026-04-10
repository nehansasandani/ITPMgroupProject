import React from "react";
import { Routes, Route } from "react-router-dom";
import App from "./App";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import BrowseTasksPage from "./pages/tasks/BrowseTasksPage";
import CreateTaskPage from "./pages/tasks/CreateTaskPage";
import EditTaskPage from "./pages/tasks/EditTaskPage";
import MyTasksPage from "./pages/tasks/MyTasksPage";
import AcceptedByMePage from "./pages/tasks/AcceptedByMePage";

import SessionsListPage from "./pages/SessionsListPage";
import SessionPage from "./pages/SessionPage";

import SkillsPage from "./pages/profile/SkillsPage";
import MatchPage from "./pages/MatchPage";
import LeaderboardPage from "./pages/reputation/LeaderboardPage";
import UserProfile from "./pages/reputation/UserProfile";
import RatingForm from "./pages/reputation/RatingForm";

import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/DashboardPage";
import AdminUsersPage from "./pages/admin/UsersPage";
import AdminDisputesPage from "./pages/admin/DisputesPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<App />}>
        <Route path="/" element={<HomePage />} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Tasks */}
        <Route path="/tasks/browse" element={<BrowseTasksPage />} />
        <Route path="/tasks/create" element={<CreateTaskPage />} />
        <Route path="/tasks/edit/:id" element={<EditTaskPage />} />
        <Route path="/tasks/mine" element={<MyTasksPage />} />
        <Route path="/tasks/accepted-by-me" element={<AcceptedByMePage />} />

        {/* Sessions */}
        <Route path="/sessions" element={<SessionsListPage />} />
        <Route path="/session/:taskId" element={<SessionPage />} />

        {/* Profile */}
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/profile/skills" element={<SkillsPage />} />
        <Route path="/profile" element={<UserProfile />} />

        {/* Matching */}
        <Route path="/match" element={<MatchPage />} />

        {/* Reputation */}
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/rating/:userId" element={<RatingForm />} />
        <Route path="/rate" element={<RatingForm />} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/disputes" element={<AdminDisputesPage />} />

        {/* Fallback */}
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
}

