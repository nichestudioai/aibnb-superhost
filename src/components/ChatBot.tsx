import React, { useState, useRef, useEffect } from 'react';
import { chatWithAI } from '../lib/openai';
import { AnimatePresence, motion } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatBotProps {
  propertyId: string;
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
  listingUrl?: string;
}

interface ContactFormData {
  name: string;
  email: string;
  message: string;
}

export default function ChatBot({ propertyId, isOpen, onClose, initialMessage, listingUrl }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState<ContactFormData>({
    name: '',
    email: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<ContactFormData>>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, showContactForm]);

  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      setMessages([{ role: 'assistant', content: initialMessage }]);
    }
  }, [initialMessage]);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = (): boolean => {
    const errors: Partial<ContactFormData> = {};
    
    if (!contactForm.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!contactForm.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(contactForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!contactForm.message.trim()) {
      errors.message = 'Message is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Here you would typically send the form data to your backend
    setShowContactForm(false);
    setShowSuccessMessage(true);
    setContactForm({ name: '', email: '', message: '' });
    
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await chatWithAI(
        propertyId,
        sessionId,
        messages,
        userMessage
      );

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I'm having trouble right now. Please try again later."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl"
    >
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-semibold">Property Assistant</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <div
        ref={chatContainerRef}
        className="h-96 overflow-y-auto p-4 space-y-4"
      >
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-[#ff5a5f] text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                Thinking...
              </div>
            </motion.div>
          )}

          {showSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-green-100 text-green-800 p-3 rounded-lg text-center"
            >
              Thank you for contacting us, we'll reply to your question as soon as possible.
            </motion.div>
          )}

          {showContactForm && (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onSubmit={handleContactSubmit}
              className="bg-white p-4 rounded-lg border space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-transparent"
                  required
                />
                {formErrors.name && (
                  <span className="text-red-500 text-xs">{formErrors.name}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-transparent"
                  required
                />
                {formErrors.email && (
                  <span className="text-red-500 text-xs">{formErrors.email}</span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                  <span className="text-gray-400 text-xs ml-2">
                    {contactForm.message.length}/100
                  </span>
                </label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 100) {
                      setContactForm(prev => ({ ...prev, message: value }));
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff5a5f] focus:border-transparent"
                  rows={3}
                  maxLength={100}
                  required
                />
                {formErrors.message && (
                  <span className="text-red-500 text-xs">{formErrors.message}</span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#ff5a5f] text-white py-2 px-4 rounded-lg hover:bg-[#ff4146] transition-colors"
                >
                  Send Message
                </button>
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-b p-2 bg-gray-50">
        <div className="flex gap-2">
          {listingUrl && (
            <a
              href={listingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-[#ff5a5f] text-white py-2 px-4 rounded-lg hover:bg-[#ff4146] transition-colors text-center font-medium"
            >
              Book Now
            </a>
          )}
          <button
            onClick={() => setShowContactForm(true)}
            className="flex-1 bg-white border-2 border-[#ff5a5f] text-[#ff5a5f] py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Contact Host
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the property..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff5a5f]"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-[#ff5a5f] text-white px-4 py-2 rounded-lg hover:bg-[#ff4146] disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </motion.div>
  );
}