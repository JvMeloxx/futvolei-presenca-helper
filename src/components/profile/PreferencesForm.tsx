
import React from 'react';
import { Calendar, Clock } from 'lucide-react';

// Day and time options
const dayOptions = [
  { value: 'Segunda', label: 'Segunda-feira' },
  { value: 'Terça', label: 'Terça-feira' },
  { value: 'Quarta', label: 'Quarta-feira' },
  { value: 'Quinta', label: 'Quinta-feira' },
];

const timeOptions = [
  { value: '6h30', label: '6:30' },
  { value: '8h', label: '8:00' },
  { value: '8h30', label: '8:30' },
  { value: '12h', label: '12:00' },
  { value: '17h', label: '17:00' },
  { value: '18h30', label: '18:30' },
  { value: '20h', label: '20:00' },
];

interface PreferencesFormProps {
  preferredDays: string[];
  preferredTimes: string[];
  toggleDay: (day: string) => void;
  toggleTime: (time: string) => void;
}

const PreferencesForm: React.FC<PreferencesFormProps> = ({ 
  preferredDays, 
  preferredTimes, 
  toggleDay, 
  toggleTime 
}) => {
  return (
    <div className="glass-effect rounded-2xl p-5 mb-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Calendar size={18} className="mr-2" />
        Dias Preferenciais
      </h2>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        {dayOptions.map(day => (
          <button
            key={day.value}
            onClick={() => toggleDay(day.value)}
            className={`
              py-2 px-3 rounded-lg border text-sm font-medium transition-all duration-200
              ${preferredDays.includes(day.value) 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80'}
            `}
            type="button"
          >
            {day.label}
          </button>
        ))}
      </div>
      
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <Clock size={18} className="mr-2" />
        Horários Preferenciais
      </h2>
      
      <div className="grid grid-cols-4 gap-2">
        {timeOptions.map(time => (
          <button
            key={time.value}
            onClick={() => toggleTime(time.value)}
            className={`
              py-2 px-3 rounded-lg border text-sm font-medium transition-all duration-200
              ${preferredTimes.includes(time.value) 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80'}
            `}
            type="button"
          >
            {time.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PreferencesForm;
