import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTask } from "../../api/taskApi";

const DURATIONS = [15, 30, 45, 60];
const MODES = ["Online", "Chat", "Meet"];

// Frontend validation (matches backend)
const schema = z.object({
  title: z.string().min(8, "Title must be at least 8 characters").max(80, "Max 80 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(800, "Max 800"),
  expectedOutcome: z
    .string()
    .min(10, "Expected outcome must be at least 10 characters")
    .max(200, "Max 200"),
  skillRequired: z.string().min(2, "Skill is required").max(40, "Max 40"),
  duration: z.number().refine((v) => DURATIONS.includes(v), "Duration must be 15/30/45/60"),
  mode: z.string().refine((v) => MODES.includes(v), "Invalid mode"),
});

// simple “scope warning” (frontend helper)
function getScopeWarnings({ title, description, expectedOutcome }) {
  const combined = `${title} ${description} ${expectedOutcome}`.toLowerCase();
  const vagueWords = ["help", "urgent", "asap", "project", "assignment", "anything", "please"];
  const hits = vagueWords.filter((w) => combined.includes(w));

  const warnings = [];
  if (combined.length < 80) warnings.push("Add more context to avoid being too vague.");
  if (hits.length >= 2) warnings.push("Task contains vague words. Be more specific about the output/result.");
  if (!expectedOutcome?.includes(" ")) warnings.push("Expected outcome should describe a clear result (not 1 word).");

  return warnings;
}

function Field({ label, hint, error, children, right }) {
  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <label className="text-sm text-white/80">{label}</label>
        {right}
      </div>
      {children}
      {hint && <p className="text-xs text-white/50 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-200 mt-1">{error}</p>}
    </div>
  );
}

export default function CreateTaskPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [scopeIssues, setScopeIssues] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      expectedOutcome: "",
      skillRequired: "",
      duration: 30,
      mode: "Online",
    },
  });

  const values = watch();
  const scopeWarnings = useMemo(
    () => getScopeWarnings(values),
    [values.title, values.description, values.expectedOutcome]
  );

  const titleLen = values.title?.length || 0;
  const descLen = values.description?.length || 0;
  const outLen = values.expectedOutcome?.length || 0;

  const onSubmit = async (data) => {
    setServerError("");
    setScopeIssues([]);
    try {
      await createTask(data);
      navigate("/tasks/mine");
    } catch (err) {
      // backend may send: { message, issues: [] }
      const msg = err?.response?.data?.message || "Task creation failed";
      const issues = err?.response?.data?.issues || [];
      setServerError(msg);
      setScopeIssues(issues);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-white">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Create Task</h1>
          <p className="text-white/70 text-sm mt-1">
            This page enforces <span className="text-white/85">scope control</span>: clear outcome + fixed time limits.
          </p>
        </div>
        <Link
          to="/tasks/mine"
          className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm"
        >
          View My Tasks
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-6 items-start">
        {/* FORM */}
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8">
          {serverError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
              <div className="font-semibold">Cannot create task</div>
              <div className="mt-1">{serverError}</div>
              {scopeIssues.length > 0 && (
                <ul className="mt-2 list-disc pl-5 text-red-200/90">
                  {scopeIssues.map((x, i) => (
                    <li key={i} className="text-xs mt-1">
                      {x}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Field
              label="Title"
              hint="Be specific (8–80 chars). Example: “Fix React form submit bug”"
              error={errors.title?.message}
              right={<span className="text-xs text-white/50">{titleLen}/80</span>}
            >
              <input
                {...register("title")}
                className="mt-1 w-full rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
                placeholder="e.g. Fix React form submit bug"
              />
            </Field>

            <Field
              label="Description"
              hint="Explain context + what you tried (20–800 chars)."
              error={errors.description?.message}
              right={<span className="text-xs text-white/50">{descLen}/800</span>}
            >
              <textarea
                {...register("description")}
                rows={5}
                className="mt-1 w-full rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
                placeholder="Describe the problem clearly…"
              />
            </Field>

            <Field
              label="Expected Outcome"
              hint="Write the exact result you want (required for scope control)."
              error={errors.expectedOutcome?.message}
              right={<span className="text-xs text-white/50">{outLen}/200</span>}
            >
              <input
                {...register("expectedOutcome")}
                className="mt-1 w-full rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
                placeholder="e.g. Form submits and shows success message without resetting inputs"
              />
            </Field>

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Skill Required" hint="Example: React, Node, UI/UX" error={errors.skillRequired?.message}>
                <input
                  {...register("skillRequired")}
                  className="mt-1 w-full rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
                  placeholder="React"
                />
              </Field>

              <Field label="Mode" hint="How you want the session." error={errors.mode?.message}>
                <select
                  {...register("mode")}
                  className="mt-1 w-full rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
                >
                  {MODES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Time Limit (Scope Control)" hint="Only 15/30/45/60 minutes allowed." error={errors.duration?.message}>
              <div className="mt-2 flex flex-wrap gap-2">
                {DURATIONS.map((d) => {
                  const active = values.duration === d;
                  return (
                    <button
                      type="button"
                      key={d}
                      onClick={() => setValue("duration", d, { shouldValidate: true })}
                      className={`px-3 py-2 rounded-xl text-sm border transition ${
                        active
                          ? "bg-white text-slate-900 border-white"
                          : "border-white/15 bg-white/5 hover:bg-white/10 text-white/85"
                      }`}
                    >
                      {d} min
                    </button>
                  );
                })}
              </div>
            </Field>

            <button
              disabled={isSubmitting}
              className="w-full rounded-xl bg-white text-slate-900 py-2.5 font-medium hover:bg-white/90 disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>

            <p className="text-xs text-white/50">
              By creating a task, you agree that tasks must be short and clearly defined.
            </p>
          </form>
        </div>

        {/* PREVIEW + SCOPE PANEL */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold">Live Preview</div>
            <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <div className="text-white font-semibold">
                {values.title?.trim() || "Task title will appear here"}
              </div>
              <div className="text-white/70 text-sm mt-2 whitespace-pre-wrap">
                {values.description?.trim() || "Task description preview…"}
              </div>

              <div className="mt-3 text-xs text-white/60">
                <div>
                  <span className="text-white/70">Expected outcome:</span>{" "}
                  {values.expectedOutcome?.trim() || "—"}
                </div>
                <div className="mt-1 flex flex-wrap gap-2">
                  <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                    Skill: {values.skillRequired?.trim() || "—"}
                  </span>
                  <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                    Mode: {values.mode}
                  </span>
                  <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5">
                    Duration: {values.duration}m
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold">Scope Control Checks</div>
            <p className="text-xs text-white/60 mt-1">
              These are pre-checks. Backend will still validate and may reject vague tasks.
            </p>

            <div className="mt-4 space-y-2">
              <div className="rounded-xl border border-white/10 bg-slate-950/30 p-3">
                <div className="text-xs text-white/70">
                  ✅ Allowed time limits: <span className="text-white/85">15 / 30 / 45 / 60</span>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-950/30 p-3">
                <div className="text-xs text-white/70">
                  ✅ Expected outcome required to prevent scope creep
                </div>
              </div>

              {scopeWarnings.length > 0 ? (
                <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3">
                  <div className="text-xs text-amber-100 font-semibold">⚠ Scope warning</div>
                  <ul className="mt-2 list-disc pl-5 text-amber-100/90">
                    {scopeWarnings.map((w, i) => (
                      <li key={i} className="text-xs mt-1">
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3">
                  <div className="text-xs text-emerald-100 font-semibold">✅ Looks clear</div>
                  <div className="text-xs text-emerald-100/80 mt-1">
                    Your task seems specific enough to post.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}