'use client';
/* eslint-disable react-hooks/set-state-in-effect */

import WorkspaceShell from '@/components/admin/WorkspaceShell';
import PropertyInventory, { ADMIN_ADD_BLOCKED, useReasonPrompt, type InventoryActions } from '@/components/admin/PropertyInventory';
import { describeActionError, StaffToast, type StaffNotice, type StaffRole } from '@/components/admin/staff-ui';
import AgentDashboard, { AgentActivityPage } from '@/components/admin/AgentDashboard';
import MapLocationPicker from '@/components/admin/MapLocationPicker';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import { Building2, CalendarCheck, CreditCard, LayoutGrid, Settings, Trash2 } from 'lucide-react';

import { auth, getAuthToken } from '@/lib/auth';
import { isStaffRole } from '@/lib/auth-routing';
import { propertiesApi } from '@/lib/backend';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import {
  formatCurrency,
  getPropertyCategoryLabel,
  getListingTypeLabel,
} from '@/lib/properties';
import type {
  AreaUnit,
  ConfirmPropertyImageDto,
  CreatePropertyDto,
  ListingType,
  PresignPropertyImageDto,
  PropertyCategory,
  PropertyResponseDto,
  PresignPropertyImageResponseDto,
  UpdatePropertyDto,
} from '@/types';

type AdminMode = 'create' | 'edit';

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
  { value: 'HOUSE', label: 'House' },
  { value: 'APARTMENT', label: 'Apartment' },
  { value: 'LAND', label: 'Land' },
  { value: 'COMMERCIAL', label: 'Commercial' },
];

const LISTING_OPTIONS: Array<{ value: ListingType; label: string }> = [
  { value: 'SALE', label: 'For Sale' },
  { value: 'RENT', label: 'For Rent' },
];

const AREA_OPTIONS: Array<{ value: AreaUnit; label: string }> = [
  { value: 'sqft', label: 'Sq ft' },
  { value: 'sqm', label: 'Sq m' },
];

const EMPTY_FORM: PropertyFormState = {
  title: '',
  description: '',
  price: '',
  listingType: 'SALE',
  category: 'HOUSE',
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

function validateDescription(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length < 10) {
    return 'Description must be at least 10 characters long.';
  }
  return null;
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

function createPresignImagePayload(file: File): PresignPropertyImageDto {
  const mimeType = file.type as PresignPropertyImageDto['mimeType'];

  if (mimeType !== 'image/jpeg' && mimeType !== 'image/png' && mimeType !== 'image/webp') {
    throw new Error('Only JPG, PNG, and WEBP images are supported.');
  }

  return {
    mimeType,
  };
}

function createConfirmImagePayload(
  s3Key: string,
  publicUrl: string,
  isPrimary: boolean,
  sortOrder: number,
): ConfirmPropertyImageDto {
  return {
    s3Key,
    publicUrl,
    isPrimary,
    sortOrder,
  };
}

async function uploadPropertyImages(
  propertyId: string,
  files: File[],
  token: string,
): Promise<PropertyResponseDto> {
  let latestProperty = await propertiesApi.findOne(propertyId, token);
  const existingImages = latestProperty.images ?? [];
  const nextSortOrder = existingImages.reduce((next, image) => Math.max(next, (image.sortOrder ?? 0) + 1), 0);
  const hasPrimary = existingImages.some(image => image.isPrimary);

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const presign = await propertiesApi.presignImage(
      propertyId,
      createPresignImagePayload(file),
      token,
    );

    const presignResponse = presign as PresignPropertyImageResponseDto;
    const uploadResponse = await fetch(presignResponse.uploadUrl, {
      method: 'PUT',
      headers: file.type ? { 'Content-Type': file.type } : undefined,
      body: file,
    });
if (!uploadResponse.ok) {
  const errorText = await uploadResponse.text();

  console.error('S3 upload failed:', {
    status: uploadResponse.status,
    statusText: uploadResponse.statusText,
    body: errorText,
  });

  throw new Error(
    `Unable to uploadd ${file.name}: ${uploadResponse.status} ${errorText}`,
  );
}

    latestProperty = await propertiesApi.confirmImage(
      propertyId,
      createConfirmImagePayload(
        presignResponse.s3Key,
        presignResponse.publicUrl,
        !hasPrimary && index === 0,
        nextSortOrder + index,
      ),
      token,
    );
  }

  return latestProperty;
}

export default function AdminPropertyStudio({ embedded = false, initialView }: { embedded?: boolean; initialView?: 'inventory' | 'create' }) {
  const [view, setView] = useState<string>(initialView ?? (embedded ? 'inventory' : 'dashboard'));
  const [staffName, setStaffName] = useState('');
  const [staffId, setStaffId] = useState('');
  const reasonPrompt = useReasonPrompt();
  const [step, setStep] = useState(0);
  const [properties, setProperties] = useState<PropertyResponseDto[]>([]);
  const [token, setToken] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [mode, setMode] = useState<AdminMode>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PropertyFormState>(EMPTY_FORM);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageInputKey, setImageInputKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const role: StaffRole = embedded ? 'admin' : 'agent';
  const [notice, setNotice] = useState<StaffNotice | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<PropertyResponseDto | null>(null);

  const resetForm = () => {
    setStep(0);
    setMode('create');
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSelectedImages([]);
    setImageInputKey((current) => current + 1);
  };

  async function refreshProperties(tokenValue?: string) {
    setLoadingProperties(true);

    try {
      const res = await propertiesApi.findAll({ page: 1, limit: 100 }, tokenValue);
      setProperties(Array.isArray(res.items) ? res.items : []);
    } catch (error) {
      setNotice(describeActionError(error, 'load your properties', role));
    } finally {
      setLoadingProperties(false);
    }
  }

  useEffect(() => {
    const authToken = getAuthToken();

    if (!authToken) {
      setAuthMessage('Please sign in to access the admin dashboard.');
      setAuthLoading(false);
      setLoadingProperties(false);
      return;
    }

    let isMounted = true;

    const verifyAdmin = async () => {
      try {
        const user = await auth.me(authToken);

        if (!isMounted) return;

        if (!isStaffRole(user.role)) {
          setAuthMessage('This account does not have admin access.');
          setToken('');
          setLoadingProperties(false);
          setAuthLoading(false);
          return;
        }

        setToken(authToken);
        setStaffName(user.fullName);
        setStaffId(user.id);
        await refreshProperties(authToken);
      } catch (error) {
        if (!isMounted) return;
        setAuthMessage((error as Error).message || 'Please sign in to access the admin dashboard.');
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    void verifyAdmin();

    return () => {
      isMounted = false;
    };
    // Runs once on mount: it verifies the session and loads the first page of listings.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isEditing = mode === 'edit' && editingId !== null;

  if (authLoading) {
    return <DashboardSkeleton label="Checking access" />;
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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setNotice(null);

    const payload = buildPropertyPayload(form);
    const descriptionError = validateDescription(form.description);

    if (!payload.title || !payload.description || !payload.city || !payload.state || !payload.country) {
      setNotice({ kind: 'error', message: 'Please complete the required property fields.' });
      return;
    }

    if (descriptionError) {
      setNotice({ kind: 'error', message: descriptionError });
      return;
    }

    if (!Number.isFinite(Number(form.price))) {
      setNotice({ kind: 'error', message: 'Enter a valid property price.' });
      return;
    }

    if (!token) {
      setNotice({
        kind: 'error',
        message: 'Admin token not found. Please sign in again before saving properties.',
      });
      return;
    }

    setSaving(true);

    try {
      let savedProperty: PropertyResponseDto;

      if (isEditing && editingId) {
        savedProperty = await propertiesApi.update(editingId, payload as UpdatePropertyDto, token);
      } else {
        savedProperty = await propertiesApi.create(payload as CreatePropertyDto, token);
      }

      setProperties((current) => {
        const next = current.filter((property) => property.id !== savedProperty.id);
        return [savedProperty, ...next];
      });

      if (selectedImages.length > 0) {
        try {
          savedProperty = await uploadPropertyImages(savedProperty.id, selectedImages, token);
          setProperties((current) =>
            current.map((property) => (property.id === savedProperty.id ? savedProperty : property)),
          );
        } catch (imageError) {
          setNotice({
            kind: 'error',
            message: `${isEditing ? 'Property updated' : 'Property saved as a draft'}, but image upload failed: ${
              (imageError as Error).message || 'Unable to upload images.'
            }`,
          });
          resetForm();
          return;
        }
      }

      setNotice({
        kind: 'success',
        message: isEditing
          ? 'Property updated successfully.'
          : selectedImages.length > 0
            ? 'Property draft saved and images attached.'
            : 'Property draft saved successfully.',
      });

      resetForm();
      setView('inventory');
    } catch (error) {
      setNotice(describeActionError(error, 'save this listing', role));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (property: PropertyResponseDto) => {
    setView('create');
    setStep(0);
    setMode('edit');
    setEditingId(property.id);
    setForm(formFromProperty(property));
    setSelectedImages([]);
    setImageInputKey((current) => current + 1);
    setNotice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    resetForm();
    setNotice(null);
  };

  const handlePublish = async (property: PropertyResponseDto) => {
    setBusyId(property.id);

    try {
      if (!token) throw new Error('Admin token not found. Please sign in again.');
      const updated = await propertiesApi.publish(property.id, token);
      setProperties((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setNotice({ kind: 'success', message: 'Property marked as live.' });
    } catch (error) {
      setNotice(describeActionError(error, 'publish this listing', role));
    } finally {
      setBusyId(null);
    }
  };

  const handleHide = async (property: PropertyResponseDto) => {
    setBusyId(property.id);

    try {
      if (!token) throw new Error('Admin token not found. Please sign in again.');
      const updated = await propertiesApi.hide(property.id, token);
      setProperties((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
      setNotice({ kind: 'success', message: 'Property hidden.' });
    } catch (error) {
      setNotice(describeActionError(error, 'hide this listing', role));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const deletableStatus = deleteTarget.status === 'DRAFT' || deleteTarget.status === 'HIDDEN';
    if (!deletableStatus) {
      setNotice({
        kind: 'error',
        title: 'Couldn’t delete this listing',
        message: 'Only drafts or hidden listings can be deleted. Hide the listing first, then delete it.',
      });
      setDeleteTarget(null);
      return;
    }

    setBusyId(deleteTarget.id);

    try {
      if (!token) throw new Error('Admin token not found. Please sign in again.');
      await propertiesApi.remove(deleteTarget.id, token);
      setProperties((current) => current.filter((property) => property.id !== deleteTarget.id));
      setNotice({ kind: 'success', message: 'Property removed.' });
      setDeleteTarget(null);
    } catch (error) {
      setNotice(describeActionError(error, 'delete this listing', role));
    } finally {
      setBusyId(null);
    }
  };

  const moderate = async (property: PropertyResponseDto, kind: 'suspend' | 'reactivate') => {
    const reason = await reasonPrompt.ask(kind === 'suspend' ? `Suspend “${property.title}”?` : `Restore “${property.title}”?`, kind === 'suspend' ? 'Suspend listing' : 'Restore listing', kind === 'suspend');
    if (!reason || !token) return;
    setBusyId(property.id);
    try {
      const updated = kind === 'suspend' ? await propertiesApi.suspend(property.id, reason, token) : await propertiesApi.reactivate(property.id, reason, token);
      setProperties((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setNotice({ kind: 'success', message: kind === 'suspend' ? 'Property suspended.' : 'Property restored.' });
    } catch (error) {
      setNotice(describeActionError(error, kind === 'suspend' ? 'suspend this listing' : 'restore this listing', role));
    } finally {
      setBusyId(null);
    }
  };

  const inventoryActions: InventoryActions = {
    busyId,
    onEdit: handleEdit,
    onPublish: (property) => void handlePublish(property),
    onHide: (property) => void handleHide(property),
    onDelete: setDeleteTarget,
    // Moderation endpoints are admin-only; the admin dashboard embeds this studio.
    ...(embedded ? {
      onSuspend: (property: PropertyResponseDto) => void moderate(property, 'suspend'),
      onReactivate: (property: PropertyResponseDto) => void moderate(property, 'reactivate'),
      loadModerationLog: (id: string) => propertiesApi.moderationLog(id, token),
    } : {}),
  };

  // The API returns every company listing to agents; an agent's workspace shows only the ones they created.
  const ownProperties = embedded ? properties : properties.filter((property) => property.createdByAgentId === staffId);

  return (
    <StudioLayout embedded={embedded} view={view} setView={setView}>
      <div>

        <StaffToast notice={notice} onClose={() => setNotice(null)} />

        <div className="space-y-6">
          <section hidden={view !== 'create'} className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#cc7654]">
                  {isEditing ? 'Edit property' : 'Create draft'}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#2a2723]">
                  {isEditing ? 'Update listing details' : 'Add a new draft listing'}
                </h2>
              </div>

              {isEditing ? (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[#cc7654] hover:text-[#cc7654]"
                >
                  Cancel
                </button>
              ) : null}
            </div>

            <div className="mb-7 grid grid-cols-3 gap-2" aria-label="Property form steps">
              {['Property details', 'Location & size', 'Photos & review'].map((label, index) => <div key={label} aria-current={step === index ? 'step' : undefined} className={`rounded-2xl px-3 py-4 text-sm ${step === index ? 'bg-[#3e4a3d] text-white' : 'bg-[#f7f5f1] text-stone-500'}`}><span className="mb-1 block text-xs">0{index + 1}</span>{label}</div>)}
            </div>
            <form noValidate onSubmit={(event) => {
              if (step < 2) {
                event.preventDefault();
                const fields = event.currentTarget.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('fieldset:not([disabled]) input, fieldset:not([disabled]) textarea, fieldset:not([disabled]) select');
                for (const field of fields) { if (!field.reportValidity()) return; }
                setStep(step + 1);
                return;
              }
              void handleSubmit(event);
            }} className="space-y-5">
              <fieldset hidden={step !== 0} disabled={step !== 0 || saving} className="space-y-5">
              <Field label="Property title" required>
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#cc7654]"
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
                  minLength={10}
                  className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#cc7654]"
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]"
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]"
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#cc7654]"
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#cc7654]"
                    placeholder="Optional"
                  />
                </Field>
              </div>

              </fieldset>
              <fieldset hidden={step !== 1} disabled={step !== 1 || saving} className="space-y-5">
                <p className="text-sm text-stone-500">Add the address buyers will see, then pinpoint the exact location on the map.</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Street">
                  <input
                    value={form.street}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, street: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#cc7654]"
                    placeholder="Boudha Road"
                  />
                </Field>

                <Field label="Postal code">
                  <input
                    value={form.postalCode}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, postalCode: event.target.value }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#cc7654]"
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#cc7654]"
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#cc7654]"
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#cc7654]"
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
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#cc7654]"
                    placeholder="1500"
                  />
                </Field>
                <Field label="Area unit">
                  <select
                    value={form.areaUnit}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, areaUnit: event.target.value as AreaUnit }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#cc7654]"
                  >
                    {AREA_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="rounded-3xl border border-stone-200 bg-white p-4">
                <Field label="Pin property location">
                  {step === 1 ? (
                    <MapLocationPicker
                      latitude={form.latitude}
                      longitude={form.longitude}
                      onChange={({ latitude, longitude }) => setForm((current) => ({ ...current, latitude, longitude }))}
                    />
                  ) : null}
                </Field>
              </div>

              </fieldset>
              <fieldset hidden={step !== 2} disabled={step !== 2 || saving} className="space-y-5">
              <Field label="Property images">
                <input
                  key={imageInputKey}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    event.target.value = '';
                    const invalidFiles = files.filter(file => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type));
                    const validFiles = files.filter(file => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type));
                    setSelectedImages(current => {
                      const next = [...current];
                      for (const file of validFiles) {
                        if (!next.some(existing => existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified)) next.push(file);
                      }
                      return next;
                    });
                    setNotice(invalidFiles.length ? { kind: 'error', message: `Could not add ${invalidFiles.map(file => file.name).join(', ')}. Choose JPG, PNG, or WebP images.` } : null);
                  }}
                  className="w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-slate-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-slate-700 hover:border-[#cc7654] focus:border-[#cc7654]"
                />
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Choose multiple JPG, PNG, or WebP photos at once, or add more in separate selections. Existing cover photos are preserved.
                </p>
                {selectedImages.length > 0 ? (
                  <ul className="mt-3 space-y-1 text-xs text-slate-600">
                    <li role="status" className="py-2 font-medium">{selectedImages.length} photo{selectedImages.length === 1 ? '' : 's'} ready to upload</li>
                    {selectedImages.map((file, index) => (
                      <li key={`${file.name}-${file.lastModified}-${index}`} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 px-3 py-2">
                        <span className="truncate">{file.name}</span>
                        {index === 0 && !properties.find(property => property.id === editingId)?.images?.some(image => image.isPrimary) ? (
                          <span className="rounded-full bg-gold-primary/10 px-2 py-1 font-semibold text-gold-deep">
                            Primary
                          </span>
                        ) : null}
                        <button type="button" aria-label={`Remove ${file.name}`} onClick={() => setSelectedImages(current => current.filter((_, imageIndex) => imageIndex !== index))} className="rounded-full px-3 py-1 text-rose-700 hover:bg-rose-100">Remove</button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Field>

                <div className="rounded-3xl bg-[#f7f5f1] p-6">
                  <p className="text-xs uppercase tracking-widest text-[#cc7654]">Review your listing</p>
                  <h3 className="mt-3 text-xl font-semibold">{form.title || 'Untitled property'}</h3>
                  <p className="mt-2 text-lg text-[#cc7654]">{formatCurrency(Number(form.price))}</p>
                  <p className="mt-2 text-sm">{[form.street, form.city, form.state, form.country].filter(Boolean).join(', ')}</p>
                  <p className="mt-2 text-sm">{getPropertyCategoryLabel(form.category)} · {getListingTypeLabel(form.listingType)}</p>
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm text-stone-500">{form.description}</p>
                  <p className="mt-4 text-xs text-stone-500">{isEditing ? 'Your changes will update this listing.' : 'This saves a draft. Publish it from your inventory when it is ready.'}</p>
                </div>
              </fieldset>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => step > 0 ? setStep(step - 1) : setView('inventory')}
                  className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#cc7654] hover:text-[#cc7654]"
                >
                  {step > 0 ? 'Back' : 'Back to inventory'}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-full bg-[#3e4a3d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#303c2f] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving…' : step < 2 ? 'Continue' : isEditing ? 'Update property' : 'Save draft'}
                </button>
              </div>
            </form>
          </section>

          {view === 'inventory' ? (
            <PropertyInventory
              title={embedded ? 'All Properties' : 'My Listings'}
              subtitle={embedded ? 'Company inventory and agent visibility' : 'Every listing you have created, from draft to sold'}
              tableTitle={embedded ? 'Sunrise properties' : 'Your properties'}
              properties={ownProperties}
              loading={loadingProperties || (!embedded && !staffId)}
              addBlockedReason={embedded ? ADMIN_ADD_BLOCKED : undefined}
              onAdd={() => { resetForm(); setView('create'); setNotice(null); }}
              actions={inventoryActions}
            />
          ) : null}

          {view === 'dashboard' ? (
            <AgentDashboard name={staffName} token={token} properties={ownProperties} busyId={busyId} onAdd={() => { resetForm(); setView('create'); setNotice(null); }} onEdit={handleEdit} onPublish={handlePublish} onOpen={setView} />
          ) : null}

          {view === 'reservations' || view === 'payments' ? <AgentActivityPage key={view} kind={view} token={token} properties={ownProperties} /> : null}

          {view === 'settings' ? (
            <>
              <div className="mb-6"><h1 className="text-[32px] font-bold leading-tight">Settings</h1><p className="mt-1 text-sm text-[#6b665f]">Your account and profile</p></div>
              <section className="rounded-2xl border border-[#ebe7e0] bg-white p-6">
                <h2 className="text-lg font-semibold">Profile</h2>
                <p className="mt-1 text-sm text-[#6b665f]">Update your name, contact details and profile photo.</p>
                <Link href="/profile" className="mt-4 inline-flex h-10 items-center rounded-full bg-[#cc7654] px-5 text-sm font-semibold text-white hover:bg-[#b66545]">Manage profile</Link>
              </section>
            </>
          ) : null}
        </div>
      </div>

      {reasonPrompt.dialog}
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
                <h3 className="text-xl font-semibold text-[#2a2723]">Remove this listing?</h3>
              </div>
            </div>

            <p className="text-sm leading-7 text-slate-500">
              {deleteTarget.status === 'DRAFT' || deleteTarget.status === 'HIDDEN' ? (
                <>
                  This will permanently remove{' '}
                  <span className="font-semibold text-slate-800">{deleteTarget.title}</span>{' '}
                  from the admin list and the public site.
                </>
              ) : (
                <>
                  <span className="font-semibold text-slate-800">{deleteTarget.title}</span> cannot
                  be deleted right now. The backend only allows deleting properties that are in
                  DRAFT or HIDDEN status.
                </>
              )}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#cc7654] hover:text-[#cc7654]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={
                  busyId === deleteTarget.id ||
                  !(deleteTarget.status === 'DRAFT' || deleteTarget.status === 'HIDDEN')
                }
                className="flex-1 rounded-full bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyId === deleteTarget.id ? 'Deleting…' : 'Delete property'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </StudioLayout>
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
        {label} {required ? <span className="text-[#cc7654]">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function StudioLayout({ embedded, view, setView, children }: { embedded: boolean; view: string; setView: (value: string) => void; children: React.ReactNode }) {
  if (embedded) return <div className="staff-workspace">{children}</div>;
  const items = [
    { value: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { value: 'inventory', label: 'My Listings', icon: Building2 },
    { value: 'reservations', label: 'Reservations', icon: CalendarCheck },
    { value: 'payments', label: 'Payments', icon: CreditCard },
    { value: 'settings', label: 'Settings', icon: Settings },
  ];
  // The listing form belongs to My Listings, so keep that item highlighted while it is open.
  return <WorkspaceShell title="Agent workspace" active={view === 'create' ? 'inventory' : view} items={items} onSelect={setView}>{children}</WorkspaceShell>;
}
