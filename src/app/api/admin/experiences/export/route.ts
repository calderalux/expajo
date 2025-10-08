import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { checkAdminAuth } from '@/lib/middleware/auth';

// GET /api/admin/experiences/export - Export experiences to CSV
export async function GET(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const isActive = searchParams.get('is_active');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '1000');

    const serverClient = createServerClient();
    let query = serverClient
      .from('experiences')
      .select('*')
      .limit(limit);

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
    }
    if (category && category !== 'All Categories') {
      query = query.eq('category', category);
    }
    if (isActive !== null && isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true');
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data: experiences, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch experiences: ${error.message}`);
    }

    // Convert to CSV
    const csvHeaders = [
      'id',
      'title',
      'description',
      'location',
      'price_per_person',
      'rating',
      'reviews_count',
      'duration_hours',
      'max_capacity',
      'category',
      'image_urls',
      'features',
      'is_featured',
      'is_active',
      'created_at',
      'updated_at',
    ];

    const csvRows = [
      csvHeaders.join(','),
      ...(experiences || []).map((exp: any) => [
        exp.id,
        `"${exp.title?.replace(/"/g, '""') || ''}"`,
        `"${exp.description?.replace(/"/g, '""') || ''}"`,
        `"${exp.location?.replace(/"/g, '""') || ''}"`,
        exp.price_per_person || 0,
        exp.rating || 0,
        exp.reviews_count || 0,
        exp.duration_hours || 0,
        exp.max_capacity || 0,
        `"${exp.category?.replace(/"/g, '""') || ''}"`,
        `"${(exp.image_urls || []).join(';')}"`,
        `"${(exp.features || []).join(';')}"`,
        exp.is_featured ? 'true' : 'false',
        exp.is_active ? 'true' : 'false',
        exp.created_at || '',
        exp.updated_at || '',
      ].join(',')),
    ];

    const csvContent = csvRows.join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="experiences_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting experiences:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
