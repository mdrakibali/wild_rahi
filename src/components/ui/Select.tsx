'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface CustomSelectProps {
  label?: string;
  helperText?: string;
  error?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  options?: SelectOption[];
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  'aria-label'?: string;
}

export const Select: React.FC<CustomSelectProps> = ({
  label,
  helperText,
  error,
  value,
  defaultValue = '',
  placeholder = 'Select an option...',
  options: propOptions,
  onChange,
  name,
  id,
  required = false,
  disabled = false,
  className = '',
  children,
  'aria-label': ariaLabel,
}) => {
  const options: SelectOption[] = React.useMemo(() => {
    if (propOptions && propOptions.length > 0) return propOptions;
    const extracted: SelectOption[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.type === 'option') {
        const childProps = child.props as {
          value?: string;
          children?: React.ReactNode;
          disabled?: boolean;
        };
        const val = childProps.value !== undefined ? String(childProps.value) : '';
        const lbl = childProps.children ? String(childProps.children) : val;
        extracted.push({
          value: val,
          label: lbl,
          disabled: childProps.disabled,
        });
      }
    });
    return extracted;
  }, [propOptions, children]);

  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(value !== undefined ? value : defaultValue);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentValue = value !== undefined ? value : internalValue;
  const currentOption = options.find((opt) => opt.value === currentValue);
  const displayLabel = currentOption ? currentOption.label : placeholder;

  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optVal: string) => {
    setInternalValue(optVal);
    setIsOpen(false);
    if (onChange) {
      onChange({ target: { value: optVal, name } });
    }
  };

  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div ref={containerRef} className={`w-full space-y-1.5 text-left relative ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          id={selectId}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={ariaLabel || label}
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`w-full flex items-center justify-between rounded-lg border bg-card text-foreground px-3.5 py-2.5 text-sm transition-all duration-150 text-left hover:border-primary/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer ${
            error
              ? 'border-destructive focus:border-destructive focus:ring-destructive/10'
              : 'border-border'
          } ${isOpen ? 'border-primary ring-2 ring-primary/10' : ''}`}
        >
          <span
            className={`truncate ${!currentOption ? 'text-muted-foreground/60' : 'text-foreground'}`}
          >
            {displayLabel}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground shrink-0 ml-2 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-primary' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div
            className="absolute z-50 mt-1.5 w-full rounded-lg border border-border bg-card p-1.5 text-foreground shadow-lg max-h-60 overflow-y-auto no-scrollbar"
            role="listbox"
          >
            {options.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                No options available
              </div>
            ) : (
              options.map((opt) => {
                const isSelected = opt.value === currentValue;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    onClick={() => !opt.disabled && handleSelect(opt.value)}
                    className={`flex items-center justify-between w-full rounded-lg px-3 py-2 text-sm text-left transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 ${
                      isSelected
                        ? 'bg-secondary font-semibold text-primary'
                        : 'text-foreground hover:bg-secondary/70'
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="w-4 h-4 text-primary shrink-0 ml-2" />}
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs text-destructive mt-1 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-muted-foreground/80 mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};
