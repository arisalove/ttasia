/**
 * Cookie name constants shared between middleware (Edge runtime, minimal
 * imports on purpose) and the server-only session/auth logic. Keeping this
 * file dependency-free avoids pulling the entire data layer into the
 * middleware bundle just to read two string constants.
 */
export const DEMO_SESSION_COOKIE = 'taptap_demo_session';
export const ROLE_COOKIE = 'taptap_demo_role';
export const LOCALE_COOKIE = 'taptap_locale';
