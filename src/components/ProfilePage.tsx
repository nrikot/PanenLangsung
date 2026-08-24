"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Header from "@/components/Header";

interface ProfileData {
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

export default function ProfilPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
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
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/masuk");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/me");
      const data = await res.json();
      if (data.user) {
        setProfile(data.user);
        setForm({
          name: data.user.name || "",
          phone: data.user.phone || "",
          address: data.user.address || "",
          businessName: data.user.businessName || "",
          npwp: data.user.npwp || "",
          nib: data.user.nib || "",
          businessType: data.user.businessType || "",
          groupFarmerNumber: data.user.groupFarmerNumber || "",
        });
      }
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
      const res = await fetch("/api/v1/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("Profil berhasil disimpan");
        setEditing(false);
        setProfile(data.user);
        await refreshUser();
        setTimeout(() => setMsg(""), 3000);
      } else {
        const errs = data.details;
        if (errs) {
          const first = Object.values(errs)[0];
          setMsg(Array.isArray(first) ? first[0] : "Gagal menyimpan");
        } else {
          setMsg(data.error || "Gagal menyimpan");
        }
      }
    } catch {
      setMsg("Gagal menyimpan profil");
    } finally {
      setSaving(false);
    }
  }

  const dashboardHref = user?.role === "admin" ? "/admin/dashboard" : user?.role === "petani" ? "/petani/dashboard" : "/pembeli/dashboard";
  const isPetani = user?.role === "petani";

  if (authLoading || loading) return <div className="flex min-h-screen items-center justify-center dark:text-gray-400 text-slate-400">Memuat...</div>;
  if (!profile) return <div className="flex min-h-screen items-center justify-center dark:text-[#8b9e93] text-slate-500">Profil tidak ditemukan</div>;

  return (
    <div className="min-h-screen dark:bg-[#0d1410] bg-slate-50">
      <Header />

      <main className="mx-auto max-w-3xl px-6 py-8">
        <Link href={dashboardHref} className="mb-4 inline-block text-sm dark:text-green-400 text-green-600 hover:underline">&larr; Dashboard</Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold dark:text-gray-100 text-slate-900">Profil Saya</h1>
          {!editing && (
            <button onClick={() => setEditing(true)} className="rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800">
              Edit Profil
            </button>
          )}
        </div>

        {msg && (
          <div className={`mt-4 rounded-lg px-4 py-2 text-sm ${msg.includes("berhasil") ? "bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400"}`}>
            {msg}
          </div>
        )}

        {/* Profile Info */}
        <div className="mt-6 space-y-6">
          {/* Basic Info */}
          <Section title="Informasi Dasar">
            <InfoRow label="Email" value={profile.email} />
            <InfoRow label="Role" value={profile.role === "petani" ? "Petani" : profile.role === "pembeli" ? "Pembeli" : "Admin"} />
            <InfoRow label="Status Verifikasi" value={profile.verificationStatus === "verified" ? "Terverifikasi" : profile.verificationStatus === "rejected" ? "Ditolak" : "Menunggu"} badge={profile.verificationStatus === "verified" ? "green" : profile.verificationStatus === "rejected" ? "red" : "yellow"} />
            <InfoRow label="Terdaftar Sejak" value={new Date(profile.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })} />
          </Section>

          {/* Editable Info */}
          <Section title="Informasi Pribadi">
            {editing ? (
              <div className="space-y-4">
                <Field label="Nama Lengkap" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                <Field label="Nomor Telepon" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                <Field label="Alamat" value={form.address} onChange={(v) => setForm({ ...form, address: v })} multiline />
              </div>
            ) : (
              <>
                <InfoRow label="Nama" value={profile.name} />
                <InfoRow label="Telepon" value={profile.phone} />
                <InfoRow label="Alamat" value={profile.address} />
              </>
            )}
          </Section>

          {/* Business Info (for petani) */}
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
                  <InfoRow label="Nama Usaha" value={profile.businessName || "-"} />
                  <InfoRow label="NPWP" value={profile.npwp || "-"} />
                  <InfoRow label="NIB" value={profile.nib || "-"} />
                  <InfoRow label="Jenis Usaha" value={profile.businessType || "-"} />
                  <InfoRow label="Nomor Kelompok Tani" value={profile.groupFarmerNumber || "-"} />
                </>
              )}
            </Section>
          )}

          {/* Commodities */}
          {isPetani && profile.userCommodities.length > 0 && (
            <Section title="Komoditas">
              <div className="flex flex-wrap gap-2">
                {profile.userCommodities.map((uc) => (
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
              <button onClick={() => { setEditing(false); setForm({ name: profile.name, phone: profile.phone, address: profile.address, businessName: profile.businessName || "", npwp: profile.npwp || "", nib: profile.nib || "", businessType: profile.businessType || "", groupFarmerNumber: profile.groupFarmerNumber || "" }); setMsg(""); }} className="rounded-lg border border-gray-300 px-6 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5">
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
    <div className="rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-6 shadow-sm">
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
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${badge === "green" ? "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400" : badge === "red" ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400"}`}>
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
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm dark:focus:border-green-500 focus:border-green-500 focus:outline-none" />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm dark:focus:border-green-500 focus:border-green-500 focus:outline-none" />
      )}
    </div>
  );
}
