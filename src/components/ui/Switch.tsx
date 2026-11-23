import React from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <label
      className={`flex items-start gap-3 cursor-pointer select-none ${
        disabled ? 'cursor-not-allowed opacity-50' : ''
      }`}
    >
      <div className="relative inline-flex items-center shrink-0 mt-0.5">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`h-5 w-9 rounded-full transition-colors duration-200 ease-in-out ${
            checked ? 'bg-primary' : 'bg-border'
          }`}
        />
        <div
          className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-card shadow-sm transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </div>
      {(label || description) && (
        <div className="space-y-0.5">
          {label && <p className="text-xs font-medium text-foreground">{label}</p>}
          {description && <p className="text-[11px] text-muted-foreground">{description}</p>}
        </div>
      )}
    </label>
  );
};
