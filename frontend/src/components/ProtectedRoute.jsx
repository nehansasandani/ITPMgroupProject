import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { isAuthed, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-white/80">
        Loading...
      </div>
    );
  }

  if (!isAuthed) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(role)) return <Navigate to="/" replace />;

  return children;
}