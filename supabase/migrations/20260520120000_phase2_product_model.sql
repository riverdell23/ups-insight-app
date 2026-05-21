-- Phase 2: product model, verification workflow, structured change logs

ALTER TYPE public.verification_status ADD VALUE IF NOT EXISTS 'Draft';

ALTER TABLE public.ups_products
  ADD COLUMN IF NOT EXISTS region_availability_detail TEXT,
  ADD COLUMN IF NOT EXISTS verification_notes TEXT,
  ADD COLUMN IF NOT EXISTS last_verified_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.ups_products
  ALTER COLUMN verification_status SET DEFAULT 'Draft';

ALTER TABLE public.sources
  ADD COLUMN IF NOT EXISTS datasheet_date DATE;

ALTER TABLE public.change_logs
  ADD COLUMN IF NOT EXISTS changes JSONB;

COMMENT ON COLUMN public.ups_products.region_availability_detail IS 'Detailed regional availability (countries, certifications)';
COMMENT ON COLUMN public.ups_products.verification_notes IS 'Internal notes on verification status and sources';
COMMENT ON COLUMN public.ups_products.last_verified_by IS 'Profile id of admin who last marked product Verified';
COMMENT ON COLUMN public.sources.datasheet_date IS 'Publication or revision date of the datasheet document';
COMMENT ON COLUMN public.change_logs.changes IS 'Structured field-level diff for spec edits';
