'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLoginForm } from './AdminLoginForm';
import { AdminProfile } from '@/types/auth';

// Auth Context for providing user data throughout the app
interface AuthContextType {
  user: AdminProfile | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthGuard');
  }
  return context;
}

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  fallback, 
  redirectTo = '/admin/login' 
}: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      
      if (!sessionToken) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/admin/auth/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionToken }),
      });

      const data = await response.json();
      
      if (data.success && data.user) {
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        localStorage.removeItem('admin_session_token');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('admin_session_token');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (user: AdminProfile) => {
    setIsAuthenticated(true);
    setUser(user);
    // Store session token (you might want to get this from the login response)
    // localStorage.setItem('admin_session_token', sessionToken);
  };

  const handleLogout = async () => {
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      if (sessionToken) {
        await fetch('/api/admin/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionToken }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('admin_session_token');
      setIsAuthenticated(false);
      setUser(null);
      router.push(redirectTo);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <AdminLoginForm onSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}


// Permission hook
export function usePermission(resource: string, action: string) {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHasPermission(false);
      setLoading(false);
      return;
    }

    // Check if user has the permission
    const checkPermission = async () => {
      try {
        const response = await fetch('/api/admin/auth/permission', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id, resource, action }),
        });

        const data = await response.json();
        setHasPermission(data.success ? data.hasPermission : false);
      } catch (error) {
        console.error('Permission check error:', error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [user, resource, action]);

  return { hasPermission, loading };
}

// Role level hook
export function useRoleLevel() {
  const { user } = useAuth();
  const [roleLevel, setRoleLevel] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoleLevel(0);
      setLoading(false);
      return;
    }

    const checkRoleLevel = async () => {
      try {
        const response = await fetch('/api/admin/auth/role-level', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });

        const data = await response.json();
        setRoleLevel(data.success ? data.roleLevel : 0);
      } catch (error) {
        console.error('Role level check error:', error);
        setRoleLevel(0);
      } finally {
        setLoading(false);
      }
    };

    checkRoleLevel();
  }, [user]);

  return { roleLevel, loading };
}
