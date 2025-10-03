'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '../../../lib/providers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Calendar, MapPin, Star, Clock, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';

interface Booking {
  id: string;
  listing: {
    id: string;
    title: string;
    location: string;
    image: string;
    price: number;
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
}

const mockBookings: Booking[] = [
  {
    id: '1',
    listing: {
      id: '1',
      title: 'Modern Downtown Apartment',
      location: 'New York, NY',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300&h=200&fit=crop',
      price: 120,
    },
    startDate: '2024-01-15',
    endDate: '2024-01-18',
    totalPrice: 360,
    status: 'confirmed',
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    listing: {
      id: '2',
      title: 'Cozy Beach House',
      location: 'Miami, FL',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=200&fit=crop',
      price: 200,
    },
    startDate: '2024-02-10',
    endDate: '2024-02-15',
    totalPrice: 1000,
    status: 'pending',
    createdAt: '2024-01-15',
  },
];

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('all');
  const supabase = useSupabase();
  const router = useRouter();

  useEffect(() => {
    // TODO: Fetch actual bookings from Supabase
    setLoading(false);
  }, [supabase]);

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'pending':
        return <Clock size={20} className="text-yellow-500" />;
      case 'cancelled':
        return <XCircle size={20} className="text-red-500" />;
      case 'completed':
        return <CheckCircle size={20} className="text-blue-500" />;
      default:
        return <Clock size={20} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const now = new Date();
    const startDate = new Date(booking.startDate);
    const endDate = new Date(booking.endDate);

    switch (filter) {
      case 'upcoming':
        return startDate > now && booking.status !== 'cancelled';
      case 'past':
        return endDate < now && booking.status !== 'cancelled';
      case 'cancelled':
        return booking.status === 'cancelled';
      default:
        return true;
    }
  });

  const handleCancelBooking = (bookingId: string) => {
    // TODO: Implement cancel booking logic
    console.log('Cancel booking:', bookingId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-playfair text-gray-900 mb-2">
              My Bookings
            </h1>
            <p className="text-gray-600">Manage your reservations and travel plans</p>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Bookings' },
                { key: 'upcoming', label: 'Upcoming' },
                { key: 'past', label: 'Past' },
                { key: 'cancelled', label: 'Cancelled' },
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={filter === key ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(key as any)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No bookings found
                </h3>
                <p className="text-gray-600 mb-6">
                  {filter === 'all' 
                    ? "You haven't made any bookings yet."
                    : `No ${filter} bookings found.`
                  }
                </p>
                <Button onClick={() => router.push('/search')}>
                  Start Exploring
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="md:w-64 h-48 md:h-auto">
                      <Image
                        src={booking.listing.image}
                        alt={booking.listing.title}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {booking.listing.title}
                          </h3>
                          <div className="flex items-center text-gray-600 mb-2">
                            <MapPin size={16} className="mr-1" />
                            <span>{booking.listing.location}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <Calendar size={16} className="mr-1" />
                              <span>{formatDate(booking.startDate)} - {formatDate(booking.endDate)}</span>
                            </div>
                            <div className="flex items-center">
                              <Star size={16} className="mr-1" />
                              <span>${booking.listing.price}/night</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                              {getStatusIcon(booking.status)}
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>
                        </div>

                        {/* Price and Actions */}
                        <div className="mt-4 md:mt-0 md:ml-6 text-right">
                          <div className="text-2xl font-bold text-primary mb-2">
                            ${booking.totalPrice}
                          </div>
                          <div className="text-sm text-gray-600 mb-4">
                            Total for {Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24))} nights
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/listing/${booking.listing.id}`)}
                            >
                              View Details
                            </Button>
                            {booking.status === 'pending' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelBooking(booking.id)}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
