export interface Pagamento {
  modulo: string;              // Ex: 'reserva', 'ginasio'
  valorPago: number;           // Ex: 30000
  status: 'pendente' | 'concluido' | 'cancelado';
  metodo:string; // Status limitado a alguns valores
  dataPagamento: string;       // Ex: '2025-11-05'
}

// Interface para reservas
export interface Reserva {
  referencia: string;          // Ex: 'RESV-001'
  dataHora: string;            // Ex: '10 Nov 2025, 18h00'
  localEvento: string;         // Ex: 'Sala de Treino'
  valor: number;               // Valor total da reserva
  totalPago: number;           // Total já pago
  pendente: number;            // Valor ainda pendente
  status: 'Confirmada' | 'Pendente' | 'Cancelada'; // Estado da reserva
}