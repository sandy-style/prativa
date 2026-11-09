import React from "react";
import { Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "./components/MainLayout";
import ManchLayout from "./components/ManchLayout";

// Main pages
import Home from "./pages/Home";
import About from "./pages/About";
import Explore from "./pages/Explore";
import Contact from "./pages/Contact";

// Authentication pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Manch pages
import DrishyaManch from "./pages/DrishyaManch";
import SwarManch from "./pages/SwarManch";
import RangManch from "./pages/RangManch";
import ShabdaManch from "./pages/ShabdaManch";

// Profile
import Profile from "./pages/Profile";

const App = () => {
  return (
    <Routes>
      {/* Main website - Shared Navbar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* Manch pages - Separate layout */}
      <Route element={<ManchLayout />}>
        <Route path="/explore/swar-manch" element={<SwarManch />} />
        <Route path="/explore/drishya-manch" element={<DrishyaManch />} />
        <Route path="/explore/rang-manch" element={<RangManch />} />
        <Route path="/explore/shabda-manch" element={<ShabdaManch />} />
      </Route>

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Profiles */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/:userId" element={<Profile />} />
    </Routes>
  );
};

export default App;
