"use client";

import DashboardLayout, { DashCard } from "@/components/DashboardLayout";

export default function PembeliDashboard() {
  return (
    <DashboardLayout requiredRole="pembeli" title="Dashboard Pembeli" subtitle="Selamat datang!">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DashCard title="Produk" desc="Cari & beli produk" href="/produk" />
        <DashCard title="RFQ" desc="Buat & kelola RFQ" href="/pembeli/rfq" />
        <DashCard title="Lelang" desc="Ikuti lelang" href="/pembeli/lelang" />
        <DashCard title="Pesanan" desc="Riwayat & tracking" href="/pembeli/pesanan" />
        <DashCard title="Chat" desc="Inbox negosiasi" href="/pembeli/chat" />
        <DashCard title="Ulasan" desc="Beri ulasan" href="/pembeli/ulasan" />
        <DashCard title="Profil" desc="Profil & verifikasi" href="/pembeli/profil" />
      </div>
    </DashboardLayout>
  );
}
