
import { supabase } from '@/integrations/supabase/client';
import { ClassDetails, ClassParticipant } from '@/models/ClassConfirmation';

// Fetch class details by ID
export const fetchClassById = async (classId: string): Promise<ClassDetails | null> => {
  try {
    // Get the class data
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();
    
    if (classError) throw classError;
    if (!classData) return null;
    
    // Get confirmation count
    const { data: countData, error: countError } = await supabase
      .rpc('get_class_confirmation_count', { class_id: classId });
    
    if (countError) throw countError;
    
    // Check if current user has confirmed
    const { data: { user } } = await supabase.auth.getUser();
    
    let userConfirmed = false;
    if (user) {
      const { data: confirmationData, error: confirmationError } = await supabase
        .rpc('has_user_confirmed_class', { 
          user_id: user.id, 
          class_id: classId 
        });
      
      if (confirmationError) throw confirmationError;
      userConfirmed = confirmationData || false;
    }
    
    // Calculate the date for display
    const today = new Date();
    const dayIndex = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].indexOf(classData.day);
    const todayIndex = today.getDay();
    
    let targetDate = new Date();
    if (dayIndex > todayIndex) {
      targetDate.setDate(today.getDate() + (dayIndex - todayIndex));
    } else if (dayIndex < todayIndex) {
      targetDate.setDate(today.getDate() + (7 - todayIndex + dayIndex));
    }
    
    const formattedDate = `${targetDate.getDate()} ${new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(targetDate)}`;
    
    return {
      id: classData.id,
      day: classData.day,
      time: classData.time,
      date: formattedDate,
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
        profiles:profiles(full_name, avatar_url)
      `)
      .eq('class_id', classId);
    
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      user_id: item.user_id,
      class_id: item.class_id,
      created_at: item.created_at,
      user_details: {
        full_name: item.profiles?.full_name || 'Usuário',
        avatar_url: item.profiles?.avatar_url || null
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
      
      if (error) throw error;
    } else {
      // Remove confirmation
      const { error } = await supabase
        .from('class_confirmations')
        .delete()
        .eq('user_id', user.id)
        .eq('class_id', classId);
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error toggling confirmation:", error);
    return false;
  }
};
