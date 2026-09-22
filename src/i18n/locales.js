// Nynorsk is the site. English exists as machinery, not as content: the
// registry, the language switcher and the hreflang tags all read this list, so
// adding a language is a content job rather than a restructuring one.
export const locales = [
  { code: 'nn', intl: 'nn-NO', og: 'nn_NO', dir: 'ltr', label: 'Nynorsk' },
  { code: 'en', intl: 'en', og: 'en_GB', dir: 'ltr', label: 'English' },
];

export const defaultLocale = 'nn';

export const localeInfo = (code) =>
  locales.find((l) => l.code === code) ?? locales[0];

// Default locale sits at the root, every other language under its own prefix.
export const pathFor = (code) => (code === defaultLocale ? '/' : `/${code}/`);
