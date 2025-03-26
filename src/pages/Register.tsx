
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../components/ui/input';
import Button from '../components/Button';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, User, Mail, Lock, Calendar, Clock, Camera, X, Check, ChevronLeft } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const availableTimes = ['6h30', '8h', '8h30', '12h', '17h', '18h30', '20h'];
const availableDays = ['Segunda', 'Terça', 'Quarta', 'Quinta'];

// Schema for form validation
const registerSchema = z.object({
  fullName: z
    .string()
    .min(3, "Nome completo é obrigatório")
    .refine(
      (val) => val.trim().split(/\s+/).length >= 3,
      "Nome completo deve ter pelo menos 3 palavras"
    )
    .refine(
      (val) => /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(val),
      "Nome deve conter apenas letras e espaços"
    ),
  email: z
    .string()
    .min(1, "Email é obrigatório")
    .email("Formato de email inválido")
    .refine(
      (email) => !email.endsWith('@temp.com') && !email.endsWith('@disposable.com'),
      "Emails descartáveis não são permitidos"
    ),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .refine((val) => /[A-Z]/.test(val), "Deve conter pelo menos uma letra maiúscula")
    .refine((val) => /[0-9]/.test(val), "Deve conter pelo menos um número")
    .refine(
      (val) => /[!@#$%^&*(),.?":{}|<>]/.test(val),
      "Deve conter pelo menos um caractere especial"
    ),
  confirmPassword: z.string(),
  preferredDays: z.array(z.string()).min(1, "Selecione pelo menos um dia de preferência"),
  preferredTimes: z.array(z.string()).min(1, "Selecione pelo menos um horário preferido"),
  acceptTerms: z.boolean().refine((val) => val === true, "Você deve aceitar os termos de uso"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { signUp, isLoading } = useAuth();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      preferredDays: [],
      preferredTimes: [],
      acceptTerms: false,
    },
  });

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar tamanho do arquivo (5MB)
    if (file.size > 5 * 1024 * 1024) {
      form.setError("root", {
        type: "manual",
        message: "A imagem deve ter no máximo 5MB"
      });
      return;
    }

    // Verificar tipo de arquivo
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      form.setError("root", {
        type: "manual",
        message: "Apenas imagens JPG e PNG são aceitas"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProfileImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      // Passar os dados para o AuthContext
      await signUp(data.email, data.password, {
        fullName: data.fullName,
        profileImage,
        preferredDays: data.preferredDays,
        preferredTimes: data.preferredTimes
      });
      
      // Redirecionamento é feito no AuthContext após o cadastro bem-sucedido
    } catch (error) {
      // Erros são tratados no AuthContext
      console.error("Erro ao cadastrar:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-start items-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center">
          <Link to="/login" className="text-white hover:text-primary/80 flex items-center">
            <ChevronLeft size={20} />
            <span className="ml-1">Voltar</span>
          </Link>
        </div>
        
        <div className="text-center mb-8">
          <div className="mx-auto w-24 h-24 rounded-full overflow-hidden flex items-center justify-center mb-6">
            <img src="/logo-futevolei.png" alt="Logo Futevôlei" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-primary">Futvôlei Presença</h1>
          <p className="text-white">Cadastre-se para acompanhar as aulas</p>
        </div>

        <div className="glass-effect rounded-2xl p-6 shadow-sm bg-secondary border border-primary/30">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Image Upload */}
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative">
                  <Avatar className="w-24 h-24 border-2 border-primary mb-2">
                    {profileImage ? (
                      <AvatarImage src={profileImage} alt="Foto de perfil" />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary flex items-center justify-center">
                        <User size={36} />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-primary rounded-full p-1.5 text-white hover:bg-primary/80 transition-colors"
                  >
                    <Camera size={18} />
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleProfileImageChange}
                  accept="image/jpeg, image/png"
                  className="hidden"
                />
                <span className="text-xs text-primary-foreground mt-1">
                  Foto de perfil (opcional)
                </span>
              </div>

              {/* Full Name */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">Nome Completo</FormLabel>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary/70">
                        <User size={16} />
                      </div>
                      <FormControl>
                        <Input
                          placeholder="Digite seu nome completo"
                          className="pl-10"
                          error={!!form.formState.errors.fullName}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    {form.formState.errors.fullName && (
                      <p className="mt-1 text-sm text-destructive font-medium">
                        {form.formState.errors.fullName.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">Email</FormLabel>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary/70">
                        <Mail size={16} />
                      </div>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          className="pl-10"
                          error={!!form.formState.errors.email}
                          {...field}
                        />
                      </FormControl>
                    </div>
                    {form.formState.errors.email && (
                      <p className="mt-1 text-sm text-destructive font-medium">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">Senha</FormLabel>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary/70">
                        <Lock size={16} />
                      </div>
                      <FormControl>
                        <Input
                          type={passwordVisible ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          error={!!form.formState.errors.password}
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary/70"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                      >
                        {passwordVisible ? (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                            <line x1="2" x2="22" y1="2" y2="22"></line>
                          </svg>
                        ) : (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        )}
                      </button>
                    </div>
                    {form.formState.errors.password && (
                      <p className="mt-1 text-sm text-destructive font-medium">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary-foreground">Confirmar Senha</FormLabel>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-primary/70">
                        <Lock size={16} />
                      </div>
                      <FormControl>
                        <Input
                          type={confirmPasswordVisible ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          error={!!form.formState.errors.confirmPassword}
                          {...field}
                        />
                      </FormControl>
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-primary/70"
                        onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                      >
                        {confirmPasswordVisible ? (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                            <line x1="2" x2="22" y1="2" y2="22"></line>
                          </svg>
                        ) : (
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="16" 
                            height="16" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          >
                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        )}
                      </button>
                    </div>
                    {form.formState.errors.confirmPassword && (
                      <p className="mt-1 text-sm text-destructive font-medium">
                        {form.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />

              {/* Password Strength Indicator */}
              <div className="mt-1 mb-4">
                <p className="text-xs text-primary-foreground mb-1">A senha deve conter:</p>
                <div className="grid grid-cols-2 gap-1">
                  <div className="flex items-center text-xs">
                    <span className={`mr-1 ${form.watch("password")?.length >= 8 ? "text-green-500" : "text-primary/50"}`}>
                      {form.watch("password")?.length >= 8 ? <Check size={12} /> : <X size={12} />}
                    </span>
                    <span className={form.watch("password")?.length >= 8 ? "text-green-500" : "text-primary/50"}>
                      Mínimo 8 caracteres
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className={`mr-1 ${/[A-Z]/.test(form.watch("password") || "") ? "text-green-500" : "text-primary/50"}`}>
                      {/[A-Z]/.test(form.watch("password") || "") ? <Check size={12} /> : <X size={12} />}
                    </span>
                    <span className={/[A-Z]/.test(form.watch("password") || "") ? "text-green-500" : "text-primary/50"}>
                      Uma letra maiúscula
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className={`mr-1 ${/[0-9]/.test(form.watch("password") || "") ? "text-green-500" : "text-primary/50"}`}>
                      {/[0-9]/.test(form.watch("password") || "") ? <Check size={12} /> : <X size={12} />}
                    </span>
                    <span className={/[0-9]/.test(form.watch("password") || "") ? "text-green-500" : "text-primary/50"}>
                      Um número
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span className={`mr-1 ${/[!@#$%^&*(),.?":{}|<>]/.test(form.watch("password") || "") ? "text-green-500" : "text-primary/50"}`}>
                      {/[!@#$%^&*(),.?":{}|<>]/.test(form.watch("password") || "") ? <Check size={12} /> : <X size={12} />}
                    </span>
                    <span className={/[!@#$%^&*(),.?":{}|<>]/.test(form.watch("password") || "") ? "text-green-500" : "text-primary/50"}>
                      Um caractere especial
                    </span>
                  </div>
                </div>
              </div>

              {/* Preferred Days */}
              <div className="space-y-2">
                <Label className="text-primary-foreground flex items-center mb-2">
                  <Calendar size={16} className="mr-2" />
                  Dias de Preferência
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableDays.map((day) => (
                    <Label
                      key={day}
                      className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer transition-colors ${
                        form.watch("preferredDays")?.includes(day)
                          ? "border-primary bg-primary/10 text-white"
                          : "border-primary/30 text-primary-foreground"
                      }`}
                    >
                      <Checkbox
                        checked={form.watch("preferredDays")?.includes(day)}
                        onCheckedChange={(checked) => {
                          const currentValue = form.getValues("preferredDays");
                          if (checked) {
                            form.setValue("preferredDays", [...currentValue, day]);
                          } else {
                            form.setValue(
                              "preferredDays",
                              currentValue.filter((value) => value !== day)
                            );
                          }
                        }}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                      <span>{day}</span>
                    </Label>
                  ))}
                </div>
                {form.formState.errors.preferredDays && (
                  <p className="mt-1 text-sm text-destructive font-medium">
                    {form.formState.errors.preferredDays.message}
                  </p>
                )}
              </div>

              {/* Preferred Times */}
              <div className="space-y-2">
                <Label className="text-primary-foreground flex items-center mb-2">
                  <Clock size={16} className="mr-2" />
                  Horários Preferidos
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {availableTimes.map((time) => (
                    <Label
                      key={time}
                      className={`flex items-center space-x-2 p-2 rounded-md border cursor-pointer transition-colors ${
                        form.watch("preferredTimes")?.includes(time)
                          ? "border-primary bg-primary/10 text-white"
                          : "border-primary/30 text-primary-foreground"
                      }`}
                    >
                      <Checkbox
                        checked={form.watch("preferredTimes")?.includes(time)}
                        onCheckedChange={(checked) => {
                          const currentValue = form.getValues("preferredTimes");
                          if (checked) {
                            form.setValue("preferredTimes", [...currentValue, time]);
                          } else {
                            form.setValue(
                              "preferredTimes",
                              currentValue.filter((value) => value !== time)
                            );
                          }
                        }}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                      <span>{time}</span>
                    </Label>
                  ))}
                </div>
                {form.formState.errors.preferredTimes && (
                  <p className="mt-1 text-sm text-destructive font-medium">
                    {form.formState.errors.preferredTimes.message}
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-2">
                <Label className="flex items-start space-x-2 cursor-pointer">
                  <Checkbox
                    checked={form.watch("acceptTerms")}
                    onCheckedChange={(checked) => {
                      form.setValue("acceptTerms", checked as boolean);
                    }}
                    className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground mt-1"
                  />
                  <span className="text-sm text-primary-foreground">
                    Eu aceito os{" "}
                    <a href="#" className="text-primary underline">
                      Termos de Uso
                    </a>{" "}
                    e{" "}
                    <a href="#" className="text-primary underline">
                      Política de Privacidade
                    </a>
                  </span>
                </Label>
                {form.formState.errors.acceptTerms && (
                  <p className="mt-1 text-sm text-destructive font-medium">
                    {form.formState.errors.acceptTerms.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                fullWidth 
                size="lg" 
                isLoading={isLoading}
                rightIcon={<CheckCircle size={18} />}
              >
                Criar Conta
              </Button>
            </form>
          </Form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-primary-foreground">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Fazer Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
