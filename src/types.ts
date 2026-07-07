/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Tenant {
  id: string; // slug-like ID
  name: string;
  phone: string;
  address: string;
  email: string;
  licenseKey: string;
  isLicenseActive: boolean;
  logoUrl: string;
  adminTheme: {
    primaryColor: string; // tailwind color class prefix (e.g., 'emerald', 'blue')
    fontFamily: string;
  };
  publicTheme: {
    fontFamily: string; // One of 15 fonts
    colorScheme: string; // One of 15 color schemes
    backgroundColor: string; // Hex color or simple CSS color
    bgType: 'color' | 'image';
    bgImageUrl?: string;
    customTexts: CustomText[];
  };
  categories: string[]; // custom categories in addition to default
  collaborators: Collaborator[];
  extenderHabilitado?: boolean; // muestra el botón "Extender" en los alquileres (opción del inquilino)
}

export interface CustomText {
  id: string;
  text: string;
  size: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  font: string;
  color: string;
}

export interface Collaborator {
  id: string;
  name: string;
  phone: string;
  username: string;
  password: string;
  sessionToken?: string; // For simulating wireless remote logout
}

export interface CustomField {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  category: string; // e.g. "Inflables", "Metegoles", "Pool", "Arcade", or custom
  name: string;
  description: string;
  price: number | null; // optional price
  imageUrl: string;
  isCombo: boolean;
  isFeatured: boolean;
  customFields: CustomField[];
  status?: 'Disponible' | 'Alquilado' | 'Consulte';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface BookingItem {
  productId: string;
  name: string;
  quantity: number;
  price: number | null;
}

export type BookingStatus = 'pendiente' | 'en_camino' | 'alquilado' | 'completado';

export interface Booking {
  id: string; // alphanumeric random code e.g. TD-4821
  customerName: string;
  customerPhone: string;
  items: BookingItem[];
  totalAmount: number;
  status: BookingStatus;
  rentalDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD HH:MM
  notes?: string;
  duracion?: string; // duración elegida por el cliente (ej: "Día completo", "4 horas")
}

export interface GalleryPhoto {
  id: string;
  imageUrl: string;
  uploadedBy: 'client' | 'tenant';
  timestamp: string;
  caption?: string;
}

// 15 Font Choices
export const FONT_OPTIONS = [
  { name: 'Inter (Sans-Serif Moderno)', value: 'font-sans' },
  { name: 'Space Grotesk (Tech Moderno)', value: 'font-space' },
  { name: 'JetBrains Mono (Técnico/Retro)', value: 'font-mono' },
  { name: 'Playfair Display (Serif Elegante)', value: 'font-serif' },
  { name: 'Montserrat (Geométrico Fuerte)', value: 'font-montserrat' },
  { name: 'Poppins (Amigable Redondeado)', value: 'font-poppins' },
  { name: 'Outfit (Minimalista)', value: 'font-outfit' },
  { name: 'Lora (Serif de Lectura)', value: 'font-lora' },
  { name: 'Rubik (Cantos Redondeados)', value: 'font-rubik' },
  { name: 'Syne (Artístico Expresivo)', value: 'font-syne' },
  { name: 'Quicksand (Cálido y Tierno)', value: 'font-quicksand' },
  { name: 'Cinzel (Clásico Monumental)', value: 'font-cinzel' },
  { name: 'Cabin (Humanista)', value: 'font-cabin' },
  { name: 'Comfortaa (Punta Redonda)', value: 'font-comfortaa' },
  { name: 'Fira Code (Código Limpio)', value: 'font-fira' }
];

// 15 Color Options for Theme
export interface ColorPalette {
  id: string;
  name: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  accentHex: string; // to use directly in inline styling/etc if needed
  primaryTailwind: string; // e.g. "emerald", "blue", "violet"
}

export const COLOR_OPTIONS: ColorPalette[] = [
  { id: 'emerald', name: 'Esmeralda Vital', bgClass: 'bg-emerald-600 hover:bg-emerald-700', textClass: 'text-emerald-600', borderClass: 'border-emerald-600', accentHex: '#059669', primaryTailwind: 'emerald' },
  { id: 'natural_tone', name: 'Natural Tone (Cálido Orgánico)', bgClass: 'bg-stone-600 hover:bg-stone-700', textClass: 'text-stone-700', borderClass: 'border-stone-600', accentHex: '#57534e', primaryTailwind: 'stone' },
  { id: 'prof_polish', name: 'Professional Polish (Elegancia Corporativa)', bgClass: 'bg-slate-800 hover:bg-slate-900', textClass: 'text-slate-800', borderClass: 'border-slate-800', accentHex: '#1e293b', primaryTailwind: 'slate' },
  { id: 'blue', name: 'Azul Cobalto', bgClass: 'bg-blue-600 hover:bg-blue-700', textClass: 'text-blue-600', borderClass: 'border-blue-600', accentHex: '#2563eb', primaryTailwind: 'blue' },
  { id: 'violet', name: 'Violeta Eléctrico', bgClass: 'bg-violet-600 hover:bg-violet-700', textClass: 'text-violet-600', borderClass: 'border-violet-600', accentHex: '#7c3aed', primaryTailwind: 'violet' },
  { id: 'pink', name: 'Rosa Chicle', bgClass: 'bg-pink-500 hover:bg-pink-600', textClass: 'text-pink-500', borderClass: 'border-pink-500', accentHex: '#ec4899', primaryTailwind: 'pink' },
  { id: 'rose', name: 'Rojo Coral', bgClass: 'bg-rose-500 hover:bg-rose-600', textClass: 'text-rose-500', borderClass: 'border-rose-500', accentHex: '#f43f5e', primaryTailwind: 'rose' },
  { id: 'orange', name: 'Naranja Sol', bgClass: 'bg-orange-500 hover:bg-orange-600', textClass: 'text-orange-500', borderClass: 'border-orange-500', accentHex: '#f97316', primaryTailwind: 'orange' },
  { id: 'amber', name: 'Amarillo Limón', bgClass: 'bg-amber-500 hover:bg-amber-600', textClass: 'text-amber-500', borderClass: 'border-amber-500', accentHex: '#f59e0b', primaryTailwind: 'amber' },
  { id: 'teal', name: 'Verde Menta', bgClass: 'bg-teal-500 hover:bg-teal-600', textClass: 'text-teal-500', borderClass: 'border-teal-500', accentHex: '#14b8a6', primaryTailwind: 'teal' },
  { id: 'slate', name: 'Gris Carbón', bgClass: 'bg-slate-700 hover:bg-slate-800', textClass: 'text-slate-700', borderClass: 'border-slate-700', accentHex: '#334155', primaryTailwind: 'slate' },
  { id: 'amber900', name: 'Chocolate Cálido', bgClass: 'bg-amber-900 hover:bg-amber-950', textClass: 'text-amber-900', borderClass: 'border-amber-900', accentHex: '#78350f', primaryTailwind: 'amber' },
  { id: 'purple', name: 'Púrpura Imperial', bgClass: 'bg-purple-600 hover:bg-purple-700', textClass: 'text-purple-600', borderClass: 'border-purple-600', accentHex: '#9333ea', primaryTailwind: 'purple' },
  { id: 'fuchsia', name: 'Fucsia Brillante', bgClass: 'bg-fuchsia-600 hover:bg-fuchsia-700', textClass: 'text-fuchsia-600', borderClass: 'border-fuchsia-600', accentHex: '#c026d3', primaryTailwind: 'fuchsia' },
  { id: 'indigo', name: 'Índigo Noche', bgClass: 'bg-indigo-600 hover:bg-indigo-700', textClass: 'text-indigo-600', borderClass: 'border-indigo-600', accentHex: '#4f46e5', primaryTailwind: 'indigo' },
  { id: 'lime', name: 'Verde Lima', bgClass: 'bg-lime-500 hover:bg-lime-600', textClass: 'text-lime-500', borderClass: 'border-lime-500', accentHex: '#84cc16', primaryTailwind: 'lime' },
  { id: 'cyan', name: 'Turquesa Lago', bgClass: 'bg-cyan-500 hover:bg-cyan-600', textClass: 'text-cyan-500', borderClass: 'border-cyan-500', accentHex: '#06b6d4', primaryTailwind: 'cyan' }
];
