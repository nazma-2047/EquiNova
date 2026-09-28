/**
 * Web Crypto API based Zero-Knowledge Client-Side Encryption
 * Uses PBKDF2 for key derivation (100,000 iterations of SHA-256) and AES-256-GCM for encryption.
 */

// Generate random salt
export function generateRandomSalt(): string {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => ('0' + byte.toString(16)).slice(-2)).join('');
}

// Convert hex string to Uint8Array
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Convert Uint8Array to hex string
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, byte => ('0' + byte.toString(16)).slice(-2)).join('');
}

// Derive AES-GCM Key from password & salt using PBKDF2
async function deriveKey(password: string, saltHex: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const saltBytes = hexToBytes(saltHex);

  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt plaintext with password and salt
export async function encryptData(plaintext: string, secretKeyOrUid: string, customSalt?: string): Promise<{ ciphertext: string; iv: string; salt: string }> {
  try {
    const salt = customSalt || generateRandomSalt();
    const key = await deriveKey(secretKeyOrUid, salt);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      enc.encode(plaintext)
    );

    return {
      ciphertext: bytesToHex(new Uint8Array(encrypted)),
      iv: bytesToHex(iv),
      salt: salt
    };
  } catch (err) {
    console.error('Encryption failed:', err);
    throw new Error('Failed to encrypt data with secure cipher');
  }
}

// Decrypt ciphertext with password, iv, and salt
export async function decryptData(
  ciphertextHex: string,
  ivHex: string,
  saltHex: string,
  secretKeyOrUid: string
): Promise<string> {
  try {
    const key = await deriveKey(secretKeyOrUid, saltHex);
    const iv = hexToBytes(ivHex);
    const ciphertext = hexToBytes(ciphertextHex);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource
      },
      key,
      ciphertext as unknown as BufferSource
    );

    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (err) {
    console.error('Decryption failed:', err);
    throw new Error('Decryption failed. Invalid key or corrupted data.');
  }
}
