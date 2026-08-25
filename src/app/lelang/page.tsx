'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';

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
  farmer: { id: string; name: string; businessName: string };
  commodity: { id: string; name: string };
  _count: { bids: number };
}

interface Commodity {
  id: string;
  name: string;
}

const ITEMS_PER_PAGE = 12;

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
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
function generatePageNumbers(
  current: number,
  totalPages: number,
): (number | 'ellipsis')[] {
  if (totalPages <= 7)
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');
  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(totalPages - 1, current + 1);
    i++
  )
    pages.push(i);
  if (current < totalPages - 2) pages.push('ellipsis');
  pages.push(totalPages);
  return pages;
}

function timeRemaining(endTime: string, status: string): string {
  if (status !== 'aktif') return '';
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return 'Berakhir';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}h ${hours}j`;
  if (hours > 0) return `${hours}j ${mins}m`;
  return `${mins}m`;
}

export default function LelangPublicPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    commodity_id: '',
    status: '',
    sort: 'newest',
  });

  useEffect(() => {
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
  }, []);

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(ITEMS_PER_PAGE),
      sort: filters.sort,
    });
    if (filters.commodity_id) params.set('commodity_id', filters.commodity_id);
    if (filters.status) params.set('status', filters.status);
    const res = await fetch(`/api/v1/auctions?${params}`);
    const data = await res.json();
    setAuctions(data.auctions || []);
    setTotalPages(data.pagination?.totalPages || 1);
    setTotal(data.pagination?.total || 0);
    setLoading(false);
  }, [page, filters.commodity_id, filters.status, filters.sort]);

  useEffect(() => {
    fetchAuctions();
  }, [page, filters.commodity_id, filters.status, filters.sort, fetchAuctions]);

  return (
    <div className='min-h-screen dark:bg-[#0d1410] bg-slate-50'>
      <Header />
      <main className='mx-auto max-w-7xl px-6 py-8'>
        <h1 className='mb-6 text-2xl font-bold dark:text-gray-100 text-slate-900'>
          Lelang Hasil Panen
        </h1>

        <div className='mb-8 rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-4 shadow-sm'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'>
            <div>
              <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                Komoditas
              </label>
              <select
                value={filters.commodity_id}
                onChange={(e) => {
                  setFilters({ ...filters, commodity_id: e.target.value });
                  setPage(1);
                }}
                className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
              >
                <option value=''>Semua</option>
                {commodities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => {
                  setFilters({ ...filters, status: e.target.value });
                  setPage(1);
                }}
                className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
              >
                <option value=''>Semua</option>
                <option value='aktif'>Aktif</option>
                <option value='berakhir'>Berakhir</option>
                <option value='selesai'>Selesai</option>
              </select>
            </div>
            <div>
              <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                Urutkan
              </label>
              <select
                value={filters.sort}
                onChange={(e) => {
                  setFilters({ ...filters, sort: e.target.value });
                  setPage(1);
                }}
                className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
              >
                <option value='newest'>Terbaru</option>
                <option value='oldest'>Terlama</option>
                <option value='price_desc'>Harga Tertinggi</option>
                <option value='price_asc'>Harga Terendah</option>
                <option value='ending_soon'>Segera Berakhir</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className='py-20 text-center dark:text-[#8b9e93] text-slate-500'>
            Memuat lelang...
          </div>
        ) : auctions.length === 0 ? (
          <div className='py-20 text-center dark:text-[#8b9e93] text-slate-500'>
            Belum ada lelang ditemukan.
          </div>
        ) : (
          <>
            <p className='mb-4 text-sm dark:text-[#8b9e93] text-slate-500'>
              Menampilkan {auctions.length} dari {total} lelang
            </p>
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
              {auctions.map((a) => (
                <Link
                  key={a.id}
                  href={`/lelang/${a.id}`}
                  className='group rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5'
                >
                  <div className='mb-3 flex items-center justify-between'>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[a.status] || ''}`}
                    >
                      {a.status}
                    </span>
                    {a.status === 'aktif' && (
                      <span className='rounded dark:bg-green-500/15 dark:text-green-400 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'>
                        {timeRemaining(a.endTime, a.status)}
                      </span>
                    )}
                  </div>
                  <h3 className='mb-2 text-base font-semibold dark:text-gray-100 text-slate-900 line-clamp-2 group-hover:text-green-400'>
                    {a.title}
                  </h3>
                  <div className='mb-2 flex items-center gap-2'>
                    <span className='rounded dark:bg-green-500/15 dark:text-green-400 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'>
                      {a.commodity.name}
                    </span>
                    <span className='rounded dark:bg-blue-500/15 dark:text-blue-400 bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700'>
                      {a.selectionMode === 'otomatis' ? 'Otomatis' : 'Manual'}
                    </span>
                  </div>
                  <div className='space-y-1 text-sm'>
                    <div className='flex justify-between'>
                      <span className='dark:text-[#8b9e93] text-slate-500'>
                        Harga awal
                      </span>
                      <span className='font-semibold dark:text-gray-100 text-slate-900'>
                        {formatRupiah(a.startPrice)}/{a.unit}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='dark:text-[#8b9e93] text-slate-500'>
                        Kuantitas
                      </span>
                      <span className='dark:text-gray-100 text-slate-900'>
                        {a.quantity.toLocaleString('id-ID')} {a.unit}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='dark:text-[#8b9e93] text-slate-500'>
                        Penawaran
                      </span>
                      <span className='dark:text-gray-100 text-slate-900'>
                        {a._count.bids}
                      </span>
                    </div>
                  </div>
                  <div className='mt-3 flex items-center justify-between border-t dark:border-white/10 border-black/10 pt-3'>
                    <span className='text-xs dark:text-[#8b9e93] text-slate-500'>
                      {a.farmer.businessName || a.farmer.name}
                    </span>
                    <span className='text-xs dark:text-[#8b9e93] text-slate-500'>
                      {formatDate(a.endTime)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            {totalPages > 1 && (
              <Pagination className='mt-8'>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href='#'
                      onClick={(e) => {
                        e.preventDefault();
                        if (page > 1) setPage(page - 1);
                      }}
                      className={
                        page <= 1 ? 'pointer-events-none opacity-50' : ''
                      }
                    />
                  </PaginationItem>
                  {generatePageNumbers(page, totalPages).map((p, i) =>
                    p === 'ellipsis' ? (
                      <PaginationItem key={`e-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href='#'
                          isActive={p === page}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(p);
                          }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                  <PaginationItem>
                    <PaginationNext
                      href='#'
                      onClick={(e) => {
                        e.preventDefault();
                        if (page < totalPages) setPage(page + 1);
                      }}
                      className={
                        page >= totalPages
                          ? 'pointer-events-none opacity-50'
                          : ''
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </main>
    </div>
  );
}
