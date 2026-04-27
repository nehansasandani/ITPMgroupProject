import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { cancelTask, completeTask, deleteTask, getMyTasks } from "../../api/taskApi";
import { getTopHelper } from "../../api/matchApi";
import WarningModal from "../WarningModal";
import { FiCheckCircle, FiPlus, FiTrash2, FiActivity, FiClock, FiStar, FiEdit3, FiX, FiBarChart2, FiLock, FiUnlock, FiShield, FiBriefcase, FiCopy, FiMapPin } from "react-icons/fi";

const STATUS_COLORS = {
  OPEN: "text-emerald-400 bg-emerald-400/10 border-emerald-500/20",
  MATCHED: "text-cyan-400 bg-cyan-400/10 border-cyan-500/20",
  COMPLETED: "text-slate-300 bg-slate-800/50 border-slate-700",
  CANCELLED: "text-red-400 bg-red-400/10 border-red-500/20",
  EXPIRED: "text-amber-400 bg-amber-400/10 border-amber-500/20",
};

function StatusChip({ status }) {
  const cls = STATUS_COLORS[status] || "text-slate-400 bg-slate-800/50 border-slate-700";
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${cls}`}>
      {status}
    </span>
  );
}

function StatCard({ label, value, icon, color = "text-white" }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 transition-all hover:border-slate-700 group">
      <div className="flex items-center justify-between mb-2">
        <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
        <div className="text-slate-600 group-hover:text-slate-400 transition-colors">
          {icon}
        </div>
      </div>
      <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{label}</div>
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

  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

function TopHelperBadge({ taskId }) {
  const [state, setState] = useState("idle"); 
  const [helper, setHelper] = useState(null);

  useEffect(() => {
    setState("loading");
    getTopHelper(taskId)
      .then((res) => { setHelper(res.topHelper || null); setState("done"); })
      .catch(() => setState("done"));
  }, [taskId]);

  if (state === "loading") return <div className="h-4 w-32 bg-slate-800 animate-pulse rounded"></div>;
  if (!helper) return <span className="text-[10px] text-slate-500 italic">Finding best match...</span>;

  const levelColor = {
    Expert: "text-indigo-400 border-indigo-500/20 bg-indigo-500/10",
    Intermediate: "text-cyan-400 border-cyan-500/20 bg-cyan-500/10",
    Beginner: "text-emerald-400 border-emerald-500/20 bg-emerald-400/10",
  }[helper.level] || "text-slate-400 border-slate-800 bg-slate-800/50";

  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-bold text-slate-500 uppercase">Top Match:</span>
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold ${levelColor}`}>
        {helper.fullName} · {helper.level} · {helper.score} pts
      </span>
    </div>
  );
}

export default function UserProfileTasks() {
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
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    const timer = setInterval(() => setNowTick(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const filtered = useMemo(() => {
    if (active === "ALL") return items;
    return items.filter((t) => t.status === active);
  }, [items, active]);

  const stats = useMemo(() => ({
    total: items.length,
    open: items.filter((t) => t.status === "OPEN").length,
    matched: items.filter((t) => t.status === "MATCHED").length,
    completed: items.filter((t) => t.status === "COMPLETED").length,
    expired: items.filter((t) => t.status === "EXPIRED").length,
    cancelled: items.filter((t) => t.status === "CANCELLED").length,
  }), [items]);

  const handleAction = async (id, actionFn, modalSetter) => {
    try {
      setBusyId(id);
      await actionFn(id);
      modalSetter(false);
      setSelectedTaskId("");
      await loadTasks();
    } catch (err) {
      alert("Action failed: " + (err.response?.data?.message || err.message));
    } finally {
      setBusyId("");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 text-sm">Gathering your tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WarningModal
        open={confirmCancelOpen}
        title="Cancel Task"
        message="Are you sure you want to cancel this task? This will stop helpers from finding it."
        confirmText="Cancel Task"
        confirmVariant="danger"
        loading={!!busyId}
        onConfirm={() => handleAction(selectedTaskId, cancelTask, setConfirmCancelOpen)}
        onClose={() => !busyId && setConfirmCancelOpen(false)}
      />
      
      <WarningModal
        open={confirmDeleteOpen}
        title="Delete Task"
        message="This action is permanent. You cannot recover deleted tasks."
        confirmText="Delete Permanently"
        confirmVariant="danger"
        loading={!!busyId}
        onConfirm={() => handleAction(selectedTaskId, deleteTask, setConfirmDeleteOpen)}
        onClose={() => !busyId && setConfirmDeleteOpen(false)}
      />

      <WarningModal
        open={confirmCompleteOpen}
        title="Complete Task"
        message="Marking this task as completed means the helper has successfully assisted you."
        confirmText="Mark Completed"
        confirmVariant="primary"
        loading={!!busyId}
        onConfirm={() => handleAction(selectedTaskId, completeTask, setConfirmCompleteOpen)}
        onClose={() => !busyId && setConfirmCompleteOpen(false)}
      />

      {/* Header & Stats */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">My Task Hub</h2>
            <p className="text-sm text-slate-400">Manage tasks you&apos;ve posted and monitor their progress.</p>
          </div>
          <Link 
            to="/tasks/create"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white hover:bg-indigo-600 rounded-xl transition shadow-lg shadow-indigo-500/20 font-bold text-xs uppercase tracking-wider"
          >
            <FiPlus size={16} /> New Task
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Total" value={stats.total} icon={<FiActivity size={16} />} />
          <StatCard label="Searching" value={stats.open} icon={<FiBriefcase size={16} />} color="text-emerald-400" />
          <StatCard label="Matched" value={stats.matched} icon={<FiCheckCircle size={16} />} color="text-cyan-400" />
          <StatCard label="Done" value={stats.completed} icon={<FiStar size={16} />} color="text-white" />
          <StatCard label="Expired" value={stats.expired} icon={<FiClock size={16} />} color="text-amber-400" />
          <StatCard label="Inactive" value={stats.cancelled} icon={<FiX size={16} />} color="text-red-400" />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["ALL", "OPEN", "MATCHED", "COMPLETED", "EXPIRED", "CANCELLED"].map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
              active === s
                ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/40 shadow-lg shadow-indigo-500/5"
                : "bg-slate-900 text-slate-500 border-slate-800 hover:text-white hover:border-slate-700"
            }`}
          >
            {s === "OPEN" ? "Searching" : s}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 border-dashed rounded-3xl p-12 text-center flex flex-col items-center">
            <FiBriefcase className="text-5xl text-slate-700 mb-4" />
            <p className="text-slate-500">No tasks found in this category.</p>
          </div>
        ) : (
          filtered.map((t) => (
            <div key={t._id} className="group bg-slate-900/40 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all">
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-white font-bold text-lg">{t.title}</h3>
                    <StatusChip status={t.status} />
                    {t.urgency === "URGENT" && (
                      <span className="px-2 py-0.5 text-[9px] font-black bg-red-500/10 text-red-400 border border-red-500/20 rounded uppercase tracking-tighter animate-pulse">Urgent</span>
                    )}
                  </div>

                  <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">{t.description}</p>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                      <FiBriefcase className="text-indigo-400" />
                      {t.skillRequired}
                    </div>
                    {t.venue && (
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                        <FiMapPin className="text-amber-400" />
                        {t.venue}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                      <FiClock className="text-emerald-400" />
                      {formatRemaining(t.expireAt)}
                    </div>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(t._id); alert("ID Copied!"); }}
                      className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-indigo-400 transition"
                    >
                      <FiCopy />
                      ID: {t._id.slice(-6)}
                    </button>
                  </div>

                  {t.status === "OPEN" && <TopHelperBadge taskId={t._id} />}
                  
                  {(t.status === "MATCHED" || t.status === "COMPLETED") && t.acceptedBy && (
                    <div className="flex items-center gap-2 pt-1">
                      <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-white border border-slate-700">
                        {t.acceptedBy.fullName.charAt(0)}
                      </div>
                      <span className="text-xs text-slate-400">
                        {t.status === "MATCHED" ? "Assigned to" : "Helped by"}{" "}
                        <span className="text-indigo-400 font-semibold">{t.acceptedBy.fullName}</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex lg:flex-col justify-end gap-2 shrink-0">
                  {t.status === "OPEN" && (
                    <>
                      <Link to={`/tasks/edit/${t._id}`} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition" title="Edit">
                        <FiEdit3 size={18} />
                      </Link>
                      <button onClick={() => { setSelectedTaskId(t._id); setConfirmCancelOpen(true); }} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition" title="Cancel">
                        <FiX size={18} />
                      </button>
                    </>
                  )}
                  {t.status === "MATCHED" && (
                    <button 
                      onClick={() => { setSelectedTaskId(t._id); setConfirmCompleteOpen(true); }}
                      className="px-4 py-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      Complete
                    </button>
                  )}
                  {t.status === "CANCELLED" && (
                    <button onClick={() => { setSelectedTaskId(t._id); setConfirmDeleteOpen(true); }} className="p-2 text-slate-500 hover:text-red-500 transition" title="Delete Permanent">
                      <FiTrash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
