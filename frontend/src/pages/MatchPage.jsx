import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getMyTasks } from "../api/taskApi";
import {
  getRankedCandidates,
  createMatchRequest,
  acceptMatch,
  declineMatch,
  getMyMatchRequests,
  getMyTaskMatches,
} from "../api/matchApi";
import { ui } from "../styles/ui";

// ── Small helpers ──────────────────────────────────────────────────────────────
function formatTimeLeft(expiryTime) {
  if (!expiryTime) return "—";
  const diff = new Date(expiryTime).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const mins = Math.floor(diff / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

function ScoreBar({ score, max = 110 }) {
  const pct = Math.min(100, Math.round((score / max) * 100));
  const color =
    pct >= 70 ? "bg-emerald-400" : pct >= 40 ? "bg-amber-400" : "bg-rose-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-white/70 tabular-nums w-8 text-right">{score}</span>
    </div>
  );
}

function StarRating({ value }) {
  const full = Math.floor(value);
  const frac = value - full;
  return (
    <span className="text-amber-400 text-xs tracking-tight">
      {"★".repeat(full)}
      {frac >= 0.5 ? "½" : ""}
      <span className="text-white/30">{"★".repeat(5 - full - (frac >= 0.5 ? 1 : 0))}</span>
      <span className="text-white/50 ml-1">{value.toFixed(1)}</span>
    </span>
  );
}

function LevelBadge({ level }) {
  const colors = {
    Expert: "bg-violet-400/15 border-violet-400/30 text-violet-300",
    Intermediate: "bg-sky-400/15 border-sky-400/30 text-sky-300",
    Beginner: "bg-emerald-400/15 border-emerald-400/30 text-emerald-300",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs border ${colors[level] || "bg-white/10 border-white/20 text-white/60"}`}>
      {level || "—"}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    Pending: "bg-amber-400/15 border-amber-400/30 text-amber-300",
    Accepted: "bg-emerald-400/15 border-emerald-400/30 text-emerald-300",
    Declined: "bg-rose-400/15 border-rose-400/30 text-rose-300",
    Timeout: "bg-white/10 border-white/20 text-white/50",
    Cancelled: "bg-white/10 border-white/20 text-white/50",
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs border ${map[status] || "bg-white/10 border-white/20 text-white/60"}`}>
      {status}
    </span>
  );
}

const TABS = [
  { id: "find", label: "Find Candidates" },
  { id: "requests", label: "Incoming Requests" },
  { id: "sent", label: "Sent Requests" },
];

// ── Main page ──────────────────────────────────────────────────────────────────
export default function MatchPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("find");

  // Find Candidates state
  const [myTasks, setMyTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [taskSkill, setTaskSkill] = useState("");
  const [findLoading, setFindLoading] = useState(false);
  const [findError, setFindError] = useState("");
  const [busyRequest, setBusyRequest] = useState("");

  // Incoming Requests state
  const [incoming, setIncoming] = useState([]);
  const [incomingLoading, setIncomingLoading] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [, setTick] = useState(0);

  // Sent Requests state
  const [sent, setSent] = useState([]);
  const [sentLoading, setSentLoading] = useState(false);

  // Feedback
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load OPEN tasks for the selector
  useEffect(() => {
    getMyTasks()
      .then((data) => setMyTasks(data.filter((t) => t.status === "OPEN")))
      .catch(() => {});
  }, []);

  // Countdown ticker for incoming requests
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Load incoming requests when tab switches
  const loadIncoming = useCallback(async () => {
    setIncomingLoading(true);
    try {
      const data = await getMyMatchRequests();
      setIncoming(data.matches || []);
    } catch {
      setIncoming([]);
    } finally {
      setIncomingLoading(false);
    }
  }, []);

  const loadSent = useCallback(async () => {
    setSentLoading(true);
    try {
      const data = await getMyTaskMatches();
      setSent(data.matches || []);
    } catch {
      setSent([]);
    } finally {
      setSentLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "requests") loadIncoming();
    if (tab === "sent") loadSent();
  }, [tab, loadIncoming, loadSent]);

  // Find candidates
  const handleFind = async () => {
    if (!selectedTaskId) return;
    setFindLoading(true);
    setFindError("");
    setCandidates([]);
    try {
      const data = await getRankedCandidates(selectedTaskId);
      setCandidates(data.candidates || []);
      setTaskSkill(data.taskSkill || "");
      if (!data.candidates?.length) setFindError("No matching candidates found for this skill.");
    } catch (err) {
      setFindError(err?.response?.data?.message || "Failed to load candidates.");
    } finally {
      setFindLoading(false);
    }
  };

  // Send match request
  const handleSendRequest = async (helperId) => {
    setBusyRequest(helperId);
    try {
      await createMatchRequest(selectedTaskId, helperId);
      showToast("Match request sent!");
      // Mark as requested locally
      setCandidates((prev) =>
        prev.map((c) => (c.user._id === helperId ? { ...c, hasRequest: true } : c))
      );
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to send request.", "error");
    } finally {
      setBusyRequest("");
    }
  };

  // Accept incoming match
  const handleAccept = async (matchId) => {
    setBusyAction(matchId + "_accept");
    const matchObj = incoming.find((m) => m._id === matchId);
    try {
      await acceptMatch(matchId);
      const taskId = matchObj?.task?._id ?? matchObj?.task;
      if (taskId) {
        navigate(`/session/${taskId}`);
      } else {
        showToast("Match accepted! Task is now MATCHED.");
        loadIncoming();
      }
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to accept.", "error");
    } finally {
      setBusyAction("");
    }
  };

  // Decline incoming match
  const handleDecline = async (matchId) => {
    setBusyAction(matchId + "_decline");
    try {
      await declineMatch(matchId);
      showToast("Match declined.");
      loadIncoming();
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to decline.", "error");
    } finally {
      setBusyAction("");
    }
  };

  const pendingIncoming = incoming.filter((m) => m.status === "Pending");

  return (
    <div className={`${ui.page} py-8`}>
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm shadow-lg border ${
            toast.type === "error"
              ? "bg-rose-950 border-rose-500/30 text-rose-200"
              : "bg-emerald-950 border-emerald-500/30 text-emerald-200"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className={`${ui.container} space-y-6`}>
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold">Smart Matching</h1>
          <p className="text-white/55 text-sm mt-1">
            Find the best-fit helpers ranked by skill, reputation, and activity.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 w-fit">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-xl text-sm transition ${
                tab === t.id
                  ? "bg-white/10 text-white"
                  : "text-white/55 hover:text-white hover:bg-white/5"
              } ${t.id === "requests" && pendingIncoming.length > 0 ? "relative" : ""}`}
            >
              {t.label}
              {t.id === "requests" && pendingIncoming.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-900 text-xs font-semibold">
                  {pendingIncoming.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── TAB: Find Candidates ─────────────────────────────────────────── */}
        {tab === "find" && (
          <div className="space-y-5">
            {/* Task selector */}
            <div className={`${ui.card2} p-5 space-y-4`}>
              <h2 className="text-sm font-medium text-white/80">Select one of your OPEN tasks</h2>
              {myTasks.length === 0 ? (
                <p className="text-white/45 text-sm">You have no OPEN tasks right now.</p>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedTaskId}
                    onChange={(e) => {
                      setSelectedTaskId(e.target.value);
                      setCandidates([]);
                      setFindError("");
                    }}
                    className={`${ui.input} flex-1 text-white/90`}
                  >
                    <option value="">— Choose a task —</option>
                    {myTasks.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.title} · {t.skillRequired}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleFind}
                    disabled={!selectedTaskId || findLoading}
                    className={`${ui.btn} ${ui.btnPrimary} shrink-0`}
                  >
                    {findLoading ? "Searching…" : "Find Candidates"}
                  </button>
                </div>
              )}
            </div>

            {/* Error */}
            {findError && (
              <p className="text-rose-400 text-sm px-1">{findError}</p>
            )}

            {/* Scoring legend */}
            {candidates.length > 0 && (
              <div className="flex flex-wrap gap-4 text-xs text-white/50 px-1">
                <span>Skill match for: <span className="text-white/80 font-medium">{taskSkill}</span></span>
                <span>Score = skill level + reputation × 10 + completions × 2 + recency bonus</span>
              </div>
            )}

            {/* Candidates list */}
            {candidates.length > 0 && (
              <div className="space-y-3">
                {candidates.map((c, i) => (
                  <div
                    key={c.user._id}
                    className={`${ui.card2} p-4 flex flex-col sm:flex-row sm:items-center gap-4 ${
                      !c.isAvailable ? "opacity-60" : ""
                    }`}
                  >
                    {/* Rank */}
                    <div className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border border-white/10 bg-white/5 text-white/70 text-sm font-semibold">
                      {i + 1}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-sm truncate">{c.user.fullName}</span>
                        <span className="text-xs text-white/45">{c.user.studentId}</span>
                        <LevelBadge level={c.skillLevel} />
                        {!c.isAvailable && (
                          <span className="text-xs bg-rose-400/10 border border-rose-400/20 text-rose-300 px-2 py-0.5 rounded-full">
                            Busy
                          </span>
                        )}
                        {c.isAvailable && (
                          <span className="text-xs bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 px-2 py-0.5 rounded-full">
                            Available
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-white/55">
                        <StarRating value={c.user.reputation || 0} />
                        <span>{c.user.completedTasksCount || 0} tasks done</span>
                        {c.user.lastActive && (
                          <span>
                            Active{" "}
                            {new Date(c.user.lastActive).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                      <ScoreBar score={c.score} />
                    </div>

                    {/* Action */}
                    <div className="shrink-0">
                      {c.hasRequest ? (
                        <span className="text-xs text-white/45 border border-white/10 px-3 py-1.5 rounded-xl">
                          Request Sent
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(c.user._id)}
                          disabled={!c.isAvailable || busyRequest === c.user._id}
                          className={`${ui.btn} ${ui.btnSoft} text-xs`}
                        >
                          {busyRequest === c.user._id ? "Sending…" : "Send Request"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Incoming Requests ──────────────────────────────────────── */}
        {tab === "requests" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-white/55 text-sm">
                Match requests sent to you — accept or decline within the time window.
              </p>
              <button onClick={loadIncoming} className={`${ui.btn} ${ui.btnSoft} text-xs`}>
                Refresh
              </button>
            </div>

            {incomingLoading && (
              <p className="text-white/45 text-sm">Loading…</p>
            )}

            {!incomingLoading && incoming.length === 0 && (
              <div className={`${ui.card2} p-8 text-center`}>
                <p className="text-white/45 text-sm">No match requests for you right now.</p>
              </div>
            )}

            {incoming.map((m) => (
              <div key={m._id} className={`${ui.card2} p-5 space-y-3`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{m.task?.title || "—"}</p>
                    <p className="text-white/50 text-xs line-clamp-2">{m.task?.description}</p>
                  </div>
                  <StatusBadge status={m.status} />
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70">
                    Skill: {m.task?.skillRequired}
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70">
                    {m.task?.mode} · {m.task?.duration} min
                  </span>
                  {m.task?.urgency === "URGENT" && (
                    <span className="px-2 py-1 rounded-lg bg-rose-400/10 border border-rose-400/20 text-rose-300">
                      URGENT
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-white/45">
                    From: <span className="text-white/70">{m.requestedBy?.fullName}</span>
                    {m.status === "Pending" && (
                      <span className="ml-3 text-amber-400">
                        ⏱ {formatTimeLeft(m.expiryTime)}
                      </span>
                    )}
                  </div>

                  {m.status === "Pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecline(m._id)}
                        disabled={!!busyAction}
                        className={`${ui.btn} text-xs border border-white/15 text-white/70 hover:bg-white/10`}
                      >
                        {busyAction === m._id + "_decline" ? "…" : "Decline"}
                      </button>
                      <button
                        onClick={() => handleAccept(m._id)}
                        disabled={!!busyAction}
                        className={`${ui.btn} ${ui.btnPrimary} text-xs`}
                      >
                        {busyAction === m._id + "_accept" ? "Accepting…" : "Accept"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: Sent Requests ──────────────────────────────────────────── */}
        {tab === "sent" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-white/55 text-sm">
                Match requests you sent on behalf of your tasks.
              </p>
              <button onClick={loadSent} className={`${ui.btn} ${ui.btnSoft} text-xs`}>
                Refresh
              </button>
            </div>

            {sentLoading && <p className="text-white/45 text-sm">Loading…</p>}

            {!sentLoading && sent.length === 0 && (
              <div className={`${ui.card2} p-8 text-center`}>
                <p className="text-white/45 text-sm">You haven't sent any match requests yet.</p>
              </div>
            )}

            {sent.map((m) => (
              <div key={m._id} className={`${ui.card2} p-4 flex flex-wrap items-center gap-4`}>
                <div className="flex-1 min-w-0 space-y-0.5">
                  <p className="text-sm font-medium truncate">{m.task?.title || "—"}</p>
                  <p className="text-xs text-white/50">Skill: {m.task?.skillRequired}</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                  <div>
                    <span className="text-white/40">To: </span>
                    <span className="text-white/80">{m.helper?.fullName}</span>
                    <span className="text-white/40 ml-1">{m.helper?.studentId}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-white/40">Score:</span>
                    <span className="text-white/80 font-medium">{m.score}</span>
                  </div>
                  <StatusBadge status={m.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
