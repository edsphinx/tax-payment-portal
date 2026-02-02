import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { IncomeTaxService } from "@/lib/services/income-tax.service";
import { z } from "zod";
import type { CreateIncomeTaxInput } from "@/types";

const createSchema = z.object({
  taxYear: z.number().int().min(2020).max(2030),
  grossIncome: z.number().min(0),
  entityTaxCredits: z.number().min(0).optional(),
  otherCredits: z.number().min(0).optional(),
  incomeSources: z.array(z.object({
    source: z.string(),
    amount: z.number(),
    description: z.string().optional(),
  })).optional(),
  preparerName: z.string().optional(),
  preparerEmail: z.string().email().optional().or(z.literal("")),
  preparerPhone: z.string().optional(),
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
