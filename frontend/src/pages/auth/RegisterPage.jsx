import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

const schema = z.object({
  fullName: z.string().min(3, "Name is too short"),
  email: z.string().email("Invalid email"),
  studentId: z
    .string()
    .regex(/^(IT|BM|EN|HS)\d{8}$/, "Student ID must be like IT23323452"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["STUDENT", "HELPER"]).default("STUDENT"),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");

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
      <div className="max-w-lg mx-auto rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">Create account</h2>
        <p className="text-white/70 text-sm mt-1">Register with your SLIIT Student ID.</p>

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
              className="mt-1 w-full rounded-xl bg-slate-950/50 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
              placeholder="Kamal Perera"
            />
            {errors.fullName && <p className="text-red-200 text-xs mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="text-sm text-white/80">Email</label>
            <input
              {...register("email")}
              className="mt-1 w-full rounded-xl bg-slate-950/50 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
              placeholder="kamal@gmail.com"
            />
            {errors.email && <p className="text-red-200 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="text-sm text-white/80">Student ID</label>
            <input
              {...register("studentId")}
              className="mt-1 w-full rounded-xl bg-slate-950/50 border border-white/10 px-3 py-2 outline-none focus:border-white/30 uppercase"
              placeholder="IT23323452"
            />
            {errors.studentId && <p className="text-red-200 text-xs mt-1">{errors.studentId.message}</p>}
          </div>

          <div>
            <label className="text-sm text-white/80">Password</label>
            <input
              type="password"
              {...register("password")}
              className="mt-1 w-full rounded-xl bg-slate-950/50 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-200 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="text-sm text-white/80">Role</label>
            <select
              {...register("role")}
              className="mt-1 w-full rounded-xl bg-slate-950/50 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
            >
              <option value="STUDENT">Student</option>
              <option value="HELPER">Helper</option>
            </select>
            <p className="text-white/50 text-xs mt-1">
              Admin accounts should be created by the system, not by public signup.
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
    </div>
  );
}