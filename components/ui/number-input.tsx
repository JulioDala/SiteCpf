import { Input } from "@/components/ui/input";
import { useState } from "react";

interface NumberInputProps {
  value?: number;
  onChange: (value: number) => void;
  min?: number;
  placeholder?: string;
  disabled?: boolean;
}

export const NumberInput = ({ value, onChange, min = 0, placeholder = "0", disabled }: NumberInputProps) => {
  const [displayValue, setDisplayValue] = useState(value === 0 ? "" : value?.toString());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Permite campo vazio
    if (inputValue === "") {
      setDisplayValue("");
      onChange(0);
      return;
    }
    
    // Aceita apenas números
    if (/^\d+$/.test(inputValue)) {
      const numericValue = Number(inputValue);
      if (numericValue >= min) {
        setDisplayValue(inputValue);
        onChange(numericValue);
      }
    }
  };

  const handleBlur = () => {
    // Se estiver vazio, mantém como 0 mas mostra placeholder
    if (displayValue === "") {
      setDisplayValue("");
    }
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};