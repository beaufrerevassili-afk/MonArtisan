import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/public/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardClient from './pages/client/Dashboard';
import DevisClient from './pages/client/Devis';
import TravauxPasses from './pages/client/TravauxPasses';
import AvisClient from './pages/client/Avis';
import RechercheArtisan from './pages/client/RechercheArtisan';
import Messagerie from './pages/client/Messagerie';
import PaiementsClient from './pages/client/Paiements';
import ParrainageClient from './pages/client/Parrainage';
import ProfilClient from './pages/client/Profil';
import DashboardPatron from './pages/patron/Dashboard';
import DashboardAdmin from './pages/admin/Dashboard';
import Finance from './pages/patron/Finance';
import RH from './pages/patron/RH';
import QSE from './pages/patron/QSE';
import URSSAF from './pages/patron/URSSAF';
import DevisPro from './pages/patron/DevisPro';
import ChantiersEtMissions from './pages/patron/ChantiersEtMissions';
import BanqueDocuments from './pages/patron/BanqueDocuments';
import Stock from './pages/patron/Stock';
import GestionLogiciel from './pages/patron/GestionLogiciel';
import ClientsRFM from './pages/patron/ClientsRFM';
import Facturation from './pages/patron/Facturation';
import Agenda from './pages/patron/Agenda';
import RappelJuridique from './pages/patron/RappelJuridique';
import Reputation from './pages/patron/Reputation';
import DashboardArtisan from './pages/artisan/Dashboard';
import SignatureDevis from './pages/public/SignatureDevis';
import DocumentView from './pages/public/DocumentView';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Missions from './pages/shared/Missions';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';
import ClientLayout from './components/layout/ClientLayout';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* ── Routes publiques ── */}
      <Route path="/" element={<Landing />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/devis/:id/signer" element={<SignatureDevis />} />
      <Route path="/documents/:type/:id" element={<DocumentView />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* ── Client ── */}
      <Route path="/client/*" element={
        <ProtectedRoute roles={['client']}>
          <ClientLayout>
            <Routes>
              <Route path="dashboard"   element={<DashboardClient />} />
              <Route path="devis"       element={<DevisClient />} />
              <Route path="travaux"     element={<TravauxPasses />} />
              <Route path="avis"        element={<AvisClient />} />
              <Route path="recherche"   element={<RechercheArtisan />} />
              <Route path="messagerie"  element={<Messagerie />} />
              <Route path="paiements"   element={<PaiementsClient />} />
              <Route path="parrainage"  element={<ParrainageClient />} />
              <Route path="profil"      element={<ProfilClient />} />
              <Route path="missions"    element={<Missions />} />
              <Route path="*"           element={<Navigate to="dashboard" replace />} />
            </Routes>
          </ClientLayout>
        </ProtectedRoute>
      } />

      {/* ── Patron ── */}
      <Route path="/patron/*" element={
        <ProtectedRoute roles={['patron']}>
          <Layout>
            <Routes>
              <Route path="dashboard" element={<DashboardPatron />} />
              <Route path="missions"   element={<ChantiersEtMissions />} />
              <Route path="chantiers"  element={<Navigate to="/patron/missions" replace />} />
              <Route path="finance"   element={<Finance />} />
              <Route path="rh"        element={<RH />} />
              <Route path="qse"       element={<QSE />} />
              <Route path="urssaf"    element={<URSSAF />} />
              <Route path="devis-pro"  element={<DevisPro />} />
              <Route path="documents" element={<BanqueDocuments />} />
              <Route path="stock"     element={<Stock />} />
              <Route path="gestion-logiciel" element={<GestionLogiciel />} />
              <Route path="clients-rfm"      element={<ClientsRFM />} />
              <Route path="facturation"      element={<Facturation />} />
              <Route path="agenda"           element={<Agenda />} />
              <Route path="rappel-juridique" element={<RappelJuridique />} />
              <Route path="reputation"       element={<Reputation />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />

      {/* ── Artisan ── */}
      <Route path="/artisan/*" element={
        <ProtectedRoute roles={['artisan']}>
          <Routes>
            <Route path="dashboard" element={<DashboardArtisan />} />
            <Route path="*"         element={<Navigate to="dashboard" replace />} />
          </Routes>
        </ProtectedRoute>
      } />

      {/* ── Admin ── */}
      <Route path="/admin/*" element={
        <ProtectedRoute roles={['super_admin']}>
          <Layout>
            <Routes>
              <Route path="dashboard" element={<DashboardAdmin />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />

      {/* ── Redirection post-login ── */}
      <Route path="/app" element={
        !user ? <Navigate to="/login" replace /> :
        user?.role === 'client'      ? <Navigate to="/client/dashboard"  replace /> :
        user?.role === 'patron'      ? <Navigate to="/patron/dashboard"  replace /> :
        user?.role === 'super_admin' ? <Navigate to="/admin/dashboard"   replace /> :
        user?.role === 'artisan'     ? <Navigate to="/artisan/missions"  replace /> :
        <Navigate to="/" replace />
      } />

      <Route path="/unauthorized" element={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12 }}>
          <h1 style={{ color: '#FF3B30', fontSize: '1.5rem', fontWeight: 700 }}>Accès refusé</h1>
          <p style={{ color: '#6E6E73' }}>Vous n'avez pas les permissions nécessaires.</p>
        </div>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
