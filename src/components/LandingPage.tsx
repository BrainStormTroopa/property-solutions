import React from 'react';
import { Check, Phone, Mail, MapPin, Shield, Users, Clock, Award, Home, Droplets, Zap, Bug } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onPortalLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onPortalLogin }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50 border-b-4 border-rps-red">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/RPS Logo Final .png"
              alt="Rubeus Property Solutions"
              className="h-16 object-contain"
            />
          </div>
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

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-rps-charcoal via-rps-dark-charcoal to-rps-charcoal text-white py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Housing Disrepair Claims Made Simple
              </h1>
              <p className="text-2xl md:text-3xl mb-6 text-rps-light-red font-semibold">
                Get Up To £10,000 Compensation
              </p>
              <p className="text-lg md:text-xl mb-8 text-gray-300">
                If you're a council or housing association tenant living with disrepair issues, you could be entitled to compensation. We'll handle everything on a no win, no fee basis.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-lg">
                  <Check className="w-6 h-6 text-rps-red flex-shrink-0" />
                  <span>100% No Win, No Fee</span>
                </li>
                <li className="flex items-center gap-3 text-lg">
                  <Check className="w-6 h-6 text-rps-red flex-shrink-0" />
                  <span>Free Initial Consultation</span>
                </li>
                <li className="flex items-center gap-3 text-lg">
                  <Check className="w-6 h-6 text-rps-red flex-shrink-0" />
                  <span>Expert Solicitors & Surveyors</span>
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
            <div className="bg-white bg-opacity-10 backdrop-blur-sm p-8 rounded-2xl border-2 border-rps-red">
              <h3 className="text-2xl font-bold mb-6 text-center">Quick Eligibility Check</h3>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onGetStarted(); }}>
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-rps-red focus:ring-2 focus:ring-rps-red focus:ring-opacity-50 text-gray-900"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-rps-red focus:ring-2 focus:ring-rps-red focus:ring-opacity-50 text-gray-900"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Are you a council or housing association tenant?</label>
                  <select className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-rps-red focus:ring-2 focus:ring-rps-red focus:ring-opacity-50 text-gray-900">
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
        </div>
      </section>

      {/* Who Can Claim Section */}
      <section className="py-20 bg-rps-light-gray">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-rps-charcoal mb-6">
              Who Can Make A Housing Disrepair Claim?
            </h2>
            <p className="text-xl text-rps-medium-gray max-w-3xl mx-auto">
              If you're experiencing disrepair issues in your rented property and your landlord has failed to fix them, you may be entitled to compensation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-rps-red">
              <div className="w-16 h-16 bg-rps-red rounded-full flex items-center justify-center mb-6 mx-auto">
                <Home className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-rps-charcoal mb-4 text-center">Council Tenants</h3>
              <p className="text-rps-medium-gray text-center">
                If you rent your home from a local council and are experiencing disrepair issues that haven't been resolved.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-rps-red">
              <div className="w-16 h-16 bg-rps-red rounded-full flex items-center justify-center mb-6 mx-auto">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-rps-charcoal mb-4 text-center">Housing Association</h3>
              <p className="text-rps-medium-gray text-center">
                Tenants of housing associations who are living with ongoing disrepair problems in their homes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border-t-4 border-rps-red">
              <div className="w-16 h-16 bg-rps-red rounded-full flex items-center justify-center mb-6 mx-auto">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-rps-charcoal mb-4 text-center">Protected Tenants</h3>
              <p className="text-rps-medium-gray text-center">
                If you've reported issues to your landlord and they haven't taken action, you're protected by law.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Common Issues Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-rps-charcoal mb-6">
              Common Disrepair Issues We Handle
            </h2>
            <p className="text-xl text-rps-medium-gray max-w-3xl mx-auto">
              We help tenants claim compensation for a wide range of property disrepair problems
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-br from-rps-light-gray to-white p-6 rounded-xl border-2 border-gray-200 hover:border-rps-red transition-all">
              <Droplets className="w-12 h-12 text-rps-red mb-4" />
              <h4 className="text-lg font-bold text-rps-charcoal mb-2">Damp & Mould</h4>
              <p className="text-sm text-rps-medium-gray">Persistent damp, condensation, or mould growth affecting your health and home.</p>
            </div>

            <div className="bg-gradient-to-br from-rps-light-gray to-white p-6 rounded-xl border-2 border-gray-200 hover:border-rps-red transition-all">
              <Home className="w-12 h-12 text-rps-red mb-4" />
              <h4 className="text-lg font-bold text-rps-charcoal mb-2">Structural Issues</h4>
              <p className="text-sm text-rps-medium-gray">Cracks, subsidence, leaking roofs, or damaged walls and ceilings.</p>
            </div>

            <div className="bg-gradient-to-br from-rps-light-gray to-white p-6 rounded-xl border-2 border-gray-200 hover:border-rps-red transition-all">
              <Zap className="w-12 h-12 text-rps-red mb-4" />
              <h4 className="text-lg font-bold text-rps-charcoal mb-2">Heating & Electrical</h4>
              <p className="text-sm text-rps-medium-gray">Broken boilers, faulty heating systems, or dangerous electrical problems.</p>
            </div>

            <div className="bg-gradient-to-br from-rps-light-gray to-white p-6 rounded-xl border-2 border-gray-200 hover:border-rps-red transition-all">
              <Bug className="w-12 h-12 text-rps-red mb-4" />
              <h4 className="text-lg font-bold text-rps-charcoal mb-2">Pest Infestations</h4>
              <p className="text-sm text-rps-medium-gray">Ongoing problems with rats, mice, or other pests in your property.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-rps-light-gray p-6 rounded-xl">
              <h4 className="font-bold text-rps-charcoal mb-3">Additional Issues Include:</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-rps-red flex-shrink-0 mt-0.5" />
                  <span className="text-rps-medium-gray">Leaking pipes and plumbing issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-rps-red flex-shrink-0 mt-0.5" />
                  <span className="text-rps-medium-gray">Faulty windows and doors</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-rps-red flex-shrink-0 mt-0.5" />
                  <span className="text-rps-medium-gray">Inadequate ventilation</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-rps-red flex-shrink-0 mt-0.5" />
                  <span className="text-rps-medium-gray">Broken guttering and drainage</span>
                </li>
              </ul>
            </div>
            <div className="bg-rps-light-gray p-6 rounded-xl">
              <h4 className="font-bold text-rps-charcoal mb-3">And Many More:</h4>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-rps-red flex-shrink-0 mt-0.5" />
                  <span className="text-rps-medium-gray">Unsafe staircases or handrails</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-rps-red flex-shrink-0 mt-0.5" />
                  <span className="text-rps-medium-gray">Damaged flooring or carpets</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-rps-red flex-shrink-0 mt-0.5" />
                  <span className="text-rps-medium-gray">Gas safety issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-rps-red flex-shrink-0 mt-0.5" />
                  <span className="text-rps-medium-gray">Asbestos concerns</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-rps-charcoal to-rps-dark-charcoal text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How The Claims Process Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              We make it simple and stress-free to get the compensation you deserve
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-rps-red rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-lg">
                1
              </div>
              <h3 className="text-xl font-bold mb-3">Contact Us</h3>
              <p className="text-gray-300">
                Get in touch by phone or submit your claim online. We'll assess your eligibility for free.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-rps-red rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-lg">
                2
              </div>
              <h3 className="text-xl font-bold mb-3">Survey Visit</h3>
              <p className="text-gray-300">
                A qualified surveyor will inspect your property and document all disrepair issues.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-rps-red rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-lg">
                3
              </div>
              <h3 className="text-xl font-bold mb-3">Legal Action</h3>
              <p className="text-gray-300">
                Our expert solicitors handle your claim and negotiate with your landlord on your behalf.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-rps-red rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold shadow-lg">
                4
              </div>
              <h3 className="text-xl font-bold mb-3">Get Compensated</h3>
              <p className="text-gray-300">
                Receive your compensation and ensure repairs are completed to make your home safe.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={onGetStarted}
              className="bg-rps-red text-white px-12 py-5 rounded-lg font-bold text-lg hover:bg-rps-light-red transition-all shadow-xl hover:shadow-2xl"
            >
              Start Your Claim Today
            </button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-rps-charcoal mb-6">
              Why Choose Rubeus Property Solutions?
            </h2>
            <p className="text-xl text-rps-medium-gray max-w-3xl mx-auto">
              We're dedicated to helping you get the repairs and compensation you deserve
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-8 bg-rps-light-gray rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-rps-red rounded-full flex items-center justify-center mb-6 mx-auto">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-rps-charcoal mb-3">No Win, No Fee</h4>
              <p className="text-rps-medium-gray">
                Complete peace of mind with our no win, no fee guarantee. You only pay if we succeed.
              </p>
            </div>

            <div className="text-center p-8 bg-rps-light-gray rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-rps-red rounded-full flex items-center justify-center mb-6 mx-auto">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-rps-charcoal mb-3">Expert Team</h4>
              <p className="text-rps-medium-gray">
                Our experienced solicitors and surveyors handle every aspect of your claim professionally.
              </p>
            </div>

            <div className="text-center p-8 bg-rps-light-gray rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-rps-red rounded-full flex items-center justify-center mb-6 mx-auto">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-rps-charcoal mb-3">Fast Process</h4>
              <p className="text-rps-medium-gray">
                Quick claim processing and assessment to get you the compensation you deserve faster.
              </p>
            </div>

            <div className="text-center p-8 bg-rps-light-gray rounded-xl hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-rps-red rounded-full flex items-center justify-center mb-6 mx-auto">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-xl font-bold text-rps-charcoal mb-3">Up to £10,000</h4>
              <p className="text-rps-medium-gray">
                Receive compensation up to £10,000 plus ensure your property repairs are completed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-rps-red to-rps-light-red text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready To Make Your Claim?
          </h2>
          <p className="text-xl mb-8 text-white text-opacity-90">
            Don't wait any longer. If you're living with disrepair issues, you deserve compensation. Contact us today for a free, no-obligation consultation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="bg-white text-rps-red px-12 py-5 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl"
            >
              Start Your Free Claim
            </button>
            <a
              href="tel:+447951275297"
              className="bg-rps-charcoal text-white px-12 py-5 rounded-lg font-bold text-lg hover:bg-rps-dark-charcoal transition-colors shadow-xl flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              +44 (0) 7951 275 297
            </a>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-rps-light-gray">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-rps-charcoal mb-6">Get In Touch</h2>
              <p className="text-lg text-rps-medium-gray mb-8">
                Our friendly team is here to answer your questions and help you start your claim. Contact us today for a free consultation.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-rps-red rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-rps-charcoal">Phone</h4>
                    <a href="tel:+447951275297" className="text-rps-red hover:text-rps-light-red text-lg font-medium">
                      +44 (0) 7951 275 297
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-rps-red rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-rps-charcoal">Email</h4>
                    <a href="mailto:admin@rubeus-solutions.com" className="text-rps-red hover:text-rps-light-red font-medium">
                      admin@rubeus-solutions.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-rps-red rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1 text-rps-charcoal">Address</h4>
                    <p className="text-rps-medium-gray">
                      2 Bury Place<br />
                      London WC1A 2JB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <img
                src="/RPS Logo Final .png"
                alt="Rubeus Property Solutions"
                className="h-20 object-contain mb-6 mx-auto"
              />
              <h3 className="text-2xl font-bold text-rps-charcoal mb-4 text-center">
                Request A Free Callback
              </h3>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onGetStarted(); }}>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rps-red focus:ring-2 focus:ring-rps-red focus:ring-opacity-50"
                />
                <input
                  type="tel"
                  placeholder="Your Phone Number"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rps-red focus:ring-2 focus:ring-rps-red focus:ring-opacity-50"
                />
                <textarea
                  placeholder="Brief description of your disrepair issues"
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-rps-red focus:ring-2 focus:ring-rps-red focus:ring-opacity-50"
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-rps-red text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-rps-light-red transition-colors shadow-md"
                >
                  Submit Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-rps-charcoal to-rps-dark-charcoal text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-1">
              <img
                src="/RPS Logo Final .png"
                alt="Rubeus Property Solutions"
                className="h-20 object-contain mb-4"
              />
              <p className="text-gray-400 text-sm">
                Helping tenants get the repairs and compensation they deserve.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={onGetStarted} className="hover:text-rps-red transition-colors">Submit a Claim</button></li>
                <li><button onClick={onPortalLogin} className="hover:text-rps-red transition-colors">Portal Login</button></li>
                <li><a href="tel:+447951275297" className="hover:text-rps-red transition-colors">Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Our Services</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>Council Tenant Claims</li>
                <li>Housing Association Claims</li>
                <li>Damp & Mould Claims</li>
                <li>Structural Damage Claims</li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">Contact</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-rps-red" />
                  <a href="tel:+447951275297" className="hover:text-rps-red transition-colors">+44 (0) 7951 275 297</a>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-rps-red" />
                  <a href="mailto:admin@rubeus-solutions.com" className="hover:text-rps-red transition-colors break-all">admin@rubeus-solutions.com</a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-rps-red" />
                  <span>2 Bury Place, London WC1A 2JB</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center border-t border-white border-opacity-20 pt-8">
            <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Rubeus Property Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
