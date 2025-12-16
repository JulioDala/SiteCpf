// modal-detalhe-reserva.tsx
'use client';
import React, { JSX, useState } from 'react';
import { X, Calendar, Clock, Users, FileText, CreditCard, Shield, Award, MapPin, DollarSign, CheckCircle, AlertCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { ReservaCompleta } from '@/storage/cliente-storage';

interface ModalProps {
  data: ReservaCompleta;
  open: boolean;
  onClose: () => void;
}

export default function ModalDetalheReserva({ data, open, onClose }: ModalProps) {
  const [activeTab, setActiveTab] = useState('informacoes');

  if (!open) return null;

  // ✅ Debug: Log dos dados recebidos
  console.log('📋 Modal - Dados da Reserva:', {
    ref: data.ref,
    caucoes: data.caucoes,
    temCaucoes: !!data.caucoes,
    quantidadeCaucoes: data.caucoes?.length,
    primeiraCAucao: data.caucoes?.[0]
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Confirmada: 'bg-emerald-500/10 text-emerald-700 border-emerald-300/50',
      Pendente: 'bg-amber-500/10 text-amber-700 border-amber-300/50',
      Cancelada: 'bg-rose-500/10 text-rose-700 border-rose-300/50',
      Concluída: 'bg-blue-500/10 text-blue-700 border-blue-300/50',
      Pago: 'bg-emerald-500/10 text-emerald-700 border-emerald-300/50',
      Parcial: 'bg-amber-500/10 text-amber-700 border-amber-300/50',
      Vencida: 'bg-rose-500/10 text-rose-700 border-rose-300/50'
    };
    return colors[status] || 'bg-gray-500/10 text-gray-700 border-gray-300/50';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      Confirmada: <CheckCircle className="w-4 h-4" />,
      Pendente: <AlertCircle className="w-4 h-4" />,
      Cancelada: <XCircle className="w-4 h-4" />,
      Concluída: <CheckCircle className="w-4 h-4" />,
      Pago: <CheckCircle className="w-4 h-4" />,
      Parcial: <AlertCircle className="w-4 h-4" />,
      Vencida: <XCircle className="w-4 h-4" />,
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

  // ✅ Extrair dados da reserva com segurança
  const espaco = data.espaco || data.espacoId;
  const tipoEvento = data.tipoEvento || data.eventoId;
  const pagamentos = data.pagamentosDetalhes || data.pagamentos || [];
  const caucao = data.caucoes?.[0];

  // ✅ Helper para formatar valores monetários com segurança
  const formatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value)) return '0';
    return value.toLocaleString();
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
          <div className="space-y-6">
            {/* Info Principal */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{espaco?.nome || 'Espaço'}</h3>
                  {tipoEvento && (
                    <p className="text-sm text-purple-600">{tipoEvento.nome}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(data.data).toLocaleDateString('pt-PT', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{data.horaInicio} - {data.horaTermino}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{data.participants} participantes</span>
                </div>
                {espaco && (
                  <>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>Capacidade: {espaco.capacidade} pessoas</span>
                    </div>
                    {espaco.area && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>Área: {espaco.area}m²</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <Award className="w-4 h-4 text-purple-600" />
                <span>Status da Reserva</span>
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center space-x-1 px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(data.status)}`}>
                    {getStatusIcon(data.status)}
                    <span className="ml-1">{data.status}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center space-x-1 px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(data.paymentStatus)}`}>
                    {getStatusIcon(data.paymentStatus)}
                    <span className="ml-1">Pagamento: {data.paymentStatus}</span>
                  </span>
                </div>
              </div>
              {data.assinaturaFuncionario && (
                <p className="text-xs text-gray-500 mt-3">
                  Assinatura: {data.assinaturaFuncionario}
                </p>
              )}
            </div>

            {/* Descrição */}
            {data.description && (
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>Descrição do Evento</span>
                </h4>
                <p className="text-sm text-gray-600">{data.description}</p>
              </div>
            )}

            {/* Serviços e Contatos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Serviços Internos</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Decoração:</span>
                    <span className={data.decoracaoInterna ? 'text-emerald-600 font-medium' : 'text-gray-400'}>
                      {data.decoracaoInterna ? '✓ Sim' : '✗ Não'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Catering:</span>
                    <span className={data.cateringInterno ? 'text-emerald-600 font-medium' : 'text-gray-400'}>
                      {data.cateringInterno ? '✓ Sim' : '✗ Não'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">DJ:</span>
                    <span className={data.djInterno ? 'text-emerald-600 font-medium' : 'text-gray-400'}>
                      {data.djInterno ? '✓ Sim' : '✗ Não'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Serviços Externos</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Decoração:</span>
                    <span className={data.decoracaoExterna ? 'text-emerald-600 font-medium' : 'text-gray-400'}>
                      {data.decoracaoExterna ? '✓ Sim' : '✗ Não'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Catering:</span>
                    <span className={data.cateringExterno ? 'text-emerald-600 font-medium' : 'text-gray-400'}>
                      {data.cateringExterno ? '✓ Sim' : '✗ Não'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">DJ:</span>
                    <span className={data.djExterno ? 'text-emerald-600 font-medium' : 'text-gray-400'}>
                      {data.djExterno ? '✓ Sim' : '✗ Não'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 text-sm">Contatos</h4>
                <div className="space-y-2 text-xs">
                  {data.contactoDecoradora && (
                    <div>
                      <span className="text-gray-500">Decoração:</span>
                      <p className="text-gray-700 font-medium">{data.contactoDecoradora}</p>
                    </div>
                  )}
                  {data.contactoCatering && (
                    <div>
                      <span className="text-gray-500">Catering:</span>
                      <p className="text-gray-700 font-medium">{data.contactoCatering}</p>
                    </div>
                  )}
                  {data.contactoDJ && (
                    <div>
                      <span className="text-gray-500">DJ:</span>
                      <p className="text-gray-700 font-medium">{data.contactoDJ}</p>
                    </div>
                  )}
                  {!data.contactoDecoradora && !data.contactoCatering && !data.contactoDJ && (
                    <p className="text-gray-400">Sem contatos registrados</p>
                  )}
                </div>
              </div>
            </div>

            {/* Produção */}
            {data.comProducao && (
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>Informações de Produção</span>
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Dias de Produção</p>
                    <p className="font-bold text-gray-900">{data.diasProducao} dias</p>
                  </div>
                  {data.dataInicioProducao && (
                    <div>
                      <p className="text-gray-500">Início da Produção</p>
                      <p className="font-bold text-gray-900">
                        {new Date(data.dataInicioProducao).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Outras Informações */}
            {data.outrasInformacoes && (
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>Outras Informações</span>
                </h4>
                <p className="text-sm text-gray-600">{data.outrasInformacoes}</p>
              </div>
            )}

            {/* Equipamentos do Espaço */}
            {espaco?.equipamentos && espaco.equipamentos.length > 0 && (
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>Equipamentos Disponíveis</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {espaco.equipamentos.map((eq, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-700">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'financeiro':
        return (
          <div className="space-y-6">
            {/* Resumo Financeiro */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Resumo Financeiro</span>
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Total</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(data.valor)} AOA</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Pago</p>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(data.totalPago)} AOA</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Pendente</p>
                  <p className="text-lg font-bold text-amber-600">{formatCurrency(data.saldoPendente)} AOA</p>
                </div>
              </div>
            </div>

            {/* Histórico de Pagamentos */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <span>Histórico de Pagamentos ({pagamentos.length})</span>
              </h4>
              
              {pagamentos.length > 0 ? (
                <div className="space-y-2 mb-4">
                  {pagamentos.map((pag) => (
                    <div key={pag._id} className="flex justify-between items-center bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {new Date(pag.dataPagamento).toLocaleDateString('pt-PT')}
                        </p>
                        <p className="text-xs text-gray-500">{pag.formaPagamento || 'N/A'}</p>
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
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Nenhum pagamento registrado</p>
              )}

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Total</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(data.valor)} AOA</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Pago</p>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(data.totalPago)} AOA</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Pendente</p>
                  <p className="text-lg font-bold text-amber-600">{formatCurrency(data.saldoPendente)} AOA</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'caucao':
        return (
          <div className="space-y-6">
            {caucao ? (
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <span>Informações da Caução</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(caucao.valorCaucao)} AOA</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Recebido em: {new Date(caucao.dataRecebimento).toLocaleDateString('pt-PT')}
                      </p>
                      <p className="text-xs text-gray-500">
                        Forma de Pagamento: {caucao.formaPagamento || 'N/A'}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${getCaucaoColor(caucao.status)}`}>
                        {caucao.status}
                      </span>
                      <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${getCaucaoColor(caucao.estadoCaucao)}`}>
                        {caucao.estadoCaucao}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Saldo Disponível</p>
                      <p className="text-lg font-bold text-purple-600">{formatCurrency(caucao.saldoDisponivel)} AOA</p>
                    </div>
                    {caucao.valorRetido && caucao.valorRetido > 0 && (
                      <div>
                        <p className="text-xs text-gray-500">Valor Retido</p>
                        <p className="text-lg font-bold text-amber-600">{formatCurrency(caucao.valorRetido)} AOA</p>
                      </div>
                    )}
                  </div>

                  {caucao.observacoes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Observações:</p>
                      <p className="text-sm text-gray-700">{caucao.observacoes}</p>
                    </div>
                  )}

                  {caucao.prejuizos && caucao.prejuizos.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-semibold text-gray-900 mb-2">Prejuízos Registrados:</p>
                      <div className="space-y-2">
                        {caucao.prejuizos.map((prej, index) => (
                          <div key={index} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <div className="flex justify-between items-start mb-1">
                              <p className="text-sm font-medium text-gray-900">{prej.descricao}</p>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                prej.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-700' :
                                prej.status === 'Rejeitado' ? 'bg-rose-100 text-rose-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {prej.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">
                              Valor: {formatCurrency(prej.valorEstimado)} AOA
                            </p>
                            <p className="text-xs text-gray-500">
                              Data: {new Date(prej.dataOcorrencia).toLocaleDateString('pt-PT')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span>Informações da Caução</span>
                </h4>
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhuma caução registrada para esta reserva
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp flex flex-col">
        {/* Header com Gradiente */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="relative flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-1">Detalhes da Reserva</h2>
              <p className="text-purple-100 text-sm">Ref: {data.ref}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 px-6 py-4 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-t-lg border-b-2 transition-all text-sm font-medium ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 bg-purple-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {renderTabContent()}
        </div>

        {/* Footer Buttons */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white rounded-xl font-semibold transition-all"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}