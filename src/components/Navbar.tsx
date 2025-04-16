import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">
              AiBNB Superhost Assistant
            </Link>
            <div className="hidden md:flex items-center ml-8 space-x-6">
              <a href="/#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="/#faq" className="text-gray-600 hover:text-gray-900">FAQ</a>
              <a 
                href="https://aibnb.com/contact-us/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-600 hover:text-gray-900"
              >
                Contact
              </a>
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-[#ff5a5f] text-white px-4 py-2 rounded-lg hover:bg-[#ff4146] transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}