/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tenant, Product, Customer, Booking, GalleryPhoto } from './types';

export const DEFAULT_CASTLE_IMAGE = '/src/assets/images/castillo_inflable_1783288093601.jpg';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    category: 'Inflables',
    name: 'Castillo Inflable Clásico',
    description: 'Castillo inflable de colores brillantes con saltarín y columnas blandas. Ideal para niños de 3 a 10 años. Medidas: 3x3 metros.',
    price: 18000,
    imageUrl: DEFAULT_CASTLE_IMAGE,
    isCombo: false,
    isFeatured: true,
    customFields: [
      { label: 'Medidas', value: '3.0m x 3.0m' },
      { label: 'Capacidad', value: 'Hasta 6 niños simultáneos' }
    ]
  },
  {
    id: 'p2',
    category: 'Inflables',
    name: 'Mega Tobogán Aventurero',
    description: 'Gran tobogán inflable con rampa de subida y deslizador gigante con protectores laterales. Gran emoción para eventos al aire libre.',
    price: 28000,
    imageUrl: 'https://images.unsplash.com/photo-1572244101833-2ec3cc807ca7?w=600&auto=format&fit=crop&q=80',
    isCombo: false,
    isFeatured: true,
    customFields: [
      { label: 'Medidas', value: '5.0m x 3.0m x 4.0m de alto' },
      { label: 'Edades recomendadas', value: '4 a 12 años' }
    ]
  },
  {
    id: 'p3',
    category: 'Inflables',
    name: 'Pelotero Mini Corralito',
    description: 'Pelotero cerrado especialmente diseñado para bebés y niños pequeños, relleno con 500 pelotas de colores atóxicas.',
    price: 14000,
    imageUrl: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&auto=format&fit=crop&q=80',
    isCombo: false,
    isFeatured: false,
    customFields: [
      { label: 'Medidas', value: '2.0m x 2.0m' },
      { label: 'Pelotas incluidas', value: '500 unidades' }
    ]
  },
  {
    id: 'p4',
    category: 'Metegoles',
    name: 'Metegol Profesional de Hierro',
    description: 'Metegol reforzado de fundición de aluminio con patas de caño pesado. Varillas de acero macizo y puños de goma.',
    price: 9000,
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600&auto=format&fit=crop&q=80',
    isCombo: false,
    isFeatured: false,
    customFields: [
      { label: 'Material', value: 'Fundición de aluminio y acero' },
      { label: 'Formación de jugadores', value: '1-3-4-3' }
    ]
  },
  {
    id: 'p5',
    category: 'Pool',
    name: 'Mesa de Pool Semiprofesional',
    description: 'Mesa de pool con paño verde de alta fidelidad, incluye 2 tacos de madera, juego de bolas de resina y tizas.',
    price: 19000,
    imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600&auto=format&fit=crop&q=80',
    isCombo: false,
    isFeatured: false,
    customFields: [
      { label: 'Accesorios', value: '2 tacos, 16 bolas, triángulo y tizas' },
      { label: 'Medidas', value: '1.8m x 1.0m' }
    ]
  },
  {
    id: 'p6',
    category: 'Arcade',
    name: 'Ficha Arcade Retro Multijuegos',
    description: 'Consola arcade estilo fichero vintage con pantalla LED de 22". Incluye más de 2000 juegos clásicos (Pacman, Street Fighter, Mortal Kombat).',
    price: 16000,
    imageUrl: 'https://images.unsplash.com/photo-1531525645387-7f14be1bdbbd?w=600&auto=format&fit=crop&q=80',
    isCombo: false,
    isFeatured: true,
    customFields: [
      { label: 'Mandos', value: 'Para 2 jugadores con palancas sanwa' },
      { label: 'Cantidad de juegos', value: 'Más de 2500 clásicos' }
    ]
  },
  {
    id: 'c1',
    category: 'Combos',
    name: 'Combo Cumpleaños Feliz',
    description: '¡La combinación perfecta para una tarde inolvidable! Incluye 1 Castillo Inflable Clásico + 1 Metegol Profesional.',
    price: 23000,
    imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80',
    isCombo: true,
    isFeatured: true,
    customFields: [
      { label: 'Ahorro', value: '¡Ahorrás $4.000 comprando en combo!' },
      { label: 'Productos', value: 'Castillo 3x3 + Metegol Profesional' }
    ]
  },
  {
    id: 'c2',
    category: 'Combos',
    name: 'Combo Gamer Extremo',
    description: 'Pensado para adolescentes y grandes. Incluye 1 Consola Retro Arcade + 1 Mesa de Pool Semiprofesional.',
    price: 30000,
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    isCombo: true,
    isFeatured: false,
    customFields: [
      { label: 'Ahorro', value: '¡Ahorrás $5.000 comprando en combo!' },
      { label: 'Productos', value: 'Arcade Retro + Mesa de Pool' }
    ]
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: 'cust1', name: 'Laura Giménez', phone: '+5491134567890', email: 'laurag@gmail.com', address: 'Av. Corrientes 4500, Almagro, CABA' },
  { id: 'cust2', name: 'Martín Pérez', phone: '+5493415551234', email: 'martinperez@hotmail.com', address: 'Bv. Oroño 1200, Rosario, Santa Fe' },
  { id: 'cust3', name: 'Florencia Sosa', phone: '+5492614890987', email: 'florsosa@gmail.com', address: 'Belgrano 345, Mendoza Capital' },
  { id: 'cust4', name: 'Carlos Benítez', phone: '+5491122334455', email: 'carlos_benitez@gmail.com', address: 'Las Heras 1820, Recoleta, CABA' }
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'TD-9021',
    customerName: 'Laura Giménez',
    customerPhone: '+5491134567890',
    items: [
      { productId: 'p1', name: 'Castillo Inflable Clásico', quantity: 1, price: 18000 }
    ],
    totalAmount: 18000,
    status: 'alquilado',
    rentalDate: '2026-07-05',
    returnDate: '2026-07-06 18:00',
    notes: 'Entregar antes de las 13:00. Retiro el lunes por la tarde.'
  },
  {
    id: 'TD-4432',
    customerName: 'Martín Pérez',
    customerPhone: '+5493415551234',
    items: [
      { productId: 'c1', name: 'Combo Cumpleaños Feliz', quantity: 1, price: 23000 },
      { productId: 'p6', name: 'Ficha Arcade Retro Multijuegos', quantity: 1, price: 16000 }
    ],
    totalAmount: 39000,
    status: 'pendiente',
    rentalDate: '2026-07-08',
    returnDate: '2026-07-09 20:00',
    notes: 'Festejo en salón de eventos. Dejar todo instalado.'
  },
  {
    id: 'TD-1123',
    customerName: 'Florencia Sosa',
    customerPhone: '+5492614890987',
    items: [
      { productId: 'p5', name: 'Mesa de Pool Semiprofesional', quantity: 1, price: 19000 }
    ],
    totalAmount: 19000,
    status: 'en_camino',
    rentalDate: '2026-07-05',
    returnDate: '2026-07-06 12:00',
    notes: 'Edificio con ascensor de carga grande.'
  },
  {
    id: 'TD-5544',
    customerName: 'Carlos Benítez',
    customerPhone: '+5491122334455',
    items: [
      { productId: 'p4', name: 'Metegol Profesional de Hierro', quantity: 1, price: 9000 }
    ],
    totalAmount: 9000,
    status: 'completado',
    rentalDate: '2026-07-01',
    returnDate: '2026-07-02 18:00',
    notes: 'Retirado sin novedades.'
  }
];

export const INITIAL_GALLERY_PHOTOS: GalleryPhoto[] = [
  {
    id: 'g1',
    imageUrl: 'https://images.unsplash.com/photo-1545128485-c400e7702796?w=600&auto=format&fit=crop&q=80',
    uploadedBy: 'tenant',
    timestamp: '2026-07-01 15:30',
    caption: '¡Instalación lista para el cumple de 5 años de Benja!'
  },
  {
    id: 'g2',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&auto=format&fit=crop&q=80',
    uploadedBy: 'client',
    timestamp: '2026-07-03 19:45',
    caption: '¡El torneo de metegol estuvo genial! Gracias Tu Diversión'
  },
  {
    id: 'g3',
    imageUrl: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=600&auto=format&fit=crop&q=80',
    uploadedBy: 'client',
    timestamp: '2026-07-04 22:15',
    caption: '¡Los chicos copadísimos con el inflable de tobogán!'
  }
];

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tu-diversion',
    name: 'Tu Diversión',
    phone: '+5491134567890',
    address: 'Av. Rivadavia 6500, Caballito, CABA',
    email: 'contacto@tudiversion.com',
    licenseKey: 'TU-DIVERSION-2026',
    isLicenseActive: true,
    logoUrl: DEFAULT_CASTLE_IMAGE,
    adminTheme: {
      primaryColor: 'emerald',
      fontFamily: 'font-sans'
    },
    publicTheme: {
      fontFamily: 'font-sans',
      colorScheme: 'emerald',
      backgroundColor: '#f8fafc',
      bgType: 'color',
      customTexts: [
        {
          id: 'text-1',
          text: '¡Alquilá la mejor diversión para tu evento! Atendemos en toda la zona.',
          size: 'base',
          font: 'font-sans',
          color: 'text-slate-600'
        },
        {
          id: 'text-2',
          text: '⚡ Reserva rápida por WhatsApp en 3 simples pasos.',
          size: 'sm',
          font: 'font-space',
          color: 'text-emerald-600'
        }
      ]
    },
    categories: ['Pool', 'Inflables', 'Metegoles', 'Arcade'],
    collaborators: [
      {
        id: 'colab1',
        name: 'Diego Ariel',
        phone: '+5491122223333',
        username: 'diego',
        password: '123',
        sessionToken: 'active-session-token-diego'
      },
      {
        id: 'colab2',
        name: 'Gastón Colaborador',
        phone: '+5491144445555',
        username: 'gaston',
        password: '123',
        sessionToken: 'active-session-token-gaston'
      }
    ]
  },
  {
    id: 'rentas-el-castillo',
    name: 'Rentas El Castillo',
    phone: '+5493415559999',
    address: 'Pellegrini 2200, Rosario, Santa Fe',
    email: 'elcastillorentas@gmail.com',
    licenseKey: 'EL-CASTILLO-ROSARIO',
    isLicenseActive: true,
    logoUrl: 'https://images.unsplash.com/photo-1572244101833-2ec3cc807ca7?w=300&auto=format&fit=crop&q=80',
    adminTheme: {
      primaryColor: 'violet',
      fontFamily: 'font-space'
    },
    publicTheme: {
      fontFamily: 'font-space',
      colorScheme: 'violet',
      backgroundColor: '#f5f3ff',
      bgType: 'color',
      customTexts: [
        {
          id: 'text-1',
          text: '🏰 Castillos gigantes, metegoles y más en Rosario.',
          size: 'lg',
          font: 'font-space',
          color: 'text-violet-700'
        }
      ]
    },
    categories: ['Inflables', 'Metegoles'],
    collaborators: [
      {
        id: 'colab3',
        name: 'Colaborador Rosario',
        phone: '+5493415559991',
        username: 'rosario',
        password: '123',
        sessionToken: 'active'
      }
    ]
  }
];
