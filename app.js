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
  container.innerHTML = `
    <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-md border border-outline-variant/30">
      <div class="mb-4">
        <h1 class="text-xl font-bold text-primary">Initiate New Scholarship Application</h1>
        <p class="text-xs text-on-surface-variant">Choose your target scheme track to start your multi-step submission:</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="p-4 rounded-xl border-2 border-secondary bg-surface-container-low flex flex-col justify-between">
          <div>
            <span class="text-xs font-bold text-secondary uppercase">International Track</span>
            <h3 class="text-lg font-bold text-primary mt-1">National Overseas Scholarship (NOS)</h3>
            <p class="text-xs text-on-surface-variant mt-2">Full funding for Oxford, Cambridge, and QS Top 500 Universities abroad.</p>
          </div>
          <a href="#/application/personal?scheme=NOS" class="mt-4 py-2.5 bg-secondary text-white font-bold text-center rounded text-sm hover:bg-secondary/90">
            Start NOS Application →
          </a>
        </div>

        <div class="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest flex flex-col justify-between">
          <div>
            <span class="text-xs font-bold text-primary uppercase">Domestic Research Track</span>
            <h3 class="text-lg font-bold text-primary mt-1">National Fellowship for ST Students (NFST)</h3>
            <p class="text-xs text-on-surface-variant mt-2">₹38,000 monthly fellowship for Indian Universities / IITs / NITs.</p>
          </div>
          <a href="#/application/personal?scheme=NFST" class="mt-4 py-2.5 bg-primary-container text-white font-bold text-center rounded text-sm hover:bg-primary">
            Start NFST Application →
          </a>
        </div>
      </div>
    </div>
  `;
}, { layout: "applicant", authRole: "applicant" });

// 10. Step 1: Personal Details (/application/personal)
router.register("/application/personal", (params = {}) => {
  const app = window.appStore.getApplication();
  
  // Set scheme if passed via URL query parameter (e.g. ?scheme=NOS or ?scheme=NFST)
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
    }
  }

  const container = document.getElementById("main-view-container");

  container.innerHTML = `
    ${renderWizardStepper(0)}

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

function savePersonalDraft() {
  window.appStore.updateSection("personal", {
    fullName: document.getElementById("p-name").value,
    dob: document.getElementById("p-dob").value,
    mobile: document.getElementById("p-mobile").value,
    email: document.getElementById("p-email").value,
    state: document.getElementById("p-state").value,
    district: document.getElementById("p-district").value,
    address: document.getElementById("p-address").value
  });
  showToast("Draft saved in browser memory!", "info");
}

function handlePersonalSubmit(e) {
  e.preventDefault();
  if (!validatePersonal()) {
    showToast("Please fill all required personal fields.", "error");
    return;
  }
  savePersonalDraft();
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
  saveAcademicDraft();
  router.navigate("/application/personal");
}

function saveAcademicDraft() {
  window.appStore.updateSection("academic", {
    university: document.getElementById("a-univ").value,
    qsRank: document.getElementById("a-rank").value,
    courseTitle: document.getElementById("a-course").value,
    offerType: document.getElementById("a-offer-type").value,
    percentage: document.getElementById("a-score").value
  });
  showToast("Academic draft saved!", "info");
}

function handleAcademicSubmit(e) {
  e.preventDefault();
  const univ = document.getElementById("a-univ").value.trim();
  const course = document.getElementById("a-course").value.trim();
  const score = document.getElementById("a-score").value.trim();

  document.querySelectorAll("[id^='err-a-']").forEach(el => el.classList.add("hidden"));

  if (!univ) { document.getElementById("err-a-univ").classList.remove("hidden"); return; }
  if (!course) { document.getElementById("err-a-course").classList.remove("hidden"); return; }
  if (!score) { document.getElementById("err-a-score").classList.remove("hidden"); return; }

  saveAcademicDraft();
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
  saveFinancialDraft();
  router.navigate("/application/academic");
}

function saveFinancialDraft() {
  window.appStore.updateSection("financial", {
    annualIncome: document.getElementById("f-income").value,
    bankName: document.getElementById("f-bank").value,
    ifsc: document.getElementById("f-ifsc").value
  });
  showToast("Financial draft saved!", "info");
}

function handleFinancialSubmit(e) {
  e.preventDefault();
  const income = document.getElementById("f-income").value.trim();
  const bank = document.getElementById("f-bank").value.trim();
  const ifsc = document.getElementById("f-ifsc").value.trim();

  document.querySelectorAll("[id^='err-f-']").forEach(el => el.classList.add("hidden"));

  if (!income) { document.getElementById("err-f-income").classList.remove("hidden"); return; }
  if (!bank) { document.getElementById("err-f-bank").classList.remove("hidden"); return; }
  if (!ifsc) { document.getElementById("err-f-ifsc").classList.remove("hidden"); return; }

  saveFinancialDraft();
  const app = window.appStore.getApplication();
  app.lastSavedStep = "/application/documents";
  window.appStore.saveApplication(app);
  router.navigate("/application/documents");
}

// 13. Step 4: Documents Upload (/application/documents)
router.register("/application/documents", () => {
  const app = window.appStore.getApplication();
  const container = document.getElementById("main-view-container");

  container.innerHTML = `
    ${renderWizardStepper(3)}

    <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-md border border-outline-variant/30">
      <div class="flex justify-between items-center pb-3 border-b border-outline-variant/20 mb-4">
        <div>
          <h2 class="text-lg font-bold text-primary">Step 4: Mandatory Document Uploads &amp; DigiLocker Sync</h2>
          <p class="text-xs text-on-surface-variant">All documents verified via government repository.</p>
        </div>
        <span class="px-2 py-0.5 bg-tertiary-container text-white text-xs font-bold rounded">5 Verified</span>
      </div>

      <div class="space-y-3 mb-6">
        ${app.documents.map(doc => `
          <div class="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 text-sm">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-secondary text-2xl">picture_as_pdf</span>
              <div>
                <strong class="text-primary block">${doc.name}</strong>
                <span class="text-xs text-outline">${doc.type} • ${doc.size}</span>
              </div>
            </div>
            <span class="inline-flex items-center gap-1 text-xs font-bold text-tertiary-container bg-tertiary-fixed/60 px-2.5 py-1 rounded">
              <span class="material-symbols-outlined text-[15px]">check_circle</span> Verified
            </span>
          </div>
        `).join("")}
      </div>

      <div class="flex justify-between items-center pt-4 border-t border-outline-variant/20">
        <button type="button" onclick="router.navigate('/application/financial')" class="px-4 py-2 bg-surface-container text-primary font-bold rounded text-xs flex items-center gap-1">
          ← [Back]
        </button>
        <div class="flex gap-2">
          <button type="button" onclick="showToast('Documents saved!', 'info')" class="px-4 py-2 bg-surface-container-high text-primary font-bold rounded text-xs">
            [Save Draft]
          </button>
          <button type="button" onclick="handleDocumentsContinue()" class="px-5 py-2.5 bg-secondary text-white font-bold rounded text-sm hover:bg-secondary/90 shadow-sm flex items-center gap-1">
            [Save and Continue] →
          </button>
        </div>
      </div>
    </div>
  `;
}, { layout: "applicant", authRole: "applicant" });

function handleDocumentsContinue() {
  const app = window.appStore.getApplication();
  app.lastSavedStep = "/application/review";
  window.appStore.saveApplication(app);
  router.navigate("/application/review");
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
          <button onclick="executeFinalSubmit()" class="px-6 py-3 bg-secondary hover:bg-secondary/90 text-white font-bold rounded text-sm shadow-md flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">send</span> Submit Application (अंतिम प्रस्तुति)
          </button>
        </div>
      </div>
    </div>
  `;
}, { layout: "applicant", authRole: "applicant" });

function executeFinalSubmit() {
  const checkbox = document.getElementById("legal-declaration");
  const err = document.getElementById("declaration-err");

  if (!checkbox.checked) {
    err.classList.remove("hidden");
    return;
  }
  err.classList.add("hidden");

  const app = window.appStore.getApplication();
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
  showToast(`Application submitted! Ref: ${app.id}`, "success");
  router.navigate("/application/success");
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

// 16. Application Tracking (/application/track)
router.register("/application/track", () => {
  const app = window.appStore.getApplication();
  const container = document.getElementById("main-view-container");

  // Determine timeline stage states
  const stages = [
    { title: "Submitted", desc: app.submissionDate || "Completed on submission", done: true },
    { title: "Initial Validation", desc: "DigiLocker & NPCI Verified", done: true },
    { 
      title: "Document Scrutiny", 
      desc: app.status === "Approved" || app.status === "Committee Screening" ? "Verified" :
            app.status === "Deficiency Raised" ? "Deficiency Raised: Revised Document Required" :
            app.status === "Rejected" ? "Rejected during scrutiny" : "In progress with Nodal Officer", 
      active: app.status === "Under Document Scrutiny",
      done: app.status === "Approved" || app.status === "Committee Screening",
      failed: app.status === "Deficiency Raised" || app.status === "Rejected"
    },
    { 
      title: "Committee Screening", 
      desc: "Merit Evaluation", 
      done: app.status === "Approved",
      active: app.status === "Committee Screening"
    },
    { 
      title: "Final Decision & PFMS Credit", 
      desc: app.status === "Approved" ? "Sanctioned & Direct Benefit Transferred" : "Pending",
      done: app.status === "Approved" 
    }
  ];

  container.innerHTML = `
    <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-md border border-outline-variant/30">
      <div class="flex justify-between items-center pb-3 border-b border-outline-variant/20 mb-4">
        <div>
          <h1 class="text-xl font-bold text-primary">Live Application Tracking</h1>
          <p class="text-xs text-on-surface-variant font-mono">APP ID: ${app.id} • ${app.scheme}</p>
        </div>
        <span class="px-3 py-1 rounded text-xs font-bold ${
          app.status === 'Approved' ? 'bg-tertiary-fixed text-on-tertiary-fixed' :
          app.status === 'Deficiency Raised' ? 'bg-error text-white' :
          'bg-secondary-fixed text-on-secondary-fixed'
        }">
          ${app.status}
        </span>
      </div>

      ${app.status === 'Deficiency Raised' ? `
        <div class="mb-6 p-4 bg-error-container text-on-error-container rounded-xl flex items-center justify-between">
          <div>
            <strong class="block text-sm">Action Required: Document Deficiency</strong>
            <p class="text-xs mt-0.5">${app.deficiency ? app.deficiency.remark : 'Nodal officer requested updated income certificate.'}</p>
          </div>
          <a href="#/application/deficiency" class="px-4 py-2 bg-error text-white font-bold text-xs rounded shadow-sm">
            Resolve Now →
          </a>
        </div>
      ` : ''}

      <!-- Timeline List -->
      <h3 class="text-sm font-bold text-primary mb-4">Progress Lifecycle</h3>
      <div class="relative pl-6 space-y-6 border-l-2 border-primary/20 ml-3">
        ${stages.map((st, i) => {
          let dotColor = "bg-surface-container-highest text-outline";
          let icon = i + 1;
          if (st.done) {
            dotColor = "bg-tertiary-container text-white";
            icon = '<span class="material-symbols-outlined text-[14px]">check</span>';
          } else if (st.active) {
            dotColor = "bg-secondary text-white ring-4 ring-secondary/20 animate-pulse";
            icon = '<span class="material-symbols-outlined text-[14px]">pending</span>';
          } else if (st.failed) {
            dotColor = "bg-error text-white";
            icon = '<span class="material-symbols-outlined text-[14px]">priority_high</span>';
          }

          return `
            <div class="relative">
              <div class="absolute -left-[31px] top-0 w-6 h-6 rounded-full ${dotColor} flex items-center justify-center text-xs font-bold">
                ${icon}
              </div>
              <p class="font-bold text-sm text-primary">${st.title}</p>
              <p class="text-xs text-on-surface-variant">${st.desc}</p>
            </div>
          `;
        }).join("")}
      </div>

      <!-- History Log -->
      <div class="mt-8 pt-4 border-t border-outline-variant/20">
        <h4 class="text-xs font-bold text-outline uppercase mb-2">Audit &amp; Action Log</h4>
        <div class="space-y-1 text-xs">
          ${app.history.map(h => `
            <div class="p-2 bg-surface-container-low rounded flex justify-between">
              <div>
                <strong>${h.title}</strong> by <span class="text-secondary">${h.officer}</span>: ${h.remark}
              </div>
              <span class="text-outline font-mono">${h.time}</span>
            </div>
          `).join("")}
        </div>
      </div>
    </div>
  `;
}, { layout: "applicant" });

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
router.register("/admin/dashboard", () => {
  const queue = window.appStore.getAdminQueue();
  const container = document.getElementById("main-view-container");

  const total = queue.length;
  const underScrutiny = queue.filter(q => q.status === "Under Document Scrutiny").length;
  const approved = queue.filter(q => q.status === "Approved").length;
  const deficiency = queue.filter(q => q.status === "Deficiency Raised").length;

  container.innerHTML = `
    <div class="space-y-space-lg">
      <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold text-primary">MoTA Officer Scrutiny Console</h1>
          <p class="text-xs text-on-surface-variant">Central Tribal Schemes &amp; Fellowships Management</p>
        </div>
        <a href="#/admin/applications" class="px-4 py-2 bg-secondary text-white font-bold text-sm rounded shadow-sm hover:bg-secondary/90">
          Open Scrutiny Queue (${underScrutiny})
        </a>
      </div>

      <!-- Metrics -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="p-4 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30">
          <span class="text-xs text-outline font-semibold">Total Intake</span>
          <p class="text-2xl font-bold text-primary mt-1">${total}</p>
        </div>
        <div class="p-4 bg-surface-container-lowest rounded-xl shadow-sm border border-secondary/30">
          <span class="text-xs text-secondary font-semibold">Pending Scrutiny</span>
          <p class="text-2xl font-bold text-secondary mt-1">${underScrutiny}</p>
        </div>
        <div class="p-4 bg-surface-container-lowest rounded-xl shadow-sm border border-tertiary-container/30">
          <span class="text-xs text-tertiary-container font-semibold">Approved (PFMS Ready)</span>
          <p class="text-2xl font-bold text-tertiary-container mt-1">${approved}</p>
        </div>
        <div class="p-4 bg-surface-container-lowest rounded-xl shadow-sm border border-error/30">
          <span class="text-xs text-error font-semibold">Deficiency Raised</span>
          <p class="text-2xl font-bold text-error mt-1">${deficiency}</p>
        </div>
      </div>

      <!-- Quick Action Queue Preview -->
      <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30">
        <h2 class="text-base font-bold text-primary mb-3">Priority Review Candidates</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-surface-container text-primary font-bold">
              <tr>
                <th class="p-3">Ref ID</th>
                <th class="p-3">Candidate</th>
                <th class="p-3">Scheme</th>
                <th class="p-3">University</th>
                <th class="p-3">Status</th>
                <th class="p-3">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/20">
              ${queue.map(q => `
                <tr class="hover:bg-surface-container-low transition">
                  <td class="p-3 font-mono font-bold">${q.id}</td>
                  <td class="p-3"><strong>${q.applicantName}</strong> (${q.state})</td>
                  <td class="p-3 font-semibold">${q.schemeCode}</td>
                  <td class="p-3">${q.university}</td>
                  <td class="p-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                    q.status === 'Approved' ? 'bg-tertiary-fixed text-on-tertiary-fixed' :
                    q.status === 'Deficiency Raised' ? 'bg-error text-white' :
                    'bg-secondary-fixed text-on-secondary-fixed'
                  }">${q.status}</span></td>
                  <td class="p-3">
                    <a href="#/admin/applications/${q.id}" class="text-secondary font-bold hover:underline">
                      Review →
                    </a>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}, { layout: "admin", authRole: "admin" });

// 20. Admin Applications Queue (/admin/applications)
router.register("/admin/applications", () => {
  const queue = window.appStore.getAdminQueue();
  const container = document.getElementById("main-view-container");

  container.innerHTML = `
    <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-sm border border-outline-variant/30">
      <div class="flex justify-between items-center pb-3 border-b border-outline-variant/20 mb-4">
        <div>
          <h1 class="text-xl font-bold text-primary">Applications Scrutiny Queue</h1>
          <p class="text-xs text-on-surface-variant">Review applicant credentials and execute committee routing.</p>
        </div>
        <span class="text-xs text-outline">${queue.length} Active Records</span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-surface-container text-primary font-bold">
            <tr>
              <th class="p-3">Application Ref</th>
              <th class="p-3">Applicant &amp; Community</th>
              <th class="p-3">Scheme</th>
              <th class="p-3">QS Rank / Inst</th>
              <th class="p-3">Current Status</th>
              <th class="p-3">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/20">
            ${queue.map(q => `
              <tr class="hover:bg-surface-container-low transition">
                <td class="p-3 font-mono font-bold">${q.id}</td>
                <td class="p-3">
                  <strong class="text-primary block">${q.applicantName}</strong>
                  <span class="text-[11px] text-outline">${q.otrId}</span>
                </td>
                <td class="p-3 font-semibold">${q.schemeCode}</td>
                <td class="p-3">${q.university}</td>
                <td class="p-3">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold ${
                    q.status === 'Approved' ? 'bg-tertiary-fixed text-on-tertiary-fixed' :
                    q.status === 'Deficiency Raised' ? 'bg-error text-white' :
                    'bg-secondary-fixed text-on-secondary-fixed'
                  }">
                    ${q.status}
                  </span>
                </td>
                <td class="p-3">
                  <a href="#/admin/applications/${q.id}" class="px-3 py-1.5 bg-primary text-white font-bold rounded hover:bg-primary-container text-xs inline-block">
                    Review
                  </a>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}, { layout: "admin", authRole: "admin" });

// 21. Admin Application Review (/admin/applications/:id)
router.register("/admin/applications/:id", (params) => {
  const appId = params.id;
  const app = window.appStore.getApplicationById(appId);
  const container = document.getElementById("main-view-container");

  container.innerHTML = `
    <div class="space-y-4">
      <div class="flex justify-between items-center mb-2">
        <a href="#/admin/applications" class="text-xs font-bold text-secondary hover:underline flex items-center gap-1">
          ← Back to Applications Queue
        </a>
        <span class="font-mono text-xs font-bold text-outline">ID: ${appId}</span>
      </div>

      <!-- Applicant Dossier -->
      <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-md border border-outline-variant/30 space-y-4 text-xs">
        <div class="flex justify-between items-center pb-3 border-b border-outline-variant/20">
          <div>
            <h2 class="text-lg font-bold text-primary">${app.personal.fullName}</h2>
            <p class="text-outline">Community: <strong>${app.category.tribeName}</strong> | State: ${app.personal.state}</p>
          </div>
          <span class="px-3 py-1 bg-secondary-fixed text-on-secondary-fixed rounded text-xs font-bold">
            ${app.status}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-surface-container-low rounded-lg">
          <div><span class="text-outline block">Scheme:</span> <strong>${app.scheme}</strong></div>
          <div><span class="text-outline block">Host University:</span> <strong>${app.academic.university}</strong></div>
          <div><span class="text-outline block">Family Income:</span> <strong class="text-secondary">₹${app.financial.annualIncome}</strong></div>
          <div><span class="text-outline block">Aadhaar Bank:</span> <strong>${app.financial.bankName}</strong></div>
        </div>

        <!-- Verified Documents Checklist -->
        <h3 class="font-bold text-primary text-sm pt-2">Scrutiny Checklist (Attached Files)</h3>
        <div class="space-y-2">
          ${app.documents.map(d => `
            <div class="flex justify-between items-center p-2 bg-surface-container-low/60 rounded">
              <span><strong>${d.name}</strong> (${d.type})</span>
              <span class="text-tertiary-container font-bold flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px]">verified</span> DigiLocker Verified
              </span>
            </div>
          `).join("")}
        </div>

        <!-- Officer Decision Controls -->
        <div class="pt-4 border-t border-outline-variant/20 space-y-3">
          <label class="block font-bold text-primary text-xs">Officer Remark &amp; Justification *</label>
          <textarea id="admin-remark" rows="2" class="w-full p-2 bg-surface-container-low rounded border border-outline-variant/40 text-xs">Candidate satisfies Top 500 QS benchmark. Documents verified.</textarea>

          <div class="flex flex-wrap gap-2 pt-2">
            <button onclick="handleAdminAction('${appId}', 'Approved', 'Approved by Ministry Scrutiny Cell.')" class="px-4 py-2 bg-tertiary-container text-white font-bold rounded text-xs hover:opacity-90">
              Approve Documents (PFMS Ready)
            </button>
            <button onclick="handleAdminAction('${appId}', 'Committee Screening', 'Forwarded to National Steering Committee.')" class="px-4 py-2 bg-primary text-white font-bold rounded text-xs hover:bg-primary-container">
              Forward for Committee Screening
            </button>
            <button onclick="handleAdminAction('${appId}', 'Deficiency Raised', 'Document deficiency query raised.')" class="px-4 py-2 bg-error text-white font-bold rounded text-xs hover:opacity-90">
              Raise Deficiency
            </button>
            <button onclick="handleAdminAction('${appId}', 'Rejected', 'Application does not meet guidelines.')" class="px-4 py-2 bg-surface-container-highest text-error font-bold rounded text-xs hover:bg-surface-container">
              Reject Application
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}, { layout: "admin", authRole: "admin" });

function handleAdminAction(appId, newStatus, defaultRemark) {
  const remark = document.getElementById("admin-remark").value.trim() || defaultRemark;
  const app = window.appStore.getApplication();

  if (app.id === appId) {
    app.status = newStatus;
    if (newStatus === "Deficiency Raised") {
      app.deficiency = { remark, date: new Date().toLocaleString("en-IN") };
    } else {
      app.deficiency = null;
    }

    app.history.push({
      title: `Status Changed to ${newStatus}`,
      time: new Date().toLocaleString("en-IN"),
      officer: "Shri K. S. Verma (Officer)",
      remark: remark
    });

    window.appStore.saveApplication(app);
  } else {
    const queue = window.appStore.getAdminQueue();
    const item = queue.find(q => q.id === appId);
    if (item) {
      item.status = newStatus;
      window.appStore.saveAdminQueue(queue);
    }
  }

  showToast(`Application ${appId} updated to: ${newStatus}`, "success");
  router.navigate("/admin/applications");
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
