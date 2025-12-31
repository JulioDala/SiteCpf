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
    Palette,
    Tag,
    CreditCard,
    FileText,
    MapPin,
    Phone,
    Mail,
    Shield,
    Activity,
    Dumbbell,
    Target,
    Lock,
    CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '@/storage/atuh-storage';
import { useDesportoStore, ICreateDesporto } from '@/storage/cliente-desporto-stores';
import { useActividadeStore, ITipoAtividade } from "@/storage/cliente-desporto-actividade-store";
import { useCampoStore, ICampo } from "@/storage/cliente-desporto-campo-store";
import Swal from 'sweetalert2';

interface IFormcrearDesporto {
    onClose: () => void;
    handleDesporto?: (data: any) => void;
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
    valorPagamento: z.coerce.number().min(0, 'Valor deve ser maior ou igual a 0').optional(),
    modalidadePagamento: z.string().min(1, 'Modalidade de pagamento é obrigatória').optional(),
    tipoPeriodo: z.string().min(1, 'Tipo de período é obrigatório'),
    vendaIngresso: z.string().min(1, 'Campo obrigatório').optional(),
    valorIngresso: z.coerce.number().min(0, 'Valor deve ser maior ou igual a 0').optional(),
    valorCaucao: z.coerce.number().min(0, 'Valor deve ser maior ou igual a 0').optional(),
    dataInicio: z.date(),
    dataFim: z.date().optional(),
    situacao: z.string().optional(),
    status: z.enum(['Ativo', 'Pendente', 'Suspenso', 'Cancelado', 'Rascunho']),
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
    { value: 'Curta Duração', label: 'Curta Duração (até 3 meses)' },
    { value: 'Média Duração', label: 'Média Duração (3-6 meses)' },
    { value: 'Longa Duração', label: 'Longa Duração (6+ meses)' },
    { value: 'Indefinido', label: 'Indefinido' },
];

const horariosDisponiveis = [
    "06:00", "06:30", "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
    "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
    "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30",
    "22:00", "22:30", "23:00"
];

export default function FormcrearDesporto({ onClose, handleDesporto }: IFormcrearDesporto) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { actividade, errorTipo, loadingTipo, fetchTipo } = useActividadeStore();
    const { campos, errorCampo, loadingCampo, fetchCampo } = useCampoStore();
    const { userLogin } = useAuthStore();
    const { createDesporto, loading: desportoLoading } = useDesportoStore();

    const clienteInfo = userLogin?.cliente;

    useEffect(() => {
        const loadDados = async () => {
            if (actividade.length === 0) {
                await fetchTipo();
            }
            if (campos.length === 0) {
                await fetchCampo();
            }
        };
        loadDados();
    }, []);

    const tiposAtividadeAtivos = actividade.filter((tipo: ITipoAtividade) => tipo.status === 'Ativo');
    const camposAtivos = campos.filter((campo: ICampo) => campo.status === 'Ativo');

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
            tipoPeriodo: 'Média Duração',
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

    const onSubmit = async (data: DesportoFormData) => {
        console.log("🏃 ========== SUBMISSÃO INICIADA ==========");
        console.log("🏃 Dados do formulário:", data);

        if (!userLogin?.cliente?.email) {
            console.error("Cliente não autenticado!");
            await Swal.fire({
                icon: 'error',
                title: 'Erro de Autenticação',
                text: 'Usuário não autenticado. Por favor, faça login novamente.',
                confirmButtonText: 'Entendi',
                confirmButtonColor: '#10b981',
            });
            return;
        }

        setIsSubmitting(true);

        // Loading alert
        Swal.fire({
            title: 'Processando Solicitação',
            text: 'Aguarde enquanto enviamos sua solicitação de atividade desportiva...',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            const payload: ICreateDesporto = {
                nomeEquipe: data.nomeEquipe,
                nomeResponsavel: clienteInfo?.nome || '',
                email: clienteInfo?.email || '',
                morada: clienteInfo?.morada || '',
                bi: clienteInfo?.biPassaporte || '',
                contato: clienteInfo?.telefone || '',
                diasSemana: data.diasSemana,
                horarioInicio: data.horarioInicio,
                horarioFim: data.horarioFim,
                tipoAtividade: data.tipoAtividade,
                corIdentificacao: data.corIdentificacao,
                valorPagamento: 0,
                modalidadePagamento: 'Mensal',
                tipoPeriodo: data.tipoPeriodo,
                vendaIngresso: 'Não',
                valorIngresso: 0,
                valorCaucao: 0,
                dataInicio: format(data.dataInicio, 'yyyy-MM-dd'),
                dataFim: data.dataFim ? format(data.dataFim, 'yyyy-MM-dd') : undefined,
                situacao: 'Em análise',
                status: 'Rascunho',
                campo: data.campo,
                statusPagamento: 'Pendente',
                observacoesAdicionais: data.observacoesAdicionais || '',
            };

            console.log("🏃 Payload para criação:", payload);

            const desportoCriado = await createDesporto(payload);

            console.log("✅ Desporto criado:", desportoCriado);

            // Success alert com opções
            const result = await Swal.fire({
                icon: 'success',
                title: 'Solicitação Enviada!',
                html: `
                    <div class="text-left space-y-2">
                        <p class="text-gray-700"><strong>Equipa/Atividade:</strong> ${data.nomeEquipe}</p>
                        <p class="text-gray-700"><strong>Data de Início:</strong> ${format(data.dataInicio, "dd/MM/yyyy", { locale: pt })}</p>
                        <p class="text-gray-700"><strong>Horário:</strong> ${data.horarioInicio} - ${data.horarioFim}</p>
                        <p class="text-gray-700"><strong>Dias:</strong> ${data.diasSemana.join(', ')}</p>
                        <p class="text-gray-700"><strong>Status:</strong> <span class="text-amber-600 font-semibold">Em Análise</span></p>
                        <div class="mt-4 p-3 bg-emerald-50 rounded-lg">
                            <p class="text-sm text-emerald-800">
                                <strong>Próximo passo:</strong> Aguarde o contato da administração para definição dos valores financeiros e confirmação da atividade.
                            </p>
                        </div>
                    </div>
                `,
                confirmButtonText: 'Ver Minhas Atividades',
                confirmButtonColor: '#10b981',
                showCancelButton: true,
                cancelButtonText: 'Solicitar Outra Atividade',
                cancelButtonColor: '#6b7280',
                allowOutsideClick: false,
            });

            if (handleDesporto) {
                handleDesporto(desportoCriado);
            }

            if (result.isConfirmed) {
                // Usuário quer ver suas atividades
                onClose();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                // Usuário quer criar outra atividade
                form.reset({
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
                    tipoPeriodo: 'Média Duração',
                    vendaIngresso: 'Não',
                    valorIngresso: 0,
                    valorCaucao: 0,
                    dataInicio: new Date(),
                    status: 'Rascunho',
                    campo: '',
                    statusPagamento: 'Pendente',
                    observacoesAdicionais: '',
                });
            }

        } catch (error: any) {
            console.error("❌ Erro ao criar desporto:", error);
            
            Swal.fire({
                icon: 'error',
                title: 'Erro ao Enviar Solicitação',
                text: error.message || error.response?.data?.message || 'Ocorreu um erro ao processar sua solicitação. Tente novamente.',
                confirmButtonText: 'Tentar Novamente',
                confirmButtonColor: '#10b981',
            });
        } finally {
            setIsSubmitting(false);
            console.log("🏃 Submissão finalizada");
        }
    };

    if (!clienteInfo) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-hidden shadow-2xl animate-slideUp">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                    <div className="relative flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Solicitar Atividade Desportiva</h2>
                            <p className="text-emerald-100 text-sm">Preencha os dados para solicitar uma nova atividade</p>
                        </div>
                        <button
                            onClick={() => {
                                console.log("🏃 Fechando modal de desporto");
                                onClose();
                            }}
                            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"
                            disabled={isSubmitting || desportoLoading}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(95vh-120px)]">
                    {/* Informações do Cliente (somente leitura) */}
                    <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-5 border border-emerald-200">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <User className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Informações do Cliente</h3>
                                <p className="text-sm text-emerald-600">Dados cadastrais (somente leitura)</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 text-xs mb-1">Nome</p>
                                    <div className="flex items-center">
                                        <p className="text-gray-900 font-medium">{clienteInfo.nome}</p>
                                        <Lock className="w-3 h-3 ml-2 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs mb-1">Email</p>
                                    <div className="flex items-center">
                                        <p className="text-gray-900 font-medium">{clienteInfo.email}</p>
                                        <Lock className="w-3 h-3 ml-2 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs mb-1">Telefone</p>
                                    <div className="flex items-center">
                                        <p className="text-gray-900 font-medium">{clienteInfo.telefone}</p>
                                        <Lock className="w-3 h-3 ml-2 text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-xs mb-1">Nº Cliente</p>
                                    <div className="flex items-center">
                                        <p className="text-gray-900 font-medium">{clienteInfo.numeroCliente}</p>
                                        <Lock className="w-3 h-3 ml-2 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                {clienteInfo.morada && (
                                    <div>
                                        <p className="text-gray-500 text-xs mb-1">Morada</p>
                                        <div className="flex items-center">
                                            <p className="text-gray-900 font-medium">{clienteInfo.morada}</p>
                                            <Lock className="w-3 h-3 ml-2 text-gray-400" />
                                        </div>
                                    </div>
                                )}
                                {clienteInfo.biPassaporte && (
                                    <div>
                                        <p className="text-gray-500 text-xs mb-1">BI/Passaporte</p>
                                        <div className="flex items-center">
                                            <p className="text-gray-900 font-medium">{clienteInfo.biPassaporte}</p>
                                            <Lock className="w-3 h-3 ml-2 text-gray-400" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Informações da Equipa */}
                            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-200">
                                <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                    <Users className="w-5 h-5 text-blue-600" />
                                    <span>Informações da Equipa/Atividade</span>
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <FormField
                                        name="nomeEquipe"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">Nome da Equipa/Atividade *</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                        <Input
                                                            placeholder="Ex: Leões do Sul F.C."
                                                            className="pl-10 bg-white border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:ring-offset-0"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Configuração da Atividade */}
                            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-5 border border-purple-200">
                                <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                    <Dumbbell className="w-5 h-5 text-purple-600" />
                                    <span>Configuração da Atividade</span>
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <FormField
                                        name="tipoAtividade"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">Tipo de Atividade *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger
                                                            className={cn(
                                                                "bg-white border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:ring-offset-0",
                                                                field.value && "border-emerald-500 bg-emerald-100 text-emerald-900"
                                                            )}
                                                        >
                                                            <SelectValue placeholder="Selecione o tipo" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-white" side="bottom">
                                                        {loadingTipo ? (
                                                            <div className="p-2 text-center">
                                                                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                                                <p className="text-xs text-gray-500 mt-1">Carregando tipos...</p>
                                                            </div>
                                                        ) : errorTipo ? (
                                                            <div className="p-2 text-center">
                                                                <p className="text-xs text-red-500">Erro ao carregar tipos</p>
                                                            </div>
                                                        ) : tiposAtividadeAtivos.length === 0 ? (
                                                            <div className="p-2 text-center">
                                                                <p className="text-xs text-gray-500">Nenhum tipo disponível</p>
                                                            </div>
                                                        ) : (
                                                            tiposAtividadeAtivos.map((tipo: ITipoAtividade) => (
                                                                <SelectItem
                                                                    key={tipo._id}
                                                                    value={tipo._id}
                                                                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white focus:bg-emerald-100"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <Activity className="w-4 h-4 text-purple-600" />
                                                                        <div>
                                                                            <div className="font-medium">{tipo.nome}</div>
                                                                            {tipo.descricao && (
                                                                                <div className="text-xs text-gray-500">{tipo.descricao}</div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </SelectItem>
                                                            ))
                                                        )}
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
                                                <FormLabel className="text-sm font-medium text-gray-700">Campo/Espaço *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger
                                                            className={cn(
                                                                "bg-white border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:ring-offset-0",
                                                                field.value && "border-emerald-500 bg-emerald-100 text-emerald-900"
                                                            )}
                                                        >
                                                            <SelectValue placeholder="Selecione o campo" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-white" side="bottom">
                                                        {loadingCampo ? (
                                                            <div className="p-2 text-center">
                                                                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                                                                <p className="text-xs text-gray-500 mt-1">Carregando campos...</p>
                                                            </div>
                                                        ) : errorCampo ? (
                                                            <div className="p-2 text-center">
                                                                <p className="text-xs text-red-500">Erro ao carregar campos</p>
                                                            </div>
                                                        ) : camposAtivos.length === 0 ? (
                                                            <div className="p-2 text-center">
                                                                <p className="text-xs text-gray-500">Nenhum campo disponível</p>
                                                            </div>
                                                        ) : (
                                                            camposAtivos.map((campo: ICampo) => (
                                                                <SelectItem
                                                                    key={campo._id}
                                                                    value={campo._id}
                                                                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white focus:bg-emerald-100"
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <MapPin className="w-4 h-4 text-blue-600" />
                                                                        <div>
                                                                            <div className="font-medium">{campo.nome}</div>
                                                                            <div className="text-xs text-gray-500">{campo.status}</div>
                                                                        </div>
                                                                    </div>
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="mb-4">
                                    <FormLabel className="text-sm font-medium text-gray-700 mb-3 block">Dias da Semana *</FormLabel>
                                    <FormField
                                        name="diasSemana"
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                    {diasDaSemana.map((dia) => (
                                                        <FormField
                                                            key={dia.value}
                                                            name="diasSemana"
                                                            render={({ field: fieldArray }) => (
                                                                <FormItem
                                                                    key={dia.value}
                                                                    className="flex items-center space-x-2 space-y-0"
                                                                >
                                                                    <FormControl>
                                                                        <Checkbox
                                                                            checked={fieldArray.value?.includes(dia.value)}
                                                                            onCheckedChange={(checked) => {
                                                                                const newValue = checked
                                                                                    ? [...fieldArray.value, dia.value]
                                                                                    : fieldArray.value?.filter((value) => value !== dia.value);
                                                                                fieldArray.onChange(newValue);
                                                                            }}
                                                                            className="data-[state=checked]:bg-emerald-600 border-gray-300"
                                                                        />
                                                                    </FormControl>
                                                                    <FormLabel className="text-sm font-normal cursor-pointer">
                                                                        {dia.label}
                                                                    </FormLabel>
                                                                </FormItem>
                                                            )}
                                                        />
                                                    ))}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        name="horarioInicio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">Horário de Início *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger
                                                            className={cn(
                                                                "bg-white border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:ring-offset-0",
                                                                field.value && "border-emerald-500 bg-emerald-100 text-emerald-900"
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
                                                                className="data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white focus:bg-emerald-100"
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
                                        name="horarioFim"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">Horário de Fim *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger
                                                            className={cn(
                                                                "bg-white border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:ring-offset-0",
                                                                field.value && "border-emerald-500 bg-emerald-100 text-emerald-900"
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
                                                                className="data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white focus:bg-emerald-100"
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
                                        name="corIdentificacao"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">Cor de Identificação *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger
                                                            className={cn(
                                                                "bg-white border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:ring-offset-0",
                                                                field.value && "border-emerald-500 bg-emerald-100 text-emerald-900"
                                                            )}
                                                        >
                                                            <SelectValue placeholder="Selecione">
                                                                {field.value && (
                                                                    <div className="flex items-center gap-2">
                                                                        <div
                                                                            className="w-4 h-4 rounded-full"
                                                                            style={{ backgroundColor: field.value }}
                                                                        />
                                                                        {coresIdentificacao.find(c => c.value === field.value)?.label}
                                                                    </div>
                                                                )}
                                                            </SelectValue>
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-white" side="bottom">
                                                        {coresIdentificacao.map((cor) => (
                                                            <SelectItem
                                                                key={cor.value}
                                                                value={cor.value}
                                                                className="data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white focus:bg-emerald-100"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div
                                                                        className={`w-4 h-4 rounded-full ${cor.color}`}
                                                                    />
                                                                    <span>{cor.label}</span>
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
                            </div>

                            {/* Datas e Período */}
                            <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl p-5 border border-amber-200">
                                <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                    <CalendarIcon className="w-5 h-5 text-amber-600" />
                                    <span>Datas e Período</span>
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        name="dataInicio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">Data de Início *</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal bg-white border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:ring-offset-0",
                                                                    !field.value && "text-muted-foreground",
                                                                    field.value && "border-emerald-500 bg-emerald-100 text-emerald-900"
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
                                                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
                                        name="dataFim"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">Data de Fim (opcional)</FormLabel>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                className={cn(
                                                                    "w-full pl-3 text-left font-normal bg-white border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:ring-offset-0",
                                                                    !field.value && "text-muted-foreground",
                                                                    field.value && "border-emerald-500 bg-emerald-100 text-emerald-900"
                                                                )}
                                                            >
                                                                {field.value ? (
                                                                    format(field.value, "PPP", { locale: pt })
                                                                ) : (
                                                                    <span>Sem data de fim</span>
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
                                                            disabled={(date) => {
                                                                const dataInicio = form.getValues('dataInicio');
                                                                return dataInicio ? date < dataInicio : date < new Date();
                                                            }}
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
                                        name="tipoPeriodo"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">Tipo de Período *</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger
                                                            className={cn(
                                                                "bg-white border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:ring-offset-0",
                                                                field.value && "border-emerald-500 bg-emerald-100 text-emerald-900"
                                                            )}
                                                        >
                                                            <SelectValue placeholder="Selecione" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="bg-white" side="bottom">
                                                        {tiposPeriodo.map((periodo) => (
                                                            <SelectItem
                                                                key={periodo.value}
                                                                value={periodo.value}
                                                                className="data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white focus:bg-emerald-100"
                                                            >
                                                                {periodo.label}
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

                            {/* Nota sobre Valores Financeiros */}
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                    <DollarSign className="w-5 h-5 text-gray-600" />
                                    <span>Informações Financeiras</span>
                                </h4>

                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Shield className="w-4 h-4 text-amber-600" />
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-semibold text-amber-800 mb-1">Valores Serão Definidos pela Administração</h5>
                                            <p className="text-xs text-amber-700">
                                                Os valores de pagamento, caução e ingressos serão definidos pela administração após análise da sua solicitação.
                                                Você será contactado com a proposta financeira para aprovação.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status e Observações */}
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                    <FileText className="w-5 h-5 text-gray-600" />
                                    <span>Observações</span>
                                </h4>

                                <FormField
                                    name="observacoesAdicionais"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">Observações Adicionais</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Informações adicionais, requisitos especiais, observações importantes..."
                                                    className="min-h-[100px] bg-white border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:ring-offset-0"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="mt-4 text-xs text-gray-500">
                                    <p className="mb-1">• Esta solicitação será analisada pela administração</p>
                                    <p className="mb-1">• Você será contactado para definição dos valores financeiros</p>
                                    <p>• O status inicial será "Pendente" até análise completa</p>
                                </div>
                            </div>

                            {/* Botões de Ação */}
                            <div className="flex space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        console.log("🏃 Cancelando criação de atividade desportiva");
                                        onClose();
                                    }}
                                    disabled={isSubmitting || desportoLoading}
                                    className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || desportoLoading}
                                    className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting || desportoLoading ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Processando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="h-5 w-5" />
                                            <span>Enviar Solicitação</span>
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