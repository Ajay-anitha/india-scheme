/**
 * Utility functions for Indian Currency, Income Range Formatting,
 * Age Range Formatting, and State/Occupation master lists.
 */

// Master List of States & Union Territories of India
export const INDIAN_STATES = [
  'All India',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu & Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

// Master List of Occupations for Selection Dropdowns
export const OCCUPATIONS = [
  { label: 'All Occupations / Any Sector', value: 'All' },
  { label: '🌾 Farmer / Agriculture Worker', value: 'Farmer' },
  { label: '🎓 Student / Youth / Apprentice', value: 'Student' },
  { label: '💼 Entrepreneur / MSME Business Owner', value: 'Entrepreneur' },
  { label: '🛒 Street Vendor / Micro-Trader', value: 'Vendor' },
  { label: '🛠️ Artisan / Craftsman / Traditional Trade', value: 'Artisan / Worker' },
  { label: '⚓ Fisherman / Aquaculture Worker', value: 'Fisherman / Worker' },
  { label: '👵 Senior Citizen / Pensioner', value: 'Senior Citizen' },
  { label: '👷 Unorganized Worker / Daily Wager', value: 'Worker' },
  { label: '🏢 Salaried / Private / Government Employee', value: 'Employee' },
];

// Master List of Income Ranges for Selection Dropdowns
export const INCOME_RANGES = [
  { label: 'All Income Levels (No Limit)', value: '' },
  { label: 'Up to ₹1,50,000 (EWS / BPL)', value: '150000' },
  { label: 'Up to ₹2,50,000 (Low Income Group)', value: '250000' },
  { label: 'Up to ₹3,50,000', value: '350000' },
  { label: 'Up to ₹5,00,000 (Middle Income Group)', value: '500000' },
  { label: 'Up to ₹8,00,000 (OBC Creamy Layer Limit)', value: '800000' },
  { label: 'Up to ₹12,00,000', value: '1200000' },
  { label: 'Above ₹12,00,000', value: '2000000' },
];

// Master List of Caste / Categories
export const CATEGORIES = [
  { label: 'All Categories / Any Caste', value: 'All' },
  { label: 'General / Unreserved', value: 'General' },
  { label: 'OBC (Other Backward Classes)', value: 'OBC' },
  { label: 'SC (Scheduled Castes)', value: 'SC' },
  { label: 'ST (Scheduled Tribes)', value: 'ST' },
  { label: 'EWS (Economically Weaker Section)', value: 'EWS' },
];

/**
 * Format raw income numeric ceiling into clean Indian currency range.
 * Converts mathematical symbols (<, <=, >, >=) into clean text.
 */
export function formatIncomeDisplay(maxIncome, rawEligibility = '') {
  if (!maxIncome || maxIncome >= 10000000) {
    return 'No Income Limit (All Income Groups)';
  }

  const rawLower = (rawEligibility || '').toLowerCase();
  
  // Check if raw eligibility specifies a range e.g. "3,00,000 to 8,00,000"
  if (rawLower.includes('between') || rawLower.includes('3 lakh') && rawLower.includes('8 lakh')) {
    return '₹3,00,000 – ₹8,00,000';
  }

  const formatted = Number(maxIncome).toLocaleString('en-IN');
  return `Up to ₹${formatted}`;
}

/**
 * Format Age Range into clean human-readable text.
 */
export function formatAgeDisplay(minAge, maxAge) {
  const min = minAge ?? 0;
  const max = maxAge ?? 100;

  if (min === 0 && (max >= 100 || !max)) return 'Any Age (0 – 100 Years)';
  if (min === 0 && max < 100) return `Up to ${max} Years`;
  if (min > 0 && (max >= 100 || !max)) return `${min}+ Years`;
  return `${min} – ${max} Years`;
}

/**
 * Extract Disability Requirement Status
 */
export function formatDisabilityDisplay(rawEligibility = '') {
  const text = (rawEligibility || '').toLowerCase();
  if (text.includes('disab') || text.includes('handicap') || text.includes('rvy') || text.includes('pwd')) {
    return 'Applicable for Persons with Disability (PwD)';
  }
  return 'Not Required';
}

/**
 * Extract Marital Status Requirement
 */
export function formatMaritalDisplay(rawEligibility = '') {
  const text = (rawEligibility || '').toLowerCase();
  if (text.includes('widow')) return 'Widowed Women';
  if (text.includes('orphan')) return 'Orphans / Single';
  if (text.includes('single girl') || text.includes('girl child')) return 'Girl Child / Single';
  if (text.includes('married')) return 'Married Couples';
  return 'All Marital Statuses';
}
