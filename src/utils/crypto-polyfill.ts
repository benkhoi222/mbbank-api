// Polyfill for crypto.getRandomValues
import crypto from 'crypto';

if (!globalThis.crypto) {
  // @ts-ignore
  globalThis.crypto = {};
}

if (!globalThis.crypto.getRandomValues) {
  // @ts-ignore
  globalThis.crypto.getRandomValues = (array: Uint8Array) => {
    const bytes = crypto.randomBytes(array.length);
    array.set(bytes);
    return array;
  };
}

export default globalThis.crypto;
