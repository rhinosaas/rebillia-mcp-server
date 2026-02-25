/** Integration types for list filter (PublicAPI). */
export const INTEGRATION_TYPES = [
  "ecommerce",
  "email",
  "marketing",
  "tax",
  "shipping",
  "accounting",
  "chat",
] as const;

/** Integration key names (PublicAPI get/list by key). */
export const INTEGRATION_KEY_NAMES = [
  "avalara",
  "bigcommerce",
  "customRate",
  "fedex",
  "flatRate",
  "freeShipping",
  "freshBooksCloudAccounting",
  "google",
  "mailchimp",
  "monsoonStoneEdge",
  "myob",
  "pickupInStore",
  "quickbooks",
  "saasu",
  "salesforce",
  "shipBy",
  "shipperHq",
  "shippingZone",
  "shopify",
  "slack",
  "smtp",
  "taxamo",
  "thomsonreuters",
  "ups",
  "upsShippingProtection",
  "usps",
  "vertex",
  "xero",
] as const;

export type IntegrationType = (typeof INTEGRATION_TYPES)[number];
export type IntegrationKeyName = (typeof INTEGRATION_KEY_NAMES)[number];
