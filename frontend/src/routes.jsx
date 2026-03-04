import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";

// placeholders for now (we will build later)
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

      {
        path: "tasks/create",
        element: (
          <ProtectedRoute>
            <Placeholder title="Create Task" />
          </ProtectedRoute>
        ),
      },
      {
        path: "tasks/mine",
        element: (
          <ProtectedRoute>
            <Placeholder title="My Tasks" />
          </ProtectedRoute>
        ),
      },

      {
        path: "admin",
        element: (
          <ProtectedRoute roles={["ADMIN"]}>
            <Placeholder title="Admin Dashboard" />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);