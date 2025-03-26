
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ClassCard from '../components/ClassCard';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

// Mock data for weekdays and classes
const weekDays = [
  { name: 'Segunda', value: 'monday', hasClasses: true },
  { name: 'Terça', value: 'tuesday', hasClasses: true },
  { name: 'Quarta', value: 'wednesday', hasClasses: true },
  { name: 'Quinta', value: 'thursday', hasClasses: true },
  { name: 'Sexta', value: 'friday', hasClasses: false },
  { name: 'Sábado', value: 'saturday', hasClasses: false },
  { name: 'Domingo', value: 'sunday', hasClasses: false },
];

// Class schedule by day
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
const dayToClassesMap: {[key: string]: string} = {
  'Segunda': 'monday',
  'Terça': 'tuesday',
  'Quarta': 'wednesday',
  'Quinta': 'thursday',
};

const Schedule: React.FC = () => {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState('');
  const [currentWeek, setCurrentWeek] = useState(0);
  
  useEffect(() => {
    // Set the selected day to the current day or first day with classes
    const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
    const adjustedToday = today === 0 ? 6 : today - 1; // Convert to 0 = Monday
    
    // Find the corresponding day value
    const todayValue = weekDays[adjustedToday]?.value;
    
    // Check if today has classes
    if (todayValue && weekDays[adjustedToday]?.hasClasses) {
      setSelectedDay(todayValue);
    } else {
      // Find the next day with classes
      const nextDayWithClasses = weekDays.find((day, index) => 
        index >= adjustedToday && day.hasClasses
      );
      
      if (nextDayWithClasses) {
        setSelectedDay(nextDayWithClasses.value);
      } else {
        // If no days after today have classes, select the first day with classes
        const firstDayWithClasses = weekDays.find(day => day.hasClasses);
        if (firstDayWithClasses) {
          setSelectedDay(firstDayWithClasses.value);
        }
      }
    }
  }, []);
  
  const getCurrentDate = (dayOffset: number) => {
    const date = new Date();
    date.setDate(date.getDate() + (currentWeek * 7) + dayOffset);
    return date.getDate();
  };
  
  const getMonthName = () => {
    const date = new Date();
    date.setDate(date.getDate() + (currentWeek * 7));
    return new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
  };
  
  const isToday = (dayIndex: number) => {
    if (currentWeek !== 0) return false;
    const today = new Date().getDay();
    // Convert from Sunday-based (0) to Monday-based (0)
    const adjustedToday = today === 0 ? 6 : today - 1;
    return adjustedToday === dayIndex;
  };
  
  const isPastDay = (dayIndex: number) => {
    if (currentWeek < 0) return true;
    if (currentWeek > 0) return false;
    
    const today = new Date().getDay();
    // Convert from Sunday-based (0) to Monday-based (0)
    const adjustedToday = today === 0 ? 6 : today - 1;
    return dayIndex < adjustedToday;
  };
  
  const handlePrevWeek = () => {
    setCurrentWeek(prev => prev - 1);
  };
  
  const handleNextWeek = () => {
    setCurrentWeek(prev => prev + 1);
  };
  
  const selectedDayClasses = classesByDay[selectedDay as keyof typeof classesByDay] || [];

  // Get user preferred days for highlighting
  const userPreferredDays = user?.user_metadata?.preferred_days || [];
  
  // Convert preferred days to day values
  const preferredDayValues = userPreferredDays.map((day: string) => 
    weekDays.find(d => d.name === day)?.value
  ).filter(Boolean);

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Agenda</h1>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handlePrevWeek}
              className="p-2 rounded-full hover:bg-secondary text-foreground"
              disabled={currentWeek < 0}
            >
              <ChevronLeft size={20} className={currentWeek < 0 ? "text-muted-foreground" : ""} />
            </button>
            <span className="text-sm font-medium">
              {currentWeek === 0 ? 'Esta semana' : 
               currentWeek < 0 ? `${Math.abs(currentWeek)} semana${Math.abs(currentWeek) > 1 ? 's' : ''} atrás` : 
               `${currentWeek} semana${currentWeek > 1 ? 's' : ''} à frente`}
            </span>
            <button 
              onClick={handleNextWeek}
              className="p-2 rounded-full hover:bg-secondary text-foreground"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        
        {/* Days of the week selector */}
        <div className="glass-effect rounded-2xl p-3 mb-6">
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, index) => {
              const dayDate = getCurrentDate(index);
              const today = isToday(index);
              const pastDay = isPastDay(index);
              const isPreferredDay = preferredDayValues.includes(day.value);
              
              return (
                <button
                  key={day.value}
                  onClick={() => day.hasClasses && !pastDay && setSelectedDay(day.value)}
                  disabled={!day.hasClasses || pastDay}
                  className={`
                    flex flex-col items-center justify-center p-2 rounded-xl relative
                    ${selectedDay === day.value ? 'bg-primary text-primary-foreground' : ''}
                    ${today && selectedDay !== day.value ? 'bg-secondary text-secondary-foreground' : ''}
                    ${isPreferredDay && !selectedDay && !today ? 'bg-primary/20' : ''}
                    ${!day.hasClasses || pastDay ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary/50 cursor-pointer'}
                    transition-all duration-200
                  `}
                >
                  <span className="text-xs font-medium">{day.name.substring(0, 3)}</span>
                  <span className={`text-lg ${today ? 'font-bold' : 'font-medium'}`}>{dayDate}</span>
                  
                  {isPreferredDay && (
                    <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-primary"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Selected day classes */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Calendar size={18} className="mr-2" />
              Horários disponíveis
            </h2>
            <span className="text-sm text-muted-foreground">
              {getMonthName()}
            </span>
          </div>
          
          {selectedDayClasses.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {selectedDayClasses.map((classItem, index) => {
                const dayName = weekDays.find(d => d.value === selectedDay)?.name || '';
                const isUserPreferredTime = user?.user_metadata?.preferred_times?.includes(classItem.time.replace(':', 'h'));
                
                return (
                  <div key={classItem.id} className="staggered-item">
                    <ClassCard 
                      id={classItem.id}
                      day={dayName}
                      date={`${getCurrentDate(weekDays.findIndex(d => d.value === selectedDay))} ${getMonthName()}`}
                      time={classItem.time}
                      confirmedCount={classItem.confirmedCount}
                      isPast={false}
                      isSelected={isUserPreferredTime}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhuma aula disponível neste dia</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Schedule;
