import React from "react";
import { FiTarget, FiZap, FiUsers } from "react-icons/fi";

/**
 * MatchPage - A professional placeholder for the Skill Matching interface.
 */
export default function MatchPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 text-white animate-in fade-in duration-500">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 relative overflow-hidden">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
              <FiTarget size={30} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Skill Matching</h1>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-widest mt-1">Smart Connection Engine</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 bg-slate-800/20 border border-slate-700/50 rounded-2xl">
              <FiZap className="text-amber-400 mb-4" size={24} />
              <h3 className="font-bold text-lg mb-2 text-white">Instant Matching</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Our AI connects you with users whose profiles complement your learning goals perfectly.</p>
            </div>
            <div className="p-6 bg-slate-800/20 border border-slate-700/50 rounded-2xl">
              <FiUsers className="text-indigo-400 mb-4" size={24} />
              <h3 className="font-bold text-lg mb-2 text-white">Peer Network</h3>
              <p className="text-slate-500 text-xs leading-relaxed">Join a curated network of experts and seekers in your specific technology stack.</p>
            </div>
            <div className="p-6 bg-slate-800/20 border border-slate-700/50 rounded-2xl flex flex-col justify-center items-center text-center italic border-dashed border-slate-700">
              <p className="text-slate-500 text-[11px] font-bold">Algorithms currently being refined for precision matching...</p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 flex justify-between items-center">
            <div className="text-xs text-slate-600 font-bold uppercase tracking-widest">v1.2.0 • Status: Synchronizing</div>
            <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/10">
              Refresh Feed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}