import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  UserCheck,
  ShieldAlert,
  Shield,
  Ban,
  CheckCircle,
  AlertTriangle,
  LoaderCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Users,
  Mail,
  Calendar,
  FileText,
  Heart,
  RefreshCw,
  AlertCircle,
  UserRound,
  Crown,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedUser, setSelectedUser] = useState(null);
  const [actionReason, setActionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setFetchError("");

      const params = { page, limit: 15 };

      if (search.trim()) params.search = search.trim();
      if (roleFilter !== "all") params.role = roleFilter;
      if (statusFilter !== "all") params.status = statusFilter;

      const res = await axios.get(`${API_URL}/api/admin/users`, {
        params,
        withCredentials: true,
      });

      if (res.data.success) {
        setUsers(res.data.users || []);
        setTotalPages(
          Math.max(1, Math.ceil((res.data.pagination?.total || 0) / 15)),
        );
      }
    } catch (err) {
      console.error("Fetch users error:", err);
      setFetchError(
        err.response?.data?.message || "Unable to load user accounts.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      setActionLoading(true);
      setActionMessage("");
      setActionError(false);

      const res = await axios.patch(
        `${API_URL}/api/admin/users/${userId}`,
        {
          status: newStatus,
          suspensionReason: actionReason.trim(),
        },
        { withCredentials: true },
      );

      if (res.data.success) {
        const updatedUser = { ...selectedUser, status: newStatus };

        setActionMessage(`Account successfully marked as ${newStatus}.`);
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u)),
        );
        setSelectedUser(updatedUser);
      }
    } catch (err) {
      console.error("Update status error:", err);
      setActionError(true);
      setActionMessage(
        err.response?.data?.message || "Failed to update account status.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      setActionLoading(true);
      setActionMessage("");
      setActionError(false);

      const res = await axios.patch(
        `${API_URL}/api/admin/users/${userId}`,
        { role: newRole },
        { withCredentials: true },
      );

      if (res.data.success) {
        const updatedUser = { ...selectedUser, role: newRole };

        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
        );

        setSelectedUser(updatedUser);
        setActionMessage(`Account role successfully changed to ${newRole}.`);
      }
    } catch (err) {
      console.error("Update role error:", err);
      setActionError(true);
      setActionMessage(
        err.response?.data?.message || "Failed to update account role.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleStyle = (role) => {
    switch (role) {
      case "admin":
        return "bg-[#F9EAED] text-[#991B35] border-[#EED5DC]";
      case "moderator":
        return "bg-blue-50 text-blue-700 border-blue-100";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "active":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "suspended":
        return "bg-red-50 text-red-700 border-red-100";
      case "restricted":
        return "bg-amber-50 text-amber-700 border-amber-100";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitial = (name) => {
    return name?.trim()?.charAt(0)?.toUpperCase() || "U";
  };

  return (
    <div className="space-y-6 text-[#242124]">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#991B35]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#991B35]" />
            Community Management
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#242124] sm:text-3xl">
            Users & Creators
          </h1>

          <p className="mt-2 text-sm text-[#77716F]">
            Manage accounts, review user information, assign roles, and enforce
            community safety.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-[#EBE8E5] bg-white px-4 py-3 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F9EAED] text-[#991B35]">
            <Users size={18} />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#99918D]">
              Current page
            </p>
            <p className="text-sm font-bold text-[#302B29]">
              {users.length} accounts
            </p>
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#EBE8E5] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <form
          onSubmit={handleSearch}
          className="flex w-full items-center rounded-xl border border-[#EAE6E3] bg-[#FAF9F7] px-3.5 py-2.5 transition focus-within:border-[#991B35]/50 focus-within:bg-white sm:max-w-md"
        >
          <Search size={16} className="mr-2.5 shrink-0 text-[#96908C]" />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-transparent text-xs text-[#242124] outline-none placeholder:text-[#A8A19D]"
          />

          <button
            type="submit"
            className="ml-2 rounded-lg bg-[#991B35] px-3 py-1.5 text-[10px] font-bold text-white transition hover:bg-[#7D172C]"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-medium text-[#918984]">
            <span className="hidden sm:inline">Filter:</span>
          </div>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-[#EAE6E3] bg-[#FAF9F7] px-3 py-2.5 text-xs font-medium text-[#403A37] outline-none focus:border-[#991B35]/50"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Administrator</option>
            <option value="moderator">Moderator</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-[#EAE6E3] bg-[#FAF9F7] px-3 py-2.5 text-xs font-medium text-[#403A37] outline-none focus:border-[#991B35]/50"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="restricted">Restricted</option>
          </select>
        </div>
      </div>

      {/* USER TABLE */}
      <div className="overflow-hidden rounded-2xl border border-[#EBE8E5] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#F0EDEA] px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-sm font-bold text-[#242124]">
              Registered Accounts
            </h2>
            <p className="mt-1 text-[11px] text-[#96908C]">
              Review and manage platform members
            </p>
          </div>

          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-[#EBE8E5] px-3 py-2 text-xs font-semibold text-[#77716F] transition hover:bg-[#FAF9F7] hover:text-[#991B35] disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {fetchError && (
          <div className="m-5 flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-red-700">
              <AlertCircle size={16} />
              {fetchError}
            </div>

            <button
              type="button"
              onClick={fetchUsers}
              className="shrink-0 text-xs font-semibold text-red-700 underline"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <LoaderCircle size={30} className="animate-spin text-[#991B35]" />
            <p className="mt-3 text-xs text-[#96908C]">
              Loading user accounts...
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F9EAED] text-[#991B35]">
              <Users size={25} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-[#242124]">
              No users found
            </h3>

            <p className="mt-1 text-xs text-[#96908C]">
              Try changing your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="border-b border-[#EBE8E5] bg-[#FAF9F7] text-[10px] font-bold uppercase tracking-wider text-[#918984]">
                <tr>
                  <th className="py-4 pl-6 pr-3">User / Creator</th>
                  <th className="px-3 py-4">Database ID</th>
                  <th className="px-3 py-4">Role</th>
                  <th className="px-3 py-4">Status</th>
                  <th className="px-3 py-4">Subscribers</th>
                  <th className="px-3 py-4">Posts</th>
                  <th className="px-3 py-4">Joined</th>
                  <th className="py-4 pl-3 pr-6 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F0EDEA]">
                {users.map((u) => (
                  <tr key={u._id} className="transition hover:bg-[#FCFBFA]">
                    <td className="py-4 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F9EAED] text-xs font-bold text-[#991B35]">
                          {getInitial(u.name)}
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[180px] truncate font-semibold text-[#302B29]">
                            {u.name || "Unnamed User"}
                          </p>
                          <p className="mt-0.5 max-w-[180px] truncate text-[10px] text-[#96908C]">
                            {u.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className="font-mono text-[10px] text-[#918984]"
                        title={u._id}
                      >
                        {u._id}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase ${getRoleStyle(
                          u.role,
                        )}`}
                      >
                        {u.role || "user"}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase ${getStatusStyle(
                          u.status,
                        )}`}
                      >
                        {u.status || "unknown"}
                      </span>
                    </td>

                    <td className="px-3 py-4 font-semibold text-[#514A46]">
                      {u.subscriberCount || 0}
                    </td>

                    <td className="px-3 py-4 font-semibold text-[#514A46]">
                      {u.postsCount || 0}
                    </td>

                    <td className="px-3 py-4 text-[#918984]">
                      {formatDate(u.createdAt)}
                    </td>

                    <td className="py-4 pl-3 pr-6 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUser(u);
                          setActionReason("");
                          setActionMessage("");
                          setActionError(false);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#EBE8E5] bg-white px-3 py-2 text-[10px] font-bold text-[#6F6864] transition hover:border-[#991B35]/30 hover:bg-[#F9EAED] hover:text-[#991B35]"
                      >
                        <Eye size={13} />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        {!loading && users.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-[#F0EDEA] bg-[#FAF9F7] px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <span className="text-[11px] text-[#918984]">
              Page <strong className="text-[#403A37]">{page}</strong> of{" "}
              <strong className="text-[#403A37]">{totalPages}</strong>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1.5 rounded-lg border border-[#EAE6E3] bg-white px-3 py-2 text-[10px] font-semibold text-[#6F6864] transition hover:border-[#991B35]/30 hover:text-[#991B35] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} />
                Previous
              </button>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1.5 rounded-lg border border-[#EAE6E3] bg-white px-3 py-2 text-[10px] font-semibold text-[#6F6864] transition hover:border-[#991B35]/30 hover:text-[#991B35] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MANAGE USER MODAL */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#171416]/60 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget && !actionLoading) {
              setSelectedUser(null);
            }
          }}
        >
          <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#EBE8E5] bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#F0EDEA] bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#991B35]">
                  Account Administration
                </p>
                <h3 className="mt-1 text-lg font-bold text-[#242124]">
                  Manage Account
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                disabled={actionLoading}
                className="rounded-xl p-2 text-[#918984] transition hover:bg-[#FAF9F7] hover:text-[#991B35] disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              {/* User Identity */}
              <div className="flex items-center gap-4 rounded-xl border border-[#EBE8E5] bg-[#FAF9F7] p-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F9EAED] text-xl font-bold text-[#991B35]">
                  {getInitial(selectedUser.name)}
                </div>

                <div className="min-w-0">
                  <h4 className="truncate text-base font-bold text-[#302B29]">
                    {selectedUser.name || "Unnamed User"}
                  </h4>

                  <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-[#918984]">
                    <Mail size={12} />
                    {selectedUser.email || "No email available"}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase ${getRoleStyle(
                        selectedUser.role,
                      )}`}
                    >
                      {selectedUser.role}
                    </span>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase ${getStatusStyle(
                        selectedUser.status,
                      )}`}
                    >
                      {selectedUser.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Details */}
              <div>
                <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#77716F]">
                  Account Information
                </h4>

                <div className="overflow-hidden rounded-xl border border-[#EBE8E5]">
                  <div className="flex items-center justify-between gap-4 border-b border-[#F0EDEA] p-3.5">
                    <span className="text-xs text-[#918984]">Full Name</span>
                    <span className="text-right text-xs font-semibold text-[#403A37]">
                      {selectedUser.name || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-b border-[#F0EDEA] p-3.5">
                    <span className="text-xs text-[#918984]">Email</span>
                    <span className="break-all text-right text-xs font-semibold text-[#403A37]">
                      {selectedUser.email || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-b border-[#F0EDEA] p-3.5">
                    <span className="text-xs text-[#918984]">Database ID</span>
                    <span className="max-w-[65%] break-all text-right font-mono text-[10px] text-[#77716F]">
                      {selectedUser._id}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-b border-[#F0EDEA] p-3.5">
                    <span className="text-xs text-[#918984]">Joined</span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-[#403A37]">
                      <Calendar size={12} className="text-[#991B35]" />
                      {formatDate(selectedUser.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-b border-[#F0EDEA] p-3.5">
                    <span className="text-xs text-[#918984]">Subscribers</span>
                    <span className="text-xs font-semibold text-[#403A37]">
                      {selectedUser.subscriberCount || 0}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 p-3.5">
                    <span className="text-xs text-[#918984]">
                      Published Posts
                    </span>
                    <span className="text-xs font-semibold text-[#403A37]">
                      {selectedUser.postsCount || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Role Management */}
              <div>
                <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-[#77716F]">
                  Change Account Role
                </h4>

                <p className="mb-3 text-[11px] text-[#96908C]">
                  Assign the appropriate access level to this account.
                </p>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      role: "user",
                      label: "User",
                      icon: UserRound,
                    },
                    {
                      role: "moderator",
                      label: "Moderator",
                      icon: Shield,
                    },
                    {
                      role: "admin",
                      label: "Admin",
                      icon: Crown,
                    },
                  ].map(({ role, label, icon: Icon }) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleUpdateRole(selectedUser._id, role)}
                      disabled={actionLoading || selectedUser.role === role}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-xs font-semibold transition disabled:cursor-not-allowed ${
                        selectedUser.role === role
                          ? "border-[#991B35]/30 bg-[#F9EAED] text-[#991B35]"
                          : "border-[#EBE8E5] bg-white text-[#77716F] hover:border-[#991B35]/30 hover:bg-[#FAF9F7]"
                      }`}
                    >
                      <Icon size={17} />
                      {label}
                      {selectedUser.role === role && (
                        <span className="text-[9px] font-bold uppercase">
                          Current
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Enforcement */}
              <div>
                <h4 className="mb-1 text-xs font-bold uppercase tracking-wider text-[#77716F]">
                  Account Safety & Enforcement
                </h4>

                <p className="mb-3 text-[11px] leading-relaxed text-[#96908C]">
                  Provide a reason when suspending an account. This reason will
                  be sent with the status update.
                </p>

                <input
                  type="text"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Enter enforcement reason..."
                  disabled={actionLoading}
                  className="w-full rounded-xl border border-[#EAE6E3] bg-[#FAF9F7] px-3.5 py-3 text-xs text-[#242124] outline-none transition placeholder:text-[#A8A19D] focus:border-[#991B35]/50 focus:bg-white disabled:opacity-50"
                />

                <div className="mt-3 flex flex-col gap-2">
                  {selectedUser.status === "suspended" ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateStatus(selectedUser._id, "active")
                      }
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <LoaderCircle size={15} className="animate-spin" />
                      ) : (
                        <CheckCircle size={15} />
                      )}
                      Restore Account
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateStatus(selectedUser._id, "suspended")
                      }
                      disabled={actionLoading}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#991B35] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#7D172C] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <LoaderCircle size={15} className="animate-spin" />
                      ) : (
                        <Ban size={15} />
                      )}
                      Suspend Account
                    </button>
                  )}
                </div>
              </div>

              {/* Feedback */}
              {actionMessage && (
                <div
                  className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${
                    actionError
                      ? "border-red-100 bg-red-50 text-red-700"
                      : "border-emerald-100 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {actionError ? (
                    <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  ) : (
                    <CheckCircle size={15} className="mt-0.5 shrink-0" />
                  )}

                  {actionMessage}
                </div>
              )}

              <div className="flex justify-end border-t border-[#F0EDEA] pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  disabled={actionLoading}
                  className="rounded-xl border border-[#EBE8E5] px-5 py-2.5 text-xs font-semibold text-[#6F6864] transition hover:bg-[#FAF9F7] disabled:opacity-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
