import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { completeTask, getAcceptedByMeTasks } from "../../api/taskApi";
import WarningModal from "../../components/WarningModal";

const STATUS_COLORS = {
  MATCHED: "border-cyan-400/20 bg-cyan-400/10 text-cyan-100",
  COMPLETED: "border-white/15 bg-white/5 text-white/80",
  CANCELLED: "border-red-400/20 bg-red-400/10 text-red-100",
  EXPIRED: "border-amber-400/20 bg-amber-400/10 text-amber-100",
  OPEN: "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
};

function StatusChip({ status }) {
  const cls = STATUS_COLORS[status] || "border-white/10 bg-white/5 text-white/70";
  return <span className={`text-xs px-2 py-1 rounded-full border ${cls}`}>{status}</span>;
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

export default function AcceptedByMePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [, setNowTick] = useState(Date.now());

  const [confirmCompleteOpen, setConfirmCompleteOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");

  const loadTasks = async () => {
    try {
      const data = await getAcceptedByMeTasks();
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

  const askComplete = (id) => {
    setSelectedTaskId(id);
    setConfirmCompleteOpen(true);
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
          <h1 className="text-2xl md:text-3xl font-semibold">Accepted By Me</h1>
          <p className="text-white/70 text-sm mt-1">
            These are the tasks you accepted to help with.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/tasks/browse"
            className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm"
          >
            Browse Tasks
          </Link>
          <Link
            to="/tasks/mine"
            className="px-4 py-2 rounded-xl bg-white text-slate-900 font-medium hover:bg-white/90 text-sm"
          >
            My Tasks
          </Link>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
        {loading ? (
          <div className="p-6 text-white/70">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-8">
            <div className="text-white/85 font-semibold">No accepted tasks yet</div>
            <p className="text-white/60 text-sm mt-1">
              Browse open tasks and accept one you can help with.
            </p>
            <Link
              to="/tasks/browse"
              className="inline-block mt-4 px-4 py-2 rounded-xl bg-white text-slate-900 font-medium hover:bg-white/90 text-sm"
            >
              Browse Tasks
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {items.map((t) => (
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

                    <div className="text-white/60 text-xs mt-2">
                      Task owner:{" "}
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
                    </div>
                  </div>

                  <div className="shrink-0">
                    {t.status === "MATCHED" ? (
                      <button
                        onClick={() => askComplete(t._id)}
                        disabled={busyId === t._id}
                        className="px-4 py-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-100 hover:bg-cyan-400/15 text-sm disabled:opacity-60"
                      >
                        {busyId === t._id ? "Completing..." : "Mark Complete"}
                      </button>
                    ) : (
                      <button className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 text-sm text-white/70">
                        {t.status}
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