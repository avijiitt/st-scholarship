# 🏛️ National Tribal Scholarship Portal (NTSP)
### राष्ट्रीय जनजातीय छात्रवृत्ति एवं अध्येतावृत्ति पोर्टल
> **Ministry of Tribal Affairs (MoTA) • Government of India**  
> *Developed & Maintained by [@avijiitt](https://github.com/avijiitt)*

[![GIGW 3.0 Compliant](https://img.shields.io/badge/GIGW-3.0_Compliant-00531b?style=for-the-badge&logo=shield)](https://github.com/avijiitt/st-scholarship)
[![DBT PFMS Enabled](https://img.shields.io/badge/DBT-PFMS_Direct_Credit-a04100?style=for-the-badge&logo=cashapp)](https://github.com/avijiitt/st-scholarship)
[![DigiLocker Synced](https://img.shields.io/badge/DigiLocker-e--KYC_Verified-00183b?style=for-the-badge&logo=cloudflare)](https://github.com/avijiitt/st-scholarship)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

## 📌 Overview

The **National Tribal Scholarship Portal (NTSP)** is a comprehensive, centralized digital platform designed to streamline educational grants, national research fellowships, and overseas scholarships for Scheduled Tribe (ST) scholars across India.

Backed by **DigiLocker e-KYC**, **NPCI Aadhaar Payment Bridge**, and **PFMS (Public Financial Management System)**, the portal delivers a zero-leakage, 100% paperless Direct Benefit Transfer (DBT) experience.

---

## ✨ Key Features & Capabilities

- 🎓 **Flagship Tribal Schemes**:
  - **National Overseas Scholarship (NOS)**: 100% funding for Master's and Ph.D. scholars at QS Top 500 Global Universities (e.g., University of Oxford).
  - **National Fellowship for ST Students (NFST)**: Monthly doctoral research stipend of ₹38,000 + HRA for Indian Universities (IITs, NITs, Central/State Universities).
  - **Post-Matric Scholarship (PMS-ST)**: State & Central fee waivers and maintenance allowances for undergraduate & diploma scholars.
- 🔄 **6-Step Interactive Application Wizard**:
  - **Step 1: Personal Details** (Aadhaar demographic sync, address, contact).
  - **Step 2: Category & Tribe** (Article 342 ST certificate validation, PVTG / PwD indicators).
  - **Step 3: Academic Qualifications** (Dual-track switcher, QS ranking validator, offer letter verification).
  - **Step 4: Financial & DBT Details** (Income certificate verification, NPCI Aadhaar bank mapper, Penny-Drop auth).
  - **Step 5: Document Uploads** (DigiLocker certified vault integration).
  - **Step 6: Review & Final Submission** (Pre-submission PDF preview modal, IPC legal declaration, and permanent reference generation).
- 📊 **Multi-Role Experience**:
  - **Public Portal**: Information ticker, Gazette schedule, FAQ accordion, scheme finder.
  - **Scholar Workspace**: Application dashboard, profile management, live timeline tracking, and deficiency response desk.
  - **Nodal Officer Admin Console**: Intake metrics, candidate queue, document scrutiny, deficiency raising, and committee routing.
- ♿ **GIGW 3.0 Accessibility**:
  - Dynamic font scaling (`A-`, `A`, `A+`).
  - High-contrast mode toggle for low-vision scholars.
  - Screen reader & keyboard navigable (`Skip to Main Content`).

---

## 🗺️ Portal Route Map

### 🌐 Public Routes
| Route | Description |
|---|---|
| `/` | Portal landing page with announcements, highlights & stats |
| `/login` | Scholar login (OTR or Aadhaar OTP) |
| `/register` | One-Time Registration (OTR) with Aadhaar e-KYC |
| `/schemes` | All Central Tribal Scholarships directory |
| `/schemes/nos` | National Overseas Scholarship guidelines & eligibility |
| `/schemes/nfst` | National Fellowship (NFST) domestic doctoral guidelines |

### 👨‍🎓 Applicant Workspace
| Route | Description |
|---|---|
| `/applicant/dashboard` | Scholar dashboard with draft resumption & alerts |
| `/applicant/profile` | Personal verified demographic dossier |
| `/application/new` | Scheme selection wizard |
| `/application/personal` | Wizard Step 1: Personal Information |
| `/application/academic` | Wizard Step 2: Academic & University Credentials |
| `/application/financial` | Wizard Step 3: Income & Aadhaar Bank Seeding |
| `/application/documents` | Wizard Step 4: DigiLocker Document Vault |
| `/application/review` | Wizard Step 5: Pre-submission Review & PDF preview |
| `/application/success` | Wizard Step 6: Official Acknowledgement Receipt |
| `/application/track` | Live 5-stage PFMS DBT tracking timeline |
| `/application/deficiency` | Deficiency Rectification Desk for officer queries |

### 🛡️ Administrative Console
| Route | Description |
|---|---|
| `/admin/login` | MoTA Nodal Officer authenticated portal |
| `/admin/dashboard` | Administrative overview, queue metrics & stats |
| `/admin/applications` | Applications scrutiny queue with filtering |
| `/admin/applications/:id`| Comprehensive dossier review & action gateway |
| `/admin/schemes` | Scheme quota management & cutoff deadlines |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
- Python 3.8+ (or any static HTTP server)

### 1. Clone the Repository
```bash
git clone https://github.com/avijiitt/st-scholarship.git
cd st-scholarship
```

### 2. Start the Local Server
```bash
python server.py
```
*Or using Python's built-in module:*
```bash
python -m http.server 8000
```

### 3. Open in Browser
Visit [**http://localhost:8000/**](http://localhost:8000/)

---

## ⚡ Supabase Authentication Integration

The portal is integrated with **Supabase Auth** for applicant identity management and access control:

- **Project URL**: `https://pnxgaiqdrpmqnahwopuq.supabase.co`
- **Client Key**: Public publishable key (no secret service-role key in frontend code)
- **Features Implemented**:
  - 📝 **Applicant Registration**: Real-time sign up with email and password (`window.supabaseRegister`).
  - 🔐 **Applicant Login**: Authenticates via `window.supabaseLogin` with active session management.
  - 🚪 **Applicant Logout**: Securely signs out scholars and resets local application session state.
  - 🛡️ **Route Protection**: Unauthenticated access to `/applicant/*` and `/application/*` routes automatically redirects to `#/login`.
  - ⚠️ **Resilient Status & Alert Handling**: User-friendly alerts for Supabase email confirmation requirements and rate limits, with immediate prototype demo fallback.

---

## 🔑 Prototype Demo Credentials

| Role | Email / ID | Password | Access Route |
|---|---|---|---|
| **Scholar (Supabase / Demo)** | `student@demo.com` | `student123` | [`#/login`](http://localhost:8000/#/login) |
| **MoTA Nodal Officer** | `admin@mota.gov.in` | `admin123` | [`#/admin/login`](http://localhost:8000/#/admin/login) |

---

## 🏗️ Project Architecture

```
st-scholarship/
├── index.html         # Master SPA entry point & dynamic layout container
├── supabase.js        # Supabase Auth client integration (CDN SDK v2)
├── app.js             # View controllers, application screens & action handlers
├── router.js          # Client-side SPA router with route guards & layouts
├── store.js           # State management & persistent mock database (localStorage)
├── shared.js          # Accessibility utilities (GIGW 3.0), search & toast alerts
├── styles.css         # Custom typography, print stylesheets & high-contrast mode
├── server.py          # Python SPA fallback server (port 8000)
├── .gitignore         # Git ignore rules
└── README.md          # Comprehensive documentation
```

---

## 📜 Compliance & Guidelines

- **GIGW 3.0 Compliant**: Adheres to Guidelines for Indian Government Websites released by MeitY / NIC.
- **Section 7 Aadhaar Act 2016**: Direct benefit transfers executed via NPCI Aadhaar Mapper.
- **PFMS Integration Ready**: Schema adheres to Public Financial Management System standards.

---

## 👤 Author & Maintainer

**Avijiit Satapathy** ([@avijiitt](https://github.com/avijiitt))  
GitHub: [https://github.com/avijiitt/st-scholarship](https://github.com/avijiitt/st-scholarship)

---
*Dedicated to the empowerment of Scheduled Tribe youth through education and research excellence.*
