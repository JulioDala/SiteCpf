'use client';
import React from 'react';
import { X, Calendar, Clock, MapPin, Users, FileText, CreditCard, Shield, Dumbbell } from 'lucide-react';

interface ModalProps {
  data: any;
  open: boolean;
  onClose: () => void;
}

export default function ModalDetalheDesporto({ data, open, onClose }: ModalProps) {
  if (!open) return null;

  const getStatusColor = (status:string) => {
    const colors: Record<string,string> = {
      confirmada: 'bg-emerald-500/10 text-emerald-700 border-emerald-300/50 backdrop-blur-sm',
      pendente: 'bg-amber-500/10 text-amber-700 border-amber-300/50 backdrop-blur-sm',
      cancelada: 'bg-rose-500/10 text-rose-700 border-rose-300/50 backdrop-blur-sm',
      pago: 'bg-emerald-500/10 text-emerald-700 border-emerald-300/50 backdrop-blur-sm'
    };
    return colors[status] || 'bg-gray-500/10 text-gray-700 border-gray-300/50 backdrop-blur-sm';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
        {/* Header com Gradiente */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
          <div className="relative flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-1">Atividade Desportiva</h2>
              <p className="text-emerald-100 text-sm">{data.nomeEquipe}</p>
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
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-5 border border-emerald-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Dumbbell className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{data.tipo}</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{data.data}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{data.horarioInicio} - {data.horarioFim}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>Campo: {data.campo}</span>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Status</h4>
              <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border shadow-sm ${getStatusColor(data.status)}`}>
                {data.status.toUpperCase()}
              </span>
              <p className="text-xs text-gray-500 mt-3">Situação: {data.situacao}</p>
            </div>
          </div>
          {/* Informações da Equipe */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Informações da Equipe</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div>
                  <p className="text-gray-500 text-xs">Responsável</p>
                  <p className="text-gray-900 font-medium">{data.nomeResponsavel}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Contato</p>
                  <p className="text-gray-900 font-medium">{data.contato}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Email</p>
                  <p className="text-gray-900 font-medium">{data.email}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">BI</p>
                  <p className="text-gray-900 font-medium">{data.bi}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-gray-500 text-xs">Morada</p>
                  <p className="text-gray-900 font-medium">{data.morada}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Dias da Semana</p>
                  <p className="text-gray-900 font-medium">{data.diasSemana?.join(', ')}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Tipo de Atividade</p>
                  <p className="text-gray-900 font-medium">{data.tipoAtividade}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Cor de Identificação</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300" style={{backgroundColor: data.corIdentificacao}}></div>
                    <p className="text-gray-900 font-medium">{data.corIdentificacao}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Pagamentos */}
          <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl p-5 border border-emerald-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>Pagamentos</span>
            </h4>
            <div className="space-y-2 mb-4">
              {data.pagamentos?.map((pag:any) => (
                <div key={pag.id} className="flex justify-between items-center bg-white rounded-lg p-3 border border-gray-200">
                  <span className="text-sm font-medium text-gray-700">{pag.dataVencimento} • {pag.valor.toLocaleString()} AOA</span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(pag.status)}`}>
                    {pag.status}
                  </span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-emerald-200">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Total</p>
                <p className="text-lg font-bold text-gray-900">{data.valorPagamento?.toLocaleString()} AOA</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Pago</p>
                <p className="text-lg font-bold text-emerald-600">{data.valorPago?.toLocaleString()} AOA</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Pendente</p>
                <p className="text-lg font-bold text-amber-600">{data.valorPendente?.toLocaleString()} AOA</p>
              </div>
            </div>
          </div>
          {/* Caução */}
          <div className="bg-gradient-to-br from-cyan-50 to-white rounded-xl p-5 border border-cyan-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-cyan-600" />
              <span>Caução</span>
            </h4>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{data.caucao?.valor.toLocaleString()} AOA</p>
                {data.caucao?.dataPagamento && (
                  <p className="text-xs text-gray-500 mt-1">Pago em: {data.caucao.dataPagamento}</p>
                )}
              </div>
              <span className={`px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusColor(data.caucao?.status)}`}>
                {data.caucao?.status.toUpperCase()}
              </span>
            </div>
          </div>
          {/* Botão Fechar */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}