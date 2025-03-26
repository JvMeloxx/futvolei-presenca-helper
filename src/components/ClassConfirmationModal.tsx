
import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Button from './Button';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toggleClassConfirmation } from '@/models/ClassConfirmation';
import { useToast } from '@/hooks/use-toast';

interface ClassConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  day: string;
  date: string;
  time: string;
  userName: string;
  isPreferredDay: boolean;
  onConfirmSuccess?: () => void;
}

const ClassConfirmationModal: React.FC<ClassConfirmationModalProps> = ({
  isOpen,
  onClose,
  classId,
  day,
  date,
  time,
  userName,
  isPreferredDay,
  onConfirmSuccess
}) => {
  const [replacementReason, setReplacementReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Autenticação necessária",
          description: "Faça login para confirmar sua presença.",
          variant: "destructive"
        });
        onClose();
        return;
      }
      
      // If it's not a preferred day, validate replacement reason
      if (!isPreferredDay && !replacementReason.trim()) {
        toast({
          title: "Motivo da reposição obrigatório",
          description: "Por favor, informe o motivo da reposição.",
          variant: "destructive"
        });
        return;
      }
      
      // Save confirmation to database
      const success = await toggleClassConfirmation(classId, true);
      
      if (success) {
        toast({
          title: "Presença confirmada",
          description: "Sua presença foi confirmada com sucesso.",
          variant: "default"
        });
        
        if (onConfirmSuccess) {
          onConfirmSuccess();
        }
        
        onClose();
      } else {
        toast({
          title: "Erro ao confirmar presença",
          description: "Não foi possível confirmar sua presença. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error confirming presence:", error);
      toast({
        title: "Erro ao confirmar presença",
        description: "Ocorreu um erro ao processar sua solicitação.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-effect text-primary-foreground">
        <DialogHeader>
          <DialogTitle className="text-xl text-primary-foreground">
            Confirmar Presença
          </DialogTitle>
          <DialogDescription className="text-primary-foreground/80">
            Você está confirmando sua presença:
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-secondary rounded-xl p-4 mb-4 border border-primary/20">
          <p className="font-medium text-foreground">{userName}</p>
          <p className="text-sm text-muted-foreground">{day}, {date}</p>
          <p className="text-sm text-muted-foreground">Horário: {time}</p>
        </div>
        
        {!isPreferredDay && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-primary-foreground mb-1">
              Motivo da Reposição
            </label>
            <Textarea 
              value={replacementReason}
              onChange={(e) => setReplacementReason(e.target.value)}
              placeholder="Explique o motivo da reposição"
              className="w-full"
            />
          </div>
        )}
        
        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            fullWidth 
            onClick={onClose}
            leftIcon={<X size={18} />}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            fullWidth 
            onClick={handleConfirm}
            leftIcon={<Check size={18} />}
            loading={isSubmitting}
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClassConfirmationModal;
