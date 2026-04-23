import { useEffect, useState } from 'react';
import { FiCpu, FiTrendingUp, FiAlertTriangle, FiCheckCircle, FiLoader, FiZap, FiEye } from 'react-icons/fi';
import { getReputationInsights, predictReputationScore } from '../../api/Reputation';

/**
 * ReputationInsights - AI-powered reputation analysis
 * Shows:
 * - AI explanation of score changes
 * - AI improvement suggestions
 * - Anomaly detection
 * - Score prediction
 * - Actionable advice
 */
export default function ReputationInsights({ userId }) {
  const [insights, setInsights] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('explanation');

  useEffect(() => {
    fetchInsights();
  }, [userId]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError('');
      const [insightsData, predictionData] = await Promise.all([
        getReputationInsights(userId),
        predictReputationScore(userId, 7),
      ]);
      setInsights(insightsData);
      setPrediction(predictionData);
    } catch (err) {
      setError('Failed to load reputation insights');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
        <div className="flex items-center justify-center py-12">
          <FiLoader className="text-indigo-400 animate-spin text-2xl mr-3" />
          <p className="text-white/60">AI analyzing your reputation…</p>
        </div>
      </div>
    );
  }

  if (error || !insights?.success) {
    return (
      <div className="p-6 bg-slate-900 border border-red-500/20 rounded-3xl">
        <p className="text-red-300 text-sm">{error || 'Could not generate insights'}</p>
      </div>
    );
  }

  const data = insights.data;
  const anomalies = data.anomalies || [];

  return (
    <div className="space-y-6">
      {/* Header with AI Icon */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/30 rounded-3xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-500/20 rounded-full">
            <FiCpu className="text-indigo-400 text-2xl" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-2">AI Reputation Insights</h2>
            <p className="text-white/60 text-sm">
              Personalized AI analysis of your reputation, complete with actionable recommendations
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{data.score}</div>
            <div className="text-xs text-white/50 font-semibold uppercase tracking-widest">{data.tier} Tier</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('explanation')}
          className={`px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'explanation'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-white/50 hover:text-white/70'
          }`}
        >
          <FiCpu className="inline mr-2" size={16} />
          Why You're Here
        </button>
        <button
          onClick={() => setActiveTab('improvement')}
          className={`px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'improvement'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-white/50 hover:text-white/70'
          }`}
        >
          <FiZap className="inline mr-2" size={16} />
          How to Improve
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-3 text-sm font-semibold transition ${
            activeTab === 'alerts'
              ? 'text-orange-400 border-b-2 border-orange-400'
              : 'text-white/50 hover:text-white/70'
          }`}
        >
          <FiAlertTriangle className="inline mr-2" size={16} />
          Alerts ({anomalies.length})
        </button>
        {prediction?.success && (
          <button
            onClick={() => setActiveTab('prediction')}
            className={`px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'prediction'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            <FiTrendingUp className="inline mr-2" size={16} />
            7-Day Forecast
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {/* Explanation Tab */}
        {activeTab === 'explanation' && (
          <div className="space-y-4">
            {/* AI Natural Explanation */}
            {data.aiExplanation && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5">
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-indigo-500/20 rounded-lg flex-shrink-0">
                    <FiCpu className="text-indigo-400" size={18} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">AI Analysis</h3>
                    <p className="text-white/70 leading-relaxed text-sm">
                      {data.aiExplanation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rule-Based Breakdown */}
            {data.scoreExplanation.length > 0 && (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <FiCheckCircle size={18} className="text-green-400" />
                  Score Breakdown
                </h3>
                <div className="space-y-2">
                  {data.scoreExplanation.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <span className="text-white/40 mt-1">•</span>
                      <span className="text-white/70">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Improvement Tab */}
        {activeTab === 'improvement' && (
          <div className="space-y-4">
            {/* Next Tier Goal */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <FiTrendingUp size={18} className="text-green-400" />
                Next Goal
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Progress to next tier</span>
                  <span className="text-green-400 font-bold">{data.pointsToNextTier} points needed</span>
                </div>
                <div className="w-full bg-slate-900/50 rounded-full h-2">
                  <div
                    className="bg-green-500 h-full rounded-full transition-all"
                    style={{
                      width: `${Math.max(0, Math.min(100, ((100 - data.pointsToNextTier) / 100) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* AI Improvement Plan */}
            {data.aiImprovementPlan && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5">
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-indigo-500/20 rounded-lg flex-shrink-0">
                    <FiCpu className="text-indigo-400" size={18} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">AI-Powered Plan</h3>
                    <p className="text-white/70 text-sm whitespace-pre-line leading-relaxed">
                      {data.aiImprovementPlan}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Suggestions */}
            {data.suggestions.length > 0 && (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-3">Quick Tips</h3>
                <div className="space-y-2">
                  {data.suggestions.map((suggestion, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-sm">
                      <span className="text-amber-400 mt-1 font-bold">→</span>
                      <span className="text-white/70">{suggestion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {anomalies.length === 0 ? (
              <div className="text-center py-12">
                <FiCheckCircle className="text-green-400 text-3xl mx-auto mb-3" />
                <p className="text-white/50">No anomalies detected. Keep up the good work! 🎉</p>
              </div>
            ) : (
              anomalies.map((anomaly, idx) => (
                <div
                  key={idx}
                  className={`rounded-2xl p-5 border ${
                    anomaly.severity === 'alert'
                      ? 'bg-red-500/10 border-red-500/20'
                      : anomaly.severity === 'warning'
                      ? 'bg-orange-500/10 border-orange-500/20'
                      : 'bg-blue-500/10 border-blue-500/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      anomaly.severity === 'alert'
                        ? 'bg-red-500/20'
                        : anomaly.severity === 'warning'
                        ? 'bg-orange-500/20'
                        : 'bg-blue-500/20'
                    }`}>
                      <FiAlertTriangle
                        className={
                          anomaly.severity === 'alert'
                            ? 'text-red-400'
                            : anomaly.severity === 'warning'
                            ? 'text-orange-400'
                            : 'text-blue-400'
                        }
                        size={18}
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white mb-1 capitalize">
                        {anomaly.type.replace(/_/g, ' ')}
                      </h4>
                      <p className="text-white/70 text-sm">{anomaly.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Prediction Tab */}
        {activeTab === 'prediction' && prediction?.success && (
          <div className="space-y-4">
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-sm text-white/50 mb-1">Current</div>
                  <div className="text-2xl font-bold text-white">{prediction.data.currentScore}</div>
                  <div className="text-xs text-white/40">{prediction.data.currentTier}</div>
                </div>
                <div className="flex items-center justify-center">
                  <FiTrendingUp className={`text-xl ${
                    prediction.data.trend === 'improving' ? 'text-green-400' :
                    prediction.data.trend === 'declining' ? 'text-red-400' :
                    'text-white/50'
                  }`} />
                </div>
                <div className="text-center">
                  <div className="text-sm text-white/50 mb-1">In 7 Days</div>
                  <div className="text-2xl font-bold text-cyan-400">{prediction.data.predictedScore}</div>
                  <div className="text-xs text-cyan-300">{prediction.data.predictedTier}</div>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FiEye size={16} className="text-cyan-400" />
                  <span className="font-semibold text-white">Forecast</span>
                </div>
                <p className="text-white/70 text-sm">
                  Based on your recent activity trend, your reputation is <strong>{prediction.data.trend}</strong>.
                  {prediction.data.trend === 'improving' && ' Keep up the excellent work! 🚀'}
                  {prediction.data.trend === 'declining' && ' Consider the suggestions above to turn things around.'}
                  {prediction.data.trend === 'stable' && ' Maintain your consistency.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-center">
          <div className="text-sm text-white/50 mb-1">Avg Rating</div>
          <div className="text-xl font-bold text-amber-400">{data.stats.avgRating}/5</div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-center">
          <div className="text-sm text-white/50 mb-1">Sessions</div>
          <div className="text-xl font-bold text-blue-400">{data.stats.totalRatings}</div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-center">
          <div className="text-sm text-white/50 mb-1">Endorsements</div>
          <div className="text-xl font-bold text-indigo-400">{data.stats.endorsementCount}</div>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 text-center">
          <div className="text-sm text-white/50 mb-1">Badges</div>
          <div className="text-xl font-bold text-purple-400">{data.stats.badges.length}</div>
        </div>
      </div>
    </div>
  );
}
