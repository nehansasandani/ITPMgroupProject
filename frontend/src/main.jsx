import React from "react";
import ReactDOM from "react-dom/client";
<<<<<<< HEAD
import { RouterProvider } from "react-router-dom";
import { router } from "./routes.jsx";
import { AuthProvider } from "./context/AuthContext";
=======
<<<<<<< HEAD
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
=======
import App from "./App.jsx";
>>>>>>> 48b3336cc9a453f89e85f53cd724c10f58b43e99
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
<<<<<<< HEAD
);
=======
);
>>>>>>> 08e70d92df1c961d98bae932ea2bc8d40ab4ab89
>>>>>>> 48b3336cc9a453f89e85f53cd724c10f58b43e99
