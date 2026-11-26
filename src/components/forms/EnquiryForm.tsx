'use client';

import React, { useState } from 'react';
import { Check, Send } from 'lucide-react';
import { validateEnquiryInput, type EnquiryInput } from '@/lib/validation';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';

export const EnquiryForm: React.FC<{ photographerName?: string }> = ({ photographerName }) => {
  const [form, setForm] = useState<EnquiryInput>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EnquiryInput, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const check = validateEnquiryInput(form);
    if (!check.valid) {
      setErrors(check.errors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(check.sanitized),
      });
      if (!res.ok) {
        const errPayload = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errPayload.error || 'Unable to send message right now.');
      }
      setSubmitted(true);
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Unable to send message right now.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-8 rounded-lg border border-border bg-card text-foreground space-y-4">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
          <Check className="w-5 h-5" />
        </div>
        <h3 className="text-2xl font-serif font-semibold tracking-tight">Message Received</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Thank you for reaching out. {photographerName || 'Razaul Hafiz Rahi'} will reply as soon
          as possible.
        </p>
        <Button type="button" variant="primary" onClick={() => setSubmitted(false)}>
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 sm:p-8 rounded-lg border border-border bg-card text-foreground space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Name"
          required
          placeholder="Your name"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          error={errors.name}
        />

        <Input
          label="Email"
          type="email"
          required
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          error={errors.email}
        />
      </div>

      <Input
        label="Subject"
        required
        placeholder="Collaboration or general inquiry"
        value={form.subject}
        onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
        error={errors.subject}
      />

      <Textarea
        label="Message"
        required
        placeholder="Write your message..."
        rows={5}
        value={form.message}
        onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
        error={errors.message}
      />

      {serverError && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
          {serverError}
        </div>
      )}

      <div className="pt-2 flex justify-end">
        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          icon={<Send className="w-4 h-4" />}
        >
          Send Message
        </Button>
      </div>
    </form>
  );
};
