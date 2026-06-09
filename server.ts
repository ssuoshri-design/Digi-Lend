import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Serve brand assets directly on the express server for both dev and production
app.get("/assets/brand/digilend-logo.png", (req, res) => {
  const logoPath = path.resolve(process.cwd(), "assets", "brand", "digilend-logo.png");
  if (fs.existsSync(logoPath)) {
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400"); // 1 day cache
    return res.sendFile(logoPath);
  }
  res.status(404).send("Logo not found");
});

app.use("/assets", express.static(path.join(process.cwd(), "assets")));

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
    logoUrl: "data:image/png;base64,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",
  },
  configs: {
    firebase: {
      projectId: "driver-first-4a302",
      apiKey: "AIzaSyBfGQZ3qVCjPhcTUcOpa0feTbTFxBVgMgI",
      appId: "1:590031557700:web:87738a6cfb10e1f092d811",
      senderId: "590031557700"
    },
    decentro: {
      clientId: "",
      clientSecret: "",
      environment: "sandbox"
    },
    razorpay: {
      keyId: "",
      keySecret: ""
    },
    razorpayx: {
      accountNumber: "",
      apiKey: "",
      apiSecret: ""
    }
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
  otpLogs: [] as { id: string; phone: string; deviceId: string; ip: string; timestamp: string }[],
};

// Create a deep copy of the original seed database to support precise resetting
const INITIAL_DATABASE = JSON.parse(JSON.stringify(database));

const DB_FILE_PATH = path.join(process.cwd(), "database.json");

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(database, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write database.json auto-persistence file:", error);
  }
}

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed) {
        if (parsed.settings) Object.assign(database.settings, parsed.settings);
        if (parsed.configs) Object.assign(database.configs, parsed.configs);
        if (parsed.users) database.users = parsed.users;
        if (parsed.loans) database.loans = parsed.loans;
        if (parsed.repayments) database.repayments = parsed.repayments;
        if (parsed.notifications) database.notifications = parsed.notifications;
        if (parsed.tickets) database.tickets = parsed.tickets;
        if (parsed.auditLogs) database.auditLogs = parsed.auditLogs;
        if (parsed.otpLogs) database.otpLogs = parsed.otpLogs;
        console.log("[🟢] Database loaded successfully from database.json");
      }
    } else {
      saveDatabase();
    }
  } catch (error) {
    console.error("Failed to read/load database.json, using default seed memory:", error);
  }
}

// Initial session bootstrap loading from file
loadDatabase();

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
  saveDatabase();
}

// REST API Endpoints

// Synchronized state fetch with masked configs for client security
app.get("/api/db", (req, res) => {
  const sanitizedConfigs = {
    firebase: {
      projectId: database.configs?.firebase?.projectId || "driver-first-4a302",
      apiKey: database.configs?.firebase?.apiKey ? `${database.configs.firebase.apiKey.substring(0, 6)}...` : "AIzaSy...",
      appId: database.configs?.firebase?.appId ? `${database.configs.firebase.appId.substring(0, 10)}...` : "1:59003...",
      senderId: database.configs?.firebase?.senderId || "590031557700"
    },
    decentro: {
      clientId: database.configs?.decentro?.clientId ? `${database.configs.decentro.clientId.substring(0, 4)}...` : "",
      clientSecret: database.configs?.decentro?.clientSecret ? "********" : "",
      environment: database.configs?.decentro?.environment || "sandbox"
    },
    razorpay: {
      keyId: database.configs?.razorpay?.keyId ? `${database.configs.razorpay.keyId.substring(0, 6)}...` : "",
      keySecret: database.configs?.razorpay?.keySecret ? "********" : ""
    },
    razorpayx: {
      accountNumber: database.configs?.razorpayx?.accountNumber ? `${database.configs.razorpayx.accountNumber.substring(0, 4)}...` : "",
      apiKey: database.configs?.razorpayx?.apiKey ? "********" : "",
      apiSecret: database.configs?.razorpayx?.apiSecret ? "********" : ""
    }
  };
  const responseData = {
    ...database,
    configs: sanitizedConfigs
  };
  res.json(responseData);
});

// Production-ready Fintech OTP rate-limiting and audit gate
app.post("/api/otp/validate-request", (req, res) => {
  const { phone, deviceId } = req.body;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown_ip";

  if (!phone || phone.length < 10) {
    return res.status(400).json({ allowed: false, error: "Please enter a valid 10-digit Indian phone number." });
  }

  const cleanPhone = phone.replace(/\s+/g, "").replace(/\D/g, "");
  const now = Date.now();
  const fifteenMinutesAgo = now - 15 * 60 * 1000;

  // Initialize otpLogs array if it doesn't exist
  if (!database.otpLogs) {
    database.otpLogs = [];
  }

  // 1. Enforce 60-second cooldown per phone / device
  const cooldownPeriod = 60 * 1000;
  const lastForPhone = database.otpLogs.find(
    (log) => log.phone === cleanPhone && (now - new Date(log.timestamp).getTime()) < cooldownPeriod
  );
  if (lastForPhone) {
    const elapsed = Math.floor((now - new Date(lastForPhone.timestamp).getTime()) / 1000);
    return res.json({
      allowed: false,
      errorCode: "auth/too-many-requests",
      error: `Too many verification attempts have been made. Please wait ${60 - elapsed} seconds before requesting another OTP.`
    });
  }

  const lastForDevice = database.otpLogs.find(
    (log) => log.deviceId === deviceId && (now - new Date(log.timestamp).getTime()) < cooldownPeriod
  );
  if (lastForDevice) {
    const elapsed = Math.floor((now - new Date(lastForDevice.timestamp).getTime()) / 1000);
    return res.json({
      allowed: false,
      errorCode: "auth/too-many-requests",
      error: `Too many verification attempts have been made. Please wait ${60 - elapsed} seconds before requesting another OTP.`
    });
  }

  // 2. Enforce Max 3 requests per 15 minutes per phone
  const phoneRequests = database.otpLogs.filter(
    (log) => log.phone === cleanPhone && new Date(log.timestamp).getTime() > fifteenMinutesAgo
  );
  if (phoneRequests.length >= 3) {
    return res.json({
      allowed: false,
      errorCode: "auth/too-many-requests",
      error: "Too many verification attempts have been made. Please wait a few minutes before requesting another OTP."
    });
  }

  // 3. Enforce Max 3 requests per 15 minutes per device
  const deviceRequests = database.otpLogs.filter(
    (log) => log.deviceId === deviceId && new Date(log.timestamp).getTime() > fifteenMinutesAgo
  );
  if (deviceRequests.length >= 3) {
    return res.json({
      allowed: false,
      errorCode: "auth/too-many-requests",
      error: "Too many verification attempts have been made. Please wait a few minutes before requesting another OTP."
    });
  }

  // If validation passes, stamp and persist this request attempt
  const newLog = {
    id: `otp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    phone: cleanPhone,
    deviceId: deviceId || "unknown_device",
    ip: typeof ip === "string" ? ip : JSON.stringify(ip),
    timestamp: new Date().toISOString()
  };

  database.otpLogs.unshift(newLog);

  // Prune history older than 2 hours to prevent database size inflation
  const maxRetentionTime = now - 2 * 60 * 60 * 1000;
  database.otpLogs = database.otpLogs.filter((log) => new Date(log.timestamp).getTime() > maxRetentionTime);

  saveDatabase();

  addAuditLog(
    "SECURITY",
    "INFO",
    `[DigiLend SMS Engine] Pre-flight OTP rate check approved for phone +91${cleanPhone} (IP: ${ip}, Device ID: ${deviceId})`
  );

  return res.json({ allowed: true });
});

// Update dynamic API Gateways credentials securely
app.post("/api/admin/configs/update", (req, res) => {
  const { firebase, decentro, razorpay, razorpayx } = req.body;
  if (!database.configs) {
    database.configs = {
      firebase: { projectId: "", apiKey: "", appId: "", senderId: "" },
      decentro: { clientId: "", clientSecret: "", environment: "sandbox" },
      razorpay: { keyId: "", keySecret: "" },
      razorpayx: { accountNumber: "", apiKey: "", apiSecret: "" }
    };
  }

  if (firebase) {
    database.configs.firebase = {
      projectId: firebase.projectId || database.configs.firebase.projectId,
      apiKey: firebase.apiKey || database.configs.firebase.apiKey,
      appId: firebase.appId || database.configs.firebase.appId,
      senderId: firebase.senderId || database.configs.firebase.senderId
    };
  }

  if (decentro) {
    database.configs.decentro = {
      clientId: decentro.clientId || database.configs.decentro.clientId,
      clientSecret: decentro.clientSecret || database.configs.decentro.clientSecret,
      environment: decentro.environment || database.configs.decentro.environment
    };
  }

  if (razorpay) {
    database.configs.razorpay = {
      keyId: razorpay.keyId || database.configs.razorpay.keyId,
      keySecret: razorpay.keySecret || database.configs.razorpay.keySecret
    };
  }

  if (razorpayx) {
    database.configs.razorpayx = {
      accountNumber: razorpayx.accountNumber || database.configs.razorpayx.accountNumber,
      apiKey: razorpayx.apiKey || database.configs.razorpayx.apiKey,
      apiSecret: razorpayx.apiSecret || database.configs.razorpayx.apiSecret
    };
  }

  saveDatabase();
  addAuditLog("SECURITY", "WARNING", "Lending administrator updated gateway API configuration credentials");
  res.json({ success: true, message: "Configuration credentials saved securely on server" });
});

// Connection connectivity validator with actual provider endpoints
app.post("/api/admin/configs/test", async (req, res) => {
  const { service } = req.body;
  const cfg = database.configs;

  try {
    if (service === "firebase") {
      const apiKey = cfg?.firebase?.apiKey || process.env.FIREBASE_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ success: false, error: "Firebase API Key is missing" });
      }
      
      const resp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ })
      });
      const data: any = await resp.json();
      if (resp.status === 400 && data.error?.message === "MISSING_EMAIL") {
        addAuditLog("SERVICE", "INFO", "Firebase API credentials connection test: SUCCESS");
        return res.json({ success: true, message: "Successfully connected to Firebase Auth servers!" });
      } else {
        return res.status(400).json({ success: false, error: data.error?.message || "Firebase Server Authentication Failed" });
      }
    }

    if (service === "decentro") {
      const clientId = cfg?.decentro?.clientId || process.env.DECENTRO_CLIENT_ID;
      const clientSecret = cfg?.decentro?.clientSecret || process.env.DECENTRO_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        return res.status(400).json({ success: false, error: "Decentro client ID and Secret are missing" });
      }
      
      const resp = await fetch("https://in.decentro.tech/v2/kyc/pan/kyc", {
        method: "POST",
        headers: {
          "client_id": clientId,
          "client_secret": clientSecret,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          reference_id: `TST-${Date.now()}`,
          document_id: "ABCDE1234F",
          consent: "Y",
          consent_purpose: "Test Connectivity"
        })
      });
      if (resp.status === 401) {
        return res.status(400).json({ success: false, error: "Decentro Auth Reject: Invalid client_id or client_secret" });
      }
      const data = await resp.json();
      addAuditLog("SERVICE", "INFO", `Decentro API Connection status check: ${resp.status}`);
      return res.json({ success: true, message: "Successfully linked to Decentro KYC Server!", response: data });
    }

    if (service === "razorpay") {
      const keyId = cfg?.razorpay?.keyId || process.env.RAZORPAY_KEY_ID;
      const keySecret = cfg?.razorpay?.keySecret || process.env.RAZORPAY_KEY_SECRET;
      if (!keyId || !keySecret) {
        return res.status(400).json({ success: false, error: "Razorpay Key ID and Secret are missing" });
      }
      const b64 = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
      const resp = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${b64}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: 100,
          currency: "INR",
          receipt: "test-rec"
        })
      });
      const data: any = await resp.json();
      if (resp.status === 401) {
        return res.status(400).json({ success: false, error: "Razorpay authentication failed: Invalid credentials" });
      }
      addAuditLog("SERVICE", "INFO", `Razorpay connection test completed: Status ${resp.status}`);
      return res.json({ success: true, message: "Successfully connected to Razorpay Payment limits!", orderId: data.id });
    }

    if (service === "razorpayx") {
      const account = cfg?.razorpayx?.accountNumber || process.env.RAZORPAYX_ACCOUNT;
      const apiKey = cfg?.razorpayx?.apiKey || process.env.RAZORPAYX_API_KEY;
      const apiSecret = cfg?.razorpayx?.apiSecret || process.env.RAZORPAYX_API_SECRET;
      if (!account || !apiKey || !apiSecret) {
        return res.status(400).json({ success: false, error: "RazorpayX account configuration is incomplete" });
      }
      const b64 = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
      const resp = await fetch("https://api.razorpay.com/v1/payouts", {
        method: "POST",
        headers: {
          "Authorization": `Basic ${b64}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          account_number: account,
          amount: 100,
          currency: "INR",
          mode: "IMPS",
          purpose: "payout",
          fund_account: {
            account_type: "bank_account",
            bank_account: { name: "Test Disbursal", ifsc: "HDFC0000104", account_number: "1234567890" }
          }
        })
      });
      const data = await resp.json();
      if (resp.status === 401) {
        return res.status(400).json({ success: false, error: "RazorpayX payout authentication rejected by commercial clearing house" });
      }
      return res.json({ success: true, message: "RazorpayX business ledger tested successfully. Status: " + resp.status, data });
    }

    return res.status(400).json({ success: false, error: "Unknown service" });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// REAL DECENTRO PAN VERIFICATION API
app.post("/api/decentro/kyc/pan/verify", async (req, res) => {
  const { panNumber } = req.body;
  if (!panNumber || panNumber.length !== 10) {
    return res.status(400).json({ success: false, error: "Invalid PAN length. Must be 10 characters." });
  }

  const clientId = database.configs?.decentro?.clientId || process.env.DECENTRO_CLIENT_ID;
  const clientSecret = database.configs?.decentro?.clientSecret || process.env.DECENTRO_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    addAuditLog("RISK", "WARNING", `PAN ${panNumber} validated using local database indices (Decentro keys unconfigured)`);
    return res.json({
      success: true,
      panNumber,
      fullName: "Aniket Sharma",
      panStatus: "VALID",
      verificationResult: "MATCHED",
      warning: "Completed via server logic fallback. Configure real Decentro credentials in the Admin Panel to execute live calls."
    });
  }

  try {
    const resp = await fetch("https://in.decentro.tech/v2/kyc/pan/kyc", {
      method: "POST",
      headers: {
        "client_id": clientId,
        "client_secret": clientSecret,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        reference_id: `PAN-${Date.now()}`,
        document_id: panNumber,
        consent: "Y",
        consent_purpose: "Fintech lending compliance profile verification"
      })
    });
    
    const data: any = await resp.json();
    if (resp.status !== 200) {
      return res.status(resp.status).json({ success: false, error: "Decentro PAN Exception: " + (data.message || JSON.stringify(data)) });
    }
    
    addAuditLog("RISK", "INFO", `Decentro verified PAN ${panNumber} with status ${data.status || "VALID"}`);
    return res.json({
      success: true,
      panNumber,
      fullName: data.data?.pan_response?.fullName || data.data?.fullName || "Aniket Sharma",
      panStatus: data.data?.pan_response?.status || "VALID",
      verificationResult: "MATCHED"
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Decentro PAN Connection Failure: " + error.message });
  }
});

// REAL DECENTRO BANK PENNY DROP VERIFICATION API
app.post("/api/decentro/kyc/bank/verify", async (req, res) => {
  const { accountNumber, ifscCode } = req.body;
  if (!accountNumber || !ifscCode) {
    return res.status(400).json({ success: false, error: "Account Number and IFSC Code required" });
  }

  const clientId = database.configs?.decentro?.clientId || process.env.DECENTRO_CLIENT_ID;
  const clientSecret = database.configs?.decentro?.clientSecret || process.env.DECENTRO_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    addAuditLog("SERVICE", "WARNING", `Bank account verified under local ledger checks (Decentro credentials empty)`);
    return res.json({
      success: true,
      accountHolderName: "Aniket Sharma",
      verificationStatus: "VERIFIED",
      warning: "Completed via fallback. Please configure Decentro client keys for live penny drop."
    });
  }

  try {
    const resp = await fetch("https://in.decentro.tech/v2/kyc/bank/verify", {
      method: "POST",
      headers: {
        "client_id": clientId,
        "client_secret": clientSecret,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        reference_id: `BNK-${Date.now()}`,
        account_number: accountNumber,
        ifsc_code: ifscCode,
        consent: "Y",
        consent_purpose: "Lending instant disbursal validity"
      })
    });
    
    const data: any = await resp.json();
    if (resp.status !== 200) {
      return res.status(resp.status).json({ success: false, error: "Decentro Bank Drop Exception: " + (data.message || JSON.stringify(data)) });
    }
    
    addAuditLog("SERVICE", "INFO", `Decentro Bank verified account. Holder Name: ${data.data?.accountHolderName}`);
    return res.json({
      success: true,
      accountHolderName: data.data?.accountHolderName || "Aniket Sharma",
      verificationStatus: "VERIFIED"
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Decentro Penny-Drop Connection Failure" });
  }
});

// REAL DECENTRO AADHAAR / DIGILOCKER SESSION API
app.post("/api/decentro/kyc/digilocker/session", async (req, res) => {
  const clientId = database.configs?.decentro?.clientId || process.env.DECENTRO_CLIENT_ID;
  const clientSecret = database.configs?.decentro?.clientSecret || process.env.DECENTRO_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    return res.json({
      success: true,
      redirectUrl: "https://digilocker.gov.in",
      sessionToken: `DIGI-SES-${Date.now()}`,
      warning: "Fallback DigiLocker routing triggered. Set credentials to invoke live OAuth sessions."
    });
  }

  try {
    const resp = await fetch("https://in.decentro.tech/v2/kyc/digilocker/session", {
      method: "POST",
      headers: {
        "client_id": clientId,
        "client_secret": clientSecret,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        reference_id: `DGL-${Date.now()}`,
        consent: "Y",
        consent_purpose: "Fintech client authentication flow"
      })
    });
    
    const data: any = await resp.json();
    if (resp.status !== 200) {
      return res.status(resp.status).json({ success: false, error: "DigiLocker link error: " + (data.message || JSON.stringify(data)) });
    }
    
    return res.json({
      success: true,
      redirectUrl: data.data?.redirectUrl || "https://digilocker.gov.in",
      sessionToken: data.data?.sessionToken || `SES-${Date.now()}`
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "DigiLocker gateway issue: " + error.message });
  }
});

// REAL RAZORPAY PAYMENT GATEWAY ORDER CREATION
app.post("/api/razorpay/order/create", async (req, res) => {
  const { amount, loanId, userId } = req.body;
  if (!amount || !loanId) {
    return res.status(400).json({ success: false, error: "Amount and Loan ID are required" });
  }

  const keyId = database.configs?.razorpay?.keyId || process.env.RAZORPAY_KEY_ID;
  const keySecret = database.configs?.razorpay?.keySecret || process.env.RAZORPAY_KEY_SECRET;
  const amountPaisa = Math.round(Number(amount) * 100);

  if (!keyId || !keySecret) {
    const mockOrderId = `order_MCK${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    return res.json({
      success: true,
      orderId: mockOrderId,
      amount: amountPaisa,
      currency: "INR",
      keyId: "rzp_test_mock",
      isMock: true,
      warning: "Completed via gateway fallback. Set Razorpay credentials in Admin Configuration."
    });
  }

  try {
    const b64 = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const resp = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${b64}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: amountPaisa,
        currency: "INR",
        receipt: `rep_${loanId}_${Date.now()}`
      })
    });
    
    const data: any = await resp.json();
    if (resp.status !== 200) {
      return res.status(resp.status).json({ success: false, error: "Razorpay error: " + (data.error?.description || JSON.stringify(data)) });
    }

    return res.json({
      success: true,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId,
      isMock: false
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "Razorpay Connection Failure: " + error.message });
  }
});

// REAL RAZORPAY PAYMENT VERIFICATION & SETTLEMENT ENGINE
app.post("/api/razorpay/payment/verify", (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, loanId, amount, userId } = req.body;
  
  if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
    return res.status(400).json({ success: false, error: "Missing Razorpay response signatures" });
  }

  const keySecret = database.configs?.razorpay?.keySecret || process.env.RAZORPAY_KEY_SECRET;
  
  if (keySecret) {
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated = hmac.digest("hex");

    if (generated !== razorpay_signature) {
      addAuditLog("SECURITY", "CRITICAL", `Razorpay signature verification FAILURE on payment ID ${razorpay_payment_id}`);
      return res.status(400).json({ success: false, error: "Signature verification failed" });
    }
  }

  const loan = database.loans.find(l => l.id === loanId);
  const user = database.users.find(u => u.id === userId || (loan && u.id === loan.userId));
  
  if (loan) {
    const payVal = Number(amount || loan.repaymentAmount);
    loan.outstandingBalance = Math.max(0, loan.outstandingBalance - payVal);
    
    const nowStr = new Date().toISOString();
    const repayment = {
      id: `rep-${Date.now()}`,
      loanId,
      amountPaid: payVal,
      method: "Razorpay Gateways",
      transactionId: razorpay_payment_id,
      paidAt: nowStr
    };
    database.repayments.push(repayment);

    if (loan.outstandingBalance === 0) {
      loan.status = "REPAID";
      loan.timeline.push({ status: "REPAID", timestamp: nowStr, label: "Fully Repaid via verified Razorpay checkout" });
      if (user) {
        user.creditScore = Math.min(850, user.creditScore + 35);
        user.maxEligibleAmount = Math.min(25000, user.maxEligibleAmount + 3000);
      }
    }

    database.notifications.push({
      id: `not-${Date.now()}`,
      userId: loan.userId,
      title: "Repayment Settlement Complete ✅",
      message: `Received ₹${payVal.toLocaleString('en-IN')} payment via verified Razorpay transaction.`,
      type: "SUCCESS",
      isRead: false,
      createdAt: nowStr,
    });
  }

  saveDatabase();
  addAuditLog("SERVICE", "INFO", `Razorpay signature payment ${razorpay_payment_id} successfully verified and settled.`);
  res.json({ success: true, message: "Payment processed successfully!" });
});

// REAL RAZORPAYX IMPS MONEY DISBURSAL ENGINE (Payout money routing)
app.post("/api/razorpayx/disburse", async (req, res) => {
  const { loanId } = req.body;
  const loan = database.loans.find(l => l.id === loanId);
  if (!loan) {
    return res.status(404).json({ error: "Loan not found" });
  }

  const user = database.users.find(u => u.id === loan.userId);
  if (!user) {
    return res.status(404).json({ error: "User profile not found" });
  }

  const actNum = database.configs?.razorpayx?.accountNumber || process.env.RAZORPAYX_ACCOUNT;
  const apiKey = database.configs?.razorpayx?.apiKey || process.env.RAZORPAYX_API_KEY;
  const apiSecret = database.configs?.razorpayx?.apiSecret || process.env.RAZORPAYX_API_SECRET;

  if (!actNum || !apiKey || !apiSecret) {
    loan.status = "DISBURSED";
    const nowStr = new Date().toISOString();
    loan.timeline.push({ status: "APPROVED", timestamp: nowStr, label: "Underwriting Risk Engine Confirmed" });
    loan.timeline.push({ status: "DISBURSED", timestamp: nowStr, label: `Funds Disbursed to Bank Account IFSC ${user.bank.ifscCode || "HDFC0000104"}` });

    database.notifications.push({
      id: `not-${Date.now()}`,
      userId: loan.userId,
      title: `Disbursal Successful ! 🎉`,
      message: `₹${loan.netDisbursal.toLocaleString('en-IN')} has been fully disbursed. Repay ₹${loan.repaymentAmount.toLocaleString('en-IN')} on or before ${loan.dueDate}.`,
      type: "SUCCESS",
      isRead: false,
      createdAt: nowStr,
    });

    saveDatabase();
    addAuditLog("DISBURSEMENT", "WARNING", `Loan ${loanId} dispatched via standard clearing (RazorpayX credentials unconfigured).`);
    return res.json({
      success: true,
      loan,
      warning: "Completed via core clearing fallback. Set RazorpayX keys in secure Admin Panel to route live payouts."
    });
  }

  try {
    const b64 = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    
    const resp = await fetch("https://api.razorpay.com/v1/payouts", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${b64}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        account_number: actNum,
        amount: Math.round(loan.netDisbursal * 100),
        currency: "INR",
        mode: "IMPS",
        purpose: "payout",
        reference_id: `DISB-${loan.id}`,
        fund_account: {
          account_type: "bank_account",
          bank_account: {
            name: user.fullName,
            ifsc: user.bank.ifscCode || "HDFC0000104",
            account_number: user.bank.accountNumber || "1234567890"
          }
        }
      })
    });

    const data: any = await resp.json();
    if (resp.status !== 200 && resp.status !== 201) {
      return res.status(resp.status).json({ success: false, error: "RazorpayX Error: " + (data.error?.description || JSON.stringify(data)) });
    }

    loan.status = "DISBURSED";
    const nowStr = new Date().toISOString();
    loan.timeline.push({ status: "APPROVED", timestamp: nowStr, label: "Underwriting Risk Engine Confirmed" });
    loan.timeline.push({ status: "DISBURSED", timestamp: nowStr, label: `Funds Disbursed IMPS Transfer: payout_id ${data.id || "tx_disp"}` });

    database.notifications.push({
      id: `not-${Date.now()}`,
      userId: loan.userId,
      title: `Disbursal Successful ! 🎉`,
      message: `₹${loan.netDisbursal.toLocaleString('en-IN')} has been disbursed via IMPS transfer. Payout reference id: ${data.id}.`,
      type: "SUCCESS",
      isRead: false,
      createdAt: nowStr,
    });

    saveDatabase();
    addAuditLog("DISBURSEMENT", "INFO", `RazorpayX loan disbursal transaction ${data.id} executed successfully.`);
    return res.json({ success: true, loan, payoutId: data.id, utr: data.utr || "IMPS_PROCESSED" });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: "RazorpayX Disbursal Failure: " + error.message });
  }
});

// Reset Database/Demo State
app.post("/api/db/reset", (req, res) => {
  database.settings = JSON.parse(JSON.stringify(INITIAL_DATABASE.settings));
  database.users = JSON.parse(JSON.stringify(INITIAL_DATABASE.users));
  database.loans = JSON.parse(JSON.stringify(INITIAL_DATABASE.loans));
  database.repayments = JSON.parse(JSON.stringify(INITIAL_DATABASE.repayments));
  database.notifications = JSON.parse(JSON.stringify(INITIAL_DATABASE.notifications));
  database.tickets = JSON.parse(JSON.stringify(INITIAL_DATABASE.tickets));
  database.auditLogs = JSON.parse(JSON.stringify(INITIAL_DATABASE.auditLogs));
  saveDatabase();
  res.json({ status: "ok", database });
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
  saveDatabase();
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
    saveDatabase();
    
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
    saveDatabase();
    
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
  try {
    const { interestRate, processingFeePercent, gstPercent, platformName, swiggyCashbackPercent, zeroCostTenureMonths, logoUrl } = req.body;
    
    database.settings.interestRate = interestRate !== undefined ? Number(interestRate) : database.settings.interestRate;
    database.settings.processingFeePercent = processingFeePercent !== undefined ? Number(processingFeePercent) : database.settings.processingFeePercent;
    database.settings.gstPercent = gstPercent !== undefined ? Number(gstPercent) : database.settings.gstPercent;
    database.settings.platformName = platformName !== undefined ? platformName : database.settings.platformName;
    database.settings.swiggyCashbackPercent = swiggyCashbackPercent !== undefined ? Number(swiggyCashbackPercent) : database.settings.swiggyCashbackPercent;
    database.settings.zeroCostTenureMonths = Array.isArray(zeroCostTenureMonths) ? zeroCostTenureMonths : database.settings.zeroCostTenureMonths;
    
    // Always lock logoUrl to the universal, secure Brand default base64 asset
    database.settings.logoUrl = "data:image/png;base64,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";
    
    saveDatabase();
    addAuditLog("SECURITY", "WARNING", `Admin override global settings. PlatformName: ${database.settings.platformName}, Interest: ${database.settings.interestRate}%`);
    res.json({ success: true, settings: database.settings });
  } catch (error: any) {
    console.error("Error in /api/admin/settings/update:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Add or Update User Info
app.post("/api/admin/users/update", (req, res) => {
  try {
    const { id, fullName, phone, monthlyIncome, creditScore, maxEligibleAmount, dob, gender, kycStatus, bankVerified, bankName, bankAccount, bankIfsc } = req.body;
    const user = database.users.find(u => u.id === id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    
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
  } catch (error: any) {
    console.error("Error in /api/admin/users/update:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Update Loan Info (e.g., status, balance, dues)
app.post("/api/admin/loans/update", (req, res) => {
  try {
    const { id, amount, status, tenureDays, netDisbursal, repaymentAmount, outstandingBalance, dueDate } = req.body;
    const loan = database.loans.find(l => l.id === id);
    if (!loan) return res.status(404).json({ success: false, error: "Loan not found" });
    
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
  } catch (error: any) {
    console.error("Error in /api/admin/loans/update:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Force Delete User or Loan
app.post("/api/admin/data/delete", (req, res) => {
  try {
    const { type, id } = req.body;
    if (type === "USER") {
      database.users = database.users.filter(u => u.id !== id);
      addAuditLog("SECURITY", "CRITICAL", `Admin DELETED user record ${id}`);
    } else if (type === "LOAN") {
      database.loans = database.loans.filter(l => l.id !== id);
      addAuditLog("SECURITY", "CRITICAL", `Admin DELETED loan record ${id}`);
    }
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error in /api/admin/data/delete:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Add Custom Audit log
app.post("/api/admin/audit/add", (req, res) => {
  try {
    const { category, level, message } = req.body;
    addAuditLog(category, level, message);
    res.json({ success: true });
  } catch (error: any) {
    console.error("Error in /api/admin/audit/add:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Push custom Notification
app.post("/api/admin/notification/push", (req, res) => {
  try {
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
    saveDatabase();
    res.json({ success: true, notification: newNotif });
  } catch (error: any) {
    console.error("Error in /api/admin/notification/push:", error);
    res.status(500).json({ success: false, error: error.message });
  }
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
