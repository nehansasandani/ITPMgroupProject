import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { FiX, FiStar, FiCheck, FiAlertCircle } from "react-icons/fi";

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

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-all duration-200"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "32px",
            color: star <= (hovered || value) ? "#fbbf24" : "#475569",
            transform: star <= (hovered || value) ? "scale(1.2)" : "scale(1)",
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function SessionRatingModal({ 
  isOpen, 
  onClose, 
  ratedUserId, 
  ratedUserName,
  sessionId,
  taskTitle,
  onRatingComplete 
}) {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [ratings, setRatings] = useState({
    clarity: 0,
    effort: 0,
    timeCommitment: 0,
    communication: 0,
  });
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BAD_WORDS = ["idiot", "stupid", "dumb", "lazy", "terrible", "fake", "scam", "trash", "sucks"];
  const hasBadWords = BAD_WORDS.some(word => comment.toLowerCase().includes(word));

  useEffect(() => {
    setSelectedSubCategory("");
    setSelectedSkill("");
  }, [selectedCategory]);

  useEffect(() => {
    setSelectedSkill("");
  }, [selectedSubCategory]);

  const subCategories = selectedCategory ? Object.keys(SKILL_CATEGORIES[selectedCategory]) : [];
  const skills = selectedCategory && selectedSubCategory ? SKILL_CATEGORIES[selectedCategory][selectedSubCategory] : [];

  const allRated = Object.values(ratings).every((v) => v > 0);
  const skillSelected = selectedCategory && selectedSubCategory && selectedSkill;
  const canSubmit = allRated && skillSelected && !hasBadWords;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    try {
      await axiosInstance.post("/ratings", {
        sessionId,
        ratedUserId,
        skillCategory: selectedCategory,
        skillSubCategory: selectedSubCategory,
        skillName: selectedSkill,
        ...ratings,
        comment,
      });
      setStatus("success");
      setTimeout(() => {
        onRatingComplete?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to submit rating. Please try again.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Success state
  if (status === "success") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-700 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-emerald-500/20 border-2 border-emerald-500 rounded-full flex items-center justify-center animate-pulse">
              <FiCheck className="text-emerald-400 text-2xl" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Rating Submitted!</h3>
          <p className="text-slate-400 mb-6">
            Your feedback for <span className="text-slate-900 dark:text-white font-semibold">{ratedUserName}</span> has been recorded and their reputation updated.
          </p>
          <div className="text-sm text-slate-500">Completing session...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-700 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-700 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Rate Collaborator</h2>
            <p className="text-sm text-slate-400 mt-1">
              Rate {ratedUserName} for: <span className="text-indigo-300 font-semibold">{taskTitle}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition disabled:opacity-50"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl">
              <FiAlertCircle className="text-red-400 mt-0.5 shrink-0" size={18} />
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Rating Criteria */}
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-4">Rate Performance</h3>
              <div className="space-y-5">
                {criteria.map((crit) => (
                  <div key={crit.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-900 dark:text-white">{crit.label}</label>
                      <span className="text-xs text-slate-400">{ratings[crit.key] > 0 ? `${ratings[crit.key]} stars` : "Not rated"}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{crit.desc}</p>
                    <StarRating value={ratings[crit.key]} onChange={(val) => setRatings({ ...ratings, [crit.key]: val })} />
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Selection */}
            <div className="pt-4 border-t border-slate-700 space-y-4">
              <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest">What skill did they demonstrate?</h3>
              
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-widest block mb-2">Skill Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition outline-none"
                >
                  <option value="">Select a category...</option>
                  {Object.keys(SKILL_CATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategory && (
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-widest block mb-2">Subcategory</label>
                  <select
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition outline-none"
                  >
                    <option value="">Select a subcategory...</option>
                    {subCategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedSubCategory && (
                <div>
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-widest block mb-2">Skill</label>
                  <select
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition outline-none"
                  >
                    <option value="">Select a skill...</option>
                    {skills.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Comment */}
            <div className="pt-4 border-t border-slate-700 space-y-3">
              <label className="text-xs font-bold text-indigo-300 uppercase tracking-widest">
                Additional Comments (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience working with them..."
                maxLength={500}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-700 rounded-2xl px-4 py-3 text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition outline-none resize-none h-24 text-sm"
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500">
                  {hasBadWords && <span className="text-red-400 font-semibold">⚠️ Please remove offensive language</span>}
                </p>
                <span className="text-xs text-slate-500">{comment.length}/500</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex gap-3 p-6 border-t border-slate-700 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white rounded-2xl font-semibold transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || loading}
            className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-slate-900 dark:text-white rounded-2xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block">⏳</span> Submitting...
              </>
            ) : (
              <>
                <FiStar size={18} /> Submit Rating
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
