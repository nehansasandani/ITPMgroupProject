import { useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiArrowRight, FiSearch, FiTarget, FiZap } from "react-icons/fi";
import { getMyTasks } from "../api/taskApi";
import { createMatchRequest, getRankedCandidates, getTopHelper } from "../api/matchApi";

const LEVEL_COLORS = {
  Beginner: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  Intermediate: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  Expert: "border-violet-400/30 bg-violet-400/10 text-violet-200",
};

export default function MatchPage() {
  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [tasksLoading, setTasksLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [matchingId, setMatchingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [taskSkill, setTaskSkill] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [topHelper, setTopHelper] = useState(null);

  const openTasks = useMemo(() => tasks.filter((task) => task.status === "OPEN"), [tasks]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await getMyTasks();
        setTasks(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load your tasks.");
      } finally {
        setTasksLoading(false);
      }
    };

    loadTasks();
  }, []);

  useEffect(() => {
    if (!selectedTaskId && openTasks.length > 0) {
      setSelectedTaskId(openTasks[0]._id);
    }
  }, [openTasks, selectedTaskId]);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const loadMatches = async (event) => {
    event?.preventDefault?.();
    clearMessages();

    if (!selectedTaskId) {
      setError("Select one of your open tasks to find matching helpers.");
      return;
    }

    try {
      setLoading(true);
      const [ranked, top] = await Promise.all([getRankedCandidates(selectedTaskId), getTopHelper(selectedTaskId)]);
      setCandidates(ranked.candidates || []);
      setTaskSkill(ranked.taskSkill || "");
      setTopHelper(top.topHelper || null);

      if ((ranked.candidates || []).length === 0) {
        setSuccess("No matching helpers found for this task yet.");
      } else {
        setSuccess("Matching helpers loaded successfully.");
      }
    } catch (err) {
      setCandidates([]);
      setTopHelper(null);
      setTaskSkill("");
      setError(err?.response?.data?.message || "Failed to load matching helpers. Check the selected task and your access rights.");
    } finally {
      setLoading(false);
    }
  };

  const sendRequest = async (helperId) => {
    clearMessages();

    try {
      setMatchingId(helperId);
      await createMatchRequest(selectedTaskId, helperId);
      setSuccess("Match request sent.");
      const ranked = await getRankedCandidates(selectedTaskId);
      setCandidates(ranked.candidates || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send match request.");
    } finally {
      setMatchingId("");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 text-white animate-in fade-in duration-500">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 p-6 md:p-8">
        <div className="absolute -top-24 right-0 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -bottom-24 left-0 h-56 w-56 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-cyan-300">
              <FiTarget size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Skill Matching</h1>
              <p className="text-white/55 text-sm mt-1">
                Choose one of your open tasks to rank helpers by skill level, reputation, and activity.
              </p>
            </div>
          </div>

          <div className="mb-5 rounded-2xl border border-cyan-400/15 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
            Tip: this screen now uses your open tasks directly, so you do not need to copy any ID manually.
          </div>

          <form onSubmit={loadMatches} className="flex flex-col md:flex-row gap-3 md:items-end">
            <div className="flex-1">
              <label className="block text-sm text-white/70 mb-2">Select Task</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35 pointer-events-none" />
                <select
                  value={selectedTaskId}
                  onChange={(e) => setSelectedTaskId(e.target.value)}
                  disabled={tasksLoading}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 outline-none focus:border-white/25 focus:ring-2 focus:ring-white/10 disabled:cursor-not-allowed"
                >
                  <option value="">{tasksLoading ? "Loading your tasks..." : "Choose an open task"}</option>
                  {openTasks.map((task) => (
                    <option key={task._id} value={task._id}>
                      {task.title} · {task.skillRequired}
                    </option>
                  ))}
                </select>
              </div>
              {!tasksLoading && openTasks.length === 0 && (
                <p className="mt-2 text-xs text-amber-200">
                  You do not have any OPEN tasks yet. Create or reopen a task before using matching.
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || tasksLoading || !selectedTaskId}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-slate-900 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Loading…" : "Find Matches"}
              <FiArrowRight />
            </button>
          </form>

          {selectedTaskId && (
            <div className="mt-3 text-xs text-white/45">
              Selected task ID: {selectedTaskId}
            </div>
          )}

          {error && (
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {success}
            </div>
          )}

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm text-white/55">Task skill</div>
              <div className="mt-2 text-lg font-semibold">{taskSkill || "No task loaded"}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm text-white/55">Ranked candidates</div>
              <div className="mt-2 text-lg font-semibold">{candidates.length}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm text-white/55">Top helper</div>
              <div className="mt-2 text-lg font-semibold">{topHelper?.fullName || "None found"}</div>
            </div>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="border-b border-white/10 px-5 py-4">
              <h2 className="text-lg font-semibold">Matched Helpers</h2>
            </div>

            {candidates.length === 0 ? (
              <div className="px-5 py-10 text-white/55">
                Load a task to view ranked helpers. Only the task owner can access this list.
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {candidates.map((candidate) => (
                  <div key={candidate.user._id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-lg font-semibold">{candidate.user.fullName}</div>
                        <span className={`rounded-full border px-2.5 py-1 text-xs ${LEVEL_COLORS[candidate.skillLevel] || "border-white/10 bg-white/5 text-white/70"}`}>
                          {candidate.skillLevel || "Unspecified"}
                        </span>
                        <span className={`rounded-full border px-2.5 py-1 text-xs ${candidate.isAvailable ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-amber-400/30 bg-amber-400/10 text-amber-200"}`}>
                          {candidate.isAvailable ? "Available" : "Busy"}
                        </span>
                        {candidate.hasRequest && (
                          <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-2.5 py-1 text-xs text-cyan-200">
                            Request already sent
                          </span>
                        )}
                      </div>
                      <div className="mt-2 text-sm text-white/60">
                        Student ID: {candidate.user.studentId || "N/A"} · Score: {candidate.score} pts · Reputation: {candidate.user.reputation ?? 0}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => sendRequest(candidate.user._id)}
                      disabled={loading || matchingId === candidate.user._id || !candidate.isAvailable || candidate.hasRequest}
                      className="rounded-2xl border border-white/10 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {matchingId === candidate.user._id ? "Sending…" : candidate.hasRequest ? "Requested" : "Send Match Request"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <FiZap className="text-cyan-300" size={22} />
              <h3 className="mt-4 font-semibold">Instant ranking</h3>
              <p className="mt-2 text-sm text-white/55">The backend scores helpers using skill level, reputation, completions, and recent activity.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <FiTarget className="text-violet-300" size={22} />
              <h3 className="mt-4 font-semibold">Task-owned access</h3>
              <p className="mt-2 text-sm text-white/55">Only the task owner can view candidates and send requests for that task.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <FiSearch className="text-emerald-300" size={22} />
              <h3 className="mt-4 font-semibold">Skill-aware matching</h3>
              <p className="mt-2 text-sm text-white/55">Matches are based on category, sub-category, and skill name, not just exact text.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}