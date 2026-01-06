'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Eye, 
  Calendar, 
  Dumbbell, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  DollarSign, 
  Loader2, 
  Bell,
  ClipboardList,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusNotificacao, TipoAcao, TipoEntidade, useNotificacaoStore } from '@/storage/notificacao-store';
import { useDesportoStore } from '@/storage/cliente-desporto-stores';
import { useClienteReservasStore } from '@/storage/cliente-storage';

interface NotificacoesModalProps {
  userEmail: string;
  numeroCliente: string;
  isOpen: boolean;
  onClose: () => void;
  onOpenReservaModal?: (reserva: any) => void;
  onOpenDesportoModal?: (desporto: any) => void;
}

const NotificacoesModal: React.FC<NotificacoesModalProps> = ({ 
  userEmail, 
  numeroCliente,
  isOpen, 
  onClose,
  onOpenReservaModal,
  onOpenDesportoModal
}) => {
  const {
    notificacoesOrdenadas,
    loading,
    error,
    contagemNaoVisualizadas,
    totalNotificacoes,
    marcarComoVisualizada,
    removerNotificacao,
    marcarTodasComoVisualizada,
    buscarNotificacoesOrdenadas
  } = useNotificacaoStore();
  
  const { fetchDesportoEspecifico } = useDesportoStore();
  const { getClienteCompletoEspecificoPopulate } = useClienteReservasStore();
  
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [loadingDetalhe, setLoadingDetalhe] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userEmail) {
      buscarNotificacoesOrdenadas(userEmail);
    }
  }, [isOpen, userEmail, buscarNotificacoesOrdenadas]);

  const obterTipoNotificacao = (entidade: TipoEntidade): 'RESERVA' | 'DESPORTO' | 'OUTRO' => {
    const entidadeStr = entidade.toString();
    if (entidadeStr.includes('RESERVA')) return 'RESERVA';
    if (entidadeStr.includes('DESPORTO')) return 'DESPORTO';
    return 'OUTRO';
  };

  const getTipoEntidadeIcon = (tipoEntidade: TipoEntidade) => {
    switch (tipoEntidade) {
      case TipoEntidade.PAGAMENTO_DESPORTO:
      case TipoEntidade.CAUCAO_DESPORTO:
        return <Dumbbell className="w-5 h-5 text-emerald-600" />;
      case TipoEntidade.PAGAMENTO_RESERVA:
      case TipoEntidade.CAUCAO_RESERVA:
        return <Calendar className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTipoEntidadeColor = (tipoEntidade: TipoEntidade) => {
    switch (tipoEntidade) {
      case TipoEntidade.PAGAMENTO_DESPORTO:
      case TipoEntidade.CAUCAO_DESPORTO:
        return 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700';
      case TipoEntidade.PAGAMENTO_RESERVA:
      case TipoEntidade.CAUCAO_RESERVA:
        return 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-purple-700';
      default:
        return 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 text-gray-700';
    }
  };

  const getTipoAcaoIcon = (tipoAcao: TipoAcao) => {
    switch (tipoAcao) {
      case TipoAcao.CRIADO:
        return <Clock className="w-3 h-3 text-blue-500" />;
      case TipoAcao.APROVADO:
      case TipoAcao.PAGO:
        return <CheckCircle className="w-3 h-3 text-emerald-500" />;
      case TipoAcao.DEVOLVIDO:
        return <DollarSign className="w-3 h-3 text-blue-500" />;
      case TipoAcao.ATUALIZADO:
        return <Eye className="w-3 h-3 text-amber-500" />;
      case TipoAcao.REJEITADO:
        return <AlertCircle className="w-3 h-3 text-rose-500" />;
      default:
        return <Bell className="w-3 h-3 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return `Hoje às ${date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays === 1) {
        return `Ontem às ${date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}`;
      } else if (diffDays < 7) {
        return `${diffDays} dias atrás`;
      } else {
        return date.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    } catch (e) {
      return dateString;
    }
  };

  const translateTipoAcao = (tipoAcao: TipoAcao) => {
    const translations: Record<TipoAcao, string> = {
      [TipoAcao.CRIADO]: 'Criado',
      [TipoAcao.ATUALIZADO]: 'Atualizado',
      [TipoAcao.APROVADO]: 'Aprovado',
      [TipoAcao.REJEITADO]: 'Rejeitado',
      [TipoAcao.DEVOLVIDO]: 'Devolvido',
      [TipoAcao.PAGO]: 'Pago'
    };
    return translations[tipoAcao] || tipoAcao;
  };

  const translateTipoEntidade = (tipoEntidade: TipoEntidade) => {
    const translations: Record<TipoEntidade, string> = {
      [TipoEntidade.PAGAMENTO_DESPORTO]: 'Pagamento Desporto',
      [TipoEntidade.CAUCAO_DESPORTO]: 'Caução Desporto',
      [TipoEntidade.PAGAMENTO_RESERVA]: 'Pagamento Reserva',
      [TipoEntidade.CAUCAO_RESERVA]: 'Caução Reserva'
    };
    return translations[tipoEntidade] || tipoEntidade;
  };

  const handleVerDetalhes = async (notificacao: any) => {
    try {
      setLoadingDetalhe(notificacao._id);
      
      const tipo = obterTipoNotificacao(notificacao.tipoEntidade);
      const entidadeId = notificacao?.idEntidade;
      
      if (!entidadeId) {
        console.error('❌ ID da entidade não encontrado na notificação');
        alert('Não foi possível encontrar os detalhes desta notificação');
        return;
      }

      if (tipo === 'DESPORTO') {
        const desportoData = await fetchDesportoEspecifico(userEmail, entidadeId);
        
        if (desportoData && desportoData.length > 0 && onOpenDesportoModal) {
          await marcarComoVisualizada(notificacao._id);
          onClose();
          onOpenDesportoModal(desportoData[0]);
        }
      } else if (tipo === 'RESERVA') {
        if (!numeroCliente) {
          console.error('❌ Número do cliente não encontrado');
          return;
        }
        
        await getClienteCompletoEspecificoPopulate(numeroCliente, entidadeId);
        await marcarComoVisualizada(notificacao._id);
        onClose();
      }
    } catch (error) {
      console.error('❌ Erro ao buscar detalhes:', error);
    } finally {
      setLoadingDetalhe(null);
    }
  };

  const handleMarcarVisualizada = async (id: string) => {
    setMarkingId(id);
    try {
      await marcarComoVisualizada(id);
    } finally {
      setMarkingId(null);
    }
  };

  const handleRemover = async (id: string) => {
    setRemovingId(id);
    try {
      await removerNotificacao(id);
    } finally {
      setRemovingId(null);
    }
  };

  const handleMarcarTodasVisualizadas = async () => {
    if (!notificacoesOrdenadas || notificacoesOrdenadas.length === 0) return;

    const naoVisualizadas = notificacoesOrdenadas.filter(
      n => n.status === StatusNotificacao.NAO_VISUALIZADA
    );

    for (const notificacao of naoVisualizadas) {
      try {
        await marcarComoVisualizada(notificacao._id);
      } catch (error) {
        console.error(`Erro ao marcar notificação como visualizada:`, error);
      }
    }
  };

  const handleRecarregar = async () => {
    try {
      if (userEmail) {
        await buscarNotificacoesOrdenadas(userEmail);
      }
    } catch (error) {
      console.error('Erro ao recarregar notificações:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <Card className="relative z-10 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="flex-shrink-0 border-b border-gray-200/50 bg-gradient-to-r from-white to-gray-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <span>Notificações</span>
              {contagemNaoVisualizadas > 0 && (
                <Badge variant="destructive" className="ml-2 bg-gradient-to-r from-red-500 to-rose-500 text-white border-0 shadow-sm">
                  {contagemNaoVisualizadas}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRecarregar}
                className="rounded-full hover:bg-gray-100 border border-gray-200"
                title="Recarregar"
              >
                <Bell className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-gray-100 border border-gray-200"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {contagemNaoVisualizadas > 0 && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarcarTodasVisualizadas}
                className="w-full text-sm bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700 hover:from-emerald-100 hover:to-emerald-200 hover:border-emerald-300 shadow-sm"
              >
                <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                Marcar todas como lidas
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
              <p className="mt-4 text-gray-500 font-medium">Carregando notificações...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="p-3 bg-gradient-to-br from-rose-50 to-rose-100 rounded-full mb-4">
                <AlertCircle className="w-10 h-10 text-rose-600" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Erro ao carregar notificações
              </p>
              <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">{error}</p>
              <Button
                onClick={handleRecarregar}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                Tentar novamente
              </Button>
            </div>
          ) : !notificacoesOrdenadas || notificacoesOrdenadas.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full mb-4">
                <Bell className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma notificação
              </p>
              <p className="text-sm text-gray-500 text-center max-w-xs">
                Você está atualizado com todas as suas atividades
              </p>
            </div>
          ) : (
            <>
              <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200/50 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-purple-600" />
                <p className="text-sm text-gray-600 font-medium">
                  Mostrando <span className="text-purple-600 font-bold">{notificacoesOrdenadas.length}</span> de{' '}
                  <span className="text-gray-800 font-bold">{totalNotificacoes}</span> notificações
                </p>
              </div>

              {notificacoesOrdenadas.map((notificacao) => (
                <div
                  key={notificacao._id}
                  className={`relative border-b border-gray-100/50 last:border-b-0 transition-all duration-200 hover:bg-gradient-to-r hover:from-white hover:to-gray-50 ${
                    notificacao.status === StatusNotificacao.NAO_VISUALIZADA
                      ? 'bg-gradient-to-r from-blue-50/50 to-blue-100/30 border-l-4 border-blue-500'
                      : ''
                  }`}
                >
                  <div className="flex gap-4 p-6">
                    <div
                      className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border-2 shadow-sm ${getTipoEntidadeColor(
                        notificacao.tipoEntidade
                      )}`}
                    >
                      {getTipoEntidadeIcon(notificacao.tipoEntidade)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className={`text-xs font-medium ${getTipoEntidadeColor(notificacao.tipoEntidade)}`}
                        >
                          {translateTipoEntidade(notificacao.tipoEntidade)}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-gray-600 px-2 py-1 bg-gray-100 rounded">
                          {getTipoAcaoIcon(notificacao.tipoAcao)}
                          {translateTipoAcao(notificacao.tipoAcao)}
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-1 text-base">
                        {notificacao.titulo}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        {notificacao.mensagem}
                      </p>

                      {notificacao.dadosAdicionais && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {notificacao.dadosAdicionais.valor !== undefined && (
                            <Badge variant="secondary" className="text-xs bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-700">
                              <DollarSign className="w-3 h-3 mr-1" />
                              {notificacao.dadosAdicionais.valor.toLocaleString()} KZ
                            </Badge>
                          )}
                          {(notificacao.dadosAdicionais.statusAnterior || notificacao.dadosAdicionais.statusAtual) && (
                            <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 bg-blue-50">
                              Status: {notificacao.dadosAdicionais.statusAnterior || notificacao.dadosAdicionais.statusAtual}
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(notificacao.createdAt)}
                        </span>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVerDetalhes(notificacao)}
                            disabled={loadingDetalhe === notificacao._id}
                            className="text-xs border border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-purple-700"
                          >
                            {loadingDetalhe === notificacao._id ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <>
                                <Eye className="w-3 h-3 mr-1" />
                                Detalhes
                              </>
                            )}
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemover(notificacao._id)}
                            disabled={removingId === notificacao._id}
                            className="text-xs border border-gray-200 hover:border-rose-300 hover:bg-rose-50 text-rose-600 hover:text-rose-700"
                          >
                            {removingId === notificacao._id ? (
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="w-3 h-3 mr-1" />
                                Remover
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {notificacao.status === StatusNotificacao.NAO_VISUALIZADA && (
                      <div className="flex-shrink-0 self-start">
                        <button
                          onClick={() => handleMarcarVisualizada(notificacao._id)}
                          disabled={markingId === notificacao._id}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
                            markingId === notificacao._id
                              ? 'bg-gradient-to-br from-gray-400 to-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 cursor-pointer hover:shadow-md'
                          }`}
                          title="Marcar como lida"
                        >
                          {markingId === notificacao._id ? (
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </CardContent>

        <div className="flex-shrink-0 border-t border-gray-200/50 px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 font-medium flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-purple-600" />
              {totalNotificacoes} notificação{totalNotificacoes !== 1 ? 's' : ''}
            </span>
            {contagemNaoVisualizadas > 0 && (
              <Badge variant="secondary" className="text-xs bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-700 font-medium flex items-center gap-1">
                <Bell className="w-3.5 h-3.5" />
                {contagemNaoVisualizadas} não lida{contagemNaoVisualizadas !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotificacoesModal;