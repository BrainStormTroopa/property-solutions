import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Logo } from './Logo';

interface AuthFormProps {
  onBack?: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onBack }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'tenant' | 'operative' | 'surveyor' | 'solicitor'>('tenant');
  const [organization, setOrganization] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isForgotPassword) {
        await resetPassword(email);
        setSuccess('Password reset email sent! Check your inbox.');
      } else if (isSignUp) {
        await signUp(email, password, fullName, role, organization);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rps-charcoal via-rps-dark-charcoal to-rps-charcoal flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-rps-red">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-white hover:text-rps-red mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </button>
          )}
          <div className="text-center mb-8">
            <div className="mb-6">
              <Logo className="h-20 object-contain mx-auto" />
            </div>
            <p className="text-gray-300 text-lg">
              {isForgotPassword ? 'Reset your password' : isSignUp ? 'Create your account' : 'Sign in to continue'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isForgotPassword && isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-rps-red focus:ring-2 focus:ring-rps-red focus:ring-opacity-50 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-rps-red focus:ring-2 focus:ring-rps-red focus:ring-opacity-50 text-gray-900"
                    required
                  >
                    <option value="tenant">Tenant</option>
                    <option value="operative">Field Operative</option>
                    <option value="surveyor">Surveyor</option>
                    <option value="solicitor">Solicitor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Organization (Optional)
                  </label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-rps-red focus:ring-2 focus:ring-rps-red focus:ring-opacity-50 text-gray-900"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-rps-red focus:ring-2 focus:ring-rps-red focus:ring-opacity-50 text-gray-900"
                placeholder="Enter your email"
                required
              />
            </div>

            {!isForgotPassword && (
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-10 rounded-lg border-2 border-gray-300 focus:border-rps-red focus:ring-2 focus:ring-rps-red focus:ring-opacity-50 text-gray-900"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-rps-red"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-rps-red text-white py-4 rounded-lg font-bold text-lg hover:bg-rps-light-red transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? 'Please wait...' : isForgotPassword ? 'Send Reset Email' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {!isForgotPassword && (
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="block w-full text-white hover:text-rps-red text-sm font-medium"
              >
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(!isForgotPassword);
                setError('');
                setSuccess('');
              }}
              className="block w-full text-white hover:text-rps-red text-sm font-medium"
            >
              {isForgotPassword
                ? 'Back to sign in'
                : 'Forgot your password?'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};