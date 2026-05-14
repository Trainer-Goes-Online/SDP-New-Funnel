import { isValidPhoneNumber } from 'libphonenumber-js';
import { COUNTRIES } from './countries';

export interface FormFields {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  phone: string;
}

export interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  city?: string;
  phone?: string;
}

const NAME_RE = /^[a-zA-Z\s\-'.]{2,}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateFields(fields: FormFields, countryCode: string): FormErrors {
  const errors: FormErrors = {};

  if (!fields.firstName.trim()) {
    errors.firstName = 'First name is required.';
  } else if (!NAME_RE.test(fields.firstName.trim())) {
    errors.firstName = 'Letters, spaces, and hyphens only.';
  }

  if (!fields.lastName.trim()) {
    errors.lastName = 'Last name is required.';
  } else if (!NAME_RE.test(fields.lastName.trim())) {
    errors.lastName = 'Letters, spaces, and hyphens only.';
  }

  if (!fields.email.trim()) {
    errors.email = 'Email address is required.';
  } else if (!EMAIL_RE.test(fields.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }

  if (!fields.city.trim()) {
    errors.city = 'City is required.';
  } else if (fields.city.trim().length < 2) {
    errors.city = 'Enter your city name.';
  }

  if (!fields.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else {
    const country = COUNTRIES.find(c => c.code === countryCode);
    if (country) {
      try {
        const fullNumber = `${country.dial}${fields.phone.trim()}`;
        const valid = isValidPhoneNumber(fullNumber, countryCode as Parameters<typeof isValidPhoneNumber>[1]);
        if (!valid) {
          errors.phone = `Invalid number for ${country.name}. Check digits.`;
        }
      } catch {
        errors.phone = 'Enter a valid phone number.';
      }
    }
  }

  return errors;
}
