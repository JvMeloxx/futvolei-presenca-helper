import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  signIn as neonSignIn,
  signUp as neonSignUp,
  updateUser as neonUpdateUser,
  getSession as neonGetSession,
  AuthUser,
  AuthSession,
  SignUpData,
  SignInData
} from '@/integrations/neon/auth';

type NeonAuthContextType = {
  session: AuthSession | null;
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
};

const NeonAuthContext = createContext<NeonAuthContextType | undefined>(undefined);

const TOKEN_KEY = 'neon_auth_token';

export function NeonAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Função para salvar token no localStorage
  const saveToken = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  };

  // Função para remover token do localStorage
  const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
  };

  // Função para obter token do localStorage
  const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  };

  // Verificar sessão ao carregar a aplicação
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const token = getToken();
        if (token) {
          const sessionData = await neonGetSession(token);
          if (sessionData) {
            setSession(sessionData.session);
            setUser(sessionData.user);
          } else {
            // Token inválido, remover
            removeToken();
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const signInData: SignInData = { email, password };
      const result = await neonSignIn(signInData);
      
      if ('error' in result) {
        throw new Error(result.error);
      }
      
      // Salvar token e atualizar estado
      saveToken(result.session.access_token);
      setSession(result.session);
      setUser(result.user);
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao Futvôlei Presença!",
      });
      
      navigate('/');
    } catch (error: any) {
      let errorMessage = "Falha ao fazer login. Verifique suas credenciais.";
      
      if (error.message) {
        if (error.message.includes("Email ou senha incorretos")) {
          errorMessage = "Email ou senha incorretos.";
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
      const signUpData: SignUpData = {
        email,
        password,
        full_name: userData.fullName,
        avatar_url: userData.profileImage || null,
        preferred_days: userData.preferredDays || [],
        preferred_times: userData.preferredTimes || []
      };
      
      const result = await neonSignUp(signUpData);
      
      if ('error' in result) {
        throw new Error(result.error);
      }
      
      // Salvar token e atualizar estado
      saveToken(result.session.access_token);
      setSession(result.session);
      setUser(result.user);
      
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Sua conta foi criada e você já está logado.",
      });
      
      navigate('/');
    } catch (error: any) {
      let errorMessage = "Falha ao criar conta.";
      
      if (error.message) {
        if (error.message.includes("Este email já está registrado")) {
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
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      // Remover token e limpar estado
      removeToken();
      setSession(null);
      setUser(null);
      
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

  const updateProfile = async (data: any) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const updateData = {
        full_name: data.name,
        avatar_url: data.avatar_url,
        preferred_days: Array.isArray(data.preferredDays) ? data.preferredDays : data.preferredDays?.split(',') || [],
        preferred_times: Array.isArray(data.preferredTimes) ? data.preferredTimes : data.preferredTimes?.split(',') || []
      };
      
      const result = await neonUpdateUser(user.id, updateData);
      
      if ('error' in result) {
        throw new Error(result.error);
      }
      
      // Atualizar estado local com os novos dados
      const updatedUser = {
        ...user,
        ...result.user,
        user_metadata: {
          ...user.user_metadata,
          full_name: result.user.full_name,
          avatar_url: result.user.avatar_url,
          preferred_days: result.user.preferred_days,
          preferred_times: result.user.preferred_times
        }
      };
      
      setUser(updatedUser);
      if (session) {
        setSession({
          ...session,
          user: updatedUser
        });
      }
      
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

  return <NeonAuthContext.Provider value={value}>{children}</NeonAuthContext.Provider>;
}

export const useNeonAuth = () => {
  const context = useContext(NeonAuthContext);
  if (!context) {
    throw new Error('useNeonAuth deve ser usado dentro de um NeonAuthProvider');
  }
  return context;
};

// Alias para manter compatibilidade com o código existente
export const useAuth = useNeonAuth;