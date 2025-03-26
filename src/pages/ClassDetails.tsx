
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import UserAvatar from '../components/UserAvatar';
import { Calendar, Clock, MapPin, Users, User as UserIcon, ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getClassDetailsById, toggleClassConfirmation, ClassDetails as ClassDetailsType, ClassParticipant } from '@/models/ClassConfirmation';

const ClassDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [classDetails, setClassDetails] = useState<ClassDetailsType | null>(null);
  const [participants, setParticipants] = useState<ClassParticipant[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  useEffect(() => {
    const loadClassDetails = async () => {
      if (!id) return;
      
      try {
        setLoadingData(true);
        const details = await getClassDetailsById(id);
        
        if (!details) {
          toast({
            title: "Aula não encontrada",
            description: "Não foi possível encontrar detalhes desta aula.",
            variant: "destructive"
          });
          navigate('/schedule');
          return;
        }
        
        setClassDetails(details);
        
        // Load mock participants
        const mockParticipants: ClassParticipant[] = Array(details.confirmed_count).fill(0).map((_, i) => ({
          id: `p${i}`,
          user_id: `u${i}`,
          class_id: id,
          created_at: new Date().toISOString(),
          user_details: {
            full_name: `Participante ${i + 1}`,
            avatar_url: null
          }
        }));
        
        setParticipants(mockParticipants);
      } catch (error) {
        console.error("Error loading class details:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Houve um problema ao buscar os detalhes da aula.",
          variant: "destructive"
        });
      } finally {
        setLoadingData(false);
      }
    };
    
    loadClassDetails();
  }, [id, toast, navigate]);
  
  const handleConfirmToggle = async () => {
    if (!classDetails || isLoading || !user) return;
    
    try {
      setIsConfirming(true);
      
      // The new state will be the opposite of user_confirmed
      const newConfirmationState = !classDetails.user_confirmed;
      
      const success = await toggleClassConfirmation(classDetails.id, newConfirmationState);
      
      if (success) {
        // Update local state
        setClassDetails({
          ...classDetails,
          user_confirmed: newConfirmationState,
          confirmed_count: newConfirmationState 
            ? classDetails.confirmed_count + 1 
            : classDetails.confirmed_count - 1
        });
        
        toast({
          title: newConfirmationState ? "Presença confirmada" : "Presença cancelada",
          description: newConfirmationState 
            ? "Sua presença foi confirmada com sucesso!" 
            : "Sua confirmação de presença foi cancelada.",
          variant: newConfirmationState ? "default" : "destructive"
        });
        
        // Add or remove user from participants list
        if (newConfirmationState) {
          const newParticipant: ClassParticipant = {
            id: `p${participants.length}`,
            user_id: user.id,
            class_id: classDetails.id,
            created_at: new Date().toISOString(),
            user_details: {
              full_name: user.user_metadata?.full_name || 'Usuário',
              avatar_url: user.user_metadata?.avatar_url || null
            }
          };
          
          setParticipants([newParticipant, ...participants]);
        } else {
          // Remove user from participants list
          setParticipants(participants.filter(p => p.user_id !== user.id));
        }
      } else {
        throw new Error("Failed to update confirmation status");
      }
    } catch (error) {
      console.error("Error toggling confirmation:", error);
      toast({
        title: "Erro na confirmação",
        description: "Não foi possível processar sua confirmação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsConfirming(false);
    }
  };
  
  const goBack = () => {
    navigate(-1);
  };
  
  if (loadingData) {
    return (
      <Layout>
        <div className="max-w-md mx-auto">
          <div className="p-4">
            <button 
              onClick={goBack}
              className="flex items-center text-muted-foreground mb-6"
            >
              <ArrowLeft size={16} className="mr-1" />
              <span>Voltar</span>
            </button>
          </div>
          
          <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!classDetails) {
    return (
      <Layout>
        <div className="max-w-md mx-auto">
          <div className="p-4">
            <button 
              onClick={goBack}
              className="flex items-center text-muted-foreground mb-6"
            >
              <ArrowLeft size={16} className="mr-1" />
              <span>Voltar</span>
            </button>
            
            <div className="text-center py-10">
              <p className="text-muted-foreground">Aula não encontrada</p>
              <Button 
                variant="primary"
                onClick={() => navigate('/schedule')}
                className="mt-4"
              >
                Ver agenda
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <div className="p-4">
          <button 
            onClick={goBack}
            className="flex items-center text-muted-foreground mb-6"
          >
            <ArrowLeft size={16} className="mr-1" />
            <span>Voltar</span>
          </button>
          
          {/* Class details */}
          <div className="glass-effect rounded-2xl p-5 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold">Futevôlei</h1>
                <p className="text-muted-foreground">{classDetails.day}</p>
              </div>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                {classDetails.date}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Clock size={18} className="text-muted-foreground mr-3" />
                <span>{classDetails.time}</span>
              </div>
              
              <div className="flex items-center">
                <MapPin size={18} className="text-muted-foreground mr-3" />
                <span>{classDetails.location}</span>
              </div>
              
              <div className="flex items-center">
                <UserIcon size={18} className="text-muted-foreground mr-3" />
                <span>{classDetails.instructor}</span>
              </div>
              
              <div className="flex items-center">
                <Users size={18} className="text-muted-foreground mr-3" />
                <span>{classDetails.confirmed_count} de {classDetails.max_participants} confirmados</span>
              </div>
            </div>
          </div>
          
          {/* Confirmation button */}
          <div className="mb-6">
            <Button 
              variant={classDetails.user_confirmed ? "secondary" : "primary"}
              size="lg"
              isLoading={isConfirming}
              onClick={handleConfirmToggle}
              className="w-full"
              disabled={isLoading || !user}
              leftIcon={classDetails.user_confirmed ? <Check size={18} /> : undefined}
            >
              {classDetails.user_confirmed 
                ? "Cancelar Confirmação" 
                : "Confirmar Presença"}
            </Button>
            {!user && (
              <p className="text-xs text-muted-foreground text-center mt-2">
                Faça login para confirmar sua presença
              </p>
            )}
          </div>
          
          {/* Participants list */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Users size={18} className="mr-2" />
              Lista de Confirmados
            </h2>
            
            {participants.length > 0 ? (
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div 
                    key={participant.id}
                    className="flex items-center p-3 rounded-lg bg-secondary/50"
                  >
                    <UserAvatar 
                      name={participant.user_details?.full_name || ''}
                      imageUrl={participant.user_details?.avatar_url || null}
                      size="sm"
                    />
                    <span className="ml-3">{participant.user_details?.full_name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>Nenhum participante confirmado ainda</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClassDetails;
