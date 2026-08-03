import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) { // função para combinar classes de tailwind
  return twMerge(clsx(inputs))
}
