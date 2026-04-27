import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="bg-glow" />
      <Header />
      <main className="min-h-[75vh]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
