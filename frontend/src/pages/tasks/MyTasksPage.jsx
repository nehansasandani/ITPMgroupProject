import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { cancelTask, completeTask, deleteTask, getMyTasks } from "../../api/taskApi";
<<<<<<< HEAD
=======
import { getTopHelper } from "../../api/matchApi";
>>>>>>> 48b3336cc9a453f89e85f53cd724c10f58b43e99
import WarningModal from "../../components/WarningModal";

const STATUS_COLORS = {
  OPEN: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
  MATCHED: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
  COMPLETED: "border-white/15 bg-white/5 text-white/80",
  CANCELLED: "border-red-400/20 bg-red-400/10 text-red-100",
  EXPIRED: "border-amber-400/20 bg-amber-400/10 text-amber-100",
};

function StatusChip({ status }) {
  const cls = STATUS_COLORS[status] || "border-white/10 bg-white/5 text-white/70";
  return <span className={`text-xs px-2 py-1 rounded-full border ${cls}`}>{status}</span>;
}

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

<<<<<<< HEAD
=======
// Shows the algorithm's top-ranked helper for an OPEN task
function TopHelperBadge({ taskId }) {
  const [state, setState] = useState("idle"); // idle | loading | done
  const [helper, setHelper] = useState(null);

  useEffect(() => {
    setState("loading");
    getTopHelper(taskId)
      .then((res) => { setHelper(res.topHelper || null); setState("done"); })
      .catch(() => setState("done"));
  }, [taskId]);

  if (state === "loading") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-white/35">
        <span className="h-1.5 w-1.5 rounded-full bg-white/30 animate-pulse" />
        Finding top helper…
      </span>
    );
  }
  if (!helper) {
    return <span className="text-xs text-white/35">No matching helpers yet</span>;
  }

  const levelColor = {
    Expert: "text-violet-300 border-violet-400/30 bg-violet-400/10",
    Intermediate: "text-sky-300 border-sky-400/30 bg-sky-400/10",
    Beginner: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
  }[helper.level] || "text-white/70 border-white/15 bg-white/5";

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-white/45">Top Match:</span>
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs ${levelColor}`}>
        <span className="font-medium">{helper.fullName}</span>
        <span className="opacity-50">·</span>
        <span>{helper.level}</span>
        <span className="opacity-50">·</span>
        <span>{helper.score} pts</span>
      </span>
    </div>
  );
}

>>>>>>> 48b3336cc9a453f89e85f53cd724c10f58b43e99
export default function MyTasksPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("ALL");
  const [busyId, setBusyId] = useState("");
  const [, setNowTick] = useState(Date.now());

  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");

  const loadTasks = async () => {
    try {
      const data = await getMyTasks();
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
    if (active === "ALL") return items;
    return items.filter((t) => t.status === active);
  }, [items, active]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      open: items.filter((t) => t.status === "OPEN").length,
      matched: items.filter((t) => t.status === "MATCHED").length,
      completed: items.filter((t) => t.status === "COMPLETED").length,
      expired: items.filter((t) => t.status === "EXPIRED").length,
      cancelled: items.filter((t) => t.status === "CANCELLED").length,
    };
  }, [items]);

  const askCancel = (id) => {
    setSelectedTaskId(id);
    setConfirmCancelOpen(true);
  };

  const askDelete = (id) => {
    setSelectedTaskId(id);
    setConfirmDeleteOpen(true);
  };

  const askComplete = (id) => {
    setSelectedTaskId(id);
    setConfirmCompleteOpen(true);
  };

  const onCancelConfirm = async () => {
    try {
      setBusyId(selectedTaskId);
      await cancelTask(selectedTaskId);
      setConfirmCancelOpen(false);
      setSelectedTaskId("");
      await loadTasks();
    } finally {
      setBusyId("");
    }
  };

  const onDeleteConfirm = async () => {
    try {
      setBusyId(selectedTaskId);
      await deleteTask(selectedTaskId);
      setConfirmDeleteOpen(false);
      setSelectedTaskId("");
      await loadTasks();
    } finally {
      setBusyId("");
    }
  };

  const onCompleteConfirm = async () => {
    try {
      setBusyId(selectedTaskId);
      await completeTask(selectedTaskId);
      setConfirmCompleteOpen(false);
      setSelectedTaskId("");
      await loadTasks();
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-white">
      <WarningModal
        open={confirmCancelOpen}
        title="Cancel this task?"
        message="This will mark the task as CANCELLED. You can still delete it later if needed."
        confirmText="Yes, cancel task"
        cancelText="Keep task"
        confirmVariant="danger"
        loading={!!busyId}
        onConfirm={onCancelConfirm}
        onClose={() => {
          if (!busyId) {
            setConfirmCancelOpen(false);
            setSelectedTaskId("");
          }
        }}
      />

      <WarningModal
        open={confirmDeleteOpen}
        title="Delete this cancelled task?"
        message="This action is permanent. Deleted tasks cannot be restored."
        confirmText="Delete permanently"
        cancelText="Keep task"
        confirmVariant="danger"
        loading={!!busyId}
        onConfirm={onDeleteConfirm}
        onClose={() => {
          if (!busyId) {
            setConfirmDeleteOpen(false);
            setSelectedTaskId("");
          }
        }}
      />

      <WarningModal
        open={confirmCompleteOpen}
        title="Mark this task as completed?"
        message="This will change the task status from MATCHED to COMPLETED."
        confirmText="Yes, complete task"
        cancelText="Not yet"
        confirmVariant="primary"
        loading={!!busyId}
        onConfirm={onCompleteConfirm}
        onClose={() => {
          if (!busyId) {
            setConfirmCompleteOpen(false);
            setSelectedTaskId("");
          }
        }}
      />

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">My Tasks</h1>
          <p className="text-white/70 text-sm mt-1">
            Manage your posted tasks, monitor countdown, edit open tasks, cancel them, complete matched ones, and delete cancelled ones.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/tasks/accepted-by-me"
            className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm"
          >
            Accepted By Me
          </Link>
          <Link
            to="/tasks/create"
            className="px-4 py-2 rounded-xl bg-white text-slate-900 font-medium hover:bg-white/90 text-sm"
          >
            + New Task
          </Link>
        </div>
      </div>

      {/* Dashboard summary cards */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Open" value={stats.open} />
        <StatCard label="Matched" value={stats.matched} />
        <StatCard label="Completed" value={stats.completed} />
        <StatCard label="Expired" value={stats.expired} />
        <StatCard label="Cancelled" value={stats.cancelled} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {["ALL", "OPEN", "MATCHED", "COMPLETED", "EXPIRED", "CANCELLED"].map((s) => {
          const activeBtn = active === s;
          return (
            <button
              key={s}
              onClick={() => setActive(s)}
              className={`px-3 py-2 rounded-xl text-sm border transition ${
                activeBtn
                  ? "bg-white text-slate-900 border-white"
                  : "border-white/15 bg-white/5 hover:bg-white/10 text-white/85"
              }`}
            >
              {s}
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
        {loading ? (
          <div className="p-6 text-white/70">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8">
            <div className="text-white/85 font-semibold">No tasks found</div>
            <p className="text-white/60 text-sm mt-1">
              Create a clear task with a specific expected outcome.
            </p>
            <Link
              to="/tasks/create"
              className="inline-block mt-4 px-4 py-2 rounded-xl bg-white text-slate-900 font-medium hover:bg-white/90 text-sm"
            >
              Create Task
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filtered.map((t) => (
              <div key={t._id} className="p-5 hover:bg-white/5 transition">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="font-semibold">{t.title}</div>
                      <StatusChip status={t.status} />
                      <span className="text-xs px-2 py-1 rounded-full border border-white/10 bg-white/5 text-white/65">
                        {t.category}
                      </span>
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

                    {t.status === "MATCHED" && t.acceptedBy && (
                      <div className="text-white/60 text-xs mt-2">
                        Accepted by:{" "}
                        <span className="text-white/75">{t.acceptedBy.fullName}</span>
                        {t.acceptedBy.studentId && (
                          <span className="text-white/55"> ({t.acceptedBy.studentId})</span>
                        )}
                      </div>
                    )}

                    {t.status === "COMPLETED" && t.acceptedBy && (
                      <div className="text-white/60 text-xs mt-2">
                        Completed with help from:{" "}
                        <span className="text-white/75">{t.acceptedBy.fullName}</span>
                        {t.acceptedBy.studentId && (
                          <span className="text-white/55"> ({t.acceptedBy.studentId})</span>
                        )}
                      </div>
                    )}

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
<<<<<<< HEAD
                    </div>
=======
                      {t.mode === "Meet" && t.venue && (
                        <span className="px-2 py-1 rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-200">
                          📍 {t.venue}
                        </span>
                      )}
                    </div>

                    {t.status === "OPEN" && (
                      <div className="mt-3">
                        <TopHelperBadge taskId={t._id} />
                      </div>
                    )}
>>>>>>> 48b3336cc9a453f89e85f53cd724c10f58b43e99
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {t.status === "OPEN" && (
                      <>
                        <Link
<<<<<<< HEAD
=======
                          to={`/match`}
                          className="px-3 py-2 rounded-xl text-sm border border-violet-400/20 bg-violet-400/10 text-violet-200 hover:bg-violet-400/15"
                        >
                          Find Match
                        </Link>
                        <Link
>>>>>>> 48b3336cc9a453f89e85f53cd724c10f58b43e99
                          to={`/tasks/edit/${t._id}`}
                          className="px-3 py-2 rounded-xl text-sm border border-white/15 bg-white/5 hover:bg-white/10"
                        >
                          Edit
                        </Link>

                        <button
                          onClick={() => askCancel(t._id)}
                          disabled={busyId === t._id}
                          className="px-3 py-2 rounded-xl text-sm border border-red-400/20 bg-red-400/10 text-red-100 hover:bg-red-400/15 disabled:opacity-60"
                        >
                          {busyId === t._id ? "Cancelling..." : "Cancel"}
                        </button>
                      </>
                    )}

                    {t.status === "MATCHED" && (
<<<<<<< HEAD
                      <button
                        onClick={() => askComplete(t._id)}
                        disabled={busyId === t._id}
                        className="px-3 py-2 rounded-xl text-sm border border-cyan-400/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15 disabled:opacity-60"
                      >
                        {busyId === t._id ? "Completing..." : "Complete"}
                      </button>
=======
                      <>
                        <Link
                          to={`/session/${t._id}`}
                          className="px-3 py-2 rounded-xl text-sm border border-violet-400/20 bg-violet-400/10 text-violet-200 hover:bg-violet-400/15"
                        >
                          View Session
                        </Link>
                        <button
                          onClick={() => askComplete(t._id)}
                          disabled={busyId === t._id}
                          className="px-3 py-2 rounded-xl text-sm border border-cyan-400/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15 disabled:opacity-60"
                        >
                          {busyId === t._id ? "Completing..." : "Complete"}
                        </button>
                      </>
>>>>>>> 48b3336cc9a453f89e85f53cd724c10f58b43e99
                    )}

                    {t.status === "CANCELLED" && (
                      <button
                        onClick={() => askDelete(t._id)}
                        disabled={busyId === t._id}
                        className="px-3 py-2 rounded-xl text-sm border border-red-400/20 bg-red-400/10 text-red-100 hover:bg-red-400/15 disabled:opacity-60"
                      >
                        {busyId === t._id ? "Deleting..." : "Delete"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}