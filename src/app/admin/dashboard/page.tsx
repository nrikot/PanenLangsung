"use client";
import DashboardLayout, { DashCard } from "@/components/DashboardLayout";

export default function AdminDashboard() {
  return (
    <DashboardLayout requiredRole="admin" title="Dashboard Admin" subtitle="Panel administrasi PanenLangsung">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DashCard title="Produk" desc="Kelola semua produk" href="/admin/produk" />
        <DashCard title="Verifikasi" desc="Setujui/tolak pengguna" href="/admin/verifikasi" />
        <DashCard title="Petani" desc="Daftar semua petani" href="/admin/petani" />
        <DashCard title="Pembeli" desc="Daftar semua pembeli" href="/admin/pembeli" />
        <DashCard title="Transaksi" desc="Pantau escrow" href="/admin/transaksi" />
        <DashCard title="Sengketa" desc="Kelola sengketa" href="/admin/sengketa" />
      </div>
    </DashboardLayout>
  );
}
