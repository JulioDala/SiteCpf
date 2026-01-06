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
import { ArrowLeft, Mail, Lock, Phone, User, Shield, Check, X, Key } from 'lucide-react';
import { useAuthStore } from '@/storage/atuh-storage';
import Swal from 'sweetalert2';

// Schema para solicitar recuperação
const solicitarRecuperacaoSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

// Schema para código de verificação
const codigoVerificacaoSchema = z.object({
  codigo: z.string()
    .length(6, 'O código deve ter 6 dígitos')
    .regex(/^\d+$/, 'O código deve conter apenas números'),
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

type SolicitarRecuperacaoData = z.infer<typeof solicitarRecuperacaoSchema>;
type CodigoVerificacaoData = z.infer<typeof codigoVerificacaoSchema>;
type RedefinirSenhaData = z.infer<typeof redefinirSenhaSchema>;

export default function RecuperarSenhaPage() {
  const router = useRouter();
  const [step, setStep] = useState<'solicitar' | 'codigo' | 'redefinir'>('solicitar');
  const [codigoGerado, setCodigoGerado] = useState<string>('');
  const [emailAtual, setEmailAtual] = useState<string>('');
  const [tentativasCodigo, setTentativasCodigo] = useState(0);
  const MAX_TENTATIVAS = 3;
  
  const {
    sendEmailVerification,
    verifyRecoveryCode,
    resetPassword,
    verificador,
    loadingEmail,
    errorEmail,
    clearEmailError,
  } = useAuthStore();

  // Formulário para solicitar recuperação
  const {
    register: registerSolicitar,
    handleSubmit: handleSubmitSolicitar,
    formState: { errors: errorsSolicitar, isSubmitting: isSubmittingSolicitar },
    setError: setErrorSolicitar,
    watch: watchSolicitar,
    reset: resetSolicitar,
  } = useForm<SolicitarRecuperacaoData>({
    resolver: zodResolver(solicitarRecuperacaoSchema),
    defaultValues: {
      email: '',
    },
    mode: 'onChange',
  });

  // Formulário para código de verificação
  const {
    register: registerCodigo,
    handleSubmit: handleSubmitCodigo,
    formState: { errors: errorsCodigo, isSubmitting: isSubmittingCodigo },
    watch: watchCodigo,
    reset: resetCodigo,
  } = useForm<CodigoVerificacaoData>({
    resolver: zodResolver(codigoVerificacaoSchema),
    defaultValues: {
      codigo: '',
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
  const email = watchSolicitar('email');

  // Limpar erros quando mudar de step
  useEffect(() => {
    if (errorEmail) {
      clearEmailError();
    }
  }, [step, errorEmail, clearEmailError]);

  // Gerar código aleatório de 6 dígitos
  const gerarCodigo = () => {
    const codigo = Math.floor(100000 + Math.random() * 900000).toString();
    setCodigoGerado(codigo);
    return codigo;
  };

  // Step 1: Solicitar recuperação e enviar código
  const handleSolicitarRecuperacao = async (data: SolicitarRecuperacaoData) => {
    Swal.fire({
      title: 'Enviando código de verificação...',
      text: 'Por favor, aguarde enquanto enviamos o código para seu email.',
      allowOutsideClick: false,
      showConfirmButton: false, // Remove o botão OK durante o loading
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const codigo = gerarCodigo();
      setEmailAtual(data.email);
      
      const resultado = await sendEmailVerification(data.email, codigo);
      
      Swal.close();
      
      if (resultado.success) {
        Swal.fire({
          icon: 'success',
          title: 'Código Enviado!',
          html: `
            <div style="text-align: center;">
              <div style="width: 4rem; height: 4rem; background-color: #d1fae5; border-radius: 9999px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
                <svg style="width: 2rem; height: 2rem; color: #059669;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p style="margin-bottom: 0.5rem; font-weight: 600;">Código enviado com sucesso!</p>
              <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 1rem;">
                Enviamos um código de 6 dígitos para:
                <br />
                <span style="font-weight: 600; color: #111827;">${data.email}</span>
              </p>
              ${process.env.NODE_ENV === 'development' ? `
                <div style="background-color: #f3f4f6; padding: 0.75rem; border-radius: 0.5rem; margin-top: 1rem;">
                  <p style="font-size: 0.75rem; color: #6b7280; margin-bottom: 0.25rem;">🚨 DESENVOLVIMENTO APENAS</p>
                  <p style="font-weight: 600; font-size: 1.25rem; letter-spacing: 0.5em; color: #7c3aed;">${codigo}</p>
                </div>
              ` : ''}
            </div>
          `,
          confirmButtonColor: '#7C3AED',
          confirmButtonText: 'OK',
          allowOutsideClick: false,
        }).then(() => {
          setStep('codigo');
          setTentativasCodigo(0);
        });
      }
    } catch (error: any) {
      Swal.close();
      
      Swal.fire({
        icon: 'error',
        title: 'Erro ao enviar código',
        text: error.message || 'Não foi possível enviar o código de verificação.',
        confirmButtonColor: '#7C3AED',
        confirmButtonText: 'OK',
      });

      setErrorSolicitar('email', {
        type: 'manual',
        message: 'Erro ao enviar código de verificação',
      });
    }
  };

  // Step 2: Verificar código
// Step 2: Verificar código
// Step 2: Verificar código - VERSÃO SIMPLIFICADA
const handleVerificarCodigo = async (data: CodigoVerificacaoData) => {
  if (!emailAtual) return;
  
  if (tentativasCodigo >= MAX_TENTATIVAS) {
    Swal.fire({
      icon: 'error',
      title: 'Muitas tentativas',
      text: 'Você excedeu o número máximo de tentativas. Solicite um novo código.',
      confirmButtonColor: '#7C3AED',
      confirmButtonText: 'OK',
    }).then(() => {
      setStep('solicitar');
      resetCodigo();
      setTentativasCodigo(0);
    });
    return;
  }

  try {
    const isValid = await verifyRecoveryCode(emailAtual, data.codigo);
    
    if (isValid) {
      // ✅ APENAS SweetAlert com botão OK, SEM loading
      Swal.fire({
        icon: 'success',
        title: 'Código Válido!',
        html: `
          <div style="text-align: center;">
            <div style="width: 4rem; height: 4rem; background-color: #d1fae5; border-radius: 9999px; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
              <svg style="width: 2rem; height: 2rem; color: #059669;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p style="font-weight: 600; color: #111827; margin-bottom: 0.5rem;">Código verificado com sucesso!</p>
            <p style="font-size: 0.875rem; color: #6b7280;">Agora você pode redefinir sua senha.</p>
          </div>
        `,
        confirmButtonColor: '#7C3AED',
        confirmButtonText: 'OK',
        allowOutsideClick: false,
      }).then(() => {
        setStep('redefinir');
      });
    } else {
      setTentativasCodigo(prev => prev + 1);
      const tentativasRestantes = MAX_TENTATIVAS - (tentativasCodigo + 1);
      
      Swal.fire({
        icon: 'error',
        title: 'Código Inválido',
        html: `
          <div style="text-align: center;">
            <p style="margin-bottom: 1rem;">O código inserido está incorreto.</p>
            <p style="font-size: 0.875rem; color: #6b7280;">
              Tentativas restantes: <span style="font-weight: 600; color: ${tentativasRestantes === 0 ? '#ef4444' : '#f59e0b'}">${tentativasRestantes}</span>
            </p>
          </div>
        `,
        confirmButtonColor: '#7C3AED',
        confirmButtonText: 'OK',
      });
    }
  } catch (error: any) {
    Swal.fire({
      icon: 'error',
      title: 'Erro na verificação',
      text: error.message || 'Ocorreu um erro ao verificar o código.',
      confirmButtonColor: '#7C3AED',
      confirmButtonText: 'OK',
    });
  }
};
  // Step 3: Redefinir senha
  const handleRedefinirSenha = async (data: RedefinirSenhaData) => {
    if (!emailAtual) return;

    Swal.fire({
      title: 'Redefinindo senha...',
      text: 'Por favor, aguarde enquanto atualizamos sua senha.',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const resultado = await resetPassword(emailAtual, data.novaSenha);

      Swal.close();
      
      if (resultado.success) {
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
              <p style="margin-bottom: 0.5rem; font-weight: 600;">Senha redefinida com sucesso!</p>
              <p style="font-size: 0.875rem; color: #6b7280;">Você já pode fazer login com sua nova senha.</p>
            </div>
          `,
          confirmButtonColor: '#7C3AED',
          confirmButtonText: 'OK',
        }).then(() => {
          // Limpar tudo e redirecionar
          resetSolicitar();
          resetCodigo();
          resetRedefinir();
          setEmailAtual('');
          setCodigoGerado('');
          setTentativasCodigo(0);
          
          router.push('/auth/login');
        });
      }
    } catch (error: any) {
      Swal.close();
      
      Swal.fire({
        icon: 'error',
        title: 'Erro ao redefinir senha',
        text: error.message || 'Ocorreu um erro ao redefinir sua senha.',
        confirmButtonColor: '#7C3AED',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleVoltar = () => {
    if (step === 'codigo' || step === 'redefinir') {
      if (step === 'redefinir') {
        setStep('codigo');
        resetRedefinir();
      } else {
        setStep('solicitar');
        resetCodigo();
        setTentativasCodigo(0);
      }
    } else {
      router.push('/auth/login');
    }
  };

  const handleReenviarCodigo = async () => {
    if (!emailAtual) return;

    Swal.fire({
      title: 'Reenviando código...',
      text: 'Por favor, aguarde enquanto enviamos um novo código.',
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const codigo = gerarCodigo();
      const resultado = await sendEmailVerification(emailAtual, codigo);
      
      Swal.close();
      
      if (resultado.success) {
        Swal.fire({
          icon: 'success',
          title: 'Código Reenviado!',
          text: 'Um novo código foi enviado para seu email.',
          confirmButtonColor: '#7C3AED',
          confirmButtonText: 'OK',
        }).then(() => {
          resetCodigo();
          setTentativasCodigo(0);
        });
      }
    } catch (error: any) {
      Swal.close();
      
      Swal.fire({
        icon: 'error',
        title: 'Erro ao reenviar código',
        text: error.message || 'Não foi possível reenviar o código.',
        confirmButtonColor: '#7C3AED',
        confirmButtonText: 'OK',
      });
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
                Digite seu e-mail para receber um código de verificação.
              </CardDescription>
            </>
          )}

          {step === 'codigo' && (
            <>
              <CardTitle className="text-3xl font-bold text-center text-gray-900">Verificar Código</CardTitle>
              <CardDescription className="text-center text-gray-600">
                Digite o código de 6 dígitos enviado para seu email.
              </CardDescription>
            </>
          )}

          {step === 'redefinir' && (
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
            <form onSubmit={handleSubmitSolicitar(handleSolicitarRecuperacao)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  E-mail *
                </Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu@email.com" 
                  disabled={isSubmittingSolicitar || loadingEmail}
                  className={`border-gray-300 focus:border-purple-600 focus:ring-purple-600 ${
                    errorsSolicitar.email ? 'border-red-500' : ''
                  }`}
                  {...registerSolicitar('email')}
                />
                {errorsSolicitar.email && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errorsSolicitar.email.message}
                  </p>
                )}
                {errorEmail && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <X className="w-3 h-3" />
                    {errorEmail}
                  </p>
                )}
              </div>

              <Button 
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-base font-semibold" 
                disabled={isSubmittingSolicitar || loadingEmail}
              >
                {loadingEmail ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enviando código...
                  </span>
                ) : 'Enviar Código'}
              </Button>
            </form>
          )}

          {/* STEP 2: Digitar código */}
          {step === 'codigo' && (
            <div className="space-y-5">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Verificação por Email</p>
                    <p className="text-sm text-gray-600">{emailAtual}</p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <p className="text-sm text-blue-700 flex items-start gap-2">
                    <Key className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    Enviamos um código de 6 dígitos para seu email. Digite-o abaixo.
                  </p>
                </div>

                <div className="text-sm text-gray-600">
                  <p className="font-medium">Tentativas: <span className={`font-bold ${tentativasCodigo >= MAX_TENTATIVAS ? 'text-red-600' : 'text-amber-600'}`}>
                    {tentativasCodigo}/{MAX_TENTATIVAS}
                  </span></p>
                  {tentativasCodigo > 0 && (
                    <p className="text-amber-600 text-xs mt-1">
                      Código inválido. Verifique e tente novamente.
                    </p>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmitCodigo(handleVerificarCodigo)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo" className="text-gray-700 font-medium flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Código de Verificação *
                  </Label>
                  <Input 
                    id="codigo" 
                    type="text" 
                    placeholder="000000"
                    maxLength={6}
                    disabled={isSubmittingCodigo}
                    className={`text-center text-2xl tracking-widest font-mono border-gray-300 focus:border-purple-600 focus:ring-purple-600 ${
                      errorsCodigo.codigo ? 'border-red-500' : ''
                    }`}
                    {...registerCodigo('codigo')}
                  />
                  {errorsCodigo.codigo && (
                    <p className="text-red-500 text-sm flex items-center gap-1">
                      <X className="w-3 h-3" />
                      {errorsCodigo.codigo.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-base font-semibold"
                  disabled={isSubmittingCodigo || tentativasCodigo >= MAX_TENTATIVAS}
                >
                  {isSubmittingCodigo ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verificando...
                    </span>
                  ) : 'Verificar Código'}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleReenviarCodigo}
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                    disabled={loadingEmail}
                  >
                    {loadingEmail ? 'Enviando...' : 'Não recebeu o código? Clique para reenviar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: Redefinir senha */}
          {step === 'redefinir' && (
            <form onSubmit={handleSubmitRedefinir(handleRedefinirSenha)} className="space-y-5">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Redefinindo senha para:</p>
                <p className="font-semibold text-gray-900">{emailAtual}</p>
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

          {/* Mostrar status do verificador */}
          {verificador && (
            <div className={`mt-4 p-3 rounded-md ${verificador.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm flex items-center gap-2 ${verificador.success ? 'text-green-700' : 'text-red-700'}`}>
                {verificador.success ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
                {verificador.message}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}