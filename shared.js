/**
 * National Tribal Scholarship Portal (NTSP - MoTA)
 * Core Shared Application Logic & Accessibility Controller
 */

// Default Applicant Data for Priya Munda
const DEFAULT_APPLICATION_DATA = {
  applicationId: "MoTA-2026-NOS-44018",
  draftId: "MOTA-NOS-2026-DRAFT-0492",
  otrId: "OTR-2025-ST-884129",
  schemeType: "NOS", // NOS or NFST
  schemeName: "National Overseas Scholarship (NOS) 2026–27",
  
  // Step 1: Personal
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

  // Step 2: Category
  category: {
    tribeName: "Munda (ST)",
    certNo: "JH/REV/ST/2022/984321",
    issuingAuthority: "SDM/Tehsildar, Khunti",
    issueDate: "2022-06-18",
    pvtg: "No",
    pwd: "No",
    digilockerVerified: true
  },

  // Step 3: Academic
  academic: {
    courseLevel: "phd",
    hostCountry: "UK",
    university: "University of Oxford, United Kingdom",
    qsRank: "3",
    courseTitle: "DPhil in Plant Sciences and Ethno-botany",
    department: "Department of Biology & Linacre College",
    offerType: "unconditional",
    offerRef: "OX-INTL-2026-90412",
    sessionStart: "2026-10-01",
    tuitionQuoted: "£28,500 / annum",
    qualifyingDegree: "M.Sc. Forestry & Env.",
    qualifyingUniversity: "Ranchi University",
    qualifyingYear: "2024 (First Class)",
    qualifyingScore: "1492 / 2000 (74.60%)",
    netRollNo: "JH042091"
  },

  // Step 4: Financial
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
    accountNumberFull: "394857284521",
    branchName: "SBI Main Branch, Main Road, Khunti, Jharkhand",
    npciSeeded: true,
    pennyDropStatus: "SUCCESS (INR 1.00)"
  },

  // Step 5: Documents
  documents: {
    casteCert: { name: "ST_Certificate.pdf", size: "1.4 MB", verified: true, date: "18-Jun-2022" },
    incomeCert: { name: "Income_Cert_2024.pdf", size: "890 KB", verified: true, date: "12-May-2024" },
    offerLetter: { name: "Oxford_Offer_Letter_Unconditional.pdf", size: "2.1 MB", verified: true, date: "15-Feb-2026" },
    passport: { name: "Passport_Bio_Pages.pdf", size: "1.1 MB", verified: true, date: "Valid till 2032" },
    marksheet: { name: "Masters_Degree_Marksheets.pdf", size: "3.4 MB", verified: true, date: "DigiLocker Certified" }
  },

  // Status
  submission: {
    isSubmitted: false,
    refNo: "MOTA/NOS/2026/884129",
    timestamp: "31-Mar-2026 14:42 IST",
    status: "Draft Application"
  }
};

// State Persistence Manager
const AppState = {
  getData() {
    const raw = localStorage.getItem("NTSP_APPLICATION_DATA");
    if (!raw) {
      localStorage.setItem("NTSP_APPLICATION_DATA", JSON.stringify(DEFAULT_APPLICATION_DATA));
      return DEFAULT_APPLICATION_DATA;
    }
    try {
      return JSON.parse(raw);
    } catch (e) {
      return DEFAULT_APPLICATION_DATA;
    }
  },

  saveData(data) {
    localStorage.setItem("NTSP_APPLICATION_DATA", JSON.stringify(data));
  },

  updateSection(section, values) {
    const data = this.getData();
    data[section] = { ...data[section], ...values };
    this.saveData(data);
    return data;
  },

  reset() {
    localStorage.removeItem("NTSP_APPLICATION_DATA");
    return this.getData();
  }
};

// Accessibility Controls (GIGW 3.0)
const Accessibility = {
  init() {
    // Restore contrast setting
    if (localStorage.getItem("NTSP_HIGH_CONTRAST") === "true") {
      document.body.classList.add("high-contrast");
    }

    // Restore font size
    const savedScale = localStorage.getItem("NTSP_FONT_SCALE");
    if (savedScale) {
      document.documentElement.style.setProperty("--font-scale", savedScale);
    }

    this.bindEvents();
  },

  bindEvents() {
    // Font resize controls
    const fontBtns = document.querySelectorAll("[data-font-action]");
    fontBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.fontAction;
        let currentScale = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--font-scale")) || 1;
        if (action === "decrease" && currentScale > 0.85) currentScale -= 0.1;
        if (action === "reset") currentScale = 1;
        if (action === "increase" && currentScale < 1.3) currentScale += 0.1;

        document.documentElement.style.setProperty("--font-scale", currentScale.toFixed(2));
        localStorage.setItem("NTSP_FONT_SCALE", currentScale.toFixed(2));
      });
    });

    // Contrast toggle button
    const contrastBtns = document.querySelectorAll("[data-contrast-toggle]");
    contrastBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        document.body.classList.toggle("high-contrast");
        const isHigh = document.body.classList.contains("high-contrast");
        localStorage.setItem("NTSP_HIGH_CONTRAST", isHigh);
      });
    });
  }
};

// Search Controller for Scheme Search Inputs
function initSearchBoxes() {
  const searchInputs = document.querySelectorAll('input[placeholder*="Search schemes"], #global-scheme-search');
  searchInputs.forEach(input => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const term = encodeURIComponent(input.value.trim());
        window.location.href = `schemes.html?search=${term}`;
      }
    });
  });
}

// Global Toast Notifications
function showToast(message, type = "info") {
  const existing = document.getElementById("mota-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "mota-toast";
  toast.className = `fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg shadow-xl text-white font-medium text-sm flex items-center gap-3 transition-all duration-300 transform translate-y-4 opacity-0 ${
    type === "success" ? "bg-emerald-700" :
    type === "error" ? "bg-rose-700" :
    type === "warning" ? "bg-amber-700" : "bg-primary-container"
  }`;

  const iconName = type === "success" ? "check_circle" : type === "error" ? "error" : "info";

  toast.innerHTML = `
    <span class="material-symbols-outlined text-[20px]">${iconName}</span>
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" class="ml-2 hover:opacity-75">
      <span class="material-symbols-outlined text-[16px]">close</span>
    </button>
  `;

  document.body.appendChild(toast);

  // Trigger entry animation
  setTimeout(() => {
    toast.classList.remove("translate-y-4", "opacity-0");
  }, 20);

  // Auto remove after 4.5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add("opacity-0", "translate-y-4");
      setTimeout(() => toast.remove(), 300);
    }
  }, 4500);
}

// Document Ready
document.addEventListener("DOMContentLoaded", () => {
  Accessibility.init();
  initSearchBoxes();
});
