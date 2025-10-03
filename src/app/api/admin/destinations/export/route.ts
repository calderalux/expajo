import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { checkAdminAuth } from '@/lib/middleware/auth';

// POST /api/admin/destinations/export - Export destinations to CSV
export async function POST(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const body = await req.json();
    const { ids } = body;

    const serverClient = createServerClient();
    let query = serverClient.from('destinations').select('*');
    
    if (ids && Array.isArray(ids) && ids.length > 0) {
      query = query.in('id', ids);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch destinations' },
        { status: 500 }
      );
    }

    // Convert to CSV (excluding ID as it's auto-generated)
    const csvHeaders = [
      'Name',
      'Slug',
      'Description',
      'Country',
      'Country Code',
      'Region',
      'Image Cover URL',
      'Image Gallery',
      'Highlights',
      'Best Time to Visit',
      'Climate',
      'Language',
      'Currency',
      'Featured',
      'Published',
      'Created At',
      'Updated At'
    ];

    const csvRows = (data as any)?.map((dest: any) => [
      dest.name,
      dest.slug || '',
      dest.description || '',
      dest.country,
      dest.country_code || '',
      dest.region || '',
      dest.image_cover_url || '',
      dest.image_gallery ? JSON.stringify(dest.image_gallery) : '',
      dest.highlights ? JSON.stringify(dest.highlights) : '',
      dest.best_time_to_visit || '',
      dest.climate || '',
      dest.language || '',
      dest.currency || '',
      dest.featured ? 'Yes' : 'No',
      dest.is_published ? 'Yes' : 'No',
      dest.created_at,
      dest.updated_at
    ]) || [];

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row: any) => row.map((field: any) => `"${field}"`).join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="destinations-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
