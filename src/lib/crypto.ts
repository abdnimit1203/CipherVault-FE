import { argon2id } from "hash-wasm";

/**
 * Derives a strong 256-bit (32 bytes) master key from the user's master password
 * and their email (used as a salt). This key is NEVER sent to the server.
 * 
 * @param password The user's plaintext master password
 * @param email The user's email, used as a unique salt
 * @returns A Uint8Array containing the 32-byte derived key
 */
export async function deriveMasterKey(password: string, email: string): Promise<Uint8Array> {
  // Using email as salt (encoded to Uint8Array)
  const salt = new TextEncoder().encode(email.toLowerCase().trim());
  
  const hash = await argon2id({
    password,
    salt,
    parallelism: 1,
    iterations: 3,
    memorySize: 65536, // 64 MB
    hashLength: 32,
    outputType: "binary",
  });

  return hash;
}

/**
 * Helper to convert Uint8Array to hex string (useful for debugging/logging)
 */
export function buf2hex(buffer: Uint8Array): string {
  return Array.prototype.map.call(buffer, x => ('00' + x.toString(16)).slice(-2)).join('');
}

/**
 * Converts a Uint8Array raw key into a CryptoKey for Web Crypto API
 */
async function importKey(rawKey: Uint8Array): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    rawKey.buffer as ArrayBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Converts a Uint8Array to a Base64 string
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Converts a Base64 string to a Uint8Array
 */
function base64ToBuffer(base64: string): Uint8Array {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encrypts a JS object into AES-256-GCM ciphertext
 * @param data The object to encrypt (e.g. { username, password, notes })
 * @param masterKey The derived 32-byte master key
 * @returns { encryptedData, iv } as Base64 strings
 */
export async function encryptVaultItem(data: any, masterKey: Uint8Array): Promise<{ encryptedData: string, iv: string }> {
  const key = await importKey(masterKey);
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV recommended for AES-GCM
  
  const encodedData = new TextEncoder().encode(JSON.stringify(data));
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv as BufferSource
    },
    key,
    encodedData as BufferSource
  );

  return {
    encryptedData: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv.buffer)
  };
}

/**
 * Decrypts AES-256-GCM ciphertext back into a JS object
 * @param encryptedData Base64 encoded ciphertext
 * @param iv Base64 encoded initialization vector
 * @param masterKey The derived 32-byte master key
 * @returns The decrypted object
 */
export async function decryptVaultItem(encryptedData: string, iv: string, masterKey: Uint8Array): Promise<any> {
  const key = await importKey(masterKey);
  const ivBuffer = base64ToBuffer(iv);
  const dataBuffer = base64ToBuffer(encryptedData);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBuffer as BufferSource
    },
    key,
    dataBuffer as BufferSource
  );

  const decodedString = new TextDecoder().decode(decryptedBuffer);
  return JSON.parse(decodedString);
}
