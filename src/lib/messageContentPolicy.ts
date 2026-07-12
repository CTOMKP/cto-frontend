export type MessageContentViolation = "email" | "external_link";

const EMAIL_PATTERN =
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;

const EXTERNAL_LINK_PATTERNS = [
  /https?:\/\/[^\s]+/i,
  /\bwww\.[^\s]+/i,
  /\bmailto:[^\s]+/i,
  /\b[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.(?:com|org|net|io|co|xyz|app|dev|me|info|biz|edu|gov|uk|us|tv|cc|ai|so|link|page|site|online|shop|store|finance|money|crypto|token)(?:\/[^\s]*)?\b/i,
];

/** Platform attachment messages include a view URL by design — skip link rules for those. */
export function shouldValidateMessageBody(body: string): boolean {
  return !body.trimStart().startsWith("Attachment:");
}

export function getMessageContentViolations(
  text: string,
): MessageContentViolation[] {
  const value = text.trim();
  if (!value) return [];

  const violations = new Set<MessageContentViolation>();

  if (EMAIL_PATTERN.test(value)) {
    violations.add("email");
  }

  if (EXTERNAL_LINK_PATTERNS.some((pattern) => pattern.test(value))) {
    violations.add("external_link");
  }

  return Array.from(violations);
}

export function isMessageContentAllowed(text: string): boolean {
  if (!shouldValidateMessageBody(text)) return true;
  return getMessageContentViolations(text).length === 0;
}

export function getMessageContentBlockDisclaimer(
  violations: MessageContentViolation[],
): string {
  if (violations.length === 0) return "";

  const parts: string[] = [];
  if (violations.includes("email")) {
    parts.push("email addresses");
  }
  if (violations.includes("external_link")) {
    parts.push("external links");
  }

  const joined =
    parts.length === 2
      ? `${parts[0]} and ${parts[1]}`
      : parts[0] ?? "restricted content";

  return `Messages cannot include ${joined}. This keeps conversations safe on CTO Marketplace — use in-app messaging and attachments instead of sharing contact details or outside links.`;
}

export function assertMessageContentAllowed(body: string): void {
  if (!shouldValidateMessageBody(body)) return;

  const violations = getMessageContentViolations(body);
  if (violations.length > 0) {
    throw new Error(getMessageContentBlockDisclaimer(violations));
  }
}
