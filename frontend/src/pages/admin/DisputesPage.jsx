import { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiCheck,
  FiClock,
  FiShield,
  FiX,
  FiZap,
} from "react-icons/fi";
import { getDisputes, resolveDispute } from "../../api/adminApi";
import AdminPageNav from "./AdminPageNav";
import "./adminTheme.css";

const getReasonSeverity = (reason = "") => {
  const text = reason.toLowerCase();
  if (text.includes("harass") || text.includes("fraud") || text.includes("abuse")) return "critical";
  if (text.includes("quality") || text.includes("no-show") || text.includes("late")) return "high";
  return "medium";
};

export default function DisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [busyId,   setBusyId]   = useState("");

  useEffect(() => {
    getDisputes()
      .then((data) => setDisputes(data.disputes))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this dispute?`)) return;
    try {
      setBusyId(id);
      const data = await resolveDispute(id, action);
      setDisputes((prev) =>
        prev.map((d) => (d._id === id ? data.dispute : d))
      );
    } catch (err) {
      console.error("Resolve failed", err);
    } finally {
      setBusyId("");
    }
  };

  if (loading) {
    return <div className="text-slate-300 p-8 admin-theme">Loading dispute board...</div>;
  }

  const pendingCount = disputes.filter((item) => item.status === "Pending").length;
  const resolvedCount = disputes.length - pendingCount;
  const penaltiesCount = disputes.filter((item) => item.status.includes("Penalty")).length;
  const penaltyRate = disputes.length ? Math.round((penaltiesCount / disputes.length) * 100) : 0;

  const reasonBuckets = disputes.reduce((acc, item) => {
    const key = item.reason || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topReasons = Object.entries(reasonBuckets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <section className="admin-theme max-w-7xl mx-auto admin-rise">
      <div className="admin-shell p-6 md:p-8 space-y-6">
        <div className="admin-grid-glow" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="admin-chip bg-amber-400/15 text-amber-100 border border-amber-200/35 mb-3 w-fit">
              Integrity Resolution Desk
            </p>
            <h2 className="admin-title text-3xl font-semibold text-white">Dispute Management</h2>
            <p className="text-slate-300 text-sm mt-2 max-w-2xl">
              Triage and resolve reported session incidents while protecting trust quality across the EduSpark collaboration network.
            </p>
          </div>

          <div className="admin-panel px-4 py-3 min-w-[250px]">
            <div className="text-xs uppercase tracking-[0.12em] text-slate-400">Penalty Conversion</div>
            <div className="mt-1 admin-title text-3xl text-white">{penaltyRate}%</div>
            <div className="h-2 mt-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-rose-400 to-amber-300" style={{ width: `${penaltyRate}%` }} />
            </div>
          </div>
        </div>

        <AdminPageNav />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3">
          <article className="admin-kpi p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Pending Cases</p>
                <p className="admin-title text-3xl text-white mt-2">{pendingCount}</p>
              </div>
              <FiClock className="text-amber-200" />
            </div>
            <p className="text-xs text-slate-300 mt-2">Awaiting moderation decision</p>
          </article>
          <article className="admin-kpi p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Resolved Cases</p>
                <p className="admin-title text-3xl text-white mt-2">{resolvedCount}</p>
              </div>
              <FiShield className="text-emerald-200" />
            </div>
            <p className="text-xs text-slate-300 mt-2">Completed moderation outcomes</p>
          </article>
          <article className="admin-kpi p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-slate-400">Penalties Applied</p>
                <p className="admin-title text-3xl text-white mt-2">{penaltiesCount}</p>
              </div>
              <FiZap className="text-rose-200" />
            </div>
            <p className="text-xs text-slate-300 mt-2">Behavior correction actions</p>
          </article>
        </div>

        <div className="relative z-10 grid grid-cols-1 xl:grid-cols-3 gap-4">
          <section className="admin-panel p-4 xl:col-span-2 space-y-3">
            <h3 className="admin-title text-lg text-white mb-1">Case Queue</h3>

            {disputes.length === 0 ? (
              <p className="text-sm text-slate-400">No disputes found.</p>
            ) : (
              disputes.map((dispute) => {
                const severity = getReasonSeverity(dispute.reason);
                const severityTone =
                  severity === "critical"
                    ? "bg-rose-500/15 border-rose-300/35 text-rose-100"
                    : severity === "high"
                    ? "bg-amber-500/15 border-amber-300/35 text-amber-100"
                    : "bg-sky-500/15 border-sky-300/35 text-sky-100";

                const isPending = dispute.status === "Pending";

                return (
                  <article key={dispute._id} className="rounded-xl border border-slate-700/70 bg-slate-900/35 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm text-slate-200">
                          <span className="text-slate-400">Reported by </span>
                          <span className="font-semibold text-white">{dispute.reportedBy?.fullName ?? "Unknown"}</span>
                          <span className="text-slate-400"> against </span>
                          <span className="font-semibold text-rose-200">{dispute.against?.fullName ?? "Unknown"}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          {dispute.session?._id
                            ? `Session ${dispute.session._id.toString().slice(-6)}`
                            : "Session unavailable"}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`admin-chip border ${severityTone}`}>
                          <FiAlertCircle size={12} />
                          <span className="ml-1 capitalize">{severity} risk</span>
                        </span>
                        <span className={`admin-chip border ${
                          isPending
                            ? "bg-amber-500/15 text-amber-100 border-amber-300/35"
                            : dispute.status.includes("Penalty")
                            ? "bg-rose-500/15 text-rose-100 border-rose-300/35"
                            : "bg-emerald-500/15 text-emerald-100 border-emerald-300/35"
                        }`}>
                          {dispute.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="inline-flex items-center gap-2 text-sm text-slate-200">
                        <FiAlertCircle className="text-amber-200" />
                        <span>{dispute.reason}</span>
                      </div>

                      {isPending ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAction(dispute._id, "reject")}
                            disabled={busyId === dispute._id}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 border border-slate-600 text-slate-200 hover:bg-slate-700 disabled:opacity-50"
                            title="Dismiss"
                          >
                            <span className="inline-flex items-center gap-1"><FiX size={13} /> Dismiss</span>
                          </button>
                          <button
                            onClick={() => handleAction(dispute._id, "approve")}
                            disabled={busyId === dispute._id}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 border border-rose-300/35 text-rose-100 hover:bg-rose-500/30 disabled:opacity-50"
                          >
                            <span className="inline-flex items-center gap-1"><FiCheck size={13} /> Apply Penalty</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Resolution logged</span>
                      )}
                    </div>
                  </article>
                );
              })
            )}
          </section>

          <section className="admin-panel p-4">
            <h3 className="admin-title text-lg text-white mb-4">Reason Frequency</h3>
            {topReasons.length === 0 ? (
              <p className="text-sm text-slate-400">No reason patterns available.</p>
            ) : (
              <ul className="space-y-3">
                {topReasons.map(([reason, count], index) => {
                  const maxCount = topReasons[0][1] || 1;
                  const width = (count / maxCount) * 100;
                  return (
                    <li key={`${reason}-${index}`}>
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span className="truncate pr-2">{reason}</span>
                        <span>{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-300 to-rose-400"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}