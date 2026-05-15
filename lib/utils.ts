// cn() combines Tailwind class names and removes duplicates.
// Usage: cn("px-4 py-2", condition && "bg-pink-500", "text-sm")
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
