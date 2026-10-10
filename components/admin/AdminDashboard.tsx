'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight, Building2, CalendarCheck, CreditCard, LayoutGrid, Settings, Store, Users } from 'lucide-react';

import WorkspaceShell from '@/components/admin/WorkspaceShell';
import AdminPropertyStudio from '@/components/admin/AdminPropertyStudio';
import MarketplaceModeration, { fetchMarketplaceCounts } from '@/components/admin/MarketplaceModeration';
import AdminOverview from '@/components/admin/AdminOverview';
import { describeActionError, StaffToast, type StaffNotice } from '@/components/admin/staff-ui';
import { useReasonPrompt, type InventoryActions } from '@/components/admin/PropertyInventory';
import { DashboardSkeleton, Skeleton, SkeletonStatus, TableSkeleton } from '@/components/ui/Skeleton';
import { auth, authAdmin, getAuthToken } from '@/lib/auth';
import { financeApi, propertiesApi, reservationsApi, systemConfigApi, userPropertiesApi } from '@/lib/backend';
import {
  formatCurrency,
} from '@/lib/properties';
import type {
  CreateAgentDto,
  FinancePaymentResponseDto,
  FinancePaymentsQueryParams,
  FinanceSummaryResponseDto,
  ReservationListQueryParams,
  PropertyResponseDto,
  ReservationResponseDto,
  UpdateSystemConfigDto,
  UserPropertyResponseDto,
} from '@/types';

type AdminSection = 'overview' | 'properties' | 'users' | 'reservations' | 'finance' | 'agents' | 'settings';
type ReservationStatusFilter = 'all' | 'ACTIVE' | 'CLAIMED' | 'COMPLETED' | 'CANCELLED';

const sectionTabs: Array<{ value: AdminSection; label: string; icon: typeof LayoutGrid }> = [
  { value: 'overview', label: 'Overview', icon: LayoutGrid },
  { value: 'properties', label: 'Properties', icon: Building2 },
  { value: 'reservations', label: 'Reservations', icon: CalendarCheck },
  { value: 'users', label: 'Marketplace Submissions', icon: Store },
  { value: 'finance', label: 'Payments', icon: CreditCard },
  { value: 'agents', label: 'Users & Agents', icon: Users },
  { value: 'settings', label: 'Settings', icon: Settings },
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
          <h2 className="text-2xl font-semibold text-[#2a2723]">{title}</h2>
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

  const [reservations, setReservations] = useState<ReservationResponseDto[]>([]);
  const [financeSummary, setFinanceSummary] = useState<FinanceSummaryResponseDto | null>(null);
  const [financePayments, setFinancePayments] = useState<FinancePaymentResponseDto[]>([]);
  const [reservationsTotal, setReservationsTotal] = useState(0);

  const [loadingReservations, setLoadingReservations] = useState(false);
  const [loadingFinance, setLoadingFinance] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);

  const [reservationFilters, setReservationFilters] = useState<ReservationListQueryParams>({
    page: 1,
    limit: 10,
  });
  const [paymentFilters, setPaymentFilters] = useState<FinancePaymentsQueryParams>({
    page: 1,
    limit: 10,
  });

  const [selectedReservation, setSelectedReservation] = useState<ReservationResponseDto | null>(null);
  const [agentForm, setAgentForm] = useState<CreateAgentDto>(emptyAgentForm);
  const [suspendAgentId, setSuspendAgentId] = useState('');
  const [reactivateAgentId, setReactivateAgentId] = useState('');
  const [agentBusy, setAgentBusy] = useState(false);
  const [configForm, setConfigForm] = useState<UpdateSystemConfigDto>(emptyConfigForm);
  const [configSaving, setConfigSaving] = useState(false);
  const [notice, setNotice] = useState<StaffNotice | null>(null);
  const [companyProperties, setCompanyProperties] = useState<PropertyResponseDto[] | null>(null);
  const [pendingQueue, setPendingQueue] = useState<UserPropertyResponseDto[] | null>(null);
  const [propertyBusyId, setPropertyBusyId] = useState<string | null>(null);
  const reasonPrompt = useReasonPrompt();
  const [studioStart, setStudioStart] = useState<'inventory' | 'create'>('inventory');
  const [reviewListing, setReviewListing] = useState<UserPropertyResponseDto | null>(null);
  const [marketplaceCounts, setMarketplaceCounts] = useState<Awaited<ReturnType<typeof fetchMarketplaceCounts>> | null>(null);

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
          loadReservations(authToken, reservationFilters),
          loadFinance(authToken, paymentFilters),
          loadConfig(authToken),
          fetchMarketplaceCounts(authToken).then(setMarketplaceCounts).catch(() => undefined),
          propertiesApi.findAll({ page: 1, limit: 100 }, authToken).then((result) => setCompanyProperties(result.items ?? [])).catch(() => setCompanyProperties([])),
          userPropertiesApi.admin.findAll({ status: 'PENDING_REVIEW', page: 1, limit: 3 }, authToken).then((result) => setPendingQueue(result.items ?? [])).catch(() => setPendingQueue([])),
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


  async function loadReservations(authToken: string, params: ReservationListQueryParams) {
    setLoadingReservations(true);
    try {
      const res = await reservationsApi.findAll(params, authToken);
      setReservations(res.items ?? []);
      setReservationsTotal(res.total ?? res.items?.length ?? 0);
    } catch (error) {
      setNotice(describeActionError(error, 'load reservations', 'admin'));
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
      setNotice(describeActionError(error, 'load payments', 'admin'));
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
      setNotice(describeActionError(error, 'load system settings', 'admin'));
    } finally {
      setLoadingConfig(false);
    }
  }


  if (authLoading) {
    return <DashboardSkeleton label="Checking admin access" />;
  }

  if (authMessage) {
    return (
      <div className="min-h-[calc(100vh-68px)] bg-white">
        <div className="mx-auto flex min-h-[calc(100vh-68px)] max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-lg rounded-[28px] border border-stone-200 bg-white p-8 text-center shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#cc7654]">
              Admin access required
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-[#2a2723]">Sign in to continue</h1>
            <p className="mt-3 text-sm leading-7 text-slate-500">{authMessage}</p>
            <Link
              href="/auth/login"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[#3e4a3d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#303c2f]"
            >
              Go to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
      setNotice(describeActionError(error, 'save system settings', 'admin'));
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
      setNotice(describeActionError(error, 'create this agent', 'admin'));
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
      setNotice(describeActionError(error, 'suspend this agent', 'admin'));
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
      setNotice(describeActionError(error, 'reactivate this agent', 'admin'));
    } finally {
      setAgentBusy(false);
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
      setNotice(describeActionError(error, 'cancel this reservation', 'admin'));
    }
  };


  const handleInspectReservation = async (reservationId: string) => {
    if (!token) return;
    try {
      const detail = await reservationsApi.findOne(reservationId, token);
      setSelectedReservation(detail);
    } catch (error) {
      setNotice(describeActionError(error, 'open this reservation', 'admin'));
    }
  };

  const updateCompanyProperty = async (property: PropertyResponseDto, change: 'publish' | 'hide' | 'suspend' | 'reactivate') => {
    if (!token) return;
    const reason = change === 'suspend' || change === 'reactivate'
      ? await reasonPrompt.ask(change === 'suspend' ? `Suspend “${property.title}”?` : `Restore “${property.title}”?`, change === 'suspend' ? 'Suspend listing' : 'Restore listing', change === 'suspend')
      : '';
    if (reason === null) return;
    setPropertyBusyId(property.id);
    try {
      const updated = change === 'publish' ? await propertiesApi.publish(property.id, token)
        : change === 'hide' ? await propertiesApi.hide(property.id, token)
          : change === 'suspend' ? await propertiesApi.suspend(property.id, reason, token)
            : await propertiesApi.reactivate(property.id, reason, token);
      setCompanyProperties((current) => current?.map((item) => (item.id === updated.id ? updated : item)) ?? null);
      setNotice({ kind: 'success', message: { publish: 'Property is live.', hide: 'Property hidden.', suspend: 'Property suspended.', reactivate: 'Property restored.' }[change] });
    } catch (error) {
      setNotice(describeActionError(error, `${{ publish: 'publish', hide: 'hide', suspend: 'suspend', reactivate: 'restore' }[change]} this listing`, 'admin'));
    } finally {
      setPropertyBusyId(null);
    }
  };

  const overviewActions: InventoryActions = {
    busyId: propertyBusyId,
    onEdit: () => setActiveSection('properties'),
    onDelete: () => setActiveSection('properties'),
    onPublish: (property) => void updateCompanyProperty(property, 'publish'),
    onHide: (property) => void updateCompanyProperty(property, 'hide'),
    onSuspend: (property) => void updateCompanyProperty(property, 'suspend'),
    onReactivate: (property) => void updateCompanyProperty(property, 'reactivate'),
    loadModerationLog: (id) => propertiesApi.moderationLog(id, token),
  };

  return (
    <WorkspaceShell title="Admin workspace" active={activeSection} items={sectionTabs.map((tab) => tab.value === 'users' ? { ...tab, badge: marketplaceCounts?.PENDING_REVIEW || undefined } : tab)} onSelect={(value) => { setStudioStart('inventory'); setReviewListing(null); setActiveSection(value as AdminSection); }}>
      <div className="mx-auto max-w-[1180px]">

        <StaffToast notice={notice} onClose={() => setNotice(null)} />

        <div className="space-y-8">
          {activeSection === 'overview' ? (
            <AdminOverview
              companyProperties={companyProperties}
              reservations={reservations}
              reservationsTotal={reservationsTotal}
              summary={financeSummary}
              payments={financePayments}
              counts={marketplaceCounts}
              pendingQueue={pendingQueue}
              actions={overviewActions}
              onNavigate={(section) => setActiveSection(section)}
              onReview={(listing) => { setReviewListing(listing); setActiveSection('users'); }}
              onAddProperty={() => { setStudioStart('create'); setActiveSection('properties'); }}
            />
          ) : null}

          {activeSection === 'properties' ? (
            <AdminPropertyStudio key={studioStart} embedded initialView={studioStart} />
          ) : null}

          {activeSection === 'users' ? (
            <MarketplaceModeration key={reviewListing?.id ?? 'queue'} token={token} onNotice={setNotice} onCountsChange={setMarketplaceCounts} initialListing={reviewListing} />
          ) : null}

          {activeSection === 'reservations' ? (
            <Panel
              title="Reservations"
              description="Review and cancel reservations using the reservations endpoints."
              action={
                <button
                  type="button"
                  onClick={handleReservationRefresh}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[#cc7654] hover:text-[#cc7654]"
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]"
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]"
                  />
                </Field>
                <Field label="User ID">
                  <input
                    value={reservationFilters.userId ?? ''}
                    onChange={(event) =>
                      setReservationFilters((current) => ({ ...current, userId: event.target.value || undefined }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]"
                  />
                </Field>
                <div />
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => token && loadReservations(token, reservationFilters)}
                    className="w-full rounded-full bg-[#3e4a3d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#303c2f]"
                  >
                    Apply filters
                  </button>
                </div>
              </div>

              {loadingReservations ? (
                <TableSkeleton label="Loading reservations" />
              ) : (
                <div className="overflow-x-auto rounded-[24px] border border-stone-200">
                  <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
                    <thead className="bg-[#f7f5f1] text-[0.68rem] uppercase tracking-[0.16em] text-slate-400">
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
                            <p className="font-semibold text-[#2a2723]">{reservation.property.title}</p>
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
                              <button type="button" onClick={() => handleInspectReservation(reservation.id)} className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-[#cc7654] hover:text-[#cc7654]">Inspect</button>
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
                <div className="mt-6 rounded-[24px] border border-stone-200 bg-[#f7f5f1] p-5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">Selected reservation</p>
                  <h3 className="mt-2 text-xl font-semibold text-[#2a2723]">{selectedReservation.property.title}</h3>
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
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[#cc7654] hover:text-[#cc7654]"
                >
                  Refresh
                </button>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <MiniStat label="Collected" value={financeSummary ? money(financeSummary.totalCollectedAmount) : <Skeleton className="mt-1 h-5 w-24" />} />
                <MiniStat label="Refunded" value={financeSummary ? money(financeSummary.totalRefundedAmount) : <Skeleton className="mt-1 h-5 w-24" />} />
                <MiniStat label="Pending" value={financeSummary ? money(financeSummary.pendingAmount) : <Skeleton className="mt-1 h-5 w-24" />} />
                <MiniStat label="Payments" value={financeSummary ? String(financeSummary.paymentCount) : <Skeleton className="mt-1 h-5 w-24" />} />
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-4">
                <Field label="Status">
                  <select
                    value={String(paymentFilters.status ?? 'all')}
                    onChange={(event) =>
                      setPaymentFilters((current) => ({ ...current, status: event.target.value === 'all' ? undefined : event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]"
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]"
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]"
                  />
                </Field>
                <Field label="Date to">
                  <input
                    type="date"
                    value={paymentFilters.dateTo ?? ''}
                    onChange={(event) =>
                      setPaymentFilters((current) => ({ ...current, dateTo: event.target.value || undefined }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]"
                  />
                </Field>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => token && loadFinance(token, paymentFilters)}
                  className="rounded-full bg-[#3e4a3d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#303c2f]"
                >
                  Apply filters
                </button>
              </div>

              {loadingFinance ? (
                <div className="mt-5"><TableSkeleton label="Loading payments" /></div>
              ) : (
                <div className="mt-5 overflow-x-auto rounded-[24px] border border-stone-200">
                  <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
                    <thead className="bg-[#f7f5f1] text-[0.68rem] uppercase tracking-[0.16em] text-slate-400">
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
                            <p className="font-semibold text-[#2a2723]">{payment.provider}</p>
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
                          <td className="px-4 py-4 font-semibold text-[#2a2723]">{money(payment.amount)}</td>
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
                <form onSubmit={handleAgentCreate} className="space-y-4 rounded-[24px] border border-stone-200 bg-[#f7f5f1] p-5 xl:col-span-2">
                  <h3 className="text-lg font-semibold text-[#2a2723]">Create agent</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full name">
                      <input value={agentForm.fullName} onChange={(e) => setAgentForm((current) => ({ ...current, fullName: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]" required />
                    </Field>
                    <Field label="Email">
                      <input value={agentForm.email} type="email" onChange={(e) => setAgentForm((current) => ({ ...current, email: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]" required />
                    </Field>
                    <Field label="Phone">
                      <input value={agentForm.phoneNumber} onChange={(e) => setAgentForm((current) => ({ ...current, phoneNumber: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]" required />
                    </Field>
                    <Field label="Password">
                      <input value={agentForm.password} type="password" onChange={(e) => setAgentForm((current) => ({ ...current, password: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]" required />
                    </Field>
                  </div>
                  <div className="flex justify-end">
                    <button disabled={agentBusy} type="submit" className="inline-flex items-center gap-2 rounded-full bg-[#3e4a3d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#303c2f] disabled:opacity-60">
                      {agentBusy ? 'Saving…' : 'Create agent'}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </form>

                <div className="space-y-4 rounded-[24px] border border-stone-200 bg-white p-5">
                  <h3 className="text-lg font-semibold text-[#2a2723]">Suspend / reactivate</h3>
                  <Field label="Agent ID to suspend">
                    <input value={suspendAgentId} onChange={(e) => setSuspendAgentId(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]" />
                  </Field>
                  <button disabled={agentBusy} type="button" onClick={handleSuspendAgent} className="w-full rounded-full bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60">
                    Suspend
                  </button>

                  <Field label="Agent ID to reactivate">
                    <input value={reactivateAgentId} onChange={(e) => setReactivateAgentId(e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]" />
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
                <SkeletonStatus label="Loading system config" className="grid gap-4 sm:grid-cols-2">{Array.from({ length: 6 }, (_, index) => <div key={index}><Skeleton className="h-3 w-24" /><Skeleton className="mt-2 h-11 rounded-xl" /></div>)}</SkeletonStatus>
              ) : (
                <form onSubmit={handleConfigSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Company name">
                      <input value={configForm.companyName ?? ''} onChange={(e) => setConfigForm((current) => ({ ...current, companyName: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]" />
                    </Field>
                    <Field label="Company email">
                      <input value={configForm.companyEmail ?? ''} onChange={(e) => setConfigForm((current) => ({ ...current, companyEmail: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]" />
                    </Field>
                    <Field label="Company phone">
                      <input value={configForm.companyPhone ?? ''} onChange={(e) => setConfigForm((current) => ({ ...current, companyPhone: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]" />
                    </Field>
                    <Field label="Reservation fee amount">
                      <input type="number" value={configForm.reservationFeeAmount ?? ''} onChange={(e) => setConfigForm((current) => ({ ...current, reservationFeeAmount: toOptionalNumber(e.target.value) }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]" />
                    </Field>
                  </div>
                  <Field label="Company address">
                    <textarea value={configForm.companyAddress ?? ''} onChange={(e) => setConfigForm((current) => ({ ...current, companyAddress: e.target.value }))} className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]" />
                  </Field>
                  <div className="flex justify-end">
                    <button disabled={configSaving} type="submit" className="rounded-full bg-[#3e4a3d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#303c2f] disabled:opacity-60">
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
      {reasonPrompt.dialog}
    </WorkspaceShell>
  );
}

function MiniStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <div className="mt-1 text-sm font-semibold text-[#2a2723]">{value}</div>
    </div>
  );
}
