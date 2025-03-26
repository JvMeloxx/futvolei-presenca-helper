
import { supabase } from '@/integrations/supabase/client';
import { ClassDetails, ClassParticipant } from '@/models/ClassConfirmation';

// Fetch class details by ID
export const fetchClassById = async (classId: string): Promise<ClassDetails | null> => {
  try {
    // Mock data for now since we don't have the actual classes table
    // In a real implementation, this would fetch from the database
    const mockClasses: Record<string, Omit<ClassDetails, 'id' | 'user_confirmed' | 'confirmed_count'>> = {
      'm1': { day: 'Segunda', time: '8:30', date: '15 Mar', location: 'Arena Beach', instructor: 'Roberto', max_participants: 12 },
      'm2': { day: 'Segunda', time: '17:00', date: '15 Mar', location: 'Arena Beach', instructor: 'Carlos', max_participants: 12 },
      't1': { day: 'Terça', time: '6:30', date: '16 Mar', location: 'Arena Beach', instructor: 'Roberto', max_participants: 10 },
      'w1': { day: 'Quarta', time: '8:30', date: '17 Mar', location: 'Arena Beach', instructor: 'Carlos', max_participants: 12 },
    };
    
    if (!mockClasses[classId]) return null;
    
    // Get confirmation count
    // Check if current user has confirmed
    const { data: { user } } = await supabase.auth.getUser();
    
    // For now, just return mock data
    // In a real implementation, we would check the database
    const mockClass = mockClasses[classId];
    const confirmedCount = Math.floor(Math.random() * 10) + 1;
    const userConfirmed = user ? Math.random() > 0.5 : false;
    
    return {
      id: classId,
      day: mockClass.day,
      time: mockClass.time,
      date: mockClass.date,
      location: mockClass.location,
      instructor: mockClass.instructor,
      max_participants: mockClass.max_participants,
      confirmed_count: confirmedCount,
      user_confirmed: userConfirmed
    };
  } catch (error) {
    console.error("Error fetching class:", error);
    return null;
  }
};

// Fetch class participants
export const fetchClassParticipants = async (classId: string): Promise<ClassParticipant[]> => {
  try {
    // For now, return mock data
    // In a real implementation, this would fetch from the database
    const mockParticipants: ClassParticipant[] = Array(Math.floor(Math.random() * 10) + 1)
      .fill(0)
      .map((_, i) => ({
        id: `p${i}`,
        user_id: `u${i}`,
        class_id: classId,
        created_at: new Date().toISOString(),
        user_details: {
          full_name: `Participante ${i + 1}`,
          avatar_url: null
        }
      }));
    
    return mockParticipants;
  } catch (error) {
    console.error("Error fetching participants:", error);
    return [];
  }
};

// Toggle class confirmation
export const toggleClassConfirmation = async (classId: string, confirmed: boolean): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // For now, just simulate success
    // In a real implementation, this would update the database
    console.log(`User ${user.id} ${confirmed ? 'confirmed' : 'canceled'} class ${classId}`);
    
    // Mock successful response
    return true;
  } catch (error) {
    console.error("Error toggling confirmation:", error);
    return false;
  }
};

// Find the next class based on user preferences
export const findNextClass = (
  preferredDays: string[], 
  allClasses: Record<string, any[]>
): { id: string; day: string; date: string; time: string; confirmedCount: number } | null => {
  try {
    if (!preferredDays.length) return null;
    
    const today = new Date();
    const currentDayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Map to convert day names to indexes
    const dayToIndexMap: Record<string, number> = {
      'Domingo': 0,
      'Segunda': 1,
      'Terça': 2,
      'Quarta': 3, 
      'Quinta': 4,
      'Sexta': 5,
      'Sábado': 6
    };
    
    // Map to convert indexes to day names
    const indexToDayMap: Record<number, string> = {
      0: 'Domingo',
      1: 'Segunda',
      2: 'Terça',
      3: 'Quarta',
      4: 'Quinta',
      5: 'Sexta',
      6: 'Sábado'
    };
    
    // Map preferred days to their corresponding index
    const preferredDaysIndexes = preferredDays.map(day => dayToIndexMap[day]).sort();
    
    // Find the next day index from preferred days
    let nextDayIndex = preferredDaysIndexes.find(index => index > currentDayIndex);
    
    // If no day found after current day, take the first preferred day (for next week)
    if (nextDayIndex === undefined && preferredDaysIndexes.length > 0) {
      nextDayIndex = preferredDaysIndexes[0];
    }
    
    if (nextDayIndex === undefined) return null;
    
    // Get the corresponding day name
    const nextDay = indexToDayMap[nextDayIndex];
    
    // Get the class key from the day name
    const classKey = Object.entries({
      'Segunda': 'monday',
      'Terça': 'tuesday',
      'Quarta': 'wednesday',
      'Quinta': 'thursday',
      'Sexta': 'friday',
      'Sábado': 'saturday',
      'Domingo': 'sunday'
    }).find(([key]) => key === nextDay)?.[1];
    
    if (!classKey || !allClasses[classKey]) return null;
    
    // Get the first class of the day
    const nextClass = allClasses[classKey][0];
    if (!nextClass) return null;
    
    // Calculate the date for the next class
    const nextDate = new Date(today);
    const daysToAdd = (nextDayIndex - currentDayIndex + 7) % 7;
    nextDate.setDate(today.getDate() + daysToAdd);
    
    const formattedDate = `${nextDate.getDate()} ${new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(nextDate)}`;
    
    return {
      id: nextClass.id,
      day: nextDay,
      date: formattedDate,
      time: nextClass.time,
      confirmedCount: nextClass.confirmedCount
    };
  } catch (error) {
    console.error("Error finding next class:", error);
    return null;
  }
};
