import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

const STUDENT_ID_REGEX = /^(IT|BM|EN|HS)\d{8}$/;
const SPECIAL_CHAR_REGEX = /[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]/;
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).{8,}$/;

const schema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, "Full name must be at least 3 characters")
      .max(60, "Full name must be at most 60 characters")
      .regex(
        /^[A-Za-z\s.'-]+$/,
        "Full name can only contain letters, spaces, apostrophes, dots, and hyphens"
      )
      .refine((value) => !/\s{2,}/.test(value), "Full name cannot contain repeated spaces"),

    email: z.string().trim().email("Invalid email address"),

    studentId: z
      .string()
      .trim()
      .toUpperCase()
      .regex(STUDENT_ID_REGEX, "Student ID must be like IT23323452"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(64, "Password must be at most 64 characters")
      .refine((value) => !/\s/.test(value), "Password cannot contain spaces")
      .regex(
        PASSWORD_REGEX,
        "Password must include uppercase, lowercase, number, and special character"
      ),

    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => !data.password.toUpperCase().includes(data.studentId.toUpperCase()),
    {
      message: "Password cannot contain your student ID",
      path: ["password"],
    }
  )
  .refine(
    (data) => {
      const emailUsername = data.email.split("@")[0]?.toLowerCase() || "";
      return emailUsername ? !data.password.toLowerCase().includes(emailUsername) : true;
    },
    {
      message: "Password should not contain your email username",
      path: ["password"],
    }
  );

function RuleItem({ ok, label }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs border ${
        ok
          ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
          : "border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm dark:shadow-none text-slate-500 dark:text-white/60"
      }`}
    >
      <span className="w-4 text-center">{ok ? "✓" : "•"}</span>
      <span>{label}</span>
    </div>
  );
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [serverError, setServerError] = useState("");
  const [serverIssues, setServerIssues] = useState([]);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [showPasswordGuide, setShowPasswordGuide] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      studentId: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password") || "";
  const confirmPasswordValue = watch("confirmPassword") || "";
  const emailValue = watch("email") || "";
  const studentIdValue = watch("studentId") || "";

  const passwordChecks = useMemo(() => {
    const emailUsername = emailValue.split("@")[0]?.toLowerCase() || "";
    return [
      { label: "At least 8 characters", ok: passwordValue.length >= 8 },
      { label: "At least one uppercase letter", ok: /[A-Z]/.test(passwordValue) },
      { label: "At least one lowercase letter", ok: /[a-z]/.test(passwordValue) },
      { label: "At least one number", ok: /\d/.test(passwordValue) },
      { label: "At least one special character", ok: SPECIAL_CHAR_REGEX.test(passwordValue) },
      { label: "No spaces", ok: passwordValue.length > 0 && !/\s/.test(passwordValue) },
      {
        label: "Does not contain student ID",
        ok:
          !studentIdValue ||
          !passwordValue.toUpperCase().includes(studentIdValue.toUpperCase()),
      },
      {
        label: "Does not contain email username",
        ok: !emailUsername || !passwordValue.toLowerCase().includes(emailUsername),
      },
    ];
  }, [passwordValue, emailValue, studentIdValue]);

  const passedCount = passwordChecks.filter((rule) => rule.ok).length;

  const passwordStrength = useMemo(() => {
    if (!passwordValue) return { label: "No password", width: "0%", tone: "bg-slate-50 dark:bg-white/10 shadow-sm dark:shadow-none" };
    if (passedCount <= 3) return { label: "Weak", width: "33%", tone: "bg-red-400" };
    if (passedCount <= 6) return { label: "Medium", width: "66%", tone: "bg-amber-400" };
    return { label: "Strong", width: "100%", tone: "bg-emerald-400" };
  }, [passwordValue, passedCount]);

  const passwordsMatch =
    confirmPasswordValue.length > 0 && passwordValue === confirmPasswordValue;

  const onSubmit = async (data) => {
    setServerError("");
    setServerIssues([]);

    try {
      const payload = await registerUser({
        fullName: data.fullName.trim().replace(/\s+/g, " "),
        email: data.email.trim().toLowerCase(),
        studentId: data.studentId.trim().toUpperCase(),
        password: data.password,
      });

      login(payload);
      navigate("/");
    } catch (err) {
      setServerError(err?.response?.data?.message || "Registration failed");
      setServerIssues(err?.response?.data?.issues || []);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-slate-900 dark:text-white">
      <div className="grid lg:grid-cols-2 gap-5 items-stretch">
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm dark:shadow-none p-6 md:p-8 fade-up">
          <h2 className="text-2xl font-semibold">Create your account</h2>
          <p className="text-slate-600 dark:text-white/70 text-sm mt-1">
            Register with your SLIIT Student ID to join EduSpark.
          </p>

          {serverError && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
              <div>{serverError}</div>
              {serverIssues.length > 0 && (
                <ul className="mt-2 list-disc pl-5">
                  {serverIssues.map((issue, index) => (
                    <li key={index} className="text-xs mt-1">
                      {issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-slate-700 dark:text-white/80">Full name</label>
              <input
                {...register("fullName")}
                className="mt-1 w-full rounded-xl bg-white dark:bg-slate-950/40 shadow-sm dark:shadow-none border border-slate-200 dark:border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
                placeholder="Kamal Perera"
              />
              {errors.fullName && (
                <p className="text-red-200 text-xs mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-slate-700 dark:text-white/80">Email</label>
              <input
                {...register("email")}
                className="mt-1 w-full rounded-xl bg-white dark:bg-slate-950/40 shadow-sm dark:shadow-none border border-slate-200 dark:border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
                placeholder="kamal@gmail.com"
              />
              {errors.email && (
                <p className="text-red-200 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-slate-700 dark:text-white/80">Student ID</label>
              <input
                {...register("studentId")}
                className="mt-1 w-full rounded-xl uppercase bg-white dark:bg-slate-950/40 shadow-sm dark:shadow-none border border-slate-200 dark:border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
                placeholder="IT23323452"
              />
              {errors.studentId && (
                <p className="text-red-200 text-xs mt-1">{errors.studentId.message}</p>
              )}
              <p className="text-slate-500 dark:text-white/50 text-xs mt-1">Format: IT/BM/EN/HS + 8 digits</p>
            </div>

            <div>
              <label className="text-sm text-slate-700 dark:text-white/80">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPw ? "text" : "password"}
                  {...register("password")}
                  onFocus={() => setShowPasswordGuide(true)}
                  className="w-full rounded-xl bg-white dark:bg-slate-950/40 shadow-sm dark:shadow-none border border-slate-200 dark:border-white/10 px-3 py-2.5 pr-24 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 shadow-sm dark:shadow-none hover:bg-slate-50 dark:hover:bg-white/10 hover:shadow-sm dark:hover:shadow-none"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-200 text-xs mt-1">{errors.password.message}</p>
              )}

              {(showPasswordGuide || passwordValue.length > 0) && (
                <div className="mt-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-700 dark:text-white/80">Password strength</span>
                    <span className="text-xs text-slate-500 dark:text-white/60">{passwordStrength.label}</span>
                  </div>

                  <div className="mt-2 h-2 rounded-full bg-slate-50 dark:bg-white/10 shadow-sm dark:shadow-none overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${passwordStrength.tone}`}
                      style={{ width: passwordStrength.width }}
                    />
                  </div>

                  <p className="text-slate-500 dark:text-white/50 text-xs mt-3">
                    Use a strong password with letters, numbers, and symbols.
                  </p>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {passwordChecks.map((rule) => (
                      <RuleItem key={rule.label} ok={rule.ok} label={rule.label} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm text-slate-700 dark:text-white/80">Confirm Password</label>
              <div className="relative mt-1">
                <input
                  type={showConfirmPw ? "text" : "password"}
                  {...register("confirmPassword")}
                  className="w-full rounded-xl bg-white dark:bg-slate-950/40 shadow-sm dark:shadow-none border border-slate-200 dark:border-white/10 px-3 py-2.5 pr-24 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 shadow-sm dark:shadow-none hover:bg-slate-50 dark:hover:bg-white/10 hover:shadow-sm dark:hover:shadow-none"
                >
                  {showConfirmPw ? "Hide" : "Show"}
                </button>
              </div>

              {confirmPasswordValue.length > 0 && (
                <div
                  className={`mt-2 text-xs ${
                    passwordsMatch ? "text-emerald-200" : "text-red-200"
                  }`}
                >
                  {passwordsMatch ? "✓ Passwords match" : "Passwords do not match"}
                </div>
              )}

              {errors.confirmPassword && (
                <p className="text-red-200 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              disabled={isSubmitting}
              className="w-full rounded-xl bg-white text-slate-900 py-2.5 font-medium hover:bg-white/90 disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Register"}
            </button>
          </form>

          <p className="mt-4 text-sm text-slate-600 dark:text-white/70">
            Already have an account?{" "}
            <Link className="text-slate-900 dark:text-white underline" to="/login">
              Login
            </Link>
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-linear-to-b from-white/12 to-transparent p-8 hidden lg:block fade-up">
          <div className="blob b1 -top-10 -right-10 h-60 w-60 bg-indigo-400/35" />
          <div className="blob b2 -bottom-16 -left-16 h-64 w-64 bg-cyan-300/25" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 shadow-sm dark:shadow-none px-3 py-1 text-xs text-slate-700 dark:text-white/80">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Join EduSpark
            </div>
            <h3 className="mt-5 text-2xl font-semibold">Students helping students</h3>
            <p className="mt-3 text-slate-600 dark:text-white/70">
              Post clear micro-tasks, discover open requests, and collaborate through short, focused sessions.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                { t: "Clarity first", d: "Outcome required" },
                { t: "Quick sessions", d: "15–60 mins" },
                { t: "Fair platform", d: "Rules enforced" },
                { t: "Secure accounts", d: "Strong password policy" },
              ].map((x) => (
                <div key={x.t} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950/30 p-4">
                  <div className="font-semibold text-sm">{x.t}</div>
                  <div className="text-slate-600 dark:text-white/65 text-xs mt-1">{x.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}