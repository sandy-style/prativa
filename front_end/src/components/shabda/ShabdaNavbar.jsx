import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserRound, LogOut, Plus, ArrowRight } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import CreateProfile from "../CreateProfile";

const ShabdaNavbar = () => {
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

  // ==========================================
  // CLOSE DROPDOWN ON OUTSIDE CLICK
  // ==========================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  // ==========================================
  // USER DETAILS
  // ==========================================

  const username =
    profile?.username ||
    profile?.user?.username ||
    user?.username ||
    user?.name ||
    "";

  const firstLetter = username.trim().charAt(0).toUpperCase() || "U";

  const avatar =
    profile?.profileImage ||
    profile?.avatar ||
    profile?.user?.profileImage ||
    user?.profileImage ||
    user?.picture ||
    user?.avatar;

  const displayName =
    profile?.user?.name || user?.name || username || "Your account";

  const closeDropdown = () => setDropdownOpen(false);

  // ==========================================
  // CREATE PROFILE
  // ==========================================

  const handleOpenCreateProfile = () => {
    if (loading || profileLoading || !isAuthenticated || hasProfile) return;

    closeDropdown();
    setCreateProfileOpen(true);
  };

  const handleProfileCreated = async () => {
    try {
      await refreshProfile();
      setCreateProfileOpen(false);
    } catch (error) {
      console.error(
        "Profile refresh failed:",
        error.response?.data?.message || error.message,
      );
    }
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      await logout();
      closeDropdown();
      navigate("/");
    } catch (error) {
      console.error(
        "Logout failed:",
        error.response?.data?.message || error.message,
      );
    } finally {
      setLoggingOut(false);
    }
  };

  // ==========================================
  // ACCOUNT ACTION
  // ==========================================

  const renderAccountAction = () => {
    if (loading || profileLoading) {
      return (
        <div className="flex items-center">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#F97316]/30 border-t-[#F97316]" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <Link
          to="/register"
          className="
            inline-flex shrink-0 items-center gap-1
            rounded-full border border-[#F97316]
            bg-[#F97316] px-2.5 py-2
            text-[10px] font-semibold text-[#100905]
            transition-all duration-300
            hover:bg-[#FB923C]
            sm:gap-2 sm:px-4 sm:text-xs
          "
        >
          <span className="sm:hidden">Join</span>
          <span className="hidden sm:inline">Join Now</span>
          <ArrowRight size={13} />
        </Link>
      );
    }

    if (!hasProfile) {
      return (
        <button
          type="button"
          onClick={handleOpenCreateProfile}
          className="
            inline-flex shrink-0 items-center gap-1
            rounded-full border border-[#F97316]/50
            bg-black/20 px-2 py-2
            text-[9px] font-semibold text-[#FB923C]
            transition-all duration-300
            hover:bg-[#F97316]/10
            sm:gap-2 sm:px-4 sm:text-xs
          "
        >
          <Plus size={13} />
          <span className="sm:hidden">Profile</span>
          <span className="hidden sm:inline">Create Profile</span>
        </button>
      );
    }

    return (
      <div ref={dropdownRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setDropdownOpen((previous) => !previous)}
          aria-label="Open account menu"
          aria-expanded={dropdownOpen}
          className="
            flex h-8 w-8 items-center justify-center
            overflow-hidden rounded-full
            border border-white/30 bg-black/20
            transition-all duration-300
            hover:border-[#F97316]
            hover:shadow-[0_0_15px_rgba(249,115,22,0.2)]
            sm:h-10 sm:w-10
          "
        >
          {avatar ? (
            <img
              src={avatar}
              alt="Your profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-[#F97316] text-sm font-bold text-[#100905]">
              {firstLetter}
            </span>
          )}
        </button>

        {dropdownOpen && (
          <div
            className="
              absolute right-0 top-full z-[100]
              mt-3 w-56 overflow-hidden rounded-xl
              border border-[#F97316]/20
              bg-[#1C100A]
              shadow-[0_15px_40px_rgba(0,0,0,0.4)]
              sm:w-60
            "
          >
            <div className="border-b border-white/10 px-4 py-4">
              <p className="truncate text-sm font-semibold text-white">
                {displayName}
              </p>

              {username && (
                <p className="mt-1 truncate text-xs text-[#FB923C]">
                  @{username}
                </p>
              )}
            </div>

            <Link
              to="/profile"
              onClick={closeDropdown}
              className="
                flex items-center gap-3 px-4 py-3.5
                text-sm text-white/80
                transition hover:bg-[#F97316]/10
                hover:text-[#FB923C]
              "
            >
              <UserRound size={16} />
              My Profile
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="
                flex w-full items-center gap-3
                px-4 py-3.5 text-left text-sm
                text-red-400 transition
                hover:bg-red-400/10
                disabled:opacity-50
              "
            >
              <LogOut size={16} />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        )}
      </div>
    );
  };

  // ==========================================
  // NAVBAR
  // ==========================================

  return (
    <>
      <header className="absolute left-0 top-0 z-50 w-full bg-transparent">
        <nav
          className="
            mx-auto flex h-[62px] w-full
            max-w-[1800px] items-center
            justify-between px-3
            sm:h-[70px] sm:px-6
            md:h-[78px] md:px-9
            lg:px-12 xl:px-16
          "
        >
          {/* BRAND */}
          <Link
            to="/"
            aria-label="PRATIVA Home"
            className="flex shrink-0 flex-col justify-center leading-none"
          >
            <span className="text-[15px] font-semibold tracking-[-0.04em] text-white sm:text-[20px]">
              PRATIVA
            </span>

            <span className="mt-[3px] text-[11px] font-medium text-white/90 sm:text-[15px]">
              प्रतिभा
            </span>
          </Link>

          {/* ACCOUNT */}
          <div className="flex shrink-0 items-center justify-end">
            {renderAccountAction()}
          </div>
        </nav>
      </header>

      {/* CREATE PROFILE MODAL */}
      {createProfileOpen && (
        <CreateProfile
          onClose={() => setCreateProfileOpen(false)}
          onSuccess={handleProfileCreated}
        />
      )}
    </>
  );
};

export default ShabdaNavbar;
