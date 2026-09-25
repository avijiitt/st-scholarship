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

// Queue of applications for Admin Demo
const INITIAL_ADMIN_APPLICATIONS = [
  {
    id: "MOTA-NOS-2026-000124",
    applicantName: "Priya Munda",
    otrId: "OTR-2025-ST-884129",
    scheme: "National Overseas Scholarship (NOS)",
    schemeCode: "NOS",
    university: "University of Oxford, UK (QS #3)",
    degree: "Ph.D. Plant Sciences",
    income: "₹4,50,000",
    state: "Jharkhand",
    status: "Under Document Scrutiny",
    submissionDate: "31-Mar-2026 14:42 IST",
    riskScore: "Low (Verified via DigiLocker)"
  },
  {
    id: "MOTA-NFST-2026-000482",
    applicantName: "Birsa Oraon",
    otrId: "OTR-2025-ST-672109",
    scheme: "National Fellowship for ST Students (NFST)",
    schemeCode: "NFST",
    university: "IIT Kharagpur",
    degree: "Ph.D. Metallurgy",
    income: "₹3,20,000",
    state: "Jharkhand",
    status: "Committee Screening",
    submissionDate: "28-Mar-2026 11:20 IST",
    riskScore: "Low"
  },
  {
    id: "MOTA-NOS-2026-000098",
    applicantName: "Anjali Bodra",
    otrId: "OTR-2025-ST-991244",
    scheme: "National Overseas Scholarship (NOS)",
    schemeCode: "NOS",
    university: "Imperial College London, UK (QS #6)",
    degree: "M.Sc. Biomedical Eng",
    income: "₹5,10,000",
    state: "Odisha",
    status: "Approved",
    submissionDate: "15-Mar-2026 09:30 IST",
    riskScore: "Low"
  },
  {
    id: "MOTA-PMS-2026-003411",
    applicantName: "Sanjay Marandi",
    otrId: "OTR-2025-ST-512033",
    scheme: "Post-Matric Scholarship for ST Students",
    schemeCode: "PMS",
    university: "St. Xavier's College, Ranchi",
    degree: "B.Com (Hons)",
    income: "₹1,80,000",
    state: "Jharkhand",
    status: "Deficiency Raised",
    submissionDate: "22-Mar-2026 16:15 IST",
    riskScore: "Medium (Income cert expired)"
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
    if (!localStorage.getItem("NTSP_ADMIN_QUEUE")) {
      localStorage.setItem("NTSP_ADMIN_QUEUE", JSON.stringify(INITIAL_ADMIN_APPLICATIONS));
    }
    if (!localStorage.getItem("NTSP_AUTH_USER")) {
      // Default to guest or pre-logged applicant for easy test flow
      localStorage.setItem("NTSP_AUTH_USER", JSON.stringify({
        role: "applicant",
        email: "student@demo.com",
        name: "Priya Munda",
        otrId: "OTR-2025-ST-884129"
      }));
    }
  }

  getApplication() {
    try {
      return JSON.parse(localStorage.getItem("NTSP_APPLICATION")) || INITIAL_APPLICATION;
    } catch {
      return INITIAL_APPLICATION;
    }
  }

  saveApplication(appData) {
    appData.lastUpdated = new Date().toISOString();
    localStorage.setItem("NTSP_APPLICATION", JSON.stringify(appData));
    
    // Also sync to admin queue if this application exists there
    const queue = this.getAdminQueue();
    const idx = queue.findIndex(q => q.id === appData.id);
    if (idx !== -1) {
      queue[idx].status = appData.status;
      queue[idx].submissionDate = appData.submissionDate || queue[idx].submissionDate;
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
