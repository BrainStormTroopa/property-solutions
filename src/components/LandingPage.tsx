import React from "react";
import { Check, Phone, Shield, Users, Clock, Award, Home } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
  onPortalLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onPortalLogin,
}) => {
  const [formData, setFormData] = React.useState({
    name: "",
    phone: "",
    tenantType: "Yes - Council Tenant"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGetStarted();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* NAVIGATION */}
      <nav className="bg-white shadow-md sticky top-0 z-50 border-b-4 border-rps-red">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <img
            src={`${import.meta.env.BASE_URL}rps-logo-final.png`}
            alt="Rubeus Property Solutions"
            className="h-16 object-contain"
          />
          <div className="flex items-center gap-6">
            <a
              href="tel:+447951275297"
              className="hidden md:flex items-center gap-2 text-rps-red font-bold text-lg hover:text-rps-light-red transition-colors"
            >
              <Phone className="w-5 h-5" />
              +44 (0) 7951 275 297
            </a>
            <button
              onClick={onPortalLogin}
              className="bg-rps-red text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-rps-light-red transition-all shadow-md hover:shadow-lg"
            >
              Claims Portal Login
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-rps-charcoal via-rps-dark-charcoal to-rps-charcoal text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column */}
          <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Housing Disrepair Claims Made Simple
            </h1>
            <p className="text-2xl md:text-3xl mb-6 text-rps-light-red font-semibold">
              Get Up To £10,000 Compensation
            </p>
            <p className="text-lg md:text-xl mb-8 text-gray-300">
              If you're a council or housing association tenant living with
              disrepair issues, you could be entitled to compensation. We'll
              handle everything on a no win, no fee basis.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-lg">
                <Check className="w-6 h-6 text-rps-red" />
                100% No Win, No Fee
              </li>
              <li className="flex items-center gap-3 text-lg">
                <Check className="w-6 h-6 text-rps-red" />
                Free Initial Consultation
              </li>
              <li className="flex items-center gap-3 text-lg">
                <Check className="w-6 h-6 text-rps-red" />
                Expert Solicitors & Surveyors
              </li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onGetStarted}
                className="bg-rps-red text-white px-10 py-5 rounded-lg font-bold text-lg hover:bg-rps-light-red transition-all shadow-xl hover:shadow-2xl"
              >
                Start Your Free Claim
              </button>
              <a
                href="tel:+447951275297"
                className="bg-white text-rps-charcoal px-10 py-5 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Call Now
              </a>
            </div>
          </div>

          {/* Right column */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm p-8 rounded-2xl border-2 border-rps-red">
            <h3 className="text-2xl font-bold mb-6 text-center">
              Quick Eligibility Check
            </h3>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-rps-red focus:ring-2 focus:ring-rps-red text-gray-900"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-rps-red focus:ring-2 focus:ring-rps-red text-gray-900"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Are you a council or housing association tenant?
                </label>
                <select 
                  name="tenantType"
                  value={formData.tenantType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-rps-red focus:ring-2 focus:ring-rps-red text-gray-900"
                >
                  <option>Yes - Council Tenant</option>
                  <option>Yes - Housing Association</option>
                  <option>No</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-rps-red text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-rps-light-red transition-colors shadow-md"
              >
                Check Eligibility Now
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* WHO CAN CLAIM */}
      <section className="py-20 bg-rps-light-gray text-center">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Who Can Make a Housing Disrepair Claim?
          </h2>
          <p className="text-xl text-rps-medium-gray mb-16">
            If your landlord hasn't fixed disrepair issues, you may be entitled
            to compensation.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-rps-red">
              <Home className="w-12 h-12 text-rps-red mx-auto mb-4" />
              <h3 className="font-bold text-2xl mb-2">Council Tenants</h3>
              <p className="text-gray-600">
                If your council landlord has ignored repair requests, you can
                claim compensation.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-rps-red">
              <Users className="w-12 h-12 text-rps-red mx-auto mb-4" />
              <h3 className="font-bold text-2xl mb-2">Housing Associations</h3>
              <p className="text-gray-600">
                You're eligible if your housing association failed to fix issues
                like damp or leaks.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-rps-red">
              <Shield className="w-12 h-12 text-rps-red mx-auto mb-4" />
              <h3 className="font-bold text-2xl mb-2">Private Tenants</h3>
              <p className="text-gray-600">
                If you rent privately and repairs were ignored, you still have
                rights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 bg-gradient-to-br from-rps-charcoal to-rps-dark-charcoal text-white text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          How The Claims Process Works
        </h2>
        <p className="text-xl text-gray-300 mb-16">
          Simple steps to get your claim handled quickly.
        </p>
        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto px-6">
          {["Contact Us", "Survey Visit", "Legal Action", "Get Compensated"].map(
            (step, i) => (
              <div key={i} className="text-center">
                <div className="w-20 h-20 bg-rps-red rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-lg">
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold mb-3">{step}</h3>
                <p className="text-gray-300">
                  {i === 0 && "Reach out via phone or our online form"}
                  {i === 1 && "Professional surveyor inspects your property"}
                  {i === 2 && "Expert solicitors build your case"}
                  {i === 3 && "Receive compensation and repairs"}
                </p>
              </div>
            )
          )}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-20 bg-white text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-10 text-rps-charcoal">
          Why Choose Rubeus Property Solutions?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto px-6">
          <div className="p-8 bg-rps-light-gray rounded-xl">
            <Shield className="w-10 h-10 text-rps-red mx-auto mb-4" />
            <h4 className="font-bold mb-2 text-xl">No Win, No Fee</h4>
            <p>Pay nothing unless we succeed with your claim.</p>
          </div>
          <div className="p-8 bg-rps-light-gray rounded-xl">
            <Users className="w-10 h-10 text-rps-red mx-auto mb-4" />
            <h4 className="font-bold mb-2 text-xl">Expert Team</h4>
            <p>Professional solicitors and surveyors on your side.</p>
          </div>
          <div className="p-8 bg-rps-light-gray rounded-xl">
            <Clock className="w-10 h-10 text-rps-red mx-auto mb-4" />
            <h4 className="font-bold mb-2 text-xl">Fast Process</h4>
            <p>Quick assessment and claim turnaround.</p>
          </div>
          <div className="p-8 bg-rps-light-gray rounded-xl">
            <Award className="w-10 h-10 text-rps-red mx-auto mb-4" />
            <h4 className="font-bold mb-2 text-xl">Up To £10,000</h4>
            <p>Claim compensation plus property repairs.</p>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section className="py-20 bg-rps-light-gray text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-rps-charcoal">
          Get In Touch
        </h2>
        <p className="text-xl text-rps-medium-gray mb-12 max-w-3xl mx-auto">
          Our team is ready to help you start your housing disrepair claim.
        </p>
        <button
          onClick={onGetStarted}
          className="bg-rps-red text-white px-12 py-5 rounded-lg font-bold text-lg hover:bg-rps-light-red transition-all shadow-xl hover:shadow-2xl"
        >
          Start Your Claim Today
        </button>
      </section>

      {/* FOOTER */}
      <footer className="bg-gradient-to-b from-rps-charcoal to-rps-dark-charcoal text-white py-10 text-center">
        <p className="text-gray-400 text-sm">
          &copy; {new Date().getFullYear()} Rubeus Property Solutions. All
          rights reserved.
        </p>
      </footer>
    </div>
  );
};