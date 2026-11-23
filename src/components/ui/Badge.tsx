import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'accent' | 'conservation' | 'status';
  status?:
    | 'Least Concern'
    | 'Near Threatened'
    | 'Vulnerable'
    | 'Endangered'
    | 'Critically Endangered'
    | 'Data Deficient';
}

export const Badge: React.FC<BadgeProps> = ({
  className = '',
  variant = 'default',
  status,
  children,
  ...props
}) => {
  const base =
    'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide transition-colors';

  let variantStyle = 'bg-secondary text-secondary-foreground';

  if (variant === 'conservation' && status) {
    switch (status) {
      case 'Critically Endangered':
        variantStyle = 'bg-destructive/15 text-destructive border border-destructive/25';
        break;
      case 'Endangered':
        variantStyle = 'bg-amber-600/15 text-amber-700 dark:text-amber-400 border border-amber-600/25';
        break;
      case 'Vulnerable':
        variantStyle = 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20';
        break;
      case 'Near Threatened':
        variantStyle = 'bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 border border-emerald-600/20';
        break;
      case 'Least Concern':
      default:
        variantStyle = 'bg-muted text-muted-foreground border border-border';
        break;
    }
  } else if (variant === 'default') {
    variantStyle = 'bg-primary text-primary-foreground';
  } else if (variant === 'accent') {
    variantStyle = 'bg-accent/15 text-accent border border-accent/25';
  } else if (variant === 'outline') {
    variantStyle = 'border border-border text-foreground bg-transparent';
  }

  return (
    <span className={`${base} ${variantStyle} ${className}`} {...props}>
      {children || status}
    </span>
  );
};
