import { create } from 'zustand';
export interface TipoEvento {
  _id?: string;
  nome: string;
  descricao: string;
  cor: string;
  icone: string;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TiposEventosState {
  tiposEventos: TipoEvento[];
  isLoading: boolean;
  error: string | null;
  fetchTiposEventos: () => Promise<void>
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009';

export const useTiposEventos = create<TiposEventosState>((set) => ({
  tiposEventos: [],
  isLoading: false,
  error: null,

  fetchTiposEventos: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/tipos-eventos`);
      if (!response.ok) {
        throw new Error('Erro ao buscar tipos de eventos');
      }
      const data = await response.json();
      set({ tiposEventos: data, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Erro ao buscar tipos de eventos', isLoading: false });
    }
  },
}));

// Export default para compatibilidade
export default useTiposEventos;