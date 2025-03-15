import { useState, FormEvent, ChangeEvent, FocusEvent } from 'react';
import { validateField, validationPatterns } from '../utils/validationUtils';

type ValidationRules = {
  [key: string]: keyof typeof validationPatterns;
};

type FormErrors<T> = {
  [K in keyof T]?: string;
};

interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: ValidationRules;
  onSubmit: (values: T) => Promise<void> | void;
}

export const useForm = <T extends Record<string, any>>({ 
  initialValues, 
  validationRules = {}, 
  onSubmit 
}: UseFormOptions<T>) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input change
  const handleChange = (e: ChangeEvent<HTMLElement>) => {
    const { name, value } = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (name in errors && errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Validate field on blur
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    const fieldRule = validationRules[name];
    if (fieldRule) {
      const result = validateField(fieldRule, value);
      if (!result.isValid) {
        setErrors(prev => ({
          ...prev,
          [name]: result.errorMessage || ""
        }));
      }
    }
  };

  // Reset form to initial values
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
  };

  // Validate the entire form
  const validateForm = (): boolean => {
    const newErrors: FormErrors<T> = {};
    let isValid = true;

    // Validate each field with a validation rule
    Object.entries(validationRules).forEach(([fieldName, ruleName]) => {
      const value = values[fieldName as keyof T];
      if (typeof value === 'string') {
        const result = validateField(ruleName, value);
        if (!result.isValid) {
          newErrors[fieldName as keyof T] = result.errorMessage;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(values);
      // Form submission was successful
    } catch (error) {
      // Form submission failed
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Set a specific field value programmatically
  const setFieldValue = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  // Set the entire form values
  const setFormValues = (newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFormValues,
    validateForm
  };
};