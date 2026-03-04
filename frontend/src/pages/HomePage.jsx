import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
  const { isAuthed, role } = useAuth();

  return (
    <div className="text-white">
      <section className="max-w-6xl mx-auto px-4 pt-12 pb-10">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-8 md:p-12">
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
            Get campus help in{" "}
            <span className="text-white/80">15–60 minute</span> micro-sessions.
          </h1>
          <p className="mt-4 text-white/70 max-w-2xl">
            EduSpark helps students post small, clear tasks and get matched with helpers fast —
            without scope creep or confusion.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {!isAuthed ? (
              <>
                <Link
                  to="/register"
                  className="px-5 py-3 rounded-xl bg-white text-slate-900 font-medium hover:bg-white/90"
                >
                  Create an account
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-3 rounded-xl border border-white/20 text-white/90 hover:bg-white/10"
                >
                  Login
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/tasks/create"
                  className="px-5 py-3 rounded-xl bg-white text-slate-900 font-medium hover:bg-white/90"
                >
                  Create a task
                </Link>
                <div className="px-5 py-3 rounded-xl border border-white/20 text-white/80">
                  Logged in as <span className="font-semibold">{role}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-14 grid md:grid-cols-3 gap-4">
        {[
          {
            title: "Scope control",
            desc: "Tasks must be specific, time-boxed, and have a clear expected outcome.",
          },
          {
            title: "Fast matching",
            desc: "Match helpers by required skill and availability (module 2).",
          },
          {
            title: "Trust & accountability",
            desc: "Ratings, disputes, and admin oversight (modules 3 & 4).",
          },
        ].map((c) => (
          <div
            key={c.title}
            className="rounded-2xl border border-white/10 bg-white/5 p-5"
          >
            <h3 className="font-semibold">{c.title}</h3>
            <p className="mt-2 text-white/70 text-sm">{c.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}