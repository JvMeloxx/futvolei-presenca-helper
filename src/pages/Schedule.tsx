
import React, { useState } from 'react';
import Layout from '../components/Layout';
import ClassCard from '../components/ClassCard';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

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

const Schedule: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState('monday');
  const [currentWeek, setCurrentWeek] = useState(0);
  
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
            >
              <ChevronLeft size={20} />
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
              
              return (
                <button
                  key={day.value}
                  onClick={() => day.hasClasses && setSelectedDay(day.value)}
                  disabled={!day.hasClasses || pastDay}
                  className={`
                    flex flex-col items-center justify-center p-2 rounded-xl
                    ${selectedDay === day.value ? 'bg-primary text-primary-foreground' : ''}
                    ${today && selectedDay !== day.value ? 'bg-secondary text-secondary-foreground' : ''}
                    ${!day.hasClasses || pastDay ? 'opacity-50 cursor-not-allowed' : 'hover:bg-secondary/50 cursor-pointer'}
                    transition-all duration-200
                  `}
                >
                  <span className="text-xs font-medium">{day.name.substring(0, 3)}</span>
                  <span className={`text-lg ${today ? 'font-bold' : 'font-medium'}`}>{dayDate}</span>
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
              {selectedDayClasses.map((classItem, index) => (
                <div key={classItem.id} className="staggered-item">
                  <ClassCard 
                    id={classItem.id}
                    day={weekDays.find(d => d.value === selectedDay)?.name || ''}
                    date={`${getCurrentDate(weekDays.findIndex(d => d.value === selectedDay))} ${getMonthName()}`}
                    time={classItem.time}
                    confirmedCount={classItem.confirmedCount}
                    isPast={false}
                  />
                </div>
              ))}
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
