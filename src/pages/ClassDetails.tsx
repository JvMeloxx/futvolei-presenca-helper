import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import UserAvatar from '../components/UserAvatar';
import ConfirmationModal from '../components/ConfirmationModal';
import { Calendar, Clock, MapPin, ArrowLeft, Users, Check } from 'lucide-react';

// Mock data for a class
const classData = {
  id: '1',
  day: 'Segunda-feira',
  date: '12 de Agosto',
  time: '18:30',
  location: 'Quadra Principal',
  confirmedUsers: [
    { id: '1', name: 'Carlos Silva', confirmed: true, avatar: '' },
    { id: '2', name: 'Ana Oliveira', confirmed: true, avatar: '' },
    { id: '3', name: 'Roberto Santos', confirmed: true, avatar: '' },
    { id: '4', name: 'Maria Souza', confirmed: true, avatar: '' },
    { id: '5', name: 'Pedro Lima', confirmed: true, avatar: '' },
    { id: '6', name: 'Julia Costa', confirmed: true, avatar: '' },
  ]
};

const ClassDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  const openConfirmationModal = () => {
    setIsModalOpen(true);
  };
  
  const handleConfirm = () => {
    setIsModalOpen(false);
    setIsConfirmed(true);
    
    // Show success message
    setTimeout(() => {
      // This would be a toast in a real app
      console.log('Presença confirmada com sucesso!');
    }, 500);
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <button 
            onClick={handleGoBack}
            className="p-2 -ml-2 rounded-full hover:bg-secondary text-foreground"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold ml-2">Detalhes da Aula</h1>
        </div>
        
        {/* Class info card */}
        <div className="glass-effect rounded-2xl p-5 mb-6">
          <h2 className="text-lg font-semibold mb-4">Informações</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <Calendar size={20} className="mr-3 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">{classData.day}</p>
                <p className="text-sm text-muted-foreground">{classData.date}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock size={20} className="mr-3 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">Horário</p>
                <p className="text-sm text-muted-foreground">{classData.time}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <MapPin size={20} className="mr-3 mt-0.5 text-primary" />
              <div>
                <p className="font-medium">Local</p>
                <p className="text-sm text-muted-foreground">{classData.location}</p>
              </div>
            </div>
          </div>
          
          {!isConfirmed ? (
            <Button 
              variant="primary" 
              fullWidth 
              size="lg"
              className="mt-6"
              leftIcon={<Check size={18} />}
              onClick={openConfirmationModal}
            >
              Confirmar Presença
            </Button>
          ) : (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <Check size={24} className="mx-auto mb-2 text-green-500" />
              <p className="font-medium text-green-800">Presença Confirmada!</p>
              <p className="text-sm text-green-700">Você confirmou sua presença nesta aula</p>
            </div>
          )}
        </div>
        
        {/* Confirmed users */}
        <div className="glass-effect rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pessoas Confirmadas</h2>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users size={16} className="mr-1" />
              <span>{classData.confirmedUsers.length}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {classData.confirmedUsers.map((user) => (
              <div 
                key={user.id}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/50"
              >
                <div className="flex items-center">
                  <UserAvatar name={user.name} imageUrl={user.avatar} size="sm" />
                  <span className="ml-3 font-medium">{user.name}</span>
                </div>
                <Check size={16} className="text-green-500" />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
        day={classData.day}
        date={classData.date}
        time={classData.time}
        userName="Carlos Silva" // This would come from auth
      />
    </Layout>
  );
};

export default ClassDetails;
