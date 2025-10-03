import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { PackageService } from '@/lib/services/packages';
import { PackageCategory, CurrencyEnum } from '@/lib/supabase';
import { z } from 'zod';

// Validation schemas
const UpdatePackageSchema = z.object({
  destination_id: z.string().uuid().optional(),
  title: z.string().min(1).optional(),
  slug: z.string().optional(),
  summary: z.string().optional(),
  description: z.string().optional(),
  category: z.nativeEnum(PackageCategory).optional(),
  lead_partner_id: z.string().uuid().optional(),
  duration_days: z.number().positive().optional(),
  group_size_limit: z.number().positive().optional(),
  inclusions: z.any().optional(),
  exclusions: z.any().optional(),
  itinerary: z.any().optional(),
  base_price: z.number().positive().optional(),
  currency: z.nativeEnum(CurrencyEnum).optional(),
  discount_percent: z.number().min(0).max(100).optional(),
  featured: z.boolean().optional(),
  luxury_certified: z.boolean().optional(),
  availability: z.any().optional(),
  is_published: z.boolean().optional(),
});

// GET /api/admin/packages/[id] - Get single package (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Package ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await PackageService.getPackageById(id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error fetching package:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/packages/[id] - Update package (admin/staff only)
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
        { success: false, error: 'Package ID is required' },
        { status: 400 }
      );
    }

    // Validate request body
    const validatedData = UpdatePackageSchema.parse(body);

    const { data, error } = await PackageService.updatePackage(id, validatedData);

    if (error) {
      return NextResponse.json(
        { success: false, error: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Package updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating package:', error);
    
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

// DELETE /api/admin/packages/[id] - Delete package (super admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServerClient();
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Package ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await PackageService.deletePackage(id);

    if (error) {
      return NextResponse.json(
        { success: false, error: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Package deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting package:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
