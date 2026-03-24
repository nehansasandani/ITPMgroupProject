import { useState, useEffect } from "react";
import { getReputation, getUserRatings } from "../../api/Reputation.js";
import { useAuth } from "../../context/AuthContext";

const BADGE_ICONS = {
  "Reliable": "🛡️",
  "Top Communicator": "💬",
  "Top Contributor": "⭐",
  "Punctual": "⏰",
};

const getScoreColor = (score) => {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#f5c518";
  if (score >= 40) return "#f97316";
  return "#ef4444";
};

const getScoreLabel = (score) => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Improvement";
};

const avgRating = (r) =>
  ((r.clarity + r.effort + r.timeCommitment + r.communication) / 4).toFixed(1);

const ScoreRing = ({ score }) => {
  const color = getScoreColor(score);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  return (
    <div style={styles.ringWrap}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} fill="none" stroke="#1e2442" strokeWidth="10" />
        <circle cx="70" cy="70" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${filled} ${circumference}`}
          strokeLinecap="round" transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div style={styles.ringInner}>
        <span style={{ ...styles.ringScore, color }}>{score}</span>
        <span style={styles.ringLabel}>{getScoreLabel(score)}</span>
      </div>
    </div>
  );
};

const MiniBar = ({ label, value }) => (
  <div style={styles.miniBarWrap}>
    <div style={styles.miniBarTop}>
      <span style={styles.miniBarLabel}>{label}</span>
      <span style={styles.miniBarValue}>{value}/5</span>
    </div>
    <div style={styles.miniBarBg}>
      <div style={{ ...styles.miniBarFill, width: `${(value / 5) * 100}%`, background: getScoreColor((value / 5) * 100) }} />
    </div>
  </div>
);

export default function UserProfile() {
  const { user } = useAuth();

  const [reputation, setReputation] = useState({
    score: 50, noShowCount: 0, cooldownUntil: null, badges: [], categoryScores: [],
  });
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.id) return;
        const [repData, ratingsData] = await Promise.all([
          getReputation(user.id),
          getUserRatings(user.id),
        ]);
        setReputation(repData);
        setRatings(ratingsData);
      } catch (err) {
        console.error("Failed to fetch profile data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div style={styles.loadingPage}>
        <p style={styles.loadingText}>Loading profile...</p>
      </div>
    );
  }

  const isCooledDown = reputation.cooldownUntil && new Date(reputation.cooldownUntil) > new Date();

  const groupedCategories = (reputation.categoryScores || []).reduce((acc, c) => {
    if (!acc[c.category]) acc[c.category] = [];
    acc[c.category].push(c);
    return acc;
  }, {});

  return (
    <div style={styles.page}>
      <div style={styles.glowTop} />
      <div style={styles.glowBottom} />
      <div style={styles.container}>

        {isCooledDown && (
          <div style={styles.cooldownBanner}>
            <span style={{ fontSize: "28px" }}>⏸</span>
            <div>
              <div style={styles.cooldownTitle}>Account on Cooldown</div>
              <div style={styles.cooldownSub}>
                Restricted until <strong>{new Date(reputation.cooldownUntil).toLocaleDateString()}</strong>
              </div>
            </div>
          </div>
        )}

        <div style={styles.profileHeader}>
          <div style={{ position: "relative" }}>
            <div style={styles.avatar}>
              {user.fullName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div style={{ ...styles.statusDot, background: isCooledDown ? "#ef4444" : "#22c55e" }} />
          </div>
          <div style={styles.profileInfo}>
            <div style={styles.profileName}>{user.fullName}</div>
            <div style={styles.profileMeta}>
              <span style={styles.metaChip}>📧 {user.email}</span>
              <span style={styles.metaChip}>🎓 {user.studentId}</span>
              <span style={styles.metaChip}>👤 {user.role}</span>
            </div>
            <div style={styles.badgesRow}>
              {reputation.badges.length > 0
                ? reputation.badges.map((b) => (
                    <span key={b} style={styles.badge}>{BADGE_ICONS[b] || "🏅"} {b}</span>
                  ))
                : <span style={styles.noBadge}>No badges yet — keep collaborating!</span>
              }
            </div>
          </div>
          <ScoreRing score={reputation.score} />
        </div>

        <div style={styles.tabs}>
          {["overview", "skills", "ratings", "stats"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}>
              {tab === "overview" && "📊 "}{tab === "skills" && "🧠 "}
              {tab === "ratings" && "⭐ "}{tab === "stats" && "📈 "}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div style={styles.grid2}>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Reputation Summary</div>
              <div style={styles.cardDivider} />
              <div style={styles.reputationRow}>
                <div style={styles.repItem}>
                  <span style={{ ...styles.repScore, color: getScoreColor(reputation.score) }}>{reputation.score}</span>
                  <span style={styles.repLabel}>Trust Score</span>
                </div>
                <div style={styles.repItem}>
                  <span style={{ ...styles.repScore, color: "#f97316" }}>{reputation.noShowCount}</span>
                  <span style={styles.repLabel}>No-Shows</span>
                </div>
                <div style={styles.repItem}>
                  <span style={{ ...styles.repScore, color: "#818cf8" }}>{ratings.length}</span>
                  <span style={styles.repLabel}>Ratings</span>
                </div>
              </div>
            </div>
            <div style={styles.card}>
              <div style={styles.cardTitle}>Overall Performance</div>
              <div style={styles.cardDivider} />
              {ratings.length === 0 ? <p style={styles.emptyText}>No ratings yet.</p> : (
                ["clarity", "effort", "timeCommitment", "communication"].map((field) => {
                  const avg = (ratings.reduce((s, r) => s + r[field], 0) / ratings.length).toFixed(1);
                  return <MiniBar key={field}
                    label={field === "timeCommitment" ? "Time Commitment" : field.charAt(0).toUpperCase() + field.slice(1)}
                    value={parseFloat(avg)} />;
                })
              )}
            </div>
          </div>
        )}

        {/* Skills */}
        {activeTab === "skills" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {Object.keys(groupedCategories).length === 0 ? (
              <div style={styles.card}>
                <p style={styles.emptyText}>No skill ratings yet. Submit a rating to see breakdown.</p>
              </div>
            ) : Object.entries(groupedCategories).map(([category, items]) => (
              <div key={category} style={styles.card}>
                <div style={styles.categoryHeader}
                  onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}>
                  <div style={styles.categoryLeft}>
                    <span style={styles.categoryIcon}>
                      {category === "Programming" ? "💻" : category === "Databases" ? "🗄️"
                        : category === "Data Science" ? "📊" : category === "Design" ? "🎨" : "📚"}
                    </span>
                    <span style={styles.categoryName}>{category}</span>
                    <span style={styles.categoryCount}>{items.length} skill(s)</span>
                  </div>
                  <span style={styles.expandIcon}>{expandedCategory === category ? "▲" : "▼"}</span>
                </div>
                {expandedCategory === category && (
                  <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    {items.map((item) => (
                      <div key={`${item.subCategory}-${item.skillName}`} style={styles.skillRow}>
                        <div style={styles.skillHeader}>
                          <div>
                            <span style={styles.skillNameText}>{item.skillName}</span>
                            <span style={styles.skillSub}>{item.subCategory}</span>
                          </div>
                          <div style={styles.skillMeta}>
                            <span style={{ ...styles.skillScore, color: getScoreColor(item.overallAvg * 20) }}>
                              ⭐ {item.overallAvg}/5
                            </span>
                            <span style={styles.skillCount}>{item.ratingCount} ratings</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
                          <MiniBar label="Clarity" value={item.avgClarity} />
                          <MiniBar label="Effort" value={item.avgEffort} />
                          <MiniBar label="Time Commitment" value={item.avgTimeCommitment} />
                          <MiniBar label="Communication" value={item.avgCommunication} />
                        </div>
                        {ratings.filter((r) => r.skillCategory === item.category && r.skillName === item.skillName && r.comment).length > 0 && (
                          <div style={styles.commentsSection}>
                            <div style={styles.commentsTitle}>💬 Feedback</div>
                            {ratings.filter((r) => r.skillCategory === item.category && r.skillName === item.skillName && r.comment)
                              .map((r) => (
                                <div key={r._id} style={styles.commentBubble}>
                                  <span style={styles.commentText}>"{r.comment}"</span>
                                  <span style={styles.commentDate}>{new Date(r.createdAt).toLocaleDateString()}</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Ratings */}
        {activeTab === "ratings" && (
          <div style={styles.card}>
            <div style={styles.cardTitle}>Rating History</div>
            <div style={styles.cardDivider} />
            {ratings.length === 0 ? <p style={styles.emptyText}>No ratings yet.</p> : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {ratings.map((r) => (
                  <div key={r._id} style={styles.ratingRow}>
                    <div style={styles.ratingTop}>
                      <div style={styles.ratingLeft}>
                        <span style={styles.sessionId}>Session #{r.sessionId}</span>
                        <span style={styles.ratingSkillTag}>{r.skillCategory} → {r.skillName}</span>
                        <span style={styles.ratingDate}>{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{
                        ...styles.avgBadge,
                        background: `${getScoreColor(parseFloat(avgRating(r)) * 20)}22`,
                        color: getScoreColor(parseFloat(avgRating(r)) * 20),
                        border: `1px solid ${getScoreColor(parseFloat(avgRating(r)) * 20)}44`,
                      }}>⭐ {avgRating(r)}</div>
                    </div>
                    <div style={styles.ratingCriteria}>
                      <span style={styles.criteriaChip}>Clarity {r.clarity}/5</span>
                      <span style={styles.criteriaChip}>Effort {r.effort}/5</span>
                      <span style={styles.criteriaChip}>Time {r.timeCommitment}/5</span>
                      <span style={styles.criteriaChip}>Comm. {r.communication}/5</span>
                    </div>
                    {r.comment && <div style={styles.ratingComment}>💬 "{r.comment}"</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        {activeTab === "stats" && (
          <div style={styles.card}>
            <div style={styles.cardTitle}>Detailed Statistics</div>
            <div style={styles.cardDivider} />
            <div style={styles.statsGrid}>
              {[
                { label: "Total Ratings", value: ratings.length, icon: "📊" },
                { label: "Trust Score", value: `${reputation.score}/100`, icon: "🏆" },
                { label: "No-Shows", value: reputation.noShowCount, icon: "⚠️" },
                { label: "Badges Earned", value: reputation.badges.length, icon: "🎖️" },
                { label: "Skills Rated", value: (reputation.categoryScores || []).length, icon: "🧠" },
                { label: "Account Status", value: isCooledDown ? "Cooldown" : "Active", icon: "✅" },
              ].map((stat) => (
                <div key={stat.label} style={styles.statCard}>
                  <span style={styles.statIcon}>{stat.icon}</span>
                  <span style={styles.statValue}>{stat.value}</span>
                  <span style={styles.statLabel}>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  loadingPage: {
    minHeight: "100vh", background: "#0b0e1a",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  loadingText: { color: "#64748b", fontSize: "14px", fontFamily: "Sora, sans-serif" },
  page: {
    minHeight: "100vh", background: "#0b0e1a",
    fontFamily: "'Sora', 'Segoe UI', sans-serif",
    padding: "40px 16px", position: "relative", overflow: "hidden",
  },
  glowTop: {
    position: "fixed", top: "-150px", left: "30%", width: "600px", height: "600px",
    background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", pointerEvents: "none",
  },
  glowBottom: {
    position: "fixed", bottom: "-100px", right: "10%", width: "400px", height: "400px",
    background: "radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)", pointerEvents: "none",
  },
  container: { maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px", position: "relative", zIndex: 1 },
  cooldownBanner: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "14px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px" },
  cooldownTitle: { color: "#f87171", fontWeight: "700", fontSize: "15px" },
  cooldownSub: { color: "#94a3b8", fontSize: "13px", marginTop: "3px" },
  profileHeader: { background: "#131728", border: "1px solid #1e2442", borderRadius: "20px", padding: "32px", display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" },
  avatar: { width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", fontSize: "24px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" },
  statusDot: { position: "absolute", bottom: "4px", right: "4px", width: "14px", height: "14px", borderRadius: "50%", border: "2px solid #131728" },
  profileInfo: { flex: 1 },
  profileName: { color: "#f1f5f9", fontSize: "22px", fontWeight: "700", marginBottom: "10px" },
  profileMeta: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" },
  metaChip: { background: "#1e2442", color: "#94a3b8", fontSize: "12px", padding: "4px 10px", borderRadius: "20px" },
  badgesRow: { display: "flex", gap: "8px", flexWrap: "wrap" },
  badge: { background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)", color: "#818cf8", fontSize: "12px", fontWeight: "600", padding: "4px 12px", borderRadius: "20px" },
  noBadge: { color: "#475569", fontSize: "13px" },
  ringWrap: { position: "relative", width: "140px", height: "140px" },
  ringInner: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center" },
  ringScore: { fontSize: "28px", fontWeight: "800", display: "block" },
  ringLabel: { fontSize: "11px", color: "#64748b", display: "block", marginTop: "2px" },
  tabs: { display: "flex", gap: "8px", background: "#131728", border: "1px solid #1e2442", borderRadius: "14px", padding: "6px" },
  tab: { flex: 1, padding: "10px", background: "transparent", border: "none", color: "#64748b", fontSize: "13px", fontWeight: "600", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s" },
  tabActive: { background: "rgba(99,102,241,0.15)", color: "#818cf8" },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" },
  card: { background: "#131728", border: "1px solid #1e2442", borderRadius: "16px", padding: "24px" },
  cardTitle: { color: "#e2e8f0", fontSize: "15px", fontWeight: "700", marginBottom: "12px" },
  cardDivider: { height: "1px", background: "#1e2442", marginBottom: "20px" },
  reputationRow: { display: "flex", justifyContent: "space-around" },
  repItem: { display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" },
  repScore: { fontSize: "32px", fontWeight: "800" },
  repLabel: { color: "#64748b", fontSize: "12px" },
  miniBarWrap: { display: "flex", flexDirection: "column", gap: "5px", marginBottom: "8px" },
  miniBarTop: { display: "flex", justifyContent: "space-between" },
  miniBarLabel: { color: "#94a3b8", fontSize: "12px" },
  miniBarValue: { color: "#e2e8f0", fontSize: "12px", fontWeight: "600" },
  miniBarBg: { height: "5px", background: "#1e2442", borderRadius: "10px", overflow: "hidden" },
  miniBarFill: { height: "100%", borderRadius: "10px", transition: "width 0.8s ease" },
  categoryHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" },
  categoryLeft: { display: "flex", alignItems: "center", gap: "10px" },
  categoryIcon: { fontSize: "22px" },
  categoryName: { color: "#e2e8f0", fontSize: "16px", fontWeight: "700" },
  categoryCount: { background: "#1e2442", color: "#64748b", fontSize: "11px", padding: "2px 8px", borderRadius: "10px" },
  expandIcon: { color: "#475569", fontSize: "12px" },
  skillRow: { background: "#0f1323", border: "1px solid #1e2442", borderRadius: "12px", padding: "16px" },
  skillHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  skillNameText: { color: "#e2e8f0", fontSize: "15px", fontWeight: "700", display: "block" },
  skillSub: { color: "#475569", fontSize: "12px", display: "block", marginTop: "2px" },
  skillMeta: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" },
  skillScore: { fontSize: "15px", fontWeight: "700" },
  skillCount: { color: "#475569", fontSize: "11px" },
  commentsSection: { marginTop: "12px" },
  commentsTitle: { color: "#64748b", fontSize: "12px", fontWeight: "600", marginBottom: "8px" },
  commentBubble: { background: "#131728", border: "1px solid #1e2442", borderRadius: "8px", padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" },
  commentText: { color: "#94a3b8", fontSize: "13px", fontStyle: "italic" },
  commentDate: { color: "#475569", fontSize: "11px", whiteSpace: "nowrap", marginLeft: "12px" },
  ratingRow: { background: "#0f1323", border: "1px solid #1e2442", borderRadius: "12px", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" },
  ratingTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  ratingLeft: { display: "flex", flexDirection: "column", gap: "3px" },
  sessionId: { color: "#e2e8f0", fontSize: "14px", fontWeight: "600" },
  ratingSkillTag: { background: "#1e2442", color: "#818cf8", fontSize: "11px", padding: "2px 8px", borderRadius: "6px", display: "inline-block", width: "fit-content" },
  ratingDate: { color: "#475569", fontSize: "12px" },
  ratingCriteria: { display: "flex", gap: "6px", flexWrap: "wrap" },
  criteriaChip: { background: "#1e2442", color: "#94a3b8", fontSize: "11px", padding: "3px 8px", borderRadius: "6px" },
  avgBadge: { padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "700" },
  ratingComment: { color: "#64748b", fontSize: "13px", fontStyle: "italic", background: "#131728", border: "1px solid #1e2442", borderRadius: "8px", padding: "8px 12px" },
  emptyText: { color: "#475569", fontSize: "14px", textAlign: "center", padding: "20px" },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" },
  statCard: { background: "#0f1323", border: "1px solid #1e2442", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", textAlign: "center" },
  statIcon: { fontSize: "24px" },
  statValue: { color: "#f1f5f9", fontSize: "18px", fontWeight: "700" },
  statLabel: { color: "#64748b", fontSize: "11px" },
};