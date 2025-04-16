/*
  # Fix Chat Tables RLS Policies

  1. Changes
    - Add policies to allow public insertion of chat conversations and messages
    - Maintain existing view policies for property owners
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "View property conversations" ON chat_conversations;
DROP POLICY IF EXISTS "View property messages" ON chat_messages;

-- Add new policies for chat_conversations
CREATE POLICY "Anyone can create conversations"
ON chat_conversations
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Property owners can view conversations"
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

-- Add new policies for chat_messages
CREATE POLICY "Anyone can create messages"
ON chat_messages
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Property owners can view messages"
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