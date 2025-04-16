import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useState } from 'react';

export default function Navbar() {
  const { user } = useAuth();
  const [showAboutModal, setShowAboutModal] = useState(false);

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
              <button 
                onClick={() => setShowAboutModal(true)}
                className="text-gray-600 hover:text-gray-900"
              >
                About This App
              </button>
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

      {/* About Modal */}
      {showAboutModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowAboutModal(false)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-2xl w-full relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAboutModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
            
            <h2 className="text-2xl font-bold mb-4">About AiBNB Superhost Assistant</h2>
            
            <p className="text-gray-600 mb-4">
              AiBNB Superhost Assistant is an innovative AI-powered platform designed to revolutionize the way property hosts manage their short-term rentals. Our system combines cutting-edge artificial intelligence with practical property management tools to enhance both host efficiency and guest experience.
            </p>

            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Automated guest communication with AI-powered responses available 24/7</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Smart property management dashboard for hosts to manage multiple properties</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Customizable FAQ system with intelligent search and suggestions</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Integration with major booking platforms including Airbnb and VRBO</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Real-time analytics and insights for property performance</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Secure and scalable infrastructure built on modern cloud technology</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </nav>
  );
}