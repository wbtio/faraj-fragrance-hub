import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

interface User {
  id: string;
  username: string;
  phone: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  register: (username: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Separate component that requires router context
const AuthContextProviderContent = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkUserSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Get user details from Supabase
          const { data: { user: supabaseUser } } = await supabase.auth.getUser();
          if (supabaseUser) {
            // Try to fetch additional user details from users table
            try {
              const { data: userDetails, error } = await supabase
                .from('users')
                .select('username, phone')
                .eq('id', supabaseUser.id)
                .single();
              
              if (userDetails && !error) {
                setUser({
                  id: supabaseUser.id,
                  username: userDetails.username,
                  phone: userDetails.phone,
                  email: supabaseUser.email || undefined
                });
                setIsAuthenticated(true);
              } else {
                // Fallback to session user data
                setUser({
                  id: supabaseUser.id,
                  username: supabaseUser.user_metadata?.username || 'مستخدم',
                  phone: supabaseUser.user_metadata?.phone || '',
                  email: supabaseUser.email || undefined
                });
                setIsAuthenticated(true);
              }
            } catch (error) {
              // Fallback to session user data
              setUser({
                id: supabaseUser.id,
                username: supabaseUser.user_metadata?.username || 'مستخدم',
                phone: supabaseUser.user_metadata?.phone || '',
                email: supabaseUser.email || undefined
              });
              setIsAuthenticated(true);
            }
          }
        }
      } catch (error) {
        console.error('Error checking user session:', error);
      }
    };

    checkUserSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // User is signed in
        setIsAuthenticated(true);
      } else {
        // User is signed out
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (username: string, phone: string, password: string) => {
    try {
      // First, check if this is an admin login
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .or(`username.eq.${username},phone.eq.${phone}`)
        .single();

      if (adminData && !adminError) {
        // This is an admin, verify password
        const { data: passwordCheck, error: passwordError } = await supabase
          .rpc('verify_admin_password', {
            admin_id: adminData.id,
            input_password: password
          });

        if (passwordError || !passwordCheck) {
          return { success: false, error: "كلمة المرور غير صحيحة" };
        }

        // Admin login successful
        setUser({
          id: adminData.id,
          username: adminData.username,
          phone: adminData.phone,
        });
        setIsAuthenticated(true);
        return { success: true };
      }

      // Not an admin, check regular users table
      const { data: userRecord, error: userError } = await supabase
        .from('users')
        .select('id, email')
        .or(`username.eq.${username},phone.eq.${phone}`)
        .single();

      if (userError || !userRecord) {
        // Fallback: try to sign in with email (if username is actually an email)
        if (username.includes('@')) {
          const { data, error: signInError } = await supabase.auth.signInWithPassword({
            email: username,
            password: password
          });

          if (signInError) {
            return { success: false, error: "بيانات الدخول غير صحيحة" };
          }

          if (data.user) {
            setUser({
              id: data.user.id,
              username: data.user.user_metadata?.username || username,
              phone: data.user.user_metadata?.phone || phone,
              email: data.user.email || undefined
            });
            setIsAuthenticated(true);
            return { success: true };
          }
        }
        
        return { success: false, error: "المستخدم غير موجود" };
      }

      // Sign in with email and password (we'll use the email associated with the user)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userRecord.email,
        password: password
      });

      if (signInError) {
        return { success: false, error: "كلمة المرور غير صحيحة" };
      }

      // Update user state
      setUser({
        id: userRecord.id,
        username,
        phone,
      });
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      return { success: false, error: "حدث خطأ أثناء تسجيل الدخول" };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    navigate("/login");
  };

  const register = async (username: string, phone: string, password: string) => {
    try {
      // Generate a temporary email for the user (in a real app, you'd collect this)
      const email = `${username.replace(/\s+/g, '')}${Date.now()}@farajfragrance.com`;
      
      // Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            phone
          }
        }
      });

      if (error) {
        // Check if it's a duplicate user error
        if (error.message.includes('already registered')) {
          return { success: false, error: "المستخدم مسجل بالفعل" };
        }
        return { success: false, error: error.message };
      }

      // Also insert user data into the users table if it exists
      if (data.user) {
        try {
          const { error: insertError } = await supabase
            .from('users')
            .insert([
              {
                id: data.user.id,
                username,
                phone,
                email
              }
            ]);

          if (insertError) {
            console.error('Error inserting user data:', insertError);
            // Don't fail the registration if we can't insert into users table
          }
        } catch (insertError) {
          console.error('Error inserting user data:', insertError);
          // Don't fail the registration if we can't insert into users table
        }

        setUser({
          id: data.user.id,
          username,
          phone,
          email
        });
        setIsAuthenticated(true);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: "حدث خطأ أثناء إنشاء الحساب" };
    }
  };

  const value = {
    user,
    isAuthenticated,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Main provider component that doesn't use router hooks
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return <AuthContextProviderContent>{children}</AuthContextProviderContent>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};