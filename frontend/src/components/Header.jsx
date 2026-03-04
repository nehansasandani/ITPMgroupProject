import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm transition ${
    isActive ? "bg-white/10 text-white" : "text-white/80 hover:text-white hover:bg-white/10"
  }`;

export default function Header() {
  const { isAuthed, user, role, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-slate-950/70 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-white font-semibold text-lg tracking-tight">
          EduSpark
          <span className="ml-2 text-xs px-2 py-1 rounded-full bg-white/10 text-white/70">
            Micro-Tasks
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink to="/" className={navClass}>
            Home
          </NavLink>

          {isAuthed && (
            <>
              <NavLink to="/tasks/create" className={navClass}>
                Create Task
              </NavLink>
              <NavLink to="/tasks/mine" className={navClass}>
                My Tasks
              </NavLink>
            </>
          )}

          {/* Role-based links */}
          {role === "ADMIN" && (
            <NavLink to="/admin" className={navClass}>
              Admin
            </NavLink>
          )}

          {!isAuthed ? (
            <>
              <NavLink to="/login" className={navClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={navClass}>
                Register
              </NavLink>
            </>
          ) : (
            <div className="flex items-center gap-3 ml-3">
              <div className="hidden sm:block text-white/80 text-sm">
                {user?.fullName}{" "}
                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-white/10">
                  {role}
                </span>
              </div>
              <button
                onClick={onLogout}
                className="px-3 py-2 rounded-lg text-sm bg-white text-slate-900 hover:bg-white/90"
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}