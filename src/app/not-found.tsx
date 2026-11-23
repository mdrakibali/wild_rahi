import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-5 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">404 — Page Not Found</p>
      <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground mb-6">
        Lost in the Wilderness
      </h1>
      <p className="text-base text-muted-foreground max-w-md mb-8">
        The page you are looking for does not exist or may have been relocated.
      </p>
      <Link
        href="/"
        className="rounded-full bg-primary text-white px-8 py-3 text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Return to Sanctuary
      </Link>
    </div>
  );
}

