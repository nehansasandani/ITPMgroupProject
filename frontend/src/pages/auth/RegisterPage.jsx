import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

const schema = z.object({
  fullName: z.string().min(3, "Name is too short"),
  email: z.string().email("Invalid email"),
  studentId: z.string().regex(/^(IT|BM|EN|HS)\d{8}$/, "Student ID must be like IT23323452"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["STUDENT", "HELPER"]).default("STUDENT"),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { role: "STUDENT" } });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const payload = await registerUser(data);
      login(payload);
      navigate("/");
    } catch (err) {
      setServerError(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-white">
      <div className="grid lg:grid-cols-2 gap-5 items-stretch">
        {/* Form */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 md:p-8 fade-up">
          <h2 className="text-2xl font-semibold">Create your account</h2>
          <p className="text-white/70 text-sm mt-1">
            Register with your SLIIT Student ID and choose Student or Helper.
          </p>

          {serverError && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="text-sm text-white/80">Full name</label>
              <input
                {...register("fullName")}
                className="mt-1 w-full rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
                placeholder="Kamal Perera"
              />
              {errors.fullName && <p className="text-red-200 text-xs mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="text-sm text-white/80">Email</label>
              <input
                {...register("email")}
                className="mt-1 w-full rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
                placeholder="kamal@gmail.com"
              />
              {errors.email && <p className="text-red-200 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm text-white/80">Student ID</label>
              <input
                {...register("studentId")}
                className="mt-1 w-full rounded-xl uppercase bg-slate-950/40 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
                placeholder="IT23323452"
              />
              {errors.studentId && <p className="text-red-200 text-xs mt-1">{errors.studentId.message}</p>}
              <p className="text-white/50 text-xs mt-1">Format: IT/BM/EN/HS + 8 digits</p>
            </div>

            <div>
              <label className="text-sm text-white/80">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPw ? "text" : "password"}
                  {...register("password")}
                  className="w-full rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2.5 pr-24 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-xs border border-white/15 bg-white/5 hover:bg-white/10"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && <p className="text-red-200 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="text-sm text-white/80">Role</label>
              <select
                {...register("role")}
                className="mt-1 w-full rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2.5 outline-none focus:border-white/30 focus:ring-2 focus:ring-white/10"
              >
                <option value="STUDENT">Student</option>
                <option value="HELPER">Helper</option>
              </select>
              <p className="text-white/50 text-xs mt-1">
                Admin accounts should be created by the system.
              </p>
            </div>

            <button
              disabled={isSubmitting}
              className="w-full rounded-xl bg-white text-slate-900 py-2.5 font-medium hover:bg-white/90 disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Register"}
            </button>
          </form>

          <p className="mt-4 text-sm text-white/70">
            Already have an account?{" "}
            <Link className="text-white underline" to="/login">
              Login
            </Link>
          </p>
        </div>

        {/* Side panel */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-b from-white/12 to-transparent p-8 hidden lg:block fade-up">
          <div className="blob b1 -top-10 -right-10 h-60 w-60 bg-indigo-400/35" />
          <div className="blob b2 -bottom-16 -left-16 h-64 w-64 bg-cyan-300/25" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Join EduSpark
            </div>
            <h3 className="mt-5 text-2xl font-semibold">Start helping, start learning</h3>
            <p className="mt-3 text-white/70">
              Micro-commitment sessions reduce time waste and make help requests clearer.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                { t: "Clarity first", d: "Outcome required" },
                { t: "Quick sessions", d: "15–60 mins" },
                { t: "Fair platform", d: "Rules enforced" },
                { t: "Community", d: "Students helping students" },
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