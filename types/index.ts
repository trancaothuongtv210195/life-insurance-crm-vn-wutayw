
export type UserRole = 'Admin' | 'Manager' | 'Staff';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phoneNumber?: string;
  avatar?: string;
  createdBy?: string;
  createdAt: Date;
}

export type CustomerClassification = 'Signed' | 'Potential' | 'Dropped';

export type PaymentFrequency = 'month' | 'quarter' | '6-month' | 'year';

export interface InsuranceDetail {
  company: string;
  contractNumber: string;
  policyDetails: string;
  joinDate: Date;
  premiumAmount: number;
  paymentFrequency: PaymentFrequency;
  nextPaymentDate: Date;
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
  };
  occupation?: string;
  financialStatus?: string;
  familyInfo?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  meetingDate?: Date;
  meetingNotes?: string;
  files?: string[];
  classification: CustomerClassification;
  insuranceDetails?: InsuranceDetail[];
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
  type: 'video' | 'pdf' | 'announcement';
  url?: string;
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
}
