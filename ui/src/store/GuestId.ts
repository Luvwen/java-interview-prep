const GUEST_ID_KEY = "javatheory_guest_id";

export function getOrCreateGuestId(): string {
  const existing = localStorage.getItem(GUEST_ID_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(GUEST_ID_KEY, id);
  return id;
}
