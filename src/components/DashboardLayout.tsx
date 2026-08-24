"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Header from "@/components/Header";

interface DashboardLayoutProps {
  requiredRole?: string;
  title?: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}

export default function DashboardLayout({
  requiredRole,
  title,
  subtitle,
  backHref,
  backLabel,
  children,
}: DashboardLayoutProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!user || (requiredRole && user.role !== requiredRole))) {
      router.push("/masuk");
    }
  }, [user, authLoading, requiredRole, router]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>
        Memuat...
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--background)" }}>
      <Header />
      <main className="mx-auto max-w-7xl px-5 py-6 sm:px-6 sm:py-8">
        {backHref && (
          <Link href={backHref} className="mb-4 inline-block text-sm font-medium transition-colors" style={{ color: "var(--hero-dot)" }}>
            &larr; {backLabel || "Dashboard"}
          </Link>
        )}
        {title && (
          <>
            <h1 className="mb-1 text-xl font-extrabold tracking-tight sm:text-2xl" style={{ color: "var(--feature-heading)" }}>
              {title}
            </h1>
            {subtitle && (
              <p className="mb-6 text-sm sm:mb-8" style={{ color: "var(--feature-sub)" }}>
                {subtitle}
              </p>
            )}
          </>
        )}
        {children}
      </main>
    </div>
  );
}

export function DashCard({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{ borderColor: "var(--feature-card-border)", backgroundColor: "var(--feature-card-bg)" }}
    >
      <h3 className="text-base font-bold sm:text-lg" style={{ color: "var(--feature-heading)" }}>{title}</h3>
      <p className="mt-1 text-sm" style={{ color: "var(--feature-sub)" }}>{desc}</p>
    </Link>
  );
}

export function StubCard({ message }: { message?: string }) {
  return (
    <div
      className="rounded-xl border p-12 text-center shadow-sm"
      style={{ borderColor: "var(--feature-card-border)", backgroundColor: "var(--feature-card-bg)" }}
    >
      <p className="text-base" style={{ color: "var(--feature-sub)" }}>
        {message || "Halaman ini akan segera hadir."}
      </p>
    </div>
  );
}
