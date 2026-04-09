import { useEffect, useState } from "react";
import { FiUsers, FiClock, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";
import { getAdminStats, getAnalytics } from "../../api/adminApi";

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
    return <div className="text-gray-500 p-8">Loading dashboard...</div>;
  }

  const statCards = [
    { label: "Total Users",        value: stats?.totalUsers        ?? 0, icon: FiUsers,         color: "text-blue-600",   bg: "bg-blue-100"   },
    { label: "Active Sessions",    value: stats?.activeSessions    ?? 0, icon: FiClock,         color: "text-yellow-600", bg: "bg-yellow-100" },
    { label: "Completed Sessions", value: stats?.completedSessions ?? 0, icon: FiCheckCircle,   color: "text-green-600",  bg: "bg-green-100"  },
    { label: "Pending Disputes",   value: stats?.pendingDisputes   ?? 0, icon: FiAlertTriangle, color: "text-red-600",    bg: "bg-red-100"    },
  ];

  // sessionStats from analytics: [{ _id: "ACTIVE", count: 5 }, ...]
  const activeCount    = analytics?.sessionStats?.find((s) => s._id === "ACTIVE")?.count    ?? 0;
  const completedCount = analytics?.sessionStats?.find((s) => s._id === "COMPLETED")?.count ?? 0;
  const totalSessions  = activeCount + completedCount || 1; // avoid divide by zero

  // top 5 skills for bar chart
  const topSkills = analytics?.skillDemand ?? [];
  const maxSkillCount = topSkills[0]?.count || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">System Overview</h2>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
            </div>
            <div className={`p-4 rounded-full ${stat.bg}`}>
              <stat.icon size={24} className={stat.color} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

        {/* Top skills bar chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Top Requested Skills</h3>
          {topSkills.length === 0 ? (
            <p className="text-sm text-gray-400">No task data yet.</p>
          ) : (
            <div className="space-y-3">
              {topSkills.map((skill) => (
                <div key={skill._id}>
                  <div className="flex justify-between text-sm text-gray-700 mb-1">
                    <span className="font-medium">{skill._id || "Unknown"}</span>
                    <span>{skill.count} tasks</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full transition-all"
                      style={{ width: `${(skill.count / maxSkillCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Session breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Session Breakdown</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-700 mb-1">
                <span>Active</span>
                <span>{activeCount}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-yellow-400 h-2.5 rounded-full"
                  style={{ width: `${(activeCount / totalSessions) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-700 mb-1">
                <span>Completed</span>
                <span>{completedCount}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-green-400 h-2.5 rounded-full"
                  style={{ width: `${(completedCount / totalSessions) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}