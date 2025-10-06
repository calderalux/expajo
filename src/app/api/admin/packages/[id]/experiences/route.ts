import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/middleware/auth';
import { PackageExperienceService } from '@/lib/services/package-experiences';
import { z } from 'zod';

// GET /api/admin/packages/[id]/experiences - Get experiences for a package
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const packageId = params.id;
    if (!packageId) {
      return NextResponse.json({
        success: false,
        error: 'Package ID is required',
      }, { status: 400 });
    }

    const experiences = await PackageExperienceService.getPackageExperiences(packageId);

    return NextResponse.json({
      success: true,
      data: experiences,
    });
  } catch (error: any) {
    console.error('Error fetching package experiences:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/packages/[id]/experiences - Add experience to package
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const packageId = params.id;
    if (!packageId) {
      return NextResponse.json({
        success: false,
        error: 'Package ID is required',
      }, { status: 400 });
    }

    const body = await req.json();
    
    // Validate request body
    const addExperienceSchema = z.object({
      experience_id: z.string().min(1, 'Experience ID is required'),
      is_optional: z.boolean().optional().default(false),
      is_included_in_price: z.boolean().optional().default(true),
      sort_order: z.number().int().min(0).optional().default(0),
    });

    const validationResult = addExperienceSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors,
      }, { status: 400 });
    }

    const packageExperience = await PackageExperienceService.addExperienceToPackage(
      packageId,
      validationResult.data.experience_id,
      {
        is_optional: validationResult.data.is_optional,
        is_included_in_price: validationResult.data.is_included_in_price,
        sort_order: validationResult.data.sort_order,
      }
    );

    return NextResponse.json({
      success: true,
      data: packageExperience,
      message: 'Experience added to package successfully',
    });
  } catch (error: any) {
    console.error('Error adding experience to package:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/packages/[id]/experiences - Remove experience from package
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const packageId = params.id;
    if (!packageId) {
      return NextResponse.json({
        success: false,
        error: 'Package ID is required',
      }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const experienceId = searchParams.get('experience_id');
    
    if (!experienceId) {
      return NextResponse.json({
        success: false,
        error: 'Experience ID is required',
      }, { status: 400 });
    }

    await PackageExperienceService.removeExperienceFromPackage(packageId, experienceId);

    return NextResponse.json({
      success: true,
      message: 'Experience removed from package successfully',
    });
  } catch (error: any) {
    console.error('Error removing experience from package:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/packages/[id]/experiences - Update package experience
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const packageId = params.id;
    if (!packageId) {
      return NextResponse.json({
        success: false,
        error: 'Package ID is required',
      }, { status: 400 });
    }

    const body = await req.json();
    
    // Validate request body
    const updateExperienceSchema = z.object({
      experience_id: z.string().min(1, 'Experience ID is required'),
      is_optional: z.boolean().optional(),
      is_included_in_price: z.boolean().optional(),
      sort_order: z.number().int().min(0).optional(),
    });

    const validationResult = updateExperienceSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        details: validationResult.error.errors,
      }, { status: 400 });
    }

    const packageExperience = await PackageExperienceService.updatePackageExperience(
      packageId,
      validationResult.data.experience_id,
      {
        is_optional: validationResult.data.is_optional,
        is_included_in_price: validationResult.data.is_included_in_price,
        sort_order: validationResult.data.sort_order,
      }
    );

    return NextResponse.json({
      success: true,
      data: packageExperience,
      message: 'Package experience updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating package experience:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
