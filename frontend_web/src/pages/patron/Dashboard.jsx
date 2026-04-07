import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  IconFinance, IconMissions, IconTeam, IconAlert, IconCheck,
  IconTrendUp, IconDocument, IconBuilding, IconClock,
} from '../../components/ui/Icons';
import DevisFormulaire from '../../components/DevisFormulaire';
import AlertesInterModules from '../../components/rh/AlertesInterModules';

const SALARIES_DEMO = [
  { id: 's1', nom: 'Jean Martin',    poste: 'Maçon' },
  { id: 's2', nom: 'Sophie Durand',  poste: 'Plombier' },
  { id: 's3', nom: 'Marc Petit',     poste: 'Maçon' },
  { id: 's4', nom: 'Claire Bernard', poste: 'Électricien' },
  { id: 's5', nom: 'Luc Moreau',     poste: 'Carreleur' },
];

const ACTUALITES_DEMO = [
  { id: 'a1', type: 'devis',    client: 'Mme Dupont',    adresse: '12 rue de France, Nice',                description: 'Demande de devis — Rénovation cuisine complète', date: '2026-04-07', heure: '09:14', urgence: false, lu: false },
  { id: 'a2', type: 'mission',  client: 'SCI Horizon',   adresse: '5 rue Pasteur, Créteil',                description: 'Demande urgente — Fuite plomberie bureau', date: '2026-04-07', heure: '08:32', urgence: true,  lu: false },
  { id: 'a3', type: 'devis',    client: 'M. Martin',     adresse: '3 chemin des Vignes, Massy',            description: 'Demande de devis — Isolation toiture 120 m²', date: '2026-04-06', heure: '16:45', urgence: false, lu: true  },
  { id: 'a4', type: 'message',  client: 'Syndic Voltaire', adresse: '15 bd Voltaire, Paris 11e',           description: 'Message — Confirmation accès cave pour intervention', date: '2026-04-06', heure: '14:21', urgence: false, lu: true  },
  { id: 'a5', type: 'mission',  client: 'Mme Leroy',     adresse: '8 rue de la République, Antibes',       description: 'Demande de travaux — Salle de bain complète', date: '2026-04-05', heure: '11:08', urgence: false, lu: true  },
];

const ECHEANCES = [
  { label: 'TVA CA3',           date: '20 avr. 2026', montant: 2840, severity: 'high'   },
  { label: 'Charges URSSAF',    date: '5 mai 2026',   montant: 6120, severity: 'medium' },
  { label: 'Acompte IS',        date: '15 juin 2026', montant: 4200, severity: 'low'    },
];

const STOCK_ALERTS = [
  { materiau: 'Ciment CEM II 32.5', stock: 8,   seuil: 20, unite: 'sacs'   },
  { materiau: 'Sable fin 0/4',      stock: 0.5, seuil: 2,  unite: 'tonnes' },
];

const MOIS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const METRICS = [
  { key:'ca',             label:'CA',              color:'#5B5BD6' },
  { key:'masseSalariale', label:'Masse salariale',  color:'#FF9500' },
  { key:'frais',          label:'Frais',            color:'#AF52DE' },
  { key:'beneficeNet',    label:'Bénéfice net',     color:'#34C759' },
];
const MONTHLY_DATA = [
  { ca:6200,  masseSalariale:3600, frais:420,  beneficeNet:2180  },
  { ca:7800,  masseSalariale:3600, frais:380,  beneficeNet:3820  },
  { ca:5400,  masseSalariale:3800, frais:510,  beneficeNet:1090  },
  { ca:9100,  masseSalariale:3800, frais:460,  beneficeNet:4840  },
  { ca:8300,  masseSalariale:3900, frais:590,  beneficeNet:3810  },
  { ca:7600,  masseSalariale:3900, frais:350,  beneficeNet:3350  },
  { ca:6900,  masseSalariale:3700, frais:480,  beneficeNet:2720  },
  { ca:4200,  masseSalariale:3700, frais:290,  beneficeNet: 210  },
  { ca:8700,  masseSalariale:3900, frais:610,  beneficeNet:4190  },
  { ca:9300,  masseSalariale:4000, frais:520,  beneficeNet:4780  },
  { ca:8200,  masseSalariale:4000, frais:440,  beneficeNet:3760  },
  { ca:5700,  masseSalariale:3800, frais:380,  beneficeNet:1520  },
];

export default function DashboardPatron() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const [data,      setData]      = useState(null);
  const [chantiers, setChantiers] = useState([]);
  const [pipeline,  setPipeline]  = useState(null);
  const [alertes,   setAlertes]   = useState([]);
  const [finance,   setFinance]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [apiOk,     setApiOk]     = useState(false);
  const [actualites, setActualites] = useState(ACTUALITES_DEMO);
  const [showAllActu, setShowAllActu] = useState(false);
  const [selectedActu, setSelectedActu] = useState(null); // opened actualité
  const [devisActuMode, setDevisActuMode] = useState(false);
  const [devisActuLignes, setDevisActuLignes] = useState([{ description: '', quantite: 1, prixHT: '' }]);
  const [devisActuSoumis, setDevisActuSoumis] = useState(false);
  const [rdvActuMode, setRdvActuMode] = useState(false);
  const [rdvActuSoumis, setRdvActuSoumis] = useState(null); // null or { date, heureDebut, heureFin, salarie, note }
  const [rdvForm, setRdvForm] = useState({ date: '', heureDebut: '09:00', heureFin: '10:00', salarie: '', note: '' });

  const devisActuTotaux = (() => {
    const ht = devisActuLignes.reduce((s, l) => s + (parseFloat(l.prixHT) || 0) * (parseFloat(l.quantite) || 0), 0);
    return { ht, tva: ht * 0.2, ttc: ht * 1.2 };
  })();

  function ouvrirActu(a) {
    if (selectedActu?.id === a.id) {
      setSelectedActu(null); setDevisActuMode(false); setDevisActuSoumis(false);
      setRdvActuMode(false); setRdvActuSoumis(null);
      return;
    }
    setSelectedActu(a);
    setDevisActuMode(false); setDevisActuSoumis(false);
    setRdvActuMode(false); setRdvActuSoumis(null);
    setDevisActuLignes([{ description: '', quantite: 1, prixHT: '' }]);
    setRdvForm({ date: '', heureDebut: '09:00', heureFin: '10:00', salarie: '', note: '' });
    setActualites(p => p.map(x => x.id === a.id ? { ...x, lu: true } : x));
  }

  function soumettreDev() {
    setDevisActuSoumis(true);
    setDevisActuMode(false);
  }

  function soumettreRdv(e) {
    e.preventDefault();
    setRdvActuSoumis({ ...rdvForm });
    setRdvActuMode(false);
  }

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/patron'),
      api.get('/patron/chantiers'),
      api.get('/patron/pipeline'),
      api.get('/patron/alertes'),
      api.get('/finance/tableau-de-bord'),
    ]).then(([d, c, p, a, f]) => {
      setData(d.data);
      setChantiers(c.data.chantiers || []);
      setPipeline(p.data);
      setAlertes(a.data.alertes || []);
      setFinance(f.data);
      setApiOk(true);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding: 80 }}>
      <div className="spinner" style={{ width: 28, height: 28 }} />
    </div>
  );

  const prenom         = user?.nom?.split(' ')[0];
  const alertesHigh    = alertes.filter(a => a.severity === 'high');
  const chantierActifs = chantiers.filter(c => c.statut === 'en_cours');
  const caAnnuel       = finance?.ca_annuel               ?? 0;
  const caMensuel      = finance?.ca_mensuel_en_cours    ?? 0;
  const treso          = finance?.tresorerie             ?? 0;
  const benefice       = finance?.benefice_net           ?? 0;
  const margeNette     = caAnnuel > 0 ? Math.round(benefice / caAnnuel * 100) : 0;
  const impayees       = finance?.factures?.montant_en_attente ?? 0;
  const nbImpayees     = finance?.factures?.en_attente   ?? 0;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div>
          <h1>Tableau de bord ERP</h1>
          <p style={{ marginTop: 4 }}>Bienvenue, {prenom} — Vue d'ensemble de votre activité</p>
        </div>
        <span style={{ fontSize:'0.75rem', color:'var(--text-tertiary)', background:'var(--bg)', border:'1px solid var(--border-light)', borderRadius: 8, padding:'4px 12px' }}>
          {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* Bandeau démo quand API hors ligne */}
      {!apiOk && (
        <div style={{ background: '#FFF3CD', border: '1px solid #FFCA28', borderRadius: 10, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1rem' }}>⚠️</span>
          <span style={{ fontSize: '0.8125rem', color: '#7A5C00', fontWeight: 500 }}>
            Backend non connecté — les chiffres affichés ci-dessous sont à zéro. Connectez votre API pour voir vos vraies données.
          </span>
        </div>
      )}

      {/* Alertes inter-modules */}
      <AlertesInterModules />

      {/* Alertes critiques */}
      {alertesHigh.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap: 6 }}>
          {alertesHigh.map((a, i) => (
            <div key={i} onClick={() => a.lien && navigate(a.lien)} style={{ display:'flex', alignItems:'center', gap: 10, background:'var(--danger-light)', border:'1px solid rgba(255,59,48,0.2)', borderRadius: 10, padding:'10px 16px', cursor: a.lien ? 'pointer' : 'default' }}>
              <IconAlert size={14} color="var(--danger)" />
              <span style={{ fontSize:'0.8125rem', color:'var(--danger)', fontWeight: 500, flex: 1 }}>{a.msg}</span>
              {a.montant && <span style={{ fontWeight: 700, color:'var(--danger)' }}>{a.montant.toLocaleString('fr-FR')} €</span>}
              {a.lien && <span style={{ fontSize:'0.75rem', color:'var(--danger)', fontWeight: 600 }}>Voir →</span>}
            </div>
          ))}
        </div>
      )}

      {/* Fil d'actualités */}
      {(() => {
        const nonLus = actualites.filter(a => !a.lu).length;
        const affiches = showAllActu ? actualites : actualites.slice(0, 4);
        const typeConfig = {
          devis:   { label: 'Demande devis',  bg: '#EBF5FF', color: '#5B5BD6', dot: '#5B5BD6' },
          mission: { label: 'Nouvelle mission', bg: '#FFF0E5', color: '#E65100', dot: '#FF6F00' },
          message: { label: 'Message',         bg: '#F5F0FF', color: '#6200EA', dot: '#7C4DFF' },
        };
        return (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ margin: 0 }}>Actualités</h2>
                {nonLus > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 700, background: '#FF3B30', color: '#fff', borderRadius: 20, padding: '2px 8px' }}>{nonLus} nouveau{nonLus > 1 ? 'x' : ''}</span>
                )}
                {!apiOk && (
                  <span style={{ fontSize: 10, fontWeight: 700, background: '#FFB800', color: '#fff', borderRadius: 6, padding: '2px 7px', letterSpacing: 0.5 }}>DEMO</span>
                )}
              </div>
              <button onClick={() => setActualites(p => p.map(a => ({ ...a, lu: true })))}
                style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Tout marquer lu
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {affiches.map((a, i) => {
                const tc = typeConfig[a.type] || typeConfig.message;
                const isOpen = selectedActu?.id === a.id;
                return (
                  <div key={a.id}>
                    {/* Row */}
                    <div onClick={() => ouvrirActu(a)}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '12px 20px', borderBottom: (!isOpen && i < affiches.length - 1) ? '1px solid var(--border-light)' : 'none', background: isOpen ? '#F0F5FF' : a.lu ? '#fff' : '#FAFBFF', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = '#F5F7FF'; }}
                      onMouseLeave={e => { if (!isOpen) e.currentTarget.style.background = a.lu ? '#fff' : '#FAFBFF'; }}>
                      <div style={{ flexShrink: 0, width: 8, height: 8, borderRadius: '50%', background: a.lu ? '#C7C7CC' : tc.dot, marginTop: 6 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, background: tc.bg, color: tc.color, padding: '1px 8px', borderRadius: 20 }}>{tc.label}</span>
                          {a.urgence && <span style={{ fontSize: 11, fontWeight: 700, background: '#FFE5E5', color: '#FF3B30', padding: '1px 8px', borderRadius: 20 }}>Urgent</span>}
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>{a.heure} · {new Date(a.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: a.lu ? 400 : 600, color: 'var(--text)', margin: 0 }}>
                          {a.client} — {a.description}
                        </p>
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--text-tertiary)', flexShrink: 0, marginTop: 2 }}>{isOpen ? '▲' : '▼'}</span>
                    </div>

                    {/* Expanded panel */}
                    {isOpen && (
                      <div style={{ borderTop: '1px solid #E0EAFF', borderBottom: i < affiches.length - 1 ? '1px solid var(--border-light)' : 'none', background: '#F8FAFF', padding: '20px 24px' }}>

                        {/* Banners */}
                        {devisActuSoumis && (
                          <div style={{ background: '#D1F2E0', border: '1px solid #34C759', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#1A7F43', fontWeight: 600 }}>
                            ✓ Devis envoyé — le client pourra comparer toutes les offres reçues.
                          </div>
                        )}
                        {rdvActuSoumis && (
                          <div style={{ background: '#EBF5FF', border: '1px solid #5B5BD6', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#1565C0' }}>
                            <div style={{ fontWeight: 700, marginBottom: 6 }}>📅 Rendez-vous proposé au client</div>
                            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                              <span><strong>Date :</strong> {new Date(rdvActuSoumis.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                              <span><strong>Horaire :</strong> {rdvActuSoumis.heureDebut} – {rdvActuSoumis.heureFin}</span>
                              {rdvActuSoumis.salarie && <span><strong>Salarié :</strong> {rdvActuSoumis.salarie}</span>}
                            </div>
                            {rdvActuSoumis.note && <div style={{ marginTop: 6, fontSize: 12, color: '#1565C0', opacity: 0.85 }}>Note : {rdvActuSoumis.note}</div>}
                          </div>
                        )}

                        {/* Mission recap */}
                        {!devisActuMode && !rdvActuMode && (
                          <>
                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 12 }}>Récapitulatif de la demande</div>
                            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                              {[
                                { label: 'Client', value: a.client },
                                { label: 'Adresse', value: a.adresse || '—' },
                                { label: 'Type', value: tc.label },
                                { label: 'Date', value: `${a.heure} — ${new Date(a.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}` },
                                { label: 'Urgence', value: a.urgence ? '🔴 Urgent' : '🟢 Non urgent' },
                              ].map(f => (
                                <div key={f.label} style={{ background: '#fff', borderRadius: 10, padding: '10px 14px', border: '1px solid #E0EAFF' }}>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 }}>{f.label}</div>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{f.value}</div>
                                </div>
                              ))}
                            </div>
                            <div style={{ background: '#fff', borderRadius: 10, padding: '12px 14px', border: '1px solid #E0EAFF', marginBottom: 16 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 6 }}>Description</div>
                              <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, lineHeight: 1.6 }}>{a.description}</p>
                            </div>
                            {(a.type === 'devis' || a.type === 'mission') && (
                              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                {!devisActuSoumis && (
                                  <button onClick={() => setDevisActuMode(true)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                                    📄 Proposer un devis
                                  </button>
                                )}
                                {!rdvActuSoumis && (
                                  <button onClick={() => setRdvActuMode(true)}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#fff', color: '#5B5BD6', border: '2px solid #5B5BD6', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                                    📅 Proposer un rendez-vous
                                  </button>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {/* Devis form */}
                        {devisActuMode && (
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 4 }}>Créer un devis — {a.client}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 18 }}>{a.description}</div>
                            <DevisFormulaire
                              clientNom={a.client}
                              missionTitre={a.description}
                              compact={true}
                              onAnnuler={() => setDevisActuMode(false)}
                              onSoumettre={() => soumettreDev()}
                            />
                          </div>
                        )}

                        {/* RDV form */}
                        {rdvActuMode && (
                          <form onSubmit={soumettreRdv}>
                            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 14 }}>
                              📅 Proposer un rendez-vous — <span style={{ color: 'var(--primary)' }}>{a.client}</span>
                            </div>
                            <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                              <div style={{ gridColumn: '1/-1' }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Date *</label>
                                <input type="date" required value={rdvForm.date} onChange={e => setRdvForm(p => ({ ...p, date: e.target.value }))}
                                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'var(--card)', color: 'var(--text)' }} />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Heure début *</label>
                                <input type="time" required value={rdvForm.heureDebut} onChange={e => setRdvForm(p => ({ ...p, heureDebut: e.target.value }))}
                                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'var(--card)', color: 'var(--text)' }} />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Heure fin *</label>
                                <input type="time" required value={rdvForm.heureFin} onChange={e => setRdvForm(p => ({ ...p, heureFin: e.target.value }))}
                                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'var(--card)', color: 'var(--text)' }} />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Salarié assigné</label>
                                <select value={rdvForm.salarie} onChange={e => setRdvForm(p => ({ ...p, salarie: e.target.value }))}
                                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'var(--card)', color: 'var(--text)' }}>
                                  <option value="">— Non assigné —</option>
                                  {SALARIES_DEMO.map(s => (
                                    <option key={s.id} value={s.nom}>{s.nom} — {s.poste}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Note pour le client (optionnel)</label>
                              <textarea value={rdvForm.note} onChange={e => setRdvForm(p => ({ ...p, note: e.target.value }))} placeholder="Ex : Merci d'être présent sur place, accès par le portail latéral…" rows={2}
                                style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5, boxSizing: 'border-box', background: 'var(--card)', color: 'var(--text)' }} />
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                              <button type="button" onClick={() => setRdvActuMode(false)}
                                style={{ padding: '10px 20px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--card)', color: 'var(--text)', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                                Annuler
                              </button>
                              <button type="submit"
                                style={{ padding: '10px 22px', border: 'none', borderRadius: 10, background: '#5B5BD6', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                                Envoyer le rendez-vous
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {actualites.length > 4 && (
              <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border-light)', textAlign: 'center' }}>
                <button onClick={() => setShowAllActu(p => !p)} style={{ fontSize: 13, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  {showAllActu ? 'Réduire' : `Voir tout (${actualites.length})`}
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* Financial KPIs */}
      <div className="stats-grid">
        <KpiCard label="CA mensuel"   valeur={`${caMensuel.toLocaleString('fr-FR')} €`}       Icon={IconFinance}  color="blue"   sub={new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} />
        <KpiCard label="CA annuel"    valeur={`${caAnnuel.toLocaleString('fr-FR')} €`}        Icon={IconTrendUp}  color="green"  sub={`exercice ${new Date().getFullYear()}`} />
        <KpiCard label="Marge nette"  valeur={`${margeNette} %`}                               Icon={IconDocument} color="green"  sub={`${benefice.toLocaleString('fr-FR')} €`} />
        <KpiCard label="Trésorerie"   valeur={`${treso.toLocaleString('fr-FR')} €`}           Icon={IconFinance}  color={treso > 15000 ? 'green' : 'orange'} sub="solde bancaire" />
        <KpiCard label="Impayées"     valeur={`${impayees.toLocaleString('fr-FR')} €`}        Icon={IconAlert}    color="orange" sub={`${nbImpayees} factures`} />
        <KpiCard label="Devis signés" valeur={`${(pipeline?.stats?.ca_signe || 12100).toLocaleString('fr-FR')} €`} Icon={IconCheck} color="blue" sub={`taux conv. ${pipeline?.stats?.taux_conversion || 50}%`} />
      </div>

      {/* Multi-metric chart */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ marginBottom: 2 }}>Performance financière 2024</h2>
            <p style={{ fontSize: '0.75rem', color:'var(--text-tertiary)', margin: 0 }}>CA · Masse salariale · Frais · Bénéfice net</p>
          </div>
          <div style={{ display:'flex', gap: 14 }}>
            {METRICS.map(m => (
              <div key={m.key} style={{ display:'flex', alignItems:'center', gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: m.color }} />
                <span style={{ fontSize:'0.6875rem', color:'var(--text-secondary)', fontWeight: 500 }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart area */}
        {(() => {
          const maxV = Math.max(...MONTHLY_DATA.flatMap(m => [m.ca, m.masseSalariale, m.frais, m.beneficeNet]));
          const chartH = 120;
          const now = new Date().getMonth();
          return (
            <div style={{ position:'relative' }}>
              {/* Y-grid lines */}
              {[0, 33, 66, 100].map(pct => (
                <div key={pct} style={{ position:'absolute', left: 0, right: 0, bottom: 20 + pct / 100 * chartH, borderTop:'1px dashed #F2F2F7', zIndex: 0 }}>
                  <span style={{ fontSize: 8, color:'#C7C7CC', paddingLeft: 2 }}>{Math.round(pct / 100 * maxV / 1000)}k</span>
                </div>
              ))}
              <div style={{ display:'flex', gap: 4, alignItems:'flex-end', height: chartH + 20, position:'relative', zIndex: 1 }}>
                {MONTHLY_DATA.map((m, i) => (
                  <div key={i} style={{ flex: 1, display:'flex', flexDirection:'column', alignItems:'center', gap: 1 }}>
                    <div style={{ display:'flex', alignItems:'flex-end', gap: 1.5, height: chartH }}>
                      {METRICS.map(metric => {
                        const h = Math.max(2, Math.round((m[metric.key] / maxV) * chartH));
                        const isNow = i === now;
                        return (
                          <div
                            key={metric.key}
                            title={`${metric.label} ${MOIS[i]}: ${m[metric.key].toLocaleString('fr-FR')} €`}
                            style={{
                              width: 5,
                              height: h,
                              background: metric.color,
                              borderRadius:'2px 2px 0 0',
                              opacity: isNow ? 1 : 0.6,
                              transition:'height 0.3s',
                              boxShadow: isNow ? `0 0 0 1px ${metric.color}40` : 'none',
                            }}
                          />
                        );
                      })}
                    </div>
                    <span style={{ fontSize:'0.5rem', color: i === now ? 'var(--primary)' : 'var(--text-tertiary)', fontWeight: i === now ? 700 : 400, marginTop: 3 }}>
                      {MOIS[i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Bottom KPI row */}
        <div className="stats-grid" style={{ marginTop: 20, paddingTop: 16, borderTop:'1px solid var(--border-light)' }}>
          {METRICS.map(m => {
            const total = MONTHLY_DATA.reduce((s, d) => s + d[m.key], 0);
            const thisMonth = MONTHLY_DATA[new Date().getMonth()][m.key];
            return (
              <div key={m.key} style={{ textAlign:'center' }}>
                <div style={{ fontSize:'0.6875rem', color:'var(--text-tertiary)', marginBottom: 4, fontWeight: 500, textTransform:'uppercase', letterSpacing:'0.04em' }}>{m.label}</div>
                <div style={{ fontSize:'1rem', fontWeight: 800, color: m.color }}>{thisMonth.toLocaleString('fr-FR')} €</div>
                <div style={{ fontSize:'0.6875rem', color:'var(--text-tertiary)', marginTop: 2 }}>YTD : {total.toLocaleString('fr-FR')} €</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Raccourcis rapides + Stock */}
      <div className="grid-2" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16 }}>

        {/* Raccourcis */}
        <div className="card" style={{ padding:'20px' }}>
          <h2 style={{ marginBottom: 14 }}>Accès rapide</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 8 }}>
            {[
              { label:'Chantiers en cours', count:`${chantierActifs.length}`, path:'/patron/missions', color:'var(--primary)' },
              { label:'Pipeline commercial', count:`${pipeline?.stats?.nb_prospects || 3} prospects`, path:'/patron/clients-rfm', color:'var(--success)' },
              { label:'Factures impayées', count:`${nbImpayees}`, path:'/patron/finance?onglet=facturation', color:'var(--danger)' },
              { label:'Échéances fiscales', count:`${ECHEANCES.length}`, path:'/patron/finance?onglet=urssaf', color:'var(--warning)' },
            ].map(r => (
              <div key={r.label} onClick={() => navigate(r.path)} style={{ padding:'12px 14px', background:'var(--bg)', borderRadius: 10, cursor:'pointer', border:'1px solid var(--border-light)', transition:'all .15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = r.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-light)'}>
                <div style={{ fontSize:'0.8125rem', fontWeight: 600, color:'var(--text)' }}>{r.label}</div>
                <div style={{ fontSize:'1.125rem', fontWeight: 700, color: r.color, marginTop: 2 }}>{r.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Alertes stock */}
        <div className="card" style={{ padding:'14px 20px', cursor:'pointer' }} onClick={() => navigate('/patron/stock')}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 10 }}>
            <p style={{ fontWeight: 600, fontSize:'0.875rem', margin: 0 }}>Alertes stock</p>
            <span style={{ fontSize:'0.75rem', color:'var(--primary)', fontWeight: 600 }}>Voir le stock →</span>
          </div>
          {STOCK_ALERTS.map((s, i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', marginBottom: i < STOCK_ALERTS.length - 1 ? 7 : 0 }}>
              <span style={{ fontSize:'0.8125rem', color:'var(--text-secondary)' }}>{s.materiau}</span>
              <span style={{ fontSize:'0.8125rem', fontWeight: 600, color: s.stock < s.seuil * 0.3 ? 'var(--danger)' : 'var(--warning)' }}>
                {s.stock} {s.unite} / seuil {s.seuil}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, valeur, Icon, color = 'blue', sub }) {
  const colors = {
    blue:   { bg:'var(--primary-light)', fg:'var(--primary)' },
    green:  { bg:'var(--success-light)', fg:'#1A7A3C'        },
    orange: { bg:'var(--warning-light)', fg:'#7A5C00'        },
    red:    { bg:'var(--danger-light)',  fg:'var(--danger)'  },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className="stat-card">
      <div style={{ width: 34, height: 34, borderRadius: 9, background: c.bg, color: c.fg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom: 12 }}>
        <Icon size={16} />
      </div>
      <p style={{ fontSize:'1.25rem', fontWeight: 700, color:'var(--text)', letterSpacing:'-0.025em', lineHeight: 1 }}>{valeur}</p>
      <p style={{ fontSize:'0.8125rem', color:'var(--text-secondary)', marginTop: 5 }}>{label}</p>
      {sub && <p style={{ fontSize:'0.6875rem', color:'var(--text-tertiary)', marginTop: 2 }}>{sub}</p>}
    </div>
  );
}
