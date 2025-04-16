import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Your AI Property Assistant
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Enhance your property management experience with our intelligent AI assistant. Get instant answers, automate tasks, and provide better guest experiences.
        </p>
        <Link
          to="/login"
          className="bg-[#ff5a5f] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#ff4146] transition-colors inline-block"
        >
          Get Started
        </Link>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50 rounded-xl px-8 mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">24/7 Guest Support</h3>
            <p className="text-gray-600">Instant responses to guest inquiries around the clock, ensuring satisfaction and reducing your workload.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Smart Automation</h3>
            <p className="text-gray-600">Automate routine tasks like check-in instructions, house rules, and local recommendations.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Personalized Experience</h3>
            <p className="text-gray-600">Tailored responses based on your property's unique features and guest preferences.</p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-2">How does the AI assistant work?</h3>
            <p className="text-gray-600">Our AI assistant uses advanced natural language processing to understand and respond to guest inquiries in real-time, providing accurate information about your property and local area.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-2">What kind of questions can it answer?</h3>
            <p className="text-gray-600">The AI can handle inquiries about check-in/out procedures, amenities, house rules, local recommendations, and more. It's trained on your property's specific details.</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Is it available 24/7?</h3>
            <p className="text-gray-600">Yes! The AI assistant is always available to help your guests, ensuring they get immediate responses at any time of day.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50 rounded-xl px-8 mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Need Help?</h2>
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-gray-600 mb-8">
            Our support team is here to help you get the most out of your AI assistant.
          </p>
          <div className="space-y-4">
            <p className="text-lg">
              Email: <a href="mailto:support@aibnb.com" className="text-[#ff5a5f] hover:text-[#ff4146]">support@aibnb.com</a>
            </p>
            <p className="text-lg">
              Documentation: <a href="/docs" className="text-[#ff5a5f] hover:text-[#ff4146]">View Documentation</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}