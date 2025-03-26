
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';

interface UserAvatarProps {
  name?: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ name = '', imageUrl, size = 'md' }) => {
  // Gera as iniciais a partir do nome
  const generateInitials = (name: string) => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  };

  // Define o tamanho com base na prop
  const sizeClass = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-24 w-24'
  }[size];

  // Define o tamanho do ícone e texto com base no tamanho do avatar
  const iconSize = {
    sm: 14,
    md: 18,
    lg: 36
  }[size];

  const textSize = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-xl'
  }[size];

  return (
    <Avatar className={`${sizeClass} ${size === 'lg' ? 'border-2 border-primary' : ''}`}>
      {imageUrl ? (
        <AvatarImage src={imageUrl} alt={name || 'Avatar do usuário'} />
      ) : (
        <AvatarFallback 
          className={`bg-primary/10 text-primary flex items-center justify-center ${textSize}`}
        >
          {name ? generateInitials(name) : <User size={iconSize} />}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;
