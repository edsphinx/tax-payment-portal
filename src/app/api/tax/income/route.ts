import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { IncomeTaxService } from "@/lib/services/income-tax.service";
import { z } from "zod";
import type { CreateIncomeTaxInput } from "@/types";

const createSchema = z.object({
  taxYear: z.number().int().min(2020).max(2030),
  // Taxpayer Info
  middleInitial: z.string().max(1).optional(),
  accountingMethod: z.enum(["CASH", "ACCRUAL"]).optional(),
  // Address
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  // Income
  employmentIncome: z.number().min(0),
  businessIncome: z.number().min(0).optional().default(0),
  entityDistributions: z.number().min(0).optional().default(0),
  grossIncome: z.number().min(0).optional(), // Legacy field
  // Credits
  entityTaxCredits: z.number().min(0).optional().default(0),
  otherCredits: z.number().min(0).optional().default(0),
  incomeSources: z.array(z.object({
    source: z.string(),
    amount: z.number(),
    description: z.string().optional(),
  })).optional(),
  // Preparer
  preparerName: z.string().optional(),
  preparerEmail: z.string().email().optional().or(z.literal("")),
  preparerPhone: z.string().optional(),
  preparerAddress: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const returns = await IncomeTaxService.getByUserId(session.user.id);
    return NextResponse.json({ data: returns });
  } catch (error) {
    console.error("Error fetching income tax returns:", error);
    return NextResponse.json(
      { error: "Failed to fetch income tax returns" },
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

    const existing = await IncomeTaxService.getByYear(session.user.id, validated.taxYear);
    if (existing) {
      return NextResponse.json(
        { error: "A return for this tax year already exists", existingId: existing.id },
        { status: 409 }
      );
    }

    const taxReturn = await IncomeTaxService.create(session.user.id, validated as CreateIncomeTaxInput);
    return NextResponse.json({ data: taxReturn }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error creating income tax return:", error);
    return NextResponse.json(
      { error: "Failed to create income tax return" },
      { status: 500 }
    );
  }
}
