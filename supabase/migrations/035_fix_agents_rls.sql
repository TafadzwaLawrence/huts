-- Fix: Agents table RLS policies reference auth.users directly which the
-- authenticated role cannot access, causing 403/permission-denied on INSERT.
-- Also allow users to read their own agent row regardless of is_active status.

-- Drop the broken policies
DROP POLICY IF EXISTS "Admins can manage any agent" ON agents;
DROP POLICY IF EXISTS "Active agents are viewable by everyone" ON agents;
DROP POLICY IF EXISTS "Users can insert their own agent profile" ON agents;
DROP POLICY IF EXISTS "Users can update their own agent profile" ON agents;

-- Re-create: anyone can read active agents
CREATE POLICY "Active agents are viewable by everyone"
  ON agents FOR SELECT
  TO public
  USING (is_active = TRUE);

-- Users can always read their own agent row (active or not)
CREATE POLICY "Users can view their own agent profile"
  ON agents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users can insert their own row
CREATE POLICY "Users can insert their own agent profile"
  ON agents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Authenticated users can update their own row
CREATE POLICY "Users can update their own agent profile"
  ON agents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins: use jwt claim via profiles table (avoids auth.users permission error)
CREATE POLICY "Admins can manage any agent"
  ON agents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
