import React, { useEffect, useMemo, useState } from "react";
import { skillData, skillLevels } from "../../utils/skillData";
import { addSkill, getMySkills, removeSkill } from "../../api/skillApi";
<<<<<<< HEAD
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
=======
import { FaTrash } from "react-icons/fa";
import "./SkillsPage.css";
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89

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
<<<<<<< HEAD
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
=======
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89

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
<<<<<<< HEAD
    setNameError("");
    setEmailError("");
  };

  const isDuplicate = () =>
    skills.some(
=======
  };

  const isDuplicate = () => {
    return skills.some(
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89
      (s) =>
        s.category === category &&
        s.subCategory === subCategory &&
        s.skill === skill
    );
<<<<<<< HEAD
=======
  };
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89

  const handleAddSkill = async (e) => {
    e.preventDefault();
    resetMessages();
<<<<<<< HEAD

    if (!name.trim()) return setNameError("Full name is required.");
    if (name.trim().length < 2) return setNameError("Name must be at least 2 characters.");
    if (!email.trim()) return setEmailError("Email address is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setEmailError("Please enter a valid email address.");

    if (!category) return setError("Please select a category.");
    if (!subCategory) return setError("Please select a sub-category.");
    if (!skill) return setError("Please select a skill.");
    if (!skillLevels.includes(level)) return setError("Please select a valid proficiency level.");
    if (isDuplicate()) return setError("This skill is already added.");

    try {
      setLoading(true);
      const data = await addSkill({ category, subCategory, skill, level });
=======
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
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89
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
<<<<<<< HEAD
      setSuccess("Skill removed.");
=======
      setSuccess("Skill removed successfully!");
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89
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

<<<<<<< HEAD
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
              {/* Full Name */}
              <div>
                <label className="text-sm text-white/80">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setNameError(""); }}
                  placeholder="Enter your full name"
                  className={`mt-1 w-full rounded-xl bg-slate-950/40 border ${
                    nameError ? "border-red-400/50" : "border-white/10"
                  } px-3 py-2.5 text-sm outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10`}
                />
                {nameError && (
                  <p className="text-xs text-red-400 mt-1">{nameError}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="text-sm text-white/80">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  placeholder="Enter your email address"
                  className={`mt-1 w-full rounded-xl bg-slate-950/40 border ${
                    emailError ? "border-red-400/50" : "border-white/10"
                  } px-3 py-2.5 text-sm outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10`}
                />
                {emailError && (
                  <p className="text-xs text-red-400 mt-1">{emailError}</p>
                )}
              </div>

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
                disabled={loading || !name.trim() || !email.trim() || !category || !subCategory || !skill}
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
=======
  const levelColors = {
    Beginner: "#fbc02d",
    Intermediate: "#ff9800",
    Expert: "#4caf50",
  };

  // Map some icons for each skill category (just example)
  const skillIcons = {
    Programming: "💻",
    Design: "🎨",
    Marketing: "📈",
    Writing: "✍️",
    Math: "📊",
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Title */}
        <div style={styles.titleWrapper}>
          <h2 style={styles.title}>My Skills</h2>
          <p style={styles.subtitle}>
            Add your skills so the system can match you with tasks.
          </p>
        </div>

        {/* Messages */}
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        {/* Skill Form */}
        <form onSubmit={handleAddSkill} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubCategory("");
                setSkill("");
              }}
              style={styles.select}
            >
              <option value="">-- Select Category --</option>
              {skillData.map((c) => (
                <option key={c.category} value={c.category}>
                  {c.category}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Subcategory</label>
            <select
              value={subCategory}
              onChange={(e) => {
                setSubCategory(e.target.value);
                setSkill("");
              }}
              disabled={!category}
              style={{
                ...styles.select,
                backgroundColor: !category ? "#f0f0f0" : "#fff",
              }}
            >
              <option value="">-- Select Subcategory --</option>
              {subCategories.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Skill</label>
            <select
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              disabled={!subCategory}
              style={{
                ...styles.select,
                backgroundColor: !subCategory ? "#f0f0f0" : "#fff",
              }}
            >
              <option value="">-- Select Skill --</option>
              {skillsList.map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Skill Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              style={styles.select}
            >
              {skillLevels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Saving..." : "Add Skill"}
          </button>
        </form>

        {/* Search */}
        {skills.length > 0 && (
          <input
            type="text"
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.search}
          />
        )}

        {/* Skill List */}
        <div style={styles.listSection}>
          <h3 style={styles.listTitle}>Saved Skills</h3>
          {loading && skills.length === 0 ? (
            <p style={styles.text}>Loading...</p>
          ) : filteredSkills.length === 0 ? (
            <p style={styles.text}>
              {skills.length === 0
                ? "No skills added yet."
                : "No skills match your search."}
            </p>
          ) : (
            <div style={styles.skillGrid}>
              {filteredSkills.map((s) => (
                <div
                  key={s._id}
                  style={{
                    ...styles.skillCard,
                    borderLeft: `6px solid ${levelColors[s.level]}`,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-5px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0px)")
                  }
                >
                  {/* Skill Icon + Info */}
                  <div style={styles.skillInfo}>
                    <span style={styles.icon}>
                      {skillIcons[s.category] || "⭐"}
                    </span>
                    <div>
                      <p style={styles.skillName}>
                        {s.category} → {s.subCategory} → <b>{s.skill}</b>
                      </p>
                      <span
                        style={{
                          ...styles.levelBadge,
                          backgroundColor: levelColors[s.level],
                        }}
                      >
                        {s.level}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveSkill(s._id)}
                    style={styles.removeBtn}
                    disabled={loading}
                  >
                    <FaTrash />
                  </button>
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

<<<<<<< HEAD
=======
// --- Styles ---
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #eef2fb, #f7f9fc)",
    display: "flex",
    justifyContent: "center",
    padding: "40px 20px",
    fontFamily: "'Poppins', sans-serif",
  },
  container: {
    width: "100%",
    maxWidth: "800px",
    background: "#fff",
    borderRadius: "20px",
    padding: "30px 40px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  titleWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "4px",
  },
  title: {
    fontSize: "36px",
    fontWeight: "700",
    background: "linear-gradient(90deg, #6a11cb, #2575fc, #6a11cb)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0,
  },
  subtitle: { fontSize: "14px", color: "#555", margin: 0, opacity: 0.9 },
  error: {
    background: "#ffe5e5",
    padding: "12px",
    borderRadius: "12px",
    color: "#b30000",
  },
  success: {
    background: "#e8fff0",
    padding: "12px",
    borderRadius: "12px",
    color: "#007a2f",
  },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontWeight: "600", fontSize: "14px" },
  select: {
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    outline: "none",
  },
  button: {
    padding: "14px",
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    fontWeight: "600",
    background: "linear-gradient(90deg, #6a11cb, #2575fc)",
    color: "#fff",
  },
  search: {
    padding: "12px",
    borderRadius: "14px",
    border: "1px solid #ddd",
    width: "100%",
  },
  listSection: { display: "flex", flexDirection: "column", gap: "15px" },
  listTitle: { fontSize: "20px", fontWeight: "600" },
  text: { color: "#666", fontSize: "14px" },
  skillGrid: { display: "flex", flexDirection: "column", gap: "15px" },
  skillCard: {
    borderRadius: "16px",
    padding: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    boxShadow: "0 8px 25px rgba(0,0,0,0.05)",
    transition: "0.3s all",
  },
  skillInfo: { display: "flex", alignItems: "center", gap: "12px" },
  skillName: { margin: 0, fontSize: "15px", fontWeight: "500" },
  levelBadge: {
    padding: "4px 10px",
    borderRadius: "12px",
    color: "#fff",
    fontWeight: "600",
    fontSize: "12px",
    textTransform: "uppercase",
  },
  removeBtn: {
    background: "#ffecec",
    border: "1px solid #ffbdbd",
    padding: "8px 12px",
    borderRadius: "12px",
    cursor: "pointer",
    color: "#b30000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: "28px" },
};
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89
