'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from '@/components/ui/pagination';
import { useTranslations } from 'next-intl';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  unit: string;
  grade: string;
  quantityAvailable: number;
  latitude: number;
  longitude: number;
  distance_km?: number;
  createdAt: string;
  farmer: {
    id: string;
    name: string;
    businessName: string;
    verificationStatus: string;
  };
  commodity: { id: string; name: string; category?: { name: string } };
  photos: { id: string; fileUrl: string; isPrimary: boolean }[];
}

interface Commodity {
  id: string;
  name: string;
}

const ITEMS_PER_PAGE = 12;

function generatePageNumbers(current: number, totalPages: number): (number | 'ellipsis')[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | 'ellipsis')[] = [1];
  if (current > 3) pages.push('ellipsis');
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < totalPages - 2) pages.push('ellipsis');
  pages.push(totalPages);
  return pages;
}

export default function ProdukPage() {
  const t = useTranslations('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mode, setMode] = useState<'all' | 'nearby'>('all');
  const [geoLoading, setGeoLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    commodity_id: '',
    grade: '',
    min_price: '',
    max_price: '',
    radius_km: '50',
    sort: 'newest',
  });

  useEffect(() => {
    fetchCommodities();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(ITEMS_PER_PAGE));
    params.set('sort', filters.sort);
    if (filters.commodity_id) params.set('commodity_id', filters.commodity_id);
    if (filters.grade) params.set('grade', filters.grade);
    if (filters.min_price) params.set('min_price', filters.min_price);
    if (filters.max_price) params.set('max_price', filters.max_price);
    try {
      const res = await fetch(`/api/v1/products?${params}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotal(data.pagination?.total || 0);
    } catch {
      console.error('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  }, [page, filters.commodity_id, filters.grade, filters.min_price, filters.max_price, filters.sort]);

  useEffect(() => {
    if (mode === 'all') {
      fetchProducts();
    }
  }, [page, mode, filters.commodity_id, filters.grade, filters.min_price, filters.max_price, filters.sort, fetchProducts]);

  const fetchNearby = useCallback(
    async (loc?: { lat: number; lng: number }) => {
      const pos = loc || userLocation;
      if (!pos) {
        alert(t('gpsUnavailable'));
        return;
      }
      setLoading(true);
      const params = new URLSearchParams({
        lat: String(pos.lat),
        lng: String(pos.lng),
        radius_km: filters.radius_km,
        type: 'product',
        page: String(page),
        limit: String(ITEMS_PER_PAGE),
      });
      if (filters.commodity_id) params.set('commodity_id', filters.commodity_id);
      if (filters.grade) params.set('grade', filters.grade);
      if (filters.min_price) params.set('min_price', filters.min_price);
      if (filters.max_price) params.set('max_price', filters.max_price);
      try {
        const res = await fetch(`/api/v1/search/nearby?${params}`);
        const data = await res.json();
        setProducts(data.results || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || data.results?.length || 0);
      } catch {
        console.error('Gagal memuat produk terdekat');
      } finally {
        setLoading(false);
      }
    },
    [userLocation, page, filters, t],
  );

  function doGeoLocation(
    onSuccess: (loc: { lat: number; lng: number }) => void,
    attempt = 0,
  ) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLoading(false);
        onSuccess({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.error('Geolocation error:', err.code, err.message);
        if (err.code === 1 && attempt === 0) {
          doGeoLocation(onSuccess, 1);
        } else {
          setGeoLoading(false);
          if (err.code === 1) {
            alert(
              t('locationDenied'),
            );
          } else if (err.code === 2) {
            alert(t('locationUnavailable'));
          } else {
            alert(t('locationFailed'));
          }
        }
      },
      { timeout: 10000, maximumAge: 300000 },
    );
  }

  function requestLocationAndSearch() {
    if (userLocation) {
      fetchNearby();
      return;
    }
    if (!navigator.geolocation) {
      alert(t('geoNotSupported'));
      return;
    }
    if (!window.isSecureContext) {
      alert(
        t('geoNeedsHttps'),
      );
      return;
    }
    if (geoLoading) return;
    setGeoLoading(true);
    doGeoLocation((loc) => {
      setUserLocation(loc);
      setMode('nearby');
      setPage(1);
      fetchNearby(loc);
    });
  }

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
      console.error('Gagal memuat komoditas');
    }
  }

  function handleSearch() {
    setPage(1);
    if (mode === 'nearby') requestLocationAndSearch();
    else fetchProducts();
  }

  function handleFilterChange(key: string, value: string) {
    setFilters({ ...filters, [key]: value });
    setPage(1);
  }

  function switchMode(newMode: 'all' | 'nearby') {
    setMode(newMode);
    setPage(1);
    setTotalPages(1);
    setTotal(0);
  }

  return (
    <div className='min-h-screen dark:bg-[#0d1410] bg-slate-50'>
      <Header />

      <main className='mx-auto max-w-7xl px-6 py-8'>
        <h1 className='mb-6 text-2xl font-bold dark:text-gray-100 text-slate-900'>
          {t('catalogTitle')}
        </h1>

        <div className='mb-8 rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-4 shadow-sm'>
          <div className='mb-4 flex gap-2'>
            <button
              onClick={() => switchMode('all')}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === 'all' ? 'bg-green-700 text-white' : 'dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {t('allProducts')}
            </button>
            <button
              onClick={() => {
                switchMode('nearby');
                if (userLocation) fetchNearby();
                else requestLocationAndSearch();
              }}
              disabled={geoLoading}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === 'nearby' ? 'bg-green-700 text-white' : 'dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 bg-slate-100 text-slate-700 hover:bg-slate-200'} disabled:opacity-50`}
            >
              {geoLoading ? t('searchingLocation') : t('nearest')}
            </button>
          </div>

          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-6'>
            <div>
              <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                {t('commodity')}
              </label>
              <select
                value={filters.commodity_id}
                onChange={(e) => handleFilterChange('commodity_id', e.target.value)}
                className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
              >
                <option value=''>{t('all')}</option>
                {commodities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                {t('grade')}
              </label>
              <select
                value={filters.grade}
                onChange={(e) => handleFilterChange('grade', e.target.value)}
                className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
              >
                <option value=''>{t('all')}</option>
                <option value='A'>Grade A</option>
                <option value='B'>Grade B</option>
                <option value='C'>Grade C</option>
              </select>
            </div>
            <div>
              <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                {t('priceMin')}
              </label>
              <input
                type='number'
                placeholder='Rp 0'
                value={filters.min_price}
                onChange={(e) => handleFilterChange('min_price', e.target.value)}
                className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
              />
            </div>
            <div>
              <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                {t('priceMax')}
              </label>
              <input
                type='number'
                placeholder='Rp 999.999'
                value={filters.max_price}
                onChange={(e) => handleFilterChange('max_price', e.target.value)}
                className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
              />
            </div>
            <div>
              <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                {t('sortBy')}
              </label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
              >
                <option value='newest'>{t('newest')}</option>
                <option value='oldest'>{t('oldest')}</option>
                <option value='price_asc'>{t('lowestPrice')}</option>
                <option value='price_desc'>{t('highestPrice')}</option>
              </select>
            </div>
            {mode === 'nearby' && (
              <div>
                <label className='mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700'>
                  {t('radiusKm')}
                </label>
                <input
                  type='number'
                  min='1'
                  max='500'
                  value={filters.radius_km}
                  onChange={(e) => setFilters({ ...filters, radius_km: e.target.value })}
                  className='w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm'
                />
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            className='mt-4 rounded-lg bg-green-700 px-6 py-2 text-sm font-semibold text-white hover:bg-green-800'
          >
            {t('search')}
          </button>
        </div>

        {loading ? (
          <div className='py-20 text-center dark:text-[#8b9e93] text-slate-500'>
            {t('loadingProducts')}
          </div>
        ) : products.length === 0 ? (
          <div className='py-20 text-center dark:text-[#8b9e93] text-slate-500'>
            {t('noProductsFound')}
          </div>
        ) : (
          <>
            <p className='mb-4 text-sm dark:text-[#8b9e93] text-slate-500'>
              {mode === 'nearby'
                ? t('showingNearby', { count: products.length })
                : t('showing', { count: products.length, total })}
            </p>
            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/produk/${p.id}`}
                  className='group rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 shadow-sm hover:shadow-md'
                >
                  <div className='aspect-[4/3] rounded-t-xl dark:bg-white/5 dark:text-gray-500 bg-slate-200 text-slate-400 flex items-center justify-center'>
                    {p.photos[0] ?
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.photos[0].fileUrl}
                        alt={p.title}
                        className='h-full w-full rounded-t-xl object-cover'
                      /> : (
                      <span className='text-sm'>{t('productPhoto')}</span>
                    )}
                  </div>
                  <div className='p-4'>
                    <div className='mb-2 flex items-center gap-2'>
                      <span className='rounded dark:bg-green-500/15 dark:text-green-400 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700'>
                        {p.commodity.name}
                      </span>
                      <span className='rounded dark:bg-blue-500/15 dark:text-blue-400 bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700'>
                        Grade {p.grade}
                      </span>
                    </div>
                    <h3 className='mb-1 text-sm font-semibold dark:text-gray-100 text-slate-900 line-clamp-2 group-hover:text-green-400'>
                      {p.title}
                    </h3>
                    <p className='mb-2 text-lg font-bold text-green-700'>
                      Rp {p.price.toLocaleString('id-ID')}/{p.unit}
                    </p>
                    <p className='text-xs dark:text-[#8b9e93] text-slate-500'>
                      {t('stock')}: {p.quantityAvailable.toLocaleString('id-ID')}{' '}
                      {p.unit}
                    </p>
                    {p.distance_km !== undefined && (
                      <p className='mt-1 text-xs font-medium text-orange-600'>
                        {p.distance_km} {t('kmFromYou')}
                      </p>
                    )}
                    <p className='mt-2 text-xs dark:text-[#8b9e93] text-slate-500'>
                      {p.farmer.businessName || p.farmer.name}
                    </p>
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
                      onClick={(e) => { e.preventDefault(); if (page > 1) setPage(page - 1); }}
                      className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>

                  {generatePageNumbers(page, totalPages).map((p, i) =>
                    p === 'ellipsis' ? (
                      <PaginationItem key={`ellipsis-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href='#'
                          isActive={p === page}
                          onClick={(e) => { e.preventDefault(); setPage(p); }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href='#'
                      onClick={(e) => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }}
                      className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
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
