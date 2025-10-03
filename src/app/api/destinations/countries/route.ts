import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const serverClient = createServerClient();
    
    const { data, error } = await (serverClient as any)
      .from('destinations')
      .select('country')
      .eq('is_published', true)
      .order('country');

    if (error) {
      console.error('Error fetching countries:', error);
      return NextResponse.json(
        { error: 'Failed to fetch countries' },
        { status: 500 }
      );
    }

    // Extract unique countries
    const countries = Array.from(new Set(data.map((item: any) => item.country)));
    
    return NextResponse.json({ data: countries });
  } catch (error) {
    console.error('Error in countries API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
