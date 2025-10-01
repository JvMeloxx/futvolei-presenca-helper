
import React from 'react';
import { Link } from 'react-router-dom';
import ClassCard from '../ClassCard';
import { Star } from 'lucide-react';
import { ClassListSkeleton } from '@/components/ui/skeleton';

interface UpcomingClassesProps {
  upcomingClasses: (any & { date?: string; isPreferredDay?: boolean; isPreferredTime?: boolean })[];
  onSelectClass: (classId: string, day: string, date: string, time: string) => void;
  loading?: boolean;
}

const UpcomingClasses: React.FC<UpcomingClassesProps> = ({ 
  upcomingClasses, 
  onSelectClass,
  loading = false
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Próximas Aulas</h2>
        <Link to="/schedule" className="text-sm text-primary font-medium">
          Ver todas
        </Link>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <ClassListSkeleton count={3} />
        ) : upcomingClasses.length > 0 ? (
          upcomingClasses.map((classItem, index) => (
            <div 
              key={classItem.id} 
              className="staggered-item animate-in slide-in-from-bottom-4 duration-300"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className="relative">
                {(classItem.isPreferredDay || classItem.isPreferredTime) && (
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium animate-in zoom-in-50 duration-300 delay-300">
                    <Star className="h-3 w-3 fill-current" />
                    Preferida
                  </div>
                )}
                <ClassCard 
                  {...classItem} 
                  onClick={() => onSelectClass(classItem.id, classItem.day, classItem.date, classItem.time)}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground animate-in fade-in-50 duration-500">
            <p>Configure seus dias preferidos no perfil</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingClasses;
