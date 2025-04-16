import { supabase } from './supabase';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface FAQWithScore {
  question: string;
  answer: string;
  score: number;
}

// Utility function to extract keywords from text
function extractKeywords(text: string): string[] {
  // Remove special characters and convert to lowercase
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, '');
  
  // Common English stop words to filter out
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 
    'to', 'was', 'were', 'will', 'with', 'the', 'this', 'but', 'they',
    'have', 'had', 'what', 'when', 'where', 'who', 'which', 'why', 'how'
  ]);

  // Split into words and filter out stop words
  return cleanText
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
}

// Calculate similarity score between two texts
function calculateSimilarity(text1: string, text2: string): number {
  const keywords1 = new Set(extractKeywords(text1));
  const keywords2 = new Set(extractKeywords(text2));
  
  // Calculate intersection
  const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
  
  // Calculate union
  const union = new Set([...keywords1, ...keywords2]);
  
  // Jaccard similarity coefficient
  return intersection.size / union.size;
}

// Log FAQ selection process
function logFAQSelection(
  query: string, 
  faqs: FAQWithScore[], 
  selectedFAQs: FAQ[],
  timing: number
) {
  console.log('FAQ Selection Process:', {
    query,
    totalFAQs: faqs.length,
    selectedCount: selectedFAQs.length,
    processingTimeMs: timing,
    topScores: faqs.slice(0, 3).map(faq => ({
      question: faq.question,
      score: faq.score
    }))
  });
}

export async function findRelevantFAQs(propertyId: string, query: string): Promise<FAQ[]> {
  const startTime = performance.now();
  
  try {
    // Get all FAQs for the property
    const { data: allFaqs, error } = await supabase
      .from('property_faqs')
      .select('question, answer')
      .eq('property_id', propertyId);

    if (error) throw error;
    if (!allFaqs || allFaqs.length === 0) {
      console.log('No FAQs found for property:', propertyId);
      return [];
    }

    // Calculate relevance scores for each FAQ
    const scoredFaqs: FAQWithScore[] = allFaqs.map(faq => {
      // Calculate similarity scores for both question and answer
      const questionScore = calculateSimilarity(query, faq.question);
      const answerScore = calculateSimilarity(query, faq.answer);
      
      // Weighted average: question similarity is weighted more heavily
      const combinedScore = (questionScore * 0.6) + (answerScore * 0.4);
      
      return {
        ...faq,
        score: combinedScore
      };
    });

    // Sort FAQs by score in descending order
    scoredFaqs.sort((a, b) => b.score - a.score);

    // Select top FAQs with a minimum relevance threshold
    const relevanceThreshold = 0.1; // Minimum similarity score to be considered relevant
    const selectedFAQs = scoredFaqs
      .filter(faq => faq.score > relevanceThreshold)
      .slice(0, 3)
      .map(({ question, answer }) => ({ question, answer }));

    const endTime = performance.now();
    logFAQSelection(query, scoredFaqs, selectedFAQs, endTime - startTime);

    return selectedFAQs;
  } catch (error) {
    console.error('Error finding relevant FAQs:', error);
    return [];
  }
}

export async function chatWithAI(
  propertyId: string,
  sessionId: string,
  messages: Message[],
  query: string
): Promise<string> {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    // Find relevant FAQs
    const relevantFAQs = await findRelevantFAQs(propertyId, query);
    
    // Create system prompt with FAQs
    const systemPrompt = `You are an AI assistant embedded on a short-term rental property page.
You can only answer questions based on the following FAQs.
If a question is not covered here, respond:
"I'm sorry, I don't have that information yet. Please contact the host."

${relevantFAQs.map(faq => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}`;

    // Prepare messages for OpenAI
    const apiMessages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...messages,
      { role: 'user', content: query }
    ];

    // Call OpenAI API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenAI');
    }

    const aiResponse = data.choices[0].message.content;

    // First, try to get an existing conversation for this session
    let { data: existingConversation } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('property_id', propertyId)
      .eq('guest_id', sessionId)
      .eq('status', 'active')
      .maybeSingle();

    // If no conversation exists, create one
    if (!existingConversation) {
      const { data: newConversation, error: convError } = await supabase
        .from('chat_conversations')
        .insert([{
          property_id: propertyId,
          guest_id: sessionId,
          status: 'active'
        }])
        .select()
        .single();

      if (convError) throw convError;
      existingConversation = newConversation;
    }

    // Insert the messages into the existing conversation
    await supabase.from('chat_messages').insert([
      {
        conversation_id: existingConversation.id,
        role: 'user',
        content: query,
        type: 'text'
      },
      {
        conversation_id: existingConversation.id,
        role: 'assistant',
        content: aiResponse,
        type: 'text'
      }
    ]);

    return aiResponse;
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
}