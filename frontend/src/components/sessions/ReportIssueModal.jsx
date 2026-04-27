import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FiX, FiAlertCircle } from "react-icons/fi";

const schema = z.object({
  reason: z.string().min(1, "Please select a reason"),
  explanation: z.string().optional(),
});

export default function ReportIssueModal({ isOpen, onClose, onSubmit, session }) {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      reason: "",
      explanation: "",
    },
  });

  if (!isOpen) return null;

  const handleFormSubmit = async (data) => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));
    setSuccess(true);
    setTimeout(() => {
      onSubmit(data);
      setSuccess(false);
      reset();
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FiAlertCircle className="text-red-500" /> Report Issue
          </h3>
          <button 
            onClick={onClose} 
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {success ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-gray-900">Issue Reported</h4>
              <p className="text-sm text-gray-500">Your dispute has been sent to the admin team for review.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
              <div className="bg-orange-50/50 p-3 rounded-lg border border-orange-100 mb-6">
                <p className="text-sm text-orange-800">
                  <span className="font-semibold">Session:</span> {session?.title}
                </p>
                <p className="text-xs text-orange-600/80 mt-1">
                  Reporting an issue will place this session in a 'Disputed' state until admin review.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for dispute <span className="text-red-500">*</span>
                </label>
                <select 
                  {...register("reason")}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 ${
                    errors.reason ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">-- Select a reason --</option>
                  <option value="No-show">Partner No-show</option>
                  <option value="Late arrival">Severely Late Arrival</option>
                  <option value="Poor help quality">Poor Quality of Help Provided</option>
                  <option value="Task not completed">Task Requirements Not Met</option>
                  <option value="Other">Other Issue</option>
                </select>
                {errors.reason && <p className="mt-1 text-xs text-red-500">{errors.reason.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Details (Optional)
                </label>
                <textarea 
                  {...register("explanation")}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 resize-none"
                  placeholder="Provide any context that helps admins investigate..."
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-slate-900 dark:text-white rounded-md hover:bg-red-700 font-medium shadow-sm border border-transparent disabled:opacity-60 transition-colors"
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
