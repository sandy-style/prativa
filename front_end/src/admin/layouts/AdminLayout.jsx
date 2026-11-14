import React, { useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  FileText,
  ShieldAlert,
  Calendar,
  Trophy,
  Crown,
  Megaphone,
  BarChart3,
  Settings,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Shield,
  LoaderCircle,
  Activity,
  ChevronRight,
  Radio,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

const navItems = [
  {
    path: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    end: true,
    section: "OVERVIEW",
  },
  {
    path: "/admin/users",
    label: "Users & Creators",
    icon: Users,
  },
  {
    path: "/admin/posts",
    label: "Post Moderation",
    icon: FileText,
  },
  {
    path: "/admin/reports",
    label: "Reports & Safety",
    icon: ShieldAlert,
  },
  {
    path: "/admin/events",
    label: "Event Management",
    icon: Calendar,
    section: "MANAGEMENT",
  },
  {
    path: "/admin/competitions",
    label: "Competitions",
    icon: Trophy,
  },
  {
    path: "/admin/winners",
    label: "Winners & Crowns",
    icon: Crown,
  },
  {
    path: "/admin/announcements",
    label: "Announcements",
    icon: Megaphone,
    section: "PLATFORM",
  },
  {
    path: "/admin/analytics",
    label: "Platform Analytics",
    icon: BarChart3,
  },
  {
    path: "/admin/settings",
    label: "System Settings",
    icon: Settings,
  },
];

const AdminLayout = () => {
  const { user, loading, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activePage =
    [...navItems]
      .sort((a, b) => b.path.length - a.path.length)
      .find((item) =>
        item.end
          ? location.pathname === item.path
          : location.pathname.startsWith(item.path),
      ) || navItems[0];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Admin logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F7]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#991B35]/10">
            <LoaderCircle size={28} className="animate-spin text-[#991B35]" />
          </div>
          <p className="text-sm font-medium tracking-wide text-gray-500">
            Preparing your workspace...
          </p>
        </div>
      </div>
    );
  }

  // Admin security gate
  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F7] px-4">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm sm:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-[#991B35]">
            <ShieldAlert size={32} />
          </div>

          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#991B35]">
            Restricted Area
          </span>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
            Access denied
          </h1>

          <p className="mt-4 text-sm leading-7 text-gray-500">
            This area is reserved for authorized PRATIVA administrators. Your
            current account does not have permission to access it.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/"
              className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Return to website
            </Link>

            <Link
              to="/login"
              className="rounded-xl bg-[#991B35] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#7F172D]"
            >
              Sign in
            </Link>
          </div>

          <p className="mt-8 text-xs text-gray-400">
            Error 403 · Unauthorized access
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FAF9F7] text-[#242124]">
      {/* DESKTOP SIDEBAR */}
      <aside className="relative z-20 hidden w-[270px] shrink-0 flex-col border-r border-[#EBE8E5] bg-white lg:flex">
        {/* BRAND */}
        <div className="border-b border-[#F0EEEC] px-6 py-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#991B35]/[0.07]">
              <img
                src={logo}
                alt="PRATIVA"
                className="h-7 w-auto object-contain"
              />
            </div>

            <div>
              <h1 className="text-lg font-extrabold tracking-[0.12em] text-gray-900">
                PRATIVA
              </h1>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#991B35]">
                Admin workspace
              </p>
            </div>
          </Link>

          <div className="mt-6 flex items-center justify-between rounded-xl bg-[#F8F6F5] px-3 py-3">
            <div className="flex items-center gap-2.5">
              <Radio size={15} className="text-[#991B35]" />
              <span className="text-xs font-medium text-gray-600">
                Platform status
              </span>
            </div>

            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              ONLINE
            </span>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-7">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.path}>
                {item.section && (
                  <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.16em] text-gray-400">
                    {item.section}
                  </p>
                )}

                <NavLink
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-[13px] transition-all duration-200 ${
                      isActive
                        ? "bg-[#991B35]/[0.08] font-semibold text-[#991B35]"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#991B35]" />
                      )}

                      <Icon
                        size={17}
                        strokeWidth={isActive ? 2.3 : 1.8}
                        className={
                          isActive
                            ? "text-[#991B35]"
                            : "text-gray-400 transition group-hover:text-[#991B35]"
                        }
                      />

                      <span className="flex-1">{item.label}</span>

                      {isActive && (
                        <ChevronRight size={15} className="text-[#991B35]" />
                      )}
                    </>
                  )}
                </NavLink>
              </div>
            );
          })}
        </nav>

        {/* ADMIN PROFILE */}
        <div className="border-t border-[#F0EEEC] p-4">
          <div className="mb-4 rounded-2xl border border-[#F0EEEC] bg-[#FAF9F7] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#991B35] text-sm font-bold text-white">
                {(user.name || "A").charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">
                  {user.name || "Administrator"}
                </p>
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {user.email || "Admin Account"}
                </p>
              </div>

              <Shield size={16} className="shrink-0 text-[#991B35]" />
            </div>

            <div className="mt-3 flex items-center gap-2 border-t border-gray-200 pt-3">
              <Shield size={12} className="text-[#991B35]" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                Administrator
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-xs font-medium text-gray-500 transition hover:text-[#991B35]"
            >
              <ArrowLeft size={14} />
              Main website
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN AREA */}
      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#EBE8E5] bg-white/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {/* MOBILE MENU */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl border border-gray-200 p-2.5 text-gray-600 transition hover:bg-gray-50 hover:text-[#991B35] lg:hidden"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>PRATIVA</span>
                <span>/</span>
                <span>Administration</span>
              </div>

              <h2 className="mt-1 truncate text-base font-bold text-gray-900 sm:text-lg">
                {activePage.label}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 sm:flex">
              <Activity size={14} className="text-emerald-600" />
              <span className="text-[11px] font-semibold text-emerald-700">
                System active
              </span>
            </div>

            <div className="hidden h-7 w-px bg-gray-200 sm:block" />

            <Link
              to="/"
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-600 transition hover:border-[#991B35]/30 hover:text-[#991B35] sm:px-4"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Main website</span>
              <span className="sm:hidden">Exit</span>
            </Link>
          </div>
        </header>

        {/* MOBILE NAVIGATION */}
        {mobileMenuOpen && (
          <>
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            />

            <div className="absolute left-0 right-0 top-[76px] z-40 border-b border-gray-200 bg-white p-4 shadow-xl lg:hidden">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-[0.16em] text-gray-400">
                  ADMINISTRATION
                </span>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                  ONLINE
                </span>
              </div>

              <nav className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {navItems.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                          isActive
                            ? "bg-[#991B35]/[0.08] font-semibold text-[#991B35]"
                            : "text-gray-600 hover:bg-gray-50"
                        }`
                      }
                    >
                      <Icon size={17} />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="max-w-[65%] truncate text-xs text-gray-400">
                  Signed in as {user.name || "Admin"}
                </span>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            </div>
          </>
        )}

        {/* PAGE CONTENT */}
        <main className="relative flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1700px]">
            {/* PAGE CONTEXT */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE7E4] pb-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-gray-400">Workspace</span>

                <ChevronRight size={13} className="text-gray-300" />

                <span className="font-semibold text-[#991B35]">
                  {activePage.label}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-medium text-gray-400">
                <Shield size={13} className="text-[#991B35]" />
                Secure admin session
              </div>
            </div>

            <Outlet />
          </div>
        </main>

        {/* FOOTER */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#EBE8E5] bg-white px-5 py-4 sm:px-8">
          <p className="text-[11px] font-medium tracking-wide text-gray-400">
            PRATIVA · ADMIN WORKSPACE
          </p>

          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-medium text-gray-400">
              All systems operational
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
