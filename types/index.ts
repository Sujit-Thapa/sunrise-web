// ============================================
// NOTE: This file was corrected against the real
// backend OpenAPI schema (Swagger docs at /api/docs).
// Field names below match the backend exactly.
// ============================================

// ============================================
// Auth
// ============================================
export type UserRole = 'USER' | 'AGENT' | 'ADMIN';

export interface RegisterUserDto {
  email: string;
  fullName: string;
  phoneNumber: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthUserDto {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface AuthResponseDto {
  accessToken: string;
  user: AuthUserDto;
}

export interface CreateAgentDto {
  email: string;
  fullName: string;
  phoneNumber: string;
  password: string;
}

export interface AgentResponseDto {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  isSuspended: boolean;
  createdAt: string;
}

// ============================================
// Shared / enums
// ============================================
export type ListingType = 'SALE' | 'RENT';
export type PropertyCategory = 'HOUSE' | 'APARTMENT' | 'LAND' | 'COMMERCIAL';
export type AreaUnit = 'sqft' | 'sqm' | 'aana' | 'ropani';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================
// LEGACY / UI-ONLY MOCK TYPE
// This is NOT a backend DTO. Kept as-is in case
// existing components (e.g. static card mocks)
// still import it. Do not use this for anything
// that talks to the real API — use
// PropertyResponseDto below instead.
// ============================================
export interface Property {
  id: string;
  title: string;
  price: number;
  location: string;
  coordinates?: [number, number];
  image: string;
  badge?: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  area: number; // in sq ft
}

// ============================================
// Properties (agency-owned) — REAL API SHAPE
// ============================================
export type PropertyStatus = 'DRAFT' | 'ACTIVE' | 'HIDDEN' | 'RESERVED' | 'COMPLETED';

export interface CreatePropertyDto {
  title: string;
  description: string;
  price: number;
  listingType: ListingType;
  category: PropertyCategory;
  street?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  areaSize?: number;
  areaUnit?: AreaUnit;
  latitude?: number;
  longitude?: number;
  reservationFeeOverride?: number;
}

export interface PropertyListQueryParams {
  status?: PropertyStatus;
  listingType?: ListingType;
  category?: PropertyCategory;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface UserPropertyListQueryParams {
  status?: UserPropertyStatus | string;
  listingType?: ListingType;
  category?: PropertyCategory;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface ReservationListQueryParams {
  status?: ReservationStatus;
  propertyId?: string;
  userId?: string;
  page?: number;
  limit?: number;
}

export interface FinancePaymentsQueryParams {
  status?: string;
  provider?: string;
  propertyId?: string;
  userId?: string;
  agentId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface UpdatePropertyDto {
  title?: string;
  description?: string;
  price?: number;
  listingType?: ListingType;
  category?: PropertyCategory;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  areaSize?: number;
  areaUnit?: AreaUnit;
  latitude?: number;
  longitude?: number;
  reservationFeeOverride?: number;
}

export interface PropertyImageResponseDto {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface PresignPropertyImageDto {
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface PresignPropertyImageResponseDto {
  uploadUrl: string;
  s3Key: string;
  publicUrl: string;
}

export interface ConfirmPropertyImageDto {
  s3Key: string;
  publicUrl: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface PropertyResponseDto {
  id: string;
  title: string;
  description: string;
  price: number;
  listingType: ListingType;
  category: PropertyCategory;
  status: PropertyStatus;
  outcome?: string;
  areaSize?: number;
  areaUnit?: AreaUnit;
  street?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  reservationFeeOverride?: number;
  createdByAgentId: string;
  images: PropertyImageResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface PropertiesListResponseDto {
  items: PropertyResponseDto[];
  pagination: PaginationMeta;
}

// ============================================
// User-submitted properties — REAL API SHAPE
// ============================================
export type UserPropertyStatus = 'pending' | 'approved' | 'rejected' | 'hidden';

export interface CreateUserPropertyDto {
  title: string;
  description: string;
  price: number;
  listingType: ListingType;
  category: PropertyCategory;
  areaSize?: number;
  areaUnit?: AreaUnit;
  street?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateUserPropertyDto {
  title?: string;
  description?: string;
  price?: number;
  listingType?: ListingType;
  category?: PropertyCategory;
  areaSize?: number;
  areaUnit?: AreaUnit;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface RejectUserPropertyDto {
  rejectionReason: string;
}

export interface UserPropertyContactDto {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface UserPropertyImageResponseDto {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface UserPropertyResponseDto {
  id: string;
  title: string;
  description: string;
  price: number;
  listingType: ListingType;
  category: PropertyCategory;
  status: UserPropertyStatus;
  areaSize?: number;
  areaUnit?: AreaUnit;
  street?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  rejectionReason?: string | null;
  submittedBy: UserPropertyContactDto;
  images: UserPropertyImageResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface UserPropertiesListResponseDto {
  items: UserPropertyResponseDto[];
  pagination: PaginationMeta;
}

// ============================================
// Payments
// ============================================
export interface InitiatePaymentDto {
  propertyId: string;
}

export interface EsewaInitiateResponseDto {
  paymentUrl: string;
  paymentId: string;
  esewaUrl?: string;
  gatewayUrl?: string;
  formFields?: Record<string, string>;
}

export interface KhaltiInitiateResponseDto {
  paymentUrl: string;
  paymentId: string;
}

export interface ConnectIpsInitiateResponseDto {
  checkoutUrl: string;
  paymentId: string;
  gatewayUrl?: string;
  formFields?: Record<string, string>;
}

// ============================================
// System config
// ============================================
export interface SystemConfigResponseDto {
  reservationFeeAmount: number;
  companyName: string;
  companyEmail: string;
  companyPhone: string | null;
  companyAddress: string | null;
  updatedAt: string;
}

export interface UpdateSystemConfigDto {
  reservationFeeAmount?: number;
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
}

// ============================================
// Reservations
// ============================================
export type ReservationStatus = 'PENDING' | 'CLAIMED' | 'COMPLETED' | 'CANCELLED' | string;

export interface ReservationPropertyDto {
  id: string;
  title: string;
}

export interface ReservationResponseDto {
  id: string;
  status: ReservationStatus;
  property: ReservationPropertyDto;
  userId: string;
  userNameSnapshot: string;
  userEmailSnapshot: string;
  userPhoneSnapshot: string;
  claimedByAgentId?: string | null;
  claimedAgentNameSnapshot?: string | null;
  reservationFeeAmount: number;
  cancelledBy?: string;
  cancellationReason?: string | null;
  createdAt: string;
  claimedAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
}

export interface ReservationsListResponseDto {
  items: ReservationResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export interface CancelReservationDto {
  cancellationReason?: string;
}

// ============================================
// Finance
// ============================================
export interface FinanceStatusMetricDto {
  status: string;
  count: number;
  amount: number;
}

export interface FinanceProviderMetricDto {
  provider: string;
  count: number;
  amount: number;
}

export interface FinanceReservationMetricDto {
  status: string;
  count: number;
}

export interface FinanceSummaryResponseDto {
  totalCollectedAmount: number;
  totalRefundedAmount: number;
  pendingAmount: number;
  paymentCount: number;
  successfulPaymentCount: number;
  failedPaymentCount: number;
  refundedPaymentCount: number;
  reservationCount: number;
  paymentsByStatus: FinanceStatusMetricDto[];
  paymentsByProvider: FinanceProviderMetricDto[];
  reservationsByStatus: FinanceReservationMetricDto[];
}

export interface FinancePaymentUserDto {
  id: string;
  fullName: string;
  email: string;
}

export interface FinancePaymentAgentDto {
  id: string;
  fullName: string;
  email: string;
}

export interface FinancePaymentPropertyDto {
  id: string;
  title: string;
  createdByAgent: FinancePaymentAgentDto;
}

export interface FinancePaymentResponseDto {
  id: string;
  provider: string;
  status: string;
  amount: number;
  providerRef?: string | null;
  user: FinancePaymentUserDto;
  property: FinancePaymentPropertyDto;
  reservationId?: string | null;
  succeededAt?: string | null;
  failedAt?: string | null;
  refundedAt?: string | null;
  refundReason?: string | null;
  failureReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FinancePaymentsListResponseDto {
  items: FinancePaymentResponseDto[];
  total: number;
  page: number;
  limit: number;
}
