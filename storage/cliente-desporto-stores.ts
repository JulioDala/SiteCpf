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
  tipoAtividade: TipoAtividadePopulado;
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

  // Novas propriedades para filtros e paginação
  desportosPaginados: DesportoCompletoComPaginacao | null;
  filtroAtualDesporto: FiltroDesporto;
  loadingFiltradoDesporto: boolean;
  errorFiltradoDesporto: string | null;

  // Novas ações
  getDesportosFiltrados: (filtro: FiltroDesporto) => Promise<DesportoCompletoComPaginacao>;
  aplicarFiltroDesporto: (novoFiltro: Partial<FiltroDesporto>) => Promise<void>;
  limparFiltroDesporto: () => Promise<void>;
  mudarPaginaDesporto: (pagina: number) => Promise<void>;

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

  desportoEspecifico: IDesportoRetorno | null;
  loadingEspecifico: boolean;
  errorEspecifico: string | null;

  fetchDesportoEspecifico: (email: string, id: string) => Promise<IDesportoRetorno[]>;

  createDesporto: (data: ICreateDesporto) => Promise<IDesportoRetorno>;
  loading: boolean;
}
// storage/types/filtro-desporto.type.ts
export enum OrdenacaoDesporto {
  DATA_INICIO_ASC = 'dataInicio_asc',
  DATA_INICIO_DESC = 'dataInicio_desc',
  DATA_CRIACAO_ASC = 'createdAt_asc',
  DATA_CRIACAO_DESC = 'createdAt_desc',
  NOME_EQUIPE_ASC = 'nomeEquipe_asc',
  NOME_EQUIPE_DESC = 'nomeEquipe_desc',
}

export interface FiltroDesporto {
  email: string;

  search?: string;

  dataInicio?: Date | string;
  dataFim?: Date | string;

  status?: string;
  statusPagamento?: string;

  campoId?: string;
  tipoAtividadeId?: string;

  ordenarPor?: OrdenacaoDesporto;

  pagina?: number;
  itensPorPagina?: number;
}

export const FILTRO_DESPORTO_DEFAULT: FiltroDesporto = {
  email: '',
  ordenarPor: OrdenacaoDesporto.DATA_CRIACAO_DESC,
  pagina: 1,
  itensPorPagina: 10
};

// Interface para resposta paginada
export interface DesportoCompletoComPaginacao {
  desportos: IDesportoRetorno[];
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
  filtrosAplicados: FiltroDesporto;
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
  desportosPaginados: null,
  filtroAtualDesporto: FILTRO_DESPORTO_DEFAULT,
  loadingFiltradoDesporto: false,
  errorFiltradoDesporto: null,

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
  loading: false,
  desportoEspecifico: null,
  loadingEspecifico: false,
  errorEspecifico: null,
  getDesportosFiltrados: async (filtro: FiltroDesporto) => {
    console.log("🔵 ========== BUSCANDO DESPORTOS FILTRADOS ==========");
    console.log("🔵 Filtro:", filtro);

    set({ loadingFiltradoDesporto: true, errorFiltradoDesporto: null });

    try {
      const params: any = {
        email: filtro.email,
        pagina: filtro.pagina || 1,
        itensPorPagina: filtro.itensPorPagina || 10,
      };

      // Adicionar parâmetros apenas se existirem
      if (filtro.ordenarPor) params.ordenarPor = filtro.ordenarPor;
      if (filtro.dataInicio) params.dataInicio = new Date(filtro.dataInicio).toISOString();
      if (filtro.dataFim) params.dataFim = new Date(filtro.dataFim).toISOString();
      if (filtro.status) params.status = filtro.status;
      if (filtro.statusPagamento) params.statusPagamento = filtro.statusPagamento;
      if (filtro.campoId) params.campoId = filtro.campoId;
      if (filtro.tipoAtividadeId) params.tipoAtividadeId = filtro.tipoAtividadeId;
      if (filtro.search) params.search = filtro.search;

      const response = await clienteApi.get<DesportoCompletoComPaginacao>(
        `/desporto-portal/filtrados`,
        { params }
      );

      set({
        desportosPaginados: response.data,
        filtroAtualDesporto: filtro,
        loadingFiltradoDesporto: false,
        errorFiltradoDesporto: null,
      });

      console.log("✅ Desportos filtrados carregados:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erro ao buscar desportos filtrados:", error);

      const errorMessage =
        error.response?.data?.message ||
        'Erro ao buscar desportos filtrados';

      set({
        loadingFiltradoDesporto: false,
        errorFiltradoDesporto: errorMessage,
      });

      throw error;
    }
  },

  // ✅ Aplicar filtro
 aplicarFiltroDesporto: async (novoFiltro: Partial<FiltroDesporto>) => {
  const { filtroAtualDesporto } = get();

  // Converter 'todos' para undefined (string vazia)
  const filtroProcessado = {
    ...novoFiltro,
    status: novoFiltro.status === 'todos' ? undefined : novoFiltro.status,
    statusPagamento: novoFiltro.statusPagamento === 'todos' ? undefined : novoFiltro.statusPagamento,
    search: novoFiltro.search === '' ? undefined : novoFiltro.search,
    pagina: 1, // Sempre voltar para página 1 ao aplicar filtro
  };

  const filtroCompleto = {
    ...filtroAtualDesporto,
    ...filtroProcessado,
  };

  await get().getDesportosFiltrados(filtroCompleto);
},

  // ✅ Limpar filtro
  limparFiltroDesporto: async () => {
    const { filtroAtualDesporto } = get();
    const filtroLimpo = {
      ...FILTRO_DESPORTO_DEFAULT,
      email: filtroAtualDesporto.email, // Mantém o email
    };

    await get().getDesportosFiltrados(filtroLimpo);
  },

  // ✅ Mudar página
  mudarPaginaDesporto: async (pagina: number) => {
    const { filtroAtualDesporto } = get();
    const novoFiltro = {
      ...filtroAtualDesporto,
      pagina,
    };

    await get().getDesportosFiltrados(novoFiltro);
  },
  // ✅ MÉTODO para buscar desporto específico
  fetchDesportoEspecifico: async (email: string, id: string) => {
    console.log("🔵 ========== BUSCANDO DESPORTO ESPECÍFICO ==========");
    console.log("🔵 Email:", email);
    console.log("🔵 ID:", id);

    set({
      loadingEspecifico: true,
      errorEspecifico: null,
      desportoEspecifico: null
    });

    try {
      const response = await clienteApi.get<IDesportoRetorno[]>(
        `/desporto-portal/getDesportoCompletoPopulateEspecifico`,
        {
          params: { email, id }
        }
      );

      const data = response.data;

      console.log("✅ ========== DESPORTO ESPECÍFICO CARREGADO ==========");
      console.log("✅ Dados retornados:", data);

      // O método retorna um array, então pegamos o primeiro elemento se existir
      const desportoEncontrado = data && data.length > 0 ? data[0] : null;

      if (desportoEncontrado) {
        console.log("✅ Desporto encontrado:", desportoEncontrado.nomeEquipe);
        set({
          desportoEspecifico: desportoEncontrado,
          loadingEspecifico: false,
          errorEspecifico: null
        });
      } else {
        console.log("❌ Nenhum desporto encontrado");
        set({
          loadingEspecifico: false,
          errorEspecifico: 'Desporto não encontrado'
        });
      }

      return data;

    } catch (error: any) {
      console.error("❌ ========== ERRO AO BUSCAR DESPORTO ==========");
      console.error("❌ Status:", error.response?.status);
      console.error("❌ Mensagem:", error.response?.data?.message);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        `Erro ao buscar desporto ${id} para o email ${email}`;

      set({
        loadingEspecifico: false,
        errorEspecifico: errorMessage,
        desportoEspecifico: null
      });

      throw error;
    }
  },
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
      set({ loading: true });
      const response = await clienteApi.post('/desporto-portal/create-desporto-portal', data);
      const created: IDesportoRetorno = response.data;

      // Se tiver email nos dados, atualiza as estatísticas
      if (data.email) {
        // Aguarda um pouco antes de atualizar para garantir que o backend processou
        setTimeout(() => {
          get().fetchDesportosEstatistica(data.email!);
          set({ loading: false });
        }, 1000);
      }

      return created;
    } catch (error: any) {
      set({ loading: false });
      console.error("Erro ao criar desporto:", error);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Erro ao criar desporto'
      );
    }
  },
}));