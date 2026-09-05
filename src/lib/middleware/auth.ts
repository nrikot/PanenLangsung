import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  verificationStatus: string;
}

export async function withAuth(
  request: NextRequest,
  handler: (user: AuthenticatedUser) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Silakan login terlebih dahulu" },
        { status: 401 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, role: true, verificationStatus: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "Forbidden", message: "User tidak ditemukan di database" },
        { status: 403 }
      );
    }

    if (dbUser.verificationStatus === "rejected" && dbUser.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden", message: "Akun Anda telah ditolak oleh admin. Silakan hubungi admin untuk informasi lebih lanjut." },
        { status: 403 }
      );
    }

    return handler(dbUser);
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export function withRole(
  request: NextRequest,
  allowedRoles: string[],
  handler: (user: AuthenticatedUser) => Promise<NextResponse>
): Promise<NextResponse> {
  return withAuth(request, async (user) => {
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: `Akses ditolak. Hanya role ${allowedRoles.join(", ")} yang diizinkan`,
        },
        { status: 403 }
      );
    }
    return handler(user);
  });
}
