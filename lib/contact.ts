// Inquiry types offered on the contact form; the API rejects anything else.
export const INQUIRY_TYPES = ['Buying / reservations', 'Selling / marketplace listing', 'Investment / valuation', 'Rental / management', 'General support'] as const;
export type InquiryType = (typeof INQUIRY_TYPES)[number];
