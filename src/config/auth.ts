/**
 * Expected length of the emailed sign-in code — used for the input's
 * placeholder and the line that tells people what to look for.
 *
 * It is NOT the validation rule. It used to be, and that was a trap: the
 * real length is set in the Supabase dashboard (Authentication → Email →
 * Email OTP Length), and the moment the two disagreed the form rejected
 * every code for being the wrong length, before Supabase ever saw it. The
 * message read "wrong code", which is almost impossible to trace back to a
 * setting in another system.
 *
 * So the form now accepts any plausible code and lets Supabase be the one
 * to say no. A mismatch becomes a cosmetic detail rather than a locked
 * door.
 */
export const OTP_LENGTH = 8

/** What the input will actually accept. Supabase allows 6 to 10. */
export const OTP_MIN_LENGTH = 6
export const OTP_MAX_LENGTH = 10
