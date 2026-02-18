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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Loader2, User, AlertCircle, X, MapPin, Users, CalendarPlusIcon as CalendarLucide, FileText, Settings, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/storage/atuh-storage';
import { useBackendReservaStore, UpdateReservaPayload } from '@/storage/reserva-store';
import useTiposEventos from '@/storage/tipo-evento-store';
import { useEspacosStore } from '@/storage/espaco-store';
import Swal from 'sweetalert2';
import { CalendarioPicker } from './CalendarioPicker';

interface IFormCreairReserva {
  onClose: () => void;
  handleReserva: (data: any) => void;
  reservaId?: string;
}

const reservaSchema = z.object({
  data: z.string().min(1, "Data é obrigatória"),
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

export default function FormCreairReserva({ 
  onClose, 
  handleReserva, 
  reservaId 
}: IFormCreairReserva) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disponibilidadeVerificada, setDisponibilidadeVerificada] = useState(false);
  const [isEditing, setIsEditing] = useState(!!reservaId);
  const [loadingReserva, setLoadingReserva] = useState(!!reservaId);

  const { userLogin } = useAuthStore();
  const { 
    createReserva, 
    updateReserva, 
    getReservaById,
    loading: reservaLoading, 
    error: reservaError 
  } = useBackendReservaStore();
  
  const { espacos, isLoading: espacosLoading, error: espacosError, fetchEspacos } = useEspacosStore();
  const { tiposEventos, isLoading: eventosLoading, error: eventosError, fetchTiposEventos } = useTiposEventos();

  const form = useForm<ReservaFormData>({
    resolver: zodResolver(reservaSchema) as any,
    defaultValues: {
      data: format(new Date(), 'yyyy-MM-dd'),
      horaInicio: '08:00',
      horaTermino: '10:00',
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
    const carregarReserva = async () => {
      if (!reservaId) return;

      try {
        setLoadingReserva(true);
        const reserva = await getReservaById(reservaId);
        
        const dataObj = new Date(reserva.data);
        const dataFormatada = format(dataObj, 'yyyy-MM-dd');

        form.reset({
          data: dataFormatada,
          horaInicio: reserva.horaInicio,
          horaTermino: reserva.horaTermino,
          espacoId: typeof reserva.espacoId === 'string' 
            ? reserva.espacoId 
            : reserva.espacoId._id,
          eventoId: typeof reserva.eventoId === 'string'
            ? reserva.eventoId
            : reserva.eventoId._id,
          participants: reserva.participants,
          valor: reserva.valor || 0,
          description: reserva.description || '',
          decoracaoInterna: reserva.decoracaoInterna || false,
          cateringInterno: reserva.cateringInterno || false,
          djInterno: reserva.djInterno || false,
          decoracaoExterna: reserva.decoracaoExterna || false,
          cateringExterno: reserva.cateringExterno || false,
          djExterno: reserva.djExterno || false,
          contactoDecoradora: reserva.contactoDecoradora || '',
          contactoCatering: reserva.contactoCatering || '',
          contactoDJ: reserva.contactoDJ || '',
          comProducao: reserva.comProducao || false,
          diasProducao: reserva.diasProducao || 0,
          outrasInformacoes: reserva.outrasInformacoes || '',
        });

        setDisponibilidadeVerificada(true);
      } catch (error) {
        console.error("Erro ao carregar reserva:", error);
        Swal.fire({
          icon: 'error',
          title: 'Erro ao Carregar',
          text: 'Não foi possível carregar os dados da reserva.',
          confirmButtonColor: '#9333ea',
        });
        onClose();
      } finally {
        setLoadingReserva(false);
      }
    };

    carregarReserva();
  }, [reservaId, getReservaById]);

  const handleCalendarioSelecionado = React.useCallback((dados: {
    data: string;
    horaInicio: string;
    horaTermino: string;
    disponivel: boolean;
  }) => {
    const dataAtual = form.getValues("data");
    const horaInicioAtual = form.getValues("horaInicio");
    const horaTerminoAtual = form.getValues("horaTermino");

    if (dataAtual !== dados.data) {
      form.setValue("data", dados.data, { shouldValidate: false });
    }
    if (horaInicioAtual !== dados.horaInicio) {
      form.setValue("horaInicio", dados.horaInicio, { shouldValidate: false });
    }
    if (horaTerminoAtual !== dados.horaTermino) {
      form.setValue("horaTermino", dados.horaTermino, { shouldValidate: false });
    }

    setDisponibilidadeVerificada(dados.disponivel);

    if (!dados.disponivel) {
      form.setError("horaInicio", {
        type: "manual",
        message: "Horário indisponível"
      });
      form.setError("horaTermino", {
        type: "manual",
        message: "Horário indisponível"
      });
    } else {
      form.clearErrors(["horaInicio", "horaTermino"]);
    }
  }, [form]);

  useEffect(() => {
    if (!espacos.length) {
      fetchEspacos();
    }
    if (!tiposEventos.length) {
      fetchTiposEventos();
    }
  }, []);

  const onSubmit = async (data: ReservaFormData) => {
    if (!isEditing && !userLogin?.cliente?._id) {
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

    Swal.fire({
      title: isEditing ? 'Atualizando Reserva' : 'Processando Reserva',
      text: isEditing ? 'Aguarde enquanto atualizamos sua reserva...' : 'Aguarde enquanto criamos sua reserva...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      if (isEditing && reservaId) {
        const payload: UpdateReservaPayload = {
          data: data.data,
          horaInicio: data.horaInicio,
          horaTermino: data.horaTermino,
          espacoId: data.espacoId,
          eventoId: data.eventoId,
          participants: data.participants,
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

        const reservaAtualizada = await updateReserva(reservaId, payload);

        await Swal.fire({
          icon: 'success',
          title: 'Reserva Atualizada!',
          html: `
            <div class="text-left space-y-2">
              <p class="text-gray-700"><strong>Data:</strong> ${format(new Date(data.data), "dd/MM/yyyy", { locale: pt })}</p>
              <p class="text-gray-700"><strong>Horário:</strong> ${data.horaInicio} - ${data.horaTermino}</p>
              <p class="text-gray-700"><strong>Status:</strong> <span class="text-amber-600 font-semibold">Atualizado</span></p>
            </div>
          `,
          confirmButtonText: 'Concluir',
          confirmButtonColor: '#9333ea',
        });

        handleReserva(reservaAtualizada);
        onClose();

      } else {
        const payload = {
          clienteId: userLogin!.cliente._id,
          data: data.data,
          horaInicio: data.horaInicio,
          horaTermino: data.horaTermino,
          espacoId: data.espacoId,
          eventoId: data.eventoId,
          valor: 0,
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

        const result = await Swal.fire({
          icon: 'success',
          title: 'Reserva Criada!',
          html: `
            <div class="text-left space-y-2">
              <p class="text-gray-700"><strong>Data:</strong> ${format(new Date(data.data), "dd/MM/yyyy", { locale: pt })}</p>
              <p class="text-gray-700"><strong>Horário:</strong> ${data.horaInicio} - ${data.horaTermino}</p>
              <p class="text-gray-700"><strong>Status:</strong> <span class="text-amber-600 font-semibold">Rascunho</span></p>
              <div class="mt-4 p-3 bg-purple-50 rounded-lg">
                <p class="text-sm text-purple-800">
                  <strong>Próximo passo:</strong> Aguarde a análise da administração.
                </p>
              </div>
            </div>
          `,
          confirmButtonText: 'Ver Minhas Reservas',
          confirmButtonColor: '#9333ea',
          showCancelButton: true,
          cancelButtonText: 'Criar Outra',
          cancelButtonColor: '#6b7280',
        });

        handleReserva(reservaCriada);

        if (result.isConfirmed) {
          onClose();
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          form.reset({
            data: format(new Date(), 'yyyy-MM-dd'),
            horaInicio: '08:00',
            horaTermino: '10:00',
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
          setDisponibilidadeVerificada(false);
        }
      }
    } catch (error: any) {
      console.error(`❌ Erro ao ${isEditing ? 'atualizar' : 'criar'} reserva:`, error);

      Swal.fire({
        icon: 'error',
        title: `Erro ao ${isEditing ? 'Atualizar' : 'Criar'} Reserva`,
        text: error.message || error.response?.data?.message || `Ocorreu um erro ao ${isEditing ? 'atualizar' : 'processar'} sua solicitação.`,
        confirmButtonText: 'Tentar Novamente',
        confirmButtonColor: '#9333ea',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clienteInfo = userLogin?.cliente;

  if (loadingReserva) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-12 shadow-2xl flex flex-col items-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
          <p className="text-gray-600 font-medium">Carregando dados da reserva...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="relative flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-1">
                {isEditing ? 'Editar Reserva' : 'Nova Reserva de Espaço'}
              </h2>
              <p className="text-purple-100 text-sm">
                {isEditing ? 'Atualize os dados da sua reserva' : 'Verifique disponibilidade e preencha os dados'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"
              disabled={isSubmitting || reservaLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {!isEditing && clienteInfo && (
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
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                          disabled={isEditing}
                        >
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
                            {espacos.map((espaco: any) => (
                              <SelectItem
                                key={espaco._id}
                                value={espaco._id}
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
                            {tiposEventos.map((evento) => (
                              <SelectItem
                                key={evento._id!}
                                value={evento._id!}
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

                <div className="mt-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Selecionar Data e Horário</h4>

                  <CalendarioPicker
                    espacoId={form.watch('espacoId')}
                    valorInicial={{
                      data: form.watch('data'),
                      horaInicio: form.watch('horaInicio'),
                      horaTermino: form.watch('horaTermino'),
                    }}
                    onDataSelecionada={handleCalendarioSelecionado}
                    reservaId={isEditing ? reservaId : undefined}
                  />

                  {!form.watch('espacoId') && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                      <p className="text-blue-800">
                        Selecione um espaço para visualizar os horários disponíveis
                      </p>
                    </div>
                  )}
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
                          placeholder="Descreva os detalhes do evento, tema, cores, estilo..."
                          className="min-h-[80px] bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:ring-offset-0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-5 border border-emerald-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-emerald-600" />
                  <span>Serviços do Evento</span>
                </h4>

                <div className="space-y-6">
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

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-3">Serviços Externos</p>
                    <div className="space-y-4">
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

              <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl p-5 border border-amber-200">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-amber-600" />
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
                              placeholder="Ex: 2"
                              className="bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:ring-offset-0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Quantidade de dias necessários antes do evento
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </div>

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
                          placeholder="Requisitos especiais, restrições alimentares, observações importantes, necessidades técnicas..."
                          className="min-h-[100px] bg-white border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:ring-offset-0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {reservaError && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600">{reservaError}</p>
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting || reservaLoading}
                  className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting || 
                    reservaLoading || 
                    (!isEditing && !disponibilidadeVerificada)
                  }
                  className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting || reservaLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>{isEditing ? 'Atualizando...' : 'Processando...'}</span>
                    </>
                  ) : !isEditing && !disponibilidadeVerificada ? (
                    <>
                      <AlertCircle className="h-5 w-5" />
                      <span>Verifique Disponibilidade</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <span>{isEditing ? 'Atualizar Reserva' : 'Solicitar Reserva'}</span>
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
