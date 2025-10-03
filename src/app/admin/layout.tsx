'use client';

import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Extract current page from pathname
  const getCurrentPage = (pathname: string) => {
    if (pathname === '/admin') return 'dashboard';
    if (pathname === '/admin/destinations') return 'destinations';
    if (pathname === '/admin/experiences') return 'experiences';
    if (pathname === '/admin/packages') return 'packages';
    if (pathname === '/admin/bookings') return 'bookings';
    if (pathname === '/admin/users') return 'users';
    if (pathname === '/admin/settings') return 'settings';
    return 'dashboard';
  };

  return (
    <AdminNavigation currentPage={getCurrentPage(pathname)}>
      {children}
    </AdminNavigation>
  );
}
