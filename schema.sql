-- ==============================================================================
-- National Tribal Scholarship Portal (NTSP - MoTA)
-- Complete Database Migration Schema
-- Version: 20260927000000
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. AUTOMATED UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL DEFAULT '',
    mobile TEXT DEFAULT '',
    email TEXT DEFAULT '',
    state TEXT DEFAULT '',
    district TEXT DEFAULT '',
    role TEXT NOT NULL DEFAULT 'applicant' CHECK (role IN ('applicant', 'scrutiny_officer', 'admin', 'committee_member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. NON-RECURSIVE SECURITY DEFINER HELPERS
CREATE OR REPLACE FUNCTION public.get_current_profile_id()
RETURNS UUID AS $$
    SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public SET row_security = off;

CREATE OR REPLACE FUNCTION public.get_current_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public SET row_security = off;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public SET row_security = off;

CREATE OR REPLACE FUNCTION public.is_scrutiny_officer()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role IN ('scrutiny_officer', 'admin', 'committee_member')
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public SET row_security = off;

-- 5. PROFILES RLS POLICIES
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
        (auth.uid() = user_id AND role = public.get_current_role())
        OR public.is_admin()
    );

-- Auto create profile on auth signup trigger
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

-- 6. SCHEMES TABLE
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS tr_schemes_updated_at ON public.schemes;
CREATE TRIGGER tr_schemes_updated_at
    BEFORE UPDATE ON public.schemes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Schemes: Public read access" ON public.schemes;
CREATE POLICY "Schemes: Public read access" 
    ON public.schemes FOR SELECT 
    USING (true);

DROP POLICY IF EXISTS "Schemes: Admin write access" ON public.schemes;
DROP POLICY IF EXISTS "Schemes: Admin insert access" ON public.schemes;
CREATE POLICY "Schemes: Admin insert access" 
    ON public.schemes FOR INSERT 
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Schemes: Admin update access" ON public.schemes;
CREATE POLICY "Schemes: Admin update access" 
    ON public.schemes FOR UPDATE 
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Schemes: Admin delete access" ON public.schemes;
CREATE POLICY "Schemes: Admin delete access" 
    ON public.schemes FOR DELETE 
    USING (public.is_admin());

-- 7. APPLICATIONS TABLE
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
        'committee_screening',
        'rejected',
        'selected'
    )),
    current_step TEXT NOT NULL DEFAULT 'personal',
    personal_details JSONB DEFAULT '{}'::jsonb,
    academic_details JSONB DEFAULT '{}'::jsonb,
    financial_details JSONB DEFAULT '{}'::jsonb,
    risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
    officer_remarks TEXT,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS tr_applications_updated_at ON public.applications;
CREATE TRIGGER tr_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_draft_per_scheme 
ON public.applications (applicant_id, scheme_id) 
WHERE (status = 'draft');

ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Applications: Read access policy" ON public.applications;
CREATE POLICY "Applications: Read access policy" 
    ON public.applications FOR SELECT 
    USING (
        applicant_id = public.get_current_profile_id()
        OR public.is_admin()
        OR (
            public.is_scrutiny_officer() 
            AND (assigned_officer_id = public.get_current_profile_id() OR assigned_officer_id IS NULL)
        )
    );

DROP POLICY IF EXISTS "Applications: Insert policy" ON public.applications;
CREATE POLICY "Applications: Insert policy" 
    ON public.applications FOR INSERT 
    WITH CHECK (
        applicant_id = public.get_current_profile_id()
        AND status IN ('draft', 'submitted')
    );

DROP POLICY IF EXISTS "Applications: Update policy" ON public.applications;
CREATE POLICY "Applications: Update policy" 
    ON public.applications FOR UPDATE 
    USING (
        (applicant_id = public.get_current_profile_id() AND status IN ('draft', 'deficiency_raised'))
        OR public.is_admin()
        OR (
            public.is_scrutiny_officer() 
            AND (assigned_officer_id = public.get_current_profile_id() OR assigned_officer_id IS NULL)
        )
    )
    WITH CHECK (
        (
            applicant_id = public.get_current_profile_id()
            AND status IN ('draft', 'submitted', 'resubmitted')
        )
        OR public.is_admin()
        OR public.is_scrutiny_officer()
    );

DROP POLICY IF EXISTS "Applications: Delete policy" ON public.applications;
CREATE POLICY "Applications: Delete policy" 
    ON public.applications FOR DELETE 
    USING (
        (applicant_id = public.get_current_profile_id() AND status = 'draft')
        OR public.is_admin()
    );

-- 8. APPLICATION DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.application_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    mime_type TEXT DEFAULT 'application/pdf',
    verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'deficiency')),
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
    ocr_status TEXT NOT NULL DEFAULT 'pending' CHECK (ocr_status IN ('pending', 'processing', 'completed', 'failed')),
    confidence_score NUMERIC(5, 2) DEFAULT 0.00,
    officer_remark TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_application_doc_type UNIQUE (application_id, document_type)
);

DROP TRIGGER IF EXISTS tr_documents_updated_at ON public.application_documents;
CREATE TRIGGER tr_documents_updated_at
    BEFORE UPDATE ON public.application_documents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;

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
        OR public.is_scrutiny_officer()
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
                OR public.is_scrutiny_officer()
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
                (a.applicant_id = public.get_current_profile_id() AND a.status = 'draft')
                OR public.is_admin()
            )
        )
    );

-- 9. APPLICATION STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.application_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    old_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    remark TEXT,
    changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
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
    WITH CHECK (auth.role() = 'authenticated');

-- 10. DEFICIENCIES TABLE
CREATE TABLE IF NOT EXISTS public.deficiencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.application_documents(id) ON DELETE SET NULL,
    document_type TEXT NOT NULL,
    reason_category TEXT NOT NULL CHECK (reason_category IN (
        'unclear_scan',
        'document_expired',
        'name_mismatch',
        'missing_mandatory_stamp',
        'invalid_issuing_authority',
        'income_limit_exceeded',
        'other'
    )),
    description TEXT NOT NULL,
    officer_remark TEXT,
    deadline TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'responded', 'resolved', 'escalated')),
    response_text TEXT,
    resolved_document_path TEXT,
    raised_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

DROP TRIGGER IF EXISTS tr_deficiencies_updated_at ON public.deficiencies;
CREATE TRIGGER tr_deficiencies_updated_at
    BEFORE UPDATE ON public.deficiencies
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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

DROP POLICY IF EXISTS "Deficiencies: Admin/Officer insert policy" ON public.deficiencies;
CREATE POLICY "Deficiencies: Admin/Officer insert policy" 
    ON public.deficiencies FOR INSERT 
    WITH CHECK (public.is_admin() OR public.is_scrutiny_officer());

DROP POLICY IF EXISTS "Deficiencies: Update policy" ON public.deficiencies;
CREATE POLICY "Deficiencies: Update policy" 
    ON public.deficiencies FOR UPDATE 
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

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'deficiency')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Notifications: Read policy" ON public.notifications;
CREATE POLICY "Notifications: Read policy" 
    ON public.notifications FOR SELECT 
    USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Notifications: Insert policy" ON public.notifications;
CREATE POLICY "Notifications: Insert policy" 
    ON public.notifications FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Notifications: Update policy" ON public.notifications;
CREATE POLICY "Notifications: Update policy" 
    ON public.notifications FOR UPDATE 
    USING (user_id = auth.uid());

-- 12. OCR RESULTS TABLE
CREATE TABLE IF NOT EXISTS public.ocr_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.application_documents(id) ON DELETE CASCADE,
    extracted_name TEXT,
    extracted_dob TEXT,
    extracted_certificate_number TEXT,
    extracted_income NUMERIC(12, 2),
    confidence_score NUMERIC(5, 2) DEFAULT 0.00,
    raw_text TEXT,
    disclaimer TEXT DEFAULT 'AI-assisted preliminary verification. Final decision by authorised officer.',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.ocr_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "OCR Results: Read policy" ON public.ocr_results;
CREATE POLICY "OCR Results: Read policy" 
    ON public.ocr_results FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.application_documents d
            JOIN public.applications a ON a.id = d.application_id
            WHERE d.id = ocr_results.document_id
            AND (
                a.applicant_id = public.get_current_profile_id()
                OR public.is_admin()
                OR public.is_scrutiny_officer()
            )
        )
    );

DROP POLICY IF EXISTS "OCR Results: Insert policy" ON public.ocr_results;
CREATE POLICY "OCR Results: Insert policy" 
    ON public.ocr_results FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.application_documents d
            JOIN public.applications a ON a.id = d.application_id
            WHERE d.id = ocr_results.document_id
            AND (
                a.applicant_id = public.get_current_profile_id()
                OR public.is_admin()
                OR public.is_scrutiny_officer()
            )
        )
    );

-- 13. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_applications_applicant ON public.applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_officer ON public.applications(assigned_officer_id);
CREATE INDEX IF NOT EXISTS idx_applications_scheme ON public.applications(scheme_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_documents_application ON public.application_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.application_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_history_application ON public.application_status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_deficiencies_application ON public.deficiencies(application_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_ocr_results_document ON public.ocr_results(document_id);

-- 14. PRIVATE STORAGE BUCKET & STORAGE RLS POLICIES
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'scholarship-documents',
    'scholarship-documents',
    false,
    5242880,
    ARRAY['application/pdf', 'image/jpeg', 'image/jpg']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['application/pdf', 'image/jpeg', 'image/jpg'];

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Storage: Read own application documents" ON storage.objects;
CREATE POLICY "Storage: Read own application documents"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'scholarship-documents'
        AND (
            auth.uid()::text = (string_to_array(name, '/'))[1]
            OR public.is_admin()
            OR public.is_scrutiny_officer()
        )
    );

DROP POLICY IF EXISTS "Storage: Upload own application documents" ON storage.objects;
CREATE POLICY "Storage: Upload own application documents"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'scholarship-documents'
        AND auth.uid()::text = (string_to_array(name, '/'))[1]
    );

DROP POLICY IF EXISTS "Storage: Update own application documents" ON storage.objects;
CREATE POLICY "Storage: Update own application documents"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'scholarship-documents'
        AND auth.uid()::text = (string_to_array(name, '/'))[1]
    );

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

-- 15. SEED DATA FOR NOS AND NFST
INSERT INTO public.schemes (name, code, description, education_level, study_location, deadline, status, required_documents)
VALUES 
(
    'National Overseas Scholarship',
    'NOS',
    '100% financial assistance covering full tuition fees, contingency living expenses, and international airfare for Scheduled Tribe scholars pursuing Master''s, Ph.D. and Post-Doctoral degrees abroad at QS Top 500 Global Universities.',
    'Masters, PhD, Post-Doctoral',
    'Abroad',
    '2026-11-30 23:59:59+00',
    'active',
    '["Aadhaar Card", "ST Caste Certificate", "Annual Family Income Certificate", "Unconditional Offer Letter from QS Top 500 University", "GRE / IELTS / TOEFL Scorecard", "NPCI Seeded Active Bank Passbook"]'::jsonb
),
(
    'National Fellowship for ST Students',
    'NFST',
    'Monthly research stipend up to ₹38,000/month + contingency grant for regular full-time M.Phil and Ph.D. scholars pursuing doctoral research in recognized Indian Universities, IITs, and NITs.',
    'Research/Ph.D.',
    'India',
    '2026-12-15 23:59:59+00',
    'active',
    '["Aadhaar Card", "ST Caste Certificate", "Annual Family Income Certificate", "UGC-NET / JRF Award Letter", "Ph.D. Admission / Registration Letter", "Research Synopsis & Guide Endorsement", "NPCI Seeded Active Bank Passbook"]'::jsonb
),
(
    'Post-Matric Scholarship for ST Students',
    'PMS',
    'Centrally sponsored scheme providing 100% compulsory non-refundable fees reimbursement and monthly maintenance allowance for Scheduled Tribe students pursuing recognized post-secondary education in India.',
    'Post-Matric / Undergraduate / Diploma / Professional',
    'India',
    '2026-10-31 23:59:59+00',
    'active',
    '["Aadhaar Card", "ST Caste Certificate", "Annual Income Certificate (<= 2.5 Lakhs)", "Previous Year Marksheet / Scorecard", "Admission Fee Receipt / College ID", "NPCI Seeded Active Bank Passbook"]'::jsonb
),
(
    'Pre-Matric Scholarship for ST Students',
    'PRE',
    'Centrally sponsored scheme executed through State Governments to minimize drop-out rates during transition from elementary to secondary education, providing monthly stipends (₹225/mo Day Scholars, ₹525/mo Hostellers) + ad-hoc grants for ST students in Class IX and X.',
    'Class IX & X (Secondary)',
    'India',
    '2026-10-15 23:59:59+00',
    'active',
    '["Aadhaar Card", "ST Caste Certificate", "Annual Family Income Certificate (<= 2.5 Lakhs)", "School Bonafide / Enrolment Certificate", "Previous Class Marksheet", "NPCI Seeded Active Bank Passbook"]'::jsonb
),
(
    'UGC PG Scholarship for Professional Courses for SC/ST Candidates',
    'UGC-PG',
    'University Grants Commission (UGC) merit-based fellowship for SC/ST students in first year of regular professional master''s programs, providing ₹7,800/month for ME/M.Tech and ₹4,500/month for MBA, MCA, M.Pharm, LLM for 2-3 years across 1,000 national slots.',
    'Postgraduate Professional (ME/M.Tech, MBA, MCA, M.Pharm, LLM)',
    'India',
    '2026-11-15 23:59:59+00',
    'active',
    '["Aadhaar Card", "ST/SC Caste Certificate", "Annual Family Income Certificate", "PG Professional Course Admission / Enrolment Letter", "Undergraduate Degree Marksheet", "NPCI Seeded Active Bank Passbook"]'::jsonb
)
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    education_level = EXCLUDED.education_level,
    study_location = EXCLUDED.study_location,
    status = EXCLUDED.status,
    required_documents = EXCLUDED.required_documents;
