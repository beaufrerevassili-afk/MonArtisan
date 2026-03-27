import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  IconBuilding, IconCalendar, IconAlert, IconCheck, IconPlus, IconX,
  IconRefresh, IconDocument, IconUser, IconTrendUp,
} from '../../components/ui/Icons';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatCur(n) {
  return Number(n || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function statutBadge(s) {
  const map = {
    en_cours:  { bg: '#E3F2FD', color: '#1565C0', label: 'En cours' },
    planifie:  { bg: '#FFF3CD', color: '#856404', label: 'Planifié' },
    termine:   { bg: '#D1F2E0', color: '#1A7F43', label: 'Terminé' },
    en_pause:  { bg: '#F2F2F7', color: '#6E6E73', label: 'En pause' },
  };
  const x = map[s] || map.planifie;
  return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: x.bg, color: x.color }}>{x.label}</span>;
}

function progressColor(pct) {
  if (pct >= 80) return '#34C759';
  if (pct < 30) return '#FF9500';
  return '#007AFF';
}

const TABS = ['Vue d\'ensemble', 'Liste', 'Gantt', 'Dépenses', 'Ajouter'];

export default function Chantiers() {
  const { token } = useAuth();
  const [tab, setTab] = useState('Vue d\'ensemble');
  const [chantiers, setChantiers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null); // chantier object to edit

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  async function fetchChantiers() {
    setLoading(true);
    try {
      const r = await fetch(`${API}/patron/chantiers`, { headers });
      const d = await r.json();
      setChantiers(d.chantiers || []);
      setStats(d.stats || {});
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  useEffect(() => { fetchChantiers(); }, []);

  /* ── Overview tab ── */
  function TabOverview() {
    const actifs = chantiers.filter(c => c.statut === 'en_cours');
    const alertesBudget = chantiers.filter(c => c.budgetReel && c.budgetPrevu && c.budgetReel > c.budgetPrevu * 1.1);
    const alertesRetard = chantiers.filter(c => c.statut === 'en_cours' && c.dateFin && new Date(c.dateFin) < new Date());

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* KPI cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
          {[
            { label: 'Total chantiers', value: chantiers.length, color: '#007AFF', Icon: IconBuilding },
            { label: 'En cours', value: stats.enCours || 0, color: '#007AFF', Icon: IconTrendUp },
            { label: 'Planifiés', value: stats.planifies || 0, color: '#FF9500', Icon: IconCalendar },
            { label: 'Terminés', value: stats.termines || 0, color: '#34C759', Icon: IconCheck },
            { label: 'Alertes budget', value: alertesBudget.length, color: '#FF3B30', Icon: IconAlert },
          ].map(k => (
            <div key={k.label} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `${k.color}18`, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
                <k.Icon size={16} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 5 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {(alertesBudget.length > 0 || alertesRetard.length > 0) && (
          <div style={{ background: '#FFE5E5', border: '1px solid rgba(255,59,48,0.3)', borderRadius: 12, padding: '14px 18px' }}>
            <div style={{ fontWeight: 700, color: '#C0392B', fontSize: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconAlert size={16} /> Alertes chantiers
            </div>
            {alertesBudget.map(c => (
              <div key={c.id} onClick={() => setEditModal(c)} style={{ fontSize: 13, color: '#C0392B', marginBottom: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>⚠ {c.nom} — Budget dépassé ({formatCur(c.budgetReel)} vs {formatCur(c.budgetPrevu)} prévu)</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>Voir →</span>
              </div>
            ))}
            {alertesRetard.map(c => (
              <div key={c.id} onClick={() => setEditModal(c)} style={{ fontSize: 13, color: '#C0392B', marginBottom: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>⚠ {c.nom} — Date de fin dépassée (prévu : {formatDate(c.dateFin)})</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>Voir →</span>
              </div>
            ))}
          </div>
        )}

        {/* Active chantiers grid */}
        {actifs.length > 0 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Chantiers actifs ({actifs.length})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {actifs.map(c => <ChantiersCard key={c.id} c={c} onUpdate={fetchChantiers} headers={headers} onEdit={() => setEditModal(c)} />)}
            </div>
          </div>
        )}

        {/* All others */}
        {chantiers.filter(c => c.statut !== 'en_cours').length > 0 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Autres chantiers</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {chantiers.filter(c => c.statut !== 'en_cours').map(c => <ChantiersCard key={c.id} c={c} onUpdate={fetchChantiers} headers={headers} onEdit={() => setEditModal(c)} />)}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── List tab ── */
  function TabListe() {
    return (
      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F2F2F7' }}>
              {['Chantier', 'Client', 'Statut', 'Avancement', 'Budget prévu', 'Budget réel', 'Dates', 'Équipe', ''].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chantiers.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: 40, textAlign: 'center', color: '#8E8E93' }}>Aucun chantier</td></tr>
            ) : chantiers.map((c, i) => {
              const ecart = c.budgetReel && c.budgetPrevu ? ((c.budgetReel - c.budgetPrevu) / c.budgetPrevu * 100) : 0;
              return (
                <tr key={c.id} style={{ borderBottom: '1px solid #F2F2F7', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600 }}>{c.nom}</td>
                  <td style={{ padding: '12px 14px', color: '#6E6E73' }}>{c.client || '—'}</td>
                  <td style={{ padding: '12px 14px' }}>{statutBadge(c.statut)}</td>
                  <td style={{ padding: '12px 14px', minWidth: 120 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, background: '#F2F2F7', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                        <div style={{ width: `${c.avancement || 0}%`, height: '100%', background: progressColor(c.avancement), borderRadius: 4, transition: 'width 0.4s' }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, color: progressColor(c.avancement), whiteSpace: 'nowrap' }}>{c.avancement || 0}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>{formatCur(c.budgetPrevu)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    {c.budgetReel ? (
                      <span style={{ color: ecart > 10 ? '#C0392B' : ecart > 0 ? '#856404' : '#1A7F43', fontWeight: 600 }}>
                        {formatCur(c.budgetReel)} {ecart !== 0 && <span style={{ fontSize: 11 }}>({ecart > 0 ? '+' : ''}{ecart.toFixed(0)}%)</span>}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: '#6E6E73', whiteSpace: 'nowrap' }}>
                    {formatDate(c.dateDebut)} → {formatDate(c.dateFin)}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {(c.equipe || []).slice(0, 3).map((m, j) => (
                        <span key={j} style={{ fontSize: 11, padding: '2px 7px', background: '#F2F2F7', borderRadius: 10 }}>{m}</span>
                      ))}
                      {(c.equipe || []).length > 3 && <span style={{ fontSize: 11, color: '#6E6E73' }}>+{c.equipe.length - 3}</span>}
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <button onClick={() => setEditModal(c)} style={{ padding: '5px 12px', border: '1px solid #E5E5EA', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#007AFF' }}>Modifier</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  /* ── Edit chantier modal ── */
  function EditModal() {
    const initEquipe = (editModal.equipe || []);
    const [ef, setEf] = useState({ ...editModal });
    const [equipeIds, setEquipeIds] = useState(
      // Try to match existing equipe names to roster
      DEMO_EMPLOYES_ROSTER.filter(e => initEquipe.some(n => n.toLowerCase().includes(e.nom.toLowerCase()))).map(e => e.id)
    );
    const [saving, setSaving] = useState(false);
    const [confirmAnnul, setConfirmAnnul] = useState(false);
    const [modalTab, setModalTab] = useState('infos'); // 'infos' | 'devis'
    const [devisLignes, setDevisLignes] = useState([
      { id: 1, description: '', quantite: 1, prixUnit: '', tva: 20 },
    ]);
    const [devisEnvoye, setDevisEnvoye] = useState(false);
    const [devisNumero] = useState(`DEV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`);

    function addLigne() {
      setDevisLignes(p => [...p, { id: Date.now(), description: '', quantite: 1, prixUnit: '', tva: 20 }]);
    }
    function removeLigne(id) {
      setDevisLignes(p => p.filter(l => l.id !== id));
    }
    function updateLigne(id, key, val) {
      setDevisLignes(p => p.map(l => l.id === id ? { ...l, [key]: val } : l));
    }
    const totalHT = devisLignes.reduce((s, l) => s + (Number(l.quantite) || 0) * (Number(l.prixUnit) || 0), 0);
    const totalTVA = devisLignes.reduce((s, l) => s + (Number(l.quantite) || 0) * (Number(l.prixUnit) || 0) * (Number(l.tva) || 0) / 100, 0);
    const totalTTC = totalHT + totalTVA;

    function handleEnvoyerDevis() {
      setDevisEnvoye(true);
    }
    const [filtreMetier, setFiltreMetier] = useState('');

    // Derive equipe names from selected IDs for the payload
    function getEquipeNoms() {
      return DEMO_EMPLOYES_ROSTER.filter(e => equipeIds.includes(e.id)).map(e => `${e.prenom} ${e.nom}`);
    }

    function toggleEmploye(id) {
      setEquipeIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    }

    // Filter employees: if filtreMetier set, show matching ones first
    const metiers = [...new Set(DEMO_EMPLOYES_ROSTER.map(e => e.metier))];
    const employesFiltres = filtreMetier
      ? [...DEMO_EMPLOYES_ROSTER.filter(e => e.metier === filtreMetier), ...DEMO_EMPLOYES_ROSTER.filter(e => e.metier !== filtreMetier)]
      : DEMO_EMPLOYES_ROSTER;

    async function handleSave(e) {
      e.preventDefault();
      setSaving(true);
      const payload = { ...ef, equipe: getEquipeNoms() };
      try {
        await fetch(`${API}/patron/chantiers/${ef.id}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
      } catch {}
      await fetchChantiers();
      setSaving(false);
      setEditModal(null);
    }

    async function handleAnnuler() {
      setSaving(true);
      try {
        await fetch(`${API}/patron/chantiers/${ef.id}`, { method: 'PUT', headers, body: JSON.stringify({ ...ef, equipe: getEquipeNoms(), statut: 'annule' }) });
      } catch {}
      await fetchChantiers();
      setSaving(false);
      setEditModal(null);
    }
    const fld = (k, type = 'text', ph = '') => (
      <input type={type} value={ef[k] || ''} onChange={e => setEf(p => ({ ...p, [k]: e.target.value }))} placeholder={ph} style={inp} />
    );
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setEditModal(null)}>
        <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 680, maxHeight: '90vh', overflowY: 'auto', padding: 28, position: 'relative' }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{ef.nom}</h2>
            <button onClick={() => setEditModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#8E8E93' }}>✕</button>
          </div>
          {/* Modal tabs */}
          <div style={{ display: 'flex', gap: 4, background: '#F2F2F7', borderRadius: 10, padding: 4, marginBottom: 20 }}>
            {[{ key: 'infos', label: 'Informations' }, { key: 'devis', label: 'Créer un devis' }].map(t => (
              <button key={t.key} type="button" onClick={() => setModalTab(t.key)} style={{ flex: 1, padding: '7px 0', border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600, background: modalTab === t.key ? '#fff' : 'transparent', color: modalTab === t.key ? '#1C1C1E' : '#6E6E73', boxShadow: modalTab === t.key ? '0 1px 4px rgba(0,0,0,0.10)' : 'none', transition: 'all 0.15s' }}>
                {t.label}{t.key === 'devis' && devisEnvoye ? ' ✓' : ''}
              </button>
            ))}
          </div>

          {/* Devis tab */}
          {modalTab === 'devis' && (
            <div>
              {devisEnvoye ? (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1A7F43', marginBottom: 8 }}>Devis envoyé !</h3>
                  <p style={{ fontSize: 14, color: '#6E6E73', marginBottom: 4 }}>Le devis <strong>{devisNumero}</strong> a été transmis à <strong>{ef.client || 'votre client'}</strong>.</p>
                  <p style={{ fontSize: 13, color: '#8E8E93' }}>Le client recevra une notification et pourra l'accepter depuis son espace.</p>
                  <button type="button" onClick={() => setDevisEnvoye(false)} style={{ marginTop: 20, padding: '10px 24px', border: '1px solid #E5E5EA', borderRadius: 10, background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                    Modifier le devis
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 12, color: '#8E8E93' }}>N° devis</div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>{devisNumero}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, color: '#8E8E93' }}>Client</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{ef.client || '—'}</div>
                    </div>
                  </div>

                  {/* Line items */}
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginBottom: 12 }}>
                    <thead>
                      <tr style={{ background: '#F8F8F8' }}>
                        <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#8E8E93', width: '40%' }}>Description</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#8E8E93', width: '10%' }}>Qté</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: '#8E8E93', width: '15%' }}>Prix HT</th>
                        <th style={{ padding: '8px 10px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#8E8E93', width: '10%' }}>TVA</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: '#8E8E93', width: '15%' }}>Total HT</th>
                        <th style={{ width: '10%' }} />
                      </tr>
                    </thead>
                    <tbody>
                      {devisLignes.map((l, i) => (
                        <tr key={l.id} style={{ borderBottom: '1px solid #F2F2F7' }}>
                          <td style={{ padding: '6px 8px' }}>
                            <input value={l.description} onChange={e => updateLigne(l.id, 'description', e.target.value)} placeholder="Prestation / fourniture" style={{ ...inp, padding: '5px 8px', fontSize: 12 }} />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input type="number" min="0.01" step="0.01" value={l.quantite} onChange={e => updateLigne(l.id, 'quantite', e.target.value)} style={{ ...inp, padding: '5px 8px', fontSize: 12, textAlign: 'center' }} />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input type="number" min="0" step="0.01" value={l.prixUnit} onChange={e => updateLigne(l.id, 'prixUnit', e.target.value)} placeholder="0.00" style={{ ...inp, padding: '5px 8px', fontSize: 12, textAlign: 'right' }} />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <select value={l.tva} onChange={e => updateLigne(l.id, 'tva', e.target.value)} style={{ ...inp, padding: '5px 8px', fontSize: 12 }}>
                              {[0, 5.5, 10, 20].map(t => <option key={t} value={t}>{t} %</option>)}
                            </select>
                          </td>
                          <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600 }}>
                            {((Number(l.quantite) || 0) * (Number(l.prixUnit) || 0)).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </td>
                          <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                            {devisLignes.length > 1 && (
                              <button type="button" onClick={() => removeLigne(l.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF3B30', fontSize: 16, lineHeight: 1 }}>✕</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button type="button" onClick={addLigne} style={{ fontSize: 13, color: '#007AFF', background: 'none', border: '1px dashed #007AFF', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontWeight: 600, marginBottom: 16 }}>
                    + Ajouter une ligne
                  </button>

                  {/* Totals */}
                  <div style={{ background: '#F8F9FA', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                    {[
                      { label: 'Total HT', value: totalHT },
                      { label: `TVA`, value: totalTVA },
                    ].map(r => (
                      <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <span style={{ color: '#6E6E73' }}>{r.label}</span>
                        <span>{r.value.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, borderTop: '1px solid #E5E5EA', paddingTop: 8, marginTop: 4 }}>
                      <span>Total TTC</span>
                      <span style={{ color: '#007AFF' }}>{totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</span>
                    </div>
                  </div>

                  <button type="button" onClick={handleEnvoyerDevis} disabled={totalTTC === 0}
                    style={{ width: '100%', padding: '12px 0', border: 'none', borderRadius: 10, background: totalTTC === 0 ? '#E5E5EA' : '#34C759', color: '#fff', cursor: totalTTC === 0 ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 15 }}>
                    Envoyer le devis au client
                  </button>
                </>
              )}
            </div>
          )}

          <form onSubmit={handleSave} style={{ display: modalTab === 'infos' ? 'block' : 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Nom du chantier *</label>{fld('nom', 'text', 'Rénovation façade')}</div>
              <div><label style={lbl}>Client</label>{fld('client', 'text', 'Nom du client')}</div>
              <div><label style={lbl}>Adresse du chantier</label>{fld('adresse', 'text', '12 rue…')}</div>
              <div>
                <label style={lbl}>Statut</label>
                <select value={ef.statut || 'planifie'} onChange={e => setEf(p => ({ ...p, statut: e.target.value }))} style={inp}>
                  <option value="planifie">Planifié</option>
                  <option value="en_cours">En cours</option>
                  <option value="en_pause">En pause</option>
                  <option value="termine">Terminé</option>
                </select>
              </div>
              <div><label style={lbl}>Avancement (%)</label><input type="range" min={0} max={100} value={ef.avancement || 0} onChange={e => setEf(p => ({ ...p, avancement: Number(e.target.value) }))} style={{ width: '100%' }} /><span style={{ fontSize: 13, fontWeight: 700, color: progressColor(ef.avancement) }}>{ef.avancement || 0}%</span></div>
              <div><label style={lbl}>Budget prévu (€)</label>{fld('budgetPrevu', 'number')}</div>
              <div><label style={lbl}>CA devis/facture TTC (€)</label>{fld('caDevis', 'number')}</div>
              <div><label style={lbl}>Date début</label>{fld('dateDebut', 'date')}</div>
              <div><label style={lbl}>Date fin prévue</label>{fld('dateFin', 'date')}</div>

              {/* Smart equipe picker */}
              <div style={{ gridColumn: '1/-1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={lbl}>Assigner l'équipe ({equipeIds.length} sélectionné{equipeIds.length > 1 ? 's' : ''})</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {['', ...metiers].map(m => (
                      <button key={m} type="button" onClick={() => setFiltreMetier(m)}
                        style={{ padding: '3px 10px', border: `1.5px solid ${filtreMetier === m ? '#007AFF' : '#E5E5EA'}`, borderRadius: 20, fontSize: 11, fontWeight: 600, background: filtreMetier === m ? '#EBF5FF' : '#fff', color: filtreMetier === m ? '#007AFF' : '#6E6E73', cursor: 'pointer' }}>
                        {m || 'Tous'}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {employesFiltres.map(emp => {
                    const selected = equipeIds.includes(emp.id);
                    const isMatch = !filtreMetier || emp.metier === filtreMetier;
                    return (
                      <div key={emp.id} onClick={() => toggleEmploye(emp.id)}
                        style={{ border: `2px solid ${selected ? '#007AFF' : isMatch && filtreMetier ? '#34C75940' : '#E5E5EA'}`, borderRadius: 12, padding: '10px 12px', cursor: 'pointer', background: selected ? '#EBF5FF' : isMatch && filtreMetier ? '#F0FDF4' : '#fff', transition: 'all 0.15s', opacity: emp.disponible ? 1 : 0.55 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1C1E' }}>{emp.prenom} {emp.nom}</div>
                            <div style={{ fontSize: 11, color: '#007AFF', fontWeight: 600, marginTop: 1 }}>{emp.metier}</div>
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                            {selected && <span style={{ fontSize: 10, background: '#007AFF', color: '#fff', padding: '1px 7px', borderRadius: 20, fontWeight: 700 }}>Assigné</span>}
                            {!emp.disponible && <span style={{ fontSize: 10, background: '#FF9500', color: '#fff', padding: '1px 7px', borderRadius: 20 }}>Indisponible</span>}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                          {emp.habilitations.map(h => (
                            <span key={h} style={{ fontSize: 9, background: '#F2F2F7', color: '#6E6E73', padding: '2px 6px', borderRadius: 20 }}>{h}</span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {equipeIds.length > 0 && (
                  <div style={{ marginTop: 8, padding: '8px 12px', background: '#F0FDF4', borderRadius: 8, fontSize: 12, color: '#1A7F43' }}>
                    Équipe : {getEquipeNoms().join(', ')}
                  </div>
                )}
              </div>

              <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Description / Notes</label><textarea value={ef.description || ''} onChange={e => setEf(p => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid #F2F2F7' }}>
              <button type="button" onClick={() => setConfirmAnnul(true)} style={{ padding: '9px 16px', border: 'none', borderRadius: 10, background: '#FFE5E5', color: '#C0392B', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                Annuler le chantier
              </button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setEditModal(null)} style={{ padding: '9px 20px', border: '1px solid #E5E5EA', borderRadius: 10, background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Fermer</button>
                <button type="submit" disabled={saving} style={{ padding: '9px 22px', border: 'none', borderRadius: 10, background: '#007AFF', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>{saving ? 'Enregistrement…' : 'Sauvegarder'}</button>
              </div>
            </div>
          </form>

          {/* Confirmation d'annulation */}
          {confirmAnnul && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: 28, maxWidth: 380, width: '100%', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
                <h3 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 700, color: '#1C1C1E' }}>Annuler le chantier ?</h3>
                <p style={{ fontSize: 14, color: '#6E6E73', marginBottom: 22, lineHeight: 1.6 }}>
                  Voulez-vous vraiment annuler le chantier <strong>"{ef.nom}"</strong> ? Le statut passera à "Annulé". Cette action peut être inversée manuellement.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                  <button onClick={() => setConfirmAnnul(false)} style={{ flex: 1, padding: '11px 0', border: '1px solid #E5E5EA', borderRadius: 10, background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                    Non, conserver
                  </button>
                  <button onClick={handleAnnuler} disabled={saving} style={{ flex: 1, padding: '11px 0', border: 'none', borderRadius: 10, background: '#FF3B30', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                    Oui, annuler
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Dépenses tab ── */
  function TabDepenses() {
    const [chantierId, setChantierId] = useState(chantiers[0]?.id || '');
    const [depenses, setDepenses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showCaEdit, setShowCaEdit] = useState(false);
    const [caDevis, setCaDevis] = useState('');
    const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], categorie: 'matériaux', montant: '', description: '', fournisseur: '', facture: '' });
    const [saving, setSaving] = useState(false);

    const chantier = chantiers.find(c => String(c.id) === String(chantierId));
    const totalDepenses = depenses.reduce((s, d) => s + (Number(d.montant) || 0), 0);
    const parCategorie = depenses.reduce((acc, d) => { acc[d.categorie] = (acc[d.categorie] || 0) + Number(d.montant); return acc; }, {});

    const CATS = ['matériaux', 'main-d\'oeuvre', 'équipement', 'sous-traitance', 'carburant', 'divers'];
    const CAT_COLORS = { 'matériaux': '#007AFF', 'main-d\'oeuvre': '#34C759', 'équipement': '#FF9500', 'sous-traitance': '#AF52DE', 'carburant': '#FF3B30', 'divers': '#8E8E93' };

    useEffect(() => {
      if (!chantierId) return;
      fetch(`${API}/patron/chantiers/${chantierId}/depenses`, { headers })
        .then(r => r.json()).then(d => setDepenses(d.depenses || DEMO_DEPENSES)).catch(() => setDepenses(DEMO_DEPENSES));
      const c = chantiers.find(x => String(x.id) === String(chantierId));
      if (c?.caDevis) setCaDevis(String(c.caDevis));
    }, [chantierId]);

    async function handleAdd(e) {
      e.preventDefault();
      setSaving(true);
      try {
        await fetch(`${API}/patron/chantiers/${chantierId}/depenses`, { method: 'POST', headers, body: JSON.stringify(form) });
        setDepenses(prev => [{ ...form, id: Date.now(), montant: Number(form.montant) }, ...prev]);
      } catch {
        setDepenses(prev => [{ ...form, id: Date.now(), montant: Number(form.montant) }, ...prev]);
      }
      setShowForm(false);
      setForm({ date: new Date().toISOString().split('T')[0], categorie: 'matériaux', montant: '', description: '', fournisseur: '', facture: '' });
      setSaving(false);
    }

    // Margin calculations
    const caVal = Number(caDevis) || 0;
    const margeEuros = caVal - totalDepenses;
    const margePct = caVal > 0 ? (margeEuros / caVal) * 100 : null;
    const margeColor = margePct === null ? '#8E8E93' : margePct >= 25 ? '#34C759' : margePct >= 10 ? '#FF9500' : '#FF3B30';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Chantier selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#6E6E73', flexShrink: 0 }}>Chantier :</label>
          <select value={chantierId} onChange={e => setChantierId(e.target.value)} style={{ flex: 1, maxWidth: 320, padding: '8px 12px', border: '1px solid #E5E5EA', borderRadius: 10, fontSize: 13, outline: 'none' }}>
            {chantiers.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
          </select>
          <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#007AFF', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13, flexShrink: 0 }}>
            <IconPlus size={13} /> Ajouter une dépense
          </button>
        </div>

        {/* Marge chantier header */}
        {chantier && (
          <div style={{ background: 'linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)', borderRadius: 16, padding: '22px 26px', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{chantier.nom}</div>
                <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>{chantier.client} — Marge chantier</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                {margePct !== null ? (
                  <div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: margeColor }}>{margePct.toFixed(1)}%</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>Marge brute</div>
                  </div>
                ) : (
                  <button onClick={() => setShowCaEdit(true)} style={{ background: '#007AFF', border: 'none', color: '#fff', borderRadius: 10, padding: '8px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>+ Saisir le CA</button>
                )}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
              {[
                { label: 'CA (devis/facture)', val: caVal, color: '#34C759', click: () => setShowCaEdit(true) },
                { label: 'Budget prévu', val: chantier.budgetPrevu, color: '#007AFF' },
                { label: 'Dépenses réelles', val: totalDepenses, color: totalDepenses > (chantier.budgetPrevu || 0) ? '#FF3B30' : '#FF9500' },
                { label: 'Reste budget', val: (chantier.budgetPrevu || 0) - totalDepenses, color: (chantier.budgetPrevu || 0) - totalDepenses < 0 ? '#FF3B30' : '#34C759' },
                { label: 'Marge brute', val: margeEuros, color: margeColor },
              ].map(k => (
                <div key={k.label} onClick={k.click} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px', cursor: k.click ? 'pointer' : 'default' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>{k.label}</div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: k.color }}>{formatCur(k.val)}</div>
                  {k.click && !caVal && <div style={{ fontSize: 10, color: '#007AFF', marginTop: 3 }}>Cliquer pour saisir</div>}
                </div>
              ))}
            </div>
            {/* Marge progress bar */}
            {margePct !== null && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.7, marginBottom: 6 }}>
                  <span>Coûts ({(100 - margePct).toFixed(1)}%)</span>
                  <span>Marge ({margePct.toFixed(1)}%)</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, Math.max(0, 100 - margePct))}%`, height: '100%', background: '#FF3B30', borderRadius: 4, transition: 'width 0.6s' }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* CA edit modal */}
        {showCaEdit && (
          <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.12)', border: '1px solid #E5E5EA' }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>CA du chantier (montant devis signé ou facturé)</h3>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={lbl}>Montant TTC (€)</label>
                <input type="number" step="0.01" value={caDevis} onChange={e => setCaDevis(e.target.value)} placeholder="Ex : 25000" style={inp} autoFocus />
              </div>
              <button onClick={() => setShowCaEdit(false)} style={{ padding: '9px 20px', background: '#007AFF', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, marginBottom: 0 }}>Valider</button>
              <button onClick={() => setShowCaEdit(false)} style={{ padding: '9px 16px', background: 'none', border: '1px solid #E5E5EA', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
            </div>
          </div>
        )}

        {/* Add form modal */}
        {showForm && (
          <div style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 2px 12px rgba(0,0,0,0.12)', border: '1px solid #E5E5EA' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Nouvelle dépense</h3>
            <form onSubmit={handleAdd}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={lbl}>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inp} />
                </div>
                <div>
                  <label style={lbl}>Catégorie</label>
                  <select value={form.categorie} onChange={e => setForm(p => ({ ...p, categorie: e.target.value }))} style={inp}>
                    {CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Montant (€) *</label>
                  <input type="number" required value={form.montant} onChange={e => setForm(p => ({ ...p, montant: e.target.value }))} placeholder="0.00" step="0.01" style={inp} />
                </div>
                <div>
                  <label style={lbl}>Fournisseur</label>
                  <input value={form.fournisseur} onChange={e => setForm(p => ({ ...p, fournisseur: e.target.value }))} placeholder="Nom du fournisseur" style={inp} />
                </div>
                <div>
                  <label style={lbl}>N° facture / bon</label>
                  <input value={form.facture || ''} onChange={e => setForm(p => ({ ...p, facture: e.target.value }))} placeholder="FAC-2025-001" style={inp} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Description *</label>
                  <input required value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Achat béton, location échafaudage…" style={inp} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 18px', border: '1px solid #E5E5EA', borderRadius: 10, background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
                <button type="submit" disabled={saving} style={{ padding: '8px 20px', border: 'none', borderRadius: 10, background: '#007AFF', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>{saving ? 'Ajout…' : 'Ajouter'}</button>
              </div>
            </form>
          </div>
        )}

        {/* Répartition par catégorie */}
        {depenses.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700 }}>Répartition par catégorie</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {Object.entries(parCategorie).map(([cat, total]) => (
                <div key={cat} style={{ background: `${CAT_COLORS[cat] || '#8E8E93'}15`, border: `1px solid ${CAT_COLORS[cat] || '#8E8E93'}30`, borderRadius: 10, padding: '10px 16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: CAT_COLORS[cat] || '#8E8E93', textTransform: 'capitalize', marginBottom: 4 }}>{cat}</div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{formatCur(total)}</div>
                  <div style={{ fontSize: 10, color: '#8E8E93', marginTop: 2 }}>{totalDepenses > 0 ? ((total / totalDepenses) * 100).toFixed(0) : 0}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #F2F2F7', fontWeight: 700, fontSize: 15 }}>Détail des dépenses ({depenses.length})</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F2F2F7' }}>
                {['Date', 'Catégorie', 'Description', 'Fournisseur', 'N° facture', 'Montant'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: h === 'Montant' ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: '#8E8E93' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {depenses.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 40, textAlign: 'center', color: '#8E8E93' }}>Aucune dépense enregistrée</td></tr>
              ) : depenses.map((d, i) => (
                <tr key={d.id || i} style={{ borderBottom: '1px solid #F8F8F8', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '10px 14px', color: '#6E6E73' }}>{formatDate(d.date)}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ padding: '2px 9px', borderRadius: 12, fontSize: 11, fontWeight: 700, background: `${CAT_COLORS[d.categorie] || '#8E8E93'}18`, color: CAT_COLORS[d.categorie] || '#8E8E93', textTransform: 'capitalize' }}>{d.categorie}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{d.description}</td>
                  <td style={{ padding: '10px 14px', color: '#6E6E73' }}>{d.fournisseur || '—'}</td>
                  <td style={{ padding: '10px 14px', color: '#8E8E93', fontSize: 12 }}>{d.facture || '—'}</td>
                  <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#FF3B30' }}>{formatCur(d.montant)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #E5E5EA', background: '#F8F9FA' }}>
                <td colSpan={5} style={{ padding: '10px 14px', fontWeight: 800, fontSize: 14 }}>TOTAL</td>
                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, fontSize: 16, color: '#FF3B30' }}>{formatCur(totalDepenses)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }

  /* ── Gantt tab ── */
  function TabGantt() {
    const now = new Date();
    const startRange = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endRange = new Date(now.getFullYear(), now.getMonth() + 4, 0);
    const totalDays = Math.ceil((endRange - startRange) / 86400000);

    function dayOffset(date) {
      return Math.max(0, Math.ceil((new Date(date) - startRange) / 86400000));
    }
    function dayWidth(d1, d2) {
      return Math.max(1, Math.ceil((new Date(d2) - new Date(d1)) / 86400000));
    }

    // Generate month headers
    const months = [];
    let cur = new Date(startRange);
    while (cur <= endRange) {
      months.push({ label: cur.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }), offset: dayOffset(cur), days: new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate() });
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }

    const todayOffset = dayOffset(now);
    const SCALE = 3; // px per day

    return (
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Planning Gantt — {new Date().getFullYear()}</h3>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: totalDays * SCALE + 200 }}>
            {/* Month headers */}
            <div style={{ display: 'flex', marginLeft: 200, borderBottom: '1px solid #F2F2F7' }}>
              {months.map((m, i) => (
                <div key={i} style={{ width: m.days * SCALE, flexShrink: 0, padding: '6px 8px', fontSize: 11, fontWeight: 600, color: '#6E6E73', borderRight: '1px solid #F2F2F7', background: '#FAFAFA' }}>{m.label}</div>
              ))}
            </div>

            {/* Chantier rows */}
            {chantiers.filter(c => c.dateDebut && c.dateFin).map((c, i) => {
              const left = dayOffset(c.dateDebut) * SCALE;
              const width = dayWidth(c.dateDebut, c.dateFin) * SCALE;
              const avPct = c.avancement || 0;
              const color = c.statut === 'termine' ? '#34C759' : c.statut === 'en_cours' ? '#007AFF' : '#FF9500';

              return (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #F8F8F8', height: 40 }}>
                  <div style={{ width: 200, flexShrink: 0, padding: '0 12px', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.nom}>{c.nom}</div>
                  <div style={{ position: 'relative', flex: 1, height: '100%', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                    {/* Today line */}
                    <div style={{ position: 'absolute', left: todayOffset * SCALE, top: 0, bottom: 0, width: 1, background: '#FF3B30', zIndex: 2 }} />
                    {/* Bar */}
                    <div style={{ position: 'absolute', left, top: 8, height: 24, width, background: `${color}30`, border: `1px solid ${color}`, borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${avPct}%`, background: color, opacity: 0.6 }} />
                      <span style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', fontSize: 10, fontWeight: 700, color, whiteSpace: 'nowrap' }}>
                        {c.nom.slice(0, 20)} ({avPct}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: '#8E8E93', display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 20, height: 2, background: '#FF3B30' }} /> Aujourd'hui
          <span style={{ marginLeft: 12 }}>Les barres pleines = avancement réel</span>
        </div>
      </div>
    );
  }

  /* ── Add chantier tab ── */
  function TabAjouter() {
    const [form, setForm] = useState({ nom: '', client: '', adresse: '', dateDebut: '', dateFin: '', budgetPrevu: '', statut: 'planifie', equipe: '', description: '' });
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);

    async function handleSubmit(e) {
      e.preventDefault();
      if (!form.nom.trim()) return;
      setSaving(true);
      try {
        await fetch(`${API}/patron/chantiers`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            ...form,
            budgetPrevu: Number(form.budgetPrevu),
            equipe: form.equipe.split(',').map(s => s.trim()).filter(Boolean),
          }),
        });
        await fetchChantiers();
        setDone(true);
        setTimeout(() => { setDone(false); setTab('Liste'); }, 1500);
      } catch (err) { console.error(err); }
      setSaving(false);
    }

    if (done) return (
      <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <IconCheck size={48} color="#34C759" />
        <p style={{ marginTop: 12, fontWeight: 700, fontSize: 16 }}>Chantier ajouté avec succès !</p>
      </div>
    );

    return (
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 14, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Nouveau chantier</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[
            { lbl: 'Nom du chantier *', key: 'nom', ph: 'Rénovation appartement Dupont' },
            { lbl: 'Client', key: 'client', ph: 'Jean Dupont' },
            { lbl: 'Adresse', key: 'adresse', ph: '12 rue des Fleurs, Lyon' },
            { lbl: 'Budget prévu (€)', key: 'budgetPrevu', ph: '25000', type: 'number' },
            { lbl: 'Date début', key: 'dateDebut', type: 'date' },
            { lbl: 'Date fin prévue', key: 'dateFin', type: 'date' },
          ].map(f => (
            <div key={f.key}>
              <label style={lbl}>{f.lbl}</label>
              <input type={f.type || 'text'} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} style={inp} required={f.key === 'nom'} />
            </div>
          ))}
          <div>
            <label style={lbl}>Statut initial</label>
            <select value={form.statut} onChange={e => setForm(p => ({ ...p, statut: e.target.value }))} style={inp}>
              <option value="planifie">Planifié</option>
              <option value="en_cours">En cours</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Équipe (noms séparés par virgule)</label>
            <input value={form.equipe} onChange={e => setForm(p => ({ ...p, equipe: e.target.value }))} placeholder="Martin, Durand, Petit" style={inp} />
          </div>
        </div>
        <div>
          <label style={lbl}>Description / Notes</label>
          <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description des travaux…" rows={3} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => setTab('Vue d\'ensemble')} style={{ padding: '9px 20px', border: '1px solid #E5E5EA', borderRadius: 10, background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Annuler</button>
          <button type="submit" disabled={saving} style={{ padding: '9px 24px', border: 'none', borderRadius: 10, background: '#007AFF', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
            {saving ? 'Enregistrement…' : 'Créer le chantier'}
          </button>
        </div>
      </form>
    );
  }

  const tabContent = {
    'Vue d\'ensemble': <TabOverview />,
    'Liste': <TabListe />,
    'Gantt': <TabGantt />,
    'Dépenses': <TabDepenses />,
    'Ajouter': <TabAjouter />,
  };

  return (
    <div style={{ padding: 28, maxWidth: 1200, margin: '0 auto' }}>
      {editModal && <EditModal />}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Chantiers</h1>
        <p style={{ color: '#6E6E73', marginTop: 4, fontSize: 14 }}>Suivi des chantiers · Budget · Planning · Dépenses</p>
      </div>

      <div style={{ display: 'flex', gap: 4, background: '#F2F2F7', borderRadius: 12, padding: 4, marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 18px', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.15s',
            background: tab === t ? '#fff' : 'transparent',
            color: tab === t ? '#1C1C1E' : '#6E6E73',
            boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
          }}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#8E8E93' }}>Chargement…</div>
      ) : tabContent[tab]}
    </div>
  );
}

/* ── Chantier card component ── */
function ChantiersCard({ c, onUpdate, headers, onEdit }) {

  const [updating, setUpdating] = useState(false);
  const [newPct, setNewPct] = useState(c.avancement || 0);
  const [showEdit, setShowEdit] = useState(false);

  const ecart = c.budgetReel && c.budgetPrevu ? ((c.budgetReel - c.budgetPrevu) / c.budgetPrevu * 100) : 0;
  const color = progressColor(c.avancement || 0);

  async function updateAvancement() {
    setUpdating(true);
    try {
      await fetch(`${API}/patron/chantiers/${c.id}/avancement`, {
        method: 'PUT', headers, body: JSON.stringify({ avancement: newPct }),
      });
      onUpdate();
      setShowEdit(false);
    } catch (e) { console.error(e); }
    setUpdating(false);
  }

  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'none'; }}
      onClick={onEdit}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{c.nom}</div>
          {c.client && <div style={{ fontSize: 13, color: '#6E6E73', marginTop: 2 }}>{c.client}</div>}
        </div>
        {statutBadge(c.statut)}
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
          <span style={{ color: '#6E6E73' }}>Avancement</span>
          <span style={{ fontWeight: 700, color }}>{c.avancement || 0}%</span>
        </div>
        <div style={{ background: '#F2F2F7', borderRadius: 6, height: 8, overflow: 'hidden' }}>
          <div style={{ width: `${c.avancement || 0}%`, height: '100%', background: color, borderRadius: 6, transition: 'width 0.4s' }} />
        </div>
      </div>

      {/* Budget + Marge */}
      <div style={{ display: 'grid', gridTemplateColumns: c.caDevis ? '1fr 1fr 1fr' : '1fr 1fr', gap: 10, marginBottom: 14, background: '#FAFAFA', borderRadius: 8, padding: '10px 12px' }}>
        <div>
          <div style={{ fontSize: 11, color: '#8E8E93', marginBottom: 2 }}>Budget prévu</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{formatCur(c.budgetPrevu)}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#8E8E93', marginBottom: 2 }}>Réel {ecart !== 0 && <span style={{ color: ecart > 10 ? '#C0392B' : '#856404' }}>({ecart > 0 ? '+' : ''}{ecart.toFixed(0)}%)</span>}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: ecart > 10 ? '#C0392B' : ecart > 0 ? '#856404' : '#1A7F43' }}>
            {c.budgetReel ? formatCur(c.budgetReel) : '—'}
          </div>
        </div>
        {c.caDevis && (() => {
          const marge = c.caDevis - (c.budgetReel || 0);
          const margePct = c.caDevis > 0 ? (marge / c.caDevis * 100) : 0;
          const mc = margePct >= 25 ? '#34C759' : margePct >= 10 ? '#FF9500' : '#FF3B30';
          return (
            <div>
              <div style={{ fontSize: 11, color: '#8E8E93', marginBottom: 2 }}>Marge</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: mc }}>{margePct.toFixed(0)}%</div>
              <div style={{ fontSize: 10, color: mc }}>{formatCur(marge)}</div>
            </div>
          );
        })()}
      </div>

      {/* Dates & team */}
      <div style={{ fontSize: 12, color: '#6E6E73', marginBottom: 12 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <IconCalendar size={12} /> {formatDate(c.dateDebut)} → {formatDate(c.dateFin)}
        </span>
      </div>

      {c.equipe?.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
          {c.equipe.map((m, i) => <span key={i} style={{ fontSize: 11, padding: '2px 8px', background: '#F2F2F7', borderRadius: 10 }}>{m}</span>)}
        </div>
      )}

      {/* Update avancement */}
      {c.statut === 'en_cours' && (
        showEdit ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
            <input type="range" min="0" max="100" step="5" value={newPct} onChange={e => setNewPct(Number(e.target.value))} style={{ flex: 1 }} />
            <span style={{ fontSize: 13, fontWeight: 600, minWidth: 36 }}>{newPct}%</span>
            <button onClick={updateAvancement} disabled={updating} style={{ padding: '5px 12px', background: '#007AFF', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              {updating ? '…' : 'OK'}
            </button>
            <button onClick={() => setShowEdit(false)} style={{ padding: '5px 8px', background: 'none', border: '1px solid #E5E5EA', borderRadius: 6, cursor: 'pointer' }}><IconX size={12} /></button>
          </div>
        ) : (
          <button onClick={e => { e.stopPropagation(); setShowEdit(true); }} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1px solid #E5E5EA', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: '#3C3C43' }}>
            <IconRefresh size={12} /> Mettre à jour l'avancement
          </button>
        )
      )}
    </div>
  );
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 4 };
const inp = { width: '100%', padding: '9px 12px', border: '1px solid #E5E5EA', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' };

/* Demo roster — in production, fetched from /rh/employes */
const DEMO_EMPLOYES_ROSTER = [
  { id: 'e1', nom: 'Martin', prenom: 'Jean', metier: 'Maçonnerie', habilitations: ['CACES R372', 'Travail en hauteur'], disponible: true },
  { id: 'e2', nom: 'Durand', prenom: 'Sophie', metier: 'Plomberie', habilitations: ['Habilitation électrique B1', 'Travail en hauteur'], disponible: true },
  { id: 'e3', nom: 'Petit', prenom: 'Marc', metier: 'Maçonnerie', habilitations: ['CACES R372', 'AIPR'], disponible: false },
  { id: 'e4', nom: 'Bernard', prenom: 'Claire', metier: 'Électricité', habilitations: ['Habilitation électrique B2', 'Habilitation électrique BR', 'Travail en hauteur'], disponible: true },
  { id: 'e5', nom: 'Moreau', prenom: 'Luc', metier: 'Carrelage', habilitations: ['Travail en hauteur'], disponible: true },
  { id: 'e6', nom: 'Leroy', prenom: 'Éric', metier: 'Plomberie', habilitations: ['AIPR', 'CACES R372'], disponible: false },
];

const DEMO_DEPENSES = [
  { id: 1, date: '2025-03-10', categorie: 'matériaux', description: 'Achat parpaings 20×20×50 (palette)', fournisseur: 'Point.P', montant: 1240 },
  { id: 2, date: '2025-03-12', categorie: 'équipement', description: 'Location nacelle 2 jours', fournisseur: 'Kiloutou', montant: 860 },
  { id: 3, date: '2025-03-15', categorie: 'main-d\'oeuvre', description: 'Intérimaire 3 jours', fournisseur: 'Manpower', montant: 720 },
  { id: 4, date: '2025-03-18', categorie: 'sous-traitance', description: 'Électricité — mise en conformité', fournisseur: 'Élec Pro 75', montant: 1800 },
  { id: 5, date: '2025-03-20', categorie: 'carburant', description: 'Carburant véhicule chantier', fournisseur: 'Total', montant: 95 },
];
