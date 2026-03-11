-- Enable pgcrypto for UUID generation if not already enabled (gen_random_uuid is built-in for modern PG)
CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  name text,
  created_at timestamptz DEFAULT now()
);

-- Note: The existing tables (mix_designs, entry_current, batch_history) use "user_id text" 
-- We will store the UUID as text in these columns, so no schema change is strictly required for them.
