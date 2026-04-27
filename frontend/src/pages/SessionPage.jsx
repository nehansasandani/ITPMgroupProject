import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getSessionByTask } from "../api/matchApi";
import { getMessages, sendMessage } from "../api/messageApi";
import { completeTask } from "../api/taskApi";
import { useAuth } from "../context/AuthContext";
import WarningModal from "../components/WarningModal";
import SessionRatingModal from "../components/SessionRatingModal";
import { ui } from "../styles/ui";

// ── Elapsed clock component ───────────────────────────────────────────────────
function ElapsedTimer({ startedAt, endedAt }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;

    const start = new Date(startedAt).getTime();
    const end = endedAt ? new Date(endedAt).getTime() : null;

    const compute = () => {
      const now = end || Date.now();
      setElapsed(Math.max(0, Math.floor((now - start) / 1000)));
    };

    compute();

    if (end) return; // session ended — don't tick
    const id = setInterval(compute, 1000);
    return () => clearInterval(id);
  }, [startedAt, endedAt]);

  const hrs = Math.floor(elapsed / 3600);
  const mins = Math.floor((elapsed % 3600) / 60);
  const secs = elapsed % 60;

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="flex items-end gap-1 font-mono">
      {hrs > 0 && (
        <>
          <span className="text-4xl font-bold tabular-nums">{pad(hrs)}</span>
          <span className="text-slate-500 dark:text-white/50 text-xl mb-0.5">h</span>
        </>
      )}
      <span className="text-4xl font-bold tabular-nums">{pad(mins)}</span>
      <span className="text-slate-500 dark:text-white/50 text-xl mb-0.5">m</span>
      <span className="text-4xl font-bold tabular-nums">{pad(secs)}</span>
      <span className="text-slate-500 dark:text-white/50 text-xl mb-0.5">s</span>
    </div>
  );
}

// ── Helper badges ─────────────────────────────────────────────────────────────
function CategoryBadge({ value }) {
  const map = {
    CODING: "bg-sky-400/10 border-sky-400/20 text-sky-300",
    UI: "bg-violet-400/10 border-violet-400/20 text-violet-300",
    WRITING: "bg-emerald-400/10 border-emerald-400/20 text-emerald-300",
    REVIEW: "bg-amber-400/10 border-amber-400/20 text-amber-300",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs border ${map[value] || "bg-white dark:bg-white/5 shadow-sm dark:shadow-none border-slate-200 dark:border-white/15 text-slate-600 dark:text-white/70"}`}>
      {value}
    </span>
  );
}

function StatusDot({ status }) {
  return (
    <span className="flex items-center gap-1.5 text-sm">
      <span className={`inline-block h-2 w-2 rounded-full ${status === "ACTIVE" ? "bg-emerald-400 animate-pulse" : "bg-white/30"}`} />
      <span className={status === "ACTIVE" ? "text-emerald-300" : "text-slate-500 dark:text-white/50"}>
        {status === "ACTIVE" ? "Session Active" : "Session Completed"}
      </span>
    </span>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm dark:shadow-none px-3 py-2 text-center">
      <div className="text-xs text-slate-400 dark:text-white/45 mb-0.5">{label}</div>
      <div className="text-sm font-medium text-slate-700 dark:text-white/90">{value}</div>
    </div>
  );
}

function PersonCard({ label, user, accent }) {
  if (!user) return null;
  const ringColor = accent === "poster" ? "border-sky-400/30" : "border-violet-400/30";
  const labelColor = accent === "poster" ? "text-sky-300" : "text-violet-300";
  const repFloor = user.reputation !== undefined ? Math.max(0, Math.min(5, Math.floor(user.reputation))) : 0;
  
  return (
    <div className={`rounded-2xl border ${ringColor} bg-white dark:bg-white/5 shadow-sm dark:shadow-none p-4 flex items-center gap-4`}>
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-semibold border ${ringColor} bg-white dark:bg-white/5 shadow-sm dark:shadow-none shrink-0`}>
        {(user.fullName || "?")[0].toUpperCase()}
      </div>
      <div className="min-w-0">
        <div className={`text-xs font-medium ${labelColor} mb-0.5`}>{label}</div>
        <div className="text-sm font-semibold truncate">{user.fullName}</div>
        <div className="text-xs text-slate-400 dark:text-white/45">{user.studentId}</div>
        {user.reputation !== undefined && (
          <div className="text-xs text-amber-400 mt-0.5">
            {"★".repeat(repFloor)}
            <span className="text-white/30">{"★".repeat(5 - repFloor)}</span>
            <span className="text-slate-500 dark:text-white/50 ml-1">{Number(user.reputation).toFixed(1)}</span>
            {user.completedTasksCount > 0 && (
              <span className="text-white/40 ml-2">{user.completedTasksCount} tasks done</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Chat box ──────────────────────────────────────────────────────────────────
function ChatBox({ sessionId, sessionStatus, currentUserId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [chatError, setChatError] = useState("");
  const bottomRef = useRef(null);

  const poll = useCallback(async () => {
    try {
      const data = await getMessages(sessionId);
      setMessages(data.messages || []);
      setChatError("");
    } catch (err) {
      setChatError(err?.response?.data?.message || "Failed to load chat messages.");
    }
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId) return;
    poll();
    if (sessionStatus !== "ACTIVE") return;
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [sessionId, sessionStatus]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);
    setChatError("");
    try {
      await sendMessage(sessionId, text);
      await poll();
    } catch (err) {
      setInput(text); // restore on failure
      setChatError(err?.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm dark:shadow-none flex flex-col overflow-hidden" style={{ height: "420px" }}>
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-white/10 flex items-center gap-2 shrink-0">
        <span className="text-sm font-semibold">Session Chat</span>
        <div className="flex-1" />
        {sessionStatus === "ACTIVE" ? (
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        ) : (
          <span className="text-xs text-white/40">Read-only</span>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {chatError && (
          <div className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
            {chatError}
          </div>
        )}
        {messages.length === 0 && (
          <div className="text-center text-white/35 text-sm py-10">
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map((m) => {
          const isMe = String(m.sender._id) === String(currentUserId);
          return (
            <div key={m._id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              <div className="text-xs text-white/40 mb-0.5">
                {isMe ? "You" : m.sender.fullName}
              </div>
              <div
                className={`max-w-xs rounded-2xl px-3.5 py-2 text-sm break-words ${
                  isMe
                    ? "bg-violet-600/30 border border-violet-400/20 text-violet-100"
                    : "bg-slate-50 dark:bg-white/10 shadow-sm dark:shadow-none border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/90"
                }`}
              >
                {m.content}
              </div>
              <div className="text-xs text-white/30 mt-0.5">
                {new Date(m.createdAt).toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {sessionStatus === "ACTIVE" ? (
        <div className="px-4 pb-4 pt-2 border-t border-slate-200 dark:border-white/10 flex gap-2 shrink-0">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"
            rows={2}
            maxLength={1000}
            className="flex-1 bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-white/30 resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="px-4 rounded-xl bg-violet-600/20 border border-violet-400/20 text-violet-200 hover:bg-violet-600/30 disabled:opacity-40 text-sm self-end py-2 transition"
          >
            {sending ? "…" : "Send"}
          </button>
        </div>
      ) : (
        <div className="px-5 py-3 text-xs text-white/40 text-center border-t border-slate-200 dark:border-white/10 shrink-0">
          Session ended — chat is read-only
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SessionPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingPending, setRatingPending] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getSessionByTask(taskId);
      setSession(data.session);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load session.");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      // Show rating modal first
      setShowRatingModal(true);
      setRatingPending(true);
      setConfirmOpen(false);
    } catch (err) {
      setConfirmOpen(false);
      setError(err?.response?.data?.message || "Failed to prepare rating.");
      setCompleting(false);
    }
  };

  const handleRatingComplete = async () => {
    try {
      // After rating is submitted, complete the task
      await completeTask(taskId);
      await load(); // refresh to show COMPLETED status
      setRatingPending(false);
      setError(""); // clear any previous errors
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to complete task.");
      setRatingPending(false);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className={`${ui.page} flex items-center justify-center`}>
        <div className="text-slate-400 dark:text-white/45 text-sm">Loading session…</div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className={`${ui.page} flex flex-col items-center justify-center gap-4`}>
        <p className="text-rose-400 text-sm">{error || "Session not found."}</p>
        <Link to="/tasks/accepted-by-me" className={`${ui.btn} ${ui.btnSoft}`}>
          ← Back
        </Link>
      </div>
    );
  }

  const task = session.task;
  const isActive = session.status === "ACTIVE";
  const userId = user?.id;
  const isHelper = session.helper && String(session.helper._id) === String(userId);
  const isPoster = session.poster && String(session.poster._id) === String(userId);
  const canComplete = isActive && (isHelper || isPoster);

  const startLabel = new Date(session.startedAt).toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  const endLabel = session.endedAt
    ? new Date(session.endedAt).toLocaleString(undefined, {
        month: "short", day: "numeric", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : null;

  return (
    <div className={`${ui.page} py-8`}>
      <WarningModal
        open={confirmOpen}
        title="Mark session as completed?"
        message={`This will close the session and mark "${task?.title}" as COMPLETED.\n\nYou'll be able to rate the collaborator next.`}
        confirmText="Complete Session"
        cancelText="Not yet"
        confirmVariant="primary"
        loading={completing}
        onConfirm={handleComplete}
        onClose={() => { if (!completing && !ratingPending) setConfirmOpen(false); }}
      />

      <SessionRatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        ratedUserId={session?.helper?._id}
        ratedUserName={session?.helper?.fullName || "Helper"}
        sessionId={session?._id}
        taskTitle={task?.title}
        onRatingComplete={handleRatingComplete}
      />

      <div className={`${ui.container} space-y-6`}>
        {/* Header strip */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to={isHelper ? "/tasks/accepted-by-me" : "/tasks/mine"}
              className="text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white text-sm transition"
            >
              ← Back
            </Link>
            <span className="text-white/20">|</span>
            <h1 className="text-lg font-semibold">Session</h1>
          </div>
          <StatusDot status={session.status} />
        </div>

        {/* Timer card */}
        <div className={`${ui.card} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6`}>
          <div className="space-y-2">
            <div className="text-xs text-slate-400 dark:text-white/45 uppercase tracking-widest">
              {isActive ? "Time Elapsed" : "Total Duration"}
            </div>
            <ElapsedTimer startedAt={session.startedAt} endedAt={session.endedAt} />
            <div className="text-xs text-white/40">
              Started: {startLabel}
              {endLabel && <span className="ml-3">Ended: {endLabel}</span>}
            </div>
          </div>

          {canComplete ? (
            <button
              onClick={() => setConfirmOpen(true)}
              className={`${ui.btn} ${ui.btnPrimary} shrink-0 px-6 py-3`}
            >
              Mark Complete
            </button>
          ) : (
            !isActive && (
              <div className="text-sm text-slate-500 dark:text-white/50 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3">
                ✓ Session completed
              </div>
            )
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Task details (2/3 width) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Task header */}
            <div className={`${ui.card2} p-5 space-y-4`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold">{task?.title}</h2>
                    {task?.urgency === "URGENT" && (
                      <span className="text-xs px-2 py-0.5 rounded-full border border-rose-400/30 bg-rose-400/10 text-rose-300">
                        URGENT
                      </span>
                    )}
                    <CategoryBadge value={task?.category} />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-white/65 leading-relaxed">{task?.description}</p>
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-white/10 pt-4">
                <div className="text-xs text-slate-400 dark:text-white/45 uppercase tracking-wide mb-2">Expected Outcome</div>
                <p className="text-sm text-slate-700 dark:text-white/80">{task?.expectedOutcome}</p>
              </div>
            </div>

            {/* Task meta pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <InfoPill label="Skill" value={task?.skillRequired || "—"} />
              <InfoPill label="Mode" value={task?.mode || "—"} />
              <InfoPill label="Duration" value={task?.duration ? `${task.duration} min` : "—"} />
              <InfoPill label="Deadline" value={task?.deadlineDays ? `${task.deadlineDays} days` : "—"} />
            </div>
          </div>

          {/* People panel (1/3 width) */}
          <div className="space-y-3">
            <div className="text-xs text-slate-400 dark:text-white/45 uppercase tracking-widest px-1">Participants</div>
            <PersonCard label="Task Posted By" user={session.poster} accent="poster" />
            <PersonCard label="Helper (You)" user={session.helper} accent="helper" />

            <div className={`${ui.card2} p-4 space-y-2`}>
              <div className="text-xs text-slate-400 dark:text-white/45 uppercase tracking-widest">Session Info</div>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-white/50">Mode</span>
                  <span className="text-slate-800 dark:text-white/85">{session.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-white/50">Status</span>
                  <span className={session.status === "ACTIVE" ? "text-emerald-300" : "text-slate-500 dark:text-white/55"}>
                    {session.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-white/50">Started</span>
                  <span className="text-slate-800 dark:text-white/85 text-xs">
                    {new Date(session.startedAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                {session.venue && (
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500 dark:text-white/50 shrink-0">📍 Venue</span>
                    <span className="text-amber-200 text-xs text-right break-words">{session.venue}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chat box — full width */}
        <ChatBox
          sessionId={session._id}
          sessionStatus={session.status}
          currentUserId={userId}
        />
      </div>
    </div>
  );
}
