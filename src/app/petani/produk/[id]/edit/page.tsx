"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { buildErrorMessage } from "@/lib/utils";
import Header from "@/components/Header";

interface Commodity {
  id: string;
  name: string;
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
  photos: { id: string; fileUrl: string; isPrimary: boolean }[];
}

export default function EditProdukPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    commodityId: "",
    title: "",
    description: "",
    price: "",
    unit: "kg",
    grade: "A",
    quantityAvailable: "",
    harvestDate: "",
    isPreorder: false,
    latitude: "",
    longitude: "",
    status: "aktif",
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "petani")) {
      router.push("/masuk");
      return;
    }
    if (user) {
      fetchCommodities();
      fetchProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, router, params.id]);

  async function fetchCommodities() {
    const res = await fetch("/api/v1/commodities");
    const data = await res.json();
    const all: Commodity[] = [];
    (data.categories || []).forEach((cat: { commodities: Commodity[] }) => {
      cat.commodities.forEach((c) => all.push(c));
    });
    setCommodities(all);
  }

  async function fetchProduct() {
    try {
      const res = await fetch(`/api/v1/products/${params.id}`);
      const data = await res.json();
      if (!res.ok || !data.product) {
        setError("Produk tidak ditemukan");
        return;
      }
      const p: ProductData = data.product;
      setForm({
        commodityId: p.commodityId,
        title: p.title,
        description: p.description,
        price: String(p.price),
        unit: p.unit,
        grade: p.grade,
        quantityAvailable: String(p.quantityAvailable),
        harvestDate: p.harvestDate ? p.harvestDate.split("T")[0] : "",
        isPreorder: p.isPreorder,
        latitude: String(p.latitude),
        longitude: String(p.longitude),
        status: p.status,
      });
    } catch {
      setError("Gagal memuat produk");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const body = {
        ...form,
        price: parseFloat(form.price),
        quantityAvailable: parseFloat(form.quantityAvailable),
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        harvestDate: form.harvestDate || null,
      };

      const res = await fetch(`/api/v1/products/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(buildErrorMessage(data));

      router.push("/petani/produk");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
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
      formData.append("file", file);
      const res = await fetch(`/api/v1/products/${params.id}/photos`, { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      fetchProduct();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center">Memuat...</div>;

  return (
    <div className="min-h-screen dark:bg-[#0d1410] bg-slate-50">
      <Header />

      <main className="mx-auto max-w-2xl px-6 py-8">
        <Link href="/petani/produk" className="mb-4 inline-block text-sm dark:text-green-400 text-green-600 hover:underline">&larr; Kembali</Link>
        <h1 className="mb-6 text-2xl font-bold dark:text-gray-100 text-slate-900">Edit Produk</h1>

        {error && <div className="dark:bg-red-500/15 dark:text-red-400 mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {/* Photo Upload */}
        <div className="dark:bg-white/[0.03] dark:border-white/10 mb-6 rounded-xl border bg-white border-black/10 p-4 shadow-sm">
          <h3 className="mb-3 font-semibold dark:text-gray-100 text-slate-900">Foto Produk (maks 10)</h3>
          <div className="mb-3 flex gap-2">
            <label className={`cursor-pointer rounded-lg border-2 border-dashed dark:border-white/10 dark:hover:bg-white/5 p-4 text-center text-sm hover:bg-slate-50 ${uploading ? "opacity-50" : ""}`}>
              {uploading ? "Mengunggah..." : "+ Upload Foto"}
              <input type="file" accept="image/jpeg,image/png" onChange={handlePhotoUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
          <p className="text-xs dark:text-gray-500 text-slate-400">Format: JPG/PNG, maks 2MB</p>
        </div>

        <form onSubmit={handleSubmit} className="dark:bg-white/[0.03] dark:border-white/10 space-y-4 rounded-xl border bg-white border-black/10 p-6 shadow-sm">
          <div>
            <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Komoditas <span className="text-red-500">*</span></label>
            <select required value={form.commodityId} onChange={(e) => setForm({ ...form, commodityId: e.target.value })}
              className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm">
              <option value="">Pilih Komoditas</option>
              {commodities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Judul Produk <span className="text-red-500">*</span></label>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Deskripsi <span className="text-red-500">*</span></label>
            <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Harga (Rp) <span className="text-red-500">*</span></label>
              <input required type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Satuan <span className="text-red-500">*</span></label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm">
                <option value="kg">Kilogram (kg)</option>
                <option value="ikat">Ikat</option>
                <option value="ekor">Ekor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Grade <span className="text-red-500">*</span></label>
              <select value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm">
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Kuantitas <span className="text-red-500">*</span></label>
              <input required type="number" min="1" value={form.quantityAvailable} onChange={(e) => setForm({ ...form, quantityAvailable: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm">
                <option value="aktif">Aktif</option>
                <option value="pre_order">Pre-Order</option>
                <option value="habis">Habis</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Estimasi Panen</label>
              <input type="date" value={form.harvestDate} onChange={(e) => setForm({ ...form, harvestDate: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Latitude <span className="text-red-500">*</span></label>
              <input required type="number" step="any" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Longitude <span className="text-red-500">*</span></label>
              <input required type="number" step="any" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isPreorder" checked={form.isPreorder} onChange={(e) => setForm({ ...form, isPreorder: e.target.checked })} className="rounded" />
            <label htmlFor="isPreorder" className="text-sm dark:text-gray-300 text-slate-700">Pre-Order</label>
          </div>

          <button type="submit" disabled={saving}
            className="w-full rounded-lg bg-green-700 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-50">
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </main>
    </div>
  );
}
