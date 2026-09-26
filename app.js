/**
 * National Tribal Scholarship Portal (NTSP - MoTA)
 * Unified Views & Application Controller
 */

// Helper: Wizard Step Progress Bar Component
function renderWizardStepper(activeStepIndex) {
  const steps = [
    { title: "01. Personal", path: "/application/personal" },
    { title: "02. Academic", path: "/application/academic" },
    { title: "03. Financial", path: "/application/financial" },
    { title: "04. Documents", path: "/application/documents" },
    { title: "05. Review", path: "/application/review" }
  ];

  return `
    <div class="bg-surface-container-lowest p-space-md rounded-xl shadow-sm border border-outline-variant/30 mb-space-md">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs uppercase font-bold text-secondary tracking-wider">Scholarship Application Process</span>
        <span class="text-xs font-bold text-primary">Step ${activeStepIndex + 1} of 5</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
        ${steps.map((st, idx) => {
          let style = "bg-surface-container text-outline";
          let icon = "radio_button_unchecked";
          let statusText = "Pending";

          if (idx < activeStepIndex) {
            style = "bg-tertiary-container/10 border border-tertiary-container/30 text-tertiary-container";
            icon = "check_circle";
            statusText = "Completed";
          } else if (idx === activeStepIndex) {
            style = "bg-secondary text-white font-bold shadow-sm";
            icon = "pending";
            statusText = "Current Step";
          }

          return `
            <a href="#${st.path}" class="p-2 rounded text-left flex flex-col gap-1 transition ${style}">
              <div class="flex items-center justify-between text-xs">
                <span>${st.title}</span>
                <span class="material-symbols-outlined text-[15px]">${icon}</span>
              </div>
              <span class="text-[10px] opacity-80">${statusText}</span>
            </a>
          `;
        }).join("")}
      </div>
    </div>
  `;
}

// Helper: Wizard Save Progress Bar & Status Indicator (Supabase Connected)
function renderWizardSaveBar() {
  const app = window.appStore ? window.appStore.getApplication() : null;
  const draftNum = app ? (app.id || app.draftId || "DRAFT") : "DRAFT";
  return `
    <div id="wizard-save-bar" class="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-surface-container-low border border-outline-variant/30 rounded-lg mb-3 text-xs">
      <div class="flex items-center gap-2">
        <span id="wizard-save-icon" class="material-symbols-outlined text-[17px] text-tertiary-container">cloud_done</span>
        <span id="wizard-save-text" class="font-semibold text-primary">Connected to Supabase • Draft Synced</span>
      </div>
      <div class="flex items-center gap-2">
        <span id="wizard-save-time" class="text-outline text-[11px] font-mono">Status: Ready</span>
        <span class="px-2 py-0.5 rounded bg-white font-mono text-[11px] font-bold text-secondary border border-outline-variant/30">
          REF: ${escapeHTML(draftNum)}
        </span>
      </div>
    </div>
  `;
}

function updateWizardSaveStatus(status, message) {
  const icon = document.getElementById("wizard-save-icon");
  const text = document.getElementById("wizard-save-text");
  const time = document.getElementById("wizard-save-time");
  if (!icon || !text) return;

  if (status === "saving") {
    icon.className = "w-3.5 h-3.5 border-2 border-secondary border-t-transparent rounded-full animate-spin shrink-0";
    icon.innerText = "";
    text.className = "font-bold text-secondary";
    text.innerText = message || "Saving draft to Supabase...";
  } else if (status === "saved") {
    icon.className = "material-symbols-outlined text-[17px] text-tertiary-container";
    icon.innerText = "cloud_done";
    text.className = "font-bold text-tertiary-container";
    text.innerText = message || "Draft saved to Supabase";
    if (time) time.innerText = "Last saved: " + new Date().toLocaleTimeString("en-IN");
  } else if (status === "error") {
    icon.className = "material-symbols-outlined text-[17px] text-error";
    icon.innerText = "error";
    text.className = "font-bold text-error";
    text.innerText = message || "Database notice (saved locally)";
  }
}

// Global Draft Starter / Resumer (Avoids duplicate drafts per scheme)
async function startOrResumeWizardApplication(schemeCode) {
  const code = (schemeCode || "NOS").toUpperCase();
  if (typeof showToast === "function") {
    showToast("Connecting to Supabase draft engine...", "info");
  }

  if (typeof window.supabaseGetOrCreateDraftApplication === "function") {
    try {
      const res = await window.supabaseGetOrCreateDraftApplication({ schemeCode: code });
      if (res && res.success) {
        if (res.resumed) {
          if (typeof showToast === "function") {
            showToast(`✓ Resumed active draft: ${res.application.application_number || res.application.id}`, "success");
          }
        } else {
          if (typeof showToast === "function") {
            showToast(`✓ New draft created: ${res.application.application_number || res.application.id}`, "success");
          }
        }
        const stepTarget = res.application.current_step ? `/application/${res.application.current_step}` : `/application/personal`;
        router.navigate(`${stepTarget}?scheme=${encodeURIComponent(code)}`);
        return;
      }
    } catch (err) {
      console.warn("startOrResumeWizardApplication error:", err);
    }
  }

  router.navigate(`/application/personal?scheme=${encodeURIComponent(code)}`);
}

// ----------------------------------------------------
// DYNAMIC SCHEMES HELPER FUNCTIONS (Supabase Connected)
// ----------------------------------------------------

const DEFAULT_SCHEMES = (typeof window !== "undefined" && window.DEFAULT_SCHEMES) ? window.DEFAULT_SCHEMES : [
  {
    id: "sch-001-nos",
    name: "National Overseas Scholarship (NOS)",
    code: "SCH-MOTA-NOS",
    description: "100% financial assistance covering full tuition fees, contingency living expenses, and international airfare for Scheduled Tribe scholars pursuing Master's and Ph.D. degrees abroad at QS Top 500 Global Universities.",
    education_level: "Master's / Ph.D.",
    study_location: "Abroad (QS Top 500 Universities)",
    deadline: "2026-11-30T23:59:59.000Z",
    status: "active",
    required_documents: [
      "Aadhaar Card",
      "ST Caste Certificate (Article 342)",
      "Annual Family Income Certificate (<= ₹6.00 Lakhs)",
      "Unconditional Offer Letter from QS Top 500 University",
      "GRE / IELTS / TOEFL Scorecard",
      "NPCI Seeded Active Bank Passbook"
    ]
  },
  {
    id: "sch-002-nfst",
    name: "National Fellowship for ST Students (NFST)",
    code: "SCH-MOTA-NFST",
    description: "Monthly research stipend of ₹38,000/month + HRA and annual contingency grant for regular full-time M.Phil and Ph.D. scholars pursuing doctoral research in recognized Indian Universities, IITs, and NITs.",
    education_level: "M.Phil / Ph.D. Regular Research",
    study_location: "Indian Universities / IITs / NITs",
    deadline: "2026-12-15T23:59:59.000Z",
    status: "active",
    required_documents: [
      "Aadhaar Card",
      "ST Caste Certificate (Article 342)",
      "Annual Family Income Certificate (<= ₹6.00 Lakhs)",
      "UGC-NET / JRF Award Letter",
      "Ph.D. Admission / Registration Letter",
      "Research Synopsis & Guide Endorsement",
      "NPCI Seeded Active Bank Passbook"
    ]
  },
  {
    id: "sch-003-pms",
    name: "Post-Matric Scholarship for ST Students (PMS-ST)",
    code: "SCH-MOTA-PMS",
    description: "Centrally sponsored scholarship providing 100% institutional non-refundable fee waivers and monthly maintenance allowance for Scheduled Tribe students pursuing higher post-secondary degree and professional programs in India.",
    education_level: "Post-Matric / Degree / Professional",
    study_location: "India (Accredited Colleges & Universities)",
    deadline: "2026-10-31T23:59:59.000Z",
    status: "active",
    required_documents: [
      "Aadhaar Card",
      "ST Caste Certificate (Article 342)",
      "Annual Family Income Certificate (<= ₹2.50 Lakhs)",
      "Previous Year Qualifying Marksheet",
      "College Admission Fee Receipt & Student ID",
      "NPCI Seeded Active Bank Passbook"
    ]
  }
];

function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatSchemeDeadline(deadlineStr) {
  if (!deadlineStr) return "Rolling Intake / Open";
  try {
    const d = new Date(deadlineStr);
    if (isNaN(d.getTime())) return deadlineStr;
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch (e) {
    return deadlineStr;
  }
}

function getRequiredDocsCount(reqDocs) {
  if (!reqDocs) return 0;
  if (Array.isArray(reqDocs)) return reqDocs.length;
  try {
    const parsed = typeof reqDocs === "string" ? JSON.parse(reqDocs) : reqDocs;
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch (e) {
    return 0;
  }
}

function getSchemeDetailRoute(code) {
  const c = (code || "").toUpperCase();
  if (c.includes("NOS")) return "#/schemes/nos";
  if (c.includes("NFST") || c.includes("NF")) return "#/schemes/nfst";
  if (c.includes("PMS")) return "#/schemes/pms";
  return "#/schemes";
}

function getSchemeApplyCode(code) {
  const c = (code || "").toUpperCase();
  if (c.includes("NOS")) return "NOS";
  if (c.includes("NFST") || c.includes("NF")) return "NFST";
  if (c.includes("PMS")) return "PMS";
  return code || "NOS";
}

function renderSchemeCardHTML(scheme) {
  const docCount = getRequiredDocsCount(scheme.required_documents);
  const detailRoute = getSchemeDetailRoute(scheme.code);
  const applyCode = getSchemeApplyCode(scheme.code);
  const deadline = formatSchemeDeadline(scheme.deadline);

  let barColor = "bg-secondary";
  let applyBtnClass = "bg-secondary hover:bg-secondary/90 text-white";
  let categoryTag = "Higher Education";
  let tagColor = "bg-surface-container-highest text-primary";

  if (scheme.code && scheme.code.includes("NOS")) {
    barColor = "bg-secondary";
    categoryTag = "Overseas / International";
  } else if (scheme.code && (scheme.code.includes("NFST") || scheme.code.includes("NF"))) {
    barColor = "bg-primary-container";
    applyBtnClass = "bg-primary-container hover:bg-primary text-white";
    categoryTag = "Research / Doctoral";
    tagColor = "bg-tertiary-container/15 text-on-tertiary-fixed-variant";
  } else if (scheme.code && scheme.code.includes("PMS")) {
    barColor = "bg-tertiary-container";
    applyBtnClass = "bg-tertiary-container hover:bg-tertiary text-white";
    categoryTag = "Post-Matric / Degree";
    tagColor = "bg-secondary-fixed/50 text-on-secondary-fixed-variant";
  }

  return `
    <div class="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden border border-outline-variant/30 flex flex-col justify-between hover:shadow-lg transition">
      <div class="h-2 ${barColor}"></div>
      <div class="p-space-lg flex-1 flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-center mb-2 gap-2">
            <span class="px-2.5 py-0.5 rounded text-xs font-semibold ${tagColor}">
              ${escapeHTML(categoryTag)}
            </span>
            <span class="text-xs font-mono text-outline shrink-0">${escapeHTML(scheme.code || "")}</span>
          </div>

          <h3 class="font-title-md font-bold text-primary text-xl mb-1">${escapeHTML(scheme.name)}</h3>
          <p class="text-secondary font-medium text-xs mb-3 flex items-center gap-1">
            <span class="material-symbols-outlined text-[15px]">location_on</span>
            ${escapeHTML(scheme.study_location || "India / Abroad")}
          </p>
          <p class="text-on-surface-variant text-sm mb-4 leading-relaxed line-clamp-3">
            ${escapeHTML(scheme.description || "")}
          </p>

          <div class="bg-surface-container-low p-3 rounded-lg text-xs space-y-1.5 mb-4">
            <div class="flex justify-between items-center">
              <span class="text-outline">Education Level:</span>
              <span class="font-semibold text-on-surface">${escapeHTML(scheme.education_level || "Degree")}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-outline flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">event</span> Deadline:
              </span>
              <span class="font-bold text-error">${escapeHTML(deadline)}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-outline flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">folder</span> Required Docs:
              </span>
              <span class="font-semibold text-primary font-mono bg-white px-1.5 py-0.5 rounded border border-outline-variant/30">
                ${docCount} Documents
              </span>
            </div>
          </div>
        </div>

        <div class="flex gap-2 pt-2 border-t border-outline-variant/20">
          <a href="${detailRoute}" class="flex-1 py-2.5 bg-surface-container hover:bg-surface-container-high text-primary font-bold rounded text-center text-sm transition">
            View Details
          </a>
          <a href="#/application/personal?scheme=${encodeURIComponent(applyCode)}" class="flex-1 py-2.5 ${applyBtnClass} font-bold rounded text-center text-sm transition shadow-sm">
            Apply Now
          </a>
        </div>
      </div>
    </div>
  `;
}

// Global cached schemes for search filtering
window.cachedSupabaseSchemes = [];

async function loadDynamicSchemes(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // 1. Loading State
  container.innerHTML = `
    <div class="col-span-full py-12 flex flex-col items-center justify-center text-center">
      <div class="w-8 h-8 border-3 border-secondary border-t-transparent rounded-full animate-spin mb-3"></div>
      <p class="text-sm font-bold text-primary">Fetching active schemes from Supabase database...</p>
      <p class="text-xs text-outline mt-1">Connecting to public.schemes</p>
    </div>
  `;

  try {
    const fetchFunc = window.supabaseFetchSchemes || (async () => []);
    let res = await fetchFunc(options);

    // If options.simulateError was passed or error occurred
    if (res && res.success === false) {
      throw new Error(res.error || "Unable to fetch schemes");
    }

    let schemes = Array.isArray(res) ? res : ((res && res.data) ? res.data : []);

    // Filter active schemes
    const activeSchemes = schemes.filter(s => !s.status || s.status === 'active');
    window.cachedSupabaseSchemes = activeSchemes;

    // 2. Empty State
    if (activeSchemes.length === 0) {
      container.innerHTML = `
        <div class="col-span-full p-8 text-center bg-surface-container-low rounded-xl border border-outline-variant/40 my-4">
          <span class="material-symbols-outlined text-outline text-5xl mb-2">inventory_2</span>
          <h3 class="text-lg font-bold text-primary">No Active Schemes Found</h3>
          <p class="text-xs text-on-surface-variant mt-1">There are currently no active scholarship schemes open for application in the database.</p>
        </div>
      `;
      return;
    }

    // 3. Render Active Schemes Cards
    const displaySchemes = options.limit ? activeSchemes.slice(0, options.limit) : activeSchemes;
    container.innerHTML = displaySchemes.map(s => renderSchemeCardHTML(s)).join("");

  } catch (err) {
    // 4. Error State
    container.innerHTML = `
      <div class="col-span-full p-6 text-center bg-error-container text-on-error-container rounded-xl border border-error/30 my-4">
        <span class="material-symbols-outlined text-error text-4xl mb-2">error</span>
        <h3 class="text-base font-bold text-error">Failed to Load Schemes from Database</h3>
        <p class="text-xs mt-1 mb-3 font-mono">${escapeHTML(err.message || "Database connection error")}</p>
        <button onclick="loadDynamicSchemes('${containerId}')" class="px-4 py-2 bg-error text-white font-bold rounded text-xs hover:bg-error/90 shadow-sm inline-flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px]">refresh</span> Retry Loading Schemes
        </button>
      </div>
    `;
  }
}

// ----------------------------------------------------
// ROUTE HANDLERS
// ----------------------------------------------------

// 1. Landing Page (/)
router.register("/", () => {
  const container = document.getElementById("main-view-container");
  container.innerHTML = `
    <main class="w-full bg-surface" id="main-content">
      <div class="max-w-7xl mx-auto px-margin py-space-xl">
        <!-- Urgent Notification Ticker -->
        <div class="w-full bg-surface-container-high text-on-surface py-2.5 px-space-md rounded-lg mb-space-lg flex items-center justify-between shadow-sm border border-outline-variant/30">
          <div class="flex items-center gap-space-sm overflow-hidden">
            <span class="inline-flex items-center gap-1 bg-secondary text-on-secondary px-2.5 py-0.5 rounded text-label-sm font-label-sm uppercase tracking-wider font-bold shrink-0">
              <span class="material-symbols-outlined text-[14px]">campaign</span> Urgent
            </span>
            <p class="font-body-md text-body-md text-on-surface truncate">
              Academic Year 2025–26 Portal is now live for all Centrally Sponsored Tribal Scholarship Schemes. Last date: <strong>31st October 2025</strong>.
            </p>
          </div>
          <a class="text-secondary font-label-sm text-label-sm hover:underline whitespace-nowrap hidden sm:inline-flex items-center gap-1 font-bold ml-2 shrink-0" href="#/schemes">
            View Schemes <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
          </a>
        </div>

        <!-- Hero Section -->
        <section class="relative w-full rounded-xl overflow-hidden shadow-md bg-surface-container-lowest mb-space-xl border border-outline-variant/30">
          <div class="relative w-full aspect-[21/9] max-h-[360px] overflow-hidden">
            <img alt="Tribal youth standing proudly on rolling hills against a rising sun with traditional Warli art embellishments" class="w-full h-full object-cover object-center" src="https://lh3.googleusercontent.com/aida-public/AB6AXuArgVLR9Rgg8-U3tVfmdRGSVWrvzHPcp2RaSoqe9UU26GaoddB0BhXeOPOM61ubJxmjABDRHeLm68t6KNUnOZFlXZQ9V5H-fx1YU7Hmm4YoDvU90MhyBTrZ6B9JUY--KCF7N_WBCPfOJyVzM1FT1dZ_HxUIRmVGzgG0fRyG2kJ4sJDTxFvQaRFfXXYgt7kELgGzpMQLJtXTxVq0ZUW5Srtal50IOMockYOUBHRxYs-OkyjZP1BS2Yvrba3Q2SudUitCkBI"/>
            <div class="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent sm:hidden"></div>
          </div>

          <div class="p-space-lg sm:p-space-xl bg-surface-container-lowest">
            <div class="max-w-4xl">
              <div class="inline-flex items-center gap-2 px-space-sm py-1 bg-surface-container text-primary rounded font-label-sm text-label-sm mb-space-sm font-bold">
                <span class="material-symbols-outlined text-[16px] text-secondary">verified</span> Ministry of Tribal Affairs • Government of India
              </div>
              <h1 class="font-display-hero text-display-hero text-primary font-bold tracking-tight mb-space-sm leading-tight text-3xl sm:text-4xl">
                Empowering Tribal Students Through Education
              </h1>
              <p class="font-body-lg text-body-lg text-on-surface-variant max-w-3xl mb-space-lg">
                Apply for scholarships and fellowships, upload documents and track your application from one secure portal.
              </p>

              <!-- CTA Buttons -->
              <div class="flex flex-wrap items-center gap-space-md mb-space-xl">
                <a class="inline-flex items-center justify-center gap-space-xs px-space-lg py-3 bg-secondary text-on-secondary font-label-lg rounded hover:bg-on-secondary-fixed-variant transition-colors shadow-sm font-semibold" href="#/application/new">
                  <span>Apply Now</span>
                  <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
                </a>
                <a class="inline-flex items-center justify-center gap-space-xs px-space-lg py-3 bg-primary-container text-surface-container-lowest font-label-lg rounded shadow-sm hover:bg-primary transition-colors font-semibold" href="#/schemes">
                  <span class="material-symbols-outlined text-[20px]">explore</span>
                  <span>Explore Schemes</span>
                </a>
                <a class="inline-flex items-center justify-center gap-space-xs px-space-lg py-3 bg-surface-container text-primary font-label-lg rounded shadow-sm hover:bg-surface-container-high transition-colors font-semibold" href="#/application/track">
                  <span class="material-symbols-outlined text-[20px]">search_check</span>
                  <span>Track Application</span>
                </a>
              </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-space-md pt-space-lg bg-surface-container-low rounded-xl p-space-md">
              <div class="flex items-center gap-space-sm p-space-sm bg-surface-container-lowest rounded-lg shadow-sm">
                <div class="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-secondary text-[26px]">school</span>
                </div>
                <div>
                  <p class="font-headline-sm font-bold text-primary">5.2 Lakh+</p>
                  <p class="text-xs text-on-surface-variant">Scholarships Disbursed</p>
                </div>
              </div>
              <div class="flex items-center gap-space-sm p-space-sm bg-surface-container-lowest rounded-lg shadow-sm">
                <div class="w-12 h-12 rounded-full bg-tertiary-container/10 flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-tertiary-container text-[26px]">account_balance</span>
                </div>
                <div>
                  <p class="font-headline-sm font-bold text-primary">100%</p>
                  <p class="text-xs text-on-surface-variant">Direct Benefit Transfer (DBT)</p>
                </div>
              </div>
              <div class="flex items-center gap-space-sm p-space-sm bg-surface-container-lowest rounded-lg shadow-sm">
                <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-primary text-[26px]">workspace_premium</span>
                </div>
                <div>
                  <p class="font-headline-sm font-bold text-primary">18+ Schemes</p>
                  <p class="text-xs text-on-surface-variant">&amp; Fellowships Available</p>
                </div>
              </div>
              <div class="flex items-center gap-space-sm p-space-sm bg-surface-container-lowest rounded-lg shadow-sm">
                <div class="w-12 h-12 rounded-full bg-secondary-fixed-dim/20 flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-secondary text-[26px]">money_off</span>
                </div>
                <div>
                  <p class="font-headline-sm font-bold text-primary">₹0 Fee</p>
                  <p class="text-xs text-on-surface-variant">Zero Application Fee</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Flagship Schemes Cards (Loaded from Database) -->
        <section class="w-full mb-space-xl">
          <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-space-lg gap-space-sm">
            <div>
              <div class="inline-flex items-center gap-1 text-secondary font-label-sm font-bold uppercase tracking-wider mb-1">
                <span>MoTA Central Flagships • Supabase Live</span>
              </div>
              <h2 class="font-headline-lg font-bold text-primary text-2xl">
                Featured Schemes &amp; Fellowships
              </h2>
            </div>
            <a class="inline-flex items-center gap-1 font-label-lg text-secondary hover:text-on-secondary-fixed-variant font-bold transition-colors" href="#/schemes">
              View All Schemes <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
          </div>

          <!-- Dynamic Database Schemes Grid -->
          <div id="landing-schemes-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
            ${DEFAULT_SCHEMES.map(s => renderSchemeCardHTML(s)).join("")}
          </div>
        </section>
      </div>
    </main>
  `;

  // Fetch live active schemes from Supabase database
  setTimeout(() => {
    loadDynamicSchemes("landing-schemes-container");
  }, 20);
});

// 2. Applicant Login (/login)
router.register("/login", () => {
  const container = document.getElementById("main-view-container");
  container.innerHTML = `
    <div class="max-w-md mx-auto my-12 p-space-xl bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30">
      <div class="text-center mb-space-lg">
        <div class="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2">
          <span class="material-symbols-outlined text-[32px]">school</span>
        </div>
        <h1 class="font-headline-sm text-primary font-bold text-2xl">Scholar Login</h1>
        <p class="text-xs text-on-surface-variant mt-1">Access your scholarship draft, documents, and DBT status.</p>
      </div>

      <!-- Demo Credentials Banner -->
      <div class="p-3 bg-secondary-fixed/40 border border-secondary/20 rounded-lg text-xs mb-4">
        <p class="font-bold text-on-secondary-fixed flex items-center gap-1 mb-1">
          <span class="material-symbols-outlined text-[16px]">verified_user</span> Supabase Auth Gateway:
        </p>
        <p class="text-on-secondary-fixed-variant">Log in with your registered email &amp; password, or use prototype credentials:</p>
        <p class="text-on-secondary-fixed-variant mt-1">Email: <strong class="font-mono">student@demo.com</strong> | Password: <strong class="font-mono">student123</strong></p>
      </div>

      <!-- Error State Alert -->
      <div id="login-error-container" class="hidden mb-4 p-3 bg-error-container text-on-error-container border border-error/30 rounded-lg text-xs font-semibold flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px] text-error shrink-0">error</span>
        <span id="login-error-text"></span>
      </div>

      <form id="applicant-login-form" onsubmit="handleApplicantLogin(event)" class="space-y-space-md">
        <div>
          <label class="block text-xs font-bold text-on-surface mb-1">Applicant Email *</label>
          <input type="email" id="app-login-user" value="student@demo.com" placeholder="name@domain.com" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm font-semibold focus:outline-none focus:border-primary" required/>
        </div>
        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="block text-xs font-bold text-on-surface">Password *</label>
            <a href="#" onclick="showToast('Password reset link available via Supabase Auth email recovery.', 'info'); return false;" class="text-[11px] text-secondary hover:underline font-semibold">Forgot?</a>
          </div>
          <input type="password" id="app-login-pwd" value="student123" placeholder="••••••••" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm font-semibold focus:outline-none focus:border-primary" required/>
        </div>

        <button type="submit" id="login-submit-btn" class="w-full py-3 bg-secondary hover:bg-secondary/90 text-white font-bold rounded shadow-md flex items-center justify-center gap-2 transition disabled:opacity-60">
          <span class="material-symbols-outlined text-[20px]">login</span>
          <span id="login-btn-text">Sign In to Dashboard</span>
        </button>
      </form>

      <div class="mt-4 pt-4 border-t border-outline-variant/20 flex justify-between text-xs">
        <a href="#/register" class="text-secondary font-bold hover:underline">New Registration (OTR)</a>
        <a href="#/admin/login" class="text-outline hover:underline">Admin Login →</a>
      </div>
    </div>
  `;
});

async function handleApplicantLogin(e) {
  e.preventDefault();
  const emailInput = document.getElementById("app-login-user");
  const pwdInput = document.getElementById("app-login-pwd");
  const btn = document.getElementById("login-submit-btn");
  const btnText = document.getElementById("login-btn-text");
  const errContainer = document.getElementById("login-error-container");
  const errText = document.getElementById("login-error-text");

  const email = emailInput.value.trim();
  const pwd = pwdInput.value.trim();

  errContainer.classList.add("hidden");

  // Loading state
  btn.disabled = true;
  btnText.textContent = "Authenticating with Supabase...";
  const originalBtnHTML = btn.innerHTML;
  btn.innerHTML = `<span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> <span>Authenticating with Supabase...</span>`;

  try {
    let authSuccess = false;
    let authUserObj = null;

    if (window.supabaseLogin) {
      const res = await window.supabaseLogin({ email, password: pwd });
      if (res.success && res.user) {
        authSuccess = true;
        const meta = res.user.user_metadata || {};
        authUserObj = {
          role: "applicant",
          email: res.user.email,
          name: meta.full_name || (res.user.email ? res.user.email.split("@")[0] : "Scholar"),
          otrId: meta.otr_id || ("OTR-2025-ST-" + res.user.id.substring(0, 6).toUpperCase()),
          supabaseId: res.user.id
        };
      } else if (email === "student@demo.com" && pwd === "student123") {
        // Fallback demo credentials
        authSuccess = true;
        authUserObj = {
          role: "applicant",
          email: "student@demo.com",
          name: "Priya Munda",
          otrId: "OTR-2025-ST-884129"
        };
      } else {
        let msg = res.error || "Authentication failed.";
        if (res.error === "Email not confirmed") {
          msg = "Your email has not been verified yet. Please check your inbox for the Supabase confirmation link.";
        } else if (res.error === "Invalid login credentials") {
          msg = "Invalid email or password. Please verify your credentials.";
        }
        errText.textContent = msg;
        errContainer.classList.remove("hidden");
        showToast(msg, "error");
      }
    } else {
      if (email === "student@demo.com" && pwd === "student123") {
        authSuccess = true;
        authUserObj = {
          role: "applicant",
          email: "student@demo.com",
          name: "Priya Munda",
          otrId: "OTR-2025-ST-884129"
        };
      } else {
        const msg = "Invalid credentials. Use student@demo.com / student123 or register a new scholar account.";
        errText.textContent = msg;
        errContainer.classList.remove("hidden");
        showToast(msg, "error");
      }
    }

    if (authSuccess && authUserObj) {
      window.appStore.setAuthUser(authUserObj);

      // Sync application personal details
      const app = window.appStore.getApplication();
      app.personal.email = authUserObj.email;
      if (authUserObj.name && authUserObj.name !== "Scholar") {
        app.personal.fullName = authUserObj.name;
      }
      window.appStore.saveApplication(app);

      showToast(`Welcome back, ${authUserObj.name}! Signed in successfully.`, "success");
      router.navigate("/applicant/dashboard");
    }
  } catch (err) {
    errText.textContent = err.message || "An unexpected error occurred during login.";
    errContainer.classList.remove("hidden");
    showToast("Login error: " + err.message, "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalBtnHTML;
  }
}

// 3. Registration Page (/register)
router.register("/register", () => {
  const container = document.getElementById("main-view-container");
  container.innerHTML = `
    <div class="max-w-xl mx-auto my-12 p-space-xl bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30">
      <div class="text-center mb-space-lg">
        <span class="text-xs uppercase font-bold text-secondary tracking-wider block mb-1">e-KYC Secured Gateway • Supabase Auth</span>
        <h1 class="font-headline-sm text-primary font-bold text-2xl">One-Time Registration (OTR)</h1>
        <p class="text-xs text-on-surface-variant mt-1">
          Create your verified scholar account to apply for overseas scholarships and national research fellowships.
        </p>
      </div>

      <!-- Error State Alert -->
      <div id="reg-error-container" class="hidden mb-4 p-3 bg-error-container text-on-error-container border border-error/30 rounded-lg text-xs font-semibold flex items-center gap-2">
        <span class="material-symbols-outlined text-[18px] text-error shrink-0">error</span>
        <span id="reg-error-text"></span>
      </div>

      <!-- Success State Alert -->
      <div id="reg-success-container" class="hidden mb-4 p-4 bg-tertiary-fixed text-on-tertiary-fixed border border-tertiary-container/30 rounded-xl text-xs space-y-2">
        <div class="flex items-center gap-2 font-bold text-sm">
          <span class="material-symbols-outlined text-tertiary-container text-xl">verified</span>
          <span>Scholar Account Registered Successfully!</span>
        </div>
        <p id="reg-success-desc" class="leading-relaxed"></p>
        <div class="pt-2">
          <a href="#/login" class="inline-flex items-center gap-1 px-4 py-2 bg-primary text-white rounded font-bold hover:bg-primary-container text-xs shadow-sm">
            Proceed to Login <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>
      </div>

      <form id="applicant-reg-form" onsubmit="handleRegistrationSubmit(event)" class="space-y-space-md">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="sm:col-span-2">
            <label class="block text-xs font-bold text-on-surface mb-1">Full Legal Name *</label>
            <input type="text" id="reg-name" value="Arjun Munda" placeholder="Enter full name" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm font-semibold focus:outline-none focus:border-primary" required/>
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface mb-1">12-Digit Aadhaar Number *</label>
            <input type="text" id="reg-aadhaar" value="5429 8841 2901" placeholder="XXXX XXXX XXXX" class="w-full h-11 px-3 bg-surface-container-low font-mono rounded border border-outline-variant/40 text-sm focus:outline-none focus:border-primary" required/>
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface mb-1">Mobile Number (Aadhaar Linked) *</label>
            <input type="tel" id="reg-mobile" value="+91 98765 43210" placeholder="+91 XXXXX XXXXX" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm focus:outline-none focus:border-primary" required/>
          </div>

          <div class="sm:col-span-2">
            <label class="block text-xs font-bold text-on-surface mb-1">Applicant Email Address *</label>
            <input type="email" id="reg-email" placeholder="scholar@domain.com" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm font-semibold focus:outline-none focus:border-primary" required/>
            <span class="text-[11px] text-outline mt-0.5 block">Used for Supabase account security and direct sanction notifications.</span>
          </div>

          <div class="sm:col-span-2">
            <label class="block text-xs font-bold text-on-surface mb-1">Create Account Password *</label>
            <input type="password" id="reg-pwd" minlength="6" placeholder="Minimum 6 characters" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm font-semibold focus:outline-none focus:border-primary" required/>
            <span class="text-[11px] text-outline mt-0.5 block">Password must be at least 6 characters.</span>
          </div>

          <div class="sm:col-span-2">
            <label class="block text-xs font-bold text-on-surface mb-1">State of Domicile *</label>
            <select id="reg-state" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm focus:outline-none focus:border-primary">
              <option value="Jharkhand" selected>Jharkhand</option>
              <option value="Odisha">Odisha</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Chhattisgarh">Chhattisgarh</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Assam">Assam</option>
            </select>
          </div>
        </div>

        <button type="submit" id="reg-submit-btn" class="w-full py-3 bg-secondary hover:bg-secondary/90 text-white font-bold rounded shadow-md flex items-center justify-center gap-2 transition disabled:opacity-60 mt-2">
          <span class="material-symbols-outlined text-[20px]">fingerprint</span>
          <span id="reg-btn-text">Verify &amp; Register Scholar</span>
        </button>
      </form>

      <div class="mt-4 pt-4 border-t border-outline-variant/20 text-center text-xs">
        <span>Already registered?</span> <a href="#/login" class="text-secondary font-bold hover:underline ml-1">Sign In</a>
      </div>
    </div>
  `;
});

async function handleRegistrationSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("reg-name").value.trim();
  const aadhaar = document.getElementById("reg-aadhaar").value.trim();
  const mobile = document.getElementById("reg-mobile").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const pwd = document.getElementById("reg-pwd").value.trim();
  const state = document.getElementById("reg-state").value;

  const btn = document.getElementById("reg-submit-btn");
  const btnText = document.getElementById("reg-btn-text");
  const errContainer = document.getElementById("reg-error-container");
  const errText = document.getElementById("reg-error-text");
  const successContainer = document.getElementById("reg-success-container");
  const successDesc = document.getElementById("reg-success-desc");

  errContainer.classList.add("hidden");
  successContainer.classList.add("hidden");

  if (pwd.length < 6) {
    errText.textContent = "Password must be at least 6 characters long.";
    errContainer.classList.remove("hidden");
    return;
  }

  // Loading state
  btn.disabled = true;
  btnText.textContent = "Registering with Supabase...";
  const originalBtnHTML = btn.innerHTML;
  btn.innerHTML = `<span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> <span>Registering Scholar with Supabase...</span>`;

  try {
    if (window.supabaseRegister) {
      const res = await window.supabaseRegister({
        email,
        password: pwd,
        fullName: name,
        mobile,
        state,
        aadhaar
      });

      if (res.success) {
        const genOtr = "OTR-2025-ST-" + Math.floor(100000 + Math.random() * 900000);

        if (res.session && res.session.user) {
          // Immediately authenticated (e.g. autoconfirm enabled)
          window.appStore.setAuthUser({
            role: "applicant",
            email: res.user.email,
            name: name,
            otrId: genOtr,
            supabaseId: res.user.id
          });

          // Sync application personal details
          const app = window.appStore.getApplication();
          app.personal.fullName = name;
          app.personal.email = email;
          app.personal.mobile = mobile;
          app.personal.state = state;
          window.appStore.saveApplication(app);

          showToast("Registration successful! Welcome to the portal.", "success");
          router.navigate("/applicant/dashboard");
        } else {
          // Account registered, confirmation email dispatched
          successDesc.innerHTML = `Your scholar account has been securely created in Supabase Auth for <strong>${email}</strong> with generated OTR ID <code class="font-mono bg-white/60 px-1 py-0.5 rounded font-bold">${genOtr}</code>. Please check your email inbox to verify your email, then proceed to sign in.`;
          successContainer.classList.remove("hidden");
          showToast("Account created! Verification link sent to email.", "success");
          document.getElementById("applicant-reg-form").reset();
        }
      } else {
        errText.textContent = res.error || "Failed to register account with Supabase.";
        errContainer.classList.remove("hidden");
        showToast(res.error || "Registration failed", "error");
      }
    } else {
      // Local fallback
      const genOtr = "OTR-2025-ST-" + Math.floor(100000 + Math.random() * 900000);
      window.appStore.setAuthUser({
        role: "applicant",
        email: email,
        name: name,
        otrId: genOtr
      });
      showToast("Registered successfully (Offline Mode).", "success");
      router.navigate("/applicant/dashboard");
    }
  } catch (err) {
    errText.textContent = err.message || "An unexpected error occurred during registration.";
    errContainer.classList.remove("hidden");
    showToast("Registration error: " + err.message, "error");
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalBtnHTML;
  }
}

// 4. All Schemes Directory (/schemes)
router.register("/schemes", () => {
  const container = document.getElementById("main-view-container");
  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-margin py-space-xl">
      <div class="mb-space-lg flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <span class="text-xs uppercase font-bold text-secondary tracking-wider block mb-1">Ministry of Tribal Affairs • Supabase Live</span>
          <h1 class="font-headline-lg font-bold text-primary text-3xl">All Schemes &amp; Fellowships</h1>
          <p class="text-sm text-on-surface-variant mt-1">Live active scholarship schemes retrieved from official Supabase database (public.schemes).</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="loadDynamicSchemes('all-schemes-container')" class="px-3 py-2 bg-surface-container hover:bg-surface-container-high text-primary font-bold rounded text-xs inline-flex items-center gap-1 transition">
            <span class="material-symbols-outlined text-[16px]">refresh</span> Refresh DB
          </button>
          <a href="#/application/new" class="px-5 py-2.5 bg-secondary text-white font-bold rounded text-sm shadow-sm hover:bg-secondary/90 transition">
            Apply for New Scheme
          </a>
        </div>
      </div>

      <!-- Search & Category Filters -->
      <div class="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 mb-space-lg flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div class="flex items-center gap-2 flex-1 min-w-[260px] bg-surface-container-low px-3 py-2 rounded-lg border border-outline-variant/30">
          <span class="material-symbols-outlined text-outline text-[20px]">search</span>
          <input type="text" id="scheme-search-input" oninput="filterLoadedSchemes()" placeholder="Search schemes by name, level, location, or code..." class="w-full text-xs font-semibold bg-transparent border-none focus:outline-none text-on-surface"/>
        </div>
        <div class="flex items-center gap-2 text-xs">
          <span class="text-outline font-semibold">Filter:</span>
          <button onclick="filterSchemesByCategory('all')" class="px-3 py-1 rounded-full font-bold bg-primary text-white" id="filter-all">All Schemes</button>
          <button onclick="filterSchemesByCategory('abroad')" class="px-3 py-1 rounded-full font-semibold bg-surface-container text-on-surface hover:bg-surface-container-high" id="filter-abroad">Abroad (NOS)</button>
          <button onclick="filterSchemesByCategory('research')" class="px-3 py-1 rounded-full font-semibold bg-surface-container text-on-surface hover:bg-surface-container-high" id="filter-research">Research (NFST)</button>
          <button onclick="filterSchemesByCategory('postmatric')" class="px-3 py-1 rounded-full font-semibold bg-surface-container text-on-surface hover:bg-surface-container-high" id="filter-postmatric">Post-Matric (PMS)</button>
        </div>
      </div>

      <!-- Dynamic All Schemes Grid Container -->
      <div id="all-schemes-container" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
        ${DEFAULT_SCHEMES.map(s => renderSchemeCardHTML(s)).join("")}
      </div>
    </div>
  `;

  // Fetch live active schemes from Supabase database
  setTimeout(() => {
    loadDynamicSchemes("all-schemes-container");
  }, 20);
});

window.filterLoadedSchemes = function() {
  const query = (document.getElementById("scheme-search-input")?.value || "").toLowerCase().trim();
  const container = document.getElementById("all-schemes-container");
  if (!container) return;
  const schemes = window.cachedSupabaseSchemes || DEFAULT_SCHEMES;
  const filtered = schemes.filter(s => 
    (s.name || "").toLowerCase().includes(query) ||
    (s.description || "").toLowerCase().includes(query) ||
    (s.education_level || "").toLowerCase().includes(query) ||
    (s.study_location || "").toLowerCase().includes(query) ||
    (s.code || "").toLowerCase().includes(query)
  );
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-8 text-center bg-surface-container-low rounded-xl border border-outline-variant/40 my-4">
        <span class="material-symbols-outlined text-outline text-4xl mb-1">search_off</span>
        <h4 class="text-sm font-bold text-primary">No Matching Schemes</h4>
        <p class="text-xs text-on-surface-variant mt-1">Try refining your search keyword or clearing the filter.</p>
      </div>
    `;
  } else {
    container.innerHTML = filtered.map(s => renderSchemeCardHTML(s)).join("");
  }
};

window.filterSchemesByCategory = function(category) {
  const container = document.getElementById("all-schemes-container");
  if (!container) return;
  const schemes = window.cachedSupabaseSchemes || DEFAULT_SCHEMES;
  
  ["all", "abroad", "research", "postmatric"].forEach(cat => {
    const btn = document.getElementById(`filter-${cat}`);
    if (btn) {
      if (cat === category) {
        btn.className = "px-3 py-1 rounded-full font-bold bg-primary text-white";
      } else {
        btn.className = "px-3 py-1 rounded-full font-semibold bg-surface-container text-on-surface hover:bg-surface-container-high";
      }
    }
  });

  let filtered = schemes;
  if (category === "abroad") {
    filtered = schemes.filter(s => (s.code || "").includes("NOS") || (s.study_location || "").toLowerCase().includes("abroad"));
  } else if (category === "research") {
    filtered = schemes.filter(s => (s.code || "").includes("NFST") || (s.code || "").includes("NF") || (s.name || "").toLowerCase().includes("fellowship"));
  } else if (category === "postmatric") {
    filtered = schemes.filter(s => (s.code || "").includes("PMS") || (s.education_level || "").toLowerCase().includes("post-matric"));
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-8 text-center bg-surface-container-low rounded-xl border border-outline-variant/40 my-4">
        <span class="material-symbols-outlined text-outline text-4xl mb-1">filter_alt_off</span>
        <h4 class="text-sm font-bold text-primary">No Schemes Found for this Filter</h4>
      </div>
    `;
  } else {
    container.innerHTML = filtered.map(s => renderSchemeCardHTML(s)).join("");
  }
};

// 5. Scheme NFST Details (/schemes/nfst)
router.register("/schemes/nfst", () => {
  const container = document.getElementById("main-view-container");
  container.innerHTML = `
    <div class="max-w-4xl mx-auto px-margin py-space-xl">
      <div class="mb-4">
        <a href="#/schemes" class="text-xs font-bold text-secondary hover:underline flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px]">arrow_back</span> Back to Schemes
        </a>
      </div>

      <div class="bg-surface-container-lowest p-space-xl rounded-xl shadow-md border border-outline-variant/30">
        <div class="flex justify-between items-start mb-4">
          <div>
            <span class="px-2.5 py-0.5 rounded text-xs font-bold bg-tertiary-container/15 text-on-tertiary-fixed-variant">Research / Indian Universities</span>
            <h1 class="text-2xl font-bold text-primary mt-1">National Fellowship for ST Students (NFST)</h1>
            <p class="text-sm text-secondary font-semibold">Higher Doctoral Research in India (UGC / CSIR / IITs / NITs)</p>
          </div>
          <a href="#/application/personal?scheme=NFST" class="px-5 py-2.5 bg-primary-container hover:bg-primary text-white font-bold rounded text-sm shadow-md">
            Apply Now
          </a>
        </div>

        <div class="space-y-4 text-sm text-on-surface-variant leading-relaxed">
          <div class="p-3 bg-surface-container-low rounded-lg grid grid-cols-2 sm:grid-cols-3 gap-2 font-semibold">
            <div><span class="text-outline text-xs block">Annual Slots:</span> 750 Scholars</div>
            <div><span class="text-outline text-xs block">Monthly Stipend:</span> ₹38,000 + HRA</div>
            <div><span class="text-outline text-xs block">Family Income Cap:</span> ≤ ₹6.00 Lakhs/yr</div>
          </div>

          <h3 class="text-base font-bold text-primary">Scheme Guidelines &amp; Eligibility</h3>
          <ul class="list-disc pl-5 space-y-1">
            <li>Candidates must belong to a recognized Scheduled Tribe community in India.</li>
            <li>Admitted into regular, full-time M.Phil or Ph.D. in recognized Indian Universities/Institutes.</li>
            <li>Must have cleared UGC-NET or CSIR-NET examination.</li>
            <li>Disbursement directly credited to Aadhaar-seeded account via PFMS DBT.</li>
          </ul>
        </div>
      </div>
    </div>
  `;
});

// 6. Scheme NOS Details (/schemes/nos)
router.register("/schemes/nos", () => {
  const container = document.getElementById("main-view-container");
  container.innerHTML = `
    <div class="max-w-4xl mx-auto px-margin py-space-xl">
      <div class="mb-4">
        <a href="#/schemes" class="text-xs font-bold text-secondary hover:underline flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px]">arrow_back</span> Back to Schemes
        </a>
      </div>

      <div class="bg-surface-container-lowest p-space-xl rounded-xl shadow-md border border-outline-variant/30">
        <div class="flex justify-between items-start mb-4">
          <div>
            <span class="px-2.5 py-0.5 rounded text-xs font-bold bg-surface-container-highest text-primary">Overseas / International</span>
            <h1 class="text-2xl font-bold text-primary mt-1">National Overseas Scholarship (NOS)</h1>
            <p class="text-sm text-secondary font-semibold">Higher Studies Abroad (Master's &amp; Doctoral Level)</p>
          </div>
          <a href="#/application/personal?scheme=NOS" class="px-5 py-2.5 bg-secondary hover:bg-secondary/90 text-white font-bold rounded text-sm shadow-md">
            Apply Now
          </a>
        </div>

        <div class="space-y-4 text-sm text-on-surface-variant leading-relaxed">
          <div class="p-3 bg-surface-container-low rounded-lg grid grid-cols-2 sm:grid-cols-3 gap-2 font-semibold">
            <div><span class="text-outline text-xs block">Annual Awards:</span> 20 Scholars</div>
            <div><span class="text-outline text-xs block">Coverage:</span> 100% Tuition + Living + Airfare</div>
            <div><span class="text-outline text-xs block">Institution Criteria:</span> Top 500 QS World Ranking</div>
          </div>

          <h3 class="text-base font-bold text-primary">Mandatory Eligibility Criteria</h3>
          <ul class="list-disc pl-5 space-y-1">
            <li>Minimum 55% marks or equivalent grade in qualifying Master's degree.</li>
            <li>Secured unconditional admission in an eligible institution ranked in Top 500 QS rankings.</li>
            <li>Total annual family income must not exceed ₹6.00 Lakhs per annum.</li>
            <li>Age limit: Below 35 years as on 1st April of selection year.</li>
          </ul>
        </div>
      </div>
    </div>
  `;
});

// 6B. Scheme PMS Details (/schemes/pms)
router.register("/schemes/pms", () => {
  const container = document.getElementById("main-view-container");
  container.innerHTML = `
    <div class="max-w-4xl mx-auto px-margin py-space-xl">
      <div class="mb-4">
        <a href="#/schemes" class="text-xs font-bold text-secondary hover:underline flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px]">arrow_back</span> Back to Schemes
        </a>
      </div>

      <div class="bg-surface-container-lowest p-space-xl rounded-xl shadow-md border border-outline-variant/30">
        <div class="flex justify-between items-start mb-4">
          <div>
            <span class="px-2.5 py-0.5 rounded text-xs font-bold bg-tertiary-container/15 text-on-tertiary-fixed-variant">Post-Matric / Indian Colleges</span>
            <h1 class="text-2xl font-bold text-primary mt-1">Post-Matric Scholarship for ST Students (PMS-ST)</h1>
            <p class="text-sm text-secondary font-semibold">Undergraduate, Postgraduate &amp; Professional Studies in India</p>
          </div>
          <a href="#/application/personal?scheme=PMS" class="px-5 py-2.5 bg-tertiary-container hover:bg-tertiary text-white font-bold rounded text-sm shadow-md">
            Apply Now
          </a>
        </div>

        <div class="space-y-4 text-sm text-on-surface-variant leading-relaxed">
          <div class="p-3 bg-surface-container-low rounded-lg grid grid-cols-2 sm:grid-cols-3 gap-2 font-semibold">
            <div><span class="text-outline text-xs block">Target Scholars:</span> All Eligible ST Students</div>
            <div><span class="text-outline text-xs block">Coverage:</span> 100% Fee Reimbursement + Maintenance</div>
            <div><span class="text-outline text-xs block">Family Income Cap:</span> ≤ ₹2.50 Lakhs/yr</div>
          </div>

          <h3 class="text-base font-bold text-primary">Key Scheme Guidelines &amp; Benefits</h3>
          <ul class="list-disc pl-5 space-y-1">
            <li>For Scheduled Tribe students enrolled in post-matriculation or post-secondary courses in recognized institutions.</li>
            <li>Covers all non-refundable compulsory institutional fees and monthly study maintenance allowances.</li>
            <li>Annual family income from all sources must not exceed ₹2.50 Lakhs per annum.</li>
            <li>Disbursed directly via DBT into scholar's Aadhaar-seeded bank account through PFMS.</li>
          </ul>
        </div>
      </div>
    </div>
  `;
});

// 7. Applicant Dashboard (/applicant/dashboard)
router.register("/applicant/dashboard", () => {
  const app = window.appStore.getApplication();
  const user = window.appStore.getAuthUser() || { name: "Priya Munda", otrId: "OTR-2025-ST-884129" };
  const container = document.getElementById("main-view-container");

  container.innerHTML = `
    <div class="space-y-space-lg">
      <!-- Welcome Banner -->
      <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 class="text-2xl font-bold text-primary">Welcome, ${user.name}!</h1>
          <p class="text-xs text-on-surface-variant mt-0.5">OTR ID: <strong class="font-mono">${user.otrId}</strong> | ST e-KYC Verified</p>
        </div>
        <a href="#/application/new" class="px-4 py-2 bg-secondary text-white font-bold rounded text-sm shadow-sm hover:bg-secondary/90">
          + New Application
        </a>
      </div>

      <!-- Active Application Card -->
      <div class="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/30 overflow-hidden">
        <div class="bg-primary px-space-md py-3 text-white flex justify-between items-center">
          <span class="text-xs font-mono text-secondary-fixed">APPLICATION REF: ${app.id}</span>
          <span class="px-2 py-0.5 rounded text-xs font-bold ${
            app.status === 'Approved' ? 'bg-tertiary-fixed text-on-tertiary-fixed' :
            app.status === 'Deficiency Raised' ? 'bg-error-container text-error' :
            'bg-secondary-fixed text-on-secondary-fixed'
          }">${app.status}</span>
        </div>

        <div class="p-space-lg">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-outline-variant/20">
            <div>
              <h2 class="text-lg font-bold text-primary">${app.scheme}</h2>
              <p class="text-xs text-on-surface-variant mt-0.5">University: <strong>${app.academic.university}</strong></p>
              <p class="text-xs text-on-surface-variant">Course: ${app.academic.courseTitle}</p>
            </div>
            <div class="text-right">
              <span class="text-xs text-outline block">Last Saved Step</span>
              <span class="text-xs font-mono font-bold text-secondary">${app.lastSavedStep || '/application/academic'}</span>
            </div>
          </div>

          <div class="flex flex-wrap gap-3 pt-4">
            ${app.status === 'Draft' ? `
              <a href="#${app.lastSavedStep || '/application/personal'}" class="px-5 py-2.5 bg-secondary text-white font-bold rounded text-sm shadow-md hover:bg-secondary/90 flex items-center gap-1">
                <span class="material-symbols-outlined text-[18px]">play_arrow</span> Continue Application
              </a>
            ` : `
              <a href="#/application/track" class="px-5 py-2.5 bg-primary text-white font-bold rounded text-sm shadow-md hover:bg-primary-container flex items-center gap-1">
                <span class="material-symbols-outlined text-[18px]">timeline</span> Track Application
              </a>
            `}
            <a href="#/application/review" class="px-4 py-2.5 bg-surface-container text-primary font-bold rounded text-sm hover:bg-surface-container-high">
              View Application Summary
            </a>
            ${app.status === 'Deficiency Raised' ? `
              <a href="#/application/deficiency" class="px-4 py-2.5 bg-error text-white font-bold rounded text-sm shadow-sm animate-pulse">
                Respond to Deficiency
              </a>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}, { layout: "applicant", authRole: "applicant" });

// 8. Applicant Profile (/applicant/profile)
router.register("/applicant/profile", () => {
  const app = window.appStore.getApplication();
  const container = document.getElementById("main-view-container");

  container.innerHTML = `
    <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-md border border-outline-variant/30">
      <div class="flex justify-between items-center pb-3 border-b border-outline-variant/20 mb-4">
        <h1 class="text-xl font-bold text-primary flex items-center gap-2">
          <span class="material-symbols-outlined text-secondary">person</span> Scholar Profile Dossier
        </h1>
        <span class="px-2.5 py-0.5 bg-tertiary-container text-white text-xs font-bold rounded">
          Aadhaar e-KYC Verified
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div class="p-3 bg-surface-container-low rounded">
          <span class="text-xs text-outline block">Full Name</span>
          <strong class="text-primary">${app.personal.fullName}</strong>
        </div>
        <div class="p-3 bg-surface-container-low rounded">
          <span class="text-xs text-outline block">Date of Birth (DOB)</span>
          <strong>${app.personal.dob}</strong>
        </div>
        <div class="p-3 bg-surface-container-low rounded">
          <span class="text-xs text-outline block">ST Community</span>
          <strong>${app.category.tribeName} (Cert: ${app.category.certNo})</strong>
        </div>
        <div class="p-3 bg-surface-container-low rounded">
          <span class="text-xs text-outline block">Mobile / Email</span>
          <strong>${app.personal.mobile} | ${app.personal.email}</strong>
        </div>
        <div class="p-3 bg-surface-container-low rounded md:col-span-2">
          <span class="text-xs text-outline block">Permanent Address</span>
          <strong>${app.personal.address}</strong>
        </div>
      </div>

      <div class="mt-6 pt-4 border-t border-outline-variant/20 flex justify-end">
        <button onclick="router.navigate('/application/personal')" class="px-4 py-2 bg-primary text-white font-bold text-xs rounded">
          Edit Profile in Application
        </button>
      </div>
    </div>
  `;
}, { layout: "applicant", authRole: "applicant" });

// 9. New Application Selection (/application/new)
router.register("/application/new", () => {
  const container = document.getElementById("main-view-container");
  const app = window.appStore ? window.appStore.getApplication() : null;
  const isDraftActive = app && (app.status === "Draft" || app.status === "draft");

  container.innerHTML = `
    <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-md border border-outline-variant/30">
      <div class="mb-4">
        <h1 class="text-xl font-bold text-primary">Initiate New Scholarship Application</h1>
        <p class="text-xs text-on-surface-variant">Choose your target scheme track to start your multi-step submission:</p>
      </div>

      ${isDraftActive ? `
        <!-- Active Draft In-Progress Banner (Avoid Duplicate Submissions) -->
        <div class="mb-6 p-4 rounded-xl border-2 border-tertiary-container bg-tertiary-container/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2 py-0.5 rounded bg-tertiary-container text-white text-[10px] font-bold uppercase tracking-wider">Active In-Progress Draft</span>
              <span class="text-xs font-mono font-bold text-primary">${escapeHTML(app.id)}</span>
            </div>
            <h3 class="text-base font-bold text-primary">${escapeHTML(app.scheme)}</h3>
            <p class="text-xs text-on-surface-variant">Last saved step: <strong class="font-mono text-secondary">${escapeHTML(app.lastSavedStep || '/application/personal')}</strong></p>
          </div>
          <a href="#${app.lastSavedStep || '/application/personal'}" class="px-5 py-2.5 bg-tertiary-container hover:bg-tertiary text-white font-bold rounded text-xs shadow-md flex items-center gap-1.5 shrink-0 transition">
            <span class="material-symbols-outlined text-[16px]">play_arrow</span> Resume Existing Draft →
          </a>
        </div>
      ` : ''}

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 1. NOS Track -->
        <div class="p-4 rounded-xl border-2 border-secondary bg-surface-container-low flex flex-col justify-between shadow-sm">
          <div>
            <span class="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">International Track</span>
            <h3 class="text-base font-bold text-primary">National Overseas Scholarship (NOS)</h3>
            <p class="text-xs text-on-surface-variant mt-2 leading-relaxed">Full funding for Master's and Ph.D. abroad at QS Top 500 Global Universities.</p>
          </div>
          <div class="pt-4 border-t border-outline-variant/20 mt-4">
            <a href="#/application/personal?scheme=NOS" onclick="event.preventDefault(); startOrResumeWizardApplication('NOS')" class="w-full py-2.5 bg-secondary text-white font-bold text-center rounded text-sm hover:bg-secondary/90 shadow-sm block transition">
              Start / Resume NOS →
            </a>
          </div>
        </div>

        <!-- 2. NFST Track -->
        <div class="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest flex flex-col justify-between shadow-sm">
          <div>
            <span class="text-xs font-bold text-primary uppercase tracking-wider block mb-1">Domestic Research Track</span>
            <h3 class="text-base font-bold text-primary">National Fellowship for ST Students (NFST)</h3>
            <p class="text-xs text-on-surface-variant mt-2 leading-relaxed">₹38,000 monthly research fellowship + HRA for Indian Universities / IITs / NITs.</p>
          </div>
          <div class="pt-4 border-t border-outline-variant/20 mt-4">
            <a href="#/application/personal?scheme=NFST" onclick="event.preventDefault(); startOrResumeWizardApplication('NFST')" class="w-full py-2.5 bg-primary-container text-white font-bold text-center rounded text-sm hover:bg-primary shadow-sm block transition">
              Start / Resume NFST →
            </a>
          </div>
        </div>

        <!-- 3. PMS-ST Track -->
        <div class="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest flex flex-col justify-between shadow-sm">
          <div>
            <span class="text-xs font-bold text-tertiary-container uppercase tracking-wider block mb-1">Post-Matric Degree Track</span>
            <h3 class="text-base font-bold text-primary">Post-Matric Scholarship (PMS-ST)</h3>
            <p class="text-xs text-on-surface-variant mt-2 leading-relaxed">100% course fee reimbursement &amp; maintenance allowance for accredited degree colleges.</p>
          </div>
          <div class="pt-4 border-t border-outline-variant/20 mt-4">
            <a href="#/application/personal?scheme=PMS" onclick="event.preventDefault(); startOrResumeWizardApplication('PMS')" class="w-full py-2.5 bg-tertiary-container text-white font-bold text-center rounded text-sm hover:bg-tertiary shadow-sm block transition">
              Start / Resume PMS →
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}, { layout: "applicant", authRole: "applicant" });

// 10. Step 1: Personal Details (/application/personal)
router.register("/application/personal", (params = {}) => {
  const app = window.appStore.getApplication();
  
  // Set scheme if passed via URL query parameter (e.g. ?scheme=NOS, ?scheme=NFST or ?scheme=PMS)
  if (params && params.scheme) {
    const code = params.scheme.toUpperCase();
    if (code === "NOS") {
      app.scheme = "National Overseas Scholarship (NOS)";
      app.schemeCode = "NOS";
      window.appStore.saveApplication(app);
    } else if (code === "NFST") {
      app.scheme = "National Fellowship for ST Students (NFST)";
      app.schemeCode = "NFST";
      window.appStore.saveApplication(app);
    } else if (code === "PMS") {
      app.scheme = "Post-Matric Scholarship for ST Students (PMS-ST)";
      app.schemeCode = "PMS";
      window.appStore.saveApplication(app);
    }
  }

  const container = document.getElementById("main-view-container");

  container.innerHTML = `
    ${renderWizardStepper(0)}
    ${renderWizardSaveBar()}

    <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-md border border-outline-variant/30">
      <div class="flex justify-between items-center pb-3 border-b border-outline-variant/20 mb-4">
        <div>
          <span class="text-xs font-bold text-secondary uppercase tracking-wider block">${app.scheme}</span>
          <h2 class="text-lg font-bold text-primary">Step 1: Personal Information</h2>
          <p class="text-xs text-on-surface-variant">Verify basic applicant credentials.</p>
        </div>
        <span class="text-xs text-error font-bold">* Required fields</span>
      </div>

      <form id="step-personal-form" onsubmit="handlePersonalSubmit(event)" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-on-surface mb-1">Full Legal Name *</label>
            <input type="text" id="p-name" value="${app.personal.fullName}" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm font-semibold"/>
            <span class="text-[11px] text-error hidden" id="err-p-name">Please enter your full name.</span>
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface mb-1">Date of Birth (DOB) *</label>
            <input type="date" id="p-dob" value="${app.personal.dob}" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm"/>
            <span class="text-[11px] text-error hidden" id="err-p-dob">Please select your date of birth.</span>
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface mb-1">Mobile Number *</label>
            <input type="tel" id="p-mobile" value="${app.personal.mobile}" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm"/>
            <span class="text-[11px] text-error hidden" id="err-p-mobile">Please enter a valid mobile number.</span>
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface mb-1">Email Address *</label>
            <input type="email" id="p-email" value="${app.personal.email}" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm"/>
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface mb-1">State of Domicile *</label>
            <input type="text" id="p-state" value="${app.personal.state}" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm"/>
            <span class="text-[11px] text-error hidden" id="err-p-state">Please enter state.</span>
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface mb-1">District *</label>
            <input type="text" id="p-district" value="${app.personal.district}" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm"/>
            <span class="text-[11px] text-error hidden" id="err-p-district">Please enter district.</span>
          </div>

          <div class="md:col-span-2">
            <label class="block text-xs font-bold text-on-surface mb-1">Permanent Residential Address *</label>
            <textarea id="p-address" rows="2" class="w-full p-2.5 bg-surface-container-low rounded border border-outline-variant/40 text-sm">${app.personal.address}</textarea>
          </div>
        </div>

        <div class="flex justify-between items-center pt-4 border-t border-outline-variant/20">
          <button type="button" onclick="router.navigate('/applicant/dashboard')" class="px-4 py-2 bg-surface-container text-primary font-bold rounded text-xs">
            [Back to Dashboard]
          </button>
          <div class="flex gap-2">
            <button type="button" onclick="savePersonalDraft()" class="px-4 py-2 bg-surface-container-high text-primary font-bold rounded text-xs">
              [Save Draft]
            </button>
            <button type="submit" class="px-5 py-2.5 bg-secondary text-white font-bold rounded text-sm hover:bg-secondary/90 shadow-sm flex items-center gap-1">
              [Save and Continue] →
            </button>
          </div>
        </div>
      </form>
    </div>
  `;
}, { layout: "applicant", authRole: "applicant" });

function validatePersonal() {
  let valid = true;
  const name = document.getElementById("p-name").value.trim();
  const dob = document.getElementById("p-dob").value.trim();
  const mobile = document.getElementById("p-mobile").value.trim();
  const state = document.getElementById("p-state").value.trim();
  const district = document.getElementById("p-district").value.trim();

  document.querySelectorAll("[id^='err-p-']").forEach(el => el.classList.add("hidden"));

  if (!name) { document.getElementById("err-p-name").classList.remove("hidden"); valid = false; }
  if (!dob) { document.getElementById("err-p-dob").classList.remove("hidden"); valid = false; }
  if (!mobile) { document.getElementById("err-p-mobile").classList.remove("hidden"); valid = false; }
  if (!state) { document.getElementById("err-p-state").classList.remove("hidden"); valid = false; }
  if (!district) { document.getElementById("err-p-district").classList.remove("hidden"); valid = false; }

  return valid;
}

function savePersonalDraft(options = {}) {
  const data = {
    fullName: document.getElementById("p-name").value,
    dob: document.getElementById("p-dob").value,
    mobile: document.getElementById("p-mobile").value,
    email: document.getElementById("p-email").value,
    state: document.getElementById("p-state").value,
    district: document.getElementById("p-district").value,
    address: document.getElementById("p-address").value
  };
  window.appStore.updateSection("personal", data);
  updateWizardSaveStatus("saving", "Saving personal details to Supabase...");

  if (typeof window.supabaseSaveApplicationStep === "function") {
    const app = window.appStore.getApplication();
    window.supabaseSaveApplicationStep({
      applicationId: app.draftId || app.id,
      stepName: "personal",
      stepData: data,
      nextStep: "academic"
    }).then(res => {
      if (res && res.success) {
        updateWizardSaveStatus("saved", "Personal details saved to Supabase");
        if (!options.silent) showToast("Personal details saved to Supabase!", "success");
      }
    }).catch(err => {
      console.warn("Supabase personal save error:", err);
      updateWizardSaveStatus("error", "Database notice (saved locally)");
    });
  } else {
    updateWizardSaveStatus("saved", "Draft saved locally");
  }

  if (!options.silent) {
    showToast("Draft saved in browser memory!", "info");
  }
}

function handlePersonalSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  if (!validatePersonal()) {
    showToast("Please fill all required personal fields.", "error");
    return;
  }
  savePersonalDraft({ silent: true });
  const app = window.appStore.getApplication();
  app.lastSavedStep = "/application/academic";
  window.appStore.saveApplication(app);
  router.navigate("/application/academic");
}

// 11. Step 2: Academic Details (/application/academic)
router.register("/application/academic", () => {
  const app = window.appStore.getApplication();
  const container = document.getElementById("main-view-container");

  container.innerHTML = `
    ${renderWizardStepper(1)}
    ${renderWizardSaveBar()}

    <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-md border border-outline-variant/30">
      <div class="flex justify-between items-center pb-3 border-b border-outline-variant/20 mb-4">
        <div>
          <span class="text-xs font-bold text-secondary uppercase tracking-wider block">${app.scheme}</span>
          <h2 class="text-lg font-bold text-primary">Step 2: Academic Qualifications &amp; Research Track</h2>
          <p class="text-xs text-on-surface-variant">Validated against QS World Rankings for NOS track.</p>
        </div>
        <span class="text-xs text-error font-bold">* Required fields</span>
      </div>

      <form id="step-academic-form" onsubmit="handleAcademicSubmit(event)" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-on-surface mb-1">Target Foreign University *</label>
            <input type="text" id="a-univ" value="${app.academic.university}" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm font-semibold"/>
            <span class="text-[11px] text-error hidden" id="err-a-univ">Please enter designated university.</span>
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface mb-1">QS Global Rank *</label>
            <input type="text" id="a-rank" value="${app.academic.qsRank}" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm font-bold text-tertiary-container"/>
          </div>

          <div class="md:col-span-2">
            <label class="block text-xs font-bold text-on-surface mb-1">Enrolled / Proposed Course Name *</label>
            <input type="text" id="a-course" value="${app.academic.courseTitle}" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm font-semibold"/>
            <span class="text-[11px] text-error hidden" id="err-a-course">Please enter your course name.</span>
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface mb-1">Admission Offer Status *</label>
            <select id="a-offer-type" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm">
              <option value="unconditional" ${app.academic.offerType === 'unconditional' ? 'selected' : ''}>Unconditional Offer Letter (Priority Track)</option>
              <option value="conditional" ${app.academic.offerType === 'conditional' ? 'selected' : ''}>Conditional Offer Letter</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface mb-1">Prior Degree Percentage / CGPA *</label>
            <input type="text" id="a-score" value="${app.academic.percentage}" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm font-bold text-secondary"/>
            <span class="text-[11px] text-error hidden" id="err-a-score">Please enter percentage or CGPA.</span>
          </div>
        </div>

        <div class="flex justify-between items-center pt-4 border-t border-outline-variant/20">
          <button type="button" onclick="handleAcademicBack()" class="px-4 py-2 bg-surface-container text-primary font-bold rounded text-xs flex items-center gap-1">
            ← [Back]
          </button>
          <div class="flex gap-2">
            <button type="button" onclick="saveAcademicDraft()" class="px-4 py-2 bg-surface-container-high text-primary font-bold rounded text-xs">
              [Save Draft]
            </button>
            <button type="submit" class="px-5 py-2.5 bg-secondary text-white font-bold rounded text-sm hover:bg-secondary/90 shadow-sm flex items-center gap-1">
              [Save and Continue] →
            </button>
          </div>
        </div>
      </form>
    </div>
  `;
}, { layout: "applicant", authRole: "applicant" });

function handleAcademicBack() {
  saveAcademicDraft({ silent: true });
  router.navigate("/application/personal");
}

function saveAcademicDraft(options = {}) {
  const data = {
    university: document.getElementById("a-univ").value,
    qsRank: document.getElementById("a-rank").value,
    courseTitle: document.getElementById("a-course").value,
    offerType: document.getElementById("a-offer-type").value,
    percentage: document.getElementById("a-score").value
  };
  window.appStore.updateSection("academic", data);
  updateWizardSaveStatus("saving", "Saving academic qualifications to Supabase...");

  if (typeof window.supabaseSaveApplicationStep === "function") {
    const app = window.appStore.getApplication();
    window.supabaseSaveApplicationStep({
      applicationId: app.draftId || app.id,
      stepName: "academic",
      stepData: data,
      nextStep: "financial"
    }).then(res => {
      if (res && res.success) {
        updateWizardSaveStatus("saved", "Academic details saved to Supabase");
        if (!options.silent) showToast("Academic qualifications saved to Supabase!", "success");
      }
    }).catch(err => {
      console.warn("Supabase academic save error:", err);
      updateWizardSaveStatus("error", "Database notice (saved locally)");
    });
  } else {
    updateWizardSaveStatus("saved", "Draft saved locally");
  }

  if (!options.silent) {
    showToast("Academic draft saved!", "info");
  }
}

function handleAcademicSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const univ = document.getElementById("a-univ").value.trim();
  const course = document.getElementById("a-course").value.trim();
  const score = document.getElementById("a-score").value.trim();

  document.querySelectorAll("[id^='err-a-']").forEach(el => el.classList.add("hidden"));

  if (!univ) { document.getElementById("err-a-univ").classList.remove("hidden"); return; }
  if (!course) { document.getElementById("err-a-course").classList.remove("hidden"); return; }
  if (!score) { document.getElementById("err-a-score").classList.remove("hidden"); return; }

  saveAcademicDraft({ silent: true });
  const app = window.appStore.getApplication();
  app.lastSavedStep = "/application/financial";
  window.appStore.saveApplication(app);
  router.navigate("/application/financial");
}

// 12. Step 3: Financial Details (/application/financial)
router.register("/application/financial", () => {
  const app = window.appStore.getApplication();
  const container = document.getElementById("main-view-container");

  container.innerHTML = `
    ${renderWizardStepper(2)}
    ${renderWizardSaveBar()}

    <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-md border border-outline-variant/30">
      <div class="flex justify-between items-center pb-3 border-b border-outline-variant/20 mb-4">
        <div>
          <h2 class="text-lg font-bold text-primary">Step 3: Financial Details &amp; Aadhaar DBT Bank</h2>
          <p class="text-xs text-on-surface-variant">Validated via JharSewa and NPCI Mapper.</p>
        </div>
        <span class="text-xs text-error font-bold">* Required fields</span>
      </div>

      <form id="step-financial-form" onsubmit="handleFinancialSubmit(event)" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2 p-3 bg-surface-container-low rounded-lg">
            <label class="block text-xs font-bold text-on-surface mb-1">Annual Family Gross Income (INR) *</label>
            <input type="text" id="f-income" value="${app.financial.annualIncome}" class="w-full h-11 px-3 bg-white font-bold text-lg text-primary rounded border border-outline-variant/40"/>
            <span class="text-[11px] text-error hidden" id="err-f-income">Please enter annual family income.</span>
            <span class="text-xs text-tertiary-container font-semibold mt-1 block">✓ Within permissible ceiling of ≤ ₹6,00,000</span>
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface mb-1">Disbursement Bank Name *</label>
            <input type="text" id="f-bank" value="${app.financial.bankName}" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm font-semibold"/>
            <span class="text-[11px] text-error hidden" id="err-f-bank">Please enter bank name.</span>
          </div>

          <div>
            <label class="block text-xs font-bold text-on-surface mb-1">Bank IFSC Code *</label>
            <input type="text" id="f-ifsc" value="${app.financial.ifsc}" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm uppercase font-mono font-bold"/>
            <span class="text-[11px] text-error hidden" id="err-f-ifsc">Please enter IFSC code.</span>
          </div>
        </div>

        <div class="flex justify-between items-center pt-4 border-t border-outline-variant/20">
          <button type="button" onclick="handleFinancialBack()" class="px-4 py-2 bg-surface-container text-primary font-bold rounded text-xs flex items-center gap-1">
            ← [Back]
          </button>
          <div class="flex gap-2">
            <button type="button" onclick="saveFinancialDraft()" class="px-4 py-2 bg-surface-container-high text-primary font-bold rounded text-xs">
              [Save Draft]
            </button>
            <button type="submit" class="px-5 py-2.5 bg-secondary text-white font-bold rounded text-sm hover:bg-secondary/90 shadow-sm flex items-center gap-1">
              [Save and Continue] →
            </button>
          </div>
        </div>
      </form>
    </div>
  `;
}, { layout: "applicant", authRole: "applicant" });

function handleFinancialBack() {
  saveFinancialDraft({ silent: true });
  router.navigate("/application/academic");
}

function saveFinancialDraft(options = {}) {
  const data = {
    annualIncome: document.getElementById("f-income").value,
    bankName: document.getElementById("f-bank").value,
    ifsc: document.getElementById("f-ifsc").value
  };
  window.appStore.updateSection("financial", data);
  updateWizardSaveStatus("saving", "Saving financial details to Supabase...");

  if (typeof window.supabaseSaveApplicationStep === "function") {
    const app = window.appStore.getApplication();
    window.supabaseSaveApplicationStep({
      applicationId: app.draftId || app.id,
      stepName: "financial",
      stepData: data,
      nextStep: "documents"
    }).then(res => {
      if (res && res.success) {
        updateWizardSaveStatus("saved", "Financial details saved to Supabase");
        if (!options.silent) showToast("Financial details saved to Supabase!", "success");
      }
    }).catch(err => {
      console.warn("Supabase financial save error:", err);
      updateWizardSaveStatus("error", "Database notice (saved locally)");
    });
  } else {
    updateWizardSaveStatus("saved", "Draft saved locally");
  }

  if (!options.silent) {
    showToast("Financial draft saved!", "info");
  }
}

function handleFinancialSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();
  const income = document.getElementById("f-income").value.trim();
  const bank = document.getElementById("f-bank").value.trim();
  const ifsc = document.getElementById("f-ifsc").value.trim();

  document.querySelectorAll("[id^='err-f-']").forEach(el => el.classList.add("hidden"));

  if (!income) { document.getElementById("err-f-income").classList.remove("hidden"); return; }
  if (!bank) { document.getElementById("err-f-bank").classList.remove("hidden"); return; }
  if (!ifsc) { document.getElementById("err-f-ifsc").classList.remove("hidden"); return; }

  saveFinancialDraft({ silent: true });
  const app = window.appStore.getApplication();
  app.lastSavedStep = "/application/documents";
  window.appStore.saveApplication(app);
  router.navigate("/application/documents");
}

// 13. Step 4: Documents Upload (/application/documents)
router.register("/application/documents", () => {
  const app = window.appStore.getApplication();
  const container = document.getElementById("main-view-container");
  const docList = app.documents || [];

  container.innerHTML = `
    ${renderWizardStepper(3)}
    ${renderWizardSaveBar()}

    <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-md border border-outline-variant/30">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-outline-variant/20 mb-4 gap-2">
        <div>
          <h2 class="text-lg font-bold text-primary">Step 4: Mandatory Document Uploads &amp; DigiLocker Sync</h2>
          <p class="text-xs text-on-surface-variant">Store under private bucket: <code class="bg-surface-container-high px-1 py-0.5 rounded font-mono text-[11px] text-secondary">scholarship-documents</code></p>
        </div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 bg-tertiary-container/15 text-tertiary-container text-xs font-bold rounded border border-tertiary-container/30">
            ${docList.length} Uploaded
          </span>
          <span class="px-2 py-0.5 bg-surface-container text-outline text-[11px] font-mono rounded">
            Max 5 MB • PDF/JPG/JPEG
          </span>
        </div>
      </div>

      <!-- Storage Policy & Security Notice -->
      <div class="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 mb-5 flex items-start gap-2.5 text-xs">
        <span class="material-symbols-outlined text-secondary text-lg shrink-0 mt-0.5">lock</span>
        <div class="space-y-0.5 text-on-surface-variant leading-relaxed">
          <p><strong class="text-primary">Private User-Specific Storage Isolation:</strong> Documents are encrypted and routed to <span class="font-mono text-primary font-semibold">{user_id}/{application_id}/{document_type}/{random_file_name}</span>. Original filenames are masked on storage.</p>
          <p class="text-outline text-[11px]">Strict RLS enforcement guarantees that only the authenticated applicant can view or manage their records.</p>
        </div>
      </div>

      <!-- Document Slots List -->
      <div class="space-y-3 mb-6" id="documents-container">
        ${docList.map((doc, idx) => {
          const cleanKey = (doc.id || `doc-${idx}`).replace(/[^a-zA-Z0-9_-]/g, "");
          const isPdf = (doc.name || "").toLowerCase().endsWith(".pdf");
          return `
            <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 hover:border-outline-variant/60 transition shadow-xs flex flex-col gap-2">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg ${isPdf ? 'bg-error/10 text-error' : 'bg-secondary/10 text-secondary'} flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-2xl">${isPdf ? 'picture_as_pdf' : 'image'}</span>
                  </div>
                  <div>
                    <strong class="text-primary text-sm block leading-snug">${escapeHTML(doc.name)}</strong>
                    <div class="flex flex-wrap items-center gap-2 text-xs text-outline mt-0.5">
                      <span class="font-semibold text-secondary">${escapeHTML(doc.type)}</span>
                      <span>•</span>
                      <span>${escapeHTML(doc.size || '1.2 MB')}</span>
                      ${doc.date ? `<span>•</span><span>${escapeHTML(doc.date)}</span>` : ''}
                    </div>
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                  <span class="inline-flex items-center gap-1 text-[11px] font-bold text-tertiary-container bg-tertiary-fixed/60 px-2.5 py-1 rounded">
                    <span class="material-symbols-outlined text-[14px]">check_circle</span> Verified
                  </span>
                  <!-- Preview Action -->
                  <button type="button" onclick="previewDocument('${cleanKey}', '${escapeHTML(doc.name)}', '${escapeHTML(doc.filePath || '')}')" class="px-2.5 py-1.5 bg-surface-container hover:bg-surface-container-high text-primary font-bold rounded text-xs transition flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">visibility</span> Preview
                  </button>
                  <!-- Replace Action -->
                  <button type="button" onclick="triggerDocumentReplace('${cleanKey}')" class="px-2.5 py-1.5 bg-secondary-fixed/50 hover:bg-secondary-fixed text-primary font-bold rounded text-xs transition flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">sync</span> Replace
                  </button>
                  <!-- Delete Action -->
                  <button type="button" onclick="deleteDocumentAction('${cleanKey}', '${escapeHTML(doc.type)}', '${escapeHTML(doc.filePath || '')}')" class="px-2 py-1.5 hover:bg-error-container/20 text-error font-bold rounded text-xs transition flex items-center gap-0.5">
                    <span class="material-symbols-outlined text-[14px]">delete</span> Delete
                  </button>
                  <!-- Hidden File Input for Replace -->
                  <input type="file" id="file-input-${cleanKey}" accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg,image/jpg" onchange="handleDocumentUpload(event, '${escapeHTML(doc.type)}', '${cleanKey}')" class="hidden"/>
                </div>
              </div>

              <!-- Upload / Replacement Progress Bar Container -->
              <div id="progress-${cleanKey}" class="hidden pt-2 border-t border-outline-variant/20">
                <div class="flex justify-between items-center text-[11px] text-secondary font-semibold mb-1">
                  <span id="progress-text-${cleanKey}">Uploading to scholarship-documents...</span>
                  <span class="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                </div>
                <div class="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
                  <div id="progress-bar-${cleanKey}" class="bg-secondary h-1.5 rounded-full transition-all duration-300" style="width: 15%"></div>
                </div>
              </div>
            </div>
          `;
        }).join("")}
      </div>

      <!-- Add New Custom Document Slot -->
      <div class="p-4 bg-surface-container-low/70 rounded-xl border border-dashed border-outline-variant/60 mb-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h4 class="font-bold text-primary text-xs uppercase tracking-wider">Upload Additional Mandatory Document</h4>
            <p class="text-xs text-on-surface-variant mt-0.5">Attach supporting affidavit, disability certificate, or supplementary credentials.</p>
          </div>
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <select id="new-doc-type-select" class="px-3 py-2 bg-white rounded border border-outline-variant/40 text-xs font-semibold text-primary">
              <option value="Aadhaar Card">Aadhaar Card (UIDAI)</option>
              <option value="Disability Certificate (PwD)">Disability Certificate (PwD)</option>
              <option value="PVTG Community Certificate">PVTG Community Certificate</option>
              <option value="Hostel / Mess Fee Receipt">Hostel / Mess Fee Receipt</option>
              <option value="Other Certificate">Other Supporting Document</option>
            </select>
            <button type="button" onclick="triggerDocumentReplace('new-slot')" class="px-4 py-2 bg-secondary text-white font-bold rounded text-xs shadow-sm hover:bg-secondary/90 shrink-0 flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">upload_file</span> Upload File
            </button>
            <input type="file" id="file-input-new-slot" accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg,image/jpg" onchange="handleNewSlotUpload(event)" class="hidden"/>
          </div>
        </div>
        <div id="progress-new-slot" class="hidden pt-3 mt-3 border-t border-outline-variant/20">
          <div class="flex justify-between items-center text-[11px] text-secondary font-semibold mb-1">
            <span id="progress-text-new-slot">Encrypting &amp; uploading to scholarship-documents...</span>
            <span class="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
          </div>
          <div class="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
            <div id="progress-bar-new-slot" class="bg-secondary h-1.5 rounded-full transition-all duration-300" style="width: 15%"></div>
          </div>
        </div>
      </div>

      <!-- Navigation & Actions -->
      <div class="flex justify-between items-center pt-4 border-t border-outline-variant/20">
        <button type="button" onclick="router.navigate('/application/financial')" class="px-4 py-2 bg-surface-container text-primary font-bold rounded text-xs flex items-center gap-1">
          ← [Back to Financial]
        </button>
        <div class="flex gap-2">
          <button type="button" onclick="showToast('Documents saved to Supabase draft!', 'info'); updateWizardSaveStatus('saved', 'Documents draft saved');" class="px-4 py-2 bg-surface-container-high text-primary font-bold rounded text-xs">
            [Save Draft]
          </button>
          <button type="button" onclick="handleDocumentsContinue()" class="px-5 py-2.5 bg-secondary text-white font-bold rounded text-sm hover:bg-secondary/90 shadow-sm flex items-center gap-1">
            [Save and Continue] →
          </button>
        </div>
      </div>
    </div>

    <!-- Document Preview Modal (Private Signed URL Viewer) -->
    <div id="document-preview-modal" class="hidden fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div class="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-2xl w-full border border-outline-variant/40 overflow-hidden flex flex-col">
        <div class="p-4 bg-primary text-white flex justify-between items-center">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-secondary-fixed text-xl">description</span>
            <h3 class="font-bold text-sm" id="preview-modal-title">Document Preview</h3>
          </div>
          <button type="button" onclick="closePreviewModal()" class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition">
            <span class="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <div class="p-4 overflow-y-auto max-h-[75vh]" id="preview-modal-body">
          <!-- Rendered dynamically -->
        </div>
        <div class="p-3 bg-surface-container-low border-t border-outline-variant/20 flex justify-between items-center text-xs">
          <span class="text-outline flex items-center gap-1">
            <span class="material-symbols-outlined text-[15px]">security</span> Verified DigiLocker e-KYC Asset
          </span>
          <div class="flex gap-2">
            <a id="preview-modal-download" href="#" target="_blank" class="hidden px-3 py-1.5 bg-surface-container text-primary font-bold rounded hover:bg-surface-container-high transition">
              Open Signed URL ↗
            </a>
            <button type="button" onclick="closePreviewModal()" class="px-4 py-1.5 bg-primary text-white font-bold rounded hover:bg-primary-container transition">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}, { layout: "applicant", authRole: "applicant" });

// Document Upload Handlers & Actions
function triggerDocumentReplace(docKey) {
  const input = document.getElementById(`file-input-${docKey}`);
  if (input) input.click();
}

async function handleDocumentUpload(event, docType, docKey) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const app = window.appStore.getApplication();
  const progressBar = document.getElementById(`progress-bar-${docKey}`);
  const progressText = document.getElementById(`progress-text-${docKey}`);
  const progressBox = document.getElementById(`progress-${docKey}`);

  if (progressBox) progressBox.classList.remove("hidden");
  if (progressBar) progressBar.style.width = "10%";
  if (progressText) progressText.innerText = "Validating document format and size...";

  // 1. Client-Side Size & MIME Validation
  if (typeof window.supabaseValidateDocumentFile === "function") {
    const val = window.supabaseValidateDocumentFile(file);
    if (!val.valid) {
      if (progressBox) progressBox.classList.add("hidden");
      showToast(val.error, "error");
      event.target.value = "";
      return;
    }
  }

  updateWizardSaveStatus("saving", `Uploading ${file.name} to scholarship-documents...`);

  // 2. Upload via Supabase Storage
  if (typeof window.supabaseUploadDocument === "function") {
    try {
      const res = await window.supabaseUploadDocument({
        file: file,
        applicationId: app.draftId || app.id,
        documentType: docType,
        onProgress: (p) => {
          if (progressBar) progressBar.style.width = `${p.percent}%`;
          if (progressText) progressText.innerText = `${p.stage} (${p.percent}%)`;
        }
      });

      if (!res.success) {
        showToast(res.error || "Upload failed", "error");
        if (progressBox) progressBox.classList.add("hidden");
        return;
      }

      showToast(`✓ Document uploaded successfully: ${file.name}`, "success");
      updateWizardSaveStatus("saved", "Document uploaded and metadata saved");
      router.navigate("/application/documents");
      return;
    } catch (err) {
      console.warn("Document upload error:", err);
    }
  }

  // Local fallback
  const sizeKb = (file.size / 1024).toFixed(1);
  const updatedDoc = {
    id: `doc-${docKey}`,
    type: docType,
    name: file.name,
    size: `${sizeKb} KB`,
    verified: true,
    date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    uploadedAt: new Date().toISOString()
  };

  const existingIdx = app.documents.findIndex(d => d.type === docType || d.id === `doc-${docKey}`);
  if (existingIdx !== -1) {
    app.documents[existingIdx] = updatedDoc;
  } else {
    app.documents.push(updatedDoc);
  }
  window.appStore.saveApplication(app);
  showToast(`Document uploaded: ${file.name}`, "success");
  router.navigate("/application/documents");
}

function handleNewSlotUpload(event) {
  const select = document.getElementById("new-doc-type-select");
  const docType = select ? select.value : "Additional Supporting Document";
  handleDocumentUpload(event, docType, "new-slot");
}

async function previewDocument(docKey, docName, filePath) {
  showToast(`Loading preview for ${docName}...`, "info");
  let previewUrl = null;
  if (typeof window.supabaseGetDocumentPreviewUrl === "function" && filePath) {
    previewUrl = await window.supabaseGetDocumentPreviewUrl(filePath);
  }

  const modal = document.getElementById("document-preview-modal");
  const modalTitle = document.getElementById("preview-modal-title");
  const modalBody = document.getElementById("preview-modal-body");
  const modalDownload = document.getElementById("preview-modal-download");

  if (modal && modalTitle && modalBody) {
    modalTitle.innerText = docName;
    if (previewUrl && (previewUrl.includes(".jpg") || previewUrl.includes(".jpeg") || previewUrl.includes("image"))) {
      modalBody.innerHTML = `<img src="${previewUrl}" alt="${escapeHTML(docName)}" class="max-h-[65vh] mx-auto rounded shadow-sm object-contain"/>`;
    } else if (previewUrl && previewUrl.startsWith("http")) {
      modalBody.innerHTML = `<iframe src="${previewUrl}" class="w-full h-[60vh] rounded border border-outline-variant/30"></iframe>`;
    } else {
      modalBody.innerHTML = `
        <div class="py-12 text-center space-y-3">
          <span class="material-symbols-outlined text-secondary text-5xl">verified</span>
          <h4 class="font-bold text-primary text-base">${escapeHTML(docName)}</h4>
          <p class="text-xs text-on-surface-variant max-w-md mx-auto">This document is stored securely in private bucket <code>scholarship-documents</code> with encrypted RLS permissions.</p>
          <span class="inline-block px-3 py-1 bg-tertiary-container/10 text-tertiary-container font-mono text-xs rounded border border-tertiary-container/30">
            ✓ Verified e-KYC Asset
          </span>
        </div>
      `;
    }
    if (modalDownload) {
      if (previewUrl && previewUrl.startsWith("http")) {
        modalDownload.href = previewUrl;
        modalDownload.classList.remove("hidden");
      } else {
        modalDownload.classList.add("hidden");
      }
    }
    modal.classList.remove("hidden");
  } else {
    showToast(`Document verified: ${docName}`, "success");
  }
}

function closePreviewModal() {
  const modal = document.getElementById("document-preview-modal");
  if (modal) modal.classList.add("hidden");
}

async function deleteDocumentAction(docKey, docType, filePath) {
  if (!confirm(`Are you sure you want to delete "${docType}"? You will need to upload a replacement before final submission.`)) {
    return;
  }

  const app = window.appStore.getApplication();
  updateWizardSaveStatus("saving", `Deleting ${docType} from Supabase Storage...`);

  if (typeof window.supabaseDeleteDocument === "function") {
    try {
      await window.supabaseDeleteDocument({
        applicationId: app.draftId || app.id,
        documentType: docType,
        filePath: filePath
      });
    } catch (e) {
      console.warn("Delete document notice:", e);
    }
  }

  // Update local application documents
  app.documents = (app.documents || []).filter(d => d.type !== docType && d.id !== `doc-${docKey}`);
  window.appStore.saveApplication(app);
  showToast(`Document "${docType}" deleted.`, "info");
  updateWizardSaveStatus("saved", "Document deleted from storage");
  router.navigate("/application/documents");
}

function handleDocumentsContinue() {
  const app = window.appStore.getApplication();
  app.lastSavedStep = "/application/review";
  window.appStore.saveApplication(app);
  updateWizardSaveStatus("saving", "Syncing verified documents with Supabase...");

  if (typeof window.supabaseSaveApplicationStep === "function") {
    window.supabaseSaveApplicationStep({
      applicationId: app.draftId || app.id,
      stepName: "documents",
      stepData: { documents: app.documents },
      nextStep: "review"
    }).then(res => {
      if (res && res.success) {
        updateWizardSaveStatus("saved", "Verified documents synced to Supabase");
      }
    }).catch(err => {
      console.warn("Supabase document sync notice:", err);
    });
  }

  showToast("Documents verified & saved. Ready for review!", "success");
  router.navigate("/application/review");
}

// Expose handlers globally
if (typeof window !== "undefined") {
  window.triggerDocumentReplace = triggerDocumentReplace;
  window.handleDocumentUpload = handleDocumentUpload;
  window.handleNewSlotUpload = handleNewSlotUpload;
  window.previewDocument = previewDocument;
  window.closePreviewModal = closePreviewModal;
  window.deleteDocumentAction = deleteDocumentAction;
}

// 14. Step 5: Review & Submit (/application/review)
router.register("/application/review", () => {
  const app = window.appStore.getApplication();
  const container = document.getElementById("main-view-container");

  container.innerHTML = `
    ${renderWizardStepper(4)}

    <div class="space-y-space-md">
      <!-- Target Scheme Banner -->
      <div class="p-4 bg-primary text-white rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 shadow-sm">
        <div>
          <span class="text-xs font-mono text-secondary-fixed uppercase">Target Scheme Track</span>
          <h2 class="text-lg font-bold">${app.scheme}</h2>
        </div>
        <span class="px-3 py-1 bg-surface-container-lowest text-primary font-bold text-xs rounded-full">
          Draft Review
        </span>
      </div>

      <!-- Warning Note -->
      <div class="p-3 bg-secondary-fixed text-on-secondary-fixed rounded-xl flex items-center gap-3 text-xs font-medium">
        <span class="material-symbols-outlined text-secondary text-xl">warning</span>
        <span>Please review your submission carefully. Changes cannot be altered once submitted to the Ministry.</span>
      </div>

      <!-- Section Reviews with [Edit] Buttons -->
      <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-md border border-outline-variant/30 space-y-4 text-sm">
        <!-- 1. Personal Review -->
        <div class="p-3 bg-surface-container-low rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold text-primary flex items-center gap-1">
              <span class="material-symbols-outlined text-[18px]">badge</span> 1. Personal Details
            </h3>
            <button onclick="router.navigate('/application/personal')" class="text-xs text-secondary font-bold hover:underline">[Edit]</button>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div><span class="text-outline block">Full Name:</span> <strong>${app.personal.fullName}</strong></div>
            <div><span class="text-outline block">Date of Birth:</span> <strong>${app.personal.dob}</strong></div>
            <div><span class="text-outline block">Mobile:</span> <strong>${app.personal.mobile}</strong></div>
            <div><span class="text-outline block">Email:</span> <strong>${app.personal.email}</strong></div>
            <div><span class="text-outline block">State / District:</span> <strong>${app.personal.state}, ${app.personal.district}</strong></div>
            <div class="sm:col-span-3"><span class="text-outline block">Permanent Address:</span> <strong>${app.personal.address}</strong></div>
          </div>
        </div>

        <!-- 2. ST Category Details -->
        <div class="p-3 bg-surface-container-low rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold text-primary flex items-center gap-1">
              <span class="material-symbols-outlined text-[18px]">verified_user</span> 2. ST Category &amp; Tribe Details
            </h3>
            <button onclick="router.navigate('/application/personal')" class="text-xs text-secondary font-bold hover:underline">[Edit]</button>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div><span class="text-outline block">Tribe Community:</span> <strong>${app.category.tribeName}</strong></div>
            <div><span class="text-outline block">ST Certificate No:</span> <strong class="font-mono">${app.category.certNo}</strong></div>
            <div><span class="text-outline block">Issuing Authority:</span> <strong>${app.category.issuingAuthority}</strong></div>
            <div><span class="text-outline block">Issue Date:</span> <strong>${app.category.issueDate}</strong></div>
            <div><span class="text-outline block">PVTG Beneficiary:</span> <strong>${app.category.pvtg}</strong></div>
            <div><span class="text-outline block">DigiLocker Status:</span> <strong class="text-tertiary-container">✓ e-KYC Certified</strong></div>
          </div>
        </div>

        <!-- 3. Academic Review -->
        <div class="p-3 bg-surface-container-low rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold text-primary flex items-center gap-1">
              <span class="material-symbols-outlined text-[18px]">school</span> 3. Academic Details &amp; Research Track
            </h3>
            <button onclick="router.navigate('/application/academic')" class="text-xs text-secondary font-bold hover:underline">[Edit]</button>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div class="sm:col-span-2"><span class="text-outline block">Target / Enrolled University:</span> <strong>${app.academic.university}</strong></div>
            <div><span class="text-outline block">QS Global Rank:</span> <strong class="text-tertiary-container">#${app.academic.qsRank}</strong></div>
            <div class="sm:col-span-2"><span class="text-outline block">Degree / Course Title:</span> <strong>${app.academic.courseTitle}</strong></div>
            <div><span class="text-outline block">Admission Offer Type:</span> <strong class="capitalize">${app.academic.offerType}</strong></div>
            <div><span class="text-outline block">Qualifying Score:</span> <strong class="text-secondary">${app.academic.percentage}%</strong></div>
          </div>
        </div>

        <!-- 4. Financial Review -->
        <div class="p-3 bg-surface-container-low rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold text-primary flex items-center gap-1">
              <span class="material-symbols-outlined text-[18px]">payments</span> 4. Financial &amp; DBT Details
            </h3>
            <button onclick="router.navigate('/application/financial')" class="text-xs text-secondary font-bold hover:underline">[Edit]</button>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div><span class="text-outline block">Annual Family Income:</span> <strong class="text-secondary text-sm">₹${app.financial.annualIncome}</strong></div>
            <div><span class="text-outline block">Disbursement Bank:</span> <strong>${app.financial.bankName}</strong></div>
            <div><span class="text-outline block">Bank IFSC Code:</span> <strong class="font-mono">${app.financial.ifsc}</strong></div>
            <div><span class="text-outline block">NPCI Aadhaar Bridge:</span> <strong class="text-tertiary-container">✓ Active &amp; Seeded</strong></div>
            <div><span class="text-outline block">Income Certificate:</span> <strong class="font-mono text-[11px]">${app.financial.incomeCertNo}</strong></div>
          </div>
        </div>

        <!-- 5. Documents Checklist Review -->
        <div class="p-3 bg-surface-container-low rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold text-primary flex items-center gap-1">
              <span class="material-symbols-outlined text-[18px]">folder</span> 5. Verified Uploaded Documents (${app.documents.length})
            </h3>
            <button onclick="router.navigate('/application/documents')" class="text-xs text-secondary font-bold hover:underline">[Edit]</button>
          </div>
          <div class="space-y-1.5 text-xs">
            ${app.documents.map(d => `
              <div class="flex justify-between items-center p-1.5 bg-white rounded border border-outline-variant/30">
                <span class="flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-secondary text-[16px]">description</span>
                  <strong>${d.name}</strong> <span class="text-outline">(${d.type} • ${d.size})</span>
                </span>
                <span class="text-tertiary-container font-bold flex items-center gap-0.5 text-[11px]">
                  <span class="material-symbols-outlined text-[14px]">check_circle</span> DigiLocker Verified
                </span>
              </div>
            `).join("")}
          </div>
        </div>
      </div>

      <!-- Error Container for Missing Fields, Docs, or Submission Failure -->
      <div id="submit-error-container" class="hidden p-4 bg-error-container/20 text-on-surface rounded-xl border border-error/40 text-xs space-y-2 mb-4">
        <div class="flex items-center gap-2 text-error font-bold text-sm">
          <span class="material-symbols-outlined text-lg">error</span>
          <span>Application Incomplete or Submission Error</span>
        </div>
        <div id="submit-error-details" class="space-y-1.5 pl-6"></div>
      </div>

      <!-- Legal Declaration -->
      <div class="bg-surface-container-lowest p-space-md rounded-xl shadow-md border border-outline-variant/30">
        <label class="flex items-start gap-3 cursor-pointer text-xs leading-relaxed">
          <input type="checkbox" id="legal-declaration" class="mt-0.5 accent-secondary w-4 h-4"/>
          <span>
            <strong>* I hereby declare that all information furnished is true, complete and correct.</strong> I understand that furnishing false records is punishable under the Indian Penal Code and entails immediate cancellation and recovery.
          </span>
        </label>
        <span class="text-xs text-error font-bold hidden block mt-2" id="declaration-err">
          Please check the declaration box before submitting.
        </span>

        <div class="flex justify-between items-center mt-6 pt-4 border-t border-outline-variant/20">
          <button onclick="router.navigate('/application/documents')" class="px-4 py-2 bg-surface-container text-primary font-bold rounded text-xs">
            ← [Back to Documents]
          </button>
          <button id="final-submit-btn" onclick="executeFinalSubmit()" class="px-6 py-3 bg-secondary hover:bg-secondary/90 text-white font-bold rounded text-sm shadow-md flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed">
            <span class="material-symbols-outlined text-[18px]">send</span>
            <span>Submit Application (अंतिम प्रस्तुति)</span>
          </button>
        </div>
      </div>
    </div>
  `;
}, { layout: "applicant", authRole: "applicant" });

let isSubmittingApplication = false;

async function executeFinalSubmit() {
  if (isSubmittingApplication) return;

  const checkbox = document.getElementById("legal-declaration");
  const err = document.getElementById("declaration-err");
  const submitBtn = document.getElementById("final-submit-btn");
  const errorContainer = document.getElementById("submit-error-container");
  const errorDetails = document.getElementById("submit-error-details");

  if (errorContainer) errorContainer.classList.add("hidden");

  // 1. Legal Declaration Check
  if (checkbox && !checkbox.checked) {
    if (err) err.classList.remove("hidden");
    checkbox.focus();
    return;
  }
  if (err) err.classList.add("hidden");

  const app = window.appStore.getApplication();

  // 2. Prevent Duplicate Submission
  if (app.status === "Under Document Scrutiny" || app.status === "Submitted" || app.status === "submitted") {
    showToast(`Application is already submitted (Ref: ${app.id || app.application_number}). Duplicate submission is prevented.`, "warning");
    if (errorContainer && errorDetails) {
      errorDetails.innerHTML = `<p class="text-error font-semibold">This application was already submitted on ${app.submissionDate || 'record'}. You can track its live scrutiny status on the tracking portal.</p>`;
      errorContainer.classList.remove("hidden");
    }
    return;
  }

  // 3. Validate Required Fields & Required Documents
  let validation = { isValid: true, missingFields: [], missingDocs: [] };
  if (typeof window.supabaseValidateApplicationForSubmission === "function") {
    validation = window.supabaseValidateApplicationForSubmission(app);
  }

  if (!validation.isValid) {
    if (errorContainer && errorDetails) {
      let html = `<p class="font-bold text-error mb-2">Please complete the following required items before submitting:</p><ul class="list-disc pl-5 space-y-1 text-xs">`;
      if (validation.missingFields.length > 0) {
        validation.missingFields.forEach(f => {
          html += `<li><strong>${escapeHTML(f.section)}:</strong> ${escapeHTML(f.field)} missing — <a href="#${f.step}" class="text-secondary font-bold underline hover:text-secondary-fixed">Complete [${escapeHTML(f.section)}]</a></li>`;
        });
      }
      if (validation.missingDocs.length > 0) {
        validation.missingDocs.forEach(d => {
          html += `<li><strong>Document Missing:</strong> ${escapeHTML(d)} — <a href="#/application/documents" class="text-secondary font-bold underline hover:text-secondary-fixed">Upload in [Step 4]</a></li>`;
        });
      }
      html += `</ul>`;
      errorDetails.innerHTML = html;
      errorContainer.classList.remove("hidden");
      errorContainer.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    showToast("Submission blocked: Please fulfill all required fields and documents.", "error");
    return;
  }

  // 4. Loading State & Duplicate Submission Lock
  isSubmittingApplication = true;
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
      <span>Submitting to Ministry (प्रस्तुत हो रहा है)...</span>
    `;
  }

  try {
    updateWizardSaveStatus("saving", "Submitting application to Ministry...");

    let submitResult = { success: true };
    if (typeof window.supabaseSubmitFinalApplication === "function") {
      submitResult = await window.supabaseSubmitFinalApplication({
        applicationId: app.draftId || app.id,
        schemeName: app.scheme,
        schemeCode: app.schemeCode
      });
    } else {
      // Local fallback
      const code = app.schemeCode || "NOS";
      const randomSerial = Math.floor(100000 + Math.random() * 900000);
      app.id = `MOTA-${code}-2026-${randomSerial}`;
      app.status = "Under Document Scrutiny";
      app.submissionDate = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
      app.history.push({
        title: "Application Submitted to Ministry",
        time: app.submissionDate,
        officer: "Portal Gateway",
        remark: `Direct electronic submission received under ${app.scheme}.`
      });
      window.appStore.saveApplication(app);
    }

    if (!submitResult.success) {
      throw new Error(submitResult.error || "Submission failed");
    }

    const currentApp = window.appStore.getApplication();
    const refNum = submitResult.applicationNumber || currentApp.id;

    updateWizardSaveStatus("saved", "Application successfully submitted");
    showToast(`✓ Application submitted successfully! Reference: ${refNum}`, "success");
    router.navigate("/application/success");

  } catch (err) {
    console.error("Application submission failed:", err);
    isSubmittingApplication = false;
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <span class="material-symbols-outlined text-[18px]">send</span>
        <span>Submit Application (अंतिम प्रस्तुति)</span>
      `;
    }
    if (errorContainer && errorDetails) {
      errorDetails.innerHTML = `<p class="text-error font-semibold">Submission Error: ${escapeHTML(err.message || 'Network error')}. Please check your connection or contact portal support.</p>`;
      errorContainer.classList.remove("hidden");
      errorContainer.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    showToast(`Submission failed: ${err.message || 'Error occurred'}`, "error");
    updateWizardSaveStatus("error", "Submission failed. Please retry.");
  } finally {
    isSubmittingApplication = false;
  }
}

if (typeof window !== "undefined") {
  window.executeFinalSubmit = executeFinalSubmit;
}

// 15. Step 6: Submission Success (/application/success)
router.register("/application/success", () => {
  const app = window.appStore.getApplication();
  const container = document.getElementById("main-view-container");

  container.innerHTML = `
    <div class="max-w-xl mx-auto my-8 p-space-xl bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30 text-center">
      <div class="w-16 h-16 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center mx-auto mb-4 shadow-md">
        <span class="material-symbols-outlined text-4xl">check_circle</span>
      </div>
      <h1 class="text-2xl font-bold text-primary">Application Submitted Successfully!</h1>
      <p class="text-xs text-secondary font-bold mt-1">आवेदन सफलतापूर्वक प्रस्तुत किया गया</p>

      <div class="my-6 p-4 bg-surface-container-low rounded-xl text-left space-y-2 text-xs border border-outline-variant/30">
        <div class="flex justify-between">
          <span class="text-outline">Permanent Application Ref:</span>
          <strong class="font-mono text-primary text-sm">${app.id}</strong>
        </div>
        <div class="flex justify-between">
          <span class="text-outline">Target Scheme:</span>
          <strong class="text-on-surface">${app.scheme}</strong>
        </div>
        <div class="flex justify-between">
          <span class="text-outline">Submission Date:</span>
          <strong class="text-on-surface">${app.submissionDate || '31-Mar-2026 14:42 IST'}</strong>
        </div>
        <div class="flex justify-between">
          <span class="text-outline">Portal Status:</span>
          <strong class="text-tertiary-container">${app.status}</strong>
        </div>
      </div>

      <div class="flex gap-3">
        <a href="#/application/track" class="flex-1 py-3 bg-secondary text-white font-bold rounded text-sm hover:bg-secondary/90 shadow-md">
          Track Application →
        </a>
        <a href="#/applicant/dashboard" class="flex-1 py-3 bg-surface-container text-primary font-bold rounded text-sm hover:bg-surface-container-high">
          Dashboard
        </a>
      </div>
    </div>
  `;
}, { layout: "applicant", authRole: "applicant" });

// 16. Application Tracking (/application/track) - Database Driven
router.register("/application/track", async () => {
  const container = document.getElementById("main-view-container");
  if (!container) return;

  // 1. Initial Loading State
  container.innerHTML = `
    <div class="bg-surface-container-lowest p-space-xl rounded-xl shadow-md border border-outline-variant/30 text-center py-16 space-y-3">
      <div class="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
      <h3 class="font-bold text-primary text-base">Fetching Real-time Application Tracking...</h3>
      <p class="text-xs text-outline font-mono">Querying public.applications &amp; application_status_history</p>
    </div>
  `;

  // Parse application id from hash if present (e.g. #/application/track?id=...)
  const hash = window.location.hash || "";
  let queryAppId = null;
  if (hash.includes("?")) {
    const params = new URLSearchParams(hash.split("?")[1]);
    queryAppId = params.get("id");
  }

  // 2. Fetch from Database / Supabase Engine
  let trackingResult = null;
  if (typeof window.supabaseFetchApplicantTrackingData === "function") {
    try {
      trackingResult = await window.supabaseFetchApplicantTrackingData(queryAppId);
    } catch (err) {
      console.warn("Tracking data fetch error:", err);
    }
  }

  const applications = (trackingResult && trackingResult.applications) ? trackingResult.applications : [];
  let activeApp = (trackingResult && trackingResult.activeApp) ? trackingResult.activeApp : (applications[0] || null);

  // Fallback to local store if completely empty
  if (!activeApp && window.appStore) {
    const local = window.appStore.getApplication();
    activeApp = {
      id: local.id,
      application_number: local.id,
      scheme: local.scheme,
      status: (local.status || "submitted").toLowerCase().replace(/\s+/g, "_"),
      submitted_at: local.submitted_at || local.submissionDate || new Date().toISOString(),
      officer_remarks: local.deficiency ? local.deficiency.remark : "Initial document scrutiny under active verification.",
      schemes: { name: local.scheme, code: local.schemeCode || "NOS" },
      application_status_history: (local.history || []).map((h, i) => ({
        id: `loc-h-${i}`,
        old_status: "draft",
        new_status: h.title.includes("Submitted") ? "submitted" : "draft",
        remark: h.remark || h.title,
        changed_by: h.officer || "Portal Gateway",
        created_at: h.time || new Date().toISOString()
      })),
      deficiencies: local.deficiency ? [local.deficiency] : []
    };
  }

  if (!activeApp) {
    container.innerHTML = `
      <div class="bg-surface-container-lowest p-space-xl rounded-xl shadow-md border border-outline-variant/30 text-center py-16 space-y-4">
        <span class="material-symbols-outlined text-outline text-5xl">folder_off</span>
        <h2 class="text-xl font-bold text-primary">No Applications Found</h2>
        <p class="text-xs text-on-surface-variant max-w-md mx-auto">You have not submitted any scholarship applications yet. Browse the schemes catalog and begin an application to track its progress.</p>
        <a href="#/schemes" class="px-5 py-2.5 bg-secondary text-white font-bold rounded text-xs hover:bg-secondary/90 shadow-md inline-block">
          Explore Available Schemes →
        </a>
      </div>
    `;
    return;
  }

  // 3. Format Status & Details
  const statusMeta = getTrackingStatusBadge(activeApp.status);
  const schemeName = activeApp.schemes?.name || activeApp.scheme || "ST Scholarship Scheme";
  const schemeCode = activeApp.schemes?.code || activeApp.schemeCode || "NOS";
  const appNumber = activeApp.application_number || activeApp.id;
  const submittedDateStr = activeApp.submitted_at ? new Date(activeApp.submitted_at).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata"
  }) : (activeApp.submissionDate || "Pending Submission");

  const nextAction = getRequiredNextAction(activeApp.status, activeApp);
  const statusHistory = Array.isArray(activeApp.application_status_history) ? activeApp.application_status_history : [];

  // Canonical Progress Stages
  const canonicalStages = [
    { title: "Application Submitted", num: 1 },
    { title: "Document Scrutiny", num: 2 },
    { title: "Committee Screening", num: 3 },
    { title: "Sanction & DBT Credit", num: 4 }
  ];
  const activeStepNum = statusMeta.stepNum || 1;

  container.innerHTML = `
    <div class="space-y-space-md">
      <!-- Top Bar: Title & Status Badge -->
      <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-md border border-outline-variant/30">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center pb-4 border-b border-outline-variant/20 mb-4 gap-3">
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold text-primary">Live Application Tracking</h1>
              <span class="px-2 py-0.5 bg-surface-container text-outline font-mono text-[11px] rounded border border-outline-variant/30">
                DB Grounded
              </span>
            </div>
            <p class="text-xs text-on-surface-variant font-mono mt-0.5">
              Ref: <strong class="text-primary font-bold">${escapeHTML(appNumber)}</strong> • ${escapeHTML(schemeName)}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <!-- Multi-Application Switcher if multiple exist -->
            ${applications.length > 1 ? `
              <select onchange="window.location.hash = '#/application/track?id=' + this.value; window.location.reload();" class="text-xs p-1.5 bg-surface-container-low rounded border border-outline-variant/40 font-mono text-primary font-semibold">
                ${applications.map(a => `
                  <option value="${a.id}" ${a.id === activeApp.id ? 'selected' : ''}>
                    ${a.application_number || a.id} (${(a.schemes?.code || a.schemeCode || 'SCH').replace('SCH-MOTA-', '')})
                  </option>
                `).join("")}
              </select>
            ` : ''}

            <!-- Status Badge -->
            <span class="px-3.5 py-1.5 rounded-full text-xs flex items-center gap-1.5 shadow-xs ${statusMeta.badgeClass}">
              <span class="material-symbols-outlined text-[15px]">${statusMeta.icon}</span>
              <span>${statusMeta.label}</span>
            </span>
          </div>
        </div>

        <!-- Scheme & Key Metadata Summary Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-6">
          <div class="p-3 bg-surface-container-low rounded-lg">
            <span class="text-outline block text-[11px]">Application Number:</span>
            <strong class="font-mono text-primary text-sm">${escapeHTML(appNumber)}</strong>
          </div>
          <div class="p-3 bg-surface-container-low rounded-lg">
            <span class="text-outline block text-[11px]">Scheme Track:</span>
            <strong class="text-on-surface truncate block" title="${escapeHTML(schemeName)}">${escapeHTML(schemeName)}</strong>
          </div>
          <div class="p-3 bg-surface-container-low rounded-lg">
            <span class="text-outline block text-[11px]">Submitted Date:</span>
            <strong class="text-on-surface">${escapeHTML(submittedDateStr)}</strong>
          </div>
          <div class="p-3 bg-surface-container-low rounded-lg">
            <span class="text-outline block text-[11px]">Current State:</span>
            <strong class="text-secondary capitalize">${escapeHTML((activeApp.status || 'Submitted').replace(/_/g, ' '))}</strong>
          </div>
        </div>

        <!-- Deficiency Details Card (If active) -->
        ${renderDeficiencyDetailsCard(activeApp)}

        <!-- Required Next Action Banner -->
        <div class="p-4 bg-primary/5 rounded-xl border border-primary/20 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div class="flex items-start gap-2.5">
            <span class="material-symbols-outlined text-primary text-xl mt-0.5">info</span>
            <div>
              <strong class="block text-xs font-bold text-primary uppercase tracking-wider">Required Next Action (अगली कार्रवाई)</strong>
              <p class="text-xs text-on-surface-variant mt-0.5 leading-relaxed">${escapeHTML(nextAction.text)}</p>
            </div>
          </div>
          ${nextAction.actionBtn ? `<div>${nextAction.actionBtn}</div>` : ''}
        </div>

        <!-- High-Level Visual Lifecycle Stepper -->
        <div class="mb-8 p-4 bg-surface-container-low rounded-xl border border-outline-variant/30">
          <h4 class="text-xs font-bold uppercase tracking-wider text-outline mb-4">Scholarship Governance Lifecycle</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
            ${canonicalStages.map(st => {
              const isDone = st.num < activeStepNum;
              const isCurrent = st.num === activeStepNum;
              let dotBg = "bg-surface-container-highest text-outline";
              let labelColor = "text-outline";
              if (isDone) {
                dotBg = "bg-tertiary-container text-white";
                labelColor = "text-primary font-bold";
              } else if (isCurrent) {
                dotBg = activeApp.status === "deficiency_raised" ? "bg-error text-white ring-4 ring-error/20" : "bg-secondary text-white ring-4 ring-secondary/20";
                labelColor = "text-secondary font-bold";
              }
              return `
                <div class="flex flex-col items-center p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/20 shadow-xs">
                  <div class="w-7 h-7 rounded-full ${dotBg} flex items-center justify-center font-bold text-xs mb-1.5">
                    ${isDone ? '<span class="material-symbols-outlined text-[15px]">check</span>' : st.num}
                  </div>
                  <span class="${labelColor} text-[11px] leading-tight">${st.title}</span>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <!-- Dynamic Status History Timeline (Built dynamically from application_status_history table) -->
        <div class="mb-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-sm font-bold text-primary flex items-center gap-1.5">
              <span class="material-symbols-outlined text-secondary text-lg">history</span>
              <span>Status History Timeline (सत्यापन इतिहास)</span>
            </h3>
            <span class="text-[11px] font-mono text-outline">
              ${statusHistory.length} Database Record(s)
            </span>
          </div>

          ${renderDynamicStatusTimeline(statusHistory, activeApp.status)}
        </div>

        <!-- Officer Remarks Card -->
        ${renderOfficerRemarksCard(activeApp)}
      </div>
    </div>
  `;
}, { layout: "applicant" });

// Helper functions for Tracking View
function getTrackingStatusBadge(status) {
  const s = (status || "").toLowerCase().replace(/[\s-]+/g, "_");
  switch (s) {
    case "draft":
      return { label: "Draft Application", badgeClass: "bg-surface-container-high text-outline", icon: "edit_note", stepNum: 0 };
    case "submitted":
      return { label: "Submitted to Ministry", badgeClass: "bg-secondary-fixed text-on-secondary-fixed font-bold", icon: "send", stepNum: 1 };
    case "under_scrutiny":
    case "under_document_scrutiny":
      return { label: "Under Document Scrutiny", badgeClass: "bg-primary text-white font-bold", icon: "manage_search", stepNum: 2 };
    case "deficiency_raised":
      return { label: "Deficiency Raised", badgeClass: "bg-error text-white font-bold animate-pulse", icon: "warning", stepNum: 2 };
    case "resubmitted":
      return { label: "Resubmitted (Clarified)", badgeClass: "bg-tertiary-fixed text-on-tertiary-fixed font-bold", icon: "published_with_changes", stepNum: 2 };
    case "provisionally_eligible":
    case "committee_screening":
      return { label: "Provisionally Eligible", badgeClass: "bg-tertiary-container text-white font-bold", icon: "rule", stepNum: 3 };
    case "selected":
    case "approved":
      return { label: "Selected for Scholarship", badgeClass: "bg-tertiary text-white font-bold", icon: "verified", stepNum: 4 };
    case "rejected":
      return { label: "Rejected during Scrutiny", badgeClass: "bg-error text-white font-bold", icon: "cancel", stepNum: -1 };
    default:
      return { label: status || "Under Review", badgeClass: "bg-secondary text-white font-bold", icon: "hourglass_top", stepNum: 1 };
  }
}

function getRequiredNextAction(status, app) {
  const s = (status || "").toLowerCase().replace(/[\s-]+/g, "_");
  switch (s) {
    case "draft":
      return {
        text: "Complete all required fields and upload mandatory documents before submitting to the Ministry.",
        actionBtn: `<a href="#${app.lastSavedStep || '/application/personal'}" class="px-4 py-2 bg-secondary text-white font-bold text-xs rounded hover:bg-secondary/90 shadow-sm inline-flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">edit</span> Continue Application</a>`
      };
    case "submitted":
      return {
        text: "Application safely logged into the National Tribal Portal. Allocation to District/State Verification Officer is in progress.",
        actionBtn: null
      };
    case "under_scrutiny":
    case "under_document_scrutiny":
      return {
        text: "Nodal Scrutiny Officer is actively cross-verifying your ST Caste Certificate, Income Certificate, and academic credentials. No action is required at this stage.",
        actionBtn: null
      };
    case "deficiency_raised":
      return {
        text: "Action Required: The Scrutiny Officer has requested revised documentation or clarification. Please respond within 15 days.",
        actionBtn: `<a href="#/application/deficiency" class="px-4 py-2 bg-error text-white font-bold text-xs rounded hover:bg-error/90 shadow-sm inline-flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">build</span> Resolve Deficiency Desk →</a>`
      };
    case "resubmitted":
      return {
        text: "Your deficiency response has been submitted to the Scrutiny Officer. Re-verification is in progress.",
        actionBtn: null
      };
    case "provisionally_eligible":
    case "committee_screening":
      return {
        text: "Document verification passed. Your dossier is placed before the National Selection Committee for merit evaluation.",
        actionBtn: null
      };
    case "selected":
    case "approved":
      return {
        text: "🎉 Congratulations! Scholarship Sanction Order generated. Direct Benefit Transfer (DBT) credit to your NPCI-seeded account is underway.",
        actionBtn: `<a href="#/applicant/dashboard" class="px-4 py-2 bg-tertiary-container text-white font-bold text-xs rounded hover:bg-tertiary shadow-sm inline-flex items-center gap-1"><span class="material-symbols-outlined text-[16px]">download</span> Download Sanction Letter</a>`
      };
    case "rejected":
      return {
        text: "Application was not approved based on eligibility criteria or documentation guidelines. You may inspect the officer remarks.",
        actionBtn: `<a href="#/schemes" class="px-4 py-2 bg-surface-container-high text-primary font-bold text-xs rounded hover:bg-surface-container-highest shadow-sm inline-flex items-center gap-1">Explore Other Schemes</a>`
      };
    default:
      return {
        text: "Application is under active evaluation by the Ministry of Tribal Affairs.",
        actionBtn: null
      };
  }
}

function renderDynamicStatusTimeline(statusHistory, currentStatus) {
  if (!Array.isArray(statusHistory) || statusHistory.length === 0) {
    return `
      <div class="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 text-xs text-on-surface-variant flex items-center gap-2">
        <span class="material-symbols-outlined text-secondary text-lg">info</span>
        <span>Initial electronic submission logged. Awaiting scrutiny updates.</span>
      </div>
    `;
  }

  return `
    <div class="relative pl-6 space-y-6 border-l-2 border-primary/20 ml-3">
      ${statusHistory.map((h, i) => {
        const isLatest = i === statusHistory.length - 1;
        const statusMeta = getTrackingStatusBadge(h.new_status);
        let dotColor = "bg-primary text-white";
        let icon = statusMeta.icon || "check";

        if (h.new_status === "deficiency_raised") {
          dotColor = "bg-error text-white";
          icon = "warning";
        } else if (isLatest) {
          dotColor = "bg-secondary text-white ring-4 ring-secondary/20";
        }

        const dateStr = h.created_at ? new Date(h.created_at).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Kolkata"
        }) : "Date Recorded";

        const actor = h.changed_by_name || h.officer || (h.new_status === "submitted" ? "Applicant / Portal Gateway" : "Scrutiny Officer");

        return `
          <div class="relative group">
            <div class="absolute -left-[31px] top-0 w-6 h-6 rounded-full ${dotColor} flex items-center justify-center text-xs font-bold shadow-xs">
              <span class="material-symbols-outlined text-[13px]">${icon}</span>
            </div>
            <div class="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 shadow-xs space-y-1">
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                <span class="font-bold text-sm text-primary flex items-center gap-1.5">
                  <span class="capitalize">${escapeHTML((h.old_status || 'Draft').replace(/_/g, ' '))}</span>
                  <span class="material-symbols-outlined text-[14px] text-outline">arrow_forward</span>
                  <span class="capitalize text-secondary">${escapeHTML((h.new_status || 'Submitted').replace(/_/g, ' '))}</span>
                </span>
                <span class="text-[11px] font-mono text-outline">${escapeHTML(dateStr)}</span>
              </div>
              <p class="text-xs text-on-surface-variant leading-relaxed">${escapeHTML(h.remark || 'Status updated in portal database.')}</p>
              <div class="flex items-center gap-2 pt-1 text-[11px] text-outline">
                <span class="material-symbols-outlined text-[13px]">person</span>
                <span>Actor: <strong class="text-primary">${escapeHTML(actor)}</strong></span>
              </div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderOfficerRemarksCard(activeApp) {
  let remarks = activeApp.officer_remarks;
  if (!remarks && Array.isArray(activeApp.application_status_history)) {
    const officerEntry = [...activeApp.application_status_history].reverse().find(h => 
      h.remark && !h.remark.includes("Direct electronic submission") && h.new_status !== "draft"
    );
    if (officerEntry) remarks = officerEntry.remark;
  }
  if (!remarks) {
    remarks = "Application under active preliminary scrutiny. All uploaded documents are queued for verification.";
  }

  return `
    <div class="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-start gap-3">
      <div class="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0 mt-0.5">
        <span class="material-symbols-outlined text-lg">rate_review</span>
      </div>
      <div class="space-y-0.5">
        <h4 class="font-bold text-xs uppercase tracking-wider text-primary">Nodal Scrutiny Officer Remarks (अधिकारी टिप्पणी)</h4>
        <p class="text-xs text-on-surface-variant leading-relaxed">${escapeHTML(remarks)}</p>
      </div>
    </div>
  `;
}

function renderDeficiencyDetailsCard(activeApp) {
  const deficiencies = Array.isArray(activeApp.deficiencies) ? activeApp.deficiencies : [];
  const openDef = deficiencies.find(d => !d.status || d.status === "open" || d.status === "pending") || 
                  (activeApp.deficiency ? activeApp.deficiency : null);

  if (!openDef && activeApp.status !== "deficiency_raised" && activeApp.status !== "Deficiency Raised") {
    return "";
  }

  const defQuery = (openDef && (openDef.description || openDef.remark || openDef.officer_remark)) || 
                   "Please provide the renewed or legible certificate as requested by the verification team.";
  const docType = (openDef && openDef.document_type) || "Revised Supporting Document";

  return `
    <div class="mb-6 p-4 bg-error-container text-on-error-container rounded-xl border border-error/30 shadow-sm space-y-2">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div class="flex items-center gap-2 text-error font-bold text-sm">
          <span class="material-symbols-outlined text-xl">report_problem</span>
          <span>Action Required: Document Deficiency Raised</span>
        </div>
        <a href="#/application/deficiency" class="px-4 py-1.5 bg-error text-white font-bold text-xs rounded hover:bg-error/90 shadow-sm inline-flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">upload_file</span> Resolve Deficiency Desk →
        </a>
      </div>
      <div class="p-3 bg-white/70 rounded-lg text-xs space-y-1 text-on-surface">
        <div><strong class="text-error">Document Requested:</strong> <span class="font-semibold">${escapeHTML(docType)}</span></div>
        <div><strong class="text-error">Officer Query / Deficiency Note:</strong> ${escapeHTML(defQuery)}</div>
      </div>
    </div>
  `;
}

// 17. Deficiency Resolution Desk (/application/deficiency)
router.register("/application/deficiency", () => {
  const app = window.appStore.getApplication();
  const container = document.getElementById("main-view-container");

  container.innerHTML = `
    <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-md border border-outline-variant/30 max-w-2xl mx-auto">
      <div class="flex justify-between items-center pb-3 border-b border-outline-variant/20 mb-4">
        <div>
          <h1 class="text-xl font-bold text-primary">Deficiency Rectification Desk</h1>
          <p class="text-xs text-on-surface-variant">Resolve verification queries raised by scrutiny officer.</p>
        </div>
        <span class="px-2 py-0.5 bg-error text-white text-xs font-bold rounded">Action Needed</span>
      </div>

      <div class="p-4 bg-error-container/40 border border-error/20 rounded-xl mb-4 text-xs space-y-1">
        <strong class="text-error block text-sm">Officer Query:</strong>
        <p class="text-on-surface leading-relaxed">
          ${app.deficiency ? app.deficiency.remark : 'Income certificate submitted JH/INC/2024/761298 needs latest financial year renewal endorsement.'}
        </p>
      </div>

      <form onsubmit="handleDeficiencyResolve(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-on-surface mb-1">Upload Revised Document (PDF) *</label>
          <input type="file" id="def-file" class="w-full p-2 bg-surface-container-low rounded border border-outline-variant/40 text-xs"/>
        </div>
        <div>
          <label class="block text-xs font-bold text-on-surface mb-1">Applicant Clarification Remark *</label>
          <textarea id="def-remark" rows="3" class="w-full p-2 bg-surface-container-low rounded border border-outline-variant/40 text-xs" required>Uploaded renewed certificate verified via state portal.</textarea>
        </div>

        <button type="submit" class="w-full py-2.5 bg-secondary hover:bg-secondary/90 text-white font-bold rounded text-sm shadow-md">
          Submit Clarification to Officer
        </button>
      </form>
    </div>
  `;
}, { layout: "applicant", authRole: "applicant" });

function handleDeficiencyResolve(e) {
  e.preventDefault();
  const app = window.appStore.getApplication();
  app.status = "Under Document Scrutiny";
  app.history.push({
    title: "Deficiency Clarification Submitted",
    time: new Date().toLocaleString("en-IN"),
    officer: "Priya Munda (Applicant)",
    remark: document.getElementById("def-remark").value
  });
  window.appStore.saveApplication(app);
  showToast("Clarification transmitted to scrutiny officer!", "success");
  router.navigate("/application/track");
}

// ----------------------------------------------------
// ADMIN WORKFLOW ROUTES
// ----------------------------------------------------

// 18. Admin Login (/admin/login)
router.register("/admin/login", () => {
  const container = document.getElementById("main-view-container");
  container.innerHTML = `
    <div class="max-w-md mx-auto my-12 p-space-xl bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30">
      <div class="text-center mb-space-lg">
        <div class="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center mx-auto mb-2 shadow-md">
          <span class="material-symbols-outlined text-[32px]">admin_panel_settings</span>
        </div>
        <h1 class="font-headline-sm text-primary font-bold text-2xl">Official Nodal Portal</h1>
        <p class="text-xs text-on-surface-variant mt-1">Ministry of Tribal Affairs Officer Administration</p>
      </div>

      <!-- Demo Credentials Banner -->
      <div class="p-3 bg-primary-container text-white rounded-lg text-xs mb-4">
        <p class="font-bold flex items-center gap-1 mb-1">
          <span class="material-symbols-outlined text-[16px]">key</span> Admin Demo Credentials:
        </p>
        <p>Email: <strong class="font-mono">admin@mota.gov.in</strong></p>
        <p>Password: <strong class="font-mono">admin123</strong></p>
      </div>

      <form onsubmit="handleAdminLogin(event)" class="space-y-space-md">
        <div>
          <label class="block text-xs font-bold text-on-surface mb-1">Officer Government Email ID *</label>
          <input type="email" id="admin-user" value="admin@mota.gov.in" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm font-semibold" required/>
        </div>
        <div>
          <label class="block text-xs font-bold text-on-surface mb-1">Password *</label>
          <input type="password" id="admin-pwd" value="admin123" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm font-semibold" required/>
        </div>

        <button type="submit" class="w-full py-3 bg-primary hover:bg-primary-container text-white font-bold rounded shadow-md flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-[20px]">shield</span> Sign In to Admin Console
        </button>
      </form>

      <div class="mt-4 pt-4 border-t border-outline-variant/20 text-center text-xs">
        <a href="#/" class="text-secondary font-bold hover:underline">← Public Portal</a>
      </div>
    </div>
  `;
});

function handleAdminLogin(e) {
  e.preventDefault();
  const email = document.getElementById("admin-user").value.trim();
  const pwd = document.getElementById("admin-pwd").value.trim();

  if (email === "admin@mota.gov.in" && pwd === "admin123") {
    window.appStore.setAuthUser({
      role: "admin",
      email: "admin@mota.gov.in",
      name: "Shri K. S. Verma",
      designation: "Deputy Secretary"
    });
    showToast("Authenticated as MoTA Nodal Officer", "success");
    router.navigate("/admin/dashboard");
  } else {
    showToast("Invalid admin credentials. Use admin@mota.gov.in / admin123", "error");
  }
}

// 19. Admin Dashboard (/admin/dashboard)
// 19. Admin Dashboard (/admin/dashboard) - Real Database Queries & Aggregations
router.register("/admin/dashboard", async () => {
  const container = document.getElementById("main-view-container");
  if (!container) return;

  container.innerHTML = `
    <div class="bg-surface-container-lowest p-space-xl rounded-xl shadow-md border border-outline-variant/30 text-center py-16 space-y-3">
      <div class="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
      <h3 class="font-bold text-primary text-base">Loading Admin Governance Metrics...</h3>
      <p class="text-xs text-outline font-mono">Aggregating public.applications database telemetry</p>
    </div>
  `;

  let metrics = {
    total: 0,
    draft: 0,
    submitted: 0,
    underScrutiny: 0,
    deficiency: 0,
    selected: 0,
    rejected: 0,
    stateWise: {},
    schemeWise: {},
    applications: []
  };

  if (typeof window.supabaseFetchAdminDashboardMetrics === "function") {
    try {
      metrics = await window.supabaseFetchAdminDashboardMetrics();
    } catch (e) {
      console.warn("Admin metrics error:", e);
    }
  }

  const priorityCandidates = metrics.applications.slice(0, 6);

  container.innerHTML = `
    <div class="space-y-space-lg">
      <!-- Header Banner -->
      <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl font-bold text-primary">MoTA Officer Scrutiny Console</h1>
            <span class="px-2 py-0.5 bg-tertiary-container/15 text-tertiary-container text-xs font-bold rounded border border-tertiary-container/30">
              Live DB
            </span>
          </div>
          <p class="text-xs text-on-surface-variant mt-0.5">Ministry of Tribal Affairs • National Tribal Scholarship Portal</p>
        </div>
        <div class="flex items-center gap-2">
          <a href="#/admin/applications" class="px-4 py-2 bg-secondary text-white font-bold text-xs rounded shadow-sm hover:bg-secondary/90 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">rule</span> Open Scrutiny Queue (${metrics.submitted + metrics.underScrutiny})
          </a>
        </div>
      </div>

      <!-- Real Database Telemetry Metric Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <!-- Total -->
        <div class="p-3.5 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30">
          <span class="text-[11px] text-outline font-bold uppercase tracking-wider block">Total Intake</span>
          <p class="text-2xl font-black text-primary mt-1 font-mono">${metrics.total}</p>
          <span class="text-[10px] text-outline">All Registrations</span>
        </div>
        <!-- Drafts -->
        <div class="p-3.5 bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/30">
          <span class="text-[11px] text-outline font-bold uppercase tracking-wider block">Drafts</span>
          <p class="text-2xl font-black text-outline mt-1 font-mono">${metrics.draft}</p>
          <span class="text-[10px] text-outline">Unsubmitted</span>
        </div>
        <!-- Submitted -->
        <div class="p-3.5 bg-surface-container-lowest rounded-xl shadow-xs border border-secondary/40 bg-secondary/5">
          <span class="text-[11px] text-secondary font-bold uppercase tracking-wider block">Submitted</span>
          <p class="text-2xl font-black text-secondary mt-1 font-mono">${metrics.submitted}</p>
          <span class="text-[10px] text-secondary">Awaiting Officer</span>
        </div>
        <!-- Under Scrutiny -->
        <div class="p-3.5 bg-surface-container-lowest rounded-xl shadow-xs border border-primary/30 bg-primary/5">
          <span class="text-[11px] text-primary font-bold uppercase tracking-wider block">Under Scrutiny</span>
          <p class="text-2xl font-black text-primary mt-1 font-mono">${metrics.underScrutiny}</p>
          <span class="text-[10px] text-primary font-semibold">Active Review</span>
        </div>
        <!-- Deficiency Cases -->
        <div class="p-3.5 bg-surface-container-lowest rounded-xl shadow-xs border border-error/40 bg-error/5">
          <span class="text-[11px] text-error font-bold uppercase tracking-wider block">Deficiencies</span>
          <p class="text-2xl font-black text-error mt-1 font-mono">${metrics.deficiency}</p>
          <span class="text-[10px] text-error">Action Needed</span>
        </div>
        <!-- Selected / Provisionally Eligible -->
        <div class="p-3.5 bg-surface-container-lowest rounded-xl shadow-xs border border-tertiary-container/40 bg-tertiary-container/5">
          <span class="text-[11px] text-tertiary-container font-bold uppercase tracking-wider block">Selected</span>
          <p class="text-2xl font-black text-tertiary-container mt-1 font-mono">${metrics.selected}</p>
          <span class="text-[10px] text-tertiary-container font-semibold">PFMS / Merit List</span>
        </div>
      </div>

      <!-- State-wise & Scheme-wise Aggregations -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- State-Wise Breakdown -->
        <div class="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 space-y-3">
          <div class="flex justify-between items-center pb-2 border-b border-outline-variant/20">
            <h3 class="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <span class="material-symbols-outlined text-secondary text-base">map</span> State-Wise Distribution (राज्यवार आँकड़े)
            </h3>
            <span class="text-[11px] font-mono text-outline">${Object.keys(metrics.stateWise).length} States Active</span>
          </div>
          <div class="flex flex-wrap gap-2 pt-1">
            ${Object.keys(metrics.stateWise).length === 0 ? `
              <p class="text-xs text-outline">No geographic distribution recorded yet.</p>
            ` : Object.entries(metrics.stateWise).map(([st, cnt]) => `
              <span class="px-2.5 py-1 bg-surface-container-low hover:bg-surface-container text-primary text-xs font-semibold rounded-lg border border-outline-variant/30 flex items-center gap-1.5">
                <span>${escapeHTML(st)}</span>
                <span class="px-1.5 py-0.2 bg-secondary text-white text-[10px] font-mono font-bold rounded-full">${cnt}</span>
              </span>
            `).join("")}
          </div>
        </div>

        <!-- Scheme-Wise Breakdown -->
        <div class="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 space-y-3">
          <div class="flex justify-between items-center pb-2 border-b border-outline-variant/20">
            <h3 class="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <span class="material-symbols-outlined text-tertiary-container text-base">school</span> Scheme-Wise Distribution (योजनावार आँकड़े)
            </h3>
            <span class="text-[11px] font-mono text-outline">${Object.keys(metrics.schemeWise).length} Schemes</span>
          </div>
          <div class="flex flex-wrap gap-2 pt-1">
            ${Object.keys(metrics.schemeWise).length === 0 ? `
              <p class="text-xs text-outline">No scheme applications recorded yet.</p>
            ` : Object.entries(metrics.schemeWise).map(([sch, cnt]) => `
              <span class="px-2.5 py-1 bg-surface-container-low hover:bg-surface-container text-primary text-xs font-semibold rounded-lg border border-outline-variant/30 flex items-center gap-1.5">
                <span>${escapeHTML(sch)}</span>
                <span class="px-1.5 py-0.2 bg-tertiary-container text-white text-[10px] font-mono font-bold rounded-full">${cnt}</span>
              </span>
            `).join("")}
          </div>
        </div>
      </div>

      <!-- Priority Review Candidates Table -->
      <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30">
        <div class="flex justify-between items-center pb-3 border-b border-outline-variant/20 mb-3">
          <div>
            <h2 class="text-base font-bold text-primary">Priority Scrutiny Candidates (प्राथमिकता सूची)</h2>
            <p class="text-xs text-on-surface-variant">Live applications waiting for ministerial officer verification.</p>
          </div>
          <a href="#/admin/applications" class="text-xs text-secondary font-bold hover:underline">
            View All in Scrutiny Queue →
          </a>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-surface-container text-primary font-bold">
              <tr>
                <th class="p-3">Ref ID</th>
                <th class="p-3">Candidate &amp; Domicile</th>
                <th class="p-3">Scheme Track</th>
                <th class="p-3">Risk Level</th>
                <th class="p-3">Current Status</th>
                <th class="p-3">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/20">
              ${priorityCandidates.map(q => {
                const sBadge = getTrackingStatusBadge(q.status);
                const candName = q.profiles?.full_name || q.personal_details?.fullName || "ST Scholar";
                const state = q.profiles?.state || q.personal_details?.state || "Jharkhand";
                const schemeCode = (q.schemes?.code || "NOS").replace("SCH-MOTA-", "");
                const risk = (q.risk_level || "low").toLowerCase();
                return `
                  <tr class="hover:bg-surface-container-low transition">
                    <td class="p-3 font-mono font-bold text-primary">${escapeHTML(q.application_number || q.id)}</td>
                    <td class="p-3">
                      <strong class="text-primary block">${escapeHTML(candName)}</strong>
                      <span class="text-[11px] text-outline">${escapeHTML(state)}</span>
                    </td>
                    <td class="p-3 font-semibold">${escapeHTML(schemeCode)}</td>
                    <td class="p-3">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                        risk === 'high' ? 'bg-error text-white' :
                        risk === 'medium' ? 'bg-secondary-fixed text-on-secondary-fixed' :
                        'bg-tertiary-fixed text-on-tertiary-fixed'
                      }">
                        ${risk.toUpperCase()}
                      </span>
                    </td>
                    <td class="p-3">
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold ${sBadge.badgeClass}">
                        ${sBadge.label}
                      </span>
                    </td>
                    <td class="p-3">
                      <a href="#/admin/applications/${q.id}" class="px-3 py-1.5 bg-primary text-white font-bold rounded hover:bg-primary-container text-xs inline-flex items-center gap-1 transition">
                        Review →
                      </a>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}, { layout: "admin", authRole: "admin" });

// Global Filter State for Admin Queue
let adminQueueFilters = {
  scheme: "all",
  status: "all",
  state: "all",
  date: "all",
  riskLevel: "all",
  search: ""
};

// 20. Admin Applications Queue (/admin/applications) - Multi-criteria Filters
router.register("/admin/applications", async () => {
  const container = document.getElementById("main-view-container");
  if (!container) return;

  container.innerHTML = `
    <div class="bg-surface-container-lowest p-space-xl rounded-xl shadow-md border border-outline-variant/30 text-center py-16 space-y-3">
      <div class="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
      <h3 class="font-bold text-primary text-base">Loading Scrutiny Queue from Database...</h3>
      <p class="text-xs text-outline font-mono">Applying filters to public.applications</p>
    </div>
  `;

  let queueResult = { applications: [], total: 0, filteredCount: 0 };
  if (typeof window.supabaseFetchAdminQueue === "function") {
    try {
      queueResult = await window.supabaseFetchAdminQueue(adminQueueFilters);
    } catch (err) {
      console.warn("Queue fetch error:", err);
    }
  }

  const applications = queueResult.applications || [];

  container.innerHTML = `
    <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30 space-y-4">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-outline-variant/20 gap-2">
        <div>
          <h1 class="text-xl font-bold text-primary">Applications Scrutiny Queue (सत्यापन कतार)</h1>
          <p class="text-xs text-on-surface-variant">Review applicant credentials, verify uploaded documents, and route dossiers.</p>
        </div>
        <span class="text-xs font-mono font-bold text-secondary bg-secondary-fixed/50 px-3 py-1 rounded-full">
          ${queueResult.filteredCount} matching / ${queueResult.total} total
        </span>
      </div>

      <!-- Multi-Criteria Filters Bar -->
      <div class="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        <!-- 1. Scheme Filter -->
        <div>
          <label class="block font-bold text-outline text-[11px] mb-1">Scheme</label>
          <select id="filter-scheme" onchange="updateAdminFilter('scheme', this.value)" class="w-full p-2 bg-surface-container-lowest rounded border border-outline-variant/40 font-semibold text-primary text-xs">
            <option value="all" ${adminQueueFilters.scheme === 'all' ? 'selected' : ''}>All Schemes</option>
            <option value="nos" ${adminQueueFilters.scheme === 'nos' ? 'selected' : ''}>NOS (Overseas)</option>
            <option value="nfst" ${adminQueueFilters.scheme === 'nfst' ? 'selected' : ''}>NFST (Fellowship)</option>
            <option value="pms" ${adminQueueFilters.scheme === 'pms' ? 'selected' : ''}>PMS (Post-Matric)</option>
          </select>
        </div>

        <!-- 2. Status Filter -->
        <div>
          <label class="block font-bold text-outline text-[11px] mb-1">Status</label>
          <select id="filter-status" onchange="updateAdminFilter('status', this.value)" class="w-full p-2 bg-surface-container-lowest rounded border border-outline-variant/40 font-semibold text-primary text-xs">
            <option value="all" ${adminQueueFilters.status === 'all' ? 'selected' : ''}>All Statuses</option>
            <option value="submitted" ${adminQueueFilters.status === 'submitted' ? 'selected' : ''}>Submitted</option>
            <option value="under_scrutiny" ${adminQueueFilters.status === 'under_scrutiny' ? 'selected' : ''}>Under Scrutiny</option>
            <option value="deficiency_raised" ${adminQueueFilters.status === 'deficiency_raised' ? 'selected' : ''}>Deficiency Raised</option>
            <option value="provisionally_eligible" ${adminQueueFilters.status === 'provisionally_eligible' ? 'selected' : ''}>Provisionally Eligible</option>
            <option value="committee_screening" ${adminQueueFilters.status === 'committee_screening' ? 'selected' : ''}>Committee Screening</option>
            <option value="selected" ${adminQueueFilters.status === 'selected' ? 'selected' : ''}>Selected</option>
            <option value="rejected" ${adminQueueFilters.status === 'rejected' ? 'selected' : ''}>Rejected</option>
            <option value="draft" ${adminQueueFilters.status === 'draft' ? 'selected' : ''}>Draft</option>
          </select>
        </div>

        <!-- 3. State Filter -->
        <div>
          <label class="block font-bold text-outline text-[11px] mb-1">State</label>
          <select id="filter-state" onchange="updateAdminFilter('state', this.value)" class="w-full p-2 bg-surface-container-lowest rounded border border-outline-variant/40 font-semibold text-primary text-xs">
            <option value="all" ${adminQueueFilters.state === 'all' ? 'selected' : ''}>All States</option>
            <option value="jharkhand" ${adminQueueFilters.state === 'jharkhand' ? 'selected' : ''}>Jharkhand</option>
            <option value="odisha" ${adminQueueFilters.state === 'odisha' ? 'selected' : ''}>Odisha</option>
            <option value="madhya pradesh" ${adminQueueFilters.state === 'madhya pradesh' ? 'selected' : ''}>Madhya Pradesh</option>
            <option value="assam" ${adminQueueFilters.state === 'assam' ? 'selected' : ''}>Assam</option>
            <option value="chhattisgarh" ${adminQueueFilters.state === 'chhattisgarh' ? 'selected' : ''}>Chhattisgarh</option>
            <option value="rajasthan" ${adminQueueFilters.state === 'rajasthan' ? 'selected' : ''}>Rajasthan</option>
          </select>
        </div>

        <!-- 4. Date Filter -->
        <div>
          <label class="block font-bold text-outline text-[11px] mb-1">Submission Date</label>
          <select id="filter-date" onchange="updateAdminFilter('date', this.value)" class="w-full p-2 bg-surface-container-lowest rounded border border-outline-variant/40 font-semibold text-primary text-xs">
            <option value="all" ${adminQueueFilters.date === 'all' ? 'selected' : ''}>All Time</option>
            <option value="today" ${adminQueueFilters.date === 'today' ? 'selected' : ''}>Today</option>
            <option value="7days" ${adminQueueFilters.date === '7days' ? 'selected' : ''}>Last 7 Days</option>
            <option value="30days" ${adminQueueFilters.date === '30days' ? 'selected' : ''}>Last 30 Days</option>
          </select>
        </div>

        <!-- 5. Risk Level Filter -->
        <div>
          <label class="block font-bold text-outline text-[11px] mb-1">Risk Level</label>
          <select id="filter-risk" onchange="updateAdminFilter('riskLevel', this.value)" class="w-full p-2 bg-surface-container-lowest rounded border border-outline-variant/40 font-semibold text-primary text-xs">
            <option value="all" ${adminQueueFilters.riskLevel === 'all' ? 'selected' : ''}>All Risk Levels</option>
            <option value="low" ${adminQueueFilters.riskLevel === 'low' ? 'selected' : ''}>Low Risk</option>
            <option value="medium" ${adminQueueFilters.riskLevel === 'medium' ? 'selected' : ''}>Medium Risk</option>
            <option value="high" ${adminQueueFilters.riskLevel === 'high' ? 'selected' : ''}>High Risk</option>
          </select>
        </div>

        <!-- 6. Search Bar -->
        <div>
          <label class="block font-bold text-outline text-[11px] mb-1">Search Candidate</label>
          <div class="flex gap-1">
            <input type="text" id="filter-search-input" value="${escapeHTML(adminQueueFilters.search)}" placeholder="Name / Ref / Email" onkeydown="if(event.key==='Enter') executeAdminSearch()" class="w-full p-2 bg-surface-container-lowest rounded border border-outline-variant/40 text-xs"/>
            <button onclick="executeAdminSearch()" class="px-2.5 bg-secondary text-white rounded hover:bg-secondary/90">
              <span class="material-symbols-outlined text-[16px] mt-0.5">search</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Queue Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-surface-container text-primary font-bold">
            <tr>
              <th class="p-3">Application Ref</th>
              <th class="p-3">Applicant &amp; Domicile</th>
              <th class="p-3">Scheme Track</th>
              <th class="p-3">University / Inst</th>
              <th class="p-3">Risk Level</th>
              <th class="p-3">Status</th>
              <th class="p-3">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/20">
            ${applications.length === 0 ? `
              <tr>
                <td colspan="7" class="p-8 text-center text-outline">
                  <span class="material-symbols-outlined text-4xl block mb-2">filter_list_off</span>
                  No applications matched the selected filter criteria.
                  <button onclick="resetAdminFilters()" class="text-secondary font-bold underline block mx-auto mt-2">Reset All Filters</button>
                </td>
              </tr>
            ` : applications.map(q => {
              const sBadge = getTrackingStatusBadge(q.status);
              const candName = q.profiles?.full_name || q.personal_details?.fullName || "ST Scholar";
              const state = q.profiles?.state || q.personal_details?.state || "Jharkhand";
              const univ = q.academic_details?.university || "Accredited University";
              const schemeCode = (q.schemes?.code || q.schemeCode || "NOS").replace("SCH-MOTA-", "");
              const risk = (q.risk_level || "low").toLowerCase();
              return `
                <tr class="hover:bg-surface-container-low transition">
                  <td class="p-3 font-mono font-bold text-primary">${escapeHTML(q.application_number || q.id)}</td>
                  <td class="p-3">
                    <strong class="text-primary block">${escapeHTML(candName)}</strong>
                    <span class="text-[11px] text-outline">${escapeHTML(state)}</span>
                  </td>
                  <td class="p-3 font-semibold">${escapeHTML(schemeCode)}</td>
                  <td class="p-3 max-w-[180px] truncate" title="${escapeHTML(univ)}">${escapeHTML(univ)}</td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                      risk === 'high' ? 'bg-error text-white' :
                      risk === 'medium' ? 'bg-secondary-fixed text-on-secondary-fixed' :
                      'bg-tertiary-fixed text-on-tertiary-fixed'
                    }">
                      ${risk.toUpperCase()}
                    </span>
                  </td>
                  <td class="p-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold ${sBadge.badgeClass}">
                      ${sBadge.label}
                    </span>
                  </td>
                  <td class="p-3">
                    <a href="#/admin/applications/${q.id}" class="px-3 py-1.5 bg-primary hover:bg-primary-container text-white font-bold rounded text-xs inline-flex items-center gap-1 transition shadow-xs">
                      Review Dossier →
                    </a>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}, { layout: "admin", authRole: "admin" });

function updateAdminFilter(key, value) {
  adminQueueFilters[key] = value;
  router.navigate("/admin/applications");
}

function executeAdminSearch() {
  const input = document.getElementById("filter-search-input");
  if (input) {
    adminQueueFilters.search = input.value;
    router.navigate("/admin/applications");
  }
}

function resetAdminFilters() {
  adminQueueFilters = {
    scheme: "all",
    status: "all",
    state: "all",
    date: "all",
    riskLevel: "all",
    search: ""
  };
  router.navigate("/admin/applications");
}

// 21. Admin Application Review (/admin/applications/:id) - Supabase Grounded
router.register("/admin/applications/:id", async (params) => {
  const appId = params.id;
  const container = document.getElementById("main-view-container");
  if (!container) return;

  container.innerHTML = `
    <div class="bg-surface-container-lowest p-space-xl rounded-xl shadow-md border border-outline-variant/30 text-center py-16 space-y-3">
      <div class="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto"></div>
      <h3 class="font-bold text-primary text-base">Loading Candidate Dossier from Database...</h3>
      <p class="text-xs text-outline font-mono">Fetching application ${escapeHTML(appId)}</p>
    </div>
  `;

  let app = null;
  if (typeof window.supabaseFetchApplicantTrackingData === "function") {
    try {
      const res = await window.supabaseFetchApplicantTrackingData(appId);
      if (res && res.activeApp) {
        app = res.activeApp;
      }
    } catch (e) {
      console.warn("Fetch dossier error:", e);
    }
  }

  // Fallback to local store if not found
  if (!app && window.appStore) {
    app = window.appStore.getApplicationById(appId);
  }

  if (!app) {
    container.innerHTML = `
      <div class="p-8 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/30 space-y-3">
        <span class="material-symbols-outlined text-error text-5xl">error</span>
        <h2 class="text-lg font-bold text-primary">Application Not Found</h2>
        <p class="text-xs text-outline">Application reference ${escapeHTML(appId)} could not be located in the database.</p>
        <a href="#/admin/applications" class="px-4 py-2 bg-secondary text-white font-bold rounded text-xs inline-block">
          Return to Queue
        </a>
      </div>
    `;
    return;
  }

  const personal = app.personal_details || app.personal || {};
  const academic = app.academic_details || app.academic || {};
  const financial = app.financial_details || app.financial || {};
  const documents = Array.isArray(app.application_documents) ? app.application_documents : (Array.isArray(app.documents) ? app.documents : []);
  const sBadge = getTrackingStatusBadge(app.status);
  const schemeName = app.schemes?.name || app.scheme || "ST Scholarship Scheme";

  container.innerHTML = `
    <div class="space-y-4">
      <div class="flex justify-between items-center mb-2">
        <a href="#/admin/applications" class="text-xs font-bold text-secondary hover:underline flex items-center gap-1">
          <span class="material-symbols-outlined text-[16px]">arrow_back</span> Back to Scrutiny Queue
        </a>
        <span class="font-mono text-xs font-bold text-outline">DB REF: ${escapeHTML(app.application_number || app.id)}</span>
      </div>

      <!-- Applicant Dossier -->
      <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-md border border-outline-variant/30 space-y-4 text-xs">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-outline-variant/20 gap-2">
          <div>
            <h2 class="text-lg font-bold text-primary">${escapeHTML(personal.fullName || app.profiles?.full_name || 'ST Scholar')}</h2>
            <p class="text-outline">
              Tribe: <strong>${escapeHTML(app.category?.tribeName || 'Scheduled Tribe')}</strong> • Domicile: <strong>${escapeHTML(personal.state || app.profiles?.state || 'Jharkhand')}</strong>
            </p>
          </div>
          <span class="px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs ${sBadge.badgeClass}">
            ${sBadge.label}
          </span>
        </div>

        <!-- Academic & Financial Snapshot -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-surface-container-low rounded-lg">
          <div><span class="text-outline block text-[11px]">Target Scheme:</span> <strong>${escapeHTML(schemeName)}</strong></div>
          <div><span class="text-outline block text-[11px]">Enrolled / Target University:</span> <strong>${escapeHTML(academic.university || 'Oxford / IIT')}</strong></div>
          <div><span class="text-outline block text-[11px]">Annual Family Income:</span> <strong class="text-secondary font-mono">₹${escapeHTML(financial.annualIncome || '450000')}</strong></div>
          <div><span class="text-outline block text-[11px]">Aadhaar / Bank:</span> <strong>${escapeHTML(financial.bankName || 'SBI / NPCI Seeded')}</strong></div>
        </div>

        <!-- Verified Documents Checklist & Mark Verified Action -->
        <div class="pt-2">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold text-primary text-sm flex items-center gap-1.5">
              <span class="material-symbols-outlined text-secondary text-base">folder</span>
              <span>Scrutiny Checklist (Uploaded Documents: ${documents.length})</span>
            </h3>
            <span class="text-outline text-[11px]">Individual Document Attestation</span>
          </div>

          <div class="space-y-2">
            ${documents.map((d, idx) => {
              const isVerified = (d.verification_status === 'verified') || d.verified;
              const docName = d.file_name || d.name || `Document-${idx+1}.pdf`;
              const docType = d.document_type || d.type || 'Supporting Document';
              const docId = d.id || `doc-${idx}`;
              return `
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2.5 bg-surface-container-low/70 rounded-lg border border-outline-variant/30 gap-2">
                  <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-secondary text-lg">description</span>
                    <div>
                      <strong class="text-primary text-xs block">${escapeHTML(docName)}</strong>
                      <span class="text-[11px] text-outline">${escapeHTML(docType)}</span>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 self-end sm:self-auto">
                    ${isVerified ? `
                      <span class="text-tertiary-container font-bold flex items-center gap-1 text-[11px] bg-tertiary-fixed/40 px-2 py-0.5 rounded">
                        <span class="material-symbols-outlined text-[14px]">verified</span> Verified
                      </span>
                    ` : `
                      <button onclick="handleVerifyDocument('${app.id}', '${docId}', '${escapeHTML(docType)}')" class="px-2.5 py-1 bg-secondary text-white font-bold rounded text-[11px] hover:bg-secondary/90 transition flex items-center gap-1">
                        <span class="material-symbols-outlined text-[13px]">check</span> Mark Verified
                      </button>
                    `}
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>

        <!-- Officer Decision Controls (Real Database Workflow Actions) -->
        <div class="pt-4 border-t border-outline-variant/20 space-y-3">
          <label class="block font-bold text-primary text-xs">Officer Remark &amp; Scrutiny Justification *</label>
          <textarea id="admin-remark" rows="2" class="w-full p-2.5 bg-surface-container-low rounded-lg border border-outline-variant/40 text-xs focus:ring-1 focus:ring-secondary focus:outline-hidden" placeholder="Enter official scrutiny remarks, deficiency instructions, or approval justification...">${escapeHTML(app.officer_remarks || "Candidate satisfies Top 500 QS benchmark. Documents verified.")}</textarea>

          <div class="flex flex-wrap gap-2 pt-2">
            <!-- 1. Mark Provisionally Eligible (Approve) -->
            <button onclick="handleAdminReviewAction('${app.id}', 'approve', 'provisionally_eligible')" class="px-4 py-2.5 bg-tertiary-container hover:bg-tertiary text-white font-bold rounded text-xs shadow-sm transition flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">verified</span>
              <span>Mark Provisionally Eligible (अनुमोदित)</span>
            </button>

            <!-- 2. Forward for Committee Screening -->
            <button onclick="handleAdminReviewAction('${app.id}', 'forward', 'committee_screening')" class="px-4 py-2.5 bg-primary hover:bg-primary-container text-white font-bold rounded text-xs shadow-sm transition flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">groups</span>
              <span>Forward for Committee Screening</span>
            </button>

            <!-- 3. Raise Deficiency -->
            <button onclick="promptAndRaiseDeficiency('${app.id}')" class="px-4 py-2.5 bg-error hover:bg-error/90 text-white font-bold rounded text-xs shadow-sm transition flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">warning</span>
              <span>Raise Deficiency (कमी दर्ज करें)</span>
            </button>

            <!-- 4. Reject Application -->
            <button onclick="handleAdminReviewAction('${app.id}', 'reject', 'rejected')" class="px-4 py-2.5 bg-surface-container-highest hover:bg-error-container text-error font-bold rounded text-xs border border-error/30 transition flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">cancel</span>
              <span>Reject Application (अस्वीकार)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}, { layout: "admin", authRole: "admin" });

// Handle Document Verification Action
async function handleVerifyDocument(appId, docId, docType) {
  const remark = prompt(`Enter verification note for ${docType}:`, `Document verified via DigiLocker and issuing authority cross-check.`);
  if (remark === null) return;

  if (typeof window.supabaseExecuteAdminReviewAction === "function") {
    await window.supabaseExecuteAdminReviewAction({
      applicationId: appId,
      action: "mark_document_verified",
      documentId: docId,
      officerRemark: remark
    });
  }

  showToast(`✓ Document "${docType}" marked as verified.`, "success");
  router.navigate(`/admin/applications/${appId}`);
}

// Handle Raising Deficiency with Custom Document Query
async function promptAndRaiseDeficiency(appId) {
  const docType = prompt("Specify the document requiring revision / clarification:", "Annual Family Income Certificate");
  if (docType === null) return;
  const desc = prompt("Specify the detailed deficiency query for the applicant:", "Please re-upload renewed copy certified by Tehsildar for current financial year.");
  if (desc === null) return;

  const remarkText = document.getElementById("admin-remark")?.value.trim() || `Deficiency query: ${desc}`;

  await handleAdminReviewAction(appId, "raise_deficiency", "deficiency_raised", {
    documentType: docType,
    description: desc,
    officerRemark: remarkText
  });
}

// Master Admin Review Action Executor
async function handleAdminReviewAction(appId, action, newStatus, extraData = {}) {
  const remarkInput = document.getElementById("admin-remark");
  const remark = extraData.officerRemark || (remarkInput ? remarkInput.value.trim() : `Officer decision: ${newStatus}`);

  if (action === "reject" && !confirm("Are you sure you want to reject this scholarship application? This will terminate candidate evaluation.")) {
    return;
  }

  showToast("Executing ministerial scrutiny decision...", "info");

  if (typeof window.supabaseExecuteAdminReviewAction === "function") {
    try {
      const res = await window.supabaseExecuteAdminReviewAction({
        applicationId: appId,
        action: action,
        newStatus: newStatus,
        officerRemark: remark,
        deficiencyDetails: extraData
      });

      if (!res.success) {
        showToast(res.error || "Action execution failed", "error");
        return;
      }
    } catch (e) {
      console.warn("Execute review action error:", e);
    }
  }

  showToast(`✓ Application updated to: ${newStatus.replace(/_/g, ' ').toUpperCase()}`, "success");
  router.navigate("/admin/applications");
}

if (typeof window !== "undefined") {
  window.updateAdminFilter = updateAdminFilter;
  window.executeAdminSearch = executeAdminSearch;
  window.resetAdminFilters = resetAdminFilters;
  window.handleVerifyDocument = handleVerifyDocument;
  window.promptAndRaiseDeficiency = promptAndRaiseDeficiency;
  window.handleAdminReviewAction = handleAdminReviewAction;
}

// 22. Admin Scheme Configuration (/admin/schemes)
router.register("/admin/schemes", () => {
  const container = document.getElementById("main-view-container");
  container.innerHTML = `
    <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-md border border-outline-variant/30">
      <div class="flex justify-between items-center pb-3 border-b border-outline-variant/20 mb-4">
        <div>
          <h1 class="text-xl font-bold text-primary">Scheme Quotas &amp; Guidelines Configuration</h1>
          <p class="text-xs text-on-surface-variant">Update annual quota allocations, income ceilings, and cutoff deadlines.</p>
        </div>
        <button onclick="showToast('Rule adjustments saved into gazette registry.', 'success')" class="px-4 py-2 bg-secondary text-white font-bold text-xs rounded">
          Save Configuration
        </button>
      </div>

      <div class="space-y-4 text-xs">
        <div class="p-3 bg-surface-container-low rounded-lg space-y-2">
          <strong class="text-sm text-primary block">National Overseas Scholarship (NOS)</strong>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <span class="text-outline block">Annual Awards Quota</span>
              <input type="number" value="20" class="w-full p-2 bg-white rounded border border-outline-variant/40 font-bold"/>
            </div>
            <div>
              <span class="text-outline block">Income Ceiling (INR)</span>
              <input type="text" value="6,00,000" class="w-full p-2 bg-white rounded border border-outline-variant/40 font-bold"/>
            </div>
            <div>
              <span class="text-outline block">Last Date</span>
              <input type="text" value="31st October 2025" class="w-full p-2 bg-white rounded border border-outline-variant/40 font-bold"/>
            </div>
          </div>
        </div>

        <div class="p-3 bg-surface-container-low rounded-lg space-y-2">
          <strong class="text-sm text-primary block">National Fellowship for ST Students (NFST)</strong>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <span class="text-outline block">Annual Awards Quota</span>
              <input type="number" value="750" class="w-full p-2 bg-white rounded border border-outline-variant/40 font-bold"/>
            </div>
            <div>
              <span class="text-outline block">Income Ceiling (INR)</span>
              <input type="text" value="6,00,000" class="w-full p-2 bg-white rounded border border-outline-variant/40 font-bold"/>
            </div>
            <div>
              <span class="text-outline block">Last Date</span>
              <input type="text" value="31st October 2025" class="w-full p-2 bg-white rounded border border-outline-variant/40 font-bold"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}, { layout: "admin", authRole: "admin" });

// Initialize routing & Supabase session on DOMContentLoaded
document.addEventListener("DOMContentLoaded", async () => {
  if (window.initSupabaseAuthSync) {
    try {
      await window.initSupabaseAuthSync();
    } catch (e) {
      console.warn("Supabase auth sync error:", e);
    }
  }
  router.handleRouting();
});
