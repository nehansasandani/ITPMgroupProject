export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-8 text-white/70 text-sm flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} EduSpark — SLIIT ITPM Project</p>
        <p className="text-white/50">
          Micro-commitment help sessions • 15–60 minutes
        </p>
      </div>
    </footer>
  );
}