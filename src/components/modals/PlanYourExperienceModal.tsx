'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  Checkbox,
  TextInput,
  Select,
  RingProgress,
  Combobox,
  useCombobox,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { cn } from '@/utils/cn';
import {
  step1Schema,
  step2Schema,
  step3Schema,
  serviceOptions,
  guestOptions,
  Step1Data,
  Step2Data,
  Step3Data,
} from '@/lib/validations/threeStepForm';

// Country data for phone input
const countries = [
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', dialCode: '+234' },
  { code: 'US', name: 'United States', flag: '🇺🇸', dialCode: '+1' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', dialCode: '+61' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', dialCode: '+49' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', dialCode: '+39' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', dialCode: '+34' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', dialCode: '+27' },
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', dialCode: '+254' },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', dialCode: '+233' },
];

interface PlanYourExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: {
    step1: Step1Data;
    step2: Step2Data;
    step3: Step3Data;
  }) => void;
  initialData?: {
    location?: string;
    travel_date?: string;
    guests?: string;
  };
}

export const PlanYourExperienceModal: React.FC<
  PlanYourExperienceModalProps
> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default to Nigeria
  const [phoneNumber, setPhoneNumber] = useState('');
  const [formData, setFormData] = useState<{
    step1?: Step1Data;
    step2?: Step2Data;
    step3?: Step3Data;
  }>({});

  // Combobox for country selector
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  // Reset form data when modal opens with new initial data
  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({});
      setCurrentStep(1);
      setShowSuccess(false);
    }
  }, [isOpen, initialData]);

  // Step 1 Form
  const step1Form = useForm({
    defaultValues: {
      services: formData.step1?.services || [],
    },
    validators: {
      onSubmit: step1Schema,
    },
    onSubmit: async ({ value }) => {
      setFormData((prev) => ({ ...prev, step1: value }));
      setCurrentStep(2);
    },
  });

  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  // Step 2 Form
  const step2Form = useForm({
    defaultValues: {
      destination:
        formData.step2?.destination ||
        (initialData?.location
          ? capitalizeFirstLetter(initialData.location)
          : ''),
      arrivalDate:
        formData.step2?.arrivalDate || initialData?.travel_date || '',
      departureDate: formData.step2?.departureDate || '',
      adults: formData.step2?.adults?.toString() || initialData?.guests || '1',
      children: formData.step2?.children?.toString() || '0',
    },
    validators: {
      onSubmit: step2Schema,
    },
    onSubmit: async ({ value }) => {
      setFormData((prev) => ({
        ...prev,
        step2: {
          ...value,
          adults: parseInt(value.adults, 10),
          children: parseInt(value.children, 10),
        },
      }));
      setCurrentStep(3);
    },
  });

  // Step 3 Form
  const step3Form = useForm({
    defaultValues: {
      fullName: formData.step3?.fullName || '',
      email: formData.step3?.email || '',
      phone: formData.step3?.phone || '',
      consent: formData.step3?.consent || false,
    },
    validators: {
      onSubmit: step3Schema,
    },
    onSubmit: async ({ value }) => {
      setFormData((prev) => ({ ...prev, step3: value }));
      setShowSuccess(true);
    },
  });

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setShowSuccess(false);
    setFormData({});
    onClose();
  };

  const handleSuccessAction = (action: 'whatsapp' | 'email') => {
    if (formData.step1 && formData.step2 && formData.step3) {
      onSuccess({
        step1: formData.step1,
        step2: formData.step2,
        step3: formData.step3,
      });
    }
    handleClose();
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 font-lato">
          What services do you need?
        </h3>
        <p className="text-gray-600 text-sm font-lato">
          Select all services you&apos;re interested in for your Nigerian
          experience (choose at least one)
        </p>
      </div>

      <step1Form.Field name="services">
        {(fieldApi) => {
          const value = fieldApi.state.value || [];
          const hasError = fieldApi.state.meta.errors.length > 0;
          const errorMessage = hasError
            ? typeof fieldApi.state.meta.errors[0] === 'string'
              ? fieldApi.state.meta.errors[0]
              : fieldApi.state.meta.errors[0]?.message ||
                'Please select at least one service'
            : '';

          return (
            <div className="space-y-3">
              {serviceOptions.map((option) => (
                <Checkbox
                  key={option.value}
                  label={option.label}
                  checked={value.includes(option.value)}
                  onChange={(e) => {
                    const currentValue = value || [];
                    if (e.currentTarget.checked) {
                      fieldApi.handleChange([...currentValue, option.value]);
                    } else {
                      fieldApi.handleChange(
                        currentValue.filter((v) => v !== option.value)
                      );
                    }
                  }}
                  onBlur={fieldApi.handleBlur}
                  styles={{
                    root: {
                      cursor: 'pointer',
                    },
                    label: {
                      fontSize: '1rem',
                      color: '#374151',
                      fontWeight: 500,
                      fontFamily: 'Lato, sans-serif',
                      cursor: 'pointer',
                    },
                    input: {
                      cursor: 'pointer',
                    },
                  }}
                />
              ))}
              {hasError && (
                <p className="text-sm text-red-600 mt-2">{errorMessage}</p>
              )}
            </div>
          );
        }}
      </step1Form.Field>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 font-lato">
          When and where are you traveling?
        </h3>
        <p className="text-gray-600 text-sm font-lato">
          Help us understand your travel plans and group size
        </p>
      </div>

      <div className="space-y-4">
        {/* Destination */}
        <step2Form.Field name="destination">
          {(fieldApi) => {
            const hasError = fieldApi.state.meta.errors.length > 0;
            const errorMessage = hasError
              ? typeof fieldApi.state.meta.errors[0] === 'string'
                ? fieldApi.state.meta.errors[0]
                : fieldApi.state.meta.errors[0]?.message ||
                  'Destination is required'
              : '';

            return (
              <TextInput
                label="Destination (State/City)"
                placeholder="Lagos, Abuja, Port-Harcourt..."
                value={fieldApi.state.value || ''}
                onChange={(e) => fieldApi.handleChange(e.target.value)}
                onBlur={fieldApi.handleBlur}
                error={errorMessage}
                styles={{
                  input: {
                    height: '3rem',
                    fontSize: '1rem',
                  },
                }}
              />
            );
          }}
        </step2Form.Field>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <step2Form.Field name="arrivalDate">
            {(fieldApi) => {
              const hasError = fieldApi.state.meta.errors.length > 0;
              const errorMessage = hasError
                ? typeof fieldApi.state.meta.errors[0] === 'string'
                  ? fieldApi.state.meta.errors[0]
                  : fieldApi.state.meta.errors[0]?.message ||
                    'Arrival date is required'
                : '';

              return (
                <DatePickerInput
                  label="Arrival Date"
                  placeholder="Select"
                  value={
                    fieldApi.state.value
                      ? new Date(fieldApi.state.value + 'T00:00:00')
                      : null
                  }
                  onChange={(date) =>
                    fieldApi.handleChange(
                      date
                        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                        : ''
                    )
                  }
                  onBlur={fieldApi.handleBlur}
                  error={errorMessage}
                  styles={{
                    input: {
                      height: '3rem',
                      fontSize: '1rem',
                    },
                  }}
                />
              );
            }}
          </step2Form.Field>
          <step2Form.Field name="departureDate">
            {(fieldApi) => {
              const hasError = fieldApi.state.meta.errors.length > 0;
              const errorMessage = hasError
                ? typeof fieldApi.state.meta.errors[0] === 'string'
                  ? fieldApi.state.meta.errors[0]
                  : fieldApi.state.meta.errors[0]?.message ||
                    'Field is required'
                : '';

              return (
                <DatePickerInput
                  label="Departure Date"
                  placeholder="Select"
                  value={
                    fieldApi.state.value
                      ? new Date(fieldApi.state.value + 'T00:00:00')
                      : null
                  }
                  onChange={(date) =>
                    fieldApi.handleChange(
                      date
                        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                        : ''
                    )
                  }
                  onBlur={fieldApi.handleBlur}
                  error={errorMessage}
                  styles={{
                    input: {
                      height: '3rem',
                      fontSize: '1rem',
                    },
                  }}
                />
              );
            }}
          </step2Form.Field>
        </div>

        {/* Guests */}
        <div className="grid grid-cols-2 gap-4">
          <step2Form.Field name="adults">
            {(fieldApi) => {
              const hasError = fieldApi.state.meta.errors.length > 0;
              const errorMessage = hasError
                ? typeof fieldApi.state.meta.errors[0] === 'string'
                  ? fieldApi.state.meta.errors[0]
                  : fieldApi.state.meta.errors[0]?.message ||
                    'Field is required'
                : '';

              return (
                <Select
                  label="Adults"
                  placeholder="Select"
                  data={guestOptions.slice(1)} // Remove 0 option for adults
                  value={fieldApi.state.value || '1'}
                  onChange={(value) => fieldApi.handleChange(value || '1')}
                  onBlur={fieldApi.handleBlur}
                  error={errorMessage}
                  styles={{
                    input: {
                      height: '3rem',
                      fontSize: '1rem',
                    },
                  }}
                />
              );
            }}
          </step2Form.Field>
          <step2Form.Field name="children">
            {(fieldApi) => {
              const hasError = fieldApi.state.meta.errors.length > 0;
              const errorMessage = hasError
                ? typeof fieldApi.state.meta.errors[0] === 'string'
                  ? fieldApi.state.meta.errors[0]
                  : fieldApi.state.meta.errors[0]?.message ||
                    'Field is required'
                : '';

              return (
                <Select
                  label="Children"
                  placeholder="Select"
                  data={guestOptions}
                  value={fieldApi.state.value || '0'}
                  onChange={(value) => fieldApi.handleChange(value || '0')}
                  onBlur={fieldApi.handleBlur}
                  error={errorMessage}
                  styles={{
                    input: {
                      height: '3rem',
                      fontSize: '1rem',
                    },
                  }}
                />
              );
            }}
          </step2Form.Field>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 font-lato">
          How can we reach you?
        </h3>
        <p className="text-gray-600 text-sm font-lato">
          We&apos;ll save your details and give you the option to continue on
          WhatsApp.
        </p>
      </div>

      <div className="space-y-4">
        <step3Form.Field name="fullName">
          {(fieldApi) => {
            const hasError = fieldApi.state.meta.errors.length > 0;
            const errorMessage = hasError
              ? typeof fieldApi.state.meta.errors[0] === 'string'
                ? fieldApi.state.meta.errors[0]
                : fieldApi.state.meta.errors[0]?.message ||
                  'Full name is required'
              : '';

            return (
              <TextInput
                label="Full Name"
                placeholder="Full Name"
                value={fieldApi.state.value || ''}
                onChange={(e) => fieldApi.handleChange(e.target.value)}
                onBlur={fieldApi.handleBlur}
                error={errorMessage}
                styles={{
                  input: {
                    height: '3rem',
                    fontSize: '1rem',
                  },
                }}
              />
            );
          }}
        </step3Form.Field>

        <step3Form.Field name="email">
          {(fieldApi) => {
            const hasError = fieldApi.state.meta.errors.length > 0;
            const errorMessage = hasError
              ? typeof fieldApi.state.meta.errors[0] === 'string'
                ? fieldApi.state.meta.errors[0]
                : fieldApi.state.meta.errors[0]?.message || 'Email is required'
              : '';

            return (
              <TextInput
                label="Email Address"
                placeholder="Email Address"
                type="email"
                value={fieldApi.state.value || ''}
                onChange={(e) => fieldApi.handleChange(e.target.value)}
                onBlur={fieldApi.handleBlur}
                error={errorMessage}
                styles={{
                  input: {
                    height: '3rem',
                    fontSize: '1rem',
                  },
                }}
              />
            );
          }}
        </step3Form.Field>

        <step3Form.Field name="phone">
          {(fieldApi) => {
            const hasError = fieldApi.state.meta.errors.length > 0;
            const errorMessage = hasError
              ? typeof fieldApi.state.meta.errors[0] === 'string'
                ? fieldApi.state.meta.errors[0]
                : fieldApi.state.meta.errors[0]?.message ||
                  'Phone number is required'
              : '';

            return (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number (WhatsApp)
                </label>
                <div className="flex">
                  {/* Country Selector */}
                  <Combobox
                    store={combobox}
                    onOptionSubmit={(value) => {
                      const country = countries.find((c) => c.code === value);
                      if (country) {
                        setSelectedCountry(country);
                        // Update the form field with the full phone number
                        const fullPhone = `${country.dialCode}${phoneNumber}`;
                        fieldApi.handleChange(fullPhone);
                      }
                      combobox.closeDropdown();
                    }}
                  >
                    <Combobox.Target>
                      <button
                        type="button"
                        className="flex items-center justify-center space-x-2 px-3 py-3 h-12 border border-gray-300 rounded-l-lg bg-white focus:outline-none w-[110px] relative z-10"
                        onClick={() => combobox.toggleDropdown()}
                      >
                        <span className="text-2xl leading-none">
                          {selectedCountry.flag}
                        </span>
                        <span className="text-sm font-bold text-gray-800 leading-none">
                          {selectedCountry.dialCode}
                        </span>
                        <svg
                          className="w-3 h-3 text-gray-400 ml-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </Combobox.Target>

                    <Combobox.Dropdown className="border border-gray-200 shadow-lg rounded-lg overflow-hidden w-[110px]">
                      <Combobox.Options className="max-h-60 overflow-y-auto bg-white">
                        {countries.map((country) => (
                          <Combobox.Option
                            key={country.code}
                            value={country.code}
                            className="flex items-center justify-center space-x-2 px-3 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 w-full"
                          >
                            <span className="text-2xl leading-none">
                              {country.flag}
                            </span>
                            <span className="text-sm font-bold text-gray-800 leading-none">
                              {country.dialCode}
                            </span>
                          </Combobox.Option>
                        ))}
                      </Combobox.Options>
                    </Combobox.Dropdown>
                  </Combobox>

                  {/* Phone Number Input */}
                  <TextInput
                    placeholder="Phone Number"
                    value={phoneNumber}
                    onChange={(e) => {
                      // Only allow numbers
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setPhoneNumber(value);
                      // Update the form field with the full phone number
                      const fullPhone = `${selectedCountry.dialCode}${value}`;
                      fieldApi.handleChange(fullPhone);
                    }}
                    onBlur={fieldApi.handleBlur}
                    error={errorMessage}
                    className="flex-1"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    styles={{
                      input: {
                        height: '3rem',
                        fontSize: '1rem',
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        borderLeft: 'none',
                        borderColor: errorMessage ? '#ef4444' : '#d1d5db',
                        marginLeft: '-1px', // Flush with country selector border
                        '&:focus': {
                          borderColor: errorMessage ? '#ef4444' : '#3b82f6',
                          boxShadow: errorMessage
                            ? '0 0 0 1px #ef4444'
                            : '0 0 0 1px #3b82f6',
                        },
                      },
                    }}
                  />
                </div>
              </div>
            );
          }}
        </step3Form.Field>

        <step3Form.Field name="consent">
          {(fieldApi) => {
            const hasError = fieldApi.state.meta.errors.length > 0;
            const errorMessage = hasError
              ? typeof fieldApi.state.meta.errors[0] === 'string'
                ? fieldApi.state.meta.errors[0]
                : fieldApi.state.meta.errors[0]?.message ||
                  'Consent is required'
              : '';

            return (
              <div className="space-y-2">
                <Checkbox
                  label={
                    <span className="text-sm text-gray-600">
                      I agree to personalized travel recommendations via
                      WhatsApp and email. I understand that NaijaLux will use my
                      information to create a custom itinerary.
                    </span>
                  }
                  checked={fieldApi.state.value || false}
                  onChange={(e) =>
                    fieldApi.handleChange(e.currentTarget.checked)
                  }
                  onBlur={fieldApi.handleBlur}
                  styles={{
                    label: {
                      fontSize: '0.875rem',
                      color: '#6B7280',
                    },
                  }}
                />
                {hasError && (
                  <p className="text-sm text-red-600">{errorMessage}</p>
                )}
              </div>
            );
          }}
        </step3Form.Field>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Application Successful!
        </h3>
        <p className="text-gray-600">
          We&apos;ve received your travel preferences. Would you like to
          continue to WhatsApp for instant personalized assistance?
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={() => handleSuccessAction('whatsapp')}
          variant="primary"
          className="w-full"
        >
          Yes, continue to WhatsApp
        </Button>
        <Button
          onClick={() => handleSuccessAction('email')}
          variant="outline"
          className="w-full"
        >
          No, contact me via email
        </Button>
      </div>
    </div>
  );

  const renderProgressIndicator = () => (
    <div className="flex items-center space-x-3">
      <span className="text-sm text-gray-500 font-medium">
        Step {currentStep}/3
      </span>
      <RingProgress
        size={32}
        thickness={3}
        roundCaps
        sections={[
          {
            value: (currentStep / 3) * 100,
            color: '#7530FF', // Purple color from design system
          },
        ]}
        styles={{
          root: {
            width: '32px',
            height: '32px',
          },
        }}
      />
    </div>
  );

  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="md">
        <div className="p-6">{renderSuccess()}</div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      showCloseButton={false}
    >
      <motion.div
        className="p-6"
        layout
        transition={{
          duration: 0.8,
          ease: [0.16, 1, 0.3, 1],
          layout: {
            duration: 1.0,
            ease: [0.16, 1, 0.3, 1],
          },
        }}
      >
        {/* Close Button */}
        <div className="flex justify-start mb-6">
          <button
            onClick={handleClose}
            className="text-gray-800 hover:text-gray-900 transition-colors"
          >
            <X className="w-6 h-6 stroke-2" />
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 font-playfair">
            Plan Your Nigerian Experience
          </h2>
          {renderProgressIndicator()}
        </div>

        {/* Form Content */}
        <motion.div
          layout
          transition={{
            duration: 1.0,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{
                opacity: 1,
                x: 0,
                transition: {
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                },
              }}
              exit={{
                opacity: 0,
                x: -20,
                transition: {
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                },
              }}
            >
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 pt-6">
          <Button
            onClick={handlePrevious}
            variant="outline"
            disabled={currentStep === 1}
            className="flex-1 py-3 text-purple-600 border-purple-600 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-full focus:outline-none focus:ring-0 focus:ring-offset-0"
          >
            Previous
          </Button>

          <Button
            onClick={() => {
              if (currentStep === 1) {
                step1Form.handleSubmit();
              } else if (currentStep === 2) {
                step2Form.handleSubmit();
              } else if (currentStep === 3) {
                step3Form.handleSubmit();
              }
            }}
            variant="primary"
            className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-full focus:outline-none focus:ring-0 focus:ring-offset-0"
            disabled={
              (currentStep === 1 && step1Form.state.isSubmitting) ||
              (currentStep === 2 && step2Form.state.isSubmitting) ||
              (currentStep === 3 && step3Form.state.isSubmitting)
            }
          >
            {currentStep === 3 ? 'Submit' : 'Continue'}
          </Button>
        </div>
      </motion.div>
    </Modal>
  );
};
