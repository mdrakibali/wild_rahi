'use client';

import React, { useState } from 'react';
import { Database, Download, KeyRound } from 'lucide-react';
import type { DatabaseInfo } from '../../types/portfolio';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface AdminSettingsProps {
  databaseInfo: DatabaseInfo | null;
  usingDefaultCredentials: boolean;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  onDownloadBackup: () => Promise<void>;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  databaseInfo,
  usingDefaultCredentials,
  onChangePassword,
  onDownloadBackup,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [exporting, setExporting] = useState(false);

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
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-semibold">
          Infrastructure &amp; Security
        </p>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1 text-foreground">
          Database &amp; Account Settings
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PostgreSQL Storage Status & Export */}
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-serif font-bold text-foreground">PostgreSQL &amp; Archive Backup</h3>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Wild Rahi is powered by PostgreSQL via Drizzle ORM configured through <code className="font-mono text-xs bg-secondary px-1.5 py-0.5 rounded">DATABASE_URL</code>, ensuring relational integrity and high-performance querying for your portfolio archive.
          </p>

          {databaseInfo && (
            <dl className="grid grid-cols-2 gap-3 text-xs bg-secondary/50 border border-border rounded-md p-4">
              <div>
                <dt className="text-muted-foreground">Active Engine</dt>
                <dd className="font-semibold text-foreground mt-0.5">
                  PostgreSQL (Drizzle ORM)
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Database State</dt>
                <dd className="font-mono text-foreground mt-0.5">{databaseInfo.databaseName || 'Connected'}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Photographs / Articles</dt>
                <dd className="font-mono text-foreground mt-0.5">
                  {databaseInfo.collections.photographs} / {databaseInfo.collections.articles}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Videos / Enquiries</dt>
                <dd className="font-mono text-foreground mt-0.5">
                  {databaseInfo.collections.videos} / {databaseInfo.collections.enquiries}
                </dd>
              </div>
            </dl>
          )}

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
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-serif font-bold text-foreground">Admin Credentials</h3>
          </div>

          {usingDefaultCredentials && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-3.5 text-xs text-amber-800 dark:text-amber-300">
              You are currently using the default seed password. We strongly recommend changing it
              to protect your studio archive.
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              type="password"
              label="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
            />

            <Input
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              helperText="Must be at least 8 characters long."
            />

            <Input
              type="password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
            />

            {feedback && (
              <p
                className={`text-xs px-3.5 py-2.5 rounded-md font-medium ${
                  feedback.type === 'ok'
                    ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border border-emerald-500/20'
                    : 'bg-destructive/10 text-destructive border border-destructive/20'
                }`}
              >
                {feedback.text}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              loading={saving}
            >
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
