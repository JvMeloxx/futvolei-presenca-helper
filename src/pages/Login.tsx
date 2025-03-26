
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import { Input } from '../components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronRight, User, Key } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { signIn, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirecionar para a página de origem se houver
  const from = location.state?.from?.pathname || '/';

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!email) {
      newErrors.email = 'Email é obrigatório';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await signIn(email, password);
      // Redirecionamento é feito pelo AuthContext após login bem-sucedido
    } catch (error) {
      // Erros são tratados no AuthContext
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <img src="/placeholder.svg" alt="Logo" className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-primary">Futevôlei Presença</h1>
          <p className="text-black">Faça login para confirmar sua presença nas aulas</p>
        </div>
        
        <div className="glass-effect rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1 text-primary-foreground">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary/70">
                  <User size={16} />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="seu@email.com"
                  error={!!errors.email}
                  required
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive font-medium">{errors.email}</p>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1 text-primary-foreground">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary/70">
                  <Key size={16} />
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                  error={!!errors.password}
                  required
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-destructive font-medium">{errors.password}</p>
                )}
              </div>
            </div>
            
            <Button 
              type="submit" 
              fullWidth 
              size="lg" 
              isLoading={isLoading}
              rightIcon={<ChevronRight size={18} />}
            >
              Entrar
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-primary-foreground">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
