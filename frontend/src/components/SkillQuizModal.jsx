import { useState, useEffect } from "react";
import { getSkillQuiz, submitSkillQuiz } from "../api/skillApi";
import { FiX, FiCheckCircle, FiXCircle, FiAlertOctagon, FiClock } from "react-icons/fi";

export default function SkillQuizModal({ isOpen, onClose, skillName, skillId, onPass }) {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { passed: boolean, score: number, antiCheat: boolean }
  const [timeLeft, setTimeLeft] = useState(30);

  // Initial Data Load
  useEffect(() => {
    if (isOpen && skillName) {
      loadQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, skillName]);

  const loadQuiz = async () => {
    setLoading(true);
    setResult(null);
    setCurrentIdx(0);
    setAnswers([]);
    setTimeLeft(30);
    try {
      const q = await getSkillQuiz(skillName);
      setQuestions(q);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Timer Logic
  useEffect(() => {
    if (!isOpen || loading || result || submitting) return;
    
    const timerId = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          // Time is up for this question
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
  }, [isOpen, loading, result, submitting, currentIdx, questions.length]);

  // Anti-Cheat: Tab Blur / Visibility Detection
  useEffect(() => {
    if (!isOpen || loading || result || submitting) return;

    const handleViolation = () => {
      // Instantly fail the user locally without even sending to backend
      setResult({ passed: false, score: 0, antiCheat: true });
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
  }, [isOpen, loading, result, submitting]);

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
      setTimeLeft(30); // reset if they go back (fairness rule)
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await submitSkillQuiz(skillName, answers, skillId);
      setResult({ passed: res.passed, score: res.score });
      if (res.passed) {
        onPass(res.skills); // Updating parent skills list
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden shadow-indigo-500/10">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/10 bg-slate-800/80">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Skill Assessment <span className="text-white/30">|</span> <span className="text-indigo-400">{skillName}</span>
          </h2>
          {(!loading && !result && !submitting) && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-mono font-bold text-sm ${timeLeft <= 10 ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-slate-950/50 text-indigo-300'}`}>
              <FiClock /> 00:{timeLeft.toString().padStart(2, '0')}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 relative">
          
          {loading ? (
            <div className="py-12 flex flex-col items-center">
              <div className="w-8 h-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="mt-4 text-white/50 text-sm animate-pulse">Initializing Secure Assessment...</p>
            </div>
          ) : result ? (
            <div className="py-8 text-center animate-in zoom-in-95 duration-300">
              {result.antiCheat ? (
                <>
                  <FiAlertOctagon className="text-6xl text-red-500 mx-auto mb-4 drop-shadow-lg" />
                  <h3 className="text-2xl font-bold text-red-400 mb-2">Assessment Terminated</h3>
                  <p className="text-white/60 mb-6 bg-red-500/10 border border-red-500/20 p-3 rounded-lg text-sm text-left">
                    <strong>Integrity Violation:</strong> We detected that you left the assessment window. Skill assessments must be completed without looking elsewhere.
                  </p>
                </>
              ) : result.passed ? (
                <>
                  <FiCheckCircle className="text-6xl text-emerald-400 mx-auto mb-4 drop-shadow-lg" />
                  <h3 className="text-2xl font-bold text-white mb-2">Skill Verified!</h3>
                  <p className="text-white/60 mb-6">You scored {result.score}/5. The skill badge has been permanently added to your profile.</p>
                </>
              ) : (
                <>
                  <FiXCircle className="text-6xl text-amber-500 mx-auto mb-4 drop-shadow-lg" />
                  <h3 className="text-2xl font-bold text-white mb-2">Keep Learning</h3>
                  <p className="text-white/60 mb-6">You scored {result.score}/5. A minimum of 4 correct answers is required.</p>
                </>
              )}
              <button onClick={onClose} className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium border border-white/10 transition">
                Close
              </button>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-4 duration-300">
              {/* Progress Bar Container */}
              <div className="flex justify-between text-xs text-white/40 uppercase tracking-widest font-semibold mb-3">
                <span>Question {currentIdx + 1} of {questions.length}</span>
                <span>{Math.round(((currentIdx) / questions.length) * 100)}%</span>
              </div>
              
              <div className="w-full h-1.5 bg-slate-800 rounded-full mb-6 overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
                />
              </div>

              <h3 className="text-lg font-medium text-white mb-6">
                {questions[currentIdx]?.question}
              </h3>

              <div className="space-y-3">
                {questions[currentIdx]?.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 flex items-center gap-3 ${
                      answers[currentIdx] === idx 
                        ? "bg-indigo-500/20 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]" 
                        : "bg-slate-800/50 border-white/5 text-white/70 hover:bg-slate-800 hover:border-white/10"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      answers[currentIdx] === idx ? "border-indigo-400" : "border-slate-600"
                    }`}>
                      {answers[currentIdx] === idx && <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full" />}
                    </div>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={handlePrev}
                  disabled={currentIdx === 0}
                  className="flex-1 py-3 rounded-xl border border-white/10 font-medium text-white/70 hover:bg-white/5 transition disabled:opacity-30 disabled:pointer-events-none"
                >
                  Previous
                </button>
                
                {currentIdx === questions.length - 1 ? (
                  <button
                    onClick={handleSubmit}
                    disabled={answers[currentIdx] === undefined || submitting}
                    className="flex-1 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-medium text-white transition disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                  >
                    {submitting ? "Checking..." : "Submit"}
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={answers[currentIdx] === undefined}
                    className="flex-1 py-3 rounded-xl bg-white hover:bg-white/90 font-medium text-slate-900 transition disabled:opacity-50"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
