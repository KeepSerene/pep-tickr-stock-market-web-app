"use server";

import { headers } from "next/headers";
import { auth } from "../better-auth/auth";
import { inngest } from "../inngest/client";

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
  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

  if (!passwordPattern.test(password)) {
    throw new Error(
      "Password must contain uppercase, lowercase, number, and special character",
    );
  }

  try {
    const response = await auth.api.signUpEmail({
      body: { email, password, name: fullName },
    });

    if (response) {
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
    }

    return { success: true, data: response };
  } catch (error) {
    console.error("Sign up action failed:", error);

    return { success: false, error: "Sign Up Failed!" };
  }
}

export async function signOutAction() {
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch (error) {
    console.error("Sign out action error:", error);

    return { success: false, error: "Sign Out Failed!" };
  }
}

export async function signInAction({ email, password }: SignInFormData) {
  // Server-side validation
  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

  if (!passwordPattern.test(password)) {
    throw new Error(
      "Password must contain uppercase, lowercase, number, and special character",
    );
  }

  try {
    const response = await auth.api.signInEmail({
      body: { email, password },
    });

    return { success: true, data: response };
  } catch (error) {
    console.error("Sign in action failed:", error);

    return { success: false, error: "Sign In Failed!" };
  }
}
