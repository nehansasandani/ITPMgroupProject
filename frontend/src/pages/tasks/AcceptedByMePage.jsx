import { useState } from "react";
import { Link } from "react-router-dom";
import SessionCard from "../../components/sessions/SessionCard";

const mockSessions = [
  {
    id: 9021,
    title: "React Hooks Consultation",
    requester: "Current User",
    helper: "Kasun Silva",
    status: "Accepted",
    location: "Library Discussion Room A",
    time: "Today, 4:00 PM",
  },
  {
    id: 9022,
    title: "Data Structures Study Group",
    requester: "Nimali Perera",
    helper: "Current User",
    status: "Completed",
    location: "Online (Zoom)",
    time: "Yesterday, 2:00 PM",
  }
];

export default function AcceptedByMePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-white">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">My Active Sessions</h1>
          <p className="text-white/70 text-sm mt-1">
            Manage sessions you've accepted or requested help for.
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {mockSessions.map((session) => (
          <div key={session.id} className="text-gray-900 border border-white/10 rounded-xl overflow-hidden bg-white/5 p-1 pb-2 fade-up">
            <SessionCard session={session} />
          </div>
        ))}
      </div>
    </div>
  );
}