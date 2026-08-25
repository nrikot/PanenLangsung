import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format Zod validation errors from API response into user-friendly messages. */
export function formatValidationErrors(details: Record<string, string[]> | undefined): string[] {
  if (!details) return [];
  const messages: string[] = [];
  for (const [, errs] of Object.entries(details)) {
    for (const msg of errs) {
      if (!messages.includes(msg)) messages.push(msg);
    }
  }
  return messages;
}

/** Build a single readable error string from API response. */
export function buildErrorMessage(data: { error?: string; details?: Record<string, string[]> }): string {
  const fieldErrors = formatValidationErrors(data.details);
  if (fieldErrors.length > 0) return fieldErrors.join(". ");
  return data.error || "Terjadi kesalahan. Silakan coba lagi.";
}
