import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import DS from '../../design/ds';

const TABS = [
  { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
  { id: 'projets', label: 'Projets clients', icon: '📋' },
  { id: 'devis', label: 'Devis & Factures', icon: '📄' },
  { id: 'ca', label: 'Mon CA', icon: '💰' },
  { id: 'urssaf', label: 'URSSAF', icon: '🏛️' },
  { id: 'stock', label: 'Stock & Matériel', icon: '📦' },
  { id: 'vehicule', label: 'Mon véhicule', icon: '🚗' },
  { id: 'agenda', label: 'Mon agenda', icon: '📅' },
  { id: 'messagerie', label: 'Messagerie', icon: '💬' },
  { id: 'profil', label: 'Mon profil', icon: '👤' },
];

const CARD = { background: '#fff', border: '1px solid #E8E6E1', borderRadius: 14, padding: '16px 20px' };
const BTN = { padding: '10px 20px', background: '#2C2520', color: '#F5EFE0', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: DS.font };
const INP = { width: '100%', padding: '10px 12px', border: '1px solid #E8E6E1', borderRadius: 8, fontSize: 13, fontFamily: DS.font, outline: 'none', boxSizing: 'border-box' };

const PLAFONDS = { services: 77700, commerce: 188700 };
const TAUX_COTISATIONS = { services: 21.1, commerce: 12.3 };

const STORAGE_AE = 'freample_ae_data';
function loadAE() { try { return JSON.parse(localStorage.getItem(STORAGE_AE)) || {}; } catch { return {}; } }

export default function DashboardAE() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab] = useState('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [aeData, setAeData] = useState(loadAE);

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

  // Helpers
  const addFacture = (f) => setAeData(d => ({ ...d, factures: [{ id: Date.now(), ...f, date: new Date().toISOString().slice(0, 10), statut: 'en_attente' }, ...(d.factures || [])] }));
  const updateFacture = (id, updates) => setAeData(d => ({ ...d, factures: (d.factures || []).map(f => f.id === id ? { ...f, ...updates } : f) }));

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF8', fontFamily: DS.font }}>
      {/* Header */}
      <div style={{ background: '#2C2520', padding: '0 clamp(20px,4vw,40px)', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 4, padding: 6 }}>
            <span style={{ width: 18, height: 2, background: '#F5EFE0', borderRadius: 1 }} /><span style={{ width: 18, height: 2, background: '#F5EFE0', borderRadius: 1 }} />
          </button>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 900, color: '#F5EFE0', fontFamily: DS.font, letterSpacing: '-0.04em' }}>
            Freample<span style={{ color: '#A68B4B' }}>.</span> <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.6 }}>Auto-entrepreneur</span>
          </button>
        </div>
        <div style={{ color: '#F5EFE0', fontSize: 13 }}>Bonjour, {prenom}</div>
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
              <span style={{ fontSize: 16 }}>{t.icon}</span> {t.label}
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
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Livre des recettes</div>
            {factures.filter(f => f.statut === 'payee').length === 0 ? (
              <div style={{ fontSize: 12, color: '#8E8E93', textAlign: 'center', padding: 20 }}>Aucune recette enregistrée.</div>
            ) : factures.filter(f => f.statut === 'payee').map(f => (
              <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #E8E6E1', fontSize: 12 }}>
                <div><span style={{ fontWeight: 600 }}>{f.client || 'Client'}</span> — {f.description || f.objet || '—'}</div>
                <div style={{ fontWeight: 700 }}>{(f.montant || 0).toLocaleString('fr-FR')} €</div>
              </div>
            ))}
          </div>
        </>}

        {/* ═══ URSSAF ═══ */}
        {tab === 'urssaf' && <>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Cotisations URSSAF</h2>
          <div style={{ ...CARD, marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Simulation cotisations {new Date().getFullYear()}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['CA encaissé', `${caTotal.toLocaleString('fr-FR')} €`],
                ['Taux cotisations', `${tauxCotis}%`],
                ['Cotisations dues', `${Math.round(caTotal * tauxCotis / 100).toLocaleString('fr-FR')} €`],
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
        </>}

        {/* ═══ DEVIS & FACTURES ═══ */}
        {tab === 'devis' && (() => {
          const [showForm, setShowForm] = useState(false);
          const [form, setForm] = useState({ client: '', objet: '', montant: '' });
          return <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Devis & Factures</h2>
              <button onClick={() => setShowForm(!showForm)} style={BTN}>{showForm ? 'Annuler' : '+ Nouvelle facture'}</button>
            </div>
            {showForm && (
              <div style={{ ...CARD, marginBottom: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ gridColumn: '1/-1' }}><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Client</label><input value={form.client} onChange={e => setForm(f => ({ ...f, client: e.target.value }))} placeholder="Nom du client" style={INP} /></div>
                  <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Objet</label><input value={form.objet} onChange={e => setForm(f => ({ ...f, objet: e.target.value }))} placeholder="Travaux de plomberie" style={INP} /></div>
                  <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Montant (€)</label><input type="number" value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))} placeholder="500" style={INP} /></div>
                </div>
                <div style={{ fontSize: 10, color: '#A68B4B', marginTop: 8 }}>Mention obligatoire : "TVA non applicable, article 293 B du CGI"</div>
                <button onClick={() => { if (form.client && form.montant) { addFacture({ client: form.client, objet: form.objet, montant: Number(form.montant), description: form.objet }); setForm({ client: '', objet: '', montant: '' }); setShowForm(false); } }} style={{ ...BTN, marginTop: 10 }}>Créer la facture</button>
              </div>
            )}
            {factures.length === 0 ? (
              <div style={{ ...CARD, textAlign: 'center', padding: 40, color: '#8E8E93' }}>Aucune facture. Cliquez sur "+ Nouvelle facture".</div>
            ) : factures.map(f => (
              <div key={f.id} style={{ ...CARD, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{f.client}</div>
                  <div style={{ fontSize: 12, color: '#8E8E93' }}>{f.objet || '—'} · {f.date}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16, fontWeight: 800 }}>{(f.montant || 0).toLocaleString('fr-FR')} €</span>
                  {f.statut === 'en_attente' ? (
                    <button onClick={() => updateFacture(f.id, { statut: 'payee' })} style={{ padding: '4px 10px', background: '#F0FDF4', color: '#16A34A', border: 'none', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>Marquer payée</button>
                  ) : <span style={{ fontSize: 10, fontWeight: 700, color: '#16A34A', background: '#F0FDF4', padding: '3px 8px', borderRadius: 4 }}>✓ Payée</span>}
                </div>
              </div>
            ))}
          </>;
        })()}

        {/* ═══ STOCK ═══ */}
        {tab === 'stock' && (() => {
          const [showAdd, setShowAdd] = useState(false);
          const [sf, setSf] = useState({ nom: '', categorie: '', quantite: '', seuil: '' });
          return <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Stock & Matériel ({stock.length})</h2>
              <button onClick={() => setShowAdd(!showAdd)} style={BTN}>{showAdd ? 'Annuler' : '+ Ajouter'}</button>
            </div>
            {showAdd && (
              <div style={{ ...CARD, marginBottom: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Article</label><input value={sf.nom} onChange={e => setSf(f => ({ ...f, nom: e.target.value }))} placeholder="Tube cuivre 22mm" style={INP} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Catégorie</label><input value={sf.categorie} onChange={e => setSf(f => ({ ...f, categorie: e.target.value }))} placeholder="Plomberie" style={INP} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Quantité</label><input type="number" value={sf.quantite} onChange={e => setSf(f => ({ ...f, quantite: e.target.value }))} style={INP} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Seuil alerte</label><input type="number" value={sf.seuil} onChange={e => setSf(f => ({ ...f, seuil: e.target.value }))} style={INP} /></div>
                <button onClick={() => { if (sf.nom) { setAeData(d => ({ ...d, stock: [...(d.stock || []), { id: Date.now(), ...sf, quantite: Number(sf.quantite), seuil: Number(sf.seuil) }] })); setSf({ nom: '', categorie: '', quantite: '', seuil: '' }); setShowAdd(false); } }} style={{ ...BTN, gridColumn: '1/-1' }}>Ajouter</button>
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
          </>;
        })()}

        {/* ═══ VÉHICULE ═══ */}
        {tab === 'vehicule' && (() => {
          const [vf, setVf] = useState(vehicule || { marque: '', modele: '', immat: '', km: '', prochainCT: '', prochaineVidange: '', assuranceExpire: '' });
          const sauverVehicule = () => { setAeData(d => ({ ...d, vehicule: { ...vf, km: Number(vf.km) } })); };
          return <>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Mon véhicule</h2>
            <div style={{ ...CARD, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Marque</label><input value={vf.marque} onChange={e => setVf(f => ({ ...f, marque: e.target.value }))} placeholder="Renault" style={INP} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Modèle</label><input value={vf.modele} onChange={e => setVf(f => ({ ...f, modele: e.target.value }))} placeholder="Master" style={INP} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Immatriculation</label><input value={vf.immat} onChange={e => setVf(f => ({ ...f, immat: e.target.value }))} placeholder="AB-123-CD" style={INP} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Kilométrage</label><input type="number" value={vf.km} onChange={e => setVf(f => ({ ...f, km: e.target.value }))} placeholder="85000" style={INP} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Prochain CT</label><input type="date" value={vf.prochainCT} onChange={e => setVf(f => ({ ...f, prochainCT: e.target.value }))} style={INP} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Prochaine vidange</label><input type="date" value={vf.prochaineVidange} onChange={e => setVf(f => ({ ...f, prochaineVidange: e.target.value }))} style={INP} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', display: 'block', marginBottom: 3 }}>Assurance expire le</label><input type="date" value={vf.assuranceExpire} onChange={e => setVf(f => ({ ...f, assuranceExpire: e.target.value }))} style={INP} /></div>
              </div>
              <button onClick={sauverVehicule} style={{ ...BTN, marginTop: 12, width: '100%' }}>Enregistrer</button>
            </div>
            {/* Alertes véhicule */}
            {vehicule && (() => {
              const today = new Date().toISOString().slice(0, 10);
              const alertes = [];
              if (vehicule.prochainCT && vehicule.prochainCT < today) alertes.push({ msg: 'Contrôle technique expiré !', color: '#DC2626' });
              else if (vehicule.prochainCT && new Date(vehicule.prochainCT) - new Date() < 30 * 86400000) alertes.push({ msg: `CT dans moins de 30 jours (${new Date(vehicule.prochainCT).toLocaleDateString('fr-FR')})`, color: '#D97706' });
              if (vehicule.assuranceExpire && vehicule.assuranceExpire < today) alertes.push({ msg: 'Assurance expirée !', color: '#DC2626' });
              if (vehicule.prochaineVidange && vehicule.prochaineVidange < today) alertes.push({ msg: 'Vidange à faire !', color: '#D97706' });
              return alertes.length > 0 ? <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {alertes.map((a, i) => <div key={i} style={{ ...CARD, borderLeft: `4px solid ${a.color}`, fontSize: 13, color: a.color, fontWeight: 600 }}>⚠️ {a.msg}</div>)}
              </div> : <div style={{ ...CARD, color: '#16A34A', fontSize: 13, fontWeight: 600 }}>✅ Véhicule à jour</div>;
            })()}
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
    </div>
  );
}
