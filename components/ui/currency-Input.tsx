
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';

interface CurrencyInputProps {
  value?: number;
  onChange?: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CurrencyInput({
  value = 0,
  onChange,
  placeholder = "0,00",
  disabled = false,
  className = "",
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const cursorPositionRef = useRef<number | null>(null);

  // Formata o número para exibição com separadores
  const formatCurrency = (num: number): string => {
    if (isNaN(num) || num === 0) return "";
    
    const fixed = num.toFixed(2);
    const [integerPart, decimalPart] = fixed.split(".");
    
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    
    return `${formattedInteger},${decimalPart}`;
  };

  // Remove a formatação e converte para número
  const parseCurrency = (str: string): number => {
    if (!str) return 0;
    
    const cleaned = str.replace(/\./g, "").replace(",", ".");
    const num = parseFloat(cleaned);
    
    return isNaN(num) ? 0 : num;
  };

  // Atualiza o valor exibido apenas quando o value prop muda externamente
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setDisplayValue(formatCurrency(value));
    }
  }, [value]);

  // Restaura a posição do cursor após formatação
  useEffect(() => {
    if (cursorPositionRef.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(cursorPositionRef.current, cursorPositionRef.current);
      cursorPositionRef.current = null;
    }
  }, [displayValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    
    // Conta quantos separadores existem antes do cursor
    const separatorsBeforeCursor = (input.slice(0, cursorPosition).match(/\./g) || []).length;
    
    // Remove todos os caracteres exceto números, vírgula e ponto
    const cleaned = input.replace(/[^\d.,]/g, "");
    
    // Permite apenas uma vírgula
    const parts = cleaned.split(",");
    let formatted = parts[0];
    
    if (parts.length > 1) {
      formatted = `${parts[0]},${parts[1].slice(0, 2)}`;
    } else if (cleaned.endsWith(",")) {
      formatted = `${parts[0]},`;
    }
    
    // Remove pontos temporariamente para processar
    const withoutSeparators = formatted.replace(/\./g, "");
    const [intPart, decPart] = withoutSeparators.split(",");
    
    // Adiciona separadores de milhares novamente
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const finalFormatted = decPart !== undefined ? `${formattedInt},${decPart}` : formattedInt;
    
    // Calcula nova posição do cursor
    const newSeparatorsBeforeCursor = (finalFormatted.slice(0, cursorPosition).match(/\./g) || []).length;
    const separatorDiff = newSeparatorsBeforeCursor - separatorsBeforeCursor;
    const newCursorPosition = cursorPosition + separatorDiff;
    
    setDisplayValue(finalFormatted);
    cursorPositionRef.current = newCursorPosition;
    
    // Converte para número e chama onChange
    const numericValue = parseCurrency(finalFormatted);
    onChange?.(numericValue);
  };

  const handleBlur = () => {
    // Ao sair do campo, formata completamente
    const numericValue = parseCurrency(displayValue);
    setDisplayValue(formatCurrency(numericValue));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Remove os zeros decimais ao focar para facilitar edição
    if (displayValue && displayValue.endsWith(",00")) {
      const withoutDecimals = displayValue.slice(0, -3);
      setDisplayValue(withoutDecimals);
    }
  };

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
        KZ
      </span>
      <Input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={placeholder}
        disabled={disabled}
        className={`pl-14 ${className}`}
        inputMode="decimal"
      />
    </div>
  );
}