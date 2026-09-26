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

// 1. Fetch Active Schemes
async function supabaseFetchSchemes() {
  if (!supabaseClient) return [];
  try {
    const { data, error } = await supabaseClient
      .from('schemes')
      .select('*')
      .eq('status', 'active');
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn("supabaseFetchSchemes error:", err);
    return [];
  }
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
  window.supabaseCreateApplication = supabaseCreateApplication;
  window.supabaseFetchApplications = supabaseFetchApplications;
  window.supabaseUpdateApplicationStatus = supabaseUpdateApplicationStatus;
  window.supabaseFetchNotifications = supabaseFetchNotifications;
}
