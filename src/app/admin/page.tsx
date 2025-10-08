'use client';

import { useState, useEffect } from 'react';
import { useAuth, usePermission, useRoleLevel } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { 
  Users, 
  MapPin, 
  Package, 
  Calendar, 
  Settings, 
  BarChart3, 
  Shield
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface DashboardStats {
  totalDestinations: number;
  totalPackages: number;
  totalExperiences: number;
  totalBookings: number;
  totalUsers: number;
  pendingBookings: number;
  activePartners: number;
}

function AdminDashboard() {
  const { user } = useAuth();
  const { hasPermission: canManageDestinations } = usePermission('destinations', 'read');
  const { hasPermission: canManagePackages } = usePermission('packages', 'read');
  const { hasPermission: canManageBookings } = usePermission('bookings', 'read');
  const { hasPermission: canManageUsers } = usePermission('users', 'read');
  const { hasPermission: canManageSettings } = usePermission('settings', 'read');
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      
      // Fetch destinations count
      const destinationsResponse = await fetch('/api/admin/destinations?limit=1000', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      const destinationsData = await destinationsResponse.json();
      const totalDestinations = destinationsData.success ? destinationsData.data.length : 0;
      
      // Fetch packages count
      const packagesResponse = await fetch('/api/admin/packages?limit=1000', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      const packagesData = await packagesResponse.json();
      const totalPackages = packagesData.success ? packagesData.data.length : 0;
      
      // Fetch experiences count
      const experiencesResponse = await fetch('/api/admin/experiences?limit=1000', {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      const experiencesData = await experiencesResponse.json();
      const totalExperiences = experiencesData.success ? experiencesData.data.length : 0;
      
      // Mock data for other stats (TODO: implement actual API calls for bookings, users, etc.)
      setStats({
        totalDestinations,
        totalPackages,
        totalExperiences,
        totalBookings: 0, // TODO: implement bookings API
        totalUsers: 0, // TODO: implement users API
        pendingBookings: 0, // TODO: implement bookings API
        activePartners: 0, // TODO: implement partners API
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Fallback to mock data
      setStats({
        totalDestinations: 0,
        totalPackages: 0,
        totalExperiences: 0,
        totalBookings: 0,
        totalUsers: 0,
        pendingBookings: 0,
        activePartners: 0,
      });
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Page content */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {user?.full_name || user?.email}
        </p>
      </div>

            {/* Stats grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.location.href = '/admin/destinations'}>
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

              <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.location.href = '/admin/packages'}>
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

              <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => window.location.href = '/admin/experiences'}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Experiences</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats?.totalExperiences || 0}
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
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => window.location.href = '/admin/destinations'}
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Manage Destinations
                    </Button>
                  )}
                  {canManagePackages && (
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => window.location.href = '/admin/packages'}
                    >
                      <Package className="mr-2 h-4 w-4" />
                      Manage Packages
                    </Button>
                  )}
                  {canManageDestinations && (
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => window.location.href = '/admin/experiences'}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Manage Experiences
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
  );
}

export default function AdminDashboardPage() {
  return <AdminDashboard />;
}
