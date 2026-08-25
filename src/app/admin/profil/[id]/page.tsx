"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Header from "@/components/Header";

interface UserData {
  id: string;
  email: string;
  role: string;
  name: string;
  phone: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  verificationStatus: string;
  businessName: string | null;
  npwp: string | null;
  nib: string | null;
  businessType: string | null;
  groupFarmerNumber: string | null;
  createdAt: string;
  updatedAt: string;
  userCommodities: { commodity: { id: string; name: string } }[];
}

export default function AdminUserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser, loading: authLoading } = useAuth();
  const [target, setTarget] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    businessName: "",
    npwp: "",
    nib: "",
    businessType: "",
    groupFarmerNumber: "",
    verificationStatus: "",
  });

  useEffect(() => {
    if (!authLoading && (!currentUser || currentUser.role !== "admin")) {
      router.push("/masuk");
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    if (currentUser?.role === "admin" && params.id) fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, params.id]);

  async function fetchUser() {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/users/${params.id}`);
      if (!res.ok) {
        router.push("/admin/dashboard");
        return;
      }
      const data = await res.json();
      setTarget(data.user);
      setForm({
        name: data.user.name || "",
        phone: data.user.phone || "",
        address: data.user.address || "",
        businessName: data.user.businessName || "",
        npwp: data.user.npwp || "",
        nib: data.user.nib || "",
        businessType: data.user.businessType || "",
        groupFarmerNumber: data.user.groupFarmerNumber || "",
        verificationStatus: data.user.verificationStatus || "",
      });
    } catch {
      console.error("Gagal memuat profil");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch(`/api/v1/admin/users/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setTarget(data.user);
        setEditing(false);
        setMsg("Profil berhasil disimpan");
        setTimeout(() => setMsg(""), 3000);
      } else {
        setMsg("Gagal menyimpan");
      }
    } catch {
      setMsg("Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) return <div className="flex min-h-screen items-center justify-center dark:text-[#8b9e93] text-slate-500">Memuat...</div>;
  if (!target) return <div className="flex min-h-screen items-center justify-center dark:text-[#8b9e93] text-slate-500">User tidak ditemukan</div>;

  const isPetani = target.role === "petani";

  return (
    <div className="min-h-screen dark:bg-[#0d1410] bg-slate-50">
      <Header />

      <main className="mx-auto max-w-3xl px-6 py-8">
        <Link href="/admin/dashboard" className="mb-4 inline-block text-sm dark:text-green-400 text-green-600 hover:underline">&larr; Dashboard</Link>
        <div className="mb-4 flex gap-3">
          <Link href="/admin/petani" className="text-sm dark:text-[#8b9e93] text-slate-500 hover:dark:text-green-400 hover:text-green-600">Daftar Petani</Link>
          <Link href="/admin/pembeli" className="text-sm dark:text-[#8b9e93] text-slate-500 hover:dark:text-green-400 hover:text-green-600">Daftar Pembeli</Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold dark:text-gray-100 text-slate-900">Profil User</h1>
            <p className="text-sm dark:text-[#8b9e93] text-slate-500">{target.email}</p>
          </div>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800">
              Edit Profil
            </button>
          ) : (
            <span className="rounded bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">Mode Edit</span>
          )}
        </div>

        {msg && (
          <div className={`mt-4 rounded-lg px-4 py-2 text-sm ${msg.includes("berhasil") ? "dark:bg-green-500/15 dark:text-green-400 bg-green-50 text-green-700" : "dark:bg-red-500/15 dark:text-red-400 bg-red-50 text-red-700"}`}>
            {msg}
          </div>
        )}

        <div className="mt-6 space-y-6">
          {/* Basic Info */}
          <Section title="Informasi Dasar">
            <InfoRow label="ID" value={target.id} />
            <InfoRow label="Email" value={target.email} />
            <InfoRow label="Role" value={target.role === "petani" ? "Petani" : target.role === "pembeli" ? "Pembeli" : "Admin"} />
            {editing ? (
              <div className="mt-3 space-y-3">
                <label className="block text-sm font-medium dark:text-gray-300 text-slate-700">Status Verifikasi</label>
                <select value={form.verificationStatus} onChange={(e) => setForm({ ...form, verificationStatus: e.target.value })} className="w-full rounded-lg border dark:border-white/10 dark:bg-white/5 dark:text-gray-100 border-slate-200 bg-white text-slate-900 px-3 py-2 text-sm">
                  <option value="pending">Menunggu</option>
                  <option value="verified">Terverifikasi</option>
                  <option value="rejected">Ditolak</option>
                </select>
              </div>
            ) : (
              <InfoRow label="Status Verifikasi" value={target.verificationStatus === "verified" ? "Terverifikasi" : target.verificationStatus === "rejected" ? "Ditolak" : "Menunggu"} badge={target.verificationStatus === "verified" ? "green" : target.verificationStatus === "rejected" ? "red" : "yellow"} />
            )}
            <InfoRow label="Terdaftar Sejak" value={new Date(target.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} />
            <InfoRow label="Terakhir Diupdate" value={new Date(target.updatedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} />
          </Section>

          {/* Pribadi */}
          <Section title="Informasi Pribadi">
            {editing ? (
              <div className="space-y-4">
                <Field label="Nama Lengkap" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <Field label="Nomor Telepon" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                <Field label="Alamat" value={form.address} onChange={(v) => setForm({ ...form, address: v })} multiline />
              </div>
            ) : (
              <>
                <InfoRow label="Nama" value={target.name} />
                <InfoRow label="Telepon" value={target.phone} />
                <InfoRow label="Alamat" value={target.address} />
              </>
            )}
          </Section>

          {/* Usaha (petani) */}
          {isPetani && (
            <Section title="Informasi Usaha">
              {editing ? (
                <div className="space-y-4">
                  <Field label="Nama Usaha" value={form.businessName} onChange={(v) => setForm({ ...form, businessName: v })} />
                  <Field label="NPWP" value={form.npwp} onChange={(v) => setForm({ ...form, npwp: v })} />
                  <Field label="NIB" value={form.nib} onChange={(v) => setForm({ ...form, nib: v })} />
                  <Field label="Jenis Usaha" value={form.businessType} onChange={(v) => setForm({ ...form, businessType: v })} />
                  <Field label="Nomor Kelompok Tani" value={form.groupFarmerNumber} onChange={(v) => setForm({ ...form, groupFarmerNumber: v })} />
                </div>
              ) : (
                <>
                  <InfoRow label="Nama Usaha" value={target.businessName || "-"} />
                  <InfoRow label="NPWP" value={target.npwp || "-"} />
                  <InfoRow label="NIB" value={target.nib || "-"} />
                  <InfoRow label="Jenis Usaha" value={target.businessType || "-"} />
                  <InfoRow label="Nomor Kelompok Tani" value={target.groupFarmerNumber || "-"} />
                </>
              )}
            </Section>
          )}

          {/* Komoditas (petani) */}
          {isPetani && target.userCommodities.length > 0 && (
            <Section title="Komoditas">
              <div className="flex flex-wrap gap-2">
                {target.userCommodities.map((uc) => (
                  <span key={uc.commodity.id} className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-500/15 dark:text-green-400">
                    {uc.commodity.name}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Save / Cancel */}
          {editing && (
            <div className="flex gap-3">
              <button onClick={handleSave} disabled={saving} className="rounded-lg bg-green-700 px-6 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50">
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
              <button onClick={() => { setEditing(false); fetchUser(); setMsg(""); }} className="rounded-lg border dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5 border-slate-200 px-6 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Batal
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border dark:border-white/10 border-black/10 bg-white dark:bg-white/[0.03] p-6 shadow-sm">
      <h3 className="mb-4 font-semibold dark:text-gray-100 text-slate-900">{title}</h3>
      {children}
    </div>
  );
}

function InfoRow({ label, value, badge }: { label: string; value: string; badge?: "green" | "red" | "yellow" }) {
  return (
    <div className="flex items-center justify-between border-b dark:border-white/5 border-gray-50 py-2 last:border-0">
      <span className="text-sm dark:text-[#8b9e93] text-slate-500">{label}</span>
      {badge ? (
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${badge === "green" ? "dark:bg-green-500/15 dark:text-green-400 bg-green-100 text-green-700" : badge === "red" ? "dark:bg-red-500/15 dark:text-red-400 bg-red-100 text-red-700" : "dark:bg-yellow-500/15 dark:text-yellow-400 bg-yellow-100 text-yellow-700"}`}>
          {value}
        </span>
      ) : (
        <span className="text-sm font-medium dark:text-gray-100 text-slate-900">{value}</span>
      )}
    </div>
  );
}

function Field({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">{label}</label>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full rounded-lg border dark:border-white/10 dark:bg-white/5 dark:text-gray-100 border-slate-200 bg-white text-slate-900 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border dark:border-white/10 dark:bg-white/5 dark:text-gray-100 border-slate-200 bg-white text-slate-900 px-3 py-2 text-sm focus:border-green-500 focus:outline-none" />
      )}
    </div>
  );
}
