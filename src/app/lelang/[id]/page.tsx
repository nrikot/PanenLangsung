'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/lib/auth-context';

interface Auction {
  id: string;
  title: string;
  quantity: number;
  unit: string;
  startPrice: number;
  reservePrice: number;
  startTime: string;
  endTime: string;
  selectionMode: string;
  status: string;
  createdAt: string;
  farmer: {
    id: string;
    name: string;
    businessName: string;
    phone: string;
    address: string;
    verificationStatus: string;
  };
  commodity: { id: string; name: string };
  bids: {
    id: string;
    pricePerUnit: number;
    quantity: number;
    message: string | null;
    status: string;
    createdAt: string;
    buyer: { id: string; name: string; businessName: string };
  }[];
}

const STATUS_COLORS: Record<string, string> = {
  draft:
    'dark:bg-yellow-500/15 dark:text-yellow-400 bg-yellow-100 text-yellow-700',
  aktif: 'dark:bg-green-500/15 dark:text-green-400 bg-green-100 text-green-700',
  berakhir: 'dark:bg-gray-500/15 dark:text-gray-400 bg-gray-100 text-gray-600',
  dibatalkan: 'dark:bg-red-500/15 dark:text-red-400 bg-red-100 text-red-700',
  selesai: 'dark:bg-blue-500/15 dark:text-blue-400 bg-blue-100 text-blue-700',
};

function formatRupiah(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID');
}
function formatDateTime(d: string) {
  return new Date(d).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function TimeLeft({ endTime, status }: { endTime: string; status: string }) {
  const [remaining, setRemaining] = useState('');
  useEffect(() => {
    if (status !== 'aktif') return;
    const tick = () => {
      const diff = new Date(endTime).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining('Berakhir');
        return;
      }
      const d = Math.floor(diff / 86400000),
        h = Math.floor((diff % 86400000) / 3600000),
        m = Math.floor((diff % 3600000) / 60000),
        s = Math.floor((diff % 60000) / 1000);
      setRemaining(
        d > 0
          ? `${d}h ${h}j ${m}m`
          : h > 0
            ? `${h}j ${m}m ${s}d`
            : `${m}m ${s}d`,
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime, status]);
  if (!remaining) return null;
  return (
    <span className='rounded dark:bg-green-500/15 dark:text-green-400 bg-green-100 px-2 py-1 text-xs font-medium text-green-700'>
      {remaining}
    </span>
  );
}

export default function LelangDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bidForm, setBidForm] = useState({
    pricePerUnit: '',
    quantity: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [bidMsg, setBidMsg] = useState('');

  const fetchAuction = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/auctions/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAuction(data.auction);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Gagal memuat');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAuction();
  }, [fetchAuction]);

  async function submitBid(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setBidMsg('');
    try {
      const res = await fetch(`/api/v1/auctions/${id}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pricePerUnit: Number(bidForm.pricePerUnit),
          quantity: Number(bidForm.quantity),
          message: bidForm.message || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBidMsg('Penawaran berhasil dikirim!');
      setBidForm({ pricePerUnit: '', quantity: '', message: '' });
      fetchAuction();
    } catch (e: unknown) {
      setBidMsg(e instanceof Error ? e.message : 'Gagal mengirim penawaran');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading)
    return (
      <div className='flex min-h-screen items-center justify-center dark:bg-[#0d1410] bg-slate-50 dark:text-[#8b9e93] text-slate-500'>
        Memuat...
      </div>
    );
  if (error || !auction)
    return (
      <div className='flex min-h-screen items-center justify-center dark:bg-[#0d1410] bg-slate-50 dark:text-red-400 text-red-600'>
        {error || 'Tidak ditemukan'}
      </div>
    );

  const myBid =
    user?.role === 'pembeli'
      ? auction.bids.find((b) => b.buyer.id === user.id)
      : null;
  const isFarmer = user?.role === 'petani' && auction.farmer.id === user.id;
  const canBid =
    user?.role === 'pembeli' &&
    auction.status === 'aktif' &&
    new Date(auction.endTime) > new Date();
  const canSelectWinner =
    isFarmer &&
    auction.status === 'berakhir' &&
    auction.selectionMode === 'manual';

  return (
    <div className='min-h-screen dark:bg-[#0d1410] bg-slate-50'>
      <Header />
      <main className='mx-auto max-w-4xl px-6 py-8'>
        <Link
          href='/lelang'
          className='mb-4 inline-block text-sm dark:text-green-400 text-green-600 hover:underline'
        >
          &larr; Kembali ke Lelang
        </Link>

        <div className='rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-6 shadow-sm'>
          <div className='mb-4 flex flex-wrap items-center gap-3'>
            <span
              className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[auction.status] || ''}`}
            >
              {auction.status}
            </span>
            <span className='rounded dark:bg-green-500/15 dark:text-green-400 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'>
              {auction.commodity.name}
            </span>
            <span className='rounded dark:bg-blue-500/15 dark:text-blue-400 bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700'>
              Seleksi {auction.selectionMode}
            </span>
            {auction.status === 'aktif' && (
              <TimeLeft endTime={auction.endTime} status={auction.status} />
            )}
          </div>
          <h1 className='mb-4 text-xl font-bold dark:text-gray-100 text-slate-900'>
            {auction.title}
          </h1>

          <div className='mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4'>
            <div className='rounded-lg dark:bg-white/5 bg-slate-50 p-3'>
              <p className='text-xs dark:text-[#8b9e93] text-slate-500'>
                Harga Awal
              </p>
              <p className='text-lg font-bold dark:text-gray-100 text-slate-900'>
                {formatRupiah(auction.startPrice)}
              </p>
            </div>
            <div className='rounded-lg dark:bg-white/5 bg-slate-50 p-3'>
              <p className='text-xs dark:text-[#8b9e93] text-slate-500'>
                Harga Minimal
              </p>
              <p className='text-lg font-bold dark:text-gray-100 text-slate-900'>
                {formatRupiah(auction.reservePrice)}
              </p>
            </div>
            <div className='rounded-lg dark:bg-white/5 bg-slate-50 p-3'>
              <p className='text-xs dark:text-[#8b9e93] text-slate-500'>
                Kuantitas
              </p>
              <p className='text-lg font-bold dark:text-gray-100 text-slate-900'>
                {auction.quantity.toLocaleString('id-ID')} {auction.unit}
              </p>
            </div>
            <div className='rounded-lg dark:bg-white/5 bg-slate-50 p-3'>
              <p className='text-xs dark:text-[#8b9e93] text-slate-500'>
                Penawaran
              </p>
              <p className='text-lg font-bold dark:text-gray-100 text-slate-900'>
                {auction.bids.length}
              </p>
            </div>
          </div>

          <div className='mb-6 space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='dark:text-[#8b9e93] text-slate-500'>Petani</span>
              <span className='dark:text-gray-100 text-slate-900'>
                {auction.farmer.businessName || auction.farmer.name}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='dark:text-[#8b9e93] text-slate-500'>
                Waktu Mulai
              </span>
              <span className='dark:text-gray-100 text-slate-900'>
                {formatDateTime(auction.startTime)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='dark:text-[#8b9e93] text-slate-500'>
                Waktu Berakhir
              </span>
              <span className='dark:text-gray-100 text-slate-900'>
                {formatDateTime(auction.endTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Bid form for buyers */}
        {canBid && (
          <div className='mt-6 rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-6 shadow-sm'>
            <h2 className='mb-4 text-lg font-bold dark:text-gray-100 text-slate-900'>
              {myBid ? 'Perbarui Penawaran' : 'Kirim Penawaran'}
            </h2>
            <form onSubmit={submitBid} className='space-y-4'>
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                <div>
                  <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                    Harga per Satuan (Rp)
                  </label>
                  <input
                    type='number'
                    required
                    min='1'
                    placeholder='Contoh: 15000'
                    value={bidForm.pricePerUnit}
                    onChange={(e) =>
                      setBidForm({ ...bidForm, pricePerUnit: e.target.value })
                    }
                    className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
                  />
                </div>
                <div>
                  <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                    Kuantitas ({auction.unit})
                  </label>
                  <input
                    type='number'
                    required
                    min='1'
                    step='any'
                    placeholder='Contoh: 100'
                    value={bidForm.quantity}
                    onChange={(e) =>
                      setBidForm({ ...bidForm, quantity: e.target.value })
                    }
                    className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
                  />
                </div>
              </div>
              <div>
                <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                  Pesan (opsional)
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  placeholder='Catatan untuk petani...'
                  value={bidForm.message}
                  onChange={(e) =>
                    setBidForm({ ...bidForm, message: e.target.value })
                  }
                  className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
                />
              </div>
              <button
                type='submit'
                disabled={submitting}
                className='rounded-lg bg-green-700 px-6 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50'
              >
                {submitting
                  ? 'Mengirim...'
                  : myBid
                    ? 'Perbarui Penawaran'
                    : 'Kirim Penawaran'}
              </button>
              {bidMsg && (
                <p
                  className={`text-sm ${bidMsg.includes('berhasil') ? 'dark:text-green-400 text-green-600' : 'dark:text-red-400 text-red-600'}`}
                >
                  {bidMsg}
                </p>
              )}
            </form>
          </div>
        )}

        {user?.role === 'pembeli' && !canBid && !myBid && (
          <div className='mt-6 rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-6 shadow-sm text-center'>
            <p className='dark:text-[#8b9e93] text-slate-500'>
              Anda belum mengirim penawaran untuk lelang ini.
            </p>
          </div>
        )}

        {/* Bids list — only farmer (owner) sees after end, or everyone sees count while active */}
        {(isFarmer ||
          auction.status === 'selesai' ||
          auction.status === 'berakhir') &&
          auction.bids.length > 0 && (
            <div className='mt-6 rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-6 shadow-sm'>
              <h2 className='mb-4 text-lg font-bold dark:text-gray-100 text-slate-900'>
                Daftar Penawaran ({auction.bids.length})
              </h2>
              <div className='space-y-3'>
                {auction.bids.map((b) => (
                  <div
                    key={b.id}
                    className={`rounded-lg border dark:border-white/10 border-black/10 p-4 ${b.status === 'accepted' ? 'dark:bg-green-500/10 bg-green-50' : 'dark:bg-white/[0.02] bg-slate-50'}`}
                  >
                    <div className='flex items-center justify-between'>
                      <div>
                        <span className='text-sm font-semibold dark:text-gray-100 text-slate-900'>
                          {b.buyer.businessName || b.buyer.name}
                        </span>
                        {b.status === 'accepted' && (
                          <span className='ml-2 rounded dark:bg-green-500/15 dark:text-green-400 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'>
                            Pemenang
                          </span>
                        )}
                        {b.status === 'declined' && (
                          <span className='ml-2 rounded dark:bg-red-500/15 dark:text-red-400 bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700'>
                            Ditolak
                          </span>
                        )}
                      </div>
                      <span className='text-xs dark:text-[#8b9e93] text-slate-500'>
                        {formatDateTime(b.createdAt)}
                      </span>
                    </div>
                    <div className='mt-2 flex gap-4 text-sm'>
                      <span className='dark:text-gray-100 text-slate-900'>
                        {formatRupiah(b.pricePerUnit)}/{auction.unit}
                      </span>
                      <span className='dark:text-[#8b9e93] text-slate-500'>
                        {b.quantity.toLocaleString('id-ID')} {auction.unit}
                      </span>
                    </div>
                    {b.message && (
                      <p className='mt-2 text-sm dark:text-gray-300 text-slate-600'>
                        {b.message}
                      </p>
                    )}
                    {canSelectWinner && b.status === 'pending' && (
                      <button
                        onClick={async () => {
                          if (!confirm('Pilih sebagai pemenang?')) return;
                          const res = await fetch(
                            `/api/v1/auctions/${id}/select`,
                            {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ bidId: b.id }),
                            },
                          );
                          const data = await res.json();
                          if (res.ok) {
                            alert('Pemenang dipilih!');
                            fetchAuction();
                          } else {
                            alert(data.error);
                          }
                        }}
                        className='mt-2 rounded-lg bg-green-700 px-4 py-1 text-xs font-semibold text-white hover:bg-green-800'
                      >
                        Pilih Sebagai Pemenang
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {auction.bids.length === 0 && isFarmer && (
          <div className='mt-6 rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-6 shadow-sm text-center'>
            <p className='dark:text-[#8b9e93] text-slate-500'>
              Belum ada penawaran masuk.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
