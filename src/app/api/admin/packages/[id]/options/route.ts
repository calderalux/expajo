import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/middleware/auth';
import { PackageOptionMappingService } from '@/lib/services/package-option-mappings';
import { z } from 'zod';

// GET /api/admin/packages/[id]/options - Get option mappings for a package
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Package ID is required',
        },
        { status: 400 }
      );
    }

    const optionMappings =
      await PackageOptionMappingService.getPackageOptionMappings(id);

    return NextResponse.json({
      success: true,
      data: optionMappings,
    });
  } catch (error: any) {
    console.error('Error fetching package option mappings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/packages/[id]/options - Add option to package
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Package ID is required',
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Validate request body
    const addOptionSchema = z.object({
      option_id: z.string().min(1, 'Option ID is required'),
    });

    const validationResult = addOptionSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const optionMapping = await PackageOptionMappingService.addOptionToPackage(
      id,
      validationResult.data.option_id
    );

    return NextResponse.json({
      success: true,
      data: optionMapping,
      message: 'Option added to package successfully',
    });
  } catch (error: any) {
    console.error('Error adding option to package:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/packages/[id]/options - Remove option from package
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Package ID is required',
        },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const optionId = searchParams.get('option_id');

    if (!optionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Option ID is required',
        },
        { status: 400 }
      );
    }

    await PackageOptionMappingService.removeOptionFromPackage(id, optionId);

    return NextResponse.json({
      success: true,
      message: 'Option removed from package successfully',
    });
  } catch (error: any) {
    console.error('Error removing option from package:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/admin/packages/[id]/options - Sync package options (replace all)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Package ID is required',
        },
        { status: 400 }
      );
    }

    const body = await req.json();

    // Validate request body
    const syncOptionsSchema = z.object({
      option_ids: z.array(z.string()).default([]),
    });

    const validationResult = syncOptionsSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    await PackageOptionMappingService.syncPackageOptions(
      id,
      validationResult.data.option_ids
    );

    return NextResponse.json({
      success: true,
      message: 'Package options synced successfully',
    });
  } catch (error: any) {
    console.error('Error syncing package options:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
