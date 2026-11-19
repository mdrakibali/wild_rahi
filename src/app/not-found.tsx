import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-5 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-[#686868] mb-3">404 — Page Not Found</p>
      <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[#171717] mb-6">
        Lost in the Wilderness
      </h1>
      <p className="text-base text-[#686868] max-w-md mb-8">
        The page you are looking for does not exist or may have been relocated.
      </p>
      <Link
        href="/"
        className="rounded-full bg-[#171717] text-[#FFFFFF] px-8 py-3 text-sm font-medium hover:bg-[#333333] transition-colors"
      >
        Return to Sanctuary
      </Link>
    </div>
  );
}

