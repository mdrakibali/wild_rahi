'use client';

import React from 'react';
import NextLink from 'next/link';
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from 'next/navigation';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to?: string;
  href?: string;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, href, children, ...props }, ref) => {
    const destination = href || to || '/';
    return (
      <NextLink ref={ref} href={destination} {...props}>
        {children}
      </NextLink>
    );
  }
);
Link.displayName = 'Link';

export function useLocation() {
  const pathname = usePathname();
  return { pathname: pathname || '/', search: '', hash: '' };
}

export function useParams<T extends Record<string, string | string[] | undefined>>() {
  return (useNextParams() || {}) as T;
}

export function useSearchParams(): [
  URLSearchParams,
  (
    newParams:
      | Record<string, string | null | undefined>
      | URLSearchParams
      | ((prev: URLSearchParams) => URLSearchParams),
    options?: { replace?: boolean }
  ) => void,
] {
  const router = useRouter();
  const pathname = usePathname();
  const nextSearchParams = useNextSearchParams();

  const searchParams = React.useMemo(() => {
    return new URLSearchParams(nextSearchParams ? Array.from(nextSearchParams.entries()) : []);
  }, [nextSearchParams]);

  const setSearchParams = React.useCallback(
    (
      newParams:
        | Record<string, string | null | undefined>
        | URLSearchParams
        | ((prev: URLSearchParams) => URLSearchParams),
      options?: { replace?: boolean }
    ) => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      const basePath = pathname || '/';

      if (typeof newParams === 'function') {
        const next = newParams(current);
        const query = next.toString();
        const url = query ? `${basePath}?${query}` : basePath;
        if (options?.replace) router.replace(url);
        else router.push(url);
      } else if (newParams instanceof URLSearchParams) {
        const query = newParams.toString();
        const url = query ? `${basePath}?${query}` : basePath;
        if (options?.replace) router.replace(url);
        else router.push(url);
      } else {
        Object.entries(newParams).forEach(([key, value]) => {
          if (value === null || value === undefined || value === '') {
            current.delete(key);
          } else {
            current.set(key, String(value));
          }
        });
        const query = current.toString();
        const url = query ? `${basePath}?${query}` : basePath;
        if (options?.replace) router.replace(url);
        else router.push(url);
      }
    },
    [router, pathname, searchParams]
  );

  return [searchParams, setSearchParams];
}

export function useNavigate() {
  const router = useRouter();
  return (path: string) => router.push(path);
}
