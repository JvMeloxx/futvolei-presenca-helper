
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ClassCard from '../components/ClassCard';
import { Calendar, Clock, MapPin, Users, Info } from 'lucide-react';
import { useAuth } from '@/contexts/NeonAuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ClassListSkeleton } from '@/components/ui/skeleton';

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

// Enhanced class schedule with more details
const classesByDay = {
  monday: [
    { id: 'm1', time: '8:30', confirmedCount: 6, professor: 'Roberto', location: 'Arena Beach', maxCapacity: 12, details: 'Treino técnico para iniciantes' },
    { id: 'm2', time: '17:00', confirmedCount: 8, professor: 'Carlos', location: 'Arena Beach', maxCapacity: 12, details: 'Treino tático avançado' },
    { id: 'm3', time: '18:30', confirmedCount: 10, professor: 'Roberto', location: 'Arena Beach', maxCapacity: 12, details: 'Treino para intermediários' },
    { id: 'm4', time: '20:00', confirmedCount: 4, professor: 'Carlos', location: 'Arena Beach', maxCapacity: 12, details: 'Treino livre' },
  ],
  tuesday: [
    { id: 't1', time: '6:30', confirmedCount: 3, professor: 'Roberto', location: 'Arena Beach', maxCapacity: 10, details: 'Treino matinal para iniciantes' },
    { id: 't2', time: '8:00', confirmedCount: 7, professor: 'Roberto', location: 'Arena Beach', maxCapacity: 12, details: 'Treino técnico para iniciantes' },
    { id: 't3', time: '12:00', confirmedCount: 5, professor: 'Carlos', location: 'Arena Beach', maxCapacity: 10, details: 'Treino especial' },
    { id: 't4', time: '17:00', confirmedCount: 9, professor: 'Carlos', location: 'Arena Beach', maxCapacity: 12, details: 'Treino tático avançado' },
    { id: 't5', time: '18:30', confirmedCount: 12, professor: 'Roberto', location: 'Arena Beach', maxCapacity: 14, details: 'Treino para intermediários' },
    { id: 't6', time: '20:00', confirmedCount: 8, professor: 'Carlos', location: 'Arena Beach', maxCapacity: 12, details: 'Treino livre' },
  ],
  wednesday: [
    { id: 'w1', time: '8:30', confirmedCount: 5, professor: 'Roberto', location: 'Arena Beach', maxCapacity: 12, details: 'Treino técnico para iniciantes' },
    { id: 'w2', time: '17:00', confirmedCount: 7, professor: 'Carlos', location: 'Arena Beach', maxCapacity: 12, details: 'Treino tático avançado' },
    { id: 'w3', time: '18:30', confirmedCount: 9, professor: 'Roberto', location: 'Arena Beach', maxCapacity: 12, details: 'Treino para intermediários' },
    { id: 'w4', time: '20:00', confirmedCount: 6, professor: 'Carlos', location: 'Arena Beach', maxCapacity: 12, details: 'Treino livre' },
  ],
  thursday: [
    { id: 'th1', time: '6:30', confirmedCount: 4, professor: 'Roberto', location: 'Arena Beach', maxCapacity: 10, details: 'Treino matinal para iniciantes' },
    { id: 'th2', time: '8:00', confirmedCount: 6, professor: 'Roberto', location: 'Arena Beach', maxCapacity: 12, details: 'Treino técnico para iniciantes' },
    { id: 'th3', time: '12:00', confirmedCount: 8, professor: 'Carlos', location: 'Arena Beach', maxCapacity: 10, details: 'Treino especial' },
    { id: 'th4', time: '17:00', confirmedCount: 10, professor: 'Carlos', location: 'Arena Beach', maxCapacity: 12, details: 'Treino tático avançado' },
    { id: 'th5', time: '18:30', confirmedCount: 12, professor: 'Roberto', location: 'Arena Beach', maxCapacity: 14, details: 'Treino para intermediários' },
    { id: 'th6', time: '20:00', confirmedCount: 7, professor: 'Carlos', location: 'Arena Beach', maxCapacity: 12, details: 'Treino livre' },
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
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Function to generate current week dates
  const generateCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    return weekDays.map((day, index) => {
      // Convert weekday index (0=Monday in our array) to JS Date day (0=Sunday)
      const jsIndex = index === 6 ? 0 : index + 1;
      
      // Calculate date offset
      const dateOffset = jsIndex - currentDay;
      const date = new Date(today);
      date.setDate(today.getDate() + dateOffset);
      
      return {
        ...day,
        date: date,
        dayOfMonth: date.getDate(),
        isPast: dateOffset < 0,
        isToday: dateOffset === 0,
        isFuture: dateOffset > 0
      };
    });
  };
  
  const weekDaysWithDates = generateCurrentWeekDates();
  
  useEffect(() => {
    // Simulate loading time
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

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

    return () => clearTimeout(loadingTimer);
  }, []);
  
  const getMonthName = () => {
    const date = new Date();
    return new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
  };
  
  const openClassDetails = (classItem: any) => {
    setSelectedClass(classItem);
    setIsDetailsOpen(true);
  };
  
  const selectedDayClasses = classesByDay[selectedDay as keyof typeof classesByDay] || [];

  // Get user preferred days for highlighting
  const userPreferredDays = user?.user_metadata?.preferred_days || [];
  
  // Ensure preferred days is always an array
  let preferredDaysArray: string[] = [];
  if (userPreferredDays) {
    // Check if it's already an array
    if (Array.isArray(userPreferredDays)) {
      preferredDaysArray = userPreferredDays;
    } else if (typeof userPreferredDays === 'string') {
      // If it's a comma-separated string, split it
      preferredDaysArray = userPreferredDays.split(',');
    }
  }
  
  // Convert preferred days to day values
  const preferredDayValues = preferredDaysArray
    .map((day: string) => weekDays.find(d => d.name === day)?.value)
    .filter(Boolean);

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Agenda</h1>
          <span className="text-sm text-muted-foreground">
            Semana atual
          </span>
        </div>
        
        {/* Days of the week selector */}
        <div className="glass-effect rounded-2xl p-3 mb-6">
          <div className="grid grid-cols-7 gap-1">
            {weekDaysWithDates.map((day, index) => {
              const isPreferredDay = preferredDayValues.includes(day.value);
              
              return (
                <button
                  key={day.value}
                  onClick={() => day.hasClasses && !day.isPast && setSelectedDay(day.value)}
                  disabled={!day.hasClasses || day.isPast}
                  className={`
                    flex flex-col items-center justify-center p-2 rounded-xl relative
                    ${selectedDay === day.value ? 'bg-primary text-primary-foreground' : ''}
                    ${day.isToday && selectedDay !== day.value ? 'bg-secondary text-secondary-foreground' : ''}
                    ${isPreferredDay && !selectedDay && !day.isToday ? 'bg-primary/20' : ''}
                    ${!day.hasClasses || day.isPast ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary/50 cursor-pointer'}
                    transition-all duration-200
                  `}
                >
                  <span className="text-xs font-medium">{day.name.substring(0, 3)}</span>
                  <span className={`text-lg ${day.isToday ? 'font-bold' : 'font-medium'}`}>{day.dayOfMonth}</span>
                  
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
            isLoading ? (
              <ClassListSkeleton count={4} />
            ) : (
              <div className="grid grid-cols-1 gap-4 animate-in fade-in-0 duration-500">
                {selectedDayClasses.map((classItem, index) => {
                  const dayName = weekDays.find(d => d.value === selectedDay)?.name || '';
                  const dayDate = weekDaysWithDates.find(d => d.value === selectedDay)?.dayOfMonth || '';
                  
                  // Also fix here for preferred times
                  const userPreferredTimes = user?.user_metadata?.preferred_times || [];
                  let preferredTimesArray: string[] = [];
                  
                  if (userPreferredTimes) {
                    if (Array.isArray(userPreferredTimes)) {
                      preferredTimesArray = userPreferredTimes;
                    } else if (typeof userPreferredTimes === 'string') {
                      preferredTimesArray = userPreferredTimes.split(',');
                    }
                  }
                  
                  const isUserPreferredTime = preferredTimesArray.includes(classItem.time.replace(':', 'h'));
                  
                  return (
                    <div 
                      key={classItem.id} 
                      className="animate-in slide-in-from-bottom-4 duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <ClassCard 
                        id={classItem.id}
                        day={dayName}
                        date={`${dayDate} ${getMonthName()}`}
                        time={classItem.time}
                        confirmedCount={classItem.confirmedCount}
                        maxParticipants={classItem.maxCapacity}
                        location={classItem.location}
                        instructor={classItem.professor}
                        isPast={false}
                        isSelected={isUserPreferredTime}
                        onClick={() => openClassDetails(classItem)}
                      />
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            isLoading ? (
              <ClassListSkeleton count={2} />
            ) : (
              <div className="text-center py-8 text-muted-foreground animate-in fade-in-0 duration-500">
                <p>Nenhuma aula disponível neste dia</p>
              </div>
            )
          )}
        </div>
        
        {/* Class Details Modal */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="glass-effect text-foreground">
            <DialogHeader>
              <DialogTitle className="text-xl text-foreground">
                Detalhes da Aula
              </DialogTitle>
              <DialogDescription className="text-foreground/80">
                Informações completas sobre o horário selecionado
              </DialogDescription>
            </DialogHeader>
            
            {selectedClass && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-primary mr-2" />
                  <div>
                    <p className="font-medium">Horário:</p>
                    <p>{selectedClass.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-primary mr-2" />
                  <div>
                    <p className="font-medium">Participantes:</p>
                    <p>{selectedClass.confirmedCount} confirmados / {selectedClass.maxCapacity} vagas</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-primary mr-2" />
                  <div>
                    <p className="font-medium">Local:</p>
                    <p>{selectedClass.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Info className="w-5 h-5 text-primary mr-2" />
                  <div>
                    <p className="font-medium">Professor:</p>
                    <p>{selectedClass.professor}</p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <p className="font-medium">Detalhes:</p>
                  <p className="mt-1 text-primary-foreground/80">{selectedClass.details}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Schedule;
