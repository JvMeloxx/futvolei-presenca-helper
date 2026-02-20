
import React from 'react';
import UserAvatar from '../UserAvatar';
import { AuthUser } from '@/contexts/NeonAuthContext';

interface HomeHeaderProps {
  formattedDate: string;
  user: AuthUser | null;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ formattedDate, user }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">Olá, {user?.full_name?.split(' ')[0] || 'Usuário'}!</h1>
        <p className="text-muted-foreground">{formattedDate}</p>
      </div>
      <UserAvatar
        name={user?.full_name || ''}
        imageUrl={user?.avatar_url || null}
        size="md"
      />
    </div>
  );
};

export default HomeHeader;
