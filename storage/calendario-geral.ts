export interface FiltroCalendarioGeral {
  mes?: number;
  ano?: number;
  espacoId?: string;
}

export const FILTRO_CALENDARIO_GERAL_DEFAULT: FiltroCalendarioGeral = {
  mes: new Date().getMonth() + 1,
  ano: new Date().getFullYear(),
};

// Interface do seu backend (ajustada para o store)
export interface IntervaloFormatado {
  inicio: string;
  fim: string;
  duracaoMinutos: number;
}

export interface OcupacaoDia {
  percentual: number;
  minutosOcupados: number;
  totalMinutos: number;
  nivel: 'BAIXA' | 'MEDIA' | 'ALTA' | 'CHEIO';
  temReservas: boolean;
  totalReservas: number;
}

export interface ReservaAgrupadaEspaco {
  nome: string;
  reservas: Array<{
    id: any;
    horario: string;
    evento?: string;
    status: string;
    participantes: number;
  }>;
  totalReservas: number;
}

export interface DiaCalendarioGeral {
  vazio?: boolean;
  dia: number;
  data: string;
  ocupacao: OcupacaoDia;
  intervalosOcupados: IntervaloFormatado[];
  intervalosDisponiveis: IntervaloFormatado[];
  reservasPorEspaco: ReservaAgrupadaEspaco[];
  feriado: boolean;
  fimDeSemana: boolean;
}

export interface HorarioMaisOcupado {
  hora: string;
  reservas: number;
}

export interface DiaMaisOcupado {
  data: string;
  reservas: number;
}

export interface EspacoEstatistica {
  nome: string;
  reservas: number;
}

export interface DistribuicaoTemporal {
  manha: number;
  tarde: number;
  noite: number;
}

export interface EstatisticasCalendario {
  totalReservas: number;
  totalParticipantes: number;
  ocupacaoMedia: number;
  horariosMaisOcupados: HorarioMaisOcupado[];
  diasMaisOcupados: DiaMaisOcupado[];
  porEspaco: EspacoEstatistica[];
  porStatus: Record<string, number>;
  distribuicaoTemporal?: DistribuicaoTemporal;
}

export interface HorariosComerciais {
  inicio: string;
  fim: string;
  totalMinutos: number;
}

export interface CalendarioGeral {
  mes: number;
  ano: number;
  nomeMes: string;
  dias: DiaCalendarioGeral[];
  semanas: DiaCalendarioGeral[][];
  totalDias: number;
  diasUteis: number;
}

export interface CalendarioGeralResponse {
  calendario: CalendarioGeral;
  estatisticas: EstatisticasCalendario;
  horariosComerciais: HorariosComerciais;
}