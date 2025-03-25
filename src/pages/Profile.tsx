
import React, { useState } from 'react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import UserAvatar from '../components/UserAvatar';
import { Camera, Calendar, Clock, Save, LogOut, User, Mail, Phone } from 'lucide-react';

// Mock user data
const userData = {
  name: 'Carlos Silva',
  email: 'carlos.silva@example.com',
  phone: '(11) 98765-4321',
  preferredDays: ['monday', 'wednesday'],
  preferredTimes: ['18:30', '20:00'],
};

// Day and time options
const dayOptions = [
  { value: 'monday', label: 'Segunda-feira' },
  { value: 'tuesday', label: 'Terça-feira' },
  { value: 'wednesday', label: 'Quarta-feira' },
  { value: 'thursday', label: 'Quinta-feira' },
];

const timeOptions = [
  { value: '6:30', label: '6:30' },
  { value: '8:00', label: '8:00' },
  { value: '8:30', label: '8:30' },
  { value: '12:00', label: '12:00' },
  { value: '17:00', label: '17:00' },
  { value: '18:30', label: '18:30' },
  { value: '20:00', label: '20:00' },
];

const Profile: React.FC = () => {
  const [name, setName] = useState(userData.name);
  const [email, setEmail] = useState(userData.email);
  const [phone, setPhone] = useState(userData.phone);
  const [preferredDays, setPreferredDays] = useState<string[]>(userData.preferredDays);
  const [preferredTimes, setPreferredTimes] = useState<string[]>(userData.preferredTimes);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSaveProfile = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Show success message
      console.log('Perfil atualizado com sucesso!');
    }, 1000);
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

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
        
        {/* Profile picture */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <UserAvatar name={name} size="lg" />
            <button className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1.5 rounded-full shadow-sm">
              <Camera size={14} />
            </button>
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
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="seu@email.com"
                  required
                />
              </div>
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
                  required
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
            isLoading={isLoading}
            leftIcon={<Save size={18} />}
            onClick={handleSaveProfile}
          >
            Salvar Alterações
          </Button>
          
          <Button 
            variant="ghost" 
            leftIcon={<LogOut size={18} />}
            onClick={() => {}}
          >
            Sair da Conta
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
