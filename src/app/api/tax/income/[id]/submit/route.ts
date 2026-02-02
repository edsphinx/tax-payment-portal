import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { IncomeTaxService } from "@/lib/services/income-tax.service";
import { z } from "zod";

const submitSchema = z.object({
  signatureData: z.string().min(1, "Signature is required"),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/tax/income/[id]/submit
 * Submit an income tax return
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

    const taxReturn = await IncomeTaxService.submit(id, session.user.id, signatureData);
    return NextResponse.json({ data: taxReturn });
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
    console.error("Error submitting income tax return:", error);
    return NextResponse.json(
      { error: "Failed to submit income tax return" },
      { status: 500 }
    );
  }
}
