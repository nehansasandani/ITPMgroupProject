import { useEffect, useState } from "react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import { getAdminStats, getAnalytics } from "../../api/adminApi";
import AdminPageNav from "./AdminPageNav";
import "./adminTheme.css";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function DashboardPage() {
  const [stats,     setStats]     = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getAdminStats(), getAnalytics()])
      .then(([statsData, analyticsData]) => {
        setStats(statsData);
        setAnalytics(analyticsData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-slate-300 p-8 admin-theme">Loading command center...</div>;
  }

  const totalUsers = stats?.totalUsers ?? 0;
  const activeSessions = stats?.activeSessions ?? 0;
  const completedSessions = stats?.completedSessions ?? 0;
  const pendingDisputes = stats?.pendingDisputes ?? 0;

  const sessionStats = analytics?.sessionStats ?? [];
  const activeCount = sessionStats.find((s) => s._id === "ACTIVE")?.count ?? 0;
  const completedCount = sessionStats.find((s) => s._id === "COMPLETED")?.count ?? 0;
  const totalSessionLoad = sessionStats.reduce((sum, item) => sum + (item.count ?? 0), 0);
  const otherSessionCount = Math.max(totalSessionLoad - activeCount - completedCount, 0);
  const safeTotalSessions = Math.max(totalSessionLoad, 1);

  const topSkills = analytics?.skillDemand ?? [];
  const maxSkillCount = topSkills[0]?.count || 1;
  const disputeTypes = analytics?.disputeTypes ?? [];

  const completionRate = Math.round((completedCount / safeTotalSessions) * 100);
  const disputePressure = Math.round((pendingDisputes / Math.max(totalSessionLoad, 1)) * 100);
  const trustIndex = clamp(95 - Math.round(disputePressure * 0.85) - Math.round((activeCount / Math.max(totalUsers, 1)) * 15), 24, 97);
  const momentum = clamp(Math.round((completionRate * 0.6) + ((100 - disputePressure) * 0.4)), 10, 99);

  const statCards = [
    {
      label: "Active Learners",
      value: totalUsers,
      icon: FiUsers,
      note: "Student accounts in trust network",
      tone: "text-cyan-200",
      glow: "from-cyan-400/30",
    },
    {
      label: "Sessions In Motion",
      value: activeSessions,
      icon: FiClock,
      note: "Live mentoring interactions",
      tone: "text-amber-200",
      glow: "from-amber-400/25",
    },
    {
      label: "Resolved Sessions",
      value: completedSessions,
      icon: FiCheckCircle,
      note: `${completionRate}% completion ratio`,
      tone: "text-emerald-200",
      glow: "from-emerald-400/25",
    },
    {
      label: "Open Disputes",
      value: pendingDisputes,
      icon: FiAlertTriangle,
      note: `${disputePressure}% queue pressure`,
      tone: "text-rose-200",
      glow: "from-rose-400/30",
    },
  ];

  return (
    <section className="admin-theme max-w-7xl mx-auto admin-rise">
      <div className="admin-shell p-6 md:p-8 space-y-7">
        <div className="admin-grid-glow" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="admin-chip bg-cyan-400/15 text-cyan-100 border border-cyan-200/35 w-fit mb-3">
              EduSpark Trust Command Center
            </p>
            <h2 className="admin-title text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight">
              System Signal Overview
            </h2>
            <p className="text-slate-300 mt-2 max-w-2xl text-sm md:text-base">
              Monitor trust health, session momentum, and dispute escalation in one operational surface tuned for student collaboration.
            </p>
          </div>

          <div className="admin-panel px-5 py-4 min-w-[240px]">
            <div className="text-xs uppercase tracking-[0.12em] text-slate-400">Network Trust Index</div>
            <div className="mt-2 flex items-end gap-2">
              <span className="admin-title text-4xl font-bold text-emerald-200">{trustIndex}</span>
              <span className="text-slate-300 text-sm pb-1">/ 100</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-300"
                style={{ width: `${trustIndex}%` }}
              />
            </div>
          </div>
        </div>

        <AdminPageNav />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <article
              key={stat.label}
              className={`admin-kpi p-4 md:p-5 bg-gradient-to-br ${stat.glow} to-transparent`}
              style={{ animationDelay: `${80 * i}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-400">{stat.label}</p>
                  <h3 className="admin-title mt-2 text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
                </div>
                <div className="rounded-xl p-2.5 bg-white dark:bg-white/5 shadow-sm dark:shadow-none border border-slate-200 dark:border-white/10">
                  <stat.icon size={20} className={stat.tone} />
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-300">{stat.note}</p>
            </article>
          ))}
        </div>

        <div className="relative z-10 grid grid-cols-1 xl:grid-cols-3 gap-5">
          <section className="admin-panel p-5 xl:col-span-2">
            <div className="flex items-center justify-between gap-3 mb-5">
              <h3 className="admin-title text-lg text-slate-900 dark:text-white">Skill Demand Pulse</h3>
              <span className="admin-chip bg-blue-300/10 text-blue-100 border border-blue-200/25">
                Top Requested Learning Streams
              </span>
            </div>

            {topSkills.length === 0 ? (
              <p className="text-sm text-slate-400">No task demand data yet.</p>
            ) : (
              <div className="space-y-4">
                {topSkills.map((skill, index) => {
                  const width = (skill.count / maxSkillCount) * 100;
                  return (
                    <div key={skill._id || `skill-${index}`}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="font-semibold text-slate-100">{skill._id || "Unknown"}</span>
                        <span className="text-slate-300">{skill.count} requests</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-300 transition-all duration-700"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="admin-panel p-5">
            <h3 className="admin-title text-lg text-slate-900 dark:text-white mb-5">Resolution Momentum</h3>

            <div className="mx-auto w-40 h-40 rounded-full relative mb-5"
              style={{
                background: `conic-gradient(#34d399 0 ${Math.round((completedCount / safeTotalSessions) * 100)}%, #fbbf24 ${Math.round((completedCount / safeTotalSessions) * 100)}% ${Math.round(((completedCount + activeCount) / safeTotalSessions) * 100)}%, #334155 ${Math.round(((completedCount + activeCount) / safeTotalSessions) * 100)}% 100%)`,
              }}
            >
              <div className="absolute inset-4 rounded-full bg-[var(--admin-bg)] border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center">
                <span className="admin-title text-3xl text-slate-900 dark:text-white">{momentum}</span>
                <span className="text-xs uppercase text-slate-400 tracking-[0.12em]">Flow Score</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-slate-200"><span>Completed</span><span>{completedCount}</span></div>
              <div className="flex items-center justify-between text-slate-200"><span>Active</span><span>{activeCount}</span></div>
              <div className="flex items-center justify-between text-slate-200"><span>Other</span><span>{otherSessionCount}</span></div>
            </div>
          </section>
        </div>

        <div className="relative z-10 grid grid-cols-1 xl:grid-cols-2 gap-5">
          <section className="admin-panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <FiZap className="text-cyan-200" />
              <h3 className="admin-title text-lg text-slate-900 dark:text-white">Dispute Intelligence</h3>
            </div>
            {disputeTypes.length === 0 ? (
              <p className="text-slate-400 text-sm">No dispute patterns captured yet.</p>
            ) : (
              <ul className="space-y-3">
                {disputeTypes.slice(0, 4).map((item, index) => {
                  const level = index === 0 ? "High" : index === 1 ? "Medium" : "Watch";
                  return (
                    <li key={`${item._id}-${index}`} className="flex items-center justify-between bg-white dark:bg-slate-900 shadow-sm dark:shadow-none/35 border border-slate-700/50 rounded-xl px-3 py-2.5">
                      <div>
                        <div className="text-slate-100 font-medium text-sm">{item._id || "Unknown"}</div>
                        <div className="text-xs text-slate-400">{item.count} reported cases</div>
                      </div>
                      <span className={`admin-chip border ${
                        level === "High"
                          ? "bg-rose-500/15 text-rose-100 border-rose-300/35"
                          : level === "Medium"
                          ? "bg-amber-500/15 text-amber-100 border-amber-300/35"
                          : "bg-sky-500/15 text-sky-100 border-sky-300/35"
                      }`}>
                        {level}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="admin-panel p-5">
            <div className="flex items-center gap-2 mb-4">
              <FiShield className="text-emerald-200" />
              <h3 className="admin-title text-lg text-slate-900 dark:text-white">Operator Guidance</h3>
            </div>

            <div className="space-y-3 text-sm text-slate-200">
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm dark:shadow-none px-3 py-3 flex items-start gap-3">
                <FiTrendingUp className="mt-0.5 text-cyan-200" />
                <p>
                  Session completion is at <span className="font-semibold text-slate-900 dark:text-white">{completionRate}%</span>. Continue pairing support in high-demand skills to keep this above 70%.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm dark:shadow-none px-3 py-3 flex items-start gap-3">
                <FiAlertTriangle className="mt-0.5 text-amber-200" />
                <p>
                  Queue pressure is <span className="font-semibold text-slate-900 dark:text-white">{disputePressure}%</span>. Prioritize repeated reason categories to prevent trust score drop.
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm dark:shadow-none px-3 py-3 flex items-start gap-3">
                <FiShield className="mt-0.5 text-emerald-200" />
                <p>
                  Trust index currently at <span className="font-semibold text-slate-900 dark:text-white">{trustIndex}/100</span>. Keep unresolved disputes below 10% of session volume for stable health.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}