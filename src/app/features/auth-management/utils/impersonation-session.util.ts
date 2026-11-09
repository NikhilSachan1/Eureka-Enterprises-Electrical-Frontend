import { IImpersonationSession } from '../types/login.interface';

const IMPERSONATION_SESSION_KEY = 'impersonation_session';

/**
 * The session lives in its own sessionStorage entry, so it is scoped to one tab and never touches
 * the super admin's own tokens. Exiting only has to delete this entry and reload.
 */
export function readImpersonationSession(): IImpersonationSession | null {
  try {
    const raw = sessionStorage.getItem(IMPERSONATION_SESSION_KEY);
    return raw ? (JSON.parse(raw) as IImpersonationSession) : null;
  } catch {
    sessionStorage.removeItem(IMPERSONATION_SESSION_KEY);
    return null;
  }
}

export function writeImpersonationSession(
  session: IImpersonationSession
): void {
  sessionStorage.setItem(IMPERSONATION_SESSION_KEY, JSON.stringify(session));
}

export function clearImpersonationSession(): void {
  sessionStorage.removeItem(IMPERSONATION_SESSION_KEY);
}
