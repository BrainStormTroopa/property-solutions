import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, FileText } from 'lucide-react';

export const Header: React.FC = () => {
  const { profile, signOut } = useAuth();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'operative': return 'bg-rps-red text-white';
      case 'surveyor': return 'bg-rps-light-red text-white';
      case 'solicitor': return 'bg-rps-red text-white';
      case 'tenant': return 'bg-white text-rps-red border border-rps-red';
      default: return 'bg-white text-rps-charcoal';
    }
  };

  return (
    <header className="bg-gradient-to-r from-rps-charcoal to-rps-dark-charcoal shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img
              src="/RPS Logo Final .png"
              alt="Rubeus Property Solutions"
              className="h-14 object-contain"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-white" />
                <span className="font-medium text-white">{profile?.full_name}</span>
              </div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadgeColor(profile?.role || '')}`}>
                {profile?.role}
              </span>
            </div>

            <button
              onClick={() => signOut()}
              className="p-2.5 text-white hover:bg-rps-red rounded-lg transition-all"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
