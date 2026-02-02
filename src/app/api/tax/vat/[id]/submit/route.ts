import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { VatService } from "@/lib/services/vat.service";
import { z } from "zod";

const submitSchema = z.object({
  signatureData: z.string().min(1, "Signature is required"),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/tax/vat/[id]/submit
 * Submit a VAT return
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { signatureData } = submitSchema.parse(body);

    const vatReturn = await VatService.submit(id, session.user.id, signatureData);
    return NextResponse.json({ data: vatReturn });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error submitting VAT return:", error);
    return NextResponse.json(
      { error: "Failed to submit VAT return" },
      { status: 500 }
    );
  }
}
