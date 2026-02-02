import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { VatService } from "@/lib/services/vat.service";
import { z } from "zod";
import type { UpdateVatInput } from "@/types";

const updateSchema = z.object({
  totalRetailSales: z.number().min(0).optional(),
  previousCredits: z.number().min(0).optional(),
  salesBreakdown: z.array(z.object({
    category: z.string(),
    amount: z.number(),
    description: z.string().optional(),
  })).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const vatReturn = await VatService.getById(id, session.user.id);

    if (!vatReturn) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: vatReturn });
  } catch (error) {
    console.error("Error fetching VAT return:", error);
    return NextResponse.json(
      { error: "Failed to fetch VAT return" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateSchema.parse(body);

    const vatReturn = await VatService.update(id, session.user.id, validated as UpdateVatInput);
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
    console.error("Error updating VAT return:", error);
    return NextResponse.json(
      { error: "Failed to update VAT return" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await VatService.delete(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error deleting VAT return:", error);
    return NextResponse.json(
      { error: "Failed to delete VAT return" },
      { status: 500 }
    );
  }
}
