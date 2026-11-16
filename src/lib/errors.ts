/** Errors that are safe to show to the user. Anything else is logged and replaced by a generic message. */
export class AppError extends Error {
  constructor(message: string, public code: 'forbidden' | 'not_found' | 'invalid' | 'conflict' | 'limit' | 'rate_limited' | 'not_configured' = 'invalid', public fieldErrors?: Record<string, string>) {
    super(message);
  }
}
export const forbidden = (m = 'Accès refusé.' /* i18n */) => new AppError(m, 'forbidden');
export const notFoundError = (m = 'Élément introuvable.') => new AppError(m, 'not_found');
