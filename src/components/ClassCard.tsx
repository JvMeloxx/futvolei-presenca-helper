
import React from 'react';
import { Clock, Users, MapPin, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CapacityBadge, DateTimeBadge, LocationBadge } from '@/components/ui/status-badge';
import { LoadingButton } from '@/components/ui/loading-spinner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useHaptic } from '@/hooks/use-haptic';
import { useSwipe } from '@/hooks/use-swipe';

interface ClassCardProps {
  id: string;
  day: string;
  date: string;
  time: string;
  confirmedCount: number;
  maxParticipants?: number;
  location?: string;
  instructor?: string;
  isPast?: boolean;
  isSelected?: boolean;
  isConfirmed?: boolean;
  onClick?: () => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  showDetails?: boolean;
  loading?: boolean;
}

const ClassCard: React.FC<ClassCardProps> = ({
  id,
  day,
  date,
  time,
  confirmedCount,
  maxParticipants = 12,
  location,
  instructor,
  isPast = false,
  isSelected = false,
  isConfirmed = false,
  onClick,
  onConfirm,
  onCancel,
  showDetails = true,
  loading = false,
}) => {
  const { vibrate } = useHaptic();

  // Swipe gestures
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe({
    onSwipedRight: () => {
      if (!isConfirmed && !isFull && onConfirm && !loading && !isPast) {
        vibrate('medium');
        onConfirm();
      }
    },
    onSwipedLeft: () => {
      if (isConfirmed && onCancel && !loading && !isPast) {
        vibrate('medium');
        onCancel();
      }
    }
  });

  const handleClick = (e: React.MouseEvent) => {
    if (isPast || loading) return;

    if (onClick) {
      vibrate('selection');
      e.preventDefault();
      onClick();
    }
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onConfirm && !loading) {
      vibrate('medium');
      onConfirm();
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCancel && !loading) {
      vibrate('medium');
      onCancel();
    }
  };

  const isFull = confirmedCount >= maxParticipants;

  return (
    <div
      onClick={handleClick}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={cn(
        "block rounded-xl overflow-hidden transition-all duration-200",
        "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        {
          "opacity-50 pointer-events-none": isPast,
          "cursor-pointer": !isPast && !loading,
          "ring-2 ring-primary ring-offset-2": isSelected,
          "cursor-not-allowed": loading
        }
      )}
    >
      <div className="glass-effect p-4 space-y-3">
        {/* Header com dia e status */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground/80">{day}</p>
            <h3 className="text-lg font-semibold text-foreground">{date}</h3>
          </div>

          <div className="flex flex-col gap-1">
            {isPast && (
              <span className="text-xs bg-muted/20 px-2 py-1 rounded-full text-muted-foreground">
                Passado
              </span>
            )}
            {isConfirmed && !isPast && (
              <span className="text-xs bg-green-500/20 px-2 py-1 rounded-full text-green-400">
                Confirmado
              </span>
            )}
            {isFull && !isPast && (
              <span className="text-xs bg-red-500/20 px-2 py-1 rounded-full text-red-400">
                Lotado
              </span>
            )}
          </div>
        </div>

        {showDetails && (
          <div className="space-y-2">
            {/* Badges informativos */}
            <div className="flex flex-wrap gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <DateTimeBadge date={date} time={time} variant="time" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Horário da aula: {time}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <CapacityBadge current={confirmedCount} max={maxParticipants} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{confirmedCount} de {maxParticipants} vagas preenchidas</p>
                    {isFull && <p className="text-red-300">Aula lotada!</p>}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {location && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <LocationBadge location={location} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Local: {location}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            {/* Instrutor */}
            {instructor && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center text-sm text-primary-foreground/80 cursor-help">
                      <User size={14} className="mr-2 text-primary" />
                      <span>Prof. {instructor}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Professor responsável pela aula</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Botões de ação */}
            {!isPast && (onConfirm || onCancel) && (
              <div className="flex gap-2 pt-2">
                {!isConfirmed && onConfirm && !isFull && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1">
                          <LoadingButton
                            loading={loading}
                            onClick={handleConfirm}
                            variant="default"
                            className="w-full text-sm"
                          >
                            Confirmar
                          </LoadingButton>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Confirmar presença nesta aula</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {isConfirmed && onCancel && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1">
                          <LoadingButton
                            loading={loading}
                            onClick={handleCancel}
                            variant="destructive"
                            className="w-full text-sm"
                          >
                            Cancelar
                          </LoadingButton>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Cancelar confirmação de presença</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {isFull && !isConfirmed && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1 text-center text-sm text-muted-foreground py-2 cursor-help">
                          Aula lotada
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Esta aula atingiu o limite máximo de participantes</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassCard;
