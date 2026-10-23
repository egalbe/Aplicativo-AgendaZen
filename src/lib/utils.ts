import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Formatação de moeda BRL
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// Formatação de CPF (000.000.000-00)
export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, "");
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

// Formatação de Telefone / WhatsApp BR ((00) 00000-0000)
export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return phone;
}

// Validador simples de CPF
export function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, "");
  if (clean.length !== 11 || !!clean.match(/(\d)\1{10}/)) return false;

  const digits = clean.split("").map(Number);

  const rest = (count: number) =>
    ((digits
      .slice(0, count - 1)
      .reduce((sum, el, index) => sum + el * (count - index), 0) * 10) % 11) % 10;

  return rest(10) === digits[9] && rest(11) === digits[10];
}
