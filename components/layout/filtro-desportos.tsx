// components/layout/filtro-desportos.tsx
import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { FILTRO_DESPORTO_DEFAULT, OrdenacaoDesporto } from '@/storage/cliente-desporto-stores';
import { useDesportoStore } from '@/storage/cliente-desporto-stores';

interface FiltroDesportosProps {
  email: string;
  className?: string;
}

export default function FiltroDesportos({ email, className }: FiltroDesportosProps) {
  const { filtroAtualDesporto, aplicarFiltroDesporto, limparFiltroDesporto, loadingFiltradoDesporto } = useDesportoStore();
  
  const [localFiltro, setLocalFiltro] = useState({
    search: '',
    status: 'todos',
    statusPagamento: 'todos',
    ordenarPor: OrdenacaoDesporto.DATA_CRIACAO_DESC,
  });
  
  const [dataInicio, setDataInicio] = useState<Date | undefined>();
  const [dataFim, setDataFim] = useState<Date | undefined>();
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (filtroAtualDesporto) {
      setLocalFiltro({
        search: filtroAtualDesporto.search || '',
        status: filtroAtualDesporto.status || 'todos',
        statusPagamento: filtroAtualDesporto.statusPagamento || 'todos',
        ordenarPor: filtroAtualDesporto.ordenarPor || OrdenacaoDesporto.DATA_CRIACAO_DESC,
      });
      
      if (filtroAtualDesporto.dataInicio) setDataInicio(new Date(filtroAtualDesporto.dataInicio));
      if (filtroAtualDesporto.dataFim) setDataFim(new Date(filtroAtualDesporto.dataFim));
    }
  }, [filtroAtualDesporto]);

  const handleApplyFilter = () => {
    aplicarFiltroDesporto({
      ...localFiltro,
      dataInicio: dataInicio?.toISOString(),
      dataFim: dataFim?.toISOString(),
      email,
    });
  };

  const handleClearFilter = () => {
    setLocalFiltro({
      search: '',
      status: 'todos',
      statusPagamento: 'todos',
      ordenarPor: OrdenacaoDesporto.DATA_CRIACAO_DESC,
    });
    setDataInicio(undefined);
    setDataFim(undefined);
    limparFiltroDesporto();
  };

  const hasActiveFilters = () => {
    return (
      localFiltro.search ||
      localFiltro.status !== 'todos' ||
      localFiltro.statusPagamento !== 'todos' ||
      dataInicio ||
      dataFim ||
      localFiltro.ordenarPor !== OrdenacaoDesporto.DATA_CRIACAO_DESC
    );
  };

  const ordenacaoOptions = [
    { value: OrdenacaoDesporto.DATA_INICIO_ASC, label: 'Data Início (Mais Antiga)' },
    { value: OrdenacaoDesporto.DATA_INICIO_DESC, label: 'Data Início (Mais Recente)' },
    { value: OrdenacaoDesporto.DATA_CRIACAO_ASC, label: 'Criação (Mais Antiga)' },
    { value: OrdenacaoDesporto.DATA_CRIACAO_DESC, label: 'Criação (Mais Recente)' },
    { value: OrdenacaoDesporto.NOME_EQUIPE_ASC, label: 'Nome Equipe (A-Z)' },
    { value: OrdenacaoDesporto.NOME_EQUIPE_DESC, label: 'Nome Equipe (Z-A)' },
  ];

  const statusOptions = [
    { value: 'todos', label: 'Todos os Status' },
    { value: 'Ativo', label: 'Ativo' },
    { value: 'Pendente', label: 'Pendente' },
    { value: 'Pago', label: 'Pago' },
    { value: 'Expirado', label: 'Expirado' },
    { value: 'Rascunho', label: 'Rascunho' },
  ];

  const statusPagamentoOptions = [
    { value: 'todos', label: 'Todos os Pagamentos' },
    { value: 'Pago', label: 'Pago' },
    { value: 'Pendente', label: 'Pendente' },
    { value: 'Em dia', label: 'Em dia' },
    { value: 'Vencido', label: 'Vencido' },
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filtros Principais */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Busca */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por equipe, responsável, email..."
              value={localFiltro.search}
              onChange={(e) => setLocalFiltro(prev => ({ ...prev, search: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && handleApplyFilter()}
              className="pl-10 border-gray-300 focus:border-purple-600 focus:ring-purple-600"
            />
          </div>
        </div>

        {/* Status */}
        <Select
          value={localFiltro.status}
          onValueChange={(value) => setLocalFiltro(prev => ({ ...prev, status: value }))}
        >
          <SelectTrigger
            className={cn(
              "w-[180px]",
              "border-2 border-gray-300",
              "bg-white",
              "text-gray-900",
              "placeholder:text-gray-500",
              "focus:border-purple-700",
              "focus:ring-2 focus:ring-purple-600/40 focus:ring-offset-2",
              "focus:bg-purple-50/30",
              "data-[state=open]:border-purple-700",
              "data-[state=open]:bg-purple-50/50",
              "data-[state=open]:shadow-md",
              "transition-all duration-200"
            )}
          >
            <Filter className="w-4 h-4 mr-2 text-gray-500" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent
            className={cn(
              "bg-white",
              "border border-gray-200",
              "text-gray-900",
              "shadow-lg",
              "z-[60]",
              "max-h-60 overflow-y-auto",
              "!bg-opacity-100"
            )}
          >
            {statusOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className={cn(
                  "cursor-pointer",
                  "focus:bg-purple-50 focus:text-purple-900",
                  "aria-selected:bg-purple-100 aria-selected:text-purple-900",
                  "data-[highlighted]:bg-purple-50 data-[highlighted]:text-purple-900",
                  "transition-colors duration-100"
                )}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Ordenação */}
        <Select
          value={localFiltro.ordenarPor}
          onValueChange={(value: OrdenacaoDesporto) =>
            setLocalFiltro(prev => ({ ...prev, ordenarPor: value }))
          }
        >
          <SelectTrigger
            className={cn(
              "w-[200px]",
              "border-2 border-gray-300",
              "bg-white",
              "text-gray-900",
              "placeholder:text-gray-500",
              "focus:border-purple-700",
              "focus:ring-2 focus:ring-purple-600/40 focus:ring-offset-2",
              "focus:bg-purple-50/30",
              "data-[state=open]:border-purple-700",
              "data-[state=open]:bg-purple-50/50",
              "data-[state=open]:shadow-md",
              "transition-all duration-200"
            )}
          >
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent
            className={cn(
              "bg-white",
              "border border-gray-200",
              "text-gray-900",
              "shadow-lg",
              "z-[60]",
              "max-h-72 overflow-y-auto",
              "!bg-opacity-100"
            )}
          >
            {ordenacaoOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className={cn(
                  "cursor-pointer",
                  "focus:bg-purple-50 focus:text-purple-900",
                  "aria-selected:bg-purple-100 aria-selected:text-purple-900",
                  "data-[highlighted]:bg-purple-50 data-[highlighted]:text-purple-900",
                  "transition-colors duration-100"
                )}
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Botão Filtros Avançados + Ações */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          {showAdvanced ? (
            <>
              <ChevronUp className="w-4 h-4 mr-1" />
              Ocultar filtros avançados
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-1" />
              Mostrar filtros avançados
            </>
          )}
        </Button>

        <div className="flex items-center gap-2">
          {hasActiveFilters() && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilter}
              disabled={loadingFiltradoDesporto}
              className="text-sm text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              <X className="w-4 h-4 mr-1" />
              Limpar
            </Button>
          )}

          <Button
            onClick={handleApplyFilter}
            disabled={loadingFiltradoDesporto}
            className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[140px]"
          >
            {loadingFiltradoDesporto ? 'Aplicando...' : 'Aplicar Filtros'}
          </Button>
        </div>
      </div>

      {/* Filtros Avançados */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          {/* Data Início */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Início
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-gray-300 hover:bg-white",
                    !dataInicio && "text-gray-500",
                    "focus:border-purple-600 focus:ring-purple-600 focus:ring-2 focus:ring-offset-1"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                  {dataInicio ? format(dataInicio, "PPP", { locale: pt }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={dataInicio}
                  onSelect={setDataInicio}
                  initialFocus
                  locale={pt}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Data Fim */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Fim
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-gray-300 hover:bg-white",
                    !dataFim && "text-gray-500",
                    "focus:border-purple-600 focus:ring-purple-600 focus:ring-2 focus:ring-offset-1"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                  {dataFim ? format(dataFim, "PPP", { locale: pt }) : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={dataFim}
                  onSelect={setDataFim}
                  initialFocus
                  locale={pt}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Status Pagamento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Pagamento
            </label>
            <Select
              value={localFiltro.statusPagamento}
              onValueChange={(value) => setLocalFiltro(prev => ({ ...prev, statusPagamento: value }))}
            >
              <SelectTrigger
                className={cn(
                  "border-2 border-gray-300",
                  "bg-white",
                  "text-gray-900",
                  "focus:border-purple-700",
                  "focus:ring-2 focus:ring-purple-600/40 focus:ring-offset-2",
                  "focus:bg-purple-50/30",
                  "data-[state=open]:border-purple-700",
                  "data-[state=open]:bg-purple-50/50",
                  "data-[state=open]:shadow-md",
                  "transition-all duration-200"
                )}
              >
                <SelectValue placeholder="Status de pagamento" />
              </SelectTrigger>
              <SelectContent
                className={cn(
                  "bg-white",
                  "border border-gray-200",
                  "text-gray-900",
                  "shadow-lg",
                  "z-[60]",
                  "max-h-60 overflow-y-auto",
                  "!bg-opacity-100"
                )}
              >
                {statusPagamentoOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    className={cn(
                      "cursor-pointer",
                      "focus:bg-purple-50 focus:text-purple-900",
                      "aria-selected:bg-purple-100 aria-selected:text-purple-900",
                      "data-[highlighted]:bg-purple-50 data-[highlighted]:text-purple-900",
                      "transition-colors duration-100"
                    )}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Tags de filtros ativos */}
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2 pt-2">
          {localFiltro.search && (
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full text-sm border border-emerald-200">
              <span>Busca: {localFiltro.search}</span>
              <button
                onClick={() => setLocalFiltro(prev => ({ ...prev, search: '' }))}
                className="text-emerald-700 hover:text-emerald-900"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          
          {localFiltro.status && localFiltro.status !== 'todos' && (
            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm border border-blue-200">
              <span>Status: {statusOptions.find(s => s.value === localFiltro.status)?.label}</span>
              <button
                onClick={() => setLocalFiltro(prev => ({ ...prev, status: 'todos' }))}
                className="text-blue-700 hover:text-blue-900"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          
          {dataInicio && (
            <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-800 px-3 py-1 rounded-full text-sm border border-green-200">
              <span>De: {format(dataInicio, "dd/MM/yyyy")}</span>
              <button
                onClick={() => setDataInicio(undefined)}
                className="text-green-700 hover:text-green-900"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          
          {dataFim && (
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3 py-1 rounded-full text-sm border border-amber-200">
              <span>Até: {format(dataFim, "dd/MM/yyyy")}</span>
              <button
                onClick={() => setDataFim(undefined)}
                className="text-amber-700 hover:text-amber-900"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          
          {localFiltro.statusPagamento && localFiltro.statusPagamento !== 'todos' && (
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full text-sm border border-indigo-200">
              <span>Pagamento: {statusPagamentoOptions.find(p => p.value === localFiltro.statusPagamento)?.label}</span>
              <button
                onClick={() => setLocalFiltro(prev => ({ ...prev, statusPagamento: 'todos' }))}
                className="text-indigo-700 hover:text-indigo-900"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          
          {localFiltro.ordenarPor !== OrdenacaoDesporto.DATA_CRIACAO_DESC && (
            <div className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm border border-gray-300">
              <span>Ordenação: {ordenacaoOptions.find(o => o.value === localFiltro.ordenarPor)?.label}</span>
              <button
                onClick={() => setLocalFiltro(prev => ({ 
                  ...prev, 
                  ordenarPor: OrdenacaoDesporto.DATA_CRIACAO_DESC 
                }))}
                className="text-gray-700 hover:text-gray-900"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}