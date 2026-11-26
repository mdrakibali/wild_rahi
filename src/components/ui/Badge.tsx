import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'accent';
}

export const Badge: React.FC<BadgeProps> = ({
  className = '',
  variant = 'default',
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium tracking-wide transition-colors';

  let variantStyle = 'bg-secondary text-secondary-foreground';

  if (variant === 'default') {
    variantStyle = 'bg-primary text-primary-foreground';
  } else if (variant === 'accent') {
    variantStyle = 'bg-accent/15 text-accent border border-accent/25';
  } else if (variant === 'outline') {
    variantStyle = 'border border-border text-foreground bg-transparent';
  }

  return (
    <span className={`${base} ${variantStyle} ${className}`} {...props}>
      {children}
    </span>
  );
};

