// components/layout/paginacao-reservas.tsx
import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface PaginacaoReservasProps {
  paginaAtual: number;
  totalPaginas: number;
  totalItens: number;
  itensPorPagina: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (pagina: number) => void;
  onItemsPerPageChange?: (items: number) => void;
  className?: string;
}

export default function PaginacaoReservas({
  paginaAtual,
  totalPaginas,
  totalItens,
  itensPorPagina,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  onItemsPerPageChange,
  className,
}: PaginacaoReservasProps) {
  
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    let startPage = Math.max(1, paginaAtual - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;
    
    if (endPage > totalPaginas) {
      endPage = totalPaginas;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4", className)}>
      {/* Informação de itens */}
      <div className="text-sm text-gray-600">
        Mostrando <span className="font-semibold">{((paginaAtual - 1) * itensPorPagina) + 1}</span>
        {' - '}
        <span className="font-semibold">
          {Math.min(paginaAtual * itensPorPagina, totalItens)}
        </span>
        {' de '}
        <span className="font-semibold">{totalItens}</span> reservas
      </div>

      {/* Controles de paginação */}
      <div className="flex items-center gap-2">
        {/* Itens por página */}
        {onItemsPerPageChange && (
          <div className="flex items-center gap-2 mr-4">
            <span className="text-sm text-gray-600">Itens por página:</span>
            <Select
              value={itensPorPagina.toString()}
              onValueChange={(value) => onItemsPerPageChange(parseInt(value))}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Botões de navegação */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(paginaAtual - 1)}
          disabled={!hasPrevPage}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Números das páginas */}
        <div className="flex items-center gap-1">
          {/* Primeira página */}
          {!pageNumbers.includes(1) && (
            <>
              <Button
                variant={paginaAtual === 1 ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(1)}
                className="h-8 w-8"
              >
                1
              </Button>
              {!pageNumbers.includes(2) && <MoreHorizontal className="h-4 w-4 text-gray-400" />}
            </>
          )}

          {/* Páginas do meio */}
          {pageNumbers.map(page => (
            <Button
              key={page}
              variant={paginaAtual === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className="h-8 w-8"
            >
              {page}
            </Button>
          ))}

          {/* Última página */}
          {!pageNumbers.includes(totalPaginas) && totalPaginas > 0 && (
            <>
              {!pageNumbers.includes(totalPaginas - 1) && (
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              )}
              <Button
                variant={paginaAtual === totalPaginas ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(totalPaginas)}
                className="h-8 w-8"
              >
                {totalPaginas}
              </Button>
            </>
          )}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(paginaAtual + 1)}
          disabled={!hasNextPage}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}