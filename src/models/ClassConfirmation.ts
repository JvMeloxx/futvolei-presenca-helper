
import { fetchClassById, fetchClassParticipants, toggleClassConfirmation as toggleConfirmation } from '@/repositories/neonClassRepository';

export interface ClassParticipant {
  id: string;
  user_id: string;
  class_id: string;
  created_at: string;
  user_details?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export interface ClassDetails {
  id: string;
  day: string;
  time: string;
  date: string;
  location: string;
  instructor: string;
  max_participants: number;
  confirmed_count: number;
  participants?: ClassParticipant[];
  user_confirmed?: boolean;
}

export interface TimeSlot {
  time: string;
  instructor: string;
  location: string;
  max_participants: number;
}

export interface ClassSchedule {
  [day: string]: {
    [timeSlot: string]: TimeSlot;
  };
}

// Class details mapping
export const classSchedule: ClassSchedule = {
  'Segunda': {
    '8:30': {
      time: '8:30',
      instructor: 'João Silva',
      location: 'Quadra Central',
      max_participants: 16
    },
    '17:00': {
      time: '17:00',
      instructor: 'Maria Oliveira',
      location: 'Quadra Central',
      max_participants: 16
    },
    '18:30': {
      time: '18:30',
      instructor: 'Pedro Santos',
      location: 'Quadra Central',
      max_participants: 16
    },
    '20:00': {
      time: '20:00',
      instructor: 'Carlos Ferreira',
      location: 'Quadra Lateral',
      max_participants: 12
    }
  },
  'Terça': {
    '6:30': {
      time: '6:30',
      instructor: 'Ana Costa',
      location: 'Quadra Lateral',
      max_participants: 12
    },
    '8:00': {
      time: '8:00',
      instructor: 'João Silva',
      location: 'Quadra Central', 
      max_participants: 16
    },
    '12:00': {
      time: '12:00',
      instructor: 'Pedro Santos',
      location: 'Quadra Central',
      max_participants: 16
    },
    '17:00': {
      time: '17:00',
      instructor: 'Maria Oliveira',
      location: 'Quadra Central',
      max_participants: 16
    },
    '18:30': {
      time: '18:30',
      instructor: 'Carlos Ferreira',
      location: 'Quadra Central',
      max_participants: 16
    },
    '20:00': {
      time: '20:00',
      instructor: 'Ana Costa',
      location: 'Quadra Lateral',
      max_participants: 12
    }
  },
  'Quarta': {
    '8:30': {
      time: '8:30',
      instructor: 'João Silva', 
      location: 'Quadra Central',
      max_participants: 16
    },
    '17:00': {
      time: '17:00',
      instructor: 'Maria Oliveira',
      location: 'Quadra Central',
      max_participants: 16
    },
    '18:30': {
      time: '18:30',
      instructor: 'Pedro Santos',
      location: 'Quadra Central',
      max_participants: 16
    },
    '20:00': {
      time: '20:00',
      instructor: 'Carlos Ferreira',
      location: 'Quadra Lateral',
      max_participants: 12
    }
  },
  'Quinta': {
    '6:30': {
      time: '6:30',
      instructor: 'Ana Costa',
      location: 'Quadra Lateral',
      max_participants: 12
    },
    '8:00': {
      time: '8:00',
      instructor: 'João Silva',
      location: 'Quadra Central',
      max_participants: 16
    },
    '12:00': {
      time: '12:00',
      instructor: 'Pedro Santos',
      location: 'Quadra Central',
      max_participants: 16
    },
    '17:00': {
      time: '17:00',
      instructor: 'Maria Oliveira',
      location: 'Quadra Central',
      max_participants: 16
    },
    '18:30': {
      time: '18:30',
      instructor: 'Carlos Ferreira',
      location: 'Quadra Central',
      max_participants: 16
    },
    '20:00': {
      time: '20:00',
      instructor: 'Ana Costa',
      location: 'Quadra Lateral',
      max_participants: 12
    }
  }
};

// Helper function to get class ID format from day and time
export const getClassIdFromDayTime = (day: string, time: string): string => {
  const dayPrefix: {[key: string]: string} = {
    'Segunda': 'm',
    'Terça': 't', 
    'Quarta': 'w',
    'Quinta': 'th'
  };
  
  const prefix = dayPrefix[day] || '';
  const timeIndex = Object.keys(classSchedule[day] || {}).findIndex(t => t === time) + 1;
  
  return `${prefix}${timeIndex}`;
};

// Get detailed class info by ID
export const getClassDetailsById = async (classId: string): Promise<ClassDetails | null> => {
  return fetchClassById(classId);
};

// Get class participants
export const getClassParticipants = async (classId: string): Promise<ClassParticipant[]> => {
  return fetchClassParticipants(classId);
};

// Confirm or cancel class attendance
export const toggleClassConfirmation = async (classId: string, confirmed: boolean): Promise<boolean> => {
  return toggleConfirmation(classId, confirmed);
};
