/**
 * Direction handling for inputs that hold Latin data on an RTL page —
 * email addresses, phone numbers.
 *
 * `dir="auto"` does not solve this: the browser derives direction from the
 * *value*, ignoring the placeholder, so an empty field falls back to LTR and
 * strands its Arabic placeholder on the left of an otherwise right-aligned
 * page. Hard-coding `dir="ltr"` has the same effect permanently.
 *
 * So: start RTL, so the Arabic placeholder sits where every other line on
 * the page sits, and switch to LTR the moment there is a value, so
 * "mary@example.com" and "01012345678" read in their natural order.
 *
 * Pair with `dir="rtl"` as the initial attribute.
 */
export function latinAwareDir(event: React.FormEvent<HTMLInputElement>) {
  event.currentTarget.dir = event.currentTarget.value ? 'ltr' : 'rtl'
}
