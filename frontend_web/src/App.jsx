import React, { Component } from 'react';
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
import ComClient from './pages/client/ComClient';
import ProfilClient from './pages/client/Profil';
import DashboardPatron from './pages/patron/Dashboard';
import DashboardCoiffure from './pages/patron/DashboardCoiffure';
import DashboardRestaurant from './pages/patron/DashboardRestaurant';
import DashboardHotel from './pages/patron/DashboardHotel';
import DashboardCourse from './pages/patron/DashboardCourse';
import DashboardEat from './pages/patron/DashboardEat';
import DashboardCom from './pages/patron/DashboardCom';
import FreampleCom from './pages/public/FreampleCom';
import PortfolioCom from './pages/public/PortfolioCom';
import ProLanding from './pages/public/ProLanding';
import SuiviCommande from './pages/public/SuiviCommande';
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
import ProfilPatron from './pages/patron/Profil';
import DashboardArtisan from './pages/artisan/Dashboard';
import DashboardDriver from './pages/artisan/DashboardDriver';
import DashboardCoursier from './pages/artisan/DashboardCoursier';
import DashboardMonteur from './pages/artisan/DashboardMonteur';
import CGU from './pages/public/CGU';
import RecrutementPage from './pages/public/RecrutementPage';
import SecteurSelect from './pages/public/SecteurSelect';
import SecteurLanding from './pages/public/SecteurLanding';
import CoiffurePage from './pages/public/CoiffurePage';
import RestaurantPage from './pages/public/RestaurantPage';
import VacancesPage from './pages/public/VacancesPage';
import FreampleEat from './pages/public/FreampleEat';
import FreampleCourse from './pages/public/FreampleCourse';
import SignatureDevis from './pages/public/SignatureDevis';
import SalonDetailPage from './pages/public/SalonDetailPage';
import DocumentView from './pages/public/DocumentView';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Missions from './pages/shared/Missions';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, textAlign: 'center', background: '#F9FAFB' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
          <h1 style={{ color: '#1C1C1E', fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Une erreur est survenue</h1>
          <p style={{ color: '#6E6E73', marginBottom: 12 }}>Rechargez la page pour continuer.</p>
          <pre style={{ color: '#DC2626', fontSize: 12, textAlign: 'left', background: '#FEF2F2', padding: 16, borderRadius: 8, maxWidth: 500, overflow: 'auto', marginBottom: 24 }}>{this.state.error?.message}{'\n'}{this.state.error?.stack?.split('\n').slice(0,5).join('\n')}</pre>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 24px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}>
            Recharger
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function PatronDashboard() {
  const { user } = useAuth();
  const secteur = user?.secteur;
  if (secteur === 'coiffure')   return <DashboardCoiffure />;
  if (secteur === 'restaurant') return <DashboardRestaurant />;
  if (secteur === 'vacances')   return <DashboardHotel />;
  if (secteur === 'course')     return <DashboardCourse />;
  if (secteur === 'eat')        return <DashboardEat />;
  if (secteur === 'com')        return <DashboardCom />;
  return <DashboardPatron />;
}

function ArtisanDashboardSwitch() {
  const { user } = useAuth();
  const secteur = user?.secteur;
  if (secteur === 'course') return <DashboardDriver />;
  if (secteur === 'eat')    return <DashboardCoursier />;
  if (secteur === 'com')    return <DashboardMonteur />;
  return <DashboardArtisan />;
}

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div role="status" aria-label="Chargement en cours" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="spinner-page" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && user?.role !== 'fondateur' && !roles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
  return children;
}

function usePageTracker() {
  const loc = typeof window !== 'undefined' ? window.location : null;
  React.useEffect(() => {
    if (!loc) return;
    const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    fetch(`${API}/analytics/visit`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ page:loc.pathname }) }).catch(()=>{});
  }, [loc?.pathname]);
}

function AppRoutes() {
  const { user } = useAuth();
  usePageTracker();

  return (
    <Routes>
      {/* ── Routes publiques ── */}
      <Route path="/" element={<SecteurSelect />} />
      <Route path="/btp" element={<Landing />} />
      <Route path="/coiffure" element={<CoiffurePage />} />
      <Route path="/coiffure/salon/:salonId" element={<SalonDetailPage />} />
      <Route path="/restaurant" element={<RestaurantPage />} />
      <Route path="/vacances" element={<VacancesPage />} />
      <Route path="/eat" element={<FreampleEat />} />
      <Route path="/course" element={<FreampleCourse />} />
      <Route path="/com" element={<FreampleCom />} />
      <Route path="/com/portfolio" element={<PortfolioCom />} />
      <Route path="/pro" element={<ProLanding />} />
      <Route path="/suivi/:token" element={<SuiviCommande />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cgu" element={<CGU />} />
      <Route path="/recrutement" element={<RecrutementPage />} />
      <Route path="/devis/:id/signer" element={<SignatureDevis />} />
      <Route path="/documents/:type/:id" element={<DocumentView />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      {/* ── Landings sectorielles (route dynamique, après les routes fixes) ── */}
      <Route path="/:secteur" element={<SecteurLanding />} />

      {/* ── Client ── */}
      <Route path="/client/*" element={
        <ProtectedRoute roles={['client']}>
          <Layout>
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
              <Route path="missions"    element={<Navigate to="/client/travaux" replace />} />
              <Route path="com"        element={<ComClient />} />
              <Route path="*"           element={<Navigate to="dashboard" replace />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />

      {/* ── Patron ── */}
      <Route path="/patron/*" element={
        <ProtectedRoute roles={['patron']}>
          <Layout>
            <Routes>
              <Route path="dashboard" element={<PatronDashboard />} />
              <Route path="missions"   element={<ChantiersEtMissions />} />
              <Route path="chantiers"  element={<Navigate to="/patron/missions" replace />} />
              <Route path="finance"   element={<Finance />} />
              <Route path="rh"        element={<RH />} />
              <Route path="qse"       element={<QSE />} />
              <Route path="urssaf"    element={<Navigate to="/patron/finance?onglet=urssaf" replace />} />
              <Route path="devis-pro"  element={<DevisPro />} />
              <Route path="documents" element={<BanqueDocuments />} />
              <Route path="stock"     element={<Stock />} />
              <Route path="gestion-logiciel" element={<GestionLogiciel />} />
              <Route path="clients-rfm"      element={<ClientsRFM />} />
              <Route path="facturation"      element={<Navigate to="/patron/finance?onglet=facturation" replace />} />
              <Route path="agenda"           element={<Agenda />} />
              <Route path="rappel-juridique" element={<RappelJuridique />} />
              <Route path="reputation"       element={<Reputation />} />
              <Route path="profil"           element={<ProfilPatron />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />

      {/* ── Artisan ── */}
      <Route path="/artisan/*" element={
        <ProtectedRoute roles={['artisan']}>
          <Layout>
            <Routes>
              <Route path="dashboard" element={<ArtisanDashboardSwitch />} />
              <Route path="*"         element={<Navigate to="dashboard" replace />} />
            </Routes>
          </Layout>
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

      {/* ── Fondateur (accès total) ── */}
      <Route path="/fondateur/*" element={
        <ProtectedRoute roles={['fondateur']}>
          <Layout>
            <Routes>
              <Route path="dashboard" element={<DashboardAdmin />} />
              <Route path="*" element={<Navigate to="dashboard" replace />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />

      {/* ── Redirection post-login ── */}
      <Route path="/app" element={
        !user ? <Navigate to="/login" replace /> :
        user?.role === 'client'      ? <Navigate to="/"  replace /> :
        user?.role === 'patron'      ? <Navigate to="/patron/dashboard"  replace /> :
        user?.role === 'super_admin' ? <Navigate to="/admin/dashboard"      replace /> :
        user?.role === 'fondateur'   ? <Navigate to="/fondateur/dashboard" replace /> :
        user?.role === 'artisan'     ? <Navigate to="/artisan/dashboard"    replace /> :
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
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
