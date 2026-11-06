import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  ChevronDown,
  LogOut,
  Plus,
  LoaderCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import CreateProfile from "./CreateProfile";

const manchSections = [
  {
    name: "SwarManch",
    logo: "SWARMANCH",
    path: "/explore/swar-manch",
    subtitle: "FIND YOUR VOICE.",
  },
  {
    name: "DrishyaManch",
    logo: "DRISHYAMANCH",
    path: "/explore/drishya-manch",
    subtitle: "SHOW YOUR VISION.",
  },
  {
    name: "RangManch",
    logo: "RANGMANCH",
    path: "/explore/rang-manch",
    subtitle: "PAINT YOUR IMAGINATION.",
  },
  {
    name: "ShabdaManch",
    logo: "SHABDAMANCH",
    path: "/explore/shabda-manch",
    subtitle: "LET YOUR WORDS SPEAK.",
  },
];

// Consistent branding for every Manch.
const ManchLogo = ({ logo, subtitle, to }) => (
  <Link to={to} className="group flex min-w-0 shrink-0 flex-col items-start">
    <span className="whitespace-nowrap font-serif text-[18px] font-bold leading-none tracking-[1.5px] text-[#191919] transition-colors duration-300 group-hover:text-[#E5092D] sm:text-[23px] sm:tracking-[2px] lg:text-[27px]">
      {logo}
    </span>

    <span className="mt-[6px] whitespace-nowrap font-sans text-[7px] font-medium uppercase tracking-[1px] text-[#77716F] sm:text-[8px] sm:tracking-[1.3px]">
      {subtitle}
    </span>
  </Link>
);

// Painted CTA.
const PaintButton = ({ to, onClick, children, className = "" }) => {
  const content = (
    <>
      <svg
        viewBox="0 0 230 72"
        className="absolute inset-0 -z-10 h-full w-full overflow-visible"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M12 17 C35 8 62 12 88 9 C126 6 170 10 211 14
             C222 16 222 27 216 35 C222 44 214 57 201 58
             C162 64 122 58 91 63 C58 67 26 60 13 58
             C3 55 6 45 10 37 C3 30 4 21 12 17Z"
          fill="#E5092D"
          className="transition-colors duration-300 group-hover:fill-[#C90024]"
        />

        <path
          d="M17 14 C57 7 91 13 123 10 C160 8 192 12 216 15"
          fill="none"
          stroke="#FF526B"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.35"
        />
      </svg>

      <span className="relative inline-flex items-center justify-center whitespace-nowrap">
        {children}
      </span>
    </>
  );

  const classes = `group relative isolate inline-flex shrink-0 items-center justify-center px-4 py-2.5 font-serif text-xs font-semibold tracking-wide text-white transition-transform duration-300 hover:scale-105 active:scale-95 sm:px-6 sm:py-3 sm:text-sm ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
};

const ManchNavbar = () => {
  const location = useLocation();
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

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [createProfileOpen, setCreateProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const dropdownRef = useRef(null);

  const currentManch =
    manchSections.find(
      (manch) =>
        location.pathname === manch.path ||
        location.pathname.startsWith(`${manch.path}/`),
    ) || manchSections[1];

  const closeAccountMenu = () => {
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside.
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Open profile creation.
  const handleOpenCreateProfile = () => {
    if (loading || profileLoading || !isAuthenticated || hasProfile) {
      return;
    }

    closeAccountMenu();
    setCreateProfileOpen(true);
  };

  // Refresh profile after successful creation.
  const handleProfileCreated = async () => {
    setCreateProfileOpen(false);

    try {
      await refreshProfile();
    } catch (error) {
      console.error(
        "Profile refresh failed:",
        error.response?.data?.message || error.message,
      );
    }
  };

  // Logout.
  const handleLogout = async () => {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      await logout();
      closeAccountMenu();
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

  // Profile avatar.
  const avatarContent = profile?.profileImage ? (
    <img
      src={profile.profileImage}
      alt="Your profile"
      className="h-full w-full rounded-full object-cover"
    />
  ) : (
    <span className="flex h-full w-full items-center justify-center bg-[#E5092D] font-serif text-lg font-semibold text-white">
      {profile?.username?.charAt(0)?.toUpperCase() || <UserRound size={20} />}
    </span>
  );

  // Profile dropdown.
  const renderProfileDropdown = () => (
    <div className="absolute right-0 top-full z-[80] mt-3 w-60 overflow-hidden rounded-xl border border-black/10 bg-[#F8F7F4] py-2 shadow-xl">
      <div className="border-b border-black/[0.07] px-4 py-3">
        <p className="truncate font-serif text-base font-semibold text-[#191919]">
          {profile?.user?.name || user?.name || "Your account"}
        </p>

        {profile?.username && (
          <p className="mt-1 truncate text-xs text-[#77716F]">
            @{profile.username}
          </p>
        )}
      </div>

      <Link
        to="/profile"
        onClick={closeAccountMenu}
        className="flex items-center gap-3 px-4 py-3 text-sm text-[#292929] transition-colors hover:bg-black/[0.04]"
      >
        <UserRound size={17} />
        My Profile
      </Link>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#C90024] transition-colors hover:bg-red-50 disabled:opacity-50"
      >
        {loggingOut ? (
          <LoaderCircle size={17} className="animate-spin" />
        ) : (
          <LogOut size={17} />
        )}

        {loggingOut ? "Logging out..." : "Logout"}
      </button>
    </div>
  );

  // Account actions.
  const renderAccountActions = () => {
    if (loading || profileLoading) {
      return (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center sm:h-10 sm:w-10">
          <span className="h-8 w-8 animate-pulse rounded-full bg-black/[0.07]" />
        </div>
      );
    }

    // Logged out: Join Now only.
    if (!isAuthenticated) {
      return (
        <PaintButton to="/register" className="px-4 py-2.5 sm:px-6 sm:py-3">
          Join Now
        </PaintButton>
      );
    }

    // Authenticated, but no profile.
    if (!hasProfile) {
      return (
        <PaintButton
          onClick={handleOpenCreateProfile}
          className="px-3 py-2 sm:px-6 sm:py-3"
        >
          <Plus size={15} className="mr-1.5" />
          <span className="hidden sm:inline">Create Profile</span>
          <span className="sm:hidden">Create</span>
        </PaintButton>
      );
    }

    // Authenticated with profile.
    return (
      <div ref={dropdownRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setDropdownOpen((previous) => !previous)}
          aria-label="Open account menu"
          aria-expanded={dropdownOpen}
          className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white/70 p-1 transition-all hover:border-[#E5092D]/40 hover:shadow-md sm:gap-2 sm:p-1.5 sm:pr-3"
        >
          <span className="h-8 w-8 overflow-hidden rounded-full border border-black/10 sm:h-10 sm:w-10">
            {avatarContent}
          </span>

          <ChevronDown
            size={15}
            className={`mr-1 text-[#292929] transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {dropdownOpen && renderProfileDropdown()}
      </div>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-black/[0.07] bg-[#F8F7F4]/95 backdrop-blur-xl">
        <nav className="mx-auto flex w-full max-w-[1600px] flex-col px-2 sm:px-5 lg:px-8 xl:px-10">
          {/* Main header row */}
          <div className="flex min-h-[68px] items-center justify-between gap-2 sm:min-h-[82px] sm:gap-4">
            {/* Back button + Current Manch branding */}
            <div className="flex min-w-0 shrink items-center gap-2 sm:gap-3">
              <Link
                to="/"
                aria-label="Back to PRATIVA home"
                title="Back to home"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-black/10 text-[#292929] transition-all hover:border-[#E5092D]/40 hover:bg-red-50 hover:text-[#E5092D] sm:h-9 sm:w-9"
              >
                <ArrowLeft size={17} />
              </Link>

              <ManchLogo
                logo={currentManch.logo}
                subtitle={currentManch.subtitle}
                to={currentManch.path}
              />
            </div>

            {/* Desktop stage navigation */}
            <div className="hidden min-w-0 flex-1 items-center justify-center gap-4 lg:flex xl:gap-7">
              {manchSections.map((manch) => {
                const isCurrent =
                  location.pathname === manch.path ||
                  location.pathname.startsWith(`${manch.path}/`);

                return (
                  <NavLink
                    key={manch.name}
                    to={manch.path}
                    className={`group relative whitespace-nowrap py-2 font-serif text-sm transition-colors duration-300 xl:text-base ${
                      isCurrent
                        ? "text-[#C90024]"
                        : "text-[#292929] hover:text-[#E5092D]"
                    }`}
                  >
                    {manch.name}

                    <span
                      className={`absolute bottom-0 left-0 h-[1.5px] w-full origin-left bg-[#FF1744] transition-transform duration-300 ${
                        isCurrent
                          ? "scale-x-100"
                          : "scale-x-0 group-hover:scale-x-100"
                      }`}
                    />
                  </NavLink>
                );
              })}
            </div>

            {/* Account actions */}
            <div className="flex shrink-0 items-center justify-end">
              {renderAccountActions()}
            </div>
          </div>

          {/* Mobile and tablet stage navigation */}
          <div className="flex items-center gap-5 overflow-x-auto border-t border-black/[0.06] py-2.5 scrollbar-hide lg:hidden">
            {manchSections.map((manch) => {
              const isCurrent =
                location.pathname === manch.path ||
                location.pathname.startsWith(`${manch.path}/`);

              return (
                <NavLink
                  key={manch.name}
                  to={manch.path}
                  className={`relative shrink-0 py-1 font-serif text-xs transition-colors duration-300 sm:text-sm ${
                    isCurrent
                      ? "font-semibold text-[#C90024]"
                      : "text-[#625D59] hover:text-[#E5092D]"
                  }`}
                >
                  {manch.name}

                  <span
                    className={`absolute bottom-0 left-0 h-[1.5px] w-full bg-[#E5092D] transition-transform duration-300 ${
                      isCurrent ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </NavLink>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Create Profile Modal */}
      {createProfileOpen && (
        <CreateProfile
          onClose={() => setCreateProfileOpen(false)}
          onSuccess={handleProfileCreated}
        />
      )}
    </>
  );
};

export default ManchNavbar;
