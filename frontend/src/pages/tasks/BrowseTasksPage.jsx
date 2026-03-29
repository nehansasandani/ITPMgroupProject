import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { acceptTask, getOpenTasks } from "../../api/taskApi";
import { useAuth } from "../../context/AuthContext";

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-white/60 text-sm mt-1">{label}</div>
    </div>
  );
}

function formatRemaining(expireAt) {
  if (!expireAt) return "—";

  const diff = new Date(expireAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";

  const totalMinutes = Math.floor(diff / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ${hours}h ${minutes}m left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

/* ── Task Detail Accept Modal ───────────────────────────────────────────── */
function TaskAcceptModal({ task, busy, onConfirm, onClose }) {
  if (!task) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-slate-950 p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold">Accept Task</h3>

        {/* Task title & badges */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="font-medium">{task.title}</span>
          <span className="text-xs px-2 py-0.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-100">
            {task.category}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full border ${
              task.urgency === "URGENT"
                ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                : "border-white/10 bg-white/5 text-white/65"
            }`}
          >
            {task.urgency}
          </span>
        </div>

        {/* Description */}
        <div className="mt-3">
          <div className="text-xs text-white/50 uppercase tracking-wide mb-1">Description</div>
          <p className="text-sm text-white/80 leading-relaxed">{task.description}</p>
        </div>

        {/* Expected outcome */}
        <div className="mt-3">
          <div className="text-xs text-white/50 uppercase tracking-wide mb-1">Expected Outcome</div>
          <p className="text-sm text-white/80">{task.expectedOutcome}</p>
        </div>

        {/* Seeker (poster) details */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs text-white/50 uppercase tracking-wide mb-2">Task Seeker</div>
          <div className="text-sm text-white/90 font-medium">
            {task.createdBy?.fullName || "Unknown"}
          </div>
          {task.createdBy?.studentId && (
            <div className="text-xs text-white/60 mt-0.5">{task.createdBy.studentId}</div>
          )}
          {task.createdBy?.email && (
            <div className="text-xs text-white/60 mt-0.5">{task.createdBy.email}</div>
          )}
        </div>

        {/* Time & venue */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-white/50 uppercase tracking-wide mb-1">Session Time</div>
            <div className="text-sm text-white/90">{task.duration} minutes</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-white/50 uppercase tracking-wide mb-1">Mode</div>
            <div className="text-sm text-white/90">{task.mode}</div>
          </div>
        </div>

        {task.mode === "Meet" && task.venue && (
          <div className="mt-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-3">
            <div className="text-xs text-amber-300/70 uppercase tracking-wide mb-1">Venue</div>
            <div className="text-sm text-amber-200">📍 {task.venue}</div>
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/60">
          <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
            Skill: {task.skillRequired}
          </span>
          <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
            Deadline: {task.deadlineDays} days
          </span>
          <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
            {formatRemaining(task.expireAt)}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={busy}
            className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={busy}
            className="px-4 py-2 rounded-xl bg-white text-slate-900 font-medium text-sm hover:bg-white/90 disabled:opacity-60"
          >
            {busy ? "Confirming..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Success toast ──────────────────────────────────────────────────────── */
function SuccessToast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-100 px-6 py-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-100 text-sm shadow-2xl backdrop-blur flex items-center gap-3">
      <span>✅ {message}</span>
      <button onClick={onClose} className="text-emerald-300 hover:text-white text-xs ml-2">
        ✕
      </button>
    </div>
  );
}

export default function BrowseTasksPage() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("ALL");
  const [busyId, setBusyId] = useState("");
  const [, setNowTick] = useState(Date.now());

  const [selectedTask, setSelectedTask] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadTasks = async () => {
    try {
      const data = await getOpenTasks();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const filtered = useMemo(() => {
    if (category === "ALL") return items;
    return items.filter((t) => t.category === category);
  }, [items, category]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      ui: items.filter((t) => t.category === "UI").length,
      coding: items.filter((t) => t.category === "CODING").length,
      writing: items.filter((t) => t.category === "WRITING").length,
      review: items.filter((t) => t.category === "REVIEW").length,
    };
  }, [items]);

  const askAccept = (task) => {
    setSelectedTask(task);
    setSuccessMsg("");
    setErrorMsg("");
  };

  const onAcceptConfirm = async () => {
    if (!selectedTask) return;

    try {
      setBusyId(selectedTask._id);
      await acceptTask(selectedTask._id);
      setSelectedTask(null);
      setSuccessMsg("The task has been confirmed.");
      loadTasks();
    } catch (err) {
      setSelectedTask(null);
      setErrorMsg(err?.response?.data?.message || "Task accept failed.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-white">
      {/* Task detail accept modal */}
      {selectedTask && (
        <TaskAcceptModal
          task={selectedTask}
          busy={!!busyId}
          onConfirm={onAcceptConfirm}
          onClose={() => {
            if (!busyId) setSelectedTask(null);
          }}
        />
      )}

      {/* Success toast */}
      <SuccessToast message={successMsg} onClose={() => setSuccessMsg("")} />

      {/* Error toast */}
      {errorMsg && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-100 px-6 py-3 rounded-2xl border border-red-400/20 bg-red-400/10 text-red-100 text-sm shadow-2xl backdrop-blur flex items-center gap-3">
          <span>⚠️ {errorMsg}</span>
          <button onClick={() => setErrorMsg("")} className="text-red-300 hover:text-white text-xs ml-2">
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Browse Open Tasks</h1>
          <p className="text-white/70 text-sm mt-1">
            View open help requests from other students and accept tasks you can help with.
          </p>
        </div>

        <Link
          to="/tasks/create"
          className="px-4 py-2 rounded-xl bg-white text-slate-900 font-medium hover:bg-white/90 text-sm"
        >
          + Post New Task
        </Link>
      </div>

      {/* Dashboard summary cards */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatCard label="Total Open" value={stats.total} />
        <StatCard label="UI" value={stats.ui} />
        <StatCard label="Coding" value={stats.coding} />
        <StatCard label="Writing" value={stats.writing} />
        <StatCard label="Review" value={stats.review} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {["ALL", "UI", "CODING", "WRITING", "REVIEW"].map((c) => {
          const active = category === c;
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 py-2 rounded-xl text-sm border transition ${
                active
                  ? "bg-white text-slate-900 border-white"
                  : "border-white/15 bg-white/5 hover:bg-white/10 text-white/85"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
        {loading ? (
          <div className="p-6 text-white/70">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-white/70">No open tasks found.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {filtered.map((t) => {
              const isMyOwnTask = String(t.createdBy?._id) === String(user?.id);

              return (
                <div key={t._id} className="p-5 hover:bg-white/5 transition">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-semibold">{t.title}</div>
                        <span className="text-xs px-2 py-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-100">
                          OPEN
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full border border-white/10 bg-white/5 text-white/65">
                          {t.category}
                        </span>
                        {isMyOwnTask && (
                          <span className="text-xs px-2 py-1 rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-100">
                            My Task
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-1 rounded-full border ${
                            t.urgency === "URGENT"
                              ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                              : "border-white/10 bg-white/5 text-white/65"
                          }`}
                        >
                          {t.urgency}
                        </span>
                      </div>

                      <div className="text-white/70 text-sm mt-2 line-clamp-3">
                        {t.description}
                      </div>

                      <div className="text-white/60 text-xs mt-2">
                        Outcome: <span className="text-white/75">{t.expectedOutcome}</span>
                      </div>

                      {t.attachmentUrl && (
                        <div className="text-white/60 text-xs mt-2">
                          Attachment:{" "}
                          <a
                            href={t.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-cyan-300 hover:text-cyan-200 underline break-all"
                          >
                            {t.attachmentUrl}
                          </a>
                        </div>
                      )}

                      <div className="text-white/60 text-xs mt-2">
                        Posted by:{" "}
                        <span className="text-white/75">
                          {t.createdBy?.fullName || "Unknown"}
                        </span>
                        {t.createdBy?.studentId && (
                          <span className="text-white/55"> ({t.createdBy.studentId})</span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/70">
                        <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                          Skill: {t.skillRequired}
                        </span>
                        <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                          Mode: {t.mode}
                        </span>
                        <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                          Session: {t.duration}m
                        </span>
                        <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                          Deadline: {t.deadlineDays} days
                        </span>
                        <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                          {formatRemaining(t.expireAt)}
                        </span>
                        {t.mode === "Meet" && t.venue && (
                          <span className="px-2 py-1 rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-200">
                            📍 {t.venue}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isMyOwnTask ? (
                        <button
                          disabled
                          className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-sm text-white/40 cursor-not-allowed"
                        >
                          Your Task
                        </button>
                      ) : (
                        <button
                          onClick={() => askAccept(t)}
                          disabled={busyId === t._id}
                          className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm disabled:opacity-60"
                        >
                          {busyId === t._id ? "Accepting..." : "Help / Accept"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}