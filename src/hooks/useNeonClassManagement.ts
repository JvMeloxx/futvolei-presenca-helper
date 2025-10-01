import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/NeonAuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import {
  fetchAllClasses,
  fetchUserConfirmedClasses,
  confirmClass,
  cancelClassConfirmation,
  checkUserConfirmation
} from '@/repositories/neonClassRepository';
import { ClassDetails } from '@/models/ClassConfirmation';

// Map of weekdays
const weekdayMap = {
  'Domingo': 0,
  'Segunda': 1,
  'Terça': 2,
  'Quarta': 3,
  'Quinta': 4,
  'Sexta': 5,
  'Sábado': 6
};

export const useNeonClassManagement = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [allClasses, setAllClasses] = useState<ClassDetails[]>([]);
  const [userConfirmedClasses, setUserConfirmedClasses] = useState<ClassDetails[]>([]);
  const [upcomingClasses, setUpcomingClasses] = useState<ClassDetails[]>([]);
  const [nextClass, setNextClass] = useState<ClassDetails | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Atualizar tempo a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

  // Carregar aulas quando o usuário estiver logado
  useEffect(() => {
    if (user) {
      loadClasses();
    }
  }, [user]);

  // Calcular próximas aulas quando as aulas ou preferências mudarem
  useEffect(() => {
    if (user && allClasses.length > 0) {
      calculateNextAndUpcomingClasses();
    }
  }, [user, allClasses, currentTime]);

  const loadClasses = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Carregar todas as aulas
      const classes = await fetchAllClasses();
      
      // Verificar quais aulas o usuário confirmou e atualizar o status
      const classesWithUserStatus = await Promise.all(
        classes.map(async (classItem) => {
          const userConfirmed = await checkUserConfirmation(user.id, classItem.id);
          return {
            ...classItem,
            user_confirmed: userConfirmed
          };
        })
      );
      
      setAllClasses(classesWithUserStatus);
      
      // Carregar aulas confirmadas pelo usuário
      const confirmedClasses = await fetchUserConfirmedClasses(user.id);
      setUserConfirmedClasses(confirmedClasses);
    } catch (error) {
      console.error('Erro ao carregar aulas:', error);
      toast({
        title: "Erro ao carregar aulas",
        description: "Não foi possível carregar as aulas. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateNextAndUpcomingClasses = () => {
    if (!user || allClasses.length === 0) return;
    
    // Obter preferências do usuário com tratamento para diferentes formatos
    const userMetadata = user.user_metadata || {};
    let preferredDays: string[] = [];
    let preferredTimes: string[] = [];
    
    // Tratar preferred_days
    if (userMetadata.preferred_days) {
      if (Array.isArray(userMetadata.preferred_days)) {
        preferredDays = userMetadata.preferred_days;
      } else if (typeof userMetadata.preferred_days === 'string') {
        preferredDays = userMetadata.preferred_days.split(',').map(d => d.trim());
      }
    }
    
    // Tratar preferred_times
    if (userMetadata.preferred_times) {
      if (Array.isArray(userMetadata.preferred_times)) {
        preferredTimes = userMetadata.preferred_times;
      } else if (typeof userMetadata.preferred_times === 'string') {
        preferredTimes = userMetadata.preferred_times.split(',').map(t => t.trim());
      }
    }
    
    const today = currentTime.getDay();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    
    // Mapear nomes de dias para comparação
    const dayMappings: {[key: string]: string[]} = {
      'Segunda': ['Segunda-feira', 'Segunda', 'monday'],
      'Terça': ['Terça-feira', 'Terça', 'tuesday'],
      'Quarta': ['Quarta-feira', 'Quarta', 'wednesday'],
      'Quinta': ['Quinta-feira', 'Quinta', 'thursday'],
      'Sexta': ['Sexta-feira', 'Sexta', 'friday'],
      'Sábado': ['Sábado', 'saturday'],
      'Domingo': ['Domingo', 'sunday']
    };
    
    // Função para normalizar horários (converter 20h para 20:00)
    const normalizeTime = (time: string): string => {
      return time.replace('h', ':').replace(/:(\d)$/, ':$10').replace(/^(\d):/, '0$1:');
    };
    
    // Função para calcular minutos desde o início do dia
    const timeToMinutes = (time: string): number => {
      const normalized = normalizeTime(time);
      const [hours, minutes] = normalized.split(':').map(Number);
      return hours * 60 + (minutes || 0);
    };
    
    // Se o usuário tem preferências, filtrar aulas baseadas nelas
    let relevantClasses = allClasses;
    
    if (preferredDays.length > 0 && preferredTimes.length > 0) {
      // Filtrar por dias E horários preferidos
      relevantClasses = allClasses.filter(classItem => {
        const dayMatches = preferredDays.some(prefDay => {
          const possibleNames = Object.values(dayMappings).find(names => 
            names.includes(prefDay)
          ) || [prefDay];
          return possibleNames.includes(classItem.day);
        });
        
        const timeMatches = preferredTimes.some(prefTime => {
          const normalizedPrefTime = normalizeTime(prefTime);
          const normalizedClassTime = normalizeTime(classItem.time);
          return normalizedPrefTime === normalizedClassTime;
        });
        
        return dayMatches && timeMatches;
      });
    } else if (preferredDays.length > 0) {
      // Filtrar apenas por dias preferidos
      relevantClasses = allClasses.filter(classItem => {
        return preferredDays.some(prefDay => {
          const possibleNames = Object.values(dayMappings).find(names => 
            names.includes(prefDay)
          ) || [prefDay];
          return possibleNames.includes(classItem.day);
        });
      });
    } else if (preferredTimes.length > 0) {
      // Filtrar apenas por horários preferidos
      relevantClasses = allClasses.filter(classItem => {
        return preferredTimes.some(prefTime => {
          const normalizedPrefTime = normalizeTime(prefTime);
          const normalizedClassTime = normalizeTime(classItem.time);
          return normalizedPrefTime === normalizedClassTime;
        });
      });
    }
    
    // Se não há aulas nas preferências, usar todas as aulas
    if (relevantClasses.length === 0) {
      relevantClasses = allClasses;
    }
    
    // Encontrar a próxima aula com lógica inteligente
    let nextClassCandidate: ClassDetails | null = null;
    let minTimeUntil = Infinity;
    
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    for (const classItem of relevantClasses) {
      const classDayIndex = weekdayMap[classItem.day as keyof typeof weekdayMap];
      const classTimeInMinutes = timeToMinutes(classItem.time);
      
      // Calcular diferença em dias
      let daysUntil = classDayIndex - today;
      
      // Se é hoje, verificar se ainda não passou o horário
      if (daysUntil === 0) {
        if (classTimeInMinutes <= currentTimeInMinutes) {
          daysUntil = 7; // Próxima semana
        }
      } else if (daysUntil < 0) {
        daysUntil += 7; // Próxima semana
      }
      
      // Calcular tempo total até a aula em minutos
      const totalMinutesUntil = (daysUntil * 24 * 60) + classTimeInMinutes - currentTimeInMinutes;
      
      // Priorizar aulas das preferências do usuário
      let priority = 0;
      
      if (preferredDays.length > 0) {
        const dayMatches = preferredDays.some(prefDay => {
          const possibleNames = Object.values(dayMappings).find(names => 
            names.includes(prefDay)
          ) || [prefDay];
          return possibleNames.includes(classItem.day);
        });
        if (dayMatches) priority += 1000000; // Alta prioridade para dias preferidos
      }
      
      if (preferredTimes.length > 0) {
        const timeMatches = preferredTimes.some(prefTime => {
          const normalizedPrefTime = normalizeTime(prefTime);
          const normalizedClassTime = normalizeTime(classItem.time);
          return normalizedPrefTime === normalizedClassTime;
        });
        if (timeMatches) priority += 1000000; // Alta prioridade para horários preferidos
      }
      
      // Subtrair prioridade do tempo total para dar preferência
      const adjustedTimeUntil = totalMinutesUntil - priority;
      
      if (adjustedTimeUntil < minTimeUntil) {
        minTimeUntil = adjustedTimeUntil;
        nextClassCandidate = classItem;
      }
    }
    
    // Adicionar informações de data formatada para a próxima aula
    if (nextClassCandidate) {
      const classDayIndex = weekdayMap[nextClassCandidate.day as keyof typeof weekdayMap];
      let daysUntil = classDayIndex - today;
      
      if (daysUntil === 0) {
        const classTimeInMinutes = timeToMinutes(nextClassCandidate.time);
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        if (classTimeInMinutes <= currentTimeInMinutes) {
          daysUntil = 7;
        }
      } else if (daysUntil < 0) {
        daysUntil += 7;
      }
      
      // Calcular a data da próxima aula
      const nextClassDate = new Date(currentTime);
      nextClassDate.setDate(currentTime.getDate() + daysUntil);
      
      // Formatar a data
      const formattedDate = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(nextClassDate);
      
      // Adicionar informações extras à próxima aula
      nextClassCandidate = {
        ...nextClassCandidate,
        date: formattedDate,
        isPreferredDay: preferredDays.length > 0 ? preferredDays.some(prefDay => {
          const possibleNames = Object.values(dayMappings).find(names => 
            names.includes(prefDay)
          ) || [prefDay];
          return possibleNames.includes(nextClassCandidate!.day);
        }) : false,
        isPreferredTime: preferredTimes.length > 0 ? preferredTimes.some(prefTime => {
          const normalizedPrefTime = normalizeTime(prefTime);
          const normalizedClassTime = normalizeTime(nextClassCandidate!.time);
          return normalizedPrefTime === normalizedClassTime;
        }) : false
      };
    }
    
    setNextClass(nextClassCandidate);
    
    // Definir próximas aulas (máximo 3) com datas formatadas
    const upcomingWithDates = relevantClasses
      .filter(classItem => classItem.id !== nextClassCandidate?.id)
      .slice(0, 3)
      .map(classItem => {
        const classDayIndex = weekdayMap[classItem.day as keyof typeof weekdayMap];
        let daysUntil = classDayIndex - today;
        
        if (daysUntil === 0) {
          const classTimeInMinutes = timeToMinutes(classItem.time);
          const currentTimeInMinutes = currentHour * 60 + currentMinute;
          if (classTimeInMinutes <= currentTimeInMinutes) {
            daysUntil = 7;
          }
        } else if (daysUntil < 0) {
          daysUntil += 7;
        }
        
        const classDate = new Date(currentTime);
        classDate.setDate(currentTime.getDate() + daysUntil);
        
        const formattedDate = new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }).format(classDate);
        
        return {
          ...classItem,
          date: formattedDate,
          isPreferredDay: preferredDays.length > 0 ? preferredDays.some(prefDay => {
            const possibleNames = Object.values(dayMappings).find(names => 
              names.includes(prefDay)
            ) || [prefDay];
            return possibleNames.includes(classItem.day);
          }) : false,
          isPreferredTime: preferredTimes.length > 0 ? preferredTimes.some(prefTime => {
            const normalizedPrefTime = normalizeTime(prefTime);
            const normalizedClassTime = normalizeTime(classItem.time);
            return normalizedPrefTime === normalizedClassTime;
          }) : false
        };
      });
    
    setUpcomingClasses(upcomingWithDates);
  };

  const handleConfirmClass = (classItem: ClassDetails) => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para confirmar sua presença na aula.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    // Verificar se é um dia preferido
    const preferredDays = user.preferred_days || [];
    const isPreferredDay = preferredDays.includes(classItem.day);
    
    setSelectedClass({
      ...classItem,
      isPreferredDay
    } as any);
    
    setShowConfirmationModal(true);
  };

  const handleConfirmNextClass = () => {
    if (!nextClass) return;
    handleConfirmClass(nextClass);
  };

  const executeConfirmation = async (classId: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const result = await confirmClass(user.id, classId);
      
      if (result.success) {
        toast({
          title: "Presença confirmada!",
          description: "Sua presença foi confirmada com sucesso.",
        });
        
        // Recarregar aulas para atualizar contadores
        await loadClasses();
      } else {
        toast({
          title: "Erro ao confirmar presença",
          description: result.error || "Não foi possível confirmar sua presença.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao confirmar aula:', error);
      toast({
        title: "Erro ao confirmar presença",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeCancellation = async (classId: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const result = await cancelClassConfirmation(user.id, classId);
      
      if (result.success) {
        toast({
          title: "Confirmação cancelada",
          description: "Sua confirmação foi cancelada com sucesso.",
        });
        
        // Recarregar aulas para atualizar contadores
        await loadClasses();
      } else {
        toast({
          title: "Erro ao cancelar confirmação",
          description: result.error || "Não foi possível cancelar sua confirmação.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao cancelar confirmação:', error);
      toast({
        title: "Erro ao cancelar confirmação",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSuccess = () => {
    // Fechar modal e recarregar dados
    setShowConfirmationModal(false);
    loadClasses();
  };

  const handleCloseModal = () => {
    setShowConfirmationModal(false);
  };

  // Formatar data para exibição
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(currentTime);

  return {
    currentTime,
    formattedDate,
    allClasses,
    userConfirmedClasses,
    nextClass,
    upcomingClasses,
    selectedClass,
    showConfirmationModal,
    isLoading,
    handleConfirmClass,
    handleConfirmNextClass,
    executeConfirmation,
    executeCancellation,
    handleConfirmSuccess,
    handleCloseModal,
    loadClasses,
  };
};

// Alias para manter compatibilidade
export const useClassManagement = useNeonClassManagement;