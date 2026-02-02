/**
 * Script to fill missing data in existing tax returns
 * Run with: npx tsx scripts/fill-missing-data.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fillMissingData() {
  console.log("Starting to fill missing data in tax returns...\n");

  // Update Income Tax Returns with missing data
  const incomeReturns = await prisma.incomeTaxReturn.findMany({
    include: { user: true },
  });

  console.log(`Found ${incomeReturns.length} income tax returns`);

  for (const taxReturn of incomeReturns) {
    const updates: Record<string, unknown> = {};

    // Fill address if missing
    if (!taxReturn.addressLine1) {
      updates.addressLine1 = taxReturn.user?.addressLine1 || "123 Main Street";
    }
    if (!taxReturn.city) {
      updates.city = taxReturn.user?.city || "Roatán";
    }
    if (!taxReturn.state) {
      updates.state = taxReturn.user?.state || "Islas de la Bahía";
    }
    if (!taxReturn.postalCode) {
      updates.postalCode = taxReturn.user?.postalCode || "34101";
    }
    if (!taxReturn.country) {
      updates.country = taxReturn.user?.country || "Honduras";
    }

    // Fill taxpayer info if missing
    if (!taxReturn.middleInitial) {
      updates.middleInitial = "A";
    }
    if (!taxReturn.accountingMethod) {
      updates.accountingMethod = "CASH";
    }

    // Fill income breakdown if using legacy grossIncome
    if (Number(taxReturn.employmentIncome) === 0 && Number(taxReturn.grossIncome) > 0) {
      updates.employmentIncome = taxReturn.grossIncome;
    }

    // Fill preparer info if missing (optional - for demo)
    if (!taxReturn.preparerName) {
      updates.preparerName = "Self-Prepared";
    }

    if (Object.keys(updates).length > 0) {
      await prisma.incomeTaxReturn.update({
        where: { id: taxReturn.id },
        data: updates,
      });
      console.log(`  Updated Income Tax ${taxReturn.taxYear}: ${Object.keys(updates).join(", ")}`);
    }
  }

  // Update VAT Returns with missing data
  const vatReturns = await prisma.vatReturn.findMany({
    include: { user: true },
  });

  console.log(`\nFound ${vatReturns.length} VAT returns`);

  for (const vatReturn of vatReturns) {
    const updates: Record<string, unknown> = {};

    // Fill address if missing
    if (!vatReturn.addressLine1) {
      updates.addressLine1 = vatReturn.user?.addressLine1 || "123 Main Street";
    }
    if (!vatReturn.city) {
      updates.city = vatReturn.user?.city || "Roatán";
    }
    if (!vatReturn.state) {
      updates.state = vatReturn.user?.state || "Islas de la Bahía";
    }
    if (!vatReturn.postalCode) {
      updates.postalCode = vatReturn.user?.postalCode || "34101";
    }
    if (!vatReturn.country) {
      updates.country = vatReturn.user?.country || "Honduras";
    }
    if (!vatReturn.email) {
      updates.email = vatReturn.user?.email || "taxpayer@example.com";
    }

    // Fill taxpayer info if missing
    if (!vatReturn.middleInitial) {
      updates.middleInitial = "A";
    }
    if (!vatReturn.accountingMethod) {
      updates.accountingMethod = "CASH";
    }

    if (Object.keys(updates).length > 0) {
      await prisma.vatReturn.update({
        where: { id: vatReturn.id },
        data: updates,
      });
      console.log(`  Updated VAT Q${vatReturn.quarter} ${vatReturn.taxYear}: ${Object.keys(updates).join(", ")}`);
    }
  }

  // Update Users with missing data
  const users = await prisma.user.findMany();

  console.log(`\nFound ${users.length} users`);

  for (const user of users) {
    const updates: Record<string, unknown> = {};

    // Fill name fields if missing
    if (!user.firstName && user.name) {
      const nameParts = user.name.split(" ");
      updates.firstName = nameParts[0];
      if (nameParts.length > 1) {
        updates.lastName = nameParts.slice(1).join(" ");
      }
    }

    // Fill address if missing
    if (!user.addressLine1) {
      updates.addressLine1 = "123 Main Street";
    }
    if (!user.city) {
      updates.city = "Roatán";
    }
    if (!user.state) {
      updates.state = "Islas de la Bahía";
    }
    if (!user.postalCode) {
      updates.postalCode = "34101";
    }
    if (!user.country) {
      updates.country = "Honduras";
    }

    // Generate resident ID if missing
    if (!user.residentId) {
      const randomId = `PRO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      updates.residentId = randomId;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.user.update({
        where: { id: user.id },
        data: updates,
      });
      console.log(`  Updated User ${user.email}: ${Object.keys(updates).join(", ")}`);
    }
  }

  console.log("\nDone filling missing data!");
}

fillMissingData()
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
