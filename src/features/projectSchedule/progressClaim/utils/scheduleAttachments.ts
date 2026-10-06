/** Attachments per schedule id, as a claim's lines carry them. */
export type LineAttachments = Record<string, string[]>;

interface LineWithAttachments {
  scheduleId: string;
  attachments?: string[] | null;
}

export const getLineAttachments = (lines: LineWithAttachments[]): LineAttachments =>
  Object.fromEntries(lines.map((line) => [line.scheduleId, line.attachments ?? []]));
