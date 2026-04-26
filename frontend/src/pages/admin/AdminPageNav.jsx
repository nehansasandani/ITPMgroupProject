import { NavLink } from "react-router-dom";
import { FiAlertTriangle, FiGrid, FiUsers } from "react-icons/fi";

const links = [
  { to: "/admin", label: "Overview", icon: FiGrid, end: true },
  { to: "/admin/users", label: "Users", icon: FiUsers },
  { to: "/admin/disputes", label: "Disputes", icon: FiAlertTriangle },
];

export default function AdminPageNav() {
  return (
    <nav className="relative z-10 admin-nav-wrap" aria-label="Admin pages">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) => `admin-nav-item ${isActive ? "is-active" : ""}`}
        >
          <link.icon size={14} />
          <span>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
