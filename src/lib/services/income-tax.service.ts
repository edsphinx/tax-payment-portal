import { db } from "@/lib/db";
import { calculateIncomeTax } from "@/lib/tax-calculations";
import { TaxReturnStatus, Prisma } from "@prisma/client";
import type { CreateIncomeTaxInput, UpdateIncomeTaxInput } from "@/types";

export class IncomeTaxService {
  static async getByUserId(userId: string) {
    return db.incomeTaxReturn.findMany({
      where: { userId },
      orderBy: { taxYear: "desc" },
      include: { payment: true },
    });
  }

  static async getById(id: string, userId: string) {
    return db.incomeTaxReturn.findFirst({
      where: { id, userId },
      include: { payment: true, user: true },
    });
  }

  static async getByYear(userId: string, taxYear: number) {
    return db.incomeTaxReturn.findUnique({
      where: { userId_taxYear: { userId, taxYear } },
      include: { payment: true },
    });
  }

  static async create(userId: string, input: CreateIncomeTaxInput) {
    const { taxYear, grossIncome, entityTaxCredits = 0, otherCredits = 0, incomeSources, ...rest } = input;

    // For backward compatibility, treat grossIncome as employment income
    // The new form separates employmentIncome and businessIncome, but the API still uses grossIncome
    const calculation = calculateIncomeTax({
      employmentIncome: grossIncome, // Treat as employment income for now
      businessIncome: 0,
      entityDistributions: 0,
      mtcCredit: entityTaxCredits + otherCredits, // Combine credits as MTC
    });

    return db.incomeTaxReturn.create({
      data: {
        userId,
        taxYear,
        grossIncome,
        presumedIncome: calculation.aggregatePresumedIncome,
        taxableIncome: calculation.aggregatePresumedIncome,
        taxOwed: calculation.initialTax,
        entityTaxCredits,
        otherCredits,
        totalDue: calculation.totalDue,
        status: TaxReturnStatus.DRAFT,
        incomeSources: incomeSources as unknown as Prisma.InputJsonValue | undefined,
        ...rest,
      },
    });
  }

  static async update(id: string, userId: string, input: UpdateIncomeTaxInput) {
    const existing = await this.getById(id, userId);
    if (!existing) {
      throw new Error("Income tax return not found");
    }

    if (existing.status !== TaxReturnStatus.DRAFT) {
      throw new Error("Cannot modify a submitted return");
    }

    const { incomeSources, ...restInput } = input;

    let calculationData = {};
    if (input.grossIncome !== undefined || input.entityTaxCredits !== undefined || input.otherCredits !== undefined) {
      const grossIncome = input.grossIncome ?? Number(existing.grossIncome);
      const entityTaxCredits = input.entityTaxCredits ?? Number(existing.entityTaxCredits);
      const otherCredits = input.otherCredits ?? Number(existing.otherCredits);

      // For backward compatibility, treat grossIncome as employment income
      const calculation = calculateIncomeTax({
        employmentIncome: grossIncome,
        businessIncome: 0,
        entityDistributions: 0,
        mtcCredit: entityTaxCredits + otherCredits,
      });

      calculationData = {
        grossIncome,
        presumedIncome: calculation.aggregatePresumedIncome,
        taxableIncome: calculation.aggregatePresumedIncome,
        taxOwed: calculation.initialTax,
        entityTaxCredits,
        otherCredits,
        totalDue: calculation.totalDue,
      };
    }

    return db.incomeTaxReturn.update({
      where: { id },
      data: {
        ...restInput,
        ...calculationData,
        ...(incomeSources !== undefined && { incomeSources: incomeSources as unknown as Prisma.InputJsonValue }),
      },
    });
  }

  static async submit(id: string, userId: string, signatureData: string) {
    const existing = await this.getById(id, userId);
    if (!existing) {
      throw new Error("Income tax return not found");
    }

    if (existing.status !== TaxReturnStatus.DRAFT) {
      throw new Error("Return already submitted");
    }

    if (!signatureData) {
      throw new Error("Signature is required");
    }

    return db.incomeTaxReturn.update({
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
      throw new Error("Income tax return not found");
    }

    if (existing.status !== TaxReturnStatus.DRAFT) {
      throw new Error("Cannot delete a submitted return");
    }

    return db.incomeTaxReturn.delete({
      where: { id },
    });
  }
}
