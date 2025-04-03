
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { findNextClass } from '@/repositories/classRepository';

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

// Reverse map for display
const reverseWeekdayMap = {
  0: 'Domingo',
  1: 'Segunda',
  2: 'Terça',
  3: 'Quarta',
  4: 'Quinta',
  5: 'Sexta',
  6: 'Sábado'
};

// Map day names to classesByDay keys
const dayToClassesMap = {
  'Segunda': 'monday',
  'Terça': 'tuesday',
  'Quarta': 'wednesday',
  'Quinta': 'thursday',
};

export const useClassManagement = (classesByDay: Record<string, any[]>) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [nextClass, setNextClass] = useState<any | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Load user's preferred days and find next class
    if (user) {
      const metadata = user.user_metadata || {};
      const preferredDays = metadata.preferred_days || [];
      
      if (preferredDays.length > 0) {
        // Calculate next classes based on preferred days
        calculateNextAndUpcomingClasses(preferredDays);
      } else {
        // Default upcoming classes if no preferences
        setUpcomingClasses([
          { id: '1', day: 'Segunda', date: '12 Ago', time: '18:30', confirmedCount: 8 },
          { id: '2', day: 'Terça', date: '13 Ago', time: '17:00', confirmedCount: 5 },
          { id: '3', day: 'Quarta', date: '14 Ago', time: '20:00', confirmedCount: 12 },
        ]);
      }
    }
  }, [user]);

  const calculateNextAndUpcomingClasses = (preferredDays: string[]) => {
    // Find next class
    const nextClassInfo = findNextClass(preferredDays, classesByDay);
    if (nextClassInfo) {
      setNextClass(nextClassInfo);
    }
    
    const today = currentTime.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const upcoming: any[] = [];
    
    // Set upcoming classes (max 3)
    for (const day of preferredDays) {
      const dayKey = dayToClassesMap[day as keyof typeof dayToClassesMap];
      const dayClasses = classesByDay[dayKey as keyof typeof classesByDay] || [];
      
      if (dayClasses.length > 0) {
        // Add first class of this day to upcoming
        upcoming.push({
          id: dayClasses[0].id,
          day: day,
          date: formatNextDate(day),
          time: dayClasses[0].time,
          confirmedCount: dayClasses[0].confirmedCount
        });
        
        if (upcoming.length >= 3) break;
      }
    }
    
    setUpcomingClasses(upcoming);
  };

  const formatNextDate = (dayName: string) => {
    const today = currentTime.getDay();
    const targetDay = weekdayMap[dayName as keyof typeof weekdayMap];
    let daysToAdd = targetDay - today;
    
    if (daysToAdd <= 0) {
      daysToAdd += 7; // Move to next week
    }
    
    const nextDate = new Date(currentTime);
    nextDate.setDate(currentTime.getDate() + daysToAdd);
    
    return `${nextDate.getDate()} ${new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(nextDate)}`;
  };

  const handleConfirmClass = (classId: string, day: string, date: string, time: string) => {
    if (!user) {
      toast({
        title: "Autenticação necessária",
        description: "Faça login para confirmar sua presença na aula.",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    // Check if it's a preferred day
    const preferredDays = user.user_metadata?.preferred_days || [];
    const isPreferredDay = Array.isArray(preferredDays) && preferredDays.includes(day);
    
    setSelectedClass({
      id: classId,
      day,
      date,
      time,
      isPreferredDay
    });
    
    setShowConfirmationModal(true);
  };

  const handleConfirmNextClass = () => {
    if (!nextClass) return;
    handleConfirmClass(nextClass.id, nextClass.day, nextClass.date, nextClass.time);
  };

  const handleConfirmSuccess = () => {
    // Refresh the class list after successful confirmation
    if (user?.user_metadata?.preferred_days) {
      calculateNextAndUpcomingClasses(user.user_metadata.preferred_days);
    }
  };

  const handleCloseModal = () => {
    setShowConfirmationModal(false);
  };

  // Format date for display
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(currentTime);

  return {
    currentTime,
    formattedDate,
    nextClass,
    upcomingClasses,
    selectedClass,
    showConfirmationModal,
    handleConfirmClass,
    handleConfirmNextClass,
    handleConfirmSuccess,
    handleCloseModal,
  };
};
