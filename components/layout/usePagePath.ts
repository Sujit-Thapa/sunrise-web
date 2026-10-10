'use client';

import { usePathname } from 'next/navigation';
import { useState } from 'react';

// The sign-in pop-up changes the URL to /auth/*, but the page underneath stays the same.
// Layout decisions (spacing, active link, header style) follow that underlying page.
export function usePagePath(): string {
  const pathname = usePathname() ?? '/';
  const isAuth = pathname.startsWith('/auth/');
  const [pagePath, setPagePath] = useState(pathname);
  if (!isAuth && pagePath !== pathname) setPagePath(pathname);
  return isAuth ? pagePath : pathname;
}
