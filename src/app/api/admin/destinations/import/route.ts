import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { CacheService } from '@/lib/services/cache';
import { checkAdminAuth } from '@/lib/middleware/auth';
import { createDestinationSchema } from '@/lib/validations/destinations';

// Auto-generate slug from name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

// Cache tags for destinations
const DESTINATION_CACHE_TAGS = {
  LIST: 'destinations:list',
  DETAIL: 'destinations:detail',
  SEARCH: 'destinations:search',
  FEATURED: 'destinations:featured',
  COUNTRY: 'destinations:country',
};

// POST /api/admin/destinations/import - Import destinations from CSV/JSON
export async function POST(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileContent = await file.text();
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    let destinations: any[] = [];

    if (fileExtension === 'csv') {
      // Parse CSV
      const lines = fileContent.split('\n');
      const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
      
      destinations = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.replace(/"/g, '').trim());
          const destination: any = {};
          
          headers.forEach((header, index) => {
            const value = values[index] || '';
            
            switch (header.toLowerCase()) {
              case 'id':
                // Skip ID field as it's auto-generated
                break;
              case 'name':
                destination.name = value;
                break;
              case 'slug':
                destination.slug = value;
                break;
              case 'description':
                destination.description = value;
                break;
              case 'country':
                destination.country = value;
                break;
              case 'country code':
                destination.country_code = value;
                break;
              case 'region':
                destination.region = value;
                break;
              case 'image cover url':
                destination.image_cover_url = value;
                break;
              case 'image gallery':
                try {
                  destination.image_gallery = value ? JSON.parse(value) : [];
                } catch {
                  destination.image_gallery = [];
                }
                break;
              case 'highlights':
                try {
                  destination.highlights = value ? JSON.parse(value) : [];
                } catch {
                  destination.highlights = [];
                }
                break;
              case 'best time to visit':
                destination.best_time_to_visit = value;
                break;
              case 'climate':
                destination.climate = value;
                break;
              case 'language':
                destination.language = value;
                break;
              case 'currency':
                destination.currency = value;
                break;
              case 'featured':
                destination.featured = value.toLowerCase() === 'yes';
                break;
              case 'published':
                destination.is_published = value.toLowerCase() === 'yes';
                break;
            }
          });
          
          return destination;
        });
    } else if (fileExtension === 'json') {
      // Parse JSON and remove id fields
      const rawDestinations = JSON.parse(fileContent);
      destinations = rawDestinations.map((dest: any) => {
        const { id, ...destinationData } = dest;
        return destinationData;
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported file format. Please use CSV or JSON.' },
        { status: 400 }
      );
    }

    if (destinations.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No destinations found in file' },
        { status: 400 }
      );
    }

    const serverClient = createServerClient();
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each destination
    for (let i = 0; i < destinations.length; i++) {
      try {
        const destination = destinations[i];
        
        // Validate destination data
        const validation = createDestinationSchema.safeParse(destination);
        if (!validation.success) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: ${validation.error.errors.map(e => e.message).join(', ')}`);
          continue;
        }

        // Auto-generate slug if not provided
        const destinationData = {
          ...validation.data,
          slug: validation.data.slug || generateSlug(validation.data.name),
        };

        // Insert destination (id is auto-generated, so we don't include it)
        const { data: insertData, error } = await serverClient
          .from('destinations')
          .insert(destinationData as any)
          .select();

        if (error) {
          console.error(`Database error for destination ${i + 1}:`, error.message);
          results.failed++;
          results.errors.push(`Row ${i + 1}: ${error.message}`);
        } else {
          results.success++;
        }
      } catch (err: any) {
        console.error(`Exception for destination ${i + 1}:`, err.message);
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${err.message}`);
      }
    }

    // Invalidate destination caches
    await CacheService.invalidateByTags([
      DESTINATION_CACHE_TAGS.LIST,
      DESTINATION_CACHE_TAGS.SEARCH,
      DESTINATION_CACHE_TAGS.FEATURED,
      DESTINATION_CACHE_TAGS.COUNTRY,
    ]);

    return NextResponse.json({
      success: true,
      message: `Import completed: ${results.success} successful, ${results.failed} failed`,
      results,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
