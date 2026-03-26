import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiAward, FiStar, FiTrendingUp, FiUser, FiZap, FiX, FiCheckCircle } from "react-icons/fi";
import { getLeaderboard, getReputation } from "../../api/Reputation";
import axiosInstance from "../../api/axiosInstance";

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await getLeaderboard();
        setLeaders(data);
      } catch (err) {
        setError("Failed to load leaderboard.");
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-white flex flex-col items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-white/50 text-sm animate-pulse">Loading top contributors...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-white">
        <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/10 text-center">
          <p className="text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  const topThree = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 text-white fade-up">
      {/* Header section */}
      <div className="text-center mb-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/20 blur-[120px] rounded-full point-events-none -z-10" />
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-4">
          <FiTrendingUp className="text-indigo-400" />
          Community Leaders
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-linear-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
          Global Leaderboard
        </h1>
        <p className="mt-4 text-white/60 max-w-lg mx-auto">
          Recognizing our most outstanding and helpful campus members based on contribution clarity, effort, and communication.
        </p>
      </div>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end pt-10">
          {/* 2nd Place */}
          {topThree[1] && <PodiumCard user={topThree[1]} rank={2} onViewStats={() => setSelectedUser(topThree[1].userId)} />}
          {/* 1st Place */}
          {topThree[0] && <PodiumCard user={topThree[0]} rank={1} className="md:-mt-10 md:scale-105 z-10" onViewStats={() => setSelectedUser(topThree[0].userId)} />}
          {/* 3rd Place */}
          {topThree[2] && <PodiumCard user={topThree[2]} rank={3} onViewStats={() => setSelectedUser(topThree[2].userId)} />}
        </div>
      )}

      {/* Rest of the list */}
      {rest.length > 0 && (
        <div className="bg-slate-950/40 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl">
          <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-white/40">
            <div className="flex-[0.5]">Rank</div>
            <div className="flex-[3]">Member</div>
            <div className="flex-[2] hidden md:block">Badges</div>
            <div className="flex-[1] text-right">Score</div>
            <div className="flex-[0.5] text-right ml-4">Action</div>
          </div>
          <div className="divide-y divide-white/5">
            {rest.map((entry, idx) => (
              <ListRow key={entry._id} entry={entry} rank={idx + 4} onViewStats={() => setSelectedUser(entry.userId)} />
            ))}
          </div>
        </div>
      )}

      {leaders.length === 0 && (
        <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl">
          <FiStar className="text-4xl text-white/20 mx-auto mb-4" />
          <p className="text-white/50">No leaderboard data available yet.</p>
        </div>
      )}

      {/* Public Profile Modal */}
      {selectedUser && (
        <PublicProfileModal userObj={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}

// Subcomponents

function PodiumCard({ user, rank, className = "", onViewStats }) {
  const isFirst = rank === 1;
  const rankColors = {
    1: "from-amber-400 via-amber-200 to-amber-500 shadow-amber-500/20 text-yellow-900 border-amber-300/50",
    2: "from-slate-300 via-slate-100 to-slate-400 shadow-slate-400/10 text-slate-800 border-slate-300/40",
    3: "from-orange-400 via-orange-300 to-orange-600 shadow-orange-500/10 text-orange-950 border-orange-400/40",
  };

  const bgStyle = rankColors[rank];
  const { userId, score, badges } = user;
  const name = userId?.fullName || "Unknown Member";

  return (
    <div className={`relative flex flex-col items-center p-6 rounded-3xl border border-white/10 bg-linear-to-b from-white/10 to-white/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:bg-white/10 ${className}`}>
      {/* Medal Icon/Rank */}
      <div className={`absolute -top-6 w-12 h-12 flex items-center justify-center rounded-full bg-linear-to-br ${bgStyle} border shadow-xl font-bold text-lg`}>
        {isFirst ? <FiAward className="text-2xl" /> : `#${rank}`}
      </div>

      <div className="w-20 h-20 mt-4 rounded-full bg-slate-800 border-2 border-white/10 flex items-center justify-center overflow-hidden mb-4 shadow-xl">
        {userId?.profilePic ? (
          <img src={`/src/pages/images/${userId.profilePic}`} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <FiUser className="text-3xl text-white/20" />
        )}
      </div>

      <h3 className="font-semibold text-lg text-center leading-tight line-clamp-1 truncate w-full" title={name}>
        {name}
      </h3>
      <p className="text-white/40 text-xs mt-1">{userId?.studentId}</p>

      <div className="mt-5 w-full bg-slate-950/50 rounded-2xl p-3 text-center border border-white/5 mb-3">
        <div className="text-xs text-white/50 uppercase tracking-widest mb-1">Score</div>
        <div className="text-2xl font-bold bg-linear-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">
          {score}
        </div>
      </div>
      
      <button 
        onClick={onViewStats} 
        className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition border border-white/10"
      >
        View Stats
      </button>
      
      {badges && badges.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
          {badges.slice(0, 2).map((b) => (
            <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 whitespace-nowrap">
              {b}
            </span>
          ))}
          {badges.length > 2 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/50">
              +{badges.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function ListRow({ entry, rank, onViewStats }) {
  const { userId, score, badges } = entry;
  const name = userId?.fullName || "Unknown";

  return (
    <div className="flex items-center px-6 py-4 hover:bg-white/5 transition-colors group">
      <div className="flex-[0.5] font-mono text-white/40 group-hover:text-white/80 transition-colors">
        {String(rank).padStart(2, '0')}
      </div>
      
      <div className="flex-[3] flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shadow-md">
          {userId?.profilePic ? (
            <img src={`/src/pages/images/${userId.profilePic}`} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <FiUser className="text-white/40 text-lg" />
          )}
        </div>
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-xs text-white/40">{userId?.studentId}</div>
        </div>
      </div>

      <div className="flex-[2] hidden md:flex items-center gap-2">
        {badges?.map((b) => (
          <span key={b} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-white/5 border border-white/5 text-white/60">
            <FiZap className="text-amber-400/70" /> {b}
          </span>
        ))}
      </div>

      <div className="flex-[1] text-right">
        <span className="font-mono text-lg font-semibold text-indigo-300">{score}</span>
      </div>

      <div className="flex-[0.5] text-right ml-4">
        <button 
          onClick={onViewStats} 
          className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 text-[10px] uppercase tracking-wider font-bold rounded-lg transition"
        >
          Stats
        </button>
      </div>
    </div>
  );
}

function PublicProfileModal({ userObj, onClose }) {
  const [rep, setRep] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [repData, skillsRes] = await Promise.all([
          getReputation(userObj._id),
          axiosInstance.get(`/ratings/skills/${userObj._id}`)
        ]);
        setRep(repData);
        setSkills(skillsRes.data);
      } catch (e) {
        console.error("Failed to load public stats", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userObj._id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white z-10 bg-slate-800 p-2 rounded-full">
          <FiX size={20} />
        </button>
        
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin"></div>
            <p className="text-slate-400 mt-4 text-sm animate-pulse">Loading Member Stats...</p>
          </div>
        ) : (
          <div className="p-8">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-800">
              <div className="w-16 h-16 bg-slate-800 border-2 border-slate-700 text-indigo-300 rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden shadow-xl shrink-0">
                {userObj.profilePic ? (
                  <img src={`/src/pages/images/${userObj.profilePic}`} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  userObj.fullName.charAt(0)
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{userObj.fullName}</h2>
                <p className="text-slate-400 text-sm flex items-center gap-2">
                  <span>{userObj.role}</span> &bull; <span>{userObj.studentId}</span>
                </p>
                {rep?.badges && rep.badges.length > 0 && (
                  <div className="flex gap-1.5 mt-2">
                    {rep.badges.map(b => (
                      <span key={b} className="text-[9px] px-2 py-0.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 uppercase tracking-widest">{b}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="ml-auto text-center bg-slate-950 p-3 rounded-2xl border border-slate-800 hidden sm:block">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Score</div>
                <div className="text-3xl font-mono font-bold text-emerald-400">{rep?.score || '--'}</div>
              </div>
            </div>

            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Skill Proficiencies & Averages</h3>
            
            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
              {rep?.categoryScores?.length === 0 ? (
                <div className="text-slate-500 text-center py-8 text-sm italic border border-dashed border-slate-800 rounded-xl">No rated skills formally recorded on tasks yet.</div>
              ) : (
                rep?.categoryScores?.map(cs => {
                  const matchingSkill = skills.find(s => s.skill === cs.skillName);
                  const isVerified = matchingSkill?.isVerified;

                  return (
                    <div key={cs.skillName} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700 hover:bg-slate-800/80 transition">
                      <div className="flex items-center gap-2 mb-2 sm:mb-0">
                        <div className="font-semibold text-white">{cs.skillName}</div>
                        {isVerified && <FiCheckCircle className="text-emerald-400" title="Verified Skill" size={14} />}
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] text-slate-500 uppercase">Clarity</span>
                          <span className="text-xs font-mono font-bold text-blue-300">{cs.avgClarity.toFixed(1)}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-[9px] text-slate-500 uppercase">Comm.</span>
                          <span className="text-xs font-mono font-bold text-violet-300">{cs.avgCommunication.toFixed(1)}</span>
                        </div>
                        <div className="flex flex-col items-center bg-slate-900 border border-slate-700 px-3 py-1 rounded-lg shadow-inner">
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest">Average</span>
                          <span className="text-sm font-mono font-bold text-amber-400">{cs.overallAvg.toFixed(1)} ⭐</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
