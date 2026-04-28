import { useEffect, useState, useCallback } from "react";
import {
  FiAward, FiStar, FiTrendingUp, FiUser, FiZap, FiX,
  FiCheckCircle, FiFilter, FiChevronDown, FiArrowUp, FiArrowDown,
  FiClock, FiCalendar, FiSearch, FiSliders, FiTarget, FiShield,
  FiActivity, FiNavigation, FiMoreHorizontal, FiUsers
} from "react-icons/fi";
import { getLeaderboard, getReputation } from "../../api/Reputation";
import axiosInstance from "../../api/axiosInstance";

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIODS = [
  { id: "all",     label: "All‑Time",  icon: <FiTarget size={13} /> },
  { id: "monthly", label: "Monthly",   icon: <FiCalendar size={13} /> },
  { id: "weekly",  label: "Weekly",    icon: <FiClock size={13} />    },
];

const SKILL_OPTIONS = [
  "All Skills", "Python", "Java", "C++", "JavaScript", "C#", "React", "Vue", "HTML/CSS", 
  "Angular", "Node.js", "Express", "Django", "Spring Boot", "MySQL", "PostgreSQL", 
  "MongoDB", "Firebase", "TensorFlow", "PyTorch", "Scikit-learn", "Figma", "Adobe XD", "Photoshop"
];

const DEPARTMENT_OPTIONS = [
  "All Departments", "Computer Science", "Electrical Engineering", "Mechanical Engineering",
  "Business Administration", "Design", "Mathematics", "Physics"
];

const SORT_OPTIONS = [
  { id: "score_desc",  label: "Score: High → Low", field: "score",       dir: -1 },
  { id: "score_asc",   label: "Score: Low → High", field: "score",       dir:  1 },
  { id: "badges_desc", label: "Most Badges",        field: "badgeCount",  dir: -1 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTier(score) {
  if (score >= 90) return { label: 'Elite', color: 'text-indigo-400', bg: 'bg-indigo-400/10', border: 'border-indigo-400/30' };
  if (score >= 70) return { label: 'Platinum', color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30' };
  if (score >= 50) return { label: 'Gold', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' };
  if (score >= 30) return { label: 'Silver', color: 'text-slate-300', bg: 'bg-slate-300/10', border: 'border-slate-300/30' };
  return { label: 'Bronze', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' };
}

function clientSort(list, sortId) {
  const opt = SORT_OPTIONS.find(o => o.id === sortId) || SORT_OPTIONS[0];
  return [...list].sort((a, b) => {
    if (opt.field === "score") return (b.score - a.score) * opt.dir * -1;
    if (opt.field === "badgeCount") return ((b.badges?.length ?? 0) - (a.badges?.length ?? 0)) * opt.dir * -1;
    return 0;
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const [allLeaders, setAllLeaders] = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const [period, setPeriod] = useState("all");
  const [skill, setSkill] = useState("All Skills");
  const [department, setDepartment] = useState("All Departments");
  const [sortId, setSortId] = useState("score_desc");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLeaderboard({
        period,
        skill: skill === "All Skills" ? undefined : skill,
        department: department === "All Departments" ? undefined : department,
      });
      setAllLeaders(data);
    } catch {
      setError("Failed to sync with global ranking servers.");
    } finally {
      setLoading(false);
    }
  }, [period, skill, department]);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  useEffect(() => {
    let result = allLeaders;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.userId?.fullName?.toLowerCase().includes(q) ||
        e.userId?.studentId?.toLowerCase().includes(q) ||
        e.userId?.department?.toLowerCase().includes(q)
      );
    }
    result = clientSort(result, sortId);
    setDisplayed(result);
  }, [allLeaders, sortId, search]);

  const activeFilterCount = [period !== "all", skill !== "All Skills", department !== "All Departments"].filter(Boolean).length;
  const topThree = displayed.slice(0, 3);
  const rest = displayed.slice(3);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
      <p className="text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px] animate-pulse">Syncing Leaderboard</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30">
      
      {/* ── IMMERSIVE HERO SECTION ── */}
      <div 
        className="relative pt-32 pb-20 px-6 overflow-hidden"
        style={{
          backgroundImage: "url('/leaderboard-hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed"
        }}
      >
        {/* Glassmorphic Overlays */}
        <div className="absolute inset-0 bg-[#020617]/70 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-[#020617]"></div>

        {/* Animated Background Orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/30 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full"></div>
        
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <FiAward className="animate-bounce" /> Hall of Excellence
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            Global <span className="bg-gradient-to-r from-indigo-400 via-white to-cyan-400 bg-clip-text text-transparent">Rankings</span>
          </h1>
          
          <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            Witness the elite contributors of the EduSpark community. Ranking is driven by real-world impact, session quality, and peer verification.
          </p>

          <div className="flex flex-wrap justify-center gap-6 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500">
            <StatCard label="Ranked Members" value={displayed.length} icon={<FiUsers />} color="indigo" />
            < StatCard label="Peak Momentum" value={topThree[0]?.score || 0} icon={<FiTrendingUp />} color="cyan" />
            <StatCard label="Verified Badges" value={displayed.reduce((acc, curr) => acc + (curr.badges?.length || 0), 0)} icon={<FiZap />} color="amber" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-32">
        
        {/* ── ELITE PODIUM (TOP 3) ── */}
        {topThree.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 items-end">
            {/* Rank 2 */}
            {topThree[1] && <ElitePodiumCard user={topThree[1]} rank={2} onView={() => setSelectedUser(topThree[1].userId)} />}
            {/* Rank 1 */}
            {topThree[0] && <ElitePodiumCard user={topThree[0]} rank={1} isMain onView={() => setSelectedUser(topThree[0].userId)} />}
            {/* Rank 3 */}
            {topThree[2] && <ElitePodiumCard user={topThree[2]} rank={3} onView={() => setSelectedUser(topThree[2].userId)} />}
          </div>
        )}

        {/* ── FILTER & SEARCH HUB ── */}
        <div className="bg-slate-900/40 border border-white/5 backdrop-blur-xl rounded-[2.5rem] p-4 mb-10 shadow-2xl shadow-indigo-500/5">
          <div className="flex flex-wrap items-center gap-4">
            
            {/* Period Toggle */}
            <div className="flex p-1.5 bg-slate-950 rounded-2xl border border-white/5">
              {PERIODS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                    period === p.id ? "bg-indigo-500 text-white shadow-xl shadow-indigo-500/20" : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {p.icon} {p.label}
                </button>
              ))}
            </div>

            {/* Global Search */}
            <div className="flex-1 min-w-[200px] relative">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Find talent by name or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-950/50 border border-white/5 rounded-2xl text-sm outline-none focus:border-indigo-500/50 transition-all font-medium"
              />
            </div>

            {/* Filter Trigger */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl border font-bold text-xs uppercase tracking-widest transition-all ${
                filtersOpen || activeFilterCount > 0 ? "bg-indigo-500 text-white border-indigo-400" : "bg-slate-950 border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <FiSliders /> Filters {activeFilterCount > 0 && <span className="ml-1 px-1.5 bg-white text-black rounded-full">{activeFilterCount}</span>}
            </button>
          </div>

          {/* Advanced Filters Drawer */}
          {filtersOpen && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5 animate-in slide-in-from-top-4 duration-300">
              <AdvancedSelect label="Filter by Skill" options={SKILL_OPTIONS} value={skill} onChange={setSkill} />
              <AdvancedSelect label="Filter by Dept" options={DEPARTMENT_OPTIONS} value={department} onChange={setDepartment} />
              <div className="flex flex-col justify-end">
                <button 
                  onClick={() => { setSkill("All Skills"); setDepartment("All Departments"); }}
                  className="py-3 px-6 rounded-xl border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── THE MASTER LIST ── */}
        <div className="bg-slate-900/20 rounded-[3rem] border border-white/5 overflow-hidden backdrop-blur-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                <th className="py-6 px-10">Rank</th>
                <th className="py-6 px-4">Contributor</th>
                <th className="py-6 px-4 hidden lg:table-cell">Tier Status</th>
                <th className="py-6 px-4 hidden md:table-cell">Badges</th>
                <th className="py-6 px-4 text-right">Reputation</th>
                <th className="py-6 px-10 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rest.map((entry, idx) => (
                <ContributorRow 
                  key={entry._id} 
                  entry={entry} 
                  rank={idx + 4} 
                  onView={() => setSelectedUser(entry.userId)} 
                />
              ))}
            </tbody>
          </table>

          {displayed.length === 0 && (
            <div className="py-20 text-center">
              <FiSearch size={48} className="mx-auto mb-4 text-slate-700" />
              <h3 className="text-lg font-bold text-slate-400 mb-1">No contributors found</h3>
              <p className="text-sm text-slate-600">Try adjusting your skill or period filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── PUBLIC PERFORMANCE CARD (MODAL) ── */}
      {selectedUser && (
        <PerformanceCardModal userObj={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}

// ─── Stat Sub-components ───────────────────────────────────────────────────

function StatCard({ label, value, icon, color }) {
  const colors = {
    indigo: "from-indigo-500/20 to-indigo-500/5 text-indigo-400 border-indigo-500/20",
    cyan: "from-cyan-500/20 to-cyan-500/5 text-cyan-400 border-cyan-500/20",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-400 border-amber-500/20"
  };
  return (
    <div className={`px-8 py-5 rounded-3xl bg-gradient-to-br ${colors[color]} border backdrop-blur-xl min-w-[200px]`}>
      <div className="flex items-center gap-3 mb-1">
        <span className="opacity-50">{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-widest opacity-80">{label}</span>
      </div>
      <div className="text-3xl font-black tracking-tighter text-white">{value}</div>
    </div>
  );
}

// ─── Elite Podium Card ────────────────────────────────────────────────────

function ElitePodiumCard({ user, rank, isMain, onView }) {
  const tier = getTier(user.score);
  const rankMeta = {
    1: { color: "from-amber-400 to-orange-500", label: "Champion", icon: <FiAward /> },
    2: { color: "from-slate-300 to-slate-500", label: "Finalist", icon: <FiTrendingUp /> },
    3: { color: "from-orange-500 to-red-600", label: "Elite", icon: <FiZap /> }
  };

  return (
    <div className={`relative group ${isMain ? "scale-110 z-10" : "scale-100 opacity-90"} transition-all duration-500`}>
      <div className={`absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all group-hover:-translate-y-2`}>
        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${rankMeta[rank].color} flex items-center justify-center text-xl text-black font-black shadow-2xl shadow-indigo-500/20 border-4 border-[#020617]`}>
          {rankMeta[rank].icon}
        </div>
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">{rankMeta[rank].label}</span>
      </div>

      <div className={`pt-10 pb-8 px-8 rounded-[3rem] bg-slate-900/60 border ${isMain ? "border-indigo-500/30" : "border-white/5"} backdrop-blur-2xl text-center group-hover:bg-slate-900 transition-all`}>
        <div className="w-24 h-24 mx-auto rounded-full bg-slate-950 border-2 border-white/5 overflow-hidden mb-6 group-hover:scale-105 transition-all shadow-2xl shadow-black/40">
          {user.userId?.profilePic ? (
             <img src={`/src/pages/images/${user.userId.profilePic}`} className="w-full h-full object-cover" />
          ) : (
            <FiUser className="w-full h-full p-6 text-slate-700" />
          )}
        </div>

        <h3 className="text-xl font-black tracking-tight text-white mb-1">{user.userId?.fullName || "Contributor"}</h3>
        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-4">{user.userId?.department || "Unassigned"}</p>

        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${tier.bg} ${tier.border} ${tier.color} text-[10px] font-black uppercase tracking-widest mb-6`}>
           <FiShield size={10} /> {tier.label}
        </div>

        <div className="flex justify-between items-end gap-2 mb-8">
           <div className="text-left">
              <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Global Rep</span>
              <span className="text-3xl font-black text-white font-mono">{user.score}</span>
           </div>
           <div className="text-right">
              <span className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Badges</span>
              <span className="text-xl font-bold text-indigo-400 font-mono">{user.badges?.length || 0}</span>
           </div>
        </div>

        <button 
          onClick={onView}
          className="w-full py-4 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          View Performance
        </button>
      </div>
    </div>
  );
}

// ─── Contributor Row ──────────────────────────────────────────────────────

function ContributorRow({ entry, rank, onView }) {
  const tier = getTier(entry.score);
  return (
    <tr className="group hover:bg-white/5 transition-all cursor-pointer" onClick={onView}>
      <td className="py-8 px-10">
        <span className="font-mono text-xl font-black text-slate-700 group-hover:text-indigo-500 transition-colors">
          #{String(rank).padStart(2, "0")}
        </span>
      </td>
      <td className="py-8 px-4">
        <div className="flex items-center gap-5">
           <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-white/5 overflow-hidden group-hover:scale-110 transition-all">
             {entry.userId?.profilePic ? (
                <img src={`/src/pages/images/${entry.userId.profilePic}`} className="w-full h-full object-cover" />
             ) : (
                <FiUser className="w-full h-full p-3 text-slate-800" />
             )}
           </div>
           <div>
              <div className="text-base font-black text-white tracking-tight">{entry.userId?.fullName}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{entry.userId?.studentId}</div>
           </div>
        </div>
      </td>
      <td className="py-8 px-4 hidden lg:table-cell">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg ${tier.bg} ${tier.border} ${tier.color} text-[9px] font-black uppercase tracking-widest`}>
          <FiShield size={10} /> {tier.label}
        </span>
      </td>
      <td className="py-8 px-4 hidden md:table-cell">
        <div className="flex gap-1.5">
           {entry.badges?.slice(0, 2).map((b, i) => (
             <span key={i} className="px-2 py-1 bg-white/5 rounded-md text-[9px] text-slate-400 uppercase font-bold">{b}</span>
           ))}
           {entry.badges?.length > 2 && <span className="text-[9px] text-slate-600">+{entry.badges.length - 2}</span>}
        </div>
      </td>
      <td className="py-8 px-4 text-right">
        <span className="text-2xl font-black text-white font-mono">{entry.score}</span>
      </td>
      <td className="py-8 px-10 text-right">
        <button className="p-3 rounded-2xl bg-slate-950 border border-white/5 text-slate-500 hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
          <FiMoreHorizontal />
        </button>
      </td>
    </tr>
  );
}

// ─── Filter Sub-components ────────────────────────────────────────────────

function AdvancedSelect({ label, options, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2">{label}</label>
      <div className="relative">
        <select 
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none bg-slate-950 border border-white/10 rounded-2xl px-5 py-3 text-sm text-slate-300 outline-none focus:border-indigo-500/50 transition-all"
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
      </div>
    </div>
  );
}

// ─── Performance Card Modal ───────────────────────────────────────────────

function PerformanceCardModal({ userObj, onClose }) {
  const [rep, setRep] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!userObj) return null;

  useEffect(() => {
    async function fetchData() {
      try {
        setError(null);
        const [repData, skillsRes] = await Promise.all([
          getReputation(userObj._id),
          axiosInstance.get(`/ratings/skills/${userObj._id}`)
        ]);
        setRep(repData);
        setSkills(skillsRes.data);
      } catch (e) {
        console.error("Link error with ranking servers", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userObj._id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-white/10 w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-all z-10">
          <FiX size={20} />
        </button>

        {loading ? (
          <div className="py-40 text-center flex flex-col items-center">
             <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 animate-pulse">Syncing Perf Metrics</p>
          </div>
        ) : error ? (
          <div className="py-40 text-center flex flex-col items-center">
             <FiX size={48} className="mx-auto mb-4 text-red-500" />
             <p className="text-base font-bold text-slate-900 dark:text-white mb-2">Failed to load performance data</p>
             <p className="text-sm text-slate-700 dark:text-white/50">{error}</p>
             <button onClick={onClose} className="mt-6 px-6 py-2 bg-indigo-500 text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-all">
               Close
             </button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row h-full">
            
            {/* Sidebar Stats */}
            <div className="w-full md:w-80 bg-slate-950 p-10 border-r border-white/5 flex flex-col items-center text-center">
               <div className="w-32 h-32 rounded-full border-4 border-indigo-500/20 p-1 mb-6 relative group">
                  <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden shadow-2xl">
                     {userObj.profilePic ? (
                        <img src={`/src/pages/images/${userObj.profilePic}`} alt={userObj.fullName} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                     ) : (
                        <FiUser className="w-full h-full p-8 text-slate-400" />
                     )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-xl">
                     <FiAward />
                  </div>
               </div>
               
               <h2 className="text-2xl font-black tracking-tight text-white mb-1">{userObj.fullName}</h2>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-loose mb-2">
                  {userObj.studentId} &bull; {userObj.role}
               </p>
               <div className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest mb-10">
                  {userObj.department || "No Department"}
               </div>

               <div className="w-full space-y-4">
                  <MiniStat icon={<FiStar className="text-amber-500" />} label="Overall Score" value={rep?.score || 0} />
                  <MiniStat icon={<FiShield className="text-indigo-600 dark:text-indigo-400" />} label="Tier Status" value={rep?.score ? getTier(rep.score).label : "Unknown"} />
                  <MiniStat icon={<FiZap className="text-cyan-500" />} label="Endorsements" value={rep?.endorsementCount || 0} />
               </div>
            </div>

            {/* Main Skills Analytics */}
            <div className="flex-1 p-10 overflow-y-auto max-h-[70vh] scrollbar-hide bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                   <FiActivity className="text-indigo-500" /> Skill Competencies
                 </h3>
                 <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Index</div>
              </div>

              <div className="grid gap-4">
                {rep?.categoryScores && rep.categoryScores.length > 0 ? (
                  rep.categoryScores.map((cs, i) => (
                    <div key={i} className="p-6 bg-white/5 border border-white/5 rounded-3xl group hover:border-indigo-500/30 transition-all">
                       <div className="flex justify-between items-start mb-6">
                          <div>
                             <div className="text-white font-black text-base uppercase tracking-tight mb-1">{cs.skillName}</div>
                             <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Metric Analysis</div>
                          </div>
                          <div className="text-3xl font-black text-indigo-700 dark:text-indigo-400 font-mono">{cs.overallAvg.toFixed(1)}</div>
                       </div>
                       
                       <div className="grid grid-cols-3 gap-6">
                            <SmallBar label="Clarity" value={cs.avgClarity} color="blue" />
                            <SmallBar label="Logic" value={cs.avgLogic} color="cyan" />
                            <SmallBar label="Comm." value={cs.avgCommunication} color="indigo" />
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="py-20 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10">
                    <FiNavigation size={32} className="mx-auto mb-4 text-slate-700" />
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">No Verified Metrics Yet</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

function MiniStat({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl w-full">
       <div className="flex items-center gap-3">
          {icon}
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</span>
       </div>
       <span className="text-sm font-black text-white font-mono">{value}</span>
    </div>
  );
}

function SmallBar({ label, value = 0, color }) {
  const colors = {
     blue: "bg-blue-600",
     cyan: "bg-cyan-600",
     indigo: "bg-indigo-600"
  };
  const displayValue = typeof value === 'number' ? value : 0;
  return (
    <div>
       <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-500 mb-2">
          <span>{label}</span>
          <span className="text-slate-700 dark:text-slate-300 font-mono">{displayValue.toFixed(1)}</span>
       </div>
       <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
          <div className={`h-full ${colors[color]} rounded-full transition-all duration-1000`} style={{ width: `${(value/5)*100}%` }}></div>
       </div>
    </div>
  );
}