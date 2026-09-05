import { api } from './api';
import type {
  AgentResponseDto,
  CancelReservationDto,
  ConnectIpsInitiateResponseDto,
  ConfirmPropertyImageDto,
  CreatePropertyDto,
  CreateUserPropertyDto,
  EsewaInitiateResponseDto,
  FinancePaymentsListResponseDto,
  FinanceSummaryResponseDto,
  FinancePaymentsQueryParams,
  InitiatePaymentDto,
  KhaltiInitiateResponseDto,
  PresignPropertyImageDto,
  PresignPropertyImageResponseDto,
  PresignUserPropertyImageDto,
  PresignUserPropertyImageResponseDto,
  ConfirmUserPropertyImageDto,
  PropertiesListResponseDto,
  PropertyListQueryParams,
  PropertyResponseDto,
  RejectUserPropertyDto,
  ReservationResponseDto,
  ReservationsListResponseDto,
  ReservationListQueryParams,
  SystemConfigResponseDto,
  UpdatePropertyDto,
  UpdateSystemConfigDto,
  UpdateUserPropertyDto,
  UserPropertyListQueryParams,
  UserPropertiesListResponseDto,
  UserPropertyResponseDto,
} from '@/types';

/** Small helper to build a query string, skipping undefined values. */
function toQueryString(params?: object): string {
  if (!params) return '';
  const entries = Object.entries(params as Record<string, unknown>).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return '';
  const search = new URLSearchParams(
    entries.map(([k, v]) => [k, String(v)])
  );
  return `?${search.toString()}`;
}

// ============================================
// Properties (agency-owned listings)
// ============================================
export const propertiesApi = {
  create: (data: CreatePropertyDto, token: string) =>
    api.post<PropertyResponseDto>('/v1/properties', data, token),

  findAll: (
    params?: PropertyListQueryParams,
    token?: string
  ) => api.get<PropertiesListResponseDto>(`/v1/properties${toQueryString(params)}`, token),

  findOne: (id: string, token?: string) =>
    api.get<PropertyResponseDto>(`/v1/properties/${id}`, token),

  update: (id: string, data: UpdatePropertyDto, token: string) =>
    api.patch<PropertyResponseDto>(`/v1/properties/${id}`, data, token),

  remove: (id: string, token: string) =>
    api.delete<void>(`/v1/properties/${id}`, token),

  publish: (id: string, token: string) =>
    api.patch<PropertyResponseDto>(`/v1/properties/${id}/publish`, {}, token),

  hide: (id: string, token: string) =>
    api.patch<PropertyResponseDto>(`/v1/properties/${id}/hide`, {}, token),

  presignImage: (id: string, data: PresignPropertyImageDto, token: string) =>
    api.post<PresignPropertyImageResponseDto>(`/v1/properties/${id}/images/presign`, data, token),

  confirmImage: (id: string, data: ConfirmPropertyImageDto, token: string) =>
    api.post<PropertyResponseDto>(`/v1/properties/${id}/images/confirm`, data, token),
};

// ============================================
// User-submitted properties
// ============================================
export const userPropertiesApi = {
  submit: (data: CreateUserPropertyDto, token: string) =>
    api.post<UserPropertyResponseDto>('/v1/user-properties', data, token),

  findAll: (
    params?: UserPropertyListQueryParams,
    token?: string
  ) => api.get<UserPropertiesListResponseDto>(`/v1/user-properties${toQueryString(params)}`, token),

  findMine: (token: string, params?: UserPropertyListQueryParams) =>
    api.get<UserPropertiesListResponseDto>(`/v1/user-properties/mine${toQueryString(params)}`, token),

  findOne: (id: string, token?: string) =>
    api.get<UserPropertyResponseDto>(`/v1/user-properties/${id}`, token),

  update: (id: string, data: UpdateUserPropertyDto, token: string) =>
    api.patch<UserPropertyResponseDto>(`/v1/user-properties/${id}`, data, token),

  presignImage: (id: string, data: PresignUserPropertyImageDto, token: string) =>
    api.post<PresignUserPropertyImageResponseDto>(`/v1/user-properties/${id}/images/presign`, data, token),

  confirmImage: (id: string, data: ConfirmUserPropertyImageDto, token: string) =>
    api.post<UserPropertyResponseDto>(`/v1/user-properties/${id}/images/confirm`, data, token),

  remove: (id: string, token: string) =>
    api.delete<void>(`/v1/user-properties/${id}`, token),

  hide: (id: string, token: string) =>
    api.patch<UserPropertyResponseDto>(`/v1/user-properties/${id}/hide`, {}, token),

  approve: (id: string, token: string) =>
    api.patch<UserPropertyResponseDto>(`/v1/user-properties/${id}/approve`, {}, token),

  reject: (id: string, data: RejectUserPropertyDto, token: string) =>
    api.patch<UserPropertyResponseDto>(`/v1/user-properties/${id}/reject`, data, token),

  // Admin review queue
  admin: {
    findAll: (
      params?: UserPropertyListQueryParams,
      token?: string
    ) => api.get<UserPropertiesListResponseDto>(`/v1/user-properties/admin${toQueryString(params)}`, token),

    findOne: (id: string, token: string) =>
      api.get<UserPropertyResponseDto>(`/v1/user-properties/admin/${id}`, token),
  },
};

// ============================================
// Payments
// ============================================
export const paymentApi = {
  initiateEsewa: (data: InitiatePaymentDto, token: string) =>
    api.post<EsewaInitiateResponseDto>('/v1/payments/esewa/initiate', data, token),
  initiateKhalti: (data: InitiatePaymentDto, token: string) =>
    api.post<KhaltiInitiateResponseDto>('/v1/payments/khalti/initiate', data, token),
  initiateConnectIps: (data: InitiatePaymentDto, token: string) =>
    api.post<ConnectIpsInitiateResponseDto>('/v1/payments/connectips/initiate', data, token),
};

// ============================================
// Reservations (Agent/Admin)
// ============================================
export const reservationsApi = {
  findAll: (
    params?: ReservationListQueryParams,
    token?: string
  ) => api.get<ReservationsListResponseDto>(`/v1/reservations${toQueryString(params)}`, token),

  findOne: (id: string, token: string) =>
    api.get<ReservationResponseDto>(`/v1/reservations/${id}`, token),

  cancel: (id: string, data: CancelReservationDto, token: string) =>
    api.patch<ReservationResponseDto>(`/v1/reservations/${id}/cancel`, data, token),
};

// ============================================
// Finance (Agent/Admin)
// ============================================
export const financeApi = {
  getSummary: (token: string) =>
    api.get<FinanceSummaryResponseDto>('/v1/finance/summary', token),

  findPayments: (
    params?: FinancePaymentsQueryParams,
    token?: string
  ) => api.get<FinancePaymentsListResponseDto>(`/v1/finance/payments${toQueryString(params)}`, token),
};

// ============================================
// System config (Admin only)
// ============================================
export const systemConfigApi = {
  get: (token: string) => api.get<SystemConfigResponseDto>('/v1/system-config', token),
  update: (data: UpdateSystemConfigDto, token: string) =>
    api.patch<SystemConfigResponseDto>('/v1/system-config', data, token),
};

// Re-exported for convenience since AgentResponseDto is used mostly
// alongside these agent-management flows (see lib/auth.ts -> authAdmin).
export type { AgentResponseDto };
