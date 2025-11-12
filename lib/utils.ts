import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Função auxiliar para unir classes do Tailwind de forma segura.
 * Usa clsx() + twMerge() para evitar conflitos de estilos.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}