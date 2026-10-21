import type { SharedDrawingMarkup } from "../types";

/** Markups keyed by 1-based page number; image drawings and older markups have no page, so they go on page 1. */
export const groupMarkupsByPage = (markups: SharedDrawingMarkup[]) => {
  const byPage = new Map<number, SharedDrawingMarkup[]>();
  markups.forEach((markup) => {
    const pageNumber = markup.pageNumber ?? 1;
    byPage.set(pageNumber, [...(byPage.get(pageNumber) ?? []), markup]);
  });
  return byPage;
};
