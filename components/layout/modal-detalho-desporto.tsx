'use client';
import React, { JSX } from 'react';
import { X, Calendar, Clock, User, MapPin, Phone, DollarSign, CheckCircle, AlertCircle, XCircle, FileText, TrendingUp, Award, Activity, Dumbbell, Mail, Users, CreditCard, Shield } from 'lucide-react';
import { IDesportoRetorno } from '@/storage/cliente-desporto-stores';

interface ModalDetalheDesportoProps {
  data: IDesportoRetorno | null;
  open: boolean;
  onClose: () => void;
}

export default function ModalDetalheDesporto({ data, open, onClose }: ModalDetalheDesportoProps) {
  if (!open || !data) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      CONFIRMADO: 'bg-emerald-500/10 text-emerald-700 border-emerald-300/50 backdrop-blur-sm',
      PENDENTE: 'bg-amber-500/10 text-amber-700 border-amber-300/50 backdrop-blur-sm',
      CANCELADO: 'bg-rose-500/10 text-rose-700 border-rose-300/50 backdrop-blur-sm',
      CONCLUIDO: 'bg-blue-500/10 text-blue-700 border-blue-300/50 backdrop-blur-sm',
      PAGO: 'bg-emerald-500/10 text-emerald-700 border-emerald-300/50 backdrop-blur-sm',
      PARCIALMENTE_PAGO: 'bg-amber-500/10 text-amber-700 border-amber-300/50 backdrop-blur-sm',
      VENCIDO: 'bg-rose-500/10 text-rose-700 border-rose-300/50 backdrop-blur-sm',
      Ativo: 'bg-emerald-500/10 text-emerald-700 border-emerald-300/50 backdrop-blur-sm',
      Pendente: 'bg-amber-500/10 text-amber-700 border-amber-300/50 backdrop-blur-sm',
      Suspenso: 'bg-rose-500/10 text-rose-700 border-rose-300/50 backdrop-blur-sm',
      Cancelado: 'bg-gray-500/10 text-gray-700 border-gray-300/50 backdrop-blur-sm',
      Rascunho: 'bg-blue-500/10 text-blue-700 border-blue-300/50 backdrop-blur-sm',
    };
    return colors[status] || 'bg-gray-500/10 text-gray-700 border-gray-300/50 backdrop-blur-sm';
  };
  const getCampoName = (campo: any): string => {
    if (!campo) return 'Não especificado';
    if (typeof campo === 'string') return campo;
    if (typeof campo === 'object' && campo !== null) {
      return campo.nome || campo.nome || 'Não especificado';
    }
    return String(campo);
  };
  const getPropertyValue = (prop: any): string => {
    if (!prop) return 'Não especificado';
    if (typeof prop === 'string') return prop;
    if (typeof prop === 'object' && prop !== null) {
      return prop.nome || prop.nome || prop.toString() || 'Não especificado';
    }
    return String(prop);
  };
  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      CONFIRMADO: <CheckCircle className="w-4 h-4" />,
      PENDENTE: <AlertCircle className="w-4 h-4" />,
      CANCELADO: <XCircle className="w-4 h-4" />,
      CONCLUIDO: <CheckCircle className="w-4 h-4" />,
      PAGO: <CheckCircle className="w-4 h-4" />,
      PARCIALMENTE_PAGO: <AlertCircle className="w-4 h-4" />,
      VENCIDO: <XCircle className="w-4 h-4" />,
      Ativo: <CheckCircle className="w-4 h-4" />,
      Pendente: <AlertCircle className="w-4 h-4" />,
      Suspenso: <XCircle className="w-4 h-4" />,
      Cancelado: <XCircle className="w-4 h-4" />,
      Rascunho: <CheckCircle className="w-4 h-4" />,
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const getCaucaoColor = (status: string) => {
    const colors: Record<string, string> = {
      Ativa: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Devolvida: 'bg-blue-50 text-blue-700 border-blue-200',
      'Com Prejuízos': 'bg-amber-50 text-amber-700 border-amber-200',
      Expirada: 'bg-rose-50 text-rose-700 border-rose-200',
      Concluída: 'bg-gray-50 text-gray-700 border-gray-200',
      Pendente: 'bg-amber-50 text-amber-700 border-amber-200',
      'Pago/Adicional': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Pago/Devolvido': 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  // Helper para formatar valores monetários com segurança
  const formatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) return '0';
    return value.toLocaleString();
  };

  // Renderizar lista de pagamentos
  const renderPagamentosList = () => {
    if (!data.pagamentos || data.pagamentos.length === 0) {
      return <p className="text-sm text-gray-500 text-center py-4">Nenhum pagamento registrado</p>;
    }

    return (
      <div className="space-y-2">
        {data.pagamentos.map((pag) => (
          <div key={pag._id} className="flex justify-between items-center bg-white rounded-lg p-3 border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-700">
                {pag.dataPagamento ? new Date(pag.dataPagamento).toLocaleDateString('pt-PT') : 'Data não especificada'}
              </p>
              <p className="text-xs text-gray-500">{pag.observacoes || 'Pagamento'}</p>
            </div>
            <div className="flex items-center space-x-3">
              <p className="text-sm font-bold text-gray-900">{formatCurrency(pag.valorPago)} AOA</p>
              <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(pag.status || 'PENDENTE')}`}>
                {pag.status || 'PENDENTE'}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Renderizar cauções
  const renderCaucoesList = () => {
    if (!data.caucoes || data.caucoes.length === 0) {
      return <p className="text-sm text-gray-500 text-center py-4">Nenhuma caução registrada</p>;
    }

    return (
      <div className="space-y-3">
        {data.caucoes.map((caucao) => (
          <div key={caucao._id} className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(caucao.valorAPagar)} AOA</p>
                <p className="text-xs text-gray-500 mt-1">Valor da Caução</p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-3 py-1 rounded-lg text-sm font-semibold border ${getCaucaoColor(caucao.status)}`}>
                  {caucao.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-500">Valor Devolvido</p>
                <p className="text-lg font-bold text-emerald-600">{formatCurrency(caucao.valorDevolvido)} AOA</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Prejuízos</p>
                <p className="text-lg font-bold text-amber-600">{formatCurrency(caucao.totalPrejuizo)} AOA</p>
              </div>
            </div>

            {caucao.prejuizos && caucao.prejuizos.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-semibold text-gray-900 mb-2">Prejuízos Detalhados:</p>
                <div className="space-y-2">
                  {caucao.prejuizos.map((prej, index) => (
                    <div key={index} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm font-medium text-gray-900">{prej.descricao}</p>
                      <p className="text-xs text-gray-600 mt-1">Valor: {formatCurrency(prej.valor)} AOA</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
        {/* Header com Gradiente */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="relative flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-1">Detalhes da Atividade Desportiva</h2>
              <p className="text-emerald-100 text-sm">Equipe: {data.nomeEquipe || 'Não especificado'}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Info Principal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-5 border border-emerald-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{data.nomeEquipe || data.tipoAtividade.nome || 'Atividade Desportiva'}</h3>
                    <p className="text-sm text-emerald-600">
                      {getCampoName(data.campo)}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <User className="w-4 h-4" />
                    <span>Responsável: {data.nomeResponsavel || 'Não especificado'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {data.dataInicio ? new Date(data.dataInicio).toLocaleDateString('pt-PT', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Data não especificada'}
                      {data.dataFim && ` até ${new Date(data.dataFim).toLocaleDateString('pt-PT')}`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{data.horarioInicio || ''} - {data.horarioFim || ''}</span>
                  </div>
                  {data.diasSemana && data.diasSemana.length > 0 && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Dias: {data.diasSemana.join(', ')}</span>
                    </div>
                  )}
                  {data.corIdentificacao && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: data.corIdentificacao }}
                      ></div>
                      <span>Cor: {data.corIdentificacao}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Award className="w-4 h-4 text-emerald-600" />
                  <span>Status da Atividade</span>
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center space-x-1 px-4 py-2 rounded-xl text-sm font-semibold border shadow-sm ${getStatusColor(data.status)}`}>
                      {getStatusIcon(data.status)}
                      <span className="ml-1">{data.status}</span>
                    </span>
                  </div>
                  {data.statusPagamento && (
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center space-x-1 px-4 py-2 rounded-xl text-sm font-semibold border shadow-sm ${getStatusColor(data.statusPagamento)}`}>
                        {getStatusIcon(data.statusPagamento)}
                        <span className="ml-1">Pagamento: {data.statusPagamento}</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Resumo Financeiro */}
              <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-5 border border-emerald-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Resumo Financeiro</span>
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Total</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(data.valorPagamento)} AOA</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Pago</p>
                    <p className="text-lg font-bold text-emerald-600">{formatCurrency(data.valorPago)} AOA</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Pendente</p>
                    <p className="text-lg font-bold text-amber-600">{formatCurrency(data.valorPendente)} AOA</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informações de Pagamento Detalhadas */}
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-5 border border-purple-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-purple-600" />
              <span>Informações de Pagamento</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Modalidade</p>
                <p className="font-bold text-gray-900">{data.modalidadePagamento || 'Não especificado'}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Período</p>
                <p className="font-bold text-gray-900">{data.tipoPeriodo || 'Não especificado'}</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Venda de Ingressos</p>
                <p className="font-bold text-gray-900">{data.vendaIngresso || 'Não'}</p>
                {data.valorIngresso && data.valorIngresso > 0 && (
                  <p className="text-xs text-gray-600 mt-1">{formatCurrency(data.valorIngresso)} AOA/unidade</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <h5 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-purple-600" />
                <span>Histórico de Pagamentos ({data.pagamentos?.length || 0})</span>
              </h5>
              {renderPagamentosList()}
            </div>
          </div>

          {/* Cauções */}
          <div className="bg-gradient-to-br from-cyan-50 to-white rounded-xl p-5 border border-cyan-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-cyan-600" />
              <span>Informações da Caução</span>
            </h4>

            {data.valorCaucao && data.valorCaucao > 0 ? (
              <>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Total Cauções</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(data.totalCaucoes)} AOA</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Pago</p>
                    <p className="text-lg font-bold text-emerald-600">{formatCurrency(data.totalCaucaoPago)} AOA</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Pendente</p>
                    <p className="text-lg font-bold text-amber-600">{formatCurrency(data.totalCaucaoPendente)} AOA</p>
                  </div>
                </div>

                {renderCaucoesList()}
              </>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Nenhuma caução registrada para esta atividade
              </p>
            )}
          </div>

          {/* Informações de Contato */}
          {(data.contato || data.email || data.morada || data.bi) && (
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>Contato</span>
              </h4>
              <div className="space-y-3">
                {data.contato && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Telefone</p>
                      <p className="text-sm text-gray-700">{data.contato}</p>
                    </div>
                  </div>
                )}
                {data.email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Email</p>
                      <p className="text-sm text-gray-700">{data.email}</p>
                    </div>
                  </div>
                )}
                {data.morada && (
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Morada</p>
                      <p className="text-sm text-gray-700">{data.morada}</p>
                    </div>
                  </div>
                )}
                {data.bi && (
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">BI/Passaporte</p>
                      <p className="text-sm text-gray-700">{data.bi}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Observações Adicionais */}
          {data.observacoesAdicionais && (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <span>Observações Adicionais</span>
              </h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.observacoesAdicionais}</p>
            </div>
          )}

          {/* Totais */}
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-5 border border-emerald-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Totais da Atividade</span>
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Total Pagamentos</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(data.totalPagamentos)} AOA</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Total Pago</p>
                <p className="text-lg font-bold text-emerald-600">{formatCurrency(data.totalPago)} AOA</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Total Cauções</p>
                <p className="text-lg font-bold text-cyan-600">{formatCurrency(data.totalCaucoes)} AOA</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Caução Pendente</p>
                <p className="text-lg font-bold text-amber-600">{formatCurrency(data.totalCaucaoPendente)} AOA</p>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}