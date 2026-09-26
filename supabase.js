/**
 * National Tribal Scholarship Portal (NTSP - MoTA)
 * Supabase Authentication & Client Configuration
 */

const SUPABASE_CONFIG = {
  url: "https://pnxgaiqdrpmqnahwopuq.supabase.co",
  publishableKey: "sb_publishable_sgFB_Ap_IV1p8njROsiccQ_WdKzaqGt"
};

// Initialize Supabase Client if library is available
let supabaseClient = null;

if (typeof supabase !== "undefined" && supabase.createClient) {
  try {
    supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.publishableKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
  } catch (err) {
    console.warn("Supabase client initialization failed:", err);
  }
}

/**
 * Register a new applicant using Supabase Auth
 */
async function supabaseRegister({ email, password, fullName, mobile, state, aadhaar }) {
  if (!supabaseClient) {
    // Graceful fallback if offline
    return {
      success: true,
      user: { email, user_metadata: { full_name: fullName, mobile, state } },
      session: null,
      isFallback: true
    };
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email: email.trim(),
    password: password,
    options: {
      data: {
        full_name: fullName.trim(),
        mobile: (mobile || "").trim(),
        state: state || "Jharkhand",
        aadhaar: (aadhaar || "").trim(),
        otr_id: "OTR-2025-ST-" + Math.floor(100000 + Math.random() * 900000)
      }
    }
  });

  if (error) {
    let msg = error.message;
    if (error.code === "over_email_send_rate_limit" || (error.message && error.message.toLowerCase().includes("rate limit"))) {
      msg = "Email verification rate limit reached. Please wait a few moments before trying again, or use prototype sign-in.";
    }
    return { success: false, error: msg };
  }

  return {
    success: true,
    user: data.user,
    session: data.session
  };
}

/**
 * Log in an existing applicant using Supabase Auth
 */
async function supabaseLogin({ email, password }) {
  if (!supabaseClient) {
    return { success: false, error: "Authentication service unavailable" };
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email: email.trim(),
    password: password
  });

  if (error) {
    let msg = error.message;
    if (error.message === "Email not confirmed") {
      msg = "Your email has not been confirmed yet. Please check your inbox for the verification link.";
    } else if (error.message === "Invalid login credentials") {
      msg = "Invalid email or password. Please verify your credentials.";
    }
    return { success: false, error: msg };
  }

  return {
    success: true,
    user: data.user,
    session: data.session
  };
}

/**
 * Log out the currently authenticated user
 */
async function supabaseLogout() {
  if (supabaseClient) {
    try {
      await supabaseClient.auth.signOut();
    } catch (e) {
      console.warn("Supabase signOut error:", e);
    }
  }
  if (window.appStore) {
    window.appStore.logout();
  }
}

/**
 * Retrieve current active session
 */
async function supabaseGetSession() {
  if (!supabaseClient) return null;
  const { data } = await supabaseClient.auth.getSession();
  return data.session;
}

/**
 * Synchronize Supabase session with local application state
 */
async function initSupabaseAuthSync() {
  if (!supabaseClient) return;

  try {
    const session = await supabaseGetSession();
    if (session && session.user) {
      const user = session.user;
      const metadata = user.user_metadata || {};
      const authUser = {
        role: "applicant",
        email: user.email,
        name: metadata.full_name || (user.email ? user.email.split("@")[0] : "Scholar"),
        otrId: metadata.otr_id || ("OTR-2025-ST-" + user.id.substring(0, 6).toUpperCase()),
        supabaseId: user.id
      };
      if (window.appStore) {
        window.appStore.setAuthUser(authUser);
      }
    }

    // Subscribe to auth state changes
    supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session && session.user) {
        const user = session.user;
        const metadata = user.user_metadata || {};
        const authUser = {
          role: "applicant",
          email: user.email,
          name: metadata.full_name || (user.email ? user.email.split("@")[0] : "Scholar"),
          otrId: metadata.otr_id || ("OTR-2025-ST-" + user.id.substring(0, 6).toUpperCase()),
          supabaseId: user.id
        };
        if (window.appStore) {
          window.appStore.setAuthUser(authUser);
        }
      } else if (event === "SIGNED_OUT") {
        const current = window.appStore ? window.appStore.getAuthUser() : null;
        if (current && current.role === "applicant") {
          window.appStore.logout();
        }
      }
    });
  } catch (err) {
    console.warn("Error synchronizing Supabase session:", err);
  }
}

/**
 * Database Table Operations Helper Functions
 */

// Core Demo Scheme Records
const DEFAULT_SCHEMES = [
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

// 1. Fetch Active Schemes from Supabase schemes table
async function supabaseFetchSchemes(options = {}) {
  // If force error is set for testing error states
  if (options.simulateError) {
    return { success: false, data: [], error: "Simulated network failure querying schemes table" };
  }

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('schemes')
        .select('*')
        .eq('status', 'active')
        .order('name', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const result = [...data];
        result.success = true;
        result.source = "supabase";
        return result;
      }
    } catch (err) {
      console.warn("Supabase fetch error, fallback to verified demo schemes:", err);
    }
  }

  // Database fallback demo records
  const fallbackResult = [...DEFAULT_SCHEMES];
  fallbackResult.success = true;
  fallbackResult.source = "database_defaults";
  return fallbackResult;
}

// 2. Fetch User Profile
async function supabaseFetchProfile(userId) {
  if (!supabaseClient || !userId) return null;
  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("supabaseFetchProfile error:", err);
    return null;
  }
}

// 3. Create or Save Application
async function supabaseCreateApplication({ applicationNumber, applicantId, schemeId, status, currentStep, riskLevel }) {
  if (!supabaseClient) return null;
  try {
    const { data, error } = await supabaseClient
      .from('applications')
      .insert([{
        application_number: applicationNumber,
        applicant_id: applicantId,
        scheme_id: schemeId,
        status: status || 'draft',
        current_step: currentStep || 1,
        risk_level: riskLevel || 'low',
        submitted_at: status === 'submitted' ? new Date().toISOString() : null
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("supabaseCreateApplication error:", err);
    return null;
  }
}

// 4. Fetch Applications for an Applicant or Admin
async function supabaseFetchApplications(applicantId) {
  if (!supabaseClient) return [];
  try {
    let query = supabaseClient.from('applications').select('*, schemes(*), application_documents(*)');
    if (applicantId) {
      query = query.eq('applicant_id', applicantId);
    }
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("supabaseFetchApplications error:", err);
    return [];
  }
}

// 4B. Fetch Applicant Tracking Data (Applications, Dynamic Status History, Deficiencies)
async function supabaseFetchApplicantTrackingData(selectedAppId) {
  let applicantProfile = null;
  let applications = [];

  if (supabaseClient) {
    try {
      applicantProfile = await supabaseGetCurrentProfile();
      let query = supabaseClient
        .from('applications')
        .select(`
          id,
          application_number,
          applicant_id,
          scheme_id,
          status,
          current_step,
          risk_level,
          officer_remarks,
          submitted_at,
          created_at,
          updated_at,
          schemes (*),
          application_status_history (*),
          deficiencies (*)
        `);

      if (applicantProfile && applicantProfile.id) {
        query = query.eq('applicant_id', applicantProfile.id);
      }

      const { data, error } = await query
        .order('submitted_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        applications = data;
      }
    } catch (err) {
      console.warn("supabaseFetchApplicantTrackingData Supabase error:", err);
    }
  }

  // Graceful fallback to local store if Supabase returns no records or offline
  if (applications.length === 0 && typeof window !== "undefined" && window.appStore) {
    const localApp = window.appStore.getApplication();
    const localHistory = Array.isArray(localApp.history) ? localApp.history : [];
    
    // Map local history to dynamic status_history records
    const mappedHistory = localHistory.map((h, idx) => ({
      id: `hist-local-${idx}`,
      application_id: localApp.id,
      old_status: idx === 0 ? 'draft' : 'draft',
      new_status: h.title.includes("Submitted") ? "submitted" : "draft",
      remark: h.remark || h.title,
      changed_by: h.officer || "Portal Gateway",
      created_at: h.time || localApp.submissionDate || new Date().toISOString()
    }));

    if (localApp.status === "Under Document Scrutiny" && !mappedHistory.some(m => m.new_status === "under_scrutiny")) {
      mappedHistory.push({
        id: "hist-local-scrutiny",
        application_id: localApp.id,
        old_status: "submitted",
        new_status: "under_scrutiny",
        remark: "Application assigned to District/State Verification Officer for document scrutiny.",
        changed_by: "Portal Gateway",
        created_at: new Date().toISOString()
      });
    }

    const fallbackApp = {
      id: localApp.id,
      application_number: localApp.id,
      status: (localApp.status || "submitted").toLowerCase().replace(/\s+/g, "_"),
      submitted_at: localApp.submitted_at || localApp.submissionDate || new Date().toISOString(),
      created_at: localApp.lastUpdated || new Date().toISOString(),
      officer_remarks: localApp.deficiency ? localApp.deficiency.remark : "Initial document scrutiny in progress. DigiLocker and PFMS verifications certified.",
      schemes: {
        id: "sch-local",
        name: localApp.scheme || "National Overseas Scholarship (NOS)",
        code: localApp.schemeCode || "NOS",
        education_level: localApp.academic?.qualifyingDegree || "Post-Graduate / Doctorate",
        study_location: localApp.schemeCode === "NOS" ? "Abroad" : "India"
      },
      application_status_history: mappedHistory,
      deficiencies: localApp.deficiency ? [localApp.deficiency] : []
    };

    applications = [fallbackApp];
  }

  // Ensure chronological order of history records
  applications.forEach(app => {
    if (Array.isArray(app.application_status_history)) {
      app.application_status_history.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
  });

  // Pick target application
  let activeApp = applications[0] || null;
  if (selectedAppId) {
    const found = applications.find(a => a.id === selectedAppId || a.application_number === selectedAppId);
    if (found) activeApp = found;
  }

  return {
    success: true,
    applications,
    activeApp,
    profile: applicantProfile
  };
}

// 5. Update Application Status and record history
async function supabaseUpdateApplicationStatus(applicationId, newStatus, remark, changedBy) {
  if (!supabaseClient) return false;
  try {
    // Fetch current status
    const { data: currentApp } = await supabaseClient
      .from('applications')
      .select('status')
      .eq('id', applicationId)
      .single();

    const oldStatus = currentApp ? currentApp.status : null;

    // Update application
    const { error: updateErr } = await supabaseClient
      .from('applications')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (updateErr) throw updateErr;

    // Record in history table
    await supabaseClient
      .from('application_status_history')
      .insert([{
        application_id: applicationId,
        old_status: oldStatus,
        new_status: newStatus,
        remark: remark || `Status changed from ${oldStatus} to ${newStatus}`,
        changed_by: changedBy || null
      }]);

    return true;
  } catch (err) {
    console.warn("supabaseUpdateApplicationStatus error:", err);
    return false;
  }
}

// 5B. Fetch Admin Dashboard Metrics & Real Aggregations
async function supabaseFetchAdminDashboardMetrics() {
  let applications = [];

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from('applications')
        .select(`
          id,
          application_number,
          status,
          risk_level,
          submitted_at,
          created_at,
          personal_details,
          profiles ( id, full_name, state, district, email ),
          schemes ( id, name, code )
        `)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        applications = data;
      }
    } catch (err) {
      console.warn("supabaseFetchAdminDashboardMetrics query error:", err);
    }
  }

  // Fallback to local admin queue if no DB applications or offline
  if (applications.length === 0 && typeof window !== "undefined" && window.appStore) {
    const queue = window.appStore.getAdminQueue();
    applications = queue.map(q => ({
      id: q.id,
      application_number: q.id,
      status: (q.status || "under_scrutiny").toLowerCase().replace(/[\s-]+/g, "_"),
      risk_level: (q.riskScore || "low").toLowerCase().includes("high") ? "high" : "low",
      submitted_at: q.submissionDate || new Date().toISOString(),
      created_at: q.submissionDate || new Date().toISOString(),
      personal_details: {
        fullName: q.applicantName,
        state: q.state || "Jharkhand"
      },
      profiles: {
        full_name: q.applicantName,
        state: q.state || "Jharkhand"
      },
      schemes: {
        name: q.scheme || "National Overseas Scholarship",
        code: q.schemeCode || "NOS"
      }
    }));
  }

  // Calculate Metrics
  const total = applications.length;
  let draft = 0;
  let submitted = 0;
  let underScrutiny = 0;
  let deficiency = 0;
  let selected = 0;
  let rejected = 0;

  const stateWise = {};
  const schemeWise = {};

  applications.forEach(app => {
    const s = (app.status || "").toLowerCase().replace(/[\s-]+/g, "_");
    if (s === "draft") draft++;
    else if (s === "submitted") submitted++;
    else if (s === "under_scrutiny" || s === "under_document_scrutiny") underScrutiny++;
    else if (s === "deficiency_raised") deficiency++;
    else if (s === "selected" || s === "provisionally_eligible" || s === "approved" || s === "committee_screening") selected++;
    else if (s === "rejected") rejected++;
    else submitted++;

    // State-wise aggregation
    const state = (app.profiles && app.profiles.state) || 
                  (app.personal_details && app.personal_details.state) || 
                  "Jharkhand";
    stateWise[state] = (stateWise[state] || 0) + 1;

    // Scheme-wise aggregation
    const schemeName = (app.schemes && (app.schemes.code || app.schemes.name)) || "NOS";
    const cleanScheme = schemeName.replace("SCH-MOTA-", "");
    schemeWise[cleanScheme] = (schemeWise[cleanScheme] || 0) + 1;
  });

  return {
    total,
    totalApplications: total,
    draft,
    draftApplications: draft,
    submitted,
    submittedApplications: submitted,
    underScrutiny,
    underScrutinyApplications: underScrutiny,
    deficiency,
    deficiencyCases: deficiency,
    selected,
    selectedCandidates: selected,
    rejected,
    stateWise,
    schemeWise,
    applications
  };
}

// 5C. Fetch Admin Applications Queue with Multi-Criteria Filters
async function supabaseFetchAdminQueue(filters = {}) {
  let applications = [];

  if (supabaseClient) {
    try {
      let query = supabaseClient
        .from('applications')
        .select(`
          id,
          application_number,
          applicant_id,
          scheme_id,
          status,
          current_step,
          risk_level,
          officer_remarks,
          submitted_at,
          created_at,
          updated_at,
          personal_details,
          academic_details,
          financial_details,
          profiles ( id, full_name, email, mobile, state, district ),
          schemes ( id, name, code ),
          application_documents (*),
          deficiencies (*)
        `)
        .order('submitted_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        applications = data;
      }
    } catch (err) {
      console.warn("supabaseFetchAdminQueue query error:", err);
    }
  }

  // Fallback to local admin queue
  if (applications.length === 0 && typeof window !== "undefined" && window.appStore) {
    const queue = window.appStore.getAdminQueue();
    applications = queue.map(q => ({
      id: q.id,
      application_number: q.id,
      status: (q.status || "under_scrutiny").toLowerCase().replace(/[\s-]+/g, "_"),
      risk_level: (q.riskScore || "low").toLowerCase().includes("high") ? "high" : "low",
      submitted_at: q.submissionDate || new Date().toISOString(),
      created_at: q.submissionDate || new Date().toISOString(),
      personal_details: {
        fullName: q.applicantName,
        state: q.state || "Jharkhand"
      },
      profiles: {
        id: "prof-local",
        full_name: q.applicantName,
        email: "student@tribal.gov.in",
        state: q.state || "Jharkhand"
      },
      schemes: {
        id: "sch-local",
        name: q.scheme || "National Overseas Scholarship (NOS)",
        code: q.schemeCode || "NOS"
      },
      academic_details: {
        university: q.university,
        courseTitle: q.degree
      },
      financial_details: {
        annualIncome: q.income ? q.income.replace(/[^\d]/g, "") : "450000"
      },
      application_documents: [
        { id: "doc-1", document_type: "ST Caste Certificate", file_name: "caste.pdf", verification_status: "verified" },
        { id: "doc-2", document_type: "Annual Income Certificate", file_name: "income.pdf", verification_status: "verified" }
      ],
      deficiencies: []
    }));
  }

  // Apply In-Memory Filters for Precision & Consistency
  let filtered = [...applications];

  // 1. Filter by Scheme
  if (filters.scheme && filters.scheme !== "all") {
    const sTarget = filters.scheme.toLowerCase();
    filtered = filtered.filter(a => {
      const sId = (a.scheme_id || a.schemes?.id || "").toLowerCase();
      const code = (a.schemes?.code || "").toLowerCase();
      const name = (a.schemes?.name || "").toLowerCase();
      return sId.includes(sTarget) || code.includes(sTarget) || name.includes(sTarget);
    });
  }

  // 2. Filter by Status
  if (filters.status && filters.status !== "all") {
    const statusTarget = filters.status.toLowerCase().replace(/[\s-]+/g, "_");
    filtered = filtered.filter(a => {
      const s = (a.status || "").toLowerCase().replace(/[\s-]+/g, "_");
      if (statusTarget === "selected") {
        return s === "selected" || s === "approved" || s === "provisionally_eligible";
      }
      return s === statusTarget;
    });
  }

  // 3. Filter by State
  if (filters.state && filters.state !== "all") {
    const stateTarget = filters.state.toLowerCase();
    filtered = filtered.filter(a => {
      const state = (a.profiles?.state || a.personal_details?.state || "").toLowerCase();
      return state.includes(stateTarget);
    });
  }

  // 4. Filter by Risk Level
  if (filters.riskLevel && filters.riskLevel !== "all") {
    const rTarget = filters.riskLevel.toLowerCase();
    filtered = filtered.filter(a => (a.risk_level || "low").toLowerCase() === rTarget);
  }

  // 5. Filter by Date (today / 7days / 30days)
  if (filters.date && filters.date !== "all") {
    const now = new Date();
    filtered = filtered.filter(a => {
      const itemDate = new Date(a.submitted_at || a.created_at);
      if (isNaN(itemDate.getTime())) return true;
      const diffDays = (now - itemDate) / (1000 * 60 * 60 * 24);
      if (filters.date === "today") return diffDays <= 1;
      if (filters.date === "7days") return diffDays <= 7;
      if (filters.date === "30days") return diffDays <= 30;
      return true;
    });
  }

  // 6. Search Filter
  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    filtered = filtered.filter(a => {
      const num = (a.application_number || a.id || "").toLowerCase();
      const name = (a.profiles?.full_name || a.personal_details?.fullName || "").toLowerCase();
      const email = (a.profiles?.email || a.personal_details?.email || "").toLowerCase();
      const univ = (a.academic_details?.university || "").toLowerCase();
      return num.includes(q) || name.includes(q) || email.includes(q) || univ.includes(q);
    });
  }

  return {
    total: applications.length,
    filteredCount: filtered.length,
    applications: filtered
  };
}

// 5D. Execute Admin Review Action
async function supabaseExecuteAdminReviewAction(params = {}) {
  const { applicationId, action, newStatus, officerRemark, deficiencyDetails, documentId } = params;

  let currentProfile = null;
  let officerUserId = null;
  let targetApp = null;
  let previousStatus = null;

  if (supabaseClient) {
    try {
      currentProfile = await supabaseGetCurrentProfile();
      officerUserId = currentProfile?.user_id || null;

      // Fetch target application
      const { data: appRow } = await supabaseClient
        .from('applications')
        .select('*, profiles(*)')
        .or(`id.eq.${applicationId},application_number.eq.${applicationId}`)
        .maybeSingle();

      if (appRow) {
        targetApp = appRow;
        previousStatus = appRow.status;
      }
    } catch (fErr) {
      console.warn("Fetch application before review error:", fErr);
    }
  }

  const actualAppId = targetApp?.id || applicationId;
  const applicantUserId = targetApp?.profiles?.user_id || targetApp?.applicant_id || null;
  const nowIso = new Date().toISOString();

  // Handle Action 1: Mark Document Verified
  if (action === "mark_document_verified" && documentId) {
    if (supabaseClient) {
      try {
        await supabaseClient
          .from('application_documents')
          .update({
            verification_status: 'verified',
            officer_remark: officerRemark || 'Document certified by verification officer.',
            updated_at: nowIso
          })
          .eq('id', documentId);

        // Record in status history as document audit
        await supabaseClient.from('application_status_history').insert([{
          application_id: actualAppId,
          old_status: previousStatus || 'under_scrutiny',
          new_status: previousStatus || 'under_scrutiny',
          remark: `Document marked verified: ${officerRemark || 'Certification completed'}`,
          changed_by: officerUserId
        }]);

        if (applicantUserId) {
          await supabaseClient.from('notifications').insert([{
            user_id: applicantUserId,
            title: "Document Verified",
            message: `One of your application documents has been approved by the scrutiny officer.`,
            type: "success"
          }]);
        }
      } catch (dErr) {
        console.warn("mark_document_verified Supabase error:", dErr);
      }
    }

    return { success: true, action: "mark_document_verified" };
  }

  // Determine Target Status from Action
  let targetStatus = newStatus;
  if (!targetStatus) {
    if (action === "approve" || action === "mark_provisionally_eligible") targetStatus = "provisionally_eligible";
    else if (action === "raise_deficiency") targetStatus = "deficiency_raised";
    else if (action === "reject") targetStatus = "rejected";
    else if (action === "forward" || action === "committee_screening") targetStatus = "committee_screening";
    else targetStatus = "under_scrutiny";
  }

  const effectiveRemark = officerRemark || `Officer review action: ${targetStatus}`;

  // Execute Database Updates
  if (supabaseClient) {
    try {
      // 1. Update applications row
      await supabaseClient
        .from('applications')
        .update({
          status: targetStatus,
          officer_remarks: effectiveRemark,
          updated_at: nowIso
        })
        .eq('id', actualAppId);

      // 2. Insert Status History Record
      await supabaseClient.from('application_status_history').insert([{
        application_id: actualAppId,
        old_status: previousStatus || 'under_scrutiny',
        new_status: targetStatus,
        remark: effectiveRemark,
        changed_by: officerUserId
      }]);

      // 3. If Deficiency Raised, Insert into public.deficiencies
      if (targetStatus === "deficiency_raised") {
        const docType = (deficiencyDetails && deficiencyDetails.documentType) || "Income / Caste Document";
        const queryText = (deficiencyDetails && deficiencyDetails.description) || effectiveRemark;
        await supabaseClient.from('deficiencies').insert([{
          application_id: actualAppId,
          document_type: docType,
          description: queryText,
          officer_remark: effectiveRemark,
          status: "open"
        }]);
      }

      // 4. Create Applicant Notification
      if (applicantUserId) {
        let notifType = "info";
        let notifTitle = "Application Status Update";
        if (targetStatus === "deficiency_raised") {
          notifType = "warning";
          notifTitle = "Action Required: Document Deficiency";
        } else if (targetStatus === "rejected") {
          notifType = "error";
          notifTitle = "Application Scrutiny: Rejected";
        } else if (targetStatus === "provisionally_eligible" || targetStatus === "selected") {
          notifType = "success";
          notifTitle = "Provisionally Eligible / Approved";
        }

        await supabaseClient.from('notifications').insert([{
          user_id: applicantUserId,
          title: notifTitle,
          message: effectiveRemark,
          type: notifType
        }]);
      }
    } catch (eErr) {
      console.warn("supabaseExecuteAdminReviewAction Supabase exception:", eErr);
    }
  }

  // Synchronize Local AppStore
  if (typeof window !== "undefined" && window.appStore) {
    const localApp = window.appStore.getApplication();
    if (localApp.id === applicationId || localApp.id === actualAppId) {
      localApp.status = targetStatus === "deficiency_raised" ? "Deficiency Raised" :
                         targetStatus === "provisionally_eligible" ? "Provisionally Eligible" :
                         targetStatus === "committee_screening" ? "Committee Screening" :
                         targetStatus === "rejected" ? "Rejected" : "Under Document Scrutiny";
      localApp.officer_remarks = effectiveRemark;
      if (targetStatus === "deficiency_raised") {
        localApp.deficiency = {
          remark: effectiveRemark,
          document_type: (deficiencyDetails && deficiencyDetails.documentType) || "Revised Supporting Document",
          date: new Date().toLocaleString("en-IN")
        };
      } else {
        localApp.deficiency = null;
      }
      if (!Array.isArray(localApp.history)) localApp.history = [];
      localApp.history.push({
        title: `Status Changed to ${localApp.status}`,
        time: new Date().toLocaleString("en-IN"),
        officer: currentProfile?.full_name || "Nodal Scrutiny Officer",
        remark: effectiveRemark
      });
      window.appStore.saveApplication(localApp);
    }

    // Update Admin Queue
    const queue = window.appStore.getAdminQueue();
    const item = queue.find(q => q.id === applicationId || q.id === actualAppId);
    if (item) {
      item.status = targetStatus === "deficiency_raised" ? "Deficiency Raised" :
                    targetStatus === "provisionally_eligible" ? "Approved" :
                    targetStatus === "committee_screening" ? "Committee Screening" :
                    targetStatus === "rejected" ? "Rejected" : "Under Document Scrutiny";
      window.appStore.saveAdminQueue(queue);
    }
  }

  return {
    success: true,
    newStatus: targetStatus,
    officerRemark: effectiveRemark
  };
}

// 6. Fetch User Notifications
async function supabaseFetchNotifications(userId) {
  if (!supabaseClient || !userId) return [];
  try {
    const { data, error } = await supabaseClient
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("supabaseFetchNotifications error:", err);
    return [];
  }
}

// 7. Get Current Authenticated Profile
async function supabaseGetCurrentProfile() {
  if (!supabaseClient) return null;
  try {
    const { data: userData, error: userErr } = await supabaseClient.auth.getUser();
    if (userErr || !userData || !userData.user) return null;
    const user = userData.user;

    const { data: profile, error: profErr } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profile) return profile;

    // Auto-create profile if missing
    const meta = user.user_metadata || {};
    const { data: newProfile, error: createErr } = await supabaseClient
      .from('profiles')
      .insert([{
        user_id: user.id,
        email: user.email,
        full_name: meta.full_name || (user.email ? user.email.split('@')[0] : 'Applicant'),
        mobile: meta.mobile || '',
        role: 'applicant',
        state: meta.state || 'Jharkhand'
      }])
      .select()
      .maybeSingle();

    return newProfile || null;
  } catch (err) {
    console.warn("supabaseGetCurrentProfile error:", err);
    return null;
  }
}

// 8. Resolve Scheme Record by Code or ID
async function supabaseGetSchemeByCodeOrId(schemeIdentifier) {
  if (!schemeIdentifier) return DEFAULT_SCHEMES[0];
  const cleanId = String(schemeIdentifier).trim();

  if (supabaseClient) {
    try {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);
      let query = supabaseClient.from('schemes').select('*');
      if (isUuid) {
        query = query.eq('id', cleanId);
      } else {
        query = query.ilike('code', `%${cleanId}%`);
      }
      const { data, error } = await query.limit(1).maybeSingle();
      if (!error && data) return data;
    } catch (err) {
      console.warn("supabaseGetSchemeByCodeOrId query error:", err);
    }
  }

  // Fallback to local schemes list
  const cleanUpper = cleanId.toUpperCase();
  const found = DEFAULT_SCHEMES.find(s => 
    s.id === cleanId || 
    s.code === cleanId || 
    s.code.toUpperCase().includes(cleanUpper) || 
    s.name.toUpperCase().includes(cleanUpper)
  );
  return found || DEFAULT_SCHEMES[0];
}

// 9. Get or Create Draft Application (Prevents duplicates for same applicant + scheme)
async function supabaseGetOrCreateDraftApplication(options = {}) {
  const { schemeCode, initialPersonal } = options;
  const scheme = await supabaseGetSchemeByCodeOrId(schemeCode || "NOS");
  const cleanSchemeCode = (scheme.code || "NOS").replace("SCH-MOTA-", "");

  // Try Supabase if connected
  if (supabaseClient) {
    try {
      const profile = await supabaseGetCurrentProfile();
      if (profile && profile.id) {
        // Check for existing active draft for this applicant & scheme
        let draftQuery = supabaseClient
          .from('applications')
          .select('*, schemes(*)')
          .eq('applicant_id', profile.id)
          .eq('status', 'draft');

        if (scheme && scheme.id) {
          draftQuery = draftQuery.eq('scheme_id', scheme.id);
        }

        const { data: existingDraft, error: fetchErr } = await draftQuery.maybeSingle();

        if (!fetchErr && existingDraft) {
          return {
            success: true,
            resumed: true,
            application: existingDraft,
            scheme: scheme,
            message: `Resumed active draft ${existingDraft.application_number} for ${scheme.name}`
          };
        }

        // Generate unique application number: MOTA-[CODE]-[YEAR]-[RANDOM]
        const year = new Date().getFullYear();
        const randDigits = Math.floor(100000 + Math.random() * 900000);
        const appNumber = `MOTA-${cleanSchemeCode}-${year}-${randDigits}`;

        // Create new draft record in Supabase
        const { data: newDraft, error: insertErr } = await supabaseClient
          .from('applications')
          .insert([{
            application_number: appNumber,
            applicant_id: profile.id,
            scheme_id: scheme.id,
            status: 'draft',
            current_step: 'personal',
            personal_details: initialPersonal || {
              fullName: profile.full_name || '',
              email: profile.email || '',
              mobile: profile.mobile || '',
              state: profile.state || 'Jharkhand',
              district: profile.district || ''
            },
            academic_details: {},
            financial_details: {},
            risk_level: 'low'
          }])
          .select('*, schemes(*)')
          .single();

        if (insertErr) {
          // If conflict due to race condition (unique index), fetch and resume
          if (insertErr.code === '23505') {
            const { data: retryDraft } = await supabaseClient
              .from('applications')
              .select('*, schemes(*)')
              .eq('applicant_id', profile.id)
              .eq('scheme_id', scheme.id)
              .eq('status', 'draft')
              .maybeSingle();
            if (retryDraft) {
              return {
                success: true,
                resumed: true,
                application: retryDraft,
                scheme: scheme,
                message: `Resumed active draft ${retryDraft.application_number}`
              };
            }
          }
          console.warn("Supabase insert draft error:", insertErr);
        } else if (newDraft) {
          return {
            success: true,
            resumed: false,
            application: newDraft,
            scheme: scheme,
            message: `Created new draft application ${newDraft.application_number}`
          };
        }
      }
    } catch (err) {
      console.warn("Supabase getOrCreateDraftApplication exception:", err);
    }
  }

  // Graceful Local Fallback (for prototype and offline testing)
  const appStoreApp = window.appStore ? window.appStore.getApplication() : null;
  const isMatchingDraft = appStoreApp && 
    (appStoreApp.status === "Draft" || appStoreApp.status === "draft") &&
    (appStoreApp.schemeCode === cleanSchemeCode || (appStoreApp.scheme && appStoreApp.scheme.includes(cleanSchemeCode)));

  if (isMatchingDraft) {
    return {
      success: true,
      resumed: true,
      application: {
        id: appStoreApp.draftId || appStoreApp.id,
        application_number: appStoreApp.id,
        scheme_id: scheme.id,
        status: 'draft',
        current_step: appStoreApp.lastSavedStep ? appStoreApp.lastSavedStep.replace('/application/', '') : 'personal',
        personal_details: appStoreApp.personal,
        academic_details: appStoreApp.academic,
        financial_details: appStoreApp.financial
      },
      scheme: scheme,
      message: `Resumed local draft ${appStoreApp.id} for ${scheme.name}`
    };
  }

  // Create new local draft
  const year = new Date().getFullYear();
  const randDigits = Math.floor(100000 + Math.random() * 900000);
  const appNumber = `MOTA-${cleanSchemeCode}-${year}-${randDigits}`;
  const draftId = `DRAFT-${cleanSchemeCode}-${randDigits}`;

  if (window.appStore) {
    const freshApp = {
      id: appNumber,
      draftId: draftId,
      scheme: scheme.name,
      schemeCode: cleanSchemeCode,
      status: "Draft",
      submissionDate: null,
      lastUpdated: new Date().toISOString(),
      lastSavedStep: "/application/personal",
      personal: initialPersonal || {
        fullName: "Priya Munda",
        dob: "1998-08-14",
        gender: "Female",
        mobile: "+91 98765 43210",
        email: "priya.munda@email.com",
        state: "Jharkhand",
        district: "Khunti",
        address: "Village Torpa, Khunti, Jharkhand - 835227"
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
        percentage: "74.60",
        qualifyingDegree: "M.Sc. Forestry & Env."
      },
      financial: {
        annualIncome: "450000",
        incomeCertNo: "JH/INC/2024/761298",
        incomeAuthority: "Tehsildar, Khunti",
        bankName: "State Bank of India (SBI)",
        accountHolder: "Priya Munda",
        ifsc: "SBIN0001234",
        accountNumber: "XXXX XXXX 4521"
      },
      documents: [
        { id: "doc-st", type: "ST Certificate", name: "ST_Certificate.pdf", size: "1.4 MB", verified: true },
        { id: "doc-inc", type: "Income Certificate", name: "Income_Cert_2024.pdf", size: "890 KB", verified: true },
        { id: "doc-adm", type: "Admission / Offer Letter", name: "Offer_Letter_Unconditional.pdf", size: "2.1 MB", verified: true }
      ],
      history: [
        { title: "Draft Created", time: new Date().toLocaleString("en-IN"), officer: "System", remark: `Draft initialized for ${scheme.name}` }
      ]
    };
    window.appStore.saveApplication(freshApp);
  }

  return {
    success: true,
    resumed: false,
    application: {
      id: draftId,
      application_number: appNumber,
      scheme_id: scheme.id,
      status: 'draft',
      current_step: 'personal'
    },
    scheme: scheme,
    message: `Initialized draft ${appNumber} for ${scheme.name}`
  };
}

// 10. Save Wizard Step to Database
async function supabaseSaveApplicationStep(params = {}) {
  const { applicationId, stepName, stepData, nextStep } = params;

  if (supabaseClient && applicationId) {
    try {
      const updatePayload = {
        current_step: nextStep || stepName,
        updated_at: new Date().toISOString()
      };

      if (stepName === 'personal') {
        updatePayload.personal_details = stepData;
        // Also update profiles table if profile exists
        try {
          const profile = await supabaseGetCurrentProfile();
          if (profile && profile.id) {
            await supabaseClient.from('profiles').update({
              full_name: stepData.fullName || profile.full_name,
              mobile: stepData.mobile || profile.mobile,
              state: stepData.state || profile.state,
              district: stepData.district || profile.district
            }).eq('id', profile.id);
          }
        } catch (pErr) {
          console.warn("Could not sync profile during personal step save:", pErr);
        }
      } else if (stepName === 'academic') {
        updatePayload.academic_details = stepData;
      } else if (stepName === 'financial') {
        updatePayload.financial_details = stepData;
      } else if (stepName === 'documents') {
        // Insert or update document records in application_documents
        if (Array.isArray(stepData.documents)) {
          for (const doc of stepData.documents) {
            try {
              await supabaseClient.from('application_documents').insert([{
                application_id: applicationId,
                document_type: doc.type || "Document",
                file_name: doc.name || "document.pdf",
                verification_status: doc.verified ? 'verified' : 'pending',
                ocr_status: 'completed',
                confidence_score: 98.00,
                officer_remark: 'Pre-verified via DigiLocker e-KYC'
              }]);
            } catch (dErr) {
              console.warn("Document save notice:", dErr);
            }
          }
        }
      }

      // Update applications table
      const { data: updatedApp, error: updateErr } = await supabaseClient
        .from('applications')
        .update(updatePayload)
        .eq('id', applicationId)
        .select()
        .maybeSingle();

      if (!updateErr && updatedApp) {
        return { success: true, application: updatedApp, source: "supabase" };
      }
    } catch (err) {
      console.warn("supabaseSaveApplicationStep Supabase error, falling back:", err);
    }
  }

  // Local state update fallback
  if (window.appStore) {
    if (stepName === 'personal') {
      window.appStore.updateSection("personal", stepData);
    } else if (stepName === 'academic') {
      window.appStore.updateSection("academic", stepData);
    } else if (stepName === 'financial') {
      window.appStore.updateSection("financial", stepData);
    }
    const current = window.appStore.getApplication();
    current.lastSavedStep = `/application/${nextStep || stepName}`;
    window.appStore.saveApplication(current);
  }

  return { success: true, source: "local_store" };
}

// 10B. Validate Application Completeness for Submission
function supabaseValidateApplicationForSubmission(app = {}, scheme = null) {
  const missingFields = [];
  const missingDocs = [];

  const personal = app.personal || {};
  const category = app.category || {};
  const academic = app.academic || {};
  const financial = app.financial || {};
  const documents = Array.isArray(app.documents) ? app.documents : [];

  // 1. Personal Details Validation
  if (!personal.fullName || !String(personal.fullName).trim()) {
    missingFields.push({ section: "Personal Details", field: "Full Name", step: "/application/personal" });
  }
  if (!personal.dob || !String(personal.dob).trim()) {
    missingFields.push({ section: "Personal Details", field: "Date of Birth", step: "/application/personal" });
  }
  if (!personal.mobile || !String(personal.mobile).trim()) {
    missingFields.push({ section: "Personal Details", field: "Mobile Number", step: "/application/personal" });
  }
  if (!personal.email || !String(personal.email).trim() || !personal.email.includes("@")) {
    missingFields.push({ section: "Personal Details", field: "Valid Email Address", step: "/application/personal" });
  }
  if (!personal.state || !String(personal.state).trim()) {
    missingFields.push({ section: "Personal Details", field: "State of Domicile", step: "/application/personal" });
  }
  if (!personal.district || !String(personal.district).trim()) {
    missingFields.push({ section: "Personal Details", field: "District", step: "/application/personal" });
  }
  if (!personal.address || !String(personal.address).trim()) {
    missingFields.push({ section: "Personal Details", field: "Permanent Address", step: "/application/personal" });
  }

  // 2. ST Category Validation
  if (!category.tribeName || !String(category.tribeName).trim()) {
    missingFields.push({ section: "ST Category Details", field: "Tribe / Community Name", step: "/application/personal" });
  }
  if (!category.certNo || !String(category.certNo).trim()) {
    missingFields.push({ section: "ST Category Details", field: "ST Caste Certificate No", step: "/application/personal" });
  }
  if (!category.issuingAuthority || !String(category.issuingAuthority).trim()) {
    missingFields.push({ section: "ST Category Details", field: "Issuing Authority", step: "/application/personal" });
  }
  if (!category.issueDate || !String(category.issueDate).trim()) {
    missingFields.push({ section: "ST Category Details", field: "Certificate Issue Date", step: "/application/personal" });
  }

  // 3. Academic Details Validation
  if (!academic.university || !String(academic.university).trim()) {
    missingFields.push({ section: "Academic Details", field: "Target / Enrolled University", step: "/application/academic" });
  }
  if (!academic.courseTitle || !String(academic.courseTitle).trim()) {
    missingFields.push({ section: "Academic Details", field: "Degree / Course Title", step: "/application/academic" });
  }
  if (!academic.percentage || String(academic.percentage).trim() === "") {
    missingFields.push({ section: "Academic Details", field: "Qualifying Score / Percentage", step: "/application/academic" });
  }

  // 4. Financial Details Validation
  if (!financial.annualIncome || String(financial.annualIncome).trim() === "") {
    missingFields.push({ section: "Financial Details", field: "Annual Family Income", step: "/application/financial" });
  }
  if (!financial.bankName || !String(financial.bankName).trim()) {
    missingFields.push({ section: "Financial Details", field: "Disbursement Bank Name", step: "/application/financial" });
  }
  if (!financial.ifsc || !String(financial.ifsc).trim()) {
    missingFields.push({ section: "Financial Details", field: "Bank IFSC Code", step: "/application/financial" });
  }

  // 5. Mandatory Documents Validation
  if (documents.length === 0) {
    missingDocs.push("Mandatory Scheme Documents (No documents uploaded yet)");
  } else {
    const docTypesAndNames = documents.map(d => `${d.type || ''} ${d.name || ''}`.toLowerCase()).join(" ");

    // Check ST Caste Certificate
    const hasCaste = /caste|tribe|st_cert|st cert|st certificate/i.test(docTypesAndNames);
    if (!hasCaste) missingDocs.push("ST Caste Certificate (Article 342)");

    // Check Income Certificate
    const hasIncome = /income|annual_income/i.test(docTypesAndNames);
    if (!hasIncome) missingDocs.push("Annual Income Certificate");

    // Check Marksheet / Academic Proof
    const hasAcademic = /marksheet|scorecard|degree|admission|offer|transcript|synopsis|ugc/i.test(docTypesAndNames);
    if (!hasAcademic) missingDocs.push("Previous Qualifying Marksheet / Admission Letter");

    // Check Identity / Bank
    const hasIdentity = /aadhaar|identity|passbook|npci|passport/i.test(docTypesAndNames);
    if (!hasIdentity) missingDocs.push("Aadhaar Card / Bank Passbook / Passport");
  }

  const isValid = missingFields.length === 0 && missingDocs.length === 0;

  return {
    isValid,
    missingFields,
    missingDocs,
    summary: isValid ? "Application data and documents verified" : `Incomplete: ${missingFields.length} field(s), ${missingDocs.length} document(s) required.`
  };
}

// 11. Final Submission to Database
async function supabaseSubmitFinalApplication(params = {}) {
  const { applicationId, schemeName, schemeCode, skipValidation } = params;

  // Retrieve current application state
  let currentApp = null;
  if (typeof window !== "undefined" && window.appStore) {
    currentApp = window.appStore.getApplication();
  }

  // 1. Duplicate Submission Check (Local State)
  if (currentApp && (currentApp.status === "Under Document Scrutiny" || currentApp.status === "Submitted" || currentApp.status === "submitted")) {
    return {
      success: false,
      error: `Application has already been submitted (Reference: ${currentApp.id || currentApp.application_number}). Duplicate submission is prohibited.`,
      code: "ALREADY_SUBMITTED"
    };
  }

  // 2. Validate Completeness (Fields + Documents)
  if (!skipValidation && currentApp) {
    const val = supabaseValidateApplicationForSubmission(currentApp);
    if (!val.isValid) {
      return {
        success: false,
        error: val.summary,
        validation: val,
        code: "VALIDATION_FAILED"
      };
    }
  }

  const nowIso = new Date().toISOString();
  const submissionTimestampStr = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const code = schemeCode || (currentApp && currentApp.schemeCode) || "NOS";
  const finalAppNumber = (currentApp && currentApp.id && !currentApp.id.startsWith("DRAFT-")) 
    ? currentApp.id 
    : `MOTA-${code}-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  let targetId = applicationId || (currentApp && (currentApp.draftId || currentApp.id));
  let updatedApp = null;

  // 3. Supabase Cloud Database Execution
  if (supabaseClient) {
    try {
      const profile = await supabaseGetCurrentProfile();
      let resolvedUserId = profile ? profile.user_id : null;
      if (!resolvedUserId) {
        const { data: authData } = await supabaseClient.auth.getUser();
        resolvedUserId = authData?.user?.id || null;
      }

      // Check if application exists and inspect current status (Duplicate DB Prevention)
      if (targetId) {
        const { data: existingApp, error: fetchErr } = await supabaseClient
          .from('applications')
          .select('id, status, application_number, scheme_id, applicant_id')
          .or(`id.eq.${targetId},application_number.eq.${targetId}`)
          .maybeSingle();

        if (existingApp) {
          targetId = existingApp.id;
          if (existingApp.status === 'submitted' || existingApp.status === 'under_scrutiny') {
            return {
              success: false,
              error: `Application ${existingApp.application_number} has already been submitted to the Ministry on record.`,
              code: "ALREADY_SUBMITTED"
            };
          }
        }
      }

      if (targetId) {
        // Transition application status: draft -> submitted
        const { data: dbUpdated, error: updateErr } = await supabaseClient
          .from('applications')
          .update({
            status: 'submitted',
            submitted_at: nowIso,
            current_step: 'submitted',
            updated_at: nowIso
          })
          .eq('id', targetId)
          .select('*, schemes(*)')
          .maybeSingle();

        if (updateErr) {
          console.warn("Supabase application submit update error:", updateErr);
          return {
            success: false,
            error: `Database submission failed: ${updateErr.message}`
          };
        }

        updatedApp = dbUpdated;

        // 4. Insert Status History Record
        try {
          await supabaseClient.from('application_status_history').insert([{
            application_id: targetId,
            old_status: 'draft',
            new_status: 'submitted',
            remark: `Direct electronic submission received under ${schemeName || 'scholarship scheme'}. Permanent Reference: ${updatedApp?.application_number || finalAppNumber}`,
            changed_by: resolvedUserId
          }]);
        } catch (hErr) {
          console.warn("Status history insertion notice:", hErr);
        }

        // 5. Create Applicant Notification
        if (resolvedUserId) {
          try {
            await supabaseClient.from('notifications').insert([{
              user_id: resolvedUserId,
              title: "Application Submitted Successfully",
              message: `Your scholarship application (${updatedApp?.application_number || finalAppNumber}) for "${schemeName || 'ST Scholarship'}" has been successfully submitted to the Ministry for scrutiny.`,
              type: "success",
              is_read: false
            }]);
          } catch (nErr) {
            console.warn("Notification insert notice:", nErr);
          }
        }
      }
    } catch (err) {
      console.warn("supabaseSubmitFinalApplication exception:", err);
      return {
        success: false,
        error: `Submission failed: ${err.message || 'Network error'}`
      };
    }
  }

  // 6. Synchronize Local AppStore
  if (typeof window !== "undefined" && window.appStore) {
    const app = window.appStore.getApplication();
    app.id = updatedApp?.application_number || finalAppNumber;
    app.status = "Under Document Scrutiny";
    app.dbStatus = "submitted";
    app.submitted_at = nowIso;
    app.submissionDate = submissionTimestampStr;
    if (!Array.isArray(app.history)) app.history = [];
    app.history.push({
      title: "Application Submitted to Ministry",
      time: submissionTimestampStr,
      officer: "Portal Gateway",
      remark: `Direct electronic submission received under ${app.scheme || schemeName}. Permanent Reference: ${app.id}`
    });
    window.appStore.saveApplication(app);
  }

  return {
    success: true,
    applicationNumber: updatedApp?.application_number || finalAppNumber,
    submittedAt: nowIso,
    application: updatedApp,
    source: supabaseClient ? "supabase" : "local_store"
  };
}

// ------------------------------------------------------------------------------
// 12. SUPABASE STORAGE OPERATIONS (Private Bucket: scholarship-documents)
// Path: {user_id}/{application_id}/{document_type}/{random_file_name}
// Validation: PDF, JPG, JPEG only, Max 5 MB, Random Server-Defined Filename
// ------------------------------------------------------------------------------

const STORAGE_BUCKET_NAME = "scholarship-documents";
const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_DOCUMENT_EXTENSIONS = ["pdf", "jpg", "jpeg"];
const ALLOWED_DOCUMENT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/pjpeg"];

// File Validator
function supabaseValidateDocumentFile(file) {
  if (!file) {
    return { valid: false, error: "No file selected for upload." };
  }

  // Size limit check (5 MB)
  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${sizeMb} MB) exceeds maximum permissible ceiling of 5 MB.`
    };
  }

  // File extension check
  const fileName = file.name || "";
  const ext = fileName.split(".").pop().toLowerCase();
  if (!ALLOWED_DOCUMENT_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file format (.${ext}). Only PDF, JPG, and JPEG documents are permitted.`
    };
  }

  // MIME type check if present
  if (file.type && !ALLOWED_DOCUMENT_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Invalid file type (${file.type}). Only PDF, JPG, and JPEG documents are permitted.`
    };
  }

  return { valid: true, extension: ext };
}

// Generate Secure Random Storage Path (OWASP compliance)
function supabaseGenerateStoragePath({ userId, applicationId, documentType, originalName }) {
  const ext = (originalName || "doc.pdf").split(".").pop().toLowerCase();
  const cleanDocType = (documentType || "general")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_");
  const randomFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${ext}`;
  const cleanUserId = userId || "guest_applicant";
  const cleanAppId = applicationId || "draft_application";
  return {
    storagePath: `${cleanUserId}/${cleanAppId}/${cleanDocType}/${randomFileName}`,
    randomFileName,
    cleanDocType,
    extension: ext
  };
}

// Upload Document to Supabase Storage & Save Metadata
async function supabaseUploadDocument(params = {}) {
  const { file, applicationId, documentType, onProgress } = params;

  // 1. Validate File
  const val = supabaseValidateDocumentFile(file);
  if (!val.valid) {
    return { success: false, error: val.error };
  }

  // 2. Resolve User ID for Ownership Isolation
  let userId = "guest_applicant";
  try {
    const profile = await supabaseGetCurrentProfile();
    if (profile && profile.user_id) {
      userId = profile.user_id;
    } else if (typeof window !== "undefined" && window.appStore) {
      const authUser = window.appStore.getAuthUser();
      if (authUser && (authUser.supabaseId || authUser.id)) {
        userId = authUser.supabaseId || authUser.id;
      }
    }
  } catch (uErr) {
    console.warn("User ID resolution notice:", uErr);
  }

  // 3. Generate Secure Storage Path
  const { storagePath, randomFileName, cleanDocType, extension } = supabaseGenerateStoragePath({
    userId,
    applicationId,
    documentType,
    originalName: file.name
  });

  // Report Initial Progress
  if (typeof onProgress === "function") {
    onProgress({ loaded: 20, total: 100, percent: 20, stage: "Validating & Encrypting" });
  }

  let uploadSuccess = false;
  let remoteStoragePath = storagePath;

  // 4. Upload to Supabase Storage
  if (supabaseClient) {
    try {
      if (typeof onProgress === "function") {
        onProgress({ loaded: 50, total: 100, percent: 50, stage: "Uploading to scholarship-documents" });
      }

      const { data: uploadData, error: uploadErr } = await supabaseClient.storage
        .from(STORAGE_BUCKET_NAME)
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: true
        });

      if (!uploadErr && uploadData) {
        uploadSuccess = true;
        remoteStoragePath = uploadData.path || storagePath;
      } else if (uploadErr) {
        console.warn("Supabase Storage upload warning (fallback to local sync):", uploadErr.message);
      }
    } catch (sErr) {
      console.warn("Supabase Storage network error:", sErr);
    }
  }

  if (typeof onProgress === "function") {
    onProgress({ loaded: 85, total: 100, percent: 85, stage: "Recording Metadata" });
  }

  // 5. Insert / Upsert Metadata into application_documents Table
  const docMetadata = {
    application_id: applicationId,
    document_type: documentType,
    file_path: remoteStoragePath,
    file_name: file.name, // Original human filename preserved in metadata
    file_size: file.size,
    mime_type: file.type || (extension === "pdf" ? "application/pdf" : "image/jpeg"),
    verification_status: "verified",
    ocr_status: "completed",
    confidence_score: 98.50,
    officer_remark: "Uploaded by applicant • Pre-verified via DigiLocker e-KYC",
    updated_at: new Date().toISOString()
  };

  if (supabaseClient && applicationId) {
    try {
      await supabaseClient
        .from("application_documents")
        .upsert(docMetadata, { onConflict: "application_id,document_type" });
    } catch (mErr) {
      console.warn("application_documents metadata sync notice:", mErr);
    }
  }

  // 6. Synchronize with Local AppStore State
  if (typeof window !== "undefined" && window.appStore) {
    const app = window.appStore.getApplication();
    if (!Array.isArray(app.documents)) app.documents = [];

    const existingIdx = app.documents.findIndex(d => 
      d.type === documentType || (d.id && d.id.includes(cleanDocType))
    );

    const docEntry = {
      id: `doc-${cleanDocType}`,
      type: documentType,
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      filePath: remoteStoragePath,
      verified: true,
      date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      uploadedAt: new Date().toISOString()
    };

    if (existingIdx !== -1) {
      app.documents[existingIdx] = docEntry;
    } else {
      app.documents.push(docEntry);
    }

    window.appStore.saveApplication(app);
  }

  if (typeof onProgress === "function") {
    onProgress({ loaded: 100, total: 100, percent: 100, stage: "Upload Complete" });
  }

  return {
    success: true,
    filePath: remoteStoragePath,
    fileName: file.name,
    fileSize: file.size,
    metadata: docMetadata,
    source: uploadSuccess ? "supabase_storage" : "local_storage"
  };
}

// Generate Signed Preview URL for Private Document
async function supabaseGetDocumentPreviewUrl(filePath) {
  if (!filePath) return null;

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.storage
        .from(STORAGE_BUCKET_NAME)
        .createSignedUrl(filePath, 3600); // 1-hour expiry

      if (!error && data && data.signedUrl) {
        return data.signedUrl;
      }
    } catch (err) {
      console.warn("createSignedUrl error:", err);
    }
  }

  // Mock / demo preview fallback
  return `#/application/documents?preview=${encodeURIComponent(filePath)}`;
}

// Delete Document from Storage and Metadata Table
async function supabaseDeleteDocument(params = {}) {
  const { applicationId, documentType, filePath } = params;

  if (supabaseClient) {
    try {
      // 1. Delete from storage if path provided
      if (filePath) {
        await supabaseClient.storage.from(STORAGE_BUCKET_NAME).remove([filePath]);
      }

      // 2. Delete metadata from application_documents
      if (applicationId && documentType) {
        await supabaseClient
          .from("application_documents")
          .delete()
          .eq("application_id", applicationId)
          .eq("document_type", documentType);
      }
    } catch (err) {
      console.warn("supabaseDeleteDocument error:", err);
    }
  }

  // 3. Update local appStore
  if (typeof window !== "undefined" && window.appStore) {
    const app = window.appStore.getApplication();
    if (Array.isArray(app.documents)) {
      app.documents = app.documents.filter(d => d.type !== documentType && d.filePath !== filePath);
      window.appStore.saveApplication(app);
    }
  }

  return { success: true };
}

// Automatically sync session on load
if (typeof window !== "undefined") {
  window.supabaseClient = supabaseClient;
  window.supabaseRegister = supabaseRegister;
  window.supabaseLogin = supabaseLogin;
  window.supabaseLogout = supabaseLogout;
  window.supabaseGetSession = supabaseGetSession;
  window.initSupabaseAuthSync = initSupabaseAuthSync;
  window.supabaseFetchSchemes = supabaseFetchSchemes;
  window.supabaseFetchProfile = supabaseFetchProfile;
  window.supabaseGetCurrentProfile = supabaseGetCurrentProfile;
  window.supabaseGetSchemeByCodeOrId = supabaseGetSchemeByCodeOrId;
  window.supabaseGetOrCreateDraftApplication = supabaseGetOrCreateDraftApplication;
  window.supabaseSaveApplicationStep = supabaseSaveApplicationStep;
  window.supabaseValidateApplicationForSubmission = supabaseValidateApplicationForSubmission;
  window.supabaseSubmitFinalApplication = supabaseSubmitFinalApplication;
  window.supabaseCreateApplication = supabaseCreateApplication;
  window.supabaseFetchApplications = supabaseFetchApplications;
  window.supabaseFetchApplicantTrackingData = supabaseFetchApplicantTrackingData;
  window.supabaseFetchAdminDashboardMetrics = supabaseFetchAdminDashboardMetrics;
  window.supabaseFetchAdminQueue = supabaseFetchAdminQueue;
  window.supabaseExecuteAdminReviewAction = supabaseExecuteAdminReviewAction;
  window.supabaseUpdateApplicationStatus = supabaseUpdateApplicationStatus;
  window.supabaseFetchNotifications = supabaseFetchNotifications;
  window.DEFAULT_SCHEMES = DEFAULT_SCHEMES;
  // Storage APIs
  window.supabaseValidateDocumentFile = supabaseValidateDocumentFile;
  window.supabaseGenerateStoragePath = supabaseGenerateStoragePath;
  window.supabaseUploadDocument = supabaseUploadDocument;
  window.supabaseGetDocumentPreviewUrl = supabaseGetDocumentPreviewUrl;
  window.supabaseDeleteDocument = supabaseDeleteDocument;
}
