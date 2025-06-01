import { NextRequest } from 'next/server';
import { verify, sign } from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

// JWT token type definitions
export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthResult {
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    role: string;
    name?: string;
  };
  error?: string;
}

/**
 * Generates a JWT token for a user
 */
export function generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>) {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
  
  return sign(payload, secret, {
    expiresIn: '7d' // Token expires in 7 days
  });
}

/**
 * Verifies a JWT token from request headers or cookies
 */
export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const tokenFromHeader = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
    
    // Or from cookies
    const tokenFromCookie = request.cookies.get('auth-token')?.value;
    
    // Use either token source
    const token = tokenFromHeader || tokenFromCookie;
    
    if (!token) {
      return { authenticated: false, error: 'No token provided' };
    }
    
    // Verify the token
    const secret = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
    const decoded = verify(token, secret) as JwtPayload;
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });
    
    if (!user) {
      return { authenticated: false, error: 'User not found' };
    }
    
    return { 
      authenticated: true, 
      user: {
        id: user.id,
        email: user.email,
        role: decoded.role,
        name: user.name || undefined
      }
    };
  } catch (error) {
    return { 
      authenticated: false, 
      error: error instanceof Error ? error.message : 'Authentication error' 
    };
  }
}