'use client';

import { useState, useEffect } from 'react';
import { AuthGuard, useAuth, usePermission, useRoleLevel } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
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

interface DashboardStats {
  totalDestinations: number;
  totalPackages: number;
  totalBookings: number;
  totalUsers: number;
  pendingBookings: number;
  activePartners: number;
}

function AdminDashboard() {
  const { user, logout } = useAuth();
  const { hasPermission: canManageDestinations } = usePermission('destinations', 'read');
  const { hasPermission: canManagePackages } = usePermission('packages', 'read');
  const { hasPermission: canManageBookings } = usePermission('bookings', 'read');
  const { hasPermission: canManageUsers } = usePermission('users', 'read');
  const { hasPermission: canManageSettings } = usePermission('settings', 'read');
  const { roleLevel } = useRoleLevel();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // TODO: Implement API call to fetch dashboard statistics
      // const response = await fetch('/api/admin/dashboard/stats');
      // const data = await response.json();
      
      // Mock data for now
      setStats({
        totalDestinations: 24,
        totalPackages: 156,
        totalBookings: 89,
        totalUsers: 234,
        pendingBookings: 12,
        activePartners: 18,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

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
      active: true,
    },
    {
      name: 'Destinations',
      icon: MapPin,
      href: '/admin/destinations',
      permission: canManageDestinations,
    },
    {
      name: 'Packages',
      icon: Package,
      href: '/admin/packages',
      permission: canManagePackages,
    },
    {
      name: 'Bookings',
      icon: Calendar,
      href: '/admin/bookings',
      permission: canManageBookings,
    },
    {
      name: 'Users',
      icon: Users,
      href: '/admin/users',
      permission: canManageUsers,
    },
    {
      name: 'Settings',
      icon: Settings,
      href: '/admin/settings',
      permission: canManageSettings,
    },
  ].filter(item => item.permission !== false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

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
              <a
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
              </a>
            ))}
          </nav>
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
              <a
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
              </a>
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
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back, {user?.full_name || user?.email}
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MapPin className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Destinations</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats?.totalDestinations || 0}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Package className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Packages</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats?.totalPackages || 0}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Bookings</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats?.totalBookings || 0}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Users</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats?.totalUsers || 0}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {canManageDestinations && (
                    <Button className="w-full justify-start" variant="outline">
                      <MapPin className="mr-2 h-4 w-4" />
                      Add New Destination
                    </Button>
                  )}
                  {canManagePackages && (
                    <Button className="w-full justify-start" variant="outline">
                      <Package className="mr-2 h-4 w-4" />
                      Create Package
                    </Button>
                  )}
                  {canManageBookings && (
                    <Button className="w-full justify-start" variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      View Pending Bookings
                    </Button>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-500">
                    No recent activity to display
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AuthGuard>
      <AdminDashboard />
    </AuthGuard>
  );
}
