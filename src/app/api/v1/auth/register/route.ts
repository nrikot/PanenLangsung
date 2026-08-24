import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RegisterSchema } from "@/lib/validations/auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation Error",
          message: "Data tidak valid",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password, role, ...profileData } = parsed.data;

    const supabase = createServiceClient();

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role },
    });

    if (authError) {
      return NextResponse.json(
        { error: "Registration Error", message: authError.message },
        { status: 400 }
      );
    }

    const user = await prisma.user.create({
      data: {
        id: authUser.user.id,
        email,
        role,
        ...profileData,
      },
    });

    return NextResponse.json(
      {
        message: "Registrasi berhasil",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
          verificationStatus: user.verificationStatus,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Register error:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
