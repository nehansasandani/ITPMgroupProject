import { useEffect, useState } from 'react';
import {
  FiCpu, FiTrendingUp, FiAlertTriangle, FiCheckCircle,
  FiLoader, FiZap, FiEye, FiTarget, FiTrendingDown,
  FiShield, FiBarChart2, FiUsers, FiActivity,
} from 'react-icons/fi';
import { getReputationInsights } from '../../api/Reputation';

export default function ReputationInsights({ userId, onNavigate }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [activeTab, setActiveTab] = useState('strengths');

  useEffect(() => {
    if (userId) fetchInsights();
  }, [userId]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getReputationInsights(userId);
      setInsights(response);
    } catch (err) {
      setError('Failed to load reputation intelligence');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-800 rounded-3xl">
        <div className="flex items-center justify-center py-12">
          <FiLoader className="text-indigo-400 animate-spin text-2xl mr-3" />
          <p className="text-slate-900 dark:text-slate-700 dark:text-white/40 dark:text-white/50 dark:text-white/60">ARIS initializing intelligence analysis…</p>
        </div>
      </div>
    );
  }

  if (error || !insights?.success) {
    return (
      <div className="p-6 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-red-500/20 rounded-3xl">
        <p className="text-red-300 text-sm">{error || 'Could not generate intelligence report'}</p>
        <button
          onClick={fetchInsights}
          className="mt-3 text-xs text-indigo-400 hover:text-indigo-300 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const { data } = insights;
  const { intelligence, prediction, stats, benchmark, scoreHistory } = data;

  const TABS = [
    { id: 'strengths',   label: 'Strengths',      icon: <FiCheckCircle />,  color: 'text-emerald-400', border: 'border-emerald-400' },
    { id: 'weaknesses',  label: 'Concerns',        icon: <FiTrendingDown />, color: 'text-red-400',     border: 'border-red-400'     },
    { id: 'roadmap',     label: 'Growth Roadmap',  icon: <FiTarget />,       color: 'text-purple-400',  border: 'border-purple-400'  },
    { id: 'improvement', label: 'Tactical Steps',  icon: <FiZap />,          color: 'text-green-400',   border: 'border-green-400'   },
    { id: 'forecast',    label: 'Forecast',         icon: <FiTrendingUp />,   color: 'text-cyan-400',    border: 'border-cyan-400'    },
    { id: 'benchmark',   label: 'Peer Ranking',     icon: <FiUsers />,        color: 'text-blue-400',    border: 'border-blue-400'    },
    { id: 'history',     label: 'Score History',    icon: <FiActivity />,     color: 'text-amber-400',   border: 'border-amber-400'   },
    { id: 'risks',       label: 'Risk Protocol',    icon: <FiShield />,       color: 'text-orange-400',  border: 'border-orange-400'  },
  ];

  const handleNavigate = (targetTab) => {
    if (onNavigate) {
      onNavigate(targetTab); // pass raw value — matches sidebar IDs exactly
    }
  };

  return (
    <div className="space-y-6">

      {/* ── ARIS Header ── */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-slate-900 to-cyan-500/10 border border-indigo-500/30 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <FiCpu size={120} />
        </div>
        <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
          <div className="p-5 bg-indigo-500/20 rounded-2xl flex-shrink-0 border border-indigo-500/30">
            <FiCpu className="text-indigo-400 text-4xl" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Reputation Intelligence</h2>
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded border border-indigo-500/30 uppercase tracking-widest">
                {data.systemName}
              </span>
            </div>
            <p className="text-slate-900 dark:text-slate-700 dark:text-white/40 dark:text-white/70 text-sm leading-relaxed max-w-2xl">{intelligence.summary}</p>
            <div className="flex gap-4 mt-5 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-700">
                <FiBarChart2 className="text-indigo-400" size={14} />
                <span className="text-[10px] font-bold text-slate-900 dark:text-slate-700 dark:text-white/40 dark:text-white/70 uppercase tracking-wider">
                  Data confidence: {intelligence.explainabilityScore}%
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-700">
                <FiZap className="text-amber-400" size={14} />
                <span className="text-[10px] font-bold text-slate-900 dark:text-slate-700 dark:text-white/40 dark:text-white/70 uppercase tracking-wider">
                  Next tier: {data.tier === 'Elite' ? 'MAX TIER' : `${data.pointsToNextTier} pts`}
                </span>
              </div>
              {benchmark && (
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-700">
                  <FiUsers className="text-blue-400" size={14} />
                  <span className="text-[10px] font-bold text-slate-900 dark:text-slate-700 dark:text-white/40 dark:text-white/70 uppercase tracking-wider">
                    Top {100 - benchmark.percentile}% of {benchmark.totalUsers} users
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0 bg-slate-50 dark:bg-slate-950 shadow-sm dark:shadow-none/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 min-w-[120px]">
            <div className="text-4xl font-black text-slate-900 dark:text-white mb-1 font-mono">{data.score}</div>
            <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{data.tier} Status</div>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-2 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-widest transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? `${tab.color} border-b-2 ${tab.border}`
                : 'text-slate-900 dark:text-slate-700 dark:text-white/40 dark:text-white/50 dark:text-white/40 hover:text-slate-900 dark:text-slate-700 dark:text-white/40 dark:text-white/70'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.id === 'risks' && intelligence.risks.length > 0 && (
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* ── Content Area ── */}
      <div className="min-h-[350px]">

        {/* ── Strengths ── */}
        {activeTab === 'strengths' && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <h3 className="text-slate-900 dark:text-white font-bold mb-4 flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-400" /> Key strengths detected
                </h3>
                <div className="space-y-3">
                  {intelligence.positives.length > 0 ? (
                    intelligence.positives.map((pos, i) => (
                      <div key={i} className="flex gap-3 items-center text-sm text-slate-900 dark:text-slate-700 dark:text-white/40 dark:text-white/70 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        {pos}
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-700 dark:text-white/40 dark:text-white/50 text-sm italic">Begin more sessions to identify strength patterns.</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Avg rating',    value: stats.avgRating,        color: 'text-emerald-400' },
                  { label: 'Total ratings', value: stats.totalRatings,     color: 'text-emerald-400' },
                  { label: 'Endorsements',  value: stats.endorsementCount, color: 'text-emerald-400' },
                  { label: 'Badges earned', value: stats.badges.length,    color: 'text-emerald-400' },
                ].map((m) => (
                  <div key={m.label} className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center hover:scale-105 transition-transform">
                    <div className="text-slate-700 dark:text-white/40 dark:text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">{m.label}</div>
                    <div className={`text-2xl font-black ${m.color}`}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-score breakdown */}
            {stats.subScores && stats.totalRatings > 0 && (
              <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <h3 className="text-slate-900 dark:text-white font-bold mb-4 text-sm uppercase tracking-widest">Sub-score breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { key: 'communication', label: 'Communication', color: 'bg-blue-400'   },
                    { key: 'clarity',        label: 'Clarity',       color: 'bg-cyan-400'   },
                    { key: 'effort',         label: 'Effort',        color: 'bg-amber-400'  },
                    { key: 'timeCommitment', label: 'Reliability',   color: 'bg-violet-400' },
                  ].map((f) => (
                    <div key={f.key} className="flex flex-col gap-2">
                      <div className="flex justify-between text-xs text-slate-700 dark:text-white/40 dark:text-white/50 dark:text-white/60">
                        <span>{f.label}</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{stats.subScores[f.key]}/5</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${f.color} rounded-full transition-all duration-700`}
                          style={{ width: `${(stats.subScores[f.key] / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Concerns ── */}
        {activeTab === 'weaknesses' && (
          <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-slate-900 dark:text-white font-bold mb-4 flex items-center gap-2">
              <FiTrendingDown className="text-red-400" /> Performance concerns
            </h3>
            <div className="grid gap-3">
              {intelligence.negatives.length > 0 ? (
                intelligence.negatives.map((neg, i) => (
                  <div key={i} className="flex gap-3 items-center text-sm text-slate-900 dark:text-slate-700 dark:text-white/40 dark:text-white/70 bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                    <FiAlertTriangle className="text-red-400 shrink-0" size={16} />
                    {neg}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FiShield className="text-emerald-400 text-4xl mx-auto mb-3 opacity-30" />
                  <p className="text-slate-900 dark:text-slate-700 dark:text-white/40 dark:text-white/50 dark:text-white/60 font-semibold tracking-wide uppercase text-xs">No active concerns identified</p>
                </div>
              )}
            </div>

            {/* Rater diversity callout */}
            {stats.raterDiversity !== null && stats.raterDiversity !== undefined && (
              <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-white/40 dark:text-white/50 dark:text-white/60 uppercase tracking-widest">Rater diversity</span>
                  <span className={`text-xs font-mono font-bold ${stats.raterDiversity >= 0.6 ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {Math.round(stats.raterDiversity * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${stats.raterDiversity >= 0.6 ? 'bg-emerald-400' : 'bg-orange-400'}`}
                    style={{ width: `${stats.raterDiversity * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-700 dark:text-white/40 dark:text-white/50 mt-2">
                  {stats.raterDiversity >= 0.6
                    ? 'Healthy — ratings come from a diverse peer group.'
                    : 'Low — most ratings come from the same small group. Broaden your peer network.'}
                </p>
              </div>
            )}

            {/* Completion rate callout */}
            {stats.completionRate !== null && stats.completionRate !== undefined && (
              <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-white/40 dark:text-white/50 dark:text-white/60 uppercase tracking-widest">Session completion rate</span>
                  <span className={`text-xs font-mono font-bold ${stats.completionRate >= 0.8 ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {Math.round(stats.completionRate * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${stats.completionRate >= 0.8 ? 'bg-emerald-400' : 'bg-orange-400'}`}
                    style={{ width: `${stats.completionRate * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Roadmap ── */}
        {activeTab === 'roadmap' && (
          <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <FiTarget className="text-purple-400" /> Growth strategy
            </h3>
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-2xl p-6 text-slate-900 dark:text-white/80 leading-relaxed whitespace-pre-line">
              {intelligence.roadmap}
            </div>
            <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-white/40 dark:text-white/50 dark:text-white/60">
              Targeting <span className="text-slate-900 dark:text-white font-bold">{getTierLabel(data.nextTierThreshold)}</span> tier — {data.pointsToNextTier} points needed.
            </div>
          </div>
        )}

        {/* ── Tactical Steps ── */}
        {activeTab === 'improvement' && (
          <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-slate-900 dark:text-white font-bold mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
              <FiZap className="text-green-400" /> ARIS recommendations
            </h3>
            <div className="space-y-3">
              {intelligence.suggestions.length > 0 ? (
                intelligence.suggestions.map((sug, i) => (
                  <div
                    key={i}
                    className="bg-slate-100 dark:bg-slate-800/40 p-8 rounded-3xl border border-slate-200 dark:border-slate-200 dark:border-white/10 group hover:border-indigo-500/30 transition-all"
                  >
                    <div className="flex gap-6 items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 shadow-sm dark:shadow-none flex items-center justify-center text-lg font-black text-indigo-400 border border-slate-200 dark:border-slate-800 group-hover:bg-indigo-500 group-hover:text-slate-900 dark:text-white transition-all shadow-xl shadow-black/20">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-slate-900 dark:text-white font-bold text-xl mb-4 tracking-tight">{sug.text}</h4>

                        {/* Execution plan */}
                        {Array.isArray(sug.plan) && sug.plan.length > 0 && (
                          <div className="space-y-3 mb-6">
                            <div className="text-[10px] font-bold text-slate-700 dark:text-white/40 dark:text-white/50 uppercase tracking-widest mb-1">
                              Execution plan
                            </div>
                            {sug.plan.map((step, idx) => (
                              <div key={idx} className="flex gap-3 items-start bg-white dark:bg-slate-900 shadow-sm dark:shadow-none/50 p-3 rounded-xl border border-slate-200 dark:border-slate-200 dark:border-white/10">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                <p className="text-sm text-slate-900 dark:text-slate-700 dark:text-white/40 dark:text-white/70 leading-relaxed font-medium">{step}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action button */}
                        {sug.targetTab && (
                          <button
                            onClick={() => handleNavigate(sug.targetTab)}
                            className="flex items-center gap-3 bg-indigo-500 hover:bg-indigo-400 text-slate-900 dark:text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-indigo-500/20"
                          >
                            <FiZap /> Launch: {sug.targetTab}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FiCheckCircle className="text-emerald-500 text-4xl mx-auto mb-3 opacity-30" />
                  <p className="text-slate-900 dark:text-slate-700 dark:text-white/40 dark:text-white/50 dark:text-white/60 font-semibold tracking-wide uppercase text-xs">
                    Your standing is optimal — no tactical changes needed
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Forecast ── */}
        {activeTab === 'forecast' && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center max-w-2xl mx-auto">
              <FiEye className="text-cyan-400 text-5xl mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Predictive analysis</h3>
              <p className="text-slate-700 dark:text-white/40 dark:text-white/50 dark:text-white/60 text-sm mb-8">
                Score trajectory over the next 7 active days based on current momentum.
              </p>
              <div className="grid grid-cols-2 gap-8 items-center bg-slate-50 dark:bg-slate-950 shadow-sm dark:shadow-none p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="text-slate-700 dark:text-white/40 dark:text-white/50 text-[10px] font-bold uppercase tracking-widest">Current momentum</div>
                  <div className={`text-2xl font-black uppercase tracking-tighter ${
                    prediction.velocity === 'expanding'
                      ? 'text-emerald-400'
                      : prediction.velocity === 'contracting'
                      ? 'text-red-400'
                      : 'text-slate-900 dark:text-white'
                  }`}>
                    {prediction.velocity}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-slate-700 dark:text-white/40 dark:text-white/50 text-[10px] font-bold uppercase tracking-widest">7-day projection</div>
                  <div className="text-4xl font-black text-cyan-400 font-mono">{prediction.forecast}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Peer Benchmark ── */}
        {activeTab === 'benchmark' && (
          <div className="space-y-4">
            {benchmark ? (
              <>
                <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center">
                  <FiUsers className="text-blue-400 text-5xl mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Peer ranking</h3>
                  <p className="text-slate-700 dark:text-white/40 dark:text-white/50 dark:text-white/60 text-sm mb-6">How you compare to the full user base.</p>
                  <div className="grid grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-50 dark:bg-slate-950 shadow-sm dark:shadow-none rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-700 dark:text-white/40 dark:text-white/50 font-bold uppercase tracking-widest mb-1">Percentile</div>
                      <div className="text-3xl font-black text-blue-400 font-mono">{benchmark.percentile}<span className="text-lg">th</span></div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 shadow-sm dark:shadow-none rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-700 dark:text-white/40 dark:text-white/50 font-bold uppercase tracking-widest mb-1">Platform avg</div>
                      <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">{benchmark.avgCohortScore}</div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 shadow-sm dark:shadow-none rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] text-slate-700 dark:text-white/40 dark:text-white/50 font-bold uppercase tracking-widest mb-1">Users ahead</div>
                      <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">{benchmark.usersAhead}</div>
                    </div>
                  </div>

                  {/* Percentile bar */}
                  <div className="relative h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000"
                      style={{ width: `${benchmark.percentile}%` }}
                    />
                    <div
                      className="absolute top-0 h-full w-0.5 bg-white/60"
                      style={{ left: `${benchmark.percentile}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-700 dark:text-white/40 dark:text-white/50 font-bold uppercase tracking-widest">
                    <span>0th</span>
                    <span>{benchmark.percentile}th percentile</span>
                    <span>100th</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl border text-sm font-medium ${
                  benchmark.percentile >= 75
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                    : benchmark.percentile >= 50
                    ? 'bg-blue-500/5 border-blue-500/20 text-blue-400'
                    : 'bg-orange-500/5 border-orange-500/20 text-orange-400'
                }`}>
                  {benchmark.percentile >= 75
                    ? `You are in the top ${100 - benchmark.percentile}% of all ${benchmark.totalUsers} users. Maintain your current momentum to reach Elite tier.`
                    : benchmark.percentile >= 50
                    ? `You are above the platform average (${benchmark.avgCohortScore}). ${benchmark.usersAhead} users are ranked above you — close the gap by completing more sessions.`
                    : `You are currently below the platform average of ${benchmark.avgCohortScore}. Focus on the Tactical Steps tab to improve your standing.`}
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center">
                <FiUsers className="text-slate-700 dark:text-white/40 text-5xl mx-auto mb-4" />
                <p className="text-slate-700 dark:text-white/40 dark:text-white/50 dark:text-white/60">Benchmark data unavailable — complete more sessions to unlock peer comparisons.</p>
              </div>
            )}
          </div>
        )}

        {/* ── Score History ── */}
        {activeTab === 'history' && (
          <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-slate-900 dark:text-white font-bold mb-6 flex items-center gap-2">
              <FiActivity className="text-amber-400" /> Score change log
            </h3>
            {scoreHistory && scoreHistory.length > 0 ? (
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {scoreHistory.map((entry, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className={`text-lg font-black font-mono w-16 text-right ${
                      entry.delta >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {entry.delta >= 0 ? '+' : ''}{entry.delta}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-slate-900 dark:text-white/80">{entry.reason || 'Score updated'}</p>
                      <p className="text-[10px] text-slate-700 dark:text-white/40 dark:text-white/50 mt-0.5">
                        {new Date(entry.date).toLocaleDateString(undefined, {
                          day: 'numeric', month: 'short', year: 'numeric',
                        })}
                        {entry.scoreAfter !== null && entry.scoreAfter !== undefined && (
                          <span className="ml-2 font-mono">→ {entry.scoreAfter}</span>
                        )}
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${entry.delta >= 0 ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-700 dark:text-white/40 dark:text-white/50 text-sm border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                No score change history yet. Activity events will appear here.
              </div>
            )}
          </div>
        )}

        {/* ── Risk Protocol ── */}
        {activeTab === 'risks' && (
          <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center">
            {intelligence.risks.length > 0 ? (
              <>
                <FiAlertTriangle className="text-orange-500 text-6xl mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Integrity warnings</h3>
                <div className="mt-6 space-y-3 max-w-md mx-auto">
                  {intelligence.risks.map((risk, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-xl text-sm font-semibold border ${
                        risk.startsWith('Critical')
                          ? 'bg-red-500/10 border-red-500/30 text-red-400'
                          : 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                      }`}
                    >
                      {risk}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <FiShield className="text-indigo-400 text-6xl mx-auto mb-4 opacity-40" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No high-risk factors</h3>
                <p className="text-slate-700 dark:text-white/40 dark:text-white/50 max-w-sm mx-auto">
                  Your account activity follows all standard reputation safety protocols.
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center px-2">
          <div className="text-[9px] text-slate-700 dark:text-white/40 font-bold uppercase tracking-[0.2em]">
            Validated by ARIS Protocol v2.1
          </div>
          <div className="flex gap-2">
            {stats.badges.map((b, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] text-indigo-400"
                title={b}
              >
                <FiTarget />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── local helper ─────────────────────────────────────────────
function getTierLabel(threshold) {
  if (threshold >= 90) return 'Elite';
  if (threshold >= 70) return 'Platinum';
  if (threshold >= 50) return 'Gold';
  if (threshold >= 30) return 'Silver';
  return 'Bronze';
}
