import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Menu,
  X,
  LogOut,
  UserRound,
  ChevronDown,
  Plus,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import CreateProfile from "./CreateProfile";

// Reusable painted CTA
const PaintButton = ({
  to,
  children,
  onClick,
  className = "",
  disabled = false,
}) => {
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

        <path
          d="M13 57 C52 62 83 59 112 61 C150 63 184 59 210 56"
          fill="none"
          stroke="#A90020"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.35"
        />
      </svg>

      <span className="relative inline-flex items-center whitespace-nowrap">
        {children}
      </span>
    </>
  );

  const classNames = `group relative isolate inline-flex items-center justify-center px-9 py-4 font-serif text-[15px] font-semibold tracking-wide text-white transition-transform duration-300 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${className}`;

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        aria-disabled={disabled}
        className={`${classNames} ${disabled ? "pointer-events-none opacity-60" : ""}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={classNames}
    >
      {content}
    </button>
  );
};

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [createProfileOpen, setCreateProfileOpen] = useState(false);

  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const createProfileOpenRef = useRef(false);

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

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/explore" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const closeMenu = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  // Close account dropdown when clicking outside.
  useEffect(() => {
    const handleOutsideClick = (event) => {
      const clickedInsideDesktop = desktopDropdownRef.current?.contains(
        event.target,
      );

      const clickedInsideMobile = mobileDropdownRef.current?.contains(
        event.target,
      );

      if (!clickedInsideDesktop && !clickedInsideMobile) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Keep modal state ref synchronized.
  useEffect(() => {
    createProfileOpenRef.current = createProfileOpen;
  }, [createProfileOpen]);

  // Open profile creation modal.
  const handleOpenCreateProfile = () => {
    if (loading || profileLoading || !isAuthenticated || hasProfile) {
      return;
    }

    closeMenu();
    setCreateProfileOpen(true);
  };

  const closeCreateProfile = () => {
    createProfileOpenRef.current = false;
    setCreateProfileOpen(false);
  };

  // Called only after the backend confirms profile creation.
  const handleProfileCreated = async () => {
    // Close first. Profile creation has already succeeded.
    closeCreateProfile();

    // Refresh profile state without keeping the modal open.
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

      closeMenu();
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
      {profile?.username?.charAt(0)?.toUpperCase() || <UserRound size={21} />}
    </span>
  );

  // Account dropdown.
  const renderProfileDropdown = () => (
    <div className="absolute right-0 top-full z-[60] mt-3 w-60 overflow-hidden rounded-xl border border-black/10 bg-[#F8F7F4] py-2 shadow-xl">
      <div className="border-b border-black/[0.07] px-4 py-3">
        <p className="truncate font-serif text-base font-semibold text-[#191919]">
          {profile?.user?.name || user?.name || "Your account"}
        </p>

        <p className="mt-1 truncate text-xs text-[#77716F]">
          @{profile?.username}
        </p>
      </div>

      <Link
        to="/profile"
        onClick={closeMenu}
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
        <LogOut size={17} />
        {loggingOut ? "Logging out..." : "Logout"}
      </button>
    </div>
  );

  // Account action based on authentication and profile status.
  const accountAction = (mobile = false) => {
    if (loading || profileLoading) {
      return null;
    }

    if (!isAuthenticated) {
      return (
        <PaintButton
          to="/register"
          onClick={closeMenu}
          className={mobile ? "w-full max-w-[240px] py-5 text-base" : ""}
        >
          {mobile ? "Join Prativa" : "Join Now"}
        </PaintButton>
      );
    }

    if (!hasProfile) {
      return (
        <PaintButton
          onClick={handleOpenCreateProfile}
          className={mobile ? "w-full max-w-[240px] py-5 text-base" : ""}
        >
          <Plus size={18} className="mr-2" />
          Create a Profile
        </PaintButton>
      );
    }

    return (
      <div
        ref={mobile ? mobileDropdownRef : desktopDropdownRef}
        className={`relative ${mobile ? "flex justify-center" : ""}`}
      >
        <button
          type="button"
          onClick={() => setDropdownOpen((previous) => !previous)}
          aria-label="Open account menu"
          aria-expanded={dropdownOpen}
          className="flex items-center gap-2 rounded-full border border-black/10 bg-white/70 p-1.5 pr-3 transition-all hover:border-[#E5092D]/40 hover:shadow-md"
        >
          <span className="h-10 w-10 overflow-hidden rounded-full border border-black/10">
            {avatarContent}
          </span>

          <ChevronDown
            size={16}
            className={`text-[#292929] transition-transform ${
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
      <header className="absolute left-0 top-0 z-50 w-full border-b border-white/20 bg-transparent">
        <nav className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-14">
          {/* Logo */}
          <Link to="/" onClick={closeMenu} className="group flex flex-col">
            <span className="font-serif text-[29px] font-semibold leading-none tracking-[2px] text-[#191919] transition-colors duration-300 group-hover:text-[#E5092D]">
              PRATIVA
            </span>

            <span className="mt-[6px] text-[8px] font-medium uppercase tracking-[1.4px] text-[#77716F]">
              Where talent leaves its mark.
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-11 md:flex">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `group relative py-2 font-serif text-[16px] transition-colors duration-300 ${
                    isActive
                      ? "text-[#C90024]"
                      : "text-[#292929] hover:text-[#FF1744]"
                  }`
                }
              >
                {link.name}

                <span className="absolute bottom-0 left-0 h-[1.5px] w-full origin-left scale-x-0 bg-[#FF1744] transition-transform duration-300 group-hover:scale-x-100" />
              </NavLink>
            ))}
          </div>

          {/* Desktop Account Action */}
          <div className="hidden items-center md:flex">{accountAction()}</div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => {
              setMenuOpen((previous) => !previous);
              setDropdownOpen(false);
            }}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#191919] transition-colors hover:bg-black/5 md:hidden"
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        <div
          className={`grid overflow-hidden bg-[#F8F7F4] transition-all duration-300 ease-in-out md:hidden ${
            menuOpen
              ? "grid-rows-[1fr] border-t border-black/[0.06] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="flex flex-col px-7 pb-7 pt-3">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex items-center justify-between border-b border-black/[0.06] py-4 font-serif text-xl transition-colors ${
                      isActive
                        ? "text-[#FF1744]"
                        : "text-[#292929] hover:text-[#FF1744]"
                    }`
                  }
                >
                  {link.name}
                  <ArrowRight size={17} className="opacity-50" />
                </NavLink>
              ))}

              {/* Mobile Account Action */}
              <div className="mt-6 flex justify-center">
                {accountAction(true)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Create Profile Modal */}
      {createProfileOpen && (
        <CreateProfile
          onClose={closeCreateProfile}
          onSuccess={handleProfileCreated}
        />
      )}
    </>
  );
};

export default Navbar;
