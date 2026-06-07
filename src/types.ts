export interface KYCInfo {
  panNumber?: string;
  digilockerVerified?: boolean;
  aadhaarAddress?: string;
  selfieUrl?: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  verifiedAt?: string;
}

export interface BankAccount {
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  isVerified: boolean;
}

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  dob: string;
  gender: string;
  email: string;
  occupation: string;
  employmentType: string;
  monthlyIncome: number;
  creditScore: number;
  maxEligibleAmount: number;
  createdAt: string;
  kyc: KYCInfo;
  bank: BankAccount;
  riskEvaluation?: {
    score: number;
    grade: string;
    anomalyDetails?: string;
    repaymentProbability: number;
    generatedAt: string;
  };
}

export interface Loan {
  id: string;
  userId: string;
  amount: number;
  interestRate: number;
  processingFee: number;
  gst: number;
  tenureDays: number;
  netDisbursal: number;
  repaymentAmount: number;
  outstandingBalance: number;
  status: "APPLIED" | "APPROVED" | "DISBURSED" | "REPAID" | "CLOSED" | "OVERDUE";
  dueDate: string;
  createdAt: string;
  timeline: { status: string; timestamp: string; label: string }[];
}

export interface Repayment {
  id: string;
  loanId: string;
  amountPaid: number;
  method: string;
  transactionId: string;
  paidAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "CRITICAL";
  isRead: boolean;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  name: string;
  subject: string;
  status: "OPEN" | "RESOLVED";
  messages: { sender: "USER" | "SUPPORT" | "AI_ASSISTANT"; text: string; createdAt: string }[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  category: "SERVICE" | "SECURITY" | "RISK" | "DISBURSEMENT";
  level: "INFO" | "WARNING" | "CRITICAL";
  message: string;
}

export interface FullDatabaseState {
  users: UserProfile[];
  loans: Loan[];
  repayments: Repayment[];
  notifications: Notification[];
  tickets: SupportTicket[];
  auditLogs: AuditLog[];
}
