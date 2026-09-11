"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations("auth");
  const [step, setStep] = useState<"role" | "form">("role");
  const [role, setRole] = useState<"petani" | "pembeli" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
    businessName: "",
    npwp: "",
    nib: "",
    businessType: "",
    groupFarmerNumber: "",
  });

  function handleRoleSelect(selectedRole: "petani" | "pembeli") {
    setRole(selectedRole);
    setStep("form");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || t("registerFailed"));
      }

      router.push("/masuk?registered=true");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("errorDefault"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center dark:bg-[#0d1410] bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 block text-center text-2xl font-bold dark:text-green-400 text-green-600"
        >
          PanenLangsung
        </Link>

        <div className="rounded-xl border dark:bg-white/[0.03] dark:border-white/10 bg-white border-black/10 p-8 shadow-sm">
          <h1 className="mb-6 text-center text-2xl font-bold dark:text-gray-100 text-slate-900">
            {t("createAccount")}
          </h1>

          {step === "role" && (
            <div className="space-y-4">
              <p className="text-center dark:text-[#8b9e93] text-slate-500">{t("registerAs")}</p>
              <button
                onClick={() => handleRoleSelect("petani")}
                className="w-full rounded-lg border-2 dark:border-green-500/30 dark:hover:bg-green-500/10 border-green-600 hover:bg-green-50 p-4 text-left"
              >
                <span className="text-lg font-semibold dark:text-green-400 text-green-700">{t("farmerTitle")}</span>
                <p className="mt-1 text-sm dark:text-[#8b9e93] text-slate-500">{t("farmerDesc")}</p>
              </button>
              <button
                onClick={() => handleRoleSelect("pembeli")}
                className="w-full rounded-lg border-2 dark:border-blue-500/30 dark:hover:bg-blue-500/10 border-blue-600 hover:bg-blue-50 p-4 text-left"
              >
                <span className="text-lg font-semibold dark:text-blue-400 text-blue-700">{t("buyerTitle")}</span>
                <p className="mt-1 text-sm dark:text-[#8b9e93] text-slate-500">{t("buyerDesc")}</p>
              </button>
            </div>
          )}

          {step === "form" && role && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <button
                type="button"
                onClick={() => setStep("role")}
                className="text-sm dark:text-green-400 text-green-600 hover:underline"
              >
                &larr; {t("backToRole")}
              </button>
              <p className="text-sm dark:text-[#8b9e93] text-slate-500">
                {t("registeringAs")} <span className="font-semibold capitalize">{role}</span>
              </p>

              {error && (
                <div className="rounded-lg dark:bg-red-500/10 bg-red-50 p-3 text-sm dark:text-red-400 text-red-600">{error}</div>
              )}

              <Input label={t("email")} type="email" required value={form.email}
                onChange={(v) => setForm({ ...form, email: v })} />
              <Input label={t("password")} type="password" required value={form.password}
                onChange={(v) => setForm({ ...form, password: v })} />
              <Input label={t("fullName")} required value={form.name}
                onChange={(v) => setForm({ ...form, name: v })} />
              <Input label={t("phoneNumber")} required value={form.phone}
                onChange={(v) => setForm({ ...form, phone: v })} />
              <Input label={t("fullAddress")} required value={form.address}
                onChange={(v) => setForm({ ...form, address: v })} />
              <Input label={t("businessName")} value={form.businessName}
                onChange={(v) => setForm({ ...form, businessName: v })} />

              {role === "pembeli" && (
                <>
                  <Input label={t("npwp")} value={form.npwp}
                    onChange={(v) => setForm({ ...form, npwp: v })} />
                  <Input label={t("nib")} value={form.nib}
                    onChange={(v) => setForm({ ...form, nib: v })} />
                  <Input label={t("businessType")}
                    value={form.businessType}
                    onChange={(v) => setForm({ ...form, businessType: v })} />
                </>
              )}

              {role === "petani" && (
                <Input label={t("groupFarmerNumber")}
                  value={form.groupFarmerNumber}
                  onChange={(v) => setForm({ ...form, groupFarmerNumber: v })} />
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? t("registerLoading") : t("registerButton")}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm dark:text-[#8b9e93] text-slate-500">
            {t("haveAccount")}{" "}
            <Link href="/masuk" className="font-semibold dark:text-green-400 text-green-600 hover:underline">
              {t("loginLink")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  type = "text",
  required = false,
  value,
  onChange,
}: {
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium dark:text-gray-300 text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border dark:bg-white/5 dark:border-white/10 dark:text-gray-100 bg-white border-slate-200 text-slate-900 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
      />
    </div>
  );
}
