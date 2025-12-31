// storage/atuh-storage.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';
import { ClienteBase } from './cliente-storage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009';

const publicApi = axios.create({
  baseURL: API_BASE_URL,
});

const privateApi: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

privateApi.interceptors.request.use((config) => {
  const store = useAuthStore.getState();
  if (store.userLogin?.accessToken) {
    config.headers.Authorization = `Bearer ${store.userLogin.accessToken}`;
  }
  return config;
});

privateApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await useAuthStore.getState().refreshToken();
        const newToken = useAuthStore.getState().userLogin?.accessToken;

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return privateApi(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export interface UserLogin {
  accessToken: string;
  refreshToken: string;
  cliente: {
    _id: string;
    nome: string;
    tipo: string;
    telefone: string;
    whatsapp: string;
    email: string;
    numeroCliente: string;
    status: string;
    biPassaporte: string;
    morada: string;
    webCredencial: {
      isWebActive: boolean;
      lastLogin: string | null;
      username: string;
    };
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}

export interface IAlterarSenha {
  senhaAtual: string;
  novaSenha: string;
}

export interface IALoginData {
  username: string;
  password: string;
}

export interface AuthStore {
  userLogin: UserLogin | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;

  //COISAS DO FINDBYEMAIL
  clienteFindByEmail: ClienteBase | null; // ✅ Mudado para permitir null
  loadingFindByEmail: boolean;
  errorFindByEmail: string | null;
  findByEmail: (email: string) => Promise<ClienteBase>; // ✅ Adiciona parâmetro email

  login: (data: IALoginData) => Promise<void>;
  refreshToken: () => Promise<void>;
  getProfile: () => Promise<void>;
  alterarSenha: (data: IAlterarSenha) => Promise<void>;

  recuperarSenha: (email: string, data: IAlterarSenha) => Promise<void>;

  clearFindByEmailError: () => void;
  clearFindByEmailData: () => void;
  resetFindByEmail: () => void;

  logout: () => Promise<void>;
  initialize: () => void;
  clearError: () => void;
}

const COOKIE_OPTIONS = {
  expires: 7,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({

      clienteFindByEmail: null,
      loadingFindByEmail: false,
      errorFindByEmail: null,

      userLogin: null,
      loading: false,
      error: null,
      isInitialized: false,

      // ✅ SOLUÇÃO: Initialize NÃO salva cookie - apenas sincroniza
      initialize: () => {
        console.log("🔄 Inicializando AuthStore...");

        const state = get();
        const cookieToken = Cookies.get('auth-token');

        console.log("📊 Estado atual:");
        console.log("  - Token no localStorage:", !!state.userLogin?.accessToken);
        console.log("  - Token no cookie:", !!cookieToken);

        // ✅ Se tem token no localStorage mas NÃO tem no cookie
        if (state.userLogin?.accessToken && !cookieToken) {
          console.log("⚠️ Divergência: Token no localStorage mas sem cookie");
          console.log("🧹 Limpando localStorage...");

          set({ userLogin: null });
          localStorage.removeItem('auth-storage');
        }

        // ✅ Se tem cookie mas NÃO tem no localStorage
        if (!state.userLogin?.accessToken && cookieToken) {
          console.log("⚠️ Cookie órfão detectado - Removendo");
          Cookies.remove('auth-token', { path: '/' });
        }

        // ✅ Se ambos existem e estão sincronizados
        if (state.userLogin?.accessToken && cookieToken) {
          console.log("✅ Sincronização OK - Token presente em ambos");
        }

        // ✅ Se nenhum existe
        if (!state.userLogin?.accessToken && !cookieToken) {
          console.log("✅ Sem autenticação - Estado limpo");
        }

        set({ isInitialized: true });
        console.log("✅ Inicialização completa");
      },
      findByEmail: async (email: string) => {
        console.log("🔵 ========== BUSCANDO CLIENTE POR EMAIL ==========");
        console.log("🔵 Email:", email);

        set({
          loadingFindByEmail: true,
          errorFindByEmail: null,
          clienteFindByEmail: null
        });

        try {
          // URL encode para garantir que emails com caracteres especiais funcionem
          const encodedEmail = encodeURIComponent(email);
          const response = await publicApi.get(
            `/auth/cliente/findByEmail/${encodedEmail}`
          );

          console.log("✅ ========== CLIENTE ENCONTRADO POR EMAIL ==========");
          console.log("✅ Cliente:", response.data.nome);
          console.log("✅ Email:", response.data.email);
          console.log("✅ Número do Cliente:", response.data.numeroCliente);

          set({
            clienteFindByEmail: response.data,
            loadingFindByEmail: false,
            errorFindByEmail: null,
          });

          console.log("✅ Estado atualizado com sucesso");

          // Retornar os dados do cliente encontrado
          return response.data;
        } catch (error: any) {
          console.error("❌ ========== ERRO AO BUSCAR CLIENTE POR EMAIL ==========");
          console.error("❌ Status:", error.response?.status);
          console.error("❌ Mensagem:", error.response?.data?.message);
          console.error("❌ Email pesquisado:", email);

          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            `Erro ao buscar cliente com email: ${email}`;

          set({
            clienteFindByEmail: null,
            loadingFindByEmail: false,
            errorFindByEmail: errorMessage,
          });

          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      login: async (data: IALoginData) => {
        console.log("🔵 ========== INICIANDO LOGIN ==========");
        console.log("🔵 Username:", data.username);

        set({ loading: true, error: null });

        try {
          console.log("🔵 Fazendo requisição para:", `${API_BASE_URL}/auth/cliente/login`);

          const response = await publicApi.post<UserLogin>('/auth/cliente/login', data);

          console.log("✅ ========== LOGIN BEM-SUCEDIDO ==========");
          console.log("✅ Cliente:", response.data.cliente.nome);
          console.log("✅ Token recebido");

          // ✅ ÚNICO LUGAR onde salvamos o token no cookie
          Cookies.set('auth-token', response.data.accessToken, COOKIE_OPTIONS);
          console.log("✅ Token salvo em cookie");

          set({
            userLogin: response.data,
            loading: false,
            error: null,
          });

          console.log("✅ Estado atualizado");
          console.log("✅ Login completo!");
        } catch (error: any) {
          console.error("❌ ========== ERRO NO LOGIN ==========");
          console.error("❌ Status:", error.response?.status);
          console.error("❌ Data:", error.response?.data);

          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            'Credenciais inválidas. Verifique seus dados.';

          set({
            loading: false,
            error: errorMessage,
            userLogin: null,
          });

          throw error;
        }
      },

      refreshToken: async () => {
        console.log("🔄 Renovando token...");
        const currentRefreshToken = get().userLogin?.refreshToken;

        if (!currentRefreshToken) {
          throw new Error('Nenhum refresh token disponível');
        }

        try {
          const response = await publicApi.post<UserLogin>(
            '/auth/cliente/refresh',
            { refreshToken: currentRefreshToken }
          );

          console.log("✅ Token renovado");

          Cookies.set('auth-token', response.data.accessToken, COOKIE_OPTIONS);

          set({
            userLogin: response.data,
            error: null,
          });
        } catch (error: any) {
          console.error("❌ Erro ao renovar token");

          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            'Erro ao renovar sessão';

          set({ error: errorMessage });
          get().logout();
          throw error;
        }
      },

      getProfile: async () => {
        console.log("👤 Carregando perfil...");
        set({ loading: true, error: null });

        try {
          const response = await privateApi.get<UserLogin['cliente']>('/auth/cliente/me');

          console.log("✅ Perfil carregado");

          set((state) => ({
            userLogin: state.userLogin
              ? { ...state.userLogin, cliente: response.data }
              : null,
            loading: false,
            error: null,
          }));
        } catch (error: any) {
          console.error("❌ Erro ao carregar perfil");

          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            'Erro ao carregar perfil';

          set({
            loading: false,
            error: errorMessage,
          });

          throw error;
        }
      },
      alterarSenha: async (data: IAlterarSenha) => {
        console.log("🔐 Alterando senha...");
        set({ loading: true, error: null });

        try {
          const state = get();
          const clienteId = state.userLogin?.cliente._id;

          if (!clienteId) {
            throw new Error('Cliente não autenticado');
          }

          // ✅ CORRIGIDO: Usar template string corretamente
          await privateApi.patch(`/auth/cliente/alterar-senha/${clienteId}`, data);

          console.log("✅ Senha alterada com sucesso");

          set({
            loading: false,
            error: null,
          });
        } catch (error: any) {
          console.error("❌ Erro ao alterar senha:", error);

          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            'Erro ao alterar senha';

          set({
            loading: false,
            error: errorMessage,
          });

          throw error;
        }
      },
      recuperarSenha: async (email: string, data: IAlterarSenha) => { // ✅ Adicione parâmetro email
        console.log("🔐 Recuperando senha...");
        set({ loading: true, error: null });

        try {
          // ✅ O endpoint espera email, não ID
          await privateApi.patch(`/auth/cliente/recuperar-senha/${email}`, data);

          console.log("✅ Senha recuperada com sucesso");

          set({
            loading: false,
            error: null,
          });
        } catch (error: any) {
          console.error("❌ Erro ao recuperar senha:", error);

          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            'Erro ao recuperar senha';

          set({
            loading: false,
            error: errorMessage,
          });

          throw error;
        }
      },
      logout: async () => {
        console.log("🚪 ========== FAZENDO LOGOUT ==========");
        set({ loading: true, error: null });

        try {
          if (get().userLogin?.accessToken) {
            console.log("🔵 Notificando servidor...");
            await privateApi.post('/auth/cliente/logout');
            console.log("✅ Servidor notificado");
          }
        } catch (error: any) {
          console.error('⚠️ Erro ao notificar servidor:', error.message);
        } finally {
          console.log("🧹 Limpando dados locais...");

          // ✅ Remover cookie
          Cookies.remove('auth-token', { path: '/' });
          console.log("✅ Cookie removido");

          // ✅ Limpar estado
          set({
            userLogin: null,
            loading: false,
            error: null,
          });

          // ✅ Limpar localStorage
          localStorage.removeItem('auth-storage');
          console.log("✅ LocalStorage limpo");

          console.log("✅ ========== LOGOUT COMPLETO ==========");

        }
      },
      clearFindByEmailError: () => {
        console.log("🧹 Limpando erro do findByEmail");
        set({ errorFindByEmail: null });
      },

      clearFindByEmailData: () => {
        console.log("🧹 Limpando dados do findByEmail");
        set({
          clienteFindByEmail: null,
          errorFindByEmail: null
        });
      },

      resetFindByEmail: () => {
        console.log("🔄 Resetando estado do findByEmail");
        set({
          clienteFindByEmail: null,
          loadingFindByEmail: false,
          errorFindByEmail: null,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userLogin: state.userLogin
      }),
      onRehydrateStorage: () => (state) => {
        console.log("💾 Reidratando estado do localStorage...");
        state?.initialize();
      },
    }
  )
);

export const useAuth = () => {
  const { userLogin, loading, isInitialized, error } = useAuthStore();

  return {
    isAuthenticated: !!userLogin?.accessToken,
    user: userLogin?.cliente,
    token: userLogin?.accessToken,
    loading,
    isInitialized,
    error,
  };
};