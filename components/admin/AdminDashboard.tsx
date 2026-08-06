'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  ArrowRight,
  CircleDollarSign,
  ClipboardList,
  RefreshCw,
  Shield,
  Settings2,
  Ticket,
  Users,
} from 'lucide-react';

import AdminPropertyStudio from '@/components/admin/AdminPropertyStudio';
import { auth, authAdmin, getAuthToken } from '@/lib/auth';
import { financeApi, reservationsApi, systemConfigApi, userPropertiesApi } from '@/lib/backend';
import {
  formatCurrency,
  formatLocation,
  getListingTypeLabel,
  getPropertyCategoryLabel,
  getPropertyStatusLabel,
} from '@/lib/properties';
import type {
  CreateAgentDto,
  FinancePaymentResponseDto,
  FinancePaymentsQueryParams,
  FinanceSummaryResponseDto,
  ReservationListQueryParams,
  ReservationResponseDto,
  SystemConfigResponseDto,
  UpdateSystemConfigDto,
  UserPropertyListQueryParams,
  UserPropertyResponseDto,
} from '@/types';

type AdminSection = 'overview' | 'properties' | 'users' | 'reservations' | 'finance' | 'agents' | 'settings';
type UserStatusFilter = 'all' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'HIDDEN';
type ReservationStatusFilter = 'all' | 'ACTIVE' | 'CLAIMED' | 'COMPLETED' | 'CANCELLED';

const sectionTabs: Array<{ value: AdminSection; label: string; icon: typeof ClipboardList }> = [
  { value: 'overview', label: 'Overview', icon: ClipboardList },
  { value: 'properties', label: 'Properties', icon: ClipboardList },
  { value: 'users', label: 'User Listings', icon: Users },
  { value: 'reservations', label: 'Reservations', icon: Ticket },
  { value: 'finance', label: 'Finance', icon: CircleDollarSign },
  { value: 'agents', label: 'Agents', icon: Shield },
  { value: 'settings', label: 'Settings', icon: Settings2 },
];

const emptyAgentForm: CreateAgentDto = {
  email: '',
  fullName: '',
  phoneNumber: '',
  password: '',
};

const emptyConfigForm: UpdateSystemConfigDto = {
  reservationFeeAmount: undefined,
  companyName: '',
  companyEmail: '',
  companyPhone: '',
  companyAddress: '',
};

function formatDate(value?: string | null): string {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not available';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function toOptionalNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function statusTone(status: string): string {
  const normalized = status.toUpperCase();
  if (normalized === 'APPROVED' || normalized === 'SUCCEEDED' || normalized === 'CLAIMED') {
    return 'bg-emerald-50 text-emerald-700';
  }
  if (normalized === 'PENDING_REVIEW' || normalized === 'PENDING') {
    return 'bg-amber-50 text-amber-700';
  }
  if (normalized === 'REJECTED' || normalized === 'FAILED' || normalized === 'CANCELLED') {
    return 'bg-rose-50 text-rose-700';
  }
  if (normalized === 'HIDDEN' || normalized === 'REFUNDED') {
    return 'bg-slate-100 text-slate-600';
  }
  return 'bg-sky-50 text-sky-700';
}

function money(value?: number | null): string {
  return formatCurrency(value ?? 0);
}

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-brand-sm sm:p-7">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-midnight">{title}</h2>
          {description ? <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-500">{description}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function AdminDashboard() {
  const [authLoading, setAuthLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [token, setToken] = useState('');
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');

  const [userProperties, setUserProperties] = useState<UserPropertyResponseDto[]>([]);
  const [reservations, setReservations] = useState<ReservationResponseDto[]>([]);
  const [financeSummary, setFinanceSummary] = useState<FinanceSummaryResponseDto | null>(null);
  const [financePayments, setFinancePayments] = useState<FinancePaymentResponseDto[]>([]);
  const [systemConfig, setSystemConfig] = useState<SystemConfigResponseDto | null>(null);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [loadingFinance, setLoadingFinance] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);

  const [userFilters, setUserFilters] = useState<UserPropertyListQueryParams>({
    page: 1,
    limit: 10,
  });
  const [reservationFilters, setReservationFilters] = useState<ReservationListQueryParams>({
    page: 1,
    limit: 10,
  });
  const [paymentFilters, setPaymentFilters] = useState<FinancePaymentsQueryParams>({
    page: 1,
    limit: 10,
  });

  const [selectedUserProperty, setSelectedUserProperty] = useState<UserPropertyResponseDto | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<ReservationResponseDto | null>(null);
  const [agentForm, setAgentForm] = useState<CreateAgentDto>(emptyAgentForm);
  const [suspendAgentId, setSuspendAgentId] = useState('');
  const [reactivateAgentId, setReactivateAgentId] = useState('');
  const [agentBusy, setAgentBusy] = useState(false);
  const [configForm, setConfigForm] = useState<UpdateSystemConfigDto>(emptyConfigForm);
  const [configSaving, setConfigSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const authToken = getAuthToken();

    if (!authToken) {
      queueMicrotask(() => {
        setAuthMessage('Please sign in to access the admin dashboard.');
        setAuthLoading(false);
      });
      return;
    }

    let mounted = true;

    const bootstrap = async () => {
      try {
        const user = await auth.me(authToken);
        if (!mounted) return;
        if (user.role !== 'ADMIN') {
          setAuthMessage('This account does not have admin access.');
          setAuthLoading(false);
          return;
        }

        setToken(authToken);
        await Promise.all([
          loadUsers(authToken, userFilters),
          loadReservations(authToken, reservationFilters),
          loadFinance(authToken, paymentFilters),
          loadConfig(authToken),
        ]);
      } catch (error) {
        if (!mounted) return;
        setAuthMessage((error as Error).message || 'Please sign in to access the admin dashboard.');
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadUsers(authToken: string, params: UserPropertyListQueryParams) {
    setLoadingUsers(true);
    try {
      const res = await userPropertiesApi.admin.findAll(params, authToken);
      setUserProperties(res.items ?? []);
    } catch (error) {
      setNotice({ kind: 'error', message: (error as Error).message || 'Unable to load user properties.' });
    } finally {
      setLoadingUsers(false);
    }
  }

  async function loadReservations(authToken: string, params: ReservationListQueryParams) {
    setLoadingReservations(true);
    try {
      const res = await reservationsApi.findAll(params, authToken);
      setReservations(res.items ?? []);
    } catch (error) {
      setNotice({ kind: 'error', message: (error as Error).message || 'Unable to load reservations.' });
    } finally {
      setLoadingReservations(false);
    }
  }

  async function loadFinance(authToken: string, params: FinancePaymentsQueryParams) {
    setLoadingFinance(true);
    try {
      const [summary, payments] = await Promise.all([
        financeApi.getSummary(authToken),
        financeApi.findPayments(params, authToken),
      ]);
      setFinanceSummary(summary);
      setFinancePayments(payments.items ?? []);
    } catch (error) {
      setNotice({ kind: 'error', message: (error as Error).message || 'Unable to load finance data.' });
    } finally {
      setLoadingFinance(false);
    }
  }

  async function loadConfig(authToken: string) {
    setLoadingConfig(true);
    try {
      const config = await systemConfigApi.get(authToken);
      setSystemConfig(config);
      setConfigForm({
        reservationFeeAmount: config.reservationFeeAmount,
        companyName: config.companyName,
        companyEmail: config.companyEmail,
        companyPhone: config.companyPhone ?? '',
        companyAddress: config.companyAddress ?? '',
      });
    } catch (error) {
      setNotice({ kind: 'error', message: (error as Error).message || 'Unable to load system config.' });
    } finally {
      setLoadingConfig(false);
    }
  }

  const overviewStats = useMemo(
    () => [
      { label: 'User listings', value: userProperties.length },
      { label: 'Reservations', value: reservations.length },
      { label: 'Payments', value: financePayments.length },
      { label: 'Collected', value: financeSummary ? money(financeSummary.totalCollectedAmount) : 'Rs. 0' },
    ],
    [financePayments.length, financeSummary, reservations.length, userProperties.length],
  );

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-68px)] bg-white">
        <div className="mx-auto flex min-h-[calc(100vh-68px)] max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-stone-200 bg-white px-8 py-10 text-center shadow-brand-sm">
            <p className="text-sm font-medium text-slate-500">Checking admin access…</p>
          </div>
        </div>
      </div>
    );
  }

  if (authMessage) {
    return (
      <div className="min-h-[calc(100vh-68px)] bg-white">
        <div className="mx-auto flex min-h-[calc(100vh-68px)] max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-lg rounded-[28px] border border-stone-200 bg-white p-8 text-center shadow-brand-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-primary">
              Admin access required
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-midnight">Sign in to continue</h1>
            <p className="mt-3 text-sm leading-7 text-slate-500">{authMessage}</p>
            <Link
              href="/auth/login"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Go to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleUserPropertyRefresh = async () => {
    if (!token) return;
    await loadUsers(token, userFilters);
  };

  const handleReservationRefresh = async () => {
    if (!token) return;
    await loadReservations(token, reservationFilters);
  };

  const handleFinanceRefresh = async () => {
    if (!token) return;
    await loadFinance(token, paymentFilters);
  };

  const handleConfigSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setConfigSaving(true);
    setNotice(null);
    try {
      const updated = await systemConfigApi.update(
        {
          reservationFeeAmount: toOptionalNumber(String(configForm.reservationFeeAmount ?? '')),
          companyName: configForm.companyName?.trim() || undefined,
          companyEmail: configForm.companyEmail?.trim() || undefined,
          companyPhone: configForm.companyPhone?.trim() || undefined,
          companyAddress: configForm.companyAddress?.trim() || undefined,
        },
        token,
      );
      setSystemConfig(updated);
      setNotice({ kind: 'success', message: 'System configuration updated.' });
    } catch (error) {
      setNotice({ kind: 'error', message: (error as Error).message || 'Unable to update system config.' });
    } finally {
      setConfigSaving(false);
    }
  };

  const handleAgentCreate = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setAgentBusy(true);
    setNotice(null);
    try {
      await authAdmin.createAgent(agentForm, token);
      setAgentForm(emptyAgentForm);
      setNotice({ kind: 'success', message: 'Agent account created.' });
    } catch (error) {
      setNotice({ kind: 'error', message: (error as Error).message || 'Unable to create agent.' });
    } finally {
      setAgentBusy(false);
    }
  };

  const handleSuspendAgent = async () => {
    if (!token || !suspendAgentId.trim()) return;
    setAgentBusy(true);
    setNotice(null);
    try {
      await authAdmin.suspendAgent(suspendAgentId.trim(), token);
      setNotice({ kind: 'success', message: 'Agent suspended.' });
      setSuspendAgentId('');
    } catch (error) {
      setNotice({ kind: 'error', message: (error as Error).message || 'Unable to suspend agent.' });
    } finally {
      setAgentBusy(false);
    }
  };

  const handleReactivateAgent = async () => {
    if (!token || !reactivateAgentId.trim()) return;
    setAgentBusy(true);
    setNotice(null);
    try {
      await authAdmin.reactivateAgent(reactivateAgentId.trim(), token);
      setNotice({ kind: 'success', message: 'Agent reactivated.' });
      setReactivateAgentId('');
    } catch (error) {
      setNotice({ kind: 'error', message: (error as Error).message || 'Unable to reactivate agent.' });
    } finally {
      setAgentBusy(false);
    }
  };

  const handleUserPropertyAction = async (
    action: 'approve' | 'hide' | 'delete' | 'reject',
    property: UserPropertyResponseDto,
  ) => {
    if (!token) return;
    setNotice(null);
    try {
      if (action === 'approve') {
        await userPropertiesApi.approve(property.id, token);
        setNotice({ kind: 'success', message: 'User property approved.' });
      } else if (action === 'hide') {
        await userPropertiesApi.hide(property.id, token);
        setNotice({ kind: 'success', message: 'User property hidden.' });
      } else if (action === 'delete') {
        if (!window.confirm('Delete this user property?')) return;
        await userPropertiesApi.remove(property.id, token);
        setNotice({ kind: 'success', message: 'User property deleted.' });
      } else {
        const rejectionReason = window.prompt('Enter a rejection reason');
        if (!rejectionReason?.trim()) return;
        await userPropertiesApi.reject(property.id, { rejectionReason: rejectionReason.trim() }, token);
        setNotice({ kind: 'success', message: 'User property rejected.' });
      }
      await handleUserPropertyRefresh();
    } catch (error) {
      setNotice({ kind: 'error', message: (error as Error).message || 'Unable to update user property.' });
    }
  };

  const handleReservationCancel = async (reservation: ReservationResponseDto) => {
    if (!token) return;
    const cancellationReason = window.prompt('Optional cancellation reason') ?? undefined;
    setNotice(null);
    try {
      await reservationsApi.cancel(reservation.id, { cancellationReason }, token);
      setNotice({ kind: 'success', message: 'Reservation cancelled.' });
      await handleReservationRefresh();
    } catch (error) {
      setNotice({ kind: 'error', message: (error as Error).message || 'Unable to cancel reservation.' });
    }
  };

  const handleInspectUserProperty = async (propertyId: string) => {
    if (!token) return;
    try {
      const detail = await userPropertiesApi.admin.findOne(propertyId, token);
      setSelectedUserProperty(detail);
    } catch (error) {
      setNotice({ kind: 'error', message: (error as Error).message || 'Unable to load user property.' });
    }
  };

  const handleInspectReservation = async (reservationId: string) => {
    if (!token) return;
    try {
      const detail = await reservationsApi.findOne(reservationId, token);
      setSelectedReservation(detail);
    } catch (error) {
      setNotice({ kind: 'error', message: (error as Error).message || 'Unable to load reservation.' });
    }
  };

  return (
    <div className="min-h-[calc(100vh-68px)] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-[28px] border border-stone-200/80 bg-white/85 p-6 shadow-brand-sm backdrop-blur sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-primary">
                Sunrise Realestate Admin
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-midnight sm:text-4xl">
                Manage the full backend from one place.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                This dashboard now mirrors the available admin endpoints for properties, user
                listings, reservations, finance, system configuration, and agent management.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/properties"
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-gold-primary hover:text-gold-primary"
              >
                Preview site
              </Link>
              <button
                type="button"
                onClick={handleFinanceRefresh}
                className="inline-flex items-center gap-2 rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh data
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {overviewStats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-1 text-xl font-semibold text-midnight">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {sectionTabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeSection === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveSection(tab.value)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                    active
                      ? 'bg-midnight text-white'
                      : 'border border-slate-200 bg-white text-slate-500 hover:border-gold-primary hover:text-gold-primary'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {notice ? (
          <div
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              notice.kind === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
          >
            {notice.message}
          </div>
        ) : null}

        <div className="space-y-8">
          {activeSection === 'overview' ? (
            <>
              <Panel
                title="Overview"
                description="Quick access to the main backend areas covered by the admin endpoints."
              >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <Metric label="Property drafts" value={String(userProperties.length)} />
                  <Metric label="Reservations" value={String(reservations.length)} />
                  <Metric label="Payments" value={String(financePayments.length)} />
                  <Metric label="Reservation fee" value={systemConfig ? money(systemConfig.reservationFeeAmount) : 'Loading…'} />
                </div>
              </Panel>
            </>
          ) : null}

          {activeSection === 'properties' ? (
            <Panel
              title="Company properties"
              description="Create property drafts, edit them, publish them, hide them, delete them, and attach images through presign/confirm."
            >
              <AdminPropertyStudio />
            </Panel>
          ) : null}

          {activeSection === 'users' ? (
            <Panel
              title="User-submitted properties"
              description="Review the community marketplace queue using the user-properties endpoints."
              action={
                <button
                  type="button"
                  onClick={handleUserPropertyRefresh}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-gold-primary hover:text-gold-primary"
                >
                  Refresh
                </button>
              }
            >
              <div className="mb-5 grid gap-3 md:grid-cols-6">
                <Field label="Status">
                  <select
                    value={String(userFilters.status ?? 'all')}
                    onChange={(event) =>
                      setUserFilters((current) => ({
                        ...current,
                        status: event.target.value === 'all' ? undefined : (event.target.value as UserStatusFilter),
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary"
                  >
                    {['all', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'HIDDEN'].map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Listing type">
                  <input
                    value={userFilters.listingType ?? ''}
                    onChange={(event) => {
                      const value = event.target.value.trim();
                      setUserFilters((current) => ({
                        ...current,
                        listingType: value ? (value as UserPropertyListQueryParams['listingType']) : undefined,
                      }));
                    }}
                    placeholder="SALE"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary"
                  />
                </Field>
                <Field label="Category">
                  <input
                    value={userFilters.category ?? ''}
                    onChange={(event) => {
                      const value = event.target.value.trim();
                      setUserFilters((current) => ({
                        ...current,
                        category: value ? (value as UserPropertyListQueryParams['category']) : undefined,
                      }));
                    }}
                    placeholder="APARTMENT"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary"
                  />
                </Field>
                <Field label="City">
                  <input
                    value={userFilters.city ?? ''}
                    onChange={(event) =>
                      setUserFilters((current) => ({ ...current, city: event.target.value || undefined }))
                    }
                    placeholder="Kathmandu"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary"
                  />
                </Field>
                <Field label="Min price">
                  <input
                    value={userFilters.minPrice ?? ''}
                    onChange={(event) =>
                      setUserFilters((current) => ({ ...current, minPrice: toOptionalNumber(event.target.value) }))
                    }
                    placeholder="1000000"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary"
                  />
                </Field>
                <Field label="Max price">
                  <input
                    value={userFilters.maxPrice ?? ''}
                    onChange={(event) =>
                      setUserFilters((current) => ({ ...current, maxPrice: toOptionalNumber(event.target.value) }))
                    }
                    placeholder="20000000"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary"
                  />
                </Field>
              </div>

              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => token && loadUsers(token, userFilters)}
                  className="rounded-full bg-midnight px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Apply filters
                </button>
              </div>

              {loadingUsers ? (
                <p className="text-sm text-slate-500">Loading user properties…</p>
              ) : (
                <div className="overflow-hidden rounded-[24px] border border-stone-200">
                  <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
                    <thead className="bg-stone-50 text-[0.68rem] uppercase tracking-[0.16em] text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Listing</th>
                        <th className="px-4 py-3">Owner</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 bg-white">
                      {userProperties.map((property) => (
                        <tr key={property.id}>
                          <td className="px-4 py-4">
                            <p className="font-semibold text-midnight">{property.title}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatLocation(property)} · {getPropertyCategoryLabel(property.category)} · {getListingTypeLabel(property.listingType)}
                            </p>
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            <p className="font-medium">{property.submittedBy.fullName}</p>
                            <p className="text-xs text-slate-500">{property.submittedBy.email}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(property.status)}`}>
                              {getPropertyStatusLabel(property.status)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={() => handleInspectUserProperty(property.id)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-gold-primary hover:text-gold-primary">Inspect</button>
                              <button type="button" onClick={() => handleUserPropertyAction('approve', property)} className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">Approve</button>
                              <button type="button" onClick={() => handleUserPropertyAction('reject', property)} className="rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white">Reject</button>
                              <button type="button" onClick={() => handleUserPropertyAction('hide', property)} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">Hide</button>
                              <button type="button" onClick={() => handleUserPropertyAction('delete', property)} className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedUserProperty ? (
                <div className="mt-6 rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">Selected listing</p>
                  <h3 className="mt-2 text-xl font-semibold text-midnight">{selectedUserProperty.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{selectedUserProperty.description}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MiniStat label="Price" value={money(selectedUserProperty.price)} />
                    <MiniStat label="Location" value={formatLocation(selectedUserProperty)} />
                    <MiniStat label="Status" value={getPropertyStatusLabel(selectedUserProperty.status)} />
                    <MiniStat label="Submitted by" value={selectedUserProperty.submittedBy.fullName} />
                  </div>
                </div>
              ) : null}
            </Panel>
          ) : null}

          {activeSection === 'reservations' ? (
            <Panel
              title="Reservations"
              description="Review and cancel reservations using the reservations endpoints."
              action={
                <button
                  type="button"
                  onClick={handleReservationRefresh}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-gold-primary hover:text-gold-primary"
                >
                  Refresh
                </button>
              }
            >
              <div className="mb-5 grid gap-3 md:grid-cols-5">
                <Field label="Status">
                  <select
                    value={String(reservationFilters.status ?? 'all')}
                    onChange={(event) =>
                      setReservationFilters((current) => ({
                        ...current,
                        status: event.target.value === 'all' ? undefined : (event.target.value as ReservationStatusFilter),
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary"
                  >
                    {['all', 'ACTIVE', 'CLAIMED', 'COMPLETED', 'CANCELLED'].map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Property ID">
                  <input
                    value={reservationFilters.propertyId ?? ''}
                    onChange={(event) =>
                      setReservationFilters((current) => ({ ...current, propertyId: event.target.value || undefined }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary"
                  />
                </Field>
                <Field label="User ID">
                  <input
                    value={reservationFilters.userId ?? ''}
                    onChange={(event) =>
                      setReservationFilters((current) => ({ ...current, userId: event.target.value || undefined }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary"
                  />
                </Field>
                <div />
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => token && loadReservations(token, reservationFilters)}
                    className="w-full rounded-full bg-midnight px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Apply filters
                  </button>
                </div>
              </div>

              {loadingReservations ? (
                <p className="text-sm text-slate-500">Loading reservations…</p>
              ) : (
                <div className="overflow-hidden rounded-[24px] border border-stone-200">
                  <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
                    <thead className="bg-stone-50 text-[0.68rem] uppercase tracking-[0.16em] text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Property</th>
                        <th className="px-4 py-3">Guest</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 bg-white">
                      {reservations.map((reservation) => (
                        <tr key={reservation.id}>
                          <td className="px-4 py-4">
                            <p className="font-semibold text-midnight">{reservation.property.title}</p>
                            <p className="mt-1 text-xs text-slate-500">{reservation.property.id}</p>
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            <p className="font-medium">{reservation.userNameSnapshot}</p>
                            <p className="text-xs text-slate-500">{reservation.userEmailSnapshot}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(reservation.status)}`}>
                              {reservation.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={() => handleInspectReservation(reservation.id)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-gold-primary hover:text-gold-primary">Inspect</button>
                              <button type="button" onClick={() => handleReservationCancel(reservation)} className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">Cancel</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedReservation ? (
                <div className="mt-6 rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">Selected reservation</p>
                  <h3 className="mt-2 text-xl font-semibold text-midnight">{selectedReservation.property.title}</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <MiniStat label="Status" value={selectedReservation.status} />
                    <MiniStat label="Guest" value={selectedReservation.userNameSnapshot} />
                    <MiniStat label="Fee" value={money(selectedReservation.reservationFeeAmount)} />
                    <MiniStat label="Created" value={formatDate(selectedReservation.createdAt)} />
                  </div>
                </div>
              ) : null}
            </Panel>
          ) : null}

          {activeSection === 'finance' ? (
            <Panel
              title="Finance"
              description="Inspect payment activity and high-level financial totals."
              action={
                <button
                  type="button"
                  onClick={handleFinanceRefresh}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-gold-primary hover:text-gold-primary"
                >
                  Refresh
                </button>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MiniStat label="Collected" value={financeSummary ? money(financeSummary.totalCollectedAmount) : 'Loading…'} />
                <MiniStat label="Refunded" value={financeSummary ? money(financeSummary.totalRefundedAmount) : 'Loading…'} />
                <MiniStat label="Pending" value={financeSummary ? money(financeSummary.pendingAmount) : 'Loading…'} />
                <MiniStat label="Payments" value={financeSummary ? String(financeSummary.paymentCount) : 'Loading…'} />
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-4">
                <Field label="Status">
                  <select
                    value={String(paymentFilters.status ?? 'all')}
                    onChange={(event) =>
                      setPaymentFilters((current) => ({ ...current, status: event.target.value === 'all' ? undefined : event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary"
                  >
                    {['all', 'PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED'].map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Provider">
                  <select
                    value={String(paymentFilters.provider ?? 'all')}
                    onChange={(event) =>
                      setPaymentFilters((current) => ({ ...current, provider: event.target.value === 'all' ? undefined : event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary"
                  >
                    {['all', 'ESEWA', 'KHALTI', 'CONNECT_IPS'].map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Date from">
                  <input
                    type="date"
                    value={paymentFilters.dateFrom ?? ''}
                    onChange={(event) =>
                      setPaymentFilters((current) => ({ ...current, dateFrom: event.target.value || undefined }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary"
                  />
                </Field>
                <Field label="Date to">
                  <input
                    type="date"
                    value={paymentFilters.dateTo ?? ''}
                    onChange={(event) =>
                      setPaymentFilters((current) => ({ ...current, dateTo: event.target.value || undefined }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary"
                  />
                </Field>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => token && loadFinance(token, paymentFilters)}
                  className="rounded-full bg-midnight px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Apply filters
                </button>
              </div>

              {loadingFinance ? (
                <p className="mt-5 text-sm text-slate-500">Loading payments…</p>
              ) : (
                <div className="mt-5 overflow-hidden rounded-[24px] border border-stone-200">
                  <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
                    <thead className="bg-stone-50 text-[0.68rem] uppercase tracking-[0.16em] text-slate-400">
                      <tr>
                        <th className="px-4 py-3">Payment</th>
                        <th className="px-4 py-3">Property</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 bg-white">
                      {financePayments.map((payment) => (
                        <tr key={payment.id}>
                          <td className="px-4 py-4">
                            <p className="font-semibold text-midnight">{payment.provider}</p>
                            <p className="mt-1 text-xs text-slate-500">{formatDate(payment.createdAt)}</p>
                          </td>
                          <td className="px-4 py-4 text-slate-600">
                            <p className="font-medium">{payment.property.title}</p>
                            <p className="text-xs text-slate-500">{payment.user.fullName}</p>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone(payment.status)}`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-semibold text-midnight">{money(payment.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>
          ) : null}

          {activeSection === 'agents' ? (
            <Panel
              title="Agents"
              description="Create agent accounts and manage suspend/reactivate operations by ID."
            >
              <div className="grid gap-6 xl:grid-cols-3">
                <form onSubmit={handleAgentCreate} className="space-y-4 rounded-[24px] border border-stone-200 bg-stone-50 p-5 xl:col-span-2">
                  <h3 className="text-lg font-semibold text-midnight">Create agent</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name">
                      <input value={agentForm.fullName} onChange={(e) => setAgentForm((current) => ({ ...current, fullName: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary" required />
                    </Field>
                    <Field label="Email">
                      <input value={agentForm.email} type="email" onChange={(e) => setAgentForm((current) => ({ ...current, email: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary" required />
                    </Field>
                    <Field label="Phone">
                      <input value={agentForm.phoneNumber} onChange={(e) => setAgentForm((current) => ({ ...current, phoneNumber: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary" required />
                    </Field>
                    <Field label="Password">
                      <input value={agentForm.password} type="password" onChange={(e) => setAgentForm((current) => ({ ...current, password: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary" required />
                    </Field>
                  </div>
                  <div className="flex justify-end">
                    <button disabled={agentBusy} type="submit" className="inline-flex items-center gap-2 rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
                      {agentBusy ? 'Saving…' : 'Create agent'}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>

                <div className="space-y-4 rounded-[24px] border border-stone-200 bg-white p-5">
                  <h3 className="text-lg font-semibold text-midnight">Suspend / reactivate</h3>
                  <Field label="Agent ID to suspend">
                    <input value={suspendAgentId} onChange={(e) => setSuspendAgentId(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary" />
                  </Field>
                  <button disabled={agentBusy} type="button" onClick={handleSuspendAgent} className="w-full rounded-full bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60">
                    Suspend
                  </button>

                  <Field label="Agent ID to reactivate">
                    <input value={reactivateAgentId} onChange={(e) => setReactivateAgentId(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary" />
                  </Field>
                  <button disabled={agentBusy} type="button" onClick={handleReactivateAgent} className="w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60">
                    Reactivate
                  </button>
                  <p className="text-xs leading-6 text-slate-500">
                    The backend currently exposes create, suspend, and reactivate agent endpoints, but not a list endpoint, so management is ID-based here.
                  </p>
                </div>
              </div>
            </Panel>
          ) : null}

          {activeSection === 'settings' ? (
            <Panel
              title="System settings"
              description="Read and update the live company settings used across reservations and the site footer."
            >
              {loadingConfig ? (
                <p className="text-sm text-slate-500">Loading system config…</p>
              ) : (
                <form onSubmit={handleConfigSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Company name">
                      <input value={configForm.companyName ?? ''} onChange={(e) => setConfigForm((current) => ({ ...current, companyName: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary" />
                    </Field>
                    <Field label="Company email">
                      <input value={configForm.companyEmail ?? ''} onChange={(e) => setConfigForm((current) => ({ ...current, companyEmail: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary" />
                    </Field>
                    <Field label="Company phone">
                      <input value={configForm.companyPhone ?? ''} onChange={(e) => setConfigForm((current) => ({ ...current, companyPhone: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary" />
                    </Field>
                    <Field label="Reservation fee amount">
                      <input type="number" value={configForm.reservationFeeAmount ?? ''} onChange={(e) => setConfigForm((current) => ({ ...current, reservationFeeAmount: toOptionalNumber(e.target.value) }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary" />
                    </Field>
                  </div>
                  <Field label="Company address">
                    <textarea value={configForm.companyAddress ?? ''} onChange={(e) => setConfigForm((current) => ({ ...current, companyAddress: e.target.value }))} className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary" />
                  </Field>
                  <div className="flex justify-end">
                    <button disabled={configSaving} type="submit" className="rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
                      {configSaving ? 'Saving…' : 'Save settings'}
                    </button>
                  </div>
                </form>
              )}
            </Panel>
          ) : null}

          <div className="pb-10" />
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-xl font-semibold text-midnight">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-midnight">{value}</p>
    </div>
  );
}
