/*
  # Add Chat Tables and Policies

  1. New Tables
    - `chat_conversations`
      - `id` (uuid, primary key)
      - `property_id` (uuid, foreign key to properties)
      - `guest_id` (uuid, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `status` (text)
      - `metadata` (jsonb)

    - `chat_messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key to chat_conversations)
      - `created_at` (timestamp)
      - `role` (text)
      - `content` (text)
      - `type` (text)
      - `metadata` (jsonb)

  2. Security
    - Enable RLS on both tables
    - Add policies for property owners to view chat history
    - Add policies for public to insert messages
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Hosts can view their property conversations" ON chat_conversations;
DROP POLICY IF EXISTS "Hosts can view messages from their properties" ON chat_messages;

-- Create chat_conversations table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  guest_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  status text DEFAULT 'active',
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create chat_messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  role text NOT NULL,
  content text NOT NULL,
  type text DEFAULT 'text',
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_property_id 
ON chat_conversations(property_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id 
ON chat_messages(conversation_id);

-- Enable RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "View property conversations"
ON chat_conversations
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM properties
    WHERE properties.id = chat_conversations.property_id
    AND properties.hosts_id = auth.uid()
  )
);

CREATE POLICY "View property messages"
ON chat_messages
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM chat_conversations c
    JOIN properties p ON c.property_id = p.id
    WHERE chat_messages.conversation_id = c.id
    AND p.hosts_id = auth.uid()
  )
);

-- Create trigger function for updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for chat_conversations
DROP TRIGGER IF EXISTS update_chat_conversations_updated_at ON chat_conversations;
CREATE TRIGGER update_chat_conversations_updated_at
  BEFORE UPDATE ON chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();