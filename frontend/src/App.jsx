import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="min-h-[75vh]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}