import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
// Import commented out for auto-login bypass
// import { signInWithEmail, signOut, getCurrentUser } from '../lib/supabase';

interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  userId: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean, message?: string }>;
  logout: () => Promise<{ success: boolean, message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auto-authenticate for development/demo purposes
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string | null>('admin@example.com');
  const [userId, setUserId] = useState<string | null>('auto-login-user');

  useEffect(() => {
    // Auto-login for development/demo purposes
    // No need to check session with Supabase
    console.log('Auto-login enabled: Bypassing authentication for development');
    
    // Uncomment the below code when you want to re-enable normal authentication
    /*
    // Cek status login dari Supabase saat aplikasi dimuat
    const checkSession = async () => {
      const { user, error } = await getCurrentUser();
      
      if (user && !error) {
        setIsAuthenticated(true);
        setUserEmail(user.email || null);
        setUserId(user.id);
      }
    };
    
    checkSession();
    */
    
    // Setup listener untuk perubahan auth state
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
          setUserEmail(session.user.email || null);
          setUserId(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          setUserEmail(null);
          setUserId(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Auto-login for development/demo purposes
      console.log('Auto-login: Using mock login function');
      
      // Always succeed with any credentials for development
      setIsAuthenticated(true);
      setUserEmail(email);
      setUserId('auto-login-user');
      
      return { success: true };
      
      /* Uncomment when you want to re-enable normal authentication
      // Untuk demo, kita tetap menggunakan password '123'
      if (password !== '123') {
        return { success: false, message: 'Password salah' };
      }
      
      // Coba login dengan Supabase
      const { data, error } = await signInWithEmail(email, password);
      
      if (error) {
        console.error('Login error:', error.message);
        return { success: false, message: error.message };
      }
      
      if (data.user) {
        setIsAuthenticated(true);
        setUserEmail(data.user.email || null);
        setUserId(data.user.id);
        return { success: true };
      } else {
        return { success: false, message: 'Login gagal' };
      }
      */
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'Terjadi kesalahan saat login' };
    }
  };

  const logout = async () => {
    try {
      // Auto-login for development/demo purposes
      console.log('Auto-login: Using mock logout function');
      
      // Just reset state without calling Supabase
      setIsAuthenticated(false);
      setUserEmail(null);
      setUserId(null);
      
      return { success: true };
      
      /* Uncomment when you want to re-enable normal authentication
      const { error } = await signOut();
      
      if (error) {
        console.error('Logout error:', error.message);
        return { success: false, message: error.message };
      }
      
      setIsAuthenticated(false);
      setUserEmail(null);
      setUserId(null);
      return { success: true };
      */
    } catch (err) {
      console.error('Logout error:', err);
      return { success: false, message: 'Terjadi kesalahan saat logout' };
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
