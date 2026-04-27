import { useEffect, useState } from 'react';
import { FiAward, FiStar, FiX, FiSend, FiLoader } from 'react-icons/fi';
import { getEndorsements, submitEndorsement } from '../../api/endorsementApi';

/**
 * EndorsementPanel - Display and manage endorsements
 * Can be used in two modes:
 * 1. View mode: Display endorsements received for a user
 * 2. Give mode: Allow endorsement after a session
 */
export default function EndorsementPanel({ userId, viewMode = 'view', sessionId = null, partnerUserId = null, onEndorsementSent = null }) {
  const [endorsements, setEndorsements] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Fetch endorsements when component mounts
  useEffect(() => {
    fetchEndorsements();
  }, [userId]);

  const fetchEndorsements = async () => {
    try {
      setLoading(true);
      const data = await getEndorsements(userId);
      setEndorsements(data.bySkill || {});
    } catch (err) {
      setError('Failed to load endorsements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEndorsement = async () => {
    if (!selectedSkill.trim()) {
      setError('Please select a skill');
      return;
    }

    try {
      setSubmitting(true);
      await submitEndorsement(partnerUserId, selectedSkill, sessionId, message);
      setSelectedSkill('');
      setMessage('');
      setShowForm(false);
      fetchEndorsements();
      if (onEndorsementSent) onEndorsementSent();
    } catch (err) {
      setError('Failed to submit endorsement');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // View mode: Display endorsements received
  if (viewMode === 'view') {
    if (loading) {
      return (
        <div className="p-6 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none/40 border border-white/5 rounded-2xl">
          <div className="flex items-center justify-center py-8">
            <FiLoader className="text-indigo-400 animate-spin text-2xl" />
          </div>
        </div>
      );
    }

    const totalEndorsements = Object.values(endorsements).reduce((sum, arr) => sum + arr.length, 0);

    return (
      <div className="p-6 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none/40 border border-white/5 rounded-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <FiAward className="text-amber-400 text-xl" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Skill Endorsements</h3>
          {totalEndorsements > 0 && (
            <span className="ml-auto px-3 py-1 text-xs font-bold rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300">
              {totalEndorsements} total
            </span>
          )}
        </div>

        {/* Endorsements by Skill */}
        {totalEndorsements > 0 ? (
          <div className="space-y-4">
            {Object.entries(endorsements).map(([skill, endorserList]) => (
              <div key={skill} className="bg-slate-950/50 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <FiStar className="text-indigo-400" size={16} />
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{skill}</h4>
                  <span className="ml-auto text-xs font-bold text-indigo-300 bg-indigo-500/20 px-2 py-1 rounded-md">
                    {endorserList.length}
                  </span>
                </div>

                {/* Endorsers */}
                <div className="flex flex-wrap gap-2">
                  {endorserList.map((endorsement) => (
                    <div
                      key={endorsement._id}
                      className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-xs"
                      title={endorsement.message || ''}
                    >
                      {endorsement.endorserId?.profilePic ? (
                        <img
                          src={`/src/pages/images/${endorsement.endorserId.profilePic}`}
                          alt="Avatar"
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-indigo-400/20 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-indigo-300">
                            {endorsement.endorserId?.fullName?.[0] || '?'}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 dark:text-white">{endorsement.endorserId?.fullName}</span>
                        {endorsement.message && (
                          <span className="text-[10px] text-slate-500 dark:text-white/50 italic">{endorsement.message.slice(0, 30)}...</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FiStar className="text-white/20 text-3xl mx-auto mb-3" />
            <p className="text-slate-500 dark:text-white/50 text-sm">No endorsements yet. Great endorsements from peers boost your reputation!</p>
          </div>
        )}
      </div>
    );
  }

  // Give mode: Allow user to endorse a partner after session
  return (
    <div className="p-6 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-indigo-500/30 rounded-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <FiAward className="text-indigo-400 text-xl" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Endorse Your Partner</h3>
      </div>

      <p className="text-slate-500 dark:text-white/60 text-sm mb-6">
        Recognize your partner's skills and help build trust in the community!
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-2.5 px-4 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 rounded-xl text-indigo-300 font-semibold text-sm transition"
        >
          <FiStar className="inline mr-2" size={14} />
          Give Endorsement
        </button>
      ) : (
        <div className="space-y-4">
          {/* Skill Input */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-white/70 uppercase tracking-widest block mb-2">
              Select Skill
            </label>
            <input
              type="text"
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              placeholder="e.g., Python, Communication, Leadership..."
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-indigo-500/30 rounded-lg text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500/60 placeholder-white/30 transition"
            />
          </div>

          {/* Message Input */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-white/70 uppercase tracking-widest block mb-2">
              Optional Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a brief message about why you're endorsing this skill..."
              maxLength={500}
              rows={3}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-indigo-500/30 rounded-lg text-slate-900 dark:text-white text-sm outline-none focus:border-indigo-500/60 placeholder-white/30 resize-none transition"
            />
            <p className="text-[10px] text-white/40 mt-1 text-right">{message.length}/500</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowForm(false);
                setSelectedSkill('');
                setMessage('');
                setError('');
              }}
              disabled={submitting}
              className="flex-1 py-2 px-4 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-200 dark:border-white/10 rounded-lg text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white text-sm font-semibold transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitEndorsement}
              disabled={submitting || !selectedSkill.trim()}
              className="flex-1 py-2 px-4 bg-indigo-500 hover:bg-indigo-600 rounded-lg text-slate-900 dark:text-white text-sm font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <FiLoader className="animate-spin" size={14} />
                  Sending...
                </>
              ) : (
                <>
                  <FiSend size={14} />
                  Send Endorsement
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
