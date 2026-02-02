/**
 * User-related types and interfaces
 */

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  emailVerified: string | null;

  // Próspera-specific
  residentId: string | null;
  firstName: string | null;
  lastName: string | null;
  middleName: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  passportNumber: string | null;
  phone: string | null;

  // Address
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  middleName?: string;
  residentId: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
}

export interface UserAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  residentId?: string;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  passportNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}
