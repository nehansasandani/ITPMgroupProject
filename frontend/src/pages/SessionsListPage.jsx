import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMySessions } from "../api/matchApi";
import { useAuth } from "../context/AuthContext";

function formatDuration(startedAt, endedAt) {
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  const mins = Math.floor((end - start) / 60000);
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function SessionsListPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    (async () => {
      try {
        const data = await getMySessions();
        setSessions(data.sessions || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered =
    filter === "ALL"
      ? sessions
      : sessions.filter((s) => s.status === filter);

  const activeCt = sessions.filter((s) => s.status === "ACTIVE").length;
  const completedCt = sessions.filter((s) => s.status === "COMPLETED").length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-white">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold">My Sessions</h1>
        <p className="text-white/70 text-sm mt-1">
          View all your active and completed help sessions.
        </p>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-2xl font-semibold">{sessions.length}</div>
          <div className="text-white/60 text-sm mt-1">Total</div>
        </div>
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
          <div className="text-2xl font-semibold text-emerald-300">{activeCt}</div>
          <div className="text-white/60 text-sm mt-1">Active</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-2xl font-semibold">{completedCt}</div>
          <div className="text-white/60 text-sm mt-1">Completed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap gap-2">
        {["ALL", "ACTIVE", "COMPLETED"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 rounded-xl text-sm border transition ${
              filter === f
                ? "bg-white text-slate-900 border-white"
                : "border-white/15 bg-white/5 hover:bg-white/10 text-white/85"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Session list */}
      <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
        {loading ? (
          <div className="p-6 text-white/70">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-white/70">No sessions found.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {filtered.map((s) => {
              const isPoster = String(s.poster?._id) === String(user?.id);
              const otherPerson = isPoster ? s.helper : s.poster;
              const role = isPoster ? "Seeker" : "Helper";

              return (
                <div key={s._id} className="p-5 hover:bg-white/5 transition">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="min-w-0">
                      {/* Task title & status */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">
                          {s.task?.title || "Untitled Task"}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${
                            s.status === "ACTIVE"
                              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                              : "border-white/10 bg-white/5 text-white/65"
                          }`}
                        >
                          {s.status}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full border border-violet-400/20 bg-violet-400/10 text-violet-200">
                          {role}
                        </span>
                      </div>

                      {/* Other person */}
                      <div className="text-white/60 text-sm mt-2">
                        {isPoster ? "Helper" : "Seeker"}:{" "}
                        <span className="text-white/80">
                          {otherPerson?.fullName || "Unknown"}
                        </span>
                        {otherPerson?.studentId && (
                          <span className="text-white/50">
                            {" "}
                            ({otherPerson.studentId})
                          </span>
                        )}
                      </div>

                      {/* Meta pills */}
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/70">
                        <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                          {s.task?.category}
                        </span>
                        <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                          Skill: {s.task?.skillRequired}
                        </span>
                        <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                          Mode: {s.mode}
                        </span>
                        <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                          {s.task?.duration}m session
                        </span>
                        <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                          ⏱ {formatDuration(s.startedAt, s.endedAt)}
                        </span>
                        {s.venue && (
                          <span className="px-2 py-1 rounded-full border border-amber-400/20 bg-amber-400/10 text-amber-200">
                            📍 {s.venue}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* View Session button */}
                    <div className="shrink-0">
                      <Link
                        to={`/session/${s.task?._id}`}
                        className="inline-block px-4 py-2 rounded-xl border border-violet-400/25 bg-violet-400/10 text-violet-200 text-sm hover:bg-violet-400/20 transition"
                      >
                        View Session
                      </Link>
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
