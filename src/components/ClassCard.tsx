
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
  onClick?: () => void;
  showDetails?: boolean;
}

const ClassCard: React.FC<ClassCardProps> = ({
  id,
  day,
  date,
  time,
  confirmedCount,
  isPast = false,
  isSelected = false,
  onClick,
  showDetails = true,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    if (isPast) return;
    
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        block rounded-xl overflow-hidden card-hover
        ${isPast ? 'opacity-40 pointer-events-none' : 'cursor-pointer'}
        ${isSelected ? 'ring-2 ring-primary' : ''}
      `}
    >
      <div className="glass-effect p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-sm font-medium text-primary-foreground/80">{day}</p>
            <h3 className="text-lg font-semibold text-primary-foreground">{date}</h3>
          </div>
          {isPast && (
            <span className="text-xs bg-primary/20 px-2 py-1 rounded-full text-primary-foreground">
              Passado
            </span>
          )}
          {isSelected && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
              Selecionado
            </span>
          )}
        </div>
        
        {showDetails && (
          <>
            <div className="flex items-center text-sm text-primary-foreground/80 mb-2">
              <Clock size={14} className="mr-1 text-primary" />
              <span>{time}</span>
            </div>
            
            <div className="flex items-center text-sm text-primary-foreground/80">
              <Users size={14} className="mr-1 text-primary" />
              <span>{confirmedCount} confirmados</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClassCard;
