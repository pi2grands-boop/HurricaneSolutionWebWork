/**
 * Extiende el tipo de express-session para incluir isAdmin.
 */
declare module 'express-session' {
  interface SessionData {
    isAdmin?: boolean;
  }
}
