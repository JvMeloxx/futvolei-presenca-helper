import * as React from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'rounded' | 'circular';
  animation?: 'pulse' | 'wave' | 'shimmer';
  className?: string;
}

function Skeleton({
  className,
  variant = 'default',
  animation = 'pulse',
  ...props
}: SkeletonProps) {
  const variantClasses = {
    default: 'rounded-md',
    rounded: 'rounded-lg',
    circular: 'rounded-full'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse',
    shimmer: 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent'
  };

  return (
    <div
      className={cn(
        'bg-muted',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      {...props}
    />
  )
}

// Skeleton específico para ClassCard
export const ClassCardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('rounded-xl overflow-hidden border bg-card text-card-foreground shadow-sm animate-pulse', className)}>
      <div className="p-4 space-y-3">
        {/* Header com dia e status */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <Skeleton className="h-4 w-16" /> {/* Dia */}
            <Skeleton className="h-6 w-24" /> {/* Data */}
          </div>
          <div className="flex flex-col gap-1">
            <Skeleton className="h-5 w-20 rounded-full" /> {/* Status badge */}
          </div>
        </div>

        <div className="space-y-2">
          {/* Badges informativos */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-32 rounded-md" />
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-5 w-28 rounded-md" />
          </div>

          {/* Instrutor */}
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton para lista de aulas
export const ClassListSkeleton: React.FC<{
  count?: number;
  className?: string;
}> = ({ count = 3, className }) => {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <ClassCardSkeleton
          key={index}
          style={{
            animationDelay: `${index * 100}ms`
          }}
        />
      ))}
    </div>
  );
};

// Skeleton para perfil de usuário
export const UserProfileSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('flex items-center space-x-4 p-4 animate-pulse', className)}>
      <Skeleton className="h-12 w-12" variant="circular" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
};

// Skeleton para estatísticas
export const StatsSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-2 animate-pulse">
          <Skeleton className="h-8 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
};

// Skeleton para texto com múltiplas linhas
export const TextSkeleton: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 3, className }) => {
  return (
    <div className={cn('space-y-2 animate-pulse', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            'h-4',
            index === lines - 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
};

export { Skeleton }
