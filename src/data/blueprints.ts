export const DATABASE_SCHEMA_BLUEPRINT = `
-- DigiLend Cloud PostgreSQL Schema Definition
-- Production Ready Multi-Tenant Relational Database

CREATE TYPE kyc_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE loan_status AS ENUM ('APPLIED', 'APPROVED', 'DISBURSED', 'REPAID', 'CLOSED', 'OVERDUE');
CREATE TYPE notification_type AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'CRITICAL');

CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    phone_number VARCHAR(16) UNIQUE NOT NULL,
    full_name VARCHAR(128),
    email VARCHAR(128) UNIQUE,
    dob DATE,
    gender VARCHAR(16),
    occupation VARCHAR(64),
    employment_type VARCHAR(32),
    monthly_income NUMERIC(15, 2) DEFAULT 0.00,
    credit_score INT DEFAULT 600,
    max_eligible_limit NUMERIC(15, 2) DEFAULT 5000.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE kyc_records (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    pan_number VARCHAR(10) UNIQUE,
    is_digilocker_verified BOOLEAN DEFAULT FALSE,
    aadhaar_address TEXT,
    selfie_url TEXT,
    status kyc_status DEFAULT 'PENDING',
    verified_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bank_accounts (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    account_number VARCHAR(32) NOT NULL,
    ifsc_code VARCHAR(11) NOT NULL,
    bank_name VARCHAR(64) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    penny_drop_status VARCHAR(32) DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE loans (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id),
    amount NUMERIC(15, 2) NOT NULL,
    interest_rate_monthly NUMERIC(5, 2) NOT NULL DEFAULT 2.50,
    processing_fee NUMERIC(15, 2) NOT NULL,
    gst_fee NUMERIC(15, 2) NOT NULL,
    tenure_days INT NOT NULL,
    net_disbursal NUMERIC(15, 2) NOT NULL,
    repayment_amount NUMERIC(15, 2) NOT NULL,
    outstanding_balance NUMERIC(15, 2) NOT NULL,
    status loan_status DEFAULT 'APPLIED',
    due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    agreement_url VARCHAR(256)
);

CREATE TABLE repayments (
    id VARCHAR(64) PRIMARY KEY,
    loan_id VARCHAR(64) REFERENCES loans(id),
    amount_paid NUMERIC(15, 2) NOT NULL,
    payment_method VARCHAR(64) NOT NULL,
    transaction_reference VARCHAR(128) UNIQUE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id),
    title VARCHAR(128) NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tickets (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id),
    subject VARCHAR(128) NOT NULL,
    status VARCHAR(16) DEFAULT 'OPEN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ticket_messages (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(64) REFERENCES tickets(id) ON DELETE CASCADE,
    sender VARCHAR(16) CHECK (sender IN ('USER', 'SUPPORT', 'AI_ASSISTANT')),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;

export const FLUTTER_ARCH_BLUEPRINT = `
// DigiLend Mobile Scaffold - Clean Architecture Core & GoRouter Setup
// State Management: Riverpod (Notifier & ConsumerStatefulWidget)

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

// 1. Theming Setup
final themeProvider = StateProvider<ThemeMode>((ref) => ThemeMode.light);

final lightTheme = ThemeData(
  primaryColor: Color(0xFFFF7A00),
  scaffoldBackgroundColor: Color(0xFFF8FAFC),
  colorScheme: ColorScheme.light(
    primary: Color(0xFFFF7A00),
    secondary: Color(0xFF0B1F4D),
    surface: Colors.white,
    onPrimary: Colors.white,
    error: Color(0xFFEF4444),
  ),
  fontFamily: 'Inter',
  textTheme: TextTheme(
    displayLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFF111827)),
    bodyMedium: TextStyle(fontSize: 16, color: Color(0xFF6B7280)),
  )
);

final darkTheme = ThemeData(
  primaryColor: Color(0xFFFF7A00),
  scaffoldBackgroundColor: Color(0xFF08111F),
  colorScheme: ColorScheme.dark(
    primary: Color(0xFFFF7A00),
    secondary: Color(0xFF12233D),
    surface: Color(0xFF12233D),
    onPrimary: Colors.white,
    error: Color(0xFFEF4444),
  ),
  fontFamily: 'Inter',
);

// 2. GoRouter Configuration
final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/splash',
    routes: [
      GoRoute(path: '/splash', builder: (context, state) => SplashScreen()),
      GoRoute(path: '/onboarding', builder: (context, state) => OnboardingScreen()),
      GoRoute(path: '/auth', builder: (context, state) => AuthScreen()),
      GoRoute(path: '/kyc', builder: (context, state) => KYCScreen()),
      GoRoute(path: '/bank-link', builder: (context, state) => BankLinkScreen()),
      GoRoute(path: '/dashboard', builder: (context, state) => DashboardScreen()),
      GoRoute(path: '/apply-loan', builder: (context, state) => ApplyLoanScreen()),
      GoRoute(path: '/repayments', builder: (context, state) => RepaymentsScreen()),
      GoRoute(path: '/live-chat', builder: (context, state) => LiveChatScreen()),
    ],
  );
});

// 3. User & Loan Riverpod State Providers
class UserProfileState extends StateNotifier<AsyncValue<UserProfile?>> {
  UserProfileState() : super(const AsyncValue.loading());
  
  void fetchUserProfile() async {
    // API Call through secure remote clients
  }
}
`;

export const DEVOPS_BLUEPRINT = `
# DevOps Deployment Architecture
# Kubernetes Ingress, Gateway Routing, and clickhouse analytics pipeline

apiVersion: apps/v1
kind: Deployment
metadata:
  name: digilend-api-gateway
  namespace: fintech-prod
spec:
  replicas: 3
  selector:
    matchLabels:
      app: digilend-api-gateway
  template:
    metadata:
      labels:
        app: digilend-api-gateway
    spec:
      containers:
      - name: gateway
        image: digilend/api-gateway:v2.4.0
        ports:
        - containerPort: 8080
        envFrom:
        - secretRef:
            name: prod-fintech-secrets
        resources:
          limits:
            cpu: "1"
            memory: 1Gi
          requests:
            cpu: "0.5"
            memory: 512Mi
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: digilend-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/limit-connections: "20"
    nginx.ingress.kubernetes.io/limit-rate: "512k"
spec:
  ingressClassName: nginx
  rules:
  - host: api.digilend.tech
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: digilend-api-gateway
            port:
              number: 80
`;

export const API_DOCS = [
  {
    method: "POST",
    path: "/api/users/save",
    desc: "Register or update full KYC user profile details",
    body: `{
  "phone": "+919876543210",
  "fullName": "Aniket Sharma",
  "dob": "1994-04-12",
  "email": "aniket@gmail.com",
  "occupation": "Software Developer"
}`,
    response: `{
  "success": true,
  "user": { "id": "usr-123", "creditScore": 650, "maxEligibleAmount": 10000 }
}`
  },
  {
    method: "POST",
    path: "/api/gemini/credit-scoring",
    desc: "AI Micro-Risk Assessment Analyzer extracting metrics from copy pasted banking text notification logs",
    body: `{
  "userId": "usr-123",
  "smsLogsText": "Salary of Rs 85,000 credited on 01-06-2026. EMI payment of Rs 12,000 paid to HDFC."
}`,
    response: `{
  "success": true,
  "report": {
    "eligibilityScore": 790,
    "riskGrade": "A++",
    "estimatedIncome": 85000,
    "repaymentProbability": 96,
    "anomalies": ["Demonstrated high income-to-multiplier stability.", "Verified clear regular utility credits."]
  }
}`
  },
  {
    method: "POST",
    path: "/api/loans/apply",
    desc: "Submit loan request & calculate fee metrics like Net Disbursal, GST and interest tenures",
    body: `{
  "userId": "usr-123",
  "amount": 15000,
  "tenureDays": 30
}`,
    response: `{
  "success": true,
  "loan": {
    "id": "lon-456",
    "netDisbursal": 14469,
    "repaymentAmount": 15375,
    "dueDate": "2026-07-07"
  }
}`
  }
];
