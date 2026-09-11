"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Header from "@/components/Header";

interface Product {
  id: string;
  title: string;
  price: number;
  unit: string;
  grade: string;
  quantityAvailable: number;
  status: string;
  commodity: { name: string };
  photos: { fileUrl: string }[];
}

export default function PetaniProdukPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "petani")) {
      router.push("/masuk");
      return;
    }
    if (!user?.id) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    fetch(`/api/v1/products?limit=100&farmer_id=${user.id}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => { if (!controller.signal.aborted) setProducts(data.products || []); })
      .catch((err) => { if (err.name !== "AbortError") console.error("Gagal memuat produk:", err); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });

    return () => { controller.abort(); };
  }, [user, authLoading, router]);

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/v1/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
      }
    } catch {
      console.error("Gagal menghapus");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="min-h-screen dark:bg-[#0d1410] bg-slate-50">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/petani/dashboard" className="mb-2 inline-block text-sm dark:text-green-400 text-green-600 hover:underline">&larr; Dashboard</Link>
            <h1 className="text-2xl font-bold dark:text-gray-100 text-slate-900">Kelola Produk</h1>
          </div>
          <Link href="/petani/produk/tambah" className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800">
            + Tambah Produk
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center dark:text-[#8b9e93] text-slate-500">Memuat produk...</div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-12 text-center shadow-sm">
            <p className="mb-4 text-lg dark:text-[#8b9e93] text-slate-500">Belum ada produk</p>
            <Link href="/petani/produk/tambah" className="rounded-lg bg-green-700 px-6 py-2 text-white hover:bg-green-800">
              Tambah Produk Pertama
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="dark:border-white/10 dark:bg-white/5 dark:text-[#8b9e93] border-b bg-slate-100 text-left text-sm text-slate-500">
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-4 py-3">Komoditas</th>
                  <th className="px-4 py-3">Harga</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Stok</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="dark:border-white/10 border-b last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded dark:bg-white/5 flex-shrink-0 bg-gray-200">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {p.photos[0] && <img src={p.photos[0].fileUrl} alt="" className="h-10 w-10 rounded object-cover" />}
                        </div>
                        <span className="font-medium dark:text-gray-100 text-slate-900 line-clamp-1">{p.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm dark:text-[#8b9e93] text-slate-500">{p.commodity.name}</td>
                    <td className="px-4 py-3 text-sm font-semibold dark:text-green-400 text-green-600">Rp {p.price.toLocaleString("id-ID")}/{p.unit}</td>
                    <td className="px-4 py-3"><span className="rounded dark:bg-blue-500/15 dark:text-blue-400 bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Grade {p.grade}</span></td>
                    <td className="px-4 py-3 text-sm dark:text-[#8b9e93] text-slate-500">{p.quantityAvailable.toLocaleString("id-ID")} {p.unit}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/petani/produk/${p.id}/edit`} className="text-sm dark:text-blue-400 text-blue-600 hover:underline">Edit</Link>
                        <button onClick={() => handleDelete(p.id)} disabled={deleting === p.id} className="text-sm dark:text-red-400 text-red-600 hover:underline disabled:opacity-50">
                          {deleting === p.id ? "..." : "Hapus"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    aktif: "dark:bg-green-500/15 dark:text-green-400 bg-green-100 text-green-700",
    pre_order: "dark:bg-yellow-500/15 dark:text-yellow-400 bg-yellow-100 text-yellow-700",
    habis: "dark:bg-white/5 dark:text-[#8b9e93] bg-gray-100 text-slate-500",
    nonaktif: "dark:bg-red-500/15 dark:text-red-400 bg-red-100 text-red-700",
  };
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${colors[status] || "dark:bg-white/5 dark:text-[#8b9e93] bg-gray-100 text-slate-500"}`}>{status.replace("_", " ")}</span>;
}
