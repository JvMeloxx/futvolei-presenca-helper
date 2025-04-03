
import React from 'react';
import UserAvatar from '../UserAvatar';
import { User } from '@supabase/supabase-js';

interface HomeHeaderProps {
  formattedDate: string;
  user: User | null;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({ formattedDate, user }) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">Olá, {user?.user_metadata?.full_name?.split(' ')[0] || 'Usuário'}!</h1>
        <p className="text-muted-foreground">{formattedDate}</p>
      </div>
      <UserAvatar 
        name={user?.user_metadata?.full_name || ''} 
        imageUrl={user?.user_metadata?.avatar_url || null} 
        size="md" 
      />
    </div>
  );
};

export default HomeHeader;
