
export enum TipoEntidade {
  PAGAMENTO_DESPORTO = "PAGAMENTO_DESPORTO",
  PAGAMENTO_RESERVA = "PAGAMENTO_RESERVA",
  CAUCAO_DESPORTO = "CAUCAO_DESPORTO",
  CAUCAO_RESERVA = "CAUCAO_RESERVA"
}

export enum TipoAcao {
  CRIADO = "CRIADO",
  ATUALIZADO = "ATUALIZADO",
  APROVADO = "APROVADO",
  REJEITADO = "REJEITADO",
  DEVOLVIDO = "DEVOLVIDO",
  PAGO = "PAGO"
}

export enum StatusNotificacao {
  VISUALIZADA = "VISUALIZADA",
  NAO_VISUALIZADA = "NAO_VISUALIZADA"
}

// Interface dos dados adicionais (exatamente como no schema)
export interface DadosAdicionaisNotificacao {
  valor?: number;
  formaPagamento?: string;
  statusAnterior?: string;
  statusAtual?: string;
}

// Interface principal da Notificação
export interface Notificacao {
  _id: string;
  tipoEntidade: TipoEntidade;
  tipoAcao: TipoAcao;
  idEntidade: string;
  email: string;
  titulo: string;
  mensagem: string;
  status: StatusNotificacao;
  dadosAdicionais?: DadosAdicionaisNotificacao;
  dataVisualizacao?: string | null;
  createdAt: string;
  updatedAt: string;
}
// Mude de IMarcacarTodos para (ou crie nova):
export interface IMarcarTodasVisualizadasResponse {
  sucesso: boolean;
  mensagem: string;
  totalAtualizado: number;
  email: string;
  dataAtualizacao?: string;
  detalhes?: {
    matchedCount?: number;
    modifiedCount?: number;
    acknowledged?: boolean;
  };
}

// stores/useNotificacaoStore.ts
import { create } from "zustand";
import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

// Interface para resposta de contagem
interface ContagemResponse {
  count: number;
}

// Interface para resposta de remoção
interface RemocaoResponse {
  message: string;
  deleted: boolean;
}

// Interface para resposta ordenada
interface NotificacoesOrdenadasResponse {
  notificacoes: Notificacao[];
  total: number;
  naoVisualizadas: number;
}

// Interface do store
interface IUseNotificacaoStore {
  // Estado
  notificacoes: Notificacao[];
  notificacoesOrdenadas: Notificacao[];
  loading: boolean;
  error: string | null;
  contagemNaoVisualizadas: number;
  totalNotificacoes: number;

  // Métodos
  buscarNotificacoesPorEmail: (
    email: string,
    status?: StatusNotificacao,
    tipoEntidade?: TipoEntidade
  ) => Promise<Notificacao[]>;

  buscarNotificacoesOrdenadas: (email: string) => Promise<NotificacoesOrdenadasResponse>;

  contarNotificacoesNaoVisualizadas: (email: string) => Promise<number>;

  marcarComoVisualizada: (id: string) => Promise<Notificacao>;
  marcarTodasComoVisualizada: (email: string) => Promise<IMarcarTodasVisualizadasResponse>;

  removerNotificacao: (id: string) => Promise<boolean>;

  // Método para buscar e atualizar automaticamente
  buscarEAtualizarNotificacoes: (email: string) => Promise<void>;

  // Limpar estado
  limparNotificacoes: () => void;
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

export const useNotificacaoStore = create<IUseNotificacaoStore>((set, get) => ({
  // Estado inicial
  notificacoes: [],
  notificacoesOrdenadas: [],
  loading: false,
  error: null,
  contagemNaoVisualizadas: 0,
  totalNotificacoes: 0,

  // Buscar notificações por email com filtros opcionais
  buscarNotificacoesPorEmail: async (
    email: string,
    status?: StatusNotificacao,
    tipoEntidade?: TipoEntidade
  ): Promise<Notificacao[]> => {
    set({ loading: true, error: null });

    try {
      // Construir query string
      const queryParams = new URLSearchParams();
      if (status) queryParams.append('status', status);
      if (tipoEntidade) queryParams.append('tipoEntidade', tipoEntidade);

      const queryString = queryParams.toString();
      const url = `/notificacoes/${encodeURIComponent(email)}${queryString ? `?${queryString}` : ''}`;

      const response = await clienteApi.get<Notificacao[]>(url);
      const notificacoes = response.data;

      set({
        notificacoes,
        loading: false,
        totalNotificacoes: notificacoes.length,
        contagemNaoVisualizadas: notificacoes.filter(n => n.status === StatusNotificacao.NAO_VISUALIZADA).length
      });

      return notificacoes;
    } catch (error: any) {
      console.error("Erro ao buscar notificações:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao buscar notificações';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  buscarNotificacoesOrdenadas: async (email: string): Promise<NotificacoesOrdenadasResponse> => {
    set({ loading: true, error: null });

    try {
      const response = await clienteApi.get<NotificacoesOrdenadasResponse>(
        `/notificacoes/ordenadas/${encodeURIComponent(email)}`
      );
      const result = response.data;

      // Atualizar o estado
      set({
        notificacoesOrdenadas: result.notificacoes,
        loading: false,
        totalNotificacoes: result.total,
        contagemNaoVisualizadas: result.naoVisualizadas
      });

      // IMPORTANTE: Retornar os dados
      return result;
    } catch (error: any) {
      console.error("Erro ao buscar notificações ordenadas:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao buscar notificações ordenadas';
      set({ error: errorMessage, loading: false });
      throw new Error(errorMessage);
    }
  },

  // Contar notificações não visualizadas
  contarNotificacoesNaoVisualizadas: async (email: string): Promise<number> => {
    try {
      const response = await clienteApi.get<ContagemResponse>(
        `/notificacoes/contagem/${encodeURIComponent(email)}`
      );
      const { count } = response.data;

      set({ contagemNaoVisualizadas: count });
      return count;
    } catch (error: any) {
      console.error("Erro ao contar notificações:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao contar notificações';
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },


  marcarTodasComoVisualizada: async (email: string): Promise<IMarcarTodasVisualizadasResponse> => {
    set({ loading: true });

    try {
      const response = await clienteApi.put<IMarcarTodasVisualizadasResponse>(
        `/notificacoes/marcarTodasComoVisualizadas/${email}`
      );

      const resultado = response.data;

      if (resultado.sucesso) {
        // Zerar contagem para este email
        set((state) => ({
          contagemNaoVisualizadas: Math.max(0, state.contagemNaoVisualizadas - resultado.totalAtualizado),
          loading: false
        }));

        // Recarregar notificações para atualizar a lista
        await get().buscarNotificacoesOrdenadas(email);
      }

      return resultado;

    } catch (error: any) {
      set({ loading: false, error: error.message });
      throw error;
    }
  },
  // Marcar notificação como visualizada
  marcarComoVisualizada: async (id: string): Promise<Notificacao> => {
    try {
      const response = await clienteApi.put<Notificacao>(
        `/notificacoes/marcarComoVisualizada/${id}`
      );
      const notificacaoAtualizada = response.data;

      // Atualizar no estado local
      set((state) => ({
        notificacoes: state.notificacoes.map(n =>
          n._id === id ? notificacaoAtualizada : n
        ),
        notificacoesOrdenadas: state.notificacoesOrdenadas.map(n =>
          n._id === id ? notificacaoAtualizada : n
        ),
        contagemNaoVisualizadas: Math.max(0, state.contagemNaoVisualizadas - 1)
      }));

      return notificacaoAtualizada;
    } catch (error: any) {
      console.error("Erro ao marcar notificação como visualizada:", error);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Erro ao marcar notificação como visualizada'
      );
    }
  },

  // Remover notificação
  removerNotificacao: async (id: string): Promise<boolean> => {
    try {
      const response = await clienteApi.delete<RemocaoResponse>(
        `/notificacoes/removerNotificacao/${id}`
      );
      const { deleted } = response.data;

      if (deleted) {
        // Remover do estado local
        set((state) => {
          const notificacaoRemovida = state.notificacoes.find(n => n._id === id);
          const eraNaoVisualizada = notificacaoRemovida?.status === StatusNotificacao.NAO_VISUALIZADA;

          return {
            notificacoes: state.notificacoes.filter(n => n._id !== id),
            notificacoesOrdenadas: state.notificacoesOrdenadas.filter(n => n._id !== id),
            totalNotificacoes: state.totalNotificacoes - 1,
            contagemNaoVisualizadas: eraNaoVisualizada
              ? Math.max(0, state.contagemNaoVisualizadas - 1)
              : state.contagemNaoVisualizadas
          };
        });
      }

      return deleted;
    } catch (error: any) {
      console.error("Erro ao remover notificação:", error);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Erro ao remover notificação'
      );
    }
  },

  // Método combinado para buscar e atualizar notificações
  buscarEAtualizarNotificacoes: async (email: string): Promise<void> => {
    try {
      // Buscar contagem
      await get().contarNotificacoesNaoVisualizadas(email);

      // Buscar notificações ordenadas
      await get().buscarNotificacoesOrdenadas(email);

    } catch (error: any) {
      console.error("Erro ao buscar e atualizar notificações:", error);
      throw error;
    }
  },

  // Limpar estado
  limparNotificacoes: () => {
    set({
      notificacoes: [],
      notificacoesOrdenadas: [],
      loading: false,
      error: null,
      contagemNaoVisualizadas: 0,
      totalNotificacoes: 0
    });
  }
}));