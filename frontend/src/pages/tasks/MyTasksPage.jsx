import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMyTasks } from "../../api/taskApi";

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

export default function MyTasksPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("ALL");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getMyTasks();
        setItems(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    if (active === "ALL") return items;
    return items.filter((t) => t.status === active);
  }, [items, active]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-white">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">My Tasks</h1>
          <p className="text-white/70 text-sm mt-1">Your created tasks (latest first).</p>
        </div>
        <Link
          to="/tasks/create"
          className="px-4 py-2 rounded-xl bg-white text-slate-900 font-medium hover:bg-white/90 text-sm"
        >
          + New Task
        </Link>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {["ALL", "OPEN", "MATCHED", "COMPLETED", "EXPIRED", "CANCELLED"].map((s) => {
          const activeBtn = active === s;
          return (
            <button
              key={s}
              onClick={() => setActive(s)}
              className={`px-3 py-2 rounded-xl text-sm border transition ${
                activeBtn ? "bg-white text-slate-900 border-white" : "border-white/15 bg-white/5 hover:bg-white/10"
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
            <div className="text-white/80 font-semibold">No tasks yet</div>
            <p className="text-white/60 text-sm mt-1">
              Create your first task with a clear expected outcome.
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
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-white/70 text-sm mt-1 line-clamp-2">{t.description}</div>
                    <div className="text-white/60 text-xs mt-2">
                      Outcome: <span className="text-white/75">{t.expectedOutcome}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/70">
                      <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                        Skill: {t.skillRequired}
                      </span>
                      <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                        Mode: {t.mode}
                      </span>
                      <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                        Duration: {t.duration}m
                      </span>
                    </div>
                  </div>
                  <StatusChip status={t.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}