import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  FiHome,
  FiUsers,
  FiFileText,
  FiAlertTriangle,
  FiLogOut,
} from "react-icons/fi";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const navLinks = [
    { to: "/admin", icon: FiHome, label: "Dashboard", end: true },
    { to: "/admin/users", icon: FiUsers, label: "Users" },
    { to: "/admin/sessions", icon: FiFileText, label: "Sessions" },
    { to: "/admin/disputes", icon: FiAlertTriangle, label: "Disputes" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-900 absolute inset-0 z-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none text-slate-900 dark:text-white flex flex-col shadow-xl">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold tracking-wider text-blue-400">
            EDUSPARK ADMIN
          </h2>
          <p className="text-xs text-slate-400 mt-1">System Oversight</p>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-slate-900 dark:text-white shadow-md shadow-blue-500/20"
                    : "text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`
              }
            >
              <link.icon size={20} />
              <span className="font-medium">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0) || "A"}
            </div>
            <div>
              <div className="text-sm font-medium">{user?.name || "Admin"}</div>
              <div className="text-xs text-slate-400">{user?.role || "System"}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-300 rounded-lg hover:bg-red-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <FiLogOut size={18} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header (Mobile specific but visibly nice on desktop too) */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-800">
            Dashboard Overview
          </h1>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        </header>

        {/* Scrollable Page Content */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
