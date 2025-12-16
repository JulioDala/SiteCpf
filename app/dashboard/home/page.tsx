"use client"

import React, { type JSX, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Calendar,
  Dumbbell,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  User,
  Bell,
  LogOut,
  TrendingUp,
  Activity,
  Loader2,
  LayoutGrid,
  LayoutList,
  TableIcon,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ModalDetalheGinasio from "@/components/layout/modal-detalhe-ginasio"
import ModalDetalheDesporto from "@/components/layout/modal-detalho-desporto"
import ModalDetalheReserva from "@/components/layout/modal-detalhe-reserva"
import { desportoSessions, gymSessions } from "@/storage/mock"
import { useClienteReservasStore, normalizarReserva, type ReservaCompleta } from "@/storage/cliente-storage"
import { useAuthStore } from "@/storage/atuh-storage"
import FormCreairReserva from "@/components/layout/modal-criar-reserva"
import { useBackendReservaStore } from "@/storage/reserva-store"

type ViewMode = "cards" | "table" | "list"

const STATUS_COLORS = {
  // StatusReserva
  Concluída: {
    badge: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:border-blue-800",
    icon: "text-blue-600",
    dot: "bg-blue-600",
  },
  Confirmada: {
    badge:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
    icon: "text-emerald-600",
    dot: "bg-emerald-600",
  },
  Pendente: {
    badge:
      "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800",
    icon: "text-amber-600",
    dot: "bg-amber-600",
  },
  Cancelada: {
    badge: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800",
    icon: "text-red-600",
    dot: "bg-red-600",
  },
  Processada: {
    badge:
      "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-800",
    icon: "text-purple-600",
    dot: "bg-purple-600",
  },
  Rascunho: {
    badge: "bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-950 dark:text-gray-200 dark:border-gray-800",
    icon: "text-gray-600",
    dot: "bg-gray-600",
  },
  // PaymentStatus
  Pago: {
    badge:
      "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800",
    icon: "text-emerald-600",
    dot: "bg-emerald-600",
  },
  Parcial: {
    badge: "bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-950 dark:text-cyan-200 dark:border-cyan-800",
    icon: "text-cyan-600",
    dot: "bg-cyan-600",
  },
  Vencida: {
    badge: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800",
    icon: "text-red-600",
    dot: "bg-red-600",
  },
  Reembolsado: {
    badge:
      "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950 dark:text-indigo-200 dark:border-indigo-800",
    icon: "text-indigo-600",
    dot: "bg-indigo-600",
  },
}

export default function ClientPortalHome() {
  const router = useRouter()
  const { userLogin, logout } = useAuthStore()
  const [activeTab, setActiveTab] = useState("overview")
  const [reservasViewMode, setReservasViewMode] = useState<ViewMode>("cards")
  const [showModal, setShowModal] = useState({ type: "", item: null as any })

  const {
    clienteCompleto,
    reservasFuturas,
    loading,
    error,
    getClienteCompletoPopulate,
    getClienteComReservasFuturas,
    clearError,
  } = useClienteReservasStore()

  const {loading : loadingReserva}=useBackendReservaStore();

  const clientName = userLogin?.cliente.nome || "Jose da Costa Quinanga";
  const numeroCliente = userLogin?.cliente.numeroCliente || "";

  useEffect(() => {
    if (numeroCliente) {
      getClienteCompletoPopulate(numeroCliente)
      getClienteComReservasFuturas(numeroCliente)
    }
  }, [numeroCliente])

  const reservasNormalizadas: ReservaCompleta[] = React.useMemo(() => {
    if (!clienteCompleto?.reservas) return []
    return clienteCompleto.reservas.map(normalizarReserva)
  }, [clienteCompleto])

  const reservasFuturasNormalizadas: ReservaCompleta[] = React.useMemo(() => {
    if (!reservasFuturas?.reservasFuturas) return []
    return reservasFuturas.reservasFuturas.map(normalizarReserva)
  }, [reservasFuturas])

  const stats = React.useMemo(() => {
    const reservasAtivas = reservasFuturasNormalizadas.filter(
      (r) => r.status === "Confirmada" as "CONFIRMADO" || r.status === "Pendente" as "PENDENTE",
    ).length

    const proximaReserva = reservasFuturasNormalizadas.sort(
      (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime(),
    )[0]

    const proximaReservaTexto = proximaReserva
      ? new Date(proximaReserva.data).toLocaleDateString("pt-PT", {
          weekday: "long",
          day: "numeric",
          month: "short",
        })
      : "Sem reservas"

    return {
      reservasAtivas,
      horasGinasio: 12,
      proximaReserva: proximaReservaTexto,
    }
  }, [reservasFuturasNormalizadas])

  const gymPagamento = {
    total: 5000,
    pago: true,
    dataPagamento: "01 Out 2025",
    descricao: "Taxa anual de ginásio (sem caução)",
  }

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    return STATUS_COLORS[normalizedStatus as keyof typeof STATUS_COLORS]?.badge || STATUS_COLORS["Rascunho"].badge
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      Confirmada: <CheckCircle className="w-3.5 h-3.5" />,
      Pendente: <AlertCircle className="w-3.5 h-3.5" />,
      Cancelada: <XCircle className="w-3.5 h-3.5" />,
      Concluída: <CheckCircle className="w-3.5 h-3.5" />,
      Pago: <CheckCircle className="w-3.5 h-3.5" />,
      Parcial: <AlertCircle className="w-3.5 h-3.5" />,
      Vencida: <XCircle className="w-3.5 h-3.5" />,
      Processada: <Activity className="w-3.5 h-3.5" />,
      Rascunho: <Clock className="w-3.5 h-3.5" />,
      Reembolsado: <CheckCircle className="w-3.5 h-3.5" />,
    }
    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    return icons[normalizedStatus] || <Clock className="w-3.5 h-3.5" />
  }

  const getCaucaoColor = (status: string) => {
    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
    return STATUS_COLORS[normalizedStatus as keyof typeof STATUS_COLORS]?.badge || STATUS_COLORS["Rascunho"].badge
  }

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const formatPagamentosResumo = (reserva: ReservaCompleta) => {
    const pagamentos = reserva.pagamentosDetalhes || []
    const paga = pagamentos.filter((p) => p.status === "pago" || p.status === "Pago").length
    const valorPago = reserva.totalPago || 0
    return `${paga}/${pagamentos.length} parcelas • ${valorPago.toLocaleString()} AOA`
  }

  const renderPagamentosList = (reserva: ReservaCompleta) => {
    const pagamentos = reserva.pagamentosDetalhes || []
    return (
      <div className="mt-2 space-y-1">
        {pagamentos.map((pag) => (
          <div key={pag._id} className="flex justify-between text-xs">
            <span>
              {new Date(pag.dataPagamento).toLocaleDateString("pt-PT")} - {pag.valorPago} AOA
            </span>
            <Badge
              variant="secondary"
              className={`rounded-full px-2 py-0.5 ${
                pag.status === "pago" || pag.status === "Pago"
                  ? STATUS_COLORS["Pago"].badge
                  : STATUS_COLORS["Parcial"].badge
              }`}
            >
              {pag.status}
            </Badge>
          </div>
        ))}
      </div>
    )
  }

  function handleReserva(data: any) {
    console.log(data)
  }

  const renderCaucaoInfo = (reserva: ReservaCompleta) => {
    const caucao = reserva.caucoes?.[0]
    if (!caucao) return null
    return (
      <div className="mt-2 flex items-center space-x-2 text-xs">
        <span className="font-medium text-foreground">Caução:</span>
        <span className="text-muted-foreground">{caucao.valorCaucao} AOA</span>
        <Badge variant="secondary" className={`rounded-full px-2 py-0.5 ${getCaucaoColor(caucao.status)}`}>
          {caucao.status}
        </Badge>
        {caucao.dataRecebimento && (
          <span className="text-muted-foreground">
            ({new Date(caucao.dataRecebimento).toLocaleDateString("pt-PT")})
          </span>
        )}
      </div>
    )
  }

  const openModal = (type: string, item: any) => {
    setShowModal({ type, item })
  }

  const closeModal = () => {
    setShowModal({ type: "", item: null })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Carregando suas reservas...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive shadow-lg">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">Erro ao Carregar Dados</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button
              onClick={() => {
                clearError()
                if (numeroCliente) {
                  getClienteCompletoPopulate(numeroCliente)
                  getClienteComReservasFuturas(numeroCliente)
                }
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 w-full bg-card/95 backdrop-blur-sm border-b border-border z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10">
                <img src="./../images/ico-paz-flor.png" alt="Logo CPF" className="w-full h-full rounded-lg" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Centro Cultural Paz Flor</h1>
                <p className="text-xs text-muted-foreground">Portal do Cliente</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="rounded-lg hover:bg-accent">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </Button>
              <div className="flex items-center space-x-3 pl-4 border-l border-border">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {clienteCompleto?.status === "ATIVO" ? "Membro Ativo" : clienteCompleto?.status || "Membro"}
                  </p>
                </div>
                <Button variant="ghost" size="icon" className="w-10 h-10 bg-secondary hover:bg-secondary/80 rounded-lg">
                  <User className="w-5 h-5 text-secondary-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="rounded-lg hover:bg-destructive/10 text-destructive"
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
      <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Olá, {clientName.split(" ")[0]}!</h2>
          <p className="text-muted-foreground">
            Acompanhe suas reservas de espaços, atividades desportivas e ginásio de forma independente, com detalhes de
            pagamentos e caução.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Reservas Ativas Card */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-blue-100 font-medium mb-1">Reservas Ativas</p>
                  <p className="text-3xl font-bold text-white">{stats.reservasAtivas}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="pt-3 border-t border-blue-400/30">
                <p className="text-xs text-blue-100 font-medium">Gerenciar suas reservas</p>
              </div>
            </CardContent>
          </Card>

          {/* Horas Ginásio Card */}
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-emerald-100 font-medium mb-1">Horas no Ginásio</p>
                  <p className="text-3xl font-bold text-white">
                    {stats.horasGinasio}
                    <span className="text-lg text-emerald-100">h</span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Dumbbell className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="pt-3 border-t border-emerald-400/30">
                <p className="text-xs text-emerald-100 font-medium">60% da meta mensal</p>
              </div>
            </CardContent>
          </Card>

          {/* Próxima Reserva Card */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-purple-100 font-medium mb-1">Próxima Reserva</p>
                  <p className="text-lg font-bold text-white">{stats.proximaReserva}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="pt-3 border-t border-purple-400/30">
                <p className="text-xs text-purple-100 font-medium">
                  {reservasFuturasNormalizadas.length > 0 ? "Em breve" : "Nenhuma reserva"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Navigation */}
        <Card className="border border-border shadow-md">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex border-b border-border bg-muted/30 w-full justify-start rounded-none">
              {[
                { value: "overview", label: "Visão Geral", icon: Activity },
                { value: "reservas", label: "Reservas", icon: Calendar },
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    asChild
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary px-6 py-4 text-sm font-medium transition-colors"
                  >
                    <button className="flex items-center space-x-2 text-muted-foreground data-[state=active]:text-foreground">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            <TabsContent value={activeTab} className="p-6">
              {/* OVERVIEW TAB */}
              {activeTab === "overview" && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-foreground">Atividades Recentes</h3>
                    <div className="flex space-x-3">
                      <Button
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium shadow-sm hover:shadow-md transition-all flex items-center space-x-2"
                        onClick={() => {
                          setShowModal({
                            type: "RegistarReserva",
                            item: null,
                          })
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nova Reserva</span>
                      </Button>
                      <Button
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium shadow-sm hover:shadow-md transition-all flex items-center space-x-2"
                        onClick={() => {
                          setShowModal({
                            type: "RegistarReserva",
                            item: null,
                          })
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nova Inscrição</span>
                      </Button>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Próximas Reservas */}
                    <Card className="border border-border shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-4 border-b border-border bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/30">
                        <CardTitle className="text-base font-semibold text-foreground flex items-center space-x-2">
                          <Calendar className="w-5 h-5 text-blue-600" />
                          <span>Próximas Reservas</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          {reservasFuturasNormalizadas.slice(0, 2).map((res) => (
                            <div
                              key={res._id}
                              className="border border-border rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50/30 dark:hover:bg-blue-950/30 transition-all"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-medium text-foreground text-sm">
                                  {res.espaco?.nome || res.tipoEvento?.nome || "Reserva"}
                                </p>
                                <Badge className={`text-xs ${getStatusColor(res.status)}`}>
                                  {getStatusIcon(res.status)}
                                  <span className="ml-1">{res.status}</span>
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {new Date(res.data).toLocaleDateString("pt-PT")} às {res.horaInicio}
                              </p>
                              <p className="text-xs text-primary mt-1">{formatPagamentosResumo(res)}</p>
                              {renderCaucaoInfo(res)}
                            </div>
                          ))}
                          {reservasFuturasNormalizadas.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma reserva futura</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Desporto Recente */}
                    <Card className="border border-border shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-4 border-b border-border bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/30">
                        <CardTitle className="text-base font-semibold text-foreground flex items-center space-x-2">
                          <Dumbbell className="w-5 h-5 text-emerald-600" />
                          <span>Desporto Recente</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          {desportoSessions.slice(0, 1).map((session) => (
                            <div
                              key={session.id}
                              className="border border-border rounded-lg p-4 hover:border-emerald-300 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30 transition-all"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-medium text-foreground">{session.tipo}</p>
                                <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs">
                                  {session.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {session.data} às {session.hora}
                              </p>
                              <p className="text-xs text-muted-foreground">Instrutor: {session.instrutor}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Histórico Ginásio */}
                    <Card className="border border-border shadow-md hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-4 border-b border-border bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/30">
                        <CardTitle className="text-base font-semibold text-foreground flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5 text-purple-600" />
                          <span>Histórico Ginásio</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-3">
                          {gymSessions.slice(0, 1).map((session) => (
                            <div
                              key={session.id}
                              className="border border-border rounded-lg p-4 hover:border-purple-300 hover:bg-purple-50/30 dark:hover:bg-purple-950/30 transition-all"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-medium text-foreground">{session.tipo}</p>
                                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                                  {session.duracao}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{session.data}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "reservas" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-foreground">
                      Reservas de Espaços ({reservasNormalizadas.length})
                    </h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex border border-border rounded-lg p-1 bg-muted/30">
                        <Button
                          variant={reservasViewMode === "cards" ? "default" : "ghost"}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setReservasViewMode("cards")}
                          title="Visualização em cards"
                        >
                          <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={reservasViewMode === "table" ? "default" : "ghost"}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setReservasViewMode("table")}
                          title="Visualização em tabela"
                        >
                          <TableIcon className="w-4 h-4" />
                        </Button>
                        <Button
                          variant={reservasViewMode === "list" ? "default" : "ghost"}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setReservasViewMode("list")}
                          title="Visualização em lista"
                        >
                          <LayoutList className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium shadow-sm hover:shadow-md transition-all flex items-center space-x-2"
                        onClick={() => {
                          setShowModal({
                            type: "RegistarReserva",
                            item: null,
                          })
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nova Reserva</span>
                      </Button>
                    </div>
                  </div>

                  {/* CARDS VIEW */}
                  {reservasViewMode === "cards" && (
                    <div>
                      {reservasNormalizadas.length === 0 ? (
                        <Card className="border border-border shadow-md">
                          <CardContent className="p-12 text-center">
                            <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-foreground mb-2">Nenhuma Reserva</h3>
                            <p className="text-muted-foreground">Você ainda não tem reservas registradas.</p>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {reservasNormalizadas.map((res) => (
                            <Card
                              key={res._id}
                              className="border border-border shadow-md hover:shadow-lg hover:border-primary/50 transition-all overflow-hidden"
                            >
                              <CardContent className="p-6">
                                <div className="mb-4">
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <CardTitle className="text-lg font-bold text-foreground">
                                        {res.espaco?.nome || "Espaço"}
                                      </CardTitle>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {new Date(res.data).toLocaleDateString("pt-PT")}
                                      </p>
                                    </div>
                                    <Badge className={`text-xs whitespace-nowrap ${getStatusColor(res.status)}`}>
                                      {getStatusIcon(res.status)}
                                      <span className="ml-1">{res.status}</span>
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {res.horaInicio} - {res.horaTermino}
                                  </p>
                                </div>

                                <div className="grid grid-cols-3 gap-2 p-3 bg-muted/40 rounded-lg mb-4">
                                  <div className="text-center">
                                    <p className="text-xs text-muted-foreground">Total</p>
                                    <p className="text-sm font-bold text-foreground">
                                      {res.valor.toLocaleString()} AOA
                                    </p>
                                  </div>
                                  <div className="text-center border-l border-r border-border">
                                    <p className="text-xs text-muted-foreground">Pago</p>
                                    <p className="text-sm font-bold text-emerald-600">
                                      {res.totalPago.toLocaleString()} AOA
                                    </p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-xs text-muted-foreground">Pendente</p>
                                    <p className="text-sm font-bold text-amber-600">
                                      {res.saldoPendente.toLocaleString()} AOA
                                    </p>
                                  </div>
                                </div>

                                <div className="space-y-2 mb-4 pb-4 border-b border-border">
                                  <Badge
                                    className={`w-full justify-center text-xs ${getStatusColor(res.paymentStatus)}`}
                                  >
                                    {getStatusIcon(res.paymentStatus)}
                                    <span className="ml-1">{res.paymentStatus}</span>
                                  </Badge>
                                  {renderCaucaoInfo(res)}
                                </div>

                                <Button
                                  variant="outline"
                                  className="w-full border border-primary/50 text-primary hover:bg-primary/5 rounded-lg font-medium bg-transparent"
                                  onClick={() => openModal("reserva", res)}
                                >
                                  Ver Detalhes
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TABLE VIEW */}
                  {reservasViewMode === "table" && (
                    <Card className="border border-border shadow-md overflow-hidden">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader className="bg-muted/40 border-b border-border">
                            <TableRow>
                              <TableHead className="text-foreground font-semibold">Espaço</TableHead>
                              <TableHead className="text-foreground font-semibold">Data</TableHead>
                              <TableHead className="text-foreground font-semibold">Horário</TableHead>
                              <TableHead className="text-foreground font-semibold">Total</TableHead>
                              <TableHead className="text-foreground font-semibold">Pago</TableHead>
                              <TableHead className="text-foreground font-semibold">Status</TableHead>
                              <TableHead className="text-foreground font-semibold">Pagamento</TableHead>
                              <TableHead className="text-right text-foreground font-semibold">Ação</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {reservasNormalizadas.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                  <p className="text-muted-foreground">Nenhuma reserva registrada</p>
                                </TableCell>
                              </TableRow>
                            ) : (
                              reservasNormalizadas.map((res) => (
                                <TableRow
                                  key={res._id}
                                  className="border-b border-border hover:bg-muted/30 transition-colors"
                                >
                                  <TableCell className="font-medium">{res.espaco?.nome || "Espaço"}</TableCell>
                                  <TableCell className="text-sm">
                                    {new Date(res.data).toLocaleDateString("pt-PT")}
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {res.horaInicio} - {res.horaTermino}
                                  </TableCell>
                                  <TableCell className="font-semibold">{res.valor.toLocaleString()} AOA</TableCell>
                                  <TableCell className="text-emerald-600 font-semibold">
                                    {res.totalPago.toLocaleString()} AOA
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`text-xs ${getStatusColor(res.status)}`}>
                                      {getStatusIcon(res.status)}
                                      <span className="ml-1">{res.status}</span>
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={`text-xs ${getStatusColor(res.paymentStatus)}`}>
                                      {getStatusIcon(res.paymentStatus)}
                                      <span className="ml-1">{res.paymentStatus}</span>
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-primary hover:bg-primary/10"
                                      onClick={() => openModal("reserva", res)}
                                    >
                                      Ver
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </Card>
                  )}

                  {/* LIST VIEW */}
                  {reservasViewMode === "list" && (
                    <div className="space-y-3">
                      {reservasNormalizadas.length === 0 ? (
                        <Card className="border border-border shadow-md">
                          <CardContent className="p-12 text-center">
                            <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-foreground mb-2">Nenhuma Reserva</h3>
                            <p className="text-muted-foreground">Você ainda não tem reservas registradas.</p>
                          </CardContent>
                        </Card>
                      ) : (
                        reservasNormalizadas.map((res) => (
                          <Card
                            key={res._id}
                            className="border border-border shadow-sm hover:shadow-md hover:border-primary/50 transition-all"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <div
                                      className={`w-3 h-3 rounded-full ${STATUS_COLORS[res.status as keyof typeof STATUS_COLORS]?.dot || "bg-gray-600"}`}
                                    />
                                    <h4 className="font-semibold text-foreground">{res.espaco?.nome || "Espaço"}</h4>
                                    <Badge className={`text-xs ${getStatusColor(res.status)}`}>{res.status}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {new Date(res.data).toLocaleDateString("pt-PT")} • {res.horaInicio} -{" "}
                                    {res.horaTermino}
                                  </p>
                                  <div className="flex items-center space-x-4 text-sm">
                                    <span>
                                      <span className="text-muted-foreground">Total:</span>
                                      <span className="ml-1 font-semibold">{res.valor.toLocaleString()} AOA</span>
                                    </span>
                                    <span>
                                      <span className="text-muted-foreground">Pago:</span>
                                      <span className="ml-1 font-semibold text-emerald-600">
                                        {res.totalPago.toLocaleString()} AOA
                                      </span>
                                    </span>
                                    <span>
                                      <span className="text-muted-foreground">Pendente:</span>
                                      <span className="ml-1 font-semibold text-amber-600">
                                        {res.saldoPendente.toLocaleString()} AOA
                                      </span>
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border border-primary/50 text-primary hover:bg-primary/5 ml-4 bg-transparent"
                                  onClick={() => openModal("reserva", res)}
                                >
                                  Ver
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </main>

      {/* Modals */}
      {showModal.type === "reserva" && <ModalDetalheReserva data={showModal.item} open={true} onClose={closeModal} />}
      {showModal.type === "desporto" && <ModalDetalheDesporto data={showModal.item} open={true} onClose={closeModal} />}
      {showModal.type === "ginasio" && <ModalDetalheGinasio data={showModal.item} open={true} onClose={closeModal} />}
      {showModal.type === "RegistarReserva" && <FormCreairReserva handleReserva={handleReserva} onClose={closeModal} />}
    </div>
  )
}
