/**
 * InstaPay destination.
 *
 * There is no merchant API — the student transfers manually and an admin
 * confirms. These are display values only; nothing here decides what is
 * owed. The amount always comes from the database.
 */
export const instapay = {
  handle: process.env.NEXT_PUBLIC_INSTAPAY_HANDLE || 'mary.ragaa@instapay',
  name: process.env.NEXT_PUBLIC_INSTAPAY_NAME || 'Marie Ragaie',
  /** Deep link that opens the transfer directly in the InstaPay app. */
  payLink: process.env.NEXT_PUBLIC_INSTAPAY_LINK || 'https://ipn.eg/S/mary.ragaa/instapay/47k5a1',
} as const
