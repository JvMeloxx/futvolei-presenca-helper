import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
// Mock auth for frontend - In production, this should call a backend API
// import { query } from './client';
// import { User } from './client';

// Chave secreta para JWT (em produção, use variável de ambiente)
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
const JWT_EXPIRES_IN = '7d';

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  preferred_days?: string[];
  preferred_times?: string[];
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

// Função para gerar token JWT
async function generateToken(userId: string): Promise<string> {
  const jwt = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET);
  
  return jwt;
}

// Função para verificar token JWT
export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string
    };
  } catch (error) {
    return null;
  }
}

// Função para hash da senha
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Função para verificar senha
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Função para buscar usuário por ID
export async function getUserById(userId: string): Promise<AuthUser | null> {
  // Mock implementation for frontend - In production, this should call a backend API
  console.warn('Using mock data - getUserById should call backend API in production');
  
  // Primeiro, tentar buscar dados atualizados do localStorage
  const savedUserData = localStorage.getItem(`user_data_${userId}`);
  if (savedUserData) {
    try {
      const userData = JSON.parse(savedUserData);
      return userData;
    } catch (error) {
      console.error('Erro ao parsear dados do usuário do localStorage:', error);
    }
  }
  
  // Fallback para dados mock
  const mockUsers: Record<string, AuthUser> = {
    'user1': {
      id: 'user1',
      email: 'joao@example.com',
      full_name: 'João Silva',
      avatar_url: null,
      preferred_days: ['Segunda-feira', 'Quarta-feira'],
      preferred_times: ['07:00', '18:30']
    },
    'user2': {
      id: 'user2',
      email: 'maria@example.com',
      full_name: 'Maria Santos',
      avatar_url: null,
      preferred_days: ['Quarta-feira', 'Sexta-feira'],
      preferred_times: ['18:30']
    }
  };
  
  return mockUsers[userId] || null;
}

// Função para registrar usuário
export async function signUp(data: SignUpData): Promise<{ user: AuthUser; session: AuthSession } | { error: string }> {
  // Mock implementation for frontend - In production, this should call a backend API
  console.warn('Using mock implementation - signUp should call backend API in production');
  
  // Simulate checking if email already exists
  const mockExistingEmails = ['admin@example.com', 'test@example.com'];
  
  if (mockExistingEmails.includes(data.email)) {
    return { error: 'Este email já está registrado' };
  }
  
  // Create mock user
  const newUserId = 'user_' + Date.now();
  const authUser: AuthUser = {
    id: newUserId,
    email: data.email,
    full_name: data.full_name || null,
    avatar_url: data.avatar_url || null,
    preferred_days: data.preferred_days || [],
    preferred_times: data.preferred_times || []
  };
  
  // Gerar token
  const token = await generateToken(newUserId);
  const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 dias
  
  const session: AuthSession = {
    access_token: token,
    user: authUser,
    expires_at: expiresAt
  };
  
  console.log('Mock: User registered successfully', authUser);
  return { user: authUser, session };
}

// Função para fazer login
export async function signIn(data: SignInData): Promise<{ user: AuthUser; session: AuthSession } | { error: string }> {
  // Mock implementation for frontend - In production, this should call a backend API
  console.warn('Using mock implementation - signIn should call backend API in production');
  
  // Mock users with credentials
  const mockUsers: Record<string, { user: AuthUser; password: string }> = {
    'joao@example.com': {
      user: {
        id: 'user1',
        email: 'joao@example.com',
        full_name: 'João Silva',
        avatar_url: null,
        preferred_days: ['Segunda-feira', 'Quarta-feira'],
        preferred_times: ['07:00', '18:30']
      },
      password: '123456'
    },
    'maria@example.com': {
      user: {
        id: 'user2',
        email: 'maria@example.com',
        full_name: 'Maria Santos',
        avatar_url: null,
        preferred_days: ['Quarta-feira', 'Sexta-feira'],
        preferred_times: ['18:30']
      },
      password: '123456'
    }
  };
  
  const mockUserData = mockUsers[data.email];
  if (!mockUserData || mockUserData.password !== data.password) {
    return { error: 'Email ou senha incorretos' };
  }
  
  // Verificar se há dados atualizados no localStorage
  const savedUserData = localStorage.getItem(`user_data_${mockUserData.user.id}`);
  let userToReturn = mockUserData.user;
  
  if (savedUserData) {
    try {
      const updatedUserData = JSON.parse(savedUserData);
      userToReturn = updatedUserData;
    } catch (error) {
      console.error('Erro ao parsear dados salvos do usuário:', error);
    }
  }
  
  // Gerar token
  const token = await generateToken(userToReturn.id);
  const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 dias
  
  const session: AuthSession = {
    access_token: token,
    user: userToReturn,
    expires_at: expiresAt
  };
  
  console.log('Mock: User signed in successfully', userToReturn);
  return { user: userToReturn, session };
}

// Função para atualizar perfil do usuário
export async function updateUser(userId: string, data: Partial<SignUpData>): Promise<{ user: AuthUser } | { error: string }> {
  // Mock implementation for frontend - In production, this should call a backend API
  console.warn('Using mock implementation - updateUser should call backend API in production');
  
  const currentUser = await getUserById(userId);
  if (!currentUser) {
    return { error: 'Usuário não encontrado' };
  }
  
  // Update user data
  const updatedUser: AuthUser = {
    ...currentUser,
    full_name: data.full_name !== undefined ? data.full_name : currentUser.full_name,
    avatar_url: data.avatar_url !== undefined ? data.avatar_url : currentUser.avatar_url,
    preferred_days: data.preferred_days !== undefined ? data.preferred_days : currentUser.preferred_days,
    preferred_times: data.preferred_times !== undefined ? data.preferred_times : currentUser.preferred_times
  };
  
  // Salvar dados atualizados no localStorage para persistência
  try {
    localStorage.setItem(`user_data_${userId}`, JSON.stringify(updatedUser));
    console.log('Mock: User data saved to localStorage', updatedUser);
  } catch (error) {
    console.error('Erro ao salvar dados do usuário no localStorage:', error);
    return { error: 'Erro ao salvar dados do usuário' };
  }
  
  console.log('Mock: User updated successfully', updatedUser);
  return { user: updatedUser };
}

// Função para obter sessão do usuário
export async function getSession(token: string): Promise<{ session: AuthSession } | { error: string }> {
  // Mock implementation for frontend - In production, this should call a backend API
  console.warn('Using mock implementation - getSession should call backend API in production');
  
  try {
    const payload = await verifyToken(token);
    if (!payload) {
      return { error: 'Token inválido' };
    }
    
    const user = await getUserById(payload.userId);
    if (!user) {
      return { error: 'Usuário não encontrado' };
    }
    
    const session: AuthSession = {
      access_token: token,
      user,
      expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 dias
    };
    
    console.log('Mock: Session retrieved successfully', session);
    return { session };
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    return { error: 'Falha ao obter sessão' };
  }
}