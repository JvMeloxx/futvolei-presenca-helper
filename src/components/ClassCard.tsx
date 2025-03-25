
import React from 'react';
import { Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ClassCardProps {
  id: string;
  day: string;
  date: string;
  time: string;
  confirmedCount: number;
  isPast?: boolean;
  isSelected?: boolean;
}

const ClassCard: React.FC<ClassCardProps> = ({
  id,
  day,
  date,
  time,
  confirmedCount,
  isPast = false,
  isSelected = false,
}) => {
  return (
    <Link
      to={isPast ? '#' : `/class/${id}`}
      className={`
        block rounded-xl overflow-hidden card-hover
        ${isPast ? 'opacity-40 pointer-events-none' : ''}
        ${isSelected ? 'ring-2 ring-primary' : ''}
      `}
    >
      <div className="glass-effect p-4 border border-primary/30">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{day}</p>
            <h3 className="text-lg font-semibold text-foreground">{date}</h3>
          </div>
          {isPast && (
            <span className="text-xs bg-primary/40 px-2 py-1 rounded-full text-white">
              Passado
            </span>
          )}
          {isSelected && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
              Selecionado
            </span>
          )}
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <Clock size={14} className="mr-1 text-primary" />
          <span>{time}</span>
        </div>
        
        <div className="flex items-center text-sm text-muted-foreground">
          <Users size={14} className="mr-1 text-primary" />
          <span>{confirmedCount} confirmados</span>
        </div>
      </div>
    </Link>
  );
};

export default ClassCard;
