/** Billing countries offered at checkout (ISO 3166-1 alpha-2). Names are rendered with Intl.DisplayNames. */
export const BILLING_COUNTRIES = ['CH', 'FR', 'PT', 'BR', 'BE', 'LU', 'DE', 'IT', 'ES', 'AT', 'NL', 'GB', 'IE', 'LI', 'MC', 'CA', 'US', 'AO', 'MZ', 'CV'];

export function countryOptions(intlLocale: string) {
  const names = new Intl.DisplayNames([intlLocale], { type: 'region' });
  return BILLING_COUNTRIES.map((c) => ({ value: c, label: names.of(c) ?? c })).sort((a, b) => a.label.localeCompare(b.label, intlLocale));
}
