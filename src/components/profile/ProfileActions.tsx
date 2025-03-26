
import React from 'react';
import { Save, LogOut } from 'lucide-react';
import Button from '../Button';
import { toast } from 'sonner';

interface ProfileActionsProps {
  isSaving: boolean;
  onSave: () => void;
  onSignOut: () => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({ isSaving, onSave, onSignOut }) => {
  const handleSave = () => {
    // Show toast notification while saving
    toast.promise(
      // This will create a promise that resolves when onSave completes
      new Promise((resolve) => {
        onSave();
        // We resolve the promise immediately since onSave handles its own state
        resolve(true);
      }),
      {
        loading: 'Salvando alterações...',
        success: 'Perfil atualizado com sucesso!',
        error: 'Erro ao salvar as alterações.',
      }
    );
  };

  return (
    <div className="flex flex-col space-y-3">
      <Button 
        variant="primary" 
        size="lg"
        isLoading={isSaving}
        leftIcon={<Save size={18} />}
        onClick={handleSave}
      >
        Salvar Alterações
      </Button>
      
      <Button 
        variant="ghost" 
        leftIcon={<LogOut size={18} />}
        onClick={onSignOut}
      >
        Sair da Conta
      </Button>
    </div>
  );
};

export default ProfileActions;
