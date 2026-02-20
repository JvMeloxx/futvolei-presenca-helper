
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ClassCard from '../components/ClassCard';
import { Calendar, Clock, MapPin, Users, Info } from 'lucide-react';
import { useAuth } from '@/contexts/NeonAuthContext';
import { useClassManagement } from '@/hooks/useNeonClassManagement';
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

// Mock data for weekdays and classes structure (Only to build the top selector)
const weekDays = [
  { name: 'Segunda', value: 'Segunda' },
  { name: 'Terça', value: 'Terça' },
  { name: 'Quarta', value: 'Quarta' },
  { name: 'Quinta', value: 'Quinta' },
  { name: 'Sexta', value: 'Sexta' },
  { name: 'Sábado', value: 'Sábado' },
  { name: 'Domingo', value: 'Domingo' },
];

const Schedule: React.FC = () => {
  const { user } = useAuth();
  const { allClasses, isLoading: isClassesLoading } = useClassManagement();

  const [selectedDay, setSelectedDay] = useState('');
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Function to generate current week dates dynamically depending on availability
  const generateCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

    return weekDays.map((day, index) => {
      const jsIndex = index === 6 ? 0 : index + 1; // 0=Sunday in JS, but 0=Monday in our Array!

      const dateOffset = jsIndex - currentDay;
      const date = new Date(today);
      date.setDate(today.getDate() + dateOffset);

      // Check if the backend has classes scheduled for this day string
      const hasClasses = allClasses.some((c) => c.day === day.value);

      return {
        ...day,
        date: date,
        dayOfMonth: date.getDate(),
        isPast: dateOffset < 0,
        isToday: dateOffset === 0,
        isFuture: dateOffset > 0,
        hasClasses: hasClasses
      };
    });
  };

  const weekDaysWithDates = generateCurrentWeekDates();

  useEffect(() => {
    // Artificial load to let Supabase finish fetching in hook
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    if (allClasses.length > 0) {
      // Set the selected day to the current day or first day with classes
      const today = new Date().getDay();
      const adjustedToday = today === 0 ? 6 : today - 1;
      const todayValue = weekDays[adjustedToday]?.value;
      const todayHasClasses = allClasses.some(c => c.day === todayValue);

      if (todayValue && todayHasClasses) {
        setSelectedDay(todayValue);
      } else {
        const nextDayWithClasses = weekDaysWithDates.find((day, index) =>
          index >= adjustedToday && day.hasClasses
        );

        if (nextDayWithClasses) {
          setSelectedDay(nextDayWithClasses.value);
        } else {
          const firstDayWithClasses = weekDaysWithDates.find(day => day.hasClasses);
          if (firstDayWithClasses) {
            setSelectedDay(firstDayWithClasses.value);
          }
        }
      }
    }

    return () => clearTimeout(loadingTimer);
  }, [allClasses]);

  const getMonthName = () => {
    const date = new Date();
    return new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
  };

  const openClassDetails = (classItem: any) => {
    setSelectedClass(classItem);
    setIsDetailsOpen(true);
  };

  // Filter classes dynamically from DB
  const selectedDayClasses = allClasses.filter(c => c.day === selectedDay) || [];

  // Get user preferred days for highlighting
  const userPreferredDays = user?.user_metadata?.preferred_days || [];
  let preferredDaysArray: string[] = [];

  if (userPreferredDays) {
    if (Array.isArray(userPreferredDays)) {
      preferredDaysArray = userPreferredDays;
    } else if (typeof userPreferredDays === 'string') {
      preferredDaysArray = userPreferredDays.split(',');
    }
  }

  // Convert preferred days directly using the DB's values ('Segunda', 'Terça', etc)
  const preferredDayValues = preferredDaysArray;

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
            isLoading || isClassesLoading ? (
              <ClassListSkeleton count={4} />
            ) : (
              <div className="grid grid-cols-1 gap-4 animate-in fade-in-0 duration-500">
                {selectedDayClasses.map((classItem, index) => {
                  const dayDate = weekDaysWithDates.find(d => d.value === selectedDay)?.dayOfMonth || '';

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
                        day={classItem.day}
                        date={`${dayDate} ${getMonthName()}`}
                        time={classItem.time}
                        confirmedCount={classItem.confirmed_count}
                        maxParticipants={classItem.max_participants}
                        location={classItem.location}
                        instructor={classItem.instructor}
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
            isLoading || isClassesLoading ? (
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
                    <p>{selectedClass.confirmed_count} confirmados / {selectedClass.max_participants} vagas</p>
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
                    <p>{selectedClass.instructor}</p>
                  </div>
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
