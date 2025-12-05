import { createError } from '../middleware/errorHandler';

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * Validate shipping address
 * Ensures all required fields are present and properly formatted
 */
export const validateAddress = (address: ShippingAddress): void => {
  const errors: string[] = [];

  // Validate street
  if (!address.street || address.street.trim().length === 0) {
    errors.push('Street address is required');
  } else if (address.street.trim().length < 5) {
    errors.push('Street address must be at least 5 characters');
  } else if (address.street.length > 200) {
    errors.push('Street address cannot exceed 200 characters');
  }

  // Validate city
  if (!address.city || address.city.trim().length === 0) {
    errors.push('City is required');
  } else if (address.city.trim().length < 2) {
    errors.push('City must be at least 2 characters');
  } else if (address.city.length > 100) {
    errors.push('City cannot exceed 100 characters');
  }

  // Validate state/province
  if (!address.state || address.state.trim().length === 0) {
    errors.push('State/Province is required');
  } else if (address.state.trim().length < 2) {
    errors.push('State/Province must be at least 2 characters');
  } else if (address.state.length > 100) {
    errors.push('State/Province cannot exceed 100 characters');
  }

  // Validate zip code/postal code
  if (!address.zipCode || address.zipCode.trim().length === 0) {
    errors.push('Zip/Postal code is required');
  } else if (address.zipCode.trim().length < 3) {
    errors.push('Zip/Postal code must be at least 3 characters');
  } else if (address.zipCode.length > 20) {
    errors.push('Zip/Postal code cannot exceed 20 characters');
  }

  // Validate country
  if (!address.country || address.country.trim().length === 0) {
    errors.push('Country is required');
  } else if (address.country.trim().length < 2) {
    errors.push('Country must be at least 2 characters');
  } else if (address.country.length > 100) {
    errors.push('Country cannot exceed 100 characters');
  }

  // Kenya-specific validation
  if (address.country.toLowerCase() === 'kenya') {
    // Validate Kenyan phone number format if needed
    // Kenyan postal codes are typically 5 digits
    if (!/^\d{5}$/.test(address.zipCode.trim())) {
      // Not strict - just a warning, not an error
      // Some areas might not have postal codes
    }
  }

  if (errors.length > 0) {
    throw createError('Invalid shipping address', 400, 'INVALID_ADDRESS', errors);
  }
};

/**
 * Normalize address fields (trim whitespace, capitalize properly)
 */
export const normalizeAddress = (address: ShippingAddress): ShippingAddress => {
  return {
    street: address.street.trim(),
    city: address.city.trim(),
    state: address.state.trim(),
    zipCode: address.zipCode.trim(),
    country: address.country.trim(),
  };
};

/**
 * Format address for display
 */
export const formatAddress = (address: ShippingAddress): string => {
  return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
};

