/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Lock,
  Smartphone,
  Settings,
  Users, 
  Palette, 
  Layers, 
  ListOrdered, 
  Plus, 
  Trash2, 
  Edit, 
  LogOut, 
  PlusCircle, 
  Check, 
  Info, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
  CheckSquare,
  Square,
  Send,
  Camera,
  Type,
  PhoneCall,
  UserCheck,
  Mail,
  MapPin
} from 'lucide-react';
import { 
  Tenant, 
  Product, 
  Customer, 
  Booking, 
  Collaborator, 
  CustomField, 
  CustomText,
  BookingStatus,
  FONT_OPTIONS, 
  COLOR_OPTIONS 
} from '../types';
import { DEFAULT_CASTLE_IMAGE } from '../data';
import {
  validarLicencia, asegurarCuentaSeguraDueno, asegurarCuentaSeguraColab,
} from '../db/cloud';
import { bioSupported, bioEnabled, bioEnable, bioLogin } from '../db/biometric';

interface AdminPanelProps {
  tenant: Tenant;
  allTenants: Tenant[];
  products: Product[];
  customers: Customer[];
  bookings: Booking[];
  currentSession: {
    isLoggedIn: boolean;
    role: 'admin' | 'colaborador' | null;
    username: string | null;
    colabId?: string;
  };
  onUpdateTenant: (updatedTenant: Tenant) => void;
  onUpdateProducts: (updatedProducts: Product[]) => void;
  onUpdateCustomers: (updatedCustomers: Customer[]) => void;
  onUpdateBookings: (updatedBookings: Booking[]) => void;
  onLogin: (role: 'admin' | 'colaborador', username: string, codigo: string, colabId?: string) => void;
  onLogout: () => void;
  onSwitchTenant: (tenantId: string) => void;
  onSwitchView?: (view: 'public' | 'admin') => void;
}

export function AdminPanel({
  tenant,
  allTenants,
  products,
  customers,
  bookings,
  currentSession,
  onUpdateTenant,
  onUpdateProducts,
  onUpdateCustomers,
  onUpdateBookings,
  onLogin,
  onLogout,
  onSwitchTenant,
  onSwitchView
}: AdminPanelProps) {
  // Licensing State
  const [licenseInput, setLicenseInput] = useState('');
  const [licenseVerified, setLicenseVerified] = useState(false);
  const [licenseError, setLicenseError] = useState('');

  // Login State
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginRole, setLoginRole] = useState<'admin' | 'colaborador'>('admin');
  const [loginLoading, setLoginLoading] = useState(false);

  // Ingreso biométrico (huella / Face ID) en este dispositivo
  const [bioAvail, setBioAvail] = useState(false);
  const [bioOn, setBioOn] = useState(false);
  const [bioCheck, setBioCheck] = useState(false);

  useEffect(() => {
    bioSupported().then(setBioAvail);
    setBioOn(bioEnabled());
  }, []);

  // Tab state inside Admin
  const [adminTab, setAdminTab] = useState<'dashboard' | 'productos' | 'clientes' | 'alquilados' | 'libres' | 'colaboradores' | 'tema' | 'publico' | 'configuracion'>('dashboard');

  // Timeframe filter for Dashboard
  const [timeframe, setTimeframe] = useState<'diario' | 'semana' | 'anual'>('semana');

  // Product CRUD states
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<Omit<Product, 'id'>>({
    category: 'Inflables',
    name: '',
    description: '',
    price: null,
    imageUrl: '',
    isCombo: false,
    isFeatured: false,
    customFields: [],
    status: 'Disponible'
  });
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

  // Customer CRUD states
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState<Omit<Customer, 'id'>>({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  // Category CRUD state
  const [newCategoryName, setNewCategoryName] = useState('');

  // Custom Texts state
  const [newTextContent, setNewTextContent] = useState('');
  const [newTextSize, setNewTextSize] = useState<'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl'>('base');
  const [newTextFont, setNewTextFont] = useState('font-sans');
  const [newTextColor, setNewTextColor] = useState('text-slate-600');

  // Collaborator CRUD states
  const [editingColab, setEditingColab] = useState<Collaborator | null>(null);
  const [colabForm, setColabForm] = useState<Omit<Collaborator, 'id'>>({
    name: '',
    phone: '',
    username: '',
    password: ''
  });

  // Recommendation checklist
  const [recommendedProducts, setRecommendedProducts] = useState<string[]>([]);
  const [recommendTargetPhone, setRecommendTargetPhone] = useState('');

  // Fetch color accent for Admin Theme
  const adminThemeClass = useMemo(() => {
    const config = COLOR_OPTIONS.find(c => c.primaryTailwind === tenant.adminTheme.primaryColor);
    return config || COLOR_OPTIONS[0];
  }, [tenant.adminTheme.primaryColor]);

  const primaryColorHex = adminThemeClass.accentHex;

  // Login real reutilizable (formulario y huella) — molde CyC
  const doLogin = async (code: string, usuario: string, clave: string, role: 'admin' | 'colaborador') => {
    const lic = await validarLicencia(code);
    if (!lic) return { ok: false, msg: 'Licencia inválida, inexistente o vencida.' };
    const r = role === 'admin'
      ? await asegurarCuentaSeguraDueno(usuario, clave, code)
      : await asegurarCuentaSeguraColab(usuario, clave, code);
    if (!r.ok) return { ok: false, msg: r.msg || 'No se pudo iniciar sesión.' };
    onLogin(role, usuario, code);
    return { ok: true };
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const code = licenseInput.trim().toUpperCase();
    const usuario = loginUser.trim();
    const clave = loginPass;
    if (!code) { setLoginError('Ingresá el código de licencia.'); return; }
    if (!usuario) { setLoginError('Ingresá tu usuario.'); return; }
    if (clave.length < 6) { setLoginError('La contraseña debe tener 6 caracteres o más.'); return; }
    setLoginLoading(true);
    try {
      const r = await doLogin(code, usuario, clave, loginRole);
      if (!r.ok) { setLoginError(r.msg || 'No se pudo iniciar sesión.'); return; }
      if (bioCheck && bioAvail) {
        try { await bioEnable({ codigo: code, usuario, password: clave, role: loginRole }); setBioOn(true); }
        catch (e) { /* si la huella falla, igual entra */ }
      }
    } catch (err: any) {
      setLoginError('Error de conexión: ' + (err?.message || err));
    } finally {
      setLoginLoading(false);
    }
  };

  // Ingreso con huella / Face ID
  const handleBioLogin = async () => {
    setLoginError('');
    setLoginLoading(true);
    try {
      const creds = await bioLogin();
      if (!creds) { setLoginError('No se pudo leer la huella. Ingresá con tus datos.'); return; }
      const r = await doLogin(creds.codigo, creds.usuario, creds.password, creds.role);
      if (!r.ok) { setLoginError((r.msg || 'No se pudo entrar') + ' — volvé a ingresar tus datos.'); return; }
    } catch (err: any) {
      setLoginError('Huella cancelada o no disponible en este dispositivo.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Enforce Collaborator Restrictions
  const isColab = currentSession.role === 'colaborador';

  // Subir imagen desde PC/Móvil → la comprime y devuelve un data URI (base64)
  const subirImagen = (file: File, maxW: number, cb: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.drawImage(img, 0, 0, w, h);
        cb(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Totalized Metrics
  const metrics = useMemo(() => {
    const filteredBookings = bookings.filter(b => {
      if (timeframe === 'diario') {
        return b.rentalDate === new Date().toISOString().split('T')[0];
      }
      if (timeframe === 'semana') {
        const diffTime = Math.abs(Date.now() - new Date(b.rentalDate).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      }
      return true; // anual or all
    });

    const totalRevenue = filteredBookings
      .filter(b => b.status === 'alquilado' || b.status === 'completado')
      .reduce((sum, b) => sum + b.totalAmount, 0);

    const rentalsCount = filteredBookings.length;

    // Most Rented Product
    const itemCounts: { [name: string]: number } = {};
    filteredBookings.forEach(b => {
      b.items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
      });
    });

    let topProduct = 'Ninguno';
    let maxCount = 0;
    Object.entries(itemCounts).forEach(([name, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topProduct = name;
      }
    });

    return {
      revenue: totalRevenue,
      rentalsCount,
      topProduct,
      maxCount,
      activeRentals: bookings.filter(b => b.status === 'alquilado').length,
      pendingRentals: bookings.filter(b => b.status === 'pendiente').length
    };
  }, [bookings, timeframe]);

  // Product Form Field Operations
  const handleAddField = () => {
    if (!newFieldName.trim() || !newFieldValue.trim()) return;
    setProductForm(prev => ({
      ...prev,
      customFields: [...prev.customFields, { label: newFieldName.trim(), value: newFieldValue.trim() }]
    }));
    setNewFieldName('');
    setNewFieldValue('');
  };

  const handleRemoveField = (idx: number) => {
    setProductForm(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== idx)
    }));
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name) return;

    if (editingProduct) {
      const updated = products.map(p => 
        p.id === editingProduct.id ? { ...productForm, id: editingProduct.id } as Product : p
      );
      onUpdateProducts(updated);
      setEditingProduct(null);
    } else {
      const newProd: Product = {
        ...productForm,
        id: `p-${Date.now()}`
      };
      onUpdateProducts([...products, newProd]);
    }

    // Reset Form
    setProductForm({
      category: tenant.categories[0] || 'Inflables',
      name: '',
      description: '',
      price: null,
      imageUrl: '',
      isCombo: false,
      isFeatured: false,
      customFields: [],
      status: 'Disponible'
    });
  };

  const handleStartEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      category: prod.category,
      name: prod.name,
      description: prod.description,
      price: prod.price,
      imageUrl: prod.imageUrl,
      isCombo: prod.isCombo,
      isFeatured: prod.isFeatured,
      customFields: prod.customFields || [],
      status: prod.status || 'Disponible'
    });
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este producto?')) {
      onUpdateProducts(products.filter(p => p.id !== id));
    }
  };

  // Category Add / Delete
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const cleanCat = newCategoryName.trim();
    if (!tenant.categories.includes(cleanCat)) {
      onUpdateTenant({
        ...tenant,
        categories: [...tenant.categories, cleanCat]
      });
    }
    setNewCategoryName('');
  };

  const handleDeleteCategory = (cat: string) => {
    if (window.confirm(`¿Eliminar la categoría "${cat}"? Los productos no se borrarán pero cambiarán de pestaña.`)) {
      onUpdateTenant({
        ...tenant,
        categories: tenant.categories.filter(c => c !== cat)
      });
    }
  };

  // Custom Text Operations
  const handleAddCustomText = () => {
    if (!newTextContent.trim()) return;
    const newText: CustomText = {
      id: `txt-${Date.now()}`,
      text: newTextContent.trim(),
      size: newTextSize,
      font: newTextFont,
      color: newTextColor
    };

    onUpdateTenant({
      ...tenant,
      publicTheme: {
        ...tenant.publicTheme,
        customTexts: [...(tenant.publicTheme.customTexts || []), newText]
      }
    });

    setNewTextContent('');
  };

  const handleRemoveCustomText = (id: string) => {
    onUpdateTenant({
      ...tenant,
      publicTheme: {
        ...tenant.publicTheme,
        customTexts: tenant.publicTheme.customTexts.filter(t => t.id !== id)
      }
    });
  };

  // Customer CRUD Operations
  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name || !customerForm.phone) return;

    const phoneWithPrefix = customerForm.phone.startsWith('+') 
      ? customerForm.phone 
      : `+549${customerForm.phone}`;

    if (editingCustomer) {
      const updated = customers.map(c => 
        c.id === editingCustomer.id ? { ...customerForm, phone: phoneWithPrefix, id: editingCustomer.id } as Customer : c
      );
      onUpdateCustomers(updated);
      setEditingCustomer(null);
    } else {
      const newCust: Customer = {
        ...customerForm,
        phone: phoneWithPrefix,
        id: `cust-${Date.now()}`
      };
      onUpdateCustomers([...customers, newCust]);
    }

    setCustomerForm({ name: '', phone: '', email: '', address: '' });
  };

  const handleStartEditCustomer = (cust: Customer) => {
    setEditingCustomer(cust);
    setCustomerForm({
      name: cust.name,
      phone: cust.phone.replace('+549', ''),
      email: cust.email || '',
      address: cust.address || ''
    });
  };

  const handleDeleteCustomer = (id: string) => {
    if (window.confirm('¿Está seguro de eliminar este cliente?')) {
      onUpdateCustomers(customers.filter(c => c.id !== id));
    }
  };

  // Collaborator CRUD Operations
  const handleColabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colabForm.name || !colabForm.username || !colabForm.password) return;

    const phoneWithPrefix = colabForm.phone.startsWith('+') 
      ? colabForm.phone 
      : `+549${colabForm.phone}`;

    if (editingColab) {
      const updated = tenant.collaborators.map(c => 
        c.id === editingColab.id ? { ...colabForm, phone: phoneWithPrefix, id: editingColab.id, sessionToken: editingColab.sessionToken } as Collaborator : c
      );
      onUpdateTenant({
        ...tenant,
        collaborators: updated
      });
      setEditingColab(null);
    } else {
      const newColab: Collaborator = {
        ...colabForm,
        phone: phoneWithPrefix,
        id: `colab-${Date.now()}`,
        sessionToken: `active-session-token-${Date.now()}` // Default active
      };
      onUpdateTenant({
        ...tenant,
        collaborators: [...tenant.collaborators, newColab]
      });
    }

    setColabForm({ name: '', phone: '', username: '', password: '' });
  };

  // Remote / Wireless Logout for collaborators (Invalidating sessionToken)
  const handleWirelessLogout = (colabId: string) => {
    const updated = tenant.collaborators.map(c => {
      if (c.id === colabId) {
        return { ...c, sessionToken: undefined }; // invalidate
      }
      return c;
    });

    onUpdateTenant({
      ...tenant,
      collaborators: updated
    });
    alert('Sesión inalámbrica cerrada por seguridad de forma remota.');
  };

  // Re-enable / reset wireless session
  const handleEnableWirelessSession = (colabId: string) => {
    const updated = tenant.collaborators.map(c => {
      if (c.id === colabId) {
        return { ...c, sessionToken: `active-token-${Date.now()}` }; // enable
      }
      return c;
    });

    onUpdateTenant({
      ...tenant,
      collaborators: updated
    });
  };

  // WHATSAPP TRIGGER: "En Camino"
  const handleSendEnCamino = (booking: Booking) => {
    const cleanPhone = booking.customerPhone.replace(/[^0-9+]/g, '');
    const itemsSummary = booking.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
    const waText = `¡Hola *${booking.customerName}*! Te avisamos de *${tenant.name}* que tu pedido [${booking.id}] (${itemsSummary}) ya va *EN CAMINO* hacia tu domicilio. ¡Nos vemos en breve! 🚚🎉`;
    
    // Update booking status to 'en_camino'
    const updated = bookings.map(b => b.id === booking.id ? { ...b, status: 'en_camino' as BookingStatus } : b);
    onUpdateBookings(updated);

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`, '_blank');
  };

  // WHATSAPP TRIGGER: "Retiro"
  const handleSendRetiro = (booking: Booking) => {
    const cleanPhone = booking.customerPhone.replace(/[^0-9+]/g, '');
    const waText = `Hola *${booking.customerName}* de *${tenant.name}*. En breve estaremos retirando los productos alquilados.\n\n` +
      `¡Esperamos que lo hayan disfrutado mucho! Nos encantaría que subas *La Mejor Foto* del evento a nuestra galería pública aquí para que otros la disfruten: ${window.location.origin}/?codigo=${tenant.id}#galeria 📸🎈`;

    // Update booking status to 'completado'
    const updated = bookings.map(b => b.id === booking.id ? { ...b, status: 'completado' as BookingStatus } : b);
    onUpdateBookings(updated);

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`, '_blank');
  };

  // EXTENDER: suma tiempo a la devolución del alquiler (si el inquilino lo habilitó)
  const handleExtender = (booking: Booking) => {
    const extra = window.prompt('¿Cuánto querés extender el alquiler? (ej: 2 horas, 1 día, hasta las 22:00)');
    if (!extra || !extra.trim()) return;
    const nuevaDev = `${booking.returnDate}  +${extra.trim()}`;
    const updated = bookings.map(b => b.id === booking.id
      ? { ...b, returnDate: nuevaDev, notes: `${b.notes || ''} · Extendido: ${extra.trim()}`.trim() }
      : b);
    onUpdateBookings(updated);
    // Aviso opcional al cliente por WhatsApp
    const cleanPhone = booking.customerPhone.replace(/[^0-9+]/g, '');
    const waText = `¡Hola *${booking.customerName}*! Confirmamos la *extensión* de tu alquiler en *${tenant.name}*: +${extra.trim()}. ¡A seguir disfrutando! 🎉`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`, '_blank');
  };

  // Recommendation Checklist
  const toggleRecommendedProduct = (id: string) => {
    setRecommendedProducts(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSendRecommendations = () => {
    if (recommendedProducts.length === 0 || !recommendTargetPhone) {
      alert('Seleccione al menos un producto e ingrese el teléfono de destino.');
      return;
    }

    const selectedProds = products.filter(p => recommendedProducts.includes(p.id));
    const listSummary = selectedProds.map(p => `- *${p.name}*: ${p.description} ($${p.price || 'S/P'})`).join('\n');
    const waText = `Hola, te recomiendo estos productos de *${tenant.name}* que están disponibles y libres para alquiler inmediato:\n\n${listSummary}\n\nPodés verlos y reservarlos acá: ${window.location.origin}/?codigo=${tenant.id}`;

    const cleanPhone = recommendTargetPhone.startsWith('+') 
      ? recommendTargetPhone.replace(/[^0-9+]/g, '')
      : `549${recommendTargetPhone}`.replace(/[^0-9+]/g, '');

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waText)}`, '_blank');
    setRecommendedProducts([]);
    setRecommendTargetPhone('');
  };

  // Free Products Calculation
  const freeProducts = useMemo(() => {
    // A product is free if it's not currently in any 'alquilado' or 'en_camino' bookings
    const activeBookingItemNames = new Set<string>();
    bookings.forEach(b => {
      if (b.status === 'alquilado' || b.status === 'en_camino') {
        b.items.forEach(item => {
          activeBookingItemNames.add(item.name);
        });
      }
    });

    return products.filter(p => !activeBookingItemNames.has(p.name));
  }, [products, bookings]);


  // PANTALLA DE LOGIN DEL PANEL (molde CyC: licencia + usuario + contraseña + huella)
  if (!currentSession.isLoggedIn) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 font-sans" id="login-gate-container">
        <div className="bg-white rounded-3xl p-8 shadow-xl max-w-md w-full border border-slate-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 border border-emerald-100">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-slate-800 tracking-tight text-center">Portal Administrativo</h2>
          <p className="text-xs text-slate-500 mt-1 text-center font-medium">
            Ingresá con tu licencia <strong className="text-emerald-600">DIVE</strong>
          </p>

          {bioAvail && bioOn && (
            <div className="w-full mt-5">
              <button
                type="button"
                onClick={handleBioLogin}
                disabled={loginLoading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" /> Ingresar con huella / Face ID
              </button>
              <div className="flex items-center gap-2 my-3">
                <span className="flex-1 h-px bg-slate-200"></span>
                <span className="text-[10px] text-slate-400 uppercase">o con tus datos</span>
                <span className="flex-1 h-px bg-slate-200"></span>
              </div>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="w-full mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button type="button" onClick={() => { setLoginRole('admin'); setLoginError(''); }}
                className={`py-2 rounded-lg text-[11px] font-black transition ${loginRole === 'admin' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500'}`}>👑 Dueño/a</button>
              <button type="button" onClick={() => { setLoginRole('colaborador'); setLoginError(''); }}
                className={`py-2 rounded-lg text-[11px] font-black transition ${loginRole === 'colaborador' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500'}`}>🤝 Colaborador/a</button>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Código de Licencia</label>
              <input
                type="text" required placeholder="DIVE-XXXX-..."
                value={licenseInput}
                onChange={(e) => setLicenseInput(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Usuario</label>
              <input
                type="text" required placeholder="Tu nombre de usuario"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contraseña</label>
              <input
                type="password" required placeholder="Mínimo 6 caracteres"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full mt-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none"
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-500 bg-red-50 p-2.5 rounded-xl border border-red-100 font-semibold">
                ⚠️ {loginError}
              </p>
            )}

            {bioAvail && !bioOn && (
              <label className="flex items-start gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200 cursor-pointer">
                <input type="checkbox" checked={bioCheck} onChange={(e) => setBioCheck(e.target.checked)} className="mt-0.5 w-4 h-4 accent-emerald-600" />
                <span>🔒 <strong>Activar ingreso con huella / Face ID</strong> en este dispositivo, para no volver a tipear las credenciales.</span>
              </label>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 text-xs font-bold text-white rounded-xl shadow-md bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 transition-all flex items-center justify-center gap-1.5"
            >
              {loginLoading ? 'Ingresando…' : (<><span>Ingresar al Panel</span><ArrowRight className="w-4 h-4" /></>)}
            </button>
          </form>

          <div className="mt-6 text-[10px] text-slate-400 border-t border-slate-100 pt-4 w-full text-center leading-relaxed">
            Ingresá el código de licencia (empieza con <strong className="text-slate-600">DIVE-</strong>) y creá o usá tu
            usuario y contraseña de Dueño/a. El Colaborador/a entra con la misma licencia y las credenciales que le cargó el dueño.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans flex flex-col md:flex-row" id="admin-main-dashboard">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0">
        <div>
          {/* Tenant profile block */}
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <img 
              src={tenant.logoUrl || DEFAULT_CASTLE_IMAGE} 
              alt={tenant.name} 
              className="w-10 h-10 rounded-full object-cover border border-slate-700" 
              referrerPolicy="no-referrer"
            />
            <div className="overflow-hidden">
              <h4 className="text-sm font-black text-white truncate">{tenant.name}</h4>
              <span className="text-[10px] text-slate-400 font-mono block truncate">
                {isColab ? 'Colaborador: ' : 'Inquilino Admin: '} 
                <span className="text-emerald-400">{currentSession.username}</span>
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5" id="admin-sidebar-nav">
            <button
              onClick={() => setAdminTab('dashboard')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                adminTab === 'dashboard' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Dashboard General
            </button>

            <button
              onClick={() => setAdminTab('alquilados')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                adminTab === 'alquilados' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4 text-blue-400" />
              Alquilados / Devolución
            </button>

            <button
              onClick={() => setAdminTab('clientes')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                adminTab === 'clientes' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4 text-pink-400" />
              Clientes Registrados
            </button>

            <button
              onClick={() => setAdminTab('libres')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                adminTab === 'libres' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 text-amber-400" />
              Productos Libres
            </button>

            {/* Restricted Sections (Admin Only) */}
            {!isColab && (
              <>
                <div className="px-3 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 mt-4 border-t border-slate-800/60 pt-4">
                  Administración
                </div>

                <button
                  onClick={() => setAdminTab('productos')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    adminTab === 'productos' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Productos y Categorías
                </button>

                <button
                  onClick={() => setAdminTab('colaboradores')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    adminTab === 'colaboradores' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-fuchsia-400" />
                  Colaboradores
                </button>

                <button
                  onClick={() => setAdminTab('tema')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    adminTab === 'tema' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Palette className="w-4 h-4 text-cyan-400" />
                  Tema del Panel
                </button>

                <button
                  onClick={() => setAdminTab('publico')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    adminTab === 'publico' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  Tema Público
                </button>

                <button
                  onClick={() => setAdminTab('configuracion')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    adminTab === 'configuracion' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Configuración Inquilino
                </button>
              </>
            )}
          </nav>
        </div>

        {/* VIEW PAGE AND LOGOUT BUTTON */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          {onSwitchView && (
            <button
              onClick={() => onSwitchView('public')}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              Ver Página Pública
            </button>
          )}

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-red-950 hover:text-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* MAIN ADMIN WORKSPACE */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        
        {/* TOP STATUS BAR */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">
              {adminTab === 'dashboard' && 'Dashboard del Emprendimiento'}
              {adminTab === 'productos' && 'Gestión de Productos'}
              {adminTab === 'clientes' && 'Fichero de Clientes'}
              {adminTab === 'alquilados' && 'Seguimiento de Alquileres'}
              {adminTab === 'libres' && 'Stock Libre de Productos'}
              {adminTab === 'colaboradores' && 'Gestión de Colaboradores'}
              {adminTab === 'tema' && 'Configuración de Tema de Panel'}
              {adminTab === 'publico' && 'Personalización de Vista Pública'}
              {adminTab === 'configuracion' && 'Configuración del Negocio'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Administración unificada para <strong className="text-slate-700">{tenant.name}</strong>
            </p>
          </div>

          {/* Quick link to view public page */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Página Pública:</span>
            {onSwitchView ? (
              <button
                onClick={() => onSwitchView('public')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-black text-emerald-700 hover:bg-emerald-100 shadow-sm transition-all cursor-pointer"
              >
                <span>Ver Mi Web Pública</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <a 
                href={`/?codigo=${tenant.id}`} 
                target="_blank" 
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-sm"
              >
                <span>Ver Web Pública</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            )}
          </div>
        </header>

        {/* ==================================== */}
        {/* TAB 1: DASHBOARD */}
        {/* ==================================== */}
        {adminTab === 'dashboard' && (
          <div id="admin-dashboard-container" className="space-y-6">
            
            {/* TIMEFRAME FILTER */}
            <div className="flex justify-end">
              <div className="bg-white border border-slate-200 rounded-2xl p-1 inline-flex gap-1 shadow-sm">
                {(['diario', 'semana', 'anual'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-black capitalize transition-all ${
                      timeframe === t 
                        ? 'bg-slate-800 text-white shadow' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* METRICS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Earnings Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Facturación Realizada</span>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">
                    ${metrics.revenue.toLocaleString('es-AR')}
                  </h3>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block">
                    {timeframe === 'diario' ? 'Hoy' : timeframe === 'semana' ? 'Últimos 7 días' : 'Anual/Total'}
                  </span>
                </div>
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              {/* Total Bookings Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alquileres Totales</span>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">
                    {metrics.rentalsCount}
                  </h3>
                  <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full mt-2 inline-block">
                    Registrados
                  </span>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>

              {/* Active Deliveries Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alquilado Activo</span>
                  <h3 className="text-2xl font-black text-slate-800 mt-1">
                    {metrics.activeRentals}
                  </h3>
                  <span className="text-[10px] text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded-full mt-2 inline-block">
                    En clientes
                  </span>
                </div>
                <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              {/* Most Rented Item */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lo Más Alquilado</span>
                  <h3 className="text-md font-black text-slate-800 mt-1 truncate max-w-[140px]" title={metrics.topProduct}>
                    {metrics.topProduct}
                  </h3>
                  <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full mt-2 inline-block">
                    {metrics.maxCount} Reservas
                  </span>
                </div>
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

            </div>

            {/* DASHBOARD CHARTS & ACTIVE RESERVATIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Product Performance Custom Bar Chart */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Rendimiento de Productos</h3>
                
                <div className="space-y-4">
                  {products.slice(0, 5).map((prod) => {
                    const count = bookings.filter(b => b.items.some(item => item.name === prod.name)).length;
                    const maxBookingCount = Math.max(...products.map(p => bookings.filter(b => b.items.some(item => item.name === p.name)).length), 1);
                    const percentage = (count / maxBookingCount) * 100;
                    return (
                      <div key={prod.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                          <span className="truncate max-w-[200px]">{prod.name}</span>
                          <span>{count} alquileres</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%`, backgroundColor: primaryColorHex }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Status Count */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Estado de Reservas</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Pendientes
                    </span>
                    <span className="text-xs font-black text-slate-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      {metrics.pendingRentals}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> En Camino
                    </span>
                    <span className="text-xs font-black text-slate-800 bg-blue-100 px-2 py-0.5 rounded-full">
                      {bookings.filter(b => b.status === 'en_camino').length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Alquilados / Activo
                    </span>
                    <span className="text-xs font-black text-slate-800 bg-pink-100 px-2 py-0.5 rounded-full">
                      {metrics.activeRentals}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Completados
                    </span>
                    <span className="text-xs font-black text-slate-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {bookings.filter(b => b.status === 'completado').length}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================================== */}
        {/* TAB 2: ALQUILADOS (TRACKING / RETIRO) */}
        {/* ==================================== */}
        {adminTab === 'alquilados' && (
          <div id="admin-alquilados-container" className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Planificación de Entregas y Retiros</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Controla qué productos están alquilados y gestiona el envío ("En Camino") o el retiro final.
                  </p>
                </div>
              </div>

              {bookings.length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-sm">No hay registros de alquileres activos.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-3 px-2">Código</th>
                        <th className="py-3 px-2">Cliente</th>
                        <th className="py-3 px-2">Detalle Pedido</th>
                        <th className="py-3 px-2">Fecha Devolución</th>
                        <th className="py-3 px-2">Total</th>
                        <th className="py-3 px-2 text-center">Estado</th>
                        <th className="py-3 px-2 text-right">Acciones WhatsApp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-slate-50/50">
                          <td className="py-4 px-2 font-mono font-bold text-slate-800">{booking.id}</td>
                          <td className="py-4 px-2">
                            <div>
                              <p className="font-bold">{booking.customerName}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{booking.customerPhone}</p>
                            </div>
                          </td>
                          <td className="py-4 px-2">
                            <ul className="list-disc pl-3 text-[10px] space-y-0.5 text-slate-500">
                              {booking.items.map((it, idx) => (
                                <li key={idx}>{it.quantity}x {it.name}</li>
                              ))}
                            </ul>
                          </td>
                          <td className="py-4 px-2 font-mono text-slate-500">
                            {booking.returnDate}
                            {booking.duracion && (
                              <span className="block text-[9px] font-bold text-violet-600 mt-0.5">⏱ {booking.duracion}</span>
                            )}
                          </td>
                          <td className="py-4 px-2 font-black text-slate-900">${booking.totalAmount.toLocaleString('es-AR')}</td>
                          <td className="py-4 px-2 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-black tracking-wider ${
                              booking.status === 'pendiente' ? 'bg-amber-100 text-amber-800' :
                              booking.status === 'en_camino' ? 'bg-blue-100 text-blue-800 animate-pulse' :
                              booking.status === 'alquilado' ? 'bg-pink-100 text-pink-800' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {booking.status === 'pendiente' ? 'Pendiente' :
                               booking.status === 'en_camino' ? 'En Camino' :
                               booking.status === 'alquilado' ? 'Alquilado' :
                               'Devuelto'}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* En Camino Action */}
                              {booking.status === 'pendiente' && (
                                <button
                                  onClick={() => handleSendEnCamino(booking)}
                                  className="px-2.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg font-bold hover:bg-blue-100 flex items-center gap-1 transition-colors"
                                  id={`en-camino-btn-${booking.id}`}
                                >
                                  🚚 En Camino
                                </button>
                              )}

                              {/* Extender Action (solo si el inquilino lo habilitó) */}
                              {tenant.extenderHabilitado && booking.status !== 'completado' && (
                                <button
                                  onClick={() => handleExtender(booking)}
                                  className="px-2.5 py-1.5 bg-violet-50 text-violet-700 border border-violet-100 rounded-lg font-bold hover:bg-violet-100 flex items-center gap-1 transition-colors"
                                  id={`extender-btn-${booking.id}`}
                                >
                                  ⏱ Extender
                                </button>
                              )}

                              {/* Retiro Action */}
                              {(booking.status === 'alquilado' || booking.status === 'en_camino') && (
                                <button
                                  onClick={() => handleSendRetiro(booking)}
                                  className="px-2.5 py-1.5 bg-pink-50 text-pink-700 border border-pink-100 rounded-lg font-bold hover:bg-pink-100 flex items-center gap-1 transition-colors"
                                  id={`retiro-btn-${booking.id}`}
                                >
                                  🏠 Retiro
                                </button>
                              )}

                              {booking.status === 'completado' && (
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  Trámite Terminado
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 3: CLIENTES */}
        {/* ==================================== */}
        {adminTab === 'clientes' && (
          <div id="admin-clientes-container" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Manual customer registration form */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm self-start">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
                  {editingCustomer ? 'Editar Cliente' : 'Cargar Cliente Manualmente'}
                </h3>
                
                <form onSubmit={handleCustomerSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Nombre Completo</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej. Juan Gómez"
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Teléfono (+549 por defecto)</label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">+54 9</span>
                      <input 
                        type="tel" 
                        required
                        placeholder="1134567890"
                        value={customerForm.phone}
                        onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                        className="w-full pl-16 pr-3 py-2 border border-slate-200 rounded-xl font-mono focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Email (Opcional)</label>
                    <input 
                      type="email" 
                      placeholder="ejemplo@correo.com"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Dirección / Localidad</label>
                    <input 
                      type="text" 
                      placeholder="Ej. San Martín 1500, Rosario"
                      value={customerForm.address}
                      onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-3">
                    <button
                      type="submit"
                      className="flex-1 py-2 text-white font-bold rounded-xl text-xs shadow"
                      style={{ backgroundColor: primaryColorHex }}
                    >
                      {editingCustomer ? 'Guardar Cambios' : 'Registrar Cliente'}
                    </button>
                    {editingCustomer && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCustomer(null);
                          setCustomerForm({ name: '', phone: '', email: '', address: '' });
                        }}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Customers list directory */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Cartera de Clientes Registrados</h3>

                {customers.length === 0 ? (
                  <p className="text-slate-400 text-xs py-8 text-center">No hay clientes registrados en el sistema.</p>
                ) : (
                  <div className="space-y-3">
                    {customers.map((cust) => (
                      <div key={cust.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <h4 className="text-xs font-black text-slate-800">{cust.name}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-slate-500 mt-2 font-medium">
                            <span className="flex items-center gap-1"><PhoneCall className="w-3.5 h-3.5" /> {cust.phone}</span>
                            {cust.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {cust.email}</span>}
                            {cust.address && <span className="flex items-center gap-1 sm:col-span-2"><MapPin className="w-3.5 h-3.5" /> {cust.address}</span>}
                          </div>
                        </div>

                        {/* Customer list action controls: Collaborators are restricted */}
                        {!isColab && (
                          <div className="flex gap-1.5 self-end sm:self-center">
                            <button
                              onClick={() => handleStartEditCustomer(cust)}
                              className="p-2 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomer(cust.id)}
                              className="p-2 bg-white text-red-500 border border-red-100 rounded-xl hover:bg-red-50 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 4: PRODUCTOS LIBRES */}
        {/* ==================================== */}
        {adminTab === 'libres' && (
          <div id="admin-libres-container" className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Productos Libres y Recomendados</h3>
              <p className="text-xs text-slate-500 mb-6">
                Filtra productos libres que no están alquilados en este momento. Selecciona los ítems en cajitas y envíaselos a tus contactos como una recomendación rápida de stock libre.
              </p>

              {/* Share box panel */}
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Teléfono Destino (+549 por defecto)</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">+54 9</span>
                    <input 
                      type="tel"
                      placeholder="1134567890"
                      value={recommendTargetPhone}
                      onChange={(e) => setRecommendTargetPhone(e.target.value)}
                      className="w-full pl-16 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSendRecommendations}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-950 text-white rounded-xl text-xs font-bold shadow flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar Recomendados
                </button>
              </div>

              {freeProducts.length === 0 ? (
                <p className="text-slate-400 text-xs text-center py-6">¡Vaya! Todos los productos están ocupados u ocupándose en este momento.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {freeProducts.map((prod) => {
                    const isChecked = recommendedProducts.includes(prod.id);
                    return (
                      <div 
                        key={prod.id} 
                        onClick={() => toggleRecommendedProduct(prod.id)}
                        className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between gap-4 transition-all ${
                          isChecked 
                            ? 'bg-slate-50 border-slate-800 shadow-sm' 
                            : 'bg-white border-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={prod.imageUrl} 
                            alt={prod.name} 
                            className="w-12 h-12 rounded-xl object-cover" 
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{prod.name}</h4>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">{prod.category}</span>
                            <span className="text-xs font-black text-slate-700">${prod.price || 'S/P'}</span>
                          </div>
                        </div>

                        <div>
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-slate-800" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 5: PRODUCTOS Y CATEGORIAS (ADMIN ONLY) */}
        {/* ==================================== */}
        {adminTab === 'productos' && !isColab && (
          <div id="admin-productos-container" className="space-y-6">
            
            {/* CATEGORIES MANAGEMENT PANEL */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Administrar Categorías</h3>
              
              {/* Add custom category */}
              <div className="flex gap-2 max-w-md">
                <input 
                  type="text" 
                  placeholder="Ej. Sillas y Mesas"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                />
                <button
                  onClick={handleAddCategory}
                  className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-slate-950 shadow"
                >
                  <Plus className="w-4 h-4" /> Agregar
                </button>
              </div>

              {/* Display existing categories list */}
              <div className="flex flex-wrap gap-2 mt-4">
                {/* Default Category */}
                <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold">Inflables (Fijo)</span>
                <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold">Metegoles (Fijo)</span>
                <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold">Pool (Fijo)</span>
                <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-semibold">Arcade (Fijo)</span>

                {/* Custom Categories with Delete */}
                {tenant.categories.filter(c => !['inflables', 'metegoles', 'pool', 'arcade'].includes(c.toLowerCase())).map((cat) => (
                  <span key={cat} className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2">
                    {cat}
                    <button onClick={() => handleDeleteCategory(cat)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* PRODUCT ADD / EDIT WORKSPACE */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Add/Edit Form */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm self-start">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
                  {editingProduct ? 'Editar Producto' : 'Crear Nuevo Producto'}
                </h3>

                <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Categoría</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      <option value="Inflables">Inflables</option>
                      <option value="Metegoles">Metegoles</option>
                      <option value="Pool">Pool</option>
                      <option value="Arcade">Arcade</option>
                      <option value="Combos">Combos (Especial)</option>
                      {tenant.categories.filter(c => !['inflables', 'metegoles', 'pool', 'arcade'].includes(c.toLowerCase())).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Nombre del Producto</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej. Castillo Inflable Spider"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Descripción / Detalles</label>
                    <textarea 
                      rows={3}
                      placeholder="Medidas, edades de uso, accesorios..."
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Precio Alquiler (Opcional - Vacío para consultar)</label>
                    <input 
                      type="number" 
                      placeholder="Ej. 15000"
                      value={productForm.price || ''}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value ? Number(e.target.value) : null })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Imagen del producto</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        placeholder="Pegá una URL o subí una foto →"
                        value={productForm.imageUrl}
                        onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                      />
                      <label className="shrink-0 flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer whitespace-nowrap">
                        <Camera className="w-4 h-4" /> Subir PC/Móvil
                        <input type="file" accept="image/*" className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) subirImagen(f, 1000, (d) => setProductForm({ ...productForm, imageUrl: d })); }} />
                      </label>
                    </div>
                    {productForm.imageUrl && (
                      <img src={productForm.imageUrl} alt="" className="mt-2 w-20 h-20 object-cover rounded-lg border border-slate-200" />
                    )}
                    <span className="text-[9px] text-slate-400 block mt-1">Pegá un enlace o subí una foto desde tu PC o celular.</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Estado de Disponibilidad (Pág. Pública)</label>
                    <select
                      value={productForm.status || 'Disponible'}
                      onChange={(e) => setProductForm({ ...productForm, status: e.target.value as 'Disponible' | 'Alquilado' | 'Consulte' })}
                      className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    >
                      <option value="Disponible">Disponible (Verde)</option>
                      <option value="Alquilado">Alquilado (Rojo)</option>
                      <option value="Consulte">Consulte (Gris)</option>
                    </select>
                  </div>

                  {/* Toggle Featured and Combo */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={productForm.isFeatured}
                        onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                        className="rounded"
                      />
                      Destacado
                    </label>

                    <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={productForm.isCombo}
                        onChange={(e) => setProductForm({ ...productForm, isCombo: e.target.checked })}
                        className="rounded"
                      />
                      Es Combo
                    </label>
                  </div>

                  {/* CUSTOM EXTRA FIELDS ("Button + to add field") */}
                  <div className="border-t border-slate-150 pt-3 space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Atributos Extra (Botón +)</label>
                    
                    {/* List already added fields */}
                    {productForm.customFields && productForm.customFields.length > 0 && (
                      <div className="space-y-1 bg-slate-50 p-2 rounded-xl">
                        {productForm.customFields.map((f, idx) => (
                          <div key={idx} className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                            <span><strong>{f.label}:</strong> {f.value}</span>
                            <button type="button" onClick={() => handleRemoveField(idx)} className="text-red-500 font-bold hover:underline">Eliminar</button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-1.5">
                      <input 
                        type="text" 
                        placeholder="Nombre (Ej: Medidas)"
                        value={newFieldName}
                        onChange={(e) => setNewFieldName(e.target.value)}
                        className="px-2.5 py-1.5 border border-slate-200 rounded-xl"
                      />
                      <input 
                        type="text" 
                        placeholder="Valor (Ej: 3x3 metros)"
                        value={newFieldValue}
                        onChange={(e) => setNewFieldValue(e.target.value)}
                        className="px-2.5 py-1.5 border border-slate-200 rounded-xl"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddField}
                      className="w-full py-1.5 bg-slate-150 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-200 flex items-center justify-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Añadir Atributo
                    </button>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 text-white font-bold rounded-xl shadow"
                      style={{ backgroundColor: primaryColorHex }}
                    >
                      {editingProduct ? 'Guardar Cambios' : 'Registrar Producto'}
                    </button>
                    {editingProduct && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(null);
                          setProductForm({
                            category: 'Inflables',
                            name: '',
                            description: '',
                            price: null,
                            imageUrl: '',
                            isCombo: false,
                            isFeatured: false,
                            customFields: []
                          });
                        }}
                        className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Products Directory */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Catálogo de Productos</h3>

                <div className="space-y-4">
                  {products.map((prod) => (
                    <div key={prod.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <img 
                          src={prod.imageUrl || DEFAULT_CASTLE_IMAGE} 
                          alt={prod.name} 
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider bg-slate-200 px-2 py-0.5 rounded-full inline-block">
                              {prod.category}
                            </span>
                            <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full inline-block ${
                              (prod.status || 'Disponible') === 'Disponible' ? 'bg-emerald-100 text-emerald-800' :
                              (prod.status || 'Disponible') === 'Alquilado' ? 'bg-red-100 text-red-800' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {prod.status || 'Disponible'}
                            </span>
                          </div>
                          <h4 className="text-xs font-black text-slate-800 mt-1">{prod.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed max-w-sm">{prod.description}</p>
                          <span className="text-xs font-black text-slate-800 block mt-2">
                            {prod.price ? `$${prod.price.toLocaleString('es-AR')}` : 'Precio a consultar'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1.5 self-end sm:self-center">
                        <button
                          onClick={() => handleStartEditProduct(prod)}
                          className="p-2 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-2 bg-white text-red-500 border border-red-100 rounded-xl hover:bg-red-50 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 6: COLABORADORES (ADMIN ONLY) */}
        {/* ==================================== */}
        {adminTab === 'colaboradores' && !isColab && (
          <div id="admin-colaboradores-container" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form to create / edit collaborators */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm self-start">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">
                  {editingColab ? 'Editar Colaborador' : 'Crear Colaborador de Campo'}
                </h3>

                <form onSubmit={handleColabSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Nombre Completo</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej. Gastón Peralta"
                      value={colabForm.name}
                      onChange={(e) => setColabForm({ ...colabForm, name: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Teléfono de Contacto</label>
                    <input 
                      type="tel" 
                      placeholder="Ej. +5491134567890"
                      value={colabForm.phone}
                      onChange={(e) => setColabForm({ ...colabForm, phone: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Usuario de Acceso</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej. gaston.tu.diversion"
                      value={colabForm.username}
                      onChange={(e) => setColabForm({ ...colabForm, username: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Contraseña</label>
                    <input 
                      type="password" 
                      required
                      placeholder="Mínimo 4 caracteres"
                      value={colabForm.password}
                      onChange={(e) => setColabForm({ ...colabForm, password: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-3">
                    <button
                      type="submit"
                      className="flex-1 py-2 text-white font-bold rounded-xl text-xs shadow"
                      style={{ backgroundColor: primaryColorHex }}
                    >
                      {editingColab ? 'Guardar Cambios' : 'Crear Colaborador'}
                    </button>
                    {editingColab && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingColab(null);
                          setColabForm({ name: '', phone: '', username: '', password: '' });
                        }}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* List of active collaborators */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm lg:col-span-2">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Equipo de Colaboradores Habilitados</h3>

                {tenant.collaborators.length === 0 ? (
                  <p className="text-slate-400 text-xs py-8 text-center">No hay colaboradores configurados en el comercio.</p>
                ) : (
                  <div className="space-y-4">
                    {tenant.collaborators.map((colab) => (
                      <div key={colab.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between gap-4">
                        <div>
                          <h4 className="text-xs font-black text-slate-800">{colab.name}</h4>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-slate-500 mt-2 font-medium font-mono">
                            <span>Tel: {colab.phone}</span>
                            <span>Usuario: {colab.username}</span>
                            <span>Contraseña: <strong className="text-slate-700">{colab.password}</strong></span>
                            <span className="flex items-center gap-1">
                              Sesión Inalámbrica: 
                              <strong className={colab.sessionToken ? 'text-emerald-600 animate-pulse' : 'text-red-500'}>
                                {colab.sessionToken ? 'ON (Conectado)' : 'OFF (Cerrado)'}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Session block & CRUD controls */}
                        <div className="flex flex-col gap-2 shrink-0 self-end sm:self-center">
                          {colab.sessionToken ? (
                            <button
                              onClick={() => handleWirelessLogout(colab.id)}
                              className="text-[10px] font-bold text-red-600 border border-red-100 bg-red-50 px-2.5 py-1.5 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors flex items-center gap-1"
                              id={`remote-logout-btn-${colab.id}`}
                              title="Wireless Session Remote Invalidation"
                            >
                              <LogOut className="w-3.5 h-3.5" /> Cerrar Sesión Inalámbrica
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEnableWirelessSession(colab.id)}
                              className="text-[10px] font-bold text-emerald-600 border border-emerald-100 bg-emerald-50 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 hover:text-emerald-700 transition-colors flex items-center gap-1"
                              title="Re-enable Session"
                            >
                              <Users className="w-3.5 h-3.5" /> Habilitar Sesión
                            </button>
                          )}

                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => {
                                setEditingColab(colab);
                                setColabForm({
                                  name: colab.name,
                                  phone: colab.phone,
                                  username: colab.username,
                                  password: colab.password
                                });
                              }}
                              className="p-1.5 bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('¿Está seguro de eliminar este colaborador?')) {
                                  onUpdateTenant({
                                    ...tenant,
                                    collaborators: tenant.collaborators.filter(c => c.id !== colab.id)
                                  });
                                }
                              }}
                              className="p-1.5 bg-white text-red-500 border border-red-150 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 7: TEMA PANEL ADMIN (ADMIN ONLY) */}
        {/* ==================================== */}
        {adminTab === 'tema' && !isColab && (
          <div id="admin-theme-container" className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm max-w-2xl">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Tema del Panel de Administración</h3>
              <p className="text-xs text-slate-500 mb-6">
                Cambie los colores principales de los botones y la familia de tipografía para toda la interfaz interna del panel.
              </p>

              {/* Fonts Selector */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Tipografía Principal del Panel</label>
                  <select
                    value={tenant.adminTheme.fontFamily}
                    onChange={(e) => onUpdateTenant({
                      ...tenant,
                      adminTheme: { ...tenant.adminTheme, fontFamily: e.target.value }
                    })}
                    className="w-full max-w-md px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>{f.name}</option>
                    ))}
                  </select>
                </div>

                {/* Colors palette choices */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-3">Color Primario de Acentuación</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {COLOR_OPTIONS.map((scheme) => {
                      const isSelected = tenant.adminTheme.primaryColor === scheme.primaryTailwind;
                      return (
                        <button
                          key={scheme.id}
                          onClick={() => onUpdateTenant({
                            ...tenant,
                            adminTheme: { ...tenant.adminTheme, primaryColor: scheme.primaryTailwind }
                          })}
                          className={`p-3 border rounded-2xl text-left text-xs font-bold flex items-center gap-2 transition-all ${
                            isSelected ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <span className="w-4 h-4 rounded-full" style={{ backgroundColor: scheme.accentHex }} />
                          {scheme.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 8: TEMA PUBLICO (ADMIN ONLY - 15 FONTS/15 COLORS) */}
        {/* ==================================== */}
        {adminTab === 'publico' && !isColab && (
          <div id="admin-public-theme-container" className="space-y-6">
            
            {/* PUBLIC LAYOUT STYLING */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Tema de la Página Pública</h3>
              <p className="text-xs text-slate-500 mb-4">
                Personalice la vista pública de sus clientes. Puede configurar 15 tipos de letras, 15 tipos de colores, fondo personalizado de imagen/color y logos.
              </p>

              {/* Modelos Visuales Rápidos */}
              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl mb-6">
                <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2.5">Modelos Visuales Rápidos (Plantillas)</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'emerald_opt', name: 'Esmeralda Vital (Predeterminado)', scheme: 'emerald', font: 'font-sans', bg: '#f8fafc' },
                    { id: 'natural_tone_opt', name: 'Natural Tone', scheme: 'natural_tone', font: 'font-outfit', bg: '#fafaf9' },
                    { id: 'prof_polish_opt', name: 'Professional Polish', scheme: 'prof_polish', font: 'font-sans', bg: '#f1f5f9' },
                    { id: 'blue_opt', name: 'Azul Cobalto', scheme: 'blue', font: 'font-mono', bg: '#f0f9ff' },
                    { id: 'violet_opt', name: 'Violeta Eléctrico', scheme: 'violet', font: 'font-space', bg: '#faf5ff' },
                    { id: 'rose_opt', name: 'Coral Dulce', scheme: 'rose', font: 'font-serif', bg: '#fff1f2' }
                  ].map((m) => {
                    const isSelected = tenant.publicTheme.colorScheme === m.scheme && tenant.publicTheme.fontFamily === m.font;
                    const accentColor = COLOR_OPTIONS.find(c => c.id === m.scheme)?.accentHex || '#10b981';
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => onUpdateTenant({
                          ...tenant,
                          publicTheme: {
                            ...tenant.publicTheme,
                            colorScheme: m.scheme,
                            fontFamily: m.font,
                            backgroundColor: m.bg
                          }
                        })}
                        className={`px-3 py-2 border rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                          isSelected ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-white text-slate-700 border-slate-250 hover:bg-slate-50'
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: accentColor }} />
                        {m.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 15 Fonts Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    1. Tipografía Pública (15 Opciones)
                  </label>
                  <select
                    value={tenant.publicTheme.fontFamily}
                    onChange={(e) => onUpdateTenant({
                      ...tenant,
                      publicTheme: { ...tenant.publicTheme, fontFamily: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>{f.name}</option>
                    ))}
                  </select>
                </div>

                {/* 15 Colors Scheme Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                    2. Paleta de Colores (15 Opciones)
                  </label>
                  <select
                    value={tenant.publicTheme.colorScheme}
                    onChange={(e) => onUpdateTenant({
                      ...tenant,
                      publicTheme: { ...tenant.publicTheme, colorScheme: e.target.value }
                    })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    {COLOR_OPTIONS.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Background configs (Subir imagenes PC/Movil) */}
                <div className="md:col-span-2 border-t border-slate-100 pt-4 space-y-4">
                  <h4 className="text-xs font-black text-slate-700 uppercase">3. Fondo de Página Pública</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Tipo de Fondo</label>
                      <select
                        value={tenant.publicTheme.bgType}
                        onChange={(e) => onUpdateTenant({
                          ...tenant,
                          publicTheme: { ...tenant.publicTheme, bgType: e.target.value as 'color' | 'image' }
                        })}
                        className="w-full mt-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      >
                        <option value="color">Color Plano</option>
                        <option value="image">Imagen URL</option>
                      </select>
                    </div>

                    {tenant.publicTheme.bgType === 'color' ? (
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Color Fondo Hex</label>
                        <input 
                          type="color"
                          value={tenant.publicTheme.backgroundColor}
                          onChange={(e) => onUpdateTenant({
                            ...tenant,
                            publicTheme: { ...tenant.publicTheme, backgroundColor: e.target.value }
                          })}
                          className="w-full h-10 mt-1 p-1 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer"
                        />
                      </div>
                    ) : (
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Imagen del Fondo</label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="text"
                            placeholder="Pegá una URL o subí una foto →"
                            value={tenant.publicTheme.bgImageUrl || ''}
                            onChange={(e) => onUpdateTenant({
                              ...tenant,
                              publicTheme: { ...tenant.publicTheme, bgImageUrl: e.target.value }
                            })}
                            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                          />
                          <label className="shrink-0 flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer whitespace-nowrap">
                            <Camera className="w-4 h-4" /> Subir PC/Móvil
                            <input type="file" accept="image/*" className="hidden"
                              onChange={(e) => { const f = e.target.files?.[0]; if (f) subirImagen(f, 1400, (d) => onUpdateTenant({ ...tenant, publicTheme: { ...tenant.publicTheme, bgImageUrl: d } })); }} />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Logo and Brand Image upload */}
                <div className="md:col-span-2 border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-black text-slate-700 uppercase mb-3">4. Logotipo / Imagen del Comercio</h4>
                  <div className="flex items-center gap-4">
                    <img 
                      src={tenant.logoUrl || DEFAULT_CASTLE_IMAGE} 
                      alt="Brand logo" 
                      className="w-16 h-16 rounded-full object-cover border border-slate-200 shadow-inner" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Logo del comercio</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          placeholder="Pegá una URL o subí una foto →"
                          value={tenant.logoUrl}
                          onChange={(e) => onUpdateTenant({ ...tenant, logoUrl: e.target.value })}
                          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                        />
                        <label className="shrink-0 flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer whitespace-nowrap">
                          <Camera className="w-4 h-4" /> Subir PC/Móvil
                          <input type="file" accept="image/*" className="hidden"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) subirImagen(f, 400, (d) => onUpdateTenant({ ...tenant, logoUrl: d })); }} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* CUSTOM TEXT ADDITIONS ("Button + to add other texts") */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-2">Textos Destacados en Web Pública</h3>
              <p className="text-xs text-slate-500 mb-6">
                Agregue bloques de texto personalizados (Botón +) que sus clientes verán en el encabezado de su sitio público, eligiendo tamaño y familia tipográfica de forma libre.
              </p>

              {/* Added Text blocks list */}
              {tenant.publicTheme.customTexts && tenant.publicTheme.customTexts.length > 0 && (
                <div className="space-y-2 mb-6" id="custom-text-admin-list">
                  {tenant.publicTheme.customTexts.map((txt) => (
                    <div key={txt.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-4">
                      <div>
                        <p className={`text-xs font-black text-slate-700`}>Texto: &ldquo;{txt.text}&rdquo;</p>
                        <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 font-mono mt-1 font-bold">
                          <span>Tamaño: {txt.size}</span>
                          <span>Tipografía: {txt.font}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRemoveCustomText(txt.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Form to add a custom block text */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-150 space-y-3 text-xs">
                <h4 className="font-bold text-slate-700 flex items-center gap-1">
                  <Type className="w-4 h-4 text-slate-500" />
                  Agregar un Bloque de Texto (Botón +)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Contenido del Texto</label>
                    <input 
                      type="text"
                      placeholder="Ej. ¡Novedad de Julio! Reservas con 10% de descuento en Metegoles"
                      value={newTextContent}
                      onChange={(e) => setNewTextContent(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Tamaño Texto</label>
                    <select
                      value={newTextSize}
                      onChange={(e) => setNewTextSize(e.target.value as any)}
                      className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    >
                      <option value="xs">Muy Chico (xs)</option>
                      <option value="sm">Chico (sm)</option>
                      <option value="base">Normal (base)</option>
                      <option value="lg">Grande (lg)</option>
                      <option value="xl">Muy Grande (xl)</option>
                      <option value="2xl">Extragrande (2xl)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Tipografía Específica</label>
                    <select
                      value={newTextFont}
                      onChange={(e) => setNewTextFont(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.value} value={f.value}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Color Enfoque</label>
                    <select
                      value={newTextColor}
                      onChange={(e) => setNewTextColor(e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium"
                    >
                      <option value="text-slate-600">Gris Suave</option>
                      <option value="text-slate-900">Charcoal Oscuro</option>
                      <option value="text-emerald-600">Esmeralda Brillante</option>
                      <option value="text-red-500">Rojo Alerta</option>
                      <option value="text-blue-600">Azul Informativo</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomText}
                  className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-900 transition-all flex items-center justify-center gap-1 shadow"
                >
                  <Plus className="w-4 h-4" /> Registrar Texto
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ==================================== */}
        {/* TAB 9: CONFIGURACION INQUILINO (ADMIN ONLY) */}
        {/* ==================================== */}
        {adminTab === 'configuracion' && !isColab && (
          <div id="admin-config-container" className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm max-w-2xl">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-4">Datos Comerciales del Inquilino</h3>

              <form onSubmit={(e) => { e.preventDefault(); alert('Configuración guardada.'); }} className="space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase">Nombre de Fantasía o Empresa</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Diversión Increíble"
                    value={tenant.name}
                    onChange={(e) => onUpdateTenant({ ...tenant, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase">Teléfono de Contacto (+549 por defecto)</label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">+54 9</span>
                    <input 
                      type="tel" 
                      required
                      placeholder="1134567890"
                      value={tenant.phone.replace('+549', '')}
                      onChange={(e) => onUpdateTenant({ ...tenant, phone: `+549${e.target.value}` })}
                      className="w-full pl-16 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-none font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase">Dirección Comercial Principal</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Corrientes 3400, Buenos Aires"
                    value={tenant.address}
                    onChange={(e) => onUpdateTenant({ ...tenant, address: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase">Mail del Negocio</label>
                  <input 
                    type="email" 
                    required
                    placeholder="Ej. contacto@negocio.com"
                    value={tenant.email}
                    onChange={(e) => onUpdateTenant({ ...tenant, email: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-xl focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase">Llave de Licencia Comercial de la PWA</label>
                  <input 
                    type="text" 
                    readOnly
                    disabled
                    value={tenant.licenseKey}
                    className="w-full mt-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-500 font-bold"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Esta licencia vincula sus datos en la red segura de Tu Diversión.</span>
                </div>

                {/* Toggle: habilitar extensión de alquileres (a gusto del inquilino) */}
                <label className="flex items-start gap-3 p-3 bg-violet-50 border border-violet-100 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!tenant.extenderHabilitado}
                    onChange={(e) => onUpdateTenant({ ...tenant, extenderHabilitado: e.target.checked })}
                    className="mt-0.5 w-4 h-4 accent-violet-600"
                  />
                  <span className="text-[11px] text-slate-600 leading-relaxed">
                    ⏱ <strong className="text-slate-800">Habilitar extensión de alquileres</strong> — muestra un botón
                    "Extender" en cada alquiler, para sumarle tiempo a la devolución cuando el cliente quiere quedarse
                    más. Si no lo usás, dejalo apagado.
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full py-2.5 text-white font-bold rounded-xl text-xs shadow mt-4 flex items-center justify-center gap-1"
                  style={{ backgroundColor: primaryColorHex }}
                >
                  <Check className="w-4 h-4" /> Guardar Todos los Datos
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
