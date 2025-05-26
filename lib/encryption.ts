import crypto from 'crypto';
import { createHash } from 'crypto';

// Check for encryption keys in environment variables
if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length < 32) {
    console.warn('Warning: ENCRYPTION_KEY is not set or is too short. Using fallback key for development only.');
}

if (!process.env.ENCRYPTION_IV || process.env.ENCRYPTION_IV.length < 16) {
    console.warn('Warning: ENCRYPTION_IV is not set or is too short. Using fallback IV for development only.');
}

// Use environment variables or fallback (for development only)
// In production, use only environment variables with proper key management
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-char-encryption-key-here-now';
const ENCRYPTION_IV = process.env.ENCRYPTION_IV || 'your-16-char-iv';
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypts sensitive DSR data
 */
export function encryptDSRData(data: {
    requesterEmail: string;
    requesterName: string;
    requestType: string;
    details?: string;
}) {
    return {
        // Save encrypted data
        requesterEmail: encrypt(data.requesterEmail),
        // Store hash for search/filtering capabilities
        requesterEmailHash: hashValue(data.requesterEmail.toLowerCase()),
        requesterName: encrypt(data.requesterName),
        requestType: encrypt(data.requestType),
        details: data.details ? encrypt(data.details) : undefined,
    };
}

/**
 * Decrypts DSR data
 */
export function decryptDSRData(data: {
    requesterEmail: string;
    requesterName: string;
    requestType: string;
    details?: string;
}) {
    return {
        requesterEmail: decrypt(data.requesterEmail),
        requesterName: decrypt(data.requesterName),
        requestType: decrypt(data.requestType),
        details: data.details ? decrypt(data.details) : undefined,
    };
}

/**
 * Encrypt a string value
 */
function encrypt(text: string): string {
    try {
        const iv = Buffer.from(ENCRYPTION_IV, 'utf8').slice(0, 16);
        const key = Buffer.from(ENCRYPTION_KEY, 'utf8').slice(0, 32);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    } catch (error) {
        console.error('Encryption error:', error);
        // Return original text if encryption fails - could throw error instead
        // depending on security requirements
        return text;
    }
}

/**
 * Decrypt a string value
 */
function decrypt(encryptedText: string): string {
    try {
        const iv = Buffer.from(ENCRYPTION_IV, 'utf8').slice(0, 16);
        const key = Buffer.from(ENCRYPTION_KEY, 'utf8').slice(0, 32);
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        // Return encrypted text if decryption fails
        return encryptedText;
    }
}

/**
 * Create a secure hash for indexing/searching
 */
export function hashValue(value: string): string {
    return createHash('sha256').update(value).digest('hex');
}