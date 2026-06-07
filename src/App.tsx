import React, { useState, useEffect, useRef } from "react";
import { 
  Shield, Bell, HelpCircle, User, CreditCard, ChevronRight, 
  ArrowLeft, CheckCircle2, DollarSign, Clock, FileText, Send, Lock,
  RefreshCw, Award, Camera, Check, Building, FileCheck, ArrowUpRight, Zap,
  Sparkles, History, Wallet, LogOut, MessageSquare, Key, Phone, Settings, AlertCircle, RefreshCcw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, Loan, FullDatabaseState, Notification, SupportTicket } from "./types";
import confetti from "canvas-confetti";

export default function App() {
  // Mobile stages: "SPLASH" | "ONBOARDING" | "LOGIN" | "OTP" | "PERMISSIONS" | "KYC_FUNNEL" | "ELIGIBILITY" | "APPROVAL" | "DASHBOARD" | "APPLY_LOAN" | "REPAY_FLOW"
  const [stage, setStage] = useState<string>("SPLASH");
  const [onboardingScreen, setOnboardingScreen] = useState<number>(1);
  const [phoneNumber, setPhoneNumber] = useState<string>("9876543210");
  const [otpCode, setOtpCode] = useState<string[]>(["", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState<number>(30);
  const [activeTab, setActiveTab] = useState<"home" | "loans" | "activity" | "support" | "profile">("home");

  // Bottom sheets & Interactive Overlay Panels
  const [activeBottomSheet, setActiveBottomSheet] = useState<"EMI_CALC" | "REWARDS" | "REFERRAL" | "OFFER_DETAIL" | "MESSAGE" | "CONFIRM_RESET" | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<{ title: string; tag: string; description: string; instruction: string; accentColor: string } | null>(null);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const [scratchedBonus, setScratchedBonus] = useState<boolean>(false);
  const [scratchingLoader, setScratchingLoader] = useState<boolean>(false);
  const [emiInputAmount, setEmiInputAmount] = useState<number>(15000);
  const [emiInputTenure, setEmiInputTenure] = useState<number>(30);

  // KYC Multi-Step Stage
  const [kycStep, setKycStep] = useState<number>(1); // 1 to 5
  const [panNumber, setPanNumber] = useState<string>("ABCDE1234F");
  const [aadhaarOTP, setAadhaarOTP] = useState<string[]>(["", "", "", "", "", ""]);
  const [selfieCaptured, setSelfieCaptured] = useState<string | null>(null);
  const [isCapturingSelfie, setIsCapturingSelfie] = useState<boolean>(false);
  const [extractedAddress, setExtractedAddress] = useState<string>("Flat 402, Royal Residency, Indiranagar, Bengaluru, 560038");
  const [bankAccount, setBankAccount] = useState<string>("50100412345678");
  const [bankIfsc, setBankIfsc] = useState<string>("HDFC0000104");
  const [bankName, setBankName] = useState<string>("HDFC Bank");

  // Eligibility loading animations
  const [eligibilityStageIndex, setEligibilityStageIndex] = useState<number>(0);
  const eligibilityStages = [
    "Verifying Identity",
    "Analyzing Profile",
    "Calculating Eligibility",
    "Preparing Offer"
  ];

  // Active state synced with server
  const [fintechDb, setFintechDb] = useState<FullDatabaseState>({
    users: [],
    loans: [],
    repayments: [],
    notifications: [],
    tickets: [],
    auditLogs: [],
  });
  const platformName = fintechDb.settings?.platformName || "DigiLend";
  const logoUrl = fintechDb.settings?.logoUrl || "";
  const adminInterestRate = fintechDb.settings?.interestRate ?? 2.5;
  const adminFeePercent = fintechDb.settings?.processingFeePercent ?? 3;
  const adminGstPercent = fintechDb.settings?.gstPercent ?? 18;
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoadingFeed, setIsLoadingFeed] = useState<boolean>(true);

  // Apply loan parameters
  const [applyAmount, setApplyAmount] = useState<number>(10000);
  const [applyTenure, setApplyTenure] = useState<number>(30); // days
  const [applyStep, setApplyStep] = useState<number>(1); // 1 to 5
  const [hasAgreedTerms, setHasAgreedTerms] = useState<boolean>(false);
  const [esignOTP, setEsignOTP] = useState<string[]>(["", "", "", ""]);
  const [isSubmittingLoan, setIsSubmittingLoan] = useState<boolean>(false);
  const [newlyCreatedLoanId, setNewlyCreatedLoanId] = useState<string | null>(null);

  // Repay stage parameters
  const [paymentMethod, setPaymentMethod] = useState<string>("UPI");
  const [repaymentProcessing, setRepaymentProcessing] = useState<boolean>(false);

  // Support section parameters
  const [supportMessage, setSupportMessage] = useState<string>("");
  const [isSupportSubmitting, setIsSupportSubmitting] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<{ sender: "USER" | "AI_ASSISTANT" | "SUPPORT"; text: string; createdAt: string }[]>([
    {
      sender: "AI_ASSISTANT",
      text: "Welcome to DigiLend Customer Support ! Ask me anything about your digital KYC verification, RBI regulations, immediate credit limits, or repayment cycles.",
      createdAt: new Date().toISOString()
    }
  ]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  // Admin Panel states
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState<boolean>(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>("");
  const [adminPasswordError, setAdminPasswordError] = useState<string>("");
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState<boolean>(false);
  const [adminActiveTab, setAdminActiveTab] = useState<"settings" | "users" | "loans" | "notifications">("settings");

  const handleAdminAuth = () => {
    if (adminPasswordInput === "Admin@2026") {
      setIsAdminPasswordModalOpen(false);
      setAdminPasswordError("");
      setAdminPasswordInput("");
      setIsAdminPanelOpen(true);
    } else {
      setAdminPasswordError("Invalid password! Please verify and retry.");
    }
  };

  // Editable fields for admin settings
  const [editedPlatformName, setEditedPlatformName] = useState<string>("");
  const [editedLogoUrl, setEditedLogoUrl] = useState<string>("");
  const [editedInterestRate, setEditedInterestRate] = useState<number>(2.5);
  const [editedProcessingFee, setEditedProcessingFee] = useState<number>(3);
  const [editedGst, setEditedGst] = useState<number>(18);
  const [editedCashback, setEditedCashback] = useState<number>(25);

  // Selected state for editing specific objects
  const [selectedAdminUser, setSelectedAdminUser] = useState<any | null>(null);
  const [selectedAdminLoan, setSelectedAdminLoan] = useState<any | null>(null);

  // New alert injection state
  const [notifTitle, setNotifTitle] = useState<string>("");
  const [notifMessage, setNotifMessage] = useState<string>("");
  const [notifType, setNotifType] = useState<"INFO" | "SUCCESS" | "WARNING" | "CRITICAL">("INFO");

  // New audit log injection state
  const [auditMsg, setAuditMsg] = useState<string>("");
  const [auditCategory, setAuditCategory] = useState<"SERVICE" | "SECURITY" | "RISK" | "DISBURSEMENT">("SERVICE");
  const [auditLevel, setAuditLevel] = useState<"INFO" | "WARNING" | "CRITICAL">("INFO");

  // Pre-populate admin fields when server values stream in
  const [hasInitializedAdminFields, setHasInitializedAdminFields] = useState<boolean>(false);
  useEffect(() => {
    if (fintechDb.settings && !hasInitializedAdminFields) {
      setEditedPlatformName(fintechDb.settings.platformName);
      setEditedInterestRate(fintechDb.settings.interestRate);
      setEditedProcessingFee(fintechDb.settings.processingFeePercent);
      setEditedGst(fintechDb.settings.gstPercent);
      setEditedCashback(fintechDb.settings.swiggyCashbackPercent);
      setEditedLogoUrl(fintechDb.settings.logoUrl || "");
      setHasInitializedAdminFields(true);
    }
  }, [fintechDb.settings, hasInitializedAdminFields]);

  // Admin Operation Handlers
  const updateAdminSettingsOnServer = async () => {
    try {
      const res = await fetch("/api/admin/settings/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platformName: editedPlatformName,
          interestRate: editedInterestRate,
          processingFeePercent: editedProcessingFee,
          gstPercent: editedGst,
          swiggyCashbackPercent: editedCashback,
          logoUrl: editedLogoUrl,
        }),
      });
      if (res.ok) {
        if (currentUser) {
          await fetch("/api/admin/notification/push", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: currentUser.id,
              title: "System Parameters Shifted",
              message: `Administrator has set the base interest rate to ${editedInterestRate}% with dynamic computational rules.`,
              type: "WARNING"
            }),
          });
        }
        await syncWithBackend();
        alert("Global platform settings updated & propagated to standard client!");
      } else {
        alert("Server error shifting settings.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateAdminUserOnServer = async (userObj: any) => {
    try {
      const res = await fetch("/api/admin/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userObj),
      });
      if (res.ok) {
        await syncWithBackend();
        alert("Success: Profile parameters overridden successfully!");
        setSelectedAdminUser(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const updateAdminLoanOnServer = async (loanObj: any) => {
    try {
      const res = await fetch("/api/admin/loans/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loanObj),
      });
      if (res.ok) {
        await syncWithBackend();
        alert("Success: Loan ledger state modified completely!");
        setSelectedAdminLoan(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteAdminDataOnServer = async (type: "USER" | "LOAN", id: string) => {
    if (!window.confirm(`Warning: Are you absolutely sure you want to permanently delete this ${type === "USER" ? "user profile" : "loan structure"} ?`)) return;
    try {
      const res = await fetch("/api/admin/data/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      });
      if (res.ok) {
        await syncWithBackend();
        alert("Destructive deletion complete.");
        setSelectedAdminUser(null);
        setSelectedAdminLoan(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const injectAdminAuditLog = async () => {
    if (!auditMsg.trim()) return;
    try {
      const res = await fetch("/api/admin/audit/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: auditCategory,
          level: auditLevel,
          message: auditMsg
        }),
      });
      if (res.ok) {
        setAuditMsg("");
        await syncWithBackend();
        alert("Frictionless log inserted into core Audit ledger.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pushAdminNotification = async () => {
    if (!notifTitle.trim() || !notifMessage.trim()) return;
    if (!currentUser) {
      alert("Please login first or select an active account so you can inject targeted feeds.");
      return;
    }
    try {
      const res = await fetch("/api/admin/notification/push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          title: notifTitle,
          message: notifMessage,
          type: notifType
        }),
      });
      if (res.ok) {
        setNotifTitle("");
        setNotifMessage("");
        await syncWithBackend();
        alert("Direct notification dispatched successfully!");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Sync DB interval
  const syncWithBackend = async () => {
    try {
      const res = await fetch("/api/db");
      if (res.ok) {
        const data = await res.json();
        setFintechDb(data);

        // Keep current logged-in user updated dynamically
        if (currentUser) {
          const freshUser = data.users.find((u: any) => u.phone === currentUser.phone || u.id === currentUser.id);
          if (freshUser) {
            setCurrentUser(freshUser);
          }
        }
      }
      setIsLoadingFeed(false);
    } catch (e) {
      console.error("Backend state synchronization failure: ", e);
      setIsLoadingFeed(false);
    }
  };

  useEffect(() => {
    syncWithBackend();
    const inv = setInterval(syncWithBackend, 3000);
    return () => clearInterval(inv);
  }, [currentUser?.id]);

  // SPLASH AUTO TIMEOUT
  useEffect(() => {
    if (stage === "SPLASH") {
      const splashTimer = setTimeout(() => {
        setStage("ONBOARDING");
      }, 2500);
      return () => clearTimeout(splashTimer);
    }
  }, [stage]);

  // LOGIN OTP COUNTDOWN TIMER
  useEffect(() => {
    let timerId: any = null;
    if (stage === "OTP" && otpTimer > 0) {
      timerId = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timerId);
  }, [stage, otpTimer]);

  // ELIGIBILITY SCANNING SEQUENCE
  useEffect(() => {
    let scanTimer: any = null;
    if (stage === "ELIGIBILITY") {
      if (eligibilityStageIndex < eligibilityStages.length) {
        scanTimer = setTimeout(() => {
          setEligibilityStageIndex((prev) => prev + 1);
        }, 1200);
      } else {
        // Confetti and move to approval screen!
        triggerConfettiBall();
        setStage("APPROVAL");
      }
    }
    return () => clearTimeout(scanTimer);
  }, [stage, eligibilityStageIndex]);

  const triggerConfettiBall = () => {
    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.55 },
      colors: ["#FF7A00", "#081B4B", "#22C55E", "#E65C00"]
    });
  };

  // HANDLERS
  const startOTPVerifyFlow = () => {
    setOtpTimer(30);
    setStage("OTP");
  };

  const handleVerifyOTPCode = () => {
    // If the registered user already exists in db, forward directly to Dashboard. Otherwise, permissions & KYC.
    const isNewUser = !fintechDb.users.some(
      (u) => u.phone.replace(/\D/g, "").includes(phoneNumber)
    );

    if (isNewUser) {
      setStage("PERMISSIONS");
    } else {
      const existing = fintechDb.users.find(
        (u) => u.phone.replace(/\D/g, "").includes(phoneNumber)
      );
      if (existing) {
        setCurrentUser(existing);
      }
      setStage("DASHBOARD");
    }
  };

  // Complete Basic Profile and Save/Register User Info
  const processUserProfileRegistration = async () => {
    try {
      const response = await fetch("/api/users/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: `+91 ${phoneNumber.substring(0, 5)} ${phoneNumber.substring(5)}`,
          fullName: "James Fernandes",
          dob: "1994-11-20",
          gender: "Male",
          email: "james.f@gmail.com",
          occupation: "Architect & Consultant",
          employmentType: "Salaried",
          monthlyIncome: 85000
        }),
      });
      const resData = await response.json();
      if (resData.success) {
        setCurrentUser(resData.user);
        setStage("KYC_FUNNEL");
        setKycStep(1);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Multi-step KYC processes
  const handleProceedKYCStep = async () => {
    if (kycStep === 1) {
      // PAN Verify -> Aadhaar DigiLocker Setup
      setKycStep(2);
    } else if (kycStep === 2) {
      // Aadhaar Verify -> Face Selfie Scan
      setKycStep(3);
    } else if (kycStep === 3) {
      // Face Selfie Captured -> Aadhaar Address Form
      setKycStep(4);
    } else if (kycStep === 4) {
      // Aadhaar Address Validated -> Bank Placement Setup
      setKycStep(5);
    } else if (kycStep === 5) {
      // Bank Setup -> Run instant Eligibility calculations
      if (!currentUser) return;
      try {
        // Verify with api
        const kycPayload = {
          userId: currentUser.id,
          panNumber: panNumber,
          digilockerVerified: true,
          aadhaarAddress: extractedAddress,
          selfieUrl: selfieCaptured || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
        };
        const kycRes = await fetch("/api/kyc/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(kycPayload),
        });
        const bankPayload = {
          userId: currentUser.id,
          accountNumber: bankAccount,
          ifscCode: bankIfsc,
          bankName: bankName,
        };
        await fetch("/api/bank/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bankPayload),
        });

        const latestKycData = await kycRes.json();
        if (latestKycData.success) {
          setCurrentUser(latestKycData.user);
        }
        
        // Start processing eligibility simulator stage
        setEligibilityStageIndex(0);
        setStage("ELIGIBILITY");
      } catch (err) {
        console.error("KYC Save crash: ", err);
        setStage("ELIGIBILITY");
      }
    }
  };

  // Camera Face Capture Mimic
  const startLiveSelfieCaptureCamera = () => {
    setIsCapturingSelfie(true);
    setTimeout(() => {
      setSelfieCaptured("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200");
      setIsCapturingSelfie(false);
    }, 1800);
  };

  // APPLY FOR LOAN PIPELINE
  const handleApplyLoanNow = async () => {
    if (!currentUser) return;
    setIsSubmittingLoan(true);
    try {
      const res = await fetch("/api/loans/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          amount: applyAmount,
          tenureDays: applyTenure
        }),
      });
      const data = await res.json();
      setIsSubmittingLoan(false);
      if (data.success) {
        setNewlyCreatedLoanId(data.loan.id);
        setApplyStep(3); // skip straight to summary after configuration
      }
    } catch (e) {
      console.error(e);
      setIsSubmittingLoan(false);
    }
  };

  const handleEsignSignatureVerify = async () => {
    if (!newlyCreatedLoanId) return;
    setIsSubmittingLoan(true);
    try {
      const res = await fetch("/api/loans/esign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loanId: newlyCreatedLoanId,
          signatureType: "Aadhaar eSign OTP code"
        }),
      });
      const data = await res.json();
      setIsSubmittingLoan(false);
      if (data.success) {
        setApplyStep(5); // Success Timeline Disbursal view!
        triggerConfettiBall();
        syncWithBackend();
      }
    } catch (e) {
      console.error(e);
      setIsSubmittingLoan(false);
    }
  };

  // REPAY THE OUTSTANDING AMOUNT
  const handleImmediateRepaymentAction = async () => {
    if (!myActiveLoan) return;
    setRepaymentProcessing(true);
    try {
      const res = await fetch("/api/loans/repay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          loanId: myActiveLoan.id,
          amount: myActiveLoan.outstandingBalance,
          method: `${paymentMethod} Instant Clearing`
        }),
      });
      const data = await res.json();
      setRepaymentProcessing(false);
      if (data.success) {
        triggerConfettiBall();
        syncWithBackend();
        setStage("DASHBOARD");
        setActiveTab("home");
      }
    } catch (e) {
      console.error(e);
      setRepaymentProcessing(false);
    }
  };

  // SEND LIVE SUPPORT MESSAGE WITH GEMINI PROXY ENDPOINT
  const handleSendMessageToAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    const query = supportMessage;
    setSupportMessage("");
    setIsSupportSubmitting(true);

    const userEntry = { sender: "USER" as const, text: query, createdAt: new Date().toISOString() };
    setChatHistory((p) => [...p, userEntry]);

    try {
      const res = await fetch("/api/gemini/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser?.id || "anonymous-usr",
          message: query,
          ticketId: activeTicketId
        }),
      });
      const data = await res.json();
      setIsSupportSubmitting(false);
      if (data.success) {
        setActiveTicketId(data.ticketId);
        setChatHistory(data.messages);
      }
    } catch (err) {
      setIsSupportSubmitting(false);
      console.error(err);
    }
  };

  // DYNAMIC CALCULATIONS & ACTIVE GETTERS
  const myActiveLoan = fintechDb.loans.find(
    (l) => currentUser && l.userId === currentUser.id && (l.status === "DISBURSED" || l.status === "APPLIED" || l.status === "OVERDUE" || l.status === "APPROVED")
  );

  const myLoanHistory = fintechDb.loans.filter(
    (l) => currentUser && l.userId === currentUser.id
  );

  // Dynamic values during Apply Loan Selection Slider
  const calcInterest = Math.round(applyAmount * ((adminInterestRate / 100) * (applyTenure / 30)));
  const calcFee = Math.round(applyAmount * (adminFeePercent / 100));
  const calcGst = Math.round(calcFee * (adminGstPercent / 100));
  const calcTotalRepay = applyAmount + calcInterest;
  const calcDisbursal = applyAmount - calcFee - calcGst;

  // COLOR THEME UTILS
  const gradHeader = "bg-gradient-to-r from-[#FF7A00] to-[#E65C00] text-white";
  const orangeNavyGrad = "bg-gradient-to-br from-[#FF7A00] via-[#D05C00] to-[#081B4B]";

  const resetAllAppDemoData = () => {
    setCurrentUser(null);
    setStage("SPLASH");
    setActiveTab("home");
    setPhoneNumber("9876543210");
    setOtpCode(["", "", "", ""]);
    setKycStep(1);
    setApplyStep(1);
    setNewlyCreatedLoanId(null);
  };

  return (
    <div className="min-h-screen bg-[#030E26] text-white flex justify-center items-center font-sans antialiased selection:bg-[#FF7A00]/40">
      
      {/* 
        PRODUCTION MOBILE SCREEN VIEWPORT CONTAINER
        Ensures perfect device-proportioned dimensions for desktop (w-full max-w-md min-h-screen)
        while being flawlessly responsive and filling mobile native dimensions.
      */}
      <div className="w-full max-w-md min-h-screen bg-[#030E26] shadow-2xl relative flex flex-col overflow-hidden border-x border-[#081B4B]/30 select-none">
        


        <div className="flex-1 flex flex-col relative overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* Stage 1: MAIN HERO SPLASH SCREEN */}
            {stage === "SPLASH" && (
              <motion.div 
                key="splash"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 bg-[#030E26] flex flex-col justify-between p-8 text-center z-50 overflow-hidden"
              >
                {/* Floating soft glow effects */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[#FF7A00]/10 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#081B4B]/30 blur-3xl pointer-events-none"></div>

                <div className="flex justify-end pt-2">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">v2.16 Premium</span>
                </div>

                <div className="flex flex-col items-center justify-center flex-1 space-y-4">
                  {/* Floating Particle/Glow Shield Brand Logo */}
                  {logoUrl ? (
                    <motion.div 
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                      className="h-28 w-auto flex items-center justify-center"
                    >
                      <img src={logoUrl} alt={`${platformName} Logo`} className="max-h-28 max-w-[260px] object-contain" referrerPolicy="no-referrer" />
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                      className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#FF7A00] to-[#E65C00] p-0.5 shadow-[0_0_40px_rgba(255,122,0,0.35)] flex items-center justify-center relative overflow-hidden"
                    >
                      <div className="absolute inset-x-0 bottom-0 top-1/2 bg-slate-950/25"></div>
                      <Shield className="w-12 h-12 text-white stroke-[2]" />
                      <span className="absolute text-lg font-black font-mono text-white mt-1">₹</span>
                    </motion.div>
                  )}

                  <div className="space-y-1">
                    <h1 className="text-3xl font-black tracking-tight text-white">{platformName}</h1>
                    <p className="text-xs tracking-widest text-[#FF7A00] uppercase font-mono font-black">
                      Fast. Secure. Digital.
                    </p>
                  </div>
                </div>

                <div className="pb-8 space-y-3">
                  <div className="flex justify-center space-x-1">
                    {[1, 2, 3].map((p) => (
                      <span key={p} className="w-1.5 h-1.5 bg-[#FF7A00]/40 rounded-full animate-bounce" style={{ animationDelay: `${p * 0.15}s` }}></span>
                    ))}
                  </div>
                  <p className="text-[10px] text-zinc-500 font-mono tracking-wider">RBI COMPLIANT LENDING PLATFORM</p>
                </div>
              </motion.div>
            )}

            {/* Stage 2: PREMIUM INTUITIVE ONBOARDING */}
            {stage === "ONBOARDING" && (
              <motion.div 
                key="onboarding"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 p-6 flex flex-col justify-between"
              >
                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center">
                    {logoUrl ? (
                      <img src={logoUrl} alt={`${platformName} Logo`} className="h-14 max-w-[150px] object-contain" referrerPolicy="no-referrer" />
                    ) : (
                      <span className="text-sm font-black tracking-wider text-[#FF7A00]">{platformName}</span>
                    )}
                  </div>
                  <button onClick={() => setStage("LOGIN")} className="text-xs text-[#6B7280] hover:text-[#FF7A00] uppercase font-bold tracking-wider">Skip</button>
                </div>

                <div className="my-auto py-8">
                  <AnimatePresence mode="wait">
                    {onboardingScreen === 1 && (
                      <motion.div 
                        key="scr1"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        className="space-y-6"
                      >
                        {/* Premium custom Vector Illustration placeholder using pure Tailwind and styled elements */}
                        <div className="relative w-48 h-48 mx-auto flex items-center justify-center bg-gradient-to-br from-[#081B4B] to-[#030E26] rounded-full border border-[#FF7A00]/20 shadow-[0_12px_40px_rgba(255,122,0,0.1)]">
                          <div className="absolute inset-0 rounded-full bg-[#FF7A00]/5 animate-ping" style={{ animationDuration: "3s" }}></div>
                          <Clock className="w-16 h-16 text-[#FF7A00] stroke-[1.5]" />
                          <div className="absolute bottom-6 right-6 bg-[#22C55E] p-2.5 rounded-2xl shadow-lg border border-slate-900 animate-bounce">
                            <DollarSign className="w-5 h-5 text-white" />
                          </div>
                        </div>

                        <div className="text-center space-y-2">
                          <h2 className="text-2xl font-extrabold tracking-tight text-white leading-tight">
                            Get Funds When You Need Them
                          </h2>
                          <p className="text-sm text-[#6B7280] px-4 leading-relaxed">
                            Apply in minutes and receive funds directly into your bank account.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {onboardingScreen === 2 && (
                      <motion.div 
                        key="scr2"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        className="space-y-6"
                      >
                        <div className="relative w-48 h-48 mx-auto flex items-center justify-center bg-gradient-to-br from-[#081B4B] to-[#030E26] rounded-full border border-[#FF7A00]/20 shadow-[0_12px_40px_rgba(8,27,75,0.4)]">
                          <Shield className="w-16 h-16 text-[#FF7A00] stroke-[1.5]" />
                          <div className="absolute top-6 left-6 bg-[#22C55E] p-2 rounded-xl shadow-lg border border-slate-900">
                            <Lock className="w-4 h-4 text-white" />
                          </div>
                        </div>

                        <div className="text-center space-y-2">
                          <h2 className="text-2xl font-extrabold tracking-tight text-white leading-tight">
                            Bank Grade Security
                          </h2>
                          <p className="text-sm text-[#6B7280] px-4 leading-relaxed">
                            Protected using advanced encryption and compliance standards.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {onboardingScreen === 3 && (
                      <motion.div 
                        key="scr3"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -40 }}
                        className="space-y-6"
                      >
                        <div className="relative w-48 h-48 mx-auto flex items-center justify-center bg-gradient-to-br from-[#081B4B] to-[#030E26] rounded-full border border-[#FF7A00]/20 shadow-[0_12px_40px_rgba(255,122,0,0.1)]">
                          <CheckCircle2 className="w-16 h-16 text-[#FF7A00] stroke-[1.5]" />
                          <div className="absolute top-10 right-6 bg-orange-600 p-2 rounded-xl text-white font-mono text-[9px] font-black">
                            100% ONLINE
                          </div>
                        </div>

                        <div className="text-center space-y-2">
                          <h2 className="text-2xl font-extrabold tracking-tight text-white leading-tight">
                            100% Digital Process
                          </h2>
                          <p className="text-sm text-[#6B7280] px-4 leading-relaxed">
                            No paperwork. No branch visits. Approved and disbursed completely online.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Onboarding buttons */}
                <div className="space-y-6 pb-6">
                  {/* Indicator Pills */}
                  <div className="flex justify-center space-x-1.5">
                    {[1, 2, 3].map((step) => (
                      <span 
                        key={step} 
                        onClick={() => setOnboardingScreen(step)} 
                        className={`h-2 rounded-full cursor-pointer transition-all duration-300 ${
                          onboardingScreen === step ? "w-6 bg-[#FF7A00]" : "w-2 bg-slate-700"
                        }`}
                      ></span>
                    ))}
                  </div>

                  {onboardingScreen < 3 ? (
                    <button 
                      onClick={() => setOnboardingScreen((p) => p + 1)}
                      className="w-full bg-[#081B4B] hover:bg-[#FF7A00] text-white py-4 rounded-2xl font-bold transition-all duration-300 flex justify-center items-center space-x-2 shadow-lg"
                    >
                      <span>Continue</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setStage("LOGIN")}
                      className="w-full bg-gradient-to-r from-[#FF7A00] to-[#E65C00] hover:scale-[1.02] text-white py-4 rounded-2xl font-bold transition-all duration-200 flex justify-center items-center space-x-2 shadow-[0_10px_25px_rgba(255,122,0,0.25)]"
                    >
                      <span>Get Started</span>
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Stage 3: LOGIN - MOBILE NUMBER SCREEN */}
            {stage === "LOGIN" && (
              <motion.div 
                key="login"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2 pt-2 pb-4">
                    <button onClick={() => setStage("ONBOARDING")} className="p-1 rounded-full text-slate-400 hover:text-white">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                  </div>

                  {logoUrl && (
                    <div className="mb-6 flex justify-start">
                      <img src={logoUrl} alt={`${platformName} Logo`} className="h-18 max-w-[180px] object-contain" referrerPolicy="no-referrer" />
                    </div>
                  )}

                  <h2 className="text-3xl font-black tracking-tight text-white leading-tight font-sans">Welcome to {platformName}</h2>
                  <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                    Fast. Secure. Digital. Please input your secure mobile code to retrieve or register your loan files.
                  </p>

                  <div className="mt-8 bg-[#081B4B]/30 border border-[#081B4B] p-5 rounded-3xl space-y-4">
                    <label className="text-[10px] font-bold text-[#FF7A00] uppercase tracking-widest font-mono">Mobile Phone Index</label>
                    
                    <div className="flex items-center space-x-3 bg-slate-950/40 p-3 rounded-2xl border border-slate-800">
                      <span className="text-sm font-bold text-slate-300 border-r border-[#6B7280]/20 pr-3 font-mono">🇮🇳 +91</span>
                      <input 
                        type="text"
                        maxLength={10}
                        placeholder="Enter 10-Digit Mobile"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        className="flex-1 bg-transparent border-0 text-base font-mono tracking-widest text-white focus:outline-hidden focus:ring-0"
                      />
                    </div>
                  </div>
                </div>

                <div className="pb-6">
                  <button 
                    onClick={startOTPVerifyFlow}
                    disabled={phoneNumber.length < 10}
                    className={`w-full py-4 rounded-2xl font-bold tracking-wide transition-all ${
                      phoneNumber.length === 10
                        ? "bg-gradient-to-r from-[#FF7A00] to-[#E65C00] text-white shadow-lg"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    Continue
                  </button>
                  <p className="text-[10px] text-zinc-500 text-center mt-3 font-mono">By proceeding, you authorize {platformName} to match CIBIL information.</p>
                </div>
              </motion.div>
            )}

            {/* Stage 4: OTP INPUT SCREEN */}
            {stage === "OTP" && (
              <motion.div 
                key="otp"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2 pt-2 pb-6">
                    <button onClick={() => setStage("LOGIN")} className="p-1 rounded-full text-slate-400 hover:text-white">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <span className="text-xs font-bold font-mono text-slate-400">Security PIN</span>
                  </div>

                  <h2 className="text-2xl font-black tracking-tight text-white leading-tight">Verification</h2>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Sent a 4-Digit authorization code to <span className="text-[#FF7A00] font-mono">+91 {phoneNumber}</span>.
                  </p>

                  <div className="mt-8 bg-[#081B4B]/30 border border-[#081B4B] p-5 rounded-3xl space-y-4">
                    <div className="flex justify-between space-x-2 max-w-[240px] mx-auto">
                      {[0, 1, 2, 3].map((idx) => (
                        <input 
                          key={idx}
                          id={`otp-box-${idx}`}
                          type="text"
                          maxLength={1}
                          value={otpCode[idx]}
                          placeholder="•"
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            const copy = [...otpCode];
                            copy[idx] = val;
                            setOtpCode(copy);
                            if (val && idx < 3) {
                              document.getElementById(`otp-box-${idx + 1}`)?.focus();
                            }
                          }}
                          className="w-12 h-12 text-center text-xl font-black bg-slate-950 border border-slate-800 rounded-xl focus:border-[#FF7A00] focus:outline-hidden text-white"
                        />
                      ))}
                    </div>

                    <div className="pt-2 text-center">
                      <button 
                        onClick={() => setOtpCode(["9", "9", "8", "8"])} 
                        className="text-[10px] font-mono text-zinc-400 bg-slate-950 border border-slate-800 py-1.5 px-3 rounded-md hover:text-[#FF7A00]"
                      >
                        Auto Fill PIN (9988)
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-xs font-mono pt-2 text-[#6B7280]">
                      <span>{otpTimer > 0 ? `Resend code in ${otpTimer}s` : "No code matched?"}</span>
                      {otpTimer === 0 ? (
                        <button onClick={() => { setOtpTimer(30); setOtpCode(["", "", "", ""]); }} className="text-[#FF7A00] font-bold underline">Resend OTP</button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="pb-6">
                  <button 
                    onClick={handleVerifyOTPCode}
                    disabled={otpCode.some((c) => c === "")}
                    className={`w-full py-4 rounded-2xl font-bold tracking-wide transition-all ${
                      !otpCode.some((c) => c === "")
                        ? "bg-gradient-to-r from-[#FF7A00] to-[#E65C00] text-white shadow-lg"
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    Verify & Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* Stage 5: PERMISSIONS CONSENT SCREEN */}
            {stage === "PERMISSIONS" && (
              <motion.div 
                key="permissions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 p-6 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-2xl font-black text-white pt-4">Permissions Approval</h2>
                  <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                    DigiLend utilizes advanced algorithms authorized under banking provisions. We check SMS context to certify earnings.
                  </p>

                  <div className="space-y-3 mt-6">
                    <div className="p-3.5 rounded-2xl border border-slate-800/40 bg-[#081B4B]/10 space-y-1">
                      <div className="flex items-center space-x-2 text-xs font-bold text-white">
                        <MessageSquare className="w-4 h-4 text-[#FF7A00]" />
                        <span>SMS Analysis Consent</span>
                      </div>
                      <p className="text-[10px] text-[#6B7280] pl-6">
                        Analyzes banking transaction notifications to compute eligibility scores instantly.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-slate-800/40 bg-[#081B4B]/10 space-y-1">
                      <div className="flex items-center space-x-2 text-xs font-bold text-white">
                        <Clock className="w-4 h-4 text-[#FF7A00]" />
                        <span>Precise Location</span>
                      </div>
                      <p className="text-[10px] text-[#6B7280] pl-6">
                        Ensures commercial residency bounds match the KYC credentials cleanly.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-slate-800/40 bg-[#081B4B]/10 space-y-1">
                      <div className="flex items-center space-x-2 text-xs font-bold text-white">
                        <Bell className="w-4 h-4 text-[#FF7A00]" />
                        <span>Loan Alerts Notifications</span>
                      </div>
                      <p className="text-[10px] text-[#6B7280] pl-6">
                        Informs you on settlement reminders, credit increments, and active status updates.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl border border-slate-800/40 bg-[#081B4B]/10 space-y-1">
                      <div className="flex items-center space-x-2 text-xs font-bold text-white">
                        <Shield className="w-4 h-4 text-[#FF7A00]" />
                        <span>Device Security Shield</span>
                      </div>
                      <p className="text-[10px] text-[#6B7280] pl-6">
                        Guards against emulator attacks, securing credentials cleanly.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pb-6">
                  <button 
                    onClick={processUserProfileRegistration}
                    className="w-full bg-gradient-to-r from-[#FF7A00] to-[#E65C00] text-white py-4 rounded-2xl font-bold font-sans hover:opacity-90 shadow-lg"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* Stage 6: MULTI-STEP KYC FUNNEL SCREEN */}
            {stage === "KYC_FUNNEL" && (
              <motion.div 
                key="kyc_funnel"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center pt-2 pb-6 border-b border-slate-800/60">
                    <span className="text-[11px] font-bold font-mono text-[#FF7A00] uppercase tracking-wider">KYC Compliance Suite</span>
                    <span className="text-xs font-black font-mono bg-[#081B4B] px-3 py-1 rounded-full">Step {kycStep} of 5</span>
                  </div>

                  {/* Title dynamically changed based on KYC step */}
                  {kycStep === 1 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4">
                      <h3 className="text-2xl font-black">PAN Verification</h3>
                      <p className="text-xs text-[#6B7280]">
                        Enter your 10-character Permanent Account Number to match CIBIL information automatically.
                      </p>

                      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                        <div className="w-full h-32 rounded-xl bg-gradient-to-br from-[#081B4B] to-[#030E26] flex flex-col justify-center items-center text-center border border-dashed border-[#FF7A00]/40">
                          <FileText className="w-8 h-8 text-[#FF7A00] mb-1.5" />
                          <span className="text-xs font-bold">PAN Card Document ID</span>
                          <span className="text-[9px] text-[#6B7280] uppercase tracking-widest mt-0.5">Automated Optical Match</span>
                        </div>

                        <div>
                          <label className="text-[9px] tracking-widest text-[#FF7A00] font-bold block mb-1 font-mono uppercase">PAN ID NUMBER</label>
                          <input 
                            type="text"
                            maxLength={10}
                            value={panNumber}
                            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                            className="w-full p-3 font-mono text-center text-lg tracking-widest bg-slate-950 border border-slate-800 focus:border-[#FF7A00] rounded-xl focus:outline-hidden"
                            placeholder="ABCDE1234F"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {kycStep === 2 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4">
                      <h3 className="text-2xl font-black">Aadhaar DigiLocker Link</h3>
                      <p className="text-xs text-[#6B7280]">
                        Secure paperless link to Aadhaar records via state authorized DigiLocker gateways.
                      </p>

                      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-[#081B4B]/60 flex items-center justify-center mx-auto text-[#FF7A00]">
                          <Lock className="w-6 h-6" />
                        </div>
                        <h4 className="text-sm font-bold">DigiLocker API Certificate</h4>
                        <p className="text-[10px] text-[#6B7280] px-3">
                          DigiLend communicates with UIDAI registers utilizing military-grade encrypted pipelines.
                        </p>

                        <div className="bg-[#081B4B]/20 py-2.5 px-3 rounded-lg text-[10px] text-zinc-300 inline-flex items-center space-x-1.5 border border-[#081B4B]">
                          <Check className="w-3.5 h-3.5 text-green-500 stroke-[3.5]" />
                          <span>Strictly Encrypted SSL Connection</span>
                        </div>

                        <div className="pt-2">
                          <label className="text-[9px] tracking-widest text-zinc-500 block mb-1 font-mono">SIMULATED AADHAAR PIN</label>
                          <div className="flex justify-center space-x-2">
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                              <input 
                                key={i}
                                maxLength={1}
                                type="text"
                                value={aadhaarOTP[i]}
                                onChange={(e) => {
                                  const copy = [...aadhaarOTP];
                                  copy[i] = e.target.value.replace(/\D/g, "");
                                  setAadhaarOTP(copy);
                                }}
                                className="w-8 h-10 text-center text-sm font-bold bg-slate-900 border border-slate-800 rounded-lg focus:border-[#FF7A00]" 
                                placeholder="•"
                              />
                            ))}
                          </div>
                          <button 
                            onClick={() => setAadhaarOTP(["4", "0", "9", "2", "1", "8"])} 
                            className="text-[9px] font-mono text-zinc-400 underline mt-2"
                          >
                            Auto Fill Pin
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {kycStep === 3 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4">
                      <h3 className="text-2xl font-black">Selfie Verification</h3>
                      <p className="text-xs text-[#6B7280]">
                        Ensure biometric verification of identity matching the Aadhaar record photogrid.
                      </p>

                      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                        <div className="relative w-36 h-36 mx-auto rounded-full bg-slate-900 border-2 border-dashed border-slate-850 overflow-hidden flex items-center justify-center">
                          {selfieCaptured ? (
                            <img src={selfieCaptured} alt="User Face" className="w-full h-full object-cover" />
                          ) : isCapturingSelfie ? (
                            <div className="absolute inset-0 flex flex-col justify-center items-center bg-slate-950 text-center space-y-2">
                              <RefreshCw className="w-6 h-6 text-[#FF7A00] animate-spin" />
                              <span className="text-[9px] tracking-widest font-mono text-[#FF7A00]">SCANNING FACE...</span>
                            </div>
                          ) : (
                            <div className="text-center space-y-1.5 p-3">
                              <Camera className="w-8 h-8 text-slate-500 mx-auto" />
                              <span className="text-[9px] text-[#6B7280] block">Aadhaar Selfie Core</span>
                            </div>
                          )}

                          {/* Dynamic tracking lines during capture */}
                          {isCapturingSelfie && (
                            <motion.div 
                              initial={{ top: 0 }}
                              animate={{ top: "100%" }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                              className="absolute left-0 right-0 h-0.5 bg-[#FF7A00] opacity-80"
                            ></motion.div>
                          )}
                        </div>

                        {!selfieCaptured ? (
                          <button 
                            onClick={startLiveSelfieCaptureCamera}
                            className="w-full bg-[#081B4B] text-white py-2.5 rounded-xl font-bold font-sans text-xs flex justify-center items-center space-x-1.5 border border-[#081B4B] hover:border-[#FF7A00]"
                          >
                            <Camera className="w-4 h-4 text-[#FF7A00]" />
                            <span>Capture Live Selfie</span>
                          </button>
                        ) : (
                          <div className="text-center">
                            <span className="text-xs text-green-500 font-bold inline-flex items-center space-x-1">
                              <CheckCircle2 className="w-4 h-4 text-green-500 fill-green-500/10" />
                              <span>Live Face Analysis Succeeded</span>
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {kycStep === 4 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4">
                      <h3 className="text-2xl font-black">Address Verification</h3>
                      <p className="text-xs text-[#6B7280]">
                        Verify extracted residence location bounds for regulatory partner compliance registry.
                      </p>

                      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                        <div className="bg-[#081B4B]/10 p-3.5 rounded-xl border border-[#081B4B] space-y-1">
                          <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-zinc-500">Aadhaar Address Feed</span>
                          <p className="text-xs text-zinc-300 leading-relaxed font-sans">{extractedAddress}</p>
                        </div>

                        <div>
                          <label className="text-[10px] text-[#6B7280] font-sans font-bold block mb-1">Confirm extracted pin address</label>
                          <textarea 
                            value={extractedAddress}
                            onChange={(e) => setExtractedAddress(e.target.value)}
                            className="w-full h-16 p-2 bg-slate-900 border border-slate-800 text-xs rounded-xl focus:outline-hidden focus:border-[#FF7A00]"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {kycStep === 5 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4">
                      <h3 className="text-2xl font-black">Bank Registration</h3>
                      <p className="text-xs text-[#6B7280]">
                        Input bank routing variables to receive immediate penny drop transfers and automatic settlement.
                      </p>

                      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3.5">
                        <div>
                          <label className="text-[9px] font-mono tracking-widest text-[#FF7A00] uppercase font-black block mb-1">Bank Name</label>
                          <input 
                            type="text" 
                            className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs" 
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[9px] font-mono tracking-widest text-zinc-500 block mb-1">IFSC CODE</label>
                            <input 
                              type="text" 
                              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono" 
                              value={bankIfsc}
                              onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-mono tracking-widest text-zinc-500 block mb-1">ACCOUNT NUMBER</label>
                            <input 
                              type="text" 
                              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono" 
                              value={bankAccount}
                              onChange={(e) => setBankAccount(e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start space-x-2 text-[10px] text-green-400">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          <span>DigiLend automatically initiates a ₹1.00 penny drop to authenticate ownership registers instantly.</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="pb-6 pt-4">
                  <button 
                    onClick={handleProceedKYCStep}
                    disabled={kycStep === 3 && !selfieCaptured}
                    className={`w-full py-4 rounded-2xl font-bold tracking-wide transition-all ${
                      kycStep === 3 && !selfieCaptured
                        ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#FF7A00] to-[#E65C00] text-white shadow-lg"
                    }`}
                  >
                    <span>{kycStep === 5 ? "Submit & Match Limits" : "Continue"}</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Stage 7: ELIGIBILITY SCREEN - HIGH QUALITY FINTECH SCANNER ANIMATION */}
            {stage === "ELIGIBILITY" && (
              <motion.div 
                key="eligibility"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 p-6 flex flex-col justify-between items-center bg-[#030E26]"
              >
                <div className="pt-12 text-center space-y-1">
                  <span className="text-[10px] tracking-widest text-[#FF7A00] uppercase font-mono font-bold animate-pulse">RBI Authorized Checkers</span>
                  <h2 className="text-2xl font-black">Checking Eligibility</h2>
                  <p className="text-xs text-[#6B7280] max-w-xs mx-auto">
                    Please keep this app foregrounded while our AI risk engine parses pan files, checks salary logs, and optimizes your score.
                  </p>
                </div>

                {/* Animated Scanner Radar / Dial Graphics */}
                <div className="relative w-48 h-48 my-8 flex items-center justify-center">
                  {/* Radar Circles */}
                  <div className="absolute inset-0 rounded-full border border-[#FF7A00]/10 animate-ping" style={{ animationDuration: "2s" }}></div>
                  <div className="absolute inset-4 rounded-full border border-blue-500/10 animate-ping animate-reverse" style={{ animationDuration: "3s" }}></div>
                  <div className="absolute inset-8 rounded-full border border-[#081B4B] bg-[#030E26]"></div>

                  {/* Dynamic rotating neon bar */}
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 border-t border-r border-[#FF7A00] rounded-full"
                    style={{ filter: "drop-shadow(0 0 10px #FF7A00)" }}
                  ></motion.div>

                  <div className="z-10 flex flex-col items-center justify-center text-center space-y-1">
                    <Sparkles className="w-8 h-8 text-[#FF7A00] animate-pulse" />
                    <span className="text-xs font-mono font-bold">₹{applyAmount.toLocaleString()}</span>
                    <span className="text-[9px] text-[#22C55E] uppercase tracking-widest">Calculated</span>
                  </div>
                </div>

                {/* Eligibility Stages checklist */}
                <div className="w-full max-w-[260px] space-y-3 pb-8">
                  {eligibilityStages.map((stg, sIndex) => {
                    const isPassed = eligibilityStageIndex > sIndex;
                    const isActive = eligibilityStageIndex === sIndex;
                    return (
                      <div key={stg} className="flex justify-between items-center text-xs">
                        <span className={isActive ? "text-[#FF7A00] font-bold animate-pulse" : isPassed ? "text-zinc-300" : "text-zinc-600"}>
                          {stg}
                        </span>
                        {isPassed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 fill-green-500/10" />
                        ) : isActive ? (
                          <RefreshCw className="w-3.5 h-3.5 text-[#FF7A00] animate-spin" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-800"></span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Stage 8: HUGEST SUCCESS APPROVAL OFFER SCREEN */}
            {stage === "APPROVAL" && (
              <motion.div 
                key="approval"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 p-6 flex flex-col justify-between items-center text-center"
              >
                <div className="pt-10 space-y-3">
                  <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 text-[#22C55E] rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-500/5">
                    <Award className="w-10 h-10 stroke-[2.5]" />
                  </div>
                  <h2 className="text-3xl font-black text-white">Congratulations!</h2>
                  <p className="text-xs text-[#6B7280] max-w-xs mx-auto">
                    Based on your reliable CIBIL score and verified transaction indexes, your DigiLend limit has been approved!
                  </p>
                </div>

                {/* Splendid Gradient Approved Card Representation */}
                <div className={`w-full max-w-xs p-6 rounded-3xl ${orangeNavyGrad} relative overflow-hidden shadow-[0_20px_50px_rgba(255,122,0,0.15)] border border-[#FF7A00]/40 my-6 text-left space-y-5`}>
                  {/* Curated visual patterns on the card */}
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-orange-200">APPROVED CREDIT</span>
                      <p className="text-sm font-bold text-white mt-1">Premium Flexi Limit</p>
                    </div>
                    <div className="bg-slate-900/60 backdrop-blur-md p-1 px-2.5 rounded-full text-[9px] font-mono text-[#FF7A00] font-black border border-slate-800">
                      CIBIL MATCHED
                    </div>
                  </div>

                  <div className="space-y-1 pt-2">
                    <span className="text-[10px] text-orange-100/70 font-mono">AVAILABLE LIMIT</span>
                    <h3 className="text-4xl font-black text-white tracking-tight">₹20,000</h3>
                  </div>

                  <div className="border-t border-white/10 pt-3 flex justify-between items-center text-[10px] font-mono text-orange-200">
                    <span>GST & Fees Included</span>
                    <span className="text-green-400">✔️ Active & Verifiable</span>
                  </div>
                </div>

                <div className="w-full pb-6">
                  <button 
                    onClick={() => setStage("DASHBOARD")}
                    className="w-full bg-gradient-to-r from-[#FF7A00] to-[#E65C00] text-white py-4 rounded-2xl font-bold hover:scale-[1.01] transition-all shadow-md flex justify-center items-center space-x-1"
                  >
                    <span>Continue to Dashboard</span>
                    <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                  <span className="text-[9px] text-[#6B7280] block mt-2.5 font-mono">POWERED BY RBI REGISTERED PARTNER NBFC</span>
                </div>
              </motion.div>
            )}

            {/* Stage 9: CORE DASHBOARD (THE MASTERPIECE) */}
            {stage === "DASHBOARD" && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col pb-20"
              >
                {/* Dashboard top header */}
                <div className="px-5 pt-4 pb-3 flex justify-between items-center border-b border-slate-900 bg-slate-950/20">
                  <div className="flex items-center space-x-3 text-left">
                    <div className="relative">
                      <img 
                        src={currentUser?.kyc.selfieUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
                        alt="Profile" 
                        className="w-10 h-10 rounded-full border border-[#FF7A00] object-cover" 
                      />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#030E26]"></span>
                    </div>
                    <div>
                      <span className="text-[10px] text-zinc-500 block uppercase font-mono tracking-wider">Welcome back</span>
                      <h4 className="text-xs font-bold text-white">Good Morning, {currentUser ? currentUser.fullName.split(" ")[0] : "James"} 👋</h4>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    {/* Synchronized state indicator indicator */}
                    <div className="text-[9px] font-mono text-zinc-400 bg-slate-950/40 p-1.5 px-2.5 rounded-lg flex items-center space-x-1 border border-slate-900">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      <span className="uppercase">Synced</span>
                    </div>

                    <button 
                      onClick={() => { setActiveTab("activity"); }}
                      className="p-2 rounded-xl bg-slate-950 border border-slate-850 hover:text-[#FF7A00] relative"
                    >
                      <Bell className="w-4 h-4" />
                      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#FF7A00] rounded-full"></span>
                    </button>
                  </div>
                </div>

                {/* Master Render Tabs */}
                <div className="p-5 flex-1 space-y-5 text-left">
                  
                  {activeTab === "home" && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity:1 }} className="space-y-5">
                      
                      {/* DYNAMIC CREDIT LIMIT MASTER CARD */}
                      <div className={`p-6 rounded-3xl ${orangeNavyGrad} relative overflow-hidden shadow-2xl border border-white/5 space-y-4`}>
                        <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-white/10 to-transparent rounded-full blur-xl"></div>
                        
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] uppercase font-mono tracking-widest text-orange-200 block">Available Balance</span>
                            <h3 className="text-3xl font-black tracking-tight text-white mt-1">₹20,000</h3>
                          </div>
                          
                          {/* Circular Percentage Ring mockup */}
                          <div className="relative w-14 h-14 flex items-center justify-center bg-slate-900/40 rounded-full border border-white/10">
                            <span className="text-[10px] font-black text-white">100%</span>
                            {/* SVG circular bar */}
                            <svg className="absolute inset-0 w-full h-full -rotate-44">
                              <circle cx="28" cy="28" r="22" stroke="#FF7A00" strokeWidth="2.5" fill="none" strokeDasharray="138" strokeDashoffset="0" />
                            </svg>
                          </div>
                        </div>

                        <div className="pt-2 flex justify-between items-center">
                          <div className="text-[10px] text-orange-200">
                            <span className="block font-mono">Approved APR: 2.5% Flat</span>
                            <span className="opacity-75">Instant Bank Disbursal</span>
                          </div>

                          <button 
                            disabled={!!myActiveLoan}
                            onClick={() => { setApplyStep(1); setStage("APPLY_LOAN"); }}
                            className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-wide transition-all ${
                              myActiveLoan 
                                ? "bg-slate-800/40 text-slate-500 cursor-not-allowed" 
                                : "bg-white text-[#0B1F4D] hover:bg-orange-100 shadow-md"
                            }`}
                          >
                            {myActiveLoan ? "Limit Blocked" : "Apply Loan"}
                          </button>
                        </div>
                      </div>

                      {/* ACTIVE LOAN SPECIFIC DETAILS BLOCK */}
                      {myActiveLoan ? (
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 to-[#030E26] border border-red-900/30 space-y-3">
                          <div className="flex justify-between items-center pb-2 border-b border-red-900/10">
                            <div className="flex items-center space-x-2">
                              <AlertCircle className="w-4.5 h-4.5 text-orange-500 animate-pulse" />
                              <span className="text-xs font-extrabold text-orange-400">ACTIVE OUTSTANDING</span>
                            </div>
                            <span className="text-[9px] font-mono text-zinc-500">{myActiveLoan.id}</span>
                          </div>

                          <div className="flex justify-between items-center text-xs">
                            <div>
                              <span className="text-[9.5px] text-[#6B7280]">EST. DUE BY {myActiveLoan.dueDate}</span>
                              <p className="text-lg font-black text-white mt-0.5">₹{myActiveLoan.outstandingBalance.toLocaleString('en-IN')}</p>
                            </div>

                            <button 
                              onClick={() => { setStage("REPAY_FLOW"); }}
                              className="px-4 py-2 bg-[#22C55E] hover:bg-green-600 text-slate-950 font-bold rounded-lg text-[11px] font-sans flex items-center space-x-1 shadow-sm"
                            >
                              <Wallet className="w-3.5 h-3.5 font-bold" />
                              <span>Repay Now</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4.5 rounded-2xl bg-zinc-950 border border-slate-900 flex justify-between items-center text-xs">
                          <div className="space-y-0.5 text-zinc-400">
                            <p className="text-white font-bold inline-flex items-center space-x-1.5">
                              <CheckCircle2 className="w-4 h-4 text-green-500 fill-green-500/10" />
                              <span>Verified Clean Ledger status</span>
                            </p>
                            <span className="text-[10px] text-zinc-500 block">No active outstanding EMIs. Ready to disburse loan!</span>
                          </div>
                        </div>
                      )}

                      {/* QUICK ACTION GRID */}
                      <div className="space-y-3">
                        <h4 className="text-[11px] font-bold font-mono uppercase tracking-wider text-[#FF7A00]">Action Gateways</h4>
                        <div className="grid grid-cols-3 gap-2.5 text-center text-xs font-sans">
                          
                          <button 
                            onClick={() => { 
                              if (!myActiveLoan) { 
                                setApplyStep(1); 
                                setStage("APPLY_LOAN"); 
                              } else { 
                                setSelectedOffer({
                                  title: "Active Credit Outstanding",
                                  tag: "LIMIT ASSIGNED",
                                  description: `You currently have an active loan outstanding principal balance matching ₹${myActiveLoan.outstandingBalance} due to settle on ${myActiveLoan.dueDate}.`,
                                  instruction: "Before you can request further cash disbursements on your profile limit, please satisfy the outstanding dues. Select 'Repay Now' on your home screen dashboard to instantly complete a secure UPI/bank transfer settlement.",
                                  accentColor: "red"
                                });
                                setActiveBottomSheet("OFFER_DETAIL");
                              } 
                            }}
                            className="p-3 rounded-2xl bg-[#081B4B]/20 border border-[#081B4B]/40 hover:bg-[#FF7A00]/10 flex flex-col justify-center items-center space-y-1.5 transition-all text-center"
                          >
                            <Zap className="w-5 h-5 text-[#FF7A00]" />
                            <span className="text-[10.5px] text-zinc-200 font-medium">Apply Loan</span>
                          </button>

                          <button 
                            onClick={() => { setActiveTab("activity"); }}
                            className="p-3 rounded-2xl bg-[#081B4B]/20 border border-[#081B4B]/40 hover:bg-[#FF7A00]/10 flex flex-col justify-center items-center space-y-1.5 transition-all text-center"
                          >
                            <History className="w-5 h-5 text-zinc-300" />
                            <span className="text-[10.5px] text-zinc-200 font-medium">Loan History</span>
                          </button>

                          <button 
                            onClick={() => { 
                              setEmiInputAmount(Math.min(20000, currentUser?.maxEligibleAmount || 20000));
                              setEmiInputTenure(30);
                              setActiveBottomSheet("EMI_CALC"); 
                            }}
                            className="p-3 rounded-2xl bg-[#081B4B]/20 border border-[#081B4B]/40 hover:bg-[#FF7A00]/10 flex flex-col justify-center items-center space-y-1.5 transition-all text-center"
                          >
                            <FileCheck className="w-5 h-5 text-blue-400" />
                            <span className="text-[10.5px] text-zinc-200 font-medium font-sans">EMI Calc</span>
                          </button>

                          <button 
                            onClick={() => { setActiveBottomSheet("REWARDS"); }}
                            className="p-3 rounded-2xl bg-[#081B4B]/20 border border-[#081B4B]/40 hover:bg-[#FF7A00]/10 flex flex-col justify-center items-center space-y-1.5 transition-all text-center"
                          >
                            <Award className="w-5 h-5 text-[#22C55E]" />
                            <span className="text-[10.5px] text-zinc-200 font-medium">Rewards</span>
                          </button>

                          <button 
                            onClick={() => { setActiveTab("support"); }}
                            className="p-3 rounded-2xl bg-[#081B4B]/20 border border-[#081B4B]/40 hover:bg-[#FF7A00]/10 flex flex-col justify-center items-center space-y-1.5 transition-all text-center"
                          >
                            <MessageSquare className="w-5 h-5 text-cyan-400" />
                            <span className="text-[10.5px] text-zinc-200 font-medium">Support</span>
                          </button>

                          <button 
                            onClick={() => { setActiveBottomSheet("REFERRAL"); }}
                            className="p-3 rounded-2xl bg-[#081B4B]/20 border border-[#081B4B]/40 hover:bg-[#FF7A00]/10 flex flex-col justify-center items-center space-y-1.5 transition-all text-center"
                          >
                            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                            <span className="text-[10.5px] text-zinc-200 font-medium">Refer & Earn</span>
                          </button>

                        </div>
                      </div>

                      {/* CURATED VERTICAL DISCOUNTS AND FINTECH OFFERS */}
                      <div className="space-y-3">
                        <h4 className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-500">Curated Offers For You</h4>
                        
                        <div className="flex space-x-3.5 overflow-x-auto pb-2 pr-2 scrollbar-none">
                          
                          <div 
                            onClick={() => {
                              setSelectedOffer({
                                title: "Swiggy Gourmet Flat 25% Cashbacks",
                                tag: "SWIGGY GOURMET",
                                description: "Get massive cash return percentages credited directly into your synced savings box.",
                                instruction: "Transact inside the official Swiggy application using credit limits sourced from DigiLend or link partner wallets post disbursal verification. Minimum transaction ticket ₹299. Cashback settles in 24h.",
                                accentColor: "teal"
                              });
                              setActiveBottomSheet("OFFER_DETAIL");
                            }}
                            className="p-3.5 bg-gradient-to-r from-teal-950 to-[#030E26] rounded-2xl border border-teal-900/30 flex-none w-52 space-y-1.5 text-xs text-left cursor-pointer hover:border-teal-400/40 transition-all"
                          >
                            <span className="bg-teal-500/20 text-teal-400 font-mono text-[9px] font-black px-2 py-0.5 rounded-full inline-block">SWIGGY GOURMET</span>
                            <h5 className="font-bold text-white leading-tight">Get 25% Flat Cashbacks on food</h5>
                            <p className="text-[9.5px] text-[#6B7280]">Complete payment utilizing verified loan cards.</p>
                          </div>

                          <div 
                            onClick={() => {
                              setSelectedOffer({
                                title: "Shop Latest Smartphones on Zero Cost EMI",
                                tag: "ZERO COST EMI",
                                description: "Split your shopping payments easily on top partners (Amazon, Flipkart, Apple Retail) into interest free EMIs.",
                                instruction: "Simply log your order on our partner checkout screens, select DigiLend card as standard repayment module, and choose convenient 3, 6, or 9 months tenure maps flat at 0% annual percentage cost.",
                                accentColor: "indigo"
                              });
                              setActiveBottomSheet("OFFER_DETAIL");
                            }}
                            className="p-3.5 bg-gradient-to-r from-indigo-950 to-[#030E26] rounded-2xl border border-indigo-900/30 flex-none w-52 space-y-1.5 text-xs text-left cursor-pointer hover:border-indigo-400/40 transition-all"
                          >
                            <span className="bg-indigo-500/20 text-indigo-400 font-mono text-[9px] font-black px-2 py-0.5 rounded-full inline-block">ZERO COST EMI</span>
                            <h5 className="font-bold text-white leading-tight">Shop smartphones on No-Cost EMI</h5>
                            <p className="text-[9.5px] text-[#6B7280]">Partner networks across Flipkart, Vijay Sales.</p>
                          </div>

                          <div 
                            onClick={() => {
                              setSelectedOffer({
                                title: "Preset Travel Holiday Booking",
                                tag: "PRESET TRAVEL",
                                description: "Never hold booking plans back! Fly immediately with 0% interest booking vouchers.",
                                instruction: "Select and secure flight tickets inside MakeMyTrip or EaseMyTrip app clients using active personal DigiLend loans. Simple, flat three months interest-free repayment terms apply on your subsequent ledger bills.",
                                accentColor: "amber"
                              });
                              setActiveBottomSheet("OFFER_DETAIL");
                            }}
                            className="p-3.5 bg-gradient-to-r from-amber-950 to-[#030E26] rounded-2xl border border-amber-900/30 flex-none w-52 space-y-1.5 text-xs text-left cursor-pointer hover:border-amber-400/40 transition-all"
                          >
                            <span className="bg-[#FF7A00]/20 text-[#FF7A00] font-mono text-[9px] font-black px-2 py-0.5 rounded-full inline-block">PRESET TRAVEL</span>
                            <h5 className="font-bold text-white leading-tight">Book Flights with zero advance pay</h5>
                            <p className="text-[9.5px] text-[#6B7280]">Enjoy holiday trips; pay in simple 3 EMIs.</p>
                          </div>

                        </div>
                      </div>

                    </motion.div>
                  )}

                  {/* LOANS TAB PANEL */}
                  {activeTab === "loans" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      <h4 className="text-xl font-bold">Dynamic Loans Ledger</h4>
                      <p className="text-xs text-[#6B7280]">Manage outstanding lines and access pre-approved capital credits securely.</p>

                      <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4.5 space-y-4">
                        <span className="text-[9px] font-mono uppercase text-[#FF7A00] tracking-wider block">PRE-APPROVED OFFER LIMIT</span>
                        <div className="flex justify-between items-center text-xs">
                          <div>
                            <span className="text-2xl font-black text-white">₹20,000</span>
                            <span className="text-[10px] text-zinc-500 block">Available completely online</span>
                          </div>
                          
                          <button 
                            disabled={!!myActiveLoan}
                            onClick={() => { setApplyStep(1); setStage("APPLY_LOAN"); }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold ${
                              myActiveLoan ? "bg-slate-850 text-slate-500 cursor-not-allowed" : "bg-[#FF7A00] text-white hover:bg-orange-600"
                            }`}
                          >
                            {myActiveLoan ? "Blocked" : "Apply Loan"}
                          </button>
                        </div>
                      </div>

                      {myActiveLoan ? (
                        <div className="p-4 rounded-2xl border border-slate-800 bg-[#081B4B]/10 space-y-3.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold">Active Ref: {myActiveLoan.id}</span>
                            <span className="bg-[#FF7A00]/15 text-[#FF7A00] px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-black">Disbursed</span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900">
                              <span className="text-[9px] text-[#6B7280] block">OUTSTANDING BALANCE</span>
                              <strong className="text-sm font-bold text-white">₹{myActiveLoan.outstandingBalance}</strong>
                            </div>
                            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-900">
                              <span className="text-[9px] text-[#6B7280] block">DUE DATE TIMELINE</span>
                              <strong className="text-sm font-bold text-white">{myActiveLoan.dueDate}</strong>
                            </div>
                          </div>

                          <button 
                            onClick={() => { setStage("REPAY_FLOW"); }}
                            className="w-full bg-[#22C55E] text-slate-950 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center space-x-1"
                          >
                            <Wallet className="w-4 h-4" />
                            <span>Navigate Repayment Desk</span>
                          </button>
                        </div>
                      ) : (
                        <div className="p-8 text-center text-xs text-zinc-500 bg-slate-950/40 rounded-3xl border border-slate-900 space-y-2">
                          <Check className="w-8 h-8 mx-auto text-green-500 bg-green-500/10 p-1.5 rounded-full" />
                          <p>You do not have any active loans currently.</p>
                          <span className="text-[10px] opacity-75">Apply above to instantly disburse funds directly in 120ms.</span>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* ACTIVITY / TIMELINE TAB PANEL */}
                  {activeTab === "activity" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity:1 }} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xl font-bold">Ledger Transactions</h4>
                        <RefreshCw onClick={syncWithBackend} className="w-4 h-4 text-zinc-400 cursor-pointer hover:text-white" />
                      </div>

                      <div className="space-y-3">
                        {myLoanHistory.length === 0 ? (
                          <div className="p-8 text-center text-xs text-[#6B7280] bg-slate-950 rounded-2xl border border-slate-900">No loan requests initiated on profile yet.</div>
                        ) : (
                          myLoanHistory.map((lh) => (
                            <div key={lh.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-900 space-y-3 text-xs">
                              <div className="flex justify-between border-b border-slate-900 pb-1.5">
                                <span className="font-mono text-[10px] text-[#FF7A00] font-bold">{lh.id}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black ${
                                  lh.status === "DISBURSED" ? "bg-red-500/15 text-red-400" : "bg-green-500/15 text-green-400"
                                }`}>
                                  {lh.status}
                                </span>
                              </div>

                              <div className="flex justify-between">
                                <div>
                                  <span className="text-[10px] text-zinc-500 block">PRINCIPAL AMOUNT</span>
                                  <strong className="text-sm font-bold text-zinc-200">₹{lh.amount.toLocaleString()}</strong>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-zinc-500 block">TERM SCHEDULE</span>
                                  <strong className="text-zinc-200">{lh.tenureDays} Days Limit</strong>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-900 text-[10px] space-y-1">
                                <span className="text-[#6B7280] block font-mono">DATES TIMELINE TRAIL</span>
                                {lh.timeline.map((t, ti) => (
                                  <div key={ti} className="flex space-x-2 items-center text-zinc-400 font-mono text-[9px]">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    <span>{t.label} ⎯ {new Date(t.timestamp).toLocaleTimeString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* SYSTEM SUPPORT & LIVE CHAT (GEMINI API) */}
                  {activeTab === "support" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 flex flex-col h-[520px]">
                      
                      <div className="shrink-0 space-y-1 text-xs">
                        <h4 className="text-lg font-black text-white inline-flex items-center space-x-1.5">
                          <MessageSquare className="w-5 h-5 text-[#FF7A00]" />
                          <span>DigiLend AI Helper</span>
                        </h4>
                        <p className="text-[10.5px] text-[#6B7280]">
                          Live support powered directly by Gemini 3.5. Fully compliant under RBI customer care provisions.
                        </p>
                      </div>

                      {/* Chat Messages Log */}
                      <div className="flex-1 bg-slate-950 p-4.5 rounded-2xl border border-slate-900 overflow-y-auto space-y-3.5 max-h-[340px] text-xs">
                        {chatHistory.map((ct, idx) => {
                          const isAI = ct.sender !== "USER";
                          return (
                            <div key={idx} className={`flex ${isAI ? "justify-start" : "justify-end"} text-left`}>
                              <div className={`p-3 max-w-[85%] rounded-2xl font-sans text-xs leading-relaxed ${
                                isAI 
                                  ? "bg-[#081B4B]/30 border border-[#081B4B] text-zinc-200 rounded-tl-none" 
                                  : "bg-gradient-to-r from-[#FF7A00] to-[#E65C00] text-white rounded-tr-none shadow-md"
                              }`}>
                                <p>{ct.text}</p>
                                <span className="text-[8px] font-mono opacity-50 block mt-1.5 text-right">
                                  {new Date(ct.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          );
                        })}

                        {isSupportSubmitting && (
                          <div className="flex justify-start">
                            <div className="p-3 bg-slate-900 text-zinc-500 rounded-2xl rounded-tl-none flex items-center space-x-1.5">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF7A00]" />
                              <span className="text-[10px] font-mono">Gemini analyzing profile...</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Custom Input Message Form */}
                      <form onSubmit={handleSendMessageToAI} className="shrink-0 flex items-center space-x-2">
                        <input 
                          type="text" 
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          placeholder="Ask anything about DigiLend..."
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-hidden focus:border-[#FF7A00]"
                        />
                        <button 
                          type="submit" 
                          disabled={isSupportSubmitting || !supportMessage.trim()}
                          className="p-3 bg-gradient-to-r from-[#FF7A00] to-[#E65C00] text-white rounded-xl disabled:opacity-40"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>

                    </motion.div>
                  )}

                  {/* USER PERSONAL PROFILE WORKSPACE */}
                  {activeTab === "profile" && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                      
                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-900 flex items-center space-x-3 text-xs">
                        <img 
                          src={currentUser?.kyc.selfieUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"} 
                          alt="Face Selfie" 
                          className="w-12 h-12 rounded-full object-cover border border-[#FF7A00]"
                        />

                        <div className="space-y-0.5">
                          <strong className="text-sm font-bold text-white block">{currentUser ? currentUser.fullName : "James Fernandes"}</strong>
                          <span className="text-[10px] font-mono text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full inline-block">C-KYC VERIFIED</span>
                        </div>
                      </div>

                      <div className="bg-slate-950 rounded-2xl border border-slate-900 p-4.5 space-y-4 text-xs text-left">
                        
                        <div className="border-b border-slate-900 pb-2.5">
                          <span className="text-[10px] text-zinc-500 font-mono block">MOBILE PHONE NUMBER</span>
                          <strong className="text-white text-sm font-mono mt-0.5">{currentUser ? currentUser.phone : `+91 ${phoneNumber}`}</strong>
                        </div>

                        <div className="border-b border-slate-900 pb-2.5">
                          <span className="text-[10px] text-zinc-500 font-mono block">PERMANENT ACCOUNT NUMBER (PAN)</span>
                          <strong className="text-white text-sm font-mono mt-0.5 uppercase">{panNumber}</strong>
                        </div>

                        <div className="border-b border-slate-900 pb-2.5">
                          <span className="text-[10px] text-zinc-500 font-mono block">CONNECTED BANK ACC</span>
                          <strong className="text-white text-sm font-semibold mt-0.5 tracking-wide">
                            {currentUser ? `${currentUser.bank.bankName} (${currentUser.bank.accountNumber})` : `${bankName} (${bankAccount})`}
                          </strong>
                        </div>

                        <div className="pb-1">
                          <span className="text-[10px] text-zinc-500 font-mono block">CIBIL ELIGIBILITY SCORE POINTS</span>
                          <strong className="text-[#FF7A00] text-base font-black font-mono">
                            {currentUser ? currentUser.creditScore : 720} points
                          </strong>
                        </div>

                      </div>

                      <div className="pt-2 space-y-3.5">
                        
                        <button 
                          onClick={() => {
                            setSelectedOffer({
                              title: "Confirm Database Reset",
                              tag: "SYSTEM OVERWRITE",
                              description: "Warning: Performing a system reset will clear any local mock states, un-disburse any simulated loans, and restore the default demo user profile list (Aniket Sharma, Priya Patel, Rahul Varma).",
                              instruction: "This will flush all in-memory database records. This is destructive and irreversible.",
                              accentColor: "red"
                            });
                            setActiveBottomSheet("CONFIRM_RESET" as any);
                          }}
                          className="w-full bg-[#081B4B]/30 border border-[#081B4B] hover:bg-[#FF7A00]/10 text-white text-xs font-bold py-3.5 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer transition-all"
                        >
                          <RefreshCw className="w-4 h-4 text-[#FF7A00]" />
                          <span>Reset Database Session</span>
                        </button>

                        <button 
                          onClick={resetAllAppDemoData}
                          className="w-full bg-slate-950 border border-slate-900 text-red-500 text-xs font-bold py-3.5 rounded-xl flex items-center justify-center space-x-1.5"
                        >
                          <LogOut className="w-4 h-4 text-red-500" />
                          <span>Logout App Session</span>
                        </button>

                        <p className="text-[9.5px] text-center text-zinc-600 font-mono leading-relaxed mt-2 uppercase tracking-wide">
                          DigiLend Secured System Framework • ISO 27001 Certified
                        </p>

                      </div>

                    </motion.div>
                  )}

                </div>

                {/* STICKY BOTTOM TAB NAVIGATION */}
                <div className="absolute bottom-0 inset-x-0 h-16 bg-slate-950 border-t border-slate-900/80 grid grid-cols-5 text-center items-center z-40">
                  <button 
                    onClick={() => setActiveTab("home")} 
                    className={`flex flex-col items-center justify-center space-y-1 text-[10px] transition-colors ${
                      activeTab === "home" ? "text-[#FF7A00] font-bold" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Wallet className="w-5 h-5" />
                    <span>Home</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab("loans")} 
                    className={`flex flex-col items-center justify-center space-y-1 text-[10px] transition-colors ${
                      activeTab === "loans" ? "text-[#FF7A00] font-bold" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Loans</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab("activity")} 
                    className={`flex flex-col items-center justify-center space-y-1 text-[10px] transition-colors ${
                      activeTab === "activity" ? "text-[#FF7A00] font-bold" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <History className="w-5 h-5" />
                    <span>Activity</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab("support")} 
                    className={`flex flex-col items-center justify-center space-y-1 text-[10px] transition-colors ${
                      activeTab === "support" ? "text-[#FF7A00] font-bold" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>Support</span>
                  </button>

                  <button 
                    onClick={() => setActiveTab("profile")} 
                    className={`flex flex-col items-center justify-center space-y-1 text-[10px] transition-colors ${
                      activeTab === "profile" ? "text-[#FF7A00] font-bold" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </button>
                </div>

              </motion.div>
            )}

            {/* Stage 10: NEW LOAN APPLICATION MULTI-STAGE STEPPER */}
            {stage === "APPLY_LOAN" && (
              <motion.div 
                key="apply_loan"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2 pt-1 pb-4 border-b border-slate-900">
                    <button onClick={() => { if (applyStep === 1) { setStage("DASHBOARD"); } else { setApplyStep((p) => p - 1); } }} className="p-1 rounded-full text-slate-400">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-black font-mono uppercase text-[#FF7A00]">Apply flexible Loan Offer</span>
                  </div>

                  {applyStep === 1 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-4">
                      <div>
                        <h4 className="text-xl font-black">Choose Credit Amount</h4>
                        <p className="text-xs text-[#6B7280]">Select pre-authorised capital ranging ₹1,000 to ₹20,000.</p>
                      </div>

                      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-900 text-center space-y-4">
                        <span className="text-[10px] text-zinc-500 block uppercase font-mono tracking-widest">DISBURSAL VALUE REQUEST</span>
                        <h3 className="text-4xl font-extrabold tracking-tight text-[#FF7A00]" style={{ textShadow: "0 0 15px rgba(255,122,0,0.2)" }}>
                          ₹{applyAmount.toLocaleString('en-IN')}
                        </h3>

                        <input 
                          type="range"
                          min="1000"
                          max="20000"
                          step="1000"
                          value={applyAmount}
                          onChange={(e) => setApplyAmount(Number(e.target.value))}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-slate-800 accent-[#FF7A00]"
                        />

                        <div className="flex justify-between text-[10px] font-mono text-zinc-400 font-bold px-1">
                          <span>Min ₹1,000</span>
                          <span>Max ₹20,000</span>
                        </div>
                      </div>

                      {/* Pill Selection Tenure Grid */}
                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-mono tracking-widest text-[#FF7A00] font-black uppercase">CHOOSE SELECT TENURE TERM</label>
                        <div className="grid grid-cols-5 gap-1 text-center font-mono">
                          {[7, 14, 30, 60, 90].map((term) => (
                            <button 
                              key={term}
                              onClick={() => setApplyTenure(term)}
                              className={`py-2 px-1 rounded-lg text-[10.5px] font-bold border transition-all ${
                                applyTenure === term 
                                  ? "bg-[#FF7A00] text-white border-[#FF7A00]" 
                                  : "bg-slate-950 text-zinc-400 border-slate-850 hover:text-white"
                              }`}
                            >
                              {term} Days
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Live inline simple math calculations */}
                      <div className="bg-[#081B4B]/10 p-4 rounded-xl border border-slate-905 text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Monthly flat Interest ({adminInterestRate}%):</span>
                          <span className="font-mono text-zinc-200">₹{calcInterest}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Processing Fee ({adminFeePercent}%):</span>
                          <span className="font-mono text-zinc-200">₹{calcFee}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">GST on fee ({adminGstPercent}%):</span>
                          <span className="font-mono text-[#D05C00]">₹{calcGst}</span>
                        </div>
                        <div className="border-t border-slate-900 pt-2 flex justify-between font-bold text-white">
                          <span>Est. Net Disbursal credit:</span>
                          <span className="text-green-400 font-mono text-xs">₹{calcDisbursal}</span>
                        </div>
                      </div>

                    </motion.div>
                  )}

                  {applyStep === 3 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 text-left">
                      <div>
                        <h4 className="text-xl font-black">Loan Summary View</h4>
                        <p className="text-xs text-[#6B7280]">Please verify parameters in ledger prior to disbursal signature.</p>
                      </div>

                      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 space-y-3.5 text-xs">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Capital Value Amount</span>
                          <span className="font-black text-white font-mono">₹{applyAmount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Repayment Period</span>
                          <span className="font-bold text-white font-mono">{applyTenure} Days schedule</span>
                        </div>
                        <div className="border-t border-slate-900/60 pt-2 flex justify-between">
                          <span className="text-zinc-500">Processing & GST match</span>
                          <span className="text-zinc-400 font-mono">₹{calcFee + calcGst}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Accrued Interest ({adminInterestRate}%)</span>
                          <span className="text-zinc-400 font-mono">₹{calcInterest}</span>
                        </div>
                        <div className="border-t border-slate-900 pt-2 flex justify-between">
                          <span className="text-zinc-400 font-bold">Total Repayable value</span>
                          <strong className="text-base text-[#FF7A00] font-mono">₹{calcTotalRepay.toLocaleString()}</strong>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {applyStep === 4 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 pt-4 text-left">
                      <div>
                        <h4 className="text-xl font-black">Lending Agreement term</h4>
                        <p className="text-xs text-[#6B7280]">Digital signature approval of NBFC partners matches.</p>
                      </div>

                      <div className="bg-slate-955 p-4 rounded-xl max-h-[220px] overflow-y-auto text-[10px] text-zinc-400 leading-normal space-y-2 border border-slate-900">
                        <p className="font-bold text-white">PROMISSORY NOTE & TERMS OF CREDIT USE</p>
                        <p>1. The Borrower agrees to repay the outstanding principal sums of ₹{applyAmount} + interest of ₹{calcInterest} entirely on schedule.</p>
                        <p>2. Default interest flat fee compiles under commercial banking provisions up to 36% APR.</p>
                        <p>3. DigiLend registers repayments utilising automated UPI recurring e-mandates linked via IFSC code {currentUser ? currentUser.bank.ifscCode : bankIfsc}.</p>
                      </div>

                      <div className="pt-2 flex items-start space-x-2.5">
                        <input 
                          type="checkbox"
                          id="consent_check"
                          checked={hasAgreedTerms}
                          onChange={(e) => setHasAgreedTerms(e.target.checked)}
                          className="w-4 h-4 bg-slate-900 accent-[#FF7A00]"
                        />
                        <label htmlFor="consent_check" className="text-[11px] text-[#6B7280] leading-normal font-sans">
                          I agree to these promissory agreements and authorize immediate digital contract signatures match.
                        </label>
                      </div>
                    </motion.div>
                  )}

                  {applyStep === 5 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-4 text-center">
                      <div className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center text-green-500 mx-auto border border-green-500/20">
                        <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xl font-black text-white">Disbursing Cash Offer!</h4>
                        <p className="text-xs text-[#6B7280]">Contract verified. Transferring funds directly via banking network.</p>
                      </div>

                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-900 space-y-3.5 text-xs text-left">
                        <div className="flex justify-between items-center text-[#FF7A00] font-mono text-[10px]">
                          <strong>DIGILEND AUTO DISBURSE TRACE ID</strong>
                          <span>{newlyCreatedLoanId || "LON-AUTO"}</span>
                        </div>

                        {/* Interactive timing chart representing successful money transfer stages */}
                        <div className="space-y-3 pt-2 font-mono text-[10px]">
                          <div className="flex items-center space-x-2 text-green-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                            <span>Aadhaar eSign approved successfully</span>
                          </div>
                          <div className="flex items-center space-x-2 text-green-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                            <span>Commercial agreement saved on blockchain</span>
                          </div>
                          <div className="flex items-center space-x-2 text-green-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                            <span>Penny Drop verified matching registers</span>
                          </div>
                          <div className="flex items-center space-x-2 text-[#FF7A00] animate-pulse">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00]"></span>
                            <span>Disbursing ₹{calcDisbursal} directly</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                </div>

                <div className="pb-6 pt-4">
                  {applyStep === 1 && (
                    <button 
                      onClick={handleApplyLoanNow}
                      disabled={isSubmittingLoan}
                      className="w-full bg-[#FF7A00] text-white py-4 rounded-2xl font-bold flex justify-center items-center space-x-2 shadow-lg"
                    >
                      {isSubmittingLoan ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <span>Submit & Continue Offer</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}

                  {applyStep === 3 && (
                    <button 
                      onClick={() => setApplyStep(4)}
                      className="w-full bg-[#FF7A00] text-white py-4 rounded-2xl font-bold"
                    >
                      Accept offer summary terms
                    </button>
                  )}

                  {applyStep === 4 && (
                    <div className="space-y-3">
                      {/* Aadhaar eSign OTP input mock */}
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-900 space-y-2">
                        <label className="text-[9px] tracking-widest text-[#FF7A00] font-mono block text-center">SMS ESIGN OTP MATCH CODE</label>
                        <div className="flex justify-center space-x-2">
                          {[0, 1, 2, 3].map((v) => (
                            <input 
                              key={v}
                              maxLength={1}
                              type="text"
                              value={esignOTP[v]}
                              onChange={(e) => {
                                const copy = [...esignOTP];
                                copy[v] = e.target.value.replace(/\D/g, "");
                                setEsignOTP(copy);
                              }}
                              className="w-8 h-10 text-center font-bold text-[#FF7A00] bg-slate-900 border border-slate-800 rounded-lg focus:outline-hidden"
                              placeholder="•"
                            />
                          ))}
                        </div>
                        <button 
                          onClick={() => setEsignOTP(["1", "2", "3", "4"])} 
                          type="button" 
                          className="text-[9px] text-[#6B7280] block text-center mx-auto underline mt-1"
                        >
                          Auto Fill OTP (1234)
                        </button>
                      </div>

                      <button 
                        onClick={handleEsignSignatureVerify}
                        disabled={!hasAgreedTerms || esignOTP.some(v => v === "") || isSubmittingLoan}
                        className={`w-full py-4 rounded-2xl font-bold transition-all ${
                          hasAgreedTerms && !esignOTP.some(v => v === "") && !isSubmittingLoan
                            ? "bg-gradient-to-r from-[#FF7A00] to-[#E65C00] text-white"
                            : "bg-slate-800 text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        {isSubmittingLoan ? "Signing securely..." : "Submit OTP & eSign Signature"}
                      </button>
                    </div>
                  )}

                  {applyStep === 5 && (
                    <button 
                      onClick={() => { setStage("DASHBOARD"); setActiveTab("home"); }}
                      className="w-full bg-[#081B4B] text-white py-4 rounded-2xl font-bold font-sans"
                    >
                      Return to Dashboard
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Stage 11: REPAY OUTSTANDING AMOUNT VIEWPORT */}
            {stage === "REPAY_FLOW" && (
              <motion.div 
                key="repay_flow"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2 pt-1 pb-4 border-b border-slate-900">
                    <button onClick={() => { setStage("DASHBOARD"); }} className="p-1 rounded-full text-slate-400">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-black font-mono uppercase text-[#22C55E]">Repayment Settlement Gateway</span>
                  </div>

                  <div className="pt-4 space-y-4">
                    <div>
                      <h4 className="text-xl font-bold text-white">Payment Selection</h4>
                      <p className="text-xs text-[#6B7280]">Select preferred partners to clear active lending EMI structures.</p>
                    </div>

                    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-900 text-center space-y-2">
                      <span className="text-[10px] text-zinc-500 font-mono tracking-widest block uppercase">AMOUNTS OUTSTANDING DUE</span>
                      <h3 className="text-3xl font-black text-[#22C55E]">
                        ₹{myActiveLoan ? myActiveLoan.outstandingBalance.toLocaleString() : "0"}
                      </h3>
                      <p className="text-[9.5px] text-[#6B7280] font-mono">EST PAYOUT PRINCIPAL ACCRUAL INTEREST</p>
                    </div>

                    {/* Interactive Payment Methods options list Grid */}
                    <div className="space-y-2 text-xs">
                      <label className="text-[9px] font-mono tracking-widest text-slate-500 font-bold block uppercase mb-1">UPI / NET BANKING SETS</label>
                      
                      <div 
                        onClick={() => setPaymentMethod("UPI")}
                        className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                          paymentMethod === "UPI" ? "bg-[#081B4B]/30 border-[#FF7A00]" : "bg-slate-950 border-slate-900 text-[#6B7280]"
                        }`}
                      >
                        <span className="font-bold text-white font-sans flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#FF7A00]"></span>
                          <span>UPI AutoPay (Recommended)</span>
                        </span>
                        <span className="text-[10px] font-mono text-green-500">Fast (Instant)</span>
                      </div>

                      <div 
                        onClick={() => setPaymentMethod("NetBanking")}
                        className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                          paymentMethod === "NetBanking" ? "bg-[#081B4B]/30 border-[#FF7A00]" : "bg-slate-950 border-slate-900 text-[#6B7280]"
                        }`}
                      >
                        <span className="font-bold text-white font-sans flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                          <span>Commercial Net Banking Code</span>
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500">1-4 Hours</span>
                      </div>

                      <div 
                        onClick={() => setPaymentMethod("DebitCard")}
                        className={`p-3 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                          paymentMethod === "DebitCard" ? "bg-[#081B4B]/30 border-[#FF7A00]" : "bg-slate-950 border-slate-900 text-[#6B7280]"
                        }`}
                      >
                        <span className="font-bold text-white font-sans flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                          <span>Debit Master / VISA Card</span>
                        </span>
                        <span className="text-[10px] font-mono text-green-500">Instant</span>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="pb-6">
                  <button 
                    onClick={handleImmediateRepaymentAction}
                    disabled={repaymentProcessing || !myActiveLoan}
                    className="w-full bg-[#22C55E] text-slate-950 py-4 rounded-2xl font-bold font-sans tracking-wide transition-all shadow-md flex justify-center items-center space-x-1.5"
                  >
                    {repaymentProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Confirm and pay immediately</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* BOTTOM SHEETS FOR INTERACTIVE GATEWAYS */}
        <AnimatePresence>
          {activeBottomSheet && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex flex-col justify-end"
            >
              {/* Backdrop dismiss helper */}
              <div className="absolute inset-0 animate-fade-in" onClick={() => setActiveBottomSheet(null)}></div>
              
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="bg-[#030E26] border-t border-[#081B4B]/80 rounded-t-[32px] p-6 max-h-[85%] overflow-y-auto relative z-50 w-full text-left space-y-5 shadow-2xl"
              >
                {/* Decorative pull bar */}
                <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto cursor-pointer" onClick={() => setActiveBottomSheet(null)}></div>

                {/* Header row */}
                <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                  <span className="text-[10px] font-mono font-black text-[#FF7A00] uppercase tracking-widest bg-[#FF7A00]/10 px-2.5 py-1 rounded-md">
                    {activeBottomSheet === "EMI_CALC" && "DigiLend EMI Calculator"}
                    {activeBottomSheet === "REWARDS" && "Loyalty Rewards Club"}
                    {activeBottomSheet === "REFERRAL" && "Referral Program"}
                    {activeBottomSheet === "OFFER_DETAIL" && (selectedOffer?.tag || "Exclusive Offer Detail")}
                  </span>
                  <button 
                    onClick={() => setActiveBottomSheet(null)}
                    className="text-xs font-bold text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-900 transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>

                {/* 1. EMI CALCULATOR BOTTOM SHEET */}
                {activeBottomSheet === "EMI_CALC" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-black text-white">Dynamic EMI Calculator</h4>
                      <p className="text-xs text-[#6B7280]">Drag sliders to instantly preview fee models, simple interest rates, and total repayments.</p>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono font-bold">
                          <span className="text-zinc-200">CREDIT LIMIT</span>
                          <span className="text-[#FF7A00]">₹{emiInputAmount.toLocaleString()}</span>
                        </div>
                        <input 
                          type="range"
                          min="1000"
                          max="20000"
                          step="1000"
                          value={emiInputAmount}
                          onChange={(e) => setEmiInputAmount(Number(e.target.value))}
                          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-800 accent-[#FF7A00]"
                        />
                        <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                          <span>₹1,000</span>
                          <span>₹20,000</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-mono font-bold">
                          <span className="text-zinc-200">SELECT TENURE</span>
                          <span className="text-[#22C55E]">{emiInputTenure} Days Limit</span>
                        </div>
                        <input 
                          type="range"
                          min="7"
                          max="90"
                          step="1"
                          value={emiInputTenure}
                          onChange={(e) => setEmiInputTenure(Number(e.target.value))}
                          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-800 accent-[#22C55E]"
                        />
                        <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                          <span>7 Days</span>
                          <span>90 Days</span>
                        </div>
                      </div>
                    </div>

                    {/* Math Summary Cards */}
                    <div className="bg-[#081B4B]/25 p-4 rounded-xl border border-[#081B4B]/30 text-xs space-y-2.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Flat Monthly Interest Rate</span>
                        <span className="font-mono text-white font-semibold">{adminInterestRate}% Flat</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Computed simple interest fraction</span>
                        <span className="font-mono text-white font-semibold">₹{Math.round(emiInputAmount * ((adminInterestRate / 100) * (emiInputTenure / 30)))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Standard Processing Fee ({adminFeePercent}% value)</span>
                        <span className="font-mono text-zinc-200">₹{Math.round(emiInputAmount * (adminFeePercent / 100))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Integrated GST fee ({adminGstPercent}% on fee)</span>
                        <span className="font-mono text-zinc-200">₹{Math.round(Math.round(emiInputAmount * (adminFeePercent / 100)) * (adminGstPercent / 100))}</span>
                      </div>
                      <div className="border-t border-slate-900 pt-2.5 flex justify-between font-bold text-white">
                        <span>Net Disbursable Fund</span>
                        <span className="text-green-400 font-mono">₹{emiInputAmount - Math.round(emiInputAmount * (adminFeePercent / 100)) - Math.round(Math.round(emiInputAmount * (adminFeePercent / 100)) * (adminGstPercent / 100))}</span>
                      </div>
                      <div className="flex justify-between font-bold text-white">
                        <span>Total Amount Repayable</span>
                        <span className="text-[#FF7A00] font-mono">₹{emiInputAmount + Math.round(emiInputAmount * ((adminInterestRate / 100) * (emiInputTenure / 30)))}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setApplyAmount(emiInputAmount);
                        setApplyTenure(emiInputTenure);
                        setActiveBottomSheet(null);
                        if (!myActiveLoan) {
                          setApplyStep(1);
                          setStage("APPLY_LOAN");
                        } else {
                          setSelectedOffer({
                            title: "Active Credit Outstanding",
                            tag: "LIMIT ASSIGNED",
                            description: `You currently have an active loan outstanding principal balance matching ₹${myActiveLoan.outstandingBalance} due to settle on ${myActiveLoan.dueDate}.`,
                            instruction: "Before you can request further cash disbursements on your profile limit, please satisfy the outstanding dues. Select 'Repay Now' on your home screen dashboard to instantly complete a secure UPI/bank transfer settlement.",
                            accentColor: "red"
                          });
                          setActiveBottomSheet("OFFER_DETAIL");
                        }
                      }}
                      className="w-full bg-[#FF7A00] text-white py-3.5 rounded-xl font-bold font-sans text-xs flex justify-center items-center space-x-1 cursor-pointer transition-all hover:bg-orange-600"
                    >
                      <span>Apply With This Calculation</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* 2. LOYALTY REWARDS CLUB BOTTOM SHEET */}
                {activeBottomSheet === "REWARDS" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-black text-white">Loyalty & Scratchcards</h4>
                        <p className="text-xs text-[#6B7280]">Pay your outstanding bills dynamically to increase limit tiers.</p>
                      </div>
                      <div className="bg-[#22C55E]/10 p-2 rounded-xl text-center border border-[#22C55E]/30 text-xs shrink-0">
                        <span className="text-[10px] text-zinc-400 block font-mono">MY BALANCE</span>
                        <strong className="text-[#22C55E] font-black font-mono">350 Coins</strong>
                      </div>
                    </div>

                    {/* Tier Progress bar */}
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 space-y-2 text-xs">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="text-zinc-500">Tier Level: Bronze Partner</span>
                        <span className="text-[#FF7A00] font-bold">Silver Tier at 500 Coins</span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div className="w-[70%] h-full bg-[#FF7A00] rounded-full"></div>
                      </div>
                      <span className="text-[9.5px] text-zinc-500 block">Settle 1 more loan timeline completely clean to claim +150 DigiCoins bonus!</span>
                    </div>

                    {/* Interactive scratchcards section */}
                    <div className="space-y-3">
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500 block">Your Scratched & Available Rewards</span>
                      
                      <div className="grid grid-cols-2 gap-3">
                        
                        {/* Scratched Reward */}
                        <div className="p-3 bg-slate-950 rounded-xl border border-slate-900 flex flex-col justify-between text-left space-y-4 relative overflow-hidden opacity-60">
                          <span className="bg-zinc-800 text-zinc-400 text-[8px] font-mono px-2 py-0.5 rounded-full inline-block self-start">SCRATCHED</span>
                          <div>
                            <strong className="text-xs font-bold text-white block">₹100 Swiggy Voucher</strong>
                            <span className="text-[9px] text-[#6B7280] font-mono mt-0.5 block">CODE: SWG100LEND</span>
                          </div>
                        </div>

                        {/* Unscratched Reward (Interactive) */}
                        {scratchedBonus ? (
                          <div className="p-3 bg-gradient-to-br from-green-950/40 to-slate-950 rounded-xl border border-green-500/20 flex flex-col justify-between text-left space-y-4 relative overflow-hidden animate-fade-in animate-duration-500">
                            <span className="bg-green-500/20 text-green-400 text-[8px] font-mono px-2 py-0.5 rounded-full inline-block self-start">UNLOCKED 🎉</span>
                            <div>
                              <strong className="text-xs font-bold text-white block">₹150 Disbursal Fee Discount</strong>
                              <span className="text-[9px] text-green-400 font-mono mt-0.5 block">Applied automatically next apply!</span>
                            </div>
                          </div>
                        ) : (
                          <div 
                            onClick={() => {
                              if (scratchingLoader) return;
                              setScratchingLoader(true);
                              setTimeout(() => {
                                setScratchingLoader(false);
                                setScratchedBonus(true);
                                // Confetti!
                                confetti({
                                  particleCount: 85,
                                  spread: 55,
                                  origin: { y: 0.8 }
                                });
                              }, 1200);
                            }}
                            className="p-3 bg-gradient-to-br from-[#FF7A00]/25 to-[#081B4B] rounded-xl border border-[#FF7A00]/40 flex flex-col justify-center items-center text-center space-y-2 cursor-pointer hover:border-white/30 transition-all group min-h-[96px]"
                          >
                            {scratchingLoader ? (
                              <RefreshCw className="w-5 h-5 text-[#FF7A00] animate-spin" />
                            ) : (
                              <>
                                <Sparkles className="w-6 h-6 text-[#FF7A00] group-hover:scale-110 transition-transform" />
                                <strong className="text-xs font-bold text-white block">Tap to Scratch</strong>
                                <span className="text-[8px] text-zinc-400 block tracking-tight">Claim Instant Cash credits</span>
                              </>
                            )}
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                )}

                {/* 3. REFERRAL PROGRAM BOTTOM SHEET */}
                {activeBottomSheet === "REFERRAL" && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-black text-white">Refer & Claim Cash Credits</h4>
                      <p className="text-xs text-[#6B7280]">Introduce DigiLend to creditworthy associates and receive ₹250 directly into your bank once verified.</p>
                    </div>

                    {/* Interactive code box */}
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 flex justify-between items-center">
                      <div className="space-y-0.5 text-left">
                        <span className="text-[9px] text-[#6B7280] font-mono block uppercase">Your Custom Invite Code</span>
                        <strong className="text-base font-black font-mono text-white tracking-widest">DIGILEND250</strong>
                      </div>

                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText("DIGILEND250");
                          setCopiedToast(true);
                          setTimeout(() => setCopiedToast(false), 2000);
                        }}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          copiedToast 
                            ? "bg-green-500/10 border border-green-500/30 text-green-400" 
                            : "bg-[#FF7A00] text-white hover:bg-orange-600"
                        }`}
                      >
                        {copiedToast ? "Copied!" : "Copy Code"}
                      </button>
                    </div>

                    {/* Steps tracker card */}
                    <div className="p-4 bg-[#081B4B]/15 rounded-xl border border-slate-900 text-xs space-y-2.5 text-left">
                      <div className="flex space-x-2.5">
                        <span className="w-4.5 h-4.5 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                        <span>Share link code with friends on WhatsApp.</span>
                      </div>
                      <div className="flex space-x-2.5">
                        <span className="w-4.5 h-4.5 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                        <span>They complete DigiLocker verification in 2 minutes.</span>
                      </div>
                      <div className="flex space-x-2.5">
                        <span className="w-4.5 h-4.5 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                        <span>₹250 CASH settles directly into your active bank account instantly!</span>
                      </div>
                    </div>

                    {/* Referral history logs */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-500 block">Referral History Status</span>
                      
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-900 flex justify-between items-center text-xs">
                          <div>
                            <strong className="text-white font-bold block">Sanjay Rajan</strong>
                            <span className="text-[9px] text-[#6B7280] font-mono">Registered via +91 9381XXXXXX</span>
                          </div>
                          <span className="text-[9.5px] font-bold text-green-400 font-mono bg-green-500/10 px-2.5 py-0.5 rounded-full">+₹250 Paid</span>
                        </div>

                        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-900 flex justify-between items-center text-xs">
                          <div>
                            <strong className="text-white font-bold block">Preeti Shenoy</strong>
                            <span className="text-[9px] text-[#6B7280] font-mono">DigiLocker KYC linked</span>
                          </div>
                          <span className="text-[9.5px] font-bold text-[#FF7A00] font-mono bg-[#FF7A00]/10 px-2.5 py-0.5 rounded-full">Processing</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. GENERAL DETAILED OFFERS SHEET */}
                {activeBottomSheet === "OFFER_DETAIL" && selectedOffer && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-lg font-black text-white">{selectedOffer.title}</h4>
                      <p className="text-xs text-zinc-300 font-medium leading-relaxed">{selectedOffer.description}</p>
                    </div>

                    <div className="p-4.5 bg-slate-950 rounded-xl border border-slate-900 space-y-3.5 text-xs text-left">
                      <span className="text-[10px] font-mono font-black text-[#FF7A00] tracking-wider block">HOW TO PARTICIPATE & REDEEM</span>
                      <p className="text-zinc-400 font-sans leading-normal">{selectedOffer.instruction}</p>
                      
                      <div className="bg-[#081B4B]/20 py-2 px-3 rounded-lg text-[10px] text-zinc-400 border border-[#081B4B]/40 inline-flex items-center space-x-1.5 align-middle">
                        <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                        <span>Strictly Verified RBI credit campaign</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setActiveBottomSheet(null)}
                      className="w-full bg-slate-950 border border-slate-800 hover:text-white hover:border-slate-500 text-zinc-400 text-xs font-bold py-3.5 rounded-xl transition-all cursor-pointer"
                    >
                      Acknowledge and Close
                    </button>
                  </div>
                )}

                {/* 5. DEFENSIVE CONFIRM_RESET SHEET */}
                {activeBottomSheet === "CONFIRM_RESET" && selectedOffer && (
                  <div className="space-y-4 text-left">
                    <div className="space-y-2">
                      <h4 className="text-lg font-black text-red-500">{selectedOffer.title}</h4>
                      <p className="text-xs text-zinc-300 font-medium leading-relaxed">{selectedOffer.description}</p>
                    </div>

                    <div className="p-4 bg-red-950/20 rounded-xl border border-red-500/10 space-y-2 text-xs">
                      <span className="text-[10px] font-mono font-black text-red-400 tracking-wider block">DESTRUCTION POLICY ACKNOWLEDGEMENT</span>
                      <p className="text-zinc-400 font-sans leading-normal">{selectedOffer.instruction}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button 
                        onClick={() => setActiveBottomSheet(null)}
                        className="bg-slate-950 border border-slate-900 hover:text-white hover:border-slate-500 text-zinc-400 text-xs font-bold py-3.5 rounded-xl transition-all cursor-pointer text-center"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={() => {
                          resetAllAppDemoData();
                          setActiveBottomSheet(null);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-3.5 rounded-xl transition-all cursor-pointer text-center"
                      >
                        Reset Now
                      </button>
                    </div>
                  </div>
                )}

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ------------------------------------------------------------- */}
        {/* ADMIN PASSWORD CONVERSION GATEWAY */}
        {/* ------------------------------------------------------------- */}
        {isAdminPasswordModalOpen && (
          <div className="absolute inset-0 z-50 bg-[#020918]/90 backdrop-blur-md flex items-center justify-center p-6">
            <div className="w-full max-w-sm bg-slate-950 border border-[#081B4B] rounded-3xl p-6 text-center space-y-5 shadow-2xl">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto text-amber-500 border border-amber-500/20">
                <Lock className="w-6 h-6" />
              </div>
              
              <div>
                <h3 className="text-lg font-black text-white tracking-tight">Admin Authentication</h3>
                <p className="text-[11px] text-zinc-400 mt-1">Access secure banking core controls. Authentication required.</p>
              </div>
              
              <div className="space-y-3 text-left">
                <label className="text-[10px] font-mono tracking-wider uppercase text-zinc-500 block">System Access Key</label>
                <input 
                  type="password"
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAdminAuth(); }}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl py-3 px-4 font-mono text-center text-xs tracking-widest focus:outline-none focus:border-amber-500"
                  autoFocus
                />
                {adminPasswordError && (
                  <span className="text-[10px] text-red-500 font-bold block text-center mt-1">{adminPasswordError}</span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button 
                  onClick={() => { setIsAdminPasswordModalOpen(false); setAdminPasswordError(""); setAdminPasswordInput(""); }}
                  className="bg-slate-900 border border-slate-800 text-zinc-400 py-3 rounded-xl hover:text-white transition-all text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                
                <button 
                  onClick={handleAdminAuth}
                  className="bg-amber-600 hover:bg-amber-500 text-slate-950 py-3 rounded-xl transition-all text-xs font-black cursor-pointer"
                >
                  Unseal Core
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* FULLY FUNCTIONAL DYNAMIC ADMINISTRATIVE PANEL SCREEN */}
        {/* ------------------------------------------------------------- */}
        {isAdminPanelOpen && (
          <div className="absolute inset-0 z-50 bg-[#030914] text-white flex flex-col font-sans select-text">
            {/* Admin header */}
            <div className="p-4 bg-slate-950 border-b border-zinc-900 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                <div>
                  <h2 className="text-xs font-black font-mono text-amber-500 uppercase tracking-widest leading-none">DigiLend Admin Portal</h2>
                  <p className="text-[9px] text-zinc-500 font-mono mt-1">CONSOL_HOST // STABLE_SYS_2026</p>
                </div>
              </div>
              
              <button 
                onClick={() => { setIsAdminPanelOpen(false); setSelectedAdminUser(null); setSelectedAdminLoan(null); }}
                className="bg-slate-900 border border-slate-800 hover:bg-red-950 hover:text-red-400 text-zinc-400 font-mono font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center space-x-1"
              >
                <LogOut className="w-3 h-3" />
                <span>Exit Panel</span>
              </button>
            </div>

            {/* Admin Database overview badge */}
            <div className="bg-slate-900/40 p-2.5 border-b border-zinc-900/60 grid grid-cols-3 gap-2 text-center shrink-0">
              <div className="bg-[#030E26]/40 p-1.5 rounded-lg border border-slate-950">
                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wide block">PROFILES</span>
                <span className="text-xs font-black text-zinc-200 font-mono">{fintechDb.users.length} Active</span>
              </div>
              <div className="bg-[#030E26]/40 p-1.5 rounded-lg border border-slate-950">
                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wide block">LEDGER LOANS</span>
                <span className="text-xs font-black text-zinc-200 font-mono">{fintechDb.loans.length} Records</span>
              </div>
              <div className="bg-[#030E26]/40 p-1.5 rounded-lg border border-slate-950">
                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wide block">AUDIT TRAILS</span>
                <span className="text-xs font-black text-zinc-200 font-mono">{fintechDb.auditLogs.length} Registered</span>
              </div>
            </div>

            {/* Navigation tabs */}
            <div className="bg-slate-950 flex border-b border-zinc-900 text-[10px] font-mono shrink-0">
              {[
                { id: "settings", label: "⚙️ Global Settings" },
                { id: "users", label: "👥 Users Profiles" },
                { id: "loans", label: "💳 Loan Book" },
                { id: "notifications", label: "📢 Alerts & Logs" },
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => { setAdminActiveTab(tab.id as any); setSelectedAdminUser(null); setSelectedAdminLoan(null); }}
                  className={`flex-1 py-3 text-center border-b-2 font-bold transition-all ${
                    adminActiveTab === tab.id 
                      ? "border-amber-500 text-amber-500 bg-slate-900/30" 
                      : "border-transparent text-zinc-400 hover:text-white hover:bg-slate-900/10"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Main tab context: Scrollable body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              
              {/* ==================== TAB 1: SYSTEM SETTINGS ==================== */}
              {adminActiveTab === "settings" && (
                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 text-left space-y-3">
                    <h4 className="text-xs font-black font-mono text-white flex items-center space-x-1 border-b border-slate-900 pb-2">
                      <span>⚙️ MAIN APP BRANDING & RULES</span>
                    </h4>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-mono text-zinc-500 block">Interactive App Title Branding</label>
                      <input 
                        type="text"
                        value={editedPlatformName}
                        onChange={(e) => setEditedPlatformName(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-white font-black text-xs py-2.5 px-3 rounded-lg focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Logo upload picker and preview option */}
                    <div className="space-y-2 pt-1 border-t border-slate-900">
                      <label className="text-[10px] uppercase font-mono text-zinc-500 block">Bank Profile Logo Icon</label>
                      
                      <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 p-3 rounded-xl text-left">
                        {/* Logo Preview Container */}
                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-zinc-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {editedLogoUrl ? (
                            <img src={editedLogoUrl} alt="Logo preview" className="max-w-full max-h-full object-contain p-1" referrerPolicy="no-referrer" />
                          ) : (
                            <Shield className="w-5 h-5 text-amber-500" />
                          )}
                        </div>
                        
                        <div className="flex-1 space-y-1.5">
                          <div className="flex space-x-2">
                            {/* File Upload Input */}
                            <label className="bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-bold py-1.5 px-3 rounded-md cursor-pointer transition-all">
                              Upload Logo Image
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                      if (event.target?.result) {
                                        const img = new window.Image();
                                        img.onload = () => {
                                          const canvas = document.createElement("canvas");
                                          const MAX_WIDTH = 280;
                                          const MAX_HEIGHT = 280;
                                          let width = img.width;
                                          let height = img.height;

                                          if (width > height) {
                                            if (width > MAX_WIDTH) {
                                              height = Math.round(height * (MAX_WIDTH / width));
                                              width = MAX_WIDTH;
                                            }
                                          } else {
                                            if (height > MAX_HEIGHT) {
                                              width = Math.round(width * (MAX_HEIGHT / height));
                                              height = MAX_HEIGHT;
                                            }
                                          }

                                          canvas.width = width;
                                          canvas.height = height;
                                          const ctx = canvas.getContext("2d");
                                          if (ctx) {
                                            ctx.clearRect(0, 0, width, height);
                                            ctx.drawImage(img, 0, 0, width, height);
                                            const compressedBase64 = canvas.toDataURL("image/png");
                                            setEditedLogoUrl(compressedBase64);
                                          } else {
                                            setEditedLogoUrl(event.target!.result as string);
                                          }
                                        };
                                        img.src = event.target.result as string;
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }} 
                              />
                            </label>
                            
                            {editedLogoUrl && (
                              <button 
                                onClick={() => setEditedLogoUrl("")}
                                className="bg-red-950/40 border border-red-900/30 text-red-400 hover:bg-red-900/10 text-[10px] font-mono py-1 px-2.5 rounded-md transition-all"
                              >
                                Clear Logo
                              </button>
                            )}
                          </div>
                          
                          <p className="text-[9px] text-zinc-500">Supports PNG, JPG, WebP. Base64 encoded inside the core state.</p>
                        </div>
                      </div>

                      {/* Manual Image URL Input fallback */}
                      <div className="space-y-1">
                        <label className="text-[9px] text-zinc-600 font-mono">Or provide custom Image URL link</label>
                        <input 
                          type="text"
                          value={editedLogoUrl}
                          onChange={(e) => setEditedLogoUrl(e.target.value)}
                          placeholder="https://example.com/logo.png"
                          className="w-full bg-slate-900 border border-slate-800 text-zinc-300 font-mono text-[10px] py-1.5 px-3 rounded-lg focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-mono text-zinc-500 block">Flat Loan APR (%)</label>
                        <input 
                          type="number"
                          step="0.1"
                          value={editedInterestRate}
                          onChange={(e) => setEditedInterestRate(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 text-white font-mono text-xs py-2 px-2.5 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-mono text-zinc-500 block">Processing Charge (%)</label>
                        <input 
                          type="number"
                          value={editedProcessingFee}
                          onChange={(e) => setEditedProcessingFee(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 text-white font-mono text-xs py-2 px-2.5 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-mono text-zinc-500 block">GST on Fee (%)</label>
                        <input 
                          type="number"
                          value={editedGst}
                          onChange={(e) => setEditedGst(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 text-white font-mono text-xs py-2 px-2.5 rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-mono text-zinc-500 block">Food cashback (%)</label>
                        <input 
                          type="number"
                          value={editedCashback}
                          onChange={(e) => setEditedCashback(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-800 text-white font-mono text-xs py-2 px-2.5 rounded-lg"
                        />
                      </div>
                    </div>

                    <button 
                      onClick={updateAdminSettingsOnServer}
                      className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs py-3 rounded-xl transition-all mt-4 cursor-pointer"
                    >
                      Apply Updates Dynamically
                    </button>
                  </div>

                  <div className="bg-amber-950/20 rounded-2xl p-4 border border-amber-500/10 text-left space-y-1.5">
                    <span className="text-[10px] font-mono text-amber-500 font-bold block uppercase tracking-wider">⚡ LIVE HOT PROPAGATION RULES</span>
                    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
                      When you alter these, all math widgets (Eligibility Stepper, EMI Calculator, backend underwriting engine, disbursal sheets) adjust calculations immediately across the active frontend simulator and backend nodes.
                    </p>
                  </div>
                </div>
              )}

              {/* ==================== TAB 2: MANAGE PROFILES ==================== */}
              {adminActiveTab === "users" && (
                <div className="space-y-4">
                  {!selectedAdminUser ? (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider text-left">SELECT SIMULATOR PROFILE TO MANAGE</h4>
                      <div className="space-y-2">
                        {fintechDb.users.map((u) => (
                          <div 
                            key={u.id}
                            onClick={() => setSelectedAdminUser({ ...u, kycStatus: u.kyc.status, bankVerified: u.bank.isVerified, bankName: u.bank.bankName, bankAccount: u.bank.accountNumber, bankIfsc: u.bank.ifscCode })}
                            className="p-3 bg-slate-950 border border-slate-900 hover:border-amber-500/40 rounded-xl transition-all cursor-pointer text-left flex justify-between items-center"
                          >
                            <div className="space-y-1">
                              <strong className="text-white text-xs block">{u.fullName}</strong>
                              <span className="text-[10px] text-zinc-500 font-mono block">{u.phone} • {u.occupation}</span>
                              <div className="flex space-x-2 pt-1 font-mono text-[9px]">
                                <span className={`px-1.5 py-0.5 rounded ${u.kyc.status === "VERIFIED" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                                  KYC: {u.kyc.status}
                                </span>
                                <span className="text-zinc-600">Score: {u.creditScore}</span>
                                <span className="text-zinc-600">Limit: ₹{u.maxEligibleAmount}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 text-left space-y-3.5">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <strong className="text-xs font-black font-mono text-amber-500 uppercase">👤 EDIT PARAMS: {selectedAdminUser.fullName}</strong>
                        <button 
                          onClick={() => setSelectedAdminUser(null)}
                          className="text-[10px] text-zinc-500 font-mono hover:text-white"
                        >
                          Back to List
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono text-zinc-500 block">Full Name</label>
                          <input 
                            type="text"
                            value={selectedAdminUser.fullName}
                            onChange={(e) => setSelectedAdminUser({ ...selectedAdminUser, fullName: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-1.5 px-2.5 text-xs font-semibold focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono text-zinc-500 block">Phone</label>
                          <input 
                            type="text"
                            value={selectedAdminUser.phone}
                            onChange={(e) => setSelectedAdminUser({ ...selectedAdminUser, phone: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-1.5 px-2.5 text-xs font-mono focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono text-zinc-500 block">CIBIL Score (300 - 900)</label>
                          <input 
                            type="number"
                            value={selectedAdminUser.creditScore}
                            onChange={(e) => setSelectedAdminUser({ ...selectedAdminUser, creditScore: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-1.5 px-2.5 text-xs font-mono font-black"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono text-zinc-500 block">Approved Limit (₹)</label>
                          <input 
                            type="number"
                            value={selectedAdminUser.maxEligibleAmount}
                            onChange={(e) => setSelectedAdminUser({ ...selectedAdminUser, maxEligibleAmount: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-1.5 px-2.5 text-xs font-mono font-black"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono text-zinc-500 block">KYC Status</label>
                          <select 
                            value={selectedAdminUser.kycStatus}
                            onChange={(e) => setSelectedAdminUser({ ...selectedAdminUser, kycStatus: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-1.5 px-2.5 text-xs"
                          >
                            <option value="PENDING">PENDING (Restart Funnel)</option>
                            <option value="VERIFIED">VERIFIED (Checked)</option>
                            <option value="REJECTED">REJECTED (Hard Reject)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono text-zinc-500 block">Bank Link Verification</label>
                          <select 
                            value={selectedAdminUser.bankVerified ? "true" : "false"}
                            onChange={(e) => setSelectedAdminUser({ ...selectedAdminUser, bankVerified: e.target.value === "true" })}
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-1.5 px-2.5 text-xs"
                          >
                            <option value="true">VERIFIED // PASS</option>
                            <option value="false">NOT VERIFIED // FAIL</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-mono text-zinc-500 block">Registered Bank Name</label>
                        <input 
                          type="text"
                          value={selectedAdminUser.bankName || ""}
                          onChange={(e) => setSelectedAdminUser({ ...selectedAdminUser, bankName: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-1.5 px-2.5 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono text-zinc-500 block">Bank Account No.</label>
                          <input 
                            type="text"
                            value={selectedAdminUser.bankAccount || ""}
                            onChange={(e) => setSelectedAdminUser({ ...selectedAdminUser, bankAccount: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-1.5 px-2.5 text-xs font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono text-zinc-500 block">IFSC Code</label>
                          <input 
                            type="text"
                            value={selectedAdminUser.bankIfsc || ""}
                            onChange={(e) => setSelectedAdminUser({ ...selectedAdminUser, bankIfsc: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-1.5 px-2.5 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3">
                        <button 
                          onClick={() => deleteAdminDataOnServer("USER", selectedAdminUser.id)}
                          className="bg-red-950 hover:bg-red-900 text-red-400 font-bold border border-red-900/30 text-xs py-2.5 rounded-xl cursor-pointer"
                        >
                          Delete Profile
                        </button>
                        <button 
                          onClick={() => updateAdminUserOnServer(selectedAdminUser)}
                          className="bg-green-600 hover:bg-green-500 text-slate-950 font-black text-xs py-2.5 rounded-xl cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ==================== TAB 3: MANAGE LOANS ==================== */}
              {adminActiveTab === "loans" && (
                <div className="space-y-4 text-left">
                  {!selectedAdminLoan ? (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">MANAGE LEDGER LOAN RECORDS</h4>
                      
                      {fintechDb.loans.length === 0 ? (
                        <div className="p-8 bg-slate-950 rounded-2xl border border-slate-900 text-center text-zinc-500">
                          No loan applications registered in database ledger yet.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {fintechDb.loans.map((l) => {
                            const assocUser = fintechDb.users.find(u => u.id === l.userId);
                            return (
                              <div 
                                key={l.id}
                                onClick={() => setSelectedAdminLoan({ ...l })}
                                className="p-3 bg-slate-950 border border-slate-900 hover:border-amber-500/40 rounded-xl transition-all cursor-pointer flex justify-between items-center"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-mono font-bold text-[10px] text-zinc-400">{l.id}</span>
                                    <span className={`text-[8.5px] font-mono uppercase px-1.5 py-0.5 rounded font-black ${
                                      l.status === "DISBURSED" 
                                        ? "bg-green-500/15 text-green-400" 
                                        : l.status === "OVERDUE" 
                                        ? "bg-red-500/15 text-red-400 font-bold" 
                                        : "bg-blue-500/15 text-blue-400"
                                    }`}>
                                      {l.status}
                                    </span>
                                  </div>
                                  <strong className="text-white text-xs block font-mono">₹{l.amount.toLocaleString()} ({l.tenureDays} Days)</strong>
                                  <span className="text-[9.5px] text-zinc-500 block font-sans">
                                    User: {assocUser ? assocUser.fullName : "Unknown ID"} • Due: {l.dueDate}
                                  </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-zinc-500" />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 space-y-3.5">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                        <strong className="text-xs font-black font-mono text-amber-500 uppercase">💳 MANAGE LOAN ID: {selectedAdminLoan.id}</strong>
                        <button 
                          onClick={() => setSelectedAdminLoan(null)}
                          className="text-[10px] text-zinc-500 font-mono hover:text-white"
                        >
                          Back to List
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono text-zinc-500 block">Loan Amount (₹)</label>
                          <input 
                            type="number"
                            value={selectedAdminLoan.amount}
                            onChange={(e) => setSelectedAdminLoan({ ...selectedAdminLoan, amount: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-1.5 px-2.5 text-xs font-mono font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono text-zinc-500 block">Repay Tenure (Days)</label>
                          <input 
                            type="number"
                            value={selectedAdminLoan.tenureDays}
                            onChange={(e) => setSelectedAdminLoan({ ...selectedAdminLoan, tenureDays: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-1.5 px-2.5 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono text-zinc-500 block">Outstanding Due (₹)</label>
                          <input 
                            type="number"
                            value={selectedAdminLoan.outstandingBalance}
                            onChange={(e) => setSelectedAdminLoan({ ...selectedAdminLoan, outstandingBalance: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-1.5 px-2.5 text-xs font-mono font-semibold"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-mono text-zinc-500 block">Due Date (YYYY-MM-DD)</label>
                          <input 
                            type="text"
                            value={selectedAdminLoan.dueDate}
                            onChange={(e) => setSelectedAdminLoan({ ...selectedAdminLoan, dueDate: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-800 text-white font-mono rounded-lg py-1.5 px-2.5 text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-mono text-zinc-500 block font-bold">Override Loan Status</label>
                        <select 
                          value={selectedAdminLoan.status}
                          onChange={(e) => setSelectedAdminLoan({ ...selectedAdminLoan, status: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-2 px-3 text-xs font-semibold"
                        >
                          <option value="APPLIED">APPLIED (Review Stage)</option>
                          <option value="APPROVED">APPROVED (Awaiting eSign)</option>
                          <option value="DISBURSED">DISBURSED (Active Ledger / Outstanding)</option>
                          <option value="REPAID">REPAID (Cleared Balance / Closed)</option>
                          <option value="CLOSED">CLOSED (Complete archive)</option>
                          <option value="OVERDUE">OVERDUE (In default flag)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3">
                        <button 
                          onClick={() => deleteAdminDataOnServer("LOAN", selectedAdminLoan.id)}
                          className="bg-red-950 hover:bg-red-900 text-red-400 font-bold border border-red-900/30 text-xs py-2.5 rounded-xl cursor-pointer"
                        >
                          Delete Loan
                        </button>
                        <button 
                          onClick={() => updateAdminLoanOnServer(selectedAdminLoan)}
                          className="bg-green-600 hover:bg-green-500 text-slate-950 font-black text-xs py-2.5 rounded-xl cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ==================== TAB 4: BROADCASTS & AUDITS ==================== */}
              {adminActiveTab === "notifications" && (
                <div className="space-y-4 text-left">
                  {/* Notification Broadcaster */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 space-y-3">
                    <h4 className="text-xs font-black font-mono text-white flex items-center space-x-1 uppercase border-b border-slate-900 pb-2">
                      <span>📢 BROADCAST TARGETED ALERTS</span>
                    </h4>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 block">Alert Badge Type</label>
                      <div className="flex space-x-2">
                        {(["INFO", "SUCCESS", "WARNING", "CRITICAL"] as const).map((t) => (
                          <button 
                            key={t}
                            onClick={() => setNotifType(t)}
                            className={`text-[9px] font-mono font-bold flex-1 py-1 rounded border capitalize ${
                              notifType === t 
                                ? "bg-amber-500/10 text-amber-400 border-amber-500" 
                                : "bg-slate-900 text-zinc-500 border-slate-800 hover:bg-slate-900"
                            }`}
                          >
                            {t.toLowerCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 block">Notification Header Title</label>
                      <input 
                        type="text"
                        value={notifTitle}
                        onChange={(e) => setNotifTitle(e.target.value)}
                        placeholder="e.g., Credit Limit Surge Alert"
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg py-1.5 px-3 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 block">Payload Message Text</label>
                      <textarea 
                        value={notifMessage}
                        onChange={(e) => setNotifMessage(e.target.value)}
                        placeholder="Detailed notification content seen in upper bell drawer..."
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg py-1.5 px-3 text-xs h-16 resize-none"
                      />
                    </div>

                    <button 
                      onClick={pushAdminNotification}
                      className="w-full bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs py-3 rounded-xl transition-all cursor-pointer"
                    >
                      Inject Notification Immediately
                    </button>
                  </div>

                  {/* Audit Logs writer */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 space-y-3">
                    <h4 className="text-xs font-black font-mono text-white flex items-center space-x-1 uppercase border-b border-slate-900 pb-2">
                      <span>🛡️ RECORD SYSTEM AUDIT LEDGER LOG</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-500 block">System Category</label>
                        <select 
                          value={auditCategory}
                          onChange={(e) => setAuditCategory(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-1 px-2 text-[10px]"
                        >
                          <option value="SERVICE">SERVICE (Default)</option>
                          <option value="SECURITY">SECURITY (Breach/Override)</option>
                          <option value="RISK">RISK (Underwriting)</option>
                          <option value="DISBURSEMENT">DISBURSEMENT (Banking)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono text-zinc-500 block">Log Level Severity</label>
                        <select 
                          value={auditLevel}
                          onChange={(e) => setAuditLevel(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg py-1 px-2 text-[10px]"
                        >
                          <option value="INFO">INFO</option>
                          <option value="WARNING">WARNING</option>
                          <option value="CRITICAL">SEVERE CRITICAL</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 block font-bold">Log Record Statement</label>
                      <input 
                        type="text"
                        value={auditMsg}
                        onChange={(e) => setAuditMsg(e.target.value)}
                        placeholder="e.g., Compliance audit unsealed by banking executive"
                        className="w-full bg-slate-950 border border-slate-800 text-white rounded-lg py-2 px-3 text-xs"
                      />
                    </div>

                    <button 
                      onClick={injectAdminAuditLog}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-amber-500 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
                    >
                      Insert Audit Log Entry
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Invisible/Subtle Lock bottom tab trigger bar */}
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
          <button 
            onClick={() => setIsAdminPasswordModalOpen(true)}
            className="w-24 h-5 bg-transparent outline-none cursor-pointer flex items-center justify-center group"
            title="Admin Center Key"
            id="hidden-lock-admin-trigger"
          >
            <div className="opacity-[0.02] hover:opacity-100 transition-opacity bg-slate-950/85 px-3 py-1 rounded-full border border-slate-800 flex items-center space-x-1 text-zinc-500 select-none">
              <Lock className="w-2.5 h-2.5 text-amber-500" />
              <span className="text-[8px] font-mono select-none">Unseal Key</span>
            </div>
          </button>
        </div>

      </div>

    </div>
  );
}
