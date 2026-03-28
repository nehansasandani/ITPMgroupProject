import { useState } from "react";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";

const initialUsers = [
  { id: 1, name: "Kamal Perera", email: "kamal@student.sliit.lk", reputation: 98, noShows: 0, status: "Active" },
  { id: 2, name: "Sarah Nimali", email: "sarah@student.sliit.lk", reputation: 85, noShows: 1, status: "Active" },
  { id: 3, name: "John Doe", email: "john@student.sliit.lk", reputation: 45, noShows: 3, status: "Suspended" },
  { id: 4, name: "Amila Silva", email: "amila@student.sliit.lk", reputation: 100, noShows: 0, status: "Active" },
  { id: 5, name: "Nadeesha K.", email: "nadie@student.sliit.lk", reputation: 60, noShows: 2, status: "Active" },
];

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers);

  const toggleStatus = (id) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        return { ...user, status: user.status === "Active" ? "Suspended" : "Active" };
      }
      return user;
    }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">User Management</h2>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Search users..." 
            className="px-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Reputation</th>
                <th className="p-4 font-semibold">No-shows</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      user.reputation >= 90 ? 'bg-green-100 text-green-800' : 
                      user.reputation >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.reputation} / 100
                    </span>
                  </td>
                  <td className="p-4 text-gray-700">{user.noShows}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.status === "Active" ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status === "Active" ? <FiCheckCircle size={12}/> : <FiXCircle size={12}/>}
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => toggleStatus(user.id)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        user.status === "Active" 
                          ? "bg-red-50 text-red-600 hover:bg-red-100" 
                          : "bg-green-50 text-green-600 hover:bg-green-100"
                      }`}
                    >
                      {user.status === "Active" ? "Suspend" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
