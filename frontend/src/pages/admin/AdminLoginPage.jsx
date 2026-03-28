import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../context/AuthContext";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorStatus, setErrorStatus] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setErrorStatus("");

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock validation
    if (data.email === "admin@unipulse.com" && data.password === "123456") {
      setShowSuccess(true);

      // Simulate auth state payload
      const mockPayload = {
        token: "mock-admin-token-xyz",
        user: {
          id: "admin-001",
          email: "admin@unipulse.com",
          name: "System Admin",
          role: "ADMIN",
        },
      };

      setTimeout(() => {
        login(mockPayload);
        navigate("/admin");
      }, 1000);
    } else {
      setErrorStatus("Incorrect credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-md shadow-lg border border-gray-200 p-8 text-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Eduspark Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Please log in to system oversight</p>
        </div>

        {errorStatus && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            {errorStatus}
          </div>
        )}

        {showSuccess && (
          <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm">
            Login successful! Redirecting to dashboard...
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="text"
              {...register("email")}
              className={`w-full px-3 py-2 border rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 ${errors.email ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                }`}
              placeholder="admin@unipulse.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              {...register("password")}
              className={`w-full px-3 py-2 border rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 ${errors.password ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-200 pt-4 text-center">
          <p className="text-xs text-gray-500">
            Secure admin portal for UniPulse Micro-Commitment Exchange Platform.
            Unauthorized access is strictly prohibited.
          </p>
        </div>
      </div>
    </div>
  );
}
