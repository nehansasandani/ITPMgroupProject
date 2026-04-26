import { useEffect, useState } from 'react';
import { FiTrendingUp, FiTrendingDown, FiAward, FiStar, FiAlertCircle, FiLoader, FiChevronDown } from 'react-icons/fi';
import { getReputationHistory } from '../../api/Reputation';

/**
 * ReputationTimeline - Display audit history of reputation changes
 * Shows each change with reason, delta, timestamp
 */
export default function ReputationTimeline({ userId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchHistory();
  }, [userId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getReputationHistory(userId, PAGE_SIZE, page * PAGE_SIZE);
      setLogs(data.logs || []);
      setHasMore(data.total > (page + 1) * PAGE_SIZE);
    } catch (err) {
      setError('Failed to load reputation history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    try {
      const data = await getReputationHistory(userId, PAGE_SIZE, (page + 1) * PAGE_SIZE);
      setLogs([...logs, ...(data.logs || [])]);
      setPage(page + 1);
      setHasMore(data.total > (page + 2) * PAGE_SIZE);
    } catch (err) {
      setError('Failed to load more history');
    }
  };

  const getReasonLabel = (reason) => {
    const labels = {
      rating_received: 'Rating Received',
      session_completed: 'Session Completed',
      session_noshow: 'Session No-Show',
      endorsement_received: 'Endorsement Received',
      badge_earned: 'Badge Earned',
      penalty_applied: 'Penalty Applied',
      dispute_opened: 'Dispute Opened',
      dispute_resolved: 'Dispute Resolved',
      manual_adjustment: 'Manual Adjustment',
    };
    return labels[reason] || reason;
  };

  const getReasonIcon = (reason) => {
    if (reason.includes('endorsement')) return <FiStar className="text-amber-400" />;
    if (reason.includes('badge')) return <FiAward className="text-indigo-400" />;
    if (reason.includes('penalty') || reason.includes('noshow')) return <FiAlertCircle className="text-red-400" />;
    if (reason.includes('dispute')) return <FiAlertCircle className="text-orange-400" />;
    return <FiTrendingUp className="text-indigo-400" />;
  };

  const getDeltaColor = (delta) => {
    if (delta > 0) return 'text-green-400';
    if (delta < 0) return 'text-red-400';
    return 'text-white/50';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading && logs.length === 0) {
    return (
      <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl">
        <div className="flex items-center justify-center py-12">
          <FiLoader className="text-indigo-400 animate-spin text-2xl" />
          <p className="ml-3 text-white/60 text-sm">Loading reputation history…</p>
        </div>
      </div>
    );
  }

  if (error && logs.length === 0) {
    return (
      <div className="p-6 bg-slate-900/40 border border-red-500/20 rounded-2xl">
        <p className="text-red-300 text-sm">{error}</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="p-6 bg-slate-900/40 border border-white/5 rounded-2xl text-center">
        <FiTrendingUp className="text-white/20 text-3xl mx-auto mb-3" />
        <p className="text-white/50 text-sm">No reputation changes yet. Keep engaging to build your reputation!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FiTrendingUp className="text-indigo-400 text-xl" />
        <h3 className="text-lg font-bold text-white">Reputation History</h3>
        <span className="ml-auto text-xs font-bold text-white/50 uppercase tracking-widest">
          {logs.length} entries
        </span>
      </div>

      {/* Timeline */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-4">
        {logs.map((log, idx) => (
          <div key={log._id} className="relative">
            {/* Timeline line */}
            {idx < logs.length - 1 && (
              <div className="absolute left-4 top-12 w-1 h-12 bg-gradient-to-b from-indigo-500/30 to-transparent" />
            )}

            {/* Timeline item */}
            <div className="flex gap-4">
              {/* Icon dot */}
              <div className="relative flex-shrink-0 mt-1">
                <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-indigo-500/50 flex items-center justify-center">
                  {getReasonIcon(log.reason)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h4 className="text-sm font-semibold text-white">
                    {getReasonLabel(log.reason)}
                  </h4>
                  <p className="text-xs text-white/40">{formatDate(log.createdAt)}</p>
                </div>

                {/* Score change */}
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-white/50">Score:</span>
                    <span className="text-sm font-mono text-white">
                      {log.oldScore !== undefined ? log.oldScore.toFixed(1) : 'N/A'} → {log.newScore !== undefined ? log.newScore.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 font-semibold ${getDeltaColor(log.delta)}`}>
                    {log.delta !== undefined && log.delta > 0 ? (
                      <>
                        <FiTrendingUp size={14} />
                        +{log.delta.toFixed(1)}
                      </>
                    ) : log.delta !== undefined && log.delta < 0 ? (
                      <>
                        <FiTrendingDown size={14} />
                        {log.delta.toFixed(1)}
                      </>
                    ) : (
                      <span>No change</span>
                    )}
                  </div>
                </div>

                {/* Details */}
                {log.details && Object.keys(log.details).length > 0 && (
                  <div className="mt-2 p-2 bg-white/5 rounded border border-white/10">
                    <div className="text-xs text-white/60 space-y-1">
                      {Object.entries(log.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-white/40">{key}:</span>
                          <span className="text-white/70">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load more button */}
      {hasMore && (
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <FiLoader className="animate-spin" size={14} />
              Loading…
            </>
          ) : (
            <>
              <FiChevronDown size={14} />
              Load More History
            </>
          )}
        </button>
      )}
    </div>
  );
}
