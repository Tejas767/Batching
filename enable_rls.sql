-- Enable RLS for all tables
-- Allow users to access their own data

ALTER TABLE batch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_current ENABLE ROW LEVEL SECURITY;
ALTER TABLE mix_designs ENABLE ROW LEVEL SECURITY;

-- Create a simple policy for testing
CREATE POLICY "Users can view own history" ON batch_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history" ON batch_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own history" ON batch_history
  FOR UPDATE USING (auth.uid() = user_id);

-- Apply similar policies to other tables
CREATE POLICY "Users can view own entries" ON entry_current
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries" ON entry_current
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own mix designs" ON mix_designs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mix designs" ON mix_designs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
