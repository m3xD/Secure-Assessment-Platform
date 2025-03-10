/**
 * Common validation patterns and functions for form inputs
 */

export const validationPatterns = {
  // Name: allows letters, spaces, and some special characters used in names
  fullName: {
    pattern: /^[a-zA-ZÀ-ÖØ-öø-ÿ\s'-]{2,50}$/,
    message: "Name should contain only letters, spaces, hyphens and apostrophes (2-50 characters)"
  },
  
  // Email: standard email validation
  email: {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: "Please enter a valid email address"
  },
  
  // Phone number: supports international formats with optional country code
  phone: {
    pattern: /^(\+?[\d\s-]{8,15})$/,
    message: "Please enter a valid phone number (8-15 digits)"
  },
  
  // Password: requires minimum 6 chars, at least one letter and one number
  password: {
    pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/,
    message: "Password must be at least 6 characters and include a letter and a number"
  }
};

/**
 * Validates a single field with its pattern
 * @param field Field name 
 * @param value Value to validate
 * @returns Object containing validation result and error message if any
 */
export const validateField = (field: keyof typeof validationPatterns, value: string): { isValid: boolean, errorMessage?: string } => {
  if (!validationPatterns[field]) {
    return { isValid: true };
  }
  
  const { pattern, message } = validationPatterns[field];
  
  if (!value || !pattern.test(value)) {
    return { isValid: false, errorMessage: message };
  }
  
  return { isValid: true };
};

/**
 * Validates multiple fields at once
 * @param fields Object containing field names and their values 
 * @returns Object with field names and their validation results
 */
export const validateFields = (fields: Record<string, string>): Record<string, { isValid: boolean, errorMessage?: string }> => {
  const results: Record<string, { isValid: boolean, errorMessage?: string }> = {};
  
  Object.entries(fields).forEach(([field, value]) => {
    if (field in validationPatterns) {
      results[field] = validateField(field as keyof typeof validationPatterns, value);
    }
  });
  
  return results;
};

/**
 * Checks if passwords match
 * @param password Original password
 * @param confirmPassword Confirmation password
 * @returns Validation result for password confirmation
 */
export const validatePasswordMatch = (password: string, confirmPassword: string): { isValid: boolean, errorMessage?: string } => {
  if (password !== confirmPassword) {
    return { 
      isValid: false, 
      errorMessage: "Passwords don't match" 
    };
  }
  return { isValid: true };
};