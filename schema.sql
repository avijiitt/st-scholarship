-- ==============================================================================
-- National Tribal Scholarship Portal (MoTA)
-- Supabase Core Schema Migration
-- Project: https://pnxgaiqdrpmqnahwopuq.supabase.co
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT '',
    mobile TEXT DEFAULT '',
    email TEXT DEFAULT '',
    state TEXT DEFAULT '',
    district TEXT DEFAULT '',
    role TEXT NOT NULL DEFAULT 'applicant' CHECK (role IN ('applicant', 'scrutiny_officer', 'admin', 'committee_member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = user_id OR auth.uid() IN (SELECT user_id FROM public.profiles WHERE role IN ('admin', 'scrutiny_officer', 'committee_member')));

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = user_id);

-- Trigger to auto-create profile on auth.users sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name, mobile, role)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'mobile', ''),
        COALESCE(new.raw_user_meta_data->>'role', 'applicant')
    )
    ON CONFLICT (user_id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. SCHEMES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    education_level TEXT,
    study_location TEXT,
    deadline TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'upcoming', 'archived')),
    required_documents JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;

-- Anyone can view schemes (public read)
DROP POLICY IF EXISTS "Anyone can view schemes" ON public.schemes;
CREATE POLICY "Anyone can view schemes" 
    ON public.schemes FOR SELECT 
    USING (true);

-- Only admins can modify schemes
DROP POLICY IF EXISTS "Admins can modify schemes" ON public.schemes;
CREATE POLICY "Admins can modify schemes" 
    ON public.schemes FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- ------------------------------------------------------------------------------
-- 3. APPLICATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number TEXT UNIQUE NOT NULL,
    applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    scheme_id UUID REFERENCES public.schemes(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft',
        'submitted',
        'under_scrutiny',
        'deficiency_raised',
        'resubmitted',
        'provisionally_eligible',
        'rejected',
        'selected'
    )),
    current_step INT NOT NULL DEFAULT 1,
    risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Applications Policies
DROP POLICY IF EXISTS "Applicants can view own applications" ON public.applications;
CREATE POLICY "Applicants can view own applications" 
    ON public.applications FOR SELECT 
    USING (
        applicant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'scrutiny_officer', 'committee_member'))
    );

DROP POLICY IF EXISTS "Applicants can insert own applications" ON public.applications;
CREATE POLICY "Applicants can insert own applications" 
    ON public.applications FOR INSERT 
    WITH CHECK (applicant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Applicants and officers can update applications" ON public.applications;
CREATE POLICY "Applicants and officers can update applications" 
    ON public.applications FOR UPDATE 
    USING (
        applicant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'scrutiny_officer', 'committee_member'))
    );

-- ------------------------------------------------------------------------------
-- 4. APPLICATION DOCUMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.application_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_path TEXT,
    file_name TEXT,
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'deficiency')),
    ocr_status TEXT NOT NULL DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed')),
    confidence_score NUMERIC(5, 2) DEFAULT 0.00,
    officer_remark TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;

-- Application Documents Policies
DROP POLICY IF EXISTS "View application documents" ON public.application_documents;
CREATE POLICY "View application documents" 
    ON public.application_documents FOR SELECT 
    USING (
        application_id IN (
            SELECT id FROM public.applications 
            WHERE applicant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
        OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'scrutiny_officer', 'committee_member'))
    );

DROP POLICY IF EXISTS "Manage application documents" ON public.application_documents;
CREATE POLICY "Manage application documents" 
    ON public.application_documents FOR ALL 
    USING (
        application_id IN (
            SELECT id FROM public.applications 
            WHERE applicant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
        OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'scrutiny_officer'))
    );

-- ------------------------------------------------------------------------------
-- 5. APPLICATION STATUS HISTORY TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    remark TEXT,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View application status history" ON public.application_status_history;
CREATE POLICY "View application status history" 
    ON public.application_status_history FOR SELECT 
    USING (
        application_id IN (
            SELECT id FROM public.applications 
            WHERE applicant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
        OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'scrutiny_officer', 'committee_member'))
    );

DROP POLICY IF EXISTS "Insert application status history" ON public.application_status_history;
CREATE POLICY "Insert application status history" 
    ON public.application_status_history FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- ------------------------------------------------------------------------------
-- 6. DEFICIENCIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.deficiencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.application_documents(id) ON DELETE SET NULL,
    query_text TEXT NOT NULL,
    response_text TEXT,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'responded', 'resolved', 'closed')),
    raised_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.deficiencies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View deficiencies" ON public.deficiencies;
CREATE POLICY "View deficiencies" 
    ON public.deficiencies FOR SELECT 
    USING (
        application_id IN (
            SELECT id FROM public.applications 
            WHERE applicant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
        OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'scrutiny_officer', 'committee_member'))
    );

DROP POLICY IF EXISTS "Modify deficiencies" ON public.deficiencies;
CREATE POLICY "Modify deficiencies" 
    ON public.deficiencies FOR ALL 
    USING (
        application_id IN (
            SELECT id FROM public.applications 
            WHERE applicant_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
        )
        OR EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role IN ('admin', 'scrutiny_officer'))
    );

-- ------------------------------------------------------------------------------
-- 7. NOTIFICATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'deficiency')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" 
    ON public.notifications FOR SELECT 
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" 
    ON public.notifications FOR UPDATE 
    USING (user_id = auth.uid());

-- ------------------------------------------------------------------------------
-- 8. PRE-SEEDED CORE SCHEMES
-- ------------------------------------------------------------------------------
INSERT INTO public.schemes (name, code, description, education_level, study_location, deadline, status, required_documents)
VALUES 
(
    'National Overseas Scholarship (NOS) for ST Candidates',
    'SCH-MOTA-NOS',
    '100% financial assistance covering full tuition fees, living expenses, and airfare for Scheduled Tribe students pursuing Master''s or Ph.D. abroad at QS Top 500 Global Universities.',
    'Master''s / Ph.D.',
    'Abroad (QS Top 500 Universities)',
    '2026-11-30 23:59:59+00',
    'active',
    '["Aadhaar Card", "ST Caste Certificate", "Income Certificate (<= 6 Lakhs)", "Unconditional Offer Letter from QS Top 500 University", "GRE / IELTS / TOEFL Scorecard", "NPCI Seeded Bank Passbook"]'::jsonb
),
(
    'National Fellowship for ST Students (NFST)',
    'SCH-MOTA-NFST',
    'Monthly research stipend up to ₹38,000/month + contingency grant for regular full-time M.Phil and Ph.D. scholars in recognized Indian Universities, IITs, and NITs.',
    'M.Phil / Ph.D. Regular Research',
    'Indian Universities / IITs / NITs',
    '2026-12-15 23:59:59+00',
    'active',
    '["Aadhaar Card", "ST Caste Certificate", "Annual Family Income Certificate", "UGC-NET / JRF Award Letter", "Ph.D. Registration / Admission Letter", "Research Synopsis & Guide Endorsement", "NPCI Seeded Bank Passbook"]'::jsonb
)
ON CONFLICT (code) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 9. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON public.applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_scheme ON public.applications(scheme_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_documents_application ON public.application_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_history_application ON public.application_status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_deficiencies_application ON public.deficiencies(application_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
