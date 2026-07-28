'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';

import { propertiesApi } from '@/lib/backend';
import {
  formatArea,
  formatCurrency,
  formatLocation,
  getListingTypeLabel,
  getPrimaryImage,
  getPropertyStatusLabel,
} from '@/lib/properties';
import type {
  AreaUnit,
  CreatePropertyDto,
  ListingType,
  PropertyCategory,
  PropertyResponseDto,
  UpdatePropertyDto,
} from '@/types';

type AdminMode = 'create' | 'edit';
type StatusFilter = 'all' | 'draft' | 'active' | 'hidden' | 'reserved' | 'completed';

interface PropertyFormState {
  title: string;
  description: string;
  price: string;
  listingType: ListingType;
  category: PropertyCategory;
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  areaSize: string;
  areaUnit: AreaUnit;
  latitude: string;
  longitude: string;
  reservationFeeOverride: string;
}

const CATEGORY_OPTIONS: Array<{ value: PropertyCategory; label: string }> = [
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'land', label: 'Land' },
  { value: 'commercial', label: 'Commercial' },
];

const LISTING_OPTIONS: Array<{ value: ListingType; label: string }> = [
  { value: 'sale', label: 'For Sale' },
  { value: 'rent', label: 'For Rent' },
];

const AREA_OPTIONS: Array<{ value: AreaUnit; label: string }> = [
  { value: 'sqft', label: 'Sq ft' },
  { value: 'sqm', label: 'Sq m' },
  { value: 'aana', label: 'Aana' },
  { value: 'ropani', label: 'Ropani' },
];

const STATUS_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Live' },
  { value: 'draft', label: 'Draft' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'hidden', label: 'Hidden' },
];

const ADMIN_BYPASS = true;

const EMPTY_FORM: PropertyFormState = {
  title: '',
  description: '',
  price: '',
  listingType: 'sale',
  category: 'house',
  street: '',
  city: '',
  state: '',
  country: 'Nepal',
  postalCode: '',
  areaSize: '',
  areaUnit: 'sqft',
  latitude: '',
  longitude: '',
  reservationFeeOverride: '',
};

function normalizeText(value: string): string {
  return value.trim();
}

function parseOptionalNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formFromProperty(property: PropertyResponseDto): PropertyFormState {
  return {
    title: property.title ?? '',
    description: property.description ?? '',
    price: String(property.price ?? ''),
    listingType: property.listingType,
    category: property.category,
    street: property.street ?? '',
    city: property.city ?? '',
    state: property.state ?? '',
    country: property.country ?? '',
    postalCode: property.postalCode ?? '',
    areaSize: property.areaSize != null ? String(property.areaSize) : '',
    areaUnit: property.areaUnit ?? 'sqft',
    latitude: property.latitude != null ? String(property.latitude) : '',
    longitude: property.longitude != null ? String(property.longitude) : '',
    reservationFeeOverride:
      property.reservationFeeOverride != null
        ? String(property.reservationFeeOverride)
        : '',
  };
}

function buildPropertyPayload(form: PropertyFormState): CreatePropertyDto | UpdatePropertyDto {
  return {
    title: normalizeText(form.title),
    description: normalizeText(form.description),
    price: Number(form.price),
    listingType: form.listingType,
    category: form.category,
    street: normalizeText(form.street) || undefined,
    city: normalizeText(form.city),
    state: normalizeText(form.state),
    country: normalizeText(form.country),
    postalCode: normalizeText(form.postalCode) || undefined,
    areaSize: parseOptionalNumber(form.areaSize),
    areaUnit: form.areaSize.trim() ? form.areaUnit : undefined,
    latitude: parseOptionalNumber(form.latitude),
    longitude: parseOptionalNumber(form.longitude),
    reservationFeeOverride: parseOptionalNumber(form.reservationFeeOverride),
  };
}

function statusValue(status: string): Exclude<StatusFilter, 'all'> | null {
  const normalized = status.toLowerCase();

  if (
    normalized === 'draft' ||
    normalized === 'active' ||
    normalized === 'hidden' ||
    normalized === 'reserved' ||
    normalized === 'completed'
  ) {
    return normalized;
  }

  return null;
}

function statusClass(status: string): string {
  const normalized = status.toLowerCase();

  if (normalized === 'active') return 'bg-emerald-50 text-emerald-700';
  if (normalized === 'draft') return 'bg-slate-100 text-slate-500';
  if (normalized === 'reserved') return 'bg-amber-50 text-amber-700';
  if (normalized === 'hidden') return 'bg-slate-100 text-slate-500';
  if (normalized === 'completed') return 'bg-sky-50 text-sky-700';

  return 'bg-slate-100 text-slate-500';
}

function categoryClass(category: string): string {
  const normalized = category.toLowerCase();
  if (normalized.includes('land')) return 'bg-emerald-50 text-emerald-700';
  if (normalized.includes('apartment')) return 'bg-sky-50 text-sky-700';
  return 'bg-midnight/5 text-midnight';
}

function createDemoProperty(
  form: PropertyFormState,
  existing?: PropertyResponseDto,
): PropertyResponseDto {
  const now = new Date().toISOString();
  const id = existing?.id ?? crypto.randomUUID();

  return {
    id,
    title: normalizeText(form.title),
    description: normalizeText(form.description),
    price: Number(form.price),
    listingType: form.listingType,
    category: form.category,
    status: existing?.status ?? 'ACTIVE',
    outcome: existing?.outcome,
    areaSize: parseOptionalNumber(form.areaSize),
    areaUnit: form.areaSize.trim() ? form.areaUnit : undefined,
    street: normalizeText(form.street) || undefined,
    city: normalizeText(form.city),
    state: normalizeText(form.state),
    country: normalizeText(form.country),
    postalCode: normalizeText(form.postalCode) || undefined,
    latitude: parseOptionalNumber(form.latitude),
    longitude: parseOptionalNumber(form.longitude),
    reservationFeeOverride: parseOptionalNumber(form.reservationFeeOverride),
    createdByAgentId: existing?.createdByAgentId ?? 'demo-admin',
    images: existing?.images ?? [],
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
}

export default function AdminPropertyStudio() {
  const [properties, setProperties] = useState<PropertyResponseDto[]>([]);
  const token = '';
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [mode, setMode] = useState<AdminMode>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PropertyFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; message: string } | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<PropertyResponseDto | null>(null);

  async function refreshProperties(tokenValue: string) {
    setLoadingProperties(true);

    try {
      const res = await propertiesApi.findAll({ page: 1, limit: 100 }, tokenValue);
      setProperties(Array.isArray(res.items) ? res.items : []);
    } catch (error) {
      setNotice({
        kind: 'error',
        message: (error as Error).message || 'Unable to load properties.',
      });
    } finally {
      setLoadingProperties(false);
    }
  }

  useEffect(() => {
    void refreshProperties('');
  }, []);

  const filteredProperties = useMemo(() => {
    const term = search.trim().toLowerCase();

    return properties.filter((property) => {
      const statusMatches =
        statusFilter === 'all' || statusValue(property.status) === statusFilter;

      const searchMatches =
        term.length === 0 ||
        [
          property.title,
          formatLocation(property),
          property.category,
          property.listingType,
          property.status,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(term);

      return statusMatches && searchMatches;
    });
  }, [properties, search, statusFilter]);

  const stats = useMemo(() => {
    return properties.reduce(
      (acc, property) => {
      acc.total += 1;
        const currentStatus = statusValue(property.status);
        if (currentStatus) {
          acc[currentStatus] += 1;
        }
        return acc;
      },
      {
        total: 0,
        draft: 0,
        active: 0,
        hidden: 0,
        reserved: 0,
        completed: 0,
      },
    );
  }, [properties]);

  const isEditing = mode === 'edit' && editingId !== null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setNotice(null);

    const payload = buildPropertyPayload(form);

    if (!payload.title || !payload.description || !payload.city || !payload.state || !payload.country) {
      setNotice({ kind: 'error', message: 'Please complete the required property fields.' });
      return;
    }

    if (!Number.isFinite(Number(form.price))) {
      setNotice({ kind: 'error', message: 'Enter a valid property price.' });
      return;
    }

    setSaving(true);

    try {
      if (ADMIN_BYPASS) {
        if (isEditing && editingId) {
          setProperties((current) =>
            current.map((property) =>
              property.id === editingId ? createDemoProperty(form, property) : property,
            ),
          );
          setNotice({ kind: 'success', message: 'Demo property updated locally.' });
        } else {
          setProperties((current) => [createDemoProperty(form), ...current]);
          setNotice({ kind: 'success', message: 'Demo property created locally.' });
        }
      } else if (isEditing && editingId) {
        const updated = await propertiesApi.update(editingId, payload as UpdatePropertyDto, token);
        setProperties((current) =>
          current.map((property) => (property.id === updated.id ? updated : property)),
        );
        setNotice({ kind: 'success', message: 'Property updated successfully.' });
      } else {
        const created = await propertiesApi.create(payload as CreatePropertyDto, token);
        setProperties((current) => [created, ...current]);
        setNotice({ kind: 'success', message: 'Property created and saved.' });
      }

      setMode('create');
      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch (error) {
      setNotice({
        kind: 'error',
        message: (error as Error).message || 'Unable to save property.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (property: PropertyResponseDto) => {
    setMode('edit');
    setEditingId(property.id);
    setForm(formFromProperty(property));
    setNotice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setMode('create');
    setEditingId(null);
    setForm(EMPTY_FORM);
    setNotice(null);
  };

  const handlePublish = async (property: PropertyResponseDto) => {
    setBusyId(property.id);

    try {
      if (ADMIN_BYPASS) {
        setProperties((current) =>
          current.map((item) =>
            item.id === property.id ? { ...item, status: 'ACTIVE', updatedAt: new Date().toISOString() } : item,
          ),
        );
        setNotice({ kind: 'success', message: 'Demo property marked as live.' });
      } else {
        const updated = await propertiesApi.publish(property.id, token ?? '');
        setProperties((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
      }
    } catch (error) {
      setNotice({
        kind: 'error',
        message: (error as Error).message || 'Unable to publish property.',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleHide = async (property: PropertyResponseDto) => {
    setBusyId(property.id);

    try {
      if (ADMIN_BYPASS) {
        setProperties((current) =>
          current.map((item) =>
            item.id === property.id ? { ...item, status: 'HIDDEN', updatedAt: new Date().toISOString() } : item,
          ),
        );
        setNotice({ kind: 'success', message: 'Demo property hidden locally.' });
      } else {
        const updated = await propertiesApi.hide(property.id, token ?? '');
        setProperties((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
      }
    } catch (error) {
      setNotice({
        kind: 'error',
        message: (error as Error).message || 'Unable to hide property.',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);

    try {
      if (ADMIN_BYPASS) {
        setProperties((current) => current.filter((property) => property.id !== deleteTarget.id));
        setNotice({ kind: 'success', message: 'Demo property removed locally.' });
      } else {
        await propertiesApi.remove(deleteTarget.id, token ?? '');
        setProperties((current) => current.filter((property) => property.id !== deleteTarget.id));
        setNotice({ kind: 'success', message: 'Property removed.' });
      }
      setDeleteTarget(null);
    } catch (error) {
      setNotice({
        kind: 'error',
        message: (error as Error).message || 'Unable to delete property.',
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-68px)] bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 rounded-[28px] border border-stone-200/80 bg-white/85 p-6 shadow-brand-sm backdrop-blur sm:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-primary">
                Sunrise Realestate Admin
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-midnight sm:text-4xl">
                Manage your property inventory from one place.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
                Demo mode is active, so you can inspect the admin workflow without logging in.
                Create listings, update content, publish live properties, and keep the public site
                in sync with the backend when you’re ready to reconnect auth.
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
                onClick={() => {
                  setMode('create');
                  setEditingId(null);
                  setForm(EMPTY_FORM);
                  setNotice(null);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-midnight px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                New property
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Admin login is temporarily bypassed for preview. The actions here update local demo
            state until you tell me to reconnect the real auth flow.
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Total" value={stats.total} />
            <StatCard label="Live" value={stats.active} />
            <StatCard label="Draft" value={stats.draft} />
            <StatCard label="Hidden" value={stats.hidden} />
            <StatCard label="Reserved" value={stats.reserved} />
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

        <div className="grid gap-8 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-brand-sm sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-primary">
                  {isEditing ? 'Edit property' : 'Create property'}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-midnight">
                  {isEditing ? 'Update listing details' : 'Add a new property'}
                </h2>
              </div>

              {isEditing ? (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-gold-primary hover:text-gold-primary"
                >
                  Cancel
                </button>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Property title" required>
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                  placeholder="Lakeside villa with mountain views"
                  required
                />
              </Field>

              <Field label="Description" required>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                  className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                  placeholder="Describe the property, features, and selling points."
                  required
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Listing type" required>
                  <select
                    value={form.listingType}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        listingType: event.target.value as ListingType,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary"
                  >
                    {LISTING_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Category" required>
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        category: event.target.value as PropertyCategory,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary"
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Price (NPR)" required>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, price: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                    placeholder="25000000"
                    required
                  />
                </Field>

                <Field label="Reservation fee override">
                  <input
                    type="number"
                    min="0"
                    value={form.reservationFeeOverride}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        reservationFeeOverride: event.target.value,
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                    placeholder="Optional"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Street">
                  <input
                    value={form.street}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, street: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                    placeholder="Boudha Road"
                  />
                </Field>

                <Field label="Postal code">
                  <input
                    value={form.postalCode}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, postalCode: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                    placeholder="44600"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="City" required>
                  <input
                    value={form.city}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, city: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                    placeholder="Kathmandu"
                    required
                  />
                </Field>
                <Field label="State / Province" required>
                  <input
                    value={form.state}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, state: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                    placeholder="Bagmati"
                    required
                  />
                </Field>
                <Field label="Country" required>
                  <input
                    value={form.country}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, country: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                    placeholder="Nepal"
                    required
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Area size">
                  <input
                    type="number"
                    min="0"
                    value={form.areaSize}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, areaSize: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                    placeholder="1500"
                  />
                </Field>
                <Field label="Area unit">
                  <select
                    value={form.areaUnit}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, areaUnit: event.target.value as AreaUnit }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-gold-primary"
                  >
                    {AREA_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Latitude">
                  <input
                    type="number"
                    step="any"
                    value={form.latitude}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, latitude: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                    placeholder="27.7172"
                  />
                </Field>
                <Field label="Longitude">
                  <input
                    type="number"
                    step="any"
                    value={form.longitude}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, longitude: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                    placeholder="85.324"
                  />
                </Field>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-gold-primary hover:text-gold-primary"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-full bg-midnight px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving…' : isEditing ? 'Update property' : 'Publish property'}
                </button>
              </div>
            </form>
          </section>

          <section className="space-y-5">
            <div className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-brand-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search properties by title, city, or category"
                    className="w-full rounded-full border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-gold-primary"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatusFilter(option.value)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                        statusFilter === option.value
                          ? 'bg-midnight text-white'
                          : 'border border-slate-200 bg-white text-slate-500 hover:border-gold-primary hover:text-gold-primary'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {loadingProperties ? (
                <div className="rounded-[28px] border border-stone-200 bg-white p-10 text-center text-slate-500 shadow-brand-sm">
                  Loading properties…
                </div>
              ) : filteredProperties.length > 0 ? (
                filteredProperties.map((property) => {
                  const primaryImage = getPrimaryImage(property.images);
                  const isBusy = busyId === property.id;
                  const statusLabel = getPropertyStatusLabel(property.status);
                  const listingLabel = getListingTypeLabel(property.listingType);
                  const location = formatLocation(property) || 'Location not provided';
                  const summary = [
                    formatArea(property.areaSize, property.areaUnit),
                    listingLabel,
                    statusLabel,
                  ];

                  return (
                    <article
                      key={property.id}
                      className="overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-brand-sm transition hover:-translate-y-0.5 hover:shadow-brand-md"
                    >
                      <div className="grid gap-0 lg:grid-cols-[240px_1fr]">
                        <div className="relative min-h-[220px] bg-slate-100">
                          {primaryImage?.url ? (
                            <Image
                              src={primaryImage.url}
                              alt={property.title || 'Property'}
                              fill
                              sizes="(min-width: 1024px) 240px, 100vw"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,rgba(184,155,78,0.15),rgba(15,23,42,0.08))] text-sm font-medium text-slate-500">
                              No image yet
                            </div>
                          )}
                        </div>

                        <div className="p-5 sm:p-6">
                          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="min-w-0">
                              <div className="mb-3 flex flex-wrap gap-2">
                                <span
                                  className={`rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] ${categoryClass(
                                    String(property.category),
                                  )}`}
                                >
                                  {String(property.category).replace(/[_-]+/g, ' ')}
                                </span>
                                <span
                                  className={`rounded-full px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.16em] ${statusClass(
                                    property.status,
                                  )}`}
                                >
                                  {statusLabel}
                                </span>
                              </div>

                              <h3 className="truncate text-2xl font-semibold text-midnight">
                                {property.title}
                              </h3>
                              <p className="mt-2 text-sm text-slate-500">{location}</p>
                            </div>

                            <div className="rounded-2xl bg-stone-50 px-4 py-3 text-right">
                              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                Asking price
                              </p>
                              <p className="mt-1 text-2xl font-semibold text-gold-primary">
                                {formatCurrency(property.price)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500">
                            {summary.map((value) => (
                              <span
                                key={value}
                                className="rounded-full bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600"
                              >
                                {value}
                              </span>
                            ))}
                            {property.reservationFeeOverride != null ? (
                              <span className="rounded-full bg-gold-primary/10 px-3 py-2 text-xs font-medium text-gold-deep">
                                Reservation fee {formatCurrency(property.reservationFeeOverride)}
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                              href={`/properties/${property.id}`}
                              className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-gold-primary hover:text-gold-primary"
                            >
                              View public page
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleEdit(property)}
                              className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-gold-primary hover:text-gold-primary"
                            >
                              Edit
                            </button>
                            {property.status.toLowerCase() === 'active' ? (
                              <button
                                type="button"
                                onClick={() => handleHide(property)}
                                disabled={isBusy}
                                className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-60"
                              >
                                <EyeOff className="h-4 w-4" />
                                Hide
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handlePublish(property)}
                                disabled={isBusy}
                                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                              >
                                <Eye className="h-4 w-4" />
                                Publish
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(property)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-60"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-[28px] border border-dashed border-stone-200 bg-white p-10 text-center shadow-brand-sm">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-gold-primary" />
                  <p className="mt-4 text-lg font-semibold text-midnight">No properties match your filters</p>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    Try a different status or search term, or create a fresh listing from the form.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4">
          <div className="w-full max-w-md rounded-[28px] border border-stone-200 bg-white p-6 shadow-brand-lg">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-50 text-rose-700">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-rose-500">
                  Delete property
                </p>
                <h3 className="text-xl font-semibold text-midnight">Remove this listing?</h3>
              </div>
            </div>

            <p className="text-sm leading-7 text-slate-500">
              This will permanently remove <span className="font-semibold text-slate-800">{deleteTarget.title}</span> from the admin list and the public site.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-gold-primary hover:text-gold-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={busyId === deleteTarget.id}
                className="flex-1 rounded-full bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyId === deleteTarget.id ? 'Deleting…' : 'Delete property'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label} {required ? <span className="text-gold-primary">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white/80 px-4 py-4 shadow-sm">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-midnight">{value}</p>
    </div>
  );
}
