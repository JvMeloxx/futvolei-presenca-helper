import React from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface NextClassCardProps {
  nextClass: any | null;
  currentTime: Date;
  onConfirm: () => void;
  onViewClass: () => void;
}

const NextClassCard: React.FC<NextClassCardProps> = ({ nextClass, currentTime, onConfirm, onViewClass }) => {
  const now = currentTime;
  const classTime = nextClass ? new Date(`${now.toDateString()} ${nextClass.time}`) : null;
  const timeDiff = classTime ? classTime.getTime() - now.getTime() : 0;
  const hours = Math.max(0, Math.floor(timeDiff / (1000 * 60 * 60)));
  const minutes = Math.max(0, Math.floor((timeDiff / (1000 * 60)) % 60));

  if (!nextClass) {
    return (
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Próxima Aula</h2>
        <div className="glass-effect rounded-2xl p-6 text-center text-muted-foreground">
          <p>Nenhuma aula agendada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Próxima Aula</h2>
        {nextClass && (
          <span className="text-sm text-muted-foreground">
            {hours > 0 ? `Em ${hours}h ${minutes}min` : `Em ${minutes} minutos`}
          </span>
        )}
      </div>
      
      {nextClass ? (
        <div>
          <div className="glass-effect rounded-2xl overflow-hidden">
            <div className="p-4">
              <h3 className="font-semibold text-lg">{nextClass.day}</h3>
              <div className="flex items-center text-muted-foreground mt-1">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{nextClass.date}</span>
              </div>
              <div className="flex items-center text-muted-foreground mt-1">
                <Clock className="mr-2 h-4 w-4" />
                <span>{nextClass.time}</span>
              </div>
              <div className="flex items-center text-muted-foreground mt-1">
                <MapPin className="mr-2 h-4 w-4" />
                <span>Quadra Central</span>
              </div>
            </div>
            
            {/* Add Confirmation Button */}
            <div className="p-4 pt-0">
              <button
                onClick={onConfirm}
                className="confirmar-btn-proximaaula bg-primary text-white border-2 border-white rounded-lg py-3 px-6 text-base font-bold uppercase mt-4 w-full shadow-md transition-all duration-300 hover:bg-primary/90 hover:transform hover:-translate-y-1 active:translate-y-0"
              >
                Confirmar Presença
              </button>
            </div>
          </div>
          
          <div className="mt-3 text-center text-muted-foreground">
            <button onClick={onViewClass} className="text-sm text-primary font-medium">
              Ver detalhes
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-effect rounded-2xl p-6 text-center text-muted-foreground">
          <p>Nenhuma aula agendada</p>
        </div>
      )}
    </div>
  );
};

export default NextClassCard;
