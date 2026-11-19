'use client';

import React, { useState } from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowLeft, Database, Lock } from 'lucide-react';
import type { DatabaseInfo } from '../../types/portfolio';

interface AdminLoginProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  databaseInfo: DatabaseInfo | null;
  usingDefaultCredentials: boolean;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onSignIn,
  databaseInfo,
  usingDefaultCredentials,
}) => {
  const [email, setEmail] = useState(usingDefaultCredentials ? 'admin@wildrahi.com' : '');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSignIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F4] text-[#171717] flex flex-col justify-center px-5 py-12">
      <div className="max-w-md w-full mx-auto space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-[#E7E7E2] bg-[#FFFFFF] px-4 py-1.5 text-xs font-medium text-[#171717] hover:bg-[#F0F0EC] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Wild Rahi
        </Link>

        <div className="bg-[#FFFFFF] border border-[#E7E7E2] p-8 sm:p-10 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#171717] text-[#FFFFFF]">
              <Lock className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Wild Rahi Admin Studio
            </h1>
            <p className="text-sm text-[#686868]">
              Sign in to manage wildlife photography, bilingual articles, videos, habitats, and
              enquiries.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-xs uppercase tracking-[0.14em] text-[#686868] font-medium mb-1.5"
              >
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@wildrahi.com"
                required
                className="w-full bg-[#FFFFFF] border border-[#E7E7E2] px-4 py-2.5 text-sm text-[#171717] focus:outline-none focus:border-[#171717]"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs uppercase tracking-[0.14em] text-[#686868] font-medium mb-1.5"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full bg-[#FFFFFF] border border-[#E7E7E2] px-4 py-2.5 text-sm text-[#171717] focus:outline-none focus:border-[#171717]"
              />
            </div>

            {error && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 px-3.5 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#171717] text-[#FFFFFF] py-3 text-sm font-medium hover:bg-[#333333] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Signing In...' : 'Sign In to Studio'}
            </button>
          </form>

          {usingDefaultCredentials && (
            <div className="bg-[#F7F7F4] border border-[#E7E7E2] p-4 text-xs text-[#686868] space-y-1">
              <p className="font-medium text-[#171717]">Initial Setup Credentials</p>
              <p className="font-mono">Email: admin@wildrahi.com</p>
              <p className="font-mono">Password: WildRahi#2026</p>
              <p className="pt-1">Change this password under Settings &amp; Database after sign-in.</p>
            </div>
          )}

          {databaseInfo && (
            <div className="pt-4 border-t border-[#E7E7E2] flex items-center gap-2 text-xs text-[#686868]">
              <Database className="w-3.5 h-3.5" />
              <span>
                Storage:{' '}
                <strong className="text-[#171717]">
                  {databaseInfo.engine === 'mongodb'
                    ? `MongoDB (${databaseInfo.databaseName})`
                    : 'Local MongoDB-Compatible Store'}
                </strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
