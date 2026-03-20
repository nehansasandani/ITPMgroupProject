import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { acceptTask, getOpenTasks } from "../../api/taskApi";
import { useAuth } from "../../context/AuthContext";
import WarningModal from "../../components/WarningModal";

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

export default function BrowseTasksPage() {
  const { user } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("ALL");
  const [busyId, setBusyId] = useState("");
  const [, setNowTick] = useState(Date.now());

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMessage, setPopupMessage] = useState("");

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
    setConfirmOpen(true);
  };

  const onAcceptConfirm = async () => {
    if (!selectedTask) return;

    try {
      setBusyId(selectedTask._id);
      await acceptTask(selectedTask._id);
      setConfirmOpen(false);
      setSelectedTask(null);
      setPopupTitle("Task Accepted");
      setPopupMessage("You are now matched to help with this task.");
      setPopupOpen(true);
      await loadTasks();
    } catch (err) {
      setConfirmOpen(false);
      setSelectedTask(null);
      setPopupTitle("Unable to Accept Task");
      setPopupMessage(err?.response?.data?.message || "Task accept failed");
      setPopupOpen(true);
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-white">
      <WarningModal
        open={confirmOpen}
        title="Accept this task?"
        message={
          selectedTask
            ? `You are about to help with "${selectedTask.title}". This will mark the task as MATCHED.`
            : ""
        }
        confirmText="Yes, accept task"
        cancelText="Back"
        confirmVariant="primary"
        loading={!!busyId}
        onConfirm={onAcceptConfirm}
        onClose={() => {
          if (!busyId) {
            setConfirmOpen(false);
            setSelectedTask(null);
          }
        }}
      />

      <WarningModal
        open={popupOpen}
        title={popupTitle}
        message={popupMessage}
        confirmText="OK"
        cancelText="Close"
        confirmVariant="primary"
        onConfirm={() => setPopupOpen(false)}
        onClose={() => setPopupOpen(false)}
      />

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