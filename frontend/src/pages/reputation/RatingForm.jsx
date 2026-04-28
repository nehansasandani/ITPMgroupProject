import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";

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
    <div style={{ display: "flex", gap: "8px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "32px",
            color: star <= (hovered || value) ? "#fbbf24" : "#334155",
            transform: star <= (hovered || value) ? "scale(1.25)" : "scale(1)",
            transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
            padding: "0", lineHeight: 1,
            filter: star <= (hovered || value) ? "drop-shadow(0 0 8px rgba(251,191,36,0.4))" : "none",
          }}
        >★</button>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RatingForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userId: routeUserId } = useParams();
  const MOCK_SESSION_ID = "64f832b1f1234567890abcde";
  const ratedUserId = routeUserId || user?.id;

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

  // Validation
  const BAD_WORDS = ["idiot", "stupid", "dumb", "lazy", "terrible", "fake", "scam", "trash", "sucks"];
  const hasBadWords = BAD_WORDS.some(word => comment.toLowerCase().includes(word));

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
  const canSubmit = allRated && skillSelected && !hasBadWords;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      await axiosInstance.post("/ratings", {
        sessionId: MOCK_SESSION_ID,
        ratedUserId,
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
          <button style={styles.resetBtn} onClick={() => navigate("/profile") }>
            View Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <style>{`
        select:hover { border-color: rgba(99,102,241,0.4); background-color: rgba(15, 19, 35, 0.8); }
        select:focus { border-color: rgba(99,102,241,0.6); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        textarea:hover { border-color: rgba(148, 163, 184, 0.25); background-color: rgba(15, 19, 35, 0.8); }
        textarea:focus { border-color: rgba(99,102,241,0.6); background-color: rgba(15, 19, 35, 0.9); box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(99,102,241,0.5); }
        @media (max-width: 640px) {
          select { font-size: 16px; }
        }
      `}</style>
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
        {hasBadWords && <div style={styles.errorMsgSmall}>⚠ Please keep your comments respectful.</div>}
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

        {!canSubmit && !hasBadWords && (
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
    background: "#0a0e1a",
    backgroundImage: "url('/background-image.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center",
    fontFamily: "'Sora', 'Segoe UI', -apple-system, sans-serif",
    padding: "40px 16px",
    position: "relative", 
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(10, 14, 26, 0.55)",
      backdropFilter: "blur(2px)",
      pointerEvents: "none",
    }
  },
  glowTop: {
    position: "absolute", top: "-150px", left: "50%",
    transform: "translateX(-50%)", width: "600px", height: "600px",
    background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
    pointerEvents: "none",
    filter: "blur(40px)",
  },
  glowBottom: {
    position: "absolute", bottom: "-120px", right: "5%",
    width: "400px", height: "400px",
    background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)",
    pointerEvents: "none",
    filter: "blur(40px)",
  },
  card: {
    background: "rgba(19, 23, 40, 0.8)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    borderRadius: "24px", 
    padding: "50px 45px",
    width: "100%", 
    maxWidth: "680px",
    position: "relative", 
    zIndex: 10,
    boxShadow: "0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
    transition: "all 0.3s ease",
  },
  header: { marginBottom: "32px" },
  badge: {
    display: "inline-block",
    background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))", 
    color: "#a78bfa",
    fontSize: "11px", 
    fontWeight: "700", 
    letterSpacing: "2px",
    padding: "6px 14px", 
    borderRadius: "20px", 
    marginBottom: "16px",
    border: "1px solid rgba(167,139,250,0.2)",
    boxShadow: "0 4px 12px rgba(167,139,250,0.1)",
  },
  title: {
    color: "#f8fafc", 
    fontSize: "32px", 
    fontWeight: "800",
    margin: "0 0 12px 0", 
    letterSpacing: "-0.8px",
    background: "linear-gradient(135deg, #f8fafc, #cbd5e1)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: { 
    color: "#cbd5e1", 
    fontSize: "15px", 
    margin: 0, 
    lineHeight: "1.7",
    fontWeight: "400",
  },
  divider: { 
    height: "1px", 
    background: "linear-gradient(90deg, transparent, rgba(148,163,184,0.2), transparent)", 
    margin: "28px 0" 
  },
  sectionTitle: {
    color: "#cbd5e1", 
    fontSize: "14px", 
    fontWeight: "700",
    letterSpacing: "0.8px", 
    marginBottom: "18px",
    textTransform: "uppercase",
    opacity: 0.9,
  },
  // Skill selectors
  selectRow: {
    display: "grid", 
    gridTemplateColumns: "1fr 1fr 1fr", 
    gap: "14px",
    marginBottom: "16px",
  },
  selectWrap: { display: "flex", flexDirection: "column", gap: "7px" },
  selectLabel: { 
    color: "#94a3b8", 
    fontSize: "12px", 
    fontWeight: "700", 
    letterSpacing: "0.6px",
    textTransform: "uppercase",
    opacity: 0.8,
  },
  select: {
    background: "rgba(15, 19, 35, 0.6)",
    border: "1.5px solid rgba(148, 163, 184, 0.15)",
    color: "#e2e8f0", 
    borderRadius: "12px",
    padding: "12px 14px", 
    fontSize: "14px",
    outline: "none", 
    cursor: "pointer",
    appearance: "none",
    transition: "all 0.3s ease",
    fontWeight: "500",
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23cbd5e1' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 10px center",
    paddingRight: "32px",
  },
  selectedTag: {
    background: "rgba(99,102,241,0.12)",
    border: "1.5px solid rgba(99,102,241,0.25)",
    color: "#cbd5e1", 
    fontSize: "13px",
    padding: "10px 16px", 
    borderRadius: "12px",
    marginTop: "10px",
    fontWeight: "500",
    boxShadow: "0 4px 12px rgba(99,102,241,0.1)",
  },
  // Criteria
  criteriaList: { display: "flex", flexDirection: "column", gap: "22px" },
  criteriaRow: {
    display: "flex", 
    alignItems: "center",
    justifyContent: "space-between", 
    gap: "18px",
    padding: "16px 18px",
    background: "rgba(30, 36, 66, 0.4)",
    borderRadius: "14px",
    border: "1px solid rgba(99,102,241,0.1)",
    transition: "all 0.3s ease",
  },
  criteriaLeft: { display: "flex", flexDirection: "column", gap: "4px", flex: 1 },
  criteriaLabel: { 
    color: "#f1f5f9", 
    fontSize: "16px", 
    fontWeight: "700",
    letterSpacing: "-0.3px",
  },
  criteriaDesc: { 
    color: "#94a3b8", 
    fontSize: "13px",
    fontWeight: "400",
  },
  criteriaRight: { display: "flex", alignItems: "center", gap: "14px" },
  scoreText: { 
    color: "#94a3b8", 
    fontSize: "14px", 
    fontWeight: "600",
    minWidth: "32px", 
    textAlign: "right",
  },
  // Comment
  textarea: {
    width: "100%", 
    background: "rgba(15, 19, 35, 0.6)",
    border: "1.5px solid rgba(148, 163, 184, 0.15)", 
    borderRadius: "12px",
    color: "#e2e8f0", 
    fontSize: "14px",
    padding: "14px 16px", 
    outline: "none",
    resize: "vertical", 
    fontFamily: "inherit",
    boxSizing: "border-box", 
    lineHeight: "1.7",
    transition: "all 0.3s ease",
    fontWeight: "400",
  },
  charCount: { 
    color: "#64748b", 
    fontSize: "12px", 
    textAlign: "right", 
    marginTop: "6px",
    fontWeight: "500",
  },
  // Preview / error
  previewBar: {
    background: "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))", 
    border: "1.5px solid rgba(99,102,241,0.25)",
    borderRadius: "14px", 
    padding: "16px 22px",
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center",
    marginBottom: "22px",
    boxShadow: "0 4px 12px rgba(99,102,241,0.1)",
  },
  previewLabel: { 
    color: "#cbd5e1", 
    fontSize: "14px",
    fontWeight: "600",
  },
  previewScore: { 
    color: "#a78bfa", 
    fontSize: "20px", 
    fontWeight: "800",
  },
  errorMsg: {
    background: "rgba(239,68,68,0.12)", 
    border: "1.5px solid rgba(239,68,68,0.3)",
    color: "#fca5a5", 
    borderRadius: "12px",
    padding: "12px 16px", 
    fontSize: "14px", 
    marginBottom: "18px",
    fontWeight: "500",
    boxShadow: "0 4px 12px rgba(239,68,68,0.1)",
  },
  errorMsgSmall: {
    color: "#f87171", 
    fontSize: "13px", 
    marginTop: "7px", 
    fontStyle: "italic", 
    textAlign: "left",
    fontWeight: "500",
  },
  submitBtn: {
    width: "100%", 
    padding: "15px 20px",
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    color: "#fff", 
    border: "none", 
    borderRadius: "14px",
    fontSize: "15px", 
    fontWeight: "700", 
    letterSpacing: "0.6px",
    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
    cursor: "pointer",
    textTransform: "uppercase",
  },
  hint: { 
    textAlign: "center", 
    color: "#64748b", 
    fontSize: "13px", 
    marginTop: "14px",
    fontWeight: "500",
  },
  // Success
  successCard: {
    background: "rgba(19, 23, 40, 0.8)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(148, 163, 184, 0.12)",
    borderRadius: "24px", 
    padding: "70px 50px",
    width: "100%", 
    maxWidth: "480px", 
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
    position: "relative", 
    zIndex: 10,
  },
  successIcon: {
    width: "72px", 
    height: "72px", 
    borderRadius: "50%",
    background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))", 
    border: "2px solid rgba(34,197,94,0.4)",
    color: "#22c55e", 
    fontSize: "32px",
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center",
    margin: "0 auto 28px",
    boxShadow: "0 8px 20px rgba(34,197,94,0.2)",
  },
  successTitle: { 
    color: "#f1f5f9", 
    fontSize: "26px", 
    fontWeight: "800", 
    margin: "0 0 12px 0",
    letterSpacing: "-0.5px",
  },
  successSub: { 
    color: "#cbd5e1", 
    fontSize: "15px", 
    margin: "0 0 36px 0", 
    lineHeight: "1.7",
    fontWeight: "400",
  },
  resetBtn: {
    padding: "12px 32px", 
    background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))",
    color: "#a78bfa", 
    border: "1.5px solid rgba(167,139,250,0.3)",
    borderRadius: "12px", 
    fontSize: "15px", 
    fontWeight: "700", 
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(167,139,250,0.1)",
  },
};

