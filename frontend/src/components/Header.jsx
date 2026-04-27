import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { ui } from "../styles/ui";
import NotificationCenter from "./NotificationCenter";
import { FiSun, FiMoon, FiMenu, FiX } from "react-icons/fi";

const navClass = ({ isActive }) =>
  `px-3 py-2 rounded-xl text-sm font-medium transition ${
    isActive
      ? "bg-indigo-50 text-indigo-600 dark:bg-white/10 dark:text-white"
      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-white/75 dark:hover:text-white dark:hover:bg-white/10"
  }`;

export default function Header() {
  const { isAuthed, user, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = isAuthed ? [
    { to: "/", label: "Home" },
    { to: "/tasks/browse", label: "Browse Tasks" },
    { to: "/tasks/create", label: "Create Task" },
    { to: "/tasks/mine", label: "My Tasks" },
    { to: "/tasks/accepted-by-me", label: "Accepted By Me" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/sessions", label: "Sessions" },
    { to: "/skills", label: "Skills" },
    { to: "/match", label: "Matches" },
  ] : [
    { to: "/", label: "Home" },
  ];

  if (role === "ADMIN") {
    navLinks.push({ to: "/admin", label: "Admin" });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-950/70 backdrop-blur transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <div className="h-9 w-9 rounded-2xl bg-indigo-50 dark:bg-white/10 border border-indigo-100 dark:border-white/15 flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-indigo-500 dark:bg-white/70" />
              </div>
              <div>
                <div className="text-slate-900 dark:text-white font-semibold leading-tight">EduSpark</div>
                <div className="text-slate-500 dark:text-white/55 text-xs -mt-0.5">Students helping students</div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-1 flex-wrap">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} className={navClass}>
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2 lg:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-white/70 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>

            {!isAuthed ? (
              <div className="hidden sm:flex items-center gap-2">
                <NavLink to="/login" className={navClass}>
                  Login
                </NavLink>
                <Link to="/register" className={`${ui.btn} ${ui.btnPrimary}`}>
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NotificationCenter />
                <Link to="/profile" className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition cursor-pointer">
                  <span className="text-slate-700 dark:text-white/85 text-sm font-medium">{user?.fullName}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-white/10 border border-indigo-100 dark:border-white/10 text-indigo-700 dark:text-white/70">
                    Campus Member
                  </span>
                </Link>
                <button onClick={onLogout} className={`hidden sm:flex ${ui.btn} ${ui.btnSoft}`}>
                  Logout
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="xl:hidden p-2 rounded-xl text-slate-600 dark:text-white/80 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="xl:hidden pt-4 pb-2 border-t border-slate-200 dark:border-white/10 mt-3 flex flex-col gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={navClass}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            
            {!isAuthed ? (
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-white/5 sm:hidden">
                <NavLink to="/login" className={navClass} onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </NavLink>
                <Link to="/register" className={`${ui.btn} ${ui.btnPrimary} w-full justify-center`} onClick={() => setIsMobileMenuOpen(false)}>
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-white/5 lg:hidden">
                <Link to="/profile" className={navClass} onClick={() => setIsMobileMenuOpen(false)}>
                  Profile ({user?.fullName})
                </Link>
                <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className={`sm:hidden ${ui.btn} ${ui.btnSoft} w-full justify-center`}>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}