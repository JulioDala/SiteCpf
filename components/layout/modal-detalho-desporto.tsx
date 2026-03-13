'use client';
import React, { JSX, useState, useEffect } from 'react';
import { X, Calendar, Clock, User, MapPin, Phone, DollarSign, CheckCircle, AlertCircle, XCircle, FileText, TrendingUp, Award, Activity, Dumbbell, Mail, Users, CreditCard, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IDesportoRetorno, useDesportoStore, DesportoDetalhado } from '@/storage/cliente-desporto-stores';
import { ContratoDesportoPreview, ContratoDesportoData } from './contrato-desporto-preview';

interface ModalDetalheDesportoProps {
  data: IDesportoRetorno | null;
  open: boolean;
  onClose: () => void;
}

export default function ModalDetalheDesporto({ data, open, onClose }: ModalDetalheDesportoProps) {
  const [activeTab, setActiveTab] = useState('informacoes');
  const [detailedData, setDetailedData] = useState<DesportoDetalhado | null>(null);
  const [loading, setLoading] = useState(false);
  const [showContratoPreview, setShowContratoPreview] = useState(false);
  const { fetchDesportoDetalhado } = useDesportoStore();

  useEffect(() => {
    const loadDetailedData = async () => {
      if (open && data?._id) {
        try {
          setLoading(true);
          const detailed = await fetchDesportoDetalhado(data._id);
          setDetailedData(detailed as any);
        } catch (error) {
          console.error("Erro ao buscar detalhes do desporto:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadDetailedData();
  }, [open, data?._id, fetchDesportoDetalhado]);

  if (!open || !data) return null;

  // Usar dados detalhados se disponíveis, senão usar os dados básicos da prop
  const displayData = detailedData || data;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      CONFIRMADO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      PENDENTE: 'bg-amber-50 text-amber-700 border-amber-200',
      CANCELADO: 'bg-rose-50 text-rose-700 border-rose-200',
      CONCLUIDO: 'bg-blue-50 text-blue-700 border-blue-200',
      PAGO: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      PARCIALMENTE_PAGO: 'bg-amber-50 text-amber-700 border-amber-200',
      VENCIDO: 'bg-rose-50 text-rose-700 border-rose-200',
      Ativo: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Pendente: 'bg-amber-50 text-amber-700 border-amber-200',
      Suspenso: 'bg-rose-50 text-rose-700 border-rose-200',
      Cancelado: 'bg-gray-50 text-gray-700 border-gray-200',
      Rascunho: 'bg-blue-50 text-blue-700 border-blue-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
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
      Rascunho: <Clock className="w-4 h-4" />,
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const getCaucaoColor = (status: string) => {
    const s = status?.toUpperCase() || '';
    if (s.includes('PENDENTE') && s.includes('DEVOL')) return 'bg-amber-50 text-amber-700 border-amber-200';

    const colors: Record<string, string> = {
      ATIVA: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      DEVOLVIDA: 'bg-blue-50 text-blue-700 border-blue-200',
      'COM PREJUÍZOS': 'bg-amber-50 text-amber-700 border-amber-200',
      EXPIRADA: 'bg-rose-50 text-rose-700 border-rose-200',
      CONCLUÍDA: 'bg-gray-50 text-gray-700 border-gray-200',
      PENDENTE: 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return colors[s] || colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getCampoName = (campo: any): string => {
    if (!campo) return 'Não especificado';
    if (typeof campo === 'string') return campo;
    if (typeof campo === 'object' && campo !== null) return (campo as any).nome || 'Não especificado';
    return String(campo);
  };

  const formatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) return '0';
    return value.toLocaleString();
  };

  const getPeriodLabel = (period?: string) => {
    if (!period) return 'Não especificado';
    const mapping: Record<string, string> = {
      'curta-duracao': 'Curta Duração (até 3 meses)',
      'media-duracao': 'Média Duração (3-6 meses)',
      'longa-duracao': 'Longa Duração (6+ meses)',
      'personalizado': 'Personalizado'
    };
    return mapping[period.toLowerCase()] || period;
  };

  const tabs = [
    { id: 'informacoes', label: 'Informações', icon: Calendar },
    { id: 'financeiro', label: 'Pagamentos', icon: CreditCard },
    { id: 'caucao', label: 'Caução', icon: Shield },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'informacoes':
        return (
          <div className="space-y-5">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-start space-x-4 mb-5">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Dumbbell className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{displayData.nomeEquipe || 'Atividade Desportiva'}</h3>
                  <p className="text-sm text-emerald-600 font-medium">{getCampoName(displayData.campo)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-700">
                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>Responsável: <strong>{displayData.nomeResponsavel || 'Não especificado'}</strong></span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>Início: {displayData.dataInicio ? new Date(displayData.dataInicio).toLocaleDateString('pt-PT') : '---'}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-gray-700">
                    <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{displayData.horarioInicio || '--:--'} - {displayData.horarioFim || '--:--'}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {displayData.diasSemana && displayData.diasSemana.length > 0 && (
                    <div className="flex items-center space-x-3 text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>Dias: {displayData.diasSemana.join(', ')}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 text-gray-700">
                    <div
                      className="w-4 h-4 rounded-full border border-gray-300"
                      style={{ backgroundColor: displayData.corIdentificacao || '#e5e7eb' }}
                    ></div>
                    <span>Cor de Identificação</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Status e Situação</h4>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(displayData.status)}`}>
                  {getStatusIcon(displayData.status)}
                  <span>Status: {displayData.status}</span>
                </span>
                {(displayData as any).statusPagamento && (
                  <span className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor((displayData as any).statusPagamento)}`}>
                    {getStatusIcon((displayData as any).statusPagamento)}
                    <span>Pagamento: {(displayData as any).statusPagamento}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Informações de Contato</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <span>{displayData.contato || 'Não informado'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-emerald-500" />
                  <span>{displayData.email || 'Não informado'}</span>
                </div>
                <div className="flex items-center space-x-3 md:col-span-2">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>{displayData.morada || 'Morada não informada'}</span>
                </div>
              </div>
            </div>

            {(displayData as any).observacoesAdicionais && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Observações Adicionais</h4>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{(displayData as any).observacoesAdicionais}</p>
              </div>
            )}
          </div>
        );

      case 'financeiro':
        return (
          <div className="space-y-5">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-5 text-sm uppercase tracking-wide">Resumo Financeiro</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Acordado</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(displayData.valorPagamento)} AOA</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <p className="text-xs text-emerald-600 mb-2 uppercase tracking-wide">Pago</p>
                  <p className="text-xl font-bold text-emerald-700">{formatCurrency((displayData as any).valorPago)} AOA</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs text-amber-600 mb-2 uppercase tracking-wide">Pendente</p>
                  <p className="text-xl font-bold text-amber-700">{formatCurrency((displayData as any).valorPendente)} AOA</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Configurações de Fatura</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg outline outline-1 outline-gray-200">
                  <span className="text-gray-500">Modalidade</span>
                  <span className="font-semibold">{displayData.modalidadePagamento || '---'}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg outline outline-1 outline-gray-200">
                  <span className="text-gray-500">Tipo de Período</span>
                  <span className="font-semibold">{getPeriodLabel(displayData.tipoPeriodo)}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg outline outline-1 outline-gray-200">
                  <span className="text-gray-500">Venda de Bilhetes</span>
                  <span className="font-semibold">{displayData.vendaIngresso || 'Não'}</span>
                </div>
                {displayData.vendaIngresso === 'Sim' && (
                  <div className="flex justify-between p-3 bg-emerald-50 rounded-lg outline outline-1 outline-emerald-200">
                    <span className="text-emerald-600">Preço do Bilhete</span>
                    <span className="font-semibold text-emerald-700">{formatCurrency(displayData.valorIngresso)} AOA</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Histórico de Pagamentos</h4>
                <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{((displayData as any).pagamentos || []).length} registros</span>
              </div>

              {(displayData as any).pagamentos && (displayData as any).pagamentos.length > 0 ? (
                <div className="space-y-3">
                  {(displayData as any).pagamentos.map((pag: any) => (
                    <div key={pag._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">{pag.dataPagamento ? new Date(pag.dataPagamento).toLocaleDateString('pt-PT') : (pag.createdAt ? new Date(pag.createdAt).toLocaleDateString('pt-PT') : '---')}</p>
                        <p className="text-xs text-gray-500">{pag.observacoes || `Mensalidade / Pagamento (${pag.formaPagamento || 'N/A'})`}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(pag.valorPago)} AOA</p>
                        <span className={`px-3 py-1 rounded-md text-xs font-medium border ${getStatusColor((pag.status || 'PENDENTE').toUpperCase())}`}>{pag.status || 'PENDENTE'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Nenhum pagamento registrado</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'caucao':
        return (
          <div className="space-y-5">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-5 text-sm uppercase tracking-wide">Minha Caução</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 text-center">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Total Aplicado</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(displayData.valorCaucao)} AOA</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                  <p className="text-xs text-emerald-600 mb-2 uppercase tracking-wide">Devolvido</p>
                  <p className="text-xl font-bold text-emerald-700">{formatCurrency((displayData as any).totalCaucaoPago)} AOA</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100 text-center col-span-2 md:col-span-1">
                  <p className="text-xs text-amber-600 mb-2 uppercase tracking-wide">Retido/Pendente</p>
                  <p className="text-xl font-bold text-amber-700">{formatCurrency((displayData as any).totalCaucaoPendente)} AOA</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Histórico de Cauções</h4>
                <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{((displayData as any).caucoes || []).length} registros</span>
              </div>

              {(displayData as any).caucoes && (displayData as any).caucoes.length > 0 ? (
                <div className="space-y-4">
                  {(displayData as any).caucoes.map((caucao: any) => (
                    <div key={caucao._id} className="p-5 border border-gray-100 rounded-xl bg-gray-50/50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-lg font-bold text-gray-900">{formatCurrency(caucao.valorAPagar)} AOA</p>
                          <p className="text-xs text-gray-500 mt-1">Valor Depositado</p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-md text-xs font-semibold border ${getCaucaoColor(caucao.status)}`}>{caucao.status}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500 mb-1 leading-none">Devolvido</p>
                          <p className="text-sm font-bold text-emerald-600">{formatCurrency(caucao.valorDevolvido)} AOA</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1 leading-none">Prejuízos</p>
                          <p className="text-sm font-bold text-rose-600">{formatCurrency(caucao.totalPrejuizo)} AOA</p>
                        </div>
                      </div>

                      {caucao.prejuizos && caucao.prejuizos.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-bold text-gray-700 uppercase tracking-tighter mb-2">Prejuízos Registrados (Danos):</p>
                          <div className="space-y-2">
                            {caucao.prejuizos.map((prej: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center p-3 bg-white border border-rose-100 rounded-lg">
                                <span className="text-sm text-gray-700">{prej.descricao}</span>
                                <span className="text-sm font-bold text-rose-600">-{formatCurrency(prej.valor)} AOA</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Nenhuma caução detalhada nesta atividade</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handlePreviewContrato = () => {
    setShowContratoPreview(true);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header - Matching Reservas Style */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Detalhes da Atividade</h2>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded">#{(displayData as any).ref || displayData._id.slice(-8).toUpperCase()}</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(displayData.status)}`}>
                  {getStatusIcon(displayData.status)}
                  {displayData.status}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowContratoPreview(true)}
                className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200"
                disabled={loading || displayData?.status === 'Rascunho'}
              >
                <FileText className="w-4 h-4" />
                <span>Contrato</span>
              </Button>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Fechar"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-gray-50 border-b border-gray-200">
          <nav className="flex px-6 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-5 py-4 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id
                    ? 'border-emerald-600 text-emerald-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] bg-white relative min-h-[400px]">
          {loading && !detailedData && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center">
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-emerald-100 flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <span className="text-emerald-700 font-medium animate-pulse">A carregar detalhes...</span>
              </div>
            </div>
          )}

          {showContratoPreview ? (
            <ContratoDesportoPreview
              data={{
                nomeEquipe: displayData.nomeEquipe,
                nomeResponsavel: displayData.nomeResponsavel,
                email: displayData.email,
                morada: displayData.morada,
                bi: displayData.bi,
                contato: displayData.contato,
                diasSemana: displayData.diasSemana || [],
                horarioInicio: displayData.horarioInicio,
                horarioFim: displayData.horarioFim,
                tipoAtividade: {
                  _id: typeof displayData.tipoAtividade === 'object' ? (displayData.tipoAtividade as any)?._id : displayData.tipoAtividade as any,
                  nome: typeof displayData.tipoAtividade === 'object' ? (displayData.tipoAtividade as any)?.nome : displayData.tipoAtividade as any
                },
                campo: {
                  _id: typeof displayData.campo === 'object' ? (displayData.campo as any)?._id : displayData.campo as any,
                  nome: typeof displayData.campo === 'object' ? (displayData.campo as any)?.nome : displayData.campo as any
                },
                valorPagamento: displayData.valorPagamento || 0,
                modalidadePagamento: displayData.modalidadePagamento,
                tipoPeriodo: displayData.tipoPeriodo,
                vendaIngresso: displayData.vendaIngresso,
                valorIngresso: displayData.valorIngresso,
                valorCaucao: displayData.valorCaucao,
                dataInicio: displayData.dataInicio,
                dataFim: displayData.dataFim,
                status: displayData.status
              }}
              onBack={() => setShowContratoPreview(false)}
            />
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    </div>
  );
}