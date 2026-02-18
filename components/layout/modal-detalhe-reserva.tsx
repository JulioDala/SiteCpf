// modal-detalhe-reserva-updated.tsx
'use client';
import React, { JSX, useState } from 'react';
import { X, Calendar, Clock, Users, FileText, CreditCard, Shield, Award, MapPin, DollarSign, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { ReservaCompleta } from '@/storage/cliente-storage';

interface ModalProps {
  data: ReservaCompleta;
  open: boolean;
  onClose: () => void;
}

export default function ModalDetalheReservaUpdated({ data, open, onClose }: ModalProps) {
  const [activeTab, setActiveTab] = useState('informacoes');

  if (!open) return null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Confirmada: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Pendente: 'bg-amber-50 text-amber-700 border-amber-200',
      Cancelada: 'bg-rose-50 text-rose-700 border-rose-200',
      Expirada: 'bg-orange-50 text-orange-700 border-orange-200',
      Concluída: 'bg-blue-50 text-blue-700 border-blue-200',
      Rascunho: 'bg-gray-50 text-gray-700 border-gray-200',
      Pago: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Parcial: 'bg-cyan-50 text-cyan-700 border-cyan-200',
      Vencida: 'bg-rose-50 text-rose-700 border-rose-200',
      Reembolsado: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      Confirmada: <CheckCircle className="w-4 h-4" />,
      Pendente: <AlertCircle className="w-4 h-4" />,
      Cancelada: <XCircle className="w-4 h-4" />,
      Expirada: <XCircle className="w-4 h-4" />,
      Concluída: <CheckCircle className="w-4 h-4" />,
      Rascunho: <Clock className="w-4 h-4" />,
      Pago: <CheckCircle className="w-4 h-4" />,
      Parcial: <AlertCircle className="w-4 h-4" />,
      Vencida: <XCircle className="w-4 h-4" />,
      Reembolsado: <CheckCircle className="w-4 h-4" />,
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
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getDisplayStatus = (status: string, totalPago: number) => {
    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    if (normalizedStatus === 'Cancelada' && totalPago > 0) {
      return 'Expirada';
    }
    return normalizedStatus;
  };

  const espaco = data.espaco || data.espacoId;
  const tipoEvento = data.tipoEvento || data.eventoId;
  const pagamentos = data.pagamentosDetalhes || data.pagamentos || [];
  const caucao = data.caucoes?.[0];
  const displayStatus = getDisplayStatus(data.status, data.totalPago);

  const formatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) return '0';
    return value.toLocaleString();
  };

  const formatValor = (valor: number, status: string) => {
    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    if (normalizedStatus === 'Rascunho') return '---';
    return `${formatCurrency(valor)} AOA`;
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
                  <Calendar className="w-6 h-6 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg mb-1">{espaco?.nome || 'Espaço'}</h3>
                  {tipoEvento && <p className="text-sm text-gray-500">{tipoEvento.nome}</p>}
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3 text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{new Date(data.data).toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{data.horaInicio} - {data.horaTermino}</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-700">
                  <Users className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>{data.participants} participantes</span>
                </div>
                {espaco && (
                  <>
                    <div className="flex items-center space-x-3 text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span>Capacidade: {espaco.capacidade} pessoas</span>
                    </div>
                    {espaco.area && (
                      <div className="flex items-center space-x-3 text-gray-700">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>Área: {espaco.area}m²</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Status</h4>
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(displayStatus)}`}>
                  {getStatusIcon(displayStatus)}
                  <span>{displayStatus}</span>
                </span>
                <span className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium border ${getStatusColor(data.paymentStatus)}`}>
                  {getStatusIcon(data.paymentStatus)}
                  <span>{data.paymentStatus}</span>
                </span>
              </div>
              {data.assinaturaFuncionario && (
                <p className="text-xs text-gray-500 mt-4 pt-4 border-t border-gray-100">Assinatura: {data.assinaturaFuncionario}</p>
              )}
            </div>

            {data.description && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Descrição</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{data.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4 text-xs uppercase tracking-wide">Serviços Internos</h4>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Decoração</span>
                    <span className={data.decoracaoInterna ? 'text-emerald-600 font-medium' : 'text-gray-400'}>{data.decoracaoInterna ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Catering</span>
                    <span className={data.cateringInterno ? 'text-emerald-600 font-medium' : 'text-gray-400'}>{data.cateringInterno ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">DJ</span>
                    <span className={data.djInterno ? 'text-emerald-600 font-medium' : 'text-gray-400'}>{data.djInterno ? '✓' : '✗'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4 text-xs uppercase tracking-wide">Serviços Externos</h4>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Decoração</span>
                    <span className={data.decoracaoExterna ? 'text-emerald-600 font-medium' : 'text-gray-400'}>{data.decoracaoExterna ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Catering</span>
                    <span className={data.cateringExterno ? 'text-emerald-600 font-medium' : 'text-gray-400'}>{data.cateringExterno ? '✓' : '✗'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">DJ</span>
                    <span className={data.djExterno ? 'text-emerald-600 font-medium' : 'text-gray-400'}>{data.djExterno ? '✓' : '✗'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4 text-xs uppercase tracking-wide">Contatos</h4>
                <div className="space-y-3 text-sm">
                  {data.contactoDecoradora && (
                    <div>
                      <span className="text-gray-500 text-xs">Decoração</span>
                      <p className="text-gray-900 font-medium">{data.contactoDecoradora}</p>
                    </div>
                  )}
                  {data.contactoCatering && (
                    <div>
                      <span className="text-gray-500 text-xs">Catering</span>
                      <p className="text-gray-900 font-medium">{data.contactoCatering}</p>
                    </div>
                  )}
                  {data.contactoDJ && (
                    <div>
                      <span className="text-gray-500 text-xs">DJ</span>
                      <p className="text-gray-900 font-medium">{data.contactoDJ}</p>
                    </div>
                  )}
                  {!data.contactoDecoradora && !data.contactoCatering && !data.contactoDJ && (
                    <p className="text-gray-400 text-sm">Sem contatos</p>
                  )}
                </div>
              </div>
            </div>

            {data.comProducao && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Produção</h4>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Dias de Produção</p>
                    <p className="font-semibold text-gray-900">{data.diasProducao} dias</p>
                  </div>
                  {data.dataInicioProducao && (
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Início</p>
                      <p className="font-semibold text-gray-900">{new Date(data.dataInicioProducao).toLocaleDateString('pt-PT')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {data.outrasInformacoes && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Notas Adicionais</h4>
                <p className="text-sm text-gray-700 leading-relaxed">{data.outrasInformacoes}</p>
              </div>
            )}

            {espaco?.equipamentos && espaco.equipamentos.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Equipamentos Disponíveis</h4>
                <div className="flex flex-wrap gap-2">
                  {espaco.equipamentos.map((eq, index) => (
                    <span key={index} className="px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-700">{eq}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'financeiro':
        return (
          <div className="space-y-5">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-5 text-sm uppercase tracking-wide">Resumo Financeiro</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Total</p>
                  <p className="text-xl font-bold text-gray-900">{formatValor(data.valor, data.status)}</p>
                </div>
                <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <p className="text-xs text-emerald-600 mb-2 uppercase tracking-wide">Pago</p>
                  <p className="text-xl font-bold text-emerald-700">{formatValor(data.totalPago, data.status)}</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <p className="text-xs text-amber-600 mb-2 uppercase tracking-wide">Pendente</p>
                  <p className="text-xl font-bold text-amber-700">{formatValor(data.saldoPendente, data.status)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Histórico de Pagamentos</h4>
                <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{pagamentos.length} pagamentos</span>
              </div>

              {pagamentos.length > 0 ? (
                <div className="space-y-3">
                  {pagamentos.map((pag) => (
                    <div key={pag._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 mb-1">{new Date(pag.dataPagamento).toLocaleDateString('pt-PT')}</p>
                        <p className="text-xs text-gray-500">{pag.formaPagamento || 'Não especificado'}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(pag.valorPago)} AOA</p>
                        <span className={`px-3 py-1 rounded-md text-xs font-medium border ${getStatusColor(pag.status || 'Pendente')}`}>{pag.status || 'Pendente'}</span>
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
            {caucao ? (
              <>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-5 text-sm uppercase tracking-wide">Detalhes da Caução</h4>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-3xl font-bold text-gray-900 mb-2">{formatCurrency(caucao.valorCaucao)} AOA</p>
                      <p className="text-xs text-gray-500 mb-1">Recebido em {new Date(caucao.dataRecebimento).toLocaleDateString('pt-PT')}</p>
                      <p className="text-xs text-gray-500">{caucao.formaPagamento || 'Forma não especificada'}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1.5 rounded-md text-xs font-medium border ${getCaucaoColor(caucao.status)}`}>{caucao.status}</span>
                      <span className={`px-3 py-1.5 rounded-md text-xs font-medium border ${getCaucaoColor(caucao.estadoCaucao)}`}>{caucao.estadoCaucao}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-5 border-t border-gray-100">
                    <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Saldo Disponível</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(caucao.saldoDisponivel)} AOA</p>
                    </div>
                    {caucao.valorRetido && caucao.valorRetido > 0 && (
                      <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-100">
                        <p className="text-xs text-amber-600 mb-2 uppercase tracking-wide">Valor Retido</p>
                        <p className="text-lg font-bold text-amber-700">{formatCurrency(caucao.valorRetido)} AOA</p>
                      </div>
                    )}
                  </div>
                </div>

                {caucao.observacoes && (
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Observações</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{caucao.observacoes}</p>
                  </div>
                )}

                {caucao.prejuizos && caucao.prejuizos.length > 0 && (
                  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Prejuízos Registrados</h4>
                    <div className="space-y-3">
                      {caucao.prejuizos.map((prej, index) => (
                        <div key={index} className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-medium text-gray-900">{prej.descricao}</p>
                            <span className={`px-2.5 py-1 rounded text-xs font-medium ${prej.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                prej.status === 'Rejeitado' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                                  'bg-amber-100 text-amber-700 border border-amber-200'
                              }`}>{prej.status}</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">Valor: {formatCurrency(prej.valorEstimado)} AOA</p>
                          <p className="text-xs text-gray-500">{new Date(prej.dataOcorrencia).toLocaleDateString('pt-PT')}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Nenhuma caução registrada</p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Detalhes da Reserva</h2>
              <p className="text-sm text-gray-500">Referência: {data.ref}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="bg-gray-50 border-b border-gray-200">
          <nav className="flex px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-5 py-4 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] bg-white">
          {renderTabContent()}
        </div>

      </div>
    </div>
  );
}