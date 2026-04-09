import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import CreateTaskPage from "./pages/tasks/CreateTaskPage";
import MyTasksPage from "./pages/tasks/MyTasksPage";
import BrowseTasksPage from "./pages/tasks/BrowseTasksPage";
import EditTaskPage from "./pages/tasks/EditTaskPage";
import AcceptedByMePage from "./pages/tasks/AcceptedByMePage";

// ── Reputation & Skills ──
import SkillsPage from "./pages/profile/SkillsPage";
import RatingForm from "./pages/reputation/RatingForm";
import UserProfile from "./pages/reputation/UserProfile";
import LeaderboardPage from "./pages/reputation/LeaderboardPage";

// ── New Modules & Placeholders ──
import SessionsListPage from "./pages/tasks/SessionsListPage";
import SessionPage from "./pages/tasks/SessionPage";
import MatchPage from "./pages/MatchPage";

// ── Admin ──
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminLayout from "./components/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import UsersPage from "./pages/admin/UsersPage";
import SessionsPage from "./pages/admin/SessionsPage";
import DisputesPage from "./pages/admin/DisputesPage";

const Placeholder = ({ title }) => (
  <div className="max-w-6xl mx-auto px-4 py-10 text-white">
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-white/70 mt-2 text-sm">Page coming next…</p>
    </div>
  </div>
);

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
