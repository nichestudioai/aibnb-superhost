import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import FAQManager from '../components/FAQManager';
import ChatBot from '../components/ChatBot';
import CopyToClipboard from 'react-copy-to-clipboard';

interface Property {
  id: string;
  title: string;
  description: string;
  listing_url: string;
  amenities: any;
  check_in_instructions: string;
  house_rules: string;
  hosts_id: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export default function PropertyPage() {
  const { subdomain } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');
  const [editedListingUrl, setEditedListingUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [descriptionCharCount, setDescriptionCharCount] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    async function loadProperty() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('subdomain', subdomain)
          .single();

        if (error) throw error;
        setProperty(data);
        setIsOwner(user?.id === data.hosts_id);
        setEditedTitle(data.title);
        setEditedDescription(data.description || '');
        setEditedListingUrl(data.listing_url || '');
        setDescriptionCharCount(data.description?.length || 0);

        setTimeout(() => {
          setIsChatOpen(true);
          setTimeout(() => {
            setShowWelcomeMessage(true);
          }, 500);
        }, 3000);
      } catch (error) {
        console.error('Error loading property:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
  }, [subdomain, user]);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 2000) {
      setEditedDescription(value);
      setDescriptionCharCount(value.length);
    }
  };

  const handleSave = async () => {
    try {
      setError(null);
      const { error } = await supabase
        .from('properties')
        .update({
          title: editedTitle.trim(),
          description: editedDescription,
          listing_url: editedListingUrl.trim()
        })
        .eq('id', property?.id);

      if (error) throw error;

      setProperty(prev => prev ? {
        ...prev,
        title: editedTitle.trim(),
        description: editedDescription,
        listing_url: editedListingUrl.trim()
      } : null);
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating property:', err);
      setError('Failed to update property details. Please try again.');
    }
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPreviewDescription = (description: string) => {
    const paragraphs = description.split('\n').filter(p => p.trim());
    if (paragraphs.length <= 2) return description;
    return paragraphs.slice(0, 2).join('\n');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Property not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{property.title}</h1>
      
      {/* Description */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-semibold">About this property</h2>
          <div className="flex gap-4">
            {property.listing_url && (
              <a 
                href={property.listing_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#ff5a5f] hover:text-[#ff4146]"
              >
                View Listing
              </a>
            )}
            <button
              onClick={() => setShowShareModal(true)}
              className="text-[#ff5a5f] hover:text-[#ff4146]"
            >
              Share
            </button>
            {isOwner && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-[#ff5a5f] hover:text-[#ff4146]"
              >
                Edit About
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Name
              </label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff5a5f]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
                <span className="text-gray-400 text-xs ml-2">
                  {descriptionCharCount}/2000
                </span>
              </label>
              <textarea
                value={editedDescription}
                onChange={handleDescriptionChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff5a5f]"
                rows={12}
                maxLength={2000}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Listing URL
              </label>
              <input
                type="url"
                value={editedListingUrl}
                onChange={(e) => setEditedListingUrl(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff5a5f]"
                placeholder="https://www.airbnb.com/rooms/..."
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="bg-[#ff5a5f] text-white px-4 py-2 rounded-lg hover:bg-[#ff4146]"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedTitle(property.title);
                  setEditedDescription(property.description || '');
                  setEditedListingUrl(property.listing_url || '');
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-gray-600 whitespace-pre-line">
              {showFullDescription ? property.description : getPreviewDescription(property.description)}
            </div>
            {property.description.split('\n').filter(p => p.trim()).length > 2 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-[#ff5a5f] hover:text-[#ff4146] font-medium"
              >
                {showFullDescription ? 'Show less' : 'Show full description'}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share Property</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 p-2 rounded">
              <input
                type="text"
                value={`${window.location.origin}/${property.subdomain}`}
                readOnly
                className="flex-1 bg-transparent border-none focus:ring-0"
              />
              <CopyToClipboard
                text={`${window.location.origin}/${property.subdomain}`}
                onCopy={handleCopy}
              >
                <button className="p-2 text-[#ff5a5f] hover:text-[#ff4146]">
                  {copied ? (
                    <span className="text-green-600">Copied!</span>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                      />
                    </svg>
                  )}
                </button>
              </CopyToClipboard>
            </div>
          </div>
        </div>
      )}

      {/* Amenities */}
      {property.amenities && Object.keys(property.amenities).length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(property.amenities).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <span className="text-gray-600">{key}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* House Rules & Check-in Instructions */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {property.house_rules && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">House Rules</h2>
            <div className="prose">
              <p className="text-gray-600 whitespace-pre-line">{property.house_rules}</p>
            </div>
          </div>
        )}
        
        {property.check_in_instructions && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Check-in Instructions</h2>
            <div className="prose">
              <p className="text-gray-600 whitespace-pre-line">{property.check_in_instructions}</p>
            </div>
          </div>
        )}
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <FAQManager propertyId={property.id} isOwner={isOwner} />
      </div>

      {/* Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-4 right-4 bg-[#ff5a5f] text-white p-4 rounded-full shadow-lg hover:bg-[#ff4146] transition-colors ${
          isChatOpen ? 'hidden' : ''
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
          />
        </svg>
      </button>

      {/* ChatBot */}
      {isChatOpen && (
        <ChatBot
          propertyId={property.id}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          listingUrl={property.listing_url}
          initialMessage={
            showWelcomeMessage
              ? `Hi! 👋 Welcome to ${property.title}! I'm your AI assistant, here to help answer any questions you might have about the property. Feel free to ask about amenities, check-in instructions, house rules, or anything else you'd like to know!`
              : undefined
          }
        />
      )}
    </div>
  );
}