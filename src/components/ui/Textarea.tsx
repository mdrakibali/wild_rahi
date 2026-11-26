import React, { forwardRef } from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, helperText, error, id, ...props }, ref) => {
    const areaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={areaId}
            className="block text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground"
          >
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          className={`w-full rounded-xl border bg-card text-foreground px-3.5 py-2.5 text-sm transition-all duration-150 placeholder:text-muted-foreground/50 hover:border-primary/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 min-h-[96px] ${
            error
              ? 'border-destructive focus:border-destructive focus:ring-destructive/10'
              : 'border-border'
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-xs text-destructive mt-1 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-muted-foreground/80 mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

