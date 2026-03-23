import { useState, useEffect } from "react";
import axios from "axios";

// ─── Skill categories (matches her Skill model structure) ─────────────────────
const SKILL_CATEGORIES = {
  Programming: {
    Languages: ["Python", "Java", "C++", "JavaScript", "C#"],
    Frontend: ["React", "Vue", "HTML/CSS", "Angular"],
    Backend: ["Node.js", "Express", "Django", "Spring Boot"],
  },
  Databases: {
    Relational: ["MySQL", "PostgreSQL", "SQLite"],
    NoSQL: ["MongoDB", "Firebase", "Redis"],
  },
  "Data Science": {
    ML: ["TensorFlow", "PyTorch", "Scikit-learn"],
    Analytics: ["Pandas", "NumPy", "Tableau"],
  },
  Design: {
    UI: ["Figma", "Adobe XD", "Sketch"],
    Graphics: ["Photoshop", "Illustrator"],
  },
};

const criteria = [
  { key: "clarity", label: "Clarity", desc: "Were instructions and communication clear?" },
  { key: "effort", label: "Effort", desc: "Did they put in genuine effort?" },
  { key: "timeCommitment", label: "Time Commitment", desc: "Were they punctual and on time?" },
  { key: "communication", label: "Communication", desc: "Were they responsive and helpful?" },
];

// ─── Star Rating Component ────────────────────────────────────────────────────
const StarRating = ({ value, onChange }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: "6px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "28px",
            color: star <= (hovered || value) ? "#f5c518" : "#2a2f45",
            transform: star <= (hovered || value) ? "scale(1.2)" : "scale(1)",
            transition: "all 0.15s ease",
            padding: "0", lineHeight: 1,
          }}
        >★</button>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RatingForm() {
  const MOCK_SESSION_ID = "64f832b1f1234567890abcde";
  const MOCK_RATED_USER_ID = "64f832b1f1234567890abcde";

  // Skill selection state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");

  // Ratings state
  const [ratings, setRatings] = useState({
    clarity: 0, effort: 0, timeCommitment: 0, communication: 0,
  });

  const [comment, setComment] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Reset subcategory and skill when category changes
  useEffect(() => {
    setSelectedSubCategory("");
    setSelectedSkill("");
  }, [selectedCategory]);

  useEffect(() => {
    setSelectedSkill("");
  }, [selectedSubCategory]);

  const subCategories = selectedCategory
    ? Object.keys(SKILL_CATEGORIES[selectedCategory])
    : [];

  const skills =
    selectedCategory && selectedSubCategory
      ? SKILL_CATEGORIES[selectedCategory][selectedSubCategory]
      : [];

  const allRated = Object.values(ratings).every((v) => v > 0);
  const skillSelected = selectedCategory && selectedSubCategory && selectedSkill;
  const canSubmit = allRated && skillSelected;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/ratings", {
        sessionId: MOCK_SESSION_ID,
        ratedUserId: MOCK_RATED_USER_ID,
        skillCategory: selectedCategory,
        skillSubCategory: selectedSubCategory,
        skillName: selectedSkill,
        ...ratings,
        comment,
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  // ── Success Screen ──
  if (status === "success") {
    return (
      <div style={styles.page}>
        <div style={styles.successCard}>
          <div style={styles.successIcon}>✓</div>
          <h2 style={styles.successTitle}>Rating Submitted!</h2>
          <p style={styles.successSub}>
            Your feedback has been recorded and their reputation score has been updated.
          </p>
          <button style={styles.resetBtn} onClick={() => {
            setStatus(null);
            setRatings({ clarity: 0, effort: 0, timeCommitment: 0, communication: 0 });
            setComment("");
            setSelectedCategory("");
            setSelectedSubCategory("");
            setSelectedSkill("");
          }}>
            Rate Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.glowTop} />
      <div style={styles.glowBottom} />

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.badge}>POST-SESSION</div>
          <h1 style={styles.title}>Rate Your Collaborator</h1>
          <p style={styles.subtitle}>
            Your honest feedback shapes reputation scores and builds platform trust.
          </p>
        </div>

        <div style={styles.divider} />

        {/* ── Skill Category Selection ── */}
        <div style={styles.sectionTitle}>📚 What skill area did you collaborate on?</div>

        <div style={styles.selectRow}>
          {/* Category */}
          <div style={styles.selectWrap}>
            <label style={styles.selectLabel}>Category</label>
            <select
              style={styles.select}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Select category</option>
              {Object.keys(SKILL_CATEGORIES).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Sub Category */}
          <div style={styles.selectWrap}>
            <label style={styles.selectLabel}>Sub Category</label>
            <select
              style={{
                ...styles.select,
                opacity: !selectedCategory ? 0.4 : 1,
              }}
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              disabled={!selectedCategory}
            >
              <option value="">Select sub category</option>
              {subCategories.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Skill */}
          <div style={styles.selectWrap}>
            <label style={styles.selectLabel}>Skill</label>
            <select
              style={{
                ...styles.select,
                opacity: !selectedSubCategory ? 0.4 : 1,
              }}
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              disabled={!selectedSubCategory}
            >
              <option value="">Select skill</option>
              {skills.map((skill) => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected skill tag */}
        {skillSelected && (
          <div style={styles.selectedTag}>
            ✅ Rating for: <strong>{selectedCategory}</strong> →{" "}
            <strong>{selectedSubCategory}</strong> → <strong>{selectedSkill}</strong>
          </div>
        )}

        <div style={styles.divider} />

        {/* ── Star Ratings ── */}
        <div style={styles.sectionTitle}>⭐ Rate their performance</div>
        <div style={styles.criteriaList}>
          {criteria.map((item, i) => (
            <div key={item.key} style={styles.criteriaRow}>
              <div style={styles.criteriaLeft}>
                <span style={styles.criteriaLabel}>{item.label}</span>
                <span style={styles.criteriaDesc}>{item.desc}</span>
              </div>
              <div style={styles.criteriaRight}>
                <StarRating
                  value={ratings[item.key]}
                  onChange={(val) => setRatings((prev) => ({ ...prev, [item.key]: val }))}
                />
                <span style={styles.scoreText}>
                  {ratings[item.key] > 0 ? `${ratings[item.key]}/5` : "—"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={styles.divider} />

        {/* ── Comment ── */}
        <div style={styles.sectionTitle}>💬 Leave a comment (optional)</div>
        <textarea
          style={styles.textarea}
          placeholder="Share your experience working with this person..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
          rows={3}
        />
        <div style={styles.charCount}>{comment.length}/500</div>

        <div style={styles.divider} />

        {/* Score preview */}
        {allRated && (
          <div style={styles.previewBar}>
            <span style={styles.previewLabel}>Average Score</span>
            <span style={styles.previewScore}>
              {(Object.values(ratings).reduce((a, b) => a + b, 0) / 4).toFixed(1)} / 5
            </span>
          </div>
        )}

        {status === "error" && (
          <div style={styles.errorMsg}>⚠ Something went wrong. Please try again.</div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
          style={{
            ...styles.submitBtn,
            opacity: !canSubmit || loading ? 0.4 : 1,
            cursor: !canSubmit || loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Submitting..." : "Submit Rating"}
        </button>

        {!canSubmit && (
          <p style={styles.hint}>
            {!skillSelected
              ? "Please select a skill category first"
              : "Please rate all 4 criteria to submit"}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "#0b0e1a",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Sora', 'Segoe UI', sans-serif",
    padding: "40px 16px",
    position: "relative", overflow: "hidden",
  },
  glowTop: {
    position: "absolute", top: "-120px", left: "50%",
    transform: "translateX(-50%)", width: "500px", height: "500px",
    background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  glowBottom: {
    position: "absolute", bottom: "-100px", right: "10%",
    width: "350px", height: "350px",
    background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  card: {
    background: "#131728", border: "1px solid #1e2442",
    borderRadius: "20px", padding: "44px 40px",
    width: "100%", maxWidth: "620px",
    position: "relative", zIndex: 1,
    boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
  },
  header: { marginBottom: "28px" },
  badge: {
    display: "inline-block",
    background: "rgba(99,102,241,0.15)", color: "#818cf8",
    fontSize: "11px", fontWeight: "700", letterSpacing: "2px",
    padding: "4px 12px", borderRadius: "20px", marginBottom: "16px",
    border: "1px solid rgba(99,102,241,0.2)",
  },
  title: {
    color: "#f1f5f9", fontSize: "26px", fontWeight: "700",
    margin: "0 0 10px 0", letterSpacing: "-0.5px",
  },
  subtitle: { color: "#64748b", fontSize: "14px", margin: 0, lineHeight: "1.6" },
  divider: { height: "1px", background: "#1e2442", margin: "24px 0" },
  sectionTitle: {
    color: "#94a3b8", fontSize: "13px", fontWeight: "600",
    letterSpacing: "0.5px", marginBottom: "14px",
  },
  // Skill selectors
  selectRow: {
    display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px",
    marginBottom: "12px",
  },
  selectWrap: { display: "flex", flexDirection: "column", gap: "6px" },
  selectLabel: { color: "#64748b", fontSize: "11px", fontWeight: "600", letterSpacing: "0.5px" },
  select: {
    background: "#0f1323", border: "1px solid #1e2442",
    color: "#e2e8f0", borderRadius: "10px",
    padding: "10px 12px", fontSize: "13px",
    outline: "none", cursor: "pointer",
    appearance: "none",
  },
  selectedTag: {
    background: "rgba(99,102,241,0.08)",
    border: "1px solid rgba(99,102,241,0.2)",
    color: "#94a3b8", fontSize: "12px",
    padding: "8px 14px", borderRadius: "8px",
    marginTop: "8px",
  },
  // Criteria
  criteriaList: { display: "flex", flexDirection: "column", gap: "20px" },
  criteriaRow: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between", gap: "16px",
  },
  criteriaLeft: { display: "flex", flexDirection: "column", gap: "3px", flex: 1 },
  criteriaLabel: { color: "#e2e8f0", fontSize: "15px", fontWeight: "600" },
  criteriaDesc: { color: "#475569", fontSize: "12px" },
  criteriaRight: { display: "flex", alignItems: "center", gap: "10px" },
  scoreText: { color: "#64748b", fontSize: "13px", minWidth: "28px", textAlign: "right" },
  // Comment
  textarea: {
    width: "100%", background: "#0f1323",
    border: "1px solid #1e2442", borderRadius: "10px",
    color: "#e2e8f0", fontSize: "14px",
    padding: "12px 14px", outline: "none",
    resize: "vertical", fontFamily: "inherit",
    boxSizing: "border-box", lineHeight: "1.6",
  },
  charCount: { color: "#475569", fontSize: "11px", textAlign: "right", marginTop: "4px" },
  // Preview / error
  previewBar: {
    background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)",
    borderRadius: "10px", padding: "12px 18px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    marginBottom: "20px",
  },
  previewLabel: { color: "#94a3b8", fontSize: "13px" },
  previewScore: { color: "#818cf8", fontSize: "18px", fontWeight: "700" },
  errorMsg: {
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)",
    color: "#f87171", borderRadius: "8px",
    padding: "10px 14px", fontSize: "13px", marginBottom: "16px",
  },
  submitBtn: {
    width: "100%", padding: "15px",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "#fff", border: "none", borderRadius: "12px",
    fontSize: "15px", fontWeight: "700", letterSpacing: "0.5px",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
  },
  hint: { textAlign: "center", color: "#475569", fontSize: "12px", marginTop: "12px" },
  // Success
  successCard: {
    background: "#131728", border: "1px solid #1e2442",
    borderRadius: "20px", padding: "60px 40px",
    width: "100%", maxWidth: "420px", textAlign: "center",
    boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
    position: "relative", zIndex: 1,
  },
  successIcon: {
    width: "64px", height: "64px", borderRadius: "50%",
    background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.3)",
    color: "#22c55e", fontSize: "28px",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 24px",
  },
  successTitle: { color: "#f1f5f9", fontSize: "22px", fontWeight: "700", margin: "0 0 10px 0" },
  successSub: { color: "#64748b", fontSize: "14px", margin: "0 0 32px 0", lineHeight: "1.6" },
  resetBtn: {
    padding: "12px 28px", background: "rgba(99,102,241,0.15)",
    color: "#818cf8", border: "1px solid rgba(99,102,241,0.25)",
    borderRadius: "10px", fontSize: "14px", fontWeight: "600", cursor: "pointer",
  },
};

