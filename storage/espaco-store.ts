import { create } from 'zustand';
export interface LocalEvento {
  _id: string;
  nome: string;
  descricao?: string;
  capacidade: number;
  area?: number;
  tipo?: 'Interno' | 'Externo';
  equipamentos?: string[];
  preco: number;
  disponivel?: boolean;
  imagem?: string[];
}

export interface EspacosState {
  espacos: LocalEvento[];
  isLoading: boolean;
  error: string | null;
  fetchEspacos: () => Promise<void>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009'

export const useEspacosStore = create<EspacosState>((set) => ({
  espacos: [],
  isLoading: false,
  error: null,

  fetchEspacos: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/espacos`);
      if (!response.ok) {
        throw new Error('Erro ao buscar espaços');
      }
      const data = await response.json();
      set({ espacos: data, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao buscar espaços', isLoading: false });
    }
  },
}));