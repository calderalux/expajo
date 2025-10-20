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
    const getStats = searchParams.get('stats') === 'true';

    if (getStats) {
      // Get storage statistics
      const { data: stats, error } = await supabase.rpc('get_storage_stats');
      
      if (error) {
        console.error('Error getting storage stats:', error);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to get storage statistics' 
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        data: stats[0] || {
          total_files: 0,
          total_size: 0,
          files_by_folder: {},
          files_by_type: {}
        }
      });
    }

    // Get user's role level for permission checking
    const { data: userRole, error: roleError } = await supabase.rpc('get_user_role_level');
    
    if (roleError) {
      console.error('Error getting user role:', roleError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to verify user permissions' 
      }, { status: 500 });
    }

    const roleLevel = userRole || 0;

    // Check if user has permission to access files
    if (roleLevel < 1) {
      return NextResponse.json({ 
        success: false, 
        error: 'Insufficient permissions' 
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: {
        roleLevel,
        permissions: {
          canView: roleLevel >= 1,
          canUpload: roleLevel >= 1,
          canDelete: roleLevel >= 2,
          canManageAll: roleLevel >= 3
        }
      }
    });

  } catch (error) {
    console.error('Storage permissions error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
