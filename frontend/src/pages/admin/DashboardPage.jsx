import { FiUsers, FiClock, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";

export default function DashboardPage() {
  const stats = [
    { label: "Total Users", value: "2,543", icon: FiUsers, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Active Sessions", value: "84", icon: FiClock, color: "text-yellow-600", bg: "bg-yellow-100" },
    { label: "Completed Sessions", value: "12,239", icon: FiCheckCircle, color: "text-green-600", bg: "bg-green-100" },
    { label: "Pending Disputes", value: "12", icon: FiAlertTriangle, color: "text-red-600", bg: "bg-red-100" },
  ];

  const recentActivity = [
    { id: 1, action: "User 'kamal' reported dispute on Task #104", time: "10 mins ago" },
    { id: 2, action: "Session 'Math Tutoring' completed", time: "25 mins ago" },
    { id: 3, action: "New user 'Sarah' joined", time: "1 hour ago" },
    { id: 4, action: "Admin 'System' suspended user 'JohnD'", time: "2 hours ago" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">System Overview</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition">
          Generate Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 flex items-center justify-between">
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
        {/* Simple Chart / Progress Map */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Task Completion Rate (This Week)</h3>
          <div className="h-48 flex items-end justify-between gap-2 border-b border-l border-gray-200 p-2 pb-0 opacity-80">
            {/* Mock bar chart with CSS */}
            {[45, 60, 35, 80, 55, 90, 75].map((height, idx) => (
              <div key={idx} className="w-full flex justify-center group relative">
                <div
                  className="w-full max-w-[40px] bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-all"
                  style={{ height: `${height}%` }}
                ></div>
                <div className="absolute -bottom-6 text-xs text-gray-500">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map(log => (
              <div key={log.id} className="flex gap-3 border-b border-gray-50 pb-3 last:border-0">
                <div className="mt-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                </div>
                <div>
                  <p className="text-sm text-gray-800">{log.action}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
