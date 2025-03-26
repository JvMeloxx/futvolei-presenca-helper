
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Configurar o listener para mudanças de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);

        if (event === 'SIGNED_IN') {
          toast({
            title: "Login realizado com sucesso",
            description: "Bem-vindo ao Futvôlei Presença!",
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Logout realizado",
            description: "Você foi desconectado com sucesso.",
          });
        }
      }
    );

    // Verificar se já existe uma sessão ativa
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      navigate('/');
    } catch (error: any) {
      let errorMessage = "Falha ao fazer login. Verifique suas credenciais.";
      
      if (error.message) {
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Email ou senha incorretos.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Você precisa confirmar seu email antes de fazer login.";
        }
      }
      
      toast({
        title: "Erro de autenticação",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: userData.fullName,
            avatar_url: userData.profileImage || null,
            preferred_days: userData.preferredDays.join(','),
            preferred_times: userData.preferredTimes.join(',')
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu email para confirmar sua conta.",
      });
      
      navigate('/login');
    } catch (error: any) {
      let errorMessage = "Falha ao criar conta.";
      
      if (error.message) {
        if (error.message.includes("User already registered")) {
          errorMessage = "Este email já está registrado.";
        } else if (error.message.includes("Password should be at least")) {
          errorMessage = "A senha deve ter pelo menos 6 caracteres.";
        }
      }
      
      toast({
        title: "Erro no cadastro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
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

  const updateProfile = async (data: any) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Atualizar metadados do usuário
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: data.name,
          avatar_url: data.avatar_url,
          preferred_days: Array.isArray(data.preferredDays) ? data.preferredDays.join(',') : data.preferredDays,
          preferred_times: Array.isArray(data.preferredTimes) ? data.preferredTimes.join(',') : data.preferredTimes
        }
      });

      if (updateError) throw updateError;

      // Atualizar perfil na tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.name,
          avatar_url: data.avatar_url,
          preferred_days: data.preferredDays,
          preferred_times: data.preferredTimes,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
