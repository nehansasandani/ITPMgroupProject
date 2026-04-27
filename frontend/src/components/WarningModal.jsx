export default function WarningModal({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
  loading = false,
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  const confirmClass =
    confirmVariant === "danger"
      ? "bg-red-400/15 border-red-400/25 text-red-100 hover:bg-red-400/20"
      : "bg-white text-slate-900 border-white hover:bg-white/90";

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 p-6 text-slate-900 dark:text-white shadow-2xl">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-white/70 whitespace-pre-line">{message}</p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/15 bg-white dark:bg-white/5 shadow-sm dark:shadow-none hover:bg-slate-50 dark:hover:bg-white/10 hover:shadow-sm dark:hover:shadow-none text-sm disabled:opacity-60"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-xl text-sm border disabled:opacity-60 ${confirmClass}`}
          >
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}