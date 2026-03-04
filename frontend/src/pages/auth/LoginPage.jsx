import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginUser } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

const schema = z.object({
  emailOrStudentId: z.string().min(3, "Enter email or studentId"),
  password: z.string().min(1, "Password required"),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const payload = await loginUser(data);
      login(payload);
      navigate("/");
    } catch (err) {
      setServerError(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 text-white">
      <div className="max-w-lg mx-auto rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">Welcome back</h2>
        <p className="text-white/70 text-sm mt-1">Login using email or student ID.</p>

        {serverError && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-white/80">Email or Student ID</label>
            <input
              {...register("emailOrStudentId")}
              className="mt-1 w-full rounded-xl bg-slate-950/50 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
              placeholder="IT23323452 or kamal@gmail.com"
            />
            {errors.emailOrStudentId && (
              <p className="text-red-200 text-xs mt-1">{errors.emailOrStudentId.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-white/80">Password</label>
            <input
              type="password"
              {...register("password")}
              className="mt-1 w-full rounded-xl bg-slate-950/50 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
              placeholder="••••••••"
            />
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

        <p className="mt-4 text-sm text-white/70">
          No account?{" "}
          <Link className="text-white underline" to="/register">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}