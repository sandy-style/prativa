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

import logo from "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import CreateProfile from "./CreateProfile";

// ==========================================
// PRATIVA PINK BUTTON
// ==========================================

const CosmicButton = ({
  to,
  children,
  onClick,
  className = "",
  disabled = false,
}) => {
  const buttonStyles = `
    group inline-flex items-center justify-center gap-2
    rounded-full
    bg-gradient-to-r from-[#FF4DB8] to-[#FF789A]
    px-7 py-3
    font-['Orbitron'] text-xs font-bold tracking-wide text-white
    shadow-[0_4px_15px_rgba(255,77,184,0.16)]
    transition-all duration-300
    hover:-translate-y-0.5
    hover:shadow-[0_7px_20px_rgba(255,77,184,0.25)]
    active:translate-y-0
    disabled:cursor-not-allowed disabled:opacity-50
    ${className}
  `;

  const content = (
    <>
      {children}
      <ArrowRight
        size={16}
        className="transition-transform duration-300 group-hover:translate-x-1"
      />
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        aria-disabled={disabled}
        className={`${buttonStyles} ${disabled ? "pointer-events-none" : ""}`}
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
      className={buttonStyles}
    >
      {content}
    </button>
  );
};

// ==========================================
// NAVBAR COMPONENT
// ==========================================

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [createProfileOpen, setCreateProfileOpen] = useState(false);

  const desktopDropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);

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
  // NAVIGATION LINKS
  // ==========================================

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/explore" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  // ==========================================
  // CLOSE MENUS
  // ==========================================

  const closeMenu = () => {
    setMenuOpen(false);
    setDropdownOpen(false);
  };

  // ==========================================
  // CLOSE DROPDOWN ON OUTSIDE CLICK
  // ==========================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      const insideDesktop = desktopDropdownRef.current?.contains(event.target);

      const insideMobile = mobileDropdownRef.current?.contains(event.target);

      if (!insideDesktop && !insideMobile) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // ==========================================
  // CREATE PROFILE
  // ==========================================

  const handleOpenCreateProfile = () => {
    if (loading || profileLoading || !isAuthenticated || hasProfile) {
      return;
    }

    closeMenu();
    setCreateProfileOpen(true);
  };

  const closeCreateProfile = () => {
    setCreateProfileOpen(false);
  };

  const handleProfileCreated = async () => {
    closeCreateProfile();

    try {
      await refreshProfile();
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

  // ==========================================
  // PROFILE AVATAR
  // ==========================================

  const avatarContent = profile?.profileImage ? (
    <img
      src={profile.profileImage}
      alt="Your profile"
      className="h-full w-full rounded-full object-cover"
    />
  ) : (
    <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FF4DB8] to-[#FF789A] text-lg font-bold text-white">
      {profile?.username?.charAt(0)?.toUpperCase() || <UserRound size={21} />}
    </span>
  );

  // ==========================================
  // PROFILE DROPDOWN
  // ==========================================

  const renderProfileDropdown = (mobile = false) => (
    <div
      className={`
        z-[100] overflow-hidden rounded-xl
        border border-[#FF4DB8]/20
        bg-[#080F36]
        py-2
        shadow-[0_12px_35px_rgba(0,0,0,0.22)]
        ${
          mobile
            ? "relative mt-3 w-full"
            : "absolute right-0 top-full mt-3 w-64"
        }
      `}
    >
      {/* User information */}

      <div className="border-b border-white/10 px-5 py-4">
        <p className="truncate font-['Orbitron'] text-xs font-semibold text-white">
          {profile?.user?.name || user?.name || "Your account"}
        </p>

        <p className="mt-2 truncate text-xs text-[#FF789A]">
          @{profile?.username}
        </p>
      </div>

      {/* My profile */}

      <Link
        to="/profile"
        onClick={closeMenu}
        className="
          flex items-center gap-3 px-5 py-4
          text-sm text-white/80
          transition-colors
          hover:bg-[#FF4DB8]/10
          hover:text-[#FF789A]
        "
      >
        <UserRound size={17} />
        My Profile
      </Link>

      {/* Logout */}

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="
          flex w-full items-center gap-3
          px-5 py-4 text-left text-sm
          text-[#FF789A]
          transition-colors
          hover:bg-[#FF4DB8]/10
          disabled:opacity-50
        "
      >
        <LogOut size={17} />
        {loggingOut ? "Logging out..." : "Logout"}
      </button>
    </div>
  );

  // ==========================================
  // ACCOUNT ACTIONS
  // ==========================================

  const accountAction = (mobile = false) => {
    if (loading || profileLoading) {
      return (
        <div className="flex items-center justify-center gap-2 py-3 text-xs text-white/50">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#FF4DB8]/30 border-t-[#FF4DB8]" />
          Loading account...
        </div>
      );
    }

    // Not authenticated

    if (!isAuthenticated) {
      return (
        <CosmicButton
          to="/register"
          onClick={closeMenu}
          className={mobile ? "w-full max-w-[280px]" : ""}
        >
          {mobile ? "Join PRATIVA" : "Join Now"}
        </CosmicButton>
      );
    }

    // Authenticated but no profile

    if (!hasProfile) {
      return (
        <CosmicButton
          onClick={handleOpenCreateProfile}
          className={mobile ? "w-full max-w-[280px]" : ""}
        >
          <Plus size={17} />
          Create Profile
        </CosmicButton>
      );
    }

    // Authenticated with profile

    return (
      <div
        ref={mobile ? mobileDropdownRef : desktopDropdownRef}
        className={`relative ${mobile ? "w-full" : ""}`}
      >
        <button
          type="button"
          onClick={() => setDropdownOpen((previous) => !previous)}
          aria-label="Open account menu"
          aria-expanded={dropdownOpen}
          className={`
            flex items-center gap-2
            rounded-full
            border border-[#FF4DB8]/25
            bg-white/5
            p-1.5 pr-3
            transition-all
            hover:border-[#FF4DB8]/70
            hover:bg-[#FF4DB8]/10
            ${mobile ? "mx-auto w-full max-w-[280px] justify-center" : ""}
          `}
        >
          <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-[#FF4DB8]/50">
            {avatarContent}
          </span>

          <span className="font-['Orbitron'] text-[10px] uppercase tracking-wider text-white/80">
            {mobile ? "My Account" : ""}
          </span>

          <ChevronDown
            size={16}
            className={`ml-auto text-[#FF789A] transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {dropdownOpen && renderProfileDropdown(mobile)}
      </div>
    );
  };

  // ==========================================
  // MAIN NAVBAR
  // ==========================================

  return (
    <>
      <header className="absolute left-0 top-0 z-50 w-full">
        {/* MAIN NAVIGATION */}

        <nav
          className="
            flex h-[76px] w-full items-center justify-between
            px-4 sm:h-[82px] sm:px-8
            md:h-[90px] md:px-10
            lg:px-12 xl:px-16 2xl:px-20
          "
        >
          {/* LOGO */}

          <Link
            to="/"
            onClick={closeMenu}
            aria-label="PRATIVA Home"
            className="group flex shrink-0 items-center"
          >
            <img
              src={logo}
              alt="PRATIVA - Showcase, Inspire, Connect"
              className="
                h-12 w-auto max-w-[150px]
                object-contain
                transition-transform duration-300
                group-hover:scale-[1.03]
                sm:h-14 sm:max-w-[180px]
                md:h-16 md:max-w-[210px]
              "
            />
          </Link>

          {/* DESKTOP NAVIGATION */}

          <div className="hidden items-center gap-8 md:flex lg:gap-11">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `group relative py-2 font-['Orbitron'] text-[11px] font-medium uppercase tracking-[1px] transition-colors duration-300 lg:text-xs ${
                    isActive
                      ? "text-[#FF789A]"
                      : "text-white/85 hover:text-[#FF789A]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.name}

                    <span
                      className={`
                        absolute -bottom-1 left-0
                        h-[2px] rounded-full
                        bg-gradient-to-r from-[#FF4DB8] to-[#FF789A]
                        transition-all duration-300
                        ${isActive ? "w-full" : "w-0 group-hover:w-full"}
                      `}
                    />
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* DESKTOP ACCOUNT ACTION */}

          <div className="hidden items-center md:flex">{accountAction()}</div>

          {/* MOBILE MENU BUTTON */}

          <button
            type="button"
            onClick={() => {
              setMenuOpen((previous) => !previous);
              setDropdownOpen(false);
            }}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-full
              border border-[#FF4DB8]/40
              bg-[#050A30]/50
              text-[#FF789A]
              transition-colors
              hover:bg-[#FF4DB8]/10
              sm:h-11 sm:w-11
              md:hidden
            "
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {/* MOBILE NAVIGATION */}

        <div
          className={`
            overflow-hidden
            bg-[#050A30]/[98%]
            shadow-[0_15px_35px_rgba(0,0,0,0.22)]
            transition-all duration-300 ease-in-out
            md:hidden
            ${
              menuOpen
                ? "max-h-[750px] border-t border-[#FF4DB8]/20 opacity-100"
                : "max-h-0 border-t border-transparent opacity-0"
            }
          `}
        >
          <div className="flex flex-col px-6 pb-8 pt-3 sm:px-8">
            {/* MOBILE LINKS */}

            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                className={({ isActive }) =>
                  `
                    flex items-center justify-between
                    border-b border-white/[0.08]
                    py-4 font-['Orbitron'] text-xs font-medium
                    uppercase tracking-wider
                    transition-colors
                    ${
                      isActive
                        ? "text-[#FF789A]"
                        : "text-white/85 hover:text-[#FF789A]"
                    }
                  `
                }
              >
                {link.name}

                <ArrowRight size={17} className="text-[#FF789A]/70" />
              </NavLink>
            ))}

            {/* MOBILE ACCOUNT ACTION */}

            <div className="mt-7 w-full">{accountAction(true)}</div>

            {/* FOOTER TEXT */}

            <p className="mt-7 text-center font-['Orbitron'] text-[9px] uppercase tracking-[2px] text-white/40">
              Where Creativity Takes the Spotlight
            </p>
          </div>
        </div>
      </header>

      {/* CREATE PROFILE MODAL */}

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
