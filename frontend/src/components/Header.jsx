import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ui } from "../styles/ui";

const navClass = ({ isActive }) =>
  `px-3 py-2 rounded-xl text-sm transition ${
    isActive ? "bg-white/10 text-white" : "text-white/75 hover:text-white hover:bg-white/10"
  }`;

export default function Header() {
  const { isAuthed, user, role, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full bg-white/70" />
          </div>
          <div>
            <div className="text-white font-semibold leading-tight">EduSpark</div>
            <div className="text-white/55 text-xs -mt-0.5">Micro-commitment help</div>
          </div>
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

          {role === "ADMIN" && (
            <NavLink to="/admin" className={navClass}>
              Admin
            </NavLink>
          )}

          {!isAuthed ? (
            <div className="flex items-center gap-2 ml-2">
              <NavLink to="/login" className={navClass}>
                Login
              </NavLink>
              <Link to="/register" className={`${ui.btn} ${ui.btnPrimary}`}>
                Register
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 ml-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5">
                <span className="text-white/85 text-sm">{user?.fullName}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/70">
                  {role}
                </span>
              </div>
              <button onClick={onLogout} className={`${ui.btn} ${ui.btnSoft}`}>
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}