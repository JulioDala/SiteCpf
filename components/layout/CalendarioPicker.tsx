'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClienteReservasStore } from '@/storage/cliente-storage';

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
    dataInicioProducao?: Date;
    dataFimProducao?: Date;
    espaco?: string;
    evento?: string;
  }>;
  intervalosOcupados: Intervalo[];
  intervalosDisponiveis: Intervalo[];
}

interface CalendarioPickerProps {
  onDataSelecionada: (dados: {
    data: string;
    horaInicio: string;
    horaTermino: string;
    disponivel?: boolean;
  }) => void;
  espacoId?: string;
  dataInicio?: string;
  dataFim?: string;
  valorInicial?: {
    data?: string;
    horaInicio?: string;
    horaTermino?: string;
  };
  reservaId?: string; // ✅ NOVO: opcional, para ignorar a própria reserva na edição
}

export function CalendarioPicker({
  onDataSelecionada,
  espacoId,
  dataInicio: dataInicioProps,
  dataFim: dataFimProps,
  valorInicial = {},
  reservaId, // ✅ NOVO
}: CalendarioPickerProps) {
  const [dataInicio, setDataInicio] = useState<string>(
    dataInicioProps || new Date().toISOString().split('T')[0]
  );
  const [dataFim, setDataFim] = useState<string>(
    dataFimProps || new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const [dataSelecionada, setDataSelecionada] = useState<string | null>(valorInicial?.data || null);
  const [intervaloSelecionado, setIntervaloSelecionado] = useState<Intervalo | null>(
    valorInicial?.horaInicio && valorInicial?.horaTermino
      ? { inicio: valorInicial.horaInicio, fim: valorInicial.horaTermino }
      : null
  );
  const [horaSelecionada, setHoraSelecionada] = useState<string | null>(null);
  const [horaManual, setHoraManual] = useState<{ inicio: string; fim: string }>({ inicio: '', fim: '' });

  const { getCalendarioPortal, calendarioPortal, loadingCalendarioPortal, errorCalendarioPortal } =
    useClienteReservasStore();

  // Buscar calendário quando dataInicio/dataFim/espacoId mudam
  useEffect(() => {
    if (!dataInicio || !dataFim || !espacoId) return;

    const buscarCalendario = async () => {
      try {
        // ✅ NOVO: inclui reservaId APENAS se existir (para edição)
        await getCalendarioPortal({
          dataInicio,
          dataFim,
          espacoId,
          ...(reservaId && { reservaId }) // Só adiciona se estiver editando
        });
      } catch (error) {
        console.error('Erro ao buscar calendário:', error);
      }
    };

    buscarCalendario();
  }, [dataInicio, dataFim, espacoId, reservaId]);

  // ... resto do código permanece IGUAL
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

    const atravessaMeiaNoite = fimMin <= inicioMin;

    if (atravessaMeiaNoite) {
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
    setHoraManual({ inicio: '', fim: '' });

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
    dia: DiaCalendarioPortal
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

  const handleSelecionarHora = (data: string, hora: string) => {
    setDataSelecionada(data);
    setHoraSelecionada(hora);
    onDataSelecionada({
      data,
      horaInicio: hora,
      horaTermino: '',
      disponivel: true,
    });
  };

  if (!espacoId) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8 max-w-4xl">
        <div className="flex flex-col items-center justify-center space-y-3">
          <Calendar className="w-8 h-8 text-gray-400" />
          <p className="text-gray-600 font-medium">Selecione um espaço para visualizar disponibilidade</p>
        </div>
      </div>
    );
  }

  if (loadingCalendarioPortal) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8 max-w-4xl">
        <div className="flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">Carregando disponibilidade...</p>
        </div>
      </div>
    );
  }

  if (errorCalendarioPortal) {
    return (
      <div className="bg-white rounded-lg shadow border border-red-200 p-6 max-w-4xl bg-red-50">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-red-700 font-semibold mb-2">Erro ao carregar calendário</p>
            <p className="text-red-600 text-sm mb-4">{errorCalendarioPortal}</p>
            <Button onClick={() => setDataInicio(dataInicio)} size="sm" className="bg-red-600 hover:bg-red-700 text-white">
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const dias = calendarioPortal?.dias || [];

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-4 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-lg">Selecionar Data e Horário</h3>
      </div>

      {/* Filtros de Data */}
      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <label htmlFor="dataInicio" className="block text-xs font-semibold text-gray-700 mb-2">
            Data Início
          </label>
          <input
            type="date"
            id="dataInicio"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>

        <div>
          <label htmlFor="dataFim" className="block text-xs font-semibold text-gray-700 mb-2">
            Data Fim
          </label>
          <input
            type="date"
            id="dataFim"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            min={dataInicio}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>
      </div>

      {/* Calendário de Disponibilidade */}
      {dias.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">Disponibilidade por Data</h4>
          <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
            {dias.map((dia) => (
              <div
                key={dia.dataCompleta}
                className={`rounded-lg p-4 border-2 transition-all ${!dia.temDisponibilidade
                  ? 'bg-gray-50 border-gray-200 opacity-50'
                  : dataSelecionada === dia.dataCompleta
                    ? 'bg-blue-50 border-blue-400'
                    : 'bg-white border-gray-200 hover:border-blue-300'
                  }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{formatarData(dia.dataCompleta)}</p>
                      <div className="flex gap-2 mt-1">
                        {dia.vazio && !dia.temDisponibilidade && (
                          <p className="text-xs text-red-600 font-medium">Bloqueado</p>
                        )}
                        {dia.vazio && dia.temDisponibilidade && (
                          <p className="text-xs text-green-600 font-medium">Totalmente livre</p>
                        )}
                        {dia.feriado && <p className="text-xs text-orange-600 font-medium">Feriado</p>}
                        {dia.fimDeSemana && <p className="text-xs text-purple-600 font-medium">Fim de semana</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className="text-green-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {dia.intervalosDisponiveis.length} intervalo(s)
                    </span>
                    <span className="text-red-600 font-semibold flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      {dia.intervalosOcupados.length} ocupado(s)
                    </span>
                  </div>
                </div>

                {!dia.temDisponibilidade ? (
                  <p className="text-xs text-gray-500 italic font-medium">
                    {dia.vazio ? 'Dia bloqueado para reservas' : 'Não há horários disponíveis'}
                  </p>
                ) : (
                  <>
                    {dia.intervalosDisponiveis.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-700 mb-2">Intervalos disponíveis:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {dia.intervalosDisponiveis.map((intervalo) => {
                            const isSelected =
                              intervaloSelecionado?.inicio === intervalo.inicio &&
                              intervaloSelecionado?.fim === intervalo.fim &&
                              dataSelecionada === dia.dataCompleta;
                            return (
                              <button
                                key={`${intervalo.inicio}-${intervalo.fim}`}
                                onClick={() => handleSelecionarIntervalo(dia.dataCompleta, intervalo)}
                                className={`p-2 rounded-lg border-2 transition-all text-sm font-semibold ${isSelected
                                  ? 'bg-blue-500 border-blue-600 text-white'
                                  : 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100 hover:border-green-400'
                                  }`}
                              >
                                {intervalo.inicio} – {intervalo.fim}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Inputs manuais para horário */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs font-medium text-gray-700 mb-3">
                        Ou selecione um horário personalizado:
                      </p>
                      <div className="flex gap-3 items-center">
                        <input
                          type="time"
                          value={
                            dataSelecionada === dia.dataCompleta ? horaManual.inicio : ''
                          }
                          onChange={(e) =>
                            handleHoraManualChange('inicio', e.target.value, dia)
                          }
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-gray-500 font-medium">até</span>
                        <input
                          type="time"
                          value={
                            dataSelecionada === dia.dataCompleta ? horaManual.fim : ''
                          }
                          onChange={(e) =>
                            handleHoraManualChange('fim', e.target.value, dia)
                          }
                          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {dataSelecionada === dia.dataCompleta &&
                          horaManual.inicio &&
                          horaManual.fim &&
                          !isHorarioDisponivel(
                            horaManual.inicio,
                            horaManual.fim,
                            dia.intervalosOcupados
                          ) && (
                            <span className="text-red-600 text-xs font-medium ml-2 whitespace-nowrap">
                              ⚠ Horário ocupado!
                            </span>
                          )}
                      </div>
                    </div>

                    {dia.intervalosOcupados.length > 0 && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs font-medium text-gray-600 mb-2">Intervalos ocupados:</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {dia.intervalosOcupados.map((intervalo) => (
                            <div
                              key={`${intervalo.inicio}-${intervalo.fim}`}
                              className="p-2 rounded-lg border-2 border-red-300 bg-red-50 text-red-700 text-sm font-semibold text-center opacity-60"
                            >
                              {intervalo.inicio} – {intervalo.fim}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {dias.length === 0 && !loadingCalendarioPortal && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Nenhuma data disponível no período selecionado</p>
        </div>
      )}

      {/* Resumo da Seleção */}
      {dataSelecionada && intervaloSelecionado && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Selecionado:</strong> {formatarData(dataSelecionada)} de {intervaloSelecionado.inicio} a{' '}
            {intervaloSelecionado.fim}
          </p>
        </div>
      )}
    </div>
  );
}
