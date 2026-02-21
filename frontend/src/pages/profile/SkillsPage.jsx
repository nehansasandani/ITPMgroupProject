import React, { useEffect, useMemo, useState } from "react";
import { skillData, skillLevels } from "../../utils/skillData";
import { addSkill, getMySkills, removeSkill } from "../../api/skillApi";
import { FaTrash } from "react-icons/fa";
import "./SkillsPage.css";

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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
