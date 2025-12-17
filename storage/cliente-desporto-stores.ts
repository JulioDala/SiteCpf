import { create } from "zustand";
import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
// interfaces/types para os dados populados
export interface CampoPopulado {
  _id: string;
  nome: string;
  status: string;
}

export interface TipoAtividadePopulado {
  _id: string;
  nome: string;
  descricao?: string;
  status: string;
}

export interface ICreateDesporto {
  nomeEquipe: string;
  nomeResponsavel: string;
  email?: string;
  morada?: string;
  bi?: string;
  contato: string;
  diasSemana: string[];
  horarioInicio: string;
  horarioFim: string;
  tipoAtividade: string; // MongoId como string para criação
  corIdentificacao: string;
  valorPagamento: number;
  modalidadePagamento: string;
  tipoPeriodo: string;
  vendaIngresso: string;
  valorIngresso: number;
  valorCaucao: number;
  dataInicio: string;
  dataFim?: string;
  situacao?: string;
  status: 'Ativo' | 'Pendente' | 'Suspenso' | 'Cancelado' | 'Rascunho';
  campo: string; // MongoId como string para criação
  statusPagamento?: string;
  observacoesAdicionais?: string;
}

export interface IPrejuizo {
  descricao: string;
  valor: number;
}

export type StatusCaucaoType = 'Pendente' | 'Pago/Adicional' | 'Pago/Devolvido';

export interface ICaucaoPagamento {
  _id: string;
  desportoId: string;
  valorAPagar: number;
  totalPrejuizo: number;
  valorDevolvido: number;
  valorAdicionar: number;
  prejuizos: IPrejuizo[];
  status: StatusCaucaoType;
}

export type PagamentoStatus = 'em dia' | 'concluido' | 'expirado';
export type PaymentMethod = 'Dinheiro' | 'Cartão' | 'Transferência' | string;

export interface IPagamentoDesporto {
  _id: string;
  desportoId: string;
  valorPago: number;
  dataPagamento: Date;
  formaPagamento: PaymentMethod;
  observacoes?: string;
  user: string;
  arquivos?: string[];
  status: PagamentoStatus;
}

// Interface principal atualizada
export interface IDesportoRetorno {
  // Dados básicos
  _id: string;
  nomeEquipe: string;
  nomeResponsavel: string;
  email?: string;
  morada?: string;
  bi?: string;
  contato: string;
  diasSemana: string[];
  horarioInicio: string;
  horarioFim: string;
  
  // Campos populados (agora são objetos)
  tipoAtividade: TipoAtividadePopulado ;
  corIdentificacao: string;
  valorPagamento: number;
  modalidadePagamento: string;
  tipoPeriodo: string;
  vendaIngresso: string;
  valorIngresso: number;
  valorCaucao: number;
  dataInicio: Date;
  dataFim?: Date;
  situacao?: string;
  status: string;
  campo: CampoPopulado;
  statusPagamento?: string;
  observacoesAdicionais?: string;

  // Valores calculados
  valorPago?: number;
  valorPendente?: number;
  ultimoPagamento?: Date;

  // Relacionados
  pagamentos: IPagamentoDesporto[];
  caucoes: ICaucaoPagamento[];

  // Totais
  totalPagamentos: number;
  totalPago: number;
  totalCaucoes: number;
  totalCaucaoPago: number;
  totalCaucaoPendente: number;
}

export interface DesportoEstatisticas {
  desportosAtivos: number;
  camposNome: string[];
  totalDesporto: number;
}
export interface ICreateDesporto {
  nomeEquipe: string;
  nomeResponsavel: string;
  email?: string;
  morada?: string;
  bi?: string;
  contato: string;
  diasSemana: string[];
  horarioInicio: string;
  horarioFim: string;
  tipoAtividade: string;
  corIdentificacao: string;
  valorPagamento: number;
  modalidadePagamento: string;
  tipoPeriodo: string;
  vendaIngresso: string;
  valorIngresso: number;
  valorCaucao: number;
  dataInicio: string;
  dataFim?: string;
  situacao?: string;
  status: 'Ativo' | 'Pendente' | 'Suspenso' | 'Cancelado' | 'Rascunho';
  campo: string;
  statusPagamento?: string;
  observacoesAdicionais?: string;
}

export interface IPrejuizo {
  descricao: string;
  valor: number;
}


export interface ICaucaoPagamento {
  _id: string;
  desportoId: string;
  valorAPagar: number;
  totalPrejuizo: number;
  valorDevolvido: number;
  valorAdicionar: number;
  prejuizos: IPrejuizo[];
  status: StatusCaucaoType;
}


export interface IPagamentoDesporto {
  _id: string;
  desportoId: string;
  valorPago: number;
  dataPagamento: Date;
  formaPagamento: PaymentMethod;
  observacoes?: string;
  user: string;
  arquivos?: string[];
  status: PagamentoStatus;
}



export interface DesportoEstatisticas {
  desportosAtivos: number;
  camposNome: string[];
  totalDesporto: number;
}

interface IUseDesportoStore {
  desportosFuturos: IDesportoRetorno[];
  fetchDesportosFuturos: (email: string) => Promise<IDesportoRetorno[]>;
  errorFuturos: boolean;
  loadingFuturos: boolean;

  desportoEstatistica: DesportoEstatisticas | null;
  fetchDesportosEstatistica: (email: string) => Promise<void>;
  errorEstatistica: boolean;
  loadingEstatistica: boolean;

  desportosCompletos: IDesportoRetorno[];
  fetchDesportosCompletos: (email: string) => Promise<IDesportoRetorno[]>;
  errorCompletos: boolean;
  loadingCompletos: boolean;

  createDesporto: (data: ICreateDesporto) => Promise<IDesportoRetorno>;
}

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

export const useDesportoStore = create<IUseDesportoStore>((set, get) => ({
  // Estado inicial
  desportosFuturos: [],
  desportoEstatistica: null,
  errorFuturos: false,
  loadingFuturos: false,
  errorEstatistica: false, // Faltava inicializar
  loadingEstatistica: false, // Faltava inicializar
  desportosCompletos: [],
  errorCompletos: false,
  loadingCompletos: false,

  // Método para buscar estatísticas
  fetchDesportosEstatistica: async (email: string) => {
    set({ loadingEstatistica: true, errorEstatistica: false });
    try {
      const response = await clienteApi.get(`/desporto-portal/estatisticas/${encodeURIComponent(email)}`);
      const data: any = response.data;
      console.log("Estatísticas carregadas:", data);
      set({
        desportoEstatistica: data,
        loadingEstatistica: false
      });
    } catch (error: any) {
      console.error("Erro ao buscar estatísticas:", error);
      set({
        errorEstatistica: true,
        loadingEstatistica: false,
        desportoEstatistica: null
      });

      // Lançar erro para tratamento no componente
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Erro ao buscar estatísticas'
      );
    }
  },

  // Método para buscar desportos futuros
  fetchDesportosFuturos: async (email: string) => {
    set({ loadingFuturos: true, errorFuturos: false });
    try {
      const response = await clienteApi.get(`/desporto-portal/futuros/${email}`);
      const data: IDesportoRetorno[] = response.data;
      set({ desportosFuturos: data, loadingFuturos: false });
      return data;
    } catch (error: any) {
      console.error("Erro ao buscar desportos futuros:", error);
      set({ errorFuturos: true, loadingFuturos: false });

      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Erro ao buscar desportos futuros'
      );
    }
  },

  // Método para buscar desportos completos
  fetchDesportosCompletos: async (email: string) => {
    set({ loadingCompletos: true, errorCompletos: false });
    try {
      const response = await clienteApi.get(`/desporto-portal/completo/${email}`);
      const data: IDesportoRetorno[] = response.data;
      console.log("completo timaopagem", data);
      set({ desportosCompletos: data, loadingCompletos: false });
      return data;
    } catch (error: any) {
      console.error("Erro ao buscar desportos completos:", error);
      set({ errorCompletos: true, loadingCompletos: false });

      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Erro ao buscar desportos completos'
      );
    }
  },

  // Método para criar desporto
  createDesporto: async (data: ICreateDesporto) => {
    try {
      const response = await clienteApi.post('/desporto-portal/create-desporto-portal', data);
      const created: IDesportoRetorno = response.data;

      // Se tiver email nos dados, atualiza as estatísticas
      if (data.email) {
        // Aguarda um pouco antes de atualizar para garantir que o backend processou
        setTimeout(() => {
          get().fetchDesportosEstatistica(data.email!);
        }, 1000);
      }

      return created;
    } catch (error: any) {
      console.error("Erro ao criar desporto:", error);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Erro ao criar desporto'
      );
    }
  },
}));