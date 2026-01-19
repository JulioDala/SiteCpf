// components/layout/modal-calendario-geral.tsx
import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  X,
  Home,
  Clock,
  TrendingUp,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useClienteReservasStore } from '@/storage/cliente-storage';

interface ModalCalendarioGeralProps {
  isOpen: boolean;
  onClose: () => void;
  espacoId?: string;
}

const ModalCalendarioGeral: React.FC<ModalCalendarioGeralProps> = ({
  isOpen,
  onClose,
  espacoId
}) => {
  const {
    calendarioGeral,
    loadingCalendarioGeral,
    getCalendarioGeral,
    error
  } = useClienteReservasStore();

  const [mesSelecionado, setMesSelecionado] = useState<number>(() => new Date().getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState<number>(() => new Date().getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState<any>(null);
  const [mostrarDetalhesDia, setMostrarDetalhesDia] = useState<boolean>(false);

  // Carregar calendário quando modal abrir
  useEffect(() => {
    if (isOpen) {
      carregarCalendario();
    }
  }, [isOpen, mesSelecionado, anoSelecionado, espacoId]);

  const carregarCalendario = () => {
    getCalendarioGeral(mesSelecionado, anoSelecionado, espacoId);
  };

  const navegarParaMesAnterior = () => {
    let novoMes = mesSelecionado - 1;
    let novoAno = anoSelecionado;

    if (novoMes < 1) {
      novoMes = 12;
      novoAno -= 1;
    }

    setMesSelecionado(novoMes);
    setAnoSelecionado(novoAno);
  };

  const navegarParaProximoMes = () => {
    let novoMes = mesSelecionado + 1;
    let novoAno = anoSelecionado;

    if (novoMes > 12) {
      novoMes = 1;
      novoAno += 1;
    }

    setMesSelecionado(novoMes);
    setAnoSelecionado(novoAno);
  };

  const irParaMesAtual = () => {
    const hoje = new Date();
    setMesSelecionado(hoje.getMonth() + 1);
    setAnoSelecionado(hoje.getFullYear());
  };

  const getNomeMes = (mes: number): string => {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return meses[mes - 1];
  };

  const getCorPorOcupacao = (nivel: string): string => {
    switch (nivel) {
      case 'BAIXA': return 'bg-emerald-100 border-emerald-200 text-emerald-800';
      case 'MEDIA': return 'bg-amber-100 border-amber-200 text-amber-800';
      case 'ALTA': return 'bg-orange-100 border-orange-200 text-orange-800';
      case 'CHEIO': return 'bg-red-100 border-red-200 text-red-800';
      default: return 'bg-gray-100 border-gray-200 text-gray-800';
    }
  };

  const getIconePorOcupacao = (nivel: string) => {
    switch (nivel) {
      case 'BAIXA': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'MEDIA': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'ALTA': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'CHEIO': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const formatarPercentual = (percentual: number): string => {
    return `${percentual}%`;
  };

  const formatarHorario = (horario: string): string => {
    const [hora, minuto] = horario.split(':');
    return `${hora}:${minuto}`;
  };

  const handleDiaClick = (dia: any) => {
    if (dia.vazio || (!dia.temReservas && dia.ocupacao?.nivel === 'BAIXA')) return;

    setDiaSelecionado(dia);
    setMostrarDetalhesDia(true);
  };

  const handleFecharDetalhes = () => {
    setMostrarDetalhesDia(false);
    setDiaSelecionado(null);
  };

  const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-[100] animate-in fade-in" onClick={onClose} />

      {/* Modal Principal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Calendário de Reservas
                </h2>
                <p className="text-sm text-gray-600">
                  Visualize a ocupação dos espaços em tempo real
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Conteúdo */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {/* Navegação e Estatísticas */}
            <div className="flex justify-between items-center mb-8 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
              <div className="flex items-center space-x-4">
                <button
                  onClick={navegarParaMesAnterior}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>

                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900">
                    {getNomeMes(mesSelecionado)} {anoSelecionado}
                  </h3>
                  <div className="flex items-center justify-center space-x-4 mt-2 text-sm">
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full mr-1"></div>
                      Baixa Ocupação
                    </span>
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-amber-500 rounded-full mr-1"></div>
                      Média Ocupação
                    </span>
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>
                      Alta Ocupação
                    </span>
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                      Cheio
                    </span>
                  </div>
                </div>

                <button
                  onClick={navegarParaProximoMes}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>

                <button
                  onClick={irParaMesAtual}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  Mês Atual
                </button>
              </div>

              {loadingCalendarioGeral ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  <span className="text-sm text-gray-600">Carregando...</span>
                </div>
              ) : calendarioGeral && (
                <div className="text-right">
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center justify-end space-x-6">
                      <span>
                        <strong className="text-gray-900">{calendarioGeral.estatisticas.totalReservas}</strong> reservas
                      </span>
                      <span>
                        <strong className="text-gray-900">{calendarioGeral.estatisticas.ocupacaoMedia}%</strong> ocupação média
                      </span>
                      <span>
                        <strong className="text-gray-900">{calendarioGeral.calendario.diasUteis}</strong> dias úteis
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {loadingCalendarioGeral ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                  <p className="text-gray-600">Carregando calendário...</p>
                </div>
              </div>
            ) : error ? (
              <Card className="border border-red-200 bg-red-50">
                <CardContent className="p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Erro ao carregar calendário</h3>
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button
                    onClick={carregarCalendario}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Tentar Novamente
                  </Button>
                </CardContent>
              </Card>
            ) : calendarioGeral ? (
              <>
                {/* Calendário */}
                <div className="mb-8">
                  {/* Dias da semana */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {diasDaSemana.map((dia, index) => (
                      <div key={index} className="text-center py-3 font-semibold text-gray-700 bg-gray-50 rounded-lg">
                        {dia}
                      </div>
                    ))}
                  </div>

                  {/* Dias do mês */}
                  <div className="grid grid-cols-7 gap-2">
                    {calendarioGeral.calendario.dias.map((dia, index) => (
                      <div
                        key={index}
                        onClick={() => handleDiaClick(dia)}
                        className={`
                          min-h-24 p-3 border rounded-xl cursor-pointer transition-all duration-200
                          hover:shadow-lg
                          ${dia.vazio ? 'border-transparent bg-transparent' : ''}
                          ${dia.feriado || dia.fimDeSemana ? 'opacity-70' : ''}
                          ${diaSelecionado?.data === dia.data ? 'ring-2 ring-purple-500 ring-offset-2' : ''}
                          ${dia.ocupacao ? getCorPorOcupacao(dia.ocupacao.nivel) : 'bg-gray-50 border-gray-200'}
                        `}
                      >
                        {!dia.vazio && (
                          <>
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-lg font-bold">
                                {dia.dia}
                              </span>
                              <div className="flex items-center space-x-1">
                                {getIconePorOcupacao(dia.ocupacao?.nivel || 'BAIXA')}
                                {dia.feriado && (
                                  <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded">F</span>
                                )}
                              </div>
                            </div>

                            {dia.temReservas ? (
                              <div className="space-y-1">
                                <div className="text-xs font-semibold">
                                  {dia.totalReservas} reserva{dia.totalReservas !== 1 ? 's' : ''}
                                </div>
                                <div className="text-xs opacity-80">
                                  {formatarPercentual(dia.ocupacao?.percentual || 0)} ocupado
                                </div>
                                {dia.reservasPorEspaco?.slice(0, 2).map((espaco, idx) => (
                                  <div key={idx} className="text-xs truncate flex items-center">
                                    <Home className="w-3 h-3 mr-1 flex-shrink-0" />
                                    <span className="truncate">{espaco.nome}: {espaco.totalReservas}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs opacity-60 italic mt-4">
                                Livre
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Estatísticas */}
                <Card className="border border-gray-200">
                  <CardContent className="p-6">
                    <h4 className="font-bold text-lg mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                      Estatísticas do Mês
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Horários mais ocupados</div>
                        <div className="space-y-1">
                          {calendarioGeral.estatisticas.horariosMaisOcupados.slice(0, 3).map((horario, idx) => (
                            <div key={idx} className="text-sm font-medium">
                              {formatarHorario(horario.hora)} ({horario.reservas})
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Espaços mais utilizados</div>
                        <div className="space-y-1">
                          {calendarioGeral.estatisticas.porEspaco.slice(0, 3).map((espaco, idx) => (
                            <div key={idx} className="text-sm font-medium">
                              {espaco.nome} ({espaco.reservas})
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Dias mais ocupados</div>
                        <div className="space-y-1">
                          {calendarioGeral.estatisticas.diasMaisOcupados.slice(0, 3).map((dia, idx) => (
                            <div key={idx} className="text-sm font-medium">
                              {new Date(dia.data).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })} ({dia.reservas})
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">Status das reservas</div>
                        <div className="space-y-1">
                          {Object.entries(calendarioGeral.estatisticas.porStatus || {}).slice(0, 3).map(([status, quantidade], idx) => (
                            <div key={idx} className="text-sm font-medium">
                              {status}: {quantidade}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum dado de calendário disponível</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Dia */}
      {mostrarDetalhesDia && diaSelecionado && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 z-[102] animate-in fade-in"
            onClick={handleFecharDetalhes}
          />

          {/* Modal Centralizado com Scroll Interno */}
          <div className="fixed inset-0 z-[103] flex items-center justify-center p-4 overflow-hidden">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-10 duration-300">

              {/* Cabeçalho Fixo */}
              <div className="flex justify-between items-start p-6 pb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Detalhes do dia {diaSelecionado.dia} de {getNomeMes(mesSelecionado)}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(diaSelecionado.data).toLocaleDateString('pt-PT', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <button
                  onClick={handleFecharDetalhes}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Conteúdo com Scroll */}
              <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">

                {/* Resumo de ocupação */}
                <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="font-semibold">Nível de Ocupação: </span>
                      <span className={`font-bold ${getCorPorOcupacao(diaSelecionado.ocupacao.nivel)} px-3 py-1 rounded-lg`}>
                        {diaSelecionado.ocupacao.nivel}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">{diaSelecionado.ocupacao.percentual}%</div>
                      <div className="text-sm text-gray-600">
                        {diaSelecionado.ocupacao.horariosOcupados} de {diaSelecionado.ocupacao.totalHorarios} horários
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-3 rounded-full transition-all duration-700 ${diaSelecionado.ocupacao.nivel === 'BAIXA' ? 'bg-emerald-500' :
                          diaSelecionado.ocupacao.nivel === 'MEDIA' ? 'bg-amber-500' :
                            diaSelecionado.ocupacao.nivel === 'ALTA' ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${diaSelecionado.ocupacao.percentual}%` }}
                    />
                  </div>
                </div>

                {/* Reservas por espaço */}
                {diaSelecionado.reservasPorEspaco && diaSelecionado.reservasPorEspaco.length > 0 ? (
                  <div className="mb-6">
                    <h4 className="font-bold text-lg mb-4 text-gray-900">Reservas por Espaço</h4>
                    <div className="space-y-4">
                      {diaSelecionado.reservasPorEspaco.map((espaco: any, index: number) => (
                        <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center mb-3">
                              <div className="flex items-center">
                                <Home className="w-5 h-5 mr-2 text-purple-600" />
                                <span className="font-semibold text-gray-900">{espaco.nome}</span>
                              </div>
                              <Badge className="bg-purple-100 text-purple-800 font-medium">
                                {espaco.totalReservas} reserva{espaco.totalReservas > 1 ? 's' : ''}
                              </Badge>
                            </div>
                            <div className="space-y-3">
                              {espaco.reservas.map((reserva: any, idx: number) => (
                                <div key={idx} className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="font-semibold text-gray-800">{reserva.horario}</span>
                                    <Badge className={`
                                text-xs font-medium ${reserva.status === 'Confirmada' ? 'bg-emerald-100 text-emerald-800' :
                                        reserva.status === 'Pendente' ? 'bg-amber-100 text-amber-800' :
                                          'bg-gray-100 text-gray-700'
                                      }
                              `}>
                                      {reserva.status}
                                    </Badge>
                                  </div>
                                  <div className="text-gray-600 text-xs">
                                    {reserva.evento} • {reserva.participantes} participantes
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-40" />
                    <p className="text-lg font-medium">Nenhuma reserva neste dia</p>
                    <p className="text-sm mt-2">Dia totalmente livre!</p>
                  </div>
                )}

                {/* Horários disponíveis */}
                {diaSelecionado.horariosDisponiveis && diaSelecionado.horariosDisponiveis.length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-bold text-lg mb-4 text-gray-900">Horários Disponíveis</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {diaSelecionado.horariosDisponiveis.map((horario: string, index: number) => (
                        <div
                          key={index}
                          className="text-center py-3 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-sm font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-default"
                        >
                          {formatarHorario(horario)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Rodapé opcional (pode adicionar botões aqui no futuro) */}
              <div className="p-4 border-t border-gray-100 text-center">
                <button
                  onClick={handleFecharDetalhes}
                  className="text-sm text-gray-500 hover:text-gray-700 font-medium"
                >
                  Fechar detalhes
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ModalCalendarioGeral;