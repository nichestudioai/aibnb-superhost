import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  created_at: string;
}

interface FAQManagerProps {
  propertyId: string;
  isOwner: boolean;
}

export default function FAQManager({ propertyId, isOwner }: FAQManagerProps) {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Form state
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  // Character count state
  const [questionCharCount, setQuestionCharCount] = useState(0);
  const [answerCharCount, setAnswerCharCount] = useState(0);

  useEffect(() => {
    loadFAQs();
  }, [propertyId]);

  const loadFAQs = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('property_faqs')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setFaqs(data || []);
    } catch (err) {
      console.error('Error loading FAQs:', err);
      setError('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 60) {
      setQuestion(value);
      setQuestionCharCount(value.length);
    }
  };

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 400) {
      setAnswer(value);
      setAnswerCharCount(value.length);
    }
  };

  const formatAnswer = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('*')) {
        return <li key={i}>{line.substring(1).trim()}</li>;
      }
      return <p key={i}>{line}</p>;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;

    try {
      setError(null);
      const newFaq = {
        property_id: propertyId,
        question: question.trim(),
        answer: answer.trim()
      };

      const { error: submitError } = await supabase
        .from('property_faqs')
        .insert([newFaq]);

      if (submitError) throw submitError;

      setQuestion('');
      setAnswer('');
      setShowAddForm(false);
      await loadFAQs();
    } catch (err) {
      console.error('Error saving FAQ:', err);
      setError('Failed to save FAQ. Please try again.');
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      setError(null);
      const { error: updateError } = await supabase
        .from('property_faqs')
        .update({
          question: question.trim(),
          answer: answer.trim()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      setQuestion('');
      setAnswer('');
      setEditingId(null);
      await loadFAQs();
    } catch (err) {
      console.error('Error updating FAQ:', err);
      setError('Failed to update FAQ. Please try again.');
    }
  };

  const startEdit = (faq: FAQ) => {
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setQuestionCharCount(faq.question.length);
    setAnswerCharCount(faq.answer.length);
    setEditingId(faq.id);
    
    // Scroll to the form
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading FAQs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
        {isOwner && faqs.length < 100 && !showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add FAQ
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      <AnimatePresence>
        {(showAddForm || editingId) && (
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-6 rounded-lg shadow-lg space-y-4"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingId) {
                  handleUpdate(editingId);
                } else {
                  handleSubmit(e);
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question
                  <span className="text-gray-400 text-xs ml-2">
                    {questionCharCount}/60
                  </span>
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={handleQuestionChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter FAQ question"
                  maxLength={60}
                  required
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Answer
                  <span className="text-gray-400 text-xs ml-2">
                    {answerCharCount}/400
                  </span>
                </label>
                <textarea
                  value={answer}
                  onChange={handleAnswerChange}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter FAQ answer (use * at line start for bullet points)"
                  rows={4}
                  maxLength={400}
                  required
                />
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingId ? 'Update FAQ' : 'Add FAQ'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                    setQuestion('');
                    setAnswer('');
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <motion.div
            key={faq.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white p-6 rounded-lg shadow"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-semibold">{faq.question}</h3>
              {isOwner && (
                <button
                  onClick={() => startEdit(faq)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              )}
            </div>
            <div className="mt-2 text-gray-600 space-y-2">
              {formatAnswer(faq.answer)}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}