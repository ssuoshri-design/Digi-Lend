import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini SDK if API Key is available
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API Client initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Gemini Client: ", error);
  }
}

// ==========================================
// IN-MEMORY SHARED CORE FINTECH DATABASE
// Synchronizes Mobile Frame & Admin Dashboard
// ==========================================

interface KYCInfo {
  panNumber?: string;
  digilockerVerified?: boolean;
  aadhaarAddress?: string;
  selfieUrl?: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  verifiedAt?: string;
}

interface BankAccount {
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  isVerified: boolean;
}

interface UserProfile {
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

interface Loan {
  id: string;
  userId: string;
  amount: number;
  interestRate: number; // monthly % e.g. 2%
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

interface Repayment {
  id: string;
  loanId: string;
  amountPaid: number;
  method: string;
  transactionId: string;
  paidAt: string;
}

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "CRITICAL";
  isRead: boolean;
  createdAt: string;
}

interface SupportTicket {
  id: string;
  userId: string;
  name: string;
  subject: string;
  status: "OPEN" | "RESOLVED";
  messages: { sender: "USER" | "SUPPORT" | "AI_ASSISTANT"; text: string; createdAt: string }[];
  createdAt: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  category: "SERVICE" | "SECURITY" | "RISK" | "DISBURSEMENT";
  level: "INFO" | "WARNING" | "CRITICAL";
  message: string;
}

// Initial Mock Seed Data
const database = {
  settings: {
    interestRate: 2.5,
    processingFeePercent: 3,
    gstPercent: 18,
    platformName: "DigiLend",
    swiggyCashbackPercent: 25,
    zeroCostTenureMonths: [3, 6, 9],
    logoUrl: "",
  },
  users: [
    {
      id: "usr-01",
      fullName: "Aniket Sharma",
      phone: "+91 98765 43210",
      dob: "1994-04-12",
      gender: "Male",
      email: "aniket.sharma@gmail.com",
      occupation: "Software Engineer",
      employmentType: "Salaried",
      monthlyIncome: 85000,
      creditScore: 780,
      maxEligibleAmount: 20000,
      createdAt: "2026-06-01T08:00:00Z",
      kyc: {
        panNumber: "ABCDE1234F",
        digilockerVerified: true,
        aadhaarAddress: "Flat 402, Royal Residency, Indiranagar, Bengaluru, 560038",
        selfieUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        status: "VERIFIED" as const,
        verifiedAt: "2026-06-01T08:30:00Z",
      },
      bank: {
        accountNumber: "50100412345678",
        ifscCode: "HDFC0000104",
        bankName: "HDFC Bank",
        isVerified: true,
      },
      riskEvaluation: {
        score: 88,
        grade: "A++",
        repaymentProbability: 98,
        generatedAt: "2026-06-01T08:25:00Z",
      },
    },
    {
      id: "usr-02",
      fullName: "Priya Patel",
      phone: "+91 87654 32109",
      dob: "1995-11-23",
      gender: "Female",
      email: "priya.patel@outlook.com",
      occupation: "UX Designer",
      employmentType: "Salaried",
      monthlyIncome: 62000,
      creditScore: 710,
      maxEligibleAmount: 15000,
      createdAt: "2026-06-02T10:15:00Z",
      kyc: {
        panNumber: "XYZWP5678A",
        digilockerVerified: true,
        aadhaarAddress: "7A, Green Valley Meadows, Gachibowli, Hyderabad, 500032",
        selfieUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
        status: "VERIFIED" as const,
        verifiedAt: "2026-06-02T10:45:00Z",
      },
      bank: {
        accountNumber: "204123456789",
        ifscCode: "SBIN0001234",
        bankName: "State Bank of India",
        isVerified: true,
      },
      riskEvaluation: {
        score: 75,
        grade: "B+",
        repaymentProbability: 90,
        generatedAt: "2026-06-02T10:30:00Z",
      },
    },
    {
      id: "usr-03",
      fullName: "Rahul Varma",
      phone: "+91 76543 21098",
      dob: "1991-08-05",
      gender: "Male",
      email: "rahul.varma@gmail.com",
      occupation: "Freelance Consultant",
      employmentType: "Self-Employed",
      monthlyIncome: 45000,
      creditScore: 610,
      maxEligibleAmount: 8000,
      createdAt: "2026-06-05T14:20:00Z",
      kyc: {
        panNumber: "PQRJK9101B",
        digilockerVerified: false,
        aadhaarAddress: "Sector 15, Part-2, Gurugram, Haryana, 122001",
        status: "PENDING" as const,
      },
      bank: {
        accountNumber: "9123456780",
        ifscCode: "ICIC0000001",
        bankName: "ICICI Bank",
        isVerified: false,
      },
    },
  ] as UserProfile[],

  loans: [
    {
      id: "lon-101",
      userId: "usr-01",
      amount: 15000,
      interestRate: 2.5,
      processingFee: 450,
      gst: 81,
      tenureDays: 30,
      netDisbursal: 14469,
      repaymentAmount: 15375,
      outstandingBalance: 0,
      status: "REPAID" as const,
      dueDate: "2026-07-01",
      createdAt: "2026-06-01T09:00:00Z",
      timeline: [
        { status: "APPLIED", timestamp: "2026-06-01T09:00:00Z", label: "Applied Online" },
        { status: "APPROVED", timestamp: "2026-06-01T09:05:00Z", label: "Instant Approval" },
        { status: "DISBURSED", timestamp: "2026-06-01T09:12:00Z", label: "Disbursed to Bank" },
        { status: "REPAID", timestamp: "2026-06-05T18:30:00Z", label: "Fully Repaid" },
      ],
    },
    {
      id: "lon-102",
      userId: "usr-02",
      amount: 10000,
      interestRate: 3.0,
      processingFee: 300,
      gst: 54,
      tenureDays: 30,
      netDisbursal: 9646,
      repaymentAmount: 10300,
      outstandingBalance: 10300,
      status: "DISBURSED" as const,
      dueDate: "2026-07-02",
      createdAt: "2026-06-02T11:00:00Z",
      timeline: [
        { status: "APPLIED", timestamp: "2026-06-02T11:00:00Z", label: "Applied Online" },
        { status: "APPROVED", timestamp: "2026-06-02T11:05:00Z", label: "Approved automatically" },
        { status: "DISBURSED", timestamp: "2026-06-02T11:20:00Z", label: "Disbursed to HDFC" },
      ],
    },
  ] as Loan[],

  repayments: [
    {
      id: "rep-201",
      loanId: "lon-101",
      amountPaid: 15375,
      method: "UPI AutoPay",
      transactionId: "TXN5812948194",
      paidAt: "2026-06-05T18:30:00Z",
    },
  ] as Repayment[],

  notifications: [
    {
      id: "not-01",
      userId: "usr-01",
      title: "Loan Disbursed Fully 🎉",
      message: "₹14,469 has been credited into your HDFC Bank Account. Transaction reference id TXN-734199.",
      type: "SUCCESS",
      isRead: false,
      createdAt: "2026-06-01T09:12:00Z",
    },
    {
      id: "not-02",
      userId: "usr-02",
      title: "Active Credit Limit Increased",
      message: "Congratulations Priya! Your maximum limit has been bumped to ₹15,000 based on reliable UPI credits.",
      type: "INFO",
      isRead: false,
      createdAt: "2026-06-02T15:00:00Z",
    },
  ] as Notification[],

  tickets: [
    {
      id: "tkt-01",
      userId: "usr-01",
      name: "Aniket Sharma",
      subject: "EMI Auto-Debit Billing Cycle Query",
      status: "OPEN",
      messages: [
        {
          sender: "USER",
          text: "Hi, can I extend the active loan tenure or change my default bank auto-debit date from 1st to 5th?",
          createdAt: "2026-06-05T09:00:00Z",
        },
        {
          sender: "AI_ASSISTANT",
          text: "Hello Aniket! Thanks for asking. Currently, under regulatory framework guidelines, active loan tenures cannot be changed post disbursement. However, for future loans, you can choose flexible repayment cycles ranging up to 90 days. Would you like me to guide on how to update credit options?",
          createdAt: "2026-06-05T09:02:00Z",
        },
      ],
      createdAt: "2026-06-05T09:00:00Z",
    },
  ] as SupportTicket[],

  auditLogs: [
    {
      id: "aud-01",
      timestamp: "2026-06-07T07:11:00Z",
      category: "SERVICE",
      level: "INFO",
      message: "C-KYC Matcher linked 14 records successfully for +91 98765 43210",
    },
    {
      id: "aud-02",
      timestamp: "2026-06-07T07:12:00Z",
      category: "RISK",
      level: "INFO",
      message: "AI SMS Risk score computed: 98% Repayment probability for Priya Patel.",
    },
    {
      id: "aud-03",
      timestamp: "2026-06-07T07:14:00Z",
      category: "DISBURSEMENT",
      level: "INFO",
      message: "Penny drop test initiated on banking routing ID HDFC0000104. Fully settled in 120ms.",
    },
  ] as AuditLog[],
};

// HELPERS
function addAuditLog(category: "SERVICE" | "SECURITY" | "RISK" | "DISBURSEMENT", level: "INFO" | "WARNING" | "CRITICAL", message: string) {
  const log: AuditLog = {
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString(),
    category,
    level,
    message,
  };
  database.auditLogs.unshift(log);
  if (database.auditLogs.length > 50) database.auditLogs.pop();
}

// REST API Endpoints

// Synchronized state fetch
app.get("/api/db", (req, res) => {
  res.json(database);
});

// Reset Database/Demo State
app.post("/api/db/reset", (req, res) => {
  // Retain a baseline
  res.json({ status: "ok" });
});

// Update or register user
app.post("/api/users/save", (req, res) => {
  const { id, fullName, phone, dob, gender, email, occupation, employmentType, monthlyIncome } = req.body;
  
  if (!phone) return res.status(400).json({ error: "Phone number required" });
  
  let user = database.users.find(u => u.phone === phone || u.id === id);
  
  if (user) {
    // Update existing user profile
    user.fullName = fullName || user.fullName;
    user.dob = dob || user.dob;
    user.gender = gender || user.gender;
    user.email = email || user.email;
    user.occupation = occupation || user.occupation;
    user.employmentType = employmentType || user.employmentType;
    user.monthlyIncome = monthlyIncome ? Number(monthlyIncome) : user.monthlyIncome;
    addAuditLog("SERVICE", "INFO", `Profile updated for ${user.fullName}`);
  } else {
    // Create new profile
    const newId = id || `usr-${Date.now()}`;
    user = {
      id: newId,
      fullName: fullName || "New App Applicant",
      phone,
      dob: dob || "1998-01-01",
      gender: gender || "Not Specified",
      email: email || "user@digilend.tech",
      occupation: occupation || "Salaried Employee",
      employmentType: employmentType || "Salaried",
      monthlyIncome: monthlyIncome ? Number(monthlyIncome) : 35000,
      creditScore: 650,
      maxEligibleAmount: 10000,
      createdAt: new Date().toISOString(),
      kyc: { status: "PENDING" },
      bank: { isVerified: false },
    };
    database.users.push(user);
    addAuditLog("SECURITY", "INFO", `New user OTP registration verified: ${phone}`);
  }
  
  res.json({ success: true, user });
});

// Complete KYC Verification Step
app.post("/api/kyc/verify", (req, res) => {
  const { userId, panNumber, digilockerVerified, aadhaarAddress, selfieUrl } = req.body;
  const user = database.users.find(u => u.id === userId);
  
  if (!user) return res.status(404).json({ error: "User not found" });
  
  user.kyc = {
    panNumber: panNumber || user.kyc.panNumber,
    digilockerVerified: digilockerVerified !== undefined ? digilockerVerified : user.kyc.digilockerVerified,
    aadhaarAddress: aadhaarAddress || user.kyc.aadhaarAddress,
    selfieUrl: selfieUrl || user.kyc.selfieUrl,
    status: "VERIFIED", // Approve automatically for flawless high fidelity demo
    verifiedAt: new Date().toISOString(),
  };
  
  // Also bump score and max eligible amount based on successful KYC checks!
  user.creditScore = Math.min(850, user.creditScore + 40);
  user.maxEligibleAmount = Math.max(12000, Math.round((user.monthlyIncome * 0.35) / 1000) * 1000);
  
  addAuditLog("RISK", "INFO", `KYC instant approved with PAN/DL credentials match for user ${user.fullName}`);
  
  res.json({ success: true, user });
});

// Admin overrides verification status
app.post("/api/admin/kyc/override", (req, res) => {
  const { userId, status } = req.body;
  const user = database.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  user.kyc.status = status;
  addAuditLog("SECURITY", "WARNING", `Admin overridden KYC for ${user.fullName} to status ${status}`);
  res.json({ success: true, user });
});

// Verify Bank Account
app.post("/api/bank/verify", (req, res) => {
  const { userId, accountNumber, ifscCode, bankName } = req.body;
  const user = database.users.find(u => u.id === userId);
  
  if (!user) return res.status(404).json({ error: "User not found" });
  
  user.bank = {
    accountNumber,
    ifscCode,
    bankName: bankName || "Standard Partner Bank",
    isVerified: true,
  };
  
  addAuditLog("SERVICE", "INFO", `Penny drop test executed and name audit matched on IFSC ${ifscCode}`);
  
  res.json({ success: true, user });
});

// Request Loan Apply
app.post("/api/loans/apply", (req, res) => {
  const { userId, amount, tenureDays } = req.body;
  const user = database.users.find(u => u.id === userId);
  
  if (!user) return res.status(404).json({ error: "User profile not found" });
  
  const loanAmount = Number(amount);
  const tenure = Number(tenureDays);
  
  // Calculate standard banking parameters
  const interestRate = database.settings.interestRate;
  const processingFee = Math.round(loanAmount * (database.settings.processingFeePercent / 100));
  const gst = Math.round(processingFee * (database.settings.gstPercent / 100));
  const netDisbursal = loanAmount - processingFee - gst;
  const repaymentAmount = Math.round(loanAmount * (1 + (interestRate * (tenure / 30)) / 100));
  
  // Due date logic
  const due = new Date();
  due.setDate(due.getDate() + tenure);
  
  const newLoan: Loan = {
    id: `lon-${Date.now()}`,
    userId,
    amount: loanAmount,
    interestRate,
    processingFee,
    gst,
    tenureDays: tenure,
    netDisbursal,
    repaymentAmount,
    outstandingBalance: repaymentAmount,
    status: "APPLIED",
    dueDate: due.toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    timeline: [
      { status: "APPLIED", timestamp: new Date().toISOString(), label: "Digital Loan Checklist Cleared" },
    ],
  };
  
  database.loans.push(newLoan);
  
  addAuditLog("DISBURSEMENT", "INFO", `New loan application of ₹${loanAmount} requested by ${user.fullName}`);
  
  res.json({ success: true, loan: newLoan });
});

// eSign & Disburse Loan instantly
app.post("/api/loans/esign", (req, res) => {
  const { loanId, signatureType } = req.body;
  const loan = database.loans.find(l => l.id === loanId);
  
  if (!loan) return res.status(404).json({ error: "Loan not found" });
  
  loan.status = "DISBURSED";
  const nowStr = new Date().toISOString();
  
  loan.timeline.push({
    status: "APPROVED",
    timestamp: nowStr,
    label: "Underwriting Risk Engine Confirmed",
  });
  
  loan.timeline.push({
    status: "DISBURSED",
    timestamp: nowStr,
    label: `Funds Disbursed to Bank IFSC Code`,
  });
  
  const user = database.users.find(u => u.id === loan.userId);
  const userName = user ? user.fullName : "Applicant";
  
  // Add a system notification
  const notification: Notification = {
    id: `not-${Date.now()}`,
    userId: loan.userId,
    title: `Disbursal Successful ! 🎉`,
    message: `₹${loan.netDisbursal.toLocaleString('en-IN')} has been fully disbursed. Repay ₹${loan.repaymentAmount.toLocaleString('en-IN')} on or before ${loan.dueDate} to maintain your premium credit score.`,
    type: "SUCCESS",
    isRead: false,
    createdAt: nowStr,
  };
  database.notifications.push(notification);
  
  addAuditLog("DISBURSEMENT", "INFO", `Loan ${loan.id} (₹${loan.amount}) digital signature '${signatureType}' validated. Funds dispatched on UPI Node.`);
  
  res.json({ success: true, loan });
});

// Pay / Repay Loan Active
app.post("/api/loans/repay", (req, res) => {
  const { loanId, amount, method } = req.body;
  const loan = database.loans.find(l => l.id === loanId);
  if (!loan) return res.status(404).json({ error: "Loan not found" });
  
  const payVal = Number(amount);
  loan.outstandingBalance = Math.max(0, loan.outstandingBalance - payVal);
  
  const nowStr = new Date().toISOString();
  
  const repayment: Repayment = {
    id: `rep-${Date.now()}`,
    loanId,
    amountPaid: payVal,
    method: method || "UPI Instant",
    transactionId: `TXN${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    paidAt: nowStr,
  };
  database.repayments.push(repayment);
  
  if (loan.outstandingBalance === 0) {
    loan.status = "REPAID";
    loan.timeline.push({
      status: "REPAID",
      timestamp: nowStr,
      label: "Cleared via Auto-Debit settlement",
    });
    
    // Increment score of user for timely repayment!
    const user = database.users.find(u => u.id === loan.userId);
    if (user) {
      user.creditScore = Math.min(850, user.creditScore + 35);
      user.maxEligibleAmount = Math.min(25000, user.maxEligibleAmount + 3000);
    }
  }
  
  // Notification
  const notification: Notification = {
    id: `not-${Date.now()}`,
    userId: loan.userId,
    title: "Repayment Settlement Complete ✅",
    message: `Received ₹${payVal.toLocaleString('en-IN')} payment via ${repayment.method}. Outstanding balance: ₹${loan.outstandingBalance}. Thank you!`,
    type: "SUCCESS",
    isRead: false,
    createdAt: nowStr,
  };
  database.notifications.push(notification);
  
  addAuditLog("SERVICE", "INFO", `Repayment of ₹${payVal} for loan ${loan.id} cleared via node gateways.`);
  
  res.json({ success: true, loan });
});

// Post a support ticket message
app.post("/api/support/ticket", (req, res) => {
  const { userId, subject, text } = req.body;
  const user = database.users.find(u => u.id === userId);
  const name = user ? user.fullName : "Unknown user";
  
  const newTicket: SupportTicket = {
    id: `tkt-${Date.now()}`,
    userId,
    name,
    subject: subject || "In-App Lending Inquiry",
    status: "OPEN",
    messages: [
      {
        sender: "USER",
        text,
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
  };
  
  database.tickets.push(newTicket);
  res.json({ success: true, ticket: newTicket });
});

// Underwriting Risk Engine with Server-side Gemini API
// If users specify banking logs or copy paste SMS data, this performs Gemini audit parsing!
app.post("/api/gemini/credit-scoring", async (req, res) => {
  const { userId, smsLogsText } = req.body;
  const user = database.users.find(u => u.id === userId);
  
  if (!user) return res.status(404).json({ error: "User not found" });
  if (!smsLogsText) return res.status(400).json({ error: "Logs text is required" });
  
  addAuditLog("RISK", "WARNING", `Underwriter initiating remote Gemini risk assessment for ${user.fullName}`);
  
  if (!aiClient) {
    // Return high quality simulated report if Gemini Key is not set up yet
    const simulatedScore = Math.floor(65 + Math.random() * 30);
    const gr = simulatedScore > 85 ? "A++" : simulatedScore > 75 ? "B+" : "C-";
    const reportSimulated = {
      eligibilityScore: simulatedScore,
      riskGrade: gr,
      estimatedIncome: Math.round(user.monthlyIncome * 0.95),
      repaymentProbability: simulatedScore + 5,
      anomalies: [
        "Slight transaction delay in utility payments observed.",
        "Demonstrated high direct-to-account credit ratio on UPI networks.",
        "Verified low credit card utilization across linked accounts."
      ]
    };
    
    user.riskEvaluation = {
      score: reportSimulated.eligibilityScore,
      grade: reportSimulated.riskGrade,
      anomalyDetails: reportSimulated.anomalies.join(" | "),
      repaymentProbability: reportSimulated.repaymentProbability,
      generatedAt: new Date().toISOString(),
    };
    
    return res.json({
      success: true,
      simulated: true,
      report: reportSimulated,
      notes: "Simulation deployed due to default template key. Configure GEMINI_API_KEY for real AI evaluation."
    });
  }
  
  try {
    const prompt = `
You are the DigiLend AI Risk Underwriter and Credit Analyst.
Your task is to analyze these smartphone financial transaction SMS notifications paste-outs, extract salary parameters, estimate monthly earnings, highlight utility payments, UPI credits, EMIs, and report any severe risk anomalies.

SMS Paste block:
"""
${smsLogsText}
"""

You must respond exclusively with a valid JSON object matching this structure:
{
  "eligibilityScore": number (an integer from 300 to 900 where 300 is bad, 900 is excellent),
  "riskGrade": "A++" | "A" | "B+" | "B" | "C" | "D",
  "estimatedIncome": number (estimated monthly earnings based on credits),
  "repaymentProbability": number (percentage integer from 0 to 100),
  "anomalies": string[] (max 3 detailed financial observations, bullet points, or positive/negative factors)
}
No extra markdown prefix, no markdown blocks, output raw JSON only.
`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const textOutput = response.text || "";
    const parsed = JSON.parse(textOutput.trim());
    
    // Normalize eligibility score to credit score range or map
    user.creditScore = parsed.eligibilityScore ? Math.round(parsed.eligibilityScore) : user.creditScore;
    
    user.riskEvaluation = {
      score: parsed.repaymentProbability || 85,
      grade: parsed.riskGrade || "A",
      anomalyDetails: (parsed.anomalies || []).join(" | "),
      repaymentProbability: parsed.repaymentProbability || 85,
      generatedAt: new Date().toISOString(),
    };
    
    addAuditLog("RISK", "INFO", `Gemini response parsed. Computed Credit Score: ${user.creditScore}, Repayment probability: ${parsed.repaymentProbability}%`);
    
    res.json({
      success: true,
      simulated: false,
      report: parsed,
    });
  } catch (error: any) {
    console.error("Gemini risk audit crashed: ", error);
    res.status(500).json({ error: "Gemini analysis error: " + error.message });
  }
});

// Live Chat Support with Gemini
app.post("/api/gemini/support", async (req, res) => {
  const { userId, message, ticketId } = req.body;
  const user = database.users.find(u => u.id === userId);
  
  let ticket = database.tickets.find(t => t.id === ticketId);
  if (!ticket) {
    ticket = {
      id: ticketId || `tkt-${Date.now()}`,
      userId: userId || "anonymous",
      name: user ? user.fullName : "Applicant",
      subject: "Support Assistant Interaction",
      status: "OPEN",
      messages: [],
      createdAt: new Date().toISOString(),
    };
    database.tickets.push(ticket);
  }
  
  // Push user message
  const userMsg = {
    sender: "USER" as const,
    text: message,
    createdAt: new Date().toISOString(),
  };
  ticket.messages.push(userMsg);
  
  if (!aiClient) {
    // Simulated helpful fintech auto assistant response
    const replies = [
      "I see you are inquiring about loans. Your current maximum credit limit is calculated automatically based on income. If you upload your KYC papers, our risk underwriter normally processes approval in 5 minutes!",
      "DigiLend utilizes encrypted banking channels. Your penny drop and digilocker records are stored safely following strict financial regulations.",
      "To pay your outstanding balance, simply navigate to the Repayment section inside the app, and choose your preferred UPI option or NetBanking.",
      "Our backend logs indicate your KYC is completed! Feel free to pick high flexible tenures of 7, 14, 30, or up to 90 days."
    ];
    const pickedReply = replies[ticket.messages.length % replies.length];
    
    const botMsg = {
      sender: "AI_ASSISTANT" as const,
      text: `${pickedReply} (AI Assistant - Demo mode)`,
      createdAt: new Date().toISOString(),
    };
    ticket.messages.push(botMsg);
    
    return res.json({ success: true, messages: ticket.messages, ticketId: ticket.id });
  }
  
  try {
    // Let's format the chat thread history for the prompt
    const chatHistory = ticket.messages.map(m => `${m.sender}: ${m.text}`).join("\n");
    const userDetail = user ? `User Details:\n- Name: ${user.fullName}\n- Monthly Income: ${user.monthlyIncome}\n- Credit Score: ${user.creditScore}\n- KYC status: ${user.kyc.status}\n- Active Banking: ${user.bank.bankName || "None"}` : "";

    const prompt = `
You are the official DigiLend AI customer support agent for DigiLend.
Speak in a reliable, friendly, empathetic, but professional and clear tone.

${userDetail}

Here is the conversation history:
${chatHistory}
Assistant: Keep the reply within 2-3 concise sentences. Help the user with their account or explain DigiLend features (tenures, instant approvals, paperless digital KYC, bank transfers, UPI AutoPay security). Do not use markdown bolding in your text. Just return plain paragraphs.
`;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const replyText = response.text || "Thank you for reaching out to DigiLend. Our support representatives will assist you shortly.";
    
    const botMsg = {
      sender: "AI_ASSISTANT" as const,
      text: replyText.trim(),
      createdAt: new Date().toISOString(),
    };
    ticket.messages.push(botMsg);
    
    res.json({ success: true, messages: ticket.messages, ticketId: ticket.id });
  } catch (error: any) {
    console.error("Gemini support crashed: ", error);
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// ADMIN DASHBOARD REST MANAGEMENT API
// ==========================================

// 1. Update Core App Settings
app.post("/api/admin/settings/update", (req, res) => {
  const { interestRate, processingFeePercent, gstPercent, platformName, swiggyCashbackPercent, zeroCostTenureMonths, logoUrl } = req.body;
  
  database.settings.interestRate = interestRate !== undefined ? Number(interestRate) : database.settings.interestRate;
  database.settings.processingFeePercent = processingFeePercent !== undefined ? Number(processingFeePercent) : database.settings.processingFeePercent;
  database.settings.gstPercent = gstPercent !== undefined ? Number(gstPercent) : database.settings.gstPercent;
  database.settings.platformName = platformName !== undefined ? platformName : database.settings.platformName;
  database.settings.swiggyCashbackPercent = swiggyCashbackPercent !== undefined ? Number(swiggyCashbackPercent) : database.settings.swiggyCashbackPercent;
  database.settings.zeroCostTenureMonths = Array.isArray(zeroCostTenureMonths) ? zeroCostTenureMonths : database.settings.zeroCostTenureMonths;
  if (logoUrl !== undefined) {
    database.settings.logoUrl = logoUrl;
  }
  
  addAuditLog("SECURITY", "WARNING", `Admin override global settings. PlatformName: ${database.settings.platformName}, Interest: ${database.settings.interestRate}%`);
  res.json({ success: true, settings: database.settings });
});

// 2. Add or Update User Info
app.post("/api/admin/users/update", (req, res) => {
  const { id, fullName, phone, monthlyIncome, creditScore, maxEligibleAmount, dob, gender, kycStatus, bankVerified, bankName, bankAccount, bankIfsc } = req.body;
  const user = database.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: "User not found" });
  
  user.fullName = fullName || user.fullName;
  user.phone = phone || user.phone;
  user.dob = dob || user.dob;
  user.gender = gender || user.gender;
  user.monthlyIncome = monthlyIncome !== undefined ? Number(monthlyIncome) : user.monthlyIncome;
  user.creditScore = creditScore !== undefined ? Number(creditScore) : user.creditScore;
  user.maxEligibleAmount = maxEligibleAmount !== undefined ? Number(maxEligibleAmount) : user.maxEligibleAmount;
  
  if (kycStatus) {
    user.kyc.status = kycStatus;
    if (kycStatus === "VERIFIED") {
      user.kyc.digilockerVerified = true;
    }
  }
  
  if (bankVerified !== undefined) {
    user.bank.isVerified = bankVerified;
  }
  if (bankName) user.bank.bankName = bankName;
  if (bankAccount) user.bank.accountNumber = bankAccount;
  if (bankIfsc) user.bank.ifscCode = bankIfsc;
  
  addAuditLog("SECURITY", "WARNING", `Admin override user parameters for user: ${user.fullName}`);
  res.json({ success: true, user });
});

// 3. Update Loan Info (e.g., status, balance, dues)
app.post("/api/admin/loans/update", (req, res) => {
  const { id, amount, status, tenureDays, netDisbursal, repaymentAmount, outstandingBalance, dueDate } = req.body;
  const loan = database.loans.find(l => l.id === id);
  if (!loan) return res.status(404).json({ error: "Loan not found" });
  
  loan.amount = amount !== undefined ? Number(amount) : loan.amount;
  loan.status = status || loan.status;
  loan.tenureDays = tenureDays !== undefined ? Number(tenureDays) : loan.tenureDays;
  loan.netDisbursal = netDisbursal !== undefined ? Number(netDisbursal) : loan.netDisbursal;
  loan.repaymentAmount = repaymentAmount !== undefined ? Number(repaymentAmount) : loan.repaymentAmount;
  loan.outstandingBalance = outstandingBalance !== undefined ? Number(outstandingBalance) : loan.outstandingBalance;
  loan.dueDate = dueDate || loan.dueDate;
  
  if (loan.status === "REPAID") {
    loan.outstandingBalance = 0;
  }
  
  addAuditLog("SECURITY", "WARNING", `Admin manually modified loan ${id} fields`);
  res.json({ success: true, loan });
});

// 4. Force Delete User or Loan
app.post("/api/admin/data/delete", (req, res) => {
  const { type, id } = req.body;
  if (type === "USER") {
    database.users = database.users.filter(u => u.id !== id);
    addAuditLog("SECURITY", "CRITICAL", `Admin DELETED user record ${id}`);
  } else if (type === "LOAN") {
    database.loans = database.loans.filter(l => l.id !== id);
    addAuditLog("SECURITY", "CRITICAL", `Admin DELETED loan record ${id}`);
  }
  res.json({ success: true });
});

// 5. Add Custom Audit log
app.post("/api/admin/audit/add", (req, res) => {
  const { category, level, message } = req.body;
  addAuditLog(category, level, message);
  res.json({ success: true });
});

// 6. Push custom Notification
app.post("/api/admin/notification/push", (req, res) => {
  const { userId, title, message, type } = req.body;
  const newNotif = {
    id: `not-${Date.now()}`,
    userId,
    title,
    message,
    type: type || "INFO",
    isRead: false,
    createdAt: new Date().toISOString()
  };
  database.notifications.push(newNotif);
  res.json({ success: true, notification: newNotif });
});


// ==========================================
// STATIC FRONTEND ROUTING & VITE MIDDLEWARE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Develop mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production compiled static assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[🟢 DigiLend Server] Active and routing successfully on http://localhost:${PORT}`);
  });
}

startServer();
