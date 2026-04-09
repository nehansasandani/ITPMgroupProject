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

<<<<<<< HEAD
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "admin/login", element: <AdminLoginPage /> },

      // ── Tasks ──
      {
        path: "tasks/create",
        element: <ProtectedRoute><CreateTaskPage /></ProtectedRoute>,
      },
      {
        path: "tasks/mine",
        element: <ProtectedRoute><MyTasksPage /></ProtectedRoute>,
      },
      {
        path: "tasks/browse",
        element: <ProtectedRoute><BrowseTasksPage /></ProtectedRoute>,
      },
      {
        path: "tasks/edit/:id",
        element: <ProtectedRoute><EditTaskPage /></ProtectedRoute>,
      },
      {
        path: "tasks/accepted-by-me",
        element: <ProtectedRoute><AcceptedByMePage /></ProtectedRoute>,
      },

      // ── Sessions & Match ──
      {
        path: "sessions",
        element: <ProtectedRoute><SessionsListPage /></ProtectedRoute>,
      },
      {
        path: "session/:taskId",
        element: <ProtectedRoute><SessionPage /></ProtectedRoute>,
      },
      {
        path: "match",
        element: <ProtectedRoute><MatchPage /></ProtectedRoute>,
      },

      // ── Reputation & Profile ──
      {
        path: "profile/skills",
        element: <ProtectedRoute><SkillsPage /></ProtectedRoute>,
      },
      {
        path: "rate",
        element: <ProtectedRoute><RatingForm /></ProtectedRoute>,
      },
      {
        path: "rating/:userId",
        element: <ProtectedRoute><RatingForm /></ProtectedRoute>,
      },
      {
        path: "profile",
        element: <ProtectedRoute><UserProfile /></ProtectedRoute>,
      },
      {
        path: "leaderboard",
        element: <ProtectedRoute><LeaderboardPage /></ProtectedRoute>,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute roles={["ADMIN"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "sessions", element: <SessionsPage /> },
      { path: "disputes", element: <DisputesPage /> },
    ],
  },
]);
=======
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
>>>>>>> 7337c4f033270a6c2af7b899782d8bc3382b4b98
