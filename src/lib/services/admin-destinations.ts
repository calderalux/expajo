import { Database } from '@/types/database';

type Destination = Database['public']['Tables']['destinations']['Row'];
type DestinationInsert = Database['public']['Tables']['destinations']['Insert'];
type DestinationUpdate = Database['public']['Tables']['destinations']['Update'];

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

interface FilterParams {
  search?: string;
  country?: string;
  region?: string;
  status?: string;
  featured?: boolean;
  currency?: string;
}

export class AdminDestinationService {
  private static getAuthHeaders() {
    const sessionToken = localStorage.getItem('admin_session_token');
    return {
      'Authorization': `Bearer ${sessionToken}`,
      'Content-Type': 'application/json',
    };
  }

  // Get destinations with filters and pagination
  static async getDestinations(
    filters: FilterParams = {},
    pagination: PaginationParams = {}
  ): Promise<ApiResponse<{ destinations: Destination[]; total: number; page: number; limit: number }>> {
    try {
      const params = new URLSearchParams();
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.set(key, String(value));
        }
      });
      
      // Add pagination
      if (pagination.page) params.set('page', String(pagination.page));
      if (pagination.limit) params.set('limit', String(pagination.limit));
      if (pagination.sort_by) params.set('sort_by', pagination.sort_by);
      if (pagination.sort_order) params.set('sort_order', pagination.sort_order);

      const response = await fetch(`/api/admin/destinations?${params.toString()}`, {
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching destinations:', error);
      return { success: false, error: 'Failed to fetch destinations' };
    }
  }

  // Get single destination
  static async getDestination(id: string): Promise<ApiResponse<Destination>> {
    try {
      const response = await fetch(`/api/admin/destinations/${id}`, {
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching destination:', error);
      return { success: false, error: 'Failed to fetch destination' };
    }
  }

  // Create destination
  static async createDestination(destination: DestinationInsert): Promise<ApiResponse<Destination>> {
    try {
      const response = await fetch('/api/admin/destinations', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(destination),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating destination:', error);
      return { success: false, error: 'Failed to create destination' };
    }
  }

  // Update destination
  static async updateDestination(id: string, updates: DestinationUpdate): Promise<ApiResponse<Destination>> {
    try {
      const response = await fetch(`/api/admin/destinations/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating destination:', error);
      return { success: false, error: 'Failed to update destination' };
    }
  }

  // Delete destination
  static async deleteDestination(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`/api/admin/destinations/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting destination:', error);
      return { success: false, error: 'Failed to delete destination' };
    }
  }

  // Bulk operations
  static async bulkUpdate(ids: string[], updates: Partial<DestinationUpdate>): Promise<ApiResponse<Destination[]>> {
    try {
      const response = await fetch('/api/admin/destinations/bulk', {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ ids, updates }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error bulk updating destinations:', error);
      return { success: false, error: 'Failed to bulk update destinations' };
    }
  }

  static async bulkDelete(ids: string[]): Promise<ApiResponse<Destination[]>> {
    try {
      const response = await fetch('/api/admin/destinations/bulk', {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ ids }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error bulk deleting destinations:', error);
      return { success: false, error: 'Failed to bulk delete destinations' };
    }
  }

  // Import/Export
  static async importDestinations(file: File): Promise<ApiResponse<{ success: number; failed: number; errors: string[] }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch('/api/admin/destinations/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: formData,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error importing destinations:', error);
      return { success: false, error: 'Failed to import destinations' };
    }
  }

  static async exportDestinations(ids?: string[]): Promise<ApiResponse<Blob>> {
    try {
      const response = await fetch('/api/admin/destinations/export', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ ids }),
      });

      if (response.ok) {
        const blob = await response.blob();
        return { success: true, data: blob };
      } else {
        const error = await response.json();
        return { success: false, error: error.error || 'Export failed' };
      }
    } catch (error) {
      console.error('Error exporting destinations:', error);
      return { success: false, error: 'Failed to export destinations' };
    }
  }
}
