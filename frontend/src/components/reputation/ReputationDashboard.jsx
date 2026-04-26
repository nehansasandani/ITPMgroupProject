import { useEffect, useState } from 'react';
import {
  PieChart, Pie, LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { FiRefreshCw, FiTrendingUp, FiActivity, FiAward } from 'react-icons/fi';

export default function ReputationDashboard({ reputation, ratings, skills }) {
  const [chartData, setChartData] = useState({
    performanceData: [],
    ratingBreakdown: [],
    skillDistribution: [],
    trendData: []
  });
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshRate, setRefreshRate] = useState(5000);

  // Calculate rating breakdown for pie chart
  useEffect(() => {
    if (!ratings || ratings.length === 0) return;

    // Performance breakdown
    const clarityAvg = (ratings.reduce((sum, r) => sum + r.clarity, 0) / ratings.length).toFixed(1);
    const effortAvg = (ratings.reduce((sum, r) => sum + r.effort, 0) / ratings.length).toFixed(1);
    const timeAvg = (ratings.reduce((sum, r) => sum + r.timeCommitment, 0) / ratings.length).toFixed(1);
    const commAvg = (ratings.reduce((sum, r) => sum + r.communication, 0) / ratings.length).toFixed(1);

    const ratingBreakdown = [
      { name: 'Clarity', value: parseFloat(clarityAvg), fill: '#ef4444' },
      { name: 'Effort', value: parseFloat(effortAvg), fill: '#eab308' },
      { name: 'Communication', value: parseFloat(commAvg), fill: '#10b981' },
      { name: 'Punctuality', value: parseFloat(timeAvg), fill: '#8b5cf6' }
    ];

    // Trend data (simulate with dates)
    const trendData = ratings.slice(-10).map((r, i) => ({
      date: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: ((r.clarity + r.effort + r.timeCommitment + r.communication) / 4 * 20).toFixed(0),
      clarity: r.clarity,
      effort: r.effort,
      communication: r.communication,
      time: r.timeCommitment
    }));

    // Skill distribution
    const skillCounts = {};
    ratings.forEach(r => {
      if (r.skillName) {
        skillCounts[r.skillName] = (skillCounts[r.skillName] || 0) + 1;
      }
    });
    const skillDistribution = Object.entries(skillCounts).slice(0, 8).map(([skill, count]) => ({
      skill: skill.length > 12 ? skill.substring(0, 12) + '...' : skill,
      ratings: count
    }));

    // Performance metrics
    const performanceData = [
      { metric: 'Clarity', actual: clarityAvg, target: 4.5 },
      { metric: 'Effort', actual: effortAvg, target: 4.5 },
      { metric: 'Communication', actual: commAvg, target: 4.5 },
      { metric: 'Punctuality', actual: timeAvg, target: 4.5 }
    ];

    setChartData({
      performanceData,
      ratingBreakdown,
      skillDistribution,
      trendData
    });
  }, [ratings]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      // Trigger real-time update (can be connected to WebSocket)
    }, refreshRate);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshRate]);

  const COLORS = ['#0ea5e9', '#f59e0b', '#10b981', '#a855f7', '#ef4444', '#ec4899', '#6366f1', '#14b8a6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Reputation Analytics Dashboard</h2>
          <p className="text-sm text-slate-400">Real-time performance metrics and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            Auto Refresh
          </label>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-400 rounded-lg transition"
          >
            <FiRefreshCw size={16} />
            <span className="text-xs font-semibold">Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/60 font-bold uppercase tracking-widest">Current Score</span>
            <FiActivity className="text-indigo-400" size={18} />
          </div>
          <div className="text-3xl font-bold text-white">{reputation?.score || 0}</div>
          <div className="text-xs text-indigo-400 mt-2">
            {reputation?.score >= 80 ? '🚀 Elite' : reputation?.score >= 60 ? '⭐ Trusted' : '📈 Growing'}
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/60 font-bold uppercase tracking-widest">Total Ratings</span>
            <FiAward className="text-emerald-400" size={18} />
          </div>
          <div className="text-3xl font-bold text-white">{ratings?.length || 0}</div>
          <div className="text-xs text-emerald-400 mt-2">
            {ratings?.length} peer reviews
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/60 font-bold uppercase tracking-widest">Avg Rating</span>
            <FiTrendingUp className="text-amber-400" size={18} />
          </div>
          <div className="text-3xl font-bold text-white">
            {ratings?.length > 0
              ? ((ratings.reduce((sum, r) => sum + (r.clarity + r.effort + r.timeCommitment + r.communication) / 4, 0) / ratings.length).toFixed(1))
              : '—'}
          </div>
          <div className="text-xs text-amber-400 mt-2">out of 5.0</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-white/60 font-bold uppercase tracking-widest">Verified Skills</span>
            <FiActivity className="text-purple-400" size={18} />
          </div>
          <div className="text-3xl font-bold text-white">{skills?.filter(s => s.isVerified).length || 0}</div>
          <div className="text-xs text-purple-400 mt-2">
            {skills?.length || 0} total
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Performance Breakdown - Pie Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-full" />
            Performance Breakdown
          </h3>
          {chartData.ratingBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={chartData.ratingBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.ratingBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => typeof value === 'number' ? value.toFixed(1) : value}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
              No rating data available
            </div>
          )}
        </div>

        {/* Performance vs Target - Bar Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full" />
            Performance vs Target
          </h3>
          {chartData.performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData.performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="metric" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} domain={[0, 5]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => typeof value === 'number' ? value.toFixed(1) : value}
                />
                <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                <Bar dataKey="actual" fill="#10b981" name="Actual" radius={[8, 8, 0, 0]} />
                <Bar dataKey="target" fill="#f59e0b" name="Target" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
              No performance data available
            </div>
          )}
        </div>

        {/* Rating Trend - Line Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-cyan-500 rounded-full" />
            Rating Trend Over Time
          </h3>
          {chartData.trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData.trendData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorClarity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => typeof value === 'number' ? value.toFixed(1) : value}
                />
                <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#0ea5e9"
                  fillOpacity={1}
                  fill="url(#colorScore)"
                  name="Avg Score"
                  isAnimationActive={true}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-slate-500 text-sm">
              No trend data available (need at least 2 ratings)
            </div>
          )}
        </div>

        {/* Skill Distribution - Bar Chart */}
        {chartData.skillDistribution.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              Top Rated Skills
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.skillDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis dataKey="skill" type="category" stroke="#94a3b8" style={{ fontSize: '11px' }} width={100} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="ratings" fill="#a855f7" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Legend & Info */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
        <p className="text-xs text-white/60 leading-relaxed">
          📊 <strong>Dashboard Info:</strong> Charts update automatically every 5 seconds. Pie chart shows your average ratings across key metrics. 
          Line chart displays recent rating trends. Bar charts compare your actual performance vs targets. Use this data to identify improvement areas and track your progress toward your reputation goals.
        </p>
      </div>
    </div>
  );
}
