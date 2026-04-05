<<<<<<< HEAD
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
=======
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
>>>>>>> 48b3336cc9a453f89e85f53cd724c10f58b43e99

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
<<<<<<< HEAD
}
=======
}
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89
>>>>>>> 48b3336cc9a453f89e85f53cd724c10f58b43e99
