/**
 * @license
 * SecureChain-AWLM: Academic Software Prototype
 * DEMO AUTHENTICATION & SESSION MANAGEMENT
 * 
 * IMPORTANT ACADEMIC DISCLAIMER:
 * This is a DEMO authentication foundation for an academic prototype.
 * It is NOT production-grade authentication.
 * 
 * Production systems require:
 * - Hardware Security Module (HSM) or secure enclave key management
 * - Cryptographic password hashing (Argon2id / PBKDF2 / bcrypt)
 * - Multi-factor authentication (MFA) & PKI certificates
 * - Cryptographically signed session tokens (JWT / PASETO)
 * - Server-side session invalidation and role-based token claims
 */

import { DemoUser, UserRole, UserSession } from '../types';

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'USR-MFG-001',
    username: 'manufacturer',
    password: 'Demo@123',
    displayName: 'Manufacturing Lead',
    role: 'Manufacturer',
    organization: 'Manufacturer',
  },
  {
    id: 'USR-SCO-002',
    username: 'supplychain',
    password: 'Demo@123',
    displayName: 'Supply Chain Officer',
    role: 'Supply Chain Operator',
    organization: 'Supply Chain Operator',
  },
  {
    id: 'USR-MIL-003',
    username: 'military',
    password: 'Demo@123',
    displayName: 'Defense Liaison',
    role: 'Military / Defense',
    organization: 'Military / Defense',
  },
  {
    id: 'USR-GOV-004',
    username: 'government',
    password: 'Demo@123',
    displayName: 'Government Representative',
    role: 'Government',
    organization: 'Government',
  },
  {
    id: 'USR-REG-005',
    username: 'regulator',
    password: 'Demo@123',
    displayName: 'Regulatory Officer',
    role: 'Regulator',
    organization: 'Regulator',
  },
  {
    id: 'USR-AUD-006',
    username: 'auditor',
    password: 'Demo@123',
    displayName: 'Auditor / Inspector',
    role: 'Auditor / Inspector',
    organization: 'Auditor / Inspector',
  },
  {
    id: 'USR-ADM-007',
    username: 'admin',
    password: 'Demo@123',
    displayName: 'System Administrator',
    role: 'Administrator',
    organization: 'Administrator',
  },
];

const STORAGE_KEY = 'securechain_awlm_demo_session';

/**
 * Verifies that the entered username, password, and selected role correspond
 * to one of the configured demonstration accounts.
 */
export function verifyDemoCredentials(
  username: string,
  password: string,
  role: UserRole
): { success: boolean; session?: UserSession; error?: string } {
  const trimmedUser = username.trim().toLowerCase();
  const trimmedPass = password.trim();

  if (!trimmedUser) {
    return { success: false, error: 'Please enter a username.' };
  }
  if (!trimmedPass) {
    return { success: false, error: 'Please enter a password.' };
  }
  if (!role) {
    return { success: false, error: 'Please select a stakeholder role.' };
  }

  // Look up user by username
  const matchedUser = DEMO_USERS.find(
    (u) => u.username.toLowerCase() === trimmedUser
  );

  if (!matchedUser) {
    return {
      success: false,
      error: `Invalid credentials: Username "${username}" not found.`,
    };
  }

  if (matchedUser.password !== trimmedPass) {
    return {
      success: false,
      error: 'Invalid password. Please check your credentials.',
    };
  }

  if (matchedUser.role !== role) {
    return {
      success: false,
      error: `Role mismatch: User "${username}" is registered under role "${matchedUser.role}", but you selected "${role}".`,
    };
  }

  const session: UserSession = {
    username: matchedUser.displayName,
    role: matchedUser.role,
    organization: matchedUser.organization,
    isAuthenticated: true,
  };

  saveDemoSession(session);
  return { success: true, session };
}

/**
 * Creates and persists a session for any given role.
 */
export function createSessionForRole(role: UserRole, customUsername?: string): UserSession {
  const matchedUser = DEMO_USERS.find((u) => u.role === role);
  const session: UserSession = {
    username: customUsername || (matchedUser ? matchedUser.displayName : `${role} Representative`),
    role,
    organization: role,
    isAuthenticated: true,
  };

  saveDemoSession(session);
  return session;
}

/**
 * Persists session to localStorage.
 */
export function saveDemoSession(session: UserSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn('Unable to persist session to localStorage', e);
  }
}

/**
 * Retrieves the currently persisted demo session if valid.
 */
export function getStoredSession(): UserSession | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data) as UserSession;
    if (parsed && parsed.isAuthenticated && parsed.role) {
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse demo session', e);
  }
  return null;
}

/**
 * Clears demo session on logout.
 */
export function clearDemoSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear session from localStorage', e);
  }
}
