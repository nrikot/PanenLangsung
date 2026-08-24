import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware/auth";
import { prisma } from "@/lib/prisma";
import { VerificationDocumentSchema } from "@/lib/validations/auth";

export async function GET(request: NextRequest) {
  return withAuth(request, async (authUser) => {
    const documents = await prisma.verificationDocument.findMany({
      where: { userId: authUser.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ documents });
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (authUser) => {
    try {
      const body = await request.json();
      const parsed = VerificationDocumentSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          {
            error: "Validation Error",
            details: parsed.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      const document = await prisma.verificationDocument.create({
        data: {
          userId: authUser.id,
          documentType: parsed.data.documentType,
          fileUrl: parsed.data.fileUrl,
        },
      });

      return NextResponse.json(
        { message: "Dokumen berhasil diunggah", document },
        { status: 201 }
      );
    } catch (error: unknown) {
      console.error("Upload document error:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  });
}
