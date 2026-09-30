'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  CreditCard,
  FileCheck2,
  Home,
  LayoutDashboard,
  ListChecks,
  RefreshCw,
  Shield,
  Settings2,
  Ticket,
  Users,
} from 'lucide-react';

import WorkspaceShell from '@/components/admin/WorkspaceShell';
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
    <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[#2A2723]">{title}</h2>
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
  const [userPropertiesTotal, setUserPropertiesTotal] = useState(0);
  const [reservationsTotal, setReservationsTotal] = useState(0);
  const [financePaymentsTotal, setFinancePaymentsTotal] = useState(0);

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
  const userPropertySummary = useMemo(() => {
    const summary = {
      total: userProperties.length,
      pending: 0,
      approved: 0,
      rejected: 0,
      hidden: 0,
    };

    for (const property of userProperties) {
      const status = String(property.status).toUpperCase();
      if (status === 'PENDING_REVIEW') summary.pending += 1;
      else if (status === 'APPROVED') summary.approved += 1;
      else if (status === 'REJECTED') summary.rejected += 1;
      else if (status === 'HIDDEN') summary.hidden += 1;
    }

    return summary;
  }, [userProperties]);

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
      setUserPropertiesTotal(res.pagination?.total ?? res.items?.length ?? 0);
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
      setReservationsTotal(res.total ?? res.items?.length ?? 0);
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
      setFinancePaymentsTotal(payments.total ?? payments.items?.length ?? 0);
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
      { label: 'Marketplace listings', value: userPropertiesTotal },
      { label: 'Reservations', value: reservationsTotal },
      { label: 'Payments', value: financePaymentsTotal },
      { label: 'Collected', value: financeSummary ? money(financeSummary.totalCollectedAmount) : 'Rs. 0' },
    ],
    [financePaymentsTotal, financeSummary, reservationsTotal, userPropertiesTotal],
  );

  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-68px)] bg-white">
        <div className="mx-auto flex min-h-[calc(100vh-68px)] max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-stone-200 bg-white px-8 py-10 text-center shadow-sm">
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
          <div className="w-full max-w-lg rounded-[28px] border border-stone-200 bg-white p-8 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ca7653]">
              Admin access required
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-[#2A2723]">Sign in to continue</h1>
            <p className="mt-3 text-sm leading-7 text-slate-500">{authMessage}</p>
            <Link
              href="/auth/login"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[#3E4A3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#303c2f]"
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
      await systemConfigApi.update(
        {
          reservationFeeAmount: toOptionalNumber(String(configForm.reservationFeeAmount ?? '')),
          companyName: configForm.companyName?.trim() || undefined,
          companyEmail: configForm.companyEmail?.trim() || undefined,
          companyPhone: configForm.companyPhone?.trim() || undefined,
          companyAddress: configForm.companyAddress?.trim() || undefined,
        },
        token,
      );
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
    <WorkspaceShell title="Admin workspace" active={activeSection} items={sectionTabs} onSelect={(value) => setActiveSection(value as AdminSection)}>
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[28px] border border-stone-200/80 bg-white/85 p-6 shadow-sm backdrop-blur sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#ca7653]">
                Sunrise Realestate Admin
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#2A2723] sm:text-4xl">
                A clear view of your business.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                Manage your listings, support your agents, and keep every reservation moving.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/properties"
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#ca7653] hover:text-[#ca7653]"
              >
                Preview site
              </Link>
              <button
                type="button"
                onClick={handleFinanceRefresh}
                className="inline-flex items-center gap-2 rounded-full bg-[#3E4A3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#303c2f]"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh data
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {overviewStats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-stone-200 bg-[#f8f6f1] px-4 py-3">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {item.label}
                </p>
                <p className="mt-1 text-xl font-semibold text-[#2A2723]">{item.value}</p>
              </div>
            ))}
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
            <AdminOverview
              stats={overviewStats}
              summary={financeSummary}
              userProperties={userProperties}
              reservations={reservations}
              payments={financePayments}
              pendingReviews={userPropertySummary.pending}
              onOpenProperties={() => setActiveSection('properties')}
              onOpenMarketplace={() => setActiveSection('users')}
              onOpenReservations={() => setActiveSection('reservations')}
              onOpenFinance={() => setActiveSection('finance')}
            />
          ) : null}

          {activeSection === 'properties' ? (
            <Panel
              title="Company properties"
              description="Prepare, review, and publish your company listings."
            >
              <AdminPropertyStudio embedded />
            </Panel>
          ) : null}

          {activeSection === 'users' ? (
            <Panel
              title="User-submitted properties"
              description="Review property submissions before they appear in the marketplace."
              action={
                <button
                  type="button"
                  onClick={handleUserPropertyRefresh}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[#ca7653] hover:text-[#ca7653]"
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]"
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]"
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]"
                  />
                </Field>
                <Field label="City">
                  <input
                    value={userFilters.city ?? ''}
                    onChange={(event) =>
                      setUserFilters((current) => ({ ...current, city: event.target.value || undefined }))
                    }
                    placeholder="Kathmandu"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]"
                  />
                </Field>
                <Field label="Min price">
                  <input
                    value={userFilters.minPrice ?? ''}
                    onChange={(event) =>
                      setUserFilters((current) => ({ ...current, minPrice: toOptionalNumber(event.target.value) }))
                    }
                    placeholder="1000000"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]"
                  />
                </Field>
                <Field label="Max price">
                  <input
                    value={userFilters.maxPrice ?? ''}
                    onChange={(event) =>
                      setUserFilters((current) => ({ ...current, maxPrice: toOptionalNumber(event.target.value) }))
                    }
                    placeholder="20000000"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]"
                  />
                </Field>
              </div>

              <div className="mb-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => token && loadUsers(token, userFilters)}
                  className="rounded-full bg-[#3E4A3D] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#303c2f]"
                >
                  Apply filters
                </button>
              </div>

              {loadingUsers ? (
                <p className="text-sm text-slate-500">Loading user properties…</p>
              ) : (
                <div className="overflow-x-auto rounded-[24px] border border-stone-200">
                  <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
                    <thead className="bg-[#f8f6f1] text-[0.68rem] uppercase tracking-[0.16em] text-slate-400">
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
                            <p className="font-semibold text-[#2A2723]">{property.title}</p>
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
                              <button type="button" onClick={() => handleInspectUserProperty(property.id)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-[#ca7653] hover:text-[#ca7653]">Inspect</button>
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
                <div className="mt-6 rounded-[24px] border border-stone-200 bg-[#f8f6f1] p-5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">Selected listing</p>
                  <h3 className="mt-2 text-xl font-semibold text-[#2A2723]">{selectedUserProperty.title}</h3>
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
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[#ca7653] hover:text-[#ca7653]"
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]"
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]"
                  />
                </Field>
                <Field label="User ID">
                  <input
                    value={reservationFilters.userId ?? ''}
                    onChange={(event) =>
                      setReservationFilters((current) => ({ ...current, userId: event.target.value || undefined }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]"
                  />
                </Field>
                <div />
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => token && loadReservations(token, reservationFilters)}
                    className="w-full rounded-full bg-[#3E4A3D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#303c2f]"
                  >
                    Apply filters
                  </button>
                </div>
              </div>

              {loadingReservations ? (
                <p className="text-sm text-slate-500">Loading reservations…</p>
              ) : (
                <div className="overflow-x-auto rounded-[24px] border border-stone-200">
                  <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
                    <thead className="bg-[#f8f6f1] text-[0.68rem] uppercase tracking-[0.16em] text-slate-400">
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
                            <p className="font-semibold text-[#2A2723]">{reservation.property.title}</p>
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
                              <button type="button" onClick={() => handleInspectReservation(reservation.id)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-[#ca7653] hover:text-[#ca7653]">Inspect</button>
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
                <div className="mt-6 rounded-[24px] border border-stone-200 bg-[#f8f6f1] p-5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">Selected reservation</p>
                  <h3 className="mt-2 text-xl font-semibold text-[#2A2723]">{selectedReservation.property.title}</h3>
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
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[#ca7653] hover:text-[#ca7653]"
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]"
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]"
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]"
                  />
                </Field>
                <Field label="Date to">
                  <input
                    type="date"
                    value={paymentFilters.dateTo ?? ''}
                    onChange={(event) =>
                      setPaymentFilters((current) => ({ ...current, dateTo: event.target.value || undefined }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]"
                  />
                </Field>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => token && loadFinance(token, paymentFilters)}
                  className="rounded-full bg-[#3E4A3D] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#303c2f]"
                >
                  Apply filters
                </button>
              </div>

              {loadingFinance ? (
                <p className="mt-5 text-sm text-slate-500">Loading payments…</p>
              ) : (
                <div className="mt-5 overflow-x-auto rounded-[24px] border border-stone-200">
                  <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
                    <thead className="bg-[#f8f6f1] text-[0.68rem] uppercase tracking-[0.16em] text-slate-400">
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
                            <p className="font-semibold text-[#2A2723]">{payment.provider}</p>
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
                          <td className="px-4 py-4 font-semibold text-[#2A2723]">{money(payment.amount)}</td>
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
                <form onSubmit={handleAgentCreate} className="space-y-4 rounded-[24px] border border-stone-200 bg-[#f8f6f1] p-5 xl:col-span-2">
                  <h3 className="text-lg font-semibold text-[#2A2723]">Create agent</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name">
                      <input value={agentForm.fullName} onChange={(e) => setAgentForm((current) => ({ ...current, fullName: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]" required />
                    </Field>
                    <Field label="Email">
                      <input value={agentForm.email} type="email" onChange={(e) => setAgentForm((current) => ({ ...current, email: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]" required />
                    </Field>
                    <Field label="Phone">
                      <input value={agentForm.phoneNumber} onChange={(e) => setAgentForm((current) => ({ ...current, phoneNumber: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]" required />
                    </Field>
                    <Field label="Password">
                      <input value={agentForm.password} type="password" onChange={(e) => setAgentForm((current) => ({ ...current, password: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]" required />
                    </Field>
                  </div>
                  <div className="flex justify-end">
                    <button disabled={agentBusy} type="submit" className="inline-flex items-center gap-2 rounded-full bg-[#3E4A3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#303c2f] disabled:opacity-60">
                      {agentBusy ? 'Saving…' : 'Create agent'}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>

                <div className="space-y-4 rounded-[24px] border border-stone-200 bg-white p-5">
                  <h3 className="text-lg font-semibold text-[#2A2723]">Suspend / reactivate</h3>
                  <Field label="Agent ID to suspend">
                    <input value={suspendAgentId} onChange={(e) => setSuspendAgentId(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]" />
                  </Field>
                  <button disabled={agentBusy} type="button" onClick={handleSuspendAgent} className="w-full rounded-full bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60">
                    Suspend
                  </button>

                  <Field label="Agent ID to reactivate">
                    <input value={reactivateAgentId} onChange={(e) => setReactivateAgentId(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]" />
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
                      <input value={configForm.companyName ?? ''} onChange={(e) => setConfigForm((current) => ({ ...current, companyName: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]" />
                    </Field>
                    <Field label="Company email">
                      <input value={configForm.companyEmail ?? ''} onChange={(e) => setConfigForm((current) => ({ ...current, companyEmail: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]" />
                    </Field>
                    <Field label="Company phone">
                      <input value={configForm.companyPhone ?? ''} onChange={(e) => setConfigForm((current) => ({ ...current, companyPhone: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]" />
                    </Field>
                    <Field label="Reservation fee amount">
                      <input type="number" value={configForm.reservationFeeAmount ?? ''} onChange={(e) => setConfigForm((current) => ({ ...current, reservationFeeAmount: toOptionalNumber(e.target.value) }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]" />
                    </Field>
                  </div>
                  <Field label="Company address">
                    <textarea value={configForm.companyAddress ?? ''} onChange={(e) => setConfigForm((current) => ({ ...current, companyAddress: e.target.value }))} className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ca7653]" />
                  </Field>
                  <div className="flex justify-end">
                    <button disabled={configSaving} type="submit" className="rounded-full bg-[#3E4A3D] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#303c2f] disabled:opacity-60">
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
    </WorkspaceShell>
  );
}

function AdminOverview({
  stats,
  summary,
  userProperties,
  reservations,
  payments,
  pendingReviews,
  onOpenProperties,
  onOpenMarketplace,
  onOpenReservations,
  onOpenFinance,
}: {
  stats: Array<{ label: string; value: string | number }>;
  summary: FinanceSummaryResponseDto | null;
  userProperties: UserPropertyResponseDto[];
  reservations: ReservationResponseDto[];
  payments: FinancePaymentResponseDto[];
  pendingReviews: number;
  onOpenProperties: () => void;
  onOpenMarketplace: () => void;
  onOpenReservations: () => void;
  onOpenFinance: () => void;
}) {
  const reviewItems = userProperties.filter((item) => item.status === 'PENDING_REVIEW').slice(0, 4);
  const paymentStatuses = summary?.paymentsByStatus ?? [];
  const reservationStatuses = summary?.reservationsByStatus ?? [];
  const totalPayments = Math.max(summary?.paymentCount ?? 0, 1);
  const totalReservations = Math.max(summary?.reservationCount ?? 0, 1);

  return (
    <div className="space-y-5">
      <section className="rounded-[26px] border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ca7653]">Operations overview</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#2A2723]">Today&apos;s portfolio activity</h2>
            <p className="mt-1 text-sm text-slate-500">Live marketplace, payment, and reservation data from Sunrise.</p>
          </div>
          <button type="button" onClick={onOpenProperties} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3E4A3D] px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-[#303c2f]"><Home className="h-4 w-4" />Manage properties</button>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <OverviewStat icon={LayoutDashboard} label="Marketplace listings" value={stats[0].value} detail={`${pendingReviews} awaiting review`} tone="amber" />
          <OverviewStat icon={ListChecks} label="Reservations" value={stats[1].value} detail={`${summary?.reservationCount ?? 0} total records`} tone="sky" />
          <OverviewStat icon={CreditCard} label="Payment volume" value={stats[2].value} detail={`${summary?.successfulPaymentCount ?? 0} successful`} tone="violet" />
          <OverviewStat icon={CircleDollarSign} label="Collected" value={stats[3].value} detail={`${summary?.refundedPaymentCount ?? 0} refunded`} tone="green" />
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <ChartPanel title="Payments by status" subtitle="Distribution of all payment records" icon={CircleDollarSign}><DonutChart rows={paymentStatuses.map((item) => ({ label: item.status, value: item.count, tone: statusChartTone(item.status) }))} total={totalPayments} /><StatusLegend rows={paymentStatuses.map((item) => ({ label: item.status, value: item.count, amount: money(item.amount), tone: statusChartTone(item.status) }))} /></ChartPanel>
        <ChartPanel title="Payment providers" subtitle="Successful and pending volume by provider" icon={BarChart3}><ProviderBars rows={summary?.paymentsByProvider ?? []} /></ChartPanel>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.18fr_0.82fr]">
        <section className="rounded-[26px] border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><h3 className="text-lg font-semibold text-[#2A2723]">Marketplace review queue</h3><p className="mt-1 text-xs text-slate-500">Public submissions awaiting a decision.</p></div><button type="button" onClick={onOpenMarketplace} className="text-xs font-semibold text-[#ca7653] hover:text-[#b66545]">Open marketplace</button></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2"><QueueMetric label="Pending review" value={pendingReviews} icon={Clock3} /><QueueMetric label="Payments to verify" value={(summary?.paymentsByStatus ?? []).find((item) => item.status.toUpperCase() === 'PENDING')?.count ?? 0} icon={FileCheck2} /></div>
          <div className="mt-4 divide-y divide-stone-100 rounded-2xl border border-stone-100">{reviewItems.length ? reviewItems.map((item) => <button key={item.id} type="button" onClick={onOpenMarketplace} className="flex w-full items-center justify-between gap-4 px-3 py-3 text-left transition hover:bg-stone-50"><span className="min-w-0"><span className="block truncate text-sm font-semibold text-[#2A2723]">{item.title}</span><span className="mt-1 block truncate text-xs text-slate-500">{formatLocation(item) || 'Location pending'} · {money(item.price)}</span></span><ArrowRight className="h-4 w-4 shrink-0 text-[#ca7653]" /></button>) : <p className="px-3 py-8 text-center text-sm text-slate-500">No marketplace reviews are waiting.</p>}</div>
        </section>
        <section className="rounded-[26px] border border-stone-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start justify-between gap-4"><div><h3 className="text-lg font-semibold text-[#2A2723]">Reservation status</h3><p className="mt-1 text-xs text-slate-500">Reservation activity from finance reporting.</p></div><button type="button" onClick={onOpenReservations} className="text-xs font-semibold text-[#ca7653] hover:text-[#b66545]">View all</button></div><div className="mt-5"><ReservationBars rows={reservationStatuses} total={totalReservations} /></div></section>
      </div>

      <section className="overflow-hidden rounded-[26px] border border-stone-200 bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-stone-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h3 className="text-lg font-semibold text-[#2A2723]">Recent operations</h3><p className="mt-1 text-xs text-slate-500">Latest reservations and payments currently returned by the backend.</p></div><button type="button" onClick={onOpenFinance} className="inline-flex items-center gap-2 text-xs font-semibold text-[#ca7653]"><Activity className="h-4 w-4" />Open finance</button></div><div className="grid divide-y divide-stone-100 lg:grid-cols-2 lg:divide-x lg:divide-y-0"><RecentList title="Recent reservations" items={reservations.slice(0, 5).map((item) => ({ title: item.property.title, meta: `${item.userNameSnapshot} · ${money(item.reservationFeeAmount)}`, status: item.status }))} empty="No reservations found." /><RecentList title="Recent payments" items={payments.slice(0, 5).map((item) => ({ title: item.property.title, meta: `${item.provider} · ${money(item.amount)}`, status: item.status }))} empty="No payments found." /></div></section>
    </div>
  );
}

function OverviewStat({ icon: Icon, label, value, detail, tone }: { icon: typeof LayoutDashboard; label: string; value: string | number; detail: string; tone: 'amber' | 'sky' | 'violet' | 'green' }) { const colors = { amber: 'bg-amber-50 text-amber-700', sky: 'bg-sky-50 text-sky-700', violet: 'bg-violet-50 text-violet-700', green: 'bg-emerald-50 text-emerald-700' }; return <div className="rounded-2xl border border-stone-200 bg-[#fdfcfb] p-4"><span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${colors[tone]}`}><Icon className="h-4 w-4" /></span><p className="mt-4 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p><p className="mt-1 text-2xl font-semibold tracking-tight text-[#2A2723]">{value}</p><p className="mt-1 text-xs text-slate-500">{detail}</p></div>; }
function ChartPanel({ title, subtitle, icon: Icon, children }: { title: string; subtitle: string; icon: typeof BarChart3; children: ReactNode }) { return <section className="rounded-[26px] border border-stone-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-start gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f9eee9] text-[#ca7653]"><Icon className="h-4 w-4" /></span><div><h3 className="text-lg font-semibold text-[#2A2723]">{title}</h3><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div></div><div className="mt-5">{children}</div></section>; }
function statusChartTone(status: string): string { const value = status.toUpperCase(); if (value === 'SUCCEEDED' || value === 'COMPLETED') return '#14b87a'; if (value === 'PENDING') return '#f4b740'; if (value === 'FAILED' || value === 'CANCELLED') return '#ef6d76'; return '#818cf8'; }
function DonutChart({ rows, total }: { rows: Array<{ label: string; value: number; tone: string }>; total: number }) { const segments = rows.filter((item) => item.value > 0).reduce<{ running: number; values: string[] }>((result, item) => { const next = result.running + item.value / total * 100; return { running: next, values: [...result.values, `${item.tone} ${result.running}% ${next}%`] }; }, { running: 0, values: [] }).values; return <div className="flex flex-col items-center justify-center gap-5 sm:flex-row"><div className="grid h-36 w-36 place-items-center rounded-full" style={{ background: segments.length ? `conic-gradient(${segments.join(', ')})` : '#f1f5f9' }}><div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center"><strong className="text-2xl text-[#2A2723]">{total}</strong><span className="text-[0.62rem] uppercase tracking-[0.12em] text-slate-400">payments</span></div></div><div className="w-full space-y-2"><StatusLegend rows={rows.map((item) => ({ ...item, amount: String(item.value) }))} /></div></div>; }
function StatusLegend({ rows }: { rows: Array<{ label: string; value: number; amount: string; tone: string }> }) { return <div className="space-y-2">{rows.length ? rows.map((item) => <div key={item.label} className="flex items-center justify-between gap-3 text-xs"><span className="flex min-w-0 items-center gap-2"><i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.tone }} /><span className="truncate text-slate-600">{item.label}</span></span><span className="shrink-0 font-semibold text-[#2A2723]">{item.amount}</span></div>) : <p className="text-sm text-slate-500">No data available.</p>}</div>; }
function ProviderBars({ rows }: { rows: FinanceSummaryResponseDto['paymentsByProvider'] }) { const max = Math.max(...rows.map((item) => item.count), 1); return <div className="flex h-44 items-end justify-around gap-4 border-b border-stone-200 px-3 pt-5">{rows.length ? rows.map((item) => <div key={item.provider} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-semibold text-[#2A2723]">{item.count}</span><div className="w-full max-w-12 rounded-t-lg bg-[#5140d8] transition-all" style={{ height: `${Math.max(item.count / max * 100, 8)}%` }} title={`${item.provider}: ${money(item.amount)}`} /><span className="max-w-full truncate text-[0.6rem] font-semibold uppercase tracking-wide text-slate-500">{item.provider.replace('_', ' ')}</span></div>) : <p className="pb-16 text-sm text-slate-500">No provider data available.</p>}</div>; }
function QueueMetric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Clock3 }) { return <div className="flex items-center gap-3 rounded-xl bg-[#fbf7f3] px-3 py-3"><span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-[#ca7653]"><Icon className="h-4 w-4" /></span><span><strong className="block text-base text-[#2A2723]">{value}</strong><span className="text-xs text-slate-500">{label}</span></span></div>; }
function ReservationBars({ rows, total }: { rows: FinanceSummaryResponseDto['reservationsByStatus']; total: number }) { return <div className="space-y-4">{rows.length ? rows.map((item) => <div key={item.status}><div className="mb-1.5 flex items-center justify-between text-xs"><span className="font-medium text-slate-600">{item.status}</span><span className="font-semibold text-[#2A2723]">{item.count}</span></div><div className="h-2 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-sky-500" style={{ width: `${Math.min(item.count / total * 100, 100)}%` }} /></div></div>) : <p className="text-sm text-slate-500">No reservation data available.</p>}</div>; }
function RecentList({ title, items, empty }: { title: string; items: Array<{ title: string; meta: string; status: string }>; empty: string }) { return <div className="p-5 sm:p-6"><h4 className="text-sm font-semibold text-[#2A2723]">{title}</h4><div className="mt-3 divide-y divide-stone-100">{items.length ? items.map((item, index) => <div key={`${item.title}-${index}`} className="flex items-center justify-between gap-3 py-3"><span className="min-w-0"><span className="block truncate text-sm font-medium text-[#2A2723]">{item.title}</span><span className="block truncate text-xs text-slate-500">{item.meta}</span></span><span className={`shrink-0 rounded-full px-2 py-1 text-[0.62rem] font-semibold ${statusTone(item.status)}`}>{item.status}</span></div>) : <p className="py-6 text-sm text-slate-500">{empty}</p>}</div></div>; }

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#2A2723]">{value}</p>
    </div>
  );
}
