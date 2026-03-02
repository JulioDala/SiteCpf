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
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import {
    CalendarIcon,
    Loader2,
    X,
    Clock,
    Users,
    DollarSign,
    User,
    FileText,
    MapPin,
    Shield,
    Activity,
    Dumbbell,
    Target,
    Lock,
    CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '@/storage/atuh-storage';
import { useDesportoStore, ICreateDesporto, UpdateDesportoDto } from '@/storage/cliente-desporto-stores';
import { useActividadeStore, ITipoAtividade } from "@/storage/cliente-desporto-actividade-store";
import { useCampoStore, ICampo } from "@/storage/cliente-desporto-campo-store";
import Swal from 'sweetalert2';

interface IFormcrearDesporto {
    onClose: () => void;
    handleDesporto?: (data: any) => void;
    desportoId?: string;
}

const desportoSchema = z.object({
    nomeEquipe: z.string().min(1, 'Nome da equipa é obrigatório'),
    nomeResponsavel: z.string().min(1, 'Nome do responsável é obrigatório'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    morada: z.string().optional(),
    bi: z.string().optional(),
    contato: z.string().min(9, 'Contacto deve ter pelo menos 9 dígitos'),
    diasSemana: z.array(z.string()).min(1, 'Selecione pelo menos um dia'),
    horarioInicio: z.string().min(1, 'Horário de início é obrigatório'),
    horarioFim: z.string().min(1, 'Horário de fim é obrigatório'),
    tipoAtividade: z.string().min(1, 'Tipo de atividade é obrigatório'),
    corIdentificacao: z.string().min(1, 'Cor de identificação é obrigatória'),
    valorPagamento: z.coerce.number().min(0).optional(),
    modalidadePagamento: z.string().optional(),
    tipoPeriodo: z.string().min(1, 'Tipo de período é obrigatório'),
    vendaIngresso: z.string().optional(),
    valorIngresso: z.coerce.number().min(0).optional(),
    valorCaucao: z.coerce.number().min(0).optional(),
    dataInicio: z.date(),
    dataFim: z.date().optional(),
    situacao: z.string().optional(),
    status: z.enum(['Ativo', 'Pendente', 'Suspenso', 'Cancelado', 'Rascunho', 'Expirado']),
    campo: z.string().min(1, 'Campo é obrigatório'),
    statusPagamento: z.string().optional(),
    observacoesAdicionais: z.string().optional(),
});

type DesportoFormData = z.infer<typeof desportoSchema>;

const diasDaSemana = [
    { value: 'Segunda', label: 'Segunda-feira' },
    { value: 'Terça', label: 'Terça-feira' },
    { value: 'Quarta', label: 'Quarta-feira' },
    { value: 'Quinta', label: 'Quinta-feira' },
    { value: 'Sexta', label: 'Sexta-feira' },
    { value: 'Sábado', label: 'Sábado' },
    { value: 'Domingo', label: 'Domingo' },
];

const coresIdentificacao = [
    { value: '#3B82F6', label: 'Azul', color: 'bg-blue-500' },
    { value: '#10B981', label: 'Verde', color: 'bg-emerald-500' },
    { value: '#8B5CF6', label: 'Roxo', color: 'bg-purple-500' },
    { value: '#F59E0B', label: 'Âmbar', color: 'bg-amber-500' },
    { value: '#EF4444', label: 'Vermelho', color: 'bg-red-500' },
    { value: '#EC4899', label: 'Rosa', color: 'bg-pink-500' },
    { value: '#14B8A6', label: 'Turquesa', color: 'bg-teal-500' },
];

const tiposPeriodo = [
    { value: 'curta-duracao', label: 'Curta Duração (até 3 meses)' },
    { value: 'media-duracao', label: 'Média Duração (3-6 meses)' },
    { value: 'longa-duracao', label: 'Longa Duração (6+ meses)' },
    { value: 'personalizado', label: 'Personalizado' },
];

const horariosDisponiveis = [
    "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
    "22:00", "22:30", "23:00"
];

export default function FormcrearDesporto({
    onClose,
    handleDesporto,
    desportoId
}: IFormcrearDesporto) {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialData = (typeof desportoId === 'object' ? desportoId : null) as any;
    const actualId = (typeof desportoId === 'string' ? desportoId : (initialData?._id)) as string;

    const [isEditing] = useState(!!actualId);
    const [loadingDesporto, setLoadingDesporto] = useState(!!actualId);

    const hasLoadedRef = useRef<string | null>(null);
    const [fallbackNames, setFallbackNames] = useState<{ campo?: string; atividade?: string }>({});

    const actividade = useActividadeStore(s => s.actividade);
    const loadingTipo = useActividadeStore(s => s.loadingTipo);
    const fetchTipo = useActividadeStore(s => s.fetchTipo);

    const campos = useCampoStore(s => s.campos);
    const loadingCampo = useCampoStore(s => s.loadingCampo);
    const fetchCampo = useCampoStore(s => s.fetchCampo);

    const userLogin = useAuthStore(s => s.userLogin);
    const clienteInfo = userLogin?.cliente;

    const createDesporto = useDesportoStore(s => s.createDesporto);
    const updateDesporto = useDesportoStore(s => s.updateDesporto);
    const fetchDesportoDetalhado = useDesportoStore(s => s.fetchDesportoDetalhado);
    const desportoLoading = useDesportoStore(s => s.loading);

    const form = useForm<DesportoFormData>({
        resolver: zodResolver(desportoSchema) as any,
        defaultValues: {
            nomeEquipe: '',
            nomeResponsavel: clienteInfo?.nome || '',
            email: clienteInfo?.email || '',
            morada: clienteInfo?.morada || '',
            bi: clienteInfo?.biPassaporte || '',
            contato: clienteInfo?.telefone || '',
            diasSemana: [],
            horarioInicio: '08:00',
            horarioFim: '09:00',
            tipoAtividade: '',
            corIdentificacao: '#3B82F6',
            valorPagamento: 0,
            modalidadePagamento: 'Mensal',
            tipoPeriodo: 'media-duracao',
            vendaIngresso: 'Não',
            valorIngresso: 0,
            valorCaucao: 0,
            dataInicio: new Date(),
            status: 'Rascunho',
            campo: '',
            statusPagamento: 'Pendente',
            observacoesAdicionais: '',
        },
    });

    useEffect(() => {
        const loadInitialData = async () => {
            if (actividade.length === 0) fetchTipo();
            if (campos.length === 0) fetchCampo();
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        const carregarDadosEdicao = async () => {
            if (hasLoadedRef.current === actualId || !actualId || !clienteInfo?.email) return;

            try {
                setLoadingDesporto(true);
                hasLoadedRef.current = actualId;

                const desporto = await fetchDesportoDetalhado(actualId);
                if (!desporto) throw new Error("Atividade não encontrada");

                setFallbackNames({
                    campo: typeof desporto.campo === 'object' ? desporto.campo.nome : undefined,
                    atividade: typeof desporto.tipoAtividade === 'object' ? desporto.tipoAtividade.nome : undefined,
                });

                const mapDiaSemana = (dia: string) => {
                    const mapas: Record<string, string> = {
                        'segunda': 'Segunda', 'terca': 'Terça', 'quarta': 'Quarta',
                        'quinta': 'Quinta', 'sexta': 'Sexta', 'sabado': 'Sábado', 'domingo': 'Domingo'
                    };
                    return mapas[dia.toLowerCase()] || (dia.charAt(0).toUpperCase() + dia.slice(1).toLowerCase());
                };

                const mapTipoPeriodo = (tipo: string) => {
                    const normalized = tipo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
                    if (normalized.includes('curta')) return 'curta-duracao';
                    if (normalized.includes('media')) return 'media-duracao';
                    if (normalized.includes('longa')) return 'longa-duracao';
                    return 'personalizado';
                };

                form.reset({
                    nomeEquipe: desporto.nomeEquipe,
                    nomeResponsavel: desporto.nomeResponsavel,
                    email: desporto.email || '',
                    morada: desporto.morada || '',
                    bi: desporto.bi || '',
                    contato: desporto.contato,
                    diasSemana: (desporto.diasSemana || []).map(mapDiaSemana),
                    horarioInicio: desporto.horarioInicio,
                    horarioFim: desporto.horarioFim,
                    tipoAtividade: typeof desporto.tipoAtividade === 'object' ? desporto.tipoAtividade?._id : desporto.tipoAtividade,
                    corIdentificacao: desporto.corIdentificacao,
                    valorPagamento: desporto.valorPagamento || 0,
                    modalidadePagamento: desporto.modalidadePagamento || 'Mensal',
                    tipoPeriodo: mapTipoPeriodo(desporto.tipoPeriodo),
                    vendaIngresso: desporto.vendaIngresso === 'sim' ? 'Sim' : 'Não',
                    valorIngresso: desporto.valorIngresso || 0,
                    valorCaucao: desporto.valorCaucao || 0,
                    dataInicio: new Date(desporto.dataInicio),
                    dataFim: desporto.dataFim ? new Date(desporto.dataFim) : undefined,
                    status: desporto.status as any,
                    campo: typeof desporto.campo === 'object' ? desporto.campo?._id : desporto.campo,
                    statusPagamento: desporto.statusPagamento || 'Pendente',
                    observacoesAdicionais: desporto.observacoesAdicionais || '',
                });

            } catch (error) {
                console.error("Erro ao carregar edição:", error);
            } finally {
                setLoadingDesporto(false);
            }
        };

        carregarDadosEdicao();
    }, [actualId, clienteInfo?.email, fetchDesportoDetalhado, form]);

    const onSubmit = async (data: DesportoFormData) => {
        if (!clienteInfo?.email) return;
        setIsSubmitting(true);

        Swal.fire({
            title: isEditing ? 'Atualizando...' : 'Enviando...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            const payloadBaseData = {
                nomeEquipe: data.nomeEquipe,
                diasSemana: data.diasSemana,
                horarioInicio: data.horarioInicio,
                horarioFim: data.horarioFim,
                tipoAtividade: data.tipoAtividade,
                corIdentificacao: data.corIdentificacao,
                tipoPeriodo: data.tipoPeriodo,
                dataInicio: data.dataInicio.toISOString(),
                dataFim: data.dataFim ? data.dataFim.toISOString() : undefined,
                campo: data.campo,
                observacoesAdicionais: data.observacoesAdicionais || '',
            };

            if (isEditing && actualId) {
                const payload: UpdateDesportoDto = { ...payloadBaseData, email: clienteInfo.email };
                const res = await updateDesporto(actualId, payload);
                if (handleDesporto) handleDesporto(res);
                onClose();
                Swal.fire({ icon: 'success', title: 'Atualizado com sucesso!', timer: 2000, showConfirmButton: false });
            } else {
                const payload: ICreateDesporto = {
                    ...payloadBaseData,
                    nomeResponsavel: clienteInfo.nome,
                    email: clienteInfo.email,
                    morada: clienteInfo.morada || '',
                    bi: clienteInfo.biPassaporte || '',
                    contato: clienteInfo.telefone || '',
                    valorPagamento: 0,
                    modalidadePagamento: 'Mensal',
                    vendaIngresso: 'Não',
                    valorIngresso: 0,
                    valorCaucao: 0,
                    situacao: 'Em análise',
                    status: 'Rascunho',
                    statusPagamento: 'Pendente',
                };
                const res = await createDesporto(payload);
                if (handleDesporto) handleDesporto(res);
                onClose();
                Swal.fire({ icon: 'success', title: 'Solicitação enviada!', text: 'Aguarde o contato da administração.', confirmButtonColor: '#10b981' });
            }
        } catch (error: any) {
            Swal.fire({ icon: 'error', title: 'Erro', text: error.message || 'Ocorreu um erro inesperado.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const tiposAtividadeAtivos = actividade.filter(t => t.status === 'Ativo');
    const camposAtivos = campos.filter(c => c.status === 'Ativo');

    if (!clienteInfo) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl animate-slideUp relative flex flex-col">

                {loadingDesporto && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-[60] flex items-center justify-center">
                        <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center space-x-3 border border-emerald-100">
                            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                            <span className="font-medium text-gray-700">Carregando dados...</span>
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="border-b border-gray-100 p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{isEditing ? 'Editar Atividade' : 'Solicitar Atividade'}</h2>
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
                                    step >= s ? "bg-emerald-600 text-white shadow-lg shadow-emerald-100" : "bg-gray-100 text-gray-400"
                                )}>
                                    {s}
                                </div>
                                {idx < 2 && (
                                    <div className={cn(
                                        "flex-1 h-1 mx-2 rounded-full",
                                        step > s ? "bg-emerald-600" : "bg-gray-100"
                                    )} />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                            {step === 1 && (
                                <div className="space-y-6 animate-fadeIn">
                                    {/* Client Read-Only Info */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100/50">
                                        {[
                                            { label: 'Nome', value: clienteInfo.nome, icon: User },
                                            { label: 'Email', value: clienteInfo.email, icon: Lock },
                                            { label: 'Telefone', value: clienteInfo.telefone, icon: Lock },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-lg"><item.icon className="w-4 h-4 text-emerald-600" /></div>
                                                <div>
                                                    <p className="text-[10px] uppercase font-bold text-gray-400">{item.label}</p>
                                                    <p className="text-sm font-semibold text-gray-700 truncate max-w-[150px]">{item.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Team Name */}
                                    <FormField
                                        name="nomeEquipe"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold flex items-center gap-2"><Target className="w-4 h-4 text-emerald-600" /> Nome da Equipa ou Grupo *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ex: Futebol dos Amigos" className="h-12 rounded-xl border-gray-200 focus:border-emerald-500 shadow-none transition-all" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Activity & Field */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            name="tipoAtividade"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-600" /> Atividade *</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-12 rounded-xl border-gray-200 shadow-none">
                                                                <SelectValue placeholder="Selecione..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-white rounded-xl">
                                                            {field.value && !tiposAtividadeAtivos.some(t => t._id === field.value) && (
                                                                <SelectItem value={field.value} className="text-emerald-600 font-bold">
                                                                    {fallbackNames.atividade || 'Atividade Selecionada'} (Atual)
                                                                </SelectItem>
                                                            )}
                                                            {tiposAtividadeAtivos.map(t => (
                                                                <SelectItem key={t._id} value={t._id}>{t.nome}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            name="campo"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-600" /> Campo/Espaço *</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-12 rounded-xl border-gray-200 shadow-none">
                                                                <SelectValue placeholder="Selecione..." />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent className="bg-white rounded-xl">
                                                            {field.value && !camposAtivos.some(c => c._id === field.value) && (
                                                                <SelectItem value={field.value} className="text-emerald-600 font-bold">
                                                                    {fallbackNames.campo || 'Campo Selecionado'} (Atual)
                                                                </SelectItem>
                                                            )}
                                                            {camposAtivos.map(c => (
                                                                <SelectItem key={c._id} value={c._id}>{c.nome}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                                        <FormField
                                            name="diasSemana"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-600" /> Dias da Semana *</FormLabel>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                                                        {diasDaSemana.map(dia => (
                                                            <div
                                                                key={dia.value}
                                                                onClick={() => {
                                                                    const cur = field.value || [];
                                                                    field.onChange(cur.includes(dia.value) ? cur.filter(v => v !== dia.value) : [...cur, dia.value]);
                                                                }}
                                                                className={cn(
                                                                    "cursor-pointer p-2 text-center rounded-xl border-2 transition-all text-xs font-bold",
                                                                    field.value?.includes(dia.value) ? "bg-emerald-600 border-emerald-600 text-white" : "border-gray-100 text-gray-400 hover:border-gray-200"
                                                                )}
                                                            >
                                                                {dia.label.split('-')[0].substring(0, 3)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                            <FormField
                                                name="horarioInicio"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold text-gray-400 uppercase">Início *</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                                                            <SelectContent className="bg-white max-h-[250px]">{horariosDisponiveis.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                name="horarioFim"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold text-gray-400 uppercase">Fim *</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                                                            <SelectContent className="bg-white max-h-[250px]">{horariosDisponiveis.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}</SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                name="corIdentificacao"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold text-gray-400 uppercase">Cor *</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                                                            <SelectContent className="bg-white">
                                                                {coresIdentificacao.map(c => (
                                                                    <SelectItem key={c.value} value={c.value}>
                                                                        <div className="flex items-center gap-2"><div className={cn("w-3 h-3 rounded-full", c.color)} /> {c.label}</div>
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-emerald-50/20 p-6 rounded-2xl border border-emerald-100/50 grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <FormField
                                            name="dataInicio"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel className="font-bold flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-emerald-600" /> Começa em *</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="outline" className="h-12 rounded-xl justify-start text-left font-semibold">{field.value ? format(field.value, "dd/MM/yyyy") : "Selecione"}</Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl"><Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={pt} initialFocus /></PopoverContent>
                                                    </Popover>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            name="dataFim"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-col">
                                                    <FormLabel className="font-bold flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-gray-400" /> Termina em</FormLabel>
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <Button variant="outline" className="h-12 rounded-xl justify-start text-left font-normal text-gray-500">{field.value ? format(field.value, "dd/MM/yyyy") : "A definir"}</Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl"><Calendar mode="single" selected={field.value} onSelect={field.onChange} locale={pt} initialFocus /></PopoverContent>
                                                    </Popover>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            name="tipoPeriodo"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="font-bold">Regime *</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
                                                        <SelectContent className="bg-white">{tiposPeriodo.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 flex gap-4">
                                        <div className="p-3 bg-white rounded-xl shadow-sm h-fit"><DollarSign className="w-6 h-6 text-amber-600" /></div>
                                        <div>
                                            <h4 className="font-bold text-amber-900">Aviso Financeiro</h4>
                                            <p className="text-sm text-amber-700/80 leading-relaxed">Esta submissão será analisada pela administração. O custo final e os detalhes de pagamento serão acordados posteriormente.</p>
                                        </div>
                                    </div>

                                    <FormField
                                        name="observacoesAdicionais"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="font-bold flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" /> Mais Informações</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Acrescente aqui detalhes importantes sobre a atividade..." className="min-h-[150px] rounded-2xl bg-gray-50 border-gray-100 focus:bg-white transition-all shadow-none" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}

                        </form>
                    </Form>
                </div>

                {/* Footer Navigation */}
                <div className="p-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-b-3xl">
                    <Button
                        variant="ghost"
                        onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                        className="h-12 px-8 rounded-xl font-bold text-gray-500 hover:bg-gray-200"
                    >
                        {step === 1 ? 'Cancelar' : 'Anterior'}
                    </Button>

                    {step < 3 ? (
                        <Button
                            onClick={async () => {
                                const fields = step === 1 ? ['nomeEquipe', 'tipoAtividade', 'campo'] : ['diasSemana', 'horarioInicio', 'horarioFim', 'dataInicio', 'tipoPeriodo'];
                                if (await form.trigger(fields as any)) setStep(step + 1);
                            }}
                            className="h-12 px-10 rounded-xl bg-gray-900 hover:bg-black text-white font-bold shadow-xl transition-all"
                        >
                            Continuar
                        </Button>
                    ) : (
                        <Button
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                            className="h-12 px-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xl shadow-emerald-200 flex items-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            {isEditing ? 'Salvar Alterações' : 'Concluir Solicitação'}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
