
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import ClassCard from '../components/ClassCard';
import UserAvatar from '../components/UserAvatar';
import Button from '../components/Button';
import { Calendar, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ClassConfirmationModal from '@/components/ClassConfirmationModal';
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

// Class schedule by day (same data structure as in Schedule.tsx)
const classesByDay = {
  monday: [
    { id: 'm1', time: '8:30', confirmedCount: 6 },
    { id: 'm2', time: '17:00', confirmedCount: 8 },
    { id: 'm3', time: '18:30', confirmedCount: 10 },
    { id: 'm4', time: '20:00', confirmedCount: 4 },
  ],
  tuesday: [
    { id: 't1', time: '6:30', confirmedCount: 3 },
    { id: 't2', time: '8:00', confirmedCount: 7 },
    { id: 't3', time: '12:00', confirmedCount: 5 },
    { id: 't4', time: '17:00', confirmedCount: 9 },
    { id: 't5', time: '18:30', confirmedCount: 12 },
    { id: 't6', time: '20:00', confirmedCount: 8 },
  ],
  wednesday: [
    { id: 'w1', time: '8:30', confirmedCount: 5 },
    { id: 'w2', time: '17:00', confirmedCount: 7 },
    { id: 'w3', time: '18:30', confirmedCount: 9 },
    { id: 'w4', time: '20:00', confirmedCount: 6 },
  ],
  thursday: [
    { id: 'th1', time: '6:30', confirmedCount: 4 },
    { id: 'th2', time: '8:00', confirmedCount: 6 },
    { id: 'th3', time: '12:00', confirmedCount: 8 },
    { id: 'th4', time: '17:00', confirmedCount: 10 },
    { id: 'th5', time: '18:30', confirmedCount: 12 },
    { id: 'th6', time: '20:00', confirmedCount: 7 },
  ],
};

// Map day names to classesByDay keys
const dayToClassesMap = {
  'Segunda': 'monday',
  'Terça': 'tuesday',
  'Quarta': 'wednesday',
  'Quinta': 'thursday',
};

const Index: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [nextClass, setNextClass] = useState<any | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const { user, isLoading } = useAuth();
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
  
  const handleConfirmSuccess = () => {
    // Refresh the class list after successful confirmation
    if (user?.user_metadata?.preferred_days) {
      calculateNextAndUpcomingClasses(user.user_metadata.preferred_days);
    }
  };
  
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(currentTime);
  
  const formattedTime = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(currentTime);

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        {/* Header section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Olá, {user?.user_metadata?.full_name?.split(' ')[0] || 'Usuário'}!</h1>
            <p className="text-muted-foreground">{formattedDate}</p>
          </div>
          <UserAvatar 
            name={user?.user_metadata?.full_name || ''} 
            imageUrl={user?.user_metadata?.avatar_url || null} 
            size="md" 
          />
        </div>
        
        {/* Today's class highlight */}
        <div className="glass-effect rounded-2xl p-5 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold">Próxima Aula</h2>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock size={14} className="mr-1" />
              <span>{formattedTime}</span>
            </div>
          </div>
          
          {nextClass ? (
            <div className="bg-secondary rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{nextClass.day}, {nextClass.date}</p>
                  <h3 className="text-lg font-semibold">{nextClass.time}</h3>
                </div>
                <Button 
                  variant="primary" 
                  size="sm"
                  rightIcon={<ChevronRight size={16} />}
                  onClick={() => handleConfirmClass(nextClass.id, nextClass.day, nextClass.date, nextClass.time)}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-secondary rounded-xl p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sem aulas próximas</p>
                  <h3 className="text-lg font-semibold">Verifique a agenda</h3>
                </div>
                <Button 
                  variant="primary" 
                  size="sm"
                  rightIcon={<ChevronRight size={16} />}
                  onClick={() => navigate('/schedule')}
                >
                  Ver agenda
                </Button>
              </div>
            </div>
          )}
          
          <Link 
            to="/schedule" 
            className="flex items-center justify-center text-sm text-primary font-medium"
          >
            <Calendar size={14} className="mr-1" />
            Ver agenda completa
          </Link>
        </div>
        
        {/* Upcoming classes */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Próximas Aulas</h2>
            <Link to="/schedule" className="text-sm text-primary font-medium">
              Ver todas
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {upcomingClasses.length > 0 ? (
              upcomingClasses.map((classItem, index) => (
                <div key={classItem.id} className="staggered-item">
                  <ClassCard 
                    {...classItem} 
                    onClick={() => handleConfirmClass(classItem.id, classItem.day, classItem.date, classItem.time)}
                  />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Configure seus dias preferidos no perfil</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Confirmation Modal */}
      {selectedClass && (
        <ClassConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          classId={selectedClass.id}
          day={selectedClass.day}
          date={selectedClass.date}
          time={selectedClass.time}
          userName={user?.user_metadata?.full_name || 'Usuário'}
          isPreferredDay={selectedClass.isPreferredDay}
          onConfirmSuccess={handleConfirmSuccess}
        />
      )}
    </Layout>
  );
};

export default Index;
