'use client';

import React, { useState } from 'react';
import { Check, Send } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  ALLOWED_ENQUIRY_TYPES,
  validateEnquiryInput,
  type EnquiryInput,
} from '../../lib/validation';
import type { EnquiryType } from '../../types/portfolio';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

interface EnquiryFormProps {
  defaultType?: EnquiryType;
  theme?: 'light' | 'dark';
}

export const EnquiryForm: React.FC<EnquiryFormProps> = ({
  defaultType = 'Professional Photography',
  theme = 'light',
}) => {
  const { submitEnquiry } = usePortfolio();
  const [form, setForm] = useState<EnquiryInput>({
    name: '',
    email: '',
    organization: '',
    enquiryType: defaultType,
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof EnquiryInput, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const isLight = theme === 'light';

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
      await submitEnquiry(check.sanitized);
      setSubmitted(true);
      setForm({
        name: '',
        email: '',
        organization: '',
        enquiryType: defaultType,
        subject: '',
        message: '',
      });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Unable to send enquiry right now.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        className={`p-8 rounded-2xl border ${
          isLight
            ? 'bg-card border-border text-foreground'
            : 'bg-card-dark border-border-dark text-white'
        } space-y-4 shadow-sm`}
      >
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground">
          <Check className="w-5 h-5" />
        </div>
        <h3 className="text-2xl font-serif font-bold tracking-tight">Enquiry Received</h3>
        <p className={`text-sm leading-relaxed ${isLight ? 'text-muted-foreground' : 'text-white/70'}`}>
          Thank you for writing to Wild Rahi. Your message has been recorded and Razaul Hafiz Rahi
          will respond as soon as he returns from field assignments.
        </p>
        <Button
          type="button"
          variant={isLight ? 'primary' : 'accent'}
          onClick={() => setSubmitted(false)}
        >
          Send Another Message
        </Button>
      </div>
    );
  }
  
  const selectOptions = ALLOWED_ENQUIRY_TYPES.map((t) => ({ value: t, label: t }));

  return (
    <form
      onSubmit={handleSubmit}
      className={`p-7 sm:p-8 rounded-2xl border ${
        isLight
          ? 'bg-card border-border text-foreground shadow-xs'
          : 'bg-card-dark border-border-dark text-white'
      } space-y-5`}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Your Name"
          required
          placeholder="e.g. Tanvir Ahmed"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          error={errors.name}
        />

        <Input
          label="Email Address"
          type="email"
          required
          placeholder="e.g. tanvir@example.com"
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          error={errors.email}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Organization / Publication"
          placeholder="e.g. NatGeo Traveller / WWF"
          value={form.organization || ''}
          onChange={(e) => setForm((p) => ({ ...p, organization: e.target.value }))}
          error={errors.organization}
        />

        <Select
          label="Nature of Enquiry"
          required
          value={form.enquiryType}
          onChange={(e) => setForm((p) => ({ ...p, enquiryType: e.target.value as EnquiryType }))}
          options={selectOptions}
          error={errors.enquiryType}
        />
      </div>

      <Input
        label="Subject Line"
        required
        placeholder="e.g. Sundarbans Field Documentation Commission"
        value={form.subject}
        onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
        error={errors.subject}
      />

      <Textarea
        label="Message / Project Brief"
        required
        placeholder="Describe the scope, timeline, publication channel, or target species..."
        rows={5}
        value={form.message}
        onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
        error={errors.message}
      />

      {serverError && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
          {serverError}
        </div>
      )}

      <div className="pt-2 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Direct inquiry to Razaul Hafiz Rahi.
        </p>
        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          icon={<Send className="w-4 h-4" />}
        >
          Dispatch Message
        </Button>
      </div>
    </form>
  );
};
