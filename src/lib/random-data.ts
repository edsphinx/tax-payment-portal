/**
 * Random data generator using RandomUser.me API
 * Used for testing purposes to quickly fill forms with realistic data
 */

interface RandomUserResponse {
  results: Array<{
    name: {
      first: string;
      last: string;
    };
    email: string;
    phone: string;
    dob: {
      date: string;
    };
    location: {
      street: {
        number: number;
        name: string;
      };
      city: string;
      state: string;
      postcode: string | number;
      country: string;
    };
    nat: string;
    id: {
      value: string;
    };
  }>;
}

export interface RandomFormData {
  // Personal info
  firstName: string;
  lastName: string;
  middleInitial: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  residentId: string;

  // Address
  addressLine1: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;

  // Tax-specific random values
  employmentIncome: number;
  businessIncome: number;
  entityDistributions: number;
  mtcCredit: number;
  totalRetailSales: number;
}

/**
 * Generate a random number within a range
 */
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random middle initial
 */
function randomMiddleInitial(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return letters[Math.floor(Math.random() * letters.length)];
}

/**
 * Generate a fake Próspera resident ID
 */
function generateResidentId(): string {
  const prefix = Math.random() > 0.5 ? "PR" : "ER"; // PR = Physical Resident, ER = eResident
  const number = String(randomInRange(10000, 99999));
  const year = String(randomInRange(2020, 2025));
  return `${prefix}-${year}-${number}`;
}

/**
 * Fetch random user data from RandomUser.me API
 */
export async function fetchRandomFormData(): Promise<RandomFormData> {
  try {
    const response = await fetch("https://randomuser.me/api/?nat=us");
    const data: RandomUserResponse = await response.json();
    const user = data.results[0];

    // Generate realistic tax amounts
    const employmentIncome = randomInRange(25000, 250000);
    const businessIncome = Math.random() > 0.6 ? randomInRange(5000, 100000) : 0;
    const entityDistributions = Math.random() > 0.7 ? randomInRange(10000, 50000) : 0;

    // Calculate max MTC based on approximate tax
    const approximateTax = ((employmentIncome - 8000) * 0.5 + businessIncome * 0.5) * 0.1;
    const mtcCredit = Math.random() > 0.5 ? randomInRange(0, Math.min(5000, Math.floor(approximateTax))) : 0;

    // Random retail sales for VAT
    const totalRetailSales = randomInRange(10000, 500000);

    return {
      firstName: user.name.first,
      lastName: user.name.last,
      middleInitial: randomMiddleInitial(),
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dob.date.split("T")[0],
      nationality: "United States",
      residentId: generateResidentId(),
      addressLine1: `${user.location.street.number} ${user.location.street.name}`,
      city: user.location.city,
      state: user.location.state,
      postalCode: String(user.location.postcode),
      country: "Honduras",
      employmentIncome,
      businessIncome,
      entityDistributions,
      mtcCredit,
      totalRetailSales,
    };
  } catch (error) {
    console.error("Failed to fetch random data:", error);
    // Fallback to local random data if API fails
    return generateFallbackData();
  }
}

/**
 * Fallback data generator when API is unavailable
 */
function generateFallbackData(): RandomFormData {
  const firstNames = ["John", "Jane", "Michael", "Sarah", "David", "Emily", "Robert", "Jessica"];
  const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"];
  const cities = ["Roatán", "La Ceiba", "San Pedro Sula", "Tegucigalpa"];
  const states = ["Islas de la Bahía", "Atlántida", "Cortés", "Francisco Morazán"];

  const firstName = firstNames[randomInRange(0, firstNames.length - 1)];
  const lastName = lastNames[randomInRange(0, lastNames.length - 1)];
  const employmentIncome = randomInRange(25000, 250000);
  const businessIncome = Math.random() > 0.6 ? randomInRange(5000, 100000) : 0;
  const entityDistributions = Math.random() > 0.7 ? randomInRange(10000, 50000) : 0;
  const approximateTax = ((employmentIncome - 8000) * 0.5 + businessIncome * 0.5) * 0.1;
  const mtcCredit = Math.random() > 0.5 ? randomInRange(0, Math.min(5000, Math.floor(approximateTax))) : 0;

  return {
    firstName,
    lastName,
    middleInitial: randomMiddleInitial(),
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    phone: `+504 ${randomInRange(9000, 9999)}-${randomInRange(1000, 9999)}`,
    dateOfBirth: `${randomInRange(1960, 2000)}-${String(randomInRange(1, 12)).padStart(2, "0")}-${String(randomInRange(1, 28)).padStart(2, "0")}`,
    nationality: "United States",
    residentId: generateResidentId(),
    addressLine1: `${randomInRange(100, 9999)} Main Street`,
    city: cities[randomInRange(0, cities.length - 1)],
    state: states[randomInRange(0, states.length - 1)],
    postalCode: String(randomInRange(10000, 99999)),
    country: "Honduras",
    employmentIncome,
    businessIncome,
    entityDistributions,
    mtcCredit,
    totalRetailSales: randomInRange(10000, 500000),
  };
}
