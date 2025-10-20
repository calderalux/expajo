import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkAdminAuth } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await checkAdminAuth(request);
    if (!session.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || '';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const listFolders = searchParams.get('listFolders') === 'true';

    if (listFolders) {
      // List all folders in the bucket
      const { data: folders, error } = await supabase.storage
        .from('images')
        .list('', {
          limit: 1000,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        console.error('Error listing folders:', error);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to list folders' 
        }, { status: 500 });
      }

      // Filter only folders (items without file extensions)
      const folderList = folders
        .filter(item => !item.name.includes('.'))
        .map(item => ({
          name: item.name,
          path: item.name,
          created_at: item.created_at,
          updated_at: item.updated_at
        }));

      return NextResponse.json({
        success: true,
        data: folderList
      });
    }

    // List files in the specified folder
    const { data: files, error } = await supabase.storage
      .from('images')
      .list(folder, {
        limit,
        offset,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error('Error listing files:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to list files' 
      }, { status: 500 });
    }

    // Get public URLs for each file
    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const { data: urlData } = supabase.storage
          .from('images')
          .getPublicUrl(`${folder}/${file.name}`.replace(/^\//, ''));

        return {
          ...file,
          url: urlData.publicUrl,
          fullPath: `${folder}/${file.name}`.replace(/^\//, '')
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: filesWithUrls,
      pagination: {
        limit,
        offset,
        hasMore: files.length === limit
      }
    });

  } catch (error) {
    console.error('File listing error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await checkAdminAuth(request);
    if (!session.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || '';
    const fileName = formData.get('fileName') as string;

    if (!file) {
      return NextResponse.json({ 
        success: false, 
        error: 'No file provided' 
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid file type. Only images are allowed.' 
      }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        success: false, 
        error: 'File too large. Maximum size is 10MB.' 
      }, { status: 400 });
    }

    // Generate unique filename if not provided
    const finalFileName = fileName || `${Date.now()}-${file.name}`;
    const filePath = folder ? `${folder}/${finalFileName}` : finalFileName;

    // Upload file
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to upload file' 
      }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(data.path);

    return NextResponse.json({
      success: true,
      data: {
        path: data.path,
        url: urlData.publicUrl,
        name: finalFileName,
        size: file.size,
        type: file.type
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
