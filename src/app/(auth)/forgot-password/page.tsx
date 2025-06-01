"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { API_ROUTES } from "@/lib/api";
import { ArrowLeft } from "lucide-react"

// Step 1: Email submission schema
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Step 2: Verification code schema
const verificationSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

// Step 3: New password schema
const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type EmailFormValues = z.infer<typeof emailSchema>;
type VerificationFormValues = z.infer<typeof verificationSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // Step 1: Email form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  // Step 2: Verification form
  const verificationForm = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  // Step 3: Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Step 1: Handle email submission
  const handleEmailSubmit = async (data: EmailFormValues) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_ROUTES.AUTH.LOGIN}?action=forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: data.email }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send reset code");
      }

      setUserEmail(data.email);
      setCurrentStep(2);
      toast.success("Reset code sent to your email");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to send reset code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Handle verification code submission
  const handleVerificationSubmit = async (data: VerificationFormValues) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_ROUTES.AUTH.LOGIN}?action=verify-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userEmail,
            code: data.code,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Invalid verification code");
      }

      setVerificationCode(data.code);
      setCurrentStep(3);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to verify code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Handle password reset
  const handlePasswordSubmit = async (data: PasswordFormValues) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_ROUTES.AUTH.LOGIN}?action=reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userEmail,
            code: verificationCode,
            newPassword: data.newPassword,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to reset password");
      }

      toast.success("Password has been reset successfully");
      router.push("/login");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reset password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle back button click
  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 3) {
      setCurrentStep(2);
    }
  };

  

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - SoltRisk Logo with circuit background */}
      <div className="hidden md:flex md:w-1/2 bg-[#0A0530] relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/soltrisk.png"
            alt="SoltRisk"
            layout="fill"
            objectFit="cover"
            priority
          />
        </div>
      </div>

      {/* Right side - Forms */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Step indicator moved to top */}
          <div className="flex justify-between items-center mb-8">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </button>
            )}
            {currentStep === 1 ? (
              <div className="w-full"></div>
            ) : (
              <div className="flex-grow"></div>
            )}
            <div className="text-right">
              <div className="text-sm text-gray-600">
                Step {currentStep} of 3
              </div>
              <div className="font-medium">Forgot Password</div>
            </div>
          </div>

          {/* Step 1: Email Form */}
          {currentStep === 1 && (
            <div>
              <div className="mb-8">
                <h1 className="text-2xl font-semibold">Forgot Password</h1>
                <p className="text-gray-600 mt-2">
                  Enter the email of your account and we will send the email to
                  reset your password.
                </p>
              </div>

              <form
                onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="iamrohansardar@gmail.com"
                    className="border-blue-400 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                    {...emailForm.register("email")}
                  />
                  {emailForm.formState.errors.email && (
                    <p className="text-sm text-red-500">
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#081a4b] hover:bg-[#0a2158] transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "OTP"}
                </Button>
              </form>
            </div>
          )}

          {/* Step 2: Verification Code Form */}
          {currentStep === 2 && (
            <div className="animate-fadeIn">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold">Check your Mail</h1>
                <p className="text-gray-600 mt-2">
                  We've sent a 6-digit confirmation code to{" "}
                  <span className="text-blue-600">{userEmail}</span>
                  <br />
                  Make sure you enter correct code.
                </p>
              </div>

              <form
                onSubmit={verificationForm.handleSubmit(handleVerificationSubmit)}
                className="space-y-6"
              >
                <div className="flex justify-between gap-2 w-full">
                  {/* Individual boxes for each digit with blue styling */}
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <Input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="text-center w-12 h-12 text-lg border-blue-400 focus:border-blue-500 focus:ring focus:ring-blue-200 rounded-md transition-all"
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value && !/^[0-9]$/.test(value)) {
                          return;
                        }
                        
                        const currentCode = verificationForm.getValues("code") || "";
                        const codeArray = currentCode.split('');
                        codeArray[index] = value;
                        const newCode = codeArray.join('');
                        
                        verificationForm.setValue("code", newCode);
                        
                        // Auto-focus next input
                        if (value && index < 5) {
                          const nextInput = document.querySelector(`input[name="otp-${index + 1}"]`);
                          if (nextInput) {
                            (nextInput as HTMLInputElement).focus();
                          }
                        }
                      }}
                      name={`otp-${index}`}
                    />
                  ))}
                </div>
                {verificationForm.formState.errors.code && (
                  <p className="text-sm text-red-500">
                    {verificationForm.formState.errors.code.message}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-[#081a4b] hover:bg-[#0a2158] transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Verifying..." : "Next"}
                </Button>

                <div className="text-center mt-4">
                  <p className="text-sm text-gray-600">
                    Didn't receive any email? Check in spam or
                  </p>
                  <button
                    type="button"
                    onClick={() => handleEmailSubmit({ email: userEmail })}
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline mt-1 transition-colors"
                    disabled={isLoading}
                  >
                    Try another email address
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 3: New Password Form */}
          {currentStep === 3 && (
            <div className="animate-fadeIn">
              <div className="mb-8">
                <h1 className="text-2xl font-semibold">Set New Password</h1>
                <p className="text-gray-600 mt-2">
                  Create a strong password that you'll remember
                </p>
              </div>

              <form
                onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    className="border-blue-400 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                    {...passwordForm.register("newPassword")}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-red-500">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    className="border-blue-400 focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                    {...passwordForm.register("confirmPassword")}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#081a4b] hover:bg-[#0a2158] transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting Password..." : "Reset Password"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}