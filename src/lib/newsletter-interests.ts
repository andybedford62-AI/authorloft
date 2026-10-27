// Content-type interest tags stored in Subscriber.categoryPrefs alongside book
// genre ids. Empty categoryPrefs means "send me everything". The ids are fixed
// strings (genre ids are cuids, so they can't collide).
export const INTEREST_TAGS = [
  { id: "courses", name: "Courses" },
  { id: "music",   name: "New music" },
  { id: "blog",    name: "Blog & news" },
] as const;

export const INTEREST_TAG_NAMES: Record<string, string> = Object.fromEntries(
  INTEREST_TAGS.map((t) => [t.id, t.name]),
);
