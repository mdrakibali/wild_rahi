'use client';

import React, { useState } from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowLeft, Database, Lock } from 'lucide-react';
import type { DatabaseInfo } from '../../types/portfolio';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

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
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center px-5 py-12">
      <div className="max-w-md w-full mx-auto space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Wild Rahi
        </Link>

        <div className="bg-card border border-border rounded-lg p-8 sm:p-10 space-y-6 shadow-sm">
          <div className="space-y-2">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-md bg-primary text-primary-foreground">
              <Lock className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
              Wild Rahi Studio
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to manage wildlife photography, bilingual articles, videos, habitats, and
              enquiries.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="admin-email"
              type="email"
              label="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@wildrahi.com"
              required
            />

            <Input
              id="admin-password"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />

            {error && (
              <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3.5 py-2.5 font-medium">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              className="w-full"
            >
              Sign In to Studio
            </Button>
          </form>

          {usingDefaultCredentials && (
            <div className="bg-secondary/60 border border-border rounded-md p-4 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Initial Setup Credentials</p>
              <p className="font-mono text-foreground/90">Email: admin@wildrahi.com</p>
              <p className="font-mono text-foreground/90">Password: WildRahi#2026</p>
              <p className="pt-1 text-[11px]">Change this password under Settings &amp; Database after sign-in.</p>
            </div>
          )}

          {databaseInfo && (
            <div className="pt-4 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
              <Database className="w-3.5 h-3.5" />
              <span>
                Storage Engine:{' '}
                <strong className="text-foreground font-semibold">
                  PostgreSQL (Drizzle ORM)
                </strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
