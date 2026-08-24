"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    if (!authLoading && user) {
      redirectByRole(user.role);
    }
  }, [user, authLoading]);

  function redirectByRole(role: string) {
    if (role === "admin") router.push("/admin/dashboard");
    else if (role === "petani") router.push("/petani/dashboard");
    else router.push("/pembeli/dashboard");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (authError) throw new Error(authError.message);

      // AuthProvider.onAuthStateChange will handle fetching user data and redirect
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center text-2xl font-bold dark:text-green-400 text-green-600">
          PanenLangsung
        </Link>
        <div className="rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-8 shadow-sm text-center dark:text-gray-400 text-slate-500">
          Memuat...
        </div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="w-full max-w-md">
      <Link href="/" className="mb-8 block text-center text-2xl font-bold dark:text-green-400 text-green-600">
        PanenLangsung
      </Link>

      <div className="rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-8 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-bold dark:text-gray-100 text-slate-900">Masuk</h1>

        {registered && (
          <div className="mb-4 rounded-lg dark:bg-green-500/10 bg-green-50 p-3 text-sm dark:text-green-400 text-green-700">
            Registrasi berhasil! Silakan masuk.
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg dark:bg-red-500/10 bg-red-50 p-3 text-sm dark:text-red-400 text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Email</label>
            <input
              type="email" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">Password</label>
            <input
              type="password" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50">
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm dark:text-[#8b9e93] text-slate-500">
          Belum punya akun?{" "}
          <Link href="/daftar" className="font-semibold dark:text-green-400 text-green-600 hover:underline">Daftar</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center dark:bg-[#0d1410] bg-slate-50 px-4">
      <Suspense fallback={<div>Memuat...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
