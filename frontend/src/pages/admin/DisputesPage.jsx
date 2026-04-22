import { useEffect, useState } from "react";
import { FiAlertCircle, FiCheck, FiX } from "react-icons/fi";
import { getDisputes, resolveDispute } from "../../api/adminApi";

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
    return <div className="text-gray-500 p-8">Loading disputes...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            Dispute Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Review and resolve reported session issues
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold">Report Details</th>
                <th className="p-4 font-semibold">Reason</th>
                <th className="p-4 font-semibold">Session</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {disputes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-400 text-sm">
                    No disputes found.
                  </td>
                </tr>
              ) : (
                disputes.map((dispute) => (
                  <tr key={dispute._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="text-sm">
                        <span className="text-gray-500">By:</span>{" "}
                        <span className="font-medium text-gray-900">
                          {dispute.reportedBy?.fullName ?? "Unknown"}
                        </span>
                      </div>
                      <div className="text-sm mt-0.5">
                        <span className="text-gray-500">Vs:</span>{" "}
                        <span className="font-medium text-red-600">
                          {dispute.against?.fullName ?? "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-700 bg-orange-50 px-2.5 py-1 rounded">
                        <FiAlertCircle size={14} />
                        {dispute.reason}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      {dispute.session?._id
                        ? `Session #${dispute.session._id.toString().slice(-6)}`
                        : "—"}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        dispute.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : dispute.status.includes("Penalty")
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {dispute.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {dispute.status === "Pending" ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleAction(dispute._id, "reject")}
                            disabled={busyId === dispute._id}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Dismiss"
                          >
                            <FiX size={18} />
                          </button>
                          <button
                            onClick={() => handleAction(dispute._id, "approve")}
                            disabled={busyId === dispute._id}
                            className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-medium transition-colors flex items-center gap-1 disabled:opacity-50"
                          >
                            <FiCheck size={14} /> Penalty
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          Action taken
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}