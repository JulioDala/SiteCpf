import { create } from "zustand";
import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

export interface ITipoAtividade {
  _id?: string;
  nome: string;
  descricao?: string;
  status: 'Ativo' | 'Inativo';
  createdAt?: string;
  updatedAt?: string;
}

interface IUseTipoStore {
  actividade: ITipoAtividade[];
  fetchTipo: () => Promise<ITipoAtividade[]>;
  errorTipo: boolean;
  loadingTipo: boolean;
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

export const useActividadeStore = create<IUseTipoStore>((set, get) => ({
  actividade: [],
  errorTipo: false,
  loadingTipo: false,
  fetchTipo: async () => {
    set({ loadingTipo: true, errorTipo: false });
    try {
      const response = await clienteApi.get('/tipos-atividade');
      const data: ITipoAtividade[] = response.data;
      set({ actividade: data, loadingTipo: false });
      return data;
    } catch (error) {
      set({ errorTipo: true, loadingTipo: false });
      throw error;
    }
  },
}));