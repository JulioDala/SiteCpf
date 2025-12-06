// app/login/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Suspense, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/storage/atuh-storage';

const loginSchema = z.object({
  email: z.string().min(4, 'Insira um e-mail ou telefone válido'),
  senha: z.string().min(4, 'A senha deve ter pelo menos 4 caracteres'),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { error, loading, login, clearError } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ Pegar URL de redirect (se houver)
  const redirectUrl = searchParams.get('redirect') || '/dashboard/home';

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema)
  });

  // ✅ Limpar erro ao desmontar
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const onSubmit = async (data: LoginSchema) => {
    console.log("🔵 Formulário submetido");
    console.log("🔵 Redirect URL:", redirectUrl);

    try {
      await login({
        username: data.email,
        password: data.senha
      });

      console.log("✅ Login bem-sucedido!");
      console.log("✅ Redirecionando para:", redirectUrl);

      // ✅ Aguardar um pouco para o cookie ser salvo
      setTimeout(() => {
        router.push(redirectUrl);
      }, 100);

    } catch (err: any) {
      console.error("❌ Erro no formulário:", err);
      // O erro já está no state e será mostrado automaticamente
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-cyan-50 text-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-md w-full border-0 shadow-lg bg-white">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 flex items-center justify-center">
                <img
                  src="/images/ico-paz-flor.png"
                  alt="Logo CPF"
                  className="w-full h-full rounded-xl"
                />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-center text-gray-900">
              Bem-vindo
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Entre com seu e-mail ou telefone e senha para acessar o sistema.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

              {/* ✅ MOSTRAR ERRO DE AUTENTICAÇÃO */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription className="text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* CAMPO EMAIL */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium">
                  E-mail ou Telefone
                </Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="ex: cliente@email.com"
                  {...register("email")}
                  className="border-gray-300 focus:border-purple-600 focus:ring-purple-600"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email.message}</p>
                )}
              </div>

              {/* CAMPO SENHA */}
              <div className="space-y-2">
                <Label htmlFor="senha" className="text-gray-700 font-medium">
                  Senha
                </Label>
                <Input
                  id="senha"
                  type="password"
                  placeholder="Sua senha"
                  {...register("senha")}
                  className="border-gray-300 focus:border-purple-600 focus:ring-purple-600"
                  disabled={loading}
                />
                {errors.senha && (
                  <p className="text-red-500 text-sm">{errors.senha.message}</p>
                )}
              </div>

              {/* BOTÃO */}
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-base font-semibold"
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar no Sistema'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Esqueceu a senha?{' '}
                <a href="/recuperar-senha" className="text-purple-600 hover:text-purple-700 font-semibold underline">
                  Recuperar
                </a>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-500">
                Não tem uma conta?{' '}
                <a href="/registro" className="text-purple-600 hover:text-purple-700 font-semibold">
                  Registre-se
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Suspense>

  );
}