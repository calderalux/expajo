import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { CacheService } from '@/lib/services/cache';
import { checkAdminAuth } from '@/lib/middleware/auth';
import { experienceCreateSchema } from '@/lib/validations/experiences';
import { parseImportFileServer } from '@/lib/utils/file-parser-server';

// Cache tags for experiences
const EXPERIENCE_CACHE_TAGS = {
  LIST: 'experiences:list',
  DETAIL: 'experiences:detail',
  SEARCH: 'experiences:search',
  FEATURED: 'experiences:featured',
  CATEGORY: 'experiences:category',
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
  importedExperiences: any[];
}

// POST /api/admin/experiences/import - Import experiences from file
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
    const importResult = await processExperiencesImport(
      rawData,
      authCheck.user?.id,
      options
    );

    // Invalidate cache after successful import
    if (importResult.successfulImports > 0) {
      await CacheService.invalidateByTags([
        EXPERIENCE_CACHE_TAGS.LIST, 
        EXPERIENCE_CACHE_TAGS.FEATURED, 
        EXPERIENCE_CACHE_TAGS.CATEGORY
      ]);
    }

    return NextResponse.json({
      success: true,
      data: importResult,
    });
  } catch (error: any) {
    console.error('Error importing experiences:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function processExperiencesImport(
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
    importedExperiences: [],
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
        const transformedData = transformExperienceData(rowData, options);
        const validationResult = experienceCreateSchema.safeParse(transformedData);
        
        if (!validationResult.success) {
          result.failedImports++;
          result.errors.push({
            row: rowIndex,
            message: `Validation failed: ${validationResult.error.errors.map(e => e.message).join(', ')}`,
            data: rowData,
          });
          continue;
        }

        // Check for duplicates (by title and location)
        const { data: existing } = await serverClient
          .from('experiences')
          .select('id')
          .eq('title', transformedData.title)
          .eq('location', transformedData.location)
          .single();

        if (existing) {
          if (options.skipDuplicates) {
            result.errors.push({
              row: rowIndex,
              message: `Skipped duplicate: ${transformedData.title}, ${transformedData.location}`,
              data: rowData,
            });
            continue;
          } else {
            result.failedImports++;
            result.errors.push({
              row: rowIndex,
              message: `Duplicate experience found: ${transformedData.title}, ${transformedData.location}`,
              data: rowData,
            });
            continue;
          }
        }

        // Insert the experience
        const insertData = {
          ...validationResult.data,
          created_by: userId,
        };
        
        const { data: newExperience, error: insertError } = await serverClient
          .from('experiences')
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
        result.importedExperiences.push(newExperience);
        
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

function transformExperienceData(rowData: any, options: any): any {
  // Handle different column naming conventions
  const fieldMappings = {
    title: ['title', 'name', 'experience_name', 'activity_name'],
    description: ['description', 'desc', 'summary', 'overview'],
    location: ['location', 'place', 'city', 'area'],
    price_per_person: ['price_per_person', 'price', 'cost', 'rate', 'amount'],
    duration_hours: ['duration_hours', 'duration', 'hours', 'length'],
    max_capacity: ['max_capacity', 'capacity', 'max_people', 'group_size'],
    category: ['category', 'type', 'experience_type', 'activity_type'],
    image_urls: ['image_urls', 'images', 'photos', 'gallery'],
    features: ['features', 'amenities', 'highlights', 'inclusions'],
    rating: ['rating', 'score', 'stars'],
    reviews_count: ['reviews_count', 'review_count', 'num_reviews'],
    is_featured: ['is_featured', 'featured', 'highlight', 'promoted'],
    is_active: ['is_active', 'active', 'published', 'status'],
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
  if (transformed.image_urls && typeof transformed.image_urls === 'string') {
    transformed.image_urls = transformed.image_urls
      .split(/[,;|]/)
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0);
  }

  if (transformed.features && typeof transformed.features === 'string') {
    transformed.features = transformed.features
      .split(/[,;|]/)
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0);
  }

  // Handle numeric fields
  if (transformed.price_per_person !== undefined) {
    transformed.price_per_person = parseFloat(transformed.price_per_person) || 0;
  }
  if (transformed.duration_hours !== undefined) {
    transformed.duration_hours = parseInt(transformed.duration_hours) || 1;
  }
  if (transformed.max_capacity !== undefined) {
    transformed.max_capacity = parseInt(transformed.max_capacity) || 1;
  }
  if (transformed.rating !== undefined) {
    transformed.rating = parseFloat(transformed.rating) || 0;
  }
  if (transformed.reviews_count !== undefined) {
    transformed.reviews_count = parseInt(transformed.reviews_count) || 0;
  }

  // Handle boolean fields
  if (transformed.is_featured !== undefined) {
    transformed.is_featured = Boolean(transformed.is_featured);
  }
  if (transformed.is_active !== undefined) {
    transformed.is_active = Boolean(transformed.is_active);
  }

  // Ensure required fields have defaults
  if (!transformed.title) {
    throw new Error('Title is required');
  }
  if (!transformed.location) {
    throw new Error('Location is required');
  }
  if (!transformed.category) {
    throw new Error('Category is required');
  }

  return transformed;
}
