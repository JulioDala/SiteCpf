// components/layout/calendario-geral-card.tsx
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Home, 
  Clock,
  TrendingUp,
  Loader2,
  AlertCircle,
  Maximize2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useClienteReservasStore } from '@/storage/cliente-storage';

interface CalendarioGeralCardProps {
  espacoId?: string;
  className?: string;
  onOpenModal?: () => void;
}

const CalendarioGeralCard: React.FC<CalendarioGeralCardProps> = ({ 
  espacoId,
  className = '',
  onOpenModal 
}) => {
  const { 
    calendarioGeral, 
    loadingCalendarioGeral, 
    getCalendarioGeral,
    error 
  } = useClienteReservasStore();

  const [mesSelecionado, setMesSelecionado] = useState<number>(() => new Date().getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState<number>(() => new Date().getFullYear());

  useEffect(() => {
    carregarCalendario();
  }, [mesSelecionado, anoSelecionado, espacoId]);

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
      case 'BAIXA': return 'bg-emerald-100 border-emerald-200';
      case 'MEDIA': return 'bg-amber-100 border-amber-200';
      case 'ALTA': return 'bg-orange-100 border-orange-200';
      case 'CHEIO': return 'bg-red-100 border-red-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const diasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <Card className={`border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden rounded-2xl bg-white border border-purple-100 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span>Calendário de Ocupação</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {onOpenModal && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenModal}
                className="text-gray-600 hover:text-purple-600"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Navegação */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={navegarParaMesAnterior}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            
            <span className="font-semibold text-gray-900">
              {getNomeMes(mesSelecionado)} {anoSelecionado}
            </span>
            
            <button
              onClick={navegarParaProximoMes}
              className="p-1.5 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
            
            <Button
              size="sm"
              onClick={irParaMesAtual}
              className="ml-2 text-xs"
            >
              Hoje
            </Button>
          </div>

          {calendarioGeral && !loadingCalendarioGeral && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">{calendarioGeral.estatisticas.totalReservas}</span> reservas
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {loadingCalendarioGeral ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Carregando calendário...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 text-sm">Erro ao carregar calendário</p>
            </div>
            <Button
              onClick={carregarCalendario}
              variant="ghost"
              size="sm"
              className="mt-2 text-red-600 hover:text-red-700"
            >
              Tentar novamente
            </Button>
          </div>
        ) : calendarioGeral ? (
          <>
            {/* Legenda de cores */}
            <div className="flex justify-center space-x-3 mb-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-1"></div>
                <span>Baixa</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-500 rounded-full mr-1"></div>
                <span>Média</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>
                <span>Alta</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                <span>Cheio</span>
              </div>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {diasDaSemana.map((dia, index) => (
                <div key={index} className="text-center py-1 text-xs font-semibold text-gray-600">
                  {dia}
                </div>
              ))}
            </div>

            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-1 " >
              {calendarioGeral.calendario.dias.map((dia, index) => (
                <div
                  key={index}
                  className={`
                    aspect-square p-1 border rounded-lg text-xs flex flex-col items-center justify-center
                    ${dia.vazio ? 'border-transparent' : ''}
                    ${dia.feriado || dia.fimDeSemana ? 'opacity-60' : ''}
                    ${dia.ocupacao ? getCorPorOcupacao(dia.ocupacao.nivel) : 'bg-gray-50 border-gray-200'}
                  `}
                >
                  {!dia.vazio && (
                    <>
                      <span className="font-semibold">{dia.dia}</span>
                      {dia.temReservas && (
                        <div className="text-[10px] mt-0.5 font-medium">
                          {dia.totalReservas}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Estatísticas rápidas */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="text-xs text-gray-600">Ocupação</div>
                  <div className="text-sm font-bold text-gray-900">
                    {calendarioGeral.estatisticas.ocupacaoMedia}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600">Horários Top</div>
                  <div className="text-sm font-bold text-gray-900">
                    {calendarioGeral.estatisticas.horariosMaisOcupados[0]?.hora || '-'}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600">Dia Top</div>
                  <div className="text-sm font-bold text-gray-900">
                    {calendarioGeral.estatisticas.diasMaisOcupados[0]?.reservas || 0}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nenhum calendário disponível</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarioGeralCard;