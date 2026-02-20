import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AuthSession } from '@supabase/supabase-js';

// Define the AuthUser type based on the profiles table
export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  preferred_days?: string[];
  preferred_times?: string[];
  [key: string]: any;
}

type SupabaseAuthContextType = {
  session: AuthSession | null;
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
};

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export function NeonAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Obter sessão inicial
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);

        if (session?.user) {
          await fetchProfile(session.user.id, session.user.email || '');
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      if (session?.user) {
        await fetchProfile(session.user.id, session.user.email || '');
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error);
      }

      setUser({
        id: userId,
        email: email,
        ...data
      });
    } catch (error) {
      console.error('Falha ao obter perfil do Supabase', error);
      setUser({ id: userId, email });
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao Futevôlei Presença!",
      });

      navigate('/');
    } catch (error: any) {
      let errorMessage = "Falha ao fazer login. Verifique suas credenciais.";

      if (error.message && (error.message.includes("Invalid login credentials") || error.message.includes("Email ou senha incorretos"))) {
        errorMessage = "Email ou senha incorretos.";
      }

      toast({
        title: "Erro de autenticação",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Record<string, any>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.fullName,
            avatar_url: userData.profileImage || null,
          }
        }
      });

      if (error) {
        throw error;
      }

      // Se tiver preferred_days ou times, vamos atualizar o profile logo após criar
      if (data.user && (userData.preferredDays || userData.preferredTimes)) {
        // Wait briefly for the trigger to insert the profile
        await new Promise(resolve => setTimeout(resolve, 500));

        await supabase
          .from('profiles')
          .update({
            preferred_days: userData.preferredDays || [],
            preferred_times: userData.preferredTimes || []
          })
          .eq('id', data.user.id);
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Sua conta foi criada e você já está logado.",
      });

      navigate('/');
    } catch (error: any) {
      let errorMessage = "Falha ao criar conta.";

      if (error.message) {
        if (error.message.includes("already registered")) {
          errorMessage = "Este email já está registrado.";
        } else if (error.message.includes("Password should be at least")) {
          errorMessage = "A senha deve ter pelo menos 8 caracteres.";
        }
      }

      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);

      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });

      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: "Não foi possível realizar o logout.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Record<string, any>) => {
    if (!user) return;

    setIsLoading(true);
    try {
      const updateData = {
        full_name: data.name,
        avatar_url: data.avatar_url,
        preferred_days: Array.isArray(data.preferredDays) ? data.preferredDays : data.preferredDays?.split(',') || [],
        preferred_times: Array.isArray(data.preferredTimes) ? data.preferredTimes : data.preferredTimes?.split(',') || []
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Atualizar Auth MetaData para consistência (opcional no Supabase)
      await supabase.auth.updateUser({
        data: {
          full_name: data.name,
          avatar_url: data.avatar_url,
        }
      });

      // Atualizar estado local com os novos dados
      setUser({
        ...user,
        ...updateData
      });

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro ao atualizar seu perfil.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
}

export const useNeonAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Manteve-se o nome exportado como `useAuth` para não quebrar a aplicação que já usa isso
export const useAuth = useNeonAuth;