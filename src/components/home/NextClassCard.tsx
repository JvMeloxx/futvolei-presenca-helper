
import React from 'react';
import { ChevronRight, Clock, Check, Calendar } from 'lucide-react';
import Button from '../Button';
import { Link } from 'react-router-dom';

interface NextClassCardProps {
  nextClass: any | null;
  currentTime: Date;
  onConfirm: () => void;
  onViewClass: () => void;
}

const NextClassCard: React.FC<NextClassCardProps> = ({
  nextClass,
  currentTime,
  onConfirm,
  onViewClass,
}) => {
  const formattedTime = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(currentTime);

  return (
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
              onClick={onViewClass}
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
              onClick={onViewClass}
            >
              Ver agenda
            </Button>
          </div>
        </div>
      )}
      
      {/* Confirm presence button for next class */}
      {nextClass && (
        <Button
          variant="primary"
          fullWidth
          leftIcon={<Check size={18} />}
          className="mt-4 bg-primary border-2 border-white shadow-lg shadow-black/30 hover:translate-y-[-2px] active:translate-y-[1px] transition-all duration-300 font-bold uppercase"
          onClick={onConfirm}
        >
          Confirmar Presença
        </Button>
      )}
      
      <Link 
        to="/schedule" 
        className="flex items-center justify-center text-sm text-primary font-medium mt-4"
      >
        <Calendar size={14} className="mr-1" />
        Ver agenda completa
      </Link>
    </div>
  );
};

export default NextClassCard;
