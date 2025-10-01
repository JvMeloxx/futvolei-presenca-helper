
import React from 'react';
import { Link } from 'react-router-dom';
import ClassCard from '../ClassCard';
import { Star } from 'lucide-react';

interface UpcomingClassesProps {
  upcomingClasses: (any & { date?: string; isPreferredDay?: boolean; isPreferredTime?: boolean })[];
  onSelectClass: (classId: string, day: string, date: string, time: string) => void;
}

const UpcomingClasses: React.FC<UpcomingClassesProps> = ({ 
  upcomingClasses, 
  onSelectClass 
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
        {upcomingClasses.length > 0 ? (
          upcomingClasses.map((classItem) => (
            <div key={classItem.id} className="staggered-item">
              <div className="relative">
                {(classItem.isPreferredDay || classItem.isPreferredTime) && (
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-medium">
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
          <div className="text-center py-8 text-muted-foreground">
            <p>Configure seus dias preferidos no perfil</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingClasses;
