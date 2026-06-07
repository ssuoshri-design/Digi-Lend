// DigiLend Compliance, Disclosures and Legal Policies Dataset
// Suitable for paying checkout gateways, Decentro, Razorpay, RBI-regulated NBFC partners, App Store and Google Play reviews.

export interface ComplianceDoc {
  id: string;
  title: string;
  category: "Legal" | "Operational" | "App-Store" | "Consent";
  description: string;
  sections: {
    heading: string;
    content: string;
  }[];
}

export const complianceDocs: ComplianceDoc[] = [
  {
    id: "privacy-policy",
    title: "1. Privacy & Data Protection Policy",
    category: "Legal",
    description: "RBI-compliant privacy policy detailing data lifecycle, device scans, SMS analytics, and third-party gateways.",
    sections: [
      {
        heading: "1. INTRODUCTION & SCOPE",
        content: "DigiLend ('Platform', 'we', 'us', 'our'), operated by [NBFC_PARTNER_NAME] or its authorized Lending Service Provider (LSP), is committed to protecting the privacy, confidentiality, and security of your personal and financial data. This Privacy Policy outlines our practices regarding collection, storage, processing, transfer, protection, and deletion of information in compliance with the Information Technology Act, 2000, credit information regulation frameworks, and the Reserve Bank of India (RBI) Guidelines on Digital Lending issued in August 2022."
      },
      {
        heading: "2. CONTROLLING ENTITY & RBI COMPLIANCE",
        content: "All credit lines, loans, and credit assessment products offered through this mobile application are underwritten and sanctioned by our RBI-registered Non-Banking Financial Company (NBFC) partner, [NBFC_PARTNER_NAME], holding valid Certificate of Registration (CoR) License No. [NBFC_COR_LICENSE_NUMBER]. DigiLend acts as a digital lending platform and outsourced Lending Service Provider (LSP)."
      },
      {
        heading: "3. TYPES OF DATA COLLECTED",
        content: "For rendering instant onboarding and risk evaluation, the platform collects:\n• Mobile Phone Number: Collected during login to serve as primary account key and trigger secure multi-factor SMS One Time Passwords (OTP).\n• Permanent Account Number (PAN): Collected for automated validation with the Income Tax Department database (via Decentro API gateways) to verify citizen identity and run credit checks.\n• Aadhaar KYC Information: Obtained via secure authorized DigiLend Aadhaar OTP / DigiLocker linkages to lock verified address coordinates.\n• Bank Account Details: Account number and IFSC code to run pennies drop (verification) and coordinate Razorpay / RazorpayX auto-settlements.\n• Device/Hardware Information: Device manufacturer, model, operating system version, unique device identifiers to detect device spoofing, simulate device-level risk, and secure auth sessions."
      },
      {
        heading: "4. SPECIAL PURPOSE SMS ANALYSIS consent",
        content: "Under the strictly defined RBI Digital Lending Guidelines of 2022, the Platform is FORBIDDEN from running background scraping of contact lists, call logs, personal files, or general media. The platform only scans financial transaction SMS messages sent by commercial banks, digital wallets, or bill payment utilities (e.g., salary deposits, repayments, credit cards bills) on a one-time-per-onboarding basis to reconstruct repayment capability scorecards. Borrowers must explicitly consent to this processing by ticking specific opt-ins."
      },
      {
        heading: "5. PERSISTENT STORAGE & LOCATIONAL DATA",
        content: "• Geolocation: The platform requires one-off coarse latitude-longitude details solely to confirm that the customer is operating within authorized Indian physical boundaries and to thwart location-based multi-account fraud.\n• Camera & Selfie: Camera capture parameters are engaged purely to record a live user selfie during the KYC stage to establish authentic biometric existence and compare it real-time with PAN identity cards."
      },
      {
        heading: "6. COOKIES & TRACKING METRICS",
        content: "We use secure persistent cookies and device tracking pixels to remember user authorization states and avoid requiring duplicate passwords. All cookies and local state storage variables are encrypted using client-side keys and contain no raw readable financial numbers."
      },
      {
        heading: "7. INDIVIDUAL'S DATA RIGHTS",
        content: "Borrowers hold explicit, non-alienable rights regarding their digital footmarks on our servers, including the:\n• Right to Access: Request complete digital records of all stored variables.\n• Right to Rectification: Correct erroneous address details or invalid Bank details.\n• Right to Erasure / 'Right to Be Forgotten': Request full server-side deletion of user records upon the complete clearance of all outstanding loan payments and statutory interest liabilities.\n• Right to Revoke Consent: Terminate ongoing background synchronization services at any point."
      },
      {
        heading: "8. CONTACT INFORMATION & GRIEVANCE HELPDESK",
        content: "For queries regarding data privacy and GDPR/RBI compliance, contact our local Privacy Officer directly at security@digilend.in, or reach the Grievance Officer, [GRIEVANCE_REDRESSAL_OFFICER_NAME], at [GRIEVANCE_OFFICER_EMAIL] / [GRIEVANCE_OFFICER_PHONE]."
      }
    ]
  },
  {
    id: "terms-conditions",
    title: "2. Terms & General Service Conditions",
    category: "Legal",
    description: "The overarching legal framework governing loan applications, collections rules, and service bounds.",
    sections: [
      {
        heading: "1. USER ELIGIBILITY REQUIREMENTS",
        content: "To use the DigiLend Platform and apply for credit, the individual must meet these baseline rules:\n• Must be a resident citizen of the Republic of India.\n• Must be aged 18 years or above on the registration date.\n• Must possess active Permanent Account Number (PAN) issued by Income Tax authorities.\n• Must maintain an active bank account matching IFSC clearing standards with an Indian banking house."
      },
      {
        heading: "2. MULTI-FACTOR ACCOUNT CREATION & OTP AUTHENTICATION",
        content: "Creating an account requires entering a valid Indian mobile number. Users verify their session using one-time SMS verification tokens sent to their verified cell number. Users agree to prevent unauthorized access by third parties. Registered credentials must represent true details. Providing false PAN credentials or duplicate telephone keys constitutes a serious criminal breach."
      },
      {
        heading: "3. COMPREHENSIVE REGULATORY KYC POLICY",
        content: "All platform credit lines remain suspended until deep C-KYC equivalent parameters are validated successfully. KYC involves submitting a PAN number, linking state address files from authorized Aadhaar databases, and completing a live visual selfie capture. DigiLend reserves the absolute right to freeze accounts or decline applications if verification reports indicate mismatched details, high risk CIBIL metrics, or prior banking defaults."
      },
      {
        heading: "4. THE DIGITAL LOAN APPLICATION FRAMEWORK",
        content: "When applying for digital loans, users pick requested principal and tenure values. Applying is an inquiry, and credit underwriting engines utilize dynamic interest, GST, and processing fee matrices to generate a custom offer. The proposed loan details must be reviewed via a Key Fact Statement (KFS). Acceptance is finalized through an Aadhaar-linked e-Sign verification process."
      },
      {
        heading: "5. RESPONSIBILITIES of borrowers",
        content: "Borrowers must comply with clear debt obligations, including:\n• Repaying loans in full on or prior to the specified target due dates.\n• Upkeeping sufficient bank balances for automated NACH electronic mandates or Razorpay checkout clearances.\n• Reporting changes to address, employment status, or contact telephone parameters within 48 business hours."
      },
      {
        heading: "6. LIMITATION OF LIABILITY & WARRANTY WAIVERS",
        content: "DigiLend operates as a digital LSP platform. Under no condition shall we, our directors, employees, or tech partners be liable for indirect, incidental, or exemplary financial losses resulting from network downtime, clearing house processing timeouts, or third-party Razorpay gateway breakdowns."
      },
      {
        heading: "7. DISPUTE RESOLUTION & DISCIPLINARY LAWS",
        content: "In the event of friction or legal claims, both parties agree to undergo mutual amicable negotiation first. If unsolved within 30 business days, the conflict shall be referred to arbitration in accordance with the Arbitration and Conciliation Act, 1996. The seat and venue of physical arbitration shall remain in Bengaluru, India. General Service Conditions are governed exclusively by the laws of India, subject to exclusive court jurisdiction in Bengaluru."
      }
    ]
  },
  {
    id: "lending-disclosure",
    title: "3. Digital Lending & Key Fact Disclosure",
    category: "Consent",
    description: "Detailed commercial terms, co-branding NBFC declarations, APR formulas, and cooling-off periods.",
    sections: [
      {
        heading: "1. CO-BRANDING NBFC PARTNER DISCLOSURE",
        content: "Our digital credit application is backed, underwritten, and disbursed by our principal licensed NBFC partner: [NBFC_PARTNER_NAME] (CIN: [CORPORATE_IDENTIFICATION_NUMBER], Registered Location: [REGISTERED_OFFICE_ADDRESS]). DigiLend operates as an authorized Digital Frontend Platform / Lending Service Provider (LSP) under direct license agreement."
      },
      {
        heading: "2. INTEREST RATE & ANNUALIZED APR COMPUTATION",
        content: "All interest structures are computed transparently. Base interest scales dynamically from 18% to 36% Annualized Percentage Rate (APR). Interest is computed daily on outstanding balances. For a dry run model:\n• Loan Principal: ₹10,000\n• Tenure: 30 days\n• Processing Fee (3%): ₹300\n• GST Rate (18% on Fee): ₹54\n• Disbursed Net Amount: ₹9,646\n• Repayment Interest (at nominal monthly rate): ₹250\n• Total Outstanding Repayment: ₹10,250"
      },
      {
        heading: "3. COMMERCIALLY MANDATED PROCESSING FEE & GST",
        content: "A standard flat processing fee ranging between 2% and 5% is assessed to defray credit evaluation costs, e-Sign expenses, and secure hosting. Statutory Goods & Services Tax (GST) at Indian compliance rate (18%) is applied exclusively to processing fees and is deducted prior to fund disbursal."
      },
      {
        heading: "4. REPAYMENT SCHEDULE & RAZORPAY AUTOPAY PLANS",
        content: "Standard repayment periods scale from 30 days to 90 days. Repayments are executed through our authorized Razorpay payments gateway, allowing secure cards, net banking, or UPI (Unified Payments Interface) transactions. Clear repayment receipts are posted to customer accounts."
      },
      {
        heading: "5. LATE PENALTY STRUCTURES",
        content: "Our penalty structures reflect a fair and transparent system:\n• Grace Period: A grace period of 3 days applies where no late penalties are levied.\n• Overdue Penalty: Beginning day 4, a flat late fee of 0.12% per day of the overdue balance is applied.\n• Compounding: Compliant with RBI guidance, no late penalties are capitalized or compounded. The system applies simple linear late interest."
      },
      {
        heading: "6. STATUTORY COOLING-OFF PERIOD",
        content: "Borrowers receive an official 'Cooling-Off Period' of three (3) calendar days following e-Sign execution. During this window, borrowers who decide not to proceed with the loan can return the principal disbursed net amount with ZERO penalty fees and zero additional interest."
      },
      {
        heading: "7. GRIEVANCE REDRESSAL ESCALATION STEPS",
        content: "Customers facing issues with disbursals, loan servicing, or collector teams can initiate a grievance case in-app, call [GRIEVANCE_OFFICER_PHONE], or email grievance@digilend.in. If unresolved within 30 days, customers have the right to file appeals directly with the RBI Integrated Ombudsman Scheme website (cms.rbi.org.in)."
      }
    ]
  },
  {
    id: "consent-policy",
    title: "4. Explicit Customer Consent Policy",
    category: "Consent",
    description: "Standard opt-in templates of absolute authority required for PAN records, CIBIL pulls, and bank penny drop.",
    sections: [
      {
        heading: "1. SECURE MOBILE PHONE OTP CONSENT",
        content: "By checking the OTP verification box, the customer grants explicit permission to DigiLend and its verified automated telecom pipelines to transmit SMS alerts, digital receipts, and regulatory system statements across standard cellular channels."
      },
      {
        heading: "2. PAN TAX-DATABASE MANDATORY PULL CONSENT",
        content: "The customer declares that the Permanent Account Number (PAN) entered represents their official government credential. The user authorizes the Platform and its licensed Decentro KYC servers to execute automatic validations against NSDL databases for verification."
      },
      {
        heading: "3. AADHAAR OKYC & DIGILOCKER LINK CONSENT",
        content: "Under Section 11A of the Prevention of Money Laundering Act (PMLA), the customer grants explicit consent to fetch, verify, and lock official certified residential addresses and identity markers from National Identity bases (UIDAI) via secure DigiLocker XML API links."
      },
      {
        heading: "4. BANK PENNY DROP AUTOPAY CONSENT",
        content: "The user authorizes the Platform's bank partner to execute an automated ₹1.00 Penny Drop (Hop-Verification) transaction through Decentro channels to match the registered bank holder's name directly with the PAN tax identity card records."
      },
      {
        heading: "5. CREDIT SCORE cibil PULL CONSENT",
        content: "The user grants permission to DigiLend's underwriter partners, including [NBFC_PARTNER_NAME], to request and pull comprehensive financial records, historic debts, credit histories, and CIBIL score details from licensed Indian Credit Bureaus."
      },
      {
        heading: "6. SMS TRANSACTION ANALYTICAL CONSENT",
        content: "The customer grants specific permission to the Platform's frontend scan client to perform local, isolated evaluation of financial transaction SMS logs (salary credits, active repayments) to assess credit eligibility. No personal contact logs are scanned."
      },
      {
        heading: "7. LOCATIONAL AND DEVICE DATA METRICS CONSENT",
        content: "The user authorizes the Platform to collect temporary device variables and coarse GPS coordinates to prevent multi-device spoofing, verify operations within India, and perform identity fraud detection and security verification."
      }
    ]
  },
  {
    id: "refund-cancellation",
    title: "5. Refund & Transaction Settlement Policy",
    category: "Operational",
    description: "Rules resolving double payment settlements, failed checkout loops, and Razorpay refund windows.",
    sections: [
      {
        heading: "1. DOUBLE TRANSACTION SETTLEMENT REMEDIARY RULES",
        content: "If a user runs the repayment checkout and completes a transaction, but network drops cause a second transaction to execute for the same loan installment, the Platform will auto-detect the duplication. The excess amount is routed to the customer within 7 business days."
      },
      {
        heading: "2. RESOLUTION OF FAILED TRANSACTION BALANCES",
        content: "When a borrower's account is debited but the payment is not credited to the DigiLend ledger, the money is held by the issuing bank or Razorpay's route nodes. These transactions generally auto-reconcile, or they are reverted to the original bank source within 3 business days."
      },
      {
        heading: "3. CLEARANCE TIMELINES FOR REFUNDS",
        content: "Eligible excess settlements are credited back to the customer's linked savings account through standard clearing pipelines (IMPS/NEFT/UPI). Processing updates are shared with users via in-app feeds and SMS alerts."
      },
      {
        heading: "4. CANCELLATION FOR PRE-DISBURSAL LOANS",
        content: "Once a loan e-Sign verification is completed, funds are automatically routed to processing channels. Cancellation is not possible after disbursal, but borrowers can leverage the 3-day Cooling-Off window to repay the principal with zero fees."
      }
    ]
  },
  {
    id: "kyc-policy",
    title: "6. Customer Due Diligence (KYC) Policy",
    category: "Operational",
    description: "Detailed regulatory steps for instant NSDL PAN checks, digital signatures, and banking verification.",
    sections: [
      {
        heading: "1. SYSTEMATIC PAN TAX CARD CHECKS",
        content: "Our KYC process begins with entering and validating the Permanent Account Number (PAN). Built-in Decentro connection scripts verify the tax registration records against NSDL databases to ensure validity and confirm match status."
      },
      {
        heading: "2. XML DIGILOCKER AADHAAR VERIFICATIONS",
        content: "To verify address records, we use DigiLocker XML API integrations. Borrowers log in with their credentials and authorize the retrieval of UIDAI files, ensuring tamper-proof verification of demographic data."
      },
      {
        heading: "3. VISUAL SELFIE BIOMETRIC CHECKS",
        content: "Borrowers capture a live selfie image inside the app. Liveliness verification checks are applied (such as tracking blinking, facial depth, and lighting changes) to prevent static photo spoofs. The image is matched against PAN/Aadhaar photos."
      },
      {
        heading: "4. BANK PENNY-DROP HANDSHAKES",
        content: "To prevent money laundering and bank mismatch fraud, a secure ₹1.00 IMPS penny drop is made to the customer's account. This verifies the channel and checks that the account holder's name matches the PAN registration details."
      },
      {
        heading: "5. PROACTIVE FRAUD CODENAMES PREVENTIONS",
        content: "Accounts flag high-risk warnings list if a PAN is loaded on multiple devices, if geolocation matches a blacklisted IP farm, or if biometric checks indicate a spoof attempt. Such files are routed to human underwriting reviews."
      }
    ]
  },
  {
    id: "data-security",
    title: "7. Enterprise Data Protection & Security Policy",
    category: "Legal",
    description: "Detailed description of AES-256 storage standards, TLS 1.3 protocol requirements, server-side masking, and incident reporting windows.",
    sections: [
      {
        heading: "1. COMPREHENSIVE STORAGE ENCRYPTION (AES-256)",
        content: "All databases and persistent file storage repositories are encrypted using AES-256 keys. Sensitive data (such as bank details or KYC records) is encrypted in-transit and at-rest, protecting it from unauthorized physical retrieval."
      },
      {
        heading: "2. HIGH PERFORMANCE TRANSPORT SECURITY (TLS 1.3)",
        content: "Every data transfer between our mobile/web frontend and server-side APIs is protected by TLS 1.3 encryption, ensuring a secure channel that prevents eavesdropping or tampering."
      },
      {
        heading: "3. ROBUST CLOUD ACCESS CONTROL AUDITS",
        content: "We enforce strict Principle of Least Privilege access controls. Only authenticated applications and certified system administrators can access core database layers. Access logs are archived to prevent tampering."
      },
      {
        heading: "4. TRANSACTION MASKING ON CLI / EDGE LOGS",
        content: "Our systems automatically scrub sensitive content (such as API keys, bank account numbers, or personal details) from system logs, protecting data in development and production environments."
      },
      {
        heading: "5. SYSTEM SECURITY INCIDENT ESCALATIONS",
        content: "In the event of a security incident or suspected breach, critical escalation pathways are activated. We commit to notifying relevant regulatory bodies (CERT-In) and affected users within the required statutory timelines."
      }
    ]
  },
  {
    id: "grievance-policy",
    title: "8. Customer Grievance Redressal Policy",
    category: "Operational",
    description: "Escalation matrix and SLA resolution guarantees matching RBI Integrated Ombudsman standards.",
    sections: [
      {
        heading: "1. PRIMARY HELP CHANNELS AND TICKET LOOPS",
        content: "DigiLend provides multiple channels for registering complaints:\n• App Ticket: Create support tickets directly in the support center panel.\n• Official Email: Send detailed compliance queries to grievance@digilend.in.\n• Telephone Line: Call our customer support at [GRIEVANCE_OFFICER_PHONE] during business hours."
      },
      {
        heading: "2. RESOLUTION SLAs AND MILESTONES TIMELINE",
        content: "We commit to the following response and resolution timelines:\n• Ticket Acknowledgement: Provided within 24 hours of ticket creation.\n• Level 1 Resolutions (General Queries): Resolved within 3 business days.\n• Level 2 Technical Claims (Payments/KYC): Resolved within 7 business days.\n• Complex Audits (Identity Dispute): Resolved within a maximum window of 15 business days."
      },
      {
        heading: "3. ESCALATION MATRIX - LEVEL 1 TO LEVEL 3",
        content: "Our structured grievance redressal escalation pathways are as follows:\n• LEVEL 1: Contact our Customer Support team via the in-app chat or by email at support@digilend.in.\n• LEVEL 2 (Grievance Redressal Officer): If unresolved after 7 days, escalate directly to our Grievance Officer, [GRIEVANCE_REDRESSAL_OFFICER_NAME], at [GRIEVANCE_OFFICER_EMAIL] / [GRIEVANCE_OFFICER_PHONE].\n• LEVEL 3 (RBI Ombudsman): If unresolved after 30 days, customers can file disputes with the Reserve Bank of India's Integrated Ombudsman Scheme portal (cms.rbi.org.in)."
      }
    ]
  },
  {
    id: "aml-fraud-policy",
    title: "9. AML & Fraud Prevention Policy",
    category: "Operational",
    description: "Underpinning structures of Customer Identification (CDD), suspicious activities, and rate limiting rules.",
    sections: [
      {
        heading: "1. MANDATORY CUSTOMER DUE DILIGENCE (CDD)",
        content: "We perform comprehensive identity checks on all users. CDD processes involve verifying PAN credentials, validating residential address records via DigiLocker, and performing biometric liveness checks to prevent synthetic identity fraud."
      },
      {
        heading: "2. SUSPICIOUS TRANSACTION ACTIVITY SCANS (STR)",
        content: "Our monitoring systems scan transaction patterns (such as rapid successive payment attempts, repayments from multiple bank accounts, or access from high-risk locations) and flag anomalies for manual compliance review."
      },
      {
        heading: "3. LIMITS ON MULTI-DEVICE LOGIN AND IP RATINGS",
        content: "To prevent account hijacking and automated bot attacks, we restrict active logins to one active device per user, enforce API rate-limiting rules, and block access from high-risk IP ranges or emulator programs."
      }
    ]
  },
  {
    id: "responsible-lending",
    title: "10. Responsible Lending & Fair Collection Policy",
    category: "Legal",
    description: "Guidelines committing the platform to transparent rate listings and non-coercive ethical collector channels.",
    sections: [
      {
        heading: "1. TRANSPARENT PRICING & ZERO HIDDEN CHARGES",
        content: "We provide complete transparency regarding fee structures. All fees (including interest rates, processing fees, and GST charges) are clearly detailed in a standard Key Fact Statement (KFS) before loan agreements are signed."
      },
      {
        heading: "2. ETHICAL AND NON-COERCIVE COLLECTIONS",
        content: "We strictly prohibit harassment, intimidation, or coercive tactics. Our collection agents are trained to communicate respectfully. Contact is restricted to business hours (08:00 AM to 07:00 PM IST) and must comply with RBI regulations."
      },
      {
        heading: "3. COMPREHENSIVE INDEBTEDNESS CHECKUPS",
        content: "To support responsible borrowing and prevent debt traps, we evaluate borrowers' debt-to-income ratios and check outstanding loans before approving new credit lines."
      }
    ]
  },
  {
    id: "about-us",
    title: "11. Corporate About Us Page",
    category: "Operational",
    description: "Enterprise description, licensed platform overview, values, and NBFC partnerships listing.",
    sections: [
      {
        heading: "1. THE DIGILEND MISSION PLAN",
        content: "DigiLend is an innovative instant digital micro-lending platform in India. Our mission is to provide accessible, transparent, and immediate credit lines to under-banked individuals, helping them manage short-term cash flows, digital payments, and household expenses."
      },
      {
        heading: "2. TRUSTWORTHY RBI REGULATED CREDIT INFRASTRUCTURE",
        content: "We operate in partnership with RBI-licensed NBFCs, including [NBFC_PARTNER_NAME], ensuring that all digital credit lines are underwritten and disbursed in compliance with financial regulations and fair practice codes."
      }
    ]
  },
  {
    id: "contact-us",
    title: "12. Contact Corporate Page",
    category: "Operational",
    description: "Physical addresses, active business hours, email destinations and rapid customer maps coordinates.",
    sections: [
      {
        heading: "1. GEOGRAPHIC CORRESPONDENCE ADDRESS",
        content: "• Corporate Headquarters: DigiLend Compliance Offices, [Registered Office Address].\n• CIN Identifications: [CIN Number]\n• GST Identification: [GST Number]"
      },
      {
        heading: "2. SECURE EMAIL ROUTES & WEB LINKS",
        content: "• Customer Complaints: support@digilend.in\n• Grievance Escalations: grievance@digilend.in\n• Technical Support Helpline: developers@digilend.in\n• Official Corporate Web Portal: https://digilend.in"
      },
      {
        heading: "3. OPERATIONAL HOURS",
        content: "• Customer Support Operating Window: Monday to Friday, 09:00 AM to 06:00 PM IST (excluding national holidays)."
      }
    ]
  },
  {
    id: "faq-hub",
    title: "13. Complete FAQ Hub (30 Questions)",
    category: "App-Store",
    description: "Structured FAQ page with 30 key questions covering Onboarding, KYC, Disbursements, Payments, and Safety.",
    sections: [
      {
        heading: "1. REGISTRATION & ONBOARDING (FAQs 1-6)",
        content: "Q1. Who is eligible to apply for instant credit lines on DigiLend?\nAny Indian resident citizen aged 18 or older, earning a stable monthly salary, and holding an active PAN, Aadhaar, and bank account.\n\nQ2. Why is my mobile number required?\nWe use your mobile number as your primary account identifier and to send secure OTP messages for logins.\n\nQ3. What if I do not receive my login SMS validation code?\nEnsure you have steady cellular coverage, are not on a DND (Do Not Disturb) list, and retry. If issues persist, contact our support team.\n\nQ4. Can I create multiple accounts using different mobile numbers?\nNo. Accounts are mapped to your unique combination of PAN and mobile number. Creating multiple registrations is blocked.\n\nQ5. Is a physical signature required to activate a loan?\nNo. Registration is completely digital. We use secure Aadhaar-linked e-Signatures to verify and sign loan agreements instantly.\n\nQ6. Can I complete registration through a web browser instead of the mobile app?\nRegistration requires device-level security verification and a selfie capture. We recommend completing the process on our mobile app or web portal."
      },
      {
        heading: "2. REGULATORY KYC AUDITS (FAQs 7-12)",
        content: "Q7. What documents are needed to complete verification on DigiLend?\nYou only need your Permanent Account Number (PAN) and Aadhaar number. No physical paperwork is required.\n\nQ8. Why does DigiLend require a selfie capture?\nWe capture a live selfie to verify biometric existence and perform instant comparisons with your PAN tax ID card photo, preventing identity fraud.\n\nQ9. How does DigiLend verify my residential address?\nWe link securely with your authorized DigiLocker account to retrieve and verify UIDAI address records.\n\nQ10. What if my bank holder's name doesn't match my PAN card name?\nOur systems will flag the discrepancy for manual review. We require bank account holder names to match your PAN registration details.\n\nQ11. Is my biometric data stored permanently on DigiLend servers?\nNo. We do not store biometric templates or raw Aadhaar files. Selfie captures are processed securely and stored as encrypted reference images.\n\nQ12. What happens if my PAN details are rejected?\nEnsure your entry matches your physical PAN tax card exactly. If rejections persist, please contact support for manual underwriting assistance."
      },
      {
        heading: "3. CREDIT EVALUATION & PRINCIPAL OFFERS (FAQs 13-18)",
        content: "Q13. How does DigiLend evaluate my credit eligibility limit?\nWe assess eligibility using variables such as CIBIL credit score benchmarks, bank-matched salary details, and historical repayment records.\n\nQ14. Why is my maximum eligible limit lower than requested?\nInitial limits are set conservatively to support responsible borrowing. Limits increase as you complete successful, on-time repayments.\n\nQ15. Can I increase my CIBIL credit score on DigiLend?\nYes. We report repayment histories to major credit bureaus. Completing repayments on time can help improve your overall credit score.\n\nQ16. What is a Key Fact Statement (KFS)?\nA Key Fact Statement (KFS) is a standardized document detailing the exact loan terms, including processing fees, interest rates, and APR.\n\nQ17. Does applying for credit on DigiLend impact my credit score?\nInitial eligibility checks use soft inquiries that do not affect your credit score. Hard inquiries are made when a loan is finalized.\n\nQ18. Can I cancel a loan after signing the e-Sign verification step?\nOnce e-Signed, loan disbursement processes start immediately. However, you can utilize the 3-day Cooling-Off window to repay the principal with zero fees."
      },
      {
        heading: "4. DISBURSEMENT & BANK ROUTES (FAQs 19-24)",
        content: "Q19. How long does it take for funds to reach my bank account?\nFunds are typically disbursed within minutes via instant IMPS clearing. Intermittent network delays at partner banks may take up to 2 hours.\n\nQ20. What is a bank Penny Drop verification?\nWe send a secure ₹1.00 transaction to your bank account to verify active status and ensure recipient name alignment.\n\nQ21. Can I disburse funds to a third-party bank account?\nNo. Funds must be disbursed to a verified banking account belonging to the registered applicant, helping prevent laundering risks.\n\nQ22. What if my loan is marked 'Disbursed' but I haven't received the money?\nCheck if your bank is experiencing processing issues. If funds do not appear within 2 hours, share the transaction ID with support to locate the record.\n\nQ23. Why was my approved loan cancelled before disbursement?\nDisbursals may be halted if fraud indicators are triggered, or if partner clearing houses report issues with recipient bank accounts.\n\nQ24. What modes of transfer does DigiLend use for payouts?\nAll payouts are processed through secure digital IMPS, NEFT, or UPI channels via integrated RazorpayX payout systems."
      },
      {
        heading: "5. REPAYMENT CHECKOUTS (FAQs 25-30)",
        content: "Q25. How do I repay my outstanding loan balance?\nYou can repay outstanding balances directly in the app using UPI, Net Banking, or Debit Cards via our secure Razorpay gateway.\n\nQ26. Does DigiLend support automated repayments?\nYes. We support setting up secure Automated Clearing House (e-NACH) mandates to automatically clear installments on due dates.\n\nQ27. What happens if I miss my repayment due date?\nA 3-day grace period applies. Late penalties of 0.12% per day apply starting on day 4. Late histories are reported to credit bureaus.\n\nQ28. Can I repay my loan early, and are there prepayment charges?\nYes, you can prepay outstanding balances at any point before the due date, with zero pre-closure fees or hidden interest penalties.\n\nQ29. What security measures protect my payment transactions?\nAll payments are processed through Razorpay's secure, PCI-DSS compliant payment rails with TLS 1.3 encryption.\n\nQ30. What should I do if a repayment is debited but my loan status is not updated?\nAvoid creating duplicate payments. Shared bank debit receipts can be sent to support to assist with manual ledger reconciliation."
      }
    ]
  },
  {
    id: "app-store-compliance",
    title: "14. App Store & Google Play Review Details",
    category: "App-Store",
    description: "App Store description metadata, short summaries, permissions rationale statements, and safety items.",
    sections: [
      {
        heading: "1. SHORT COMPLIANT DESCRIPTION",
        content: "DigiLend offers instant digital credit lines and flexible personal loans in India. Enjoy a fully digital journey, quick verification, and secure disbursements."
      },
      {
        heading: "2. HIGH CONTEXT LONG DESCRIPTION",
        content: "DigiLend is a modern, digital micro-lending app designed for salaried professionals in India. Partnering with licensed NBFCs like [NBFC_PARTNER_NAME], we provide secure and immediate financing options to help manage short-term cash flows.\n\nKey Highlights:\n• Credit Limits: ₹5,000 to ₹50,000\n• Flexible Tenures: 30 days to 90 days\n• Annual Interest Rates (APR): 18% to 36% based on profile risk\n• Fast digital processing with zero physical paperwork requirements.\n• Seamless repayment options via integrated UPI, debit cards, and e-NACH auto-debit plans."
      },
      {
        heading: "3. COMPREHENSIVE PRIVACY SUMMARY SHIELD",
        content: "DigiLend is committed to protecting patient data privacy and complies with RBI's digital lending guidelines. We do not access contacts, personal files, call logs, or media files. Data is stored on secure cloud servers with robust AES-256 encryption."
      },
      {
        heading: "4. SYSTEM APP PERMISSIONS JUSTIFICATIONS",
        content: "• ACCESS_COARSE_LOCATION (Coarse Location): Required to verify user location within India and detect suspicious remote access.\n• CAMERA: Required to capture a live selfie during KYC verification for identity check and liveness checks.\n• READ_SMS (Transactional SMS): Used to analyze transaction alerts and assess credit eligibility. No personal messages are read."
      }
    ]
  },
  {
    id: "website-footer",
    title: "15. Corporate Compliance & Footer Content",
    category: "App-Store",
    description: "Legal disclaimers, license information, co-branded NBFC details, and quick regulatory footer assets.",
    sections: [
      {
        heading: "1. CO-BRANDED NBFC PARTNERS DISCLOSURE TEXT",
        content: "DigiLend is a digital technology platform operated as an LSP for its principal licensed partner, [NBFC_PARTNER_NAME], an RBI-regulated NBFC holding CoR License No. [NBFC_COR_LICENSE_NUMBER]."
      },
      {
        heading: "2. MANDATORY STATUTORY COMPLIANCE LINES",
        content: "All interest calculations, fees, and collection practices comply with the RBI Fair Practices Code. We do not secure upfront fees for evaluating eligibility limits, or charge hidden prepayment penalties."
      },
      {
        heading: "3. TRADEMARKS & LEGAL LINKS METADATA",
        content: "© 2026 DigiLend Technologies. All rights reserved. • CIN Number: [CIN Number] • Registered Address: [Registered Office Address].\nQuick Links: Privacy Policy | Terms & Conditions | Fair Practices | Grievance escalation | FAQ Portal."
      }
    ]
  }
];
