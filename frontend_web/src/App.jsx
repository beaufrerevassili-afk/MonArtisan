import React, { Component, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { API_URL } from './services/api';
// ── Imports directs (pages légères, chargées immédiatement) ──
import Login from './pages/Login';
import Register from './pages/Register';
import SecteurSelect from './pages/public/SecteurSelect';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Layout from './components/layout/Layout';

// ── Lazy-loaded (chargées à la demande, réduit le bundle initial) ──
const Landing = React.lazy(() => import('./pages/public/Landing'));
const DashboardClient = React.lazy(() => import('./pages/client/Dashboard'));
const DashboardPatron = React.lazy(() => import('./pages/patron/Dashboard'));
const Employes = React.lazy(() => import('./pages/patron/Employes'));
const ProjetsClients = React.lazy(() => import('./pages/patron/ProjetsClients'));
const SuiviProjets = React.lazy(() => import('./pages/patron/SuiviProjets'));
const DashboardAE = React.lazy(() => import('./pages/patron/DashboardAE'));
const DashboardCom = React.lazy(() => import('./pages/patron/DashboardCom'));
const SuiviCommande = React.lazy(() => import('./pages/public/SuiviCommande'));
const DashboardAdmin = React.lazy(() => import('./pages/admin/Dashboard'));
const Finance = React.lazy(() => import('./pages/patron/Finance'));
const RH = React.lazy(() => import('./pages/patron/RH'));
const QSE = React.lazy(() => import('./pages/patron/QSE'));
const ChantiersEtMissions = React.lazy(() => import('./pages/patron/ChantiersEtMissions'));
const BanqueDocuments = React.lazy(() => import('./pages/patron/BanqueDocuments'));
const Stock = React.lazy(() => import('./pages/patron/Stock'));
const ClientsRFM = React.lazy(() => import('./pages/patron/ClientsRFM'));
const Agenda = React.lazy(() => import('./pages/patron/Agenda'));
const ProfilPatron = React.lazy(() => import('./pages/patron/Profil'));
const DashboardArtisan = React.lazy(() => import('./pages/artisan/Dashboard'));
const DashboardMonteur = React.lazy(() => import('./pages/artisan/DashboardMonteur'));
const CGU = React.lazy(() => import('./pages/public/CGU'));
const RecrutementPage = React.lazy(() => import('./pages/public/RecrutementPage'));
const SecteurLanding = React.lazy(() => import('./pages/public/SecteurLanding'));
const SignatureDevis = React.lazy(() => import('./pages/public/SignatureDevis'));
const SetupCompte = React.lazy(() => import('./pages/public/SetupCompte'));
const DocumentView = React.lazy(() => import('./pages/public/DocumentView'));
const StatsAdmin = React.lazy(() => import('./pages/public/StatsAdmin'));
const ProLanding = React.lazy(() => import('./pages/public/ProLanding'));
const Messagerie = React.lazy(() => import('./pages/Messagerie'));
const Support = React.lazy(() => import('./pages/public/Support'));
const CompteSuspendu = React.lazy(() => import('./pages/public/CompteSuspendu'));
const DevisFactures = React.lazy(() => import('./pages/patron/DevisFactures'));
const MonImage = React.lazy(() => import('./pages/patron/MonImage'));
const DashboardEmploye = React.lazy(() => import('./pages/employe/Dashboard'));

const LazySpinner = () => (
  <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh' }}>
    <div style={{ width:32, height:32, border:'3px solid #E8E6E1', borderTopColor:'#A68B4B', borderRadius:'50%', animation:'spin .7s linear infinite' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

// Détection des erreurs de chargement de chunk (redéploiement Vercel = anciens bundles obsolètes)
function isChunkLoadError(error) {
  const msg = error?.message || '';
  return (
    msg.includes('is not a valid JavaScript MIME type') ||
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Loading chunk') ||
    msg.includes('Loading CSS chunk') ||
    msg.includes("'text/html' is not a valid") ||
    error?.name === 'ChunkLoadError'
  );
}

class ErrorBoundary extends Component {
  state = { hasError: false, error: null, reloadAttempted: false };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error) {
    // Si c'est un chunk obsolete, rechargement automatique 1 seule fois
    if (isChunkLoadError(error) && !sessionStorage.getItem('chunkReloadAttempted')) {
      sessionStorage.setItem('chunkReloadAttempted', '1');
      window.location.reload();
    }
  }
  render() {
    if (this.state.hasError) {
      const chunkError = isChunkLoadError(this.state.error);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 24, textAlign: 'center', background: '#F9FAFB' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>{chunkError ? '🔄' : '⚠️'}</div>
          <h1 style={{ color: '#1C1C1E', fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>
            {chunkError ? 'Mise à jour de l\'application...' : 'Une erreur est survenue'}
          </h1>
          <p style={{ color: '#6E6E73', marginBottom: 12 }}>
            {chunkError ? 'Rechargement automatique en cours.' : 'Rechargez la page pour continuer.'}
          </p>
          {!chunkError && (
            <pre style={{ color: '#DC2626', fontSize: 12, textAlign: 'left', background: '#FEF2F2', padding: 16, borderRadius: 8, maxWidth: 500, overflow: 'auto', marginBottom: 24 }}>{this.state.error?.message}{'\n'}{this.state.error?.stack?.split('\n').slice(0,5).join('\n')}</pre>
          )}
          <button onClick={() => { sessionStorage.removeItem('chunkReloadAttempted'); window.location.reload(); }} style={{ padding: '10px 24px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: '1rem' }}>
            Recharger
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Handler global pour les erreurs non-catchées (rejections de promesses, erreurs window)
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (isChunkLoadError(event.error || event) && !sessionStorage.getItem('chunkReloadAttempted')) {
      sessionStorage.setItem('chunkReloadAttempted', '1');
      window.location.reload();
    }
  });
  window.addEventListener('unhandledrejection', (event) => {
    if (isChunkLoadError(event.reason) && !sessionStorage.getItem('chunkReloadAttempted')) {
      sessionStorage.setItem('chunkReloadAttempted', '1');
      window.location.reload();
    }
  });
  // Une fois chargé avec succès, on clear le flag (prochaine visite peut re-tenter)
  window.addEventListener('load', () => {
    setTimeout(() => sessionStorage.removeItem('chunkReloadAttempted'), 2000);
  });
}

function PatronDashboard() {
  const { user } = useAuth();
  // Fondateur → toujours redirigé vers son dashboard
  if (user?.role === 'fondateur') {
    window.location.href = '/fondateur/dashboard';
    return null;
  }
  if (user?.secteur === 'com') return <DashboardCom />;
  return <DashboardPatron />;
}

function ArtisanDashboardSwitch() {
  const { user } = useAuth();
  const secteur = user?.secteur;
  if (secteur === 'com')    return <DashboardMonteur />;
  return <DashboardArtisan />;
}

function ProtectedRoute({ children, roles, allowSuspended }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div role="status" aria-label="Chargement en cours" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div className="spinner-page" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (user?.suspendu && !allowSuspended) return <Navigate to="/compte-suspendu" replace />;
  if (roles && user?.role !== 'fondateur' && !roles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
  return children;
}

function usePageTracker() {
  const location = useLocation();
  React.useEffect(() => {
    fetch(`${API_URL}/analytics/visit`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ page:location.pathname }) }).catch(()=>{});
  }, [location.pathname]);
}


function AppRoutes() {
  const { user } = useAuth();
  usePageTracker();

  return (
    <Suspense fallback={<LazySpinner />}>
    <Routes>
      {/* ── Routes publiques ── */}
      <Route path="/" element={<SecteurSelect />} />
      <Route path="/btp" element={<Landing />} />
      <Route path="/admin/stats" element={<StatsAdmin />} />
      {/* Anciennes routes redirigées vers l'accueil */}
      <Route path="/coiffure" element={<Navigate to="/" replace />} />
      <Route path="/com" element={<Navigate to="/" replace />} />
      <Route path="/immo" element={<Navigate to="/" replace />} />
      <Route path="/droit" element={<Navigate to="/" replace />} />
      <Route path="/pro" element={<ProLanding />} />
      <Route path="/support" element={<Support />} />
      <Route path="/compte-suspendu" element={<CompteSuspendu />} />
      <Route path="/suivi/:token" element={<SuiviCommande />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cgu" element={<CGU />} />
      <Route path="/recrutement" element={<RecrutementPage />} />
      <Route path="/devis/:id/signer" element={<SignatureDevis />} />
      <Route path="/setup-compte/:token" element={<SetupCompte />} />
      <Route path="/documents/:type/:id" element={<DocumentView />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      {/* ── Messagerie (tous les rôles) ── */}
      <Route path="/messagerie" element={<ProtectedRoute><Messagerie /></ProtectedRoute>} />
      {/* ── Landings sectorielles (route dynamique, après les routes fixes) ── */}
      <Route path="/:secteur" element={<SecteurLanding />} />

      {/* ── Client ── */}
      <Route path="/client/*" element={
        <ProtectedRoute roles={['client']}>
          <Routes>
            <Route path="dashboard"   element={<DashboardClient />} />
            <Route path="*"           element={<Navigate to="dashboard" replace />} />
          </Routes>
        </ProtectedRoute>
      } />

      {/* ── Patron ── */}
      <Route path="/patron/*" element={
        <ProtectedRoute roles={['patron']}>
          <Layout>
            <Routes>
              <Route path="dashboard" element={<PatronDashboard />} />
              <Route path="projets"  element={<ProjetsClients />} />
              <Route path="suivi-projets" element={<SuiviProjets />} />
              <Route path="missions"   element={<ChantiersEtMissions />} />
              <Route path="chantiers"  element={<Navigate to="/patron/missions" replace />} />
              <Route path="finance"   element={<Finance />} />
              <Route path="employes"  element={<Employes />} />
              <Route path="rh"        element={<RH />} />
              <Route path="qse"       element={<QSE />} />
              <Route path="urssaf"    element={<Navigate to="/patron/finance?onglet=urssaf" replace />} />
              <Route path="devis-pro"  element={<Navigate to="/patron/finance" replace />} />
              <Route path="documents" element={<BanqueDocuments />} />
              <Route path="stock"     element={<Stock />} />
              <Route path="gestion-logiciel" element={<Navigate to="/patron/profil" replace />} />
              <Route path="clients-rfm"      element={<ClientsRFM />} />
              <Route path="facturation"      element={<Navigate to="/patron/finance?onglet=facturation" replace />} />
              <Route path="agenda"           element={<Agenda />} />
              <Route path="rappel-juridique" element={<Navigate to="/patron/documents" replace />} />
              <Route path="reputation"       element={<Navigate to="/patron/clients-rfm" replace />} />
              <Route path="devis-factures"   element={<DevisFactures />} />
              <Route path="mon-image"        element={<MonImage />} />
              <Route path="profil"           element={<ProfilPatron />} />
              <Route path="messagerie"      element={<Messagerie />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />

      {/* ── Auto-entrepreneur ── */}
      <Route path="/ae/*" element={
        <ProtectedRoute roles={['patron']}>
          <Routes>
            <Route path="dashboard" element={<DashboardAE />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>
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

      {/* ── Employé ── */}
      <Route path="/employe/*" element={
        <ProtectedRoute roles={['employe']}>
          <Routes>
            <Route path="dashboard" element={<DashboardEmploye />} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
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
        user?.suspendu ? <Navigate to="/compte-suspendu" replace /> :
        user?.role === 'client'      ? <Navigate to="/"  replace /> :
        user?.role === 'patron'      ? <Navigate to="/patron/dashboard"  replace /> :
        user?.role === 'super_admin' ? <Navigate to="/admin/dashboard"      replace /> :
        user?.role === 'fondateur'   ? <Navigate to="/fondateur/dashboard" replace /> :
        user?.role === 'artisan'     ? <Navigate to="/artisan/dashboard"    replace /> :
        user?.role === 'employe'     ? <Navigate to="/employe/dashboard"    replace /> :
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
    </Suspense>
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
