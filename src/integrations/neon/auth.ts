const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  preferred_days?: string[];
  preferred_times?: string[];
  [key: string]: any;
}

export interface AuthSession {
  access_token: string;
  user: AuthUser;
  expires_at: number;
}

export interface SignUpData {
  email: string;
  password: string;
  full_name?: string;
  avatar_url?: string;
  preferred_days?: string[];
  preferred_times?: string[];
}

export interface SignInData {
  email: string;
  password: string;
}

// Função para registrar usuário
export async function signUp(data: SignUpData): Promise<{ user: AuthUser; session: AuthSession } | { error: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error || 'Falha ao criar conta' };
    }

    return result;
  } catch (error) {
    console.error('Erro no registro:', error);
    return { error: 'Erro de conexão com o servidor' };
  }
}

// Função para fazer login
export async function signIn(data: SignInData): Promise<{ user: AuthUser; session: AuthSession } | { error: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error || 'Falha ao fazer login' };
    }

    return result;
  } catch (error) {
    console.error('Erro no login:', error);
    return { error: 'Erro de conexão com o servidor' };
  }
}

// Função para atualizar perfil do usuário
export async function updateUser(userId: string, data: Partial<SignUpData>): Promise<{ user: AuthUser } | { error: string }> {
  try {
    const token = localStorage.getItem('neon_auth_token');

    if (!token) {
      return { error: 'Usuário não autenticado' };
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error || 'Falha ao atualizar perfil' };
    }

    return result;
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return { error: 'Erro de conexão com o servidor' };
  }
}

// Função para obter sessão do usuário
export async function getSession(token: string): Promise<{ session: AuthSession; user: AuthUser } | { error: string }> {
  try {
    const response = await fetch(`${API_URL}/auth/session`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const result = await response.json();

    if (!response.ok) {
      // Se a sessão for inválida, retornamos nulo ou erro para logout
      return { error: result.error || 'Sessão inválida' };
    }

    return result;
  } catch (error) {
    console.error('Erro ao verificar sessão:', error);
    return { error: 'Erro de conexão com o servidor' };
  }
}