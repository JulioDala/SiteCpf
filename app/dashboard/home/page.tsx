'use client';
import React, { JSX, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  FileText, 
  TrendingUp, 
  Award, 
  Activity, 
  Loader2,
  LayoutGrid,
  LayoutList,
  TableIcon,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import ModalDetalheDesporto from '@/components/layout/modal-detalho-desporto';
import ModalDetalheReserva from '@/components/layout/modal-detalhe-reserva';
import { useClienteReservasStore, normalizarReserva, ReservaCompleta, FILTRO_CLIENTE_RESERVAS_DEFAULT } from '@/storage/cliente-storage';
import { useAuthStore } from '@/storage/atuh-storage';
import FormCreairReserva from '@/components/layout/modal-criar-reserva';
import { useBackendReservaStore } from '@/storage/reserva-store';
import { FILTRO_DESPORTO_DEFAULT, useDesportoStore } from '@/storage/cliente-desporto-stores';
import FormcrearDesporto from '@/components/layout/modal-create-desporto';
import NotificacaoBell from '@/components/layout/notificacaoBell';
import NotificacoesModal from '@/components/layout/notificacoesModal';
import { ModalPerfil } from '@/components/layout/modal-perfil';
import FiltroReservas from '@/components/layout/filtro-reservas';
import PaginacaoReservas from '@/components/layout/paginacao-reservas';
import FiltroDesportos from '@/components/layout/filtro-desportos';

type ViewMode = 'cards' | 'table' | 'list';

// Sistema unificado de cores para status
const STATUS_COLORS = {
  // Status Reserva
  'Confirmada': {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200',
    icon: 'text-emerald-600',
    dot: 'bg-emerald-600',
  },
  'Concluída': {
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-200',
    icon: 'text-blue-600',
    dot: 'bg-blue-600',
  },
  'Pendente': {
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-200',
    icon: 'text-amber-600',
    dot: 'bg-amber-600',
  },
  'Cancelada': {
    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-200',
    icon: 'text-rose-600',
    dot: 'bg-rose-600',
  },
  'Expirada': {
    badge: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-200',
    icon: 'text-orange-600',
    dot: 'bg-orange-600',
  },
  'Processada': {
    badge: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-200',
    icon: 'text-purple-600',
    dot: 'bg-purple-600',
  },
  'Rascunho': {
    badge: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-200',
    icon: 'text-gray-600',
    dot: 'bg-gray-600',
  },
  // Status Pagamento
  'Pago': {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-200',
    icon: 'text-emerald-600',
    dot: 'bg-emerald-600',
  },
  'Parcial': {
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-200',
    icon: 'text-cyan-600',
    dot: 'bg-cyan-600',
  },
  'Vencida': {
    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950 dark:text-rose-200',
    icon: 'text-rose-600',
    dot: 'bg-rose-600',
  },
  'Reembolsado': {
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-200',
    icon: 'text-indigo-600',
    dot: 'bg-indigo-600',
  },
  // Status Caução
  'Ativa': {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: 'text-emerald-600',
    dot: 'bg-emerald-600',
  },
  'Devolvida': {
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: 'text-blue-600',
    dot: 'bg-blue-600',
  },
  'Com Prejuízos': {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: 'text-amber-600',
    dot: 'bg-amber-600',
  },
};

export default function ClientPortalHome() {
  const router = useRouter();
  const { userLogin, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [reservasViewMode, setReservasViewMode] = useState<ViewMode>('cards');
  const [desportosViewMode, setDesportosViewMode] = useState<ViewMode>('cards');
  const [showModal, setShowModal] = useState({ type: '', item: null as any });
  const [showDetalheReserva, setShowDetalheReserva] = useState<any>(null);
  const [showDetalheDesporto, setShowDetalheDesporto] = useState<any>(null);
  const [showNotificacoesModal, setShowNotificacoesModal] = useState(false);
  const [showPerfilModal, setShowPerfilModal] = useState(false);

  // ✅ Store de reservas
  const {
    clienteCompleto,
    reservasFuturas,
    loading,
    error,
    getClienteCompletoFiltrado,
    getClienteComReservasFuturas,
    clearError,
    reservaEspecifica,
    reservasPaginadas,
    filtroAtual,
    loadingFiltrado,
    aplicarFiltro,
    limparFiltro,
    mudarPagina
  } = useClienteReservasStore();

  // ✅ Store de desporto
  const {
    desportosFuturos,
    desportosCompletos,
    desportoEstatistica,
    fetchDesportosEstatistica,
    desportosPaginados,
    filtroAtualDesporto,
    loadingFiltradoDesporto,
    getDesportosFiltrados,
    aplicarFiltroDesporto,
    limparFiltroDesporto,
    mudarPaginaDesporto,
    errorEstatistica,
    loadingEstatistica,
    loadingFuturos: loadingDesportoFuturos,
    errorFuturos: errorDesportoFuturos,
    loadingCompletos: loadingDesportoCompletos,
    errorCompletos: errorDesportoCompletos,
    fetchDesportosFuturos,
    fetchDesportosCompletos,
    fetchDesportoEspecifico,
    desportoEspecifico
  } = useDesportoStore();

  const {
    fetchEstatisticaReserva,
    reservaEstatistica,
    loadingEstatistica: loadingReservaEstatistica,
    errorEstatistica: errorReservaEstatistica
  } = useBackendReservaStore();

  const clientName = userLogin?.cliente.nome || "Jose da Costa Quinanga";
  const numeroCliente = userLogin?.cliente.numeroCliente || "";
  const email = userLogin?.cliente.email || "";
  const idCliente = userLogin?.cliente._id || "";

  // ✅ Carregar dados do cliente ao montar componente
  useEffect(() => {
    const loadData = async () => {
      if (numeroCliente) {
        await getClienteCompletoFiltrado({
          ...FILTRO_CLIENTE_RESERVAS_DEFAULT,
          numeroCliente,
        });
        await getClienteComReservasFuturas(numeroCliente);
      }

      if (email) {
        await getDesportosFiltrados({
          ...FILTRO_DESPORTO_DEFAULT,
          email,
        });
        await fetchDesportosFuturos(email);
        await fetchDesportosCompletos(email);
        await fetchDesportosEstatistica(email);
      }
    };

    loadData();
  }, [numeroCliente, email]);

  useEffect(() => {
    if (reservaEspecifica?.reserva) {
      setShowDetalheReserva(reservaEspecifica.reserva);
    }
  }, [reservaEspecifica]);

  useEffect(() => {
    if (desportoEspecifico) {
      setShowDetalheDesporto(desportoEspecifico);
    }
  }, [desportoEspecifico]);

  // ✅ Carregar estatísticas de reserva separadamente
  useEffect(() => {
    if (idCliente) {
      const loadReservaStats = async () => {
        try {
          await fetchEstatisticaReserva(idCliente);
        } catch (error) {
          console.error("Erro ao carregar estatísticas de reserva:", error);
        }
      };

      loadReservaStats();
    }
  }, [idCliente, fetchEstatisticaReserva]);

  function abreviarValor(valor: number) {
    if (valor >= 1_000_000_000) return (valor / 1_000_000_000).toFixed(1) + 'B Kz';
    if (valor >= 1_000_000) return (valor / 1_000_000).toFixed(1) + 'M Kz';
    if (valor >= 1_000) return (valor / 1_000).toFixed(0) + 'K Kz';
    return valor + ' Kz';
  }

  const handleItemsPerPageChangeDesporto = async (items: number) => {
    await aplicarFiltroDesporto({
      itensPorPagina: items,
      pagina: 1,
    });
  };

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
      r => r.status === 'PENDENTE' || r.status === 'CONFIRMADO'
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
      proximaReserva: proximaReservaTexto
    };
  }, [reservasFuturasNormalizadas]);

  const formatCurrencyFull = (value: number): string => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    return STATUS_COLORS[normalizedStatus as keyof typeof STATUS_COLORS]?.badge || STATUS_COLORS['Rascunho'].badge;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      'Confirmada': <CheckCircle className="w-3.5 h-3.5" />,
      'Concluída': <CheckCircle className="w-3.5 h-3.5" />,
      'Pendente': <AlertCircle className="w-3.5 h-3.5" />,
      'Cancelada': <XCircle className="w-3.5 h-3.5" />,
      'Expirada': <XCircle className="w-3.5 h-3.5" />,
      'Processada': <CheckCircle className="w-3.5 h-3.5" />,
      'Rascunho': <Clock className="w-3.5 h-3.5" />,
      'Pago': <CheckCircle className="w-3.5 h-3.5" />,
      'Parcial': <AlertCircle className="w-3.5 h-3.5" />,
      'Vencida': <XCircle className="w-3.5 h-3.5" />,
      'Reembolsado': <CheckCircle className="w-3.5 h-3.5" />,
    };
    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    return icons[normalizedStatus] || <Clock className="w-3.5 h-3.5" />;
  };

  const getStatusDot = (status: string) => {
    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    return STATUS_COLORS[normalizedStatus as keyof typeof STATUS_COLORS]?.dot || STATUS_COLORS['Rascunho'].dot;
  };

  const getCaucaoColor = (status: string) => {
    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    return STATUS_COLORS[normalizedStatus as keyof typeof STATUS_COLORS]?.badge || STATUS_COLORS['Rascunho'].badge;
  };

  // Função helper para exibir status ao usuário
  const getDisplayStatus = (status: string, totalPago: number) => {
    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    // Se está cancelada mas tem pagamento, mostrar como "Expirada"
    if (normalizedStatus === 'Cancelada' && totalPago > 0) {
      return 'Expirada';
    }
    return normalizedStatus;
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const formatPagamentosResumo = (reserva: ReservaCompleta) => {
    const pagamentos = reserva.pagamentosDetalhes || [];
    const paga = pagamentos.filter(p => p.status === 'pago' || p.status === 'PAGO').length;
    const valorPago = reserva.totalPago || 0;
    return `${paga}/${pagamentos.length} parcelas • ${valorPago.toLocaleString()} AOA`;
  };

  const renderCaucaoInfo = (reserva: ReservaCompleta) => {
    const caucao = reserva.caucoes?.[0];
    if (!caucao) return null;

    return (
      <div className="mt-1 flex items-center space-x-1 text-xs">
        <span className="font-medium">Caução:</span>
        <span>{caucao.valorCaucao} AOA</span>
        <Badge
          variant="secondary"
          className={`rounded-full px-2 py-0.5 border ${getCaucaoColor(caucao.status)}`}
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

  const handleItemsPerPageChange = async (items: number) => {
    await aplicarFiltro({
      itensPorPagina: items,
      pagina: 1,
    });
  };

  const openModal = (type: string, item: any) => {
    setShowModal({ type, item });
  };

  const closeModal = () => {
    setShowModal({ type: '', item: null });
  };

  function handleReserva(data: any) {
    console.log("📊 Reserva criada:", data);
    if (numeroCliente) {
      getClienteComReservasFuturas(numeroCliente);
      getClienteCompletoFiltrado({
        ...(filtroAtual || FILTRO_CLIENTE_RESERVAS_DEFAULT),
        numeroCliente,
      });
    }
    if (idCliente) {
      fetchEstatisticaReserva(idCliente);
    }
  }

  function handleDesporto(data: any) {
    console.log("🏃 Desporto criado:", data);
    if (email) {
      fetchDesportosFuturos(email);
      fetchDesportosCompletos(email);
      fetchDesportosEstatistica(email);
      getDesportosFiltrados({
        ...(filtroAtualDesporto || FILTRO_DESPORTO_DEFAULT),
        email,
      });
    }
  }

  // ===========================
  // COMPONENTE: ViewModeToggle
  // ===========================
  const ViewModeToggle = ({ 
    currentMode, 
    onModeChange 
  }: { 
    currentMode: ViewMode; 
    onModeChange: (mode: ViewMode) => void 
  }) => (
    <div className="flex border border-gray-200 rounded-lg p-1 bg-gray-50">
      <Button
        variant={currentMode === 'cards' ? 'default' : 'ghost'}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onModeChange('cards')}
        title="Visualização em cards"
      >
        <LayoutGrid className="w-4 h-4" />
      </Button>
      <Button
        variant={currentMode === 'table' ? 'default' : 'ghost'}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onModeChange('table')}
        title="Visualização em tabela"
      >
        <TableIcon className="w-4 h-4" />
      </Button>
      <Button
        variant={currentMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => onModeChange('list')}
        title="Visualização em lista"
      >
        <LayoutList className="w-4 h-4" />
      </Button>
    </div>
  );

  // ====================================
  // COMPONENTES DE VISUALIZAÇÃO: RESERVAS
  // ====================================
  
  const ReservasCardsView = ({ reservas }: { reservas: ReservaCompleta[] }) => {
    const formatValor = (valor: number, status: string) => {
      const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      if (normalizedStatus === 'Rascunho') return '---';
      return `${valor.toLocaleString()} AOA`;
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reservas.map((res) => {
          const displayStatus = getDisplayStatus(res.status, res.totalPago);
          return (
            <Card
              key={res._id}
              className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden rounded-xl bg-white border border-gray-200 hover:border-purple-300 hover:-translate-y-1"
            >
              <CardContent className="p-6 space-y-3">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <CardTitle className="text-lg font-bold text-gray-900 mb-2">
                      {res.espaco?.nome || 'Espaço'}
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      {new Date(res.data).toLocaleDateString('pt-PT')} às {res.horaInicio} - {res.horaTermino}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Ref: {res.ref} • {res.participants} participantes
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(displayStatus)}`}>
                      {getStatusIcon(displayStatus)}
                      <span className="ml-1">{displayStatus}</span>
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-sm font-bold text-gray-900">{formatValor(res.valor, res.status)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Pago</p>
                    <p className="text-sm font-bold text-emerald-600">{formatValor(res.totalPago, res.status)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Pendente</p>
                    <p className="text-sm font-bold text-amber-600">{formatValor(res.saldoPendente, res.status)}</p>
                  </div>
                </div>

                {renderCaucaoInfo(res)}

                <div className="flex space-x-3 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 px-4 py-2.5 border-2 border-purple-300 text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition-colors text-sm"
                    onClick={() => setShowDetalheReserva(res)}
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const ReservasTableView = ({ reservas }: { reservas: ReservaCompleta[] }) => {
    const formatValor = (valor: number, status: string) => {
      const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      if (normalizedStatus === 'Rascunho') return '---';
      return `${valor.toLocaleString()} AOA`;
    };

    return (
      <Card className="border border-gray-200 shadow-md overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 border-b border-gray-200">
              <TableRow>
                <TableHead className="text-gray-900 font-semibold">Espaço</TableHead>
                <TableHead className="text-gray-900 font-semibold">Data</TableHead>
                <TableHead className="text-gray-900 font-semibold">Horário</TableHead>
                <TableHead className="text-gray-900 font-semibold">Total</TableHead>
                <TableHead className="text-gray-900 font-semibold">Pago</TableHead>
                <TableHead className="text-gray-900 font-semibold">Pendente</TableHead>
                <TableHead className="text-gray-900 font-semibold">Status</TableHead>
                <TableHead className="text-right text-gray-900 font-semibold">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <p className="text-gray-500">Nenhuma reserva registrada</p>
                  </TableCell>
                </TableRow>
              ) : (
                reservas.map((res) => {
                  const displayStatus = getDisplayStatus(res.status, res.totalPago);
                  return (
                    <TableRow
                      key={res._id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium text-gray-900">{res.espaco?.nome || 'Espaço'}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(res.data).toLocaleDateString('pt-PT')}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {res.horaInicio} - {res.horaTermino}
                      </TableCell>
                      <TableCell className="font-semibold text-gray-900">{formatValor(res.valor, res.status)}</TableCell>
                      <TableCell className="text-emerald-600 font-semibold">
                        {formatValor(res.totalPago, res.status)}
                      </TableCell>
                      <TableCell className="text-amber-600 font-semibold">
                        {formatValor(res.saldoPendente, res.status)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs border ${getStatusColor(displayStatus)}`}>
                          {getStatusIcon(displayStatus)}
                          <span className="ml-1">{displayStatus}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-purple-600 hover:bg-purple-50"
                          onClick={() => setShowDetalheReserva(res)}
                        >
                          Ver
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    );
  };

  const ReservasListView = ({ reservas }: { reservas: ReservaCompleta[] }) => {
    const formatValor = (valor: number, status: string) => {
      const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      if (normalizedStatus === 'Rascunho') return '---';
      return `${valor.toLocaleString()} AOA`;
    };

    return (
      <div className="space-y-3">
        {reservas.map((res) => {
          const displayStatus = getDisplayStatus(res.status, res.totalPago);
          return (
            <Card
              key={res._id}
              className="border border-gray-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all rounded-xl"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusDot(displayStatus)}`} />
                      <h4 className="font-semibold text-gray-900">{res.espaco?.nome || 'Espaço'}</h4>
                      <Badge className={`text-xs border ${getStatusColor(displayStatus)}`}>
                        {displayStatus}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(res.data).toLocaleDateString('pt-PT')} • {res.horaInicio} - {res.horaTermino}
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span>
                        <span className="text-gray-500">Total:</span>
                        <span className="ml-1 font-semibold text-gray-900">{formatValor(res.valor, res.status)}</span>
                      </span>
                      <span>
                        <span className="text-gray-500">Pago:</span>
                        <span className="ml-1 font-semibold text-emerald-600">
                          {formatValor(res.totalPago, res.status)}
                        </span>
                      </span>
                      <span>
                        <span className="text-gray-500">Pendente:</span>
                        <span className="ml-1 font-semibold text-amber-600">
                          {formatValor(res.saldoPendente, res.status)}
                        </span>
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 ml-4"
                    onClick={() => setShowDetalheReserva(res)}
                  >
                    Ver
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  // ====================================
  // COMPONENTES DE VISUALIZAÇÃO: DESPORTOS
  // ====================================

  const DesportosCardsView = ({ desportos }: { desportos: any[] }) => {
    const formatValor = (valor: number, status: string) => {
      const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      if (normalizedStatus === 'Rascunho') return '---';
      return `${valor.toLocaleString()} AOA`;
    };

    const calcularPendente = (total: number, pago: number, status: string) => {
      const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      if (normalizedStatus === 'Rascunho') return '---';
      return `${((total || 0) - (pago || 0)).toLocaleString()} AOA`;
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {desportos.map((desporto) => (
          <Card
            key={desporto._id}
            className="group border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden rounded-xl bg-white border border-gray-200 hover:border-emerald-300 hover:-translate-y-1"
          >
            <CardContent className="p-6 space-y-3">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <CardTitle className="text-lg font-bold text-gray-900 mb-2">
                    {desporto.nomeEquipe || (typeof desporto.tipoAtividade === 'object' ? desporto.tipoAtividade.nome : desporto.tipoAtividade)}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {new Date(desporto.dataInicio).toLocaleDateString('pt-PT')} às {desporto.horarioInicio} - {desporto.horarioFim}
                  </p>
                  <p className="text-sm text-gray-500">Responsável: {desporto.nomeResponsavel}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {desporto.campo?.nome} • {desporto.tipoAtividade?.nome}
                  </p>
                </div>
                <div className="flex flex-col items-end">
                  <Badge className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold border ${getStatusColor(desporto.status)}`}>
                    {getStatusIcon(desporto.status)}
                    <span className="ml-1">{desporto.status}</span>
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Total Pagamento</p>
                  <p className="text-sm font-bold text-gray-900">{formatValor(desporto.valorPagamento, desporto.status)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Pago</p>
                  <p className="text-sm font-bold text-emerald-600">{formatValor(desporto.valorPago || 0, desporto.status)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Pendente</p>
                  <p className="text-sm font-bold text-amber-600">
                    {calcularPendente(desporto.valorPagamento, desporto.valorPago, desporto.status)}
                  </p>
                </div>
              </div>

              {desporto.caucoes && desporto.caucoes.length > 0 && desporto.caucoes[0].valorAPagar !== 0 && (
                <div className="p-2 bg-blue-50 rounded text-sm">
                  <p className="text-blue-700 font-medium">
                    Caução: {desporto.caucoes[0].valorAPagar.toLocaleString()} AOA •
                    Status: {desporto.caucoes[0].status}
                  </p>
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 px-4 py-2.5 border-2 border-emerald-300 text-emerald-700 rounded-lg font-medium hover:bg-emerald-50 transition-colors text-sm"
                  onClick={() => setShowDetalheDesporto(desporto)}
                >
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const DesportosTableView = ({ desportos }: { desportos: any[] }) => {
    const formatValor = (valor: number, status: string) => {
      const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      if (normalizedStatus === 'Rascunho') return '---';
      return `${valor.toLocaleString()} AOA`;
    };

    const calcularPendente = (total: number, pago: number, status: string) => {
      const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      if (normalizedStatus === 'Rascunho') return '---';
      return `${((total || 0) - (pago || 0)).toLocaleString()} AOA`;
    };

    return (
      <Card className="border border-gray-200 shadow-md overflow-hidden rounded-xl">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50 border-b border-gray-200">
              <TableRow>
                <TableHead className="text-gray-900 font-semibold">Equipe/Atividade</TableHead>
                <TableHead className="text-gray-900 font-semibold">Data</TableHead>
                <TableHead className="text-gray-900 font-semibold">Horário</TableHead>
                <TableHead className="text-gray-900 font-semibold">Campo</TableHead>
                <TableHead className="text-gray-900 font-semibold">Responsável</TableHead>
                <TableHead className="text-gray-900 font-semibold">Total</TableHead>
                <TableHead className="text-gray-900 font-semibold">Pago</TableHead>
                <TableHead className="text-gray-900 font-semibold">Pendente</TableHead>
                <TableHead className="text-gray-900 font-semibold">Status</TableHead>
                <TableHead className="text-right text-gray-900 font-semibold">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {desportos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    <p className="text-gray-500">Nenhuma atividade registrada</p>
                  </TableCell>
                </TableRow>
              ) : (
                desportos.map((desporto) => (
                  <TableRow
                    key={desporto._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900">
                      {desporto.nomeEquipe || (typeof desporto.tipoAtividade === 'object' ? desporto.tipoAtividade.nome : desporto.tipoAtividade)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(desporto.dataInicio).toLocaleDateString('pt-PT')}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {desporto.horarioInicio} - {desporto.horarioFim}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">{desporto.campo?.nome}</TableCell>
                    <TableCell className="text-sm text-gray-600">{desporto.nomeResponsavel}</TableCell>
                    <TableCell className="font-semibold text-gray-900">{formatValor(desporto.valorPagamento, desporto.status)}</TableCell>
                    <TableCell className="text-emerald-600 font-semibold">
                      {formatValor(desporto.valorPago || 0, desporto.status)}
                    </TableCell>
                    <TableCell className="text-amber-600 font-semibold">
                      {calcularPendente(desporto.valorPagamento, desporto.valorPago, desporto.status)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs border ${getStatusColor(desporto.status)}`}>
                        {getStatusIcon(desporto.status)}
                        <span className="ml-1">{desporto.status}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-emerald-600 hover:bg-emerald-50"
                        onClick={() => setShowDetalheDesporto(desporto)}
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
    );
  };

  const DesportosListView = ({ desportos }: { desportos: any[] }) => {
    const formatValor = (valor: number, status: string) => {
      const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      if (normalizedStatus === 'Rascunho') return '---';
      return `${valor.toLocaleString()} AOA`;
    };

    const calcularPendente = (total: number, pago: number, status: string) => {
      const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      if (normalizedStatus === 'Rascunho') return '---';
      return `${((total || 0) - (pago || 0)).toLocaleString()} AOA`;
    };

    return (
      <div className="space-y-3">
        {desportos.map((desporto) => (
          <Card
            key={desporto._id}
            className="border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all rounded-xl"
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusDot(desporto.status)}`} />
                    <h4 className="font-semibold text-gray-900">
                      {desporto.nomeEquipe || (typeof desporto.tipoAtividade === 'object' ? desporto.tipoAtividade.nome : desporto.tipoAtividade)}
                    </h4>
                    <Badge className={`text-xs border ${getStatusColor(desporto.status)}`}>
                      {desporto.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(desporto.dataInicio).toLocaleDateString('pt-PT')} • {desporto.horarioInicio} - {desporto.horarioFim} • {desporto.campo?.nome}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">Responsável: {desporto.nomeResponsavel}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <span>
                      <span className="text-gray-500">Total:</span>
                      <span className="ml-1 font-semibold text-gray-900">{formatValor(desporto.valorPagamento, desporto.status)}</span>
                    </span>
                    <span>
                      <span className="text-gray-500">Pago:</span>
                      <span className="ml-1 font-semibold text-emerald-600">
                        {formatValor(desporto.valorPago || 0, desporto.status)}
                      </span>
                    </span>
                    <span>
                      <span className="text-gray-500">Pendente:</span>
                      <span className="ml-1 font-semibold text-amber-600">
                        {calcularPendente(desporto.valorPagamento, desporto.valorPago, desporto.status)}
                      </span>
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 ml-4"
                  onClick={() => setShowDetalheDesporto(desporto)}
                >
                  Ver
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // ✅ Renderizar estado de carregamento
  if (loading || loadingDesportoFuturos || loadingDesportoCompletos) {
    return (
      <div className="min-h-screen bg-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Carregando suas reservas e atividades...</p>
        </div>
      </div>
    );
  }

  // ✅ Renderizar erro
  if (error || errorDesportoFuturos || errorDesportoCompletos) {
    return (
      <div className="min-h-screen bg-cyan-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-rose-200 bg-white">
          <CardContent className="p-6 text-center">
            <XCircle className="w-12 h-12 text-rose-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Erro ao Carregar Dados</h3>
            <p className="text-gray-600 mb-4">
              {typeof error === 'string' ? error :
                errorDesportoFuturos ? 'Erro ao carregar desportos futuros' :
                  errorDesportoCompletos ? 'Erro ao carregar desportos completos' :
                    'Erro desconhecido'}
            </p>
            <Button
              onClick={() => {
                clearError();
                if (numeroCliente) {
                  getClienteCompletoFiltrado({
                    ...FILTRO_CLIENTE_RESERVAS_DEFAULT,
                    numeroCliente,
                  });
                  getClienteComReservasFuturas(numeroCliente);
                }
                if (email) {
                  fetchDesportosFuturos(email);
                  fetchDesportosCompletos(email);
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
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-purple-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-white shadow-sm">
                  <img
                    src="./../images/ico-paz-flor.png"
                    alt="Logo CPF"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 leading-tight">
                    Paz Flor
                  </h1>
                  <p className="text-xs text-purple-600 font-medium">
                    Portal do Cliente
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <NotificacaoBell
                userEmail={email}
                onClick={() => setShowNotificacoesModal(true)}
              />

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {clientName.split(' ')[0]}
                  </p>
                  <p className="text-xs text-gray-500">Membro</p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-gray-100"
                  onClick={() => setShowPerfilModal(true)}
                  title="Perfil"
                >
                  <User size={20} className="text-gray-600" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full hover:bg-rose-50 text-rose-600"
                  onClick={handleLogout}
                  title="Sair"
                >
                  <LogOut size={20} />
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
            Acompanhe suas reservas de espaços e atividades desportivas de forma independente, com detalhes de pagamentos e caução.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Card className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl bg-white border border-purple-100 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>

              <p className="text-sm text-gray-600 mb-1 font-medium">Reservas Ativas</p>
              <p className="text-4xl font-bold text-gray-900">
                {reservaEstatistica?.reservaAtiva || stats.reservasAtivas}
              </p>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-purple-600 font-medium">
                  ↗ Ver todas as reservas
                </p>
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

              <p className="text-sm text-gray-600 mb-1 font-medium">
                Desportos Ativos
              </p>
              <p className="text-4xl font-bold text-gray-900">
                {desportoEstatistica?.desportosAtivos || '0'}
              </p>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-emerald-600 font-medium">
                  {desportoEstatistica?.camposNome?.slice(0, 2).join(' • ') || 'Sem campos'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl bg-white border border-amber-100 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <Award className="w-5 h-5 text-amber-500" />
              </div>

              <p className="text-sm text-gray-600 mb-1 font-medium">
                Total Reservas
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {reservaEstatistica?.totalReserva
                  ? abreviarValor(reservaEstatistica.totalReserva)
                  : '0'} 
              </p>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-amber-600 font-medium">
                  {reservaEstatistica?.reservaAtiva
                    ? `${reservaEstatistica.reservaAtiva} reservas ativas`
                    : 'Sem reservas'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl bg-white border border-blue-100 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <Award className="w-5 h-5 text-blue-500" />
              </div>

              <p className="text-sm text-gray-600 mb-1 font-medium">
                Total Desporto
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {desportoEstatistica?.totalDesporto
                  ? abreviarValor(desportoEstatistica.totalDesporto)
                  : '0'} 
              </p>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-blue-600 font-medium">
                  {desportoEstatistica?.desportosAtivos
                    ? `${desportoEstatistica.desportosAtivos} desportos ativos`
                    : 'Sem atividades'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo Financeiro */}
        <Card className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 mb-10">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>Resumo Financeiro</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Total Reservas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reservaEstatistica?.totalReserva
                    ? abreviarValor(reservaEstatistica.totalReserva)
                    : '0,00 AOA'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {reservaEstatistica?.reservaAtiva || 0} reservas ativas
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Total Desporto</p>
                <p className="text-2xl font-bold text-gray-900">
                  {desportoEstatistica?.totalDesporto
                    ? abreviarValor(desportoEstatistica.totalDesporto)
                    : '0,00 AOA'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {desportoEstatistica?.desportosAtivos || 0} atividades ativas
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Investimento Total</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {abreviarValor(
                    (reservaEstatistica?.totalReserva || 0) +
                    (desportoEstatistica?.totalDesporto || 0)
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {((reservaEstatistica?.reservaAtiva || 0) +
                    (desportoEstatistica?.desportosAtivos || 0))} atividades totais
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Navigation */}
        <Card className="group border-0 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl bg-white border border-purple-100 mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex border-b border-gray-200 bg-gray-50">
              {[
                { value: 'overview', label: 'Visão Geral', icon: Activity },
                { value: 'reservas', label: 'Reservas', icon: Calendar },
                { value: 'desporto', label: 'Desporto', icon: Dumbbell },
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
              {/* TAB: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900">Atividades Recentes</h3>
                    <div className="flex space-x-3">
                      <Button
                        size="lg"
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
                        onClick={() => setShowModal({ type: 'RegistarReserva', item: null })}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nova Reserva</span>
                      </Button>
                      <Button
                        size="lg"
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
                        onClick={() => setShowModal({ type: 'RegistarDesporto', item: null })}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nova Atividade Desportiva</span>
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
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

                    <Card className="group border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden rounded-xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                          <Dumbbell className="w-5 h-5 text-emerald-600" />
                          <span>Desporto Recente</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {desportosFuturos.slice(0, 2).map(desporto => (
                            <div key={desporto._id} className="group border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden rounded-lg bg-white p-4 border border-gray-200">
                              <div className="flex justify-between items-start mb-2">
                                <p className="font-medium text-gray-900">{desporto.nomeEquipe || (typeof desporto.tipoAtividade === 'object' ? desporto.tipoAtividade.nome : desporto.tipoAtividade)}</p>
                                <Badge className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusColor(desporto.status)}`}>
                                  {getStatusIcon(desporto.status)}
                                  <span className="ml-1">{desporto.status}</span>
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {new Date(desporto.dataInicio).toLocaleDateString('pt-PT')} às {desporto.horarioInicio} - {desporto.nomeResponsavel}
                              </p>
                            </div>
                          ))}
                          {desportosFuturos.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">Nenhuma atividade desportiva</p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* TAB: RESERVAS */}
              {activeTab === 'reservas' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Reservas de Espaços
                        {reservasPaginadas && (
                          <span className="text-gray-500 font-normal ml-2">
                            ({reservasPaginadas.paginacao.totalItens} encontradas)
                          </span>
                        )}
                      </h3>
                      {reservasPaginadas && (
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="text-sm text-gray-600">
                              Valor total: {formatCurrencyFull(reservasPaginadas.totalValorReservasPagina)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-gray-600">
                              Pago: {formatCurrencyFull(reservasPaginadas.totalPagoPagina)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <span className="text-sm text-gray-600">
                              Pendente: {formatCurrencyFull(reservasPaginadas.totalPendentePagina)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <ViewModeToggle 
                        currentMode={reservasViewMode} 
                        onModeChange={setReservasViewMode} 
                      />
                      <Button
                        size="lg"
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
                        onClick={() => setShowModal({ type: 'RegistarReserva', item: null })}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nova Reserva</span>
                      </Button>
                    </div>
                  </div>

                  <FiltroReservas
                    numeroCliente={numeroCliente}
                    className="mb-6"
                  />

                  {loadingFiltrado && (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                      <p className="mt-4 text-gray-600">Carregando reservas...</p>
                    </div>
                  )}

                  {reservasPaginadas && !loadingFiltrado ? (
                    <>
                      {reservasPaginadas.reservas.length === 0 ? (
                        <Card className="border-0 shadow-md rounded-xl bg-white border border-gray-200">
                          <CardContent className="p-12 text-center">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              Nenhuma Reserva Encontrada
                            </h3>
                            <p className="text-gray-600 mb-4">
                              {filtroAtual && Object.keys(filtroAtual).length > 1
                                ? "Tente ajustar seus filtros de busca."
                                : "Você ainda não tem reservas registradas."}
                            </p>
                            {filtroAtual && Object.keys(filtroAtual).length > 1 && (
                              <Button
                                variant="outline"
                                onClick={() => limparFiltro()}
                                className="mt-2"
                              >
                                Limpar filtros
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ) : (
                        <>
                          {reservasViewMode === 'cards' && (
                            <ReservasCardsView 
                              reservas={reservasPaginadas.reservas.map(normalizarReserva)} 
                            />
                          )}
                          {reservasViewMode === 'table' && (
                            <ReservasTableView 
                              reservas={reservasPaginadas.reservas.map(normalizarReserva)} 
                            />
                          )}
                          {reservasViewMode === 'list' && (
                            <ReservasListView 
                              reservas={reservasPaginadas.reservas.map(normalizarReserva)} 
                            />
                          )}

                          {reservasPaginadas.paginacao.totalPaginas > 1 && (
                            <div className="mt-8">
                              <PaginacaoReservas
                                paginaAtual={reservasPaginadas.paginacao.paginaAtual}
                                totalPaginas={reservasPaginadas.paginacao.totalPaginas}
                                totalItens={reservasPaginadas.paginacao.totalItens}
                                itensPorPagina={reservasPaginadas.paginacao.itensPorPagina}
                                hasNextPage={reservasPaginadas.paginacao.hasNextPage}
                                hasPrevPage={reservasPaginadas.paginacao.hasPrevPage}
                                onPageChange={mudarPagina}
                                onItemsPerPageChange={handleItemsPerPageChange}
                                className="px-4 py-3 bg-white rounded-lg border border-gray-200"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : null}
                </div>
              )}

              {/* TAB: DESPORTO */}
              {activeTab === 'desporto' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Atividades Desportivas
                        {desportosPaginados && (
                          <span className="text-gray-500 font-normal ml-2">
                            ({desportosPaginados.paginacao.totalItens} encontradas)
                          </span>
                        )}
                      </h3>
                      {desportosPaginados && (
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="text-sm text-gray-600">
                              {desportosPaginados.desportos.length} atividades
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="text-sm text-gray-600">
                              Total: {formatCurrencyFull(
                                desportosPaginados.desportos.reduce((sum, d) => sum + (d.valorPagamento || 0), 0)
                              )}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <ViewModeToggle 
                        currentMode={desportosViewMode} 
                        onModeChange={setDesportosViewMode} 
                      />
                      <Button
                        size="lg"
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
                        onClick={() => setShowModal({ type: 'RegistarDesporto', item: null })}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nova Actividade Desportiva</span>
                      </Button>
                    </div>
                  </div>

                  <FiltroDesportos
                    email={email}
                    className="mb-6"
                  />

                  {loadingFiltradoDesporto && (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                      <p className="mt-4 text-gray-600">Carregando atividades...</p>
                    </div>
                  )}

                  {desportosPaginados && !loadingFiltradoDesporto ? (
                    <>
                      {desportosPaginados.desportos.length === 0 ? (
                        <Card className="border-0 shadow-md rounded-xl bg-white border border-gray-200">
                          <CardContent className="p-12 text-center">
                            <Dumbbell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              Nenhuma Atividade Encontrada
                            </h3>
                            <p className="text-gray-600 mb-4">
                              {filtroAtualDesporto && Object.keys(filtroAtualDesporto).length > 1
                                ? "Tente ajustar seus filtros de busca."
                                : "Você ainda não tem atividades desportivas registradas."}
                            </p>
                            {filtroAtualDesporto && Object.keys(filtroAtualDesporto).length > 1 && (
                              <Button
                                variant="outline"
                                onClick={() => limparFiltroDesporto()}
                                className="mt-2"
                              >
                                Limpar filtros
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ) : (
                        <>
                          {desportosViewMode === 'cards' && (
                            <DesportosCardsView desportos={desportosPaginados.desportos} />
                          )}
                          {desportosViewMode === 'table' && (
                            <DesportosTableView desportos={desportosPaginados.desportos} />
                          )}
                          {desportosViewMode === 'list' && (
                            <DesportosListView desportos={desportosPaginados.desportos} />
                          )}

                          {desportosPaginados.paginacao.totalPaginas > 1 && (
                            <div className="mt-8">
                              <PaginacaoReservas
                                paginaAtual={desportosPaginados.paginacao.paginaAtual}
                                totalPaginas={desportosPaginados.paginacao.totalPaginas}
                                totalItens={desportosPaginados.paginacao.totalItens}
                                itensPorPagina={desportosPaginados.paginacao.itensPorPagina}
                                hasNextPage={desportosPaginados.paginacao.hasNextPage}
                                hasPrevPage={desportosPaginados.paginacao.hasPrevPage}
                                onPageChange={mudarPaginaDesporto}
                                onItemsPerPageChange={handleItemsPerPageChangeDesporto}
                                className="px-4 py-3 bg-white rounded-lg border border-gray-200"
                              />
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : null}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </main>

      {/* Modals */}
      {showDetalheReserva && (
        <ModalDetalheReserva
          data={showDetalheReserva}
          open={true}
          onClose={() => setShowDetalheReserva(null)}
        />
      )}

      {showDetalheDesporto && (
        <ModalDetalheDesporto
          data={showDetalheDesporto}
          open={true}
          onClose={() => setShowDetalheDesporto(null)}
        />
      )}

      {showModal.type === 'RegistarReserva' && (
        <FormCreairReserva
          handleReserva={handleReserva}
          onClose={closeModal}
        />
      )}

      {showModal.type === 'RegistarDesporto' && (
        <FormcrearDesporto
          handleDesporto={handleDesporto}
          onClose={closeModal}
        />
      )}

      {showNotificacoesModal && (
        <NotificacoesModal
          userEmail={email}
          numeroCliente={numeroCliente}
          isOpen={showNotificacoesModal}
          onClose={() => setShowNotificacoesModal(false)}
          onOpenReservaModal={(reserva) => {
            setShowDetalheReserva(reserva);
            setShowNotificacoesModal(false);
          }}
          onOpenDesportoModal={(desporto) => {
            setShowDetalheDesporto(desporto);
            setShowNotificacoesModal(false);
          }}
        />
      )}

      {showPerfilModal && (
        <ModalPerfil
          isOpen={showPerfilModal}
          onClose={() => setShowPerfilModal(false)}
        />
      )}
    </div>
  );
}