import { create } from "zustand";
import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

export interface ICampo {
  _id?: string;
  nome: string;
  status: 'Ativo' | 'Cancelado';
  createdAt?: string;
  updatedAt?: string;
}

interface IUseCampoStore {
  campos: ICampo[];
  fetchCampo: () => Promise<ICampo[]>;
  errorCampo: boolean;
  loadingCampo: boolean;
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

export const useCampoStore = create<IUseCampoStore>((set, get) => ({
  campos: [],
  errorCampo: false,
  loadingCampo: false,
  fetchCampo: async () => {
    set({ loadingCampo: true, errorCampo: false });
    try {
      const response = await clienteApi.get('/campo');
      const data: ICampo[] = response.data;
      set({ campos: data, loadingCampo: false });
      return data;
    } catch (error) {
      set({ errorCampo: true, loadingCampo: false });
      throw error;
    }
  },
}));