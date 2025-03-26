
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import ProfileAvatar from '../components/profile/ProfileAvatar';
import PersonalInfoForm from '../components/profile/PersonalInfoForm';
import PreferencesForm from '../components/profile/PreferencesForm';
import ProfileActions from '../components/profile/ProfileActions';

const Profile: React.FC = () => {
  const { user, session, updateProfile, signOut, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [preferredTimes, setPreferredTimes] = useState<string[]>([]);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata;
      setName(metadata?.full_name || '');
      setEmail(user.email || '');
      setAvatar(metadata?.avatar_url || null);
      
      // Extrair dias preferidos
      if (metadata?.preferred_days) {
        const days = Array.isArray(metadata.preferred_days) 
          ? metadata.preferred_days 
          : metadata.preferred_days.split(',');
        setPreferredDays(days);
      }
      
      // Extrair horários preferidos
      if (metadata?.preferred_times) {
        const times = Array.isArray(metadata.preferred_times) 
          ? metadata.preferred_times 
          : metadata.preferred_times.split(',');
        setPreferredTimes(times);
      }
    }
  }, [user]);
  
  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    try {
      await updateProfile({
        name,
        avatar_url: avatar,
        preferredDays,
        preferredTimes,
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const toggleDay = (day: string) => {
    if (preferredDays.includes(day)) {
      setPreferredDays(preferredDays.filter(d => d !== day));
    } else {
      setPreferredDays([...preferredDays, day]);
    }
  };
  
  const toggleTime = (time: string) => {
    if (preferredTimes.includes(time)) {
      setPreferredTimes(preferredTimes.filter(t => t !== time));
    } else {
      setPreferredTimes([...preferredTimes, time]);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar tamanho do arquivo (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    // Verificar tipo de arquivo
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      alert('Apenas imagens JPG e PNG são aceitas');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAvatar(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
        
        <ProfileAvatar 
          name={name}
          avatar={avatar}
          onAvatarChange={handleAvatarChange}
        />
        
        <PersonalInfoForm
          name={name}
          setName={setName}
          email={email}
          phone={phone}
          setPhone={setPhone}
        />
        
        <PreferencesForm
          preferredDays={preferredDays}
          preferredTimes={preferredTimes}
          toggleDay={toggleDay}
          toggleTime={toggleTime}
        />
        
        <ProfileActions
          isSaving={isSaving}
          onSave={handleSaveProfile}
          onSignOut={signOut}
        />
      </div>
    </Layout>
  );
};

export default Profile;
