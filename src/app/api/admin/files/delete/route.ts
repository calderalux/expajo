import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkAdminAuth } from '@/lib/middleware/auth';

export async function DELETE(request: NextRequest) {
  try {
    const session = await checkAdminAuth(request);
    if (!session.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ 
        success: false, 
        error: 'File path is required' 
      }, { status: 400 });
    }

    // Delete file
    const { error } = await supabase.storage
      .from('images')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to delete file' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('File deletion error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
