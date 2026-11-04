import { createJSONStorage } from "jotai/utils";
import { gcm } from "@noble/ciphers/aes.js";
import {
  bytesToHex,
  bytesToUtf8,
  hexToBytes,
  randomBytes,
  utf8ToBytes,
} from "@noble/ciphers/utils.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { env } from "@/config/env";

const ENCRYPTION_KEY = env.NEXT_PUBLIC_ENCRYPTION_KEY;
const isDevelopment = process.env.NODE_ENV === "development";
const NONCE_LENGTH = 12;
const aesKey = sha256(utf8ToBytes(ENCRYPTION_KEY));

const encryptValue = (value: string): string => {
  const nonce = randomBytes(NONCE_LENGTH);
  const ciphertext = gcm(aesKey, nonce).encrypt(utf8ToBytes(value));
  const packed = new Uint8Array(nonce.length + ciphertext.length);
  packed.set(nonce);
  packed.set(ciphertext, nonce.length);
  return bytesToHex(packed);
};

const decryptValue = (item: string): string => {
  const packed = hexToBytes(item);
  if (packed.length <= NONCE_LENGTH) {
    return "";
  }

  const nonce = packed.slice(0, NONCE_LENGTH);
  const ciphertext = packed.slice(NONCE_LENGTH);
  return bytesToUtf8(gcm(aesKey, nonce).decrypt(ciphertext));
};

export const jotaiStorage = createJSONStorage(() => {
  return {
    // fallow-ignore-next-line complexity
    getItem: (key) => {
      try {
        const item = localStorage.getItem(key);
        if (!item) {
          return null;
        }

        if (isDevelopment) {
          return item;
        }

        const decryptedString = decryptValue(item);

        if (!decryptedString) {
          console.warn(`Failed to decrypt item for key: ${key}`);
          return null;
        }

        return decryptedString;
      } catch (error) {
        console.error(`Error decrypting item for key: ${key}`, error);
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        if (isDevelopment) {
          localStorage.setItem(key, value);
          return;
        }

        localStorage.setItem(key, encryptValue(value));
      } catch (error) {
        console.error(`Error encrypting item for key: ${key}`, error);
      }
    },
    removeItem: (key) => {
      localStorage.removeItem(key);
    },
  };
});
