'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDesportoStore } from '@/storage/cliente-desporto-stores';
import { cn } from '@/lib/utils';

interface Intervalo {
    inicio: string;
    fim: string;
}

interface DiaCalendarioPortal {
    dataCompleta: string;
    diaNumero: number;
    vazio: boolean;
    temDisponibilidade: boolean;
    fimDeSemana: boolean;
    feriado: boolean;
    reservas: Array<{
        id: string;
        horaInicio: string;
        horaFim: string;
        status: string;
        espaco: string;
        evento: string;
    }>;
    intervalosOcupados: Intervalo[];
    intervalosDisponiveis: Intervalo[];
}

interface CalendarioPickerDesportoProps {
    onDataSelecionada: (dados: {
        data: string;
        horaInicio: string;
        horaTermino: string;
        disponivel?: boolean;
    }) => void;
    onPeriodoChange?: (datas: { dataInicio: string; dataFim: string }) => void; // ✅ Novo: para sincronizar datas
    campoId?: string;
    dataInicio?: string;
    dataFim?: string;
    valorInicial?: {
        data?: string;
        horaInicio?: string;
        horaTermino?: string;
    };
    desportoId?: string;
}

export function CalendarioPickerDesporto({
    onDataSelecionada,
    onPeriodoChange,
    campoId,
    dataInicio: dataInicioProps,
    dataFim: dataFimProps,
    valorInicial = {},
    desportoId,
}: CalendarioPickerDesportoProps) {
    const [dataInicio, setDataInicio] = useState<string>(
        dataInicioProps || new Date().toISOString().split('T')[0]
    );
    const [dataFim, setDataFim] = useState<string>(
        dataFimProps || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );

    const [dataSelecionada, setDataSelecionada] = useState<string | null>(valorInicial?.data || null);
    const [intervaloSelecionado, setIntervaloSelecionado] = useState<Intervalo | null>(
        valorInicial?.horaInicio && valorInicial?.horaTermino
            ? { inicio: valorInicial.horaInicio, fim: valorInicial.horaTermino }
            : null
    );
    const [horaManual, setHoraManual] = useState<{ inicio: string; fim: string }>({
        inicio: valorInicial?.horaInicio || '',
        fim: valorInicial?.horaTermino || ''
    });

    const { fetchCalendarioDesporto, calendarioDesporto, loadingCalendario } = useDesportoStore();

    // Notificar mudanças no período
    useEffect(() => {
        if (onPeriodoChange) {
            onPeriodoChange({ dataInicio, dataFim });
        }
    }, [dataInicio, dataFim]);

    // Buscar calendário quando dataInicio/dataFim/campoId mudam
    useEffect(() => {
        if (!dataInicio || !dataFim || !campoId) return;

        const buscarCalendario = async () => {
            try {
                await fetchCalendarioDesporto({
                    dataInicio,
                    dataFim,
                    campoId,
                    desportoIdExcluir: desportoId
                });
            } catch (error) {
                console.error('Erro ao buscar calendário de desporto:', error);
            }
        };

        buscarCalendario();
    }, [dataInicio, dataFim, campoId, desportoId, fetchCalendarioDesporto]);

    const isHorarioDisponivel = (
        inicio: string,
        fim: string,
        ocupados: Intervalo[]
    ) => {
        const toMinutes = (h: string) => {
            const [hor, min] = h.split(':').map(Number);
            return hor * 60 + min;
        };

        if (!inicio || !fim) return false;

        let inicioMin = toMinutes(inicio);
        let fimMin = toMinutes(fim);

        if (fimMin <= inicioMin) {
            fimMin += 24 * 60;
        }

        const temConflito = ocupados.some(({ inicio: oInicio, fim: oFim }) => {
            let oInicioMin = toMinutes(oInicio);
            let oFimMin = toMinutes(oFim);

            if (oFimMin <= oInicioMin) {
                oFimMin += 24 * 60;
            }

            return !(fimMin <= oInicioMin || inicioMin >= oFimMin);
        });

        return !temConflito;
    };

    const formatarData = (data: string) => {
        try {
            const date = new Date(data + 'T00:00:00');
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                weekday: 'short',
            });
        } catch {
            return data;
        }
    };

    const handleSelecionarIntervalo = (data: string, intervalo: Intervalo) => {
        setDataSelecionada(data);
        setIntervaloSelecionado(intervalo);
        setHoraManual({ inicio: intervalo.inicio, fim: intervalo.fim });

        onDataSelecionada({
            data,
            horaInicio: intervalo.inicio,
            horaTermino: intervalo.fim,
            disponivel: true,
        });
    };

    const handleHoraManualChange = (
        campo: 'inicio' | 'fim',
        valor: string,
        dia: any
    ) => {
        const novoHoraManual =
            campo === 'inicio' ? { ...horaManual, inicio: valor } : { ...horaManual, fim: valor };

        setHoraManual(novoHoraManual);

        const { inicio, fim } = novoHoraManual;

        if (inicio && fim) {
            const disponivel = isHorarioDisponivel(inicio, fim, dia.intervalosOcupados);
            setDataSelecionada(dia.dataCompleta);

            if (disponivel) {
                setIntervaloSelecionado({ inicio, fim });
                onDataSelecionada({
                    data: dia.dataCompleta,
                    horaInicio: inicio,
                    horaTermino: fim,
                    disponivel: true,
                });
            } else {
                setIntervaloSelecionado(null);
                onDataSelecionada({
                    data: dia.dataCompleta,
                    horaInicio: inicio,
                    horaTermino: fim,
                    disponivel: false,
                });
            }
        }
    };

    if (!campoId) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8">
                <div className="flex flex-col items-center justify-center space-y-3">
                    <Calendar className="w-10 h-10 text-emerald-200" />
                    <p className="text-gray-500 font-medium text-center">Selecione um campo para visualizar disponibilidade</p>
                </div>
            </div>
        );
    }

    if (loadingCalendario) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-8">
                <div className="flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
                    <p className="text-gray-500 font-medium">Carregando disponibilidade...</p>
                </div>
            </div>
        );
    }

    const dias = calendarioDesporto?.dias || [];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100/50 p-6 w-full animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 rounded-lg">
                    <Clock className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-gray-900">Período de Atividade</h3>
                    <p className="text-xs text-gray-500">Defina o intervalo de datas e verifique horários ocupados</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 p-5 bg-emerald-50/20 rounded-2xl border border-emerald-100/50">
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Data Início</label>
                    <input
                        type="date"
                        value={dataInicio}
                        onChange={(e) => setDataInicio(e.target.value)}
                        className="w-full h-11 px-4 text-sm border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all font-semibold text-gray-700"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Data Término</label>
                    <input
                        type="date"
                        value={dataFim}
                        onChange={(e) => setDataFim(e.target.value)}
                        min={dataInicio}
                        className="w-full h-11 px-4 text-sm border-emerald-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-sm transition-all font-semibold text-gray-700"
                    />
                </div>
            </div>

            {dias.length > 0 ? (
                <div className="space-y-6">
                    <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 scrollbar-hide">
                        {dias.map((dia) => (
                            <div
                                key={dia.dataCompleta}
                                className={cn(
                                    "rounded-2xl p-5 border-2 transition-all duration-300",
                                    !dia.temDisponibilidade
                                        ? 'bg-gray-50/50 border-gray-100 opacity-60'
                                        : dataSelecionada === dia.dataCompleta
                                            ? 'bg-emerald-50 border-emerald-500 shadow-md shadow-emerald-50'
                                            : 'bg-white border-gray-100 hover:border-emerald-200'
                                )}
                            >
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                            dataSelecionada === dia.dataCompleta ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-600"
                                        )}>
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{formatarData(dia.dataCompleta)}</p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {dia.vazio && dia.temDisponibilidade && (
                                                    <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Livre</span>
                                                )}
                                                {dia.feriado && <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Feriado</span>}
                                                {dia.fimDeSemana && <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Fim de Semana</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="text-center">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Livres</p>
                                            <p className="text-sm font-bold text-green-600">{dia.intervalosDisponiveis.length}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase">Ocupados</p>
                                            <p className="text-sm font-bold text-red-600">{dia.intervalosOcupados.length}</p>
                                        </div>
                                    </div>
                                </div>

                                {!dia.temDisponibilidade ? (
                                    <div className="py-2 px-4 bg-gray-100 rounded-xl">
                                        <p className="text-xs text-gray-500 italic flex items-center gap-2">
                                            <XCircle className="w-3 h-3" /> Campo totalmente ocupado neste dia
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                                            {dia.intervalosDisponiveis.map((intervalo) => {
                                                const isSelected =
                                                    intervaloSelecionado?.inicio === intervalo.inicio &&
                                                    intervaloSelecionado?.fim === intervalo.fim &&
                                                    dataSelecionada === dia.dataCompleta;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={`${intervalo.inicio}-${intervalo.fim}`}
                                                        onClick={() => handleSelecionarIntervalo(dia.dataCompleta, intervalo)}
                                                        className={cn(
                                                            "p-2.5 rounded-xl border-2 transition-all text-xs font-bold",
                                                            isSelected
                                                                ? 'bg-emerald-600 border-emerald-700 text-white shadow-lg'
                                                                : 'bg-white border-emerald-50 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200'
                                                        )}
                                                    >
                                                        {intervalo.inicio} – {intervalo.fim}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Exibição de Ocupados (Estilo Reservas) */}
                                        {dia.intervalosOcupados.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                                <p className="text-[10px] font-bold text-red-400 uppercase mb-2 flex items-center gap-2">
                                                    <XCircle className="w-3 h-3" /> Intervalos Ocupados
                                                </p>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                    {dia.intervalosOcupados.map((intervalo) => (
                                                        <div
                                                            key={`${intervalo.inicio}-${intervalo.fim}`}
                                                            className="p-2 rounded-xl border-2 border-red-50 bg-red-50 text-red-600 text-[10px] font-bold text-center opacity-70"
                                                        >
                                                            {intervalo.inicio} – {intervalo.fim}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 px-1">Selecione Outro Horário:</p>
                                            <div className="flex flex-wrap gap-4 items-center bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="time"
                                                        value={dataSelecionada === dia.dataCompleta ? horaManual.inicio : ''}
                                                        onChange={(e) => handleHoraManualChange('inicio', e.target.value, dia)}
                                                        className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white font-bold text-gray-700"
                                                    />
                                                    <span className="text-gray-300 font-bold">às</span>
                                                    <input
                                                        type="time"
                                                        value={dataSelecionada === dia.dataCompleta ? horaManual.fim : ''}
                                                        onChange={(e) => handleHoraManualChange('fim', e.target.value, dia)}
                                                        className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white font-bold text-gray-700"
                                                    />
                                                </div>
                                                {dataSelecionada === dia.dataCompleta && horaManual.inicio && horaManual.fim && (
                                                    <div className={cn(
                                                        "px-3 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5",
                                                        !isHorarioDisponivel(horaManual.inicio, horaManual.fim, dia.intervalosOcupados)
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-emerald-100 text-emerald-700"
                                                    )}>
                                                        {!isHorarioDisponivel(horaManual.inicio, horaManual.fim, dia.intervalosOcupados) ? (
                                                            <><XCircle className="w-3 h-3" /> Horário Ocupado!</>
                                                        ) : (
                                                            <><CheckCircle2 className="w-3 h-3" /> Disponível</>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                    <Calendar className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium font-bold">Nenhuma data disponível no período</p>
                    <p className="text-xs text-gray-300 mt-2">Tente ajustar o período ou selecionar outro campo</p>
                </div>
            )}

            {dataSelecionada && intervaloSelecionado && (
                <div className="mt-8 p-5 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-100 border border-emerald-500 flex items-center justify-between animate-slideUp">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest">Agendamento Confirmado</p>
                            <p className="text-base font-bold">
                                {formatarData(dataSelecionada)} das {intervaloSelecionado.inicio} às {intervaloSelecionado.fim}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
