
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import ClassCard from '../components/ClassCard';
import UserAvatar from '../components/UserAvatar';
import Button from '../components/Button';
import { Calendar, ChevronRight, Clock } from 'lucide-react';

// Mock data for classes
const upcomingClasses = [
  { id: '1', day: 'Segunda', date: '12 Ago', time: '18:30', confirmedCount: 8 },
  { id: '2', day: 'Terça', date: '13 Ago', time: '17:00', confirmedCount: 5 },
  { id: '3', day: 'Quarta', date: '14 Ago', time: '20:00', confirmedCount: 12 },
];

const Index: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const userName = "Carlos Silva"; // This would come from auth state
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(currentTime);
  
  const formattedTime = new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(currentTime);

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        {/* Header section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Olá, Carlos!</h1>
            <p className="text-muted-foreground">{formattedDate}</p>
          </div>
          <UserAvatar name={userName} size="md" />
        </div>
        
        {/* Today's class highlight */}
        <div className="glass-effect rounded-2xl p-5 mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold">Próxima Aula</h2>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock size={14} className="mr-1" />
              <span>{formattedTime}</span>
            </div>
          </div>
          
          <div className="bg-secondary rounded-xl p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hoje</p>
                <h3 className="text-lg font-semibold">18:30</h3>
              </div>
              <Button 
                variant="primary" 
                size="sm"
                rightIcon={<ChevronRight size={16} />}
                onClick={() => {}}
              >
                Confirmar
              </Button>
            </div>
          </div>
          
          <Link 
            to="/schedule" 
            className="flex items-center justify-center text-sm text-primary font-medium"
          >
            <Calendar size={14} className="mr-1" />
            Ver agenda completa
          </Link>
        </div>
        
        {/* Upcoming classes */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Próximas Aulas</h2>
            <Link to="/schedule" className="text-sm text-primary font-medium">
              Ver todas
            </Link>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {upcomingClasses.map((classItem, index) => (
              <div key={classItem.id} className="staggered-item">
                <ClassCard {...classItem} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
