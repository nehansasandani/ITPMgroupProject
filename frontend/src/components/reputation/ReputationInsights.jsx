import { useEffect, useState } from 'react';
import { FiCpu, FiTrendingUp, FiAlertTriangle, FiCheckCircle, FiLoader, FiZap, FiEye, FiTarget, FiDownload, FiTrendingDown } from 'react-icons/fi';
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
      <div className="bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 border border-indigo-500/30 rounded-3xl p-8">
        <div className="flex items-start gap-4">
          <div className="p-4 bg-indigo-500/20 rounded-full flex-shrink-0">
            <FiCpu className="text-indigo-400 text-3xl" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">AI Reputation Guide</h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Your personalized AI-powered analysis and actionable roadmap to improve your reputation, identify strengths and weaknesses, and achieve your professional goals on campus.
            </p>
            <div className="flex gap-4 mt-4 flex-wrap">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-emerald-400" size={16} />
                <span className="text-xs text-white/70">Identify Your Strengths</span>
              </div>
              <div className="flex items-center gap-2">
                <FiTarget className="text-purple-400" size={16} />
                <span className="text-xs text-white/70">Set Clear Goals</span>
              </div>
              <div className="flex items-center gap-2">
                <FiZap className="text-amber-400" size={16} />
                <span className="text-xs text-white/70">Get AI Recommendations</span>
              </div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-bold text-white mb-1">{data.score}</div>
            <div className="text-xs text-white/50 font-semibold uppercase tracking-widest px-3 py-1 bg-indigo-500/20 border border-indigo-500/20 rounded-lg inline-block">{data.tier} Tier</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('explanation')}
          className={`px-4 py-3 text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'explanation'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-white/50 hover:text-white/70'
          }`}
        >
          <FiCpu className="inline mr-2" size={16} />
          Why You're Here
        </button>
        <button
          onClick={() => setActiveTab('strengths')}
          className={`px-4 py-3 text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'strengths'
              ? 'text-emerald-400 border-b-2 border-emerald-400'
              : 'text-white/50 hover:text-white/70'
          }`}
        >
          <FiCheckCircle className="inline mr-2" size={16} />
          Strengths
        </button>
        <button
          onClick={() => setActiveTab('weaknesses')}
          className={`px-4 py-3 text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'weaknesses'
              ? 'text-red-400 border-b-2 border-red-400'
              : 'text-white/50 hover:text-white/70'
          }`}
        >
          <FiTrendingDown className="inline mr-2" size={16} />
          Weaknesses
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`px-4 py-3 text-sm font-semibold transition whitespace-nowrap ${
            activeTab === 'goals'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-white/50 hover:text-white/70'
          }`}
        >
          <FiTarget className="inline mr-2" size={16} />
          Goals & Plan
        </button>
        <button
          onClick={() => setActiveTab('improvement')}
          className={`px-4 py-3 text-sm font-semibold transition whitespace-nowrap ${
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
          className={`px-4 py-3 text-sm font-semibold transition whitespace-nowrap ${
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
            className={`px-4 py-3 text-sm font-semibold transition whitespace-nowrap ${
              activeTab === 'prediction'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-white/50 hover:text-white/70'
            }`}
          >
            <FiTrendingUp className="inline mr-2" size={16} />
            Forecast
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

        {/* Strengths Tab */}
        {activeTab === 'strengths' && (
          <div className="space-y-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <FiCheckCircle className="text-emerald-400" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Your Key Strengths</h3>
                  <p className="text-white/60 text-sm">What you do exceptionally well</p>
                </div>
              </div>
            </div>

            {/* AI Analysis of Strengths */}
            {data.aiExplanation && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5">
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-indigo-500/20 rounded-lg flex-shrink-0">
                    <FiCpu className="text-indigo-400" size={18} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-2">Strong Areas</h3>
                    <p className="text-white/70 leading-relaxed text-sm whitespace-pre-line">
                      {data.aiExplanation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Metrics Highlight */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <div className="text-sm text-white/50 mb-2">Avg Rating</div>
                <div className="text-2xl font-bold text-emerald-400">{data.stats.avgRating}/5</div>
                <div className="text-xs text-white/40 mt-1">Great performance!</div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <div className="text-sm text-white/50 mb-2">Sessions</div>
                <div className="text-2xl font-bold text-emerald-400">{data.stats.totalRatings}</div>
                <div className="text-xs text-white/40 mt-1">Active contributor</div>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                <div className="text-sm text-white/50 mb-2">Badges</div>
                <div className="text-2xl font-bold text-emerald-400">{data.stats.badges.length}</div>
                <div className="text-xs text-white/40 mt-1">Well-earned</div>
              </div>
            </div>
          </div>
        )}

        {/* Weaknesses Tab */}
        {activeTab === 'weaknesses' && (
          <div className="space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <FiTrendingDown className="text-red-400" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Areas for Improvement</h3>
                  <p className="text-white/60 text-sm">Opportunities to grow and develop</p>
                </div>
              </div>
            </div>

            {/* AI Weakness Analysis */}
            {data.scoreExplanation && data.scoreExplanation.length > 0 && (
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5">
                <div className="flex gap-3 items-start">
                  <div className="p-2 bg-indigo-500/20 rounded-lg flex-shrink-0">
                    <FiCpu className="text-indigo-400" size={18} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-3">AI Analysis of Development Areas</h3>
                    <div className="space-y-2">
                      {data.scoreExplanation.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 text-sm">
                          <span className="text-red-400 mt-0.5 font-bold">•</span>
                          <span className="text-white/70">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Weakness Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="text-sm text-red-300 font-semibold mb-2">Communication</div>
                <div className="text-xs text-white/60">Focus on clear, timely responses</div>
              </div>
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
                <div className="text-sm text-orange-300 font-semibold mb-2">Consistency</div>
                <div className="text-xs text-white/60">Maintain steady performance</div>
              </div>
            </div>

            <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <FiAlertTriangle size={16} className="text-orange-400" />
                Key Concern
              </h3>
              <p className="text-white/70 text-sm">
                Focus on building consistency in your work and improving communication clarity. These are the primary factors affecting your reputation score.
              </p>
            </div>
          </div>
        )}

        {/* Goals Tab */}
        {activeTab === 'goals' && (
          <div className="space-y-4">
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <FiTarget className="text-purple-400" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Your Reputation Goals</h3>
                  <p className="text-white/60 text-sm">Concrete targets to achieve your next tier</p>
                </div>
              </div>
            </div>

            {/* Next Tier Goal */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <FiTrendingUp size={18} className="text-green-400" />
                Short-term Goal: Reach Next Tier
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Current Progress</span>
                  <span className="text-green-400 font-bold">{data.pointsToNextTier} points to go</span>
                </div>
                <div className="w-full bg-slate-900/50 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.max(0, Math.min(100, ((100 - data.pointsToNextTier) / 100) * 100))}%`,
                    }}
                  />
                </div>
                <p className="text-sm text-white/60 mt-2">
                  Estimated time: <strong>2-3 weeks</strong> with consistent effort
                </p>
              </div>
            </div>

            {/* Smart Goals */}
            <div className="space-y-3">
              <h3 className="font-semibold text-white text-sm">SMART Goals Breakdown:</h3>
              
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="text-2xl font-bold text-purple-400 flex-shrink-0">S</div>
                  <div>
                    <div className="font-semibold text-white text-sm mb-1">Specific</div>
                    <div className="text-xs text-white/60">Improve communication clarity rating from 3.5 to 4.5</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="text-2xl font-bold text-purple-400 flex-shrink-0">M</div>
                  <div>
                    <div className="font-semibold text-white text-sm mb-1">Measurable</div>
                    <div className="text-xs text-white/60">Track average ratings on each peer review</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="text-2xl font-bold text-purple-400 flex-shrink-0">A</div>
                  <div>
                    <div className="font-semibold text-white text-sm mb-1">Achievable</div>
                    <div className="text-xs text-white/60">Take on 5+ new tasks with focus on clear communication</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="text-2xl font-bold text-purple-400 flex-shrink-0">R</div>
                  <div>
                    <div className="font-semibold text-white text-sm mb-1">Relevant</div>
                    <div className="text-xs text-white/60">Critical for reaching Elite status and building trust</div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="text-2xl font-bold text-purple-400 flex-shrink-0">T</div>
                  <div>
                    <div className="font-semibold text-white text-sm mb-1">Time-bound</div>
                    <div className="text-xs text-white/60">Achieve this milestone within 30 days</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
