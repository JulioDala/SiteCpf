'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { z } from 'zod';
import { ArrowLeft, Mail, Lock, Phone, User, Shield, Check, X } from 'lucide-react';
import { useAuthStore } from '@/storage/atuh-storage';
import Swal from 'sweetalert2';

// Schema para solicitar recuperação
const recuperarSenhaSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

// Schema para redefinir senha
const redefinirSenhaSchema = z.object({
  novaSenha: z.string()
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Deve conter pelo menos um número'),
  confirmarSenha: z.string(),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
});

type RecuperarSenhaData = z.infer<typeof recuperarSenhaSchema>;
type RedefinirSenhaData = z.infer<typeof redefinirSenhaSchema>;

export default function RecuperarSenhaPage() {
  const router = useRouter();
  const [step, setStep] = useState<'solicitar' | 'verificar' | 'redefinir'>('solicitar');
  const [verificandoTelefone, setVerificandoTelefone] = useState(false);
  
  const {
    findByEmail,
    clienteFindByEmail,
    loadingFindByEmail,
    errorFindByEmail,
    recuperarSenha,
    clearFindByEmailError,
    clearFindByEmailData
  } = useAuthStore();

  // Formulário para solicitar recuperação
  const {
    register: registerRecuperar,
    handleSubmit: handleSubmitRecuperar,
    formState: { errors: errorsRecuperar, isSubmitting: isSubmittingRecuperar },
    setError: setErrorRecuperar,
    watch: watchRecuperar,
    reset: resetRecuperar,
  } = useForm<RecuperarSenhaData>({
    resolver: zodResolver(recuperarSenhaSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  });

  // Formulário para redefinir senha
  const {
    register: registerRedefinir,
    handleSubmit: handleSubmitRedefinir,
    formState: { 
      errors: errorsRedefinir, 
      isSubmitting: isSubmittingRedefinir,
      isDirty: isDirtyRedefinir 
    },
    watch: watchRedefinir,
    reset: resetRedefinir,
  } = useForm<RedefinirSenhaData>({
    resolver: zodResolver(redefinirSenhaSchema),
    defaultValues: {
      novaSenha: '',
      confirmarSenha: '',
    },
    mode: 'onChange',
  });

  // Observar a nova senha para validação em tempo real
  const novaSenha = watchRedefinir('novaSenha');
  const email = watchRecuperar('email');

  // Limpar erros quando mudar de step
  useEffect(() => {
    if (errorFindByEmail) {
      clearFindByEmailError();
    }
  }, [step, errorFindByEmail, clearFindByEmailError]);

  const handleSolicitarRecuperacao = async (data: RecuperarSenhaData) => {
    Swal.fire({
      title: 'Verificando email...',
      text: 'Por favor, aguarde enquanto verificamos sua conta.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const cliente = await findByEmail(data.email);
      
      Swal.close();
      
      if (cliente) {
        setStep('verificar');
      }
    } catch (error: any) {
      Swal.close();
      
      Swal.fire({
        icon: 'error',
        title: 'Email não encontrado',
        text: error.message || 'Não encontramos uma conta com este email.',
        confirmButtonColor: '#7C3AED',
      });

      // Definir erro no formulário
      setErrorRecuperar('email', {
        type: 'manual',
        message: 'Email não encontrado no sistema',
      });
    }
  };

  const handleVerificarTelefone = async () => {
    if (!clienteFindByEmail) return;
    
    setVerificandoTelefone(true);
    
    try {
      const result = await Swal.fire({
        title: 'Verificação de Segurança',
        html: `
          <div style="text-align: left;">
            <p style="margin-bottom: 1rem;">Verificamos que sua conta está associada a:</p>
            <div style="background-color: #f9fafb; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem;">
              <p style="font-weight: 600; color: #111827;">${clienteFindByEmail.nome}</p>
              <p style="font-size: 0.875rem; color: #6b7280;">${clienteFindByEmail.numeroCliente}</p>
            </div>
            <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 1rem;">
              Por questões de segurança, confirme se este telefone está correto:
            </p>
            <div style="text-align: center; font-size: 1.125rem; font-weight: bold; color: #7c3aed;">
              ${clienteFindByEmail.telefone || clienteFindByEmail.whatsapp || 'Não informado'}
            </div>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Sim, está correto',
        cancelButtonText: 'Não é meu',
        confirmButtonColor: '#7C3AED',
        cancelButtonColor: '#6B7280',
        reverseButtons: true,
      });

      setVerificandoTelefone(false);
      
      if (result.isConfirmed) {
        setStep('redefinir');
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Contate o suporte',
          text: 'Se este não é seu telefone, entre em contato com nossa equipe de suporte.',
          confirmButtonColor: '#7C3AED',
        });
      }
    } catch (error) {
      setVerificandoTelefone(false);
      console.error('Erro na verificação:', error);
    }
  };

  const handleRedefinirSenha = async (data: RedefinirSenhaData) => {
    if (!email || !clienteFindByEmail) return;

    Swal.fire({
      title: 'Redefinindo senha...',
      text: 'Por favor, aguarde enquanto atualizamos sua senha.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // A senha atual deve ser fornecida pelo backend ou por um processo de recuperação
      await recuperarSenha(email, {
        senhaAtual: 'TEMP_RECOVERY_PASSWORD', // O backend deve ter um processo para lidar com recuperação
        novaSenha: data.novaSenha,
      });

      Swal.close();
      
      await Swal.fire({
        icon: 'success',
        title: 'Senha Redefinida!',
        html: `
          <div style="text-align: center;">
            <div style="width: 4rem; height: 4rem; background-color: #d1fae5; border-radius: 9999px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
              <svg style="width: 2rem; height: 2rem; color: #059669;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p style="margin-bottom: 0.5rem;">Sua senha foi redefinida com sucesso!</p>
            <p style="font-size: 0.875rem; color: #6b7280;">Você já pode fazer login com sua nova senha.</p>
          </div>
        `,
        confirmButtonColor: '#7C3AED',
      });

      // Limpar dados e redirecionar
      clearFindByEmailData();
      resetRecuperar();
      resetRedefinir();
      router.push('/auth/login');
    } catch (error: any) {
      Swal.close();
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Ocorreu um erro ao redefinir sua senha.';
      
      Swal.fire({
        icon: 'error',
        title: 'Erro ao redefinir senha',
        text: errorMessage,
        confirmButtonColor: '#7C3AED',
      });
    }
  };

  const handleVoltar = () => {
    if (step === 'verificar' || step === 'redefinir') {
      setStep('solicitar');
      clearFindByEmailData();
      resetRecuperar();
      resetRedefinir();
    } else {
      router.push('/auth/login');
    }
  };

  // Funções auxiliares para validação da senha em tempo real
  const getPasswordValidation = () => {
    return {
      minLength: (novaSenha?.length || 0) >= 6,
      hasUpperCase: /[A-Z]/.test(novaSenha || ''),
      hasLowerCase: /[a-z]/.test(novaSenha || ''),
      hasNumber: /[0-9]/.test(novaSenha || ''),
    };
  };

  const validation = getPasswordValidation();

  return (
    <div className="min-h-screen bg-cyan-50 text-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <Card className="mx-auto max-w-md w-full border-0 shadow-lg bg-white">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 flex items-center justify-center">
              <img src="./../images/ico-paz-flor.png" alt="Logo CPF" className="w-full h-full rounded-xl" />
            </div>
          </div>
          
          {step === 'solicitar' && (
            <>
              <CardTitle className="text-3xl font-bold text-center text-gray-900">Recuperar Senha</CardTitle>
              <CardDescription className="text-center text-gray-600">
                Digite seu e-mail para verificar sua conta.
              </CardDescription>
            </>
          )}

          {step === 'verificar' && clienteFindByEmail && (
            <>
              <CardTitle className="text-3xl font-bold text-center text-gray-900">Verificação de Segurança</CardTitle>
              <CardDescription className="text-center text-gray-600">
                Confirme seus dados antes de prosseguir.
              </CardDescription>
            </>
          )}

          {step === 'redefinir' && clienteFindByEmail && (
            <>
              <CardTitle className="text-3xl font-bold text-center text-gray-900">Nova Senha</CardTitle>
              <CardDescription className="text-center text-gray-600">
                Crie uma nova senha para sua conta.
              </CardDescription>
            </>
          )}
        </CardHeader>

        <CardContent>
          {/* STEP 1: Solicitar email */}
          {step === 'solicitar' && (
            <form onSubmit={handleSubmitRecuperar(handleSolicitarRecuperacao)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  E-mail *
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  disabled={isSubmittingRecuperar || loadingFindByEmail}
                  className={`border-gray-300 focus:border-purple-600 focus:ring-purple-600 ${
                    errorsRecuperar.email ? 'border-red-500' : ''
                  }`}
                  {...registerRecuperar('email')}
                />
                {errorsRecuperar.email && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errorsRecuperar.email.message}
                  </p>
                )}
                {errorFindByEmail && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errorFindByEmail}
                  </p>
                )}
              </div>

              <Button 
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-base font-semibold" 
                disabled={isSubmittingRecuperar || loadingFindByEmail}
              >
                {(isSubmittingRecuperar || loadingFindByEmail) ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verificando...
                  </span>
                ) : 'Verificar Email'}
              </Button>
            </form>
          )}

          {/* STEP 2: Verificar dados do cliente */}
          {step === 'verificar' && clienteFindByEmail && (
            <div className="space-y-5">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{clienteFindByEmail.nome}</p>
                    <p className="text-sm text-gray-600">Cliente: {clienteFindByEmail.numeroCliente}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{clienteFindByEmail.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {clienteFindByEmail.telefone || clienteFindByEmail.whatsapp || 'Telefone não informado'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <p className="text-sm text-blue-700 flex items-start gap-2">
                    <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    Por segurança, confirmaremos se este telefone está correto antes de redefinir sua senha.
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleVerificarTelefone}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-base font-semibold"
                disabled={verificandoTelefone}
              >
                {verificandoTelefone ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verificando...
                  </span>
                ) : 'Confirmar e Continuar'}
              </Button>
            </div>
          )}

          {/* STEP 3: Redefinir senha */}
          {step === 'redefinir' && clienteFindByEmail && (
            <form onSubmit={handleSubmitRedefinir(handleRedefinirSenha)} className="space-y-5">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Redefinindo senha para:</p>
                <p className="font-semibold text-gray-900">{clienteFindByEmail.email}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="novaSenha" className="text-gray-700 font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Nova Senha *
                </Label>
                <Input 
                  id="novaSenha" 
                  type="password" 
                  placeholder="Mínimo 6 caracteres com maiúsculas, minúsculas e números"
                  className={`border-gray-300 focus:border-purple-600 focus:ring-purple-600 ${
                    errorsRedefinir.novaSenha ? 'border-red-500' : ''
                  }`}
                  {...registerRedefinir('novaSenha')}
                />
                {errorsRedefinir.novaSenha && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errorsRedefinir.novaSenha.message}
                  </p>
                )}
                
                {/* Validação visual da senha */}
                <div className="mt-2 space-y-2 text-sm text-gray-600">
                  <p className="font-medium">A senha deve conter:</p>
                  <div className="space-y-1 ml-2">
                    <div className="flex items-center gap-2">
                      {validation.minLength ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <X className="w-3 h-3 text-gray-400" />
                      )}
                      <span className={validation.minLength ? 'text-green-600' : 'text-gray-500'}>
                        Mínimo 6 caracteres
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {validation.hasUpperCase ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <X className="w-3 h-3 text-gray-400" />
                      )}
                      <span className={validation.hasUpperCase ? 'text-green-600' : 'text-gray-500'}>
                        Pelo menos uma letra maiúscula
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {validation.hasLowerCase ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <X className="w-3 h-3 text-gray-400" />
                      )}
                      <span className={validation.hasLowerCase ? 'text-green-600' : 'text-gray-500'}>
                        Pelo menos uma letra minúscula
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {validation.hasNumber ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <X className="w-3 h-3 text-gray-400" />
                      )}
                      <span className={validation.hasNumber ? 'text-green-600' : 'text-gray-500'}>
                        Pelo menos um número
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmarSenha" className="text-gray-700 font-medium">
                  Confirmar Nova Senha *
                </Label>
                <Input 
                  id="confirmarSenha" 
                  type="password" 
                  placeholder="Repita a senha"
                  className={`border-gray-300 focus:border-purple-600 focus:ring-purple-600 ${
                    errorsRedefinir.confirmarSenha ? 'border-red-500' : ''
                  }`}
                  {...registerRedefinir('confirmarSenha')}
                />
                {errorsRedefinir.confirmarSenha && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errorsRedefinir.confirmarSenha.message}
                  </p>
                )}
              </div>

              <Button 
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-base font-semibold"
                disabled={isSubmittingRedefinir || !isDirtyRedefinir}
              >
                {isSubmittingRedefinir ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Redefinindo...
                  </span>
                ) : 'Redefinir Senha'}
              </Button>
            </form>
          )}

          {/* Botão voltar */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <button 
              onClick={handleVoltar}
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
              type="button"
            >
              <ArrowLeft className="w-4 h-4" />
              {step === 'solicitar' ? 'Voltar para o login' : 'Voltar'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}