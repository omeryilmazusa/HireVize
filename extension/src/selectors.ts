/** Common CSS selectors for ATS platforms — ported from backend/automation/utils/selectors.py */

export const GREENHOUSE_SELECTORS = {
  first_name: "#first_name",
  last_name: "#last_name",
  email: "#email",
  phone: "#phone",
  resume: 'input[type="file"]',
  submit: '#submit_app, button[type="submit"]',
} as const;

export const LEVER_SELECTORS = {
  name: 'input[name="name"]',
  email: 'input[name="email"]',
  phone: 'input[name="phone"]',
  resume: 'input[type="file"]',
  submit: 'button[type="submit"]',
} as const;

export const WORKDAY_SELECTORS = {
  apply: '[data-automation-id="jobPostingApplyButton"]',
  first_name: '[data-automation-id="legalNameSection_firstName"]',
  last_name: '[data-automation-id="legalNameSection_lastName"]',
  email: '[data-automation-id="email"]',
  phone: '[data-automation-id="phone-number"]',
  address_line1: '[data-automation-id="addressSection_addressLine1"]',
  city: '[data-automation-id="addressSection_city"]',
  state: '[data-automation-id="addressSection_countryRegion"]',
  zip: '[data-automation-id="addressSection_postalCode"]',
  resume: '[data-automation-id="file-upload-input-ref"]',
  submit: '[data-automation-id="bottom-navigation-next-button"]',
  create_account_email: '[data-automation-id="createAccountEmail"]',
  create_account_password: '[data-automation-id="createAccountPassword"]',
} as const;

export const LINKEDIN_SELECTORS = {
  easy_apply:
    'button.jobs-apply-button, button[aria-label*="Easy Apply"]',
  resume: 'input[type="file"]',
  phone: 'input[id*="phoneNumber"], input[name*="phoneNumber"]',
  submit:
    'button[aria-label="Submit application"], button:has(span:is(:where([class*="submit"])))',
  next: 'button[aria-label="Continue to next step"]',
  review: 'button[aria-label="Review your application"]',
  done: 'button[aria-label="Done"]',
  dismiss: 'button[aria-label="Dismiss"]',
} as const;
