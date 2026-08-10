export type UserRole = "TENANT" | "LANDLORD" | "ADMIN";

export type UserStatus = "ACTIVE" | "BANNED";

export type PropertyStatus = "AVAILABLE" | "UNAVAILABLE";

export type RentalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentProvider = "STRIPE" | "SSLCOMMERZ";

export type PaymentStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "REFUNDED";

export type ApiSuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errorDetails: unknown;
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
};

export type AuthPayload = {
  accessToken: string;
  user: User;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: "TENANT" | "LANDLORD";
  phone?: string;
  address?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type Category = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    properties: number;
  };
};

export type UserSummary = Pick<User, "id" | "name" | "email" | "phone"> & {
  status?: UserStatus;
};

export type CategorySummary = Pick<Category, "id" | "name">;

export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  tenantId?: string;
  propertyId?: string;
  rentalRequestId?: string;
  tenant?: Pick<User, "id" | "name" | "email">;
  property?: Pick<Property, "id" | "title" | "location">;
  rentalRequest?: Pick<RentalRequest, "id" | "status" | "completedAt">;
  createdAt: string;
  updatedAt?: string;
};

export type Property = {
  id: string;
  title: string;
  description: string;
  location: string;
  address: string | null;
  rentAmount: string;
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number | null;
  amenities: string[];
  images: string[];
  status: PropertyStatus;
  landlordId: string;
  categoryId: string;
  category?: CategorySummary;
  landlord?: UserSummary;
  reviews?: Review[];
  _count?: {
    rentalRequests: number;
    reviews: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type PropertyListResponse = {
  meta: PaginationMeta;
  properties: Property[];
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PropertyFilters = {
  search?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: string;
  amenities?: string;
  sort?: "newest" | "oldest" | "rent_asc" | "rent_desc";
  page?: number;
  limit?: number;
};

export type PropertyPayload = {
  title: string;
  description: string;
  location: string;
  address?: string;
  rentAmount: number;
  bedrooms: number;
  bathrooms: number;
  areaSqFt?: number;
  amenities: string[];
  images: string[];
  status?: PropertyStatus;
  categoryId: string;
};

export type RentalRequest = {
  id: string;
  tenantId: string;
  propertyId: string;
  status: RentalStatus;
  moveInDate: string;
  rentalMonths: number;
  message: string | null;
  rejectionReason: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  activeAt: string | null;
  completedAt: string | null;
  tenant?: UserSummary & {
    address?: string | null;
  };
  property?: Pick<
    Property,
    "id" | "title" | "location" | "rentAmount" | "status" | "landlordId"
  > & {
    landlord?: UserSummary;
    category?: CategorySummary;
  };
  payments?: Payment[];
  review?: Review | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateRentalPayload = {
  propertyId: string;
  moveInDate: string;
  rentalMonths: number;
  message?: string;
};

export type UpdateRentalStatusPayload = {
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;
};

export type Payment = {
  id: string;
  transactionId: string | null;
  rentalRequestId: string;
  tenantId?: string;
  amount: string;
  currency?: string;
  method?: string | null;
  provider: PaymentProvider;
  status: PaymentStatus;
  providerSessionId?: string | null;
  providerPaymentId?: string | null;
  paidAt: string | null;
  rentalRequest?: Pick<RentalRequest, "id" | "status" | "rentalMonths"> & {
    property: Pick<Property, "id" | "title" | "location" | "rentAmount">;
  };
  createdAt: string;
  updatedAt?: string;
};

export type CreatePaymentPayload = {
  rentalRequestId: string;
  successUrl?: string;
  cancelUrl?: string;
};

export type CheckoutSession = {
  id: string;
  url: string | null;
};

export type CreatePaymentResponse = {
  payment: Payment;
  checkoutSession: CheckoutSession;
};

export type ConfirmPaymentPayload = {
  providerSessionId: string;
  status: "COMPLETED" | "FAILED" | "CANCELLED";
};

export type CreateReviewPayload = {
  rentalRequestId: string;
  propertyId: string;
  rating: number;
  comment?: string;
};

export type AdminUserQuery = {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
};

export type UpdateUserStatusPayload = {
  status: UserStatus;
};

export type CategoryPayload = {
  name: string;
  description?: string;
};

export type UpdateCategoryPayload = Partial<CategoryPayload>;

export type ContactSubmissionPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export type ContactSubmission = ContactSubmissionPayload & {
  id: string;
  createdAt: string;
};
