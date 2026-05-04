ALTER TABLE seller_profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS company_url text,
  ADD COLUMN IF NOT EXISTS job_title text,
  ADD COLUMN IF NOT EXISTS product_name text,
  ADD COLUMN IF NOT EXISTS product_description text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS icp_company_size text,
  ADD COLUMN IF NOT EXISTS icp_industries text,
  ADD COLUMN IF NOT EXISTS icp_buyer_title text;
