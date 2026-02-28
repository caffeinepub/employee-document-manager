import type { AdminUser } from "@/backend.d.ts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActor } from "@/hooks/useActor";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  Shield,
  Trash2,
  UserCog,
  UserPlus,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export function Users() {
  const { actor, isFetching } = useActor();

  // Users list
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  // Add-user form
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const currentEmail = sessionStorage.getItem("loginEmail") ?? "";

  const fetchUsers = useCallback(async () => {
    if (!actor) return;
    try {
      const data = await actor.getAdminUsers();
      setUsers(data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setIsLoadingUsers(false);
    }
  }, [actor]);

  useEffect(() => {
    if (actor && !isFetching) {
      fetchUsers();
    }
  }, [actor, isFetching, fetchUsers]);

  const resetForm = () => {
    setEmail("");
    setPhone("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirm(false);
    setFormError(null);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email.trim()) {
      setFormError("Email address is required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError("Please enter a valid email address.");
      return;
    }
    if (!phone.trim()) {
      setFormError("Phone number is required.");
      return;
    }
    if (!/^\d{10}$/.test(phone.trim())) {
      setFormError("Phone number must be exactly 10 digits.");
      return;
    }
    if (!password) {
      setFormError("Password is required.");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    if (!actor) {
      setFormError("Not connected to backend. Please try again.");
      return;
    }

    // Check for duplicate email
    const isDuplicate = users.some(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (isDuplicate) {
      setFormError("A user with this email already exists.");
      return;
    }

    setIsAdding(true);
    try {
      await actor.addAdminUser(email.trim(), phone.trim(), password);
      toast.success(`User ${email.trim()} added successfully`);
      resetForm();
      await fetchUsers();
    } catch {
      toast.error("Failed to add user. This email may already be registered.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteUser = async (user: AdminUser) => {
    if (!actor) return;
    setDeletingId(user.id);
    try {
      await actor.deleteAdminUser(BigInt(user.id));
      toast.success(`User ${user.email} removed`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const canDelete = (user: AdminUser) => {
    if (users.length <= 1) return false;
    if (user.email.toLowerCase() === currentEmail.toLowerCase()) return false;
    return true;
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <UserCog className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800">
            User Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage admin accounts that can access this dashboard
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Add User Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <UserPlus
                  className="w-4.5 h-4.5 text-primary"
                  style={{ width: 18, height: 18 }}
                />
                <h2 className="text-sm font-semibold text-slate-800">
                  Add New User
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                New users will have full admin access
              </p>
            </div>

            <form onSubmit={handleAddUser} className="px-6 py-5 space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="new-email"
                  className="text-xs font-medium text-slate-600 flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email Address
                </Label>
                <Input
                  id="new-email"
                  type="email"
                  autoComplete="off"
                  placeholder="user@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFormError(null);
                  }}
                  disabled={isAdding}
                  className="h-9 text-sm"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="new-phone"
                  className="text-xs font-medium text-slate-600 flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Phone Number
                </Label>
                <Input
                  id="new-phone"
                  type="tel"
                  autoComplete="off"
                  placeholder="10-digit number"
                  value={phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setPhone(val);
                    setFormError(null);
                  }}
                  disabled={isAdding}
                  className="h-9 text-sm"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="new-password"
                  className="text-xs font-medium text-slate-600 flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setFormError(null);
                    }}
                    disabled={isAdding}
                    className="h-9 text-sm pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="confirm-password"
                  className="text-xs font-medium text-slate-600 flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setFormError(null);
                    }}
                    disabled={isAdding}
                    className="h-9 text-sm pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {formError && (
                <div className="flex items-start gap-2 rounded-lg px-3 py-2.5 bg-red-50 border border-red-200 text-xs text-red-700">
                  <Lock className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-red-500" />
                  <span>{formError}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isAdding}
                className="w-full h-9 text-sm font-semibold"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Adding…
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-3.5 w-3.5" />
                    Add User
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Info note */}
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <div className="flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700 leading-relaxed">
                All admin users share the same employee and document data. You
                cannot delete your own account or the last remaining account.
              </p>
            </div>
          </div>
        </div>

        {/* Users list */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserCog
                  className="w-4.5 h-4.5 text-slate-500"
                  style={{ width: 18, height: 18 }}
                />
                <h2 className="text-sm font-semibold text-slate-800">
                  Admin Users
                </h2>
              </div>
              {!isLoadingUsers && (
                <span className="text-xs font-medium text-slate-500 bg-slate-100 rounded-full px-2.5 py-1">
                  {users.length} {users.length === 1 ? "user" : "users"}
                </span>
              )}
            </div>

            {isLoadingUsers ? (
              <div className="px-6 py-5 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-40" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <UserCog className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-500">
                  No admin users found
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Add the first user using the form on the left
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/80">
                      <TableHead className="text-xs font-semibold text-slate-500 pl-6">
                        User
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500">
                        Phone
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500">
                        Role
                      </TableHead>
                      <TableHead className="text-xs font-semibold text-slate-500 text-right pr-6">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      const isCurrentUser =
                        user.email.toLowerCase() === currentEmail.toLowerCase();
                      const isDeletable = canDelete(user);
                      const isDeleting = deletingId === user.id;
                      const initials = user.email.charAt(0).toUpperCase();

                      return (
                        <TableRow
                          key={String(user.id)}
                          className="group hover:bg-slate-50/80 transition-colors"
                        >
                          <TableCell className="pl-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {initials}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-slate-800">
                                  {user.email}
                                </p>
                                {isCurrentUser && (
                                  <span className="text-xs text-blue-600 font-medium">
                                    You
                                  </span>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="text-sm text-slate-600 font-mono">
                              {user.phone}
                            </span>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 border border-emerald-200">
                              <Shield className="w-3 h-3" />
                              Admin
                            </span>
                          </TableCell>
                          <TableCell className="py-4 text-right pr-6">
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user)}
                              disabled={!isDeletable || isDeleting}
                              title={
                                !isDeletable
                                  ? isCurrentUser
                                    ? "Cannot delete your own account"
                                    : "Cannot delete the last user"
                                  : `Remove ${user.email}`
                              }
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 hover:text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                            >
                              {isDeleting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
