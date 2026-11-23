import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent' | 'destructive' | 'dark';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseCls =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer';

    const variants: Record<string, string> = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm rounded-md',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md',
      outline:
        'border border-border bg-card text-foreground hover:bg-secondary hover:border-primary/30 rounded-md',
      ghost: 'text-foreground hover:bg-secondary/80 rounded-md',
      accent: 'bg-accent text-accent-foreground hover:bg-accent/90 shadow-sm rounded-md',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md',
      dark: 'bg-obsidian text-white hover:bg-surface-dark border border-white/10 rounded-md',
    };

    const sizes: Record<string, string> = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2 gap-2',
      lg: 'text-base px-6 py-3 gap-2.5',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseCls} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin -ml-0.5 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
