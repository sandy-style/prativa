import React from "react";
import { Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "./components/MainLayout";
import ManchLayout from "./components/ManchLayout";
import AdminLayout from "./admin/layouts/AdminLayout";

// Main pages
import Home from "./pages/Home";
import About from "./pages/About";
import Explore from "./pages/Explore";
import Contact from "./pages/Contact";
import Leaderboard from "./pages/Leaderboard";
import Events from "./pages/Events";

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

// Community
import CommunityGuidelines from "./pages/CommunityGuidelines";

// Profile
import Profile from "./pages/Profile";

// Admin pages
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminUsers from "./admin/pages/AdminUsers";
import AdminPosts from "./admin/pages/AdminPosts";
import AdminReports from "./admin/pages/AdminReports";
import AdminEvents from "./admin/pages/AdminEvents";
import AdminCompetitions from "./admin/pages/AdminCompetitions";
import AdminWinners from "./admin/pages/AdminWinners";
import AdminAnnouncements from "./admin/pages/AdminAnnouncements";
import AdminAnalytics from "./admin/pages/AdminAnalytics";
import AdminSettings from "./admin/pages/AdminSettings";

const App = () => {
  return (
    <Routes>
      {/* =========================================
          MAIN WEBSITE
      ========================================= */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/events" element={<Events />} />
      </Route>

      {/* =========================================
          MANCH PAGES
      ========================================= */}
      <Route element={<ManchLayout />}>
        <Route path="/explore/swar-manch" element={<SwarManch />} />
        <Route path="/explore/drishya-manch" element={<DrishyaManch />} />
        <Route path="/explore/rang-manch" element={<RangManch />} />
        <Route path="/explore/shabda-manch" element={<ShabdaManch />} />
      </Route>

      {/* =========================================
          AUTHENTICATION
      ========================================= */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* =========================================
          COMMUNITY
      ========================================= */}
      <Route path="/community-guidelines" element={<CommunityGuidelines />} />

      {/* =========================================
          USER PROFILES
      ========================================= */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/profile/:userId" element={<Profile />} />

      {/* =========================================
          ADMIN CONTROL CENTER
      ========================================= */}
      <Route path="/admin" element={<AdminLayout />}>
        {/* Dashboard */}
        <Route index element={<AdminDashboard />} />

        {/* User management */}
        <Route path="users" element={<AdminUsers />} />

        {/* Content moderation */}
        <Route path="posts" element={<AdminPosts />} />

        {/* Reports and safety */}
        <Route path="reports" element={<AdminReports />} />

        {/* Event management */}
        <Route path="events" element={<AdminEvents />} />

        {/* Competitions */}
        <Route path="competitions" element={<AdminCompetitions />} />

        {/* Winners and crowns */}
        <Route path="winners" element={<AdminWinners />} />

        {/* Announcements */}
        <Route path="announcements" element={<AdminAnnouncements />} />

        {/* Platform analytics */}
        <Route path="analytics" element={<AdminAnalytics />} />

        {/* System settings */}
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
};

export default App;
