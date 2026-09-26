-- ==============================================================================
-- National Tribal Scholarship Portal (NTSP - MoTA)
-- Supabase Row Level Security (RLS) & Database Schema
-- Project: https://pnxgaiqdrpmqnahwopuq.supabase.co
-- ==============================================================================

-- Enable UUID extension
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

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- SECURITY DEFINER HELPER FUNCTIONS (Prevent Infinite Recursion in RLS)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_current_profile_id()
RETURNS UUID AS $$
    SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_scrutiny_officer()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role IN ('scrutiny_officer', 'admin', 'committee_member')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ------------------------------------------------------------------------------
-- RULE 1: APPLICANTS CAN READ AND UPDATE ONLY THEIR OWN PROFILE
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles: View policy" ON public.profiles;
CREATE POLICY "Profiles: View policy" 
    ON public.profiles FOR SELECT 
    USING (
        auth.uid() = user_id 
        OR public.is_admin() 
        OR public.is_scrutiny_officer()
    );

DROP POLICY IF EXISTS "Profiles: Insert policy" ON public.profiles;
CREATE POLICY "Profiles: Insert policy" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Profiles: Update policy" ON public.profiles;
CREATE POLICY "Profiles: Update policy" 
    ON public.profiles FOR UPDATE 
    USING (
        auth.uid() = user_id 
        OR public.is_admin()
    )
    WITH CHECK (
        -- Applicants cannot self-promote their role to admin or officer
        (auth.uid() = user_id AND role = public.get_current_role())
        OR public.is_admin()
    );

-- Auto-create profile trigger on auth signup
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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

ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Schemes: Public read access" ON public.schemes;
CREATE POLICY "Schemes: Public read access" 
    ON public.schemes FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Schemes: Admin write access" ON public.schemes;
CREATE POLICY "Schemes: Admin write access" 
    ON public.schemes FOR ALL 
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 3. APPLICATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number TEXT UNIQUE NOT NULL,
    applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    scheme_id UUID REFERENCES public.schemes(id) ON DELETE SET NULL,
    assigned_officer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
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
    current_step TEXT NOT NULL DEFAULT 'personal',
    personal_details JSONB DEFAULT '{}'::jsonb,
    academic_details JSONB DEFAULT '{}'::jsonb,
    financial_details JSONB DEFAULT '{}'::jsonb,
    risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enforce single active draft per applicant and scheme (prevent duplicate drafts)
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_draft_per_scheme 
ON public.applications (applicant_id, scheme_id) 
WHERE (status = 'draft');

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- RULE 2, 5 & 6: APPLICATION READ ACCESS
-- - Applicants: read only their own
-- - Admin: read all
-- - Scrutiny Officers: read applications assigned to them (or unassigned queue)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Applications: Read access policy" ON public.applications;
CREATE POLICY "Applications: Read access policy" 
    ON public.applications FOR SELECT 
    USING (
        -- Rule 2: Applicant can read only their own
        applicant_id = public.get_current_profile_id()
        -- Rule 5: Admin can read all
        OR public.is_admin()
        -- Rule 6: Officer can read assigned applications (or unassigned review queue)
        OR (
            public.is_scrutiny_officer() 
            AND (assigned_officer_id = public.get_current_profile_id() OR assigned_officer_id IS NULL)
        )
    );

-- ------------------------------------------------------------------------------
-- RULE 2: APPLICATION INSERT ACCESS
-- - Applicants create only their own applications
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Applications: Insert policy" ON public.applications;
CREATE POLICY "Applications: Insert policy" 
    ON public.applications FOR INSERT 
    WITH CHECK (
        applicant_id = public.get_current_profile_id()
        AND status IN ('draft', 'submitted')
    );

-- ------------------------------------------------------------------------------
-- RULE: APPLICANTS CANNOT DIRECTLY EDIT CORE DETAILS AFTER SUBMISSION
-- - Draft or Deficiency: Applicant can update details / submit
-- - Submitted / Under Scrutiny: Applicant cannot edit core details
-- - Admin: Can update all applications
-- - Officer: Can update applications assigned to them (status / risk level / remarks)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Applications: Update policy" ON public.applications;
CREATE POLICY "Applications: Update policy" 
    ON public.applications FOR UPDATE 
    USING (
        -- Applicant can only update while in draft or responding to deficiency
        (
            applicant_id = public.get_current_profile_id() 
            AND status IN ('draft', 'deficiency_raised')
        )
        -- Admin can update any
        OR public.is_admin()
        -- Officer can update assigned
        OR (
            public.is_scrutiny_officer() 
            AND (assigned_officer_id = public.get_current_profile_id() OR assigned_officer_id IS NULL)
        )
    )
    WITH CHECK (
        -- Applicant cannot re-assign applicant_id or self-approve
        (
            applicant_id = public.get_current_profile_id()
            AND status IN ('draft', 'submitted', 'resubmitted')
        )
        OR public.is_admin()
        OR public.is_scrutiny_officer()
    );

-- ------------------------------------------------------------------------------
-- RULE 4: APPLICANTS CANNOT DELETE SUBMITTED APPLICATIONS
-- - Applicants can only delete DRAFT applications
-- - Admin can delete for maintenance
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Applications: Delete policy" ON public.applications;
CREATE POLICY "Applications: Delete policy" 
    ON public.applications FOR DELETE 
    USING (
        (applicant_id = public.get_current_profile_id() AND status = 'draft')
        OR public.is_admin()
    );

-- ------------------------------------------------------------------------------
-- 4. APPLICATION DOCUMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.application_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    mime_type TEXT DEFAULT 'application/pdf',
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'deficiency')),
    ocr_status TEXT NOT NULL DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed')),
    confidence_score NUMERIC(5, 2) DEFAULT 0.00,
    officer_remark TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_application_doc_type UNIQUE (application_id, document_type)
);

ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- RULE 3: APPLICANTS CAN READ AND MANAGE DOCUMENTS BELONGING TO THEIR OWN APPLICATIONS
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Documents: Read policy" ON public.application_documents;
CREATE POLICY "Documents: Read policy" 
    ON public.application_documents FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.applications a
            WHERE a.id = application_documents.application_id
            AND (
                a.applicant_id = public.get_current_profile_id()
                OR public.is_admin()
                OR (public.is_scrutiny_officer() AND (a.assigned_officer_id = public.get_current_profile_id() OR a.assigned_officer_id IS NULL))
            )
        )
    );

DROP POLICY IF EXISTS "Documents: Insert policy" ON public.application_documents;
CREATE POLICY "Documents: Insert policy" 
    ON public.application_documents FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.applications a
            WHERE a.id = application_documents.application_id
            AND a.applicant_id = public.get_current_profile_id()
            AND a.status IN ('draft', 'deficiency_raised', 'submitted')
        )
        OR public.is_admin()
    );

DROP POLICY IF EXISTS "Documents: Update policy" ON public.application_documents;
CREATE POLICY "Documents: Update policy" 
    ON public.application_documents FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.applications a
            WHERE a.id = application_documents.application_id
            AND (
                (a.applicant_id = public.get_current_profile_id() AND a.status IN ('draft', 'deficiency_raised'))
                OR public.is_admin()
                OR (public.is_scrutiny_officer() AND (a.assigned_officer_id = public.get_current_profile_id() OR a.assigned_officer_id IS NULL))
            )
        )
    );

DROP POLICY IF EXISTS "Documents: Delete policy" ON public.application_documents;
CREATE POLICY "Documents: Delete policy" 
    ON public.application_documents FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.applications a
            WHERE a.id = application_documents.application_id
            AND (
                (a.applicant_id = public.get_current_profile_id() AND a.status IN ('draft', 'deficiency_raised'))
                OR public.is_admin()
            )
        )
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

ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Status History: Read policy" ON public.application_status_history;
CREATE POLICY "Status History: Read policy" 
    ON public.application_status_history FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.applications a
            WHERE a.id = application_status_history.application_id
            AND (
                a.applicant_id = public.get_current_profile_id()
                OR public.is_admin()
                OR public.is_scrutiny_officer()
            )
        )
    );

DROP POLICY IF EXISTS "Status History: Insert policy" ON public.application_status_history;
CREATE POLICY "Status History: Insert policy" 
    ON public.application_status_history FOR INSERT 
    WITH CHECK (auth.uid() IS NOT NULL);

-- ------------------------------------------------------------------------------
-- RULE 7: EVERY STATUS UPDATE MUST CREATE A STATUS HISTORY RECORD (DB TRIGGER)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.record_status_history_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.application_status_history (
            application_id,
            old_status,
            new_status,
            remark,
            changed_by
        )
        VALUES (
            NEW.id,
            OLD.status,
            NEW.status,
            'Application status transitioned from ' || COALESCE(OLD.status, 'none') || ' to ' || NEW.status,
            auth.uid()
        );
        NEW.updated_at = timezone('utc'::text, now());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_record_status_history ON public.applications;
CREATE TRIGGER trg_record_status_history
    BEFORE UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.record_status_history_trigger();

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

ALTER TABLE public.deficiencies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Deficiencies: Read policy" ON public.deficiencies;
CREATE POLICY "Deficiencies: Read policy" 
    ON public.deficiencies FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.applications a
            WHERE a.id = deficiencies.application_id
            AND (
                a.applicant_id = public.get_current_profile_id()
                OR public.is_admin()
                OR public.is_scrutiny_officer()
            )
        )
    );

DROP POLICY IF EXISTS "Deficiencies: Write policy" ON public.deficiencies;
CREATE POLICY "Deficiencies: Write policy" 
    ON public.deficiencies FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.applications a
            WHERE a.id = deficiencies.application_id
            AND (
                a.applicant_id = public.get_current_profile_id()
                OR public.is_admin()
                OR public.is_scrutiny_officer()
            )
        )
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

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notifications: Read own" ON public.notifications;
CREATE POLICY "Notifications: Read own" 
    ON public.notifications FOR SELECT 
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Notifications: Update own" ON public.notifications;
CREATE POLICY "Notifications: Update own" 
    ON public.notifications FOR UPDATE 
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Notifications: Insert own" ON public.notifications;
CREATE POLICY "Notifications: Insert own" 
    ON public.notifications FOR INSERT 
    WITH CHECK (user_id = auth.uid() OR public.is_admin() OR public.is_scrutiny_officer());

-- ------------------------------------------------------------------------------
-- 8. PRE-SEEDED SCHEMES (NOS & NFST)
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
),
(
    'Post-Matric Scholarship for ST Students (PMS-ST)',
    'SCH-MOTA-PMS',
    'Centrally sponsored scheme providing 100% compulsory non-refundable fees reimbursement and monthly maintenance allowance for Scheduled Tribe students pursuing recognized post-secondary education in India.',
    'Post-Matric / Undergraduate / Diploma / Professional',
    'India (Accredited Colleges & Universities)',
    '2026-10-31 23:59:59+00',
    'active',
    '["Aadhaar Card", "ST Caste Certificate", "Annual Income Certificate (<= 2.5 Lakhs)", "Previous Year Marksheet / Scorecard", "Admission Fee Receipt / College ID", "NPCI Seeded Bank Passbook"]'::jsonb
)
ON CONFLICT (code) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 9. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON public.applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_officer ON public.applications(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_applications_scheme ON public.applications(scheme_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_documents_application ON public.application_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_history_application ON public.application_status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_deficiencies_application ON public.deficiencies(application_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);

-- ------------------------------------------------------------------------------
-- 10. SUPABASE STORAGE CONFIGURATION & OBJECT RLS POLICIES
-- Bucket: scholarship-documents (Private, 5 MB limit, PDF/JPG/JPEG only)
-- Storage Path Structure: {user_id}/{application_id}/{document_type}/{random_file_name}
-- ------------------------------------------------------------------------------

-- Ensure storage bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'scholarship-documents',
    'scholarship-documents',
    false, -- Private bucket: access requires RLS check / signed URLs
    5242880, -- Maximum 5 MB per file (5 * 1024 * 1024)
    ARRAY['application/pdf', 'image/jpeg', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/jpg'];

-- Ensure storage objects table has RLS enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage Object RLS Policies
-- 1. Read Policy: Applicant reads only their own documents; Admin & Officer can review
DROP POLICY IF EXISTS "Storage: Read own application documents" ON storage.objects;
CREATE POLICY "Storage: Read own application documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'scholarship-documents'
        AND (
            -- Applicant owns folder (first segment is user_id)
            auth.uid()::text = (string_to_array(name, '/'))[1]
            OR public.is_admin()
            OR public.is_scrutiny_officer()
        )
    );

-- 2. Insert Policy: Applicant can upload only into their own user_id directory
DROP POLICY IF EXISTS "Storage: Upload own application documents" ON storage.objects;
CREATE POLICY "Storage: Upload own application documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'scholarship-documents'
        AND auth.uid()::text = (string_to_array(name, '/'))[1]
    );

-- 3. Update Policy: Applicant can replace/update files in their own directory
DROP POLICY IF EXISTS "Storage: Update own application documents" ON storage.objects;
CREATE POLICY "Storage: Update own application documents"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'scholarship-documents'
        AND auth.uid()::text = (string_to_array(name, '/'))[1]
    );

-- 4. Delete Policy: Applicant can delete files in their own directory; Admin can delete
DROP POLICY IF EXISTS "Storage: Delete own application documents" ON storage.objects;
CREATE POLICY "Storage: Delete own application documents"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'scholarship-documents'
        AND (
            auth.uid()::text = (string_to_array(name, '/'))[1]
            OR public.is_admin()
        )
    );

