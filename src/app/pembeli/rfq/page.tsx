'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';

interface Rfq {
  id: string;
  quantity: number;
  unit: string;
  targetPrice: number | null;
  deliveryLocation: string;
  neededBy: string;
  status: string;
  createdAt: string;
  commodity: { id: string; name: string };
  _count: { quotes: number };
}

interface Commodity {
  id: string;
  name: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: 'dark:bg-green-500/15 dark:text-green-400 bg-green-100 text-green-700',
  closed: 'dark:bg-gray-500/15 dark:text-gray-400 bg-gray-100 text-gray-600',
  cancelled: 'dark:bg-red-500/15 dark:text-red-400 bg-red-100 text-red-700',
};

function formatRupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID');
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function RfqPembeliPage() {
  const { user } = useAuth();
  const [rfqs, setRfqs] = useState<Rfq[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [form, setForm] = useState({
    commodityId: '',
    quantity: '',
    unit: 'kg',
    targetPrice: '',
    deliveryLocation: '',
    neededBy: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState('');

  const fetchRfqs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const res = await fetch(`/api/v1/rfqs?limit=100&sort=newest`);
    const data = await res.json();
    setRfqs((data.rfqs ?? []).filter((r: Rfq) => r.status === 'OPEN'));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchRfqs();
    fetch('/api/v1/commodities')
      .then((r) => r.json())
      .then((d) => {
        const all: Commodity[] = [];
        (d.categories || []).forEach((c: { commodities: Commodity[] }) =>
          c.commodities.forEach((x) => all.push(x)),
        );
        setCommodities(all);
      })
      .catch(() => {});
  }, [fetchRfqs]);

  async function createRfq(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setFormMsg('');
    try {
      const res = await fetch('/api/v1/rfqs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodityId: form.commodityId,
          quantity: Number(form.quantity),
          unit: form.unit,
          targetPrice: form.targetPrice ? Number(form.targetPrice) : undefined,
          deliveryLocation: form.deliveryLocation,
          neededBy: form.neededBy,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFormMsg('RFQ berhasil dibuat!');
      setShowCreate(false);
      setForm({
        commodityId: '',
        quantity: '',
        unit: 'kg',
        targetPrice: '',
        deliveryLocation: '',
        neededBy: '',
      });
      fetchRfqs();
    } catch (e: unknown) {
      setFormMsg(e instanceof Error ? e.message : 'Gagal membuat RFQ');
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelRfq(id: string) {
    if (!confirm('Batalkan RFQ ini?')) return;
    const res = await fetch(`/api/v1/rfqs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'cancelled' }),
    });
    const data = await res.json();
    if (res.ok) fetchRfqs();
    else alert(data.error);
  }

  return (
    <DashboardLayout
      requiredRole='pembeli'
      title='RFQ'
      subtitle='Buat & kelola permintaan penawaran'
      backHref='/pembeli/dashboard'
    >
      <div className='mb-6'>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className='rounded-lg bg-green-700 px-6 py-2 text-sm font-semibold text-white hover:bg-green-800'
        >
          {showCreate ? 'Tutup Form' : '+ Buat RFQ Baru'}
        </button>
      </div>

      {showCreate && (
        <div className='mb-8 rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-6 shadow-sm'>
          <h2 className='mb-4 text-lg font-bold dark:text-gray-100 text-slate-900'>
            Buat RFQ Baru
          </h2>
          <form onSubmit={createRfq} className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div>
                <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                  Komoditas
                </label>
                <select
                  required
                  value={form.commodityId}
                  onChange={(e) =>
                    setForm({ ...form, commodityId: e.target.value })
                  }
                  className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
                >
                  <option value=''>Pilih komoditas</option>
                  {commodities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                  Kuantitas
                </label>
                <input
                  type='number'
                  required
                  min='1'
                  step='any'
                  placeholder='Contoh: 1000'
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                  className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
                />
              </div>
              <div>
                <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                  Satuan
                </label>
                <select
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
                >
                  <option value='kg'>Kilogram</option>
                  <option value='ikat'>Ikat</option>
                  <option value='ekor'>Ekor</option>
                </select>
              </div>
              <div>
                <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                  Target Harga (Rp, opsional)
                </label>
                <input
                  type='number'
                  min='1'
                  placeholder='Contoh: 12000'
                  value={form.targetPrice}
                  onChange={(e) =>
                    setForm({ ...form, targetPrice: e.target.value })
                  }
                  className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
                />
              </div>
              <div className='sm:col-span-2'>
                <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                  Lokasi Pengiriman
                </label>
                <input
                  required
                  minLength={5}
                  maxLength={500}
                  placeholder='Contoh: Jl. Merdeka No. 10, Jakarta'
                  value={form.deliveryLocation}
                  onChange={(e) =>
                    setForm({ ...form, deliveryLocation: e.target.value })
                  }
                  className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
                />
              </div>
              <div>
                <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                  Kebutuhan Sebelum
                </label>
                <input
                  type='date'
                  required
                  value={form.neededBy}
                  onChange={(e) =>
                    setForm({ ...form, neededBy: e.target.value })
                  }
                  className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
                />
              </div>
            </div>
            <button
              type='submit'
              disabled={submitting}
              className='rounded-lg bg-green-700 px-6 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50'
            >
              {submitting ? 'Membuat...' : 'Buat RFQ'}
            </button>
            {formMsg && (
              <p
                className={`text-sm ${formMsg.includes('berhasil') ? 'dark:text-green-400 text-green-600' : 'dark:text-red-400 text-red-600'}`}
              >
                {formMsg}
              </p>
            )}
          </form>
        </div>
      )}

      {loading ? (
        <div className='py-12 text-center dark:text-[#8b9e93] text-slate-500'>
          Memuat RFQ...
        </div>
      ) : rfqs.length === 0 ? (
        <div className='rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-12 text-center shadow-sm'>
          <p className='dark:text-gray-400 text-slate-500'>
            Anda belum memiliki RFQ.
          </p>
        </div>
      ) : (
        <div className='space-y-4'>
          {rfqs.map((r) => (
            <div
              key={r.id}
              className='rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-5 shadow-sm'
            >
              <div className='flex flex-wrap items-start justify-between gap-3'>
                <div>
                  <div className='flex items-center gap-2 mb-1'>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[r.status] || ''}`}
                    >
                      {r.status}
                    </span>
                    <span className='rounded dark:bg-green-500/15 dark:text-green-400 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'>
                      {r.commodity.name}
                    </span>
                  </div>
                  <p className='text-sm dark:text-gray-100 text-slate-900'>
                    {r.quantity.toLocaleString('id-ID')} {r.unit}
                    {r.targetPrice
                      ? ` — Target ${formatRupiah(r.targetPrice)}`
                      : ''}
                  </p>
                  <p className='text-xs dark:text-[#8b9e93] text-slate-500 mt-1'>
                    Lokasi: {r.deliveryLocation} — Kebutuhan:{' '}
                    {formatDate(r.neededBy)}
                  </p>
                </div>
                <div className='flex gap-2'>
                  <Link
                    href={`/rfq/${r.id}`}
                    className='rounded-lg dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-1.5 text-xs font-medium'
                  >
                    Lihat
                  </Link>
                  {r.status === 'open' && (
                    <button
                      onClick={() => cancelRfq(r.id)}
                      className='rounded-lg dark:bg-red-500/15 dark:text-red-400 bg-red-100 text-red-700 hover:bg-red-200 px-4 py-1.5 text-xs font-medium'
                    >
                      Batalkan
                    </button>
                  )}
                </div>
              </div>
              <div className='mt-2 text-xs dark:text-[#8b9e93] text-slate-500'>
                {r._count.quotes} penawaran masuk
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
