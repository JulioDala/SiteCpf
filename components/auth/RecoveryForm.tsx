'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { z } from 'zod';
import { ArrowLeft, Mail, Lock } from 'lucide-react';

// Schema para solicitar recuperação
const recuperarSenhaSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

// Schema para redefinir senha
const redefinirSenhaSchema = z.object({
  codigo: z.string().length(6, 'O código deve ter 6 dígitos'),
  novaSenha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmarSenha: z.string(),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
});

type RecuperarSenhaData = z.infer<typeof recuperarSenhaSchema>;
type RedefinirSenhaData = z.infer<typeof redefinirSenhaSchema>;

export default function RecuperarSenhaPage() {
  const router = useRouter();
  const [step, setStep] = useState<'solicitar' | 'redefinir'>('solicitar');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [email, setEmail] = useState('');
  
  const [recuperarData, setRecuperarData] = useState<RecuperarSenhaData>({
    email: '',
  });

  const [redefinirData, setRedefinirData] = useState<RedefinirSenhaData>({
    codigo: '',
    novaSenha: '',
    confirmarSenha: '',
  });

  const handleRecuperarChange = (field: keyof RecuperarSenhaData, value: string) => {
    setRecuperarData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRedefinirChange = (field: keyof RedefinirSenhaData, value: string) => {
    setRedefinirData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSolicitarRecuperacao = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      recuperarSenhaSchema.parse(recuperarData);

      // MOCK: Simula envio de e-mail
      // const res = await authAPI.solicitarRecuperacao(recuperarData);
      setTimeout(() => {
        setEmail(recuperarData.email);
        setStep('redefinir');
        setLoading(false);
      }, 1500);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        (error as any).errors.forEach((err: any) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      setLoading(false);
    }
  };

  const handleRedefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      redefinirSenhaSchema.parse(redefinirData);

      // MOCK: Simula redefinição de senha
      // const res = await authAPI.redefinirSenha({ email, ...redefinirData });
      setTimeout(() => {
        alert('Senha redefinida com sucesso!');
        router.push('/login');
        setLoading(false);
      }, 1500);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        (error as any).errors.forEach((err: any) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      setLoading(false);
    }
  };

  const handleReenviarCodigo = () => {
    setLoading(true);
    // MOCK: Simula reenvio de código
    setTimeout(() => {
      alert('Código reenviado para ' + email);
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
          
          {step === 'solicitar' ? (
            <>
              <CardTitle className="text-3xl font-bold text-center text-gray-900">Recuperar Senha</CardTitle>
              <CardDescription className="text-center text-gray-600">
                Digite seu e-mail para receber o código de recuperação.
              </CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="text-3xl font-bold text-center text-gray-900">Definir Nova Senha</CardTitle>
              <CardDescription className="text-center text-gray-600">
                Enviamos um código para <span className="font-semibold text-gray-900">{email}</span>
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {step === 'solicitar' ? (
            <div onSubmit={handleSolicitarRecuperacao} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  E-mail *
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="cliente@email.com" 
                  value={recuperarData.email} 
                  onChange={(e) => handleRecuperarChange('email', e.target.value)} 
                  className={`border-gray-300 focus:border-purple-600 focus:ring-purple-600 ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              <Button 
                onClick={handleSolicitarRecuperacao}
                type="button"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-base font-semibold" 
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Código'}
              </Button>
            </div>
          ) : (
            <div onSubmit={handleRedefinirSenha} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="codigo" className="text-gray-700 font-medium">Código de Verificação *</Label>
                <Input 
                  id="codigo" 
                  type="text" 
                  placeholder="000000" 
                  maxLength={6}
                  value={redefinirData.codigo} 
                  onChange={(e) => handleRedefinirChange('codigo', e.target.value.replace(/\D/g, ''))} 
                  className={`border-gray-300 focus:border-purple-600 focus:ring-purple-600 text-center text-2xl tracking-widest font-semibold ${errors.codigo ? 'border-red-500' : ''}`}
                />
                {errors.codigo && <p className="text-red-500 text-sm">{errors.codigo}</p>}
                <button 
                  type="button"
                  onClick={handleReenviarCodigo}
                  className="text-sm text-purple-600 hover:text-purple-700 font-semibold underline"
                  disabled={loading}
                >
                  Reenviar código
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="novaSenha" className="text-gray-700 font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Nova Senha *
                </Label>
                <Input 
                  id="novaSenha" 
                  type="password" 
                  placeholder="Mínimo 6 caracteres" 
                  value={redefinirData.novaSenha} 
                  onChange={(e) => handleRedefinirChange('novaSenha', e.target.value)} 
                  className={`border-gray-300 focus:border-purple-600 focus:ring-purple-600 ${errors.novaSenha ? 'border-red-500' : ''}`}
                />
                {errors.novaSenha && <p className="text-red-500 text-sm">{errors.novaSenha}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha" className="text-gray-700 font-medium">Confirmar Nova Senha *</Label>
                <Input 
                  id="confirmarSenha" 
                  type="password" 
                  placeholder="Repita a senha" 
                  value={redefinirData.confirmarSenha} 
                  onChange={(e) => handleRedefinirChange('confirmarSenha', e.target.value)} 
                  className={`border-gray-300 focus:border-purple-600 focus:ring-purple-600 ${errors.confirmarSenha ? 'border-red-500' : ''}`}
                />
                {errors.confirmarSenha && <p className="text-red-500 text-sm">{errors.confirmarSenha}</p>}
              </div>

              <Button 
                onClick={handleRedefinirSenha}
                type="button"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-base font-semibold" 
                disabled={loading}
              >
                {loading ? 'Redefinindo...' : 'Redefinir Senha'}
              </Button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <button 
              onClick={() => router.push('/auth/login')}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}