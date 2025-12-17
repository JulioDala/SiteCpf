// stores/backendReservaStore.ts
import { create } from "zustand";
import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";
import { LocalEvento } from "./espaco-store";
import { TipoEvento } from "./cliente-storage";
import { fa } from "zod/v4/locales";
import { string } from "zod";

interface FamilyMember {
  nome: string;
  parentesco: string;
  menorInscrever: boolean;
}
export interface BackendPagamento {
  _id: string;
  clienteId: ClienteData;
  reservaId: BackendReserva;
  valorPago: number;
  dataPagamento: string;
  formaPagamento: string;
  observacoes?: string;
  status: "Pago" | "Pendente" | "Parcial" | "Cancelado";
  documentos?: Array<{
    _id: string;
    numero: string;
    dataEmissao: string;
    valorTotal: number;
    observacoes?: string;
    tipo: "Fatura" | "Recibo" | "Comprovativo";
    arquivoUrl: string;
    formato: string;
  }>;
  aprovadoPor?: string;
  dataAprovacao?: string;
  historicoAlteracoes?: Array<{
    usuario: string;
    data: string;
    alteracao: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
export interface ClienteData {
  _id: string;
  nome: string;
  telefone: string;
  whatsapp: string;
  email: string;
  nacionalidade?: string;
  biPassaporte?: string;
  morada?: string;
  tipo?: string;
  numeroCliente?: string;
  membrosAgregado?: FamilyMember[];
  dataAutorizacao?: {
    dia: string;
    mes: string;
    ano: string;
  };
  dataFinal: {
    dia: string;
    mes: string;
    ano: string;
  };
}

export interface BackendReserva {
  _id: string;
  clienteId: ClienteData;
  data: string;
  horaInicio: string;
  horaTermino: string;
  espacoId: LocalEvento;
  eventoId: TipoEvento;
  valor: number;
  status: "Confirmada" | "Pendente" | "Cancelada" | "Processada" | "Concluída" | "Rascunho";
  participants: number;
  paymentStatus: "Pago" | "Pendente" | "Cancelado" | "Parcial";
  paymentMethod: string;
  description?: string;
  decoracaoInterna: boolean;
  cateringInterno: boolean;
  djInterno: boolean;
  decoracaoExterna: boolean;
  cateringExterno: boolean;
  djExterno: boolean;
  contactoDecoradora: string;
  contactoCatering: string;
  contactoDJ: string;
  outrasInformacoes: string;
  assinaturaFuncionario: string;
  comProducao: boolean;
  diasProducao: number;
  saldoPendente: number;
  pagamentos: BackendPagamento[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  clientEmail: string;
  clientPhone: string;
  clientNome: string;
  clientWhatsapp: string;
  clientBiPassaporte?: string;
  clientMorada?: string;
}

export interface CreateReservaPayload {
  clienteId: string;
  data: string;
  horaInicio: string;
  horaTermino: string;
  espacoId: string;
  eventoId: string;
  valor: number;
  status?: "Confirmada" | "Pendente" | "Cancelada" | "Processada" | "Concluída" | "Rascunho";
  participants: number;
  paymentStatus?: "Pago" | "Pendente" | "Cancelado" | "Parcial";
  paymentMethod?: string;
  description?: string;
  decoracaoInterna?: boolean;
  cateringInterno?: boolean;
  djInterno?: boolean;
  decoracaoExterna?: boolean;
  cateringExterno?: boolean;
  djExterno?: boolean;
  contactoDecoradora?: string;
  contactoCatering?: string;
  contactoDJ?: string;
  outrasInformacoes?: string;
  comProducao?: boolean;
  diasProducao?: number;
}

interface BackendReservaState {
  reservas: BackendReserva[];
  reservaEstatistica: ReservaEstatisticas | null;
  errorEstatistica:string | null;
  loadingEstatistica:boolean
  loading: boolean;
  error: string | null;
  fetchEstatisticaReserva: (idCliente: string) => Promise<void>;
  createReserva: (data: CreateReservaPayload) => Promise<BackendReserva>;
  clearError: () => void;
  reset: () => void;
}
export interface ReservaEstatisticas {
  proximaReserva: ProximaReserva | null;
  reservaAtiva: number;
  totalReserva: number;
}

export interface ProximaReserva {
  data: string;
  espaco: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3009";

const reservaApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

reservaApi.interceptors.request.use((config) => {
  const token = Cookies.get('auth-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

reservaApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('auth-token', { path: '/' });
      localStorage.removeItem('auth-storage');

      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const useBackendReservaStore = create<BackendReservaState>((set) => ({
  reservas: [],
  reservaEstatistica: null,

  loading: false,
  error: null,
  loadingEstatistica:false,
  errorEstatistica: null,

  createReserva: async (data) => {
    set({ loading: true, error: null });

    try {
      const response = await reservaApi.post<BackendReserva>("/reservas/CLientecreate", data);

      set((state) => ({
        reservas: [response.data, ...state.reservas],
        loading: false,
        error: null,
      }));

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Erro ao criar reserva";

      set({
        loading: false,
        error: errorMessage,
      });

      throw error;
    }
  },
   fetchEstatisticaReserva: async (idCliente: string): Promise<void> => {
    if (!idCliente || idCliente.trim() === '') {
      set({ 
        errorEstatistica: 'ID do cliente não fornecido',
        loadingEstatistica: false 
      });
      return;
    }

    set({ 
      loadingEstatistica: true, 
      errorEstatistica: null 
    });

    try {
      const response = await reservaApi.get<ReservaEstatisticas>(
        `/reservas/estatisticas-cliente/${encodeURIComponent(idCliente)}`
      );

      const data = response.data;

      set({
        reservaEstatistica: data,
        loadingEstatistica: false,
        errorEstatistica: null
      });

    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Erro ao buscar estatísticas de reserva";

      set({
        loadingEstatistica: false,
        errorEstatistica: errorMessage,
      });
      throw new Error(errorMessage);
    }
  },

  clearError: () => {
    set({ error: null, errorEstatistica: null });
  },

  reset: () => {
    set({
      reservas: [],
      reservaEstatistica: null,
      loading: false,
      loadingEstatistica: false,
      error: null,
      errorEstatistica: null,
    });
  },
}));