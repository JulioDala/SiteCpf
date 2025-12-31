'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useClienteReservasStore } from '@/storage/cliente-storage';
import { Loader2, CheckCircle2, AlertCircle, User, Mail, Phone, MapPin, CreditCard, Lock, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuthStore } from '@/storage/atuh-storage';

const ClienteTipo = {
  EXTERNO: 'externo',
  SONANGOL: 'sonangol',
} as const;

const clienteSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  tipo: z.enum([ClienteTipo.EXTERNO, ClienteTipo.SONANGOL]),
  telefone: z.string()
    .min(9, 'Telefone deve ter 9 dígitos')
    .max(9, 'Telefone deve ter 9 dígitos')
    .regex(/^\d+$/, 'Telefone deve conter apenas números'),
  whatsapp: z.string()
    .optional()
    .refine((val) => !val || (val.length === 9 && /^\d+$/.test(val)), {
      message: 'WhatsApp deve ter 9 dígitos se fornecido',
    }),
  email: z.string().email('E-mail inválido'),
  numeroCliente: z.string().min(1, 'Número do cliente é obrigatório'),
  biPassaporte: z.string().optional(),
  morada: z.string().optional(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

interface CreateClienteDto {
  nome: string;
  tipo: 'externo' | 'sonangol';
  telefone: string;
  whatsapp?: string;
  email: string;
  numeroCliente: string;
  biPassaporte?: string;
  morada?: string;
}

export default function CadastroClienteForm() {
  const router = useRouter();
  const [isLoadingNumeracao, setIsLoadingNumeracao] = useState(false);
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
  });

  const form = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: '',
      tipo: ClienteTipo.EXTERNO,
      telefone: '',
      whatsapp: '',
      email: '',
      numeroCliente: '',
      biPassaporte: '',
      morada: '',
      password: 'CLI000',
    },
  });

  const { createPortal, findNumeracao, loading: storeLoading, error: storeError, clearError } = useClienteReservasStore();
  const { login, loading: authLoading, error: authError, clearError: clearAuthError } = useAuthStore(); // ✅ Obter auth store

  const passwordValue = form.watch('password');

  useEffect(() => {
    setPasswordStrength({
      length: passwordValue.length >= 6,
    });
  }, [passwordValue]);

  const fetchNumeracao = async (showSuccessAlert = false) => {
    try {
      setIsLoadingNumeracao(true);
      clearError();
      
      if (!hasFetchedInitial) {
        form.setValue('numeroCliente', 'Gerando número...', { shouldValidate: false });
      }

      const numero = await findNumeracao();
      
      if (numero) {
        form.setValue('numeroCliente', numero, { shouldValidate: true });
        
        if (showSuccessAlert) {
          Swal.fire({
            icon: 'success',
            title: 'Número gerado!',
            text: `Número do cliente: ${numero}`,
            timer: 1500,
            showConfirmButton: false,
          });
        }
      }
      
      if (!hasFetchedInitial) {
        setHasFetchedInitial(true);
      }
    } catch (error: any) {
      console.error('Erro ao buscar numeração:', error);
      form.setValue('numeroCliente', '', { shouldValidate: true });
      
      if (hasFetchedInitial) {
        Swal.fire({
          icon: 'error',
          title: 'Erro ao buscar numeração',
          text: error.message || 'Não foi possível gerar o número automático',
          confirmButtonText: 'OK',
        });
      }
    } finally {
      setIsLoadingNumeracao(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const initNumeracao = async () => {
      if (mounted && !hasFetchedInitial) {
        await fetchNumeracao(false);
      }
    };
    initNumeracao();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (storeError && hasFetchedInitial) {
      Swal.fire({
        icon: 'error',
        title: 'Erro na operação',
        text: storeError,
        confirmButtonText: 'OK',
      }).then(() => clearError());
    }
  }, [storeError, clearError, hasFetchedInitial]);

  const handleAutoLogin = async (username: string, password: string) => {
    try {
      console.log('🔐 Tentando login automático com:', { username, password });
      
      await login({ username, password });
      
      console.log('✅ Login automático bem-sucedido!');
      
      // Redirecionar para o dashboard
      router.push('/dashboard/home');
      
      // Mostrar mensagem de sucesso
      Swal.fire({
        icon: 'success',
        title: 'Login automático realizado!',
        text: 'Você foi conectado automaticamente com as credenciais do cliente.',
        timer: 2000,
        showConfirmButton: false,
      });
      
    } catch (error: any) {
      console.error('❌ Erro no login automático:', error);
      
      // Se falhar o login automático, ainda redireciona para a lista de clientes
      Swal.fire({
        icon: 'warning',
        title: 'Portal criado, mas login falhou',
        html: `
          <div class="text-left">
            <p>Portal criado com sucesso, mas não foi possível fazer login automático.</p>
            <p class="mt-2 text-sm">Erro: ${error.message || 'Credenciais inválidas'}</p>
            <p class="mt-2 text-sm">Você será redirecionado para a lista de clientes.</p>
          </div>
        `,
        confirmButtonText: 'OK',
      }).then(() => {
        router.push('/dashboard/clientes');
      });
    }
  };

  const onSubmit = async (data: ClienteFormData) => {
    try {
      const clienteData: CreateClienteDto = {
        nome: data.nome,
        tipo: data.tipo,
        telefone: data.telefone,
        whatsapp: data.whatsapp || undefined,
        email: data.email,
        numeroCliente: data.numeroCliente,
        biPassaporte: data.biPassaporte || undefined,
        morada: data.morada || undefined,
      };

      console.log('📤 Dados enviados para criação:', {
        clienteData,
        password: data.password
      });

      Swal.fire({
        title: 'Criando portal...',
        text: 'Por favor, aguarde',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const resultado = await createPortal(clienteData, data.password);

      console.log('✅ Portal criado com sucesso:', resultado);

      // ✅ NOVA LÓGICA: Login automático
      await Swal.fire({
        icon: 'success',
        title: 'Portal criado com sucesso!',
        html: `
          <div class="text-left space-y-2">
            <p><strong>Cliente:</strong> ${resultado.nome}</p>
            <p><strong>Número:</strong> ${resultado.numeroCliente}</p>
            <p><strong>Email:</strong> ${resultado.email}</p>
            <p><strong>Status:</strong> ${resultado.status}</p>
            <p class="mt-4 text-sm text-gray-600">
              Deseja fazer login automaticamente com este cliente?
            </p>
          </div>
        `,
        confirmButtonText: 'Sim, fazer login',
        showCancelButton: true,
        cancelButtonText: 'Criar outro',
        allowOutsideClick: false,
      }).then(async (result) => {
        if (result.isConfirmed) {
          // Fazer login automático com as credenciais do cliente
          // Usar email como username (ou numeroCliente, dependendo do seu backend)
          const username = resultado.email; // ou resultado.numeroCliente
          
          Swal.fire({
            title: 'Fazendo login...',
            text: 'Conectando com as credenciais do cliente',
            allowOutsideClick: false,
            showConfirmButton: false,
            didOpen: () => Swal.showLoading(),
          });
          
          // Chama a função de login automático
          await handleAutoLogin(username, data.password);
          
        } else {
          // Criar outro cliente - resetar formulário
          form.reset({
            nome: '',
            tipo: ClienteTipo.EXTERNO,
            telefone: '',
            whatsapp: '',
            email: '',
            numeroCliente: '',
            biPassaporte: '',
            morada: '',
            password: '',
          });
          fetchNumeracao(false);
        }
      });

    } catch (error: any) {
      console.error('❌ Erro ao criar portal:', error);
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Erro ao criar portal',
        text: error.message || 'Ocorreu um erro ao criar o portal do cliente',
        confirmButtonText: 'OK',
      });
    }
  };

  const handleRegenerateNumeracao = async () => {
    const result = await Swal.fire({
      title: 'Gerar novo número?',
      text: 'Isso irá substituir o número atual do cliente',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim, gerar novo',
      cancelButtonText: 'Manter atual',
    });
    if (result.isConfirmed) {
      await fetchNumeracao(true);
    }
  };

  const numeroClienteValue = form.watch('numeroCliente');
  const isNumeroClienteValid = numeroClienteValue && 
                             numeroClienteValue !== '' && 
                             numeroClienteValue !== 'Gerando número...';

  // Loading combinado (cliente + auth)
  const isLoading = storeLoading || isLoadingNumeracao || authLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white flex items-center justify-center p-4">
      <Card className="mx-auto max-w-4xl w-full border-0 shadow-2xl bg-white rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
          <div className="relative flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <img src="./../images/ico-paz-flor.png" alt="Logo CPF" className="w-16 h-16" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center">Cadastro de Cliente</CardTitle>
          <CardDescription className="text-purple-100 text-center text-lg mt-2">
            Crie um portal de acesso personalizado para o cliente
          </CardDescription>
        </CardHeader>

        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <User className="w-4 h-4 text-purple-600" />
                        Nome Completo *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="João da Silva" 
                          {...field} 
                          disabled={isLoading}
                          className="bg-white border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Tipo de Cliente *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger className="bg-white border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200">
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={ClienteTipo.EXTERNO}>Externo</SelectItem>
                          <SelectItem value={ClienteTipo.SONANGOL}>Sonangol</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numeroCliente"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center mb-1">
                        <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-purple-600" />
                          Número do Cliente *
                        </FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRegenerateNumeracao}
                          disabled={isLoading}
                          className="text-xs text-purple-600 hover:text-purple-700"
                        >
                          {isLoadingNumeracao ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Gerando...
                            </>
                          ) : (
                            '↻ Gerar novo'
                          )}
                        </Button>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            {...field} 
                            disabled
                            className="bg-gray-50 italic text-gray-600"
                          />
                          {isLoadingNumeracao && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <p className="text-xs text-gray-500 mt-1">Número gerado automaticamente</p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="biPassaporte"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">BI/Passaporte</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="000000000LA000" 
                          {...field} 
                          disabled={isLoading}
                          className="bg-white border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-purple-600" />
                        E-mail *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="cliente@email.com" 
                          {...field} 
                          disabled={isLoading}
                          className="bg-white border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-purple-600" />
                        Telefone *
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="900000000" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                          maxLength={9}
                          disabled={isLoading}
                          className="bg-white border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">WhatsApp</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="900000000 (opcional)" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                          maxLength={9}
                          disabled={isLoading}
                          className="bg-white border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500 mt-1">Deixe vazio para usar o mesmo número do telefone</p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="morada"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-600" />
                        Morada
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Rua, Bairro, Município" 
                          {...field} 
                          disabled={isLoading}
                          className="bg-white border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 border border-purple-200">
                <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-purple-600" />
                  Credenciais de Acesso
                </h3>

                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Senha do Portal *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"}
                              placeholder="Digite uma senha (mínimo 6 caracteres)" 
                              {...field} 
                              disabled={isLoading}
                              className="bg-white border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                              disabled={isLoading}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-purple-100">
                    <p className="text-sm font-medium text-gray-700 mb-3">A senha deve ter:</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-3">
                        {passwordStrength.length ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-gray-400" />
                        )}
                        <span className={passwordStrength.length ? "text-gray-700" : "text-gray-500"}>
                          Pelo menos 6 caracteres
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Esta senha será usada para criar o portal e também para login automático.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 py-6 text-base font-semibold border-gray-300 hover:bg-gray-50"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 py-6 text-base font-semibold bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
                  disabled={isLoading || !isNumeroClienteValid}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {authLoading ? 'Fazendo login...' : 'Criando portal...'}
                    </>
                  ) : (
                    'Criar Portal do Cliente'
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-3">Informações importantes:</h4>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
                O número do cliente é gerado automaticamente pelo sistema
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
                Após criar o portal, você pode fazer login automaticamente
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
                A senha será usada tanto para criar o portal quanto para login
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5" />
                Todos os campos com * são obrigatórios
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}