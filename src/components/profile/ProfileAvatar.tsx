
import React from 'react';
import { Camera } from 'lucide-react';
import UserAvatar from '../UserAvatar';

interface ProfileAvatarProps {
  name: string;
  avatar: string | null;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ name, avatar, onAvatarChange }) => {
  return (
    <div className="flex justify-center mb-6">
      <div className="relative">
        <UserAvatar name={name} imageUrl={avatar} size="lg" />
        <label className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1.5 rounded-full shadow-sm cursor-pointer">
          <Camera size={14} />
          <input 
            type="file" 
            className="hidden" 
            accept="image/jpeg, image/png"
            onChange={onAvatarChange}
          />
        </label>
      </div>
    </div>
  );
};

export default ProfileAvatar;
