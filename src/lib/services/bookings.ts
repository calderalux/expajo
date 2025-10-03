import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';
import { BookingStatus, PaymentStatus } from '@/lib/supabase';

type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

export interface BookingFilters {
  user_id?: string;
  package_id?: string;
  status?: BookingStatus;
  payment_status?: PaymentStatus;
  start_date?: string;
  end_date?: string;
}

export interface BookingSortOptions {
  field: 'created_at' | 'start_date' | 'total_price';
  order: 'asc' | 'desc';
}

export interface CreateBookingData {
  user_id: string;
  package_id: string;
  start_date: string;
  end_date: string;
  traveler_count: number;
  concierge?: boolean;
  selected_options?: string[];
}

export class BookingService {
  /**
   * Get all bookings with optional filtering and sorting
   */
  static async getBookings(
    filters?: BookingFilters,
    sort?: BookingSortOptions,
    limit?: number
  ) {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        profiles (
          id,
          full_name,
          email,
          avatar_url
        ),
        packages (
          id,
          title,
          slug,
          base_price,
          currency,
          destinations (
            id,
            name,
            country,
            region
          )
        )
      `);

    // Apply filters
    if (filters) {
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.package_id) {
        query = query.eq('package_id', filters.package_id);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.payment_status) {
        query = query.eq('payment_status', filters.payment_status);
      }
      if (filters.start_date) {
        query = query.gte('start_date', filters.start_date);
      }
      if (filters.end_date) {
        query = query.lte('end_date', filters.end_date);
      }
    }

    // Apply sorting
    if (sort) {
      query = query.order(sort.field, { ascending: sort.order === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch bookings: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get a single booking by ID with full details
   */
  static async getBookingById(id: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles (
          id,
          full_name,
          email,
          avatar_url,
          phone
        ),
        packages (
          id,
          title,
          slug,
          summary,
          description,
          base_price,
          currency,
          duration_days,
          destinations (
            id,
            name,
            slug,
            country,
            region,
            image_cover_url
          ),
          partners!packages_lead_partner_id_fkey (
            id,
            name,
            logo_url,
            contact_email,
            contact_phone
          )
        ),
        booking_options (
          id,
          option_name,
          price,
          package_item_options (
            id,
            name,
            description
          )
        ),
        booking_service_assignments (
          id,
          item_type,
          partner_name,
          role,
          is_included,
          unit_price_usd,
          quantity,
          subtotal_usd,
          partners (
            id,
            name,
            logo_url,
            contact_email,
            contact_phone
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch booking: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get bookings for a specific user
   */
  static async getUserBookings(userId: string, limit?: number) {
    return this.getBookings(
      { user_id: userId },
      { field: 'created_at', order: 'desc' },
      limit
    );
  }

  /**
   * Get bookings by status
   */
  static async getBookingsByStatus(status: BookingStatus, limit?: number) {
    return this.getBookings(
      { status },
      { field: 'created_at', order: 'desc' },
      limit
    );
  }

  /**
   * Get bookings by payment status
   */
  static async getBookingsByPaymentStatus(paymentStatus: PaymentStatus, limit?: number) {
    return this.getBookings(
      { payment_status: paymentStatus },
      { field: 'created_at', order: 'desc' },
      limit
    );
  }

  /**
   * Create a new booking
   */
  static async createBooking(bookingData: CreateBookingData) {
    const { data: packageData, error: packageError } = await supabase
      .from('packages')
      .select('base_price, currency, discount_percent')
      .eq('id', bookingData.package_id)
      .single();

    if (packageError) {
      throw new Error(`Failed to fetch package: ${packageError.message}`);
    }

    // Calculate total price
    let totalPrice = (packageData as any).base_price * bookingData.traveler_count;

    // Apply discount if available
    if ((packageData as any).discount_percent && (packageData as any).discount_percent > 0) {
      totalPrice = totalPrice * (1 - (packageData as any).discount_percent / 100);
    }

    // Add selected options pricing
    let optionsTotal = 0;
    if (bookingData.selected_options && bookingData.selected_options.length > 0) {
      const { data: options, error: optionsError } = await supabase
        .from('package_option_mappings')
        .select(`
          option_id,
          package_item_options (
            id,
            name,
            price
          )
        `)
        .eq('package_id', bookingData.package_id)
        .in('option_id', bookingData.selected_options);

      if (optionsError) {
        throw new Error(`Failed to fetch package options: ${optionsError.message}`);
      }

      optionsTotal = (options as any)?.reduce((sum: any, option: any) => {
        const optionPrice = (option as any).package_item_options?.reduce((optSum: any, opt: any) => optSum + (opt.price || 0), 0) || 0;
        return sum + optionPrice * bookingData.traveler_count;
      }, 0) || 0;

      totalPrice += optionsTotal;
    }

    // Create pricing breakdown
    const pricingBreakdown = {
      base_price: (packageData as any).base_price,
      traveler_count: bookingData.traveler_count,
      subtotal: (packageData as any).base_price * bookingData.traveler_count,
      discount_percent: (packageData as any).discount_percent || 0,
      discount_amount: (packageData as any).discount_percent ? ((packageData as any).base_price * bookingData.traveler_count * (packageData as any).discount_percent / 100) : 0,
      options_total: optionsTotal,
      concierge_fee: bookingData.concierge ? 50 : 0, // Example concierge fee
      total: totalPrice + (bookingData.concierge ? 50 : 0)
    };

    // Create the booking
    const bookingInsert: BookingInsert = {
      user_id: bookingData.user_id,
      package_id: bookingData.package_id,
      start_date: bookingData.start_date,
      end_date: bookingData.end_date,
      traveler_count: bookingData.traveler_count,
      concierge: bookingData.concierge || false,
      pricing_breakdown: pricingBreakdown,
      total_price: pricingBreakdown.total,
      status: BookingStatus.PENDING,
      payment_status: PaymentStatus.PENDING
    };

    const { data: booking, error: bookingError } = await (supabase as any)
      .from('bookings')
      .insert(bookingInsert)
      .select()
      .single();

    if (bookingError) {
      throw new Error(`Failed to create booking: ${bookingError.message}`);
    }

    // Add selected options to booking_options table
    if (bookingData.selected_options && bookingData.selected_options.length > 0) {
      const bookingOptions = bookingData.selected_options.map(optionId => ({
        booking_id: booking.id,
        option_id: optionId,
        option_name: '', // Will be populated from package_item_options
        price: 0 // Will be populated from package_item_options
      }));

      // Get option details
      const { data: optionDetails, error: optionDetailsError } = await supabase
        .from('package_item_options')
        .select('id, name, price')
        .in('id', bookingData.selected_options);

      if (optionDetailsError) {
        throw new Error(`Failed to fetch option details: ${optionDetailsError.message}`);
      }

      // Update booking options with correct names and prices
      const updatedBookingOptions = (bookingOptions as any).map((bookingOption: any) => {
        const optionDetail = (optionDetails as any)?.find((opt: any) => opt.id === bookingOption.option_id);
        return {
          ...bookingOption,
          option_name: optionDetail?.name || '',
          price: (optionDetail?.price || 0) * bookingData.traveler_count
        };
      });

      const { error: optionsInsertError } = await supabase
        .from('booking_options')
        .insert(updatedBookingOptions);

      if (optionsInsertError) {
        throw new Error(`Failed to insert booking options: ${optionsInsertError.message}`);
      }
    }

    return { data: booking, error: null };
  }

  /**
   * Update booking status
   */
  static async updateBookingStatus(id: string, status: BookingStatus) {
    const { data, error } = await (supabase as any)
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update booking status: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Update payment status
   */
  static async updatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus,
    paymentReference?: string
  ) {
    const updateData: BookingUpdate = {
      payment_status: paymentStatus,
      payment_reference: paymentReference
    };

    const { data, error } = await (supabase as any)
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update payment status: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Cancel a booking
   */
  static async cancelBooking(id: string, reason?: string) {
    const { data, error } = await (supabase as any)
      .from('bookings')
      .update({
        status: BookingStatus.CANCELLED,
        payment_status: PaymentStatus.REFUNDED
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to cancel booking: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Complete a booking
   */
  static async completeBooking(id: string) {
    const { data, error } = await (supabase as any)
      .from('bookings')
      .update({ status: BookingStatus.COMPLETED })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to complete booking: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Generate QR code for booking
   */
  static async generateQRCode(id: string) {
    // This would typically integrate with a QR code generation service
    // For now, we'll just update the qr_code_url field
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${id}`;

    const { data, error } = await (supabase as any)
      .from('bookings')
      .update({ qr_code_url: qrCodeUrl })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get booking statistics
   */
  static async getBookingStatistics() {
    const { data, error } = await supabase
      .from('bookings')
      .select('status, payment_status, total_price, created_at');

    if (error) {
      throw new Error(`Failed to fetch booking statistics: ${error.message}`);
    }

    const stats = {
      total_bookings: (data as any)?.length || 0,
      pending_bookings: (data as any)?.filter((b: any) => b.status === BookingStatus.PENDING).length || 0,
      confirmed_bookings: (data as any)?.filter((b: any) => b.status === BookingStatus.CONFIRMED).length || 0,
      completed_bookings: (data as any)?.filter((b: any) => b.status === BookingStatus.COMPLETED).length || 0,
      cancelled_bookings: (data as any)?.filter((b: any) => b.status === BookingStatus.CANCELLED).length || 0,
      total_revenue: (data as any)?.reduce((sum: any, b: any) => sum + (b.total_price || 0), 0) || 0,
      paid_bookings: (data as any)?.filter((b: any) => b.payment_status === PaymentStatus.PAID).length || 0,
      pending_payments: (data as any)?.filter((b: any) => b.payment_status === PaymentStatus.PENDING).length || 0
    };

    return { data: stats, error: null };
  }
}

export type { Booking, BookingInsert, BookingUpdate };
