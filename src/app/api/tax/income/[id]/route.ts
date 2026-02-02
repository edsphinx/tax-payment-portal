import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { IncomeTaxService } from "@/lib/services/income-tax.service";
import { z } from "zod";
import type { UpdateIncomeTaxInput } from "@/types";

const updateSchema = z.object({
  grossIncome: z.number().min(0).optional(),
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
    const taxReturn = await IncomeTaxService.getById(id, session.user.id);

    if (!taxReturn) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: taxReturn });
  } catch (error) {
    console.error("Error fetching income tax return:", error);
    return NextResponse.json(
      { error: "Failed to fetch income tax return" },
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

    const taxReturn = await IncomeTaxService.update(id, session.user.id, validated as UpdateIncomeTaxInput);
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
    console.error("Error updating income tax return:", error);
    return NextResponse.json(
      { error: "Failed to update income tax return" },
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
    await IncomeTaxService.delete(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error deleting income tax return:", error);
    return NextResponse.json(
      { error: "Failed to delete income tax return" },
      { status: 500 }
    );
  }
}
