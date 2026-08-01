"use client";

import { FormEvent, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ClipboardList,
  FolderOpen,
  Loader2,
  MapPin,
  Pencil,
  PlusCircle,
  Search,
  Shield,
  ShieldOff,
  Trash2,
  UsersRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Toast } from "@/components/ui/toast";
import { api } from "@/lib/api";
import { getStoredToken, getStoredUser } from "@/lib/auth-session";
import { getErrorMessage } from "@/lib/errors";
import { formatCurrency } from "@/lib/format";
import type {
  AdminUserQuery,
  Category,
  CategoryPayload,
  PaymentStatus,
  Property,
  PropertyStatus,
  RentalRequest,
  RentalStatus,
  User,
  UserRole,
  UserStatus,
} from "@/types/rentnest";

type AuthSnapshot = {
  token: string | null;
  user: User | null;
};

type UserFilters = {
  role: "" | UserRole;
  status: "" | UserStatus;
  search: string;
};

type CategoryFormValues = {
  name: string;
  description: string;
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

const propertyStatusTone: Record<PropertyStatus, "emerald" | "slate"> = {
  AVAILABLE: "emerald",
  UNAVAILABLE: "slate",
};

const rentalStatusTone: Record<RentalStatus, "slate" | "emerald" | "blue" | "amber" | "red" | "purple"> = {
  PENDING: "amber",
  APPROVED: "blue",
  REJECTED: "red",
  ACTIVE: "emerald",
  COMPLETED: "purple",
  CANCELLED: "slate",
};

const paymentStatusTone: Record<PaymentStatus, "slate" | "emerald" | "blue" | "amber" | "red"> = {
  PENDING: "amber",
  COMPLETED: "emerald",
  FAILED: "red",
  CANCELLED: "slate",
  REFUNDED: "blue",
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

const getRequestTotal = (request: RentalRequest) =>
  Number(request.property?.rentAmount ?? 0) * request.rentalMonths;

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

function AdminPropertyCard({ property }: { property: Property }) {
  return (
    <article className="rounded-md border border-slate-200 p-4">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={propertyStatusTone[property.status]}>{property.status}</Badge>
            <Badge tone="blue">{property.category?.name ?? "Rental"}</Badge>
          </div>
          <h2 className="mt-3 text-lg font-semibold text-slate-950">
            {property.title}
          </h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <MapPin size={15} aria-hidden="true" />
            {property.address || property.location}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
          <p className="font-semibold text-slate-950">
            {property.landlord?.name ?? "Landlord"}
          </p>
          <p className="text-slate-600">{property.landlord?.email}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">Rent</p>
          <p className="mt-1 font-semibold text-slate-950">
            {formatCurrency(property.rentAmount)}
          </p>
        </div>
        <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">Beds</p>
          <p className="mt-1 font-semibold text-slate-950">{property.bedrooms}</p>
        </div>
        <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">Requests</p>
          <p className="mt-1 font-semibold text-slate-950">
            {property._count?.rentalRequests ?? 0}
          </p>
        </div>
        <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">Reviews</p>
          <p className="mt-1 font-semibold text-slate-950">
            {property._count?.reviews ?? 0}
          </p>
        </div>
      </div>
    </article>
  );
}

function AdminRentalCard({ request }: { request: RentalRequest }) {
  const latestPayment = request.payments?.[0];

  return (
    <article className="rounded-md border border-slate-200 p-4">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={rentalStatusTone[request.status]}>{request.status}</Badge>
            {latestPayment ? (
              <Badge tone={paymentStatusTone[latestPayment.status]}>
                {latestPayment.status}
              </Badge>
            ) : null}
            <span className="text-xs font-medium text-slate-500">
              Requested {formatDate(request.createdAt)}
            </span>
          </div>
          <h2 className="mt-3 text-lg font-semibold text-slate-950">
            {request.property?.title ?? "Rental property"}
          </h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <MapPin size={15} aria-hidden="true" />
            {request.property?.location ?? "Location unavailable"}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">Tenant</p>
          <p className="mt-1 font-semibold text-slate-950">
            {request.tenant?.name ?? "Tenant"}
          </p>
          <p className="mt-1 text-xs text-slate-500">{request.tenant?.email}</p>
        </div>
        <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">Landlord</p>
          <p className="mt-1 font-semibold text-slate-950">
            {request.property?.landlord?.name ?? "Landlord"}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {request.property?.landlord?.email}
          </p>
        </div>
        <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">Move-in</p>
          <p className="mt-1 font-semibold text-slate-950">
            {formatDate(request.moveInDate)}
          </p>
        </div>
        <div className="rounded-md bg-slate-50 p-3 ring-1 ring-slate-200">
          <p className="text-xs font-medium uppercase text-slate-500">Total</p>
          <p className="mt-1 font-semibold text-slate-950">
            {formatCurrency(getRequestTotal(request))}
          </p>
        </div>
      </div>
    </article>
  );
}

function CategoryForm({
  initialValues = { name: "", description: "" },
  isSubmitting,
  onSubmit,
  submitLabel,
}: {
  initialValues?: CategoryFormValues;
  isSubmitting: boolean;
  onSubmit: (payload: CategoryPayload) => Promise<boolean>;
  submitLabel: string;
}) {
  const [values, setValues] = useState<CategoryFormValues>(initialValues);
  const [fieldError, setFieldError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (values.name.trim().length < 2 || values.name.trim().length > 80) {
      setFieldError("Category name must be 2 to 80 characters.");
      return;
    }

    if (values.description.trim().length > 500) {
      setFieldError("Description must be 500 characters or fewer.");
      return;
    }

    setFieldError("");

    const succeeded = await onSubmit({
      name: values.name.trim(),
      description: values.description.trim() || undefined,
    });

    if (succeeded && !initialValues.name) {
      setValues({ name: "", description: "" });
    }
  };

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr_auto]">
        <div className="grid gap-2">
          <Label htmlFor={`category-name-${submitLabel}`}>Name</Label>
          <Input
            id={`category-name-${submitLabel}`}
            maxLength={80}
            onChange={(event) =>
              setValues((currentValues) => ({
                ...currentValues,
                name: event.target.value,
              }))
            }
            placeholder="Apartment"
            value={values.name}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor={`category-description-${submitLabel}`}>Description</Label>
          <Input
            id={`category-description-${submitLabel}`}
            maxLength={500}
            onChange={(event) =>
              setValues((currentValues) => ({
                ...currentValues,
                description: event.target.value,
              }))
            }
            placeholder="Short category description"
            value={values.description}
          />
        </div>
        <div className="flex items-end">
          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={16} aria-hidden="true" />
            ) : (
              <PlusCircle size={16} aria-hidden="true" />
            )}
            {submitLabel}
          </Button>
        </div>
      </div>
      {fieldError ? (
        <p className="text-xs font-medium text-red-600">{fieldError}</p>
      ) : null}
    </form>
  );
}

function AdminCategoryCard({
  category,
  deletingCategoryId,
  onDelete,
  onUpdate,
  updatingCategoryId,
}: {
  category: Category;
  deletingCategoryId: string | null;
  onDelete: (category: Category) => void;
  onUpdate: (category: Category, payload: CategoryPayload) => Promise<boolean>;
  updatingCategoryId: string | null;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const isUpdating = updatingCategoryId === category.id;
  const isDeleting = deletingCategoryId === category.id;

  const handleUpdate = async (payload: CategoryPayload) => {
    const succeeded = await onUpdate(category, payload);

    if (succeeded) {
      setIsEditing(false);
    }

    return succeeded;
  };

  return (
    <article className="rounded-md border border-slate-200 p-4">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="blue">{category._count?.properties ?? 0} properties</Badge>
            <span className="text-xs font-medium text-slate-500">
              Updated {formatDate(category.updatedAt)}
            </span>
          </div>
          <h2 className="mt-3 text-lg font-semibold text-slate-950">
            {category.name}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {category.description || "No description provided."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setIsEditing((current) => !current)}
            size="sm"
            type="button"
            variant="outline"
          >
            <Pencil size={15} aria-hidden="true" />
            {isEditing ? "Cancel" : "Edit"}
          </Button>
          <Button
            disabled={isDeleting}
            onClick={() => onDelete(category)}
            size="sm"
            type="button"
            variant="outline"
          >
            {isDeleting ? (
              <Loader2 className="animate-spin" size={15} aria-hidden="true" />
            ) : (
              <Trash2 size={15} aria-hidden="true" />
            )}
            Delete
          </Button>
        </div>
      </div>

      {isEditing ? (
        <div className="mt-4 border-t border-slate-200 pt-4">
          <CategoryForm
            initialValues={{
              name: category.name,
              description: category.description ?? "",
            }}
            isSubmitting={isUpdating}
            onSubmit={handleUpdate}
            submitLabel="Update category"
          />
        </div>
      ) : null}
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
  const [properties, setProperties] = useState<Property[]>([]);
  const [rentals, setRentals] = useState<RentalRequest[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<UserFilters>({
    role: "",
    status: "",
    search: "",
  });
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [categoryMessage, setCategoryMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [updatingCategoryId, setUpdatingCategoryId] = useState<string | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [userPage, setUserPage] = useState(1);

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
        const [userData, propertyData, rentalData, categoryData] = await Promise.all([
          api.admin.users(token),
          api.admin.properties(token),
          api.admin.rentals(token),
          api.categories.list(),
        ]);

        if (isActive) {
          setUsers(userData);
          setProperties(propertyData);
          setRentals(rentalData);
          setCategories(categoryData);
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
  const visibleProperties = useMemo(
    () => (token ? properties : []),
    [properties, token],
  );
  const visibleRentals = useMemo(() => (token ? rentals : []), [rentals, token]);
  const visibleCategories = useMemo(
    () => (token ? categories : []),
    [categories, token],
  );

  const stats = useMemo(() => {
    const pendingRequests = visibleRentals.filter(
      (request) => request.status === "PENDING",
    ).length;

    return [
      { label: "Total users", value: visibleUsers.length },
      { label: "Properties", value: visibleProperties.length },
      { label: "Pending requests", value: pendingRequests },
      { label: "Categories", value: visibleCategories.length },
    ];
  }, [visibleCategories, visibleProperties, visibleRentals, visibleUsers]);

  const usersPerPage = 8;
  const userTotalPages = Math.max(1, Math.ceil(visibleUsers.length / usersPerPage));
  const paginatedUsers = visibleUsers.slice(
    (userPage - 1) * usersPerPage,
    userPage * usersPerPage,
  );

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActionMessage("");
    setUserPage(1);
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
    setUserPage(1);
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

  const handleCreateCategory = async (payload: CategoryPayload) => {
    if (!token) {
      setError("Please login as an admin before creating categories.");
      return false;
    }

    setIsCreatingCategory(true);
    setError("");
    setCategoryMessage("");

    try {
      const createdCategory = await api.categories.create(token, payload);

      setCategories((currentCategories) => [createdCategory, ...currentCategories]);
      setCategoryMessage("Category created successfully.");
      return true;
    } catch (createError) {
      setError(getErrorMessage(createError));
      return false;
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleUpdateCategory = async (
    category: Category,
    payload: CategoryPayload,
  ) => {
    if (!token) {
      setError("Please login as an admin before updating categories.");
      return false;
    }

    setUpdatingCategoryId(category.id);
    setError("");
    setCategoryMessage("");

    try {
      const updatedCategory = await api.categories.update(token, category.id, payload);

      setCategories((currentCategories) =>
        currentCategories.map((currentCategory) =>
          currentCategory.id === updatedCategory.id ? updatedCategory : currentCategory,
        ),
      );
      setCategoryMessage("Category updated successfully.");
      return true;
    } catch (updateError) {
      setError(getErrorMessage(updateError));
      return false;
    } finally {
      setUpdatingCategoryId(null);
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    if (!token) {
      setError("Please login as an admin before deleting categories.");
      return;
    }

    setDeletingCategoryId(category.id);
    setError("");
    setCategoryMessage("");

    try {
      await api.categories.delete(token, category.id);

      setCategories((currentCategories) =>
        currentCategories.filter((currentCategory) => currentCategory.id !== category.id),
      );
      setCategoryMessage("Category deleted successfully.");
    } catch (deleteError) {
      setError(getErrorMessage(deleteError));
    } finally {
      setDeletingCategoryId(null);
    }
  };

  return (
    <main className="bg-slate-50">
      <Toast message={actionMessage || categoryMessage} tone="success" />
      <Toast message={error} tone="error" />
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
              <>
                <div className="grid gap-4">
                  {paginatedUsers.map((item) => (
                    <AdminUserCard
                      currentAdminId={user?.id ?? null}
                      key={item.id}
                      onUpdateStatus={handleUpdateStatus}
                      updatingUserId={updatingUserId}
                      user={item}
                    />
                  ))}
                </div>
                <div className="mt-5 flex flex-col justify-between gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center">
                  <p className="text-sm text-slate-600">
                    Page {userPage} of {userTotalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      disabled={userPage <= 1}
                      onClick={() => setUserPage((current) => Math.max(1, current - 1))}
                      type="button"
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <Button
                      disabled={userPage >= userTotalPages}
                      onClick={() =>
                        setUserPage((current) => Math.min(userTotalPages, current + 1))
                      }
                      type="button"
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex min-h-40 items-center justify-center gap-2 text-sm font-semibold text-slate-600">
                <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                Loading categories
              </div>
            ) : null}

            {!isLoading && error ? (
              <div className="mb-4 flex gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <AlertCircle className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
                <p>{error}</p>
              </div>
            ) : null}

            {!isLoading && !error && categoryMessage ? (
              <div className="mb-4 flex gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                <CheckCircle2 className="mt-0.5 shrink-0" size={17} aria-hidden="true" />
                <p>{categoryMessage}</p>
              </div>
            ) : null}

            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <CategoryForm
                isSubmitting={isCreatingCategory}
                onSubmit={handleCreateCategory}
                submitLabel="Create category"
              />
            </div>

            {!isLoading && !error && visibleCategories.length === 0 ? (
              <div className="mt-4 rounded-md border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <FolderOpen className="mx-auto text-slate-400" size={34} aria-hidden="true" />
                <h2 className="mt-4 text-lg font-semibold text-slate-950">
                  No categories found
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Create categories so landlords can classify property listings.
                </p>
              </div>
            ) : null}

            {!isLoading && !error && visibleCategories.length > 0 ? (
              <div className="mt-4 grid gap-4">
                {visibleCategories.map((category) => (
                  <AdminCategoryCard
                    category={category}
                    deletingCategoryId={deletingCategoryId}
                    key={category.id}
                    onDelete={handleDeleteCategory}
                    onUpdate={handleUpdateCategory}
                    updatingCategoryId={updatingCategoryId}
                  />
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Properties</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex min-h-40 items-center justify-center gap-2 text-sm font-semibold text-slate-600">
                <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                Loading properties
              </div>
            ) : null}

            {!isLoading && !error && visibleProperties.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <Building2 className="mx-auto text-slate-400" size={34} aria-hidden="true" />
                <h2 className="mt-4 text-lg font-semibold text-slate-950">
                  No properties found
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Landlord listings will appear here for admin review.
                </p>
              </div>
            ) : null}

            {!isLoading && !error && visibleProperties.length > 0 ? (
              <div className="grid gap-4">
                {visibleProperties.map((property) => (
                  <AdminPropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rental activity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex min-h-40 items-center justify-center gap-2 text-sm font-semibold text-slate-600">
                <Loader2 className="animate-spin" size={18} aria-hidden="true" />
                Loading rentals
              </div>
            ) : null}

            {!isLoading && !error && visibleRentals.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <ClipboardList className="mx-auto text-slate-400" size={34} aria-hidden="true" />
                <h2 className="mt-4 text-lg font-semibold text-slate-950">
                  No rental activity
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                  Tenant requests, approvals, payments, and completed rentals will
                  appear here.
                </p>
              </div>
            ) : null}

            {!isLoading && !error && visibleRentals.length > 0 ? (
              <div className="grid gap-4">
                {visibleRentals.map((request) => (
                  <AdminRentalCard key={request.id} request={request} />
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
