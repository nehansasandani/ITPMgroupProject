import { useEffect, useState } from "react";
import {
  FiCheckCircle,
  FiSearch,
  FiShield,
  FiUserCheck,
  FiUserMinus,
  FiXCircle,
} from "react-icons/fi";
import { getAdminUsers, toggleUserStatus } from "../../api/adminApi";
import AdminPageNav from "./AdminPageNav";
import "./adminTheme.css";

const isSuspended = (user) =>
  user.cooldownUntil && new Date(user.cooldownUntil) > new Date();

export default function UsersPage() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [busyId,  setBusyId]  = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    getAdminUsers()
      .then((data) => setUsers(data.users))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id) => {
    try {
      setBusyId(id);
      const data = await toggleUserStatus(id);
      // Replace the updated user in local state
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? data.user : u))
      );
    } catch (err) {
      console.error("Toggle failed", err);
    } finally {
      setBusyId("");
    }
  };

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.studentId.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="text-slate-300 p-8 admin-theme">Loading user command board...</div>;
  }

  const activeCount = users.filter((user) => !isSuspended(user)).length;
  const suspendedCount = users.length - activeCount;
  const highTrustCount = users.filter((user) => (user.reputation ?? 0) >= 4).length;
  const watchlistCount = users.filter((user) => (user.reputation ?? 0) < 2.5).length;

  const visibleUsers = filtered.filter((user) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "active") return !isSuspended(user);
    if (statusFilter === "suspended") return isSuspended(user);
    if (statusFilter === "watchlist") return (user.reputation ?? 0) < 2.5;
    return true;
  });

  const summaryCards = [
    {
      label: "Active Profiles",
      value: activeCount,
      detail: "Allowed to participate",
      icon: FiUserCheck,
      tone: "text-emerald-200",
    },
    {
      label: "Suspended Profiles",
      value: suspendedCount,
      detail: "Restricted due to moderation",
      icon: FiUserMinus,
      tone: "text-rose-200",
    },
    {
      label: "High Trust",
      value: highTrustCount,
      detail: "Reputation score >= 4.0",
      icon: FiShield,
      tone: "text-cyan-200",
    },
    {
      label: "Watchlist",
      value: watchlistCount,
      detail: "Needs coaching and review",
      icon: FiXCircle,
      tone: "text-amber-200",
    },
  ];

  return (
    <section className="admin-theme max-w-7xl mx-auto admin-rise">
      <div className="admin-shell p-6 md:p-8 space-y-6">
        <div className="admin-grid-glow" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="admin-chip bg-indigo-400/15 text-indigo-100 border border-indigo-200/35 mb-3 w-fit">
              User Trust Operations
            </p>
            <h2 className="admin-title text-3xl font-semibold text-white">User Management Console</h2>
            <p className="text-slate-300 text-sm mt-2 max-w-2xl">
              Moderate account health by reputation, suspension state, and trust behavior trends across student participants.
            </p>
          </div>

          <label className="admin-panel px-4 py-2.5 flex items-center gap-2 min-w-[280px]">
            <FiSearch className="text-slate-300" />
            <input
              type="text"
              placeholder="Search by name, email or student ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-400 outline-none"
            />
          </label>
        </div>

        <AdminPageNav />

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {summaryCards.map((card) => (
            <article key={card.label} className="admin-kpi p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{card.label}</p>
                  <p className="admin-title text-3xl text-white mt-2">{card.value}</p>
                </div>
                <card.icon className={card.tone} />
              </div>
              <p className="text-xs text-slate-300 mt-2">{card.detail}</p>
            </article>
          ))}
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: `All (${filtered.length})` },
            { id: "active", label: `Active (${filtered.filter((user) => !isSuspended(user)).length})` },
            { id: "suspended", label: `Suspended (${filtered.filter((user) => isSuspended(user)).length})` },
            { id: "watchlist", label: `Watchlist (${filtered.filter((user) => (user.reputation ?? 0) < 2.5).length})` },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                statusFilter === item.id
                  ? "bg-cyan-300/20 text-cyan-100 border-cyan-200/40"
                  : "bg-slate-900/40 text-slate-300 border-slate-600/60 hover:border-slate-400"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="relative z-10 admin-panel overflow-hidden">
          <div className="overflow-x-auto admin-scroll">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/80 text-[11px] uppercase tracking-[0.14em] text-slate-400">
                  <th className="p-4 font-semibold">User Profile</th>
                  <th className="p-4 font-semibold">Student ID</th>
                  <th className="p-4 font-semibold">Trust Score</th>
                  <th className="p-4 font-semibold">Completed Tasks</th>
                  <th className="p-4 font-semibold">State</th>
                  <th className="p-4 font-semibold text-right">Control</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 text-sm">
                      No users match the selected search and filter conditions.
                    </td>
                  </tr>
                ) : (
                  visibleUsers.map((user) => {
                    const reputation = Number(user.reputation ?? 0);
                    const reputationPercent = Math.max(4, Math.min((reputation / 5) * 100, 100));
                    const suspended = isSuspended(user);
                    return (
                      <tr key={user._id} className="border-b border-slate-800/70 hover:bg-slate-900/25 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-400/70 to-blue-500/70 text-slate-900 font-bold flex items-center justify-center text-sm">
                              {(user.fullName || "U").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-100">{user.fullName}</div>
                              <div className="text-xs text-slate-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-300">{user.studentId}</td>
                        <td className="p-4 min-w-[220px]">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-300">{reputation.toFixed(1)} / 5</span>
                            <span className="text-slate-400">Trust</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                reputation >= 4
                                  ? "bg-gradient-to-r from-emerald-400 to-cyan-300"
                                  : reputation >= 2.5
                                  ? "bg-gradient-to-r from-amber-400 to-orange-300"
                                  : "bg-gradient-to-r from-rose-500 to-red-400"
                              }`}
                              style={{ width: `${reputationPercent}%` }}
                            />
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-200">{user.completedTasksCount ?? 0}</td>
                        <td className="p-4">
                          <span className={`admin-chip border ${
                            !suspended
                              ? "bg-emerald-500/15 text-emerald-100 border-emerald-300/35"
                              : "bg-rose-500/15 text-rose-100 border-rose-300/35"
                          }`}>
                            {!suspended ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
                            <span className="ml-1">{!suspended ? "Active" : "Suspended"}</span>
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggle(user._id)}
                            disabled={busyId === user._id}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 ${
                              !suspended
                                ? "bg-rose-500/10 text-rose-100 border-rose-300/35 hover:bg-rose-500/20"
                                : "bg-emerald-500/10 text-emerald-100 border-emerald-300/35 hover:bg-emerald-500/20"
                            }`}
                          >
                            {busyId === user._id ? "Updating..." : !suspended ? "Suspend Access" : "Restore Access"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}