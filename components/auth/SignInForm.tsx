'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useClienteReservasStore } from '@/storage/cliente-storage';
import Swal from 'sweetalert2';

// Enums atualizados para corresponder ao backend
const ClienteTipo = {
  EXTERNO: 'externo',
  SONANGOL: 'sonangol',
} as const;

// Schema de validação Zod ÚNICO
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
  password: z.string().min(6, 'Senha do portal deve ter pelo menos 6 caracteres'),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

// Interface que corresponde EXATAMENTE ao CreateClienteDto do backend
interface CreateClienteDto {
  nome: string;
  tipo: 'externo' | 'sonangol';
  telefone: string;
  whatsapp?: string;
  email: string;
  numeroCliente: string;
  biPassaporte?: string;
  morada?: string;
  // NÃO incluir: _id, status, webCredencial, createdAt, updatedAt
}

export default function CadastroClienteForm() {
  const router = useRouter();
  const [isLoadingNumeracao, setIsLoadingNumeracao] = useState(false);
  const [hasFetchedInitial, setHasFetchedInitial] = useState(false);
  
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
      password: '',
    },
  });

  const { createPortal, findNumeracao, loading: storeLoading, error: storeError, clearError } = useClienteReservasStore();

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
    
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (storeError && hasFetchedInitial) {
      Swal.fire({
        icon: 'error',
        title: 'Erro na operação',
        text: storeError,
        confirmButtonText: 'OK',
      }).then(() => {
        clearError();
      });
    }
  }, [storeError, clearError, hasFetchedInitial]);

  const onSubmit = async (data: ClienteFormData) => {
    try {
      // ✅ CORRIGIDO: Criar objeto que corresponde EXATAMENTE ao DTO do backend
      const clienteData: CreateClienteDto = {
        // ❌ NÃO incluir: _id, status, webCredencial, createdAt, updatedAt
        nome: data.nome,
        tipo: data.tipo,
        telefone: data.telefone,
        whatsapp: data.whatsapp || undefined, // Enviar undefined se vazio
        email: data.email,
        numeroCliente: data.numeroCliente,
        biPassaporte: data.biPassaporte || undefined,
        morada: data.morada || undefined,
      };

      console.log('✅ Dados enviados (correspondem ao DTO):', clienteData);

      const swalInstance = Swal.fire({
        title: 'Criando portal...',
        text: 'Por favor, aguarde',
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // ❌ IMPORTANTE: Atualize a store para aceitar CreateClienteDto em vez de ClienteBase
      const resultado = await createPortal(clienteData, data.password);

      await swalInstance.close();

      await Swal.fire({
        icon: 'success',
        title: 'Portal criado com sucesso!',
        html: `
          <div class="text-left">
            <p><strong>Cliente:</strong> ${resultado.nome}</p>
            <p><strong>Número:</strong> ${resultado.numeroCliente}</p>
            <p><strong>Email:</strong> ${resultado.email}</p>
            <p><strong>Status:</strong> ${resultado.status}</p>
            <p class="mt-4 text-sm text-gray-600">O cliente pode agora acessar o portal com suas credenciais.</p>
          </div>
        `,
        confirmButtonText: 'Continuar',
        showCancelButton: true,
        cancelButtonText: 'Criar outro',
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          router.push('/dashboard/clientes');
        } else {
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
      console.error('Erro ao criar portal:', error);
      
      Swal.close();
      
      if (error?.name !== 'ZodError') {
        Swal.fire({
          icon: 'error',
          title: 'Erro ao criar portal',
          text: error.message || 'Ocorreu um erro ao criar o portal do cliente',
          confirmButtonText: 'OK',
          allowOutsideClick: false,
        });
      }
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
      allowOutsideClick: false,
    });

    if (result.isConfirmed) {
      await fetchNumeracao(true);
    }
  };

  const numeroClienteValue = form.watch('numeroCliente');
  const isNumeroClienteValid = numeroClienteValue && 
                             numeroClienteValue !== '' && 
                             numeroClienteValue !== 'Gerando número...' &&
                             numeroClienteValue !== 'Buscando número disponível...';

  return (
    <div className="min-h-screen bg-cyan-50 text-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
      <Card className="mx-auto max-w-2xl w-full border-0 shadow-lg bg-white">
        <CardHeader className="space-y-1 pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 flex items-center justify-center">
              <img src="./../images/ico-paz-flor.png" alt="Logo CPF" className="w-full h-full rounded-xl" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center text-gray-900">Cadastro de Cliente</CardTitle>
          <CardDescription className="text-center text-gray-600">
            Crie um portal de acesso para o cliente. A numeração será gerada automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="João da Silva" 
                          {...field} 
                          disabled={storeLoading || isLoadingNumeracao}
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
                      <FormLabel>Tipo de Cliente *</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={storeLoading || isLoadingNumeracao}
                      >
                        <FormControl>
                          <SelectTrigger>
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
                      <div className="flex justify-between items-center">
                        <FormLabel>Número do Cliente *</FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRegenerateNumeracao}
                          disabled={storeLoading || isLoadingNumeracao}
                          className="text-xs text-purple-600 hover:text-purple-700"
                        >
                          {isLoadingNumeracao ? (
                            <>
                              <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-600 mr-1"></span>
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
                            placeholder="Número será gerado automaticamente" 
                            {...field} 
                            disabled={storeLoading || isLoadingNumeracao}
                            className={isLoadingNumeracao ? "italic text-gray-500" : ""}
                            onChange={(e) => {
                              if (!isLoadingNumeracao) {
                                field.onChange(e.target.value);
                              }
                            }}
                          />
                          {isLoadingNumeracao && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <p className="text-xs text-gray-500">
                        {isLoadingNumeracao 
                          ? 'Aguarde, gerando número...' 
                          : 'Número gerado automaticamente. Clique em "Gerar novo" para regenerar.'}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="biPassaporte"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>BI/Passaporte</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="000000000LA000" 
                          {...field} 
                          disabled={storeLoading || isLoadingNumeracao}
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
                      <FormLabel>E-mail *</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="cliente@email.com" 
                          {...field} 
                          disabled={storeLoading || isLoadingNumeracao}
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
                      <FormLabel>Telefone *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="900000000 (9 dígitos)" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                          maxLength={9}
                          disabled={storeLoading || isLoadingNumeracao}
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
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="900000000 (9 dígitos)" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                          maxLength={9}
                          disabled={storeLoading || isLoadingNumeracao}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500">
                        Opcional. Deixe vazio para usar o mesmo número do telefone.
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="morada"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Morada</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Rua, Bairro, Município" 
                          {...field} 
                          disabled={storeLoading || isLoadingNumeracao}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Senha do Portal *</FormLabel>
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder="Senha para criar o portal (mínimo 6 caracteres)" 
                          {...field} 
                          disabled={storeLoading || isLoadingNumeracao}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-gray-500">
                        Esta senha será usada apenas para criar o portal. O cliente receberá credenciais separadas.
                      </p>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                  disabled={storeLoading || isLoadingNumeracao}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-6 text-base font-semibold" 
                  disabled={storeLoading || isLoadingNumeracao || !isNumeroClienteValid}
                >
                  {storeLoading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Criando portal...
                    </>
                  ) : 'Criar Portal do Cliente'}
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Informações importantes:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• O número do cliente é gerado automaticamente pelo sistema</li>
                <li>• Após criar o portal, o cliente receberá credenciais de acesso</li>
                <li>• A senha do portal é diferente das credenciais do cliente</li>
                <li>• Todos os campos com * são obrigatórios</li>
                {isLoadingNumeracao && (
                  <li className="text-amber-700 font-semibold">⏳ Aguarde, gerando número do cliente...</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}