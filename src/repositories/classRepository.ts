
import { supabase } from '@/integrations/supabase/client';
import { ClassDetails, ClassParticipant } from '@/models/ClassConfirmation';

// Fetch class details by ID
export const fetchClassById = async (classId: string): Promise<ClassDetails | null> => {
  try {
    // Get class information
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();
    
    if (classError || !classData) {
      console.error("Error fetching class:", classError);
      return null;
    }
    
    // Get confirmation count
    const { data: countData, error: countError } = await supabase
      .rpc('get_class_confirmation_count', { class_id: classId });
    
    if (countError) {
      console.error("Error getting confirmation count:", countError);
      return null;
    }
    
    // Check if current user has confirmed
    const { data: { user } } = await supabase.auth.getUser();
    let userConfirmed = false;
    
    if (user) {
      const { data: isConfirmed, error: confirmError } = await supabase
        .rpc('has_user_confirmed_class', { 
          user_id: user.id, 
          class_id: classId 
        });
      
      if (!confirmError) {
        userConfirmed = isConfirmed || false;
      }
    }
    
    // Calculate date from day
    const date = calculateNextDateFromDay(classData.day);
    
    return {
      id: classData.id,
      day: classData.day,
      time: classData.time,
      date: date,
      location: classData.location,
      instructor: classData.instructor,
      max_participants: classData.max_participants,
      confirmed_count: countData || 0,
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
    const { data, error } = await supabase
      .from('class_confirmations')
      .select(`
        id,
        user_id,
        class_id,
        created_at,
        profiles:profiles!inner(full_name, avatar_url)
      `)
      .eq('class_id', classId)
      .order('created_at');
    
    if (error) {
      console.error("Error fetching participants:", error);
      return [];
    }
    
    return data.map(item => ({
      id: item.id,
      user_id: item.user_id,
      class_id: item.class_id,
      created_at: item.created_at,
      user_details: {
        full_name: item.profiles.full_name || 'Usuário',
        avatar_url: item.profiles.avatar_url
      }
    }));
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
    
    if (confirmed) {
      // Add confirmation
      const { error } = await supabase
        .from('class_confirmations')
        .insert({
          user_id: user.id,
          class_id: classId
        });
      
      if (error) {
        console.error("Error confirming class:", error);
        return false;
      }
    } else {
      // Remove confirmation
      const { error } = await supabase
        .from('class_confirmations')
        .delete()
        .eq('user_id', user.id)
        .eq('class_id', classId);
      
      if (error) {
        console.error("Error canceling class confirmation:", error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error toggling confirmation:", error);
    return false;
  }
};

// Find the next class based on user preferences
export const findNextClass = (
  preferredDays: string[], 
  classesByDay: Record<string, any[]>
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
    
    if (!classKey || !classesByDay[classKey]) return null;
    
    // Get the first class of the day
    const nextClass = classesByDay[classKey][0];
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

// Helper function to calculate the next date for a specific day
const calculateNextDateFromDay = (dayName: string): string => {
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
  
  const targetDayIndex = dayToIndexMap[dayName];
  if (targetDayIndex === undefined) return '';
  
  let daysToAdd = targetDayIndex - currentDayIndex;
  if (daysToAdd <= 0) {
    daysToAdd += 7; // Move to next week
  }
  
  const nextDate = new Date(today);
  nextDate.setDate(today.getDate() + daysToAdd);
  
  return `${nextDate.getDate()} ${new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(nextDate)}`;
};
