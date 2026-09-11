'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth-context';
import { buildErrorMessage } from '@/lib/utils';
import Header from '@/components/Header';

interface Commodity {
  id: string;
  name: string;
}

interface Farmer {
  id: string;
  name: string;
  email: string;
  businessName: string | null;
}

interface Photo {
  id: string;
  fileUrl: string;
  isPrimary: boolean;
}

interface ProductData {
  id: string;
  title: string;
  description: string;
  price: number;
  unit: string;
  grade: string;
  quantityAvailable: number;
  harvestDate: string | null;
  isPreorder: boolean;
  latitude: number;
  longitude: number;
  status: string;
  commodityId: string;
  farmerId: string;
  photos: Photo[];
}

export default function AdminEditProductPage() {
  const t = useTranslations('products');
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [form, setForm] = useState({
    commodityId: '',
    farmerId: '',
    title: '',
    description: '',
    price: '',
    unit: 'kg',
    grade: 'A',
    quantityAvailable: '',
    harvestDate: '',
    isPreorder: false,
    latitude: '',
    longitude: '',
    status: 'aktif',
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'admin')) {
      router.push('/masuk');
      return;
    }
    if (user && user.role === 'admin') {
      Promise.all([fetchCommodities(), fetchFarmers(), fetchProduct()]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router, params.id]);

  async function fetchCommodities() {
    try {
      const res = await fetch('/api/v1/commodities');
      const data = await res.json();
      const all: Commodity[] = [];
      (data.categories || []).forEach((cat: { commodities: Commodity[] }) => {
        cat.commodities.forEach((c) => all.push(c));
      });
      setCommodities(all);
    } catch {
      setError(t('loadCommoditiesError'));
    }
  }

  async function fetchFarmers() {
    try {
      const res = await fetch('/api/v1/admin/farmers');
      if (res.ok) {
        const data = await res.json();
        setFarmers(data.farmers || []);
      }
    } catch {
      // silent fail — farmers dropdown may not exist yet
    }
  }

  async function fetchProduct() {
    try {
      const res = await fetch(`/api/v1/products/${params.id}`);
      const data = await res.json();
      if (!res.ok || !data.product) {
        setError(t('productNotFound'));
        setLoading(false);
        return;
      }
      const p: ProductData = data.product;
      setForm({
        commodityId: p.commodityId,
        farmerId: p.farmerId,
        title: p.title,
        description: p.description,
        price: String(p.price),
        unit: p.unit,
        grade: p.grade,
        quantityAvailable: String(p.quantityAvailable),
        harvestDate: p.harvestDate ? p.harvestDate.split('T')[0] : '',
        isPreorder: p.isPreorder,
        latitude: String(p.latitude),
        longitude: String(p.longitude),
        status: p.status,
      });
      setPhotos(p.photos || []);
    } catch {
      setError(t('loadError'));
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const body: Record<string, unknown> = {
        commodityId: form.commodityId,
        title: form.title,
        description: form.description,
        price: parseFloat(form.price),
        unit: form.unit,
        grade: form.grade,
        quantityAvailable: parseFloat(form.quantityAvailable),
        harvestDate: form.harvestDate || null,
        isPreorder: form.isPreorder,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        status: form.status,
        ...(form.farmerId ? { farmerId: form.farmerId } : {}),
      };

      const res = await fetch(`/api/v1/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(buildErrorMessage(data));

      setSuccess(t('saveSuccess'));
      setTimeout(() => setSuccess(''), 30000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t('error'));
    } finally {
      setSaving(false);
    }
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/v1/products/${params.id}/photos`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      fetchProduct();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : t('uploadError'));
    } finally {
      setUploading(false);
    }
  }

  async function handleSetPrimary(photoId: string) {
    try {
      const res = await fetch(
        `/api/v1/products/${params.id}/photos/${photoId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPrimary: true }),
        },
      );
      if (res.ok) fetchProduct();
    } catch {
      alert(t('setPrimaryPhotoError'));
    }
  }

  async function handleDeletePhoto(photoId: string) {
    if (!confirm(t('confirmationDeletePhoto'))) return;
    try {
      const res = await fetch(
        `/api/v1/products/${params.id}/photos/${photoId}`,
        { method: 'DELETE' },
      );
      if (res.ok) fetchProduct();
      else alert(t('deletePhotoError'));
    } catch {
      alert(t('deletePhotoError'));
    }
  }

  async function handleAddPhotoUrl() {
    if (!photoUrl.trim()) return;
    try {
      const res = await fetch(
        `/api/v1/admin/products/${params.id}/photos-url`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: photoUrl.trim() }),
        },
      );
      if (res.ok) {
        setPhotoUrl('');
        fetchProduct();
      } else {
        const data = await res.json();
        alert(data.error || t('addPhotoError'));
      }
    } catch {
      alert(t('addPhotoUrlError'));
    }
  }

  if (loading)
    return (
      <div className='flex min-h-screen items-center justify-center'>
        {t('loading')}
      </div>
    );

  return (
    <div className='min-h-screen dark:bg-[#0d1410] bg-slate-50'>
      <Header />

      <main className='mx-auto max-w-3xl px-6 py-8'>
        <Link
          href='/admin/produk'
          className='mb-4 inline-block text-sm dark:text-green-400 text-green-600 hover:underline'
        >
          &larr; {t('backToProducts')}
        </Link>
        <h1 className='mb-6 text-2xl font-bold dark:text-gray-100 text-slate-900'>
          {t('editAdmin')}
        </h1>

        {error && (
          <div className='dark:bg-red-500/15 dark:text-red-400 mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700'>
            {error}
          </div>
        )}
        {success && (
          <div className='dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/30 mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 shadow-sm'>
            {success}
          </div>
        )}

        {/* Photo Management */}
        <div className='dark:bg-white/[0.03] dark:border-white/10 mb-6 rounded-xl border bg-white border-black/10 p-4 shadow-sm'>
          <h3 className='mb-3 font-semibold dark:text-gray-100 text-slate-900'>
            {t('productPhotos')}
          </h3>

          {photos.length > 0 && (
            <div className='mb-4 grid grid-cols-5 gap-2'>
              {photos.map((photo) => (
                <div key={photo.id} className='group relative'>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.fileUrl}
                    alt=''
                    className={`h-24 w-full rounded-lg object-cover ${photo.isPrimary ? 'ring-2 ring-green-500' : ''}`}
                  />
                  {photo.isPrimary && (
                    <span className='absolute left-1 top-1 rounded bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-white'>
                      UTAMA
                    </span>
                  )}
                  <div className='absolute inset-0 flex items-center justify-center gap-1 rounded-lg bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
                    {!photo.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(photo.id)}
                        className='rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-medium text-gray-700 hover:bg-white'
                      >
                      {t('makePrimary')}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className='rounded bg-red-500/90 px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-red-600'
                    >
                      {t('delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className='mb-3 flex gap-2'>
            <label
              className={`cursor-pointer rounded-lg border-2 border-dashed dark:border-white/10 dark:hover:bg-white/5 p-4 text-center text-sm hover:bg-slate-50 ${uploading ? 'opacity-50' : ''}`}
            >
              {uploading ? t('uploading') : `+ ${t('uploadPhoto')}`}
              <input
                type='file'
                accept='image/jpeg,image/png'
                onChange={handlePhotoUpload}
                className='hidden'
                disabled={uploading}
              />
            </label>
          </div>

          <div className='flex gap-2'>
            <input
              type='url'
              placeholder={t('pasteImageUrl')}
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className='flex-1 rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
            />
            <button
              onClick={handleAddPhotoUrl}
              disabled={!photoUrl.trim()}
              className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50'
            >
              {t('addUrl')}
            </button>
          </div>
          <p className='mt-2 text-xs dark:text-gray-500 text-slate-400'>
            {t('photoFormat')} {t('pasteImageUrl')}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className='dark:bg-white/[0.03] dark:border-white/10 space-y-4 rounded-xl border bg-white border-black/10 p-6 shadow-sm'
        >
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                Komoditas <span className='text-red-500'>*</span>
              </label>
              <select
                required
                value={form.commodityId}
                onChange={(e) =>
                  setForm({ ...form, commodityId: e.target.value })
                }
                className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
              >
                {t('selectCommodity')}
                {commodities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                Petani <span className='text-red-500'>*</span>
              </label>
              <select
                required
                value={form.farmerId}
                onChange={(e) => setForm({ ...form, farmerId: e.target.value })}
                className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
              >
                {t('selectFarmer')}
                {farmers.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.businessName || f.name} ({f.email})
                  </option>
                ))}
              </select>
              {farmers.length === 0 && (
                <p className='mt-1 text-xs dark:text-gray-500 text-slate-400'>
                  Memuat data petani...
                </p>
              )}
            </div>
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
              {t('productTitle')} <span className='text-red-500'>*</span>
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
              {t('description')} <span className='text-red-500'>*</span>
            </label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                {t('price')} <span className='text-red-500'>*</span>
              </label>
              <input
                required
                type='number'
                min='1'
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
              />
            </div>
            <div>
              <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                {t('unitType')} <span className='text-red-500'>*</span>
              </label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
              >
                <option value='kg'>{t('kg')}</option>
                <option value='ikat'>{t('ikat')}</option>
                <option value='ekor'>{t('ekor')}</option>
              </select>
            </div>
          </div>

          <div className='grid grid-cols-3 gap-4'>
            <div>
              <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                {t('grade')} <span className='text-red-500'>*</span>
              </label>
              <select
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
              >
                <option value='A'>Grade A</option>
                <option value='B'>Grade B</option>
                <option value='C'>Grade C</option>
              </select>
            </div>
            <div>
              <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                {t('quantity')} <span className='text-red-500'>*</span>
              </label>
              <input
                required
                type='number'
                min='1'
                value={form.quantityAvailable}
                onChange={(e) =>
                  setForm({ ...form, quantityAvailable: e.target.value })
                }
                className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
              />
            </div>
            <div>
              <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                {t('status')}
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
              >
                <option value='aktif'>{t('status.active')}</option>
                <option value='pre_order'>{t('status.preOrder')}</option>
                <option value='habis'>{t('status.outOfStock')}</option>
                <option value='nonaktif'>{t('status.inactive')}</option>
              </select>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                {t('harvestEstimate')}
              </label>
              <input
                type='date'
                value={form.harvestDate}
                onChange={(e) =>
                  setForm({ ...form, harvestDate: e.target.value })
                }
                className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
              />
            </div>
            <div className='flex items-end gap-4'>
              <div className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  id='isPreorder'
                  checked={form.isPreorder}
                  onChange={(e) =>
                    setForm({ ...form, isPreorder: e.target.checked })
                  }
                  className='rounded'
                />
                <label
                  htmlFor='isPreorder'
                  className='text-sm dark:text-gray-300 text-slate-700'
                >
                  Pre-Order
                </label>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                Latitude <span className='text-red-500'>*</span>
              </label>
              <input
                required
                type='number'
                step='any'
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
              />
            </div>
            <div>
              <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                Longitude <span className='text-red-500'>*</span>
              </label>
              <input
                required
                type='number'
                step='any'
                value={form.longitude}
                onChange={(e) =>
                  setForm({ ...form, longitude: e.target.value })
                }
                className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
              />
            </div>
          </div>
          {success && (
            <div className='dark:bg-green-500/15 dark:text-green-400 dark:border-green-500/30 mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 shadow-sm'>
              {success}
            </div>
          )}
          <button
            type='submit'
            disabled={saving}
            className='w-full rounded-lg bg-green-700 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-50'
          >
            {saving ? t('saving') : t('saveChanges')}
          </button>
        </form>
      </main>
    </div>
  );
}
