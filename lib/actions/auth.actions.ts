"use server";

import { headers } from "next/headers";
import { auth } from "../better-auth/auth";
import { inngest } from "../inngest/client";

const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

/**
 * Server action for user sign up with personalized onboarding
 */
export async function signUpAction({
  email,
  fullName,
  password,
  country,
  investmentGoals,
  riskTolerance,
  preferredIndustry,
}: SignUpFormData) {
  // Server-side validation
  if (!PASSWORD_PATTERN.test(password)) {
    return {
      success: false,
      error:
        "Password must contain uppercase, lowercase, number, and special character",
    };
  }

  // Validate required fields
  if (!email || !fullName || !country) {
    return {
      success: false,
      error: "All required fields must be provided",
    };
  }

  try {
    // Create user account via Better Auth
    const response = await auth.api.signUpEmail({
      body: { email, password, name: fullName },
    });

    // If signup successful, trigger welcome email workflow
    if (response) {
      try {
        // Send event to Inngest for async processing
        await inngest.send({
          name: "app/user.created",
          data: {
            email,
            name: fullName,
            country,
            investmentGoals,
            riskTolerance,
            preferredIndustry,
          },
        });
      } catch (eventError) {
        // Log but don't fail signup if event send fails
        console.error("Inngest send failed:", eventError);
      }
    }

    return { success: true, data: response };
  } catch (error) {
    console.error("Sign up action failed:", error);

    if (error instanceof Error) {
      if (error.message.includes("email")) {
        return { success: false, error: "Email already exists" };
      }
      if (error.message.includes("password")) {
        return { success: false, error: "Invalid password format" };
      }
    }

    return { success: false, error: "Sign Up Failed!" };
  }
}

/**
 * Server action for user sign out
 */
export async function signOutAction() {
  try {
    await auth.api.signOut({ headers: await headers() });
    return { success: true };
  } catch (error) {
    console.error("Sign out action error:", error);

    return { success: false, error: "Sign Out Failed!" };
  }
}

/**
 * Server action for user sign in
 */
export async function signInAction({ email, password }: SignInFormData) {
  // Server-side validation
  if (!PASSWORD_PATTERN.test(password)) {
    return {
      success: false,
      error:
        "Password must contain uppercase, lowercase, number, and special character",
    };
  }

  if (!email || !email.includes("@")) {
    return {
      success: false,
      error: "Invalid email format",
    };
  }

  try {
    const response = await auth.api.signInEmail({
      body: { email, password },
    });

    return { success: true, data: response };
  } catch (error) {
    console.error("Sign in action failed:", error);

    if (error instanceof Error) {
      if (error.message.includes("credentials")) {
        return { success: false, error: "Invalid email or password" };
      }
      if (error.message.includes("not found")) {
        return { success: false, error: "Account not found" };
      }
    }

    return { success: false, error: "Sign In Failed!" };
  }
}
