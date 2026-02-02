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
    const {
      taxYear,
      // Taxpayer Info
      middleInitial,
      accountingMethod,
      // Address
      addressLine1,
      city,
      state,
      postalCode,
      country,
      // Income
      employmentIncome,
      businessIncome = 0,
      entityDistributions = 0,
      // Credits
      entityTaxCredits = 0,
      otherCredits = 0,
      incomeSources,
      // Preparer
      preparerName,
      preparerEmail,
      preparerPhone,
      preparerAddress,
    } = input;

    // Calculate tax using proper income breakdown
    const calculation = calculateIncomeTax({
      employmentIncome,
      businessIncome,
      entityDistributions,
      mtcCredit: entityTaxCredits + otherCredits,
    });

    // grossIncome is the sum of all income for legacy compatibility
    const grossIncome = employmentIncome + businessIncome;

    return db.incomeTaxReturn.create({
      data: {
        userId,
        taxYear,
        // Taxpayer Info
        middleInitial,
        accountingMethod,
        // Address
        addressLine1,
        city,
        state,
        postalCode,
        country,
        // Income
        employmentIncome,
        businessIncome,
        entityDistributions,
        grossIncome,
        presumedIncome: calculation.aggregatePresumedIncome,
        taxableIncome: calculation.aggregatePresumedIncome,
        taxOwed: calculation.initialTax,
        // Credits
        entityTaxCredits,
        otherCredits,
        totalDue: calculation.totalDue,
        // Status
        status: TaxReturnStatus.DRAFT,
        // Sources
        incomeSources: incomeSources as unknown as Prisma.InputJsonValue | undefined,
        // Preparer
        preparerName,
        preparerEmail: preparerEmail || undefined,
        preparerPhone,
        preparerAddress,
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

    // Build the update data
    const updateData: Prisma.IncomeTaxReturnUpdateInput = {
      ...restInput,
    };

    // Handle income sources JSON field
    if (incomeSources !== undefined) {
      updateData.incomeSources = incomeSources as unknown as Prisma.InputJsonValue;
    }

    // Recalculate if any income or credit fields changed
    const incomeChanged = input.employmentIncome !== undefined ||
                          input.businessIncome !== undefined ||
                          input.entityDistributions !== undefined ||
                          input.entityTaxCredits !== undefined ||
                          input.otherCredits !== undefined;

    if (incomeChanged) {
      const employmentIncome = input.employmentIncome ?? Number(existing.employmentIncome);
      const businessIncome = input.businessIncome ?? Number(existing.businessIncome);
      const entityDistributions = input.entityDistributions ?? Number(existing.entityDistributions);
      const entityTaxCredits = input.entityTaxCredits ?? Number(existing.entityTaxCredits);
      const otherCredits = input.otherCredits ?? Number(existing.otherCredits);

      const calculation = calculateIncomeTax({
        employmentIncome,
        businessIncome,
        entityDistributions,
        mtcCredit: entityTaxCredits + otherCredits,
      });

      updateData.employmentIncome = employmentIncome;
      updateData.businessIncome = businessIncome;
      updateData.entityDistributions = entityDistributions;
      updateData.grossIncome = employmentIncome + businessIncome;
      updateData.presumedIncome = calculation.aggregatePresumedIncome;
      updateData.taxableIncome = calculation.aggregatePresumedIncome;
      updateData.taxOwed = calculation.initialTax;
      updateData.entityTaxCredits = entityTaxCredits;
      updateData.otherCredits = otherCredits;
      updateData.totalDue = calculation.totalDue;
    }

    return db.incomeTaxReturn.update({
      where: { id },
      data: updateData,
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
