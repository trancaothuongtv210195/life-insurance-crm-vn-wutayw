
export type UserRole = 'Admin' | 'Manager' | 'Staff';

export interface User {
  id: string;
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  phoneNumber?: string;
  avatar?: string;
  createdBy?: string;
  managerId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export type CustomerClassification = 'Signed' | 'Potential' | 'Dropped';

export type PaymentFrequency = 'month' | 'quarter' | '6-month' | 'year';

export interface InsuranceCompany {
  id: string;
  name: string;
}

export interface InsuranceContract {
  id: string;
  company: string;
  contractNumber: string;
  policyDetails: string;
  joinDate: Date;
  premiumAmounts: string; // Comma-separated amounts
  paymentFrequency: PaymentFrequency;
  nextPaymentDate: Date;
}

export interface MeetingRecord {
  id: string;
  date: Date;
  notes: string;
  createdAt: Date;
}

export interface FileAttachment {
  id: string;
  uri: string;
  type: 'image' | 'video';
  name: string;
  size?: number;
}

export interface Customer {
  id: string;
  avatar?: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: Date;
  address: {
    hamlet?: string;
    commune?: string;
    district?: string;
    province?: string;
    city?: string;
    fullAddress?: string;
  };
  occupation?: string;
  financialStatus?: string;
  familyInfo?: string;
  location?: string;
  meetingRecords: MeetingRecord[];
  files: FileAttachment[];
  hasInsurance: boolean;
  insuranceContracts: InsuranceContract[];
  classification: CustomerClassification;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Meeting {
  id: string;
  customerId: string;
  date: Date;
  notes: string;
  createdBy: string;
  createdAt: Date;
}

export interface LearningContent {
  id: string;
  title: string;
  description: string;
  content?: string;
  type: 'video' | 'pdf' | 'announcement';
  videoUrl?: string;
  thumbnailUrl?: string;
  createdBy: string;
  createdAt: Date;
}

export interface DashboardStats {
  totalCustomers: number;
  signedCount: number;
  potentialCount: number;
  droppedCount: number;
  upcomingMeetings: number;
  upcomingPayments: number;
  newCustomersThisMonth: number;
  upcomingBirthdays: number;
  overduePayments: number;
}

export interface CustomerReminder {
  customerId: string;
  customerName: string;
  type: 'birthday' | 'payment-due' | 'payment-overdue';
  daysUntil?: number;
  daysOverdue?: number;
  date: Date;
  message: string;
}

export interface Province {
  code: string;
  name: string;
}

export interface District {
  code: string;
  name: string;
  provinceCode: string;
}

export interface Commune {
  code: string;
  name: string;
  districtCode: string;
}
