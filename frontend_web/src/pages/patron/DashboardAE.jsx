import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DS from '../../design/ds';
import NotificationBell from '../../components/ui/NotificationBell';
import { IconHome, IconMissions, IconDocument, IconChart, IconBank, IconBox, IconMapPin, IconCalendar, IconMessage, IconUser } from '../../components/ui/Icons';

const TABS = [
  { id: 'dashboard', label: 'Tableau de bord', Icon: IconHome },
  { id: 'projets', label: 'Projets', Icon: IconMissions },
  { id: 'devis', label: 'Devis & Factures', Icon: IconDocument },
  { id: 'ca', label: 'Mon CA', Icon: IconChart },
  { id: 'urssaf', label: 'URSSAF', Icon: IconBank },
  { id: 'stock', label: 'Stock', Icon: IconBox },
  { id: 'vehicule', label: 'Véhicule', Icon: IconMapPin },
  { id: 'agenda', label: 'Agenda', Icon: IconCalendar },
  { id: 'messagerie', label: 'Messages', Icon: IconMessage },
  { id: 'profil', label: 'Profil', Icon: IconUser },
];

const CARD = { background: '#fff', border: '1px solid #E8E6E1', borderRadius: 14, padding: '16px 20px' };
const BTN = { padding: '10px 20px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font };
const INP = { width: '100%', padding: '10px 12px', border: '1px solid #E8E6E1', borderRadius: 8, fontSize: 13, fontFamily: DS.font, outline: 'none', boxSizing: 'border-box' };

const PLAFONDS = { services: 77700, commerce: 188700 };
const TAUX_COTISATIONS = { services: 21.1, commerce: 12.3 };

const STORAGE_AE = 'freample_ae_data';
function loadAE() { try { return JSON.parse(localStorage.getItem(STORAGE_AE)) || {}; } catch { return {}; } }

function useIsMobile(bp = 640) {
  const [m, setM] = useState(() => window.innerWidth <= bp);
  useEffect(() => { const h = () => setM(window.innerWidth <= bp); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, [bp]);
  return m;
}

export default function DashboardAE() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [tab, setTab] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [aeData, setAeData] = useState(loadAE);
  // States pour les onglets (déclarés au top level pour respecter les règles des hooks React)
  const [showDevisForm, setShowDevisForm] = useState(false);
  const [devisForm, setDevisForm] = useState({ client: '', objet: '', montant: '' });
  const [showStockAdd, setShowStockAdd] = useState(false);
  const [stockForm, setStockForm] = useState({ nom: '', categorie: '', quantite: '', seuil: '' });
  const [vehiculeForm, setVehiculeForm] = useState(null);
  // Devis & Factures filters
  const [factureSearch, setFactureSearch] = useState('');
  const [factureStatusFilter, setFactureStatusFilter] = useState('tous');
  // PDF print modal
  const [printFacture, setPrintFacture] = useState(null);
  // URSSAF declaration states
  const [urssafPeriodType, setUrssafPeriodType] = useState('trimestriel'); // 'mensuel' or 'trimestriel'
  const [urssafVersementLib, setUrssafVersementLib] = useState(false);
  const [urssafCopied, setUrssafCopied] = useState(false);

  // Sous-données
  const activite = aeData.activite || 'services';
  const plafond = PLAFONDS[activite];
  const tauxCotis = TAUX_COTISATIONS[activite];
  const factures = aeData.factures || [];
  const caTotal = factures.filter(f => f.statut === 'payee').reduce((s, f) => s + (f.montant || 0), 0);
  const caPct = plafond > 0 ? Math.round(caTotal / plafond * 100) : 0;
  const stock = aeData.stock || [];
  const vehicule = aeData.vehicule || null;
  const rdvs = aeData.rdvs || [];

  const prenom = user?.nom?.split(' ')[0] || 'vous';

  useEffect(() => { localStorage.setItem(STORAGE_AE, JSON.stringify(aeData)); }, [aeData]);

  // Overdue detection (30+ days, not paid)
  const today = new Date();
  const facturesEnRetard = factures.filter(f => f.statut !== 'payee' && f.date && (today - new Date(f.date)) > 30 * 86400000);

  // Helpers
  const addFacture = (f) => setAeData(d => {
    const nextNum = (d.factures || []).length + 1;
    const numero = `FAC-${new Date().getFullYear()}-${String(nextNum).padStart(3, '0')}`;
    return { ...d, factures: [{ id: Date.now(), numero, ...f, date: new Date().toISOString().slice(0, 10), statut: 'en_attente' }, ...(d.factures || [])] };
  });
  const updateFacture = (id, updates) => setAeData(d => ({ ...d, factures: (d.factures || []).map(f => f.id === id ? { ...f, ...updates } : f) }));

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: DS.font }}>
      {/* Header */}
      <div style={{ background: '#2C2520', padding: isMobile ? '0 12px' : '0 clamp(20px,4vw,40px)', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, padding: 6, flexShrink: 0 }}>
            <span style={{ width: 18, height: 2, background: '#F5EFE0', borderRadius: 1 }} /><span style={{ width: 18, height: 2, background: '#F5EFE0', borderRadius: 1 }} />
          </button>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: isMobile ? 14 : 16, fontWeight: 900, color: '#F5EFE0', fontFamily: DS.font, letterSpacing: '-0.04em', whiteSpace: 'nowrap' }}>
            Freample<span style={{ color: '#A68B4B' }}>.</span>{!isMobile && <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.6 }}> Auto-entrepreneur</span>}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {!isMobile && <span style={{ color: '#F5EFE0', fontSize: 13 }}>Bonjour, {prenom}</span>}
          <NotificationBell dark />
        </div>
      </div>

      {/* Sidebar */}
      {menuOpen && <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }} />}
      <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: 280, background: '#fff', zIndex: 1000, transform: menuOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform .3s', boxShadow: menuOpen ? '4px 0 20px rgba(0,0,0,0.1)' : 'none', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #E8E6E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 15, fontWeight: 800 }}>Mon espace AE</span>
          <button onClick={() => setMenuOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#8E8E93' }}>×</button>
        </div>
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setMenuOpen(false); }}
              style={{ width: '100%', padding: '12px 20px', background: tab === t.id ? '#F8F7F4' : 'none', border: 'none', borderLeft: `3px solid ${tab === t.id ? '#2C2520' : 'transparent'}`, cursor: 'pointer', fontFamily: DS.font, fontSize: 14, fontWeight: tab === t.id ? 700 : 400, color: tab === t.id ? '#1A1A1A' : '#8E8E93', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10, transition: 'all .1s' }}
              onMouseEnter={e => { if (tab !== t.id) e.currentTarget.style.background = '#FAFAF8'; }}
              onMouseLeave={e => { if (tab !== t.id) e.currentTarget.style.background = 'none'; }}>
              <t.Icon size={16} /> {t.label}
            </button>
          ))}
        </nav>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px clamp(20px,4vw,40px)' }}>

        {/* ═══ TABLEAU DE BORD ═══ */}
        {tab === 'dashboard' && <>
          {/* Jauge CA */}
          <div style={{ ...CARD, marginBottom: 16, background: '#2C2520', color: '#F5EFE0', borderColor: '#2C2520' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 11, color: '#A68B4B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Chiffre d'affaires {new Date().getFullYear()}</div>
                <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4 }}>{caTotal.toLocaleString('fr-FR')} €</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, color: 'rgba(245,239,224,0.5)' }}>Plafond {activite}</div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{plafond.toLocaleString('fr-FR')} €</div>
              </div>
            </div>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
              <div style={{ height: 8, borderRadius: 4, width: `${Math.min(caPct, 100)}%`, background: caPct > 90 ? '#DC2626' : caPct > 75 ? '#D97706' : '#A68B4B', transition: 'width .3s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'rgba(245,239,224,0.4)' }}>
              <span>{caPct}% du plafond</span>
              <span>Reste : {(plafond - caTotal).toLocaleString('fr-FR')} €</span>
            </div>
            {caPct > 90 && <div style={{ marginTop: 8, padding: '6px 10px', background: 'rgba(220,38,38,0.2)', borderRadius: 6, fontSize: 11, color: '#FCA5A5' }}>⚠️ Attention : vous approchez du plafond. Pensez à anticiper le changement de statut.</div>}
          </div>

          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 16 }}>
            {[
              { l: 'Factures en attente', v: factures.filter(f => f.statut === 'en_attente').length, c: '#D97706' },
              { l: 'En retard (+30j)', v: facturesEnRetard.length, c: '#DC2626' },
              { l: 'CA ce mois', v: `${factures.filter(f => f.statut === 'payee' && f.date?.startsWith(new Date().toISOString().slice(0, 7))).reduce((s, f) => s + (f.montant || 0), 0).toLocaleString('fr-FR')}€`, c: '#16A34A' },
              { l: 'Cotisations URSSAF', v: `${Math.round(caTotal * tauxCotis / 100).toLocaleString('fr-FR')}€`, c: '#2563EB' },
              { l: 'Stock articles', v: stock.length, c: '#8B5CF6' },
            ].map(k => (
              <div key={k.l} style={{ ...CARD, position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: k.c, borderRadius: '14px 14px 0 0' }} />
                <div style={{ fontSize: 22, fontWeight: 800, color: k.c }}>{k.v}</div>
                <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 4 }}>{k.l}</div>
              </div>
            ))}
          </div>

          {/* Actions rapides */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setTab('projets')} style={{ ...BTN, background: '#A68B4B' }}>📋 Voir les projets</button>
            <button onClick={() => setTab('devis')} style={{ ...BTN, background: '#2C2520' }}>📄 Créer un devis</button>
            <button onClick={() => setTab('ca')} style={{ ...BTN, background: 'transparent', color: '#1A1A1A', border: '1px solid #E8E6E1' }}>💰 Suivi CA</button>
          </div>
        </>}

        {/* ═══ MON CA ═══ */}
        {tab === 'ca' && <>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Suivi du chiffre d'affaires</h2>

          {/* Config activité */}
          <div style={{ ...CARD, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#8E8E93' }}>Type d'activité :</span>
            {[['services', 'Prestations de services (77 700€)'], ['commerce', 'Vente de marchandises (188 700€)']].map(([id, label]) => (
              <button key={id} onClick={() => setAeData(d => ({ ...d, activite: id }))}
                style={{ padding: '6px 14px', background: activite === id ? '#2C2520' : 'transparent', color: activite === id ? '#F5EFE0' : '#8E8E93', border: `1px solid ${activite === id ? '#2C2520' : '#E8E6E1'}`, borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{label}</button>
            ))}
          </div>

          {/* Jauge */}
          <div style={{ ...CARD, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>CA encaissé : {caTotal.toLocaleString('fr-FR')} €</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: caPct > 90 ? '#DC2626' : '#A68B4B' }}>{caPct}% du plafond</span>
            </div>
            <div style={{ height: 12, background: '#E8E6E1', borderRadius: 6 }}>
              <div style={{ height: 12, borderRadius: 6, width: `${Math.min(caPct, 100)}%`, background: caPct > 90 ? '#DC2626' : caPct > 75 ? '#D97706' : '#16A34A', transition: 'width .3s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#8E8E93' }}>
              <span>0 €</span>
              <span>{(plafond * 0.75).toLocaleString('fr-FR')} € (75%)</span>
              <span>{plafond.toLocaleString('fr-FR')} €</span>
            </div>
          </div>

          {/* Livre des recettes */}
          <div style={{ ...CARD }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>Livre des recettes</div>
              {factures.filter(f => f.statut === 'payee').length > 0 && (
                <button onClick={() => {
                  const recettes = factures.filter(f => f.statut === 'payee');
                  const header = 'Date,N° Facture,Client,Nature de la prestation,Montant,Mode de paiement';
                  const rows = recettes.map(f => [f.date || '', f.numero || '', f.client || '', f.description || f.objet || '', f.montant || 0, f.modePaiement || 'Virement'].join(','));
                  const csv = [header, ...rows].join('\n');
                  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a'); a.href = url; a.download = `livre-recettes-${new Date().getFullYear()}.csv`; a.click(); URL.revokeObjectURL(url);
                }} style={{ ...BTN, fontSize: 11, padding: '6px 14px', background: '#16A34A' }}>Exporter CSV</button>
              )}
            </div>
            {factures.filter(f => f.statut === 'payee').length === 0 ? (
              <div style={{ fontSize: 12, color: '#8E8E93', textAlign: 'center', padding: 20 }}>Aucune recette enregistrée.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #E8E6E1', textAlign: 'left' }}>
                      {['Date', 'N° Facture', 'Client', 'Nature de la prestation', 'Montant', 'Mode de paiement'].map(h => (
                        <th key={h} style={{ padding: '8px 6px', fontSize: 10, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {factures.filter(f => f.statut === 'payee').map(f => (
                      <tr key={f.id} style={{ borderBottom: '1px solid #E8E6E1' }}>
                        <td style={{ padding: '8px 6px' }}>{f.date || '—'}</td>
                        <td style={{ padding: '8px 6px', fontWeight: 600 }}>{f.numero || '—'}</td>
                        <td style={{ padding: '8px 6px' }}>{f.client || '—'}</td>
                        <td style={{ padding: '8px 6px' }}>{f.description || f.objet || '—'}</td>
                        <td style={{ padding: '8px 6px', fontWeight: 700 }}>{(f.montant || 0).toLocaleString('fr-FR')} €</td>
                        <td style={{ padding: '8px 6px' }}>{f.modePaiement || 'Virement'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{ marginTop: 10, fontSize: 10, color: '#8E8E93', fontStyle: 'italic' }}>Conformément à l'article L123-28 du Code de commerce</div>
          </div>
        </>}

        {/* ═══ URSSAF ═══ */}
        {tab === 'urssaf' && (() => {
          const now = new Date();
          const year = now.getFullYear();
          const month = now.getMonth(); // 0-indexed

          // Determine current period
          let periodLabel = '';
          let periodStart, periodEnd;
          if (urssafPeriodType === 'mensuel') {
            const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
            periodLabel = `${moisNoms[month]} ${year}`;
            periodStart = new Date(year, month, 1);
            periodEnd = new Date(year, month + 1, 0);
          } else {
            const trimestre = Math.floor(month / 3) + 1;
            const moisTrim = [['Janvier','Février','Mars'],['Avril','Mai','Juin'],['Juillet','Août','Septembre'],['Octobre','Novembre','Décembre']];
            periodLabel = `T${trimestre} ${year} : ${moisTrim[trimestre - 1][0]}-${moisTrim[trimestre - 1][2]}`;
            periodStart = new Date(year, (trimestre - 1) * 3, 1);
            periodEnd = new Date(year, trimestre * 3, 0);
          }

          // CA of the period from paid invoices
          const caPeriode = factures.filter(f => {
            if (f.statut !== 'payee' || !f.date) return false;
            const d = new Date(f.date);
            return d >= periodStart && d <= periodEnd;
          }).reduce((s, f) => s + (f.montant || 0), 0);

          // Cotisations calculation
          const cotisations = Math.round(caPeriode * tauxCotis / 100);
          const tauxVL = activite === 'services' ? 1.0 : 1.7;
          const versementLib = urssafVersementLib ? Math.round(caPeriode * tauxVL / 100) : 0;
          const totalAPayer = cotisations + versementLib;

          // Next deadline
          let nextDeadline;
          if (urssafPeriodType === 'mensuel') {
            // Due on last day of the following month
            nextDeadline = new Date(year, month + 2, 0);
          } else {
            // Quarterly deadlines: 30/04, 31/07, 31/10, 31/01+1
            const trimestre = Math.floor(month / 3) + 1;
            const deadlines = [new Date(year, 3, 30), new Date(year, 6, 31), new Date(year, 9, 31), new Date(year + 1, 0, 31)];
            nextDeadline = deadlines[trimestre - 1];
          }
          const daysUntilDeadline = Math.max(0, Math.ceil((nextDeadline - now) / 86400000));

          const handleCopy = () => {
            const text = [
              `Déclaration URSSAF — ${periodLabel}`,
              `Type d'activité : ${activite === 'services' ? 'Prestations de services' : 'Vente de marchandises'}`,
              `Chiffre d'affaires de la période : ${caPeriode.toLocaleString('fr-FR')} €`,
              `Taux de cotisations : ${tauxCotis}%`,
              `Cotisations sociales : ${cotisations.toLocaleString('fr-FR')} €`,
              urssafVersementLib ? `Versement libératoire IR (${tauxVL}%) : ${versementLib.toLocaleString('fr-FR')} €` : null,
              `Total à payer : ${totalAPayer.toLocaleString('fr-FR')} €`,
              `Date limite : ${nextDeadline.toLocaleDateString('fr-FR')}`,
            ].filter(Boolean).join('\n');
            navigator.clipboard.writeText(text).then(() => {
              setUrssafCopied(true);
              setTimeout(() => setUrssafCopied(false), 2500);
            });
          };

          return <>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Déclaration URSSAF</h2>

          {/* Period selector */}
          <div style={{ ...CARD, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Périodicité de déclaration</div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              {[['mensuel', 'Mensuel'], ['trimestriel', 'Trimestriel']].map(([val, label]) => (
                <label key={val} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input type="radio" name="urssaf-period" checked={urssafPeriodType === val} onChange={() => setUrssafPeriodType(val)} style={{ accentColor: '#2C2520' }} />
                  <span style={{ fontWeight: urssafPeriodType === val ? 700 : 400 }}>{label}</span>
                </label>
              ))}
            </div>
            <div style={{ background: '#F8F7F4', padding: '10px 14px', borderRadius: 8, fontSize: 14, fontWeight: 700, color: '#2C2520' }}>
              Période en cours : {periodLabel}
            </div>
          </div>

          {/* Pre-filled declaration */}
          <div style={{ ...CARD, marginBottom: 16, borderLeft: '4px solid #2563EB' }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Déclaration pré-remplie</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div style={{ background: '#F8F7F4', padding: '10px 12px', borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: '#8E8E93' }}>CA de la période</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{caPeriode.toLocaleString('fr-FR')} €</div>
              </div>
              <div style={{ background: '#F8F7F4', padding: '10px 12px', borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: '#8E8E93' }}>Taux cotisations ({activite})</div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{tauxCotis}%</div>
              </div>
              <div style={{ background: '#EFF6FF', padding: '10px 12px', borderRadius: 8 }}>
                <div style={{ fontSize: 10, color: '#2563EB' }}>Cotisations sociales</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#2563EB' }}>{cotisations.toLocaleString('fr-FR')} €</div>
                <div style={{ fontSize: 10, color: '#8E8E93', marginTop: 2 }}>{caPeriode.toLocaleString('fr-FR')} × {tauxCotis}%</div>
              </div>
              {urssafVersementLib && (
                <div style={{ background: '#FFF7ED', padding: '10px 12px', borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: '#D97706' }}>Versement libératoire IR</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#D97706' }}>{versementLib.toLocaleString('fr-FR')} €</div>
                  <div style={{ fontSize: 10, color: '#8E8E93', marginTop: 2 }}>{caPeriode.toLocaleString('fr-FR')} × {tauxVL}%</div>
                </div>
              )}
            </div>

            {/* Versement libératoire toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#F8F7F4', borderRadius: 8, marginBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flex: 1 }}>
                <div onClick={() => setUrssafVersementLib(!urssafVersementLib)} style={{ width: 38, height: 20, borderRadius: 10, background: urssafVersementLib ? '#16A34A' : '#D1D5DB', position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: urssafVersementLib ? 20 : 2, transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>Versement libératoire de l'impôt sur le revenu</div>
                  <div style={{ fontSize: 10, color: '#8E8E93' }}>{activite === 'services' ? '1% pour prestations de services' : '1,7% pour vente de marchandises'}</div>
                </div>
              </label>
            </div>

            {/* Total */}
            <div style={{ background: '#2C2520', padding: '14px 16px', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 10, color: '#A68B4B', fontWeight: 600, textTransform: 'uppercase' }}>Total à payer</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#F5EFE0' }}>{totalAPayer.toLocaleString('fr-FR')} €</div>
              </div>
              <button onClick={handleCopy} style={{ ...BTN, background: urssafCopied ? '#16A34A' : '#A68B4B', fontSize: 12, padding: '10px 18px' }}>
                {urssafCopied ? 'Copié !' : 'Copier pour déclaration'}
              </button>
            </div>
          </div>

          {/* Deadline reminder */}
          <div style={{ ...CARD, marginBottom: 16, borderLeft: `4px solid ${daysUntilDeadline <= 7 ? '#DC2626' : daysUntilDeadline <= 30 ? '#D97706' : '#16A34A'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Prochaine échéance</div>
                <div style={{ fontSize: 15, fontWeight: 800, marginTop: 4 }}>{nextDeadline.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
              <div style={{ textAlign: 'center', padding: '8px 16px', background: daysUntilDeadline <= 7 ? '#FEF2F2' : daysUntilDeadline <= 30 ? '#FFF7ED' : '#F0FDF4', borderRadius: 8 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: daysUntilDeadline <= 7 ? '#DC2626' : daysUntilDeadline <= 30 ? '#D97706' : '#16A34A' }}>{daysUntilDeadline}</div>
                <div style={{ fontSize: 10, color: '#8E8E93' }}>jours restants</div>
              </div>
            </div>
          </div>

          {/* Annual simulation (kept from original) */}
          <div style={{ ...CARD, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Simulation annuelle {year}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['CA encaissé (année)', `${caTotal.toLocaleString('fr-FR')} €`],
                ['Taux cotisations', `${tauxCotis}%`],
                ['Cotisations annuelles', `${Math.round(caTotal * tauxCotis / 100).toLocaleString('fr-FR')} €`],
                ['Revenu net estimé', `${Math.round(caTotal * (1 - tauxCotis / 100)).toLocaleString('fr-FR')} €`],
              ].map(([k, v]) => (
                <div key={k} style={{ background: '#F8F7F4', padding: '10px 12px', borderRadius: 8 }}>
                  <div style={{ fontSize: 10, color: '#8E8E93' }}>{k}</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: '#8E8E93' }}>
              TVA non applicable, article 293 B du CGI (si CA &lt; seuils de franchise).
            </div>
          </div>
        </>;
        })()}

        {/* ═══ DEVIS & FACTURES ═══ */}
        {tab === 'devis' && (() => {
            const isOverdue = (f) => f.statut !== 'payee' && f.date && (today - new Date(f.date)) > 30 * 86400000;
            let filtered = [...factures];
            if (factureSearch) {
              const q = factureSearch.toLowerCase();
              filtered = filtered.filter(f => (f.client || '').toLowerCase().includes(q) || (f.description || f.objet || '').toLowerCase().includes(q));
            }
            if (factureStatusFilter === 'en_attente') filtered = filtered.filter(f => f.statut === 'en_attente' && !isOverdue(f));
            else if (factureStatusFilter === 'payee') filtered = filtered.filter(f => f.statut === 'payee');
            else if (factureStatusFilter === 'en_retard') filtered = filtered.filter(f => isOverdue(f));
            filtered.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
            return <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Devis & Factures</h2>
              <button onClick={() => setShowDevisForm(!showDevisForm)} style={BTN}>{showDevisForm ? 'Annuler' : '+ Nouvelle facture'}</button>
            </div>
            {showDevisForm && (
              <div style={{ ...CARD, marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ gridColumn: '1/-1' }}><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Client</label><input value={devisForm.client} onChange={e => setDevisForm(f => ({ ...f, client: e.target.value }))} placeholder="Nom du client" style={INP} /></div>
                  <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Objet</label><input value={devisForm.objet} onChange={e => setDevisForm(f => ({ ...f, objet: e.target.value }))} placeholder="Travaux de plomberie" style={INP} /></div>
                  <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Montant (€)</label><input type="number" value={devisForm.montant} onChange={e => setDevisForm(f => ({ ...f, montant: e.target.value }))} placeholder="500" style={INP} /></div>
                </div>
                <div style={{ fontSize: 10, color: '#A68B4B', marginTop: 8 }}>Mention obligatoire : "TVA non applicable, article 293 B du CGI"</div>
                <button onClick={() => { if (devisForm.client && devisForm.montant) { addFacture({ client: devisForm.client, objet: devisForm.objet, montant: Number(devisForm.montant), description: devisForm.objet }); setDevisForm({ client: '', objet: '', montant: '' }); setShowDevisForm(false); } }} style={{ ...BTN, marginTop: 10 }}>Créer la facture</button>
              </div>
            )}

            {/* Search & Filters */}
            <div style={{ ...CARD, marginBottom: 12, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <input value={factureSearch} onChange={e => setFactureSearch(e.target.value)} placeholder="Rechercher par client ou description..." style={{ ...INP, flex: '1 1 200px', maxWidth: 320 }} />
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {[['tous', 'Tous'], ['en_attente', 'En attente'], ['payee', 'Payée'], ['en_retard', 'En retard']].map(([val, label]) => (
                  <button key={val} onClick={() => setFactureStatusFilter(val)}
                    style={{ padding: '5px 12px', background: factureStatusFilter === val ? (val === 'en_retard' ? '#DC2626' : '#2C2520') : 'transparent', color: factureStatusFilter === val ? '#F5EFE0' : '#8E8E93', border: `1px solid ${factureStatusFilter === val ? 'transparent' : '#E8E6E1'}`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font }}>{label}</button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div style={{ ...CARD, textAlign: 'center', padding: 40, color: '#8E8E93' }}>Aucune facture trouvée.</div>
            ) : filtered.map(f => {
              const overdue = isOverdue(f);
              return (
              <div key={f.id} style={{ ...CARD, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: overdue ? '3px solid #DC2626' : undefined }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{f.client}</div>
                  <div style={{ fontSize: 12, color: '#8E8E93' }}>{f.numero && <span style={{ fontWeight: 600, color: '#2C2520' }}>{f.numero}</span>}{f.numero && ' · '}{f.objet || '—'} · {f.date}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: 16, fontWeight: 800 }}>{(f.montant || 0).toLocaleString('fr-FR')} €</span>
                  {overdue && <span style={{ fontSize: 9, fontWeight: 700, color: '#DC2626', background: '#FEF2F2', padding: '2px 6px', borderRadius: 4 }}>En retard</span>}
                  {f.statut === 'en_attente' && !overdue ? (
                    <button onClick={() => updateFacture(f.id, { statut: 'payee' })} style={{ padding: '4px 10px', background: '#F0FDF4', color: '#16A34A', border: 'none', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>Marquer payée</button>
                  ) : f.statut === 'payee' ? <span style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', background: '#F0FDF4', padding: '3px 8px', borderRadius: 4 }}>Payée</span>
                  : overdue && <button onClick={() => updateFacture(f.id, { statut: 'payee' })} style={{ padding: '4px 10px', background: '#F0FDF4', color: '#16A34A', border: 'none', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>Marquer payée</button>}
                  <button onClick={() => setPrintFacture(f)} style={{ padding: '4px 10px', background: '#EFF6FF', color: '#2563EB', border: 'none', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>PDF</button>
                </div>
              </div>
            );})}
        </>;
        })()}

        {/* ═══ STOCK ═══ */}
        {tab === 'stock' && <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Stock & Matériel ({stock.length})</h2>
              <button onClick={() => setShowStockAdd(!showStockAdd)} style={BTN}>{showStockAdd ? 'Annuler' : '+ Ajouter'}</button>
            </div>
            {showStockAdd && (
              <div style={{ ...CARD, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Article</label><input value={stockForm.nom} onChange={e => setStockForm(f => ({ ...f, nom: e.target.value }))} placeholder="Tube cuivre 22mm" style={INP} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Catégorie</label><input value={stockForm.categorie} onChange={e => setStockForm(f => ({ ...f, categorie: e.target.value }))} placeholder="Plomberie" style={INP} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Quantité</label><input type="number" value={stockForm.quantite} onChange={e => setStockForm(f => ({ ...f, quantite: e.target.value }))} style={INP} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Seuil alerte</label><input type="number" value={stockForm.seuil} onChange={e => setStockForm(f => ({ ...f, seuil: e.target.value }))} style={INP} /></div>
                <button onClick={() => { if (stockForm.nom) { setAeData(d => ({ ...d, stock: [...(d.stock || []), { id: Date.now(), ...stockForm, quantite: Number(stockForm.quantite), seuil: Number(stockForm.seuil) }] })); setStockForm({ nom: '', categorie: '', quantite: '', seuil: '' }); setShowStockAdd(false); } }} style={{ ...BTN, gridColumn: '1/-1' }}>Ajouter</button>
              </div>
            )}
            {stock.length === 0 ? (
              <div style={{ ...CARD, textAlign: 'center', padding: 40, color: '#8E8E93' }}>Aucun article en stock.</div>
            ) : stock.map(s => (
              <div key={s.id} style={{ ...CARD, marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `3px solid ${s.quantite <= (s.seuil || 0) ? '#DC2626' : '#16A34A'}` }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{s.nom}</div>
                  <div style={{ fontSize: 11, color: '#8E8E93' }}>{s.categorie || '—'}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 800 }}>{s.quantite}</span>
                  {s.quantite <= (s.seuil || 0) && <span style={{ fontSize: 9, fontWeight: 700, color: '#DC2626', background: '#FEF2F2', padding: '2px 6px', borderRadius: 4 }}>⚠️ Stock bas</span>}
                  <button onClick={() => setAeData(d => ({ ...d, stock: d.stock.filter(x => x.id !== s.id) }))} style={{ padding: '3px 8px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: 4, fontSize: 9, cursor: 'pointer' }}>✕</button>
                </div>
              </div>
            ))}
        </>}

        {/* ═══ VÉHICULE ═══ */}
        {tab === 'vehicule' && (() => {
          const vf = vehiculeForm || vehicule || { marque: '', modele: '', immat: '', km: '', prochainCT: '', prochaineVidange: '', assuranceExpire: '' };
          const setVf = (fn) => setVehiculeForm(typeof fn === 'function' ? fn(vf) : fn);
          if (!vehiculeForm && vehicule) setVehiculeForm(vehicule);
          else if (!vehiculeForm) setVehiculeForm(vf);
          const sauverVehicule = () => { setAeData(d => ({ ...d, vehicule: { ...vf, km: Number(vf.km) } })); };
          const today = new Date().toISOString().slice(0, 10);
          const alertes = [];
          if (vehicule?.prochainCT && vehicule.prochainCT < today) alertes.push({ msg: 'Contrôle technique expiré !', color: '#DC2626' });
          else if (vehicule?.prochainCT && new Date(vehicule.prochainCT) - new Date() < 30 * 86400000) alertes.push({ msg: `CT dans moins de 30 jours (${new Date(vehicule.prochainCT).toLocaleDateString('fr-FR')})`, color: '#D97706' });
          if (vehicule?.assuranceExpire && vehicule.assuranceExpire < today) alertes.push({ msg: 'Assurance expirée !', color: '#DC2626' });
          if (vehicule?.prochaineVidange && vehicule.prochaineVidange < today) alertes.push({ msg: 'Vidange à faire !', color: '#D97706' });
          return <>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Mon véhicule</h2>
            <div style={{ ...CARD, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Marque</label><input value={vf.marque || ''} onChange={e => setVf(f => ({ ...f, marque: e.target.value }))} placeholder="Renault" style={INP} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Modèle</label><input value={vf.modele || ''} onChange={e => setVf(f => ({ ...f, modele: e.target.value }))} placeholder="Master" style={INP} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Immatriculation</label><input value={vf.immat || ''} onChange={e => setVf(f => ({ ...f, immat: e.target.value }))} placeholder="AB-123-CD" style={INP} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Kilométrage</label><input type="number" value={vf.km || ''} onChange={e => setVf(f => ({ ...f, km: e.target.value }))} placeholder="85000" style={INP} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Prochain CT</label><input type="date" value={vf.prochainCT || ''} onChange={e => setVf(f => ({ ...f, prochainCT: e.target.value }))} style={INP} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Prochaine vidange</label><input type="date" value={vf.prochaineVidange || ''} onChange={e => setVf(f => ({ ...f, prochaineVidange: e.target.value }))} style={INP} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Assurance expire le</label><input type="date" value={vf.assuranceExpire || ''} onChange={e => setVf(f => ({ ...f, assuranceExpire: e.target.value }))} style={INP} /></div>
              </div>
              <button onClick={sauverVehicule} style={{ ...BTN, marginTop: 12, width: '100%' }}>Enregistrer</button>
            </div>
            {vehicule && (alertes.length > 0 ? <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {alertes.map((a, i) => <div key={i} style={{ ...CARD, borderLeft: `4px solid ${a.color}`, fontSize: 13, color: a.color, fontWeight: 600 }}>⚠️ {a.msg}</div>)}
            </div> : <div style={{ ...CARD, color: '#16A34A', fontSize: 13, fontWeight: 600 }}>✅ Véhicule à jour</div>)}
          </>;
        })()}

        {/* ═══ PROJETS ═══ */}
        {tab === 'projets' && <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Projets clients disponibles</h2>
          <p style={{ fontSize: 13, color: '#8E8E93', marginBottom: 16 }}>Les projets de votre zone apparaissent ici. Configurez votre zone dans "Mon profil".</p>
          <button onClick={() => navigate('/patron/projets')} style={{ ...BTN, background: '#A68B4B' }}>Voir les projets dans ma zone →</button>
        </div>}

        {/* ═══ AGENDA ═══ */}
        {tab === 'agenda' && <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Mon agenda</h2>
          <div style={{ ...CARD, textAlign: 'center', padding: 40, color: '#8E8E93' }}>📅 Agenda à venir — planifiez vos interventions et RDV clients.</div>
        </div>}

        {/* ═══ MESSAGERIE ═══ */}
        {tab === 'messagerie' && <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Messagerie</h2>
          <div style={{ ...CARD, textAlign: 'center', padding: 40, color: '#8E8E93' }}>💬 Vos conversations avec les clients apparaîtront ici.</div>
        </div>}

        {/* ═══ PROFIL ═══ */}
        {tab === 'profil' && <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Mon profil</h2>
          <div style={{ ...CARD }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#2C2520', color: '#F5EFE0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 }}>{(user?.nom || 'A').charAt(0)}</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{user?.nom || '—'}</div>
                <div style={{ fontSize: 13, color: '#8E8E93' }}>{user?.email || '—'}</div>
                <div style={{ fontSize: 11, color: '#A68B4B', fontWeight: 600 }}>Auto-entrepreneur</div>
              </div>
            </div>
          </div>
        </div>}

      </div>

      {/* Print CSS */}
      <style>{`@media print { body * { visibility: hidden !important; } #ae-facture-print, #ae-facture-print * { visibility: visible !important; } #ae-facture-print { position: fixed; top: 0; left: 0; width: 100%; background: #fff; z-index: 99999; } }`}</style>

      {/* PDF / Print modal */}
      {printFacture && (
        <>
          <div onClick={() => setPrintFacture(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998 }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', zIndex: 9999, width: '90%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #E8E6E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Aperçu facture</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => window.print()} style={{ ...BTN, fontSize: 11, padding: '6px 14px', background: '#2563EB' }}>Imprimer / PDF</button>
                <button onClick={() => setPrintFacture(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#8E8E93' }}>×</button>
              </div>
            </div>
            <div id="ae-facture-print" style={{ padding: '32px 28px', fontFamily: DS.font, color: '#0A0A0A' }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>FACTURE</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 4 }}>{printFacture.numero || '—'}</div>
                <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>Date : {printFacture.date || '—'}</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, gap: 20 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', marginBottom: 4 }}>Émetteur</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{user?.nom || '—'}</div>
                  <div style={{ fontSize: 11, color: '#8E8E93', marginTop: 2 }}>Auto-entrepreneur</div>
                  <div style={{ fontSize: 10, color: '#A68B4B', marginTop: 4, fontStyle: 'italic' }}>TVA non applicable, art. 293 B du CGI</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#8E8E93', textTransform: 'uppercase', marginBottom: 4 }}>Client</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{printFacture.client || '—'}</div>
                </div>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20 }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #2C2520' }}>
                    <th style={{ textAlign: 'left', padding: '8px 0', fontSize: 11, fontWeight: 700 }}>Description</th>
                    <th style={{ textAlign: 'right', padding: '8px 0', fontSize: 11, fontWeight: 700 }}>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #E8E6E1' }}>
                    <td style={{ padding: '10px 0', fontSize: 13 }}>{printFacture.description || printFacture.objet || '—'}</td>
                    <td style={{ padding: '10px 0', fontSize: 13, textAlign: 'right', fontWeight: 600 }}>{(printFacture.montant || 0).toLocaleString('fr-FR')} €</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <div style={{ background: '#F8F7F4', padding: '12px 20px', borderRadius: 8, textAlign: 'right' }}>
                  <div style={{ fontSize: 10, color: '#8E8E93', fontWeight: 600 }}>TOTAL</div>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>{(printFacture.montant || 0).toLocaleString('fr-FR')} €</div>
                </div>
              </div>
              <div style={{ fontSize: 9, color: '#8E8E93', textAlign: 'center', borderTop: '1px solid #E8E6E1', paddingTop: 12 }}>
                {user?.nom || '—'} — Auto-entrepreneur — TVA non applicable, article 293 B du CGI
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
