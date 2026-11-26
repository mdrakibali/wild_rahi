import React from 'react';

export const ContactHeader: React.FC = () => {
  return (
    <section className="bg-background border-b border-border py-14 lg:py-20">
      <div className="site-container space-y-3">
        <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground font-medium">
          Inquiries &amp; Collaborations
        </p>
        <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-serif font-semibold tracking-tight leading-[1.08] text-foreground">
          Contact
        </h1>
        <p className="text-base text-muted-foreground max-w-xl leading-relaxed">
          For wildlife photography collaborations, conservation storytelling, or general inquiries, feel free to write directly.
        </p>
      </div>
    </section>
  );
};
