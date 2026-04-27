import { useState, useEffect } from 'react';
import { FiEye, FiEyeOff, FiLock, FiLoader, FiCheck } from 'react-icons/fi';
import { getReputationSettings, updateScoreVisibility } from '../../api/Reputation';

/**
 * ScoreVisibilitySettings - Allow users to control score visibility
 * Options:
 * - public: Show score and tier
 * - tier_only: Show only tier, hide score
 * - private: Hide both score and tier
 */
export default function ScoreVisibilitySettings({ userId, onUpdate = null }) {
  const [visibility, setVisibility] = useState('public');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, [userId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await getReputationSettings(userId);
      setVisibility(data.scoreVisibility || 'public');
    } catch (err) {
      setError('Failed to load visibility settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVisibilityChange = async (newVisibility) => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      await updateScoreVisibility(userId, newVisibility);
      setVisibility(newVisibility);
      setSuccess('Visibility updated successfully!');
      if (onUpdate) onUpdate(newVisibility);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update visibility. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none/40 border border-white/5 rounded-2xl">
        <div className="flex items-center justify-center py-8">
          <FiLoader className="text-indigo-400 animate-spin text-xl" />
        </div>
      </div>
    );
  }

  const options = [
    {
      id: 'public',
      label: 'Public',
      icon: <FiEye size={18} />,
      description: 'Show your score and tier to everyone',
      color: 'text-green-400',
      borderColor: 'border-green-500/30',
      bgColor: 'bg-green-500/10',
    },
    {
      id: 'tier_only',
      label: 'Tier Only',
      icon: <FiEyeOff size={18} />,
      description: 'Show only your tier, hide exact score',
      color: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      bgColor: 'bg-amber-500/10',
    },
    {
      id: 'private',
      label: 'Private',
      icon: <FiLock size={18} />,
      description: 'Hide both score and tier from others',
      color: 'text-red-400',
      borderColor: 'border-red-500/30',
      bgColor: 'bg-red-500/10',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FiEye className="text-indigo-400 text-lg" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Score Visibility</h3>
      </div>

      <p className="text-slate-500 dark:text-white/60 text-sm">
        Control how your reputation score is displayed to other users in the community.
      </p>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-300 text-sm flex items-center gap-2">
          <FiCheck size={16} />
          {success}
        </div>
      )}

      {/* Visibility options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleVisibilityChange(option.id)}
            disabled={saving}
            className={`relative p-4 rounded-xl border transition-all cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed ${
              visibility === option.id
                ? `${option.bgColor} ${option.borderColor} border-2`
                : 'bg-white dark:bg-slate-900 shadow-sm dark:shadow-none/40 border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
            }`}
          >
            {/* Selected indicator */}
            {visibility === option.id && (
              <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-green-400" />
            )}

            {/* Content */}
            <div className="text-left">
              <div className={`flex items-center gap-2 font-semibold mb-2 ${option.color}`}>
                {option.icon}
                {option.label}
              </div>
              <p className="text-xs text-slate-500 dark:text-white/60">{option.description}</p>
            </div>

            {/* Hover effect */}
            {visibility !== option.id && (
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-10 bg-white transition-opacity pointer-events-none" />
            )}
          </button>
        ))}
      </div>

      {/* Current setting info */}
      <div className="p-4 bg-white dark:bg-white/5 shadow-sm dark:shadow-none border border-slate-200 dark:border-white/10 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="text-indigo-400 mt-1">
            {options.find(o => o.id === visibility)?.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Current: {options.find(o => o.id === visibility)?.label}
            </p>
            <p className="text-xs text-slate-500 dark:text-white/50 mt-1">
              {visibility === 'public' &&
                'Your reputation score and tier are visible to all users. This builds trust and credibility in the community.'}
              {visibility === 'tier_only' &&
                'Only your reputation tier badge is visible. Your exact score is kept private while still showing your achievement level.'}
              {visibility === 'private' &&
                'Your reputation is completely hidden from other users. You can still see your own stats anytime.'}
            </p>
          </div>
        </div>
      </div>

      {/* Note */}
      <p className="text-[11px] text-white/40 italic">
        Note: You can always see your own reputation score and history in your profile, regardless of your visibility setting.
      </p>
    </div>
  );
}
