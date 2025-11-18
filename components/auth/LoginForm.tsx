'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // MOCK: Simula login com dados falsos
    // try { const res = await authAPI.login({ email, senha }); login(res.data.token, res.data.user); }
    // catch { alert('Erro no login'); }
    const mockUser = { id: '1', nome: 'Pedro Almeida', email, status: 'Ativo' as const };
    setTimeout(() => {  // Simula delay de API
      login("admin@gmail.com", "1234");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-cyan-50 text-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-md w-full border-0 shadow-lg bg-white">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 flex items-center justify-center">
              <img src="./../images/ico-paz-flor.png" alt="Logo CPF" className="w-full h-full rounded-xl" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center text-gray-900">Bem-vindo</CardTitle>
          <CardDescription className="text-center text-gray-600">Entre com seu e-mail ou telefone e senha para acessar o sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">E-mail ou Telefone</Label>
              <Input 
                id="email" 
                type="text" 
                placeholder="ex: cliente@email.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="border-gray-300 focus:border-purple-600 focus:ring-purple-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha" className="text-gray-700 font-medium">Senha</Label>
              <Input 
                id="senha" 
                type="password" 
                placeholder="Sua senha" 
                value={senha} 
                onChange={(e) => setSenha(e.target.value)} 
                required 
                className="border-gray-300 focus:border-purple-600 focus:ring-purple-600"
              />
            </div>
            <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-base font-semibold" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar no Sistema'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Esqueceu a senha? <Link href={`/auth/recuperar`} className="text-purple-600 hover:text-purple-700 font-semibold underline">Recuperar</Link>
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-sm text-gray-500">
              Não tem uma conta? <Link href={`/auth/registro`} className="text-purple-600 hover:text-purple-700 font-semibold">Registre-se</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}