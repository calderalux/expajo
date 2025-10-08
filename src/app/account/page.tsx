'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '../../lib/providers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { User, Calendar, Settings, LogOut, Plus } from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabase();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || null,
        });
      } else {
        router.push('/auth/login');
      }
      setLoading(false);
    };

    getUser();
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-playfair text-gray-900 mb-2">
              Welcome back, {user.full_name || 'User'}!
            </h1>
            <p className="text-gray-600">Manage your account and bookings</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User size={20} />
                  Profile
                </CardTitle>
                <CardDescription>
                  Manage your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-xl font-semibold mx-auto mb-2">
                    {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-semibold">{user.full_name || 'No name set'}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <Button variant="outline" className="w-full">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            {/* Bookings Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={20} />
                  My Bookings
                </CardTitle>
                <CardDescription>
                  View and manage your reservations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-primary mb-1">0</div>
                  <p className="text-sm text-gray-600">Active bookings</p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push('/account/bookings')}
                >
                  View All Bookings
                </Button>
              </CardContent>
            </Card>

            {/* Host Dashboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus size={20} />
                  Host Dashboard
                </CardTitle>
                <CardDescription>
                  Manage your properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-primary mb-1">0</div>
                  <p className="text-sm text-gray-600">Listings</p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    // TODO: Navigate to host dashboard
                    console.log('Navigate to host dashboard');
                  }}
                >
                  Manage Listings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold font-playfair mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => router.push('/search')}
              >
                <div className="text-left">
                  <div className="font-semibold">Search Properties</div>
                  <div className="text-sm text-gray-600">Find your next stay</div>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="justify-start h-auto p-4"
                onClick={() => {
                  // TODO: Navigate to settings
                  console.log('Navigate to settings');
                }}
              >
                <div className="text-left">
                  <div className="font-semibold">Account Settings</div>
                  <div className="text-sm text-gray-600">Manage your preferences</div>
                </div>
              </Button>
            </div>
          </div>

          {/* Sign Out */}
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <LogOut size={20} className="mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
