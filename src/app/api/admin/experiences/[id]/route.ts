import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { ExperienceService } from '@/lib/services/experiences';
import { z } from 'zod';

// Validation schemas
const UpdateExperienceSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
  price_per_person: z.number().positive().optional(),
  duration_hours: z.number().positive().optional(),
  max_capacity: z.number().positive().optional(),
  category: z.string().min(1).optional(),
  image_urls: z.array(z.string().url()).optional(),
  features: z.array(z.string()).optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

// GET /api/admin/experiences/[id] - Get single experience (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Experience ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await ExperienceService.getExperienceById(id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Experience not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error fetching experience:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/experiences/[id] - Update experience (admin/staff only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Experience ID is required' },
        { status: 400 }
      );
    }

    // Validate request body
    const validatedData = UpdateExperienceSchema.parse(body);

    const { data, error } = await ExperienceService.updateExperience(id, validatedData);

    if (error) {
      return NextResponse.json(
        { success: false, error: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Experience updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating experience:', error);
    
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

// DELETE /api/admin/experiences/[id] - Delete experience (super admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Experience ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await ExperienceService.deleteExperience(id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Experience deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting experience:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
