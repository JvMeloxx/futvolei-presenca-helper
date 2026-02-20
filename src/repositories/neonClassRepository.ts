import { supabase } from '../integrations/supabase/client';
import { ClassDetails, ClassParticipant } from '../types/class';

// Buscar todas as aulas disponíveis
export const fetchAllClasses = async (): Promise<ClassDetails[]> => {
  try {
    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('*')
      .order('created_at', { ascending: true });

    if (classesError) throw classesError;

    // We also need to get the count of confirmed participants
    const { data: confirmations, error: confirmError } = await supabase
      .from('class_confirmations')
      .select('class_id');

    if (confirmError) throw confirmError;

    // Count participants per class
    const participantsCount: Record<string, number> = {};
    confirmations?.forEach(conf => {
      participantsCount[conf.class_id] = (participantsCount[conf.class_id] || 0) + 1;
    });

    const formattedClasses: ClassDetails[] = classes?.map(c => ({
      id: c.id,
      day: c.day,
      time: c.time,
      date: '', // Usually hydrated by the hook logic
      location: c.location,
      instructor: c.instructor,
      max_participants: c.max_participants,
      confirmed_count: participantsCount[c.id] || 0
    })) || [];

    return formattedClasses;
  } catch (error) {
    console.error('Erro ao buscar aulas:', error);
    return [];
  }
};

// Verificar se usuário confirmou uma aula
export const checkUserConfirmation = async (userId: string, classId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('class_confirmations')
      .select('id')
      .eq('user_id', userId)
      .eq('class_id', classId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Erro ao verificar confirmação:', error);
    return false;
  }
};

// Buscar participantes de uma aula
export const fetchClassParticipants = async (classId: string): Promise<ClassParticipant[]> => {
  try {
    // Specify the relation name 'profiles' to avoid ambiguity if there are multiple foreign keys in the future
    const { data, error } = await supabase
      .from('class_confirmations')
      .select('id, user_id, class_id, created_at, profiles!inner(full_name, avatar_url)')
      .eq('class_id', classId);

    if (error) throw error;

    return data?.map((d: any) => ({
      id: d.id,
      user_id: d.user_id,
      class_id: d.class_id,
      created_at: d.created_at,
      user_details: {
        full_name: d.profiles?.full_name || 'Usuário Desconhecido',
        avatar_url: d.profiles?.avatar_url || null
      }
    })) || [];
  } catch (error) {
    console.error('Erro ao buscar participantes:', error);
    return [];
  }
};

// Confirmar presença em uma aula
export const confirmClass = async (userId: string, classId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('class_confirmations')
      .insert({
        user_id: userId,
        class_id: classId
      });

    if (error) {
      // Supabase unique constraint error code
      if (error.code === '23505') {
        return { success: false, error: 'Você já confirmou presença nesta aula' };
      }
      throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao confirmar presença:', error);
    return { success: false, error: error.message || 'Erro de conexão' };
  }
};

// Cancelar confirmação de uma aula
export const cancelClassConfirmation = async (userId: string, classId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('class_confirmations')
      .delete()
      .eq('user_id', userId)
      .eq('class_id', classId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Erro ao cancelar confirmação:', error);
    return { success: false, error: error.message || 'Erro de conexão' };
  }
};

// Buscar aulas confirmadas por um usuário
export const fetchUserConfirmedClasses = async (userId: string): Promise<ClassDetails[]> => {
  try {
    const { data: confirmations, error: confError } = await supabase
      .from('class_confirmations')
      .select('class_id')
      .eq('user_id', userId);

    if (confError) throw confError;

    if (!confirmations || confirmations.length === 0) return [];

    const classIds = confirmations.map(c => c.class_id);

    const { data: classes, error: classesError } = await supabase
      .from('classes')
      .select('*')
      .in('id', classIds);

    if (classesError) throw classesError;

    // Count participants for these classes too
    const { data: allConfirmations, error: allConfError } = await supabase
      .from('class_confirmations')
      .select('class_id')
      .in('class_id', classIds);

    if (allConfError) throw allConfError;

    const participantsCount: Record<string, number> = {};
    allConfirmations?.forEach(conf => {
      participantsCount[conf.class_id] = (participantsCount[conf.class_id] || 0) + 1;
    });

    const formattedClasses: ClassDetails[] = classes?.map(c => ({
      id: c.id,
      day: c.day,
      time: c.time,
      date: '',
      location: c.location,
      instructor: c.instructor,
      max_participants: c.max_participants,
      confirmed_count: participantsCount[c.id] || 0
    })) || [];

    return formattedClasses;
  } catch (error) {
    console.error('Erro ao buscar aulas confirmadas:', error);
    return [];
  }
};

// Buscar detalhes de uma aula por ID
export const fetchClassById = async (classId: string): Promise<ClassDetails | null> => {
  try {
    const { data: c, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();

    if (error) throw error;
    if (!c) return null;

    const { count, error: countError } = await supabase
      .from('class_confirmations')
      .select('id', { count: 'exact', head: true })
      .eq('class_id', classId);

    if (countError) throw countError;

    return {
      id: c.id,
      day: c.day,
      time: c.time,
      date: '',
      location: c.location,
      instructor: c.instructor,
      max_participants: c.max_participants,
      confirmed_count: count || 0
    };
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
