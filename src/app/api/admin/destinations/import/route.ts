import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { CacheService } from '@/lib/services/cache';
import { checkAdminAuth } from '@/lib/middleware/auth';
import { createDestinationSchema } from '@/lib/validations/destinations';
import { parseImportFileServer } from '@/lib/utils/file-parser-server';
import { generateSlug } from '@/lib/validations/destinations';

// Cache tags for destinations
const DESTINATION_CACHE_TAGS = {
  LIST: 'destinations:list',
  DETAIL: 'destinations:detail',
  SEARCH: 'destinations:search',
  FEATURED: 'destinations:featured',
  COUNTRY: 'destinations:country',
};

interface ImportResult {
  success: boolean;
  totalRows: number;
  processedRows: number;
  successfulImports: number;
  failedImports: number;
  errors: Array<{
    row: number;
    field?: string;
    message: string;
    data?: any;
  }>;
  importedDestinations: any[];
}

// POST /api/admin/destinations/import - Import destinations from file
export async function POST(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(authCheck, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('fileType') as string;
    const options = JSON.parse(formData.get('options') as string || '{}');

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['json', 'csv', 'xlsx'];
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Supported formats: JSON, CSV, XLSX' },
        { status: 400 }
      );
    }

    // Parse the file
    const parseResult = await parseImportFileServer(file, fileType);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error },
        { status: 400 }
      );
    }

    const rawData = parseResult.data;
    if (!Array.isArray(rawData) || rawData.length === 0) {
      return NextResponse.json(
        { success: false, error: 'File contains no valid data or is not an array' },
        { status: 400 }
      );
    }

    // Process the data
    const importResult = await processDestinationsImport(
      rawData,
      authCheck.user?.id,
      options
    );

    // Invalidate cache after successful import
    if (importResult.successfulImports > 0) {
      await CacheService.invalidateByTags([DESTINATION_CACHE_TAGS.LIST, DESTINATION_CACHE_TAGS.FEATURED, DESTINATION_CACHE_TAGS.COUNTRY]);
    }

    return NextResponse.json({
      success: true,
      data: importResult,
    });
  } catch (error: any) {
    console.error('Error importing destinations:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function processDestinationsImport(
  rawData: any[],
  userId: string,
  options: any
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    totalRows: rawData.length,
    processedRows: 0,
    successfulImports: 0,
    failedImports: 0,
    errors: [],
    importedDestinations: [],
  };

  const serverClient = createServerClient();
  const batchSize = 10; // Process in batches to avoid overwhelming the database

  for (let i = 0; i < rawData.length; i += batchSize) {
    const batch = rawData.slice(i, i + batchSize);
    
    for (let j = 0; j < batch.length; j++) {
      const rowIndex = i + j + 1; // 1-based row numbering
      const rowData = batch[j];
      
      try {
        result.processedRows++;
        
        // Transform and validate the data
        const transformedData = transformDestinationData(rowData, options);
        const validationResult = createDestinationSchema.safeParse(transformedData);
        
        if (!validationResult.success) {
          result.failedImports++;
          result.errors.push({
            row: rowIndex,
            message: `Validation failed: ${validationResult.error.errors.map(e => e.message).join(', ')}`,
            data: rowData,
          });
          continue;
        }

        // Check for duplicates (by name and country)
        const { data: existing } = await serverClient
          .from('destinations')
          .select('id')
          .eq('name', transformedData.name)
          .eq('country', transformedData.country)
          .single();

        if (existing) {
          if (options.skipDuplicates) {
            result.errors.push({
              row: rowIndex,
              message: `Skipped duplicate: ${transformedData.name}, ${transformedData.country}`,
              data: rowData,
            });
            continue;
          } else {
            result.failedImports++;
            result.errors.push({
              row: rowIndex,
              message: `Duplicate destination found: ${transformedData.name}, ${transformedData.country}`,
              data: rowData,
            });
            continue;
          }
        }

        // Insert the destination
        const insertData = {
          ...validationResult.data,
          slug: generateSlug(transformedData.name),
          created_by: userId,
        };
        
        const { data: newDestination, error: insertError } = await serverClient
          .from('destinations')
          .insert(insertData as any)
          .select()
          .single();

        if (insertError) {
          result.failedImports++;
          result.errors.push({
            row: rowIndex,
            message: `Database error: ${insertError.message}`,
            data: rowData,
          });
          continue;
        }

        result.successfulImports++;
        result.importedDestinations.push(newDestination);
        
      } catch (error: any) {
        result.failedImports++;
        result.errors.push({
          row: rowIndex,
          message: `Processing error: ${error.message}`,
          data: rowData,
        });
      }
    }
  }

  return result;
}

function transformDestinationData(rowData: any, options: any): any {
  // Handle different column naming conventions
  const fieldMappings = {
    name: ['name', 'title', 'destination_name', 'location_name'],
    description: ['description', 'desc', 'summary', 'overview'],
    country: ['country', 'nation', 'country_name'],
    country_code: ['country_code', 'countryCode', 'iso_code', 'iso'],
    region: ['region', 'state', 'province', 'area'],
    image_cover_url: ['image_cover_url', 'imageUrl', 'cover_image', 'main_image', 'image'],
    best_time_to_visit: ['best_time_to_visit', 'bestTime', 'season', 'when_to_visit'],
    climate: ['climate', 'weather', 'temperature'],
    language: ['language', 'languages', 'spoken_language'],
    currency: ['currency', 'money', 'currency_code'],
    featured: ['featured', 'is_featured', 'highlight', 'promoted'],
    is_published: ['is_published', 'published', 'active', 'status'],
    highlights: ['highlights', 'attractions', 'features', 'key_points'],
    image_gallery: ['image_gallery', 'gallery', 'images', 'photo_gallery'],
  };

  const transformed: any = {};

  // Map fields based on available mappings
  Object.entries(fieldMappings).forEach(([targetField, possibleFields]) => {
    for (const field of possibleFields) {
      if (rowData[field] !== undefined && rowData[field] !== null && rowData[field] !== '') {
        transformed[targetField] = rowData[field];
        break;
      }
    }
  });

  // Apply default values from options
  if (options.defaultValues) {
    Object.entries(options.defaultValues).forEach(([key, value]) => {
      if (transformed[key] === undefined || transformed[key] === null || transformed[key] === '') {
        transformed[key] = value;
      }
    });
  }

  // Handle array fields
  if (transformed.highlights && typeof transformed.highlights === 'string') {
    transformed.highlights = transformed.highlights
      .split(/[,;|]/)
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0);
  }

  if (transformed.image_gallery && typeof transformed.image_gallery === 'string') {
    transformed.image_gallery = transformed.image_gallery
      .split(/[,;|]/)
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0);
  }

  // Handle boolean fields
  if (transformed.featured !== undefined) {
    transformed.featured = Boolean(transformed.featured);
  }
  if (transformed.is_published !== undefined) {
    transformed.is_published = Boolean(transformed.is_published);
  }

  // Ensure required fields have defaults
  if (!transformed.name) {
    throw new Error('Name is required');
  }
  if (!transformed.country) {
    throw new Error('Country is required');
  }

  return transformed;
}