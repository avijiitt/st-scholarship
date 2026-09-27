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
}

window.appStore = new AppStore();
