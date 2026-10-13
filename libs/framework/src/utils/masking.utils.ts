import { maskPassword as maskDataPassword, maskEmail2 , maskPhone, maskStringV2 } from 'maskdata';

/**
 * Mask an API token, key or secret for logs and admin responses, keeping only the last 4 characters
 * so admins can tell which credential is configured, e.g. `sk_live_...1234wxyz` -> `****...wxyz`.
 * Credentials of 4 characters or fewer are returned as is.
 */
export function maskCredentials(credential: string): string {
    if (!credential) return '';
  
    return maskStringV2(credential, {
      maskWith: '*',
      unmaskedEndCharacters: 4,
    });
}

/**
 * Fully mask a password for logs, always returning the same fixed length
 * so the original length is not revealed, e.g. `P@ssw0rd!` -> `********`.
 */
export function maskPassword(password: string): string {
    const PASSWORD_MASKED_LENGTH = 8;
  
    if (!password) return '';
  
    return maskDataPassword(password, {
      maskWith: '*',
      fixedOutputLength: PASSWORD_MASKED_LENGTH,
    });
}

/**
 * Mask an email for logs and persisted records, keeping the first characters of the name
 * and the full domain so support can still match it, e.g. `john.doe@gmail.com` -> `joh*****@gmail.com`.
 * Names of up to 5 characters keep 1 character, longer names keep 3.
 * Expects a valid email with a single `@`; input without `@` throws.
 */
export function maskEmail(email: string): string {
    const EMAIL_SHORT_LENGTH = 5;

    if (!email) return '';

    const nameLength = email.indexOf('@');
    const unmaskedLength = nameLength <= EMAIL_SHORT_LENGTH ? 1 : 3

    return maskEmail2(email, {
      maskWith: '*',
      unmaskedStartCharactersBeforeAt: unmaskedLength,
      unmaskedEndCharactersAfterAt: Number.MAX_SAFE_INTEGER,
    });
}

/**
 * Mask a phone number for logs and persisted records, keeping the prefix and last digits
 * so support can still match it, e.g. `+639171234567` -> `+63*******567`.
 * Numbers shorter than 8 characters keep 2 at each end, longer ones keep 3.
 */
export function maskPhoneNumber(phone: string): string {
  const PHONE_SHORT_LENGTH = 8;

  if (phone.length === 0) return '';

  const unmaskedLength = phone.length < PHONE_SHORT_LENGTH ? 2 : 3;

  return maskPhone(phone, {
    maskWith: '*',
    unmaskedStartDigits: unmaskedLength,
    unmaskedEndDigits: unmaskedLength,
  });
}

export function maskUrl() {}
