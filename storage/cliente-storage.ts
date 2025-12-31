import { create } from 'zustand';
import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

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
  status: 'PENDENTE' | 'CONFIRMADO' | 'CANCELADO' | 'CONCLUIDO';
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

// ============ INTERFACES DO STORE ============

export interface ClienteReservasStore {


  clientedata: ClienteBase;
  // Estado
  clienteCompleto: GetClienteCompletoPopulateResponse | null;
  reservasFuturas: GetClienteComReservasFuturasResponse | null;
  reservaEspecifica: GetReservaEspecificaResponse | null;
  loading: boolean;
  error: string | null;



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

// ============ STORE ============

export const useClienteReservasStore = create<ClienteReservasStore>((set) => ({
  // ✅ Estado inicial
  clienteCompleto: null,
  clientedata: null,
  reservasFuturas: null,
  reservaEspecifica: null,
  loading: false,
  error: null,


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
