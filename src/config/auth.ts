/**
 * Length of the emailed sign-in code.
 *
 * This has to match the "Email OTP Length" setting in the Supabase dashboard
 * (Authentication → Sign In / Providers → Email). If the two disagree, every
 * code is rejected before it is ever sent to Supabase — the form refuses it
 * for being the wrong length, which reads like "wrong code" and is a very
 * confusing thing to debug. Change both together.
 */
export const OTP_LENGTH = 8
