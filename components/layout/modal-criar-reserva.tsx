'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  Loader2,
  User,
  AlertCircle,
  X,
  MapPin,
  Users,
  CalendarPlusIcon as CalendarLucide,
  FileText,
  Settings,
  CheckCircle2,
  Lock,
  DollarSign,
  ChevronRight,
  Info,
  Clock
} from 'lucide-react';
import { useAuthStore } from '@/storage/atuh-storage';
import { useBackendReservaStore, UpdateReservaPayload } from '@/storage/reserva-store';
import useTiposEventos from '@/storage/tipo-evento-store';
import { useEspacosStore } from '@/storage/espaco-store';
import Swal from 'sweetalert2';
import { CalendarioPicker } from './CalendarioPicker';
import { ContratoEventoPreview, DoceEventoData } from './contrato-evento-preview';

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
  valor: z.coerce.number().min(0).optional(),
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
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disponibilidadeVerificada, setDisponibilidadeVerificada] = useState(false);
  const [isEditing] = useState(!!reservaId);
  const [loadingReserva, setLoadingReserva] = useState(!!reservaId);
  const [showContratoPreview, setShowContratoPreview] = useState(false);
  const [contratoData, setContratoData] = useState<DoceEventoData | null>(null);
  const hasLoadedRef = useRef<string | null>(null);

  const { userLogin } = useAuthStore();
  const clienteInfo = userLogin?.cliente;

  // Stores
  const createReserva = useBackendReservaStore(s => s.createReserva);
  const updateReserva = useBackendReservaStore(s => s.updateReserva);
  const getReservaById = useBackendReservaStore(s => s.getReservaById);
  const reservaLoading = useBackendReservaStore(s => s.loading);

  const espacos = useEspacosStore(s => s.espacos);
  const fetchEspacos = useEspacosStore(s => s.fetchEspacos);

  const tiposEventos = useTiposEventos(s => s.tiposEventos);
  const fetchTiposEventos = useTiposEventos(s => s.fetchTiposEventos);

  const form = useForm<ReservaFormData>({
    resolver: zodResolver(reservaSchema) as any,
    defaultValues: {
      data: format(new Date(), 'yyyy-MM-dd'),
      horaInicio: '08:00',
      horaTermino: '10:00',
      espacoId: '',
      eventoId: '',
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
    const loadInitialData = async () => {
      if (!espacos.length) fetchEspacos();
      if (!tiposEventos.length) fetchTiposEventos();
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const carregarDadosEdicao = async () => {
      if (!reservaId || hasLoadedRef.current === reservaId) return;

      try {
        setLoadingReserva(true);
        hasLoadedRef.current = reservaId;

        const reserva = await getReservaById(reservaId);

        const dataObj = new Date(reserva.data);
        const dataFormatada = format(dataObj, 'yyyy-MM-dd');

        form.reset({
          data: dataFormatada,
          horaInicio: reserva.horaInicio,
          horaTermino: reserva.horaTermino,
          espacoId: typeof reserva.espacoId === 'string' ? reserva.espacoId : (reserva.espacoId as any)?._id || (reserva.espacoId as any),
          eventoId: typeof reserva.eventoId === 'string' ? reserva.eventoId : (reserva.eventoId as any)?._id || (reserva.eventoId as any),
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
        onClose();
      } finally {
        setLoadingReserva(false);
      }
    };

    carregarDadosEdicao();
  }, [reservaId, getReservaById, form]);

  const handleCalendarioSelecionado = React.useCallback((dados: {
    data: string;
    horaInicio: string;
    horaTermino: string;
    disponivel: boolean;
  }) => {
    form.setValue("data", dados.data, { shouldValidate: true });
    form.setValue("horaInicio", dados.horaInicio, { shouldValidate: true });
    form.setValue("horaTermino", dados.horaTermino, { shouldValidate: true });

    setDisponibilidadeVerificada(dados.disponivel);

    if (!dados.disponivel) {
      form.setError("horaInicio", { type: "manual", message: "Horário indisponível" });
      form.setError("horaTermino", { type: "manual", message: "Horário indisponível" });
    } else {
      form.clearErrors(["horaInicio", "horaTermino"]);
    }
  }, [form]);

  const onSubmit = async (data: ReservaFormData) => {
    if (!clienteInfo?._id) return;
    setIsSubmitting(true);

    Swal.fire({
      title: isEditing ? 'Atualizando Reserva' : 'Processando Reserva',
      text: 'Aguarde um momento...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const payloadBase = {
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

      if (isEditing && reservaId) {
        const res = await updateReserva(reservaId, payloadBase);
        handleReserva(res);
        onClose();
        Swal.fire({ icon: 'success', title: 'Reserva atualizada!', timer: 2000, showConfirmButton: false });
      } else {
        const payload = { ...payloadBase, clienteId: clienteInfo._id, valor: 0, status: "Rascunho", paymentStatus: "Pendente", paymentMethod: '' };
        const res = await createReserva(payload as any);
        handleReserva(res);
        onClose();
        Swal.fire({
          icon: 'success',
          title: 'Reserva Criada!',
          text: 'Aguarde a análise da administração.',
          confirmButtonColor: '#9333ea'
        });
      }
    } catch (error: any) {
      Swal.fire({ icon: 'error', title: 'Erro', text: error.message || 'Erro ao processar reserva.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviewContrato = () => {
    const formData = form.getValues();
    const eventoSelecionado = tiposEventos.find(e => e._id === formData.eventoId);

    const dataPreview: DoceEventoData = {
      clienteNome: clienteInfo?.nome || '',
      clienteTelefone: clienteInfo?.telefone || '',
      clienteWhatsapp: clienteInfo?.whatsapp || '',
      clienteEmail: clienteInfo?.email || '',
      clienteBiPassaporte: clienteInfo?.biPassaporte || '',
      clienteMorada: clienteInfo?.morada || '',
      clienteTipo: clienteInfo?.tipo || 'comum',
      tipoEvento: eventoSelecionado?.nome || '',
      tipoEventoId: formData.eventoId,
      espacoId: formData.espacoId,
      dataEvento: formData.data,
      horaInicio: formData.horaInicio,
      horaTermino: formData.horaTermino,
      numeroConvidados: formData.participants.toString(),
      decoracaoInterna: formData.decoracaoInterna,
      cateringInterno: formData.cateringInterno,
      djInterno: formData.djInterno,
      decoracaoExterna: formData.decoracaoExterna,
      cateringExterno: formData.cateringExterno,
      djExterno: formData.djExterno,
      contactoDecoradora: formData.contactoDecoradora || '',
      contactoCatering: formData.contactoCatering || '',
      contactoDJ: formData.contactoDJ || '',
      outrasInformacoes: formData.outrasInformacoes || '',
    };

    setContratoData(dataPreview);
    setShowContratoPreview(true);
  };

  if (!clienteInfo) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl animate-slideUp relative flex flex-col">

        {loadingReserva && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-[60] flex items-center justify-center">
            <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center space-x-3 border border-purple-100">
              <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
              <span className="font-medium text-gray-700">Carregando dados da reserva...</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="border-b border-gray-100 p-6 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{isEditing ? 'Editar Reserva de Espaço' : 'Nova Reserva de Espaço'}</h2>
              <p className="text-sm text-gray-500">Passo {step} de 3</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-center max-w-md mx-auto w-full">
            {[1, 2, 3].map((s, idx) => (
              <React.Fragment key={s}>
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all",
                  step >= s ? "bg-purple-600 text-white shadow-lg shadow-purple-100" : "bg-gray-100 text-gray-400"
                )}>
                  {s}
                </div>
                {idx < 2 && (
                  <div className={cn(
                    "flex-1 h-1 mx-2 rounded-full",
                    step > s ? "bg-purple-600" : "bg-gray-100"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {showContratoPreview && contratoData ? (
            <ContratoEventoPreview
              data={contratoData}
              onBack={() => setShowContratoPreview(false)}
            />
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {step === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Perfil do Solicitante */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                          <User className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">Perfil do Solicitante</h3>
                          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Dados da conta</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'Nome', value: clienteInfo.nome },
                          { label: 'Email', value: clienteInfo.email },
                          { label: 'Telefone', value: clienteInfo.telefone },
                          { label: 'Nº Cliente', value: clienteInfo.numeroCliente }
                        ].map((item, idx) => (
                          <div key={idx} className="bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                            <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">{item.label}</p>
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-gray-800 truncate">{item.value || '---'}</p>
                              <Lock className="w-3 h-3 text-gray-300" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dados Básicos */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-6 flex items-center space-x-2">
                        <CalendarLucide className="w-5 h-5 text-purple-600" />
                        <span>Espaço e Evento</span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <FormField
                          name="espacoId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold text-sm text-gray-700">Onde será o evento? *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value} disabled={isEditing}>
                                <FormControl>
                                  <SelectTrigger className="h-12 rounded-xl border-gray-200">
                                    <SelectValue placeholder="Selecione um espaço" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white rounded-xl">
                                  {espacos.map(e => (
                                    <SelectItem key={e._id} value={e._id}>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-purple-600" />
                                        <div>
                                          <div className="font-medium">{e.nome}</div>
                                          <div className="text-[10px] text-gray-500">{e.capacidade} convidados</div>
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
                              <FormLabel className="font-bold text-sm text-gray-700">Que tipo de evento? *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-12 rounded-xl border-gray-200">
                                    <SelectValue placeholder="Selecione o tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-white rounded-xl">
                                  {tiposEventos.map(ev => (
                                    <SelectItem key={ev._id} value={ev._id!}>{ev.nome}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-bold text-gray-700 flex items-center gap-2"><Clock className="w-4 h-4 text-purple-600" /> Data e Horário</h4>
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
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <FormField
                            name="data"
                            render={() => <FormItem><FormMessage /></FormItem>}
                          />
                          <FormField
                            name="horaInicio"
                            render={() => <FormItem><FormMessage /></FormItem>}
                          />
                          <FormField
                            name="horaTermino"
                            render={() => <FormItem><FormMessage /></FormItem>}
                          />
                        </div>
                        {!form.watch('espacoId') && (
                          <div className="p-8 border-2 border-dashed border-gray-100 rounded-2xl text-center bg-gray-50/30">
                            <Info className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">Selecione um espaço acima para verificar a disponibilidade no calendário.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-6 flex items-center space-x-2">
                        <Users className="w-5 h-5 text-blue-600" />
                        <span>Participantes e Detalhes</span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <FormField
                          name="participants"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold text-sm text-gray-700">
                                Expectativa de Pessoas {(() => {
                                  const espacoId = form.watch('espacoId');
                                  const espaco = espacos.find(e => e._id === espacoId);
                                  return espaco ? `(Máx: ${espaco.capacidade} pessoas)` : '';
                                })()} *
                              </FormLabel>
                              <FormControl>
                                <div className="relative group">
                                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
                                  <Input
                                    type="number"
                                    className="pl-10 h-12 rounded-xl bg-gray-50/30 border-gray-200"
                                    {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-bold text-sm text-gray-700">Descrição/Tema do Evento</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Explique o propósito ou tema..."
                                  className="min-h-[100px] rounded-xl bg-gray-50/30 border-gray-200"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Serviços */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                      <h4 className="font-bold text-gray-900 mb-6 flex items-center space-x-2">
                        <Settings className="w-5 h-5 text-emerald-600" />
                        <span>Serviços Adicionais</span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Seção Interna */}
                        <div className="space-y-4">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Serviços do CPF (Internos)</p>
                          <div className="space-y-2">
                            {[
                              { label: 'Decoração', name: 'decoracaoInterna' as const, icon: '🎨' },
                              { label: 'Catering/Buffet', name: 'cateringInterno' as const, icon: '🍽️' },
                              { label: 'DJ e Sonorização', name: 'djInterno' as const, icon: '🎵' }
                            ].map(servico => (
                              <FormField
                                key={servico.name}
                                name={servico.name}
                                render={({ field }) => (
                                  <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/30 hover:border-purple-200 transition-all">
                                    <div className="flex items-center gap-3">
                                      <span className="text-xl">{servico.icon}</span>
                                      <span className="text-sm font-semibold text-gray-700">{servico.label}</span>
                                    </div>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-gray-200" />
                                  </div>
                                )}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Seção Externa */}
                        <div className="space-y-4">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Equipa Própria (Externos)</p>
                          <div className="space-y-3">
                            {[
                              { label: 'Decoração Própria', name: 'decoracaoExterna' as const, contact: 'contactoDecoradora' as const },
                              { label: 'Catering Próprio', name: 'cateringExterno' as const, contact: 'contactoCatering' as const },
                              { label: 'DJ Próprio', name: 'djExterno' as const, contact: 'contactoDJ' as const }
                            ].map(servico => (
                              <div key={servico.name} className="space-y-2">
                                <FormField
                                  name={servico.name}
                                  render={({ field }) => (
                                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white shadow-sm border-l-4 border-l-blue-500">
                                      <span className="text-sm font-semibold text-gray-700">{servico.label}</span>
                                      <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-200" />
                                    </div>
                                  )}
                                />
                                {form.watch(servico.name) && (
                                  <FormField
                                    name={servico.contact}
                                    render={({ field }) => (
                                      <div className="ml-4 animate-fadeIn">
                                        <Input placeholder="Nome/Contacto da empresa externa" className="h-10 text-xs rounded-lg bg-blue-50/30 border-blue-100" {...field} />
                                      </div>
                                    )}
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex gap-4">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
                        <DollarSign className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-1">Aviso Financeiro e Orçamento</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          Esta é uma solicitação de reserva. O valor final (aluguer do espaço + serviços selecionados) será orçamentado pela nossa administração e enviado para sua aprovação antes da confirmação final.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h4 className="font-bold text-gray-900 mb-6 flex items-center space-x-2">
                          <Settings className="w-5 h-5 text-gray-500" />
                          <span>Produção</span>
                        </h4>
                        <div className="space-y-6">
                          <FormField
                            name="comProducao"
                            render={({ field }) => (
                              <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                                <div>
                                  <p className="text-sm font-bold text-gray-800">Montagem Antecipada?</p>
                                  <p className="text-[10px] text-gray-500">Necessito de dias para produção/montagem</p>
                                </div>
                                <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-emerald-600 data-[state=unchecked]:bg-gray-200" />
                              </div>
                            )}
                          />
                          {form.watch('comProducao') && (
                            <FormField
                              name="diasProducao"
                              render={({ field }) => (
                                <FormItem className="animate-fadeIn">
                                  <FormLabel className="text-xs font-bold text-gray-500">Quantos dias de antecedência? *</FormLabel>
                                  <FormControl><Input type="number" className="h-12 rounded-xl" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>
                      </div>

                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
                        <h4 className="font-bold text-gray-900 mb-6 flex items-center space-x-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span>Observações</span>
                        </h4>
                        <FormField
                          name="outrasInformacoes"
                          render={({ field }) => (
                            <Textarea
                              placeholder="Alguma necessidade técnica, preferência ou restrição?"
                              className="flex-1 min-h-[120px] rounded-xl bg-gray-50/30 border-gray-100 border-none focus:ring-0 resize-none"
                              {...field}
                            />
                          )}
                        />
                      </div>
                    </div>

                    {/* Preview do Contrato */}
                    {!showContratoPreview && (
                      <div className="py-4 border-t border-gray-100 flex justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            if (form.watch('espacoId') && form.watch('eventoId')) handlePreviewContrato();
                            else Swal.fire({ icon: 'info', text: 'Preencha o espaço e tipo de evento primeiro.' });
                          }}
                          className="flex items-center gap-3 px-6 py-3 bg-purple-50 text-purple-700 rounded-2xl font-bold hover:bg-purple-100 transition-all border border-purple-100"
                        >
                          <FileText className="w-5 h-5" />
                          <span>Visualizar rascunho do acordo</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </form>
            </Form>
          )}
        </div>

        {/* Footer */}
        {!showContratoPreview && (
          <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-3xl">
            <Button
              variant="ghost"
              onClick={() => step > 1 ? setStep(step - 1) : onClose()}
              className="h-12 px-8 rounded-xl font-bold text-gray-500 hover:bg-gray-200"
              disabled={isSubmitting || reservaLoading}
            >
              {step === 1 ? 'Cancelar' : 'Anterior'}
            </Button>

            {step < 3 ? (
              <Button
                onClick={async () => {
                  const fields = step === 1 ? ['espacoId', 'eventoId', 'data', 'horaInicio', 'horaTermino'] : ['participants'];
                  if (await form.trigger(fields as any)) {
                    if (step === 1 && !disponibilidadeVerificada) {
                      Swal.fire({ icon: 'warning', text: 'Selecione um horário disponível no calendário.' });
                      return;
                    }
                    setStep(step + 1);
                    document.querySelector('.overflow-y-auto')?.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="h-12 px-10 rounded-xl bg-gray-900 hover:bg-black text-white font-bold shadow-xl transition-all"
              >
                Continuar
              </Button>
            ) : (
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting || reservaLoading}
                className="h-12 px-10 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xl shadow-purple-200 flex items-center gap-2"
              >
                {isSubmitting || reservaLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                {isEditing ? 'Atualizar Reserva' : 'Solicitar Reserva'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
