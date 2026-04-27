import React, { useEffect, useMemo, useState } from "react";
import { skillData, skillLevels } from "../../utils/skillData";
import { addSkill, getMySkills, removeSkill } from "../../api/skillApi";
import { ui } from "../../styles/ui";

const skillsBackground =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1800&q=80";

const LEVEL_COLORS = {
  Beginner: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  Intermediate: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  Expert: "border-purple-500/30 bg-purple-500/10 text-purple-400",
};

const CATEGORY_ICONS = {
  Coding: "💻",
  "UI/UX": "🎨",
  Writing: "✍️",
  Marketing: "📈",
  Business: "💼",
  Design: "✨",
};

function LevelBadge({ level }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-lg text-xs border font-semibold tracking-wide uppercase ${
        LEVEL_COLORS[level] || "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm dark:shadow-none text-slate-500 dark:text-white/50"
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-2 bg-current animate-pulse" />
      {level}
    </span>
  );
}

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [skill, setSkill] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      setLoading(true);
      const data = await getMySkills();
      setSkills(data.skills || []);
    } catch {
      setError("Failed to load skills. Please login again.");
    } finally {
      setLoading(false);
    }
  };

  const subCategories = useMemo(() => {
    const cat = skillData.find((c) => c.category === category);
    return cat ? cat.subCategories : [];
  }, [category]);

  const skillsList = useMemo(() => {
    const sub = subCategories.find((s) => s.name === subCategory);
    return sub ? sub.skills : [];
  }, [subCategory, subCategories]);

  const resetMessages = () => {
    setError("");
    setSuccess("");
  };

  const isDuplicate = () => {
    return skills.some(
      (s) =>
        s.category === category &&
        s.subCategory === subCategory &&
        s.skill === skill
    );
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    resetMessages();
    if (!category || !subCategory || !skill || !level) {
      setError("Please select all fields.");
      return;
    }
    if (isDuplicate()) {
      setError("This skill is already added.");
      return;
    }
    try {
      setLoading(true);
      const payload = { category, subCategory, skill, level };
      const data = await addSkill(payload);
      setSkills(data.skills);
      setSuccess("Skill added successfully!");
      setCategory("");
      setSubCategory("");
      setSkill("");
      setLevel("Beginner");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add skill.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSkill = async (skillId) => {
    resetMessages();
    try {
      setLoading(true);
      const data = await removeSkill(skillId);
      setSkills(data.skills);
      setSuccess("Skill removed successfully!");
    } catch {
      setError("Failed to remove skill.");
    } finally {
      setLoading(false);
    }
  };

  const filteredSkills = skills.filter(
    (s) =>
      s.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.subCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectCls =
    "mt-2 w-full rounded-2xl bg-slate-50 dark:bg-white/10 shadow-sm dark:shadow-none border border-slate-300 dark:border-white/20 px-4 py-4 text-slate-900 dark:text-white outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/20 transition-all duration-300 backdrop-blur-md appearance-none font-medium";

  return (
    <div className={`${ui.page} relative min-h-screen text-slate-900 dark:text-white font-sans selection:bg-cyan-500/30`}>
      {/* Dynamic Background with Modern Image Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-white dark:bg-slate-950/40 shadow-sm dark:shadow-none z-10 backdrop-blur-[2px]" />
        <img
          src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2000&q=80"
          alt=""
          className="absolute inset-0 w-full h-full object-cover transform scale-105"
        />
        {/* Animated Gradient Orbs */}
        <div className="absolute top-0 -left-20 w-96 h-96 bg-cyan-600/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-purple-600/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[150px]" />
      </div>

      <div className={`${ui.container} relative z-20 py-16 px-6`}>
        {/* Modern Header Section */}
        <div className="mb-16 text-center lg:text-left">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black uppercase tracking-[0.2em] mb-6">
            Expertise Matrix
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 bg-gradient-to-r from-white via-cyan-100 to-white/40 bg-clip-text text-transparent italic">
            Skill Lab
          </h1>
          <p className="text-slate-500 dark:text-white/50 text-xl max-w-2xl font-medium leading-relaxed">
            Architect your professional identity with high-fidelity skills and precision matches.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* ── Add Skill Form ── */}
          <div className="lg:col-span-12 xl:col-span-8">
            <div className="relative overflow-hidden rounded-[3rem] border border-slate-300 dark:border-white/20 bg-white dark:bg-white/5 shadow-sm dark:shadow-none p-10 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-cyan-500/30 group">
              {/* Inner Glow Decorative Element */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-colors" />
              
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-900 dark:text-white shadow-lg shadow-cyan-500/20">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight uppercase italic text-cyan-400">Initialize Skill</h2>
                  <p className="text-white/30 text-xs font-bold uppercase tracking-widest mt-1">Operational configuration</p>
                </div>
              </div>

              {error && (
                <div className="mb-8 p-5 rounded-3xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-4 animate-bounce">
                  <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                    <span className="font-bold">!</span>
                  </div>
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-8 p-5 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 text-sm flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
                  </div>
                  {success}
                </div>
              )}

              <form onSubmit={handleAddSkill} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-white/40 uppercase tracking-[0.3em] ml-2">Primary Domain</label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => {
                          setCategory(e.target.value);
                          setSubCategory("");
                          setSkill("");
                          resetMessages();
                        }}
                        className={selectCls}
                      >
                        <option value="" className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">— CATEGORY —</option>
                        {skillData.map((c) => (
                          <option key={c.category} value={c.category} className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none py-4">
                            {c.category}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-white/40 uppercase tracking-[0.3em] ml-2">Specialization</label>
                    <div className="relative">
                      <select
                        value={subCategory}
                        onChange={(e) => {
                          setSubCategory(e.target.value);
                          setSkill("");
                          resetMessages();
                        }}
                        disabled={!category}
                        className={selectCls}
                      >
                        <option value="" className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">— TRACK —</option>
                        {subCategories.map((s) => (
                          <option key={s.name} value={s.name} className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none py-4">
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-white/40 uppercase tracking-[0.3em] ml-2">Target Skillset</label>
                  <div className="relative">
                    <select
                      value={skill}
                      onChange={(e) => {
                        setSkill(e.target.value);
                        resetMessages();
                      }}
                      disabled={!subCategory}
                      className={selectCls}
                    >
                      <option value="" className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">— IDENTIFIED SKILL —</option>
                      {skillsList.map((sk) => (
                        <option key={sk} value={sk} className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none py-4">
                          {sk}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <label className="text-xs font-black text-white/40 uppercase tracking-[0.3em] ml-2 mb-6 block">Tier Level</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {skillLevels.map((lvl) => {
                      const active = level === lvl;
                      const colors = {
                        Beginner: "from-emerald-500/20 to-emerald-900/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10",
                        Intermediate: "from-cyan-500/20 to-cyan-900/10 text-cyan-400 border-cyan-500/30 shadow-cyan-500/10",
                        Expert: "from-purple-500/20 to-purple-900/10 text-purple-400 border-purple-500/30 shadow-purple-500/10"
                      };
                      
                      return (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => { setLevel(lvl); resetMessages(); }}
                          className={`relative group px-8 py-10 rounded-[2.5rem] border transition-all duration-500 flex flex-col items-center gap-3 overflow-hidden ${
                            active 
                              ? `bg-gradient-to-br ${colors[lvl]} scale-[1.05] z-10 border-white/40 shadow-2xl` 
                              : "bg-white dark:bg-white/5 shadow-sm dark:shadow-none border-slate-200 dark:border-white/10 text-white/40 hover:bg-slate-50 dark:hover:bg-white/10 hover:shadow-sm dark:hover:shadow-none hover:border-slate-300 dark:hover:border-white/20"
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-transform duration-500 group-hover:rotate-12 ${active ? 'bg-slate-200 dark:bg-white/20' : 'bg-white dark:bg-white/5 shadow-sm dark:shadow-none'}`}>
                            {lvl === "Beginner" && "L1"}
                            {lvl === "Intermediate" && "L2"}
                            {lvl === "Expert" && "L3"}
                          </div>
                          <span className="text-sm font-black uppercase tracking-widest">{lvl}</span>
                          {active && (
                            <div className="absolute top-4 right-6 w-3 h-3 bg-white rounded-full animate-ping" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    type="submit"
                    disabled={loading || !category || !subCategory || !skill}
                    className="w-full relative group overflow-hidden rounded-[2rem] bg-gradient-to-r from-cyan-400 to-blue-500 px-12 py-6 font-black text-slate-950 uppercase tracking-[0.2em] transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(34,211,238,0.4)] active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed group"
                  >
                    <div className="relative z-10 flex items-center justify-center gap-4">
                      {loading ? (
                        <div className="w-6 h-6 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Inject to Portfolio
                          <svg className="w-6 h-6 transition-transform group-hover:translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </>
                      )}
                    </div>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ── Stats sidebar ── */}
          <div className="lg:col-span-12 xl:col-span-4 space-y-8">
            <div className="rounded-[3rem] border border-slate-300 dark:border-white/20 bg-gradient-to-b from-white/10 to-transparent p-10 backdrop-blur-3xl">
              <div className="text-center mb-10">
                <span className="text-6xl font-black text-cyan-400 block mb-2">{skills.length}</span>
                <span className="text-xs font-black text-white/40 uppercase tracking-[0.4em]">Active Modules</span>
              </div>
              
              <div className="space-y-8">
                {skillLevels.map((lvl) => {
                  const count = skills.filter((s) => s.level === lvl).length;
                  const percentage = skills.length > 0 ? (count / skills.length) * 100 : 0;
                  const barColor = lvl === "Expert" ? "bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]" : lvl === "Intermediate" ? "bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]" : "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]";
                  
                  return (
                    <div key={lvl} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-black text-slate-500 dark:text-white/50 uppercase tracking-widest italic">{lvl}</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white">{count}</span>
                      </div>
                      <div className="h-2 w-full bg-white dark:bg-white/5 shadow-sm dark:shadow-none rounded-full overflow-hidden border border-slate-200 dark:border-white/10">
                        <div 
                          className={`h-full transition-all duration-1000 ease-out ${barColor}`} 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[3rem] border border-cyan-500/20 bg-cyan-500/5 p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-cyan-500/20 transition-colors" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2.5"/></svg>
                </div>
                <h4 className="text-xl font-black uppercase tracking-tight italic mb-4">Neural Matching</h4>
                <p className="text-sm text-white/40 leading-relaxed font-bold">
                  Matches are dynamically computed based on your verified skillset density and proficiency vector.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Saved Skills List ── */}
        <div className="mt-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div>
              <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Verified Array</h2>
              <div className="h-1 w-20 bg-cyan-500" />
            </div>
            
            {skills.length > 3 && (
              <div className="relative group/search max-w-md w-full">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-cyan-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="3"/></svg>
                </div>
                <input
                  type="text"
                  placeholder="FILTER REPOSITORY..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-3xl bg-white dark:bg-white/5 shadow-sm dark:shadow-none border border-slate-300 dark:border-white/20 pl-16 pr-8 py-5 text-sm font-black uppercase tracking-widest outline-none focus:border-cyan-400 focus:bg-slate-50 dark:focus:bg-white/10 focus:shadow-sm dark:focus:shadow-none transition-all backdrop-blur-3xl"
                />
              </div>
            )}
          </div>

          <div className="min-h-[400px]">
            {loading && skills.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 gap-6">
                <div className="w-20 h-20 border-8 border-white/5 border-t-cyan-500 rounded-full animate-spin" />
                <span className="text-xs font-black uppercase tracking-[0.5em] text-cyan-500 animate-pulse">Syncing Database...</span>
              </div>
            ) : filteredSkills.length === 0 ? (
              <div className="py-40 flex flex-col items-center text-center rounded-[4rem] border border-dashed border-slate-200 dark:border-white/10 bg-white/[0.02]">
                <div className="w-32 h-32 rounded-[2.5rem] bg-white dark:bg-white/5 shadow-sm dark:shadow-none border border-slate-200 dark:border-white/10 flex items-center justify-center text-white/10 mb-8 transform hover:scale-110 transition-transform duration-700">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" strokeWidth="2"/></svg>
                </div>
                <h3 className="text-2xl font-black uppercase italic mb-3 tracking-widest">Repository Empty</h3>
                <p className="text-white/30 max-w-xs font-bold uppercase text-[10px] tracking-[0.2em]">
                  No operational records found in the current configuration.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSkills.map((s) => (
                  <div
                    key={s._id}
                    className="group relative overflow-hidden rounded-[3rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm dark:shadow-none p-10 transition-all duration-700 hover:scale-[1.02] hover:bg-white/[0.08] hover:border-cyan-500/40 hover:shadow-[0_40px_80px_rgba(0,0,0,0.4)]"
                  >
                    {/* Background Icon Watermark */}
                    <div className="absolute -bottom-10 -right-10 text-[120px] opacity-[0.03] transition-transform duration-700 group-hover:scale-150 rotate-[-20deg]">
                      {CATEGORY_ICONS[s.category] || "⭐"}
                    </div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-8">
                        <div className="w-20 h-20 rounded-[1.5rem] bg-gradient-to-br from-white/10 to-transparent border border-slate-200 dark:border-white/10 flex items-center justify-center text-5xl transition-transform duration-700 group-hover:rotate-12">
                          {CATEGORY_ICONS[s.category] || "⭐"}
                        </div>
                        <LevelBadge level={s.level} />
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-cyan-400 transition-colors">
                          {s.skill}
                        </h4>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-black text-white/30 uppercase tracking-[0.2em]">
                            {s.category}
                          </span>
                          <span className="text-[10px] font-black text-cyan-500/50 uppercase tracking-widest">
                            {s.subCategory}
                          </span>
                        </div>
                      </div>

                      <div className="mt-10 flex justify-end">
                        <button
                          onClick={() => handleRemoveSkill(s._id)}
                          disabled={loading}
                          className="group/del bg-red-500/0 hover:bg-red-500/20 text-white/10 hover:text-red-400 p-4 rounded-3xl transition-all duration-500 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                          title="Erase Module"
                        >
                          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
