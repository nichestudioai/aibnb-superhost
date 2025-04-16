import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPropertyAdded: () => void;
}

export default function AddPropertyModal({ isOpen, onClose, onPropertyAdded }: AddPropertyModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [listingUrl, setListingUrl] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subdomainError, setSubdomainError] = useState('');
  const [isCheckingSubdomain, setIsCheckingSubdomain] = useState(false);
  const [isSubdomainAvailable, setIsSubdomainAvailable] = useState(false);

  // Address fields
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');

  // Validate and format subdomain as user types
  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow direct input of lowercase letters, numbers, and hyphens
    const value = e.target.value.toLowerCase();
    
    // Only update if the input matches our allowed pattern
    if (/^[a-z0-9-]*$/.test(value)) {
      setSubdomain(value);
      validateSubdomain(value);
    }
  };

  // Check subdomain availability
  const checkSubdomainAvailability = async (value: string) => {
    if (!value || value.length < 2) {
      setIsSubdomainAvailable(false);
      return;
    }

    setIsCheckingSubdomain(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('subdomain')
        .eq('subdomain', value)
        .maybeSingle();

      if (error) throw error;
      setIsSubdomainAvailable(!data);
      setSubdomainError(data ? 'This subdomain is already taken' : '');
    } catch (err) {
      console.error('Error checking subdomain:', err);
      setSubdomainError('Error checking subdomain availability');
    } finally {
      setIsCheckingSubdomain(false);
    }
  };

  // Debounced subdomain validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (subdomain) {
        checkSubdomainAvailability(subdomain);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [subdomain]);

  const validateSubdomain = (value: string) => {
    if (!value) {
      setSubdomainError('Subdomain is required');
      return false;
    }
    if (value.length < 2) {
      setSubdomainError('Subdomain must be at least 2 characters');
      return false;
    }
    if (value.length > 40) {
      setSubdomainError('Subdomain must be 40 characters or less');
      return false;
    }
    if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(value)) {
      setSubdomainError('Subdomain can only contain lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen');
      return false;
    }
    if (/-{2,}/.test(value)) {
      setSubdomainError('Subdomain cannot contain consecutive hyphens');
      return false;
    }
    setSubdomainError('');
    return true;
  };

  const validateForm = () => {
    if (!title.trim()) {
      setError('Property name is required');
      return false;
    }
    if (!streetAddress.trim()) {
      setError('Street address is required');
      return false;
    }
    if (!city.trim()) {
      setError('City is required');
      return false;
    }
    if (!state.trim()) {
      setError('State is required');
      return false;
    }
    if (!postalCode.trim()) {
      setError('Postal code is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !user || !subdomain || !isSubdomainAvailable) return;

    try {
      setLoading(true);
      setError('');

      // First, check if the host record exists
      const { data: existingHost, error: hostQueryError } = await supabase
        .from('hosts')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (hostQueryError) throw hostQueryError;

      // If host doesn't exist, create it
      if (!existingHost) {
        const { error: hostError } = await supabase
          .from('hosts')
          .insert({
            id: user.id,
            name: user.email?.split('@')[0] || 'Host',
            email: user.email || '',
            phone: '',
            current_hosting: true,
          });

        if (hostError) throw hostError;
      }

      // Create the property
      const { error: propertyError } = await supabase
        .from('properties')
        .insert({
          hosts_id: user.id,
          title: title.trim(),
          description: description.trim(),
          subdomain,
          listing_url: listingUrl.trim(),
          chatbot_enabled: true,
          street_address: streetAddress.trim(),
          city: city.trim(),
          state: state.trim(),
          postal_code: postalCode.trim(),
          country: country.trim()
        });

      if (propertyError) throw propertyError;

      onPropertyAdded();
      onClose();
    } catch (err) {
      console.error('Database error:', err);
      setError('Failed to create property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Add New Property</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Property Name
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter property name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff5a5f]"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 mb-2">
              Subdomain
              <span className="text-gray-500 ml-1">.aibnb.com</span>
            </label>
            <input
              type="text"
              id="subdomain"
              value={subdomain}
              onChange={handleSubdomainChange}
              placeholder="your-property-name"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                isSubdomainAvailable && subdomain ? 'border-green-500 focus:ring-green-500' :
                subdomainError ? 'border-red-500 focus:ring-red-500' :
                'border-gray-300 focus:ring-[#ff5a5f]'
              }`}
              required
              maxLength={40}
            />
            <div className="mt-1 text-sm">
              {isCheckingSubdomain ? (
                <span className="text-gray-500">Checking availability...</span>
              ) : subdomain && !subdomainError ? (
                <span className="text-green-600">✓ Subdomain is available</span>
              ) : (
                <span className="text-red-500">{subdomainError}</span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Use 2-40 characters. Only lowercase letters, numbers, and hyphens allowed. Cannot start or end with a hyphen.
            </p>
          </div>

          {/* Address Fields */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Property Address</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  id="streetAddress"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="123 Main St"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff5a5f]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff5a5f]"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff5a5f]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Postal Code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff5a5f]"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff5a5f]"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter property description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff5a5f]"
              rows={4}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="listingUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Listing URL
            </label>
            <input
              type="url"
              id="listingUrl"
              value={listingUrl}
              onChange={(e) => setListingUrl(e.target.value)}
              placeholder="https://www.airbnb.com/rooms/..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff5a5f]"
            />
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !isSubdomainAvailable || !!subdomainError}
              className="flex-1 bg-[#ff5a5f] text-white py-2 px-4 rounded-md hover:bg-[#ff4146] disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Property'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}