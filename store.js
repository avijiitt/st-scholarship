/**
 * National Tribal Scholarship Portal (NTSP - MoTA)
 * Central Application State, Mock Database & Validation Engine
 */

const INITIAL_APPLICATION = {
  id: "MOTA-NOS-2026-000124",
  draftId: "MOTA-NOS-2026-DRAFT-0492",
  scheme: "National Overseas Scholarship (NOS)",
  schemeCode: "NOS",
  status: "Draft", // Draft, Submitted, Under Document Scrutiny, Deficiency Raised, Committee Screening, Approved, Rejected
  submissionDate: null,
  lastUpdated: new Date().toISOString(),
  lastSavedStep: "/application/academic",

  personal: {
    fullName: "Priya Munda",
    dob: "1998-08-14",
    gender: "Female",
    mobile: "+91 98765 43210",
    email: "priya.munda@email.com",
    fatherName: "Shri Birsa Munda",
    motherName: "Smt. Shanti Munda",
    address: "Village Torpa, Khunti, Jharkhand - 835227",
    state: "Jharkhand",
    district: "Khunti",
    pincode: "835227",
    aadhaarVerified: true
  },

  category: {
    tribeName: "Munda (ST)",
    certNo: "JH/REV/ST/2022/984321",
    issuingAuthority: "SDM/Tehsildar, Khunti",
    issueDate: "2022-06-18",
    pvtg: "No",
    pwd: "No",
    digilockerVerified: true
  },

  academic: {
    courseLevel: "phd",
    hostCountry: "United Kingdom",
    university: "University of Oxford, United Kingdom",
    qsRank: "3",
    courseTitle: "DPhil in Plant Sciences and Ethno-botany",
    department: "Department of Biology & Linacre College",
    offerType: "unconditional",
    offerRef: "OX-INTL-2026-90412",
    sessionStart: "2026-10-01",
    tuitionQuoted: "£28,500 / annum",
    percentage: "74.60",
    cgpa: "8.2",
    qualifyingDegree: "M.Sc. Forestry & Env.",
    qualifyingUniversity: "Ranchi University",
    qualifyingYear: "2024",
    netRollNo: "JH042091"
  },

  financial: {
    annualIncome: "450000",
    incomeCertNo: "JH/INC/2024/761298",
    incomeAuthority: "Tehsildar, Khunti (खूंटी तहसील)",
    incomeDate: "2024-05-12",
    certHolder: "Shri Birsa Munda (Father / Legal Guardian)",
    bankName: "State Bank of India (SBI)",
    accountHolder: "Priya Munda",
    ifsc: "SBIN0001234",
    accountNumber: "XXXX XXXX 4521",
    branchName: "SBI Main Branch, Khunti, Jharkhand",
    npciSeeded: true,
    pennyDropStatus: "SUCCESS (INR 1.00)"
  },

  documents: [
    { id: "doc-st", type: "ST Certificate", name: "ST_Certificate.pdf", size: "1.4 MB", verified: true, date: "18-Jun-2022" },
    { id: "doc-inc", type: "Income Certificate", name: "Income_Cert_2024.pdf", size: "890 KB", verified: true, date: "12-May-2024" },
    { id: "doc-adm", type: "Admission / Offer Letter", name: "Oxford_Offer_Letter_Unconditional.pdf", size: "2.1 MB", verified: true, date: "15-Feb-2026" },
    { id: "doc-pass", type: "Passport Bio Pages", name: "Passport_Bio_Pages.pdf", size: "1.1 MB", verified: true, date: "Valid till 2032" },
    { id: "doc-marks", type: "Academic Transcripts", name: "Masters_Degree_Marksheets.pdf", size: "3.4 MB", verified: true, date: "DigiLocker Certified" }
  ],

  history: [
    { title: "Application Draft Created", time: "2026-03-25 10:15 IST", officer: "System", remark: "Initial draft profile populated from OTR registration." }
  ],

  deficiency: null
};

// Queue of applications for Admin Demo (Seeded with realistic candidate scenarios)
const INITIAL_ADMIN_APPLICATIONS = [
  {
    id: "MOTA-NOS-2026-000101",
    applicantName: "Priya Kumari",
    otrId: "OTR-2025-ST-109283",
    scheme: "National Overseas Scholarship (NOS)",
    schemeCode: "NOS",
    university: "University of Oxford, United Kingdom (QS #3)",
    degree: "Ph.D. Plant Sciences & Environmental Biology",
    income: "₹3,80,000",
    state: "Bihar",
    status: "Submitted",
    submissionDate: "25 Sep 2026 10:30 IST",
    riskScore: "Low (DigiLocker Verified)"
  },
  {
    id: "MOTA-NFST-2026-000204",
    applicantName: "Ramesh Gond",
    otrId: "OTR-2025-ST-294018",
    scheme: "National Fellowship for ST Students (NFST)",
    schemeCode: "NFST",
    university: "IIT Bombay",
    degree: "Ph.D. Metallurgy & Materials Engineering",
    income: "₹2,90,000",
    state: "Madhya Pradesh",
    status: "Deficiency Raised",
    submissionDate: "25 Sep 2026 14:15 IST",
    riskScore: "Medium (Income cert unclear)"
  },
  {
    id: "MOTA-NOS-2026-000305",
    applicantName: "Anita Kerketta",
    otrId: "OTR-2025-ST-381920",
    scheme: "National Overseas Scholarship (NOS)",
    schemeCode: "NOS",
    university: "Imperial College London, United Kingdom (QS #6)",
    degree: "M.Sc. Biomedical Engineering & Genetics",
    income: "₹4,20,000",
    state: "Jharkhand",
    status: "Provisionally Eligible",
    submissionDate: "24 Sep 2026 09:20 IST",
    riskScore: "Low (100% Attested)"
  },
  {
    id: "MOTA-PMS-2026-000412",
    applicantName: "Sanjay Oraon",
    otrId: "OTR-2025-ST-482019",
    scheme: "Post-Matric Scholarship for ST Students",
    schemeCode: "PMS",
    university: "Utkal University, Bhubaneswar",
    degree: "B.Sc. Computer Science (Hons)",
    income: "₹1,80,000",
    state: "Odisha",
    status: "Under Scrutiny",
    submissionDate: "26 Sep 2026 11:45 IST",
    riskScore: "Low"
  },
  {
    id: "MOTA-NFST-2026-000523",
    applicantName: "Meena Bhagat",
    otrId: "OTR-2025-ST-591024",
    scheme: "National Fellowship for ST Students (NFST)",
    schemeCode: "NFST",
    university: "NIT Raipur",
    degree: "Ph.D. Chemical Engineering",
    income: "₹8,50,000",
    state: "Chhattisgarh",
    status: "Rejected",
    submissionDate: "23 Sep 2026 16:10 IST",
    riskScore: "High (Income Exceeds Ceiling)"
  }
];

// App Store Class
class AppStore {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem("NTSP_APPLICATION")) {
      localStorage.setItem("NTSP_APPLICATION", JSON.stringify(INITIAL_APPLICATION));
    }
    // Refresh or set initial admin queue with verified demo records
    const storedQueue = localStorage.getItem("NTSP_ADMIN_QUEUE");
    if (!storedQueue || JSON.parse(storedQueue).length < 5) {
      localStorage.setItem("NTSP_ADMIN_QUEUE", JSON.stringify(INITIAL_ADMIN_APPLICATIONS));
    }
  }

  getApplication() {
    try {
      return JSON.parse(localStorage.getItem("NTSP_APPLICATION")) || INITIAL_APPLICATION;
    } catch {
      return INITIAL_APPLICATION;
    }
  }

  getApplicationById(id) {
    const mainApp = this.getApplication();
    if (mainApp.id === id || mainApp.application_number === id) return mainApp;
    const queue = this.getAdminQueue();
    const found = queue.find(q => q.id === id);
    if (found) {
      const isDeficiency = found.status === "Deficiency Raised" || found.status === "deficiency_raised";
      const isApproved = found.status === "Provisionally Eligible" || found.status === "provisionally_eligible" || found.status === "Approved";
      const isRejected = found.status === "Rejected" || found.status === "rejected";

      return {
        ...mainApp,
        id: found.id,
        application_number: found.id,
        scheme: found.scheme,
        schemeCode: found.schemeCode,
        status: found.status,
        submissionDate: found.submissionDate,
        submitted_at: found.submissionDate,
        risk_level: found.riskScore || "Low",
        personal: {
          ...mainApp.personal,
          fullName: found.applicantName,
          state: found.state
        },
        personal_details: {
          fullName: found.applicantName,
          state: found.state
        },
        profiles: {
          full_name: found.applicantName,
          state: found.state
        },
        academic: {
          ...mainApp.academic,
          university: found.university,
          courseTitle: found.degree
        },
        academic_details: {
          university: found.university,
          courseTitle: found.degree
        },
        financial: {
          ...mainApp.financial,
          annualIncome: (found.income || "").replace(/[^\d]/g, "") || "450000"
        },
        financial_details: {
          annualIncome: (found.income || "").replace(/[^\d]/g, "") || "450000"
        },
        deficiency: isDeficiency ? {
          document_type: "Annual Family Income Certificate",
          issue: "Document is unclear",
          remark: "Please upload a clear and latest income certificate.",
          description: "Please upload a clear and latest income certificate.",
          deadline: "2026-10-05"
        } : null,
        deficiencies: isDeficiency ? [{
          id: `def-${found.id}`,
          document_type: "Annual Family Income Certificate",
          issue: "Document is unclear",
          reason: "Document is unclear",
          description: "Please upload a clear and latest income certificate.",
          remark: "Please upload a clear and latest income certificate.",
          status: "open",
          deadline: "2026-10-05"
        }] : [],
        history: [
          { action: "submitted", status_from: "draft", status_to: "submitted", title: "Application Submitted", time: "25 Sep 2026", officer: found.applicantName, remark: "Candidate completed digital submission with e-declaration." },
          { action: "scrutiny_started", status_from: "submitted", status_to: "under_scrutiny", title: "Document Scrutiny Started", time: "26 Sep 2026", officer: "Shri Rajesh Kumar (Scrutiny Officer)", remark: "Verification started for tribal certificate and academic records." },
          ...(isDeficiency ? [
            { action: "deficiency_raised", status_from: "under_scrutiny", status_to: "deficiency_raised", title: "Income Certificate Deficiency Raised", time: "27 Sep 2026", officer: "Shri Rajesh Kumar (Scrutiny Officer)", remark: "Document is unclear: Please upload a clear and latest income certificate by 05 October 2026." }
          ] : []),
          ...(isApproved ? [
            { action: "provisionally_eligible", status_from: "under_scrutiny", status_to: "provisionally_eligible", title: "Provisionally Eligible (अनुमोदित)", time: "27 Sep 2026", officer: "Shri Rajesh Kumar (Scrutiny Officer)", remark: "All documents attested and verified. Forwarded for committee screening." }
          ] : []),
          ...(isRejected ? [
            { action: "rejected", status_from: "under_scrutiny", status_to: "rejected", title: "Application Rejected", time: "27 Sep 2026", officer: "Shri Rajesh Kumar (Scrutiny Officer)", remark: "Income certificate indicates annual family income of ₹8.5 Lakhs exceeding the ₹6.0 Lakhs ceiling." }
          ] : [])
        ]
      };
    }
    return mainApp;
  }

  saveApplication(appData) {
    appData.lastUpdated = new Date().toISOString();
    localStorage.setItem("NTSP_APPLICATION", JSON.stringify(appData));
    
    // Also sync to admin queue if this application exists there, or add if newly submitted
    const queue = this.getAdminQueue();
    const idx = queue.findIndex(q => q.id === appData.id);
    if (idx !== -1) {
      queue[idx].status = appData.status;
      queue[idx].submissionDate = appData.submissionDate || queue[idx].submissionDate;
      this.saveAdminQueue(queue);
    } else if (appData.status !== "Draft") {
      queue.unshift({
        id: appData.id,
        applicantName: appData.personal.fullName,
        otrId: appData.otrId || "OTR-2025-ST-884129",
        scheme: appData.scheme,
        schemeCode: appData.schemeCode || "NOS",
        university: appData.academic.university,
        degree: appData.academic.courseTitle,
        income: `₹${appData.financial.annualIncome}`,
        state: appData.personal.state,
        status: appData.status,
        submissionDate: appData.submissionDate || new Date().toLocaleString("en-IN"),
        riskScore: "Low (Verified via DigiLocker)"
      });
      this.saveAdminQueue(queue);
    }
  }

  updateSection(section, values) {
    const app = this.getApplication();
    app[section] = { ...app[section], ...values };
    this.saveApplication(app);
    return app;
  }

  getAdminQueue() {
    try {
      return JSON.parse(localStorage.getItem("NTSP_ADMIN_QUEUE")) || INITIAL_ADMIN_APPLICATIONS;
    } catch {
      return INITIAL_ADMIN_APPLICATIONS;
    }
  }

  saveAdminQueue(queue) {
    localStorage.setItem("NTSP_ADMIN_QUEUE", JSON.stringify(queue));
  }

  getAuthUser() {
    try {
      return JSON.parse(localStorage.getItem("NTSP_AUTH_USER"));
    } catch {
      return null;
    }
  }

  setAuthUser(user) {
    if (!user) {
      localStorage.removeItem("NTSP_AUTH_USER");
    } else {
      localStorage.setItem("NTSP_AUTH_USER", JSON.stringify(user));
    }
  }

  logout() {
    localStorage.removeItem("NTSP_AUTH_USER");
  }

  resetApplication() {
    localStorage.setItem("NTSP_APPLICATION", JSON.stringify(INITIAL_APPLICATION));
    return INITIAL_APPLICATION;
  }

  // --- FEATURE 1: Scholarship Readiness Score ---
  getReadinessScore() {
    const app = this.getApplication();
    const items = [];
    let score = 0;

    // 1. ST Certificate
    const hasSt = (app.documents || []).some(d => (d.type || d.name || '').toLowerCase().includes('st') || (d.type || '').includes('Caste')) || (app.category && app.category.certNo);
    if (hasSt) {
      score += 25;
      items.push({ label: "ST Caste Certificate verified", passed: true, key: "st_cert", step: "/application/category" });
    } else {
      items.push({ label: "ST Caste Certificate missing / unverified", passed: false, key: "st_cert", step: "/application/category" });
    }

    // 2. Income Certificate
    const hasInc = (app.documents || []).some(d => (d.type || d.name || '').toLowerCase().includes('income')) || (app.financial && app.financial.annualIncome);
    if (hasInc) {
      score += 20;
      items.push({ label: "Income Certificate valid (Within scheme ceiling)", passed: true, key: "income_cert", step: "/application/financial" });
    } else {
      items.push({ label: "Income Certificate not uploaded", passed: false, key: "income_cert", step: "/application/financial" });
    }

    // 3. Bank Account & Aadhaar NPCI Seeding
    const isBankSeeded = app.financial && (app.financial.npciSeeded === true || app.financial.accountNumber);
    if (isBankSeeded) {
      score += 20;
      items.push({ label: "Bank Account verified & NPCI Aadhaar-seeded", passed: true, key: "bank_npci", step: "/application/financial" });
    } else {
      items.push({ label: "Bank account unverified / NPCI seeding pending", passed: false, key: "bank_npci", step: "/application/financial" });
    }

    // 4. Academic Criteria
    const hasAcad = app.academic && (app.academic.qualifyingDegree || app.academic.university || app.academic.percentage);
    if (hasAcad) {
      score += 20;
      items.push({ label: "Academic marks & course details validated", passed: true, key: "academic", step: "/application/academic" });
    } else {
      items.push({ label: "Academic details incomplete", passed: false, key: "academic", step: "/application/academic" });
    }

    // 5. Personal Credentials
    const isPers = app.personal && app.personal.fullName && (app.personal.aadhaarVerified || app.personal.mobile);
    if (isPers) {
      score += 15;
      items.push({ label: "Aadhaar e-KYC & Personal details verified", passed: true, key: "personal", step: "/application/personal" });
    } else {
      items.push({ label: "Personal e-KYC pending", passed: false, key: "personal", step: "/application/personal" });
    }

    return {
      score: Math.min(100, score),
      items: items,
      isReady: score >= 90
    };
  }

  // --- FEATURE 2: "Why Am I Eligible?" Reasoner ---
  getSchemeEligibility(scheme) {
    const app = this.getApplication();
    const code = (scheme.code || "").toUpperCase();
    const incomeVal = app?.financial?.annualIncome ? parseInt(String(app.financial.annualIncome).replace(/[^0-9]/g, ""), 10) : 450000;
    
    const reasons = [];
    const failingReasons = [];

    // Category
    if (app?.category?.tribeName || app?.category?.certNo) {
      reasons.push("You belong to a recognized Scheduled Tribe (ST) community under Article 342.");
    } else {
      failingReasons.push("Valid ST Certificate is required for this scheme.");
    }

    // Income
    let incomeCap = 600000;
    if (code.includes("PMS") || code.includes("PRE")) {
      incomeCap = 250000;
    }
    if (incomeVal <= incomeCap) {
      reasons.push(`Your annual family income (₹${incomeVal.toLocaleString('en-IN')}) is below the scheme ceiling of ₹${incomeCap.toLocaleString('en-IN')}.`);
    } else {
      failingReasons.push(`Your annual family income (₹${incomeVal.toLocaleString('en-IN')}) exceeds the ceiling limit of ₹${incomeCap.toLocaleString('en-IN')}.`);
    }

    // Course & Academic Criteria
    if (code.includes("NOS")) {
      reasons.push("Enrolled in Master's / Ph.D. degree at a recognized QS Top 500 Global University abroad.");
      reasons.push("Candidate age is below 35 years as per Ministry guidelines.");
    } else if (code.includes("NFST")) {
      reasons.push("Admitted into regular, full-time M.Phil / Ph.D. research in recognized Indian universities / IITs / NITs.");
      reasons.push("Cleared UGC-NET or CSIR-NET research fellowship criteria.");
    } else if (code.includes("PRE")) {
      reasons.push("Enrolled as a regular full-time student in Class IX or X in a recognized Government/Board secondary school.");
      reasons.push("Entitled to Day Scholar (₹3,000/yr) or Hosteller (₹6,250/yr) financial maintenance stipend.");
    } else if (code.includes("UGC")) {
      reasons.push("Enrolled in 1st year of regular full-time PG professional degree (ME/M.Tech, MBA, MCA, M.Pharm, LLM).");
      reasons.push("Institution recognized under Section 2(f) and 12(B) of UGC Act.");
    } else {
      reasons.push("Enrolled in an accredited higher secondary, diploma, undergraduate, or postgraduate degree college.");
    }

    return {
      eligible: failingReasons.length === 0,
      reasons,
      failingReasons
    };
  }

  // --- FEATURE 4: Scholarship Planning Calendar ---
  getScholarshipCalendar() {
    const now = new Date();
    const todayStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    return [
      {
        id: "cal-today",
        title: "Today's Status",
        dateStr: todayStr,
        status: "active",
        type: "milestone",
        description: "Scholarship portal synchronized. All documents securely stored in vault."
      },
      {
        id: "cal-income-renewal",
        title: "Income Certificate Renewal Window",
        dateStr: "31 Mar 2026",
        daysLeft: 3,
        status: "action_required",
        type: "alert",
        description: "Ensure Revenue Authority income certificate is updated for FY 2025-26."
      },
      {
        id: "cal-app-deadline",
        title: "Central Scheme Application Window Closes",
        dateStr: "31 Oct 2026",
        daysLeft: 216,
        status: "upcoming",
        type: "deadline",
        description: "National cutoff date for electronic submission across all state & central scholarship schemes."
      },
      {
        id: "cal-inst-verify",
        title: "Institute L1 Verification Deadline",
        dateStr: "15 Nov 2026",
        daysLeft: 231,
        status: "upcoming",
        type: "verification",
        description: "College / School Nodal Officer must authenticate admission and bonafide credentials."
      },
      {
        id: "cal-state-verify",
        title: "State & District L2 Scrutiny Completion",
        dateStr: "15 Dec 2026",
        daysLeft: 261,
        status: "upcoming",
        type: "scrutiny",
        description: "District Welfare Officer (DWO) marks physical/digital cross-check completion."
      },
      {
        id: "cal-dbt-disbursement",
        title: "Expected PFMS Direct Benefit Transfer (DBT)",
        dateStr: "15 Jan 2027",
        daysLeft: 292,
        status: "disbursement",
        type: "payment",
        description: "Direct credit into Aadhaar-seeded bank account through the PFMS DBT gateway."
      }
    ];
  }

  // --- FEATURE 12: Grievance & Escalation System ---
  getGrievances() {
    try {
      const stored = localStorage.getItem("NTSP_GRIEVANCES");
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn("Grievance load error:", e);
    }
    const INITIAL_GRIEVANCES = [
      {
        id: "GRV-2026-ST-8821",
        category: "DBT Payment Delay",
        subject: "Maintenance stipend not credited for Q3",
        description: "Application was approved on 12 Jan 2026, but PFMS transaction status still shows 'Pending at Agency'.",
        status: "In Review",
        createdAt: "2026-03-20T10:30:00Z",
        slaDeadline: "2026-03-27T18:00:00Z",
        assignedOfficer: "Shri R. K. Meena (Section Officer, MoTA DBT Cell)",
        reply: "PFMS batch 9042 has been pushed to RBI. Transaction expected to clear within 48 hours."
      },
      {
        id: "GRV-2026-ST-7419",
        category: "Document Verification Stalled",
        subject: "Institute verification pending over 3 weeks",
        description: "College nodal officer has not completed L1 verification despite submission on 1st March.",
        status: "Resolved",
        createdAt: "2026-03-05T14:15:00Z",
        slaDeadline: "2026-03-12T18:00:00Z",
        assignedOfficer: "District Welfare Officer, Ranchi",
        reply: "Contacted Institute Nodal Officer. Verification completed on 11 March 2026."
      }
    ];
    localStorage.setItem("NTSP_GRIEVANCES", JSON.stringify(INITIAL_GRIEVANCES));
    return INITIAL_GRIEVANCES;
  }

  saveGrievances(list) {
    localStorage.setItem("NTSP_GRIEVANCES", JSON.stringify(list));
  }

  createGrievance(data) {
    const list = this.getGrievances();
    const randomSerial = Math.floor(1000 + Math.random() * 9000);
    const newGrievance = {
      id: `GRV-2026-ST-${randomSerial}`,
      category: data.category || "General Inquiry",
      subject: data.subject || "Scholarship assistance request",
      description: data.description || "",
      status: "Open",
      createdAt: new Date().toISOString(),
      slaDeadline: new Date(Date.now() + 7 * 86400000).toISOString(),
      assignedOfficer: "MoTA Grievance Redressal Desk",
      reply: null
    };
    list.unshift(newGrievance);
    this.saveGrievances(list);
    return newGrievance;
  }

  // --- FEATURE 5: Master Student Profile (Single Profile, Multiple Applications) ---
  getMasterProfile() {
    const app = this.getApplication();
    return {
      personal: app.personal,
      category: app.category,
      academic: app.academic,
      financial: app.financial
    };
  }

  saveMasterProfile(profileData) {
    const app = this.getApplication();
    if (profileData.personal) app.personal = { ...app.personal, ...profileData.personal };
    if (profileData.category) app.category = { ...app.category, ...profileData.category };
    if (profileData.academic) app.academic = { ...app.academic, ...profileData.academic };
    if (profileData.financial) app.financial = { ...app.financial, ...profileData.financial };
    this.saveApplication(app);
    return app;
  }
}

window.appStore = new AppStore();
