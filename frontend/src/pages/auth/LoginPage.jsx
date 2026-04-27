import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUser } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

const STUDENT_ID_REGEX = /^(IT|BM|EN|HS)\d{8}$/;

const schema = z.object({
  emailOrStudentId: z
    .string()
    .trim()
    .min(3, "Enter your email or student ID")
    .refine((value) => {
      if (value.includes("@")) {
        return z.string().email().safeParse(value).success;
      }
      return STUDENT_ID_REGEX.test(value.toUpperCase());
    }, "Enter a valid email address or student ID like IT23323452"),

  password: z
    .string()
    .min(1, "Password is required")
    .refine((value) => !/^\s+$/.test(value), "Password cannot be empty"),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      emailOrStudentId: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setServerError("");

    try {
      const normalizedInput = data.emailOrStudentId.includes("@")
        ? data.emailOrStudentId.trim().toLowerCase()
        : data.emailOrStudentId.trim().toUpperCase();

      const payload = await loginUser({
        emailOrStudentId: normalizedInput,
        password: data.password,
      });

      login(payload);
      navigate("/");
    } catch (err) {
      setServerError(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-slate-900 dark:text-white">
      <div className="grid lg:grid-cols-2 gap-5 items-stretch">
        {/* Form */}
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm dark:shadow-none p-6 md:p-8 fade-up">
          <h2 className="text-2xl font-semibold">Welcome back</h2>
          <p className="text-slate-600 dark:text-white/70 text-sm mt-1">
            Login using your email address or SLIIT student ID.
          </p>

          {serverError && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-slate-700 dark:text-white/80">Email or Student ID</label>
              <input
                {...register("emailOrStudentId")}
                className="mt-1 w-full rounded-xl bg-white dark:bg-slate-950/40 shadow-sm dark:shadow-none border border-slate-200 dark:border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
                placeholder="IT23323452 or kamal@gmail.com"
              />
              {errors.emailOrStudentId && (
                <p className="text-red-200 text-xs mt-1">{errors.emailOrStudentId.message}</p>
              )}
              <p className="text-slate-500 dark:text-white/50 text-xs mt-1">
                Use your registered email or student ID.
              </p>
            </div>

            <div>
              <label className="text-sm text-slate-700 dark:text-white/80">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPw ? "text" : "password"}
                  {...register("password")}
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
            </div>

            <button
              disabled={isSubmitting}
              className="w-full rounded-xl bg-white text-slate-900 py-2.5 font-medium hover:bg-white/90 disabled:opacity-60"
            >
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-4 text-sm text-slate-600 dark:text-white/70">
            No account?{" "}
            <Link className="text-slate-900 dark:text-white underline" to="/register">
              Register
            </Link>
          </p>
        </div>

        {/* Side panel */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-linear-to-b from-white/12 to-transparent p-8 hidden lg:block fade-up">
          <div className="blob b1 -top-10 -right-10 h-60 w-60 bg-indigo-400/35" />
          <div className="blob b2 -bottom-16 -left-16 h-64 w-64 bg-cyan-300/25" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 shadow-sm dark:shadow-none px-3 py-1 text-xs text-slate-700 dark:text-white/80">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Scope controlled micro-sessions
            </div>
            <h3 className="mt-5 text-2xl font-semibold">Clear tasks. Better matches.</h3>
            <p className="mt-3 text-slate-600 dark:text-white/70">
              Post tasks with a clear expected outcome and finish help sessions in short, focused time blocks.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                { t: "Time-boxed", d: "15–60 mins" },
                { t: "Clarity", d: "Outcome required" },
                { t: "Matching", d: "Skill based" },
                { t: "Trust", d: "Controlled flow" },
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