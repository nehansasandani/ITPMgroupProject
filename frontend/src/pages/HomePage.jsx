import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ui } from "../styles/ui";

function Stat({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 hover:bg-slate-50 dark:hover:bg-white/10 transition shadow-sm dark:shadow-none">
      <div className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</div>
      <div className="text-slate-600 dark:text-white/70 text-sm mt-1">{label}</div>
      {sub && <div className="text-slate-500 dark:text-white/50 text-xs mt-1">{sub}</div>}
    </div>
  );
}

function Feature({ title, desc, tag }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 hover:bg-slate-50 dark:hover:bg-white/10 transition shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
        {tag && (
          <span className="text-xs px-2 py-1 rounded-full border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-white/70">
            {tag}
          </span>
        )}
      </div>
      <p className="mt-2 text-slate-600 dark:text-white/70 text-sm">{desc}</p>
    </div>
  );
}

function Step({ n, title, desc }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/30 p-5">
      <div className="text-slate-500 dark:text-white/60 text-xs font-medium">{n}</div>
      <div className="mt-2 font-semibold text-slate-900 dark:text-white">{title}</div>
      <div className="mt-2 text-slate-600 dark:text-white/70 text-sm">{desc}</div>
    </div>
  );
}

export default function HomePage() {
  const { isAuthed, role } = useAuth();

  return (
    <div className="text-slate-900 dark:text-white">
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-10">
        <div className="relative overflow-hidden rounded-[34px] border border-slate-200 dark:border-white/10 bg-linear-to-b from-slate-100 dark:from-white/12 to-transparent p-8 md:p-12 fade-up shadow-sm dark:shadow-none bg-white dark:bg-transparent">
          {/* animated blobs */}
          <div className="blob b1 -top-16 -right-16 h-72 w-72 bg-indigo-400/20 dark:bg-indigo-400/40" />
          <div className="blob b2 -bottom-20 -left-20 h-72 w-72 bg-cyan-300/20 dark:bg-cyan-300/35" />
          <div className="blob b3 top-1/3 left-1/2 h-64 w-64 -translate-x-1/2 bg-pink-300/15 dark:bg-pink-300/25" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 px-3 py-1 text-xs text-slate-700 dark:text-white/80">
              <span className="h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              Micro-commitment help • Scope controlled • 15–60 mins
            </div>

            <h1 className="mt-5 text-3xl md:text-5xl font-semibold leading-tight text-slate-900 dark:text-white">
              Finish campus help faster with{" "}
              <span className="text-slate-600 dark:text-white/80">clear, time-boxed</span> tasks.
            </h1>

            <p className="mt-4 text-slate-600 dark:text-white/70 max-w-2xl">
              EduSpark lets students create small tasks with an expected outcome. The system blocks vague requests,
              reduces scope creep, and matches the right helper quickly.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              {!isAuthed ? (
                <>
                  <Link
                    to="/register"
                    className="px-5 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90 transition"
                  >
                    Create account
                  </Link>
                  <Link
                    to="/login"
                    className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-white/20 dark:text-white/90 dark:hover:bg-white/10 transition"
                  >
                    Login
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/tasks/create"
                    className="px-5 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90 transition"
                  >
                    Create a task
                  </Link>
                  <div className="px-5 py-3 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-white/80">
                    Logged in as <span className="font-semibold text-slate-900 dark:text-white">{role}</span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Stat label="Time limit enforced" value="15–60m" sub="Stops long/open-ended work" />
              <Stat label="Expected outcome" value="Required" sub="Forces clarity & scope control" />
              <Stat label="Auto expiry" value="48h" sub="Prevents stale/abandoned tasks" />
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="flex items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white">Designed for micro-tasks</h2>
            <p className="text-slate-600 dark:text-white/70 text-sm mt-1">
              Clear inputs → better matches → faster sessions.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 dark:text-white/70">
            <span className="px-2 py-1 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm dark:shadow-none">MERN</span>
            <span className="px-2 py-1 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm dark:shadow-none">JWT</span>
            <span className="px-2 py-1 rounded-full border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm dark:shadow-none">Role-based</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Feature
            title="Task Creation & Scope Control"
            tag="Module 1"
            desc="Structured fields + validation block vague tasks. Time limit rules prevent scope creep."
          />
          <Feature
            title="Skill Match & Availability"
            tag="Module 2"
            desc="Match helpers by required skill and availability so tasks go to the right person faster."
          />
          <Feature
            title="Trust, Disputes & Oversight"
            tag="Modules 3–4"
            desc="Ratings, dispute handling, and admin oversight to reduce ghosting and improve reliability."
          />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 md:p-8 shadow-sm dark:shadow-none">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-900 dark:text-white">How it works</h2>
              <p className="text-slate-600 dark:text-white/70 text-sm mt-1">
                Simple flow from posting to completion.
              </p>
            </div>
            <div className="text-xs text-slate-500 dark:text-white/60 font-medium">
              Tip: Keep tasks small + outcome clear
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-4 gap-4">
            <Step n="01" title="Create task" desc="Title, description, expected outcome, mode, duration." />
            <Step n="02" title="Scope validated" desc="System blocks vague or open-ended requests." />
            <Step n="03" title="Helper matched" desc="Match by skill and availability automatically." />
            <Step n="04" title="Complete & rate" desc="Finish session, rate, and build trust." />
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              to="/tasks/create"
              className="px-5 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-white/90 transition text-center"
            >
              Try creating a task
            </Link>
            <Link
              to="/register"
              className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-white/20 dark:text-white/90 dark:hover:bg-white/10 transition text-center"
            >
              Join EduSpark
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}