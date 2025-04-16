import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import AddPropertyModal from '../components/AddPropertyModal';
import { Link } from 'react-router-dom';

interface Property {
  id: string;
  title: string;
  subdomain: string;
  listing_url: string;
  created_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Properties</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
                  className="text-blue-600 hover:text-blue-800"
                >
                  View Website
                </Link>
                <Link
                  to={`/${property.subdomain}/edit`}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Edit Details
                </Link>
                <Link
                  to={`/${property.subdomain}/faqs`}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Manage FAQs
                </Link>
              </div>
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