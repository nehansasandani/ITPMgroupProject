import { useState, useEffect, useMemo, useRef } from "react";
import { getReputation, getUserRatings } from "../../api/Reputation.js";
import { getMySkills, addSkill, removeSkill } from "../../api/skillApi.js";
import axiosInstance from "../../api/axiosInstance.js";
import { useAuth } from "../../context/AuthContext";
import { FiCheckCircle, FiPlus, FiTrash2, FiAward, FiMessageSquare, FiClock, FiActivity, FiStar, FiEdit3, FiX, FiLock, FiUnlock, FiShield, FiGithub, FiLinkedin, FiBarChart2, FiTrendingUp, FiBook, FiMenu, FiCpu } from "react-icons/fi";
import SkillQuizModal from "../../components/SkillQuizModal";
import ReputationTimeline from "../../components/reputation/ReputationTimeline";
import ScoreVisibilitySettings from "../../components/reputation/ScoreVisibilitySettings";
import ReputationInsights from "../../components/reputation/ReputationInsights";
import ReputationDashboard from "../../components/reputation/ReputationDashboard";

const ALL_SYSTEM_BADGES = [
  { id: "Reliable", icon: <FiCheckCircle />, desc: "High consistency in attending tasks.", requirement: "Complete 10+ tasks with zero no-shows.", color: "text-emerald-500", glow: "shadow-emerald-500/50" },
  { id: "Top Communicator", icon: <FiMessageSquare />, desc: "Rated 5 stars in communication by peers.", requirement: "Maintain a 4.5+ average in Communication.", color: "text-blue-400", glow: "shadow-blue-500/50" },
  { id: "Top Contributor", icon: <FiAward />, desc: "Outstanding effort and value provided.", requirement: "Maintain a 4.5+ average in Effort.", color: "text-amber-400", glow: "shadow-amber-500/50" },
  { id: "Punctual", icon: <FiClock />, desc: "Always on time.", requirement: "Maintain a 4.5+ average in Time Commitment.", color: "text-violet-400", glow: "shadow-violet-500/50" },
];

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

const getScoreTierInfo = (score) => {
  if (score >= 80) return { title: "Elite", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" };
  if (score >= 60) return { title: "Trusted", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/30" };
  if (score >= 40) return { title: "Standard", color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/30" };
  return { title: "Probation", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/30" };
};

const CircularScoreGauge = ({ score }) => {
  const radius = 60;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const tier = getScoreTierInfo(score);

  return (
    <div className="relative flex items-center justify-center scale-110">
      <svg height={radius * 2} width={radius * 2} className="rotate-[-90deg]">
        <circle stroke="#1e293b" fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
        <circle 
          stroke="currentColor" fill="transparent" 
          strokeDasharray={`${circumference} ${circumference}`} 
          style={{ strokeDashoffset, filter: "drop-shadow(0px 0px 4px currentColor)" }} 
          strokeWidth={stroke} strokeLinecap="round" r={normalizedRadius} cx={radius} cy={radius} 
          className={`${tier.color} transition-all duration-1000 ease-out`} 
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tighter">{score}</span>
      </div>
    </div>
  );
};

export default function UserProfile() {
  const { user, login } = useAuth();
  const [reputation, setReputation] = useState({ score: 50, noShowCount: 0, cooldownUntil: null, badges: [], categoryScores: [] });
  const [ratings, setRatings] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  // Edit Profile States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editGithub, setEditGithub] = useState("");
  const [editLinkedin, setEditLinkedin] = useState("");
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [previewPic, setPreviewPic] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Premium Skill Selection Flow
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [selectionStep, setSelectionStep] = useState(0); // 0: Category, 1: SubCategory, 2: Skill, 3: Expertise
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("Beginner");
  
  // Quiz Modal States
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [activeSkillForQuiz, setActiveSkillForQuiz] = useState({ name: "", id: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user?.id) return;
        setEditBio(user.bio || "");
        setEditGithub(user.githubUrl || "");
        setEditLinkedin(user.linkedinUrl || "");
        if (user.profilePic) {
          setPreviewPic(`/src/pages/images/${user.profilePic}`);
        }
        const [repData, ratingsData, skillsData] = await Promise.all([
          getReputation(user.id),
          getUserRatings(user.id),
          getMySkills()
        ]);
        setReputation(repData);
        setRatings(ratingsData);
        if (skillsData.skills) setSkills(skillsData.skills);
      } catch (err) {
        console.error("Failed to fetch profile data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // Reset child categories on parent change
  useEffect(() => {
    setSelectedSubCategory("");
    setSelectedSkill("");
  }, [selectedCategory]);

  useEffect(() => {
    setSelectedSkill("");
  }, [selectedSubCategory]);

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setSidebarOpen(false);
      }
    };
    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen]);

  const subCategories = selectedCategory ? Object.keys(SKILL_CATEGORIES[selectedCategory]) : [];
  const skillOptions = selectedCategory && selectedSubCategory ? SKILL_CATEGORIES[selectedCategory][selectedSubCategory] : [];

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) return alert("Only image files are allowed.");
      setProfilePicFile(file);
      setPreviewPic(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    setFormErrors({});
    const errors = {};

    if (editBio && editBio.length > 200) {
      errors.bio = "Bio must be 200 characters or less.";
    }

    const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+/i;
    if (editGithub && !githubRegex.test(editGithub)) {
      errors.githubUrl = "Invalid GitHub URL. Must be like: https://github.com/username";
    }

    const linkedinRegex = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in\/)?[a-zA-Z0-9_-]+/i;
    if (editLinkedin && !linkedinRegex.test(editLinkedin)) {
      errors.linkedinUrl = "Invalid LinkedIn URL. Must be like: https://www.linkedin.com/in/username";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSavingName(true);
    let finalPicName = user.profilePic;

    try {
      if (profilePicFile) {
        const formData = new FormData();
        formData.append("image", profilePicFile);
        const uploadRes = await axiosInstance.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        finalPicName = uploadRes.data.image;
      }

      const res = await axiosInstance.put("/users/me", { 
        bio: editBio, 
        githubUrl: editGithub, 
        linkedinUrl: editLinkedin,
        profilePic: finalPicName
      });
      login(res.data); // Update global auth context
      setIsEditingProfile(false);
      setProfilePicFile(null);
      setFormErrors({});
    } catch (err) {
      alert("Failed to update profile: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSavingName(false);
    }
  };

  const handleAddSkill = async (e) => {
    if (e) e.preventDefault();
    if (!selectedCategory || !selectedSubCategory || !selectedSkill) return;

    try {
      const data = await addSkill({
        category: selectedCategory,
        subCategory: selectedSubCategory,
        skill: selectedSkill,
        level: selectedLevel
      });
      setSkills(data.skills);
      setIsAddingSkill(false);
      setSelectionStep(0);
      setSelectedCategory("");
      setSelectedLevel("Beginner");
    } catch (err) {
      alert("Error adding skill: " + (err.response?.data?.message || err.message));
    }
  };

  const toggleAddSkill = () => {
    if (isAddingSkill) {
      setIsAddingSkill(false);
      setSelectionStep(0);
      setSelectedCategory("");
      setSelectedSubCategory("");
      setSelectedSkill("");
    } else {
      setIsAddingSkill(true);
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm("Remove this skill?")) return;
    try {
      const data = await removeSkill(id);
      setSkills(data.skills);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePassQuiz = (updatedSkills) => {
    setSkills(updatedSkills);
  };

  const getSkillAverage = useMemo(() => {
    return (skillName) => {
      const relatedRatings = ratings.filter(r => r.skillName === skillName);
      if (relatedRatings.length === 0) return null;
      let total = 0;
      relatedRatings.forEach(r => {
        total += (r.clarity + r.effort + r.timeCommitment + r.communication) / 4;
      });
      return (total / relatedRatings.length).toFixed(1);
    };
  }, [ratings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const isCooledDown = reputation.cooldownUntil && new Date(reputation.cooldownUntil) > new Date();
  const tierInfo = getScoreTierInfo(reputation.score);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20 fade-up relative">
      
      {/* Hamburger Menu Button - Fixed Top Left (Mobile) */}
      <div className="lg:hidden fixed top-20 left-4 z-40">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`flex items-center justify-center w-12 h-12 rounded-xl transition ${
            sidebarOpen 
              ? "bg-indigo-500 text-slate-900 dark:text-white" 
              : "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30"
          }`}
          title="Toggle sidebar menu"
        >
          <FiMenu size={24} />
        </button>
      </div>

      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-800 rounded-t-3xl overflow-hidden shadow-2xl relative">
        <div className="h-40 bg-linear-to-r from-indigo-900 via-indigo-800 to-slate-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-300 via-slate-900 to-black"></div>
          {/* Decorative glowing orb */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40"></div>
        </div>
        
        <div className="px-6 md:px-10 pb-8 pt-20 md:pt-20 relative">
          <div className="absolute -top-16 left-6 md:left-10 w-32 h-32 rounded-full border-4 border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-5xl text-slate-900 dark:text-white font-bold shadow-2xl shadow-black/80 z-10 overflow-hidden">
            {user.profilePic ? (
              <img src={`/src/pages/images/${user.profilePic}`} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user.fullName.charAt(0)
            )}
          </div>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between mt-4 gap-6">
            <div className="md:ml-2">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                {user.fullName}
                <button onClick={() => setIsEditingProfile(true)} className="text-slate-400 hover:text-indigo-400 transition ml-2 p-1" title="Edit Profile">
                  <FiEdit3 size={18} />
                </button>
              </h1>
              <p className="text-slate-400 mt-1 ">{user.role} &bull; {user.studentId}</p>

              {user.bio && (
                <p className="text-sm text-slate-300 mt-3 max-w-2xl leading-relaxed italic border-l-2 border-slate-700 pl-3">"{user.bio}"</p>
              )}

              <div className="flex gap-4 mt-3">
                {user.githubUrl && (
                  <a href={user.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                    <FiGithub /> GitHub
                  </a>
                )}
                {user.linkedinUrl && (
                  <a href={user.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                    <FiLinkedin /> LinkedIn
                  </a>
                )}
              </div>
              
              {/* Badges & Verified Skills Row */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full border ${tierInfo.color} ${tierInfo.bg} ${tierInfo.border}`}>
                  {tierInfo.title} Member
                </span>
                
                {reputation.badges.slice(0, 3).map(b => (
                  <span key={b} className="text-xl drop-shadow-md ml-1" title={b}>{ALL_SYSTEM_BADGES.find(x => x.id === b)?.icon}</span>
                ))}

                <div className="w-px h-4 bg-slate-700 mx-2 hidden sm:block"></div>

                {skills.filter(s => s.isVerified).map(s => (
                  <span key={s._id} className="group px-3 py-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5 uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:border-emerald-500/40 transition-all duration-300">
                    <FiCheckCircle size={12} className="animate-pulse" /> {s.skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="hidden"></div>
      </div>

      {/* 2. Content Sections with Sidebar Layout */}
      <div className="mt-6 relative">
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* SIDEBAR - Navigation */}
        <div 
          ref={sidebarRef}
          className={`lg:col-span-1 fixed lg:relative left-0 top-0 h-full lg:h-auto w-64 lg:w-auto z-40 transition-all duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-800 rounded-3xl p-4 sticky top-20 shadow-lg lg:shadow-none lg:border-l-0 lg:rounded-none">
            {/* Close button on mobile */}
            <div className="lg:hidden flex justify-between items-center mb-4 pb-4 border-b border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Navigation</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition p-1"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="space-y-2">
              {[
                { id: "Dashboard", label: "Dashboard", icon: <FiActivity size={18} /> },
                { id: "Skills Portfolio", label: "Skills Portfolio", icon: <FiBook size={18} /> },
                { id: "Trophy Room", label: "Trophy Room", icon: <FiAward size={18} /> },
                { id: "Performance History", label: "Performance History", icon: <FiBarChart2 size={18} /> },
                { id: "AI Insights", label: "AI Reputation Guide", icon: <FiCpu size={18} /> }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition font-medium text-sm ${
                    activeTab === item.id
                      ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-500/10"
                      : "text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT - Dynamic based on activeTab */}
        <div className="lg:col-span-3 animate-in slide-in-from-bottom-4 duration-300">
        
        {/* ================= DASHBOARD TAB (DEFAULT) ================= */}
        {activeTab === "Dashboard" && (
          <div className="space-y-6">
            
            {/* Top Row: Score Card & Quick Metrics */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Score Card */}
              <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <FiActivity size={100} />
                </div>
                <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-6 z-10">Reputation Score</h3>
                <div className="z-10 mb-4">
                  <CircularScoreGauge score={reputation.score} />
                </div>
                <p className="text-slate-300 text-sm mt-4 z-10 leading-relaxed">
                  Based on peer feedback, reliability, and contribution.
                </p>
              </div>

              {/* Quick Metrics - Vertical Stack */}
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-800 rounded-3xl p-6">
                  <div className="text-3xl font-bold font-mono text-slate-900 dark:text-white mb-2">{ratings.length}</div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Total Ratings</div>
                </div>
                <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-800 rounded-3xl p-6">
                  <div className="text-3xl font-bold font-mono text-emerald-400 mb-2">{skills.filter(s=>s.isVerified).length}</div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Verified Skills</div>
                </div>
                <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-800 rounded-3xl p-6">
                  <div className="text-3xl font-bold font-mono text-orange-400 mb-2">{reputation.noShowCount}</div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Penalty Strikes</div>
                </div>
              </div>
            </div>

            {/* Analytics Dashboard with Charts */}
            <div>
              <ReputationDashboard 
                reputation={reputation} 
                ratings={ratings} 
                skills={skills} 
              />
            </div>

            {/* Health Status Card */}
            <div className={`border rounded-3xl p-6 relative overflow-hidden ${isCooledDown ? 'border-red-500/30 bg-red-500/5' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
              <div className="flex items-center gap-3 mb-4">
                <FiShield className={`text-2xl ${isCooledDown ? 'text-red-500' : 'text-emerald-500'}`} />
                <h3 className={`font-bold ${isCooledDown ? 'text-red-500' : 'text-emerald-500'}`}>Account Health</h3>
              </div>
              {isCooledDown ? (
                <>
                  <p className="text-sm text-red-400 font-medium mb-2">Restricted Action Required</p>
                  <p className="text-xs text-red-500/80 mb-4">You are currently suspended due to accumulating No-Shows. You cannot apply for tasks.</p>
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 text-center">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Lifts On</span>
                    <div className="font-mono font-bold text-slate-900 dark:text-white mt-1">{new Date(reputation.cooldownUntil).toLocaleString()}</div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-emerald-400 font-medium mb-1">Status: Excellent Standing</p>
                  <p className="text-xs text-slate-400">Your account is active and ready for collaborations.</p>
                </>
              )}
            </div>

            {/* AI Reputation Insights */}
            <div>
              <ReputationInsights userId={user?.id} />
            </div>

            {/* Recent Endorsements */}
            <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-800 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Recent Endorsements</h2>
              <div className="space-y-4">
                {ratings.filter(r => r.comment).length === 0 ? (
                  <div className="text-slate-500 text-center py-6 border border-dashed border-slate-700 rounded-xl">No written reviews received yet.</div>
                ) : (
                  ratings.filter(r => r.comment).slice(0, 3).map((r, i) => (
                    <div key={i} className="p-5 bg-slate-100 dark:bg-slate-800/40 border-l-4 border-l-indigo-500 rounded-r-xl rounded-l-md text-slate-300">
                      <p className="italic text-sm">"{r.comment}"</p>
                      <div className="flex items-center gap-4 mt-3">
                        <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                        <span className="text-[11px] font-bold text-amber-500">{((r.clarity+r.effort+r.timeCommitment+r.communication)/4).toFixed(1)} ★</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* ================= SKILLS PORTFOLIO TAB ================= */}
        {activeTab === "Skills Portfolio" && (
          <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Skills & Certifications</h2>
                <p className="text-sm text-slate-400">Map your technical proficiencies and verify them to build trust.</p>
              </div>
              <button 
                onClick={toggleAddSkill}
                className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-slate-900 dark:text-white hover:bg-indigo-600 rounded-xl transition shadow-lg shadow-indigo-500/20 font-medium text-sm"
              >
                {isAddingSkill ? <FiX size={18} /> : <FiPlus className="text-lg" />} 
                {isAddingSkill ? "Cancel" : "Add New Skill"}
              </button>
            </div>

            {/* Multi-Step Premium Skill Selector */}
            {isAddingSkill && (
              <div className="mb-10 p-0.5 bg-slate-100 dark:bg-slate-800/10 border border-slate-800/50 rounded-3xl overflow-hidden animate-in zoom-in-95 duration-500 shadow-2xl">
                <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none rounded-[1.4rem] p-6 md:p-8 border border-white/5">
                  
                  {/* Step Indicators / Breadcrumbs */}
                  <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                      { label: "Category", value: selectedCategory },
                      { label: "Subcategory", value: selectedSubCategory },
                      { label: "Skill", value: selectedSkill },
                      { label: "Expertise", value: selectedLevel }
                    ].map((step, idx) => (
                      <div key={idx} className="flex items-center shrink-0">
                        <button 
                          onClick={() => idx < selectionStep && setSelectionStep(idx)}
                          disabled={idx >= selectionStep}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                            selectionStep === idx 
                              ? "bg-indigo-500 text-slate-900 dark:text-white shadow-lg shadow-indigo-500/20" 
                              : idx < selectionStep ? "text-indigo-400 hover:bg-indigo-500/10 cursor-pointer" : "text-slate-600 cursor-default"
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${selectionStep === idx ? "border-white/40" : "border-current"}`}>
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider">
                            {idx < selectionStep ? step.value : step.label}
                          </span>
                        </button>
                        {idx < 3 && <div className={`w-8 h-px mx-1 ${idx < selectionStep ? "bg-indigo-500/50" : "bg-slate-100 dark:bg-slate-800"}`}></div>}
                      </div>
                    ))}
                  </div>

                  {/* STEP 0: Category Selection */}
                  {selectionStep === 0 && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Select a Field</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.keys(SKILL_CATEGORIES).map(cat => (
                          <button
                            key={cat}
                            onClick={() => { setSelectedCategory(cat); setSelectionStep(1); }}
                            className="group p-4 bg-slate-100 dark:bg-slate-800/20 border border-slate-800 hover:border-indigo-500/30 hover:bg-indigo-500/5 rounded-xl transition-all text-center flex flex-col items-center gap-3"
                          >
                            <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                              <FiActivity size={20} />
                            </div>
                            <span className="text-xs font-bold text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">{cat}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 1: Subcategory Selection */}
                  {selectionStep === 1 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <button onClick={() => setSelectionStep(0)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition text-slate-500 hover:text-slate-900 dark:hover:text-white"><FiEdit3 size={16} /></button>
                        Select Specialty
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {subCategories.map(sub => (
                          <button
                            key={sub}
                            onClick={() => { setSelectedSubCategory(sub); setSelectionStep(2); }}
                            className="px-5 py-3 bg-slate-100 dark:bg-slate-800/20 border border-slate-800 hover:border-indigo-500/30 hover:bg-indigo-500/5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold transition-all text-xs"
                          >
                            {sub}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Skill Selection */}
                  {selectionStep === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Which technology?</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {skillOptions.map(opt => (
                          <button
                            key={opt}
                            onClick={() => { setSelectedSkill(opt); setSelectionStep(3); }}
                            className="p-3 bg-slate-100 dark:bg-slate-800/20 border border-slate-800 hover:border-indigo-500/30 hover:bg-indigo-500/5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold transition-all text-xs flex items-center justify-center gap-2"
                          >
                            {opt}
                          </button>
                        ))}
                        {/* Fallback for "Other" if needed */}
                        <div className="col-span-full mt-4 p-4 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500">
                          Looking for something else? We'll be adding more skills soon.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Expertise Picker */}
                  {selectionStep === 3 && (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 text-center">Self-Assessment: <span className="text-indigo-400">{selectedSkill}</span></h3>
                      <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        {[
                          { id: "Beginner", icon: <FiUnlock />, desc: "Focusing on fundamentals and learning the basics." },
                          { id: "Intermediate", icon: <FiShield />, desc: "Comfortable with daily tasks and problem solving." },
                          { id: "Expert", icon: <FiAward />, desc: "Deep architectural knowledge and mentoring skills." }
                        ].map((lvl) => (
                          <button
                            key={lvl.id}
                            onClick={() => setSelectedLevel(lvl.id)}
                            className={`p-5 rounded-2xl border transition-all flex flex-col items-center text-center gap-3 ${
                              selectedLevel === lvl.id 
                                ? "bg-indigo-500/5 border-indigo-500/50 shadow-sm" 
                                : "bg-slate-100 dark:bg-slate-800/20 border-slate-800 hover:border-slate-700"
                            }`}
                          >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${selectedLevel === lvl.id ? "bg-indigo-500 text-slate-900 dark:text-white" : "bg-white dark:bg-slate-900 shadow-sm dark:shadow-none text-slate-500"}`}>
                              {lvl.icon}
                            </div>
                            <div>
                              <div className={`font-bold text-sm uppercase tracking-widest mb-1 ${selectedLevel === lvl.id ? "text-indigo-400" : "text-slate-300"}`}>{lvl.id}</div>
                              <p className="text-[10px] text-slate-500 leading-relaxed leading-tight">{lvl.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="mt-10 flex justify-center gap-4">
                        <button 
                          onClick={() => setSelectionStep(2)} 
                          className="px-8 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-900 dark:hover:text-white transition font-medium"
                        >
                          Back
                        </button>
                        <button 
                          onClick={handleAddSkill} 
                          className="px-10 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-slate-900 dark:text-white font-bold transition shadow-xl shadow-indigo-500/20"
                        >
                          Finalize Portfolio Addition
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* Render Skill Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {skills.length === 0 ? (
                <div className="md:col-span-full border-2 border-dashed border-slate-700 rounded-3xl p-12 text-center flex flex-col items-center">
                  <FiAward className="text-6xl text-slate-600 mb-4" />
                  <p className="text-slate-400 text-lg">Your portfolio is currently empty.</p>
                </div>
              ) : (
                skills.map(s => {
                  const avg = getSkillAverage(s.skill);
                  return (
                    <div key={s._id} className="group relative flex flex-col p-6 bg-slate-100 dark:bg-slate-800/40 border border-slate-700 hover:border-slate-500 rounded-2xl transition overflow-hidden">
                      {s.isVerified && <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full pointer-events-none"></div>}
                      
                      <div className="flex items-start justify-between mb-4 z-10">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-slate-900 dark:text-white font-bold text-xl">{s.skill}</h3>
                            {s.isVerified && <FiCheckCircle className="text-emerald-400 drop-shadow-md" title="Verified Skill" size={18} />}
                          </div>
                          <span className="inline-block px-2 py-0.5 bg-slate-700/50 text-slate-300 text-[10px] uppercase tracking-wider font-semibold rounded">{s.category} / {s.subCategory}</span>
                        </div>
                        <button onClick={() => handleDeleteSkill(s._id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition p-1.5 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none/50 rounded-lg">
                          <FiTrash2 />
                        </button>
                      </div>

                      <div className="mt-auto grid grid-cols-2 gap-4 border-t border-slate-700/60 pt-4 z-10">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest mb-1 font-semibold">Peer Rating</span>
                          {avg ? (
                            <div className="flex items-center gap-1 text-amber-400">
                              <FiStar className="fill-amber-400" size={14} />
                              <span className="font-mono font-bold text-lg leading-none">{avg}</span><span className="text-slate-500 text-xs">/5</span>
                            </div>
                          ) : <span className="text-xs text-slate-500 mt-0.5 italic">None yet</span>}
                        </div>
                        <div className="flex flex-col items-end justify-center">
                          {!s.isVerified ? (
                            <button onClick={() => { setActiveSkillForQuiz({ name: s.skill, id: s._id }); setQuizModalOpen(true); }} className="px-4 py-2 text-xs font-bold bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500 hover:text-slate-900 dark:hover:text-white border border-indigo-500/30 rounded-lg transition text-center shadow-sm w-full">Verify Now</button>
                          ) : (
                            <span className="px-4 py-2 text-xs font-bold text-emerald-400 bg-emerald-400/5 border border-emerald-500/20 rounded-lg text-center w-full uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[inset_0_0_10px_rgba(16,185,129,0.05)]">
                              <FiCheckCircle className="animate-in zoom-in duration-500" /> Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ================= TROPHY ROOM TAB ================= */}
        {activeTab === "Trophy Room" && (
          <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-800 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 relative z-10">Trophy Room</h2>
            <p className="text-sm text-slate-400 mb-10 relative z-10">Unlock prestige badges by maintaining excellent collaborative ratings.</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {/* Verified Expertise Summary Card */}
              <div className={`relative flex flex-col items-center p-8 rounded-3xl border transition-all duration-500 bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]`}>
                <div className="text-6xl mb-6 flex items-center justify-center text-emerald-400 drop-shadow-lg">
                  <FiAward />
                </div>
                <h3 className="text-lg font-bold text-center mb-2 text-slate-900 dark:text-white">Expertise</h3>
                <p className="text-xs text-center text-slate-400 mb-4">{skills.filter(s => s.isVerified).length} Verified Skills</p>
                <div className="mt-auto w-full pt-4 border-t border-emerald-500/10">
                  <p className="text-[10px] text-center font-semibold uppercase tracking-wider text-emerald-400">Certifications Earned</p>
                </div>
              </div>

              {ALL_SYSTEM_BADGES.map(badgeDef => {
                const earned = reputation.badges.includes(badgeDef.id);
                return (
                  <div key={badgeDef.id} className={`relative flex flex-col items-center p-8 rounded-3xl border transition-all duration-500 ${earned ? `bg-slate-100 dark:bg-slate-800/80 border-slate-700 shadow-xl ${badgeDef.glow}` : 'bg-white dark:bg-slate-900 shadow-sm dark:shadow-none/50 border-slate-800/50 grayscale opacity-60'}`}>
                    {/* Earned/Locked Status Icon */}
                    <div className="absolute top-4 right-4">
                      {earned ? <FiUnlock className="text-slate-500" /> : <FiLock className="text-slate-600" />}
                    </div>

                    <div className={`text-6xl mb-6 flex items-center justify-center drop-shadow-2xl ${earned ? badgeDef.color : 'text-slate-600'}`}>
                      {badgeDef.icon}
                    </div>
                    
                    <h3 className={`text-lg font-bold text-center mb-2 ${earned ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{badgeDef.id}</h3>
                    <p className="text-xs text-center text-slate-400 mb-4">{badgeDef.desc}</p>
                    
                    <div className={`mt-auto w-full pt-4 border-t ${earned ? 'border-slate-700/50' : 'border-slate-800'}`}>
                      <p className={`text-[10px] text-center font-semibold uppercase tracking-wider ${earned ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {earned ? "Achievement Unlocked" : `Requirement: ${badgeDef.requirement}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= PERFORMANCE HISTORY TAB ================= */}
        {activeTab === "Performance History" && (
          <div className="grid lg:grid-cols-2 gap-6">
            
            {/* Left: Overall Averages Visualized */}
            <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-800 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8">Performance Spectrum</h2>
              {ratings.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-6">Data gathering in progress. Complete tasks to see your spectrum.</p>
              ) : (
                <div className="space-y-6 lg:px-4">
                  {[
                    { key: "clarity", color: "from-blue-500 to-cyan-400", bg: "bg-blue-500/10", border: "border-blue-500/20", txt: "text-blue-400" },
                    { key: "effort", color: "from-amber-500 to-orange-400", bg: "bg-amber-500/10", border: "border-amber-500/20", txt: "text-amber-400" },
                    { key: "timeCommitment", color: "from-violet-500 to-fuchsia-400", bg: "bg-violet-500/10", border: "border-violet-500/20", txt: "text-violet-400" },
                    { key: "communication", color: "from-emerald-500 to-teal-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", txt: "text-emerald-400" }
                  ].map((field) => {
                    const avg = (ratings.reduce((s, r) => s + r[field.key], 0) / ratings.length).toFixed(1);
                    return (
                      <div key={field.key} className="relative group">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-300 font-bold tracking-wide">
                            {field.key.charAt(0).toUpperCase() + field.key.slice(1).replace("Commitment", " Commitment")}
                          </span>
                          <span className={`font-mono font-bold px-2 py-0.5 rounded border ${field.bg} ${field.border} ${field.txt}`}>
                            {avg} / 5.0
                          </span>
                        </div>
                        <div className="w-full h-4 bg-slate-50 dark:bg-slate-950 rounded-full overflow-hidden shadow-inner flex border border-white/5">
                          <div 
                            className={`h-full bg-linear-to-r ${field.color} rounded-full transition-all duration-1000 ease-out`} 
                            style={{ width: `${(avg / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Historical Timeline */}
            <div className="bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-800 rounded-3xl p-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Rating Timeline</h2>
              <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pr-2">
                {ratings.length === 0 ? (
                  <div className="text-slate-500 text-center py-12 border border-dashed border-slate-800 rounded-2xl">No ratings recorded on tasks.</div>
                ) : (
                  ratings.map((r, i) => (
                    <div key={i} className="p-5 bg-slate-100 dark:bg-slate-800/40 border border-slate-700/60 rounded-2xl transition hover:bg-slate-100 dark:hover:bg-slate-800">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="inline-block px-2.5 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] uppercase font-bold tracking-wider rounded border border-indigo-500/20 mb-2">
                            {r.skillName || "General task"}
                          </span>
                          <div className="text-[11px] text-slate-400 font-medium">{new Date(r.createdAt).toLocaleString()}</div>
                        </div>
                        <div className="text-lg font-bold font-mono text-slate-900 dark:text-white bg-white dark:bg-slate-900 shadow-sm dark:shadow-none px-3 py-1.5 rounded-lg border border-slate-700 shadow-inner flex items-center gap-1.5">
                          <FiStar className="fill-amber-400 text-amber-400" size={14} />
                          {((r.clarity + r.effort + r.timeCommitment + r.communication) / 4).toFixed(1)}
                        </div>
                      </div>
                      {r.comment && (
                        <div className="text-sm text-slate-300 italic mb-4 bg-white dark:bg-slate-900 shadow-sm dark:shadow-none/50 p-4 rounded-xl border border-slate-800 border-l-2 border-l-indigo-400">
                          "{r.comment}"
                        </div>
                      )}
                      <div className="flex justify-between border-t border-slate-700/50 pt-3 flex-wrap gap-2">
                        {["clarity", "effort", "timeCommitment", "communication"].map((f) => (
                          <div key={f} className="flex gap-1.5 items-center">
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest">{f.substring(0,4)}</span>
                            <span className="text-xs text-slate-300 font-bold font-mono">{r[f]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div> 

            {/* Reputation Timeline - Full Width */}
            <div>
              <ReputationTimeline userId={user?.id} />
            </div>
          </div>
        )}

        {/* ================= AI INSIGHTS TAB ================= */}
        {activeTab === "AI Insights" && (
          <div className="space-y-6">
            <ReputationInsights userId={user?.id} />
          </div>
        )}
        </div>
        </div>
      </div>

      {/* ================= EDIT PROFILE MODAL ================= */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 shadow-sm dark:shadow-none border border-slate-700 rounded-3xl shadow-2xl p-8 relative">
            <button onClick={() => { setIsEditingProfile(false); setFormErrors({}); }} className="absolute top-6 right-6 text-slate-500 hover:text-slate-900 dark:hover:text-white transition">
              <FiX size={24} />
            </button>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Edit Profile</h2>
            <p className="text-slate-400 text-sm mb-6">Update your professional bio and links.</p>

            <div className="flex flex-col items-center gap-2 mb-6">
              <label className="relative w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden group cursor-pointer shadow-lg hover:border-indigo-500 transition">
                {previewPic ? (
                  <img src={previewPic} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-slate-500">{user.fullName.charAt(0)}</span>
                )}
                <div className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center transition">
                  <FiEdit3 className="text-slate-900 dark:text-white text-xl" />
                </div>
                <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handlePicChange} />
              </label>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Change Avatar</p>
            </div>
            
            <div className="flex flex-col gap-4 mb-8">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">About Me (Bio)</label>
                  <span className={`text-[10px] font-mono ${editBio.length > 200 ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                    {editBio.length}/200
                  </span>
                </div>
                <textarea 
                  value={editBio} 
                  onChange={e => setEditBio(e.target.value)} 
                  className={`bg-slate-50 dark:bg-slate-950 border p-3 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 transition resize-none h-24 text-sm ${(formErrors.bio || editBio.length > 200) ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500'}`}
                  placeholder="Tell peers what you're best at..."
                />
                {formErrors.bio && <span className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium bg-red-500/10 p-2 rounded-lg border border-red-500/20">{formErrors.bio}</span>}
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1"><FiGithub /> GitHub URL</label>
                <input 
                  type="url" 
                  value={editGithub} 
                  onChange={e => setEditGithub(e.target.value)} 
                  className={`bg-slate-50 dark:bg-slate-950 border px-4 py-2.5 rounded-xl text-slate-900 dark:text-white outline-none transition text-sm ${formErrors.githubUrl ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-700 focus:border-indigo-500'}`}
                  placeholder="https://github.com/username"
                />
                {formErrors.githubUrl && <span className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium bg-red-500/10 p-2 rounded-lg border border-red-500/20">{formErrors.githubUrl}</span>}
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-1"><FiLinkedin /> LinkedIn URL</label>
                <input 
                  type="url" 
                  value={editLinkedin} 
                  onChange={e => setEditLinkedin(e.target.value)} 
                  className={`bg-slate-50 dark:bg-slate-950 border px-4 py-2.5 rounded-xl text-slate-900 dark:text-white outline-none transition text-sm ${formErrors.linkedinUrl ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-slate-700 focus:border-indigo-500'}`}
                  placeholder="https://linkedin.com/in/username"
                />
                {formErrors.linkedinUrl && <span className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium bg-red-500/10 p-2 rounded-lg border border-red-500/20">{formErrors.linkedinUrl}</span>}
              </div>
            </div>

            {/* Score Visibility Settings */}
            <div className="mt-8 pt-8 border-t border-slate-700">
              <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FiShield size={16} /> Privacy & Visibility Settings
              </h3>
              <ScoreVisibilitySettings userId={user?.id} />
            </div>

            <button 
              onClick={handleSaveProfile} 
              disabled={isSavingName}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 text-slate-900 dark:text-white font-bold rounded-xl transition disabled:opacity-50 shadow-lg shadow-indigo-500/20"
            >
              {isSavingName ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Quiz Modal Integration */}
      <SkillQuizModal 
        isOpen={quizModalOpen} 
        onClose={() => setQuizModalOpen(false)} 
        skillName={activeSkillForQuiz.name}
        skillId={activeSkillForQuiz.id}
        onPass={handlePassQuiz}
      />
    </div>
  );
}