/**
 * Where the money is transferred to.
 *
 * Both routes are manual: the student sends the money herself and an
 * admin confirms it against the screenshot. These are display values
 * only — nothing here decides what is owed. The amount always comes from
 * the database.
 *
 * The defaults are the academy's real details rather than placeholders.
 * A checkout that shows a plausible-looking wrong number takes money to
 * somewhere nobody is watching, which is worse than a checkout that is
 * visibly unconfigured.
 */

export const instapay = {
  handle: process.env.NEXT_PUBLIC_INSTAPAY_HANDLE || 'mary.ragaa@instapay',
  name: process.env.NEXT_PUBLIC_INSTAPAY_NAME || 'Marie Ragaie',
  /** Deep link that opens the transfer directly in the InstaPay app. */
  payLink: process.env.NEXT_PUBLIC_INSTAPAY_LINK || 'https://ipn.eg/S/mary.ragaa/instapay/47k5a1',
} as const

export const vodafoneCash = {
  /**
   * The wallet number, which is also the phone number. Shown as digits to
   * be copied, never as a tel: link — a student who dials it has not paid,
   * and it is not the enquiries line.
   */
  number: process.env.NEXT_PUBLIC_VODAFONE_CASH_NUMBER || '01022937970',
  name: process.env.NEXT_PUBLIC_VODAFONE_CASH_NAME || 'Marie Ragaie',
} as const
