export default function Footer() {
  return (
    <footer className="mt-10 border-t border-white/10 bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-10 text-white/70">
        {/* gradient divider */}
        <div className="h-px w-full bg-linear-to-r from-transparent via-white/15 to-transparent mb-8" />

        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="text-white font-semibold">EduSpark</div>
            <p className="text-sm text-white/60 mt-2">
              Campus micro-task platform with scope control. Finish help sessions in 15–60 minutes.
            </p>
            <p className="text-xs text-white/45 mt-4">
              © {new Date().getFullYear()} SLIIT • ITPM Group Project
            </p>
          </div>

          <div>
            <div className="text-white/85 font-semibold text-sm">Quick Links</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="hover:text-white transition cursor-default">Create Task</li>
              <li className="hover:text-white transition cursor-default">Matching</li>
              <li className="hover:text-white transition cursor-default">Reputation</li>
              <li className="hover:text-white transition cursor-default">Disputes & Admin</li>
            </ul>
          </div>

          <div>
            <div className="text-white/85 font-semibold text-sm">Project Stack</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["MongoDB", "Express", "React", "Node.js", "JWT", "Tailwind v4"].map((t) => (
                <span
                  key={t}
                  className="text-xs px-2 py-1 rounded-full border border-white/10 bg-white/5 text-white/65"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="mt-5 text-xs text-white/50">
              Built for clarity, fairness, and micro-commitment sessions.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}