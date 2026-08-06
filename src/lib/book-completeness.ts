// Shared "is this book actually ready for a reader" signal, used by the
// dashboard guidance card, the Books list chip, and the book-edit tab dots
// so the three surfaces never disagree about what's still missing.

export type BookCompletenessInput = {
  coverImageUrl:    string | null;
  description:      string | null;
  shortDescription: string | null;
  retailerLinksCount:   number;
  directSaleItemsCount: number;
  /** Pre-order ("Coming Soon") books show a wishlist signup instead of buy
   *  buttons, so they don't need a retailer link or direct-sale file yet. */
  isPreOrder?: boolean;
};

export type BookCompletionStep = {
  key:        "cover" | "description" | "whereToBuy";
  label:      string;
  shortLabel: string;
  done:       boolean;
  tab:        "details" | "buy-links";
};

export function getBookCompletionSteps(book: BookCompletenessInput): BookCompletionStep[] {
  return [
    {
      key:        "cover",
      label:      "Add a cover image",
      shortLabel: "cover",
      done:       !!book.coverImageUrl,
      tab:        "details",
    },
    {
      key:        "description",
      label:      "Write a description",
      shortLabel: "description",
      done:       !!(book.description?.trim() || book.shortDescription?.trim()),
      tab:        "details",
    },
    {
      key:        "whereToBuy",
      label:      book.isPreOrder
        ? "Buy link (not needed — pre-order shows a wishlist signup)"
        : "Add a buy link or direct-sale file",
      shortLabel: "buy link",
      done:       !!book.isPreOrder || book.retailerLinksCount > 0 || book.directSaleItemsCount > 0,
      tab:        "buy-links",
    },
  ];
}

export function getBookCompletionSummary(book: BookCompletenessInput) {
  const steps = getBookCompletionSteps(book);
  const done  = steps.filter((s) => s.done).length;
  return { steps, done, total: steps.length, isComplete: done === steps.length };
}
