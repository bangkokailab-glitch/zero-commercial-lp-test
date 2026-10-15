/* Public settings only. Never put API secrets or customer information here. */
window.MANGA_CONVERSION_CONFIG = Object.freeze({
  enabled: true,
  // No analytics destination has been supplied yet. Local dataLayer only.
  transport: 'none', // 'none' or 'ga4'; use ONE tag owner, never GA4 + GTM together.
  measurementId: '',
});
