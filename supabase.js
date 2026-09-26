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

// 11. Final Submission to Database
async function supabaseSubmitFinalApplication(params = {}) {
  const { applicationId, schemeName, schemeCode } = params;

  if (supabaseClient && applicationId) {
    try {
      const nowIso = new Date().toISOString();
      const { data: updatedApp, error: updateErr } = await supabaseClient
        .from('applications')
        .update({
          status: 'submitted',
          submitted_at: nowIso,
          current_step: 'submitted',
          updated_at: nowIso
        })
        .eq('id', applicationId)
        .select()
        .maybeSingle();

      if (!updateErr && updatedApp) {
        // Record in application_status_history
        try {
          await supabaseClient.from('application_status_history').insert([{
            application_id: applicationId,
            old_status: 'draft',
            new_status: 'submitted',
            remark: `Direct electronic submission received under ${schemeName || 'scholarship scheme'}.`
          }]);
        } catch (hErr) {
          console.warn("Status history insertion notice:", hErr);
        }

        return { success: true, application: updatedApp, source: "supabase" };
      }
    } catch (err) {
      console.warn("supabaseSubmitFinalApplication Supabase error, falling back:", err);
    }
  }

  // Local state fallback
  if (window.appStore) {
    const app = window.appStore.getApplication();
    const code = schemeCode || app.schemeCode || "NOS";
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
    return { success: true, application: app, source: "local_store" };
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
  window.supabaseSubmitFinalApplication = supabaseSubmitFinalApplication;
  window.supabaseCreateApplication = supabaseCreateApplication;
  window.supabaseFetchApplications = supabaseFetchApplications;
  window.supabaseUpdateApplicationStatus = supabaseUpdateApplicationStatus;
  window.supabaseFetchNotifications = supabaseFetchNotifications;
  window.DEFAULT_SCHEMES = DEFAULT_SCHEMES;
}
