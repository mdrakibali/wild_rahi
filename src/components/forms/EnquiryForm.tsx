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

  const inputClass = isLight
    ? 'w-full bg-[#FFFFFF] border border-[#E7E7E2] px-4 py-3 text-sm text-[#171717] placeholder:text-[#686868]/60 focus:outline-none focus:border-[#171717] transition-colors'
    : 'w-full bg-[#151515] border border-[#FFFFFF]/15 px-4 py-3 text-sm text-[#FFFFFF] placeholder:text-[#FFFFFF]/40 focus:outline-none focus:border-[#FFFFFF] transition-colors';

  const labelClass = isLight
    ? 'block text-xs uppercase tracking-[0.14em] text-[#686868] font-medium mb-2'
    : 'block text-xs uppercase tracking-[0.14em] text-[#FFFFFF]/65 font-medium mb-2';

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
        className={`p-8 border ${
          isLight
            ? 'bg-[#F7F7F4] border-[#E7E7E2] text-[#171717]'
            : 'bg-[#151515] border-[#FFFFFF]/15 text-[#FFFFFF]'
        } space-y-4`}
      >
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#171717] text-[#FFFFFF]">
          <Check className="w-5 h-5" />
        </div>
        <h3 className="text-2xl font-semibold tracking-tight">Enquiry Received</h3>
        <p className={`text-sm leading-relaxed ${isLight ? 'text-[#686868]' : 'text-[#FFFFFF]/70'}`}>
          Thank you for writing to Wild Rahi. Your message has been recorded and Razaul Hafiz Rahi
          will respond as soon as he returns from field assignments.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className={`inline-flex items-center rounded-full px-6 py-2.5 text-sm font-medium transition-colors ${
            isLight
              ? 'border border-[#171717]/25 text-[#171717] hover:bg-[#171717] hover:text-[#FFFFFF]'
              : 'border border-[#FFFFFF]/30 text-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#0B0B0B]'
          }`}
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="enquiry-name" className={labelClass}>
            Full Name *
          </label>
          <input
            id="enquiry-name"
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Your name"
            className={inputClass}
            required
          />
          {errors.name && <p className="text-xs text-red-600 mt-1.5">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="enquiry-email" className={labelClass}>
            Email Address *
          </label>
          <input
            id="enquiry-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="name@organization.org"
            className={inputClass}
            required
          />
          {errors.email && <p className="text-xs text-red-600 mt-1.5">{errors.email}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="enquiry-org" className={labelClass}>
            Organization / Publication
          </label>
          <input
            id="enquiry-org"
            type="text"
            value={form.organization}
            onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
            placeholder="Optional"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="enquiry-type" className={labelClass}>
            Enquiry Category
          </label>
          <select
            id="enquiry-type"
            value={form.enquiryType}
            onChange={(e) =>
              setForm((f) => ({ ...f, enquiryType: e.target.value as EnquiryType }))
            }
            className={inputClass}
          >
            {ALLOWED_ENQUIRY_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="enquiry-subject" className={labelClass}>
          Subject *
        </label>
        <input
          id="enquiry-subject"
          type="text"
          value={form.subject}
          onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
          placeholder="Licensing, commission, conservation documentation, or exhibition"
          className={inputClass}
          required
        />
        {errors.subject && <p className="text-xs text-red-600 mt-1.5">{errors.subject}</p>}
      </div>

      <div>
        <label htmlFor="enquiry-message" className={labelClass}>
          Message *
        </label>
        <textarea
          id="enquiry-message"
          rows={5}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder="Share project scope, timeline, publication details, or biodiversity collaboration goals..."
          className={inputClass}
          required
        />
        {errors.message && <p className="text-xs text-red-600 mt-1.5">{errors.message}</p>}
      </div>

      {serverError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3">
          {serverError}
        </p>
      )}

      <div className="pt-1">
        <button
          type="submit"
          disabled={submitting}
          className={`inline-flex items-center gap-2.5 rounded-full px-8 py-3.5 text-sm font-medium transition-colors disabled:opacity-50 ${
            isLight
              ? 'bg-[#171717] text-[#FFFFFF] hover:bg-[#333333]'
              : 'bg-[#FFFFFF] text-[#0B0B0B] hover:bg-[#F0F0EC]'
          }`}
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Sending Message...' : 'Send Enquiry'}
        </button>
      </div>
    </form>
  );
};
