import { FiSearch } from "react-icons/fi";

const sessions = [
  { id: 101, title: "Math 101 Tutoring", requester: "Kamal Perera", helper: "Sarah Nimali", status: "Completed", location: "Library", time: "10:00 AM" },
  { id: 102, title: "Lab Report Review", requester: "John Doe", helper: "Amila Silva", status: "In Progress", location: "A Block Labs", time: "1:30 PM" },
  { id: 103, title: "Programming Assignment Help", requester: "Nadeesha K.", helper: "Kamal Perera", status: "Accepted", location: "Online", time: "3:00 PM" },
  { id: 104, title: "Physics Homework", requester: "Sarah Nimali", helper: "John Doe", status: "Disputed", location: "Cafeteria", time: "Yesterday" },
  { id: 105, title: "Database Architecture", requester: "Amila Silva", helper: "Nadeesha K.", status: "Completed", location: "Main Hall", time: "2 Days ago" },
];

export default function SessionsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Session Monitoring</h2>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search sessions..." 
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-semibold">Task</th>
                <th className="p-4 font-semibold">Participants</th>
                <th className="p-4 font-semibold">Location & Time</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map(session => (
                <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{session.title}</div>
                    <div className="text-xs text-gray-500">ID: #{session.id}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Req:</span> <span className="font-medium">{session.requester}</span>
                    </div>
                    <div className="text-sm mt-0.5">
                      <span className="text-gray-500">Help:</span> <span className="font-medium">{session.helper}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-900">{session.location}</div>
                    <div className="text-xs text-gray-500">{session.time}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      session.status === "Completed" ? 'bg-green-100 text-green-700' : 
                      session.status === "In Progress" ? 'bg-yellow-100 text-yellow-700' :
                      session.status === "Disputed" ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {session.status}
                    </span>
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
