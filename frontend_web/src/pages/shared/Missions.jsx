import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { IconMissions, IconCheck, IconX, IconChevronRight, IconMapPin, IconCalendar, IconTeam, IconPlus, IconUser } from '../../components/ui/Icons';
import DevisFormulaire from '../../components/DevisFormulaire';

const STATUTS = ['', 'en_attente', 'assignee', 'en_cours', 'terminee', 'annulee'];
const LABELS = { '': 'Toutes', en_attente: 'En attente', assignee: 'Assignées', en_cours: 'En cours', terminee: 'Terminées', annulee: 'Annulées' };

const STATUT_MAP = {
  en_attente: { cls: 'badge badge-yellow', label: 'En attente' },
  assignee:   { cls: 'badge badge-blue',   label: 'Assignée'   },
  en_cours:   { cls: 'badge badge-green',  label: 'En cours'   },
  terminee:   { cls: 'badge badge-gray',   label: 'Terminée'   },
  annulee:    { cls: 'badge badge-red',    label: 'Annulée'    },
};

const PRIORITE_MAP = {
  urgente: { cls: 'badge badge-red', label: 'Urgente' },
  haute:   { cls: 'badge',          label: 'Haute', style: { background: '#FFF3E0', color: '#E65100' } },
};

/* Demo employees & vehicles */
const EMPLOYES_DEMO = [
  { id: 1, nom: 'Pierre Martin', poste: 'Maçon', telephone: '06 11 22 33 44' },
  { id: 2, nom: 'Jacques Durand', poste: 'Électricien', telephone: '06 55 66 77 88' },
  { id: 3, nom: 'Sophie Petit', poste: 'Plombier', telephone: '06 99 00 11 22' },
  { id: 4, nom: 'Marc Bernard', poste: 'Chef de chantier', telephone: '06 33 44 55 66' },
];

const VEHICULES_DEMO = [
  { id: 1, immatriculation: 'AB-123-CD', modele: 'Renault Trafic', type: 'Utilitaire', capacite: '1 tonne' },
  { id: 2, immatriculation: 'EF-456-GH', modele: 'Citroën Berlingo', type: 'Fourgonnette', capacite: '700 kg' },
  { id: 3, immatriculation: 'IJ-789-KL', modele: 'Mercedes Sprinter', type: 'Grand utilitaire', capacite: '2 tonnes' },
];

export default function Missions() {
  const { user } = useAuth();
  const [missions, setMissions] = useState([]);
  const [filtre, setFiltre] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null); // mission id to cancel

  useEffect(() => { charger(); }, [filtre]);

  async function charger() {
    setLoading(true);
    try {
      const { data } = await api.get('/missions', { params: filtre ? { statut: filtre } : {} });
      setMissions(data.missions);
    } catch (e) {
      // Demo fallback
      setMissions(DEMO_MISSIONS);
    }
    setLoading(false);
  }

  async function changerStatut(id, statut) {
    try {
      await api.put(`/missions/${id}/statut`, { statut });
    } catch {}
    setMissions(prev => prev.map(m => m.id === id ? { ...m, statut } : m));
    if (selectedMission?.id === id) setSelectedMission(prev => ({ ...prev, statut }));
    charger();
  }

  function openMission(m) {
    setSelectedMission({ ...m, employes: m.employes || [], vehicule: m.vehicule || null });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1>Missions</h1>
          <p style={{ marginTop: 4 }}>Suivi et gestion de toutes vos missions</p>
        </div>
        <div style={{ background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 8, padding: '6px 14px', fontSize: '0.875rem', fontWeight: 600 }}>
          {missions.length} missions
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {STATUTS.map(s => (
          <button key={s} onClick={() => setFiltre(s)} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: '0.8125rem', fontWeight: 500,
            border: filtre === s ? 'none' : '1px solid var(--border)',
            background: filtre === s ? 'var(--primary)' : 'var(--card)',
            color: filtre === s ? '#fff' : 'var(--text-secondary)',
            cursor: 'pointer', transition: 'var(--transition)',
          }}>
            {LABELS[s]}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" style={{ width: 28, height: 28 }} />
        </div>
      ) : missions.length === 0 ? (
        <div className="card" style={{ padding: 60 }}>
          <div className="empty-state">
            <IconMissions size={32} className="empty-state-icon" />
            <p className="empty-state-text">Aucune mission pour ce filtre</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {missions.map(m => {
            const sm = STATUT_MAP[m.statut];
            const pm = PRIORITE_MAP[m.priorite];
            return (
              <div key={m.id} className="card" style={{ padding: '18px 20px', transition: 'var(--transition)', cursor: 'pointer' }}
                onClick={() => openMission(m)}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.titre}
                      </h3>
                      {pm && <span className={pm.cls} style={pm.style}>{pm.label}</span>}
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {m.description}
                    </p>
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                      {m.categorie && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}><IconMapPin size={12} /> {m.categorie}</span>}
                      {m.dateDebut && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}><IconCalendar size={12} /> {m.dateDebut}</span>}
                      {m.employes?.length > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: 'var(--text-tertiary)' }}><IconTeam size={12} /> {m.employes.length} employé{m.employes.length > 1 ? 's' : ''}</span>}
                      {m.vehicule && <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>🚐 {m.vehicule.immatriculation}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>{m.budget?.toLocaleString('fr-FR')} €</span>
                    <span className={sm?.cls || 'badge badge-gray'}>{sm?.label || m.statut}</span>
                  </div>
                </div>

                {/* Actions patron */}
                {(user?.role === 'patron' || user?.role === 'super_admin') && m.statut !== 'terminee' && m.statut !== 'annulee' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-light)', flexWrap: 'wrap' }}
                    onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => openMission(m)}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 600 }}
                    >
                      <IconTeam size={13} /> Gérer la mission
                    </button>
                    {m.statut === 'en_attente' && (
                      <button className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '6px 14px' }} onClick={() => changerStatut(m.id, 'assignee')}>
                        Assigner <IconChevronRight size={13} />
                      </button>
                    )}
                    {m.statut === 'assignee' && (
                      <button className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '6px 14px' }} onClick={() => changerStatut(m.id, 'en_cours')}>
                        Démarrer <IconChevronRight size={13} />
                      </button>
                    )}
                    {m.statut === 'en_cours' && (
                      <button className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '6px 14px' }} onClick={() => changerStatut(m.id, 'terminee')}>
                        <IconCheck size={13} /> Terminer
                      </button>
                    )}
                    <button className="btn-danger" style={{ fontSize: '0.8125rem', padding: '6px 14px', marginLeft: 'auto' }} onClick={() => setConfirmCancel(m.id)}>
                      <IconX size={13} /> Annuler
                    </button>
                  </div>
                )}

                {/* Actions artisan */}
                {user?.role === 'artisan' && m.artisanId === user.id && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-light)' }}
                    onClick={e => e.stopPropagation()}>
                    {m.statut === 'assignee' && (
                      <button className="btn-primary" style={{ fontSize: '0.8125rem', padding: '6px 14px' }} onClick={() => changerStatut(m.id, 'en_cours')}>
                        Arriver sur chantier
                      </button>
                    )}
                    {m.statut === 'en_cours' && (
                      <button className="btn-secondary" style={{ fontSize: '0.8125rem', padding: '6px 14px' }} onClick={() => changerStatut(m.id, 'terminee')}>
                        <IconCheck size={13} /> Quitter le chantier
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm cancel dialog */}
      {confirmCancel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--card)', borderRadius: 18, padding: '32px 28px', maxWidth: 380, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 16 }}>⚠️</div>
            <h3 style={{ margin: '0 0 10px', textAlign: 'center', fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>Annuler cette mission ?</h3>
            <p style={{ margin: '0 0 24px', textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Cette action est irréversible. La mission sera marquée comme annulée et ne pourra plus être modifiée.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmCancel(null)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                Non, garder
              </button>
              <button onClick={() => { changerStatut(confirmCancel, 'annulee'); setConfirmCancel(null); }} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', background: '#FF3B30', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Oui, annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mission detail panel */}
      {selectedMission && (
        <MissionDetailPanel
          mission={selectedMission}
          onClose={() => setSelectedMission(null)}
          onUpdate={(updated) => {
            setMissions(prev => prev.map(m => m.id === updated.id ? updated : m));
            setSelectedMission(updated);
          }}
          onStatut={changerStatut}
          onCancel={(id) => setConfirmCancel(id)}
        />
      )}
    </div>
  );
}

/* ── Mission Detail Panel ── */
const LIGNE_DEVIS_VIDE = { description: '', quantite: 1, prixHT: '' };

function MissionDetailPanel({ mission, onClose, onUpdate, onStatut, onCancel }) {
  const { user } = useAuth();
  const [m, setM] = useState({ ...mission, employes: mission.employes || [], vehicule: mission.vehicule || null });
  const [activeTab, setActiveTab] = useState('details');
  const [showAddEmploye, setShowAddEmploye] = useState(false);
  const [showAddVehicule, setShowAddVehicule] = useState(false);
  const [employes, setEmployes] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [notes, setNotes] = useState(mission.notesPatron || '');
  // Devis workflow (en_attente missions)
  const [devisMode, setDevisMode] = useState(false);
  const [devisLignes, setDevisLignes] = useState([{ ...LIGNE_DEVIS_VIDE }]);
  const [devisEnvoye, setDevisEnvoye] = useState(false);
  const sm = STATUT_MAP[m.statut];

  const isPatron = user?.role === 'patron' || user?.role === 'super_admin';

  const devisTotaux = (() => {
    const ht = devisLignes.reduce((s, l) => s + (parseFloat(l.prixHT) || 0) * (parseFloat(l.quantite) || 0), 0);
    const tva = ht * 0.2;
    return { ht, tva, ttc: ht + tva };
  })();

  function envoyerDevis() {
    setDevisEnvoye(true);
    setDevisMode(false);
  }

  useEffect(() => {
    // Fetch employees (fallback to demo)
    fetch(import.meta.env.VITE_API_URL + '/rh/employes', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => r.json()).then(d => setEmployes(d.employes || EMPLOYES_DEMO)).catch(() => setEmployes(EMPLOYES_DEMO));
    // Fetch vehicles (fallback to demo)
    fetch(import.meta.env.VITE_API_URL + '/rh/vehicules', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
      .then(r => r.json()).then(d => setVehicules(d.vehicules || VEHICULES_DEMO)).catch(() => setVehicules(VEHICULES_DEMO));
  }, []);

  function addEmploye(emp) {
    if (m.employes.find(e => e.id === emp.id)) return;
    const updated = { ...m, employes: [...m.employes, emp] };
    setM(updated);
    onUpdate(updated);
    setShowAddEmploye(false);
  }

  function removeEmploye(id) {
    const updated = { ...m, employes: m.employes.filter(e => e.id !== id) };
    setM(updated);
    onUpdate(updated);
  }

  function assignVehicule(v) {
    const updated = { ...m, vehicule: v };
    setM(updated);
    onUpdate(updated);
    setShowAddVehicule(false);
  }

  function removeVehicule() {
    const updated = { ...m, vehicule: null };
    setM(updated);
    onUpdate(updated);
  }

  function saveNotes() {
    const updated = { ...m, notesPatron: notes };
    setM(updated);
    onUpdate(updated);
  }

  const TABS = ['details', 'equipe', 'vehicule', 'notes'];
  const TAB_LABELS = { details: 'Détails', equipe: 'Équipe', vehicule: 'Véhicule', notes: 'Notes' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}>
      <div style={{ background: 'var(--card)', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 720, maxHeight: '90vh', overflowY: 'auto', padding: '28px 28px 40px' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>{m.titre}</h2>
              <span className={sm?.cls || 'badge badge-gray'}>{sm?.label || m.statut}</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {m.categorie && <span style={{ marginRight: 12 }}>📍 {m.categorie}</span>}
              {m.dateDebut && <span>📅 {m.dateDebut}</span>}
              {m.budget && <span style={{ marginLeft: 12, fontWeight: 700, color: 'var(--primary)' }}>{m.budget?.toLocaleString('fr-FR')} €</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--text-secondary)', flexShrink: 0, padding: '0 4px' }}>×</button>
        </div>

        {/* Devis envoyé banner */}
        {devisEnvoye && (
          <div style={{ background: '#D1F2E0', border: '1px solid #34C759', borderRadius: 10, padding: '10px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#1A7F43', fontWeight: 600 }}>
            <IconCheck size={14} /> Devis envoyé — le client peut maintenant le comparer avec d'autres offres.
          </div>
        )}

        {/* Statut actions */}
        {m.statut !== 'terminee' && m.statut !== 'annulee' && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {/* Patron en_attente: accept or send quote */}
              {isPatron && m.statut === 'en_attente' && (
                <>
                  <button onClick={() => { onStatut(m.id, 'assignee'); const updated = { ...m, statut: 'assignee' }; setM(updated); }} className="btn-primary" style={{ fontSize: 13 }}>
                    <IconCheck size={13} /> Accepter la mission
                  </button>
                  <button
                    onClick={() => setDevisMode(v => !v)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: devisMode ? '#FF950015' : '#F2F2F7', color: devisMode ? '#E65100' : 'var(--text)', border: `1px solid ${devisMode ? '#FF9500' : 'var(--border)'}`, borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    📄 {devisMode ? 'Masquer le devis' : 'Envoyer un devis'}
                  </button>
                </>
              )}
              {(!isPatron || m.statut !== 'en_attente') && m.statut === 'en_attente' && <button onClick={() => onStatut(m.id, 'assignee')} className="btn-secondary" style={{ fontSize: 13 }}>Assigner →</button>}
              {m.statut === 'assignee' && <button onClick={() => onStatut(m.id, 'en_cours')} className="btn-primary" style={{ fontSize: 13 }}>Démarrer →</button>}
              {m.statut === 'en_cours' && <button onClick={() => onStatut(m.id, 'terminee')} className="btn-secondary" style={{ fontSize: 13 }}><IconCheck size={13} /> Terminer</button>}
              <button onClick={() => onCancel ? onCancel(m.id) : onStatut(m.id, 'annulee')} className="btn-danger" style={{ fontSize: 13, marginLeft: 'auto' }}><IconX size={13} /> Annuler la mission</button>
            </div>

            {/* Inline devis form — méthodologie DevisPro */}
            {devisMode && (
              <div style={{ marginTop: 16 }}>
                <DevisFormulaire
                  clientNom={m.client || ''}
                  missionTitre={m.titre || ''}
                  compact={true}
                  onAnnuler={() => setDevisMode(false)}
                  onSoumettre={envoyerDevis}
                />
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, background: 'var(--bg)', borderRadius: 10, padding: 3, marginBottom: 20 }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              flex: 1, padding: '7px 12px', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: activeTab === t ? 'var(--card)' : 'transparent',
              color: activeTab === t ? 'var(--text)' : 'var(--text-secondary)',
              boxShadow: activeTab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}>{TAB_LABELS[t]}</button>
          ))}
        </div>

        {/* Tab: Détails */}
        {activeTab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '16px 18px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Description</div>
              <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{m.description || 'Aucune description'}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'Statut', value: sm?.label || m.statut },
                { label: 'Budget', value: `${m.budget?.toLocaleString('fr-FR')} €` },
                { label: 'Date début', value: m.dateDebut || '—' },
                { label: 'Date fin', value: m.dateFin || '—' },
                { label: 'Client', value: m.client || '—' },
                { label: 'Adresse', value: m.adresse || m.categorie || '—' },
              ].map(f => (
                <div key={f.label} style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 }}>{f.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Équipe */}
        {activeTab === 'equipe' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Employés assignés ({m.employes.length})</div>
              <button onClick={() => setShowAddEmploye(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                <IconPlus size={13} /> Ajouter
              </button>
            </div>

            {m.employes.length === 0 ? (
              <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 30, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
                Aucun employé assigné. Cliquez sur "Ajouter" pour assigner des membres.
              </div>
            ) : (
              m.employes.map(emp => (
                <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg)', borderRadius: 12, padding: '12px 16px' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#007AFF20', color: '#007AFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                    {emp.nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{emp.nom}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{emp.poste} {emp.telephone ? `— ${emp.telephone}` : ''}</div>
                  </div>
                  <button onClick={() => removeEmploye(emp.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#FF3B30', padding: 6 }}>
                    <IconX size={14} />
                  </button>
                </div>
              ))
            )}

            {/* Add employee picker */}
            {showAddEmploye && (
              <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Sélectionner un employé</span>
                  <button onClick={() => setShowAddEmploye(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>×</button>
                </div>
                {employes.filter(e => !m.employes.find(me => me.id === e.id)).map(emp => (
                  <button key={emp.id} onClick={() => addEmploye(emp)} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: 'none', border: 'none', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#007AFF20', color: '#007AFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12 }}>
                      {emp.nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{emp.nom}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{emp.poste}</div>
                    </div>
                    <IconPlus size={14} style={{ marginLeft: 'auto', color: 'var(--primary)' }} />
                  </button>
                ))}
                {employes.filter(e => !m.employes.find(me => me.id === e.id)).length === 0 && (
                  <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>Tous les employés sont déjà assignés</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab: Véhicule */}
        {activeTab === 'vehicule' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Véhicule assigné</div>
              {!m.vehicule && (
                <button onClick={() => setShowAddVehicule(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  <IconPlus size={13} /> Assigner un véhicule
                </button>
              )}
            </div>

            {m.vehicule ? (
              <div style={{ background: 'var(--bg)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 50, height: 50, borderRadius: 12, background: '#34C75918', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>🚐</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{m.vehicule.immatriculation}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{m.vehicule.modele} — {m.vehicule.type}</div>
                  {m.vehicule.capacite && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>Capacité : {m.vehicule.capacite}</div>}
                </div>
                <button onClick={removeVehicule} style={{ background: 'none', border: '1px solid #FF3B30', borderRadius: 8, cursor: 'pointer', color: '#FF3B30', padding: '6px 12px', fontSize: 13, fontWeight: 600 }}>
                  Retirer
                </button>
              </div>
            ) : (
              <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 30, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14 }}>
                Aucun véhicule assigné
              </div>
            )}

            {showAddVehicule && (
              <div style={{ background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>Sélectionner un véhicule</span>
                  <button onClick={() => setShowAddVehicule(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>×</button>
                </div>
                {vehicules.map(v => (
                  <button key={v.id} onClick={() => assignVehicule(v)} style={{ width: '100%', textAlign: 'left', padding: '14px 16px', background: 'none', border: 'none', borderBottom: '1px solid var(--border-light)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'} onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                    <span style={{ fontSize: 22 }}>🚐</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>{v.immatriculation} — {v.modele}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{v.type} · {v.capacite}</div>
                    </div>
                    <IconChevronRight size={14} style={{ color: 'var(--primary)' }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Notes */}
        {activeTab === 'notes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Notes patron (internes)</div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={8}
              placeholder="Notes internes sur cette mission : difficultés rencontrées, suivi client, instructions spéciales…"
              style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 12, fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box', color: 'var(--text)', background: 'var(--bg)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={saveNotes} style={{ padding: '8px 20px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                Sauvegarder les notes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Demo missions data ── */
const DEMO_MISSIONS = [
  { id: 1, titre: 'Rénovation façade — Immeuble Leblanc', description: 'Ravalement complet façade sud + peinture, 280 m². Mise en échafaudage incluse.', categorie: '24 rue Victor Hugo, 75015 Paris', client: 'M. Leblanc', statut: 'assignee', priorite: 'haute', budget: 18500, dateDebut: '2025-03-20', dateFin: '2025-04-15', employes: [], vehicule: null },
  { id: 2, titre: 'Pose carrelage — Appartement T3 Dupont', description: 'Pose carrelage 60×60 salle de bain + cuisine, 45 m² total. Ragréage préalable.', categorie: '8 av. des Fleurs, 92100 Boulogne', client: 'Mme Dupont', statut: 'en_cours', priorite: null, budget: 3200, dateDebut: '2025-03-18', dateFin: '2025-03-25', employes: [{ id: 1, nom: 'Pierre Martin', poste: 'Maçon', telephone: '06 11 22 33 44' }], vehicule: { id: 2, immatriculation: 'EF-456-GH', modele: 'Citroën Berlingo', type: 'Fourgonnette', capacite: '700 kg' } },
  { id: 3, titre: 'Installation électrique neuve — SCI Horizon', description: 'Mise aux normes tableau + tirage câbles, 6 pièces. Attestation conformité Consuel incluse.', categorie: '5 rue Pasteur, 94000 Créteil', client: 'SCI Horizon', statut: 'terminee', priorite: null, budget: 4800, dateDebut: '2025-02-10', dateFin: '2025-02-20', employes: [], vehicule: null },
  { id: 4, titre: 'Plomberie — Remplacement chauffe-eau collectif', description: 'Dépose ancien cumulus 150L + pose chauffe-eau thermodynamique 200L.', categorie: '15 bd Voltaire, 75011 Paris', client: 'Syndic Voltaire', statut: 'en_attente', priorite: 'urgente', budget: 2200, dateDebut: '2025-04-01', dateFin: null, employes: [], vehicule: null },
];
