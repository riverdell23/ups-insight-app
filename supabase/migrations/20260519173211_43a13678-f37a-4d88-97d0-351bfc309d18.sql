
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  company TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Verification status enum
CREATE TYPE public.verification_status AS ENUM (
  'Verified', 'Pending Review', 'Vendor Submitted', 'Outdated Risk', 'Discontinued', 'Region Check Required'
);

CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  country TEXT,
  website TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.ups_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  product_series TEXT NOT NULL,
  topology TEXT,
  modular_type TEXT,
  min_capacity_kw NUMERIC,
  max_capacity_kw NUMERIC,
  max_parallel_kw NUMERIC,
  double_conversion_efficiency NUMERIC,
  eco_mode_efficiency NUMERIC,
  battery_type TEXT,
  footprint_area_m2 NUMERIC,
  power_density_kw_per_m2 NUMERIC,
  access_requirement TEXT,
  monitoring_protocol TEXT,
  region_availability TEXT,
  verification_status public.verification_status NOT NULL DEFAULT 'Pending Review',
  last_verified_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ups_products ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.ups_specs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.ups_products(id) ON DELETE CASCADE,
  spec_key TEXT NOT NULL,
  spec_value TEXT,
  spec_group TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ups_specs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.ups_products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT,
  source_type TEXT,
  retrieved_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.change_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.ups_products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.change_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_saved_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  product_ids UUID[] NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_saved_comparisons ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- profiles: own
CREATE POLICY "own profile select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- user_roles: user can read own; only admin manages
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- vendors, ups_products, ups_specs, sources: public read (catalog), admin write
CREATE POLICY "public read vendors" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "admin write vendors" ON public.vendors FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "public read products" ON public.ups_products FOR SELECT USING (true);
CREATE POLICY "admin write products" ON public.ups_products FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "public read specs" ON public.ups_specs FOR SELECT USING (true);
CREATE POLICY "admin write specs" ON public.ups_specs FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "public read sources" ON public.sources FOR SELECT USING (true);
CREATE POLICY "admin write sources" ON public.sources FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- change_logs: admin manage, authenticated read
CREATE POLICY "auth read logs" ON public.change_logs FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "admin write logs" ON public.change_logs FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- saved comparisons: own
CREATE POLICY "own saved select" ON public.user_saved_comparisons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own saved insert" ON public.user_saved_comparisons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own saved update" ON public.user_saved_comparisons FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own saved delete" ON public.user_saved_comparisons FOR DELETE USING (auth.uid() = user_id);

-- profile auto-create trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger for products
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER ups_products_touch BEFORE UPDATE ON public.ups_products
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
