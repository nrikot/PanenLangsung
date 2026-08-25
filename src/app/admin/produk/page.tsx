"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface Product {
  id: string;
  title: string;
  price: number;
  unit: string;
  grade: string;
  quantityAvailable: number;
  status: string;
  createdAt: string;
  farmer: { id: string; name: string; businessName: string | null };
  commodity: { id: string; name: string; category: { name: string } };
  photos: { fileUrl: string; isPrimary: boolean }[];
}

export default function AdminProdukPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/masuk");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, page, statusFilter]);

  async function fetchProducts() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "20");
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/v1/products?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        let filtered = data.products;
        if (search) {
          const q = search.toLowerCase();
          filtered = filtered.filter(
            (p: Product) =>
              p.title.toLowerCase().includes(q) ||
              p.farmer.name.toLowerCase().includes(q) ||
              p.commodity.name.toLowerCase().includes(q)
          );
        }
        setProducts(filtered);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch {
      console.error("Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/v1/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setTotal((prev) => prev - 1);
      }
    } catch {
      alert("Gagal menghapus produk");
    } finally {
      setDeleting(null);
    }
  }

  if (authLoading || !user) return <div className="flex min-h-screen items-center justify-center">Memuat...</div>;

  return (
    <div className="min-h-screen dark:bg-[#0d1410] bg-slate-50">
      <header className="dark:border-white/10 dark:bg-white/[0.03] border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold dark:text-green-400 text-green-600">PanenLangsung</Link>
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-sm dark:text-green-400 text-green-600 hover:underline">Dashboard</Link>
            <span className="rounded dark:bg-red-500/15 dark:text-red-400 bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">Admin</span>
            <span className="text-sm dark:text-[#8b9e93] text-slate-500">{user.name}</span>
            <button onClick={async () => { await signOut(); router.push("/masuk"); }} className="text-sm dark:text-red-400 text-red-600 hover:underline">Keluar</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold dark:text-gray-100 text-slate-900">Kelola Produk</h1>
            <p className="text-sm dark:text-[#8b9e93] text-slate-500">{total} produk terdaftar</p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            placeholder="Cari judul, petani, komoditas..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="flex-1 rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm"
          >
            <option value="">Semua Status</option>
            <option value="aktif">Aktif</option>
            <option value="pre_order">Pre-Order</option>
            <option value="habis">Habis</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
        </div>

        {loading ? (
          <div className="py-12 text-center dark:text-[#8b9e93] text-slate-500">Memuat...</div>
        ) : products.length === 0 ? (
          <div className="py-12 text-center dark:text-[#8b9e93] text-slate-500">Tidak ada produk ditemukan</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="dark:border-white/10 dark:bg-white/5 dark:text-[#8b9e93] border-b bg-slate-100 text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-3">Produk</th>
                  <th className="px-4 py-3">Petani</th>
                  <th className="px-4 py-3">Komoditas</th>
                  <th className="px-4 py-3 text-right">Harga</th>
                  <th className="px-4 py-3 text-center">Grade</th>
                  <th className="px-4 py-3 text-right">Stok</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.photos[0] ? 
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.photos[0].fileUrl} alt="" className="h-10 w-10 rounded object-cover" /> : (
                          <div className="flex h-10 w-10 items-center justify-center rounded dark:bg-white/5 dark:text-gray-500 bg-gray-100 text-xs text-slate-400">?</div>
                        )}
                        <div>
                          <div className="font-medium dark:text-gray-100 text-slate-900 line-clamp-1">{p.title}</div>
                          <div className="text-xs dark:text-gray-500 text-slate-400">{p.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 dark:text-[#8b9e93] text-slate-500">{p.farmer.businessName || p.farmer.name}</td>
                    <td className="px-4 py-3 dark:text-[#8b9e93] text-slate-500">{p.commodity.name}</td>
                    <td className="px-4 py-3 text-right font-medium dark:text-gray-100 text-slate-900">Rp{p.price.toLocaleString("id-ID")}/{p.unit}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded dark:bg-green-500/15 dark:text-green-400 bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">{p.grade}</span>
                    </td>
                    <td className="px-4 py-3 text-right">{p.quantityAvailable} {p.unit}</td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/admin/produk/${p.id}/edit`} className="rounded dark:bg-blue-500/15 dark:text-blue-400 dark:hover:bg-blue-500/25 bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={deleting === p.id}
                          className="rounded dark:bg-red-500/15 dark:text-red-400 dark:hover:bg-red-500/25 bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
                        >
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

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5 border-gray-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <span className="text-sm dark:text-[#8b9e93] text-slate-500">Halaman {page} dari {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5 border-gray-300 px-3 py-1 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Berikutnya
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    aktif: "dark:bg-green-500/15 dark:text-green-400 bg-green-100 text-green-700",
    pre_order: "dark:bg-yellow-500/15 dark:text-yellow-400 bg-yellow-100 text-yellow-700",
    habis: "dark:bg-white/5 dark:text-[#8b9e93] bg-gray-100 text-slate-500",
    nonaktif: "dark:bg-red-500/15 dark:text-red-400 bg-red-100 text-red-700",
  };
  const labels: Record<string, string> = {
    aktif: "Aktif",
    pre_order: "Pre-Order",
    habis: "Habis",
    nonaktif: "Nonaktif",
  };
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-medium ${styles[status] || styles.aktif}`}>
      {labels[status] || status}
    </span>
  );
}
