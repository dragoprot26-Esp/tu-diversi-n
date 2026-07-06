/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  Phone, 
  Mail, 
  QrCode, 
  Share2, 
  Plus, 
  Minus, 
  Trash2, 
  X, 
  Send, 
  Check, 
  Upload, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Shield
} from 'lucide-react';
import { Tenant, Product, Booking, BookingItem, GalleryPhoto, FONT_OPTIONS } from '../types';
import { DEFAULT_CASTLE_IMAGE } from '../data';

interface PublicViewProps {
  tenant: Tenant;
  products: Product[];
  galleryPhotos: GalleryPhoto[];
  onAddBooking: (booking: Booking) => void;
  onAddGalleryPhoto: (photo: GalleryPhoto) => void;
  onSwitchView?: (view: 'public' | 'admin') => void;
  session?: {
    isLoggedIn: boolean;
    role: 'admin' | 'colaborador' | null;
    username: string | null;
  };
}

export function getColorClasses(scheme: string) {
  switch (scheme) {
    case 'emerald':
      return {
        text: 'text-emerald-600',
        bg: 'bg-emerald-600',
        bgHover: 'hover:bg-emerald-700',
        border: 'border-emerald-600',
        bgLight: 'bg-emerald-50',
        textDark: 'text-emerald-900',
        ring: 'focus:ring-emerald-500',
        borderLight: 'border-emerald-200',
        accentHex: '#059669',
      };
    case 'natural_tone':
      return {
        text: 'text-stone-700',
        bg: 'bg-stone-700',
        bgHover: 'hover:bg-stone-800',
        border: 'border-stone-700',
        bgLight: 'bg-stone-100',
        textDark: 'text-stone-900',
        ring: 'focus:ring-stone-500',
        borderLight: 'border-stone-300',
        accentHex: '#57534e',
      };
    case 'prof_polish':
      return {
        text: 'text-slate-800',
        bg: 'bg-slate-800',
        bgHover: 'hover:bg-slate-900',
        border: 'border-slate-800',
        bgLight: 'bg-slate-100',
        textDark: 'text-slate-950',
        ring: 'focus:ring-slate-600',
        borderLight: 'border-slate-300',
        accentHex: '#1e293b',
      };
    case 'blue':
      return {
        text: 'text-blue-600',
        bg: 'bg-blue-600',
        bgHover: 'hover:bg-blue-700',
        border: 'border-blue-600',
        bgLight: 'bg-blue-50',
        textDark: 'text-blue-900',
        ring: 'focus:ring-blue-500',
        borderLight: 'border-blue-200',
        accentHex: '#2563eb',
      };
    case 'violet':
      return {
        text: 'text-violet-600',
        bg: 'bg-violet-600',
        bgHover: 'hover:bg-violet-700',
        border: 'border-violet-600',
        bgLight: 'bg-violet-50',
        textDark: 'text-violet-900',
        ring: 'focus:ring-violet-500',
        borderLight: 'border-violet-200',
        accentHex: '#7c3aed',
      };
    case 'pink':
      return {
        text: 'text-pink-600',
        bg: 'bg-pink-600',
        bgHover: 'hover:bg-pink-700',
        border: 'border-pink-600',
        bgLight: 'bg-pink-50',
        textDark: 'text-pink-900',
        ring: 'focus:ring-pink-500',
        borderLight: 'border-pink-200',
        accentHex: '#db2777',
      };
    case 'rose':
      return {
        text: 'text-rose-600',
        bg: 'bg-rose-600',
        bgHover: 'hover:bg-rose-700',
        border: 'border-rose-600',
        bgLight: 'bg-rose-50',
        textDark: 'text-rose-900',
        ring: 'focus:ring-rose-500',
        borderLight: 'border-rose-200',
        accentHex: '#e11d48',
      };
    case 'orange':
      return {
        text: 'text-orange-600',
        bg: 'bg-orange-600',
        bgHover: 'hover:bg-orange-700',
        border: 'border-orange-600',
        bgLight: 'bg-orange-50',
        textDark: 'text-orange-900',
        ring: 'focus:ring-orange-500',
        borderLight: 'border-orange-200',
        accentHex: '#ea580c',
      };
    case 'amber':
      return {
        text: 'text-amber-600',
        bg: 'bg-amber-600',
        bgHover: 'hover:bg-amber-700',
        border: 'border-amber-600',
        bgLight: 'bg-amber-50',
        textDark: 'text-amber-900',
        ring: 'focus:ring-amber-500',
        borderLight: 'border-amber-200',
        accentHex: '#d97706',
      };
    case 'teal':
      return {
        text: 'text-teal-600',
        bg: 'bg-teal-600',
        bgHover: 'hover:bg-teal-700',
        border: 'border-teal-600',
        bgLight: 'bg-teal-50',
        textDark: 'text-teal-900',
        ring: 'focus:ring-teal-500',
        borderLight: 'border-teal-200',
        accentHex: '#0d9488',
      };
    case 'slate':
      return {
        text: 'text-slate-700',
        bg: 'bg-slate-700',
        bgHover: 'hover:bg-slate-800',
        border: 'border-slate-700',
        bgLight: 'bg-slate-100',
        textDark: 'text-slate-900',
        ring: 'focus:ring-slate-500',
        borderLight: 'border-slate-300',
        accentHex: '#334155',
      };
    case 'amber900':
      return {
        text: 'text-amber-900',
        bg: 'bg-amber-950',
        bgHover: 'hover:bg-black',
        border: 'border-amber-950',
        bgLight: 'bg-amber-50',
        textDark: 'text-amber-950',
        ring: 'focus:ring-amber-950',
        borderLight: 'border-amber-200',
        accentHex: '#451a03',
      };
    case 'purple':
      return {
        text: 'text-purple-600',
        bg: 'bg-purple-600',
        bgHover: 'hover:bg-purple-700',
        border: 'border-purple-600',
        bgLight: 'bg-purple-50',
        textDark: 'text-purple-900',
        ring: 'focus:ring-purple-500',
        borderLight: 'border-purple-200',
        accentHex: '#800080',
      };
    case 'fuchsia':
      return {
        text: 'text-fuchsia-600',
        bg: 'bg-fuchsia-600',
        bgHover: 'hover:bg-fuchsia-700',
        border: 'border-fuchsia-600',
        bgLight: 'bg-fuchsia-50',
        textDark: 'text-fuchsia-900',
        ring: 'focus:ring-fuchsia-500',
        borderLight: 'border-fuchsia-200',
        accentHex: '#c026d3',
      };
    case 'indigo':
      return {
        text: 'text-indigo-600',
        bg: 'bg-indigo-600',
        bgHover: 'hover:bg-indigo-700',
        border: 'border-indigo-600',
        bgLight: 'bg-indigo-50',
        textDark: 'text-indigo-900',
        ring: 'focus:ring-indigo-500',
        borderLight: 'border-indigo-200',
        accentHex: '#4f46e5',
      };
    case 'lime':
      return {
        text: 'text-lime-600',
        bg: 'bg-lime-600',
        bgHover: 'hover:bg-lime-700',
        border: 'border-lime-600',
        bgLight: 'bg-lime-50',
        textDark: 'text-lime-900',
        ring: 'focus:ring-lime-500',
        borderLight: 'border-lime-200',
        accentHex: '#65a30d',
      };
    case 'cyan':
      return {
        text: 'text-cyan-600',
        bg: 'bg-cyan-600',
        bgHover: 'hover:bg-cyan-700',
        border: 'border-cyan-600',
        bgLight: 'bg-cyan-50',
        textDark: 'text-cyan-900',
        ring: 'focus:ring-cyan-500',
        borderLight: 'border-cyan-200',
        accentHex: '#0891b2',
      };
    default:
      return {
        text: 'text-emerald-600',
        bg: 'bg-emerald-600',
        bgHover: 'hover:bg-emerald-700',
        border: 'border-emerald-600',
        bgLight: 'bg-emerald-50',
        textDark: 'text-emerald-900',
        ring: 'focus:ring-emerald-500',
        borderLight: 'border-emerald-200',
        accentHex: '#059669',
      };
  }
}

export default function PublicView({ 
  tenant, 
  products, 
  galleryPhotos, 
  onAddBooking,
  onAddGalleryPhoto,
  onSwitchView,
  session
}: PublicViewProps) {
  const [activeTab, setActiveTab] = useState<string>('todos');
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // Checkout form
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutMethod, setCheckoutMethod] = useState<'whatsapp' | 'email'>('whatsapp');
  const [bookingSuccessCode, setBookingSuccessCode] = useState<string | null>(null);

  // Gallery Upload form
  const [galleryImgUrl, setGalleryImgUrl] = useState('');
  const [galleryCaption, setGalleryCaption] = useState('');
  const [galleryAuthorType, setGalleryAuthorType] = useState<'client' | 'tenant'>('client');

  const themeColors = useMemo(() => getColorClasses(tenant.publicTheme.colorScheme), [tenant.publicTheme.colorScheme]);
  const publicFont = tenant.publicTheme.fontFamily;

  // Compute Categories Tabs
  const availableTabs = useMemo(() => {
    const list = ['todos', 'combos', 'destacados'];
    tenant.categories.forEach(cat => {
      const slug = cat.toLowerCase();
      if (!list.includes(slug)) {
        list.push(slug);
      }
    });
    list.push('galeria');
    return list;
  }, [tenant.categories]);

  // Translate tab slug for rendering
  const tabNames: { [key: string]: string } = {
    todos: 'Todos',
    combos: 'Combos',
    destacados: 'Destacados',
    galeria: 'Galería de Clientes'
  };

  const getTabLabel = (slug: string) => {
    if (tabNames[slug]) return tabNames[slug];
    // capitalize
    return slug.charAt(0).toUpperCase() + slug.slice(1);
  };

  // Filter Products based on activeTab
  const filteredProducts = useMemo(() => {
    if (activeTab === 'todos') {
      return products;
    }
    if (activeTab === 'combos') {
      return products.filter(p => p.isCombo);
    }
    if (activeTab === 'destacados') {
      return products.filter(p => p.isFeatured);
    }
    return products.filter(p => p.category.toLowerCase() === activeTab);
  }, [products, activeTab]);

  // Cart operations
  const cartItemCount: number = (Object.values(cart) as number[]).reduce((sum, count) => sum + count, 0);

  const handleAddToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => {
      const copy = { ...prev };
      if (copy[productId] <= 1) {
        delete copy[productId];
      } else {
        copy[productId]--;
      }
      return copy;
    });
  };

  const handleTrashFromCart = (productId: string) => {
    setCart(prev => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  const cartTotalAmount = useMemo(() => {
    return (Object.entries(cart) as Array<[string, number]>).reduce((total, [productId, quantity]) => {
      const prod = products.find(p => p.id === productId);
      const price = prod?.price || 0;
      return total + (price * quantity);
    }, 0);
  }, [cart, products]);

  // Checkout Submit
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName || !checkoutPhone) return;

    // Generate a unique booking code
    const randCode = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `TD-${randCode}`;

    // Compile items
    const items: BookingItem[] = (Object.entries(cart) as Array<[string, number]>).map(([productId, quantity]) => {
      const prod = products.find(p => p.id === productId);
      return {
        productId,
        name: prod?.name || 'Producto Desconocido',
        quantity,
        price: prod?.price || null
      };
    });

    const booking: Booking = {
      id: bookingCode,
      customerName: checkoutName,
      customerPhone: checkoutPhone.startsWith('+') ? checkoutPhone : `+549${checkoutPhone}`,
      items,
      totalAmount: cartTotalAmount,
      status: 'pendiente',
      rentalDate: new Date().toISOString().split('T')[0],
      returnDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] + ' 18:00',
      notes: 'Reserva realizada desde la página pública'
    };

    // Save Booking in Parent State
    onAddBooking(booking);

    // Formulate prefilled message for WhatsApp / Email
    const itemsSummary = items.map(item => `- ${item.quantity}x ${item.name} ($${item.price || 'S/P'})`).join('\n');
    const messageText = `Hola, quiero realizar un alquiler en *${tenant.name}*.\n\n` +
      `*Código:* ${bookingCode}\n` +
      `*Cliente:* ${checkoutName}\n` +
      `*Teléfono:* ${checkoutPhone}\n\n` +
      `*Pedido:*\n${itemsSummary}\n\n` +
      `*Total Estimado:* $${cartTotalAmount}\n\n` +
      `Por favor contáctenme para coordinar la entrega. Gracias.`;

    // Clear cart and display success screen
    setCart({});
    setBookingSuccessCode(bookingCode);

    // Redirect to default provider
    if (checkoutMethod === 'whatsapp') {
      const cleanPhone = tenant.phone.replace(/[^0-9+]/g, '');
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;
      window.open(waUrl, '_blank');
    } else {
      const emailUrl = `mailto:${tenant.email}?subject=Reserva de Alquiler ${bookingCode}&body=${encodeURIComponent(messageText)}`;
      window.open(emailUrl, '_blank');
    }
  };

  // Gallery photo submission
  const handlePhotoUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryImgUrl) return;

    const newPhoto: GalleryPhoto = {
      id: `g-${Date.now()}`,
      imageUrl: galleryImgUrl,
      uploadedBy: galleryAuthorType,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      caption: galleryCaption || '¡Disfrutando de la diversión!'
    };

    onAddGalleryPhoto(newPhoto);
    setGalleryImgUrl('');
    setGalleryCaption('');
    setIsPhotoModalOpen(false);
  };

  // Share QR via channels
  const handleShareQR = (channel: 'whatsapp' | 'email') => {
    const shareText = `¡Mirá los peloteros, inflables y juegos de *${tenant.name}*! Podés alquilar directo desde su página web: ${window.location.href}`;
    if (channel === 'whatsapp') {
      const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(url, '_blank');
    } else {
      const url = `mailto:?subject=${encodeURIComponent('Te comparto: ' + tenant.name)}&body=${encodeURIComponent(shareText)}`;
      window.open(url, '_blank');
    }
  };

  // Public theme page backgrounds
  const pageBgStyle = tenant.publicTheme.bgType === 'image' && tenant.publicTheme.bgImageUrl
    ? { backgroundImage: `url(${tenant.publicTheme.bgImageUrl})`, backgroundSize: 'cover', backgroundAttachment: 'fixed' }
    : { backgroundColor: tenant.publicTheme.backgroundColor };

  return (
    <div 
      className={`min-h-screen pb-24 ${publicFont}`}
      style={pageBgStyle}
      id="public-view-container"
    >
      {/* Small floating top-left administrator controls */}
      <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
        <button
          onClick={() => onSwitchView?.('admin')}
          title="Panel de Control Inquilino (Acceso Administrativo)"
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-900/90 text-white rounded-full shadow-lg border border-slate-800 text-[11px] font-bold hover:bg-slate-950 transition-all hover:scale-105"
        >
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Panel Inquilino</span>
        </button>

        {session?.isLoggedIn && (
          <button
            onClick={() => onSwitchView?.('admin')}
            title="Volver al Panel"
            className="flex items-center gap-1.5 px-3 py-2 bg-red-600/95 text-white rounded-full shadow-lg border border-red-500 text-[11px] font-bold hover:bg-red-700 transition-all hover:scale-105"
          >
            <X className="w-3.5 h-3.5" />
            <span>Cerrar Vista</span>
          </button>
        )}
      </div>

      {/* Dynamic Floating Sticky Cart Top Center */}
      {cartItemCount > 0 && (
        <div 
          id="cart-sticky-button"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center animate-bounce"
        >
          <button
            onClick={() => setIsCartOpen(true)}
            className={`flex items-center gap-2 px-6 py-3 text-white rounded-full shadow-2xl transition-all font-bold backdrop-blur-md border border-white/20 hover:scale-105 active:scale-95 ${themeColors.bg}`}
          >
            <ShoppingBag className="w-5 h-5 animate-pulse" />
            <span>Ver Pedido</span>
            <span className="flex items-center justify-center w-6 h-6 ml-1 text-xs text-slate-900 bg-white rounded-full font-black">
              {cartItemCount}
            </span>
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 pt-8">
        
        {/* Header Block */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-slate-100 flex flex-col items-center text-center relative overflow-hidden mb-8">
          
          {/* Subtle Accent Stripe */}
          <div className={`absolute top-0 left-0 right-0 h-2 ${themeColors.bg}`} />

          {/* Business Logo */}
          <div className="relative w-24 h-24 rounded-full border-4 border-slate-50 shadow-inner overflow-hidden mb-4">
            <img 
              src={tenant.logoUrl || DEFAULT_CASTLE_IMAGE} 
              alt={tenant.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_CASTLE_IMAGE;
              }}
            />
          </div>

          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            {tenant.name}
          </h1>

          {/* Address and Contact Actions */}
          <div className="mt-2 text-slate-600 flex flex-col items-center gap-1">
            <p className="text-sm font-medium flex items-center gap-1">
              <MapPin className="w-4 h-4 text-slate-400" />
              {tenant.address}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              
              {/* Maps Button */}
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(tenant.address)}`}
                target="_blank"
                rel="noreferrer"
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors`}
                id="maps-redirect-btn"
              >
                <MapPin className="w-3.5 h-3.5" />
                Ver en Mapa
              </a>

              {/* Tel Button */}
              <a 
                href={`tel:${tenant.phone}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                id="phone-call-btn"
              >
                <Phone className="w-3.5 h-3.5" />
                Llamar
              </a>

              {/* Mail Button */}
              <a 
                href={`mailto:${tenant.email}`}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                id="email-contact-btn"
              >
                <Mail className="w-3.5 h-3.5" />
                Enviar Mail
              </a>

              {/* QR Button */}
              <button 
                onClick={() => setIsQrOpen(true)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-white transition-colors ${themeColors.bg} ${themeColors.bgHover}`}
                id="share-qr-btn"
              >
                <QrCode className="w-3.5 h-3.5" />
                Compartir QR
              </button>
            </div>
          </div>

          {/* Configured custom text blocks */}
          {tenant.publicTheme.customTexts && tenant.publicTheme.customTexts.length > 0 && (
            <div className="mt-6 border-t border-slate-100 pt-5 w-full space-y-3">
              {tenant.publicTheme.customTexts.map((txt) => {
                const sizeClasses = {
                  xs: 'text-xs',
                  sm: 'text-sm',
                  base: 'text-base',
                  lg: 'text-lg',
                  xl: 'text-xl',
                  '2xl': 'text-2xl',
                  '3xl': 'text-3xl',
                };
                return (
                  <p 
                    key={txt.id} 
                    className={`${sizeClasses[txt.size] || 'text-base'} ${txt.font} ${txt.color} font-medium px-4 leading-relaxed`}
                  >
                    {txt.text}
                  </p>
                );
              })}
            </div>
          )}
        </div>

        {/* Categories Tabs Scrollable Bar */}
        <div className="flex overflow-x-auto py-2 mb-6 scrollbar-none gap-2" id="public-tabs-nav">
          {availableTabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                  isActive 
                    ? `text-white shadow-md ${themeColors.bg}` 
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
                }`}
              >
                {getTabLabel(tab)}
              </button>
            );
          })}
        </div>

        {/* Tab Contents: Galería is distinct */}
        {activeTab === 'galeria' ? (
          <div id="gallery-tab-container" className="space-y-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-slate-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-800">Galería del Evento</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Aquí los inquilinos y clientes comparten sus mejores fotos disfrutando de los peloteros y juegos.
                  </p>
                </div>
                <button
                  onClick={() => setIsPhotoModalOpen(true)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-all ${themeColors.bg} ${themeColors.bgHover} self-start sm:self-center shadow-lg hover:scale-105`}
                >
                  <Upload className="w-4 h-4" />
                  Compartir Mi Foto
                </button>
              </div>

              {/* Photo Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                {galleryPhotos.map((photo) => (
                  <div key={photo.id} className="group bg-slate-50 rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="relative aspect-square overflow-hidden bg-slate-200">
                      <img 
                        src={photo.imageUrl} 
                        alt={photo.caption || 'Foto del Evento'} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                      <span className={`absolute top-2 left-2 text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full text-white ${
                        photo.uploadedBy === 'tenant' ? 'bg-indigo-600' : 'bg-emerald-600'
                      }`}>
                        {photo.uploadedBy === 'tenant' ? 'Inquilino' : 'Cliente'}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-slate-700 italic font-medium leading-relaxed">
                        &ldquo;{photo.caption}&rdquo;
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono block mt-2 text-right">
                        {photo.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Products Grid */
          <div id="products-tab-container" className="space-y-4">
            {filteredProducts.length === 0 ? (
              <div className="bg-white/80 rounded-2xl p-12 text-center text-slate-400 border border-slate-100">
                <p className="font-semibold text-lg">No hay productos cargados en esta categoría.</p>
                <p className="text-sm mt-1">Pronto agregaremos opciones fabulosas para vos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredProducts.map((prod) => (
                  <div 
                    key={prod.id}
                    className="bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden shadow-lg border border-slate-100/80 flex flex-col hover:shadow-xl transition-shadow relative group"
                  >
                    {prod.isFeatured && (
                      <div className={`absolute top-3 right-3 z-10 flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black tracking-wide uppercase text-white shadow-md ${themeColors.bg}`}>
                        <Sparkles className="w-3 h-3 animate-spin" />
                        Destacado
                      </div>
                    )}
                    
                    {/* Image */}
                    <div className="relative aspect-video bg-slate-100 overflow-hidden">
                      {/* Availability Status Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase shadow-md border ${
                          (prod.status || 'Disponible') === 'Disponible' 
                            ? 'bg-emerald-600 border-emerald-500 text-white' 
                            : (prod.status || 'Disponible') === 'Alquilado'
                              ? 'bg-red-600 border-red-500 text-white'
                              : 'bg-slate-600 border-slate-500 text-white'
                        }`}>
                          {prod.status || 'Disponible'}
                        </span>
                      </div>

                      <img 
                        src={prod.imageUrl} 
                        alt={prod.name} 
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/castillo/600/400';
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${themeColors.text}`}>
                          {prod.category}
                        </span>
                        <h3 className="text-lg font-bold text-slate-800 mt-1">
                          {prod.name}
                        </h3>
                        <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                          {prod.description}
                        </p>

                        {/* Custom fields (Medidas/Capacidad etc.) */}
                        {prod.customFields && prod.customFields.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {prod.customFields.map((field, idx) => (
                              <div key={idx} className="bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 text-xs text-slate-600">
                                <strong className="text-slate-700 font-semibold">{field.label}:</strong> {field.value}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-6 border-t border-slate-50 pt-4 flex items-center justify-between gap-4">
                        <div className="text-slate-800">
                          <span className="text-[10px] text-slate-400 block font-bold tracking-wider uppercase">Precio Alquiler</span>
                          <span className="text-xl font-black text-slate-900">
                            {prod.price ? `$${prod.price.toLocaleString('es-AR')}` : 'Consultar'}
                          </span>
                        </div>

                        <button
                          onClick={() => handleAddToCart(prod.id)}
                          className={`flex items-center gap-1.5 px-5 py-3 rounded-2xl text-xs font-black text-white shadow-md transition-all hover:scale-105 active:scale-95 ${themeColors.bg} ${themeColors.bgHover}`}
                          id={`rent-btn-${prod.id}`}
                        >
                          <Plus className="w-4 h-4" />
                          Alquilar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* App Builder Credit Footer as Requested */}
        <div className="mt-16 border-t border-slate-200 pt-8 text-center" id="public-footer">
          <p className="text-xs text-slate-400 font-mono tracking-wide">
            TU DIVERSIÓN PWA &copy; {new Date().getFullYear()} - {tenant.name}
          </p>
          <div className="mt-4 bg-white/80 max-w-md mx-auto p-5 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-sm font-semibold text-slate-700">
              ¿Querés tu página para tu emprendimiento?
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Contactate con: <strong className="text-slate-800 font-mono">dragoprot26@gmail.com</strong>
            </p>
            <div className="mt-3">
              <a 
                href="https://vitrina-cyc.vercel.app/" 
                target="_blank" 
                rel="noreferrer" 
                className={`inline-flex items-center gap-1.5 text-xs font-black text-white px-4 py-2 rounded-xl shadow-md transition-all hover:scale-105 ${themeColors.bg} ${themeColors.bgHover}`}
                id="vitrina-btn"
              >
                <span>Acceder a Vitrina</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL: SHOPPING CART */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="cart-modal">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className={`w-5 h-5 ${themeColors.text}`} />
                <h3 className="text-lg font-black text-slate-800">Mi Pedido de Alquiler</h3>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="p-5 overflow-y-auto flex-1 space-y-3 min-h-[150px]">
              {Object.keys(cart).length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <ShoppingBag className="w-12 h-12 mx-auto stroke-1" />
                  <p className="font-semibold mt-2">Tu pedido está vacío.</p>
                  <p className="text-xs mt-0.5">Agrega algunos productos para empezar.</p>
                </div>
              ) : (
                (Object.entries(cart) as Array<[string, number]>).map(([productId, quantity]) => {
                  const prod = products.find(p => p.id === productId);
                  if (!prod) return null;
                  return (
                    <div key={productId} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <img 
                          src={prod.imageUrl} 
                          alt={prod.name} 
                          className="w-12 h-12 rounded-lg object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{prod.name}</h4>
                          <span className="text-[10px] text-slate-500 block">{prod.category}</span>
                          <span className="text-xs font-extrabold text-slate-700">
                            {prod.price ? `$${(prod.price * quantity).toLocaleString('es-AR')}` : 'Precio a consultar'}
                          </span>
                        </div>
                      </div>

                      {/* Quantities */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleRemoveFromCart(productId)}
                          className="p-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black text-slate-800 min-w-4 text-center">
                          {quantity}
                        </span>
                        <button 
                          onClick={() => handleAddToCart(productId)}
                          className="p-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => handleTrashFromCart(productId)}
                          className="p-1 rounded-md text-red-500 hover:bg-red-50 transition-colors ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Success Code Screen */}
              {bookingSuccessCode && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center my-4">
                  <Check className="w-10 h-10 text-emerald-600 bg-white rounded-full p-2 mx-auto shadow-md" />
                  <h4 className="text-md font-extrabold text-emerald-900 mt-2">¡Pedido Enviado!</h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    Tu código de reserva temporal es: <strong className="font-mono text-sm uppercase bg-emerald-100 px-2 py-0.5 rounded text-emerald-950 font-black">{bookingSuccessCode}</strong>
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-2">
                    Se han enviado los detalles por el canal seleccionado para coordinar el pago y la entrega. ¡Muchas gracias!
                  </p>
                  <button
                    onClick={() => setBookingSuccessCode(null)}
                    className="mt-3 text-xs font-bold text-emerald-700 hover:underline"
                  >
                    Hacer otro pedido
                  </button>
                </div>
              )}
            </div>

            {/* Total / Checkout Form */}
            {Object.keys(cart).length > 0 && (
              <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between font-black text-slate-800 text-md mb-4">
                  <span>Total Alquiler:</span>
                  <span className={themeColors.text}>${cartTotalAmount.toLocaleString('es-AR')}</span>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tu Nombre Completo</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej. Juan Pérez"
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Tu Teléfono (Sin el 15, Ej. 1123456789)</label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-mono font-bold">+54 9</span>
                      <input 
                        type="tel" 
                        required
                        placeholder="1134567890"
                        value={checkoutPhone}
                        onChange={(e) => setCheckoutPhone(e.target.value)}
                        className="w-full pl-16 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 font-medium font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Enviar por Defecto vía</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setCheckoutMethod('whatsapp')}
                        className={`py-2 px-3 text-xs font-bold border rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                          checkoutMethod === 'whatsapp' 
                            ? 'bg-emerald-600 text-white border-emerald-600' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => setCheckoutMethod('email')}
                        className={`py-2 px-3 text-xs font-bold border rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                          checkoutMethod === 'email' 
                            ? 'bg-slate-700 text-white border-slate-700' 
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Email
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full mt-4 py-3 text-xs font-black text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-2 ${themeColors.bg} ${themeColors.bgHover}`}
                    id="checkout-submit-btn"
                  >
                    <span>Confirmar y Enviar Reserva</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: QR CODE */}
      {isQrOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="qr-modal">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm text-center animate-in fade-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => setIsQrOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <QrCode className={`w-12 h-12 mx-auto mb-2 ${themeColors.text}`} />
            <h3 className="text-lg font-extrabold text-slate-800">Compartir {tenant.name}</h3>
            <p className="text-xs text-slate-400 mt-1">Escanea para ingresar directo a los productos públicos</p>

            {/* Custom Visual QR Simulation */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 my-4 inline-block">
              <div className="w-48 h-48 bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col items-center justify-center relative">
                
                {/* Simulated QR Code Blocks */}
                <div className="grid grid-cols-4 gap-1 w-full h-full opacity-90">
                  <div className="bg-slate-900 rounded-sm" />
                  <div className="bg-slate-900 rounded-sm" />
                  <div className="bg-transparent" />
                  <div className="bg-slate-900 rounded-sm" />
                  
                  <div className="bg-slate-900 rounded-sm" />
                  <div className="bg-transparent" />
                  <div className="bg-slate-900 rounded-sm" />
                  <div className="bg-slate-900 rounded-sm" />
                  
                  <div className="bg-transparent" />
                  <div className="bg-slate-900 rounded-sm" />
                  <div className="bg-slate-900 rounded-sm" />
                  <div className="bg-transparent" />
                  
                  <div className="bg-slate-900 rounded-sm" />
                  <div className="bg-slate-900 rounded-sm" />
                  <div className="bg-transparent" />
                  <div className="bg-slate-900 rounded-sm" />
                </div>

                {/* Simulated Center Logo */}
                <div className="absolute inset-0 m-auto w-10 h-10 bg-white rounded-full border border-slate-200 flex items-center justify-center p-0.5 shadow">
                  <img src={tenant.logoUrl || DEFAULT_CASTLE_IMAGE} alt="QR Logo" className="w-full h-full object-cover rounded-full" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 block uppercase tracking-wider mb-2">Compartir Enlace</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleShareQR('whatsapp')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 border border-emerald-200 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100"
                >
                  <Send className="w-3.5 h-3.5" />
                  WhatsApp
                </button>
                <button
                  onClick={() => handleShareQR('email')}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 border border-blue-200 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100"
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD GALLERY PHOTO */}
      {isPhotoModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="gallery-upload-modal">
          <div className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => setIsPhotoModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <Upload className={`w-8 h-8 text-slate-500 mb-2`} />
            <h3 className="text-lg font-extrabold text-slate-800">Subir "La Mejor Foto"</h3>
            <p className="text-xs text-slate-400 mt-1">Compartí un lindo momento de tu evento para la galería pública.</p>

            <form onSubmit={handlePhotoUpload} className="space-y-4 mt-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">¿Quién sube la foto?</label>
                <select
                  value={galleryAuthorType}
                  onChange={(e) => setGalleryAuthorType(e.target.value as 'client' | 'tenant')}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                >
                  <option value="client">Soy Cliente</option>
                  <option value="tenant">Soy Inquilino / Administrador</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">URL de la Imagen o Foto</label>
                <input 
                  type="url"
                  required
                  placeholder="Pegá un link de imagen (Ej. Unsplash, Imgur o similar)"
                  value={galleryImgUrl}
                  onChange={(e) => setGalleryImgUrl(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Sugerencia: Podés usar links rápidos de Unsplash o cualquier servidor de imágenes de tu celular.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Un breve Comentario o Epígrafe</label>
                <input 
                  type="text"
                  placeholder="Ej. ¡El pelotero estuvo genial en el cumple de Marti!"
                  value={galleryCaption}
                  onChange={(e) => setGalleryCaption(e.target.value)}
                  className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 ${themeColors.bg} ${themeColors.bgHover}`}
                id="submit-gallery-photo-btn"
              >
                <Check className="w-4 h-4" />
                Publicar Foto
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
