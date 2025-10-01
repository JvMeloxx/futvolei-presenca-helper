import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Users, 
  Calendar,
  MapPin,
  Star
} from 'lucide-react';

// Badge para status de confirmação de aula
interface ConfirmationStatusBadgeProps {
  status: 'confirmed' | 'cancelled' | 'pending';
  className?: string;
}

export const ConfirmationStatusBadge: React.FC<ConfirmationStatusBadgeProps> = ({ 
  status, 
  className 
}) => {
  const config = {
    confirmed: {
      variant: 'default' as const,
      icon: CheckCircle,
      text: 'Confirmado',
      className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200'
    },
    cancelled: {
      variant: 'destructive' as const,
      icon: XCircle,
      text: 'Cancelado',
      className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200'
    },
    pending: {
      variant: 'secondary' as const,
      icon: Clock,
      text: 'Pendente',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200'
    }
  };

  const { icon: Icon, text, className: statusClassName } = config[status];

  return (
    <Badge className={cn(statusClassName, 'flex items-center gap-1', className)}>
      <Icon className="w-3 h-3" />
      {text}
    </Badge>
  );
};

// Badge para capacidade da aula
interface CapacityBadgeProps {
  current: number;
  max: number;
  className?: string;
}

export const CapacityBadge: React.FC<CapacityBadgeProps> = ({ 
  current, 
  max, 
  className 
}) => {
  const percentage = (current / max) * 100;
  const isFull = current >= max;
  const isAlmostFull = percentage >= 80;

  const getVariant = () => {
    if (isFull) return 'destructive';
    if (isAlmostFull) return 'secondary';
    return 'default';
  };

  const getClassName = () => {
    if (isFull) return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200';
    if (isAlmostFull) return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200';
  };

  return (
    <Badge className={cn(getClassName(), 'flex items-center gap-1', className)}>
      <Users className="w-3 h-3" />
      {current}/{max}
      {isFull && ' (Lotado)'}
    </Badge>
  );
};

// Badge para prioridade
interface PriorityBadgeProps {
  priority: 'high' | 'medium' | 'low';
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ 
  priority, 
  className 
}) => {
  const config = {
    high: {
      text: 'Alta',
      className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200'
    },
    medium: {
      text: 'Média',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200'
    },
    low: {
      text: 'Baixa',
      className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200'
    }
  };

  const { text, className: priorityClassName } = config[priority];

  return (
    <Badge className={cn(priorityClassName, 'flex items-center gap-1', className)}>
      <AlertCircle className="w-3 h-3" />
      {text}
    </Badge>
  );
};

// Badge para data/horário
interface DateTimeBadgeProps {
  date: string;
  time: string;
  className?: string;
  variant?: 'date' | 'time' | 'both';
}

export const DateTimeBadge: React.FC<DateTimeBadgeProps> = ({ 
  date, 
  time, 
  className,
  variant = 'both'
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const getText = () => {
    switch (variant) {
      case 'date':
        return formatDate(date);
      case 'time':
        return time;
      case 'both':
      default:
        return `${formatDate(date)} às ${time}`;
    }
  };

  return (
    <Badge variant="outline" className={cn('flex items-center gap-1', className)}>
      <Calendar className="w-3 h-3" />
      {getText()}
    </Badge>
  );
};

// Badge para localização
interface LocationBadgeProps {
  location: string;
  className?: string;
}

export const LocationBadge: React.FC<LocationBadgeProps> = ({ 
  location, 
  className 
}) => {
  return (
    <Badge variant="outline" className={cn('flex items-center gap-1', className)}>
      <MapPin className="w-3 h-3" />
      {location}
    </Badge>
  );
};

// Badge para nível/rating
interface RatingBadgeProps {
  rating: number;
  maxRating?: number;
  className?: string;
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({ 
  rating, 
  maxRating = 5, 
  className 
}) => {
  const percentage = (rating / maxRating) * 100;
  
  const getClassName = () => {
    if (percentage >= 80) return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200';
    if (percentage >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200';
  };

  return (
    <Badge className={cn(getClassName(), 'flex items-center gap-1', className)}>
      <Star className="w-3 h-3" />
      {rating.toFixed(1)}/{maxRating}
    </Badge>
  );
};

// Badge genérico com ícone customizável
interface CustomBadgeProps {
  text: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

export const CustomBadge: React.FC<CustomBadgeProps> = ({ 
  text, 
  icon: Icon, 
  variant = 'default', 
  className 
}) => {
  return (
    <Badge variant={variant} className={cn('flex items-center gap-1', className)}>
      {Icon && <Icon className="w-3 h-3" />}
      {text}
    </Badge>
  );
};