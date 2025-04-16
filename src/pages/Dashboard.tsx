import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AddPropertyModal from '../components/AddPropertyModal';
import { Link, useNavigate } from 'react-router-dom';
import CopyToClipboard from 'react-copy-to-clipboard';

interface Property {
  id: string;
  title: string;
  subdomain: string;
  listing_url: string;
  created_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const loadProperties = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('hosts_id', user.id);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [user]);

  const handleManageFAQs = (subdomain: string) => {
    navigate(`/${subdomain}/faqs`);
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#ff5a5f] text-white px-4 py-2 rounded-lg hover:bg-[#ff4146] transition-colors"
        >
          Add Property
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h2 className="text-xl text-gray-600">No properties yet</h2>
          <p className="mt-2 text-gray-500">Add your first property to get started</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900">{property.title}</h2>
              <p className="text-gray-500 mt-2">
                Subdomain: {property.subdomain}
              </p>
              <div className="mt-4 flex gap-4">
                <Link
                  to={`/${property.subdomain}`}
                  className="text-[#ff5a5f] hover:text-[#ff4146]"
                >
                  AiBNB Superhost
                </Link>
                <button
                  onClick={() => handleManageFAQs(property.subdomain)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Manage FAQs
                </button>
                <button
                  onClick={() => setShowShareModal(property.subdomain)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Share
                </button>
              </div>

              {/* Share Modal */}
              {showShareModal === property.subdomain && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Share Property</h3>
                      <button
                        onClick={() => setShowShareModal(null)}
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
            </div>
          ))}
        </div>
      )}

      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onPropertyAdded={loadProperties}
      />
    </div>
  );
}