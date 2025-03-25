
import React from 'react';
import Button from './Button';
import { Check, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  day: string;
  date: string;
  time: string;
  userName: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  day,
  date,
  time,
  userName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="glass-effect w-full max-w-md rounded-2xl p-6 shadow-lg animate-scale-in z-10 border border-primary/40">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold mb-2 text-primary">Confirmar Presença</h3>
          <p className="text-muted-foreground text-sm">Você está confirmando sua presença:</p>
        </div>
        
        <div className="bg-secondary rounded-xl p-4 mb-6 border border-primary/20">
          <p className="font-medium text-white">{userName}</p>
          <p className="text-sm text-muted-foreground">{day}, {date}</p>
          <p className="text-sm text-muted-foreground">Horário: {time}</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            fullWidth 
            onClick={onClose}
            leftIcon={<X size={18} />}
          >
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            fullWidth 
            onClick={onConfirm}
            leftIcon={<Check size={18} />}
          >
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
