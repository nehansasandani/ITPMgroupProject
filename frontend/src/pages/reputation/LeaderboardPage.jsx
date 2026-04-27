import { useEffect, useState, useCallback } from "react";
import {
  FiAward, FiStar, FiTrendingUp, FiUser, FiZap, FiX,
  FiCheckCircle, FiFilter, FiChevronDown, FiArrowUp, FiArrowDown,
  FiClock, FiCalendar, FiSearch, FiSliders
} from "react-icons/fi";
// import { AiOutlineInfinity } from "react-icons/ai";
import { getLeaderboard, getReputation } from "../../api/Reputation";
import axiosInstance from "../../api/axiosInstance";

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIODS = [
  { id: "all",     label: "All‑Time",  icon: <span style={{fontSize:13,lineHeight:0}}>&#8734;</span> },
  { id: "monthly", label: "Monthly",   icon: <FiCalendar size={13} /> },
  { id: "weekly",  label: "Weekly",    icon: <FiClock size={13} />    },
];

const SKILL_OPTIONS = [
  "All Skills",
  "Python", "Java", "C++", "JavaScript", "C#",
  "React", "Vue", "HTML/CSS", "Angular",
  "Node.js", "Express", "Django", "Spring Boot",
  "MySQL", "PostgreSQL", "MongoDB", "Firebase",
  "TensorFlow", "PyTorch", "Scikit-learn",
  "Figma", "Adobe XD", "Photoshop",
];

const DEPARTMENT_OPTIONS = [
  "All Departments",
  "Computer Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Business Administration",
  "Design",
  "Mathematics",
  "Physics",
];

const SORT_OPTIONS = [
  { id: "score_desc",  label: "Score: High → Low", field: "score",       dir: -1 },
  { id: "score_asc",   label: "Score: Low → High", field: "score",       dir:  1 },
  { id: "badges_desc", label: "Most Badges",        field: "badgeCount",  dir: -1 },
  { id: "name_asc",    label: "Name A → Z",         field: "name",        dir:  1 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clientSort(list, sortId) {
  const opt = SORT_OPTIONS.find(o => o.id === sortId);
  if (!opt) return list;
  return [...list].sort((a, b) => {
    if (opt.field === "score")      return (b.score - a.score) * opt.dir * -1;
    if (opt.field === "badgeCount") return ((b.badges?.length ?? 0) - (a.badges?.length ?? 0)) * opt.dir * -1;
    if (opt.field === "name") {
      const na = a.userId?.fullName ?? "";
      const nb = b.userId?.fullName ?? "";
      return na.localeCompare(nb) * opt.dir;
    }
    return 0;
  });
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const [allLeaders, setAllLeaders]     = useState([]);
  const [displayed, setDisplayed]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  // Filter state
  const [period, setPeriod]           = useState("all");
  const [skill, setSkill]             = useState("All Skills");
  const [department, setDepartment]   = useState("All Departments");
  const [sortId, setSortId]           = useState("score_desc");
  const [search, setSearch]           = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      // Pass query params to backend — see "Backend Changes" notes at bottom
      const data = await getLeaderboard({
        period,
        skill:      skill      === "All Skills"       ? undefined : skill,
        department: department === "All Departments"  ? undefined : department,
      });
      setAllLeaders(data);
    } catch {
      setError("Failed to load leaderboard.");
    } finally {
      setLoading(false);
    }
  }, [period, skill, department]);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  // ── Client-side sort + search ───────────────────────────────────────────────

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

  // ── States ──────────────────────────────────────────────────────────────────

  const activeFilterCount = [
    period !== "all",
    skill !== "All Skills",
    department !== "All Departments",
  ].filter(Boolean).length;

  const topThree = displayed.slice(0, 3);
  const rest     = displayed.slice(3);

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-slate-900 dark:text-white flex flex-col items-center justify-center min-h-[60vh]">
      <div className="h-10 w-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      <p className="mt-4 text-slate-500 dark:text-white/50 text-sm animate-pulse">Loading top contributors…</p>
    </div>
  );

  if (error) return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-slate-900 dark:text-white">
      <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/10 text-center">
        <p className="text-red-200">{error}</p>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Hero Section with Background Image ──────────────────────────── */}
      <div 
        className="relative w-screen -ml-[calc((100vw-100%)/2)] mb-0 overflow-hidden"
        style={{
          backgroundImage: "url('/leaderboard-hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Blur + Dark Overlay */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 py-20 md:py-32 text-center">
          {/* Glow Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-indigo-500/30 blur-[150px] rounded-full pointer-events-none -z-10" />
          
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-indigo-400/40 bg-indigo-500/15 backdrop-blur-sm text-indigo-300 text-sm font-bold mb-6 shadow-lg shadow-indigo-500/20">
            <FiAward className="text-indigo-400 text-lg" />
            RECOGNITION & EXCELLENCE
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black tracking-tight leading-tight mb-6">
            <span className="bg-gradient-to-r from-white via-indigo-100 to-blue-200 bg-clip-text text-transparent">
              Global Leaderboard
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-slate-700 dark:text-white/80 max-w-2xl mx-auto leading-relaxed font-light mb-8">
            Celebrating our community's brightest talents. Discover exceptional members ranked by clarity, effort, communication, and real-world impact across campus.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="px-6 py-3 bg-indigo-500/20 border border-indigo-400/40 rounded-xl backdrop-blur-sm">
              <div className="text-indigo-300 text-xs font-bold uppercase tracking-widest mb-1">Active Members</div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{displayed.length}</div>
            </div>
            <div className="px-6 py-3 bg-purple-500/20 border border-purple-400/40 rounded-xl backdrop-blur-sm">
              <div className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-1">Top Performer</div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{topThree[0]?.userId?.fullName?.split(" ")[0] || "—"}</div>
            </div>
            <div className="px-6 py-3 bg-cyan-500/20 border border-cyan-400/40 rounded-xl backdrop-blur-sm">
              <div className="text-cyan-300 text-xs font-bold uppercase tracking-widest mb-1">Highest Score</div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{topThree[0]?.score || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-10 text-slate-900 dark:text-white fade-up">

      {/* ── Filter Bar ────────────────────────────────────────────────────── */}
      <div className="mb-8 space-y-3">

        {/* Period Tabs + Search + Filter Toggle */}
        <div className="flex flex-wrap items-center gap-3">

          {/* Period Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-200 dark:border-white/10 rounded-xl">
            {PERIODS.map(p => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  period === p.id
                    ? "bg-indigo-500 text-slate-900 dark:text-white shadow-lg shadow-indigo-500/20"
                    : "text-white/40 hover:text-slate-600 dark:hover:text-white/70"
                }`}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 min-w-[180px] relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or ID…"
              className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-200 dark:border-white/10 rounded-xl text-sm text-slate-900 dark:text-white placeholder-white/30 outline-none focus:border-indigo-500/50 transition"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-slate-900 dark:hover:text-white transition">
                <FiX size={14} />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <SortDropdown value={sortId} onChange={setSortId} />

          {/* Filter Toggle */}
          <button
            onClick={() => setFiltersOpen(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
              filtersOpen || activeFilterCount > 0
                ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-300"
                : "bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FiSliders size={13} />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-0.5 w-4 h-4 flex items-center justify-center bg-indigo-500 text-slate-900 dark:text-white rounded-full text-[9px] font-black">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Expandable Advanced Filters */}
        {filtersOpen && (
          <div className="flex flex-wrap gap-3 p-4 bg-slate-950/60 border border-white/5 rounded-2xl animate-in slide-in-from-top-2 duration-200">

            <FilterSelect
              label="Skill"
              value={skill}
              options={SKILL_OPTIONS}
              onChange={setSkill}
            />

            <FilterSelect
              label="Department"
              value={department}
              options={DEPARTMENT_OPTIONS}
              onChange={setDepartment}
            />

            {/* Clear all */}
            {activeFilterCount > 0 && (
              <button
                onClick={() => { setPeriod("all"); setSkill("All Skills"); setDepartment("All Departments"); }}
                className="self-end px-4 py-2 text-xs font-bold text-red-400 border border-red-500/20 bg-red-500/5 rounded-xl hover:bg-red-500/10 transition"
              >
                Clear All
              </button>
            )}
          </div>
        )}

        {/* Active filter pills */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {period !== "all" && (
              <FilterPill label={PERIODS.find(p => p.id === period)?.label} onRemove={() => setPeriod("all")} />
            )}
            {skill !== "All Skills" && (
              <FilterPill label={`Skill: ${skill}`} onRemove={() => setSkill("All Skills")} />
            )}
            {department !== "All Departments" && (
              <FilterPill label={department} onRemove={() => setDepartment("All Departments")} />
            )}
          </div>
        )}
      </div>

      {/* ── Result count ──────────────────────────────────────────────────── */}
      {!loading && (
        <div className="text-xs text-white/30 font-medium mb-6 uppercase tracking-widest">
          Showing {displayed.length} member{displayed.length !== 1 ? "s" : ""}
          {search && ` for "${search}"`}
        </div>
      )}

      {/* ── Top 3 Podium ──────────────────────────────────────────────────── */}
      {topThree.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end pt-10">
          {topThree[1] && <PodiumCard user={topThree[1]} rank={2} onViewStats={() => setSelectedUser(topThree[1].userId)} />}
          {topThree[0] && <PodiumCard user={topThree[0]} rank={1} className="md:-mt-10 md:scale-105 z-10" onViewStats={() => setSelectedUser(topThree[0].userId)} />}
          {topThree[2] && <PodiumCard user={topThree[2]} rank={3} onViewStats={() => setSelectedUser(topThree[2].userId)} />}
        </div>
      )}

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      {rest.length > 0 && (
        <div className="bg-white dark:bg-slate-950/40 shadow-sm dark:shadow-none border border-white/5 rounded-3xl overflow-hidden backdrop-blur-xl">
          <div className="px-6 py-4 border-b border-white/5 bg-white dark:bg-white/5 shadow-sm dark:shadow-none flex items-center text-xs font-semibold uppercase tracking-wider text-white/40">
            <div className="flex-[0.5]">Rank</div>
            <div className="flex-[3]">Member</div>
            <div className="flex-[1.5] hidden md:block">Department</div>
            <div className="flex-[2] hidden md:block">Badges</div>
            <div className="flex-[1] text-right">Score</div>
            <div className="flex-[0.5] text-right ml-4">Action</div>
          </div>
          <div className="divide-y divide-white/5">
            {rest.map((entry, idx) => (
              <ListRow
                key={entry._id}
                entry={entry}
                rank={idx + 4}
                onViewStats={() => setSelectedUser(entry.userId)}
                searchQuery={search}
              />
            ))}
          </div>
        </div>
      )}

      {displayed.length === 0 && !loading && (
        <div className="text-center py-20 bg-white dark:bg-white/5 shadow-sm dark:shadow-none border border-slate-200 dark:border-white/10 rounded-3xl">
          <FiStar className="text-4xl text-white/20 mx-auto mb-4" />
          <p className="text-slate-500 dark:text-white/50">No results match your filters.</p>
          <button
            onClick={() => { setPeriod("all"); setSkill("All Skills"); setDepartment("All Departments"); setSearch(""); }}
            className="mt-4 text-indigo-400 text-sm underline underline-offset-2"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* ── Modal ─────────────────────────────────────────────────────────── */}
      {selectedUser && (
        <PublicProfileModal userObj={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
      </div>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterSelect({ label, value, options, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="appearance-none bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm rounded-xl px-4 py-2.5 pr-9 outline-none focus:border-indigo-500/50 transition cursor-pointer min-w-[160px]"
        >
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={14} />
      </div>
    </div>
  );
}

function SortDropdown({ value, onChange }) {
  const current = SORT_OPTIONS.find(o => o.id === value);
  return (
    <div className="relative">
      <div className="relative">
        <FiArrowUp className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={12} />
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="appearance-none bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 text-xs rounded-xl pl-8 pr-8 py-2.5 outline-none focus:border-indigo-500/50 transition cursor-pointer font-semibold uppercase tracking-wider"
        >
          {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" size={12} />
      </div>
    </div>
  );
}

function FilterPill({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
      {label}
      <button onClick={onRemove} className="hover:text-slate-900 dark:hover:text-white transition">
        <FiX size={10} />
      </button>
    </span>
  );
}

function highlightMatch(text = "", query = "") {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-indigo-500/30 text-indigo-200 rounded px-0.5">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function PodiumCard({ user, rank, className = "", onViewStats }) {
  const isFirst = rank === 1;
  const rankColors = {
    1: "from-amber-400 via-amber-200 to-amber-500 shadow-amber-500/20 text-yellow-900 border-amber-300/50",
    2: "from-slate-300 via-slate-100 to-slate-400 shadow-slate-400/10 text-slate-800 border-slate-300/40",
    3: "from-orange-400 via-orange-300 to-orange-600 shadow-orange-500/10 text-orange-950 border-orange-400/40",
  };
  const { userId, score, badges } = user;
  const name = userId?.fullName || "Unknown Member";

  return (
    <div className={`relative flex flex-col items-center p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md transition-all duration-300 hover:-translate-y-2 hover:bg-slate-50 dark:hover:bg-white/10 hover:shadow-sm dark:hover:shadow-none ${className}`}>
      <div className={`absolute -top-6 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br ${rankColors[rank]} border shadow-xl font-bold text-lg`}>
        {isFirst ? <FiAward className="text-2xl" /> : `#${rank}`}
      </div>
      <div className="w-20 h-20 mt-4 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden mb-4 shadow-xl">
        {userId?.profilePic
          ? <img src={`/src/pages/images/${userId.profilePic}`} alt="Avatar" className="w-full h-full object-cover" />
          : <FiUser className="text-3xl text-white/20" />}
      </div>
      <h3 className="font-semibold text-lg text-center leading-tight line-clamp-1 truncate w-full" title={name}>{name}</h3>
      <p className="text-white/40 text-xs mt-1">{userId?.studentId}</p>
      {userId?.department && (
        <p className="text-white/30 text-[10px] mt-0.5 uppercase tracking-widest">{userId.department}</p>
      )}
      <div className="mt-5 w-full bg-slate-950/50 rounded-2xl p-3 text-center border border-white/5 mb-3">
        <div className="text-xs text-slate-500 dark:text-white/50 uppercase tracking-widest mb-1">Score</div>
        <div className="text-2xl font-bold bg-gradient-to-r from-indigo-300 to-cyan-300 bg-clip-text text-transparent">{score}</div>
      </div>
      <button onClick={onViewStats} className="w-full py-2 bg-white dark:bg-white/5 shadow-sm dark:shadow-none hover:bg-slate-50 dark:hover:bg-white/10 hover:shadow-sm dark:hover:shadow-none rounded-xl text-xs font-bold text-slate-900 dark:text-white transition border border-slate-200 dark:border-white/10">
        View Stats
      </button>
      {badges?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
          {badges.slice(0, 2).map(b => (
            <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 whitespace-nowrap">{b}</span>
          ))}
          {badges.length > 2 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-50 dark:bg-white/10 shadow-sm dark:shadow-none text-slate-500 dark:text-white/50">+{badges.length - 2}</span>
          )}
        </div>
      )}
    </div>
  );
}

function ListRow({ entry, rank, onViewStats, searchQuery }) {
  const { userId, score, badges } = entry;
  const name = userId?.fullName || "Unknown";

  return (
    <div className="flex items-center px-6 py-4 hover:bg-white dark:hover:bg-white/5 hover:shadow-sm dark:hover:shadow-none transition-colors group">
      <div className="flex-[0.5] font-mono text-white/40 group-hover:text-slate-700 dark:group-hover:text-white/80 transition-colors">
        {String(rank).padStart(2, "0")}
      </div>
      <div className="flex-[3] flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-white dark:bg-white/5 shadow-sm dark:shadow-none border border-slate-200 dark:border-white/10 flex items-center justify-center overflow-hidden shadow-md shrink-0">
          {userId?.profilePic
            ? <img src={`/src/pages/images/${userId.profilePic}`} alt="Avatar" className="w-full h-full object-cover" />
            : <FiUser className="text-white/40 text-lg" />}
        </div>
        <div>
          <div className="font-medium">{highlightMatch(name, searchQuery)}</div>
          <div className="text-xs text-white/40">{highlightMatch(userId?.studentId, searchQuery)}</div>
        </div>
      </div>
      <div className="flex-[1.5] hidden md:block">
        {userId?.department && (
          <span className="text-[10px] px-2 py-1 rounded-md bg-white dark:bg-white/5 shadow-sm dark:shadow-none border border-white/5 text-slate-500 dark:text-white/50 uppercase tracking-wider">
            {highlightMatch(userId.department, searchQuery)}
          </span>
        )}
      </div>
      <div className="flex-[2] hidden md:flex items-center gap-2">
        {badges?.map(b => (
          <span key={b} className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-white dark:bg-white/5 shadow-sm dark:shadow-none border border-white/5 text-slate-500 dark:text-white/60">
            <FiZap className="text-amber-400/70" /> {b}
          </span>
        ))}
      </div>
      <div className="flex-[1] text-right">
        <span className="font-mono text-lg font-semibold text-indigo-300">{score}</span>
      </div>
      <div className="flex-[0.5] text-right ml-4">
        <button onClick={onViewStats} className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 text-[10px] uppercase tracking-wider font-bold rounded-lg transition">
          Stats
        </button>
      </div>
    </div>
  );
}

function PublicProfileModal({ userObj, onClose }) {
  const [rep, setRep]       = useState(null);
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
      <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-700 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white z-10 bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
          <FiX size={20} />
        </button>
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin" />
            <p className="text-slate-400 mt-4 text-sm animate-pulse">Loading Member Stats…</p>
          </div>
        ) : (
          <div className="p-8">
            <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-800">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 border-2 border-slate-700 text-indigo-300 rounded-full flex items-center justify-center text-2xl font-bold overflow-hidden shadow-xl shrink-0">
                {userObj.profilePic
                  ? <img src={`/src/pages/images/${userObj.profilePic}`} alt="Avatar" className="w-full h-full object-cover" />
                  : userObj.fullName?.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{userObj.fullName}</h2>
                <p className="text-slate-400 text-sm flex items-center gap-2">
                  <span>{userObj.role}</span> &bull; <span>{userObj.studentId}</span>
                  {userObj.department && <><span>&bull;</span><span>{userObj.department}</span></>}
                </p>
                {rep?.badges?.length > 0 && (
                  <div className="flex gap-1.5 mt-2">
                    {rep.badges.map(b => (
                      <span key={b} className="text-[9px] px-2 py-0.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 uppercase tracking-widest">{b}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="ml-auto text-center bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-800 hidden sm:block">
                <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Score</div>
                <div className="text-3xl font-mono font-bold text-emerald-400">{rep?.score ?? "--"}</div>
              </div>
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4">Skill Proficiencies & Averages</h3>
            <div className="max-h-[300px] overflow-y-auto pr-2 space-y-3">
              {!rep?.categoryScores?.length ? (
                <div className="text-slate-500 text-center py-8 text-sm italic border border-dashed border-slate-800 rounded-xl">No rated skills recorded yet.</div>
              ) : (
                rep.categoryScores.map(cs => {
                  const isVerified = skills.find(s => s.skill === cs.skillName)?.isVerified;
                  return (
                    <div key={cs.skillName} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-100 dark:bg-slate-800/40 rounded-xl border border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition">
                      <div className="flex items-center gap-2 mb-2 sm:mb-0">
                        <div className="font-semibold text-slate-900 dark:text-white">{cs.skillName}</div>
                        {isVerified && <FiCheckCircle className="text-emerald-400" size={14} />}
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
                        <div className="flex flex-col items-center bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-700 px-3 py-1 rounded-lg">
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest">Avg</span>
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