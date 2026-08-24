"use client";
import DashboardLayout, { DashCard } from "@/components/DashboardLayout";

export default function PetaniDashboard() {
  return (
    <DashboardLayout requiredRole="petani" title="Dashboard Petani" subtitle="Selamat datang!">
      <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <DashCard title="Produk" desc="Kelola produk Anda" href="/petani/produk" />
        <DashCard title="Lelang" desc="Buka & kelola lelang" href="/petani/lelang" />
        <DashCard title="RFQ" desc="Lihat permintaan penawaran" href="/petani/rfq" />
        <DashCard title="Pesanan" desc="Kelola pesanan masuk" href="/petani/pesanan" />
        <DashCard title="Chat" desc="Inbox negosiasi" href="/petani/chat" />
        <DashCard title="Ulasan" desc="Lihat ulasan dari pembeli" href="/petani/ulasan" />
        <DashCard title="Profil" desc="Profil & verifikasi" href="/petani/profil" />
      </div>
    </DashboardLayout>
  );
}
