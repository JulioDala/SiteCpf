// modal-detalhe-ginasio.tsx
'use client';
import React from 'react';
import { X, Calendar, Clock, TrendingUp, FileText, CreditCard, Award } from 'lucide-react';

interface ModalProps {
    data: any;
    open: boolean;
    onClose: () => void;
}

export default function ModalDetalheGinasio({ data, open, onClose }: ModalProps) {
    if (!open) return null;

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            presente: 'bg-emerald-500/10 text-emerald-700 border-emerald-300/50 backdrop-blur-sm',
            ausente: 'bg-rose-500/10 text-rose-700 border-rose-300/50 backdrop-blur-sm',
            justificado: 'bg-amber-500/10 text-amber-700 border-amber-300/50 backdrop-blur-sm',
            pago: 'bg-emerald-500/10 text-emerald-700 border-emerald-300/50 backdrop-blur-sm',
            pendente: 'bg-amber-500/10 text-amber-700 border-amber-300/50 backdrop-blur-sm'
        };
        return colors[status] || 'bg-gray-500/10 text-gray-700 border-gray-300/50 backdrop-blur-sm';
    };
    ;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
                {/* Header com Gradiente */}
                <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                    <div className="relative flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Detalhes da Sessão de Ginásio</h2>
                            <p className="text-cyan-100 text-sm">{data.tipo}</p>
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
                            <div className="bg-gradient-to-br from-cyan-50 to-white rounded-xl p-5 border border-cyan-200">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-cyan-600" />
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
                                        <span>Entrada: {data.horaEntrada}</span>
                                    </div>
                                    {data.horaSaida && (
                                        <div className="flex items-center space-x-2 text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            <span>Saída: {data.horaSaida}</span>
                                        </div>
                                    )}
                                    <div className="pt-2 border-t border-cyan-200 mt-3">
                                        <p className="text-2xl font-bold text-cyan-600">{data.duracao}</p>
                                        <p className="text-xs text-gray-500">Duração total</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-200">
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                                    <Award className="w-4 h-4 text-cyan-600" />
                                    <span>Status</span>
                                </h4>
                                <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border shadow-sm ${getStatusColor(data.status)}`}>
                                    {data.status.toUpperCase()}
                                </span>
                                <p className="text-xs text-gray-500 mt-3">
                                    Atividade: {data.actividade || 'Não especificada'}
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Observações */}
                    <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-200">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            <span>Observações</span>
                        </h4>
                        <p className="text-sm text-gray-600">{data.observacoes || 'Sem observações registradas'}</p>
                    </div>
                    {/* Consumos */}
                    {data.consumos && data.consumos.length > 0 && (
                        <div className="bg-gradient-to-br from-amber-50 to-white rounded-xl p-5 border border-amber-200">
                            <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                <CreditCard className="w-5 h-5 text-amber-600" />
                                <span>Consumos</span>
                            </h4>
                            <div className="space-y-3">
                                {data.consumos.map((consumo: any) => (
                                    <div key={consumo.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-semibold text-gray-900">{consumo.produto}</p>
                                                <p className="text-xs text-gray-500">Quantidade: {consumo.quantidade}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(consumo.pago ? 'pago' : 'pendente')}`}>
                                                {consumo.pago ? 'Pago' : 'Pendente'}
                                            </span>
                                        </div>
                                        <div className="pt-2 border-t border-gray-100">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Total</span>
                                                <span className="text-lg font-bold text-gray-900">{consumo.valorTotal.toLocaleString()} AOA</span>
                                            </div>
                                            {consumo.metodoPagamento && (
                                                <p className="text-xs text-gray-500 mt-1">Método: {consumo.metodoPagamento}</p>
                                            )}
                                            {consumo.observacoes && (
                                                <p className="text-xs text-gray-500 mt-1">Obs: {consumo.observacoes}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {/* Botão Fechar */}
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}