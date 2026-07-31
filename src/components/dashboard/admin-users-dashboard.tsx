"use client";

import { FormEvent, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Search,
  Shield,
  ShieldOff,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { api } from "@/lib/api";
import { getStoredToken, getStoredUser } from "@/lib/auth-session";
import { getErrorMessage } from "@/lib/errors";
import type { AdminUserQuery, User, UserRole, UserStatus } from "@/types/rentnest";

type AuthSnapshot = {
  token: string | null;
  user: User | null;
};

type UserFilters = {
  role: "" | UserRole;
  status: "" | UserStatus;
  search: string;
};

const roleTone: Record<UserRole, "emerald" | "blue" | "purple"> = {
  TENANT: "emerald",
  LANDLORD: "blue",
  ADMIN: "purple",
};

const statusTone: Record<UserStatus, "emerald" | "red"> = {
  ACTIVE: "emerald",
  BANNED: "red",
};

const subscribeToAuthStorage = (callback: () => void) => {
  window.addEventListener("storage", callback);

  return () => window.removeEventListener("storage", callback);
};

const getAuthSnapshot = () =>
  JSON.stringify({
    token: getStoredToken(),
    user: getStoredUser(),
  });

const getServerAuthSnapshot = () =>
  JSON.stringify({
    token: null,
    user: null,
  });

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
  }).format(new Date(value));

const toQuery = (filters: UserFilters): AdminUserQuery => ({
  role: filters.role || undefined,
  status: filters.status || undefined,
  search: filters.search.trim() || undefined,
});

function UserStatusBadge({ status }: { status: UserStatus }) {
  const Icon = status === "ACTIVE" ? CheckCircle2 : ShieldOff;

  return (
    <Badge className="gap-1.5" tone={statusTone[status]}>
      <Icon size={14} aria-hidden="true" />
      {status}
    </Badge>
  );
}

function AdminUserCard({
  currentAdminId,
  onUpdateStatus,
  updatingUserId,
  user,
}: {
  currentAdminId: string | null;
  onUpdateStatus: (user: User) => void;
  updatingUserId: string | null;
  user: User;
}) {
  const nextStatus: UserStatus = user.status === "ACTIVE" ? "BANNED" : "ACTIVE";
  const isSelf = currentAdminId === user.id;
  const isUpdating = updatingUserId === user.id;

  return (
    <article className="rounded-md border border-slate-200 p-4">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={roleTone[user.role]}>{user.role}</Badge>
            <UserStatusBadge status={user.status} />
            {isSelf ? <Badge tone="slate">Current admin</Badge> : null}
          </div>
          <h2 className="mt-3 text-lg font-semibold text-slate-950">{user.name}</h2>
          <p className="mt-1 text-sm text-slate-600">{user.email}</p>
        </div>
        <Button
          disabled={isSelf || isUpdating}
          onClick={() => onUpdateStatus(user)}
          size="sm"
          type="button"
          variant={nextStatus === "ACTIVE" ? "primary" : "outline"}
        >
          {isUpdating ? (
            <Loader2 className="animate-spin" size={15} aria-hidden="true" />
          ) : nextStatus === "ACTIVE" ? (
            <Shield size={15} aria-hidden="true" />
          ) : (
            <ShieldOff size={15} aria-hidden="true" />
          )}
          Mark {nextStatus.toLowerCase()}
        </Button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">Phone</p>
          <p className="mt-1 font-semibold text-slate-950">
            {user.phone || "Not provided"}
          </p>
        </div>
        <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">Address</p>
          <p className="mt-1 font-semibold text-slate-950">
            {user.address || "Not provided"}
          </p>
        </div>
        <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">Joined</p>
          <p className="mt-1 font-semibold text-slate-950">
            {formatDate(user.createdAt)}
          </p>
        </div>
        <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">Updated</p>
          <p className="mt-1 font-semibold text-slate-950">
            {formatDate(user.updatedAt)}
          </p>
        </div>
      </div>
    </article>
  );
}

export function AdminUsersDashboard() {
  const authSnapshot = useSyncExternalStore(
    subscribeToAuthStorage,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );
  const { token, user } = JSON.parse(authSnapshot) as AuthSnapshot;
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<UserFilters>({
    role: "",
    status: "",
    search: "",
  });
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const loadUsers = async (query: AdminUserQuery = toQuery(filters)) => {
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await api.admin.users(token, query);

      setUsers(data);
    } catch (fetchError) {
      setError(getErrorMessage(fetchError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    if (!token) {
      return () => {
        isActive = false;
      };
    }

    const loadInitialUsers = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await api.admin.users(token);

        if (isActive) {
          setUsers(data);
        }
      } catch (fetchError) {
        if (isActive) {
          setError(getErrorMessage(fetchError));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadInitialUsers();

    return () => {
      isActive = false;
    };
  }, [token]);

  const visibleUsers = useMemo(() => (token ? users : []), [token, users]);

  const stats = useMemo(() => {
    const tenants = visibleUsers.filter((item) => item.role === "TENANT").length;
    const landlords = visibleUsers.filter((item) => item.role === "LANDLORD").length;
    const banned = visibleUsers.filter((item) => item.status === "BANNED").length;

    return [
      { label: "Total users", value: visibleUsers.length },
      { label: "Tenants", value: tenants },
      { label: "Landlords", value: landlords },
      { label: "Banned", value: banned },
    ];
  }, [visibleUsers]);

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionMessage("");
    loadUsers(toQuery(filters));
  };

  const handleResetFilters = () => {
    const nextFilters: UserFilters = {
      role: "",
      status: "",
      search: "",
    };

    setFilters(nextFilters);
    setActionMessage("");
    loadUsers(toQuery(nextFilters));
  };

  const handleUpdateStatus = async (targetUser: User) => {
    if (!token) {
      setError("Please login as an admin before updating users.");
      return;
    }

    const nextStatus: UserStatus =
      targetUser.status === "ACTIVE" ? "BANNED" : "ACTIVE";

    setUpdatingUserId(targetUser.id);
    setError("");
    setActionMessage("");

    try {
      const updatedUser = await api.admin.updateUserStatus(token, targetUser.id, {
        status: nextStatus,
      });

      setUsers((currentUsers) =>
        currentUsers.map((currentUser) =>
          currentUser.id === updatedUser.id ? updatedUser : currentUser,
        ),
      );
      setActionMessage(`${updatedUser.name} is now ${updatedUser.status.toLowerCase()}.`);
    } catch (updateError) {
      setError(getErrorMessage(updateError));
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <main className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-emerald-700">Admin dashboard</p>
          <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                User management
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Review tenant, landlord, and admin accounts, then ban or restore
                access when needed.
              </p>
            </div>
            {user ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
                <p className="font-semibold text-slate-950">{user.name}</p>
                <p className="text-slate-600">{user.email}</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <Card key={item.label}>
              <CardContent>
                <p className="text-sm font-medium text-slate-600">{item.label}</p>
                <p className="mt-3 text-3xl font-bold text-slate-950">{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filter users</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 lg:grid-cols-[1fr_12rem_12rem_auto]" onSubmit={handleFilterSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="admin-user-search">Search</Label>
                <Input
                  id="admin-user-search"
                  onChange={(event) =>
                    setFilters((currentFilters) => ({
                      ...currentFilters,
                      search: event.target.value,
                    }))
                  }
                  placeholder="Name or email"
                  value={filters.search}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-role-filter">Role</Label>
                <select
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                  id="admin-role-filter"
                  onChange={(event) =>
                    setFilters((currentFilters) => ({
                      ...currentFilters,
                      role: event.target.value as UserFilters["role"],
                    }))
                  }
                  value={filters.role}
                >
                  <option value="">All roles</option>
                  <option value="TENANT">Tenant</option>
                  <option value="LANDLORD">Landlord</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-status-filter">Status</Label>
                <select
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
                  id="admin-status-filter"
                  onChange={(event) =>
                    setFilters((currentFilters) => ({
                      ...currentFilters,
                      status: event.target.value as UserFilters["status"],
                    }))
                  }
                  value={filters.status}
                >
                  <option value="">All statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="BANNED">Banned</option>
                </select>
              </div>
              <div className="flex items-end gap-2">
                <Button disabled={isLoading} type="submit">
                  <Search size={16} aria-hidden="true" />
                  Apply
                </Button>
                <Button
                  disabled={isLoading}
                  onClick={handleResetFilters}
                  type="button"
                  variant="outline"
                >
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex min-h-40 items-center justify-center gap-2 text-sm font-semibold text-slate-600">
                <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                Loading users
              </div>
            ) : null}

            {!isLoading && error ? (
              <div className="flex gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
                <p>{error}</p>
              </div>
            ) : null}

            {!isLoading && !error && actionMessage ? (
              <div className="mb-4 flex gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
                <p>{actionMessage}</p>
              </div>
            ) : null}

            {!isLoading && !error && visibleUsers.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <UsersRound className="mx-auto text-slate-400" size={34} aria-hidden="true" />
                <h2 className="mt-4 text-lg font-semibold text-slate-950">
                  No users found
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Try changing the search, role, or status filters.
                </p>
              </div>
            ) : null}

            {!isLoading && !error && visibleUsers.length > 0 ? (
              <div className="grid gap-4">
                {visibleUsers.map((item) => (
                  <AdminUserCard
                    currentAdminId={user?.id ?? null}
                    key={item.id}
                    onUpdateStatus={handleUpdateStatus}
                    updatingUserId={updatingUserId}
                    user={item}
                  />
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
