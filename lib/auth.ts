import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import pool from './db';
import type { PublicUser } from '@/types/user';

const TOKEN_COOKIE_NAME = 'auth_token';
const TOKEN_EXPIRES_IN_DAYS = 7;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAuthToken(payload: { id: number; email: string }): string {
  const secret = getJwtSecret();
  return jwt.sign(payload, secret, { expiresIn: `${TOKEN_EXPIRES_IN_DAYS}d` });
}

export function verifyAuthToken(
  token: string
): { id: number; email: string } | null {
  try {
    const secret = getJwtSecret();
    return jwt.verify(token, secret) as { id: number; email: string };
  } catch {
    return null;
  }
}

export function setAuthCookie(response: Response, token: string): void {
  const expires = new Date();
  expires.setDate(expires.getDate() + TOKEN_EXPIRES_IN_DAYS);

  const cookieHeader = [
    `${TOKEN_COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Expires=${expires.toUTCString()}`,
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');

  response.headers.append('Set-Cookie', cookieHeader);
}

export function clearAuthCookie(response: Response): void {
  const expires = new Date(0).toUTCString();
  const cookieHeader = [
    `${TOKEN_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Expires=${expires}`,
    process.env.NODE_ENV === 'production' ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');

  response.headers.append('Set-Cookie', cookieHeader);
}

export async function getCurrentUserFromRequest(
  request: NextRequest
): Promise<PublicUser | null> {
  const cookieToken =
    request.cookies.get(TOKEN_COOKIE_NAME)?.value ??
    cookies().get(TOKEN_COOKIE_NAME)?.value;

  if (!cookieToken) {
    return null;
  }

  const payload = verifyAuthToken(cookieToken);
  if (!payload) {
    return null;
  }

  const result = await pool.query(
    'SELECT id, email FROM users WHERE id = $1',
    [payload.id]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0] as { id: number; email: string };
  return { id: user.id, email: user.email };
}

