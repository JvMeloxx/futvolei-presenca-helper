const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
import { ClassDetails, ClassParticipant } from '../types/class';

// Buscar todas as aulas disponíveis
export const fetchAllClasses = async (): Promise<ClassDetails[]> => {
  try {
    const response = await fetch(`${API_URL}/classes`);
    if (!response.ok) throw new Error('Falha ao buscar aulas');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar aulas:', error);
    return [];
  }
};

// Verificar se usuário confirmou uma aula
export const checkUserConfirmation = async (userId: string, classId: string): Promise<boolean> => {
  // This optimization might be better handled by fetching all confirmations at once
  // or by the fetchAllClasses endpoint returning this info.
  // For now, let's keep it simple or implement a specific endpoint if needed.
  // Actually, fetchUserConfirmedClasses already exists.
  try {
    const confirmedClasses = await fetchUserConfirmedClasses(userId);
    return confirmedClasses.some(c => c.id === classId);
  } catch (error) {
    console.error('Erro ao verificar confirmação:', error);
    return false;
  }
};

// Buscar participantes de uma aula
export const fetchClassParticipants = async (classId: string): Promise<ClassParticipant[]> => {
  try {
    const response = await fetch(`${API_URL}/classes/${classId}/participants`);
    if (!response.ok) throw new Error('Falha ao buscar participantes');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar participantes:', error);
    return [];
  }
};

// Confirmar presença em uma aula
export const confirmClass = async (userId: string, classId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const token = localStorage.getItem('neon_auth_token');
    if (!token) return { success: false, error: 'Usuário não autenticado' };

    const response = await fetch(`${API_URL}/classes/${classId}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userId }) // API typically extracts userId from token, but sending it doesn't hurt if expected
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Falha ao confirmar presença' };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao confirmar presença:', error);
    return { success: false, error: 'Erro de conexão' };
  }
};

// Cancelar confirmação de uma aula
export const cancelClassConfirmation = async (userId: string, classId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const token = localStorage.getItem('neon_auth_token');
    if (!token) return { success: false, error: 'Usuário não autenticado' };

    const response = await fetch(`${API_URL}/classes/${classId}/confirm`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Falha ao cancelar confirmação' };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao cancelar confirmação:', error);
    return { success: false, error: 'Erro de conexão' };
  }
};


// Buscar aulas confirmadas por um usuário
export const fetchUserConfirmedClasses = async (userId: string): Promise<ClassDetails[]> => {
  try {
    const token = localStorage.getItem('neon_auth_token');
    // If endpoint protected
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(`${API_URL}/classes/user/${userId}/confirmed`, {
      headers
    });

    if (!response.ok) throw new Error('Falha ao buscar aulas confirmadas');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar aulas confirmadas:', error);
    return [];
  }
};

// Buscar detalhes de uma aula por ID
export const fetchClassById = async (classId: string): Promise<ClassDetails | null> => {
  try {
    const response = await fetch(`${API_URL}/classes/${classId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar detalhes da aula:', error);
    return null;
  }
};
// Alternar confirmação de aula (confirmar ou cancelar)
export const toggleClassConfirmation = async (userId: string, classId: string): Promise<boolean> => {
  const isConfirmed = await checkUserConfirmation(userId, classId);
  
  if (isConfirmed) {
    const result = await cancelClassConfirmation(userId, classId);
    return result.success;
  } else {
    const result = await confirmClass(userId, classId);
    return result.success;
  }
};
