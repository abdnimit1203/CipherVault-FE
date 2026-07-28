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
