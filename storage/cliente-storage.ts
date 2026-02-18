import { create } from 'zustand';
import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import { CalendarioGeralResponse, FILTRO_CALENDARIO_GERAL_DEFAULT, FiltroCalendarioGeral } from './calendario-geral';

export interface WebCredencial {
  username: string;
  isWebActive: boolean;
  lastLogin: string; // ISO 8601 string
}

/**
 * Cliente Base (sem reservas)
 */


// Atualize a interface ClienteBase assim:
export interface ClienteBase {
  _id?: string;
  nome: string;
  tipo: 'externo' | 'sonangol';
  telefone: string;
  whatsapp: string;
  email: string;
  numeroCliente: string;
  status?: 'Ativo' | 'Inativo'; // ✅ Corrigido: 'Ativo' com A maiúsculo
  biPassaporte?: string;
  morada?: string;
  webCredencial?: WebCredencial;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Espaço/Local do Evento
 */
export interface Espaco {
  _id: string;
  nome: string;
  descricao?: string;
  capacidade: number;
  preco: number;
  tipo: 'Interno' | 'Externo';
  area?: number;
  equipamentos?: string[];
  disponivel?: boolean;
}

/**
 * Tipo de Evento
 */
export interface TipoEvento {
  _id: string;
  nome: string;
  descricao?: string;
  cor: string;
  icone: string;
  ativo?: boolean;
}

/**
 * Pagamento
 */
export interface Pagamento {
  _id: string;
  valorPago: number;
  dataPagamento: string; // ISO 8601
  formaPagamento: string; // Ex: "TRANSFERENCIA", "NUMERARIO", "TPA"
  status?: string;
  comprovativo?: string;
  observacoes?: string;
}

/**
 * Prejuízo (dentro de Caução)
 */
export interface Prejuizo {
  descricao: string;
  valorEstimado: number;
  dataOcorrencia: string;
  responsavel?: string;
  fotos?: string[];
  status: 'Pendente' | 'Aprovado' | 'Rejeitado';
}

/**
 * Caução
 */
export interface Caucao {
  _id: string;
  reservaId: string;
  valorCaucao: number;
  dataRecebimento: string; // ISO 8601
  formaPagamento: string;
  status: 'Ativa' | 'Devolvida' | 'Com Prejuízos' | 'Expirada' | 'Concluída';
  estadoCaucao: 'Pendente' | 'Devolvida' | 'Parcialmente Retida';
  saldoDisponivel: number;
  dataVencimento?: string;
  observacoes?: string;
  tecnicoResponsavel?: string;
  prejuizos?: Prejuizo[];
  valorRetido?: number;
  valorDevolvido?: number;
  dataDevolucao?: string;
  formaDevolucao?: string;
  observacoesDevolucao?: string;
  responsavelAprovacaoDevolucao?: string;
  comprovativoDevolucao?: string;
}

/**
 * Reserva Completa com todos os dados populados
 */
export interface ReservaCompleta {
  _id: string;
  clienteId?: string;
  ref: string;
  data: string; // ISO 8601
  horaInicio: string; // "HH:MM"
  horaTermino: string; // "HH:MM"

  // Datas calculadas (opcionais)
  dataInicioCompleto?: string;
  dataFimCompleto?: string;
  dataInicioProducao?: string | null;
  dataFimProducao?: string | null;

  // ✅ ATENÇÃO: Podem vir com nomes diferentes dependendo do populate
  espaco?: Espaco; // Se usar getClienteComReservasFuturas
  espacoId?: Espaco; // Se usar getClienteCompletoPopulate

  tipoEvento?: TipoEvento; // Se usar getClienteComReservasFuturas
  eventoId?: TipoEvento; // Se usar getClienteCompletoPopulate

  pagamentosDetalhes?: Pagamento[]; // Array de pagamentos detalhados
  pagamentos?: Pagamento[]; // Pode vir com este nome também

  caucoes: Caucao[]; // Sempre presente

  // Valores financeiros
  valor: number;
  totalPago: number;
  saldoPendente: number;
  paymentStatus: 'PENDENTE' | 'PARCIALMENTE_PAGO' | 'PAGO' | 'VENCIDO';

  // Status e detalhes
  status: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO' |  'Rascunho' | 'RASCUNHO' | "Cancelada" ;
  participants: number;
  paymentMethod?: string;
  description?: string;

  // Serviços
  decoracaoInterna?: boolean;
  cateringInterno?: boolean;
  djInterno?: boolean;
  decoracaoExterna?: boolean;
  cateringExterno?: boolean;
  djExterno?: boolean;

  // Contatos
  contactoDecoradora?: string;
  contactoCatering?: string;
  contactoDJ?: string;

  // Outros
  outrasInformacoes?: string;
  assinaturaFuncionario?: string;

  // Produção
  comProducao?: boolean;
  diasProducao?: number;

  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}


export interface GetClienteCompletoPopulateResponse extends ClienteBase {
  reservas: ReservaCompleta[];

  // Totais calculados
  totalReservas: number;
  totalValorReservas: number;
  totalPago: number;
  totalPendente: number;
}


export interface GetClienteComReservasFuturasResponse extends ClienteBase {
  reservasFuturas: ReservaCompleta[];
}

export interface GetReservaEspecificaResponse {
  cliente: ClienteBase;
  reserva: ReservaCompleta;
  totais?: {
    valorReserva: number;
    totalPago: number;
    saldoPendente: number;
    totalCaucoes: number;
    valorTotalCaucoes: number;
  };
}


export interface FiltroClienteReservas {
  numeroCliente: string;

  dataInicio?: Date | string;
  dataFim?: Date | string;

  status?: string;
  paymentStatus?: string;

  espacoId?: string;
  eventoId?: string;

  ordenarPor?: OrdenacaoReservaCliente;

  pagina?: number;
  itensPorPagina?: number;

  search?: string;
}

export interface ClienteCompletoComPaginacao {
  cliente: any;
  reservas: ReservaCompleta[];
  totalReservas: number;
  totalValorReservasPagina: number;
  totalPagoPagina: number;
  totalPendentePagina: number;
  paginacao: {
    paginaAtual: number;
    itensPorPagina: number;
    totalItens: number;
    totalPaginas: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number | null;
    prevPage: number | null;
  };
}
// storage/types/filtro-cliente-reservas.type.ts
export enum OrdenacaoReservaCliente {
  DATA_ASC = 'data_asc',
  DATA_DESC = 'data_desc',
  VALOR_ASC = 'valor_asc',
  VALOR_DESC = 'valor_desc',
  DATA_CRIACAO_ASC = 'createdAt_asc',
  DATA_CRIACAO_DESC = 'createdAt_desc'
}

export enum StatusReserva {
  CONCLUIDA = 'Concluída',
  CONFIRMADA = 'Confirmada',
  PENDENTE = 'Pendente',
  CANCELADA = 'Cancelada',
  PROCESSADA = 'Processada',
  RASCUNHO = 'Rascunho'
}

export enum StatusPagamentoReserva {
  PENDENTE = 'Pendente',
  PARCIAL = 'Parcial',
  PAGO = 'Pago',
  VENCIDA = 'Vencida',
  REEMBOLSADO = 'Reembolsado'
}

export interface FiltroClienteReservas {
  numeroCliente: string;

  dataInicio?: Date | string;
  dataFim?: Date | string;

  status?: string;
  paymentStatus?: string;

  espacoId?: string;
  eventoId?: string;

  ordenarPor?: OrdenacaoReservaCliente;

  pagina?: number;
  itensPorPagina?: number;

  search?: string;
}

export const FILTRO_CLIENTE_RESERVAS_DEFAULT: FiltroClienteReservas = {
  numeroCliente: '',
  ordenarPor: OrdenacaoReservaCliente.DATA_DESC,
  pagina: 1,
  itensPorPagina: 10
};
export function normalizarReserva(reserva: ReservaCompleta): ReservaCompleta {
  return {
    ...reserva,
    espaco: reserva.espaco || reserva.espacoId,
    tipoEvento: reserva.tipoEvento || reserva.eventoId,
    pagamentosDetalhes: reserva.pagamentosDetalhes || reserva.pagamentos || [],
  };
}

// storage/cliente-reservas-storage.ts


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009';

// ✅ API instance com autenticação
const clienteApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// ✅ Interceptor para adicionar token
clienteApi.interceptors.request.use((config) => {
  const token = Cookies.get('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Interceptor para tratar erros 401
clienteApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.error('❌ Token inválido - Redirecionando para login');

      // Limpar auth
      Cookies.remove('auth-token', { path: '/' });
      localStorage.removeItem('auth-storage');

      // Redirecionar
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
//================  CALENDARIO GERAL=========================

// ============ INTERFACES DO STORE ============

export interface ClienteReservasStore {

  // ============ CALENDÁRIO PORTAL ============
  calendarioPortal: CalendarioPortalResponse | null;
  loadingCalendarioPortal: boolean;
  filtroCalendarioPortal: FiltroCalendarioPortal;
  errorCalendarioPortal: string | null;

  // ============ AÇÕES DO CALENDÁRIO PORTAL ============
  getCalendarioPortal: (filtro: FiltroCalendarioPortal) => Promise<CalendarioPortalResponse>;
  setFiltroCalendarioPortal: (filtro: Partial<FiltroCalendarioPortal>) => void;
  limparCalendarioPortal: () => void;
  aplicarFiltroCalendarioPortal: () => Promise<void>;


  //====================ESTADO CALENDARIO GERAL=======================
  calendarioGeral: CalendarioGeralResponse | null;
  loadingCalendarioGeral: boolean;
  filtroCalendarioGeral: FiltroCalendarioGeral;
  errorCalendarioGeral: string | null;
  //=======================ACCAO CALENDARIO GERAL==================
  getCalendarioGeralReservas: (filtro?: FiltroCalendarioGeral) => Promise<CalendarioGeralResponse>;
  setFiltroCalendarioGeral: (filtro: Partial<FiltroCalendarioGeral>) => void;
  aplicarFiltroCalendarioGeral: () => Promise<void>;
  limparCalendarioGeral: () => void;
  //===========================================================================

  // Ações do calendário geral

  clientedata: ClienteBase;
  // Estado
  clienteCompleto: GetClienteCompletoPopulateResponse | null;
  reservasFuturas: GetClienteComReservasFuturasResponse | null;
  reservaEspecifica: GetReservaEspecificaResponse | null;
  loading: boolean;
  error: string | null;

  reservasPaginadas: ClienteCompletoComPaginacao | null;
  filtroAtual: FiltroClienteReservas;
  loadingFiltrado: boolean;

  limparFiltro: () => Promise<void>;
  getClienteCompletoFiltrado: (filtro: FiltroClienteReservas) => Promise<ClienteCompletoComPaginacao>;
  aplicarFiltro: (novoFiltro: Partial<FiltroClienteReservas>) => Promise<void>;
  mudarPagina: (pagina: number) => Promise<void>;

  // Ações
  createPortal: (clientedata: any, password: string) => Promise<ClienteBase>;
  updateClineteData: (clientedata: any) => Promise<ClienteBase>;
  findNumeracao: () => Promise<string>;
  getClienteCompletoPopulate: (numeroCliente: string) => Promise<void>;
  getClienteComReservasFuturas: (numeroCliente: string) => Promise<void>;
  getClienteCompletoEspecificoPopulate: (numeroCliente: string, reservaId: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}





// No arquivo store/types (acima da definição do store)

// ============ INTERFACES DO CALENDÁRIO PORTAL ============

export interface ReservaCalendarioPortal {
  id: string;
  horaInicio: string; // HH:mm
  horaFim: string;    // HH:mm
  dataInicioProducao?: Date;
  dataFimProducao?: Date;
  status: string;
  espaco?: string;
  evento?: string;
}

export interface DiaCalendarioPortal {
  dataCompleta: string; // YYYY-MM-DD
  diaNumero: number;
  vazio: boolean;
  temDisponibilidade: boolean;
  fimDeSemana: boolean;
  feriado: boolean;
  reservas: ReservaCalendarioPortal[];
  intervalosOcupados: IntervaloPortal[];  // ✅ Lista de intervalos
  intervalosDisponiveis: IntervaloPortal[];
} // ✅ Lista de intervalos}
export interface IntervaloPortal {
  inicio: string; // HH:mm
  fim: string;    // HH:mm
}
export interface CalendarioPortalResponse {
  periodo: {
    dataInicio: string;
    dataFim: string;
    totalDias: number;
  };
  dias: DiaCalendarioPortal[];
  // 🔥 NOVO: Configuração do negócio
  configuracao: {
    horarioFuncionamento: {
      inicio: string; // ex: "08:00"
      fim: string;    // ex: "22:00"
    };
    intervalosReserva: {
      duracaoMinima: number;    // minutos (ex: 30)
      intervaloMinimo: number;   // minutos entre reservas (ex: 15)
    };
  };
}

export interface FiltroCalendarioPortal {
  dataInicio: string; // YYYY-MM-DD
  dataFim: string;    // YYYY-MM-DD
  espacoId?: string;
}

export const FILTRO_CALENDARIO_PORTAL_DEFAULT: FiltroCalendarioPortal = {
  dataInicio: new Date().toISOString().split('T')[0],
  dataFim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias à frente
};


// ============ STORE ============

export const useClienteReservasStore = create<ClienteReservasStore>((set, get) => ({
  // ============ ESTADOS DO CALENDÁRIO PORTAL ============
  calendarioPortal: null,
  loadingCalendarioPortal: false,
  filtroCalendarioPortal: FILTRO_CALENDARIO_PORTAL_DEFAULT,
  errorCalendarioPortal: null,
  // ============ ESTADOS DO CALENDÁRIO GERAL ============
  calendarioGeral: null,
  loadingCalendarioGeral: false,
  filtroCalendarioGeral: FILTRO_CALENDARIO_GERAL_DEFAULT,
  errorCalendarioGeral: null,

  reservasPaginadas: null,
  filtroAtual: FILTRO_CLIENTE_RESERVAS_DEFAULT,
  loadingFiltrado: false,

  // ✅ Estado inicial
  clienteCompleto: null,
  clientedata: null,
  reservasFuturas: null,
  reservaEspecifica: null,
  loading: false,
  error: null,

  getCalendarioPortal: async (filtro: FiltroCalendarioPortal) => {
    console.log("📅 ========== BUSCANDO CALENDÁRIO DO PORTAL ==========");
    console.log("📅 Data Início:", filtro.dataInicio);
    console.log("📅 Data Fim:", filtro.dataFim);
    console.log("📅 Espaço ID:", filtro.espacoId || 'todos');

    set({ loadingCalendarioPortal: true, errorCalendarioPortal: null });

    try {
      const response = await clienteApi.post<CalendarioPortalResponse>(
        '/clientes/portal/calendario',
        filtro
      );

      console.log("✅ ========== CALENDÁRIO DO PORTAL CARREGADO ==========");
      console.log("✅ Período:", response.data.periodo.dataInicio, "a", response.data.periodo.dataFim);
      console.log("✅ Total Dias:", response.data.periodo.totalDias);
      console.log("✅ Dias com reservas:", response.data.dias.filter(d => d.reservas.length > 0).length);

      set({
        calendarioPortal: response.data,
        loadingCalendarioPortal: false,
        errorCalendarioPortal: null,
      });

      return response.data;
    } catch (error: any) {
      console.error("❌ ========== ERRO AO BUSCAR CALENDÁRIO DO PORTAL ==========");
      console.error("❌ Status:", error.response?.status);
      console.error("❌ Mensagem:", error.response?.data?.message);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Erro ao buscar calendário do portal';

      set({
        loadingCalendarioPortal: false,
        errorCalendarioPortal: errorMessage,
        calendarioPortal: null,
      });

      throw error;
    }
  },

  /**
   * ✅ Atualizar filtro do calendário do portal
   */
  setFiltroCalendarioPortal: (filtro: Partial<FiltroCalendarioPortal>) => {
    console.log("⚙️ Atualizando filtro do calendário portal:", filtro);

    set((state) => ({
      filtroCalendarioPortal: {
        ...state.filtroCalendarioPortal,
        ...filtro,
      },
    }));
  },

  /**
   * ✅ Aplicar filtro do calendário do portal
   */
  aplicarFiltroCalendarioPortal: async () => {
    const { filtroCalendarioPortal } = get();

    console.log("🔍 Aplicando filtro do calendário portal:", filtroCalendarioPortal);

    try {
      await get().getCalendarioPortal(filtroCalendarioPortal);
    } catch (error) {
      console.error("❌ Erro ao aplicar filtro:", error);
      throw error;
    }
  },

  /**
   * ✅ Limpar calendário do portal
   */
  limparCalendarioPortal: () => {
    console.log("🧹 Limpando calendário do portal");
    set({
      calendarioPortal: null,
      filtroCalendarioPortal: FILTRO_CALENDARIO_PORTAL_DEFAULT,
      errorCalendarioPortal: null
    });
  },

  // ============ AÇÕES DO CALENDÁRIO GERAL ============
  getCalendarioGeralReservas: async (filtro?: FiltroCalendarioGeral) => {
    const filtroFinal = filtro || get().filtroCalendarioGeral;

    console.log("📊 ========== BUSCANDO CALENDÁRIO GERAL ==========");
    console.log("📊 Mês:", filtroFinal.mes);
    console.log("📊 Ano:", filtroFinal.ano);
    console.log("📊 Espaço ID:", filtroFinal.espacoId || 'todos os espaços');

    set({ loadingCalendarioGeral: true, errorCalendarioGeral: null });

    try {
      const params = new URLSearchParams();
      if (filtroFinal.mes) params.append('mes', filtroFinal.mes.toString());
      if (filtroFinal.ano) params.append('ano', filtroFinal.ano.toString());
      if (filtroFinal.espacoId) params.append('espacoId', filtroFinal.espacoId);

      const response = await clienteApi.get<CalendarioGeralResponse>(
        `/clientes/calendario-geral?${params.toString()}`
      );

      console.log("✅ ========== CALENDÁRIO GERAL CARREGADO ==========");
      console.log("✅ Período:", response.data.calendario.mes, "/", response.data.calendario.ano);
      console.log("✅ Total Reservas:", response.data.estatisticas.totalReservas);
      console.log("✅ Ocupação Média:", response.data.estatisticas.ocupacaoMedia, "%");
      console.log("✅ Total Participantes:", response.data.estatisticas.totalParticipantes);

      set({
        calendarioGeral: response.data,
        loadingCalendarioGeral: false,
        errorCalendarioGeral: null,
      });

      return response.data;
    } catch (error: any) {
      console.error("❌ ========== ERRO AO BUSCAR CALENDÁRIO GERAL ==========");
      console.error("❌ Status:", error.response?.status);
      console.error("❌ Mensagem:", error.response?.data?.message);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Erro ao buscar calendário geral';

      set({
        loadingCalendarioGeral: false,
        errorCalendarioGeral: errorMessage,
        calendarioGeral: null,
      });

      throw error;
    }
  },

  setFiltroCalendarioGeral: (filtro: Partial<FiltroCalendarioGeral>) => {
    console.log("⚙️ Atualizando filtro do calendário geral:", filtro);

    set((state) => ({
      filtroCalendarioGeral: {
        ...state.filtroCalendarioGeral,
        ...filtro,
      },
    }));
  },

  aplicarFiltroCalendarioGeral: async () => {
    const { filtroCalendarioGeral } = get();

    console.log("🔍 Aplicando filtro do calendário geral:", filtroCalendarioGeral);

    try {
      await get().getCalendarioGeralReservas(filtroCalendarioGeral);
    } catch (error) {
      console.error("❌ Erro ao aplicar filtro calendário geral:", error);
      throw error;
    }
  },

  limparCalendarioGeral: () => {
    console.log("🧹 Limpando calendário geral");
    set({
      calendarioGeral: null,
      filtroCalendarioGeral: FILTRO_CALENDARIO_GERAL_DEFAULT,
      errorCalendarioGeral: null
    });
  },

  createPortal: async (clientedata: any, password: string) => {
    console.log("🔵 ========== CRIANDO PORTAL ==========");
    console.log("🔵 Cliente:", clientedata.nome);
    console.log("🔵 Email:", clientedata.email);
    console.log("🔵 Password:", password);

    set({ loading: true, error: null });

    try {
      const response = await clienteApi.post<ClienteBase>(
        `/clientes/createPortal/${password}`,
        clientedata
      );

      console.log("✅ ========== PORTAL CRIADO COM SUCESSO ==========");
      console.log("✅ Cliente criado:", response.data.nome);
      console.log("✅ Número do Cliente:", response.data.numeroCliente);

      // Atualizar o estado do cliente no store
      set({
        clientedata: response.data,
        loading: false,
        error: null,
      });

      console.log("✅ Estado atualizado com sucesso");

      // Retornar os dados do cliente criado (opcional)
      return response.data;
    } catch (error: any) {
      console.error("❌ ========== ERRO AO CRIAR PORTAL ==========");
      console.error("❌ Status:", error.response?.status);
      console.error("❌ Mensagem:", error.response?.data?.message);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Erro ao criar portal do cliente';

      set({
        loading: false,
        error: errorMessage,
      });

      throw error;
    }
  },
  updateClineteData: async (clientedata: any) => {
    console.log("🔄 ========== ATUALIZANDO DADOS DO CLIENTE ==========");
    console.log("🔄 Cliente ID:", clientedata._id);
    console.log("🔄 Dados a atualizar:", clientedata);

    set({ loading: true, error: null });

    try {
      // Extrair o ID e criar DTO sem _id para envio
      const { _id, ...updateData } = clientedata;

      if (!_id) {
        throw new Error("ID do cliente é necessário para atualização");
      }

      const response = await clienteApi.patch<ClienteBase>(
        `/clientes/${_id}`,
        updateData
      );

      console.log("✅ ========== DADOS ATUALIZADOS COM SUCESSO ==========");
      console.log("✅ Cliente atualizado:", response.data.nome);
      console.log("✅ Número do Cliente:", response.data.numeroCliente);

      // Atualizar o estado do cliente no store
      set((state) => ({
        clientedata: { ...state.clientedata, ...response.data },
        loading: false,
        error: null,
      }));

      console.log("✅ Estado atualizado com sucesso");

      // Retornar os dados do cliente atualizado
      return response.data;
    } catch (error: any) {
      console.error("❌ ========== ERRO AO ATUALIZAR CLIENTE ==========");
      console.error("❌ Status:", error.response?.status);
      console.error("❌ Mensagem:", error.response?.data?.message);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Erro ao atualizar dados do cliente';

      set({
        loading: false,
        error: errorMessage,
      });

      throw error;
    }
  },
  findNumeracao: async () => {
    console.log("🔵 ========== BUSCANDO NUMERAÇÃO ==========");

    set({ loading: true, error: null });

    try {
      const response = await clienteApi.get<any>(
        `/clientes/findNumeracao`
      );

      console.log("✅ ========== NUMERAÇÃO OBTIDA ==========");
      console.log("✅ Dados:", response.data);

      set({
        loading: false,
        error: null,
      });

      console.log("✅ Estado atualizado com sucesso");

      // Retornar os dados da numeração
      return response.data;
    } catch (error: any) {
      console.error("❌ ========== ERRO AO BUSCAR NUMERAÇÃO ==========");
      console.error("❌ Status:", error.response?.status);
      console.error("❌ Mensagem:", error.response?.data?.message);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Erro ao buscar numeração';

      set({
        loading: false,
        error: errorMessage,
      });

      throw error;
    }
  },
  getClienteCompletoEspecificoPopulate: async (numeroCliente: string, reservaId: string) => {
    console.log("🔵 ========== BUSCANDO RESERVA ESPECÍFICA ==========");
    console.log("🔵 Número Cliente:", numeroCliente);
    console.log("🔵 Reserva ID:", reservaId);

    set({ loading: true, error: null, reservaEspecifica: null });

    try {
      const response = await clienteApi.get<GetReservaEspecificaResponse>(
        `/clientes/reserva-especifica/${numeroCliente}/${reservaId}`
      );

      console.log("✅ ========== RESERVA ESPECÍFICA CARREGADA ==========");
      console.log("✅ Cliente:", response.data.cliente.nome);
      console.log("✅ Reserva Ref:", response.data.reserva.ref);
      console.log("✅ Cauções:", response.data.reserva.caucoes?.length || 0);

      set({
        reservaEspecifica: response.data,
        loading: false,
        error: null,
      });

      console.log("✅ Estado atualizado com sucesso");
    } catch (error: any) {
      console.error("❌ ========== ERRO AO BUSCAR RESERVA ESPECÍFICA ==========");
      console.error("❌ Status:", error.response?.status);
      console.error("❌ Mensagem:", error.response?.data?.message);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        `Erro ao buscar reserva ${reservaId} do cliente ${numeroCliente}`;

      set({
        loading: false,
        error: errorMessage,
        reservaEspecifica: null,
      });

      throw error;
    }
  },
  getClienteCompletoFiltrado: async (filtro: FiltroClienteReservas) => {
    console.log("🔵 ========== BUSCANDO RESERVAS FILTRADAS ==========");
    console.log("🔵 Filtro:", filtro);

    set({ loadingFiltrado: true, error: null });

    try {
      const params = {
        ...filtro,
        dataInicio: filtro.dataInicio
          ? new Date(filtro.dataInicio).toISOString()
          : undefined,
        dataFim: filtro.dataFim
          ? new Date(filtro.dataFim).toISOString()
          : undefined,
      };

      // Remover propriedades undefined
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await clienteApi.get<ClienteCompletoComPaginacao>(
        `/clientes/getReservaCompletaFiltrado`,
        { params }
      );

      set({
        reservasPaginadas: response.data,
        filtroAtual: filtro,
        loadingFiltrado: false,
        error: null,
      });

      console.log("✅ Reservas filtradas carregadas:", response.data);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Erro ao buscar reservas filtradas';

      set({
        loadingFiltrado: false,
        error: errorMessage,
      });

      throw error;
    }
  },

  // storage/cliente-storage.ts
  // No store, ajuste a função aplicarFiltro:
  aplicarFiltro: async (novoFiltro: Partial<FiltroClienteReservas>) => {
    const { filtroAtual } = get();

    // Converter 'todos' para undefined
    const filtroProcessado = {
      ...novoFiltro,
      status: novoFiltro.status === 'todos' ? undefined : novoFiltro.status,
      paymentStatus: novoFiltro.paymentStatus === 'todos' ? undefined : novoFiltro.paymentStatus,
      search: novoFiltro.search === '' ? undefined : novoFiltro.search,
      pagina: 1, // Sempre voltar para página 1 ao aplicar filtro
    };

    const filtroCompleto = {
      ...filtroAtual,
      ...filtroProcessado,
    };

    await get().getClienteCompletoFiltrado(filtroCompleto);
  },

  limparFiltro: async () => {
    const { filtroAtual } = get();
    const filtroLimpo = {
      ...FILTRO_CLIENTE_RESERVAS_DEFAULT,
      numeroCliente: filtroAtual.numeroCliente, // Mantém o número do cliente
    };

    await get().getClienteCompletoFiltrado(filtroLimpo);
  },

  mudarPagina: async (pagina: number) => {
    const { filtroAtual } = get();
    const novoFiltro = {
      ...filtroAtual,
      pagina,
    };

    await get().getClienteCompletoFiltrado(novoFiltro);
  },
  /**
   * ✅ Buscar cliente completo com todas as reservas
   * GET /clientes/getReservaCompleta/:numeroCliente
   */
  getClienteCompletoPopulate: async (numeroCliente: string) => {
    console.log("🔵 ========== BUSCANDO CLIENTE COMPLETO ==========");
    console.log("🔵 Número Cliente:", numeroCliente);

    set({ loading: true, error: null });

    try {
      const response = await clienteApi.get<GetClienteCompletoPopulateResponse>(
        `/clientes/getReservaCompleta/${numeroCliente}`
      );

      console.log("✅ ========== CLIENTE COMPLETO CARREGADO ==========");
      console.log("✅ Cliente:", response.data.nome);
      console.log("✅ Total Reservas:", response.data.totalReservas);
      console.log("✅ Total Valor:", response.data.totalValorReservas);

      set({
        clienteCompleto: response.data,
        loading: false,
        error: null,
      });

      console.log("✅ Estado atualizado com sucesso");
    } catch (error: any) {
      console.error("❌ ========== ERRO AO BUSCAR CLIENTE ==========");
      console.error("❌ Status:", error.response?.status);
      console.error("❌ Mensagem:", error.response?.data?.message);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Erro ao buscar dados do cliente';

      set({
        loading: false,
        error: errorMessage,
        clienteCompleto: null,
      });

      throw error;
    }
  },

  /**
   * ✅ Buscar apenas reservas futuras do cliente
   * GET /clientes/getReservasFuturas/:numeroCliente
   */
  getClienteComReservasFuturas: async (numeroCliente: string) => {
    console.log("🔵 ========== BUSCANDO RESERVAS FUTURAS ==========");
    console.log("🔵 Número Cliente:", numeroCliente);

    set({ loading: true, error: null });

    try {
      const response = await clienteApi.get<GetClienteComReservasFuturasResponse>(
        `/clientes/getReservasFuturas/${numeroCliente}`
      );

      console.log("✅ ========== RESERVAS FUTURAS CARREGADAS ==========");
      console.log("✅ Cliente:", response.data.nome);
      console.log("✅ Reservas Futuras:", response.data.reservasFuturas.length);

      set({
        reservasFuturas: response.data,
        loading: false,
        error: null,
      });

      console.log("✅ Estado atualizado com sucesso");
    } catch (error: any) {
      console.error("❌ ========== ERRO AO BUSCAR RESERVAS ==========");
      console.error("❌ Status:", error.response?.status);
      console.error("❌ Mensagem:", error.response?.data?.message);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Erro ao buscar reservas futuras';

      set({
        loading: false,
        error: errorMessage,
        reservasFuturas: null,
      });

      throw error;
    }
  },

  /**
   * ✅ Limpar erro
   */
  clearError: () => {
    console.log("🧹 Limpando erro");
    set({ error: null });
  },

  /**
   * ✅ Resetar todo o estado
   */
  reset: () => {
    console.log("🔄 Resetando store de reservas");
    set({
      clienteCompleto: null,
      reservasFuturas: null,
      loading: false,
      error: null,
    });
  },
}));
