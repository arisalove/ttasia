import 'server-only';
import { NextResponse } from 'next/server';
import { getSession, type Session } from './session';
import type { UserRole } from '../domain/types';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/** Resolve the session for a Route Handler, or throw a 401 ApiError. */
export async function requireApiSession(role?: UserRole): Promise<Session> {
  const session = await getSession();
  if (!session) throw new ApiError('You must be signed in.', 401);
  if (role && session.user.role !== role) throw new ApiError('You do not have access to this action.', 403);
  return session;
}

export function handleApiError(err: unknown): NextResponse {
  if (err instanceof ApiError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  const message = err instanceof Error ? err.message : 'Something went wrong.';
  return NextResponse.json({ error: message }, { status: 400 });
}
