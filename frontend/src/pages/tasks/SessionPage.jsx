import React from "react";
import { useParams } from "react-router-dom";

export default function SessionPage() {
  const { taskId } = useParams();
  
  return (
    <div className="max-w-6xl mx-auto p-10 text-white">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
        <h1 className="text-2xl font-bold mb-4">Live Session: {taskId}</h1>
        <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">Active Collaboration</p>
        <div className="mt-8 p-12 border border-dashed border-slate-700 rounded-2xl text-center text-slate-500">
          Video/Chat Interface coming soon...
        </div>
      </div>
    </div>
  );
}
