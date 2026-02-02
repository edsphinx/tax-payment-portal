import { db } from "@/lib/db";
import { calculateVat, getQuarterDates } from "@/lib/tax-calculations";
import { TaxReturnStatus, Prisma } from "@prisma/client";
import type { CreateVatInput, UpdateVatInput } from "@/types";

export class VatService {
  static async getByUserId(userId: string) {
    return db.vatReturn.findMany({
      where: { userId },
      orderBy: [{ taxYear: "desc" }, { quarter: "desc" }],
      include: { payment: true },
    });
  }

  static async getById(id: string, userId: string) {
    return db.vatReturn.findFirst({
      where: { id, userId },
      include: { payment: true, user: true },
    });
  }

  static async getByPeriod(userId: string, taxYear: number, quarter: number) {
    return db.vatReturn.findUnique({
      where: { userId_taxYear_quarter: { userId, taxYear, quarter } },
      include: { payment: true },
    });
  }

  static async create(userId: string, input: CreateVatInput) {
    const { taxYear, quarter, totalRetailSales, previousCredits = 0, salesBreakdown, ...rest } = input;

    const calculation = calculateVat({
      totalRetailSales,
      previousCredits,
    });

    const { start: periodStart, end: periodEnd } = getQuarterDates(taxYear, quarter);

    return db.vatReturn.create({
      data: {
        userId,
        taxYear,
        quarter,
        periodStart,
        periodEnd,
        totalRetailSales,
        valueAdded: calculation.valueAdded,
        vatOwed: calculation.baseVatOwed,
        previousCredits,
        totalDue: calculation.totalDue,
        status: TaxReturnStatus.DRAFT,
        salesBreakdown: salesBreakdown as unknown as Prisma.InputJsonValue | undefined,
        ...rest,
      },
    });
  }

  static async update(id: string, userId: string, input: UpdateVatInput) {
    const existing = await this.getById(id, userId);
    if (!existing) {
      throw new Error("VAT return not found");
    }

    if (existing.status !== TaxReturnStatus.DRAFT) {
      throw new Error("Cannot modify a submitted return");
    }

    const { salesBreakdown, ...restInput } = input;

    let calculationData = {};
    if (input.totalRetailSales !== undefined || input.previousCredits !== undefined) {
      const totalRetailSales = input.totalRetailSales ?? Number(existing.totalRetailSales);
      const previousCredits = input.previousCredits ?? Number(existing.previousCredits);

      const calculation = calculateVat({
        totalRetailSales,
        previousCredits,
      });

      calculationData = {
        totalRetailSales,
        valueAdded: calculation.valueAdded,
        vatOwed: calculation.baseVatOwed,
        previousCredits,
        totalDue: calculation.totalDue,
      };
    }

    return db.vatReturn.update({
      where: { id },
      data: {
        ...restInput,
        ...calculationData,
        ...(salesBreakdown !== undefined && { salesBreakdown: salesBreakdown as unknown as Prisma.InputJsonValue }),
      },
    });
  }

  static async submit(id: string, userId: string, signatureData: string) {
    const existing = await this.getById(id, userId);
    if (!existing) {
      throw new Error("VAT return not found");
    }

    if (existing.status !== TaxReturnStatus.DRAFT) {
      throw new Error("Return already submitted");
    }

    if (!signatureData) {
      throw new Error("Signature is required");
    }

    return db.vatReturn.update({
      where: { id },
      data: {
        status: TaxReturnStatus.SUBMITTED,
        signatureData,
        signedAt: new Date(),
        certificationAccepted: true,
        submittedAt: new Date(),
      },
    });
  }

  static async delete(id: string, userId: string) {
    const existing = await this.getById(id, userId);
    if (!existing) {
      throw new Error("VAT return not found");
    }

    if (existing.status !== TaxReturnStatus.DRAFT) {
      throw new Error("Cannot delete a submitted return");
    }

    return db.vatReturn.delete({
      where: { id },
    });
  }
}
