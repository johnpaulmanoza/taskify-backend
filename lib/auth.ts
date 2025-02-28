import { SignJWT, jwtVerify } from 'jose';
import { NextRequest, NextResponse } from 'next/server';

// Secret key for JWT signing
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-at-least-32-characters'
);

// Token expiration time (24 hours)
const EXPIRES_IN = '24h';

// Generate a JWT token for a user
export async function signToken(payload: any) {
  try {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(EXPIRES_IN)
      .sign(JWT_SECRET);
    
    return token;
  } catch (error) {
    console.error('Error signing token:', error);
    throw error;
  }
}

// Verify a JWT token
export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

// Set the auth token in cookies
export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
  
  return response;
}

// Get the auth token from cookies
export function getAuthToken(request: NextRequest) {
  return request.cookies.get('auth_token')?.value;
}

// Clear the auth token from cookies
export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    path: '/',
    maxAge: 0,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
  
  return response;
}

// Get the current authenticated user from the request
export async function getCurrentUser(request: NextRequest) {
  const token = getAuthToken(request);
  
  if (!token) {
    return null;
  }
  
  const payload = await verifyToken(token);
  return payload;
}