import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTask } from "../../api/taskApi";
import WarningModal from "../../components/WarningModal";

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

export default function CreateTaskPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [scopeIssues, setScopeIssues] = useState([]);

  const [popupOpen, setPopupOpen] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupMessage, setPopupMessage] = useState("");

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
      category: "CODING",
      urgency: "NORMAL",
      skillRequired: "",
      duration: 30,
      mode: "Online",
      deadlineDays: 2,
      attachmentUrl: "",
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

  const showPopup = (title, message) => {
    setPopupTitle(title);
    setPopupMessage(message);
    setPopupOpen(true);
  };

  const onSubmit = async (data) => {
    setServerError("");
    setScopeIssues([]);

    try {
      await createTask(data);
      navigate("/tasks/mine");
    } catch (err) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message || "Task creation failed";
      const issues = err?.response?.data?.issues || [];
      const cooldownUntil = err?.response?.data?.cooldownUntil;

      setServerError(message);
      setScopeIssues(issues);

      if (status === 409) {
        showPopup("Duplicate Task Detected", message);
      } else if (status === 429) {
        showPopup("Daily Task Limit Reached", message);
      } else if (status === 403 && cooldownUntil) {
        showPopup(
          "Posting Temporarily Blocked",
          `${message}\n\nCooldown until: ${new Date(cooldownUntil).toLocaleString()}`
        );
      } else if (issues.length > 0) {
        showPopup("Task Rejected by Scope Control", `${message}\n\n• ${issues.join("\n• ")}`);
      } else {
        showPopup("Task Creation Failed", message);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-white">
      <WarningModal
        open={popupOpen}
        title={popupTitle}
        message={popupMessage}
        confirmText="OK"
        cancelText="Close"
        confirmVariant="primary"
        onConfirm={() => setPopupOpen(false)}
        onClose={() => setPopupOpen(false)}
      />

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Create Task</h1>
          <p className="text-white/70 text-sm mt-1">
            Build a clear, time-boxed task with both session duration and expiry deadline.
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
        <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 backdrop-blur p-6 md:p-8">
          {serverError && (
            <div className="mb-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
              <div className="font-semibold">Cannot create task</div>
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
            <Field
              label="Task Title"
              hint="Make the title specific and short."
              error={errors.title?.message}
              right={<span className="text-xs text-white/50">{titleLen}/80</span>}
            >
              <input
                {...register("title")}
                className="mt-1 w-full rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
                placeholder="e.g. Fix React form validation issue"
              />
            </Field>

            <Field
              label="Task Description"
              hint="Explain the problem and relevant context."
              error={errors.description?.message}
              right={<span className="text-xs text-white/50">{descLen}/800</span>}
            >
              <textarea
                {...register("description")}
                rows={5}
                className="mt-1 w-full rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
                placeholder="Describe the issue clearly..."
              />
            </Field>

            <Field
              label="Expected Outcome"
              hint="Describe the exact result you want after help is given."
              error={errors.expectedOutcome?.message}
              right={<span className="text-xs text-white/50">{outLen}/200</span>}
            >
              <input
                {...register("expectedOutcome")}
                className="mt-1 w-full rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
                placeholder="e.g. Form should submit and show success without resetting inputs"
              />
            </Field>

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Category" hint="Classify the type of help." error={errors.category?.message}>
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

              <Field label="Urgency" hint="Mark only when really needed." error={errors.urgency?.message}>
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
              <Field label="Skill Required" hint="Example: React, Node, UI/UX." error={errors.skillRequired?.message}>
                <input
                  {...register("skillRequired")}
                  className="mt-1 w-full rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
                  placeholder="React"
                />
              </Field>

              <Field label="Preferred Mode" hint="How the session should happen." error={errors.mode?.message}>
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

            <Field
              label="Session Duration"
              hint="This is the actual micro-session duration."
              error={errors.duration?.message}
            >
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

            <Field
              label="Task Deadline"
              hint="This is how long the task remains active before expiring."
              error={errors.deadlineDays?.message}
            >
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

            <Field
              label="Attachment URL (optional)"
              hint="You can paste a link for screenshots or reference material."
              error={errors.attachmentUrl?.message}
            >
              <input
                {...register("attachmentUrl")}
                className="mt-1 w-full rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
                placeholder="https://..."
              />
            </Field>

            <button
              disabled={isSubmitting}
              className="w-full rounded-xl bg-white text-slate-900 py-2.5 font-medium hover:bg-white/90 disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </button>

            <p className="text-xs text-white/50">
              Your task will be validated for clarity, fairness, and scope before it enters the system.
            </p>
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
                <span
                  className={`px-2 py-1 rounded-full border ${
                    values.urgency === "URGENT"
                      ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                      : "border-white/10 bg-white/5 text-white/70"
                  }`}
                >
                  {values.urgency}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold">Scope Control Checks</div>
            <p className="text-xs text-white/60 mt-1">
              Frontend warnings help you improve the task before submission.
            </p>

            <div className="mt-4 space-y-2">
              <div className="rounded-xl border border-white/10 bg-slate-950/30 p-3 text-xs text-white/75">
                ✅ Session duration is limited to 15 / 30 / 45 / 60 minutes
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-950/30 p-3 text-xs text-white/75">
                ✅ Deadline is limited to 2 or 3 days
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-950/30 p-3 text-xs text-white/75">
                ✅ Expected outcome is required to prevent scope creep
              </div>

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