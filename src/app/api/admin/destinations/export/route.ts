import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { checkAdminAuth } from '@/lib/middleware/auth';

// GET /api/admin/destinations/export - Export destinations to CSV
export async function GET(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    const country = searchParams.get('country');
    const isPublished = searchParams.get('is_published');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '1000');

    const serverClient = createServerClient();
    let query = serverClient
      .from('destinations')
      .select('*')
      .limit(limit);

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,region.ilike.%${search}%`);
    }
    if (country) {
      query = query.eq('country', country);
    }
    if (isPublished !== null && isPublished !== undefined) {
      query = query.eq('is_published', isPublished === 'true');
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data: destinations, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch destinations: ${error.message}`);
    }

    // Convert to CSV
    const csvHeaders = [
      'id',
      'name',
      'slug',
      'description',
      'country',
      'country_code',
      'region',
      'image_cover_url',
      'image_gallery',
      'avg_rating',
      'review_count',
      'package_count',
      'featured',
      'is_published',
      'highlights',
      'best_time_to_visit',
      'climate',
      'language',
      'currency',
      'created_at',
      'updated_at',
    ];

    const csvRows = [
      csvHeaders.join(','),
      ...(destinations || []).map((dest: any) => [
        dest.id,
        `"${dest.name?.replace(/"/g, '""') || ''}"`,
        `"${dest.slug?.replace(/"/g, '""') || ''}"`,
        `"${dest.description?.replace(/"/g, '""') || ''}"`,
        `"${dest.country?.replace(/"/g, '""') || ''}"`,
        `"${dest.country_code?.replace(/"/g, '""') || ''}"`,
        `"${dest.region?.replace(/"/g, '""') || ''}"`,
        `"${dest.image_cover_url?.replace(/"/g, '""') || ''}"`,
        `"${(dest.image_gallery || []).join(';')}"`,
        dest.avg_rating || 0,
        dest.review_count || 0,
        dest.package_count || 0,
        dest.featured ? 'true' : 'false',
        dest.is_published ? 'true' : 'false',
        `"${(dest.highlights || []).join(';')}"`,
        `"${dest.best_time_to_visit?.replace(/"/g, '""') || ''}"`,
        `"${dest.climate?.replace(/"/g, '""') || ''}"`,
        `"${dest.language?.replace(/"/g, '""') || ''}"`,
        `"${dest.currency?.replace(/"/g, '""') || ''}"`,
        dest.created_at || '',
        dest.updated_at || '',
      ].join(',')),
    ];

    const csvContent = csvRows.join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="destinations_export_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting destinations:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}