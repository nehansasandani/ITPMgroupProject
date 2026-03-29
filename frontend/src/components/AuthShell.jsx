import { ui } from "../styles/ui";

export default function AuthShell({ title, subtitle, children, sideTitle, sideText }) {
  return (
    <div className={`${ui.container} py-10 text-white`}>
      <div className="grid lg:grid-cols-2 gap-5 items-stretch">
        {/* Left: form */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-white/70 text-sm mt-1">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>

        {/* Right: marketing panel */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-b from-white/10 to-transparent p-8 hidden lg:block">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-cyan-300/15 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              EduSpark • SLIIT ITPM
            </div>
            <h3 className="mt-5 text-2xl font-semibold">{sideTitle}</h3>
            <p className="mt-3 text-white/70">{sideText}</p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                { t: "Time boxed", d: "15–60 mins" },
                { t: "Clear scope", d: "Expected outcome" },
                { t: "Fast match", d: "Right helper" },
                { t: "Trust", d: "Ratings + disputes" },
              ].map((x) => (
                <div key={x.t} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <div className="font-semibold text-sm">{x.t}</div>
                  <div className="text-white/65 text-xs mt-1">{x.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}