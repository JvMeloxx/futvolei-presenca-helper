
import React from 'react';
import { Save, LogOut } from 'lucide-react';
import Button from '../Button';

interface ProfileActionsProps {
  isSaving: boolean;
  onSave: () => void;
  onSignOut: () => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({ isSaving, onSave, onSignOut }) => {
  return (
    <div className="flex flex-col space-y-3">
      <Button 
        variant="primary" 
        size="lg"
        isLoading={isSaving}
        leftIcon={<Save size={18} />}
        onClick={onSave}
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
