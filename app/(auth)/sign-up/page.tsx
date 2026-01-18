"use client";

import CountryPicker from "@/components/form/CountryPicker";
import FooterLink from "@/components/form/FooterLink";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import { Button } from "@/components/ui/button";
import {
  INVESTMENT_GOALS,
  PREFERRED_INDUSTRIES,
  RISK_TOLERANCE_OPTIONS,
} from "@/lib/constants";
import { useForm } from "react-hook-form";

function SignUp() {
  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<SignUpFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      country: "IN",
      investmentGoals: "",
      riskTolerance: "",
      preferredIndustry: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      console.log(data);
    } catch (error) {
      console.error("Error submitting sign up form:", error);
    }
  };

  return (
    <>
      <h1 className="form-title">Personalize & Sign Up</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Full name */}
        <InputField
          name="fullName"
          label="Full Name"
          placeholder="John Doe"
          register={register}
          validation={{
            required: "Full name is required",
            minLength: {
              value: 2,
              message: "Full name must be at least 2 characters",
            },
            maxLength: {
              value: 50,
              message: "Full name cannot exceed 50 characters",
            },
            pattern: {
              value: /^[a-zA-Z\s'-]+$/,
              message:
                "Full name can only contain letters, spaces, hyphens, and apostrophes",
            },
          }}
          error={errors.fullName}
        />

        {/* Email */}
        <InputField
          type="email"
          name="email"
          label="Email"
          placeholder="example@email.com"
          register={register}
          validation={{
            required: "Email is required",
            pattern: {
              value: /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: "Please enter a valid email address",
            },
            maxLength: {
              value: 100,
              message: "Email cannot exceed 100 characters",
            },
          }}
          error={errors.email}
        />

        {/* Country */}
        <CountryPicker
          name="country"
          label="Country"
          control={control}
          required
          error={errors.country}
        />

        {/* Password */}
        <InputField
          type="password"
          name="password"
          label="Password"
          placeholder="Enter a strong password"
          register={register}
          validation={{
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
            maxLength: {
              value: 128,
              message: "Password cannot exceed 128 characters",
            },
            pattern: {
              value:
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
              message:
                "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
            },
          }}
          error={errors.password}
        />

        <SelectField
          name="investmentGoals"
          label="Investment Goals"
          placeholder="Select your investment goal"
          options={INVESTMENT_GOALS}
          control={control}
          required
          error={errors.investmentGoals}
        />

        <SelectField
          name="riskTolerance"
          label="Risk Tolerance"
          placeholder="Select your risk level"
          options={RISK_TOLERANCE_OPTIONS}
          control={control}
          required
          error={errors.riskTolerance}
        />

        <SelectField
          name="preferredIndustry"
          label="Preferred Industry"
          placeholder="Select your preferred industry"
          options={PREFERRED_INDUSTRIES}
          control={control}
          required
          error={errors.preferredIndustry}
        />

        <Button
          type="submit"
          disabled={isSubmitting}
          className="yellow-btn w-full mt-5"
        >
          {isSubmitting
            ? "Creating Your Account..."
            : "Start Your Investment Journey"}
        </Button>

        <FooterLink
          text="Already have an account?"
          linkText="Sign in"
          href="/sign-in"
        />
      </form>
    </>
  );
}

export default SignUp;
