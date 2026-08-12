import type {
  AdminUserQuery,
  ApiErrorResponse,
  ApiResponse,
  AuthPayload,
  Category,
  CategoryPayload,
  ConfirmPaymentPayload,
  ContactSubmission,
  ContactSubmissionPayload,
  CreatePaymentPayload,
  CreatePaymentResponse,
  CreateRentalPayload,
  CreateReviewPayload,
  FacebookLoginPayload,
  GoogleLoginPayload,
  LoginPayload,
  ProfileUpdatePayload,
  Payment,
  Property,
  PropertyFilters,
  PropertyListResponse,
  PropertyPayload,
  RegisterPayload,
  Review,
  RentalRequest,
  UpdateCategoryPayload,
  UpdateRentalStatusPayload,
  UpdateUserStatusPayload,
  User,
} from "@/types/rentnest";

const DEFAULT_API_BASE_URL = "https://rentnest-server.onrender.com/api";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;

type RequestOptions = Omit<RequestInit, "body"> & {
  token?: string | null;
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
};

export class ApiError extends Error {
  status: number;
  errorDetails: unknown;

  constructor(status: number, response: ApiErrorResponse) {
    super(response.message);
    this.name = "ApiError";
    this.status = status;
    this.errorDetails = response.errorDetails;
  }
}

const isApiResponse = <T>(value: unknown): value is ApiResponse<T> =>
  typeof value === "object" &&
  value !== null &&
  "success" in value &&
  "message" in value;

const buildUrl = (
  path: string,
  query?: RequestOptions["query"],
) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
};

export async function apiRequest<T>(
  path: string,
  { token, body, headers, query, ...init }: RequestOptions = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(buildUrl(path, query), {
      ...init,
      headers: {
        Accept: "application/json",
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(503, {
      success: false,
      message: "Could not reach RentNest. Check your connection and try again.",
      errorDetails: null,
    });
  }

  const payload: unknown = await response.json().catch(() => ({
    success: false,
    message: "Invalid API response",
    errorDetails: null,
  }));

  if (!isApiResponse<T>(payload)) {
    throw new ApiError(response.status, {
      success: false,
      message: "Unexpected API response format",
      errorDetails: payload,
    });
  }

  if (!response.ok || payload.success === false) {
    throw new ApiError(response.status, payload as ApiErrorResponse);
  }

  return payload.data;
}

export const api = {
  health: () =>
    apiRequest<{
      service: string;
      uptime: number;
      timestamp: string;
    }>("/health"),

  auth: {
    register: (body: RegisterPayload) =>
      apiRequest<User>("/auth/register", {
        method: "POST",
        body,
      }),
    login: (body: LoginPayload) =>
      apiRequest<AuthPayload>("/auth/login", {
        method: "POST",
        body,
      }),
    googleLogin: (body: GoogleLoginPayload) =>
      apiRequest<AuthPayload>("/auth/google", {
        method: "POST",
        body,
      }),
    facebookLogin: (body: FacebookLoginPayload) =>
      apiRequest<AuthPayload>("/auth/facebook", {
        method: "POST",
        body,
      }),
    me: (token: string) =>
      apiRequest<User>("/auth/me", {
        token,
      }),
    updateProfile: (token: string, body: ProfileUpdatePayload) =>
      apiRequest<User>("/auth/me", {
        method: "PATCH",
        token,
        body,
      }),
  },

  properties: {
    list: (query?: PropertyFilters) =>
      apiRequest<PropertyListResponse>("/properties", {
        query,
      }),
    details: (id: string) => apiRequest<Property>(`/properties/${id}`),
  },

  categories: {
    list: () => apiRequest<Category[]>("/categories"),
    create: (token: string, body: CategoryPayload) =>
      apiRequest<Category>("/categories", {
        method: "POST",
        token,
        body,
      }),
    update: (token: string, id: string, body: UpdateCategoryPayload) =>
      apiRequest<Category>(`/categories/${id}`, {
        method: "PATCH",
        token,
        body,
      }),
    delete: (token: string, id: string) =>
      apiRequest<null>(`/categories/${id}`, {
        method: "DELETE",
        token,
      }),
  },

  rentals: {
    create: (token: string, body: CreateRentalPayload) =>
      apiRequest<RentalRequest>("/rentals", {
        method: "POST",
        token,
        body,
      }),
    listMine: (token: string) =>
      apiRequest<RentalRequest[]>("/rentals", {
        token,
      }),
    details: (token: string, id: string) =>
      apiRequest<RentalRequest>(`/rentals/${id}`, {
        token,
      }),
  },

  payments: {
    create: (token: string, body: CreatePaymentPayload) =>
      apiRequest<CreatePaymentResponse>("/payments/create", {
        method: "POST",
        token,
        body,
      }),
    confirm: (token: string, body: ConfirmPaymentPayload) =>
      apiRequest<Payment>("/payments/confirm", {
        method: "POST",
        token,
        body,
      }),
    listMine: (token: string) =>
      apiRequest<Payment[]>("/payments", {
        token,
      }),
    details: (token: string, id: string) =>
      apiRequest<Payment>(`/payments/${id}`, {
        token,
      }),
  },

  reviews: {
    create: (token: string, body: CreateReviewPayload) =>
      apiRequest<Review>("/reviews", {
        method: "POST",
        token,
        body,
      }),
  },

  contact: {
    create: (body: ContactSubmissionPayload) =>
      apiRequest<ContactSubmission>("/contact", {
        method: "POST",
        body,
      }),
  },

  landlord: {
    properties: (token: string) =>
      apiRequest<Property[]>("/landlord/properties", {
        token,
      }),
    createProperty: (token: string, body: PropertyPayload) =>
      apiRequest<Property>("/landlord/properties", {
        method: "POST",
        token,
        body,
      }),
    updateProperty: (token: string, id: string, body: Partial<PropertyPayload>) =>
      apiRequest<Property>(`/landlord/properties/${id}`, {
        method: "PUT",
        token,
        body,
      }),
    updateAvailability: (
      token: string,
      id: string,
      status: Property["status"],
    ) =>
      apiRequest<Property>(`/landlord/properties/${id}/availability`, {
        method: "PATCH",
        token,
        body: { status },
      }),
    deleteProperty: (token: string, id: string) =>
      apiRequest<null>(`/landlord/properties/${id}`, {
        method: "DELETE",
        token,
      }),
    requests: (token: string) =>
      apiRequest<RentalRequest[]>("/landlord/requests", {
        token,
      }),
    updateRequest: (
      token: string,
      id: string,
      body: UpdateRentalStatusPayload,
    ) =>
      apiRequest<RentalRequest>(`/landlord/requests/${id}`, {
        method: "PATCH",
        token,
        body,
      }),
    completeRequest: (token: string, id: string) =>
      apiRequest<RentalRequest>(`/landlord/requests/${id}/complete`, {
        method: "PATCH",
        token,
      }),
  },

  admin: {
    users: (token: string, query?: AdminUserQuery) =>
      apiRequest<User[]>("/admin/users", {
        token,
        query,
      }),
    updateUserStatus: (token: string, id: string, body: UpdateUserStatusPayload) =>
      apiRequest<User>(`/admin/users/${id}`, {
        method: "PATCH",
        token,
        body,
      }),
    properties: (token: string) =>
      apiRequest<Property[]>("/admin/properties", {
        token,
      }),
    rentals: (token: string) =>
      apiRequest<RentalRequest[]>("/admin/rentals", {
        token,
      }),
  },
};
