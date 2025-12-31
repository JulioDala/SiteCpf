'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { 
  CalendarIcon, 
  Loader2, 
  User, 
  AlertCircle, 
  X, 
  Clock, 
  MapPin, 
  Users, 
  DollarSign,
  Calendar as CalendarLucide,
  FileText,
  Settings,
  CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '@/storage/atuh-storage';
import { useBackendReservaStore } from '@/storage/reserva-store';
import useTiposEventos from '@/storage/tipo-evento-store';
import { useEspacosStore } from '@/storage/espaco-store';
import Swal from 'sweetalert2';

interface IFormCreairReserva {
  onClose: () => void;
  handleReserva: (data: any) => void;
}

const reservaSchema = z.object({
  data: z.date(),
  horaInicio: z.string().min(1, "Hora de início é obrigatória"),
  horaTermino: z.string().min(1, "Hora de término é obrigatória"),
  espacoId: z.string().min(1, "Selecione um espaço"),
  eventoId: z.string().min(1, "Selecione um tipo de evento"),
  participants: z.coerce.number().min(1, "Número de participantes deve ser maior que 0"),
  valor: z.coerce.number().min(0, "Valor deve ser maior ou igual a 0"),
  description: z.string().optional(),
  decoracaoInterna: z.boolean().default(false),
  cateringInterno: z.boolean().default(false),
  djInterno: z.boolean().default(false),
  decoracaoExterna: z.boolean().default(false),
  cateringExterno: z.boolean().default(false),
  djExterno: z.boolean().default(false),
  contactoDecoradora: z.string().optional(),
  contactoCatering: z.string().optional(),
  contactoDJ: z.string().optional(),
  comProducao: z.boolean().default(false),
  diasProducao: z.coerce.number().min(0).optional(),
  outrasInformacoes: z.string().optional(),
});

type ReservaFormData = z.infer<typeof reservaSchema>;

const horariosDisponiveis = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00", "21:30", "22:00", "22:30", "23:00"
];

export default function FormCreairReserva({ onClose, handleReserva }: IFormCreairReserva) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { userLogin } = useAuthStore();
  const { createReserva, loading: reservaLoading, error: reservaError } = useBackendReservaStore();
  const { espacos, isLoading: espacosLoading, error: espacosError, fetchEspacos } = useEspacosStore();
  const { tiposEventos, isLoading: eventosLoading, error: eventosError, fetchTiposEventos } = useTiposEventos();

  const form = useForm<ReservaFormData>({
    resolver: zodResolver(reservaSchema) as any,
    defaultValues: {
      participants: 1,
      valor: 0,
      description: '',
      decoracaoInterna: false,
      cateringInterno: false,
      djInterno: false,
      decoracaoExterna: false,
      cateringExterno: false,
      djExterno: false,
      contactoDecoradora: '',
      contactoCatering: '',
      contactoDJ: '',
      comProducao: false,
      diasProducao: 0,
      outrasInformacoes: '',
    },
  });

  useEffect(() => {
    console.log("🔵 Iniciando formulário de reserva");
    console.log("🔵 Cliente:", userLogin?.cliente);
    
    if (!espacos.length) {
      console.log("🔵 Carregando espaços...");
      fetchEspacos();
    }
    if (!tiposEventos.length) {
      console.log("🔵 Carregando tipos de eventos...");
      fetchTiposEventos();
    }
  }, []);

  const onSubmit = async (data: ReservaFormData) => {
    console.log("🔵 ========== SUBMISSÃO INICIADA ==========");
    console.log("🔵 Dados do formulário:", data);

    if (!userLogin?.cliente?._id) {
      console.error("Cliente não autenticado!");
      await Swal.fire({
        icon: 'error',
        title: 'Erro de Autenticação',
        text: 'Usuário não autenticado. Por favor, faça login novamente.',
        confirmButtonText: 'Entendi',
        confirmButtonColor: '#9333ea',
      });
      return;
    }

    setIsSubmitting(true);

    // Loading alert
    Swal.fire({
      title: 'Processando Reserva',
      text: 'Aguarde enquanto criamos sua reserva...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const payload = {
        clienteId: userLogin.cliente._id,
        data: format(data.data, 'yyyy-MM-dd'),
        horaInicio: data.horaInicio,
        horaTermino: data.horaTermino,
        espacoId: data.espacoId,
        eventoId: data.eventoId,
        valor: data.valor,
        status: "Rascunho" as const,
        participants: data.participants,
        paymentStatus: "Pendente" as const,
        paymentMethod: '',
        description: data.description || '',
        decoracaoInterna: data.decoracaoInterna,
        cateringInterno: data.cateringInterno,
        djInterno: data.djInterno,
        decoracaoExterna: data.decoracaoExterna,
        cateringExterno: data.cateringExterno,
        djExterno: data.djExterno,
        contactoDecoradora: data.contactoDecoradora || '',
        contactoCatering: data.contactoCatering || '',
        contactoDJ: data.contactoDJ || '',
        comProducao: data.comProducao,
        diasProducao: data.diasProducao || 0,
        outrasInformacoes: data.outrasInformacoes || '',
      };

      const reservaCriada = await createReserva(payload);

      console.log("✅ Reserva criada:", reservaCriada);

      // Success alert com opções
      const result = await Swal.fire({
        icon: 'success',
        title: 'Reserva Criada!',
        html: `
          <div class="text-left space-y-2">
            <p class="text-gray-700"><strong>Data:</strong> ${format(data.data, "dd/MM/yyyy", { locale: pt })}</p>
            <p class="text-gray-700"><strong>Horário:</strong> ${data.horaInicio} - ${data.horaTermino}</p>
            <p class="text-gray-700"><strong>Participantes:</strong> ${data.participants}</p>
            <p class="text-gray-700"><strong>Status:</strong> <span class="text-amber-600 font-semibold">Rascunho</span></p>
            <div class="mt-4 p-3 bg-purple-50 rounded-lg">
              <p class="text-sm text-purple-800">
                <strong>Próximo passo:</strong> Aguarde a análise da administração para confirmação da reserva.
              </p>
            </div>
          </div>
        `,
        confirmButtonText: 'Ver Minhas Reservas',
        confirmButtonColor: '#9333ea',
        showCancelButton: true,
        cancelButtonText: 'Criar Outra Reserva',
        cancelButtonColor: '#6b7280',
        allowOutsideClick: false,
      });

      handleReserva(reservaCriada);

      if (result.isConfirmed) {
        // Usuário quer ver suas reservas
        onClose();
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Usuário quer criar outra reserva
        form.reset({
          participants: 1,
          valor: 0,
          description: '',
          decoracaoInterna: false,
          cateringInterno: false,
          djInterno: false,
          decoracaoExterna: false,
          cateringExterno: false,
          djExterno: false,
          contactoDecoradora: '',
          contactoCatering: '',
          contactoDJ: '',
          comProducao: false,
          diasProducao: 0,
          outrasInformacoes: '',
        });
      }

    } catch (error: any) {
      console.error("❌ Erro ao criar reserva:", error);
      
      Swal.fire({
        icon: 'error',
        title: 'Erro ao Criar Reserva',
        text: error.message || error.response?.data?.message || 'Ocorreu um erro ao processar sua solicitação. Tente novamente.',
        confirmButtonText: 'Tentar Novamente',
        confirmButtonColor: '#9333ea',
      });
    } finally {
      setIsSubmitting(false);
      console.log("🔵 Submissão finalizada");
    }
  };

  const clienteInfo = userLogin?.cliente;
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="relative flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-1">Nova Reserva de Espaço</h2>
              <p className="text-purple-100 text-sm">Preencha os dados para solicitar uma nova reserva</p>
            </div>
            <button
              onClick={() => {
                console.log("🔵 Fechando modal");
                onClose();
              }}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"
              disabled={isSubmitting || reservaLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {clienteInfo && (
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-5 border border-purple-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">Informações do Cliente</h3>
                  <p className="text-sm text-purple-600">Dados cadastrais</p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-1">Nome</p>
                  <p className="text-gray-900 font-medium">{clienteInfo.nome}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Email</p>
                  <p className="text-gray-900 font-medium">{clienteInfo.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Telefone</p>
                  <p className="text-gray-900 font-medium">{clienteInfo.telefone}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Nº Cliente</p>
                  <p className="text-gray-900 font-medium">{clienteInfo.numeroCliente}</p>
                </div>
              </div>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Dados Básicos */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <CalendarLucide className="w-5 h-5 text-blue-600" />
                  <span>Dados Básicos da Reserva</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <FormField
                    name="espacoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Espaço *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger 
                              className={cn(
                                "bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:ring-offset-0",
                                field.value && "border-purple-500 bg-purple-100 text-purple-900"
                              )}
                            >
                              <SelectValue placeholder="Selecione um espaço" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white" side="bottom">
                            {espacosLoading && (
                              <div className="p-2 text-sm text-gray-500">Carregando espaços...</div>
                            )}
                            {espacosError && (
                              <div className="p-2 text-sm text-red-500">{espacosError}</div>
                            )}
                            {!espacosLoading && !espacosError && espacos.length === 0 && (
                              <div className="p-2 text-sm text-gray-500">Nenhum espaço disponível</div>
                            )}
                            {espacos.map((espaco: any) => (
                              <SelectItem 
                                key={espaco._id} 
                                value={espaco._id}
                                className="data-[state=checked]:bg-purple-600 data-[state=checked]:text-white focus:bg-purple-100"
                              >
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-blue-600" />
                                  <div>
                                    <div className="font-medium">{espaco.nome}</div>
                                    <div className="text-xs text-gray-500">{espaco.capacidade} lugares</div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="eventoId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Tipo de Evento *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger 
                              className={cn(
                                "bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:ring-offset-0",
                                field.value && "border-purple-500 bg-purple-100 text-purple-900"
                              )}
                            >
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white" side="bottom">
                            {eventosLoading && (
                              <div className="p-2 text-sm text-gray-500">Carregando tipos...</div>
                            )}
                            {eventosError && (
                              <div className="p-2 text-sm text-red-500">{eventosError}</div>
                            )}
                            {!eventosLoading && !eventosError && tiposEventos.length === 0 && (
                              <div className="p-2 text-sm text-gray-500">Nenhum tipo de evento disponível</div>
                            )}
                            {tiposEventos.map((evento) => (
                              <SelectItem 
                                key={evento._id} 
                                value={evento._id!}
                                className="data-[state=checked]:bg-purple-600 data-[state=checked]:text-white focus:bg-purple-100"
                              >
                                {evento.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    name="data"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Data do Evento *</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:ring-offset-0",
                                  !field.value && "text-muted-foreground",
                                  field.value && "border-purple-500 bg-purple-100 text-purple-900"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: pt })
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date: any) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                              locale={pt}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="horaInicio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Hora de Início *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger 
                              className={cn(
                                "bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:ring-offset-0",
                                field.value && "border-purple-500 bg-purple-100 text-purple-900"
                              )}
                            >
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white" side="bottom">
                            {horariosDisponiveis.map((horario) => (
                              <SelectItem 
                                key={horario} 
                                value={horario}
                                className="data-[state=checked]:bg-purple-600 data-[state=checked]:text-white focus:bg-purple-100"
                              >
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-blue-600" />
                                  {horario}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="horaTermino"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Hora de Término *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger 
                              className={cn(
                                "bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:ring-offset-0",
                                field.value && "border-purple-500 bg-purple-100 text-purple-900"
                              )}
                            >
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-white" side="bottom">
                            {horariosDisponiveis.map((horario) => (
                              <SelectItem 
                                key={horario} 
                                value={horario}
                                className="data-[state=checked]:bg-purple-600 data-[state=checked]:text-white focus:bg-purple-100"
                              >
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-blue-600" />
                                  {horario}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    name="participants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">Número de Participantes *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              type="number"
                              min={1}
                              className="pl-10 bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:ring-offset-0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span>Descrição do Evento (Opcional)</span>
                </h4>
                <FormField
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva os detalhes do evento..."
                          className="min-h-[80px] bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:ring-offset-0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Serviços com Checkboxes */}
              <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-5 border border-emerald-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-emerald-600" />
                  <span>Serviços do Evento</span>
                </h4>

                <div className="space-y-6">
                  {/* Serviços Internos */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Serviços Internos</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <FormField
                        name="decoracaoInterna"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium">Decoração</FormLabel>
                              <FormDescription className="text-xs">Incluída</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-purple-600"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="cateringInterno"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium">Catering</FormLabel>
                              <FormDescription className="text-xs">Incluído</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-purple-600"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="djInterno"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                            <div className="space-y-0.5">
                              <FormLabel className="text-sm font-medium">DJ/Som</FormLabel>
                              <FormDescription className="text-xs">Incluído</FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-purple-600"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Serviços Externos */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Serviços Externos</p>
                    <div className="space-y-4">
                      {/* Decoração Externa */}
                      <div className="space-y-3">
                        <FormField
                          name="decoracaoExterna"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium">Decoração Externa</FormLabel>
                                <FormDescription className="text-xs">Cliente traz decorador</FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-purple-600"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        {form.watch("decoracaoExterna") && (
                          <FormField
                            name="contactoDecoradora"
                            render={({ field }) => (
                              <FormItem className="ml-4">
                                <FormLabel className="text-xs text-gray-600">Contato da Decoradora *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="+244 9XX XXX XXX" 
                                    className="bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:ring-offset-0" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      {/* Catering Externo */}
                      <div className="space-y-3">
                        <FormField
                          name="cateringExterno"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium">Catering Externo</FormLabel>
                                <FormDescription className="text-xs">Cliente traz catering</FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-purple-600"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        {form.watch("cateringExterno") && (
                          <FormField
                            name="contactoCatering"
                            render={({ field }) => (
                              <FormItem className="ml-4">
                                <FormLabel className="text-xs text-gray-600">Contato do Catering *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="+244 9XX XXX XXX" 
                                    className="bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:ring-offset-0" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      {/* DJ Externo */}
                      <div className="space-y-3">
                        <FormField
                          name="djExterno"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm font-medium">DJ/Som Externo</FormLabel>
                                <FormDescription className="text-xs">Cliente traz DJ</FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                  className="data-[state=checked]:bg-purple-600"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        {form.watch("djExterno") && (
                          <FormField
                            name="contactoDJ"
                            render={({ field }) => (
                              <FormItem className="ml-4">
                                <FormLabel className="text-xs text-gray-600">Contato do DJ *</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="+244 9XX XXX XXX" 
                                    className="bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:ring-offset-0" 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Produção com Checkbox */}
              <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl p-5 border border-amber-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <span>Configurações de Produção</span>
                </h4>
                <div className="space-y-4">
                  <FormField
                    name="comProducao"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base font-medium">Produção Incluída</FormLabel>
                          <FormDescription className="text-xs">
                            Evento necessita de dias de produção
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-purple-600"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {form.watch("comProducao") && (
                    <FormField
                      name="diasProducao"
                      render={({ field }) => (
                        <FormItem className="ml-4">
                          <FormLabel className="text-sm font-medium text-gray-700">Dias de Produção *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              className="bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:ring-offset-0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Quantidade de dias necessários
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

              {/* Outras Informações */}
              <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Outras Informações</span>
                </h4>
                <FormField
                  name="outrasInformacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Requisitos especiais, restrições alimentares, observações importantes..."
                          className="min-h-[100px] bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:ring-offset-0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Erro */}
              {reservaError && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600">{reservaError}</p>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    console.log("🔵 Cancelando criação de reserva");
                    onClose();
                  }}
                  disabled={isSubmitting || reservaLoading}
                  className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || reservaLoading}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting || reservaLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Processando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Solicitar Reserva</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}