export const UserRole = {
  farmer: 'farmer',
  buyer: 'buyer',
  admin: 'admin',
  officer: 'officer',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const UserStatus = {
  active: 'active',
  suspended: 'suspended',
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const VerificationStatus = {
  pending: 'pending',
  verified: 'verified',
  rejected: 'rejected',
} as const;
export type VerificationStatus = (typeof VerificationStatus)[keyof typeof VerificationStatus];

export const ProductUnit = {
  kg: 'kg',
  ton: 'ton',
} as const;
export type ProductUnit = (typeof ProductUnit)[keyof typeof ProductUnit];

export const ListingStatus = {
  draft: 'draft',
  active: 'active',
  sold_out: 'sold_out',
  pending_confirmation: 'pending_confirmation',
  suspended: 'suspended',
  archived: 'archived',
} as const;
export type ListingStatus = (typeof ListingStatus)[keyof typeof ListingStatus];

export const ReportStatus = {
  pending: 'pending',
  resolved: 'resolved',
  rejected: 'rejected',
} as const;
export type ReportStatus = (typeof ReportStatus)[keyof typeof ReportStatus];

export const OtpPurpose = {
  login: 'login',
  change_phone: 'change_phone',
} as const;
export type OtpPurpose = (typeof OtpPurpose)[keyof typeof OtpPurpose];

export const ListingEventType = {
  view: 'view',
  wa_click: 'wa_click',
} as const;
export type ListingEventType = (typeof ListingEventType)[keyof typeof ListingEventType];
