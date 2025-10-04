'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthGuard, useAuth, usePermission, useRoleLevel } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/Button';
import { 
  Users, 
  MapPin, 
  Package, 
  Calendar, 
  Settings, 
  BarChart3, 
  Shield,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface AdminNavigationProps {
  children: React.ReactNode;
  currentPage?: string;
}

function AdminNavigationContent({ children, currentPage }: AdminNavigationProps) {
  const { user, logout } = useAuth();
  const { hasPermission: canManageDestinations } = usePermission('destinations', 'read');
  const { hasPermission: canManagePackages } = usePermission('packages', 'read');
  const { hasPermission: canManageBookings } = usePermission('bookings', 'read');
  const { hasPermission: canManageUsers } = usePermission('users', 'read');
  const { hasPermission: canManageSettings } = usePermission('settings', 'read');
  const { roleLevel } = useRoleLevel();
  const pathname = usePathname();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getRoleDisplayName = (roleLevel: number) => {
    switch (roleLevel) {
      case 3: return 'Super Admin';
      case 2: return 'Admin';
      case 1: return 'Staff';
      default: return 'Guest';
    }
  };

  const getRoleColor = (roleLevel: number) => {
    switch (roleLevel) {
      case 3: return 'text-purple-600 bg-purple-100';
      case 2: return 'text-blue-600 bg-blue-100';
      case 1: return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: BarChart3,
      href: '/admin',
      active: pathname === '/admin',
    },
    {
      name: 'Destinations',
      icon: MapPin,
      href: '/admin/destinations',
      permission: true, // Always show for admin users
      active: pathname === '/admin/destinations',
    },
    {
      name: 'Experiences',
      icon: Shield,
      href: '/admin/experiences',
      permission: true, // Always show for admin users
      active: pathname === '/admin/experiences',
    },
    {
      name: 'Packages',
      icon: Package,
      href: '/admin/packages',
      permission: true, // Always show for admin users
      active: pathname === '/admin/packages',
    },
    {
      name: 'Bookings',
      icon: Calendar,
      href: '/admin/bookings',
      permission: true, // Always show for admin users
      active: pathname === '/admin/bookings',
    },
    {
      name: 'Users',
      icon: Users,
      href: '/admin/users',
      permission: true, // Always show for admin users
      active: pathname === '/admin/users',
    },
    {
      name: 'Settings',
      icon: Settings,
      href: '/admin/settings',
      permission: true, // Always show for admin users
      active: pathname === '/admin/settings',
    },
  ].filter(item => item.permission !== false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={cn(
        'fixed inset-0 z-50 lg:hidden',
        sidebarOpen ? 'block' : 'hidden'
      )}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">Expajo Admin</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                  item.active
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* User info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user?.full_name || user?.email}
                </p>
                <p className={cn('text-xs px-2 py-1 rounded-full inline-block', getRoleColor(roleLevel))}>
                  {getRoleDisplayName(roleLevel)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full mt-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-gray-900">Expajo Admin</h1>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                  item.active
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          
          {/* User info */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                  </span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {user?.full_name || user?.email}
                </p>
                <p className={cn('text-xs px-2 py-1 rounded-full inline-block', getRoleColor(roleLevel))}>
                  {getRoleDisplayName(roleLevel)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="w-full mt-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
              <div className="flex items-center gap-x-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.full_name || user?.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getRoleDisplayName(roleLevel)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function AdminNavigation({ children, currentPage }: AdminNavigationProps) {
  return (
    <AuthGuard>
      <AdminNavigationContent currentPage={currentPage}>
        {children}
      </AdminNavigationContent>
    </AuthGuard>
  );
}
