import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/supabase';

type Review = Database['public']['Tables']['reviews']['Row'];
type ReviewInsert = Database['public']['Tables']['reviews']['Insert'];
type ReviewUpdate = Database['public']['Tables']['reviews']['Update'];

export interface ReviewFilters {
  package_id?: string;
  user_id?: string;
  booking_id?: string;
  minRating?: number;
  maxRating?: number;
}

export interface ReviewSortOptions {
  field: 'created_at' | 'rating';
  order: 'asc' | 'desc';
}

export class ReviewService {
  /**
   * Get all reviews with optional filtering and sorting
   */
  static async getReviews(
    filters?: ReviewFilters,
    sort?: ReviewSortOptions,
    limit?: number
  ) {
    let query = supabase
      .from('reviews')
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url
        ),
        packages (
          id,
          title,
          slug,
          destinations (
            id,
            name,
            country
          )
        ),
        bookings (
          id,
          start_date,
          end_date,
          traveler_count
        )
      `);

    // Apply filters
    if (filters) {
      if (filters.package_id) {
        query = query.eq('package_id', filters.package_id);
      }
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.booking_id) {
        query = query.eq('booking_id', filters.booking_id);
      }
      if (filters.minRating !== undefined) {
        query = query.gte('rating', filters.minRating);
      }
      if (filters.maxRating !== undefined) {
        query = query.lte('rating', filters.maxRating);
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
      throw new Error(`Failed to fetch reviews: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get a single review by ID
   */
  static async getReviewById(id: string) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url
        ),
        packages (
          id,
          title,
          slug,
          destinations (
            id,
            name,
            country
          )
        ),
        bookings (
          id,
          start_date,
          end_date,
          traveler_count
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch review: ${error.message}`);
    }

    return { data, error: null };
  }

  /**
   * Get reviews for a specific package
   */
  static async getPackageReviews(packageId: string, limit?: number) {
    return this.getReviews(
      { package_id: packageId },
      { field: 'created_at', order: 'desc' },
      limit
    );
  }

  /**
   * Get reviews by a specific user
   */
  static async getUserReviews(userId: string, limit?: number) {
    return this.getReviews(
      { user_id: userId },
      { field: 'created_at', order: 'desc' },
      limit
    );
  }

  /**
   * Get reviews by rating
   */
  static async getReviewsByRating(rating: number, limit?: number) {
    return this.getReviews(
      { minRating: rating, maxRating: rating },
      { field: 'created_at', order: 'desc' },
      limit
    );
  }

  /**
   * Get high-rated reviews (4+ stars)
   */
  static async getHighRatedReviews(limit?: number) {
    return this.getReviews(
      { minRating: 4 },
      { field: 'rating', order: 'desc' },
      limit
    );
  }

  /**
   * Create a new review
   */
  static async createReview(review: ReviewInsert) {
    // Check if review already exists for this booking
    const { data: existingReview, error: checkError } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', review.booking_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error(`Failed to check existing review: ${checkError.message}`);
    }

    if (existingReview) {
      throw new Error('Review already exists for this booking');
    }

    // Validate rating
    if (review.rating < 1 || review.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url
        ),
        packages (
          id,
          title,
          slug
        )
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create review: ${error.message}`);
    }

    // Update package rating and review count
    await this.updatePackageRating(review.package_id);

    return { data, error: null };
  }

  /**
   * Update a review
   */
  static async updateReview(id: string, updates: ReviewUpdate) {
    // Validate rating if provided
    if (updates.rating && (updates.rating < 1 || updates.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        profiles (
          id,
          full_name,
          avatar_url
        ),
        packages (
          id,
          title,
          slug
        )
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update review: ${error.message}`);
    }

    // Update package rating and review count if rating changed
    if (updates.rating && data) {
      await this.updatePackageRating(data.package_id);
    }

    return { data, error: null };
  }

  /**
   * Delete a review
   */
  static async deleteReview(id: string) {
    // Get the review first to get package_id for updating package rating
    const { data: review, error: fetchError } = await supabase
      .from('reviews')
      .select('package_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch review: ${fetchError.message}`);
    }

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete review: ${error.message}`);
    }

    // Update package rating and review count
    if (review) {
      await this.updatePackageRating(review.package_id);
    }

    return { error: null };
  }

  /**
   * Update package rating and review count
   */
  private static async updatePackageRating(packageId: string) {
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('package_id', packageId);

    if (reviewsError) {
      throw new Error(`Failed to fetch reviews: ${reviewsError.message}`);
    }

    if (!reviews || reviews.length === 0) {
      // No reviews, set to default values
      const { error } = await supabase
        .from('packages')
        .update({ avg_rating: 0, review_count: 0 })
        .eq('id', packageId);

      if (error) {
        throw new Error(`Failed to update package rating: ${error.message}`);
      }
      return;
    }

    const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    const reviewCount = reviews.length;

    const { error } = await supabase
      .from('packages')
      .update({ avg_rating: avgRating, review_count: reviewCount })
      .eq('id', packageId);

    if (error) {
      throw new Error(`Failed to update package rating: ${error.message}`);
    }
  }

  /**
   * Get review statistics for a package
   */
  static async getPackageReviewStats(packageId: string) {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('package_id', packageId);

    if (error) {
      throw new Error(`Failed to fetch review statistics: ${error.message}`);
    }

    if (!reviews || reviews.length === 0) {
      return {
        data: {
          total_reviews: 0,
          average_rating: 0,
          rating_distribution: {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
          }
        },
        error: null
      };
    }

    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    
    const ratingDistribution = reviews.reduce((dist, review) => {
      dist[review.rating as keyof typeof dist]++;
      return dist;
    }, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });

    return {
      data: {
        total_reviews: totalReviews,
        average_rating: averageRating,
        rating_distribution: ratingDistribution
      },
      error: null
    };
  }

  /**
   * Get overall review statistics
   */
  static async getOverallReviewStats() {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating, created_at');

    if (error) {
      throw new Error(`Failed to fetch overall review statistics: ${error.message}`);
    }

    if (!reviews || reviews.length === 0) {
      return {
        data: {
          total_reviews: 0,
          average_rating: 0,
          recent_reviews_count: 0
        },
        error: null
      };
    }

    const totalReviews = reviews.length;
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    
    // Count reviews from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentReviewsCount = reviews.filter(review => 
      new Date(review.created_at) >= thirtyDaysAgo
    ).length;

    return {
      data: {
        total_reviews: totalReviews,
        average_rating: averageRating,
        recent_reviews_count: recentReviewsCount
      },
      error: null
    };
  }

  /**
   * Check if user can review a booking
   */
  static async canUserReviewBooking(userId: string, bookingId: string) {
    // Check if booking exists and belongs to user
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, user_id, status, end_date')
      .eq('id', bookingId)
      .eq('user_id', userId)
      .single();

    if (bookingError) {
      throw new Error(`Failed to fetch booking: ${bookingError.message}`);
    }

    if (!booking) {
      return { data: false, error: null };
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return { data: false, error: null };
    }

    // Check if booking end date has passed
    const endDate = new Date(booking.end_date);
    const now = new Date();
    if (endDate > now) {
      return { data: false, error: null };
    }

    // Check if review already exists
    const { data: existingReview, error: reviewError } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', bookingId)
      .single();

    if (reviewError && reviewError.code !== 'PGRST116') {
      throw new Error(`Failed to check existing review: ${reviewError.message}`);
    }

    return { data: !existingReview, error: null };
  }
}

export type { Review, ReviewInsert, ReviewUpdate };
