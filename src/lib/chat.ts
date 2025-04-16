import { useState } from 'react';

const OPENAI_API_KEY = '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';
const API_URL = 'https://api.openai.com/v1/chat/completions';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function sendChatMessage(messages: Message[], propertyContext: string) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system' as const,
            content: `You are a helpful AI assistant for a vacation rental property. Here's the property information: ${propertyContext}. Only answer questions related to this property, booking, and local area. For any other topics, politely explain that you can only discuss property-related matters.`
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get response from chat API');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Chat API Error:', error);
    throw error;
  }
}

export function useChatMessages(initialMessages: Message[] = []) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string, propertyContext: string) => {
    setIsLoading(true);
    setError(null);

    const newMessages = [
      ...messages,
      { role: 'user' as const, content }
    ];

    try {
      const response = await sendChatMessage(newMessages, propertyContext);
      setMessages([
        ...newMessages,
        { role: 'assistant' as const, content: response }
      ]);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    sendMessage,
    isLoading,
    error,
  };
}