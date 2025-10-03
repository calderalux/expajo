import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/services/auth';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types/auth';

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

// GET /api/admin/users - Get all users
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const role = searchParams.get('role') as UserRole | null;
    const search = searchParams.get('search');

    let query = supabase
      .from('profiles')
      .select(`
        *,
        app_roles (role, is_active)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (role) {
      query = query.eq('app_roles.role', role);
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Create new user
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
    const { email, full_name, role, is_admin } = body;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User with this email already exists',
        },
        { status: 400 }
      );
    }

    // Create user profile
    const { data: profile, error: profileError } = await (supabase as any)
      .from('profiles')
      .insert({
        email,
        full_name,
        is_admin: is_admin || false,
        admin_level: is_admin ? 2 : 0,
      })
      .select()
      .single();

    if (profileError) {
      throw new Error(`Failed to create profile: ${profileError.message}`);
    }

    // Assign role if provided
    if (role && profile) {
      const { error: roleError } = await (supabase as any)
        .from('app_roles')
        .insert({
          user_id: profile.id,
          role,
          created_by: authCheck.user?.id,
        });

      if (roleError) {
        console.error('Role assignment error:', roleError);
      }
    }

    return NextResponse.json({
      success: true,
      data: profile,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/users - Update user (expects id in request body)
export async function PUT(req: NextRequest) {
  try {
    const authCheck = await checkAdminAuth(req);
    if (!authCheck.success) {
      return NextResponse.json(
        { success: false, error: authCheck.error },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, full_name, is_admin, admin_level, role } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Update profile
    const { data: profile, error: profileError } = await (supabase as any)
      .from('profiles')
      .update({
        full_name,
        is_admin,
        admin_level,
      })
      .eq('id', id)
      .select()
      .single();

    if (profileError) {
      throw new Error(`Failed to update profile: ${profileError.message}`);
    }

    // Update role if provided
    if (role) {
      const { error: roleError } = await (supabase as any)
        .from('app_roles')
        .upsert({
          user_id: id,
          role,
          created_by: authCheck.user?.id,
        });

      if (roleError) {
        console.error('Role update error:', roleError);
      }
    }

    return NextResponse.json({
      success: true,
      data: profile,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update user',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users - Delete user (expects id in request body)
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
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Soft delete by updating is_admin to false
    const { error } = await (supabase as any)
      .from('profiles')
      .update({ is_admin: false, admin_level: 0 })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }

    // Deactivate roles
    await (supabase as any)
      .from('app_roles')
      .update({ is_active: false })
      .eq('user_id', id);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('User deletion error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete user',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
