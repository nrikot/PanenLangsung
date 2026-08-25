"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface Product {
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
  createdAt: string;
  farmer: { id: string; name: string; businessName: string; phone: string; address: string; latitude: number | null; longitude: number | null; verificationStatus: string };
  commodity: { id: string; name: string; category: { name: string } };
  photos: { id: string; fileUrl: string; isPrimary: boolean }[];
}

export default function ProdukDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const openLightbox = useCallback((index: number) => {
    setSelectedPhoto(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const prevPhoto = useCallback(() => {
    if (!product) return;
    setSelectedPhoto((prev) => (prev === 0 ? product.photos.length - 1 : prev - 1));
  }, [product]);

  const nextPhoto = useCallback(() => {
    if (!product) return;
    setSelectedPhoto((prev) => (prev === product.photos.length - 1 ? 0 : prev + 1));
  }, [product]);

  useEffect(() => {
    if (!lightboxOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "ArrowRight") nextPhoto();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, closeLightbox, prevPhoto, nextPhoto]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/v1/products/${params.id}`);
        const data = await res.json();
        setProduct(data.product);
      } catch {
        console.error("Gagal memuat produk");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) return <div className="flex min-h-screen items-center justify-center dark:bg-[#0d1410] bg-slate-50">Memuat...</div>;
  if (!product) return <div className="flex min-h-screen items-center justify-center dark:bg-[#0d1410] bg-slate-50 dark:text-[#8b9e93] text-slate-500">Produk tidak ditemukan</div>;

  return (
    <div className="min-h-screen dark:bg-[#0d1410] bg-slate-50">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Link href="/produk" className="mb-4 inline-block text-sm dark:text-green-400 text-green-600 hover:underline">&larr; Kembali ke Katalog</Link>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Foto */}
          <div>
            <div
              className="aspect-square rounded-xl dark:bg-white/5 dark:text-gray-500 bg-slate-200 text-slate-400 flex items-center justify-center cursor-pointer overflow-hidden"
              onClick={() => product.photos.length > 0 && openLightbox(selectedPhoto)}
            >
              {product.photos[selectedPhoto] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.photos[selectedPhoto].fileUrl} alt={product.title} className="h-full w-full rounded-xl object-cover" />
              ) : product.photos[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.photos[0].fileUrl} alt={product.title} className="h-full w-full rounded-xl object-cover" />
              ) : (
                <span>Foto Produk</span>
              )}
            </div>
            {product.photos.length > 1 && (
              <div className="mt-4 grid grid-cols-5 gap-2">
                {product.photos.map((ph, idx) => (
                  <div
                    key={ph.id}
                    className={`aspect-square rounded-lg dark:bg-white/5 bg-slate-200 cursor-pointer overflow-hidden transition-all ${idx === selectedPhoto ? "ring-2 ring-green-500" : "opacity-70 hover:opacity-100"}`}
                    onClick={() => setSelectedPhoto(idx)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ph.fileUrl} alt="" className="h-full w-full rounded-lg object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded dark:bg-green-500/15 dark:text-green-400 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">{product.commodity.name}</span>
              <span className="rounded dark:bg-blue-500/15 dark:text-blue-400 bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Grade {product.grade}</span>
              {product.isPreorder && <span className="rounded dark:bg-yellow-500/15 dark:text-yellow-400 bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">Pre-Order</span>}
            </div>

            <h1 className="mb-4 text-2xl font-bold dark:text-gray-100 text-slate-900">{product.title}</h1>
            <p className="mb-6 text-3xl font-bold text-green-700">
              Rp {product.price.toLocaleString("id-ID")}<span className="text-base font-normal dark:text-[#8b9e93] text-slate-500">/{product.unit}</span>
            </p>

            <div className="mb-6 space-y-3 rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-4">
              <InfoRow label="Stok Tersedia" value={`${product.quantityAvailable.toLocaleString("id-ID")} ${product.unit}`} />
              <InfoRow label="Grade" value={`Grade ${product.grade}`} />
              {product.harvestDate && <InfoRow label="Estimasi Panen" value={new Date(product.harvestDate).toLocaleDateString("id-ID")} />}
              <InfoRow label="Lokasi" value={`${product.latitude}, ${product.longitude}`} />
            </div>

            <h3 className="mb-2 font-semibold dark:text-gray-100 text-slate-900">Deskripsi</h3>
            <div className="mb-6">
              {product.description.split("\n").filter(Boolean).map((line, i) => (
                <p key={i} className="mb-2 dark:text-[#8b9e93] text-slate-500">{line}</p>
              ))}
            </div>

            {/* Penjual */}
            <div className="rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-4">
              <h3 className="mb-3 font-semibold dark:text-gray-100 text-slate-900">Penjual</h3>
              <InfoRow label="Nama" value={product.farmer.name} />
              <InfoRow label="Usaha" value={product.farmer.businessName || "-"} />
              <InfoRow label="Alamat" value={product.farmer.address} />
              <InfoRow label="Telepon" value={product.farmer.phone} />
              <InfoRow label="Verifikasi" value={product.farmer.verificationStatus === "verified" ? "Terverifikasi" : "Belum Terverifikasi"} />
            </div>

            <div className="mt-6 flex gap-3">
              <Link href="/masuk" className="rounded-lg bg-green-700 px-6 py-3 font-semibold text-white hover:bg-green-800">
                Chat Penjual
              </Link>
              <Link href="/masuk" className="rounded-lg border dark:border-green-500/30 dark:text-green-400 dark:hover:bg-green-500/10 border-green-600 px-6 py-3 font-semibold text-green-600 hover:bg-green-50">
                Ajukan Penawaran
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Lightbox */}
      {lightboxOpen && product.photos.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={closeLightbox}>
          <button onClick={closeLightbox} className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
            <X className="h-6 w-6" />
          </button>

          {product.photos.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); prevPhoto(); }} className="absolute left-4 z-50 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.photos[selectedPhoto].fileUrl} alt={product.title} className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />

          {product.photos.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); nextPhoto(); }} className="absolute right-4 z-50 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
              <ChevronRight className="h-8 w-8" />
            </button>
          )}

          {product.photos.length > 1 && (
            <div className="absolute bottom-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
              {product.photos.map((ph, idx) => (
                <button key={ph.id} onClick={() => setSelectedPhoto(idx)} className={`h-12 w-12 overflow-hidden rounded-lg border-2 transition-all ${idx === selectedPhoto ? "border-white" : "border-transparent opacity-60 hover:opacity-100"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ph.fileUrl} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="dark:text-[#8b9e93] text-slate-500">{label}</span>
      <span className="font-medium dark:text-gray-100 text-slate-900">{value}</span>
    </div>
  );
}
