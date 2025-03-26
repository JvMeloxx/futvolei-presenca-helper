
import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import UserAvatar from '../components/UserAvatar';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, Calendar, Clock, Save, LogOut, User, Mail, Phone } from 'lucide-react';

// Day and time options
const dayOptions = [
  { value: 'Segunda', label: 'Segunda-feira' },
  { value: 'Terça', label: 'Terça-feira' },
  { value: 'Quarta', label: 'Quarta-feira' },
  { value: 'Quinta', label: 'Quinta-feira' },
];

const timeOptions = [
  { value: '6h30', label: '6:30' },
  { value: '8h', label: '8:00' },
  { value: '8h30', label: '8:30' },
  { value: '12h', label: '12:00' },
  { value: '17h', label: '17:00' },
  { value: '18h30', label: '18:30' },
  { value: '20h', label: '20:00' },
];

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
        
        {/* Profile picture */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <UserAvatar name={name} imageUrl={avatar} size="lg" />
            <label className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1.5 rounded-full shadow-sm cursor-pointer">
              <Camera size={14} />
              <input 
                type="file" 
                className="hidden" 
                accept="image/jpeg, image/png"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
        </div>
        
        {/* Profile form */}
        <div className="glass-effect rounded-2xl p-5 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <User size={18} className="mr-2" />
            Informações Pessoais
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Nome completo
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Seu nome completo"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Mail size={14} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className="pl-10 w-full h-10 rounded-lg border border-input bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-not-allowed"
                  placeholder="seu@email.com"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">O email não pode ser alterado</p>
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Telefone
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                  <Phone size={14} />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Preferred days */}
        <div className="glass-effect rounded-2xl p-5 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar size={18} className="mr-2" />
            Dias Preferenciais
          </h2>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            {dayOptions.map(day => (
              <button
                key={day.value}
                onClick={() => toggleDay(day.value)}
                className={`
                  py-2 px-3 rounded-lg border text-sm font-medium transition-all duration-200
                  ${preferredDays.includes(day.value) 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80'}
                `}
                type="button"
              >
                {day.label}
              </button>
            ))}
          </div>
          
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Clock size={18} className="mr-2" />
            Horários Preferenciais
          </h2>
          
          <div className="grid grid-cols-4 gap-2">
            {timeOptions.map(time => (
              <button
                key={time.value}
                onClick={() => toggleTime(time.value)}
                className={`
                  py-2 px-3 rounded-lg border text-sm font-medium transition-all duration-200
                  ${preferredTimes.includes(time.value) 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-secondary text-secondary-foreground border-secondary hover:bg-secondary/80'}
                `}
                type="button"
              >
                {time.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Save button and logout */}
        <div className="flex flex-col space-y-3">
          <Button 
            variant="primary" 
            size="lg"
            isLoading={isSaving}
            leftIcon={<Save size={18} />}
            onClick={handleSaveProfile}
          >
            Salvar Alterações
          </Button>
          
          <Button 
            variant="ghost" 
            leftIcon={<LogOut size={18} />}
            onClick={signOut}
          >
            Sair da Conta
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
