import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { getTaskById, updateTask } from "../../api/taskApi";

const DURATIONS = [15, 30, 45, 60];
const DEADLINES = [2, 3];
const MODES = ["Online", "Chat", "Meet"];
const CATEGORIES = [
  { value: "UI", label: "UI" },
  { value: "CODING", label: "Coding" },
  { value: "WRITING", label: "Writing" },
  { value: "REVIEW", label: "Review" },
];
const URGENCIES = ["NORMAL", "URGENT"];

const schema = z.object({
  title: z.string().min(8, "Title must be at least 8 characters").max(80, "Max 80 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(800, "Max 800"),
  expectedOutcome: z.string().min(10, "Expected outcome must be at least 10 characters").max(200, "Max 200"),
  category: z.enum(["UI", "CODING", "WRITING", "REVIEW"]),
  urgency: z.enum(["NORMAL", "URGENT"]),
  skillRequired: z.string().min(2, "Skill is required").max(40, "Max 40"),
  duration: z.number().refine((v) => DURATIONS.includes(v), "Invalid duration"),
  mode: z.enum(["Online", "Chat", "Meet"]),
  deadlineDays: z.number().refine((v) => DEADLINES.includes(v), "Invalid deadline"),
  attachmentUrl: z.string().optional(),
  venue: z.string().max(100, "Max 100 characters").optional(),
}).refine((d) => d.mode !== "Meet" || (d.venue && d.venue.trim().length >= 3), {
  message: "Venue is required for in-person meetings (min 3 characters)",
  path: ["venue"],
});

function getScopeWarnings({ title, description, expectedOutcome }) {
  const text = `${title} ${description} ${expectedOutcome}`.toLowerCase();
  const warnings = [];
  const vagueWords = ["help", "urgent", "asap", "project", "assignment", "anything", "please"];
  const hits = vagueWords.filter((w) => text.includes(w));

  if (text.trim().length < 90) warnings.push("Add more context so the task is more specific.");
  if (hits.length >= 2) warnings.push("Your task includes vague words. Try describing the exact result.");
  if (!expectedOutcome || expectedOutcome.trim().split(" ").length < 3) {
    warnings.push("Expected outcome should clearly explain the final result.");
  }

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

export default function EditTaskPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loadingPage, setLoadingPage] = useState(true);
  const [serverError, setServerError] = useState("");
  const [scopeIssues, setScopeIssues] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      expectedOutcome: "",
      category: "CODING",
      urgency: "NORMAL",
      skillRequired: "",
      duration: 30,
      mode: "Online",
      deadlineDays: 2,
      attachmentUrl: "",
      venue: "",
    },
  });

  const values = watch();

  useEffect(() => {
    const loadTask = async () => {
      try {
        const task = await getTaskById(id);
        reset({
          title: task.title || "",
          description: task.description || "",
          expectedOutcome: task.expectedOutcome || "",
          category: task.category || "CODING",
          urgency: task.urgency || "NORMAL",
          skillRequired: task.skillRequired || "",
          duration: task.duration || 30,
          mode: task.mode || "Online",
          deadlineDays: task.deadlineDays || 2,
          attachmentUrl: task.attachmentUrl || "",
          venue: task.venue || "",
        });
      } catch (err) {
        setServerError(err?.response?.data?.message || "Failed to load task");
      } finally {
        setLoadingPage(false);
      }
    };

    loadTask();
  }, [id, reset]);

  const scopeWarnings = useMemo(
    () => getScopeWarnings(values),
    [values.title, values.description, values.expectedOutcome]
  );

  const onSubmit = async (data) => {
    setServerError("");
    setScopeIssues([]);

    try {
      await updateTask(id, data);
      navigate("/tasks/mine");
    } catch (err) {
      setServerError(err?.response?.data?.message || "Update failed");
      setScopeIssues(err?.response?.data?.issues || []);
    }
  };

  if (loadingPage) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">Loading task...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-white">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Edit Task</h1>
          <p className="text-white/70 text-sm mt-1">
            Update your task details before it gets accepted.
          </p>
        </div>

        <Link
          to="/tasks/mine"
          className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-sm"
        >
          Back to My Tasks
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mt-6 items-start">
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 md:p-8">
          {serverError && (
            <div className="mb-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
              <div className="font-semibold">Cannot update task</div>
              <div className="mt-1">{serverError}</div>
              {scopeIssues.length > 0 && (
                <ul className="mt-2 list-disc pl-5">
                  {scopeIssues.map((issue, i) => (
                    <li key={i} className="text-xs mt-1">
                      {issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Field label="Task Title" error={errors.title?.message}>
              <input
                {...register("title")}
                className="mt-1 w-full rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
              />
            </Field>

            <Field label="Task Description" error={errors.description?.message}>
              <textarea
                {...register("description")}
                rows={5}
                className="mt-1 w-full rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
              />
            </Field>

            <Field label="Expected Outcome" error={errors.expectedOutcome?.message}>
              <input
                {...register("expectedOutcome")}
                className="mt-1 w-full rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
              />
            </Field>

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Category" error={errors.category?.message}>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => {
                    const active = values.category === cat.value;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setValue("category", cat.value, { shouldValidate: true })}
                        className={`rounded-xl px-3 py-3 text-sm border transition ${
                          active
                            ? "bg-white text-slate-900 border-white"
                            : "border-white/15 bg-white/5 hover:bg-white/10 text-white/85"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Urgency" error={errors.urgency?.message}>
                <div className="mt-2 flex gap-2">
                  {URGENCIES.map((u) => {
                    const active = values.urgency === u;
                    return (
                      <button
                        key={u}
                        type="button"
                        onClick={() => setValue("urgency", u, { shouldValidate: true })}
                        className={`rounded-xl px-3 py-3 text-sm border transition ${
                          active
                            ? u === "URGENT"
                              ? "bg-amber-200 text-slate-900 border-amber-200"
                              : "bg-white text-slate-900 border-white"
                            : "border-white/15 bg-white/5 hover:bg-white/10 text-white/85"
                        }`}
                      >
                        {u}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Skill Required" error={errors.skillRequired?.message}>
                <input
                  {...register("skillRequired")}
                  className="mt-1 w-full rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
                />
              </Field>

              <Field label="Preferred Mode" error={errors.mode?.message}>
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

            <Field label="Session Duration" error={errors.duration?.message}>
              <div className="mt-2 flex flex-wrap gap-2">
                {DURATIONS.map((d) => {
                  const active = values.duration === d;
                  return (
                    <button
                      key={d}
                      type="button"
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

            <Field label="Task Deadline" error={errors.deadlineDays?.message}>
              <div className="mt-2 flex flex-wrap gap-2">
                {DEADLINES.map((d) => {
                  const active = values.deadlineDays === d;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setValue("deadlineDays", d, { shouldValidate: true })}
                      className={`px-3 py-2 rounded-xl text-sm border transition ${
                        active
                          ? "bg-white text-slate-900 border-white"
                          : "border-white/15 bg-white/5 hover:bg-white/10 text-white/85"
                      }`}
                    >
                      {d} days
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Attachment URL (optional)" error={errors.attachmentUrl?.message}>
              <input
                {...register("attachmentUrl")}
                className="mt-1 w-full rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
              />
            </Field>

            {values.mode === "Meet" && (
              <Field
                label="Meeting Venue"
                hint="Specify the exact campus location (e.g. Library Room 3B, CS Lab 2)."
                error={errors.venue?.message}
              >
                <input
                  {...register("venue")}
                  className="mt-1 w-full rounded-xl bg-slate-950/40 border border-amber-400/20 px-3 py-2.5 outline-none focus:border-amber-400/40 focus:ring-2 focus:ring-amber-400/10"
                  placeholder="e.g. Library Study Room 3B"
                  maxLength={100}
                />
              </Field>
            )}

            <button
              disabled={isSubmitting}
              className="w-full rounded-xl bg-white text-slate-900 py-2.5 font-medium hover:bg-white/90 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold">Live Preview</div>
            <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold text-white">
                  {values.title?.trim() || "Task title preview"}
                </div>
                <span className="text-xs px-2 py-1 rounded-full border border-white/10 bg-white/5 text-white/70">
                  {values.category}
                </span>
              </div>

              <p className="mt-3 text-sm text-white/70 whitespace-pre-wrap">
                {values.description?.trim() || "Task description preview..."}
              </p>

              <div className="mt-3 text-xs text-white/65">
                <div>
                  <span className="text-white/75">Expected outcome:</span>{" "}
                  {values.expectedOutcome?.trim() || "—"}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5 text-white/70">
                  Skill: {values.skillRequired || "—"}
                </span>
                <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5 text-white/70">
                  Mode: {values.mode}
                </span>
                <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5 text-white/70">
                  Session: {values.duration}m
                </span>
                <span className="px-2 py-1 rounded-full border border-white/10 bg-white/5 text-white/70">
                  Deadline: {values.deadlineDays} days
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold">Scope Control Checks</div>
            <div className="mt-4 space-y-2">
              {scopeWarnings.length > 0 ? (
                <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3">
                  <div className="text-xs text-amber-100 font-semibold">⚠ Improve clarity</div>
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
                    Your edited task seems specific enough.
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