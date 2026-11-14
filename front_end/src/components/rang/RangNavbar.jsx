import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserRound, LogOut, Plus, ArrowRight, Palette } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import CreateProfile from "../CreateProfile";
import logo from "../../assets/logo.png";

const RangNavbar = ({ onUpload, uploadingDisabled = false }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [createProfileOpen, setCreateProfileOpen] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const {
    user,
    profile,
    loading,
    profileLoading,
    isAuthenticated,
    hasProfile,
    logout,
    refreshProfile,
  } = useAuth();

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return;
    try {
      setLoggingOut(true);
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoggingOut(false);
    }
  };

  const handleProfileCreated = async () => {
    setCreateProfileOpen(false);
    try {
      await refreshProfile();
    } catch (err) {
      console.error("Refresh profile failed:", err);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#8A2BE2]/20 bg-[#050A30]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="PRATIVA" className="h-9 w-auto" />
            </Link>
            <div className="hidden h-5 w-px bg-white/10 sm:block" />
            <Link
              to="/explore/rang-manch"
              className="flex items-center gap-2 rounded-full border border-[#8A2BE2]/40 bg-[#8A2BE2]/10 px-3 py-1 font-['Orbitron'] text-xs font-semibold text-[#8A2BE2] transition hover:bg-[#8A2BE2]/20"
            >
              <Palette size={14} />
              <span>RANG MANCH</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onUpload}
              disabled={uploadingDisabled}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8A2BE2] to-[#FF4DB8] px-4 py-2 font-['Orbitron'] text-xs font-bold text-white shadow-[0_0_20px_rgba(138,43,226,0.3)] transition hover:scale-105 hover:shadow-[0_0_25px_rgba(255,77,184,0.4)] disabled:opacity-50"
            >
              <Plus size={15} />
              <span>Share Artwork</span>
            </button>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[#8A2BE2]/40 bg-[#0B1F6B] text-white transition hover:border-[#FF4DB8]"
                >
                  {profile?.profileImage ? (
                    <img
                      src={profile.profileImage}
                      alt={profile.username || user?.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound size={16} />
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#0B1F6B] p-2 shadow-2xl backdrop-blur-lg">
                    <div className="border-b border-white/10 px-3 py-2">
                      <p className="text-xs font-medium text-white truncate">{user?.name}</p>
                      <p className="text-[10px] text-[#A7B5D8] truncate">@{profile?.username || "creator"}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-200 transition hover:bg-white/10 hover:text-white"
                    >
                      <UserRound size={14} />
                      <span>My Profile</span>
                    </Link>
                    {user?.role === "admin" && (
                      <Link
                        to="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-[#FF4DB8] transition hover:bg-[#FF4DB8]/10"
                      >
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                    >
                      <LogOut size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-full border border-white/20 bg-white/5 px-4 py-2 font-['Orbitron'] text-xs font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {createProfileOpen && (
        <CreateProfile
          onClose={() => setCreateProfileOpen(false)}
          onSuccess={handleProfileCreated}
        />
      )}
    </>
  );
};

export default RangNavbar;
