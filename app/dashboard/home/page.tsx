'use client';
import React, { JSX, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Dumbbell, Clock, CheckCircle, AlertCircle, XCircle, Plus, User, Bell, LogOut, FileText, TrendingUp, Award, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ModalDetalheGinasio from '@/components/layout/modal-detalhe-ginasio';
import ModalDetalheDesporto from '@/components/layout/modal-detalho-desporto';
import ModalDetalheReserva from '@/components/layout/modal-detalhe-reserva';
import { reservations, desportoSessions, gymSessions } from "@/storage/mock";

export default function ClientPortalHome() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState({ type: '', item: null as any });

  // Dados simulados - Ajustados para data atual (11 Nov 2025)
  const clientName = user?.nome || "Jose da Costa Quinanga";
  const stats = {
    reservasAtivas: 2,
    horasGinasio: 12,
    proximaReserva: "Sábado, 15 Nov"
  };



  // Pagamento do Ginásio (sem caução, pagamento único)
  const gymPagamento = {
    total: 5000,
    pago: true,
    dataPagamento: "01 Out 2025",
    descricao: "Taxa anual de ginásio (sem caução)"
  };

  const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    confirmada: 'bg-emerald-500/10 text-emerald-700 border-emerald-300/50 backdrop-blur-sm shadow-sm',
    pendente:   'bg-amber-500/10 text-amber-700 border-amber-300/50 backdrop-blur-sm shadow-sm',
    cancelada:  'bg-rose-500/10 text-rose-700 border-rose-300/50 backdrop-blur-sm shadow-sm',
    devolvido:  'bg-blue-500/10 text-blue-700 border-blue-300/50 backdrop-blur-sm shadow-sm'
  };
  return colors[status] || 'bg-gray-500/10 text-gray-700 border-gray-300/50 backdrop-blur-sm shadow-sm';
};
const getStatusIcon = (status: string) => {
  const icons: Record<string, JSX.Element> = {
    confirmada: <CheckCircle className="w-3.5 h-3.5" />,
    pendente: <AlertCircle className="w-3.5 h-3.5" />,
    cancelada: <XCircle className="w-3.5 h-3.5" />,
    devolvido: <FileText className="w-3.5 h-3.5" />,
  };
  return icons[status] || <Clock className="w-3.5 h-3.5" />;
};

const getCaucaoColor = (status: string) => {
  const colors: Record<string, string> = {
    pago: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pendente: 'bg-amber-50 text-amber-700 border-amber-200',
    devolvido: 'bg-blue-50 text-blue-700 border-blue-200'
  };
  return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
};

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const formatPagamentosResumo = (pagamentos: any[], total: number) => {
    const paga = pagamentos.filter(p => p.status === 'pago').length;
    const valorPago = pagamentos.filter(p => p.status === 'pago').reduce((sum, p) => sum + p.valor, 0);
    return `${paga}/${pagamentos.length} parcelas • ${valorPago.toLocaleString()} AOA`;
  };

  const renderPagamentosList = (pagamentos: any[]) => (
    <div className="mt-2 space-y-1">
      {pagamentos.map(pag => (
        <div key={pag.id} className="flex justify-between text-xs">
          <span>{pag.dataVencimento} - {pag.valor} AOA</span>
          <Badge variant="secondary" className={`rounded-full px-2 py-0.5 ${pag.status === 'pago' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            {pag.status}
          </Badge>
        </div>
      ))}
    </div>
  );

  const renderCaucaoInfo = (caucao: any) => (
    <div className="mt-1 flex items-center space-x-1 text-xs">
      <span className="font-medium">Caução:</span>
      <span>{caucao.valor} AOA</span>
      <Badge variant="secondary" className={`rounded-full px-2 py-0.5 ${getCaucaoColor(caucao.status)} border border-gray-200`}>
        {caucao.status}
      </Badge>
      {caucao.dataPagamento && <span className="text-gray-500">({caucao.dataPagamento})</span>}
    </div>
  );

  const openModal = (type: string, item: any) => {
    setShowModal({ type, item });
  };

  const closeModal = () => {
    setShowModal({ type: '', item: null });
  };

  return (
    <div className="min-h-screen bg-cyan-50 text-gray-900">
      {/* Header - Padronizado com landing page */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-sm z-50 border-b border-purple-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src="./../images/ico-paz-flor.png" alt="Logo CPF" className="w-full h-full" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Centro Polivalente</h1>
                <p className="text-xs text-purple-600">Portal do Cliente</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                <Bell className="w-5 h-5 text-purple-600" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{clientName}</p>
                  <p className="text-xs text-gray-500">Membro Ativo</p>
                </div>
                <Button variant="ghost" size="icon" className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full">
                  <User className="w-5 h-5 text-gray-600" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="rounded-full hover:bg-gray-100 text-red-600"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Ajustado para pt-20 devido ao header fixo deixa a margem top!! */}
      <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-4">
        {/* Welcome Section */}
        <div className="mb-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Olá, {clientName.split(' ')[0]}! 
          </h2>
          <p className="text-lg text-gray-600">
            Acompanhe suas reservas de espaços, atividades desportivas e ginásio de forma independente, com detalhes de pagamentos e caução.
          </p>
        </div>

        {/* Stats Cards - Padronizado com cores purple */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl bg-white border border-purple-100 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-sm text-gray-600 mb-1 font-medium">Reservas Ativas</p>
              <p className="text-4xl font-bold text-gray-900">{stats.reservasAtivas}</p>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-purple-600 font-medium">↗ Gerenciar reservas</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl bg-white border border-emerald-100 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Dumbbell className="w-7 h-7 text-white" />
                </div>
                <Activity className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-sm text-gray-600 mb-1 font-medium">Horas no Ginásio</p>
              <p className="text-4xl font-bold text-gray-900">{stats.horasGinasio}<span className="text-2xl text-gray-500">h</span></p>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-emerald-600 font-medium">60% da meta mensal</p>
              </div>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl bg-white border border-cyan-100 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <Award className="w-5 h-5 text-amber-500" />
              </div>
              <p className="text-sm text-gray-600 mb-1 font-medium">Próxima Reserva</p>
              <p className="text-xl font-bold text-gray-900">{stats.proximaReserva}</p>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-cyan-600 font-medium">Em 4 dias</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation - Módulos independentes: Reservas, Desporto, Ginásio */}
        <Card className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl bg-white border border-purple-100 mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex border-b border-gray-200 bg-gray-50">
              {[
                { value: 'overview', label: 'Visão Geral', icon: Activity },
                { value: 'reservas', label: 'Reservas', icon: Calendar },
                { value: 'desporto', label: 'Desporto', icon: Dumbbell },
                { value: 'ginasio', label: 'Ginásio', icon: TrendingUp }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.value} value={tab.value} asChild>
                    <button
                      onClick={() => setActiveTab(tab.value)}
                      className={`flex-1 px-6 py-4 text-sm font-semibold transition-all relative ${activeTab === tab.value
                          ? 'text-purple-600 bg-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </div>
                      {activeTab === tab.value && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-cyan-600"></div>
                      )}
                    </button>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            <TabsContent value={activeTab} className="p-8">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900">Atividades Recentes</h3>
                    <div className="flex space-x-3">
                      <Button size="lg" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>Nova Reserva</span>
                      </Button>
                      <Button size="lg" className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2">
                        <Plus className="w-4 h-4" />
                        <span>Nova Atividade Desportiva</span>
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Próximas Reservas */}
                    <Card className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                          <Calendar className="w-5 h-5 text-purple-600" />
                          <span>Próximas Reservas</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {reservations.slice(0, 1).map(res => (
                            <div key={res.id} className="group border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden rounded-lg bg-white p-4 border border-gray-200">
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-medium text-gray-900">{res.tipo}</p>
                                <Badge className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(res.status)}`}>
                                  {getStatusIcon(res.status)}
                                  <span className="ml-1">{res.status}</span>
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{res.data} às {res.hora}</p>
                              <p className="text-xs text-purple-600 mt-1">{formatPagamentosResumo(res.pagamentos, res.total)}</p>
                              {renderCaucaoInfo(res.caucao)}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Desporto Recente */}
                    <Card className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                          <Dumbbell className="w-5 h-5 text-emerald-600" />
                          <span>Desporto Recente</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {desportoSessions.slice(0, 1).map(session => (
                            <div key={session.id} className="group border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden rounded-lg bg-white p-4 border border-gray-200">
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-medium text-gray-900">{session.tipo}</p>
                                <Badge className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(session.status)}`}>
                                  {getStatusIcon(session.status)}
                                  <span className="ml-1">{session.status}</span>
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">{session.data} às {session.hora} - {session.instrutor}</p>
                              <p className="text-xs text-purple-600 mt-1">{formatPagamentosResumo(session.pagamentos, session.total)}</p>
                              {renderCaucaoInfo(session.caucao)}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Histórico Ginásio */}
                    <Card className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden rounded-xl bg-gradient-to-br from-cyan-50 to-white border border-cyan-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5 text-cyan-600" />
                          <span>Histórico do Ginásio</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {gymSessions.slice(0, 1).map(session => (
                            <div key={session.id} className="group border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden rounded-lg bg-white p-4 border border-gray-200">
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-medium text-gray-900">{session.tipo}</p>
                                <span className="text-xs text-gray-500">{session.duracao}</span>
                              </div>
                              <p className="text-sm text-gray-600">{session.data}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'reservas' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900">Reservas de Espaços</h3>
                    <Button size="lg" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Nova Reserva</span>
                    </Button>
                  </div>

                  {reservations.map(res => (
                    <Card key={res.id} className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden rounded-xl bg-white border border-gray-200 hover:border-purple-300">
                      <CardContent className="p-6 space-y-3">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <CardTitle className="text-xl font-bold text-gray-900 mb-2">{res.tipo}</CardTitle>
                            <p className="text-sm text-gray-600">{res.data} às {res.hora}</p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(res.status)}`}>
                              {getStatusIcon(res.status)}
                              <span className="ml-1">{res.status.toUpperCase()}</span>
                            </Badge>
                            <span className="text-xs text-purple-600 font-medium">{formatPagamentosResumo(res.pagamentos, res.total)}</span>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <Button
                            variant="outline"
                            className="flex-1 px-4 py-2.5 border-2 border-purple-300 text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition-colors text-sm"
                            onClick={() => openModal('reserva', res)}
                          >
                            Ver Detalhes
                          </Button>
                          <Button variant="outline" className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">
                            Baixar Recibo
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === 'desporto' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900">Atividades Desportivas</h3>
                    <Button size="lg" className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Nova Inscrição</span>
                    </Button>
                  </div>

                  {desportoSessions.map(session => (
                    <Card key={session.id} className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden rounded-xl bg-white border border-gray-200 hover:border-emerald-300">
                      <CardContent className="p-6 space-y-3">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <CardTitle className="text-xl font-bold text-gray-900 mb-2">{session.tipo}</CardTitle>
                            <p className="text-sm text-gray-600">{session.data} às {session.hora}</p>
                            <p className="text-sm text-gray-500">Instrutor: {session.instrutor}</p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(session.status)}`}>
                              {getStatusIcon(session.status)}
                              <span className="ml-1">{session.status.toUpperCase()}</span>
                            </Badge>
                            <span className="text-xs text-emerald-600 font-medium">{formatPagamentosResumo(session.pagamentos, session.total)}</span>
                          </div>
                        </div>
                        <div className="flex space-x-3">
                          <Button
                            variant="outline"
                            className="flex-1 px-4 py-2.5 border-2 border-emerald-300 text-emerald-700 rounded-lg font-medium hover:bg-emerald-50 transition-colors text-sm"
                            onClick={() => openModal('desporto', session)}
                          >
                            Ver Detalhes
                          </Button>
                          {session.status === 'pendente' && (
                            <Button className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-lg transition-all text-sm font-medium text-white shadow-lg hover:shadow-xl">
                              Confirmar Pagamento
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {activeTab === 'ginasio' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900">Histórico do Ginásio</h3>
                    <Button size="lg" className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Registrar Sessão</span>
                    </Button>
                  </div>

                  {gymSessions.map(session => (
                    <Card key={session.id} className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden rounded-xl bg-white border border-gray-200 hover:border-cyan-300">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-xl font-bold text-gray-900 mb-2">{session.tipo}</CardTitle>
                            <p className="text-sm text-gray-600">{session.data}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-cyan-600">{session.duracao}</p>
                            <p className="text-xs text-gray-500">duração</p>
                          </div>
                        </div>
                        <div className="flex space-x-3 mt-3">
                          <Button
                            variant="outline"
                            className="flex-1 px-4 py-2.5 border-2 border-cyan-300 text-cyan-700 rounded-lg font-medium hover:bg-cyan-50 transition-colors text-sm"
                            onClick={() => openModal('ginasio', session)}
                          >
                            Ver Detalhes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Seção de Pagamento do Ginásio - Sem caução */}
                  <Card className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-gray-900">Pagamento do Ginásio</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                      <p className="text-sm text-gray-600 mb-4">
                        Taxa anual de ginásio (pagamento único, sem caução). Status: {gymPagamento.pago ? 'Pago' : 'Pendente'}.
                      </p>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>Total: {gymPagamento.total} AOA</p>
                        <p>Data do Pagamento: {gymPagamento.dataPagamento}</p>
                        <p>Descrição: {gymPagamento.descricao}</p>
                      </div>
                      <Button variant="outline" className="px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">
                        Ver Recibo
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-gray-900">Meta Mensal</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-4">
                      <p className="text-sm text-gray-600 mb-4">Você completou 12 de 20 horas este mês</p>
                      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div className="absolute top-0 left-0 h-full w-3/5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"></div>
                      </div>
                      <p className="text-xs text-gray-500 text-right">60% concluído</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </main>

      {/* Modals */}
      {showModal.type === 'reserva' && (
        <ModalDetalheReserva
          data={showModal.item}
          open={true}
          onClose={closeModal}
        />
      )}
      {showModal.type === 'desporto' && (
        <ModalDetalheDesporto
          data={showModal.item}
          open={true}
          onClose={closeModal}
        />
      )}
      {showModal.type === 'ginasio' && (
        <ModalDetalheGinasio
          data={showModal.item}
          open={true}
          onClose={closeModal}
        />
      )}
    </div>
  );
}