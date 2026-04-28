import { useState, useEffect } from "react";
import { getSkillQuiz, submitSkillQuiz } from "../api/skillApi";
import { 
  FiX, FiCheckCircle, FiXCircle, FiAlertOctagon, 
  FiClock, FiPlay, FiInfo, FiChevronRight, FiChevronLeft,
  FiBookOpen, FiActivity, FiShield
} from "react-icons/fi";

/**
 * SkillQuizModal - A premium, multi-phase quiz system for skill verification.
 * Phases: START -> ACTIVE -> RESULT
 */
export default function SkillQuizModal({ isOpen, onClose, skillName, skillId, onPass }) {
  const [quizPhase, setQuizPhase] = useState("START"); // START, ACTIVE, RESULT
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { passed: boolean, score: number, antiCheat: boolean, review: Array }
  const [timeLeft, setTimeLeft] = useState(30);

  // Initial Reset when opened
  useEffect(() => {
    if (isOpen) {
      setQuizPhase("START");
      setResult(null);
      setCurrentIdx(0);
      setAnswers([]);
    }
  }, [isOpen]);

  // Load Quiz Data from AI
  const loadQuizData = async () => {
    setLoading(true);
    try {
      const q = await getSkillQuiz(skillId);
      setQuestions(q);
      setQuizPhase("ACTIVE");
      setTimeLeft(30);
    } catch (err) {
      console.error("Quiz loading error:", err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to initialize AI Assessment. Please try again.";
      alert(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // Timer Logic (Active Phase Only)
  useEffect(() => {
    if (!isOpen || quizPhase !== "ACTIVE" || result || submitting || questions.length === 0) return;
    
    const timerId = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerId);
          setTimeout(() => {
            if (currentIdx < questions.length - 1) {
              handleNext();
            } else {
              handleSubmit();
            }
          }, 0);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, quizPhase, result, submitting, currentIdx, questions.length]);

  // Anti-Cheat System
  useEffect(() => {
    if (!isOpen || quizPhase !== "ACTIVE" || result || submitting) return;

    const handleViolation = () => {
      setResult({ passed: false, score: 0, antiCheat: true });
      setQuizPhase("RESULT");
    };

    const handleVisibilityChange = () => {
      if (document.hidden) handleViolation();
    };
    
    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleViolation);

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleViolation);
    };
  }, [isOpen, quizPhase, result, submitting]);

  const handleSelect = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((c) => c + 1);
      setTimeLeft(30);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((c) => c - 1);
      setTimeLeft(30);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await submitSkillQuiz({ skillId, answers, skillName });
      setResult({ 
        passed: res.passed, 
        score: res.score, 
        review: res.review // Detailed feedback from backend
      });
      setQuizPhase("RESULT");
      if (res.passed) {
        onPass(res.skills); 
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error submitting assessment");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        
        <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700/50 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              {skillName} Assessment
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition">
            <FiX size={18} />
          </button>
        </div>

        <div className="p-8 max-h-[80vh] overflow-y-auto scrollbar-hide">
          
          {/* PHASE 1: START / WELCOME */}
          {quizPhase === "START" && (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 text-indigo-400">
                  <FiBookOpen size={28} />
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">Technical Assessment</h3>
                <p className="text-slate-400 text-xs mt-2 max-w-xs leading-relaxed">Validate your proficiency in {skillName} through our automated testing system.</p>
              </div>

              <div className="space-y-3 mb-8">
                <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl flex items-start gap-3">
                  <FiClock className="mt-0.5 text-indigo-400" size={16} />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Timed Questions</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">30 seconds per question. Failure to answer resets the timer.</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-xl flex items-start gap-3">
                  <FiCheckCircle className="mt-0.5 text-emerald-400" size={16} />
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Success Threshold</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Score 80% or higher to earn your verification badge.</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-800/30 border border-amber-500/20 rounded-xl flex items-start gap-3">
                  <FiAlertOctagon className="mt-0.5 text-amber-500" size={16} />
                  <div>
                    <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Integrity check</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Browser focus is monitored. Leaving the tab will fail the exam.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={loadQuizData}
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Begin Assessment <FiChevronRight /></>}
              </button>
            </div>
          )}

          {/* PHASE 2: ACTIVE EXAM */}
          {quizPhase === "ACTIVE" && (
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Testing Progress</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-white leading-none">{currentIdx + 1}</span>
                    <span className="text-xs text-slate-600 font-bold">/ {questions.length}</span>
                  </div>
                </div>
                <div className={`px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-colors ${timeLeft <= 10 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                   {timeLeft}s remaining
                </div>
              </div>

              {/* Seamless Progress Bar */}
              <div className="w-full h-1 bg-slate-800 rounded-full mb-8 overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }} />
              </div>

              <div key={currentIdx} className="animate-in slide-in-from-right-4 duration-500">
                <h3 className="text-lg font-medium text-slate-200 mb-8 leading-relaxed">
                  {questions[currentIdx]?.question}
                </h3>

                <div className="space-y-2.5">
                  {questions[currentIdx]?.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={`w-full text-left px-5 py-3.5 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                        answers[currentIdx] === idx 
                          ? "bg-indigo-500/5 border-indigo-500/50 text-white shadow-sm" 
                          : "bg-slate-800/40 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:bg-slate-800"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        answers[currentIdx] === idx ? "border-indigo-500 bg-indigo-500" : "border-slate-700"
                      }`}>
                        {answers[currentIdx] === idx && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <span className="text-[13px] font-medium">{opt}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mt-10">
                <button onClick={handlePrev} disabled={currentIdx === 0} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-20 text-xs font-bold">
                  Previous
                </button>
                {currentIdx === questions.length - 1 ? (
                  <button onClick={handleSubmit} disabled={answers[currentIdx] === undefined || submitting} className="flex-[2] py-3 rounded-xl bg-white hover:bg-slate-200 text-slate-950 font-black uppercase tracking-wider text-xs transition disabled:opacity-50">
                    {submitting ? "Analyzing..." : "Submit Exam"}
                  </button>
                ) : (
                  <button onClick={handleNext} disabled={answers[currentIdx] === undefined} className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs transition hover:bg-indigo-500">
                    Next
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PHASE 3: RESULT / FEEDBACK */}
          {quizPhase === "RESULT" && (
            <div className="animate-in zoom-in-95 duration-500">
              
              <div className="text-center p-8 border border-slate-800 rounded-3xl bg-slate-800/20 mb-8">
                {result.antiCheat ? (
                  <>
                    <FiAlertOctagon className="text-5xl text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Disqualified</h3>
                    <p className="text-slate-500 text-xs">Integrity system detected tab switching. This assessment has been invalidated.</p>
                  </>
                ) : result.passed ? (
                  <>
                    <FiCheckCircle className="text-5xl text-emerald-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Assessment Passed</h3>
                    <div className="text-xs font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 py-1.5 px-4 rounded-full inline-block mb-4">Score: {result.score} / 5</div>
                    <p className="text-slate-500 text-xs">The {skillName} verification badge is now active on your profile.</p>
                  </>
                ) : (
                  <>
                    <FiXCircle className="text-5xl text-amber-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2 italic">Retry Recommended</h3>
                    <div className="text-xs font-bold text-amber-500 uppercase tracking-widest bg-amber-500/10 py-1.5 px-4 rounded-full inline-block mb-4">Score: {result.score} / 5</div>
                    <p className="text-slate-500 text-xs">You reached {result.score * 20}%. Review the feedback below to bridge knowledge gaps.</p>
                  </>
                )}
              </div>

              {!result.antiCheat && result.review && (
                <div className="space-y-4 mb-8">
                  {result.review.map((q, idx) => {
                    const isCorrect = answers[idx] === q.correctIndex;
                    return (
                      <div key={idx} className="p-5 bg-slate-800/20 border border-slate-800 rounded-2xl">
                        <div className="flex justify-between items-start gap-3 mb-4">
                          <p className="text-[13px] font-medium text-white leading-relaxed">{q.question}</p>
                          {isCorrect ? <FiCheckCircle className="text-emerald-500" /> : <FiXCircle className="text-red-500" />}
                        </div>
                        <div className="p-3 bg-slate-900/50 rounded-xl">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1 block">Tutor's Insight</span>
                          <p className="text-[11px] text-slate-500 leading-relaxed italic">"{q.explanation}"</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button onClick={onClose} className="w-full py-3.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition text-sm">
                Close Assessment
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
