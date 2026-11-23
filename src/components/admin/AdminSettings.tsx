'use client';

import React, { useState } from 'react';
import { Database, Download, KeyRound, Shield } from 'lucide-react';
import type { DatabaseInfo } from '../../types/portfolio';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface AdminSettingsProps {
  databaseInfo?: DatabaseInfo | null;
  usingDefaultCredentials?: boolean;
  onDownloadBackup: () => Promise<void>;
  onChangePassword: (currentPass: string, newPass: string) => Promise<void>;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  usingDefaultCredentials,
  onDownloadBackup,
  onChangePassword,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (newPassword.length < 8) {
      setFeedback({ type: 'err', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'err', text: 'New password and confirmation do not match.' });
      return;
    }
    setSaving(true);
    try {
      await onChangePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFeedback({ type: 'ok', text: 'Admin password updated securely.' });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Unable to update password.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await onDownloadBackup();
      setFeedback({ type: 'ok', text: 'Studio backup exported successfully as JSON.' });
    } catch (err) {
      setFeedback({
        type: 'err',
        text: err instanceof Error ? err.message : 'Backup export failed.',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold">
          System Architecture
        </p>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1 text-foreground">
          Studio Infrastructure &amp; Security
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PostgreSQL Storage Status & Export */}
        <div className="bg-card border border-border rounded-md p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-foreground" />
            <h3 className="text-lg font-serif font-bold text-foreground">PostgreSQL &amp; Archive Backup</h3>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Wild Rahi is powered by PostgreSQL via Drizzle ORM configured through <code className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">DATABASE_URL</code>, ensuring relational integrity and high-performance querying for your portfolio archive.
          </p>

          <Button
            type="button"
            variant="outline"
            onClick={handleExport}
            loading={exporting}
            icon={<Download className="w-4 h-4" />}
          >
            Download Full JSON Archive Backup
          </Button>
        </div>

        {/* Password Security */}
        <div className="bg-card border border-border rounded-md p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-foreground" />
            <h3 className="text-lg font-serif font-bold text-foreground">Admin Credentials</h3>
          </div>

          {usingDefaultCredentials && (
            <div className="bg-secondary border border-border rounded-md p-3.5 text-xs text-foreground">
              You are currently using the default seed password. We strongly recommend changing it
              to protect your studio archive.
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <Input
              label="New Password"
              type="password"
              required
              helperText="Minimum 8 characters."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <Input
              label="Confirm New Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              loading={saving}
              icon={<Shield className="w-4 h-4" />}
            >
              Update Admin Password
            </Button>
          </form>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-md border text-xs font-medium ${
            feedback.type === 'ok'
              ? 'bg-secondary border-border text-foreground'
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}
        >
          {feedback.text}
        </div>
      )}
    </div>
  );
};
