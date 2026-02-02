import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { VatService } from "@/lib/services/vat.service";
import { z } from "zod";
import type { CreateVatInput } from "@/types";

const createSchema = z.object({
  taxYear: z.number().int().min(2020).max(2030),
  quarter: z.number().int().min(1).max(4),
  // Taxpayer Info
  middleInitial: z.string().max(1).optional(),
  accountingMethod: z.enum(["CASH", "ACCRUAL"]).optional(),
  // Address
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  // Sales
  totalRetailSales: z.number().min(0),
  previousCredits: z.number().min(0).optional().default(0),
  salesBreakdown: z.array(z.object({
    category: z.string(),
    amount: z.number(),
    description: z.string().optional(),
  })).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const returns = await VatService.getByUserId(session.user.id);
    return NextResponse.json({ data: returns });
  } catch (error) {
    console.error("Error fetching VAT returns:", error);
    return NextResponse.json(
      { error: "Failed to fetch VAT returns" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = createSchema.parse(body);

    const existing = await VatService.getByPeriod(session.user.id, validated.taxYear, validated.quarter);
    if (existing) {
      return NextResponse.json(
        { error: "A return for this period already exists", existingId: existing.id },
        { status: 409 }
      );
    }

    const vatReturn = await VatService.create(session.user.id, validated as CreateVatInput);
    return NextResponse.json({ data: vatReturn }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating VAT return:", error);
    return NextResponse.json(
      { error: "Failed to create VAT return" },
      { status: 500 }
    );
  }
}
