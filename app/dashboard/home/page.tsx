'use client';
import React, { JSX, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Dumbbell, Clock, CheckCircle, AlertCircle, XCircle, Plus, User, Bell, LogOut, FileText, TrendingUp, Award, Activity, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import ModalDetalheGinasio from '@/components/layout/modal-detalhe-ginasio';
import ModalDetalheDesporto from '@/components/layout/modal-detalho-desporto';
import ModalDetalheReserva from '@/components/layout/modal-detalhe-reserva';
import { desportoSessions, gymSessions } from "@/storage/mock";//mock estatico

import { useClienteReservasStore, normalizarReserva, ReservaCompleta } from '@/storage/cliente-storage';
import { useAuthStore } from '@/storage/atuh-storage';
import FormCreairReserva from '@/components/layout/modal-criar-reserva';
import { useBackendReservaStore } from '@/storage/reserva-store';

export default function ClientPortalHome() {
  const router = useRouter();
  const { userLogin, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [showModal, setShowModal] = useState({ type: '', item: null as any });

  // ✅ Store de reservas
  const {
    clienteCompleto,
    reservasFuturas,
    loading,
    error,
    getClienteCompletoPopulate,
    getClienteComReservasFuturas,
    clearError
  } = useClienteReservasStore();

  const {loading : loadingReserva}=useBackendReservaStore();

  const clientName = userLogin?.cliente.nome || "Jose da Costa Quinanga";
  const numeroCliente = userLogin?.cliente.numeroCliente || "";

  // ✅ Carregar dados do cliente ao montar componente
  useEffect(() => {
    if (numeroCliente) {

      getClienteCompletoPopulate(numeroCliente);
      setTimeout(function () {
        console.log("🔵 Carregando dados do cliente:", clienteCompleto);
      }, 1000)

      getClienteComReservasFuturas(numeroCliente);
    }
  }, [numeroCliente,loadingReserva]);

  // ✅ Processar reservas normalizadas
  const reservasNormalizadas: ReservaCompleta[] = React.useMemo(() => {
    if (!clienteCompleto?.reservas) return [];
    return clienteCompleto.reservas.map(normalizarReserva);
  }, [clienteCompleto]);

  const reservasFuturasNormalizadas: ReservaCompleta[] = React.useMemo(() => {
    if (!reservasFuturas?.reservasFuturas) return [];
    return reservasFuturas.reservasFuturas.map(normalizarReserva);
  }, [reservasFuturas]);

  // ✅ Calcular estatísticas dinâmicas
  const stats = React.useMemo(() => {
    const reservasAtivas = reservasFuturasNormalizadas.filter(
      r => r.status === 'CONFIRMADO' || r.status === 'PENDENTE'
    ).length;

    const proximaReserva = reservasFuturasNormalizadas
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())[0];

    const proximaReservaTexto = proximaReserva
      ? new Date(proximaReserva.data).toLocaleDateString('pt-PT', {
        weekday: 'long',
        day: 'numeric',
        month: 'short'
      })
      : "Sem reservas";

    return {
      reservasAtivas,
      horasGinasio: 12, // TODO: Calcular dinamicamente quando houver endpoint
      proximaReserva: proximaReservaTexto
    };
  }, [reservasFuturasNormalizadas]);

  // Pagamento do Ginásio (sem caução, pagamento único)
  const gymPagamento = {
    total: 5000,
    pago: true,
    dataPagamento: "01 Out 2025",
    descricao: "Taxa anual de ginásio (sem caução)"
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      CONFIRMADO: 'bg-emerald-500/10 text-emerald-700 border-emerald-300/50 backdrop-blur-sm shadow-sm',
      PENDENTE: 'bg-amber-500/10 text-amber-700 border-amber-300/50 backdrop-blur-sm shadow-sm',
      CANCELADO: 'bg-rose-500/10 text-rose-700 border-rose-300/50 backdrop-blur-sm shadow-sm',
      CONCLUIDO: 'bg-blue-500/10 text-blue-700 border-blue-300/50 backdrop-blur-sm shadow-sm',
      PAGO: 'bg-emerald-500/10 text-emerald-700 border-emerald-300/50 backdrop-blur-sm shadow-sm',
      PARCIALMENTE_PAGO: 'bg-amber-500/10 text-amber-700 border-amber-300/50 backdrop-blur-sm shadow-sm',
      VENCIDO: 'bg-rose-500/10 text-rose-700 border-rose-300/50 backdrop-blur-sm shadow-sm',
    };
    return colors[status] || 'bg-gray-500/10 text-gray-700 border-gray-300/50 backdrop-blur-sm shadow-sm';
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      CONFIRMADO: <CheckCircle className="w-3.5 h-3.5" />,
      PENDENTE: <AlertCircle className="w-3.5 h-3.5" />,
      CANCELADO: <XCircle className="w-3.5 h-3.5" />,
      CONCLUIDO: <CheckCircle className="w-3.5 h-3.5" />,
      PAGO: <CheckCircle className="w-3.5 h-3.5" />,
      PARCIALMENTE_PAGO: <AlertCircle className="w-3.5 h-3.5" />,
      VENCIDO: <XCircle className="w-3.5 h-3.5" />,
    };
    return icons[status] || <Clock className="w-3.5 h-3.5" />;
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

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // ✅ Formatar resumo de pagamentos
  const formatPagamentosResumo = (reserva: ReservaCompleta) => {
    const pagamentos = reserva.pagamentosDetalhes || [];
    const paga = pagamentos.filter(p => p.status === 'pago' || p.status === 'PAGO').length;
    const valorPago = reserva.totalPago || 0;
    return `${paga}/${pagamentos.length} parcelas • ${valorPago.toLocaleString()} AOA`;
  };

  // ✅ Renderizar lista de pagamentos
  const renderPagamentosList = (reserva: ReservaCompleta) => {
    const pagamentos = reserva.pagamentosDetalhes || [];

    return (
      <div className="mt-2 space-y-1">
        {pagamentos.map(pag => (
          <div key={pag._id} className="flex justify-between text-xs">
            <span>
              {new Date(pag.dataPagamento).toLocaleDateString('pt-PT')} - {pag.valorPago} AOA
            </span>
            <Badge
              variant="secondary"
              className={`rounded-full px-2 py-0.5 ${pag.status === 'pago' || pag.status === 'PAGO'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
            >
              {pag.status}
            </Badge>
          </div>
        ))}
      </div>
    );
  };
  function handleReserva(data: any) {
    console.log(data);
  }
  // ✅ Renderizar informações de caução
  const renderCaucaoInfo = (reserva: ReservaCompleta) => {
    const caucao = reserva.caucoes?.[0]; // Pegar primeira caução
    if (!caucao) return null;

    return (
      <div className="mt-1 flex items-center space-x-1 text-xs">
        <span className="font-medium">Caução:</span>
        <span>{caucao.valorCaucao} AOA</span>
        <Badge
          variant="secondary"
          className={`rounded-full px-2 py-0.5 ${getCaucaoColor(caucao.status)} border border-gray-200`}
        >
          {caucao.status}
        </Badge>
        {caucao.dataRecebimento && (
          <span className="text-gray-500">
            ({new Date(caucao.dataRecebimento).toLocaleDateString('pt-PT')})
          </span>
        )}
      </div>
    );
  };

  const openModal = (type: string, item: any) => {
    setShowModal({ type, item });
  };

  const closeModal = () => {
    setShowModal({ type: '', item: null });
  };

  // ✅ Renderizar estado de carregamento
  if (loading) {
    return (
      <div className="min-h-screen bg-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Carregando suas reservas...</p>
        </div>
      </div>
    );
  }

  // ✅ Renderizar erro
  if (error) {
    return (
      <div className="min-h-screen bg-cyan-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-rose-200 bg-white">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-rose-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Erro ao Carregar Dados</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button
              onClick={() => {
                clearError();
                if (numeroCliente) {
                  getClienteCompletoPopulate(numeroCliente);
                  getClienteComReservasFuturas(numeroCliente);
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <h1 className="text-xl font-bold text-gray-900">Centro Cultural Paz Flor</h1>
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
                  <p className="text-xs text-gray-500">
                    {clienteCompleto?.status === 'ATIVO' ? 'Membro Ativo' : clienteCompleto?.status || 'Membro'}
                  </p>
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

      {/* Main Content */}
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

        {/* Stats Cards - Dados Dinâmicos */}
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
                <p className="text-xs text-cyan-600 font-medium">
                  {reservasFuturasNormalizadas.length > 0 ? 'Em breve' : 'Nenhuma reserva'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
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
                      <Button
                        size="lg"
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
                        onClick={() => {
                          setShowModal({ type: 'RegistarReserva', item: null })  // ✅ CORRETO
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nova Reserva</span>
                      </Button>

                      <Button
                        size="lg"
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
                        onClick={() => {
                          setShowModal({ type: 'RegistarReserva', item: null })  // ✅ CORRETO
                        }}
                      >
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
                    {/* Próximas Reservas - DINÂMICO */}
                    <Card className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden rounded-xl bg-gradient-to-br from-purple-50 to-white border border-purple-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                          <Calendar className="w-5 h-5 text-purple-600" />
                          <span>Próximas Reservas</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {reservasFuturasNormalizadas.slice(0, 2).map(res => (
                            <div key={res._id} className="group border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden rounded-lg bg-white p-4 border border-gray-200">
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-medium text-gray-900">
                                  {res.espaco?.nome || res.tipoEvento?.nome || 'Reserva'}
                                </p>
                                <Badge className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(res.status)}`}>
                                  {getStatusIcon(res.status)}
                                  <span className="ml-1">{res.status}</span>
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {new Date(res.data).toLocaleDateString('pt-PT')} às {res.horaInicio}
                              </p>
                              <p className="text-xs text-purple-600 mt-1">{formatPagamentosResumo(res)}</p>
                              {renderCaucaoInfo(res)}
                            </div>
                          ))}
                          {reservasFuturasNormalizadas.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">Nenhuma reserva futura</p>
                          )}
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
                    <h3 className="text-2xl font-bold text-gray-900">
                      Reservas de Espaços ({reservasNormalizadas.length})
                    </h3>
                     <Button
                        size="lg"
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
                        onClick={() => {
                          setShowModal({ type: 'RegistarReserva', item: null })  // ✅ CORRETO
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nova Reserva</span>
                      </Button>
                  </div>

                  {reservasNormalizadas.length === 0 ? (
                    <Card className="border-0 shadow-md rounded-xl bg-white border border-gray-200">
                      <CardContent className="p-12 text-center">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhuma Reserva</h3>
                        <p className="text-gray-600">Você ainda não tem reservas registradas.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    reservasNormalizadas.map(res => (
                      <Card key={res._id} className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden rounded-xl bg-white border border-gray-200 hover:border-purple-300">
                        <CardContent className="p-6 space-y-3">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                                {res.espaco?.nome || 'Espaço'}
                              </CardTitle>
                              <p className="text-sm text-gray-600">
                                {new Date(res.data).toLocaleDateString('pt-PT')} às {res.horaInicio} - {res.horaTermino}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Ref: {res.ref} • {res.participants} participantes
                              </p>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <Badge className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(res.status)}`}>
                                {getStatusIcon(res.status)}
                                <span className="ml-1">{res.status}</span>
                              </Badge>
                              <Badge className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(res.paymentStatus)}`}>
                                {getStatusIcon(res.paymentStatus)}
                                <span className="ml-1">{res.paymentStatus}</span>
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Total</p>
                              <p className="text-sm font-bold text-gray-900">{res.valor.toLocaleString()} AOA</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Pago</p>
                              <p className="text-sm font-bold text-emerald-600">{res.totalPago.toLocaleString()} AOA</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Pendente</p>
                              <p className="text-sm font-bold text-amber-600">{res.saldoPendente.toLocaleString()} AOA</p>
                            </div>
                          </div>

                          {renderCaucaoInfo(res)}

                          <div className="flex space-x-3">
                            <Button
                              variant="outline"
                              className="flex-1 px-4 py-2.5 border-2 border-purple-300 text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition-colors text-sm"
                              onClick={() => openModal('reserva', res)}
                            >
                              Ver Detalhes
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
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

                  {/* Seção de Pagamento do Ginásio */}
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
      {showModal.type === 'RegistarReserva' && (
        <FormCreairReserva
          handleReserva={handleReserva}
          onClose={closeModal}
        />
      )}
    </div>
  );
}