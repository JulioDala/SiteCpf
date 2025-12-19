// storage/atuh-storage.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

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
  login: (data: IALoginData) => Promise<void>;
  refreshToken: () => Promise<void>;
  getProfile: () => Promise<void>;
  alterarSenha: (data: IAlterarSenha) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => void;
  clearError: () => void;
}

// ✅ Configuração de cookies otimizada para produção
const COOKIE_OPTIONS = {
  expires: 7,
  secure: false, // ✅ Mudado para false - funciona em HTTP e HTTPS
  sameSite: 'lax' as const,
  path: '/',
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      userLogin: null,
      loading: false,
      error: null,
      isInitialized: false,

      initialize: () => {
        console.log("🔄 Inicializando AuthStore...");
        
        const state = get();
        
        // ✅ IMPORTANTE: Não limpar localStorage se não tiver cookie
        // O cookie pode não existir por problemas de configuração, não significa que o usuário não está autenticado
        console.log("📊 Estado atual:");
        console.log("  - Token no localStorage:", !!state.userLogin?.accessToken);
        console.log("  - Cliente:", state.userLogin?.cliente?.nome);
        
        // ✅ Se tiver token válido, manter autenticação
        if (state.userLogin?.accessToken) {
          console.log("✅ Token encontrado - Mantendo autenticação");
        } else {
          console.log("ℹ️ Sem autenticação");
        }
        
        set({ isInitialized: true });
        console.log("✅ Inicialização completa");
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

          // ✅ Atualizar estado PRIMEIRO (localStorage através do persist)
          set({
            userLogin: response.data,
            loading: false,
            error: null,
          });

          console.log("✅ Estado atualizado no localStorage");

          // ✅ Tentar salvar cookie (mas não depender dele)
          try {
            Cookies.set('auth-token', response.data.accessToken, COOKIE_OPTIONS);
            console.log("✅ Token salvo em cookie");
          } catch (cookieError) {
            console.warn("⚠️ Não foi possível salvar cookie (não é crítico):", cookieError);
          }

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

          set({
            userLogin: response.data,
            error: null,
          });

          // Tentar atualizar cookie (opcional)
          try {
            Cookies.set('auth-token', response.data.accessToken, COOKIE_OPTIONS);
          } catch (e) {
            console.warn("⚠️ Cookie não atualizado");
          }
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
          await privateApi.patch('/auth/cliente/alterar-senha', data);

          console.log("✅ Senha alterada");

          set({
            loading: false,
            error: null,
          });
        } catch (error: any) {
          console.error("❌ Erro ao alterar senha");

          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            'Erro ao alterar senha';

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

          // Tentar remover cookie
          try {
            Cookies.remove('auth-token', { path: '/' });
            console.log("✅ Cookie removido");
          } catch (e) {
            console.warn("⚠️ Cookie não removido");
          }

          // Limpar estado
          set({
            userLogin: null,
            loading: false,
            error: null,
          });

          // Limpar localStorage
          localStorage.removeItem('auth-storage');
          console.log("✅ LocalStorage limpo");

          console.log("✅ ========== LOGOUT COMPLETO ==========");
        }
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
        if (state) {
          state.initialize();
        }
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