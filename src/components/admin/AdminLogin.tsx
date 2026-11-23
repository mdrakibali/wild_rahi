'use client';

import React, { useState } from 'react';
import { Link } from '@/lib/router-compat';
import { ArrowLeft, Lock, LogIn, Mail } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface AdminLoginProps {
  onSignIn: (email: string, pass: string) => Promise<void>;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSignIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Please provide your admin email and password.');
      return;
    }
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

        <div className="bg-card border border-border rounded-md p-7 sm:p-8 space-y-6">
          <div className="space-y-1.5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold">
              Authorized Access Only
            </p>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-foreground">
              Studio Sign In
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Authenticate to manage photographs, articles, species dossiers, and archive records.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Admin Email"
              type="email"
              required
              placeholder="e.g. admin@wildrahi.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
            />

            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center"
              loading={submitting}
              icon={<LogIn className="w-4 h-4" />}
            >
              Enter Studio
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
