import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { checkAdminAuth } from '@/lib/middleware/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await checkAdminAuth(request);
    if (!session.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Get storage statistics using the RPC function
    const { data: stats, error } = await supabase.rpc('get_storage_stats');
    
    if (error) {
      console.error('Error getting storage stats:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to get storage statistics' 
      }, { status: 500 });
    }

    const statsData = (stats[0] as any) || {
      total_files: 0,
      total_size: 0,
      files_by_folder: {} as Record<string, number>,
      files_by_type: {} as Record<string, number>
    };

    // Format the data for better display
    const formattedStats = {
      total_files: statsData.total_files as number,
      total_size: statsData.total_size as number,
      files_by_folder: statsData.files_by_folder as Record<string, number>,
      files_by_type: statsData.files_by_type as Record<string, number>,
      formatted_size: formatBytes(statsData.total_size),
      folder_breakdown: Object.entries(statsData.files_by_folder || {}).map(([folder, count]) => ({
        folder: folder || 'Root',
        count: count as number
      })),
      type_breakdown: Object.entries(statsData.files_by_type || {}).map(([type, count]) => ({
        type,
        count: count as number
      }))
    };

    return NextResponse.json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error('Storage stats error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
