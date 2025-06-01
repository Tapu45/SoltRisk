import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@/generated/prisma'
import * as bcrypt from 'bcrypt'
import { z } from 'zod'
import { cookies } from 'next/headers'
import { sign } from 'jsonwebtoken'
import { sendResetPasswordEmail } from '@/service/email'

const prisma = new PrismaClient()

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
      token: token
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
    
    // Create a separate table to store reset codes if it doesn't exist yet
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        email TEXT NOT NULL,
        token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // Store the reset code with expiry time (15 minutes)
    await prisma.$executeRaw`
      INSERT INTO password_reset_tokens (user_id, email, token, expires_at)
      VALUES (${user.id}, ${email}, ${resetCode}, ${new Date(Date.now() + 15 * 60 * 1000)})
    `
    
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
    
    // Check if code is valid and not expired
    const resetToken = await prisma.$queryRaw`
      SELECT * FROM password_reset_tokens 
      WHERE email = ${email} 
      AND token = ${code} 
      AND expires_at > ${new Date()}
      ORDER BY created_at DESC
      LIMIT 1
    `
    
    if (!resetToken || !Array.isArray(resetToken) || resetToken.length === 0) {
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
    
    // Check if code is valid and not expired
    const resetToken = await prisma.$queryRaw`
      SELECT * FROM password_reset_tokens 
      WHERE email = ${email} 
      AND token = ${code} 
      AND expires_at > ${new Date()}
      ORDER BY created_at DESC
      LIMIT 1
    `
    
    if (!resetToken || !Array.isArray(resetToken) || resetToken.length === 0) {
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
    
    // Delete used reset tokens for this user
    await prisma.$executeRaw`
      DELETE FROM password_reset_tokens WHERE email = ${email}
    `
    
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