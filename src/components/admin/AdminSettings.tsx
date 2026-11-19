'use client';

import React, { useState } from 'react';
import { Database, Download, KeyRound } from 'lucide-react';
import type { DatabaseInfo } from '../../types/portfolio';

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
        <p className="text-xs uppercase tracking-[0.16em] text-[#686868] font-medium">
          Infrastructure &amp; Security
        </p>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1">
          Database &amp; Account Settings
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* MongoDB Storage Status & Export */}
        <div className="bg-[#FFFFFF] border border-[#E7E7E2] p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-[#171717]" />
            <h3 className="text-lg font-semibold">MongoDB Persistence &amp; Backup</h3>
          </div>

          <p className="text-sm text-[#686868] leading-relaxed">
            Wild Rahi uses Mongoose with MongoDB when <code className="font-mono text-xs">MONGODB_URI</code> is
            configured in your environment, and automatically uses a persistent MongoDB-compatible
            local store during preview so zero changes are lost.
          </p>

          {databaseInfo && (
            <dl className="grid grid-cols-2 gap-3 text-xs bg-[#F7F7F4] border border-[#E7E7E2] p-4">
              <div>
                <dt className="text-[#686868]">Active Engine</dt>
                <dd className="font-semibold text-[#171717] mt-0.5">
                  {databaseInfo.engine === 'mongodb' ? 'MongoDB (Mongoose)' : 'Local Persistent Store'}
                </dd>
              </div>
              <div>
                <dt className="text-[#686868]">Database Name</dt>
                <dd className="font-mono text-[#171717] mt-0.5">{databaseInfo.databaseName}</dd>
              </div>
              <div>
                <dt className="text-[#686868]">Photographs / Articles</dt>
                <dd className="font-mono text-[#171717] mt-0.5">
                  {databaseInfo.collections.photographs} / {databaseInfo.collections.articles}
                </dd>
              </div>
              <div>
                <dt className="text-[#686868]">Videos / Enquiries</dt>
                <dd className="font-mono text-[#171717] mt-0.5">
                  {databaseInfo.collections.videos} / {databaseInfo.collections.enquiries}
                </dd>
              </div>
            </dl>
          )}

          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-full bg-[#171717] text-[#FFFFFF] px-6 py-2.5 text-sm font-medium hover:bg-[#333333] transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {exporting ? 'Preparing JSON Backup...' : 'Download Full JSON Archive Backup'}
          </button>
        </div>

        {/* Password Security */}
        <div className="bg-[#FFFFFF] border border-[#E7E7E2] p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2.5">
            <KeyRound className="w-5 h-5 text-[#171717]" />
            <h3 className="text-lg font-semibold">Change Admin Password</h3>
          </div>

          {usingDefaultCredentials && (
            <p className="text-xs bg-[#F7F7F4] border border-[#E7E7E2] p-3.5 text-[#171717]">
              You are currently using the initial setup password. Set a private password below
              before publishing live.
            </p>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-[#686868] mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full bg-[#FFFFFF] border border-[#E7E7E2] px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-[#686868] mb-1.5">
                New Password (min 8 chars)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full bg-[#FFFFFF] border border-[#E7E7E2] px-3.5 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.14em] text-[#686868] mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-[#FFFFFF] border border-[#E7E7E2] px-3.5 py-2.5 text-sm"
              />
            </div>

            {feedback && (
              <p
                className={`text-xs px-3.5 py-2.5 border ${
                  feedback.type === 'ok'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                {feedback.text}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#171717] text-[#FFFFFF] px-6 py-2.5 text-sm font-medium hover:bg-[#333333] transition-colors disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
