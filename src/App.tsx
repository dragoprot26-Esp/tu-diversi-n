/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Tenant, Product, Customer, Booking, GalleryPhoto } from './types';
import { INITIAL_TENANTS, INITIAL_PRODUCTS, INITIAL_GALLERY_PHOTOS } from './data';
import PublicView from './components/PublicView';
import { AdminPanel } from './components/AdminPanel';
import {
  estaLogueado, miMembresia, cloudLoad, cloudSave,
  divePublica, diveAgregarReserva, diveVersion, signOutGlobal,
} from './db/cloud';

// ── Plantillas (una tienda por licencia) ────────────────────────────────
const placeholderTenant: Tenant = {
  ...INITIAL_TENANTS[0],
  id: '',
  name: 'Mi Emprendimiento',
  licenseKey: '',
  collaborators: [],
};

function makeSeedTenant(codigo: string): Tenant {
  return { ...INITIAL_TENANTS[0], id: codigo, licenseKey: codigo, isLicenseActive: true };
}

type Session = { isLoggedIn: boolean; role: 'admin' | 'colaborador' | null; username: string | null; colabId?: string };

export default function App() {
  const [tenant, setTenant] = useState<Tenant>(placeholderTenant);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);

  const [licenseCode, setLicenseCode] = useState<string>('');
  const [currentView, setCurrentView] = useState<'public' | 'admin'>('public');
  const [ready, setReady] = useState(false);

  const [session, setSession] = useState<Session>({ isLoggedIn: false, role: null, username: null });

  const debounceRef = useRef<any>(null);

  // ── Carga de datos del panel ──────────────────────────────────────────
  async function loadAdminData(codigo: string) {
    const blob = await cloudLoad(codigo);
    if (blob && blob.tenant && Object.keys(blob.tenant).length) {
      setTenant({ ...placeholderTenant, ...blob.tenant, id: codigo, licenseKey: codigo });
      setProducts(blob.products || []);
      setBookings(blob.bookings || []);
      setCustomers(blob.customers || []);
      setGalleryPhotos(blob.gallery || []);
    } else {
      // Primera vez: sembramos una tienda de arranque
      setTenant(makeSeedTenant(codigo));
      setProducts(INITIAL_PRODUCTS);
      setBookings([]);
      setCustomers([]);
      setGalleryPhotos(INITIAL_GALLERY_PHOTOS);
    }
  }

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const codigo = (params.get('codigo') || params.get('tenant') || '').trim();

      // 1) Web pública del cliente (?codigo=DIVE-...)
      if (codigo) {
        setLicenseCode(codigo);
        setCurrentView('public');
        const pub = await divePublica(codigo);
        if (pub) {
          if (pub.tenant && Object.keys(pub.tenant).length) {
            setTenant({ ...placeholderTenant, ...pub.tenant, id: codigo });
          } else {
            setTenant(makeSeedTenant(codigo));
          }
          setProducts(pub.products || []);
          setGalleryPhotos(pub.gallery || []);
        }
        setReady(true);
        return;
      }

      // 2) Panel si hay sesión activa
      if (estaLogueado()) {
        const mem = await miMembresia();
        if (mem && mem.tenant_id) {
          setSession({
            isLoggedIn: true,
            role: mem.rol === 'colab' ? 'colaborador' : 'admin',
            username: mem.usuario,
          });
          setLicenseCode(mem.tenant_id);
          await loadAdminData(mem.tenant_id);
          setCurrentView('admin');
          setReady(true);
          return;
        }
      }

      // 3) Sin sesión ni código → pantalla de login del panel
      setCurrentView('admin');
      setReady(true);
    })();
  }, []);

  // ── Guardado automático a la nube (fusiona reservas/clientes) ──────────
  useEffect(() => {
    if (!ready || !session.isLoggedIn || !licenseCode) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const nube = await cloudLoad(licenseCode);
      const unir = (locales: any[], remotos: any[]) => {
        const ids = new Set((locales || []).map(o => o.id));
        return [...(locales || []), ...((remotos || []).filter(o => !ids.has(o.id)))];
      };
      await cloudSave(licenseCode, {
        tenant, products,
        bookings: unir(bookings, nube?.bookings || []),
        customers: unir(customers, nube?.customers || []),
        gallery: galleryPhotos,
      });
    }, 800);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [tenant, products, bookings, customers, galleryPhotos, session.isLoggedIn, licenseCode, ready]);

  // ── Sondeo de reservas nuevas (cada 10s) ───────────────────────────────
  useEffect(() => {
    if (!session.isLoggedIn || !licenseCode) return;
    let lastVer = '';
    const iv = setInterval(async () => {
      const ver = await diveVersion(licenseCode);
      if (!ver || ver === lastVer) return; // nada cambió → no baja imágenes
      lastVer = ver;
      const blob = await cloudLoad(licenseCode);
      if (!blob || !blob.bookings) return;
      const cloudB = blob.bookings as Booking[];
      const cloudIds = new Set(cloudB.map(b => b.id));
      setBookings(prev => {
        const localOnly = prev.filter(b => !cloudIds.has(b.id));
        const merged = [...cloudB, ...localOnly];
        return JSON.stringify(prev) === JSON.stringify(merged) ? prev : merged;
      });
    }, 30000);
    return () => clearInterval(iv);
  }, [session.isLoggedIn, licenseCode]);

  // ── Auth handlers ─────────────────────────────────────────────────────
  const handleLogin = async (role: 'admin' | 'colaborador', username: string, codigo: string, colabId?: string) => {
    setSession({ isLoggedIn: true, role, username, colabId });
    setLicenseCode(codigo);
    await loadAdminData(codigo);
    setCurrentView('admin');
  };

  const handleLogout = async () => {
    try { await signOutGlobal(); } catch { /* noop */ }
    setSession({ isLoggedIn: false, role: null, username: null });
    setLicenseCode('');
    setTenant(placeholderTenant);
    setProducts([]); setBookings([]); setCustomers([]); setGalleryPhotos([]);
  };

  const handleUpdateTenant = (updated: Tenant) => setTenant({ ...updated, id: licenseCode || updated.id });

  // ── Reserva (público por RPC / admin local) ────────────────────────────
  const handleAddBooking = (newBooking: Booking) => {
    if (!session.isLoggedIn) {
      diveAgregarReserva(licenseCode, newBooking);
      setBookings(prev => [newBooking, ...prev]);
      return;
    }
    setBookings(prev => [newBooking, ...prev]);
    const exists = customers.some(c => c.phone === newBooking.customerPhone);
    if (!exists) {
      setCustomers(prev => [...prev, {
        id: `cust-${Date.now()}`,
        name: newBooking.customerName,
        phone: newBooking.customerPhone,
      }]);
    }
  };

  const handleAddGalleryPhoto = (newPhoto: GalleryPhoto) => {
    // Público: solo local (optimista). Admin: local + se persiste por el auto-save.
    setGalleryPhotos(prev => [newPhoto, ...prev]);
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center text-slate-500 font-sans">
        <div className="flex items-center gap-3 text-sm">
          <span className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
          Cargando…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      <div className="flex-1 flex flex-col">
        {currentView === 'public' ? (
          <PublicView
            tenant={tenant}
            products={products}
            galleryPhotos={galleryPhotos}
            onAddBooking={handleAddBooking}
            onAddGalleryPhoto={handleAddGalleryPhoto}
            onSwitchView={setCurrentView}
            session={session}
          />
        ) : (
          <AdminPanel
            tenant={tenant}
            allTenants={[tenant]}
            products={products}
            customers={customers}
            bookings={bookings}
            currentSession={session}
            onUpdateTenant={handleUpdateTenant}
            onUpdateProducts={setProducts}
            onUpdateCustomers={setCustomers}
            onUpdateBookings={setBookings}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onSwitchTenant={() => {}}
            onSwitchView={setCurrentView}
          />
        )}
      </div>
    </div>
  );
}
