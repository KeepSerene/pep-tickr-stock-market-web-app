"use client";

import FooterLink from "@/components/form/FooterLink";
import InputField from "@/components/form/InputField";
import PasswordInput from "@/components/form/PasswordInput";
import { Button } from "@/components/ui/button";
import { signInAction } from "@/lib/actions/auth.actions";
import { Loader2Icon, LogInIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function SignIn() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<SignInFormData>({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      const result = await signInAction(data);

      if (result.success) {
        router.push("/");

        return;
      }

      toast.error("Sign in failed!", {
        description: result.error ?? "An error occurred while signing in.",
      });
    } catch (error) {
      console.error("Error submitting sign in form:", error);

      toast.error("Sign in failed!", {
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while signing in.",
      });
    }
  };

  return (
    <>
      <h1 className="form-title">Welcome Back</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

        {/* Password */}
        <PasswordInput
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

        <Button
          type="submit"
          disabled={isSubmitting}
          className="yellow-btn w-full mt-5"
        >
          {isSubmitting ? (
            <>
              <Loader2Icon className="size-4 animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <LogInIcon className="size-4" />
              <span>Sign In</span>
            </>
          )}
        </Button>

        <FooterLink
          text="Don't have an account?"
          linkText="Sign up"
          href="/sign-up"
        />
      </form>
    </>
  );
}

export default SignIn;
