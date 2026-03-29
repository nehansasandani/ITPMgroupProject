<<<<<<< HEAD
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <div className="bg-glow" />
      <Header />
      <main className="min-h-[75vh]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
=======
import React from "react";
import AppRoutes from "./routes.jsx";

export default function App() {
  return (
    <div>
      <AppRoutes />
    </div>
  );
}
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89
