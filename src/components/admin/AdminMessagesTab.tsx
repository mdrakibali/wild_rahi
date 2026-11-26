'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import type { Enquiry, EnquiryStatus } from '../../types/portfolio';
import { Select } from '../ui/Select';

interface AdminMessagesTabProps {
  enquiries: Enquiry[];
  onUpdateStatus: (id: string, status: EnquiryStatus) => Promise<void>;
  onDelete: (id: string, label: string) => void;
  onNotify: (text: string, type?: 'ok' | 'err') => void;
}

export const AdminMessagesTab: React.FC<AdminMessagesTabProps> = ({
  enquiries,
  onUpdateStatus,
  onDelete,
  onNotify,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">
          Contact Submissions
        </p>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight mt-1 text-foreground">
          Contact Messages
        </h2>
      </div>

      {enquiries.length === 0 ? (
        <div className="bg-card border border-border rounded-md p-10 text-center text-sm text-muted-foreground">
          No messages yet. Inquiries sent via /contact will appear here.
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => (
            <div key={enq.id} className="bg-card border border-border rounded-md p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-serif font-bold text-foreground">{enq.subject}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {enq.name} ({enq.email})
                    {enq.createdAt
                      ? ` · ${new Date(enq.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}`
                      : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-36">
                    <Select
                      aria-label="Message status"
                      value={enq.status}
                      onChange={async (e) => {
                        await onUpdateStatus(enq.id, e.target.value as EnquiryStatus);
                        onNotify('Message status updated.');
                      }}
                      options={[
                        { value: 'new', label: 'New' },
                        { value: 'reviewed', label: 'Reviewed' },
                        { value: 'replied', label: 'Replied' },
                        { value: 'archived', label: 'Archived' },
                      ]}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(enq.id, `${enq.name} (${enq.subject})`)}
                    className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-border hover:bg-red-50 text-red-600 cursor-pointer"
                    aria-label="Delete message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-foreground/85 leading-relaxed bg-secondary p-4 border border-border rounded">
                {enq.message}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

