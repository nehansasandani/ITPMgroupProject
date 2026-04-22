import { useEffect, useState } from "react";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { getAdminUsers, toggleUserStatus } from "../../api/adminApi";

const isSuspended = (user) =>
  user.cooldownUntil && new Date(user.cooldownUntil) > new Date();

export default function UsersPage() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [busyId,  setBusyId]  = useState("");

  useEffect(() => {
    getAdminUsers()
      .then((data) => setUsers(data.users))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (id) => {
    try {
      setBusyId(id);
      const data = await toggleUserStatus(id);
      // Replace the updated user in local state
      setUsers((prev) =>
        prev.map((u) => (u._id === id ? data.user : u))
      );
    } catch (err) {
      console.error("Toggle failed", err);
    } finally {
      setBusyId("");
    }
  };

  const filtered = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.studentId.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="text-gray-500 p-8">Loading users...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">User Management</h2>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Student ID</th>
                <th className="p-4 font-semibold">Reputation</th>
                <th className="p-4 font-semibold">Completed</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400 text-sm">
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{user.fullName}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-700">{user.studentId}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        user.reputation >= 4   ? "bg-green-100 text-green-800"  :
                        user.reputation >= 2.5 ? "bg-yellow-100 text-yellow-800" :
                                                 "bg-red-100 text-red-800"
                      }`}>
                        {user.reputation?.toFixed(1)} / 5
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      {user.completedTasksCount ?? 0}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        !isSuspended(user)
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {!isSuspended(user)
                          ? <FiCheckCircle size={12} />
                          : <FiXCircle size={12} />}
                        {!isSuspended(user) ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggle(user._id)}
                        disabled={busyId === user._id}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50 ${
                          !isSuspended(user)
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-green-50 text-green-600 hover:bg-green-100"
                        }`}
                      >
                        {busyId === user._id
                          ? "..."
                          : !isSuspended(user) ? "Suspend" : "Activate"}
                      </button>
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