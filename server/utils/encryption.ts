import crypto from 'crypto';

/**
 * Encryption utility for sensitive data at rest
 * Uses AES-256-GCM for authenticated encryption
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits for GCM
const TAG_LENGTH = 16; // 128 bits for GCM
const KEY_LENGTH = 32; // 256 bits for AES-256

/**
 * Constant-time string comparison to prevent timing attacks
 * @param a - First string
 * @param b - Second string
 * @returns true if strings are equal
 */
function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Get encryption key from environment
function getEncryptionKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY;
  
  if (!keyHex) {
    // In development, log a warning but don't crash
    if (process.env.NODE_ENV !== 'production') {
      console.warn('WARNING: ENCRYPTION_KEY not set. Using development key (NOT SECURE FOR PRODUCTION)');
      // Derive a key from a default for development only
      return crypto.scryptSync('development-key-do-not-use-in-production', 'salt', KEY_LENGTH);
    }
    throw new Error('ENCRYPTION_KEY environment variable is required in production');
  }
  
  // Key should be 64 hex characters (32 bytes)
  if (keyHex.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }
  
  return Buffer.from(keyHex, 'hex');
}

/**
 * Encrypt a plaintext string
 * @param plaintext - The string to encrypt
 * @returns Encrypted string in format: iv:authTag:ciphertext (all hex encoded)
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) {
    return plaintext;
  }
  
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Return format: iv:authTag:ciphertext (all hex)
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Decrypt an encrypted string
 * @param encryptedData - The encrypted string in format: iv:authTag:ciphertext
 * @returns Decrypted plaintext string
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) {
    return encryptedData;
  }
  
  // Check if data is in encrypted format
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    // Not in encrypted format - return as-is (for backward compatibility)
    // Log warning in production
    if (process.env.NODE_ENV === 'production') {
      console.warn('WARNING: Attempting to decrypt data that is not in expected format');
    }
    return encryptedData;
  }
  
  const key = getEncryptionKey();
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Check if a string appears to be encrypted
 * @param data - The string to check
 * @returns true if the string appears to be encrypted
 */
export function isEncrypted(data: string): boolean {
  if (!data) {
    return false;
  }
  const parts = data.split(':');
  return parts.length === 3 && 
         parts[0].length === IV_LENGTH * 2 && // IV as hex
         parts[1].length === TAG_LENGTH * 2;  // Auth tag as hex
}

/**
 * Generate a secure encryption key
 * @returns A 64-character hex string suitable for ENCRYPTION_KEY
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

/**
 * Encrypt an object's specified fields
 * @param obj - The object containing fields to encrypt
 * @param fields - Array of field names to encrypt
 * @returns New object with specified fields encrypted
 */
export function encryptFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };
  
  for (const field of fields) {
    const value = result[field];
    if (typeof value === 'string' && value && !isEncrypted(value)) {
      result[field] = encrypt(value) as T[keyof T];
    }
  }
  
  return result;
}

/**
 * Decrypt an object's specified fields
 * @param obj - The object containing fields to decrypt
 * @param fields - Array of field names to decrypt
 * @returns New object with specified fields decrypted
 */
export function decryptFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };
  
  for (const field of fields) {
    const value = result[field];
    if (typeof value === 'string' && value && isEncrypted(value)) {
      result[field] = decrypt(value) as T[keyof T];
    }
  }
  
  return result;
}

// Fields that should be encrypted at rest
export const SENSITIVE_FIELDS = [
  'apiKey',
  'key',
  'secret',
  'webhookSecret',
  'clientSecret',
  'credentials',
  'accessToken',
  'refreshToken',
] as const;

export type SensitiveField = typeof SENSITIVE_FIELDS[number];
