// Mock repository for frontend - In production, this should call a backend API
// Note: Direct database connections removed for browser compatibility
import { ClassDetails, ClassParticipant } from '@/models/ClassConfirmation';

// Função para calcular a próxima data baseada no dia da semana
function calculateNextDateFromDay(dayName: string): string {
  const days = {
    'Segunda': 1,
    'Terça': 2, 
    'Quarta': 3,
    'Quinta': 4,
    'Sexta': 5,
    'Sábado': 6,
    'Domingo': 0
  };
  
  const today = new Date();
  const targetDay = days[dayName as keyof typeof days];
  const currentDay = today.getDay();
  
  let daysUntilTarget = targetDay - currentDay;
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7; // Próxima semana
  }
  
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + daysUntilTarget);
  
  return targetDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD
}

// Buscar detalhes de uma aula por ID
export const fetchClassById = async (classId: string): Promise<ClassDetails | null> => {
  // Mock data for frontend - In production, this should call a backend API
  console.warn('Using mock data - fetchClassById should call backend API in production');
  
  const mockClasses: Record<string, ClassDetails> = {
    'monday-morning': {
      id: 'monday-morning',
      day: 'Segunda-feira',
      time: '07:00',
      date: calculateNextDateFromDay('Segunda'),
      location: 'Quadra Principal',
      instructor: 'João Silva',
      max_participants: 12,
      confirmed_count: 8,
      user_confirmed: false
    },
    'wednesday-evening': {
      id: 'wednesday-evening',
      day: 'Quarta-feira',
      time: '18:30',
      date: calculateNextDateFromDay('Quarta'),
      location: 'Quadra Secundária',
      instructor: 'Maria Santos',
      max_participants: 10,
      confirmed_count: 6,
      user_confirmed: false
    }
  };
  
  return mockClasses[classId] || null;
};

// Verificar se usuário confirmou uma aula
export const checkUserConfirmation = async (userId: string, classId: string): Promise<boolean> => {
  // Mock data for frontend - In production, this should call a backend API
  console.warn('Using mock data - checkUserConfirmation should call backend API in production');
  
  // Simulate some users having confirmed some classes
  const mockConfirmations: Record<string, string[]> = {
    'user1': ['monday-morning'],
    'user2': ['wednesday-evening'],
  };
  
  return mockConfirmations[userId]?.includes(classId) || false;
};

// Buscar participantes de uma aula
export const fetchClassParticipants = async (classId: string): Promise<ClassParticipant[]> => {
  // Mock data for frontend - In production, this should call a backend API
  console.warn('Using mock data - fetchClassParticipants should call backend API in production');
  
  const mockParticipants: Record<string, ClassParticipant[]> = {
    'monday-morning': [
      {
        id: 'conf1',
        user_id: 'user1',
        class_id: 'monday-morning',
        created_at: new Date('2024-01-15T10:00:00Z'),
        user_details: {
          full_name: 'João Silva',
          avatar_url: null
        }
      },
      {
        id: 'conf2',
        user_id: 'user2',
        class_id: 'monday-morning',
        created_at: new Date('2024-01-15T11:00:00Z'),
        user_details: {
          full_name: 'Maria Santos',
          avatar_url: null
        }
      }
    ],
    'wednesday-evening': [
      {
        id: 'conf3',
        user_id: 'user3',
        class_id: 'wednesday-evening',
        created_at: new Date('2024-01-15T12:00:00Z'),
        user_details: {
          full_name: 'Pedro Costa',
          avatar_url: null
        }
      }
    ]
  };
  
  return mockParticipants[classId] || [];
};

// Confirmar presença em uma aula
export const confirmClass = async (userId: string, classId: string): Promise<{ success: boolean; error?: string }> => {
  // Mock implementation for frontend - In production, this should call a backend API
  console.warn('Using mock implementation - confirmClass should call backend API in production');
  
  // Verificar se a aula existe
  const classDetails = await fetchClassById(classId);
  if (!classDetails) {
    return { success: false, error: 'Aula não encontrada' };
  }
  
  // Verificar se já está confirmado
  const alreadyConfirmed = await checkUserConfirmation(userId, classId);
  if (alreadyConfirmed) {
    return { success: false, error: 'Você já confirmou presença nesta aula' };
  }
  
  // Verificar se há vagas disponíveis
  if (classDetails.confirmed_count >= classDetails.max_participants) {
    return { success: false, error: 'Aula lotada' };
  }
  
  console.log(`Mock: User ${userId} confirmed class ${classId}`);
  return { success: true };
};

// Cancelar confirmação de uma aula
export const cancelClassConfirmation = async (userId: string, classId: string): Promise<boolean> => {
  // Mock implementation for frontend - In production, this should call a backend API
  console.warn('Using mock implementation - cancelClassConfirmation should call backend API in production');
  console.log(`Mock: User ${userId} cancelled confirmation for class ${classId}`);
  return true;
};

// Buscar todas as aulas disponíveis
export const fetchAllClasses = async (): Promise<ClassDetails[]> => {
  // Mock data for frontend - In production, this should call a backend API
  console.warn('Using mock data - fetchAllClasses should call backend API in production');
  
  const mockClasses: ClassDetails[] = [
    {
      id: 'monday-morning',
      day: 'Segunda-feira',
      time: '07:00',
      date: calculateNextDateFromDay('Segunda'),
      location: 'Quadra Principal',
      instructor: 'João Silva',
      max_participants: 12,
      confirmed_count: 8,
      user_confirmed: false
    },
    {
      id: 'wednesday-evening',
      day: 'Quarta-feira',
      time: '18:30',
      date: calculateNextDateFromDay('Quarta'),
      location: 'Quadra Secundária',
      instructor: 'Maria Santos',
      max_participants: 10,
      confirmed_count: 6,
      user_confirmed: false
    },
    {
      id: 'friday-morning',
      day: 'Sexta-feira',
      time: '06:30',
      date: calculateNextDateFromDay('Sexta'),
      location: 'Quadra Principal',
      instructor: 'Carlos Oliveira',
      max_participants: 14,
      confirmed_count: 10,
      user_confirmed: false
    }
  ];
  
  return mockClasses;
};

// Buscar aulas confirmadas por um usuário
export const fetchUserConfirmedClasses = async (userId: string): Promise<ClassDetails[]> => {
  // Mock data for frontend - In production, this should call a backend API
  console.warn('Using mock data - fetchUserConfirmedClasses should call backend API in production');
  
  // Simulate user having confirmed some classes
  const mockUserConfirmations: Record<string, string[]> = {
    'user1': ['monday-morning'],
    'user2': ['wednesday-evening'],
  };
  
  const allClasses = await fetchAllClasses();
  const userConfirmedClassIds = mockUserConfirmations[userId] || [];
  
  return allClasses
    .filter(classItem => userConfirmedClassIds.includes(classItem.id))
    .map(classItem => ({ ...classItem, user_confirmed: true }));
};

// Alternar confirmação de aula (confirmar ou cancelar)
export const toggleClassConfirmation = async (userId: string, classId: string): Promise<boolean> => {
  // Mock implementation for frontend - In production, this should call a backend API
  console.warn('Using mock implementation - toggleClassConfirmation should call backend API in production');
  
  const isConfirmed = await checkUserConfirmation(userId, classId);
  
  if (isConfirmed) {
    return await cancelClassConfirmation(userId, classId);
  } else {
    const result = await confirmClass(userId, classId);
    return result.success;
  }
};