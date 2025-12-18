// app/auth/login/LoginForm.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Eye, EyeOff, LogIn } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/storage/atuh-storage';
import Image from 'next/image';

const loginSchema = z.object({
  email: z.string().min(4, 'Insira um e-mail ou telefone válido'),
  senha: z.string().min(4, 'A senha deve ter pelo menos 4 caracteres'),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { error, loading, login, clearError } = useAuthStore();
  const router = useRouter();
  
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema)
  });

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const onSubmit = async (data: LoginSchema) => {
    try {
      await login({ 
        username: data.email, 
        password: data.senha 
      });
      
      setTimeout(() => {
        router.push('/dashboard/home');
      }, 100);
      
    } catch (err: any) {
      console.error("❌ Erro no formulário:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-cyan-50 to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="fixed top-4 right-4 z-10"></div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative">
            <Image src="/images/ico-paz-flor.png" alt="Centro Paz Flor" width={160} height={80} className="mb-4" />
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
              Centro Cultural Paz Flor
            </h1>
            <p className="text-xl text-muted-foreground max-w-md">
              Sistema de Gestão Integrado para Eventos, Ginásio e Administração
            </p>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Eventos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                <span>Ginásio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Gestão</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-2">
              <div className="lg:hidden mb-4">
                <Image
                  src="/images/ico-paz-flor.png"
                  alt="Centro Paz Flor"
                  width={100}
                  height={50}
                  className="mx-auto"
                />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">Bem-vindo ao Portal do Cliente</CardTitle>
              <CardDescription className="text-muted-foreground">Entre com seu e-mail e senha para acessar o sistema.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="ex: cliente@email.com"
                    {...register("email")}
                    className="bg-background border-border"
                    disabled={loading}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senha" className="text-foreground font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      {...register("senha")}
                      className="bg-background border-border pr-10"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  {errors.senha && (
                    <p className="text-red-500 text-sm">{errors.senha.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white py-6 text-base font-semibold"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Entrando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Entrar no Sistema
                    </div>
                  )}
                </Button>
              </form>

              {/* <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-500">
                  Não tem uma conta?{' '}
                  <a href="/auth/registro" className="text-purple-600 hover:text-purple-700 font-semibold">
                    Registre-se
                  </a>
                </p>
              </div> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}