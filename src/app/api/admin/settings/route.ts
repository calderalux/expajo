import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth';
import { supabase } from '@/lib/supabase';

// Middleware to check admin authentication
async function checkAdminAuth(req: NextRequest) {
  const sessionToken = req.cookies.get('admin_session_token')?.value;
  
  if (!sessionToken) {
    return { success: false, error: 'No session token found' };
  }

  const response = await AuthService.validateSession(sessionToken);
  
  if (!response.success || !response.user) {
    return { success: false, error: 'Invalid session' };
  }

  return { success: true, user: response.user };
}

// GET /api/admin/settings - Get admin settings
export async function GET(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const isPublic = searchParams.get('public') === 'true';

    let query = supabase
      .from('admin_settings')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true });

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (isPublic) {
      query = query.eq('is_public', true);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch settings: ${error.message}`);
    }

    // Group settings by category
    const groupedSettings = (data as any)?.reduce((acc: any, setting: any) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push(setting);
      return acc;
    }, {} as Record<string, any[]>) || {};

    return NextResponse.json({
      success: true,
      data: groupedSettings,
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch settings',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/settings - Create or update setting
export async function POST(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { key, value, description, category, is_public } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Key and value are required',
        },
        { status: 400 }
      );
    }

    const { data: setting, error } = await (supabase as any)
      .from('admin_settings')
      .upsert({
        key,
        value,
        description,
        category: category || 'general',
        is_public: is_public || false,
        updated_by: authCheck.user?.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save setting: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: setting,
      message: 'Setting saved successfully',
    });
  } catch (error) {
    console.error('Setting save error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save setting',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/settings - Delete setting (expects key in request body)
export async function DELETE(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { key } = body;

    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Setting key is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('admin_settings')
      .delete()
      .eq('key', key);

    if (error) {
      throw new Error(`Failed to delete setting: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Setting deleted successfully',
    });
  } catch (error) {
    console.error('Setting deletion error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete setting',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
