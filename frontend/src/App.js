import React from "react";
import useToken from "./helpers/useToken";
import "react-date-picker/dist/DatePicker.css";
import "react-calendar/dist/Calendar.css";
import "./styles/custom_bootstrap.css";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Home } from "./pages/Home";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { AddJob } from "./pages/AddJob";
import { Records } from "./pages/Records";
import { Invoice } from "./components/Invoice";
import { Navigation } from "./components/Navigation";
import { Settings } from "./pages/Settings";
import { Footer } from "./components/Footer";
import { Dashboard } from "./pages/Dashboard";

function App() {
  const { token } = useToken();

  const RequireAuth = () => {
    if (!token) return <Navigate to="/login" />
    return <Outlet />
  }

  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-job" element={<AddJob />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/records" element={<Records />} />
          <Route path="/records/invoice_:id" element={<Invoice />} />
        </Route>
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
