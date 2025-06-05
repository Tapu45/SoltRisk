import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import * as bcrypt from 'bcrypt'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { sign } from 'jsonwebtoken'
import { sendResetPasswordEmail } from '@/service/email'



// Login request schema validation
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
})

// Forgot password schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address")
})

// Verify code schema
const verifyCodeSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "Reset code must be 6 digits")
})

// Reset password schema
const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6, "Reset code must be 6 digits"),
  newPassword: z.string().min(8, "Password must be at least 8 characters")
})

const setupPasswordSchema = z.object({
  email: z.string().email("Valid email is required"),
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password is required")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export async function POST(request: NextRequest) {
  try {
    // Get the action type from the URL query parameters
    const action = request.nextUrl.searchParams.get('action')

    // Handle different actions
    switch (action) {
      case 'forgot-password':
        return handleForgotPassword(request)
      case 'verify-code':
        return handleVerifyCode(request)
      case 'reset-password':
        return handleResetPassword(request)
      case 'setup-password':
        return handleSetupPassword(request)
      default:
        // Regular login process
        return handleLogin(request)
    }
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Request failed" },
      { status: 500 }
    )
  }
}

// Handle login request
async function handleLogin(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate request data
    const validation = loginSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      )
    }
    
    const { email, password } = validation.data
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    // Check if user exists
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password)
    
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Check if this is a new user with temporary password
    // You can implement this by checking if this is their first login
    // For now, we'll assume temporary passwords have a specific pattern or flag
    const isTemporaryPassword = await checkIfTemporaryPassword(user.id)
    
    // Generate JWT token
    const token = sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
      { expiresIn: '24h' }
    )
    
    // Set token in secure HTTP-only cookie
    ;(await cookies()).set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    })
    
    // Return user data (without password)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token: token,
      requiresPasswordSetup: isTemporaryPassword
    })
    
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    )
  }
}

// Handle forgot password request
async function handleForgotPassword(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate request data
    const validation = forgotPasswordSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      )
    }
    
    const { email } = validation.data
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    // Don't reveal if user exists or not for security reasons
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If your email is registered, you'll receive a password reset code"
      })
    }
    
    // Generate a random 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store the reset code with expiry time (15 minutes) using Prisma model
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        email: email,
        token: resetCode,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      }
    })
    
    // Send email with reset code
    await sendResetPasswordEmail(user.email, resetCode)
    
    return NextResponse.json({
      success: true,
      message: "If your email is registered, you'll receive a password reset code"
    })
    
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}

// Handle verification code check
async function handleVerifyCode(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate request data
    const validation = verifyCodeSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      )
    }
    
    const { email, code } = validation.data
    
    // Check if code is valid and not expired using Prisma model
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        email: email,
        token: code,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: "Code verified successfully"
    })
    
  } catch (error) {
    console.error("Verify code error:", error)
    return NextResponse.json(
      { error: "Failed to verify code" },
      { status: 500 }
    )
  }
}

// Handle reset password request
async function handleResetPassword(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json()
    
    // Validate request data
    const validation = resetPasswordSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      )
    }
    
    const { email, code, newPassword } = validation.data
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      )
    }
    
    // Check if code is valid and not expired using Prisma model
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        email: email,
        token: code,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 }
      )
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        updatedAt: new Date()
      }
    })
    
    // Delete used reset tokens for this user using Prisma model
    await prisma.passwordResetToken.deleteMany({
      where: { email: email }
    })
    
    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully"
    })
    
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    )
  }
}

async function handleSetupPassword(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = setupPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { email, currentPassword, newPassword } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    // Update password and mark as no longer temporary
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedNewPassword,
        updatedAt: new Date()
      }
    });

    // Remove temporary password flag
    await removeTemporaryPasswordFlag(user.id);

    // Generate new JWT token after password setup
    const token = sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'fallback-secret-key-change-in-production',
      { expiresIn: '24h' }
    )

    // Set token in secure HTTP-only cookie
    ;(await cookies()).set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    })

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token: token,
      // Add this flag to indicate automatic login should happen
      autoLogin: true
    });

  } catch (error) {
    console.error("Error setting up password:", error);
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
}

async function checkIfTemporaryPassword(userId: string): Promise<boolean> {
  try {
    const tempPasswordRecord = await prisma.temporaryPassword.findUnique({
      where: { 
        userId: userId,
        isTemporary: true 
      }
    });

    return !!tempPasswordRecord;
  } catch (error) {
    console.error("Error checking temporary password:", error);
    return false;
  }
}

// Helper function to remove temporary password flag
async function removeTemporaryPasswordFlag(userId: string): Promise<void> {
  try {
    await prisma.temporaryPassword.update({
      where: { userId },
      data: { isTemporary: false }
    });
  } catch (error) {
    console.error("Error removing temporary password flag:", error);
  }
}