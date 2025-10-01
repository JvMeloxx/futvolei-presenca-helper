import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { LoadingButton } from '@/components/ui/loading-spinner';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  loading = false,
}) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // O erro será tratado pelo componente pai
      console.error('Erro na confirmação:', error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="transition-all duration-300 ease-out">
        <AlertDialogHeader>
          <AlertDialogTitle className="animate-in slide-in-from-top-2 duration-300">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="animate-in slide-in-from-top-2 duration-300 delay-75">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="animate-in slide-in-from-bottom-2 duration-300 delay-150">
          <AlertDialogCancel 
            onClick={onClose} 
            disabled={loading}
            className="transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {cancelText}
          </AlertDialogCancel>
          <LoadingButton
            onClick={handleConfirm}
            loading={loading}
            variant={variant === 'destructive' ? 'destructive' : 'default'}
            className="transition-all duration-200 hover:scale-105 active:scale-95"
          >
            {confirmText}
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

// Hook para usar o modal de confirmação de forma mais simples
export const useConfirmation = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [config, setConfig] = React.useState<{
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
  } | null>(null);

  const confirm = React.useCallback((options: {
    title: string;
    description: string;
    onConfirm: () => void | Promise<void>;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
  }) => {
    setConfig(options);
    setIsOpen(true);
  }, []);

  const handleConfirm = React.useCallback(async () => {
    if (!config) return;
    
    setLoading(true);
    try {
      await config.onConfirm();
      setIsOpen(false);
    } catch (error) {
      console.error('Erro na confirmação:', error);
    } finally {
      setLoading(false);
    }
  }, [config]);

  const handleClose = React.useCallback(() => {
    if (!loading) {
      setIsOpen(false);
      setConfig(null);
    }
  }, [loading]);

  const ConfirmationComponent = React.useMemo(() => {
    if (!config) return null;

    return (
      <ConfirmationModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title={config.title}
        description={config.description}
        confirmText={config.confirmText}
        cancelText={config.cancelText}
        variant={config.variant}
        loading={loading}
      />
    );
  }, [config, isOpen, handleClose, handleConfirm, loading]);

  return {
    confirm,
    ConfirmationComponent,
    isOpen,
    loading,
  };
};

// Componentes pré-configurados para casos comuns
export const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  itemName: string;
  loading?: boolean;
}> = ({ isOpen, onClose, onConfirm, itemName, loading }) => {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Confirmar Exclusão"
      description={`Tem certeza que deseja excluir ${itemName}? Esta ação não pode ser desfeita.`}
      confirmText="Excluir"
      cancelText="Cancelar"
      variant="destructive"
      loading={loading}
    />
  );
};

export const LeaveClassConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  className: string;
  loading?: boolean;
}> = ({ isOpen, onClose, onConfirm, className, loading }) => {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Cancelar Presença"
      description={`Tem certeza que deseja cancelar sua presença na aula "${className}"?`}
      confirmText="Sim, cancelar"
      cancelText="Não, manter presença"
      variant="destructive"
      loading={loading}
    />
  );
};

export const JoinClassConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  className: string;
  loading?: boolean;
}> = ({ isOpen, onClose, onConfirm, className, loading }) => {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Confirmar Presença"
      description={`Deseja confirmar sua presença na aula "${className}"?`}
      confirmText="Sim, confirmar"
      cancelText="Cancelar"
      variant="default"
      loading={loading}
    />
  );
};