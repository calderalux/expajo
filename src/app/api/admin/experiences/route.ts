import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { ExperienceService } from '@/lib/services/experiences';
import { z } from 'zod';

// Validation schemas
const CreateExperienceSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  price_per_person: z.number().positive('Price must be positive'),
  duration_hours: z.number().positive('Duration must be positive'),
  max_capacity: z.number().positive('Max capacity must be positive'),
  category: z.string().min(1, 'Category is required'),
  image_urls: z.array(z.string().url()).optional().default([]),
  features: z.array(z.string()).optional().default([]),
  is_featured: z.boolean().optional().default(false),
  is_active: z.boolean().optional().default(true),
});

const UpdateExperienceSchema = CreateExperienceSchema.partial();

// GET /api/admin/experiences - List all experiences (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category') || undefined;
    const location = searchParams.get('location') || undefined;
    const isActive = searchParams.get('is_active') === 'true' ? true : 
                    searchParams.get('is_active') === 'false' ? false : undefined;
    const isFeatured = searchParams.get('is_featured') === 'true' ? true : 
                       searchParams.get('is_featured') === 'false' ? false : undefined;
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    const filters = {
      category,
      location,
      isActive,
      isFeatured,
    };

    const sort = {
      field: sortBy as 'created_at' | 'rating' | 'price_per_person' | 'title',
      order: sortOrder as 'asc' | 'desc',
    };

    const { data, error } = await ExperienceService.getExperiencesForAdmin(filters, sort, limit);

    if (error) {
      return NextResponse.json(
        { success: false, error: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: data?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching experiences:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/experiences - Create new experience (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const body = await request.json();

    // Validate request body
    const validatedData = CreateExperienceSchema.parse(body);

    const { data, error } = await ExperienceService.createExperience(validatedData);

    if (error) {
      return NextResponse.json(
        { success: false, error: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Experience created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating experience:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
