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

        <!-- Flagship Schemes Cards -->
        <section class="w-full mb-space-xl">
          <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-space-lg gap-space-sm">
            <div>
              <div class="inline-flex items-center gap-1 text-secondary font-label-sm font-bold uppercase tracking-wider mb-1">
                <span>MoTA Central Flagships</span>
              </div>
              <h2 class="font-headline-lg font-bold text-primary text-2xl">
                Featured Schemes &amp; Fellowships
              </h2>
            </div>
            <a class="inline-flex items-center gap-1 font-label-lg text-secondary hover:text-on-secondary-fixed-variant font-bold transition-colors" href="#/schemes">
              View All 14 Schemes <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
            <!-- NOS Card -->
            <div class="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden border border-outline-variant/30 flex flex-col justify-between">
              <div class="h-2 bg-secondary"></div>
              <div class="p-space-lg flex-1 flex flex-col justify-between">
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="px-2.5 py-0.5 rounded text-xs font-semibold bg-surface-container-highest text-primary">International</span>
                    <span class="text-xs font-mono text-outline">SCH-MOTA-NOS</span>
                  </div>
                  <h3 class="font-title-md font-bold text-primary text-xl mb-1">National Overseas Scholarship (NOS)</h3>
                  <p class="text-secondary font-medium text-sm mb-3">Higher studies abroad (QS Top 500)</p>
                  <p class="text-on-surface-variant text-sm mb-4 leading-relaxed">
                    100% financial assistance covering full tuition fees, living expenses, and airfare for Master's and Ph.D. scholars abroad.
                  </p>
                  <div class="bg-surface-container-low p-3 rounded-lg text-xs space-y-1 mb-4">
                    <div class="flex justify-between"><span class="text-outline">Eligibility:</span> <span class="font-semibold text-on-surface">55%+ in Master's</span></div>
                    <div class="flex justify-between"><span class="text-outline">Income Limit:</span> <span class="font-semibold text-on-surface">≤ ₹6.00 Lakhs/yr</span></div>
                    <div class="flex justify-between"><span class="text-outline">Annual Slots:</span> <span class="font-semibold text-primary">20 Scholars</span></div>
                  </div>
                </div>
                <div class="flex gap-2">
                  <a href="#/schemes/nos" class="flex-1 py-2.5 bg-surface-container hover:bg-surface-container-high text-primary font-bold rounded text-center text-sm transition">
                    View Details
                  </a>
                  <a href="#/application/personal?scheme=NOS" class="flex-1 py-2.5 bg-secondary hover:bg-secondary/90 text-white font-bold rounded text-center text-sm transition shadow-sm">
                    Apply Now
                  </a>
                </div>
              </div>
            </div>

            <!-- NFST Card -->
            <div class="bg-surface-container-lowest rounded-xl shadow-md overflow-hidden border border-outline-variant/30 flex flex-col justify-between">
              <div class="h-2 bg-primary-container"></div>
              <div class="p-space-lg flex-1 flex flex-col justify-between">
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="px-2.5 py-0.5 rounded text-xs font-semibold bg-tertiary-container/15 text-on-tertiary-fixed-variant">Research / Ph.D.</span>
                    <span class="text-xs font-mono text-outline">SCH-MOTA-NF</span>
                  </div>
                  <h3 class="font-title-md font-bold text-primary text-xl mb-1">National Fellowship for ST Students (NFST)</h3>
                  <p class="text-secondary font-medium text-sm mb-3">Higher research in Indian Universities / IITs / NITs</p>
                  <p class="text-on-surface-variant text-sm mb-4 leading-relaxed">
                    Stipend up to ₹38,000/month + contingency grant for regular M.Phil and Ph.D. scholars in recognized Indian universities.
                  </p>
                  <div class="bg-surface-container-low p-3 rounded-lg text-xs space-y-1 mb-4">
                    <div class="flex justify-between"><span class="text-outline">Eligibility:</span> <span class="font-semibold text-on-surface">UGC-NET / JRF Qualified</span></div>
                    <div class="flex justify-between"><span class="text-outline">Income Limit:</span> <span class="font-semibold text-on-surface">≤ ₹6.00 Lakhs/yr</span></div>
                    <div class="flex justify-between"><span class="text-outline">Annual Slots:</span> <span class="font-semibold text-primary">750 Scholars</span></div>
                  </div>
                </div>
                <div class="flex gap-2">
                  <a href="#/schemes/nfst" class="flex-1 py-2.5 bg-surface-container hover:bg-surface-container-high text-primary font-bold rounded text-center text-sm transition">
                    View Details
                  </a>
                  <a href="#/application/personal?scheme=NFST" class="flex-1 py-2.5 bg-primary-container hover:bg-primary text-white font-bold rounded text-center text-sm transition shadow-sm">
                    Apply Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  `;
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
          <span class="material-symbols-outlined text-[16px]">info</span> Demo Credentials for Prototype:
        </p>
        <p class="text-on-secondary-fixed-variant">Email: <strong class="font-mono">student@demo.com</strong></p>
        <p class="text-on-secondary-fixed-variant">Password: <strong class="font-mono">student123</strong></p>
      </div>

      <form id="applicant-login-form" onsubmit="handleApplicantLogin(event)" class="space-y-space-md">
        <div>
          <label class="block text-xs font-bold text-on-surface mb-1">Applicant Email / OTR ID *</label>
          <input type="text" id="app-login-user" value="student@demo.com" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm font-semibold" required/>
        </div>
        <div>
          <label class="block text-xs font-bold text-on-surface mb-1">Password *</label>
          <input type="password" id="app-login-pwd" value="student123" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm font-semibold" required/>
        </div>

        <button type="submit" class="w-full py-3 bg-secondary hover:bg-secondary/90 text-white font-bold rounded shadow-md flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-[20px]">login</span> Sign In to Dashboard
        </button>
      </form>

      <div class="mt-4 pt-4 border-t border-outline-variant/20 flex justify-between text-xs">
        <a href="#/register" class="text-secondary font-bold hover:underline">New Registration (OTR)</a>
        <a href="#/admin/login" class="text-outline hover:underline">Admin Login →</a>
      </div>
    </div>
  `;
});

function handleApplicantLogin(e) {
  e.preventDefault();
  const email = document.getElementById("app-login-user").value.trim();
  const pwd = document.getElementById("app-login-pwd").value.trim();

  if (email === "student@demo.com" && pwd === "student123") {
    window.appStore.setAuthUser({
      role: "applicant",
      email: "student@demo.com",
      name: "Priya Munda",
      otrId: "OTR-2025-ST-884129"
    });
    showToast("Welcome Priya Munda! Signed in successfully.", "success");
    router.navigate("/applicant/dashboard");
  } else {
    showToast("Invalid credentials. Use student@demo.com / student123", "error");
  }
}

// 3. Registration Page (/register)
router.register("/register", () => {
  const container = document.getElementById("main-view-container");
  container.innerHTML = `
    <div class="max-w-xl mx-auto my-12 p-space-xl bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/30">
      <div class="text-center mb-space-lg">
        <span class="text-xs uppercase font-bold text-secondary tracking-wider block mb-1">e-KYC Secured Gateway</span>
        <h1 class="font-headline-sm text-primary font-bold text-2xl">One-Time Registration (OTR)</h1>
        <p class="text-xs text-on-surface-variant mt-1">
          Aadhaar authentication ensures your scholarship reaches your seeded bank account without intermediary delays.
        </p>
      </div>

      <form onsubmit="handleRegistrationSubmit(event)" class="space-y-space-md">
        <div>
          <label class="block text-xs font-bold text-on-surface mb-1">12-Digit Aadhaar Number *</label>
          <input type="text" id="reg-aadhaar" value="5429 8841 2901" class="w-full h-11 px-3 bg-surface-container-low font-mono rounded border border-outline-variant/40 text-sm" required/>
        </div>
        <div>
          <label class="block text-xs font-bold text-on-surface mb-1">Mobile Number (Aadhaar Linked) *</label>
          <input type="tel" id="reg-mobile" value="+91 98765 43210" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm" required/>
        </div>
        <div>
          <label class="block text-xs font-bold text-on-surface mb-1">State of Domicile *</label>
          <select id="reg-state" class="w-full h-11 px-3 bg-surface-container-low rounded border border-outline-variant/40 text-sm">
            <option value="Jharkhand" selected>Jharkhand</option>
            <option value="Odisha">Odisha</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Chhattisgarh">Chhattisgarh</option>
          </select>
        </div>

        <button type="submit" class="w-full py-3 bg-secondary hover:bg-secondary/90 text-white font-bold rounded shadow-md flex items-center justify-center gap-2">
          <span class="material-symbols-outlined text-[20px]">fingerprint</span> Verify Aadhaar &amp; Generate OTR
        </button>
      </form>

      <div class="mt-4 pt-4 border-t border-outline-variant/20 text-center text-xs">
        <span>Already registered?</span> <a href="#/login" class="text-secondary font-bold hover:underline">Sign In</a>
      </div>
    </div>
  `;
});

function handleRegistrationSubmit(e) {
  e.preventDefault();
  window.appStore.setAuthUser({
    role: "applicant",
    email: "student@demo.com",
    name: "Priya Munda",
    otrId: "OTR-2025-ST-884129"
  });
  showToast("Aadhaar OTP verified! OTR: OTR-2025-ST-884129 generated.", "success");
  router.navigate("/applicant/dashboard");
}

// 4. All Schemes Directory (/schemes)
router.register("/schemes", () => {
  const container = document.getElementById("main-view-container");
  container.innerHTML = `
    <div class="max-w-7xl mx-auto px-margin py-space-xl">
      <div class="mb-space-lg flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <span class="text-xs uppercase font-bold text-secondary tracking-wider block mb-1">Ministry of Tribal Affairs</span>
          <h1 class="font-headline-lg font-bold text-primary text-3xl">All Schemes &amp; Fellowships</h1>
          <p class="text-sm text-on-surface-variant mt-1">Select an eligible scheme to inspect detailed guidelines or apply online.</p>
        </div>
        <a href="#/application/new" class="px-5 py-2.5 bg-secondary text-white font-bold rounded text-sm shadow-sm hover:bg-secondary/90">
          Apply for New Scheme
        </a>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
        <!-- Card NOS -->
        <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-md border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="px-2 py-0.5 rounded text-xs font-bold bg-surface-container-highest text-primary">Overseas / International</span>
              <span class="text-xs font-mono text-outline">SCH-MOTA-NOS</span>
            </div>
            <h2 class="text-xl font-bold text-primary mb-1">National Overseas Scholarship (NOS)</h2>
            <p class="text-xs text-secondary font-semibold mb-2">Master's &amp; Doctoral degrees in Top 500 QS Universities</p>
            <p class="text-sm text-on-surface-variant mb-4">100% financial assistance covering full tuition fees, contingency living grant, and international travel.</p>
          </div>
          <div class="flex gap-2">
            <a href="#/schemes/nos" class="flex-1 py-2 text-center bg-surface-container text-primary font-bold rounded text-sm hover:bg-surface-container-high">
              View Details
            </a>
            <a href="#/application/personal?scheme=NOS" class="flex-1 py-2 text-center bg-secondary text-white font-bold rounded text-sm hover:bg-secondary/90 shadow-sm">
              Apply Now
            </a>
          </div>
        </div>

        <!-- Card NFST -->
        <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-md border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-center mb-2">
              <span class="px-2 py-0.5 rounded text-xs font-bold bg-tertiary-container/15 text-on-tertiary-fixed-variant">Research / India</span>
              <span class="text-xs font-mono text-outline">SCH-MOTA-NF</span>
            </div>
            <h2 class="text-xl font-bold text-primary mb-1">National Fellowship for ST Students (NFST)</h2>
            <p class="text-xs text-secondary font-semibold mb-2">M.Phil and Ph.D. scholars in recognized Indian Universities</p>
            <p class="text-sm text-on-surface-variant mb-4">Monthly stipend of ₹38,000 + HRA and annual contingency grant for higher doctoral research.</p>
          </div>
          <div class="flex gap-2">
            <a href="#/schemes/nfst" class="flex-1 py-2 text-center bg-surface-container text-primary font-bold rounded text-sm hover:bg-surface-container-high">
              View Details
            </a>
            <a href="#/application/personal?scheme=NFST" class="flex-1 py-2 text-center bg-primary-container text-white font-bold rounded text-sm hover:bg-primary shadow-sm">
              Apply Now
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
});

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
router.register("/application/personal", () => {
  const app = window.appStore.getApplication();
  const container = document.getElementById("main-view-container");

  container.innerHTML = `
    ${renderWizardStepper(0)}

    <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-md border border-outline-variant/30">
      <div class="flex justify-between items-center pb-3 border-b border-outline-variant/20 mb-4">
        <div>
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
          <button type="button" onclick="router.navigate('/application/personal')" class="px-4 py-2 bg-surface-container text-primary font-bold rounded text-xs flex items-center gap-1">
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
          <button type="button" onclick="router.navigate('/application/academic')" class="px-4 py-2 bg-surface-container text-primary font-bold rounded text-xs flex items-center gap-1">
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
      <!-- Warning Note -->
      <div class="p-3 bg-secondary-fixed text-on-secondary-fixed rounded-xl flex items-center gap-3 text-xs font-medium">
        <span class="material-symbols-outlined text-secondary text-xl">warning</span>
        <span>Please review your submission carefully. Changes cannot be altered once submitted to the Ministry.</span>
      </div>

      <!-- Section Reviews with [Edit] Buttons -->
      <div class="bg-surface-container-lowest p-space-lg rounded-xl shadow-md border border-outline-variant/30 space-y-4 text-sm">
        <!-- Personal Review -->
        <div class="p-3 bg-surface-container-low rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold text-primary flex items-center gap-1">
              <span class="material-symbols-outlined text-[18px]">badge</span> 1. Personal Details
            </h3>
            <button onclick="router.navigate('/application/personal')" class="text-xs text-secondary font-bold hover:underline">[Edit]</button>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div><span class="text-outline block">Name:</span> <strong>${app.personal.fullName}</strong></div>
            <div><span class="text-outline block">DOB:</span> <strong>${app.personal.dob}</strong></div>
            <div><span class="text-outline block">Mobile:</span> <strong>${app.personal.mobile}</strong></div>
            <div><span class="text-outline block">Email:</span> <strong>${app.personal.email}</strong></div>
            <div class="sm:col-span-2"><span class="text-outline block">Address:</span> <strong>${app.personal.address}</strong></div>
          </div>
        </div>

        <!-- Academic Review -->
        <div class="p-3 bg-surface-container-low rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold text-primary flex items-center gap-1">
              <span class="material-symbols-outlined text-[18px]">school</span> 2. Academic Details
            </h3>
            <button onclick="router.navigate('/application/academic')" class="text-xs text-secondary font-bold hover:underline">[Edit]</button>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div class="sm:col-span-2"><span class="text-outline block">University:</span> <strong>${app.academic.university}</strong></div>
            <div><span class="text-outline block">QS Rank:</span> <strong>#${app.academic.qsRank}</strong></div>
            <div class="sm:col-span-2"><span class="text-outline block">Course:</span> <strong>${app.academic.courseTitle}</strong></div>
            <div><span class="text-outline block">Offer:</span> <strong>${app.academic.offerType}</strong></div>
          </div>
        </div>

        <!-- Financial Review -->
        <div class="p-3 bg-surface-container-low rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-bold text-primary flex items-center gap-1">
              <span class="material-symbols-outlined text-[18px]">payments</span> 3. Financial Details
            </h3>
            <button onclick="router.navigate('/application/financial')" class="text-xs text-secondary font-bold hover:underline">[Edit]</button>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div><span class="text-outline block">Annual Income:</span> <strong class="text-secondary">₹${app.financial.annualIncome}</strong></div>
            <div><span class="text-outline block">Bank:</span> <strong>${app.financial.bankName}</strong></div>
            <div><span class="text-outline block">IFSC:</span> <strong>${app.financial.ifsc}</strong></div>
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
  app.id = "MOTA-NOS-2026-000124";
  app.status = "Under Document Scrutiny";
  app.submissionDate = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  app.history.push({
    title: "Application Submitted to Ministry",
    time: app.submissionDate,
    officer: "Portal Gateway",
    remark: "Direct electronic submission received under National Overseas Scholarship Scheme."
  });

  window.appStore.saveApplication(app);
  showToast("Application submitted successfully!", "success");
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
  const app = window.appStore.getApplication();
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

// Initialize routing on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  router.handleRouting();
});
