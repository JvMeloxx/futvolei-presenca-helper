
import React from 'react';
import { Mail, Phone, User } from 'lucide-react';

interface PersonalInfoFormProps {
  name: string;
  setName: (name: string) => void;
  email: string;
  phone: string;
  setPhone: (phone: string) => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ 
  name, 
  setName, 
  email, 
  phone, 
  setPhone 
}) => {
  return (
    <div className="glass-effect rounded-2xl p-5 mb-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <User size={18} className="mr-2" />
        Informações Pessoais
      </h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1 text-primary perfil-label">
            Nome completo
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="perfil-input w-full h-10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Seu nome completo"
            required
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1 text-primary perfil-label">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary/70">
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
          <label htmlFor="phone" className="block text-sm font-medium mb-1 text-primary perfil-label">
            Telefone
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary/70">
              <Phone size={14} />
            </div>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="perfil-input pl-10 w-full h-10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="(00) 00000-0000"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
