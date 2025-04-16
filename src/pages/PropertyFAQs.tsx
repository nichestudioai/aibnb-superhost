import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import FAQManager from '../components/FAQManager';

interface Property {
  id: string;
  title: string;
  hosts_id: string;
}

export default function PropertyFAQs() {
  const { subdomain } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProperty() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id, title, hosts_id')
          .eq('subdomain', subdomain)
          .single();

        if (error) throw error;
        if (!data) {
          navigate('/dashboard');
          return;
        }

        setProperty(data);
      } catch (err) {
        console.error('Error loading property:', err);
        setError('Failed to load property');
      } finally {
        setLoading(false);
      }
    }

    loadProperty();
  }, [subdomain, navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !property) {
    return <div>Error: {error || 'Property not found'}</div>;
  }

  const isOwner = user?.id === property.hosts_id;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Manage FAQs - {property.title}
        </h1>
      </div>

      <FAQManager propertyId={property.id} isOwner={isOwner} />
    </div>
  );
}