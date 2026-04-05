import React, { useEffect, useMemo, useState } from "react";
import { skillData, skillLevels } from "../../utils/skillData";
import { addSkill, getMySkills, removeSkill } from "../../api/skillApi";
import { ui } from "../../styles/ui";

const LEVEL_COLORS = {
  Beginner: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  Intermediate: "border-sky-400/30 bg-sky-400/10 text-sky-300",
  Expert: "border-violet-400/30 bg-violet-400/10 text-violet-300",
};

const CATEGORY_ICONS = {
  Coding: "💻",
  "UI/UX": "🎨",
  Writing: "✍️",
};

function LevelBadge({ level }) {
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs border font-medium ${
        LEVEL_COLORS[level] || "border-white/15 bg-white/5 text-white/70"
      }`}
    >
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
    "mt-1 w-full rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10 disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <div className={`${ui.page} py-8`}>
      <div className={ui.container}>
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold">My Skills</h1>
          <p className="text-white/60 text-sm mt-1">
            Add your skills so the system can match you with relevant tasks.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* ── Add Skill Form ── */}
          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
            <h2 className="text-base font-semibold mb-5">Add a New Skill</h2>

            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleAddSkill} className="space-y-5">
              {/* Category */}
              <div>
                <label className="text-sm text-white/80">Category</label>
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
                  <option value="">— Select Category —</option>
                  {skillData.map((c) => (
                    <option key={c.category} value={c.category}>
                      {CATEGORY_ICONS[c.category] || "⭐"} {c.category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sub-category */}
              <div>
                <label className="text-sm text-white/80">Sub-category</label>
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
                  <option value="">— Select Sub-category —</option>
                  {subCategories.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {!category && (
                  <p className="text-xs text-white/40 mt-1">Select a category first.</p>
                )}
              </div>

              {/* Skill */}
              <div>
                <label className="text-sm text-white/80">Skill</label>
                <select
                  value={skill}
                  onChange={(e) => {
                    setSkill(e.target.value);
                    resetMessages();
                  }}
                  disabled={!subCategory}
                  className={selectCls}
                >
                  <option value="">— Select Skill —</option>
                  {skillsList.map((sk) => (
                    <option key={sk} value={sk}>
                      {sk}
                    </option>
                  ))}
                </select>
                {!subCategory && category && (
                  <p className="text-xs text-white/40 mt-1">Select a sub-category first.</p>
                )}
              </div>

              {/* Proficiency Level */}
              <div>
                <label className="text-sm text-white/80">Proficiency Level</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {skillLevels.map((lvl) => {
                    const active = level === lvl;
                    const activeColor =
                      lvl === "Beginner"
                        ? "bg-emerald-400/15 border-emerald-400/40 text-emerald-200"
                        : lvl === "Intermediate"
                        ? "bg-sky-400/15 border-sky-400/40 text-sky-200"
                        : "bg-violet-400/15 border-violet-400/40 text-violet-200";
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => { setLevel(lvl); resetMessages(); }}
                        className={`px-4 py-2.5 rounded-xl text-sm border transition ${
                          active ? activeColor : "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        {lvl}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-white/40 mt-1">
                  Beginner = learning · Intermediate = working knowledge · Expert = highly proficient
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !category || !subCategory || !skill}
                className="w-full rounded-xl bg-white text-slate-900 py-2.5 font-medium hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? "Saving…" : "Add Skill"}
              </button>
            </form>
          </div>

          {/* ── Stats sidebar ── */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold mb-3">Skill Summary</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/55">Total skills</span>
                  <span className="font-medium">{skills.length}</span>
                </div>
                {skillLevels.map((lvl) => (
                  <div key={lvl} className="flex justify-between">
                    <span className="text-white/55">{lvl}</span>
                    <span className="font-medium">
                      {skills.filter((s) => s.level === lvl).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold mb-2">ℹ️ How it works</div>
              <p className="text-xs text-white/55 leading-relaxed">
                Your skills are used by the matching algorithm to pair you with tasks that need your expertise. Higher proficiency levels give you a better match score.
              </p>
            </div>
          </div>
        </div>

        {/* ── Saved Skills List ── */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-base font-semibold">
              Saved Skills
              {skills.length > 0 && (
                <span className="ml-2 text-xs text-white/45 font-normal">
                  {filteredSkills.length}/{skills.length}
                </span>
              )}
            </h2>
            {skills.length > 3 && (
              <input
                type="text"
                placeholder="Search skills…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-56 rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2 text-sm outline-none focus:border-white/30"
              />
            )}
          </div>

          {loading && skills.length === 0 ? (
            <div className="p-6 text-white/50 text-sm">Loading…</div>
          ) : filteredSkills.length === 0 ? (
            <div className="p-8">
              <div className="text-white/80 font-medium">
                {skills.length === 0 ? "No skills added yet" : "No matching skills"}
              </div>
              <p className="text-white/50 text-sm mt-1">
                {skills.length === 0
                  ? "Use the form above to add your first skill."
                  : "Try a different search term."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {filteredSkills.map((s) => (
                <div
                  key={s._id}
                  className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="text-2xl shrink-0">
                      {CATEGORY_ICONS[s.category] || "⭐"}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {s.skill}
                      </div>
                      <div className="text-xs text-white/50 mt-0.5">
                        {s.category} › {s.subCategory}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <LevelBadge level={s.level} />
                    <button
                      onClick={() => handleRemoveSkill(s._id)}
                      disabled={loading}
                      className="p-1.5 rounded-lg border border-red-400/20 bg-red-400/10 text-red-300 hover:bg-red-400/20 disabled:opacity-40 transition"
                      title="Remove skill"
                    >
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
