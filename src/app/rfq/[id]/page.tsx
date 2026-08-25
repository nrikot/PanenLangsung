'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/lib/auth-context';
import { buildErrorMessage } from '@/lib/utils';

interface Rfq {
  id: string; quantity: number; unit: string; targetPrice: number | null;
  deliveryLocation: string; neededBy: string; status: string; createdAt: string;
  buyer: { id: string; name: string; businessName: string; phone: string; address: string; verificationStatus: string };
  commodity: { id: string; name: string };
  quotes: { id: string; pricePerUnit: number; quantity: number; message: string | null; status: string; createdAt: string; farmer: { id: string; name: string; businessName: string } }[];
}

const STATUS_COLORS: Record<string, string> = {
  open: 'dark:bg-green-500/15 dark:text-green-400 bg-green-100 text-green-700',
  closed: 'dark:bg-gray-500/15 dark:text-gray-400 bg-gray-100 text-gray-600',
  cancelled: 'dark:bg-red-500/15 dark:text-red-400 bg-red-100 text-red-700',
};

function formatRupiah(n: number) { return 'Rp ' + n.toLocaleString('id-ID'); }
function formatDate(d: string) { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); }
function formatDateTime(d: string) { return new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }

export default function RfqDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [rfq, setRfq] = useState<Rfq | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quoteForm, setQuoteForm] = useState({ pricePerUnit: '', quantity: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [quoteMsg, setQuoteMsg] = useState('');

  const fetchRfq = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/rfqs/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRfq(data.rfq);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : 'Gagal memuat'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchRfq(); }, [fetchRfq]);

  async function submitQuote(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setQuoteMsg('');
    try {
      const res = await fetch(`/api/v1/rfqs/${id}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pricePerUnit: Number(quoteForm.pricePerUnit), quantity: Number(quoteForm.quantity), message: quoteForm.message || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(buildErrorMessage(data));
      setQuoteMsg('Penawaran berhasil dikirim!');
      setQuoteForm({ pricePerUnit: '', quantity: '', message: '' });
      fetchRfq();
    } catch (e: unknown) { setQuoteMsg(e instanceof Error ? e.message : 'Gagal mengirim penawaran'); }
    finally { setSubmitting(false); }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center dark:bg-[#0d1410] bg-slate-50 dark:text-[#8b9e93] text-slate-500">Memuat...</div>;
  if (error || !rfq) return <div className="flex min-h-screen items-center justify-center dark:bg-[#0d1410] bg-slate-50 dark:text-red-400 text-red-600">{error || 'Tidak ditemukan'}</div>;

  const myQuote = user?.role === 'petani' ? rfq.quotes.find(q => q.farmer.id === user.id) : null;
  const isBuyer = user?.role === 'pembeli' && rfq.buyer.id === user.id;
  const canQuote = user?.role === 'petani' && rfq.status === 'open';
  const canSelectWinner = isBuyer && rfq.status === 'open';

  return (
    <div className="min-h-screen dark:bg-[#0d1410] bg-slate-50">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-8">
        <Link href="/rfq" className="mb-4 inline-block text-sm dark:text-green-400 text-green-600 hover:underline">&larr; Kembali ke RFQ</Link>

        <div className="rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[rfq.status] || ''}`}>{rfq.status}</span>
            <span className="rounded dark:bg-green-500/15 dark:text-green-400 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">{rfq.commodity.name}</span>
          </div>
          <h1 className="mb-4 text-xl font-bold dark:text-gray-100 text-slate-900">Permintaan: {rfq.commodity.name}</h1>

          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg dark:bg-white/5 bg-slate-50 p-3">
              <p className="text-xs dark:text-[#8b9e93] text-slate-500">Kuantitas</p>
              <p className="text-lg font-bold dark:text-gray-100 text-slate-900">{rfq.quantity.toLocaleString('id-ID')} {rfq.unit}</p>
            </div>
            <div className="rounded-lg dark:bg-white/5 bg-slate-50 p-3">
              <p className="text-xs dark:text-[#8b9e93] text-slate-500">Target Harga</p>
              <p className="text-lg font-bold dark:text-gray-100 text-slate-900">{rfq.targetPrice ? formatRupiah(rfq.targetPrice) : '-'}</p>
            </div>
            <div className="rounded-lg dark:bg-white/5 bg-slate-50 p-3">
              <p className="text-xs dark:text-[#8b9e93] text-slate-500">Kebutuhan</p>
              <p className="text-lg font-bold dark:text-gray-100 text-slate-900">{formatDate(rfq.neededBy)}</p>
            </div>
            <div className="rounded-lg dark:bg-white/5 bg-slate-50 p-3">
              <p className="text-xs dark:text-[#8b9e93] text-slate-500">Penawaran</p>
              <p className="text-lg font-bold dark:text-gray-100 text-slate-900">{rfq.quotes.length}</p>
            </div>
          </div>

          <div className="mb-6 space-y-2 text-sm">
            <div className="flex justify-between"><span className="dark:text-[#8b9e93] text-slate-500">Pembeli</span><span className="dark:text-gray-100 text-slate-900">{rfq.buyer.businessName || rfq.buyer.name}</span></div>
            <div className="flex justify-between"><span className="dark:text-[#8b9e93] text-slate-500">Lokasi Pengiriman</span><span className="dark:text-gray-100 text-slate-900 text-right max-w-[60%]">{rfq.deliveryLocation}</span></div>
            <div className="flex justify-between"><span className="dark:text-[#8b9e93] text-slate-500">Dibuat</span><span className="dark:text-gray-100 text-slate-900">{formatDateTime(rfq.createdAt)}</span></div>
          </div>
        </div>

        {/* Quote form for farmers */}
        {canQuote && (
          <div className="mt-6 rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold dark:text-gray-100 text-slate-900">{myQuote ? 'Perbarui Penawaran' : 'Kirim Penawaran'}</h2>
            <form onSubmit={submitQuote} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Harga per Satuan (Rp)</label>
                  <input type="number" required min="1" placeholder="Contoh: 12000" value={quoteForm.pricePerUnit}
                    onChange={e => setQuoteForm({ ...quoteForm, pricePerUnit: e.target.value })}
                    className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Kuantitas ({rfq.unit})</label>
                  <input type="number" required min="1" step="any" placeholder="Contoh: 500" value={quoteForm.quantity}
                    onChange={e => setQuoteForm({ ...quoteForm, quantity: e.target.value })}
                    className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Catatan (opsional)</label>
                <textarea rows={2} maxLength={500} placeholder="Deskripsi penawaran Anda..." value={quoteForm.message}
                  onChange={e => setQuoteForm({ ...quoteForm, message: e.target.value })}
                  className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
              </div>
              <button type="submit" disabled={submitting}
                className="rounded-lg bg-green-700 px-6 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50">
                {submitting ? 'Mengirim...' : myQuote ? 'Perbarui Penawaran' : 'Kirim Penawaran'}
              </button>
              {quoteMsg && <p className={`text-sm ${quoteMsg.includes('berhasil') ? 'dark:text-green-400 text-green-600' : 'dark:text-red-400 text-red-600'}`}>{quoteMsg}</p>}
            </form>
          </div>
        )}

        {/* Quotes list */}
        {rfq.quotes.length > 0 && (
          <div className="mt-6 rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold dark:text-gray-100 text-slate-900">Daftar Penawaran ({rfq.quotes.length})</h2>
            <div className="space-y-3">
              {rfq.quotes.map(q => (
                <div key={q.id} className={`rounded-lg border dark:border-white/10 border-black/10 p-4 ${q.status === 'accepted' ? 'dark:bg-green-500/10 bg-green-50' : 'dark:bg-white/[0.02] bg-slate-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold dark:text-gray-100 text-slate-900">{q.farmer.businessName || q.farmer.name}</span>
                      {q.status === 'accepted' && <span className="ml-2 rounded dark:bg-green-500/15 dark:text-green-400 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Dipilih</span>}
                      {q.status === 'declined' && <span className="ml-2 rounded dark:bg-red-500/15 dark:text-red-400 bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Ditolak</span>}
                    </div>
                    <span className="text-xs dark:text-[#8b9e93] text-slate-500">{formatDateTime(q.createdAt)}</span>
                  </div>
                  <div className="mt-2 flex gap-4 text-sm">
                    <span className="dark:text-gray-100 text-slate-900">{formatRupiah(q.pricePerUnit)}/{rfq.unit}</span>
                    <span className="dark:text-[#8b9e93] text-slate-500">{q.quantity.toLocaleString('id-ID')} {rfq.unit}</span>
                  </div>
                  {q.message && <p className="mt-2 text-sm dark:text-gray-300 text-slate-600">{q.message}</p>}
                  {canSelectWinner && q.status === 'pending' && (
                    <button onClick={async () => {
                      if (!confirm('Pilih penawaran ini?')) return;
                      const res = await fetch(`/api/v1/rfqs/${id}/select`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quoteId: q.id }) });
                      const data = await res.json();
                      if (res.ok) { alert('Penawaran dipilih!'); fetchRfq(); } else { alert(buildErrorMessage(data)); }
                    }} className="mt-2 rounded-lg bg-green-700 px-4 py-1 text-xs font-semibold text-white hover:bg-green-800">
                      Pilih Penawaran Ini
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {rfq.quotes.length === 0 && (
          <div className="mt-6 rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-6 shadow-sm text-center">
            <p className="dark:text-[#8b9e93] text-slate-500">Belum ada penawaran dari petani.</p>
          </div>
        )}
      </main>
    </div>
  );
}
