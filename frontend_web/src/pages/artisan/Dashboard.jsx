import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  IconDocument, IconCheck, IconX, IconPlus, IconDownload,
  IconClock, IconAlert, IconCalendar, IconUser,
  IconMessage, IconSend,
} from '../../components/ui/Icons';
import api from '../../services/api';

const API = api.defaults.baseURL;

const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin',
              'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatCur(n) {
  return Number(n||0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

/* Simulate OCR on a receipt image */
function simulerOCR(fichier) {
  return new Promise(resolve => {
    setTimeout(() => {
      const categories = ['repas', 'carburant', 'hébergement', 'matériel'];
      const cat = categories[Math.floor(Math.random() * categories.length)];
      const montant = (Math.random() * 150 + 10).toFixed(2);
      const today = new Date().toISOString().split('T')[0];
      resolve({
        montant,
        categorie: cat,
        date: today,
        description: `${cat.charAt(0).toUpperCase() + cat.slice(1)} — détecté automatiquement`,
        confidence: Math.floor(Math.random() * 15 + 85),
      });
    }, 1800);
  });
}

const TABS = ['Tableau de bord', 'Mes missions', 'Notes de frais', 'Frais chantier', 'Planning', 'Mes fiches de paie', 'Congés', 'Messagerie', 'Mon profil'];

export default function ArtisanDashboard() {
  const { user, token } = useAuth();
  const [tab, setTab] = useState('Tableau de bord');
  const [preFraisChantierMission, setPreFraisChantierMission] = useState(null);
  const [notesFrais, setNotesFrais] = useState([]);
  const [conges, setConges] = useState([]);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const initials = user?.nom?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'A';

  const mesNotes = notesFrais; // In demo, show all (would filter by employeId in prod)
  const mesConges = conges;

  useEffect(() => {
    fetch(`${API}/rh/notes-frais`, { headers })
      .then(r => r.json()).then(d => setNotesFrais(d.notesFrais || [])).catch(() => {});
    fetch(`${API}/rh/conges`, { headers })
      .then(r => r.json()).then(d => setConges(d.conges || [])).catch(() => {});
  }, []);

  const totalFraisApprouves = mesNotes.filter(n => n.statut === 'approuvée').reduce((s, n) => s + n.montant, 0);
  const fraisEnAttente = mesNotes.filter(n => n.statut === 'en_attente').length;
  const congesEnAttente = mesConges.filter(c => c.statut === 'en_attente').length;

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--card)', borderRadius: 14, padding: 4, marginBottom: 22, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 16px', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.15s',
            background: tab === t ? 'var(--primary)' : 'transparent',
            color: tab === t ? '#fff' : 'var(--text-secondary)',
          }}>{t}</button>
        ))}
      </div>

      {tab === 'Tableau de bord' && <TabDashboard initials={initials} user={user} totalFrais={totalFraisApprouves} fraisEnAttente={fraisEnAttente} congesEnAttente={congesEnAttente} onTabChange={setTab} headers={headers} />}
      {tab === 'Mes missions' && <TabMissions headers={headers} onAddFrais={() => setTab('Notes de frais')} onAddFraisChantier={(m) => { setPreFraisChantierMission(m); setTab('Frais chantier'); }} />}
      {tab === 'Notes de frais' && <TabNotesFrais notes={mesNotes} setNotes={setNotesFrais} headers={headers} />}
      {tab === 'Frais chantier' && <TabFraisChantier headers={headers} preMission={preFraisChantierMission} onClearPreMission={() => setPreFraisChantierMission(null)} />}
      {tab === 'Planning' && <TabPlanning headers={headers} />}
      {tab === 'Mes fiches de paie' && <TabFichesPaie user={user} />}
      {tab === 'Congés' && <TabConges conges={mesConges} setConges={setConges} headers={headers} />}
      {tab === 'Messagerie' && <TabMessagerie user={user} />}
      {tab === 'Mon profil' && <TabProfil user={user} />}
    </div>
  );
}

/* ── Tableau de bord ── */
function TabDashboard({ initials, user, totalFrais, fraisEnAttente, congesEnAttente, onTabChange, headers }) {
  const [missionDuJour, setMissionDuJour] = useState(null);

  useEffect(() => {
    fetch(`${API}/missions`, { headers })
      .then(r => r.json()).then(d => {
        const today = new Date().toISOString().split('T')[0];
        const missions = d.missions || d || [];
        const active = missions.find(m => m.statut === 'en_cours') || missions[0] || null;
        setMissionDuJour(active);
      }).catch(() => {
        setMissionDuJour({ titre: 'Rénovation façade — Immeuble Leblanc', client: 'M. Leblanc', adresse: '24 rue Victor Hugo, 75015 Paris', statut: 'en_cours', dateDebut: new Date().toISOString().split('T')[0] });
      });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Welcome card */}
      <div style={{ background: 'linear-gradient(135deg, #007AFF 0%, #0055CC 100%)', borderRadius: 16, padding: '24px 28px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20 }}>{initials}</div>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Bonjour, {user?.nom || 'Artisan'}</div>
            <div style={{ fontSize: 14, opacity: 0.85, marginTop: 4 }}>Bernard Martin BTP · {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          </div>
        </div>
      </div>

      {/* Mission du jour */}
      {missionDuJour && (
        <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '2px solid #007AFF30' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#34C759', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#34C759', textTransform: 'uppercase', letterSpacing: 0.6 }}>Mission du jour</span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#1C1C1E', marginBottom: 6 }}>{missionDuJour.titre || missionDuJour.description || 'Mission en cours'}</div>
          <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#6E6E73', marginBottom: 14, flexWrap: 'wrap' }}>
            {missionDuJour.client && <span>Client : <strong style={{ color: '#1C1C1E' }}>{missionDuJour.client}</strong></span>}
            {missionDuJour.adresse && <span>📍 {missionDuJour.adresse}</span>}
            {missionDuJour.dateDebut && <span>Date : {formatDate(missionDuJour.dateDebut)}</span>}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => onTabChange('Mes missions')} style={{ padding: '8px 16px', border: 'none', borderRadius: 10, background: '#007AFF', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Voir les détails</button>
            <button onClick={() => onTabChange('Notes de frais')} style={{ padding: '8px 16px', border: '1px solid #007AFF', borderRadius: 10, background: '#fff', color: '#007AFF', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>+ Ajouter des frais</button>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        {[
          { label: 'Frais remboursés', value: totalFrais.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }), color: '#34C759', Icon: IconCheck },
          { label: 'Frais en attente', value: fraisEnAttente, color: '#FF9500', Icon: IconClock },
          { label: 'Congés en attente', value: congesEnAttente, color: '#007AFF', Icon: IconCalendar },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `${k.color}18`, color: k.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <k.Icon size={16} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Planning semaine (mini) */}
      <PlanningMini onTabChange={onTabChange} />

      {/* Quick actions */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px', color: '#6E6E73', textTransform: 'uppercase', letterSpacing: 0.5 }}>Actions rapides</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { label: 'Note de frais perso', icon: '🧾', tab: 'Notes de frais' },
            { label: 'Frais chantier', icon: '🏗️', tab: 'Frais chantier' },
            { label: 'Mes fiches de paie', icon: '📄', tab: 'Mes fiches de paie' },
            { label: 'Congés', icon: '🏖️', tab: 'Congés' },
          ].map(a => (
            <button key={a.label} onClick={() => onTabChange(a.tab)} style={{ background: '#F8F9FA', border: 'none', borderRadius: 10, padding: '14px 12px', textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{a.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#3C3C43' }}>{a.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Mes missions ── */
const MISSIONS_DEMO_ARTISAN = [
  { id: 1, titre: 'Rénovation façade — Immeuble Leblanc', description: 'Ravalement complet façade sud, 280m², enduit projeté + peinture finition', client: 'M. Leblanc', telephone: '06 12 34 56 78', adresse: '24 rue Victor Hugo', codePostal: '75015', ville: 'Paris', statut: 'en_cours', dateDebut: new Date().toISOString().split('T')[0], dateFin: '2025-04-30', budget: 9500, avancement: 45, equipe: ['Carlos Garcia (vous)', 'Pierre Martin', 'Jacques D.'] },
  { id: 2, titre: 'Pose carrelage — Appartement T3', description: 'Pose carrelage 60×60 salon + cuisine, 42m²', client: 'Mme Dupont', telephone: '06 98 76 54 32', adresse: '8 av. des Fleurs', codePostal: '92100', ville: 'Boulogne', statut: 'planifie', dateDebut: '2025-04-01', dateFin: '2025-04-10', budget: 3200, avancement: 0, equipe: ['Carlos Garcia (vous)'] },
  { id: 3, titre: 'Installation électrique neuve', description: 'Mise aux normes complète, tableaux, prises, éclairage', client: 'SCI Horizon', telephone: '01 45 67 89 00', adresse: '5 rue Pasteur', codePostal: '94000', ville: 'Créteil', statut: 'termine', dateDebut: '2025-02-10', dateFin: '2025-02-28', budget: 4800, avancement: 100, equipe: ['Carlos Garcia (vous)', 'Marc B.'] },
];

const ETAPES_CHANTIER = [
  { label: 'Préparation', pct: 10 },
  { label: 'Démarrage', pct: 20 },
  { label: 'En cours', pct: 60 },
  { label: 'Finitions', pct: 80 },
  { label: 'Réception', pct: 100 },
];

function MissionDetailPanel({ mission: missionInit, onClose, onFraisChantier, onFraisPerso }) {
  const [mission, setMission] = useState({ ...missionInit });
  const [factureGeneree, setFactureGeneree] = useState(false);
  const [factureAcceptee, setFactureAcceptee] = useState(false);
  const [factureNum] = useState(`FAC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100)}`);

  const progress = mission.avancement || 0;
  const currentEtape = ETAPES_CHANTIER.findIndex(e => progress < e.pct);
  const etapeIdx = currentEtape === -1 ? ETAPES_CHANTIER.length - 1 : Math.max(0, currentEtape - 1);
  const sc = { en_cours: { bg: '#E3F2FD', c: '#1565C0', l: 'En cours' }, planifie: { bg: '#FFF3CD', c: '#856404', l: 'Planifié' }, termine: { bg: '#D1F2E0', c: '#1A7F43', l: 'Terminé' } };
  const statut = sc[mission.statut] || sc.planifie;

  function setEtape(etape) {
    const nouvelAvancement = etape.pct;
    setMission(m => ({ ...m, avancement: nouvelAvancement }));
    if (etape.label === 'Réception') {
      setTimeout(() => setFactureGeneree(true), 400);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#F2F2F7', borderRadius: '20px 20px 0 0', maxHeight: '88vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}><div style={{ width: 36, height: 4, borderRadius: 2, background: '#C7C7CC' }}/></div>

        {/* Header */}
        <div style={{ padding: '8px 20px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ ...statut, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: statut.bg, color: statut.c }}>{statut.l}</span>
            <h2 style={{ margin: '8px 0 2px', fontSize: 17, fontWeight: 800 }}>{mission.titre}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8E93', fontSize: 22, marginTop: 4 }}>✕</button>
        </div>

        <div style={{ padding: '0 16px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Info grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { icon: '📋', label: 'Description', val: mission.description },
              { icon: '👤', label: 'Client', val: `${mission.client}${mission.telephone ? ` · ${mission.telephone}` : ''}` },
              { icon: '📍', label: 'Adresse chantier', val: `${mission.adresse}, ${mission.codePostal} ${mission.ville}` },
              { icon: '📅', label: 'Dates', val: `${formatDate(mission.dateDebut)}${mission.dateFin ? ` → ${formatDate(mission.dateFin)}` : ''}` },
              { icon: '💰', label: 'Budget', val: mission.budget ? formatCur(mission.budget) : '—' },
            ].map(item => (
              <div key={item.label} style={{ background: '#fff', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: '#8E8E93', fontWeight: 600, marginBottom: 4 }}>{item.icon} {item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1E' }}>{item.val}</div>
              </div>
            ))}
            <div style={{ background: '#fff', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, color: '#8E8E93', fontWeight: 600, marginBottom: 6 }}>👥 Équipe</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {(mission.equipe || []).map((e, i) => (
                  <div key={i} style={{ fontSize: 12, color: i===0?'#007AFF':'#1C1C1E', fontWeight: i===0?700:500 }}>{e}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Avancement — étapes cliquables */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '16px 16px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>État d'avancement</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: progress >= 100 ? '#34C759' : '#007AFF' }}>{progress}%</span>
            </div>
            <div style={{ height: 10, borderRadius: 5, background: '#F2F2F7', overflow: 'hidden', marginBottom: 14 }}>
              <div style={{ height: '100%', width: `${progress}%`, background: progress >= 100 ? '#34C759' : `linear-gradient(90deg, #007AFF, #34C759)`, borderRadius: 5, transition: 'width 0.6s' }} />
            </div>
            {/* Étapes cliquables */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {ETAPES_CHANTIER.map((e, i) => {
                const done = progress >= e.pct;
                const current = i === etapeIdx;
                const isReception = e.label === 'Réception';
                return (
                  <div key={e.label} style={{ textAlign: 'center', flex: 1, cursor: 'pointer' }} onClick={() => setEtape(e)}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? (isReception ? '#34C759' : '#007AFF') : '#F2F2F7', color: done ? '#fff' : '#C7C7CC', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', fontSize: 11, fontWeight: 700, border: current ? `2px solid ${isReception ? '#34C759' : '#007AFF'}` : 'none', transition: 'all 0.2s', boxShadow: current ? `0 0 0 3px ${isReception ? '#34C75920' : '#007AFF20'}` : 'none' }}>
                      {done ? '✓' : i + 1}
                    </div>
                    <div style={{ fontSize: 9, color: done ? (isReception ? '#34C759' : '#007AFF') : '#C7C7CC', fontWeight: current ? 700 : 400, lineHeight: 1.2 }}>{e.label}</div>
                    {isReception && !done && <div style={{ fontSize: 8, color: '#FF9500', marginTop: 1 }}>→ Facture</div>}
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: 11, color: '#8E8E93', marginTop: 12, textAlign: 'center' }}>Appuyez sur une étape pour mettre à jour votre avancement</p>

            {/* Facture générée overlay */}
            {factureGeneree && !factureAcceptee && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.97)', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🧾</div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#34C759', marginBottom: 4 }}>Réception validée !</h3>
                <p style={{ fontSize: 12, color: '#6E6E73', marginBottom: 12 }}>La facture <strong>{factureNum}</strong> a été générée automatiquement.</p>
                <div style={{ background: '#F8F9FA', borderRadius: 10, padding: '10px 16px', width: '100%', marginBottom: 14, textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: '#6E6E73' }}>Montant HT</span>
                    <span style={{ fontWeight: 600 }}>{formatCur((mission.budget || 0) / 1.2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: '#6E6E73' }}>TVA 20%</span>
                    <span style={{ fontWeight: 600 }}>{formatCur((mission.budget || 0) - (mission.budget || 0) / 1.2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, borderTop: '1px solid #E5E5EA', paddingTop: 6, marginTop: 4 }}>
                    <span>Total TTC</span>
                    <span style={{ color: '#007AFF' }}>{formatCur(mission.budget || 0)}</span>
                  </div>
                </div>
                <button onClick={() => setFactureAcceptee(true)}
                  style={{ width: '100%', padding: '11px 0', border: 'none', borderRadius: 10, background: '#34C759', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                  Envoyer la facture au client
                </button>
              </div>
            )}
            {factureAcceptee && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: '#D1F2E0', borderRadius: 10, fontSize: 12, color: '#1A7F43', fontWeight: 600, textAlign: 'center' }}>
                Facture {factureNum} envoyée — En attente de validation du client
              </div>
            )}
          </div>

          {/* Actions */}
          {mission.statut !== 'termine' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <button onClick={() => { onFraisChantier(mission); onClose(); }} style={{ padding: '12px', background: '#FF9500', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                Frais chantier
              </button>
              <button onClick={() => { onFraisPerso(); onClose(); }} style={{ padding: '12px', background: '#fff', color: '#007AFF', border: '2px solid #007AFF', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                Note de frais perso
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabMissions({ headers, onAddFrais, onAddFraisChantier }) {
  const [missions, setMissions] = useState([]);
  const [selected, setSelected] = useState(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetch(`${API}/missions`, { headers })
      .then(r => r.json()).then(d => setMissions(d.missions || d || []))
      .catch(() => setMissions(MISSIONS_DEMO_ARTISAN));
  }, []);

  const statColor = { en_cours: { bg: '#E3F2FD', c: '#1565C0', l: 'En cours' }, planifie: { bg: '#FFF3CD', c: '#856404', l: 'Planifié' }, termine: { bg: '#D1F2E0', c: '#1A7F43', l: 'Terminé' } };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {selected && (
        <MissionDetailPanel
          mission={selected}
          onClose={() => setSelected(null)}
          onFraisChantier={(m) => onAddFraisChantier(m)}
          onFraisPerso={onAddFrais}
        />
      )}
      {missions.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', color: '#8E8E93', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>Aucune mission pour l'instant</div>
      ) : missions.map((m, i) => {
        const isToday = m.dateDebut === today || m.statut === 'en_cours';
        const sc = statColor[m.statut] || statColor.planifie;
        const progress = m.avancement || 0;
        return (
          <div key={m.id || i}
            onClick={() => setSelected(m)}
            style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: isToday ? '2px solid #007AFF40' : '1px solid #F2F2F7', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.07)'; }}
          >
            {isToday && <div style={{ fontSize: 11, fontWeight: 700, color: '#007AFF', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34C759' }} /> Aujourd'hui</div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{m.titre || m.description || 'Mission'}</div>
                <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#6E6E73', flexWrap: 'wrap' }}>
                  {m.client && <span>👤 <strong style={{ color: '#1C1C1E' }}>{m.client}</strong></span>}
                  {(m.adresse || m.ville) && <span>📍 {m.adresse}{m.ville ? `, ${m.ville}` : ''}</span>}
                  <span>📅 {formatDate(m.dateDebut)}</span>
                </div>
                {/* Progress bar inline */}
                {progress > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8E8E93', marginBottom: 3 }}>
                      <span>Avancement</span><span>{progress}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: '#F2F2F7', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${progress}%`, background: progress>=100?'#34C759':'#007AFF', borderRadius: 3 }} />
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.c }}>{sc.l}</span>
                <span style={{ fontSize: 11, color: '#8E8E93' }}>Voir détail →</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Notes de frais avec OCR ── */
function TabNotesFrais({ notes, setNotes, headers }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ montant: '', categorie: 'repas', date: new Date().toISOString().split('T')[0], description: '' });
  const [fichier, setFichier] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  async function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFichier(f);
    // Show preview
    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = ev => setPreview(ev.target.result);
      reader.readAsDataURL(f);
    } else {
      setPreview('pdf');
    }
    // Simulate OCR
    setScanning(true);
    setScanResult(null);
    const result = await simulerOCR(f);
    setScanResult(result);
    setForm(prev => ({ ...prev, montant: result.montant, categorie: result.categorie, date: result.date, description: result.description }));
    setScanning(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!fichier) { alert('Veuillez joindre le justificatif (photo ou PDF)'); return; }
    setSaving(true);
    try {
      const r = await fetch(`${API}/rh/notes-frais`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ employeId: 1, ...form, montant: parseFloat(form.montant), justificatifNom: fichier.name }),
      });
      const d = await r.json();
      setNotes(prev => [d.noteFrais, ...prev]);
      setShowForm(false);
      setFichier(null); setPreview(null); setScanResult(null);
      setForm({ montant: '', categorie: 'repas', date: new Date().toISOString().split('T')[0], description: '' });
    } catch (err) { console.error(err); }
    setSaving(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {!showForm && (
        <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#007AFF', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 14, alignSelf: 'flex-start' }}>
          <IconPlus size={15} /> Soumettre une note de frais
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Nouvelle note de frais</h3>

          {/* File upload zone */}
          <div
            onClick={() => fileRef.current.click()}
            style={{ border: `2px dashed ${fichier ? '#34C759' : '#E5E5EA'}`, borderRadius: 12, padding: '20px', textAlign: 'center', cursor: 'pointer', marginBottom: 16, background: fichier ? '#D1F2E020' : '#FAFAFA', transition: 'all 0.2s' }}
          >
            <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFile} />
            {!fichier ? (
              <>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>Prendre en photo ou importer le justificatif</div>
                <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 4 }}>Photo ou PDF — le logiciel scannera automatiquement les informations</div>
              </>
            ) : scanning ? (
              <>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
                <div style={{ fontWeight: 600, color: '#007AFF' }}>Analyse en cours…</div>
                <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 4 }}>Reconnaissance automatique des informations</div>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                {preview && preview !== 'pdf' ? (
                  <img src={preview} alt="Justificatif" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <div style={{ width: 80, height: 80, background: '#F2F2F7', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📄</div>
                )}
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, color: '#34C759', fontSize: 14 }}>✓ Scan terminé</div>
                  {scanResult && <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 2 }}>Confiance : {scanResult.confidence}% · Champs remplis automatiquement</div>}
                  <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>{fichier.name}</div>
                </div>
              </div>
            )}
          </div>

          {/* Fields — auto-filled by OCR or editable */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lbl}>Montant (€) *</label>
              <input type="number" step="0.01" value={form.montant} onChange={e => setForm(p => ({ ...p, montant: e.target.value }))} placeholder="0.00" style={inp} required />
            </div>
            <div>
              <label style={lbl}>Catégorie</label>
              <select value={form.categorie} onChange={e => setForm(p => ({ ...p, categorie: e.target.value }))} style={inp}>
                {['repas', 'carburant', 'hébergement', 'matériel', 'autre'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Description</label>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Détail de la dépense" style={inp} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '9px 18px', border: '1px solid #E5E5EA', borderRadius: 10, background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
            <button type="submit" disabled={saving || scanning} style={{ padding: '9px 22px', border: 'none', borderRadius: 10, background: saving || scanning ? '#C7C7CC' : '#007AFF', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
              {saving ? 'Envoi…' : 'Soumettre'}
            </button>
          </div>
        </form>
      )}

      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        <div style={{ padding: '13px 18px', borderBottom: '1px solid #F2F2F7', fontWeight: 700, fontSize: 15 }}>Mes notes de frais</div>
        {notes.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#8E8E93' }}>Aucune note de frais soumise</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F2F2F7' }}>
                {['Catégorie', 'Montant', 'Date', 'Description', 'Statut'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {notes.map((n, i) => (
                <tr key={n.id || i} style={{ borderBottom: '1px solid #F2F2F7' }}>
                  <td style={{ padding: '11px 14px', textTransform: 'capitalize', fontWeight: 600 }}>{n.categorie}</td>
                  <td style={{ padding: '11px 14px', fontWeight: 700, color: '#007AFF' }}>{formatCur(n.montant)}</td>
                  <td style={{ padding: '11px 14px', color: '#6E6E73' }}>{formatDate(n.creeLe)}</td>
                  <td style={{ padding: '11px 14px', color: '#6E6E73' }}>{n.description || '—'}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: n.statut === 'approuvée' ? '#D1F2E0' : n.statut === 'refusée' ? '#FFE5E5' : '#FFF3CD',
                      color: n.statut === 'approuvée' ? '#1A7F43' : n.statut === 'refusée' ? '#C0392B' : '#856404',
                    }}>
                      {n.statut === 'approuvée' ? '✓ Approuvée' : n.statut === 'refusée' ? '✗ Refusée' : '⏳ En attente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ── Planning mini (for Dashboard tab) ── */
function PlanningMini({ onTabChange }) {
  const today = new Date();
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek);
  const days = Array.from({ length: 5 }, (_, i) => { const d = new Date(monday); d.setDate(monday.getDate() + i); return d; });
  const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven'];
  const todayStr = today.toISOString().split('T')[0];
  const PLANNING = [
    { date: days[0].toISOString().split('T')[0], heure: '08:00 – 17:00', mission: 'Rénovation façade — Immeuble Leblanc', type: 'chantier', color: '#007AFF' },
    { date: days[1].toISOString().split('T')[0], heure: '08:00 – 12:00', mission: 'Rénovation façade', type: 'chantier', color: '#007AFF' },
    { date: days[1].toISOString().split('T')[0], heure: '14:00 – 17:00', mission: 'Réunion hebdo', type: 'reunion', color: '#FF9500' },
    { date: days[2].toISOString().split('T')[0], heure: '08:00 – 17:00', mission: 'Pose carrelage — Dupont', type: 'chantier', color: '#007AFF' },
    { date: days[3].toISOString().split('T')[0], heure: '09:00 – 12:00', mission: 'Visite médicale', type: 'admin', color: '#AF52DE' },
    { date: days[4].toISOString().split('T')[0], heure: '08:00 – 17:00', mission: 'Pose carrelage — Dupont', type: 'chantier', color: '#007AFF' },
  ];
  return (
    <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Planning de la semaine</h3>
        <button onClick={() => onTabChange('Planning')} style={{ fontSize: 12, color: '#007AFF', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Voir tout →</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        {days.map((d, i) => {
          const ds = d.toISOString().split('T')[0];
          const isToday = ds === todayStr;
          const events = PLANNING.filter(p => p.date === ds);
          return (
            <div key={i} style={{ minHeight: 90 }}>
              <div style={{ textAlign: 'center', marginBottom: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.4 }}>{JOURS[i]}</div>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: isToday ? '#007AFF' : 'transparent', color: isToday ? '#fff' : '#1C1C1E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: isToday ? 800 : 400, fontSize: 13, margin: '3px auto 0' }}>{d.getDate()}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {events.map((ev, j) => (
                  <div key={j} title={`${ev.heure} — ${ev.mission}`} style={{ background: `${ev.color}18`, border: `1px solid ${ev.color}40`, borderRadius: 5, padding: '3px 5px' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: ev.color }}>{ev.heure}</div>
                    <div style={{ fontSize: 9, fontWeight: 600, color: '#1C1C1E', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{ev.mission}</div>
                  </div>
                ))}
                {events.length === 0 && <div style={{ fontSize: 9, color: '#C7C7CC', textAlign: 'center', paddingTop: 6 }}>Libre</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Frais chantier ── */
function TabFraisChantier({ headers, preMission, onClearPreMission }) {
  const today = new Date().toISOString().split('T')[0];
  const MISSIONS_DEMO = MISSIONS_DEMO_ARTISAN.map(m => ({ id: m.id, titre: m.titre, client: m.client }));
  const CATS = ['matériaux', 'location matériel', 'sous-traitance', 'carburant chantier', 'outillage', 'déchets/évacuation', 'autre'];
  const STOCK_DEPOT = [
    { id: 1, ref: 'MAT-001', designation: 'Parpaings 20×20×50', unite: 'u', valeurUnitaire: 1.20, quantiteDisponible: 240 },
    { id: 2, ref: 'MAT-002', designation: 'Sable fin (sac 25 kg)', unite: 'sac', valeurUnitaire: 6.50, quantiteDisponible: 18 },
    { id: 3, ref: 'MAT-003', designation: 'Ciment CEM II 32,5 R', unite: 'sac', valeurUnitaire: 8.20, quantiteDisponible: 32 },
    { id: 4, ref: 'EPI-001', designation: 'Casque chantier blanc (lot 10)', unite: 'boîte', valeurUnitaire: 42.00, quantiteDisponible: 2 },
    { id: 5, ref: 'EPI-002', designation: 'Gants de protection T9', unite: 'u', valeurUnitaire: 2.80, quantiteDisponible: 45 },
    { id: 6, ref: 'OUT-001', designation: 'Perceuse à percussion Makita', unite: 'u', valeurUnitaire: 189.00, quantiteDisponible: 3 },
  ];
  const FRAIS_DEMO = [
    { id: 1, missionId: 1, mission: 'Rénovation façade', categorie: 'matériaux', description: 'Sacs de ciment × 20', montant: 180, date: today, fournisseur: 'Bricorama', statut: 'soumis' },
    { id: 2, missionId: 1, mission: 'Rénovation façade', categorie: 'location matériel', description: 'Location nacelle 1 jour', montant: 320, date: today, fournisseur: 'Loxam', statut: 'approuvé' },
    { id: 3, missionId: 2, mission: 'Pose carrelage', categorie: 'matériaux', description: 'Colle carrelage + joint', montant: 95, date: today, fournisseur: 'Weber', statut: 'soumis' },
  ];

  const [frais, setFrais] = useState(FRAIS_DEMO);
  const [form, setForm] = useState({ missionId: preMission ? String(preMission.id) : '', categorie: 'matériaux', montant: '', description: '', date: today, fournisseur: '', facture: '', typeSource: 'achat', articleDepotId: '', quantiteDepot: '' });
  const [showForm, setShowForm] = useState(!!preMission);

  // When preMission changes from parent, pre-fill
  useEffect(() => {
    if (preMission) {
      setForm(p => ({ ...p, missionId: String(preMission.id) }));
      setShowForm(true);
      onClearPreMission?.();
    }
  }, [preMission]);
  const [fichier, setFichier] = useState(null);
  const fileRef = useRef();

  const totalSoumis = frais.filter(f => f.statut === 'soumis').reduce((s, f) => s + f.montant, 0);
  const totalApprouve = frais.filter(f => f.statut === 'approuvé').reduce((s, f) => s + f.montant, 0);

  function handleSubmit(e) {
    e.preventDefault();
    const mission = MISSIONS_DEMO.find(m => m.id === parseInt(form.missionId));
    let description = form.description;
    let montant = parseFloat(form.montant) || 0;
    let fournisseur = form.fournisseur;
    let source = form.typeSource;
    if (form.typeSource === 'depot') {
      const art = STOCK_DEPOT.find(a => String(a.id) === String(form.articleDepotId));
      if (art) {
        const qty = parseFloat(form.quantiteDepot) || 1;
        description = description || `${art.designation} × ${qty}`;
        montant = art.valeurUnitaire * qty;
        fournisseur = 'Dépôt / magasin entreprise';
      }
    }
    const nouveau = {
      id: Date.now(), missionId: parseInt(form.missionId),
      mission: mission?.titre?.split('—')[0]?.trim() || 'Mission', categorie: form.categorie,
      description, montant, date: form.date, fournisseur, statut: source === 'depot' ? 'dépôt' : 'soumis',
    };
    setFrais(prev => [nouveau, ...prev]);
    setForm({ missionId: '', categorie: 'matériaux', montant: '', description: '', date: today, fournisseur: '', typeSource: 'achat', articleDepotId: '', quantiteDepot: '' });
    setFichier(null);
    setShowForm(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header info */}
      <div style={{ background: 'linear-gradient(135deg, #FF9500 0%, #FF6B00 100%)', borderRadius: 14, padding: '18px 22px', color: '#fff' }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Frais liés au chantier</div>
        <div style={{ fontSize: 13, opacity: 0.9, marginBottom: 14 }}>Dépenses directement imputées à un chantier (matériaux, location, sous-traitance…). Ces frais impactent la marge du chantier.</div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div><div style={{ fontSize: 20, fontWeight: 800 }}>{formatCur(totalSoumis)}</div><div style={{ fontSize: 11, opacity: 0.85 }}>En attente de validation</div></div>
          <div><div style={{ fontSize: 20, fontWeight: 800 }}>{formatCur(totalApprouve)}</div><div style={{ fontSize: 11, opacity: 0.85 }}>Approuvés</div></div>
        </div>
      </div>

      {/* Distinction info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: '4px solid #FF9500' }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: '#FF9500' }}>🏗️ Frais chantier (ici)</div>
          <div style={{ fontSize: 12, color: '#6E6E73', lineHeight: 1.6 }}>Matériaux achetés, location de matériel, sous-traitance, carburant du véhicule de chantier. <strong>Imputés au budget du chantier.</strong></div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: '4px solid #007AFF' }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: '#007AFF' }}>🧾 Notes de frais (onglet dédié)</div>
          <div style={{ fontSize: 12, color: '#6E6E73', lineHeight: 1.6 }}>Repas, hébergement, carburant personnel, péages. <strong>Remboursés sur votre fiche de paie.</strong></div>
        </div>
      </div>

      {!showForm && (
        <button onClick={() => setShowForm(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#FF9500', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 600, fontSize: 14, alignSelf: 'flex-start' }}>
          <IconPlus size={15} /> Déclarer un frais chantier
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 2px' }}>Nouveau frais chantier</h3>
              {form.missionId && <p style={{ margin: 0, fontSize: 12, color: '#FF9500', fontWeight: 600 }}>
                Chantier : {MISSIONS_DEMO.find(m => String(m.id) === String(form.missionId))?.titre?.split('—')[0]?.trim() || ''}
              </p>}
            </div>
            <button type="button" onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8E8E93', fontSize: 20 }}>×</button>
          </div>
          {/* Source toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, background: '#F2F2F7', borderRadius: 10, padding: 4 }}>
            {[{ key: 'achat', label: '🛒 Achat externe', sub: 'Facture à rembourser' }, { key: 'depot', label: '🏭 Pris au dépôt', sub: 'Tiré du stock entreprise' }].map(t => (
              <button key={t.key} type="button" onClick={() => setForm(p => ({ ...p, typeSource: t.key }))} style={{ flex: 1, padding: '10px 12px', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.15s', background: form.typeSource === t.key ? '#fff' : 'transparent', color: form.typeSource === t.key ? '#1C1C1E' : '#6E6E73', boxShadow: form.typeSource === t.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}>
                <div>{t.label}</div>
                <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 400, marginTop: 2 }}>{t.sub}</div>
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={lbl}>Chantier / Mission *</label>
              <select value={form.missionId} onChange={e => setForm(p => ({ ...p, missionId: e.target.value }))} style={inp} required>
                <option value="">Sélectionner un chantier…</option>
                {MISSIONS_DEMO.map(m => <option key={m.id} value={m.id}>{m.titre}</option>)}
              </select>
            </div>

            {form.typeSource === 'depot' ? (
              <>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={lbl}>Article du stock *</label>
                  <select value={form.articleDepotId} onChange={e => { const art = STOCK_DEPOT.find(a => String(a.id) === e.target.value); setForm(p => ({ ...p, articleDepotId: e.target.value, categorie: 'matériaux', montant: art ? String(art.valeurUnitaire * (parseFloat(p.quantiteDepot) || 1)) : p.montant })); }} style={inp} required>
                    <option value="">— Choisir un article en stock —</option>
                    {STOCK_DEPOT.map(a => <option key={a.id} value={a.id}>{a.designation} ({a.quantiteDisponible} {a.unite} dispos)</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Quantité prélevée *</label>
                  <input type="number" min="1" step="1" value={form.quantiteDepot} onChange={e => { const art = STOCK_DEPOT.find(a => String(a.id) === String(form.articleDepotId)); setForm(p => ({ ...p, quantiteDepot: e.target.value, montant: art ? String(art.valeurUnitaire * parseFloat(e.target.value || 1)) : p.montant })); }} placeholder="1" style={inp} required />
                </div>
                <div>
                  <label style={lbl}>Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inp} required />
                </div>
                {form.articleDepotId && (
                  <div style={{ gridColumn: '1 / -1', background: '#EBF5FF', border: '1px solid #007AFF30', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#007AFF' }}>
                    {(() => { const art = STOCK_DEPOT.find(a => String(a.id) === String(form.articleDepotId)); const qty = parseFloat(form.quantiteDepot) || 1; return art ? `Valeur imputée : ${(art.valeurUnitaire * qty).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} — Stock restant après prélèvement : ${art.quantiteDisponible - qty} ${art.unite}` : ''; })()}
                  </div>
                )}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={lbl}>Commentaire (optionnel)</label>
                  <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Ex : utilisé pour fondations bloc A…" style={inp} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label style={lbl}>Catégorie</label>
                  <select value={form.categorie} onChange={e => setForm(p => ({ ...p, categorie: e.target.value }))} style={inp}>
                    {CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Montant TTC (€) *</label>
                  <input type="number" step="0.01" value={form.montant} onChange={e => setForm(p => ({ ...p, montant: e.target.value }))} placeholder="0.00" style={inp} required />
                </div>
                <div>
                  <label style={lbl}>Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inp} required />
                </div>
                <div>
                  <label style={lbl}>Fournisseur</label>
                  <input value={form.fournisseur} onChange={e => setForm(p => ({ ...p, fournisseur: e.target.value }))} placeholder="Leroy Merlin, Kiloutou…" style={inp} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={lbl}>Description *</label>
                  <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Ex : Sacs de ciment × 20, location nacelle 1 journée…" style={inp} required />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={lbl}>Justificatif (facture, bon de livraison)</label>
                  <div onClick={() => fileRef.current.click()} style={{ border: `2px dashed ${fichier ? '#34C759' : '#E5E5EA'}`, borderRadius: 10, padding: '12px 16px', cursor: 'pointer', background: fichier ? '#D1F2E020' : '#FAFAFA', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => setFichier(e.target.files[0])} />
                    <span style={{ fontSize: 20 }}>{fichier ? '✅' : '📎'}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: fichier ? '#34C759' : '#8E8E93' }}>{fichier ? fichier.name : 'Joindre la facture ou le bon de livraison'}</div>
                      <div style={{ fontSize: 11, color: '#8E8E93' }}>PDF, image — recommandé pour le suivi de chantier</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowForm(false)} style={{ padding: '9px 18px', border: '1px solid #E5E5EA', borderRadius: 10, background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
            <button type="submit" style={{ padding: '9px 22px', border: 'none', borderRadius: 10, background: '#FF9500', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>Enregistrer</button>
          </div>
        </form>
      )}

      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        <div style={{ padding: '13px 18px', borderBottom: '1px solid #F2F2F7', fontWeight: 700, fontSize: 15 }}>Mes frais chantier</div>
        {frais.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#8E8E93' }}>Aucun frais déclaré</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F2F2F7' }}>
                {['Chantier', 'Catégorie', 'Description', 'Fournisseur', 'Montant', 'Date', 'Statut'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {frais.map((f, i) => (
                <tr key={f.id || i} style={{ borderBottom: '1px solid #F2F2F7' }}>
                  <td style={{ padding: '11px 14px', fontWeight: 600, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.mission}</td>
                  <td style={{ padding: '11px 14px', color: '#6E6E73', textTransform: 'capitalize' }}>{f.categorie}</td>
                  <td style={{ padding: '11px 14px', color: '#6E6E73' }}>{f.description}</td>
                  <td style={{ padding: '11px 14px', color: '#8E8E93' }}>{f.fournisseur || '—'}</td>
                  <td style={{ padding: '11px 14px', fontWeight: 700, color: '#FF9500' }}>{formatCur(f.montant)}</td>
                  <td style={{ padding: '11px 14px', color: '#6E6E73' }}>{formatDate(f.date)}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: f.statut === 'approuvé' ? '#D1F2E0' : f.statut === 'refusé' ? '#FFE5E5' : f.statut === 'dépôt' ? '#EBF5FF' : '#FFF3CD',
                      color: f.statut === 'approuvé' ? '#1A7F43' : f.statut === 'refusé' ? '#C0392B' : f.statut === 'dépôt' ? '#007AFF' : '#856404',
                    }}>
                      {f.statut === 'approuvé' ? '✓ Approuvé' : f.statut === 'refusé' ? '✗ Refusé' : f.statut === 'dépôt' ? '🏭 Dépôt entreprise' : '⏳ En attente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#FAFAFA', borderTop: '2px solid #E5E5EA' }}>
                <td colSpan={4} style={{ padding: '10px 14px', fontWeight: 700, fontSize: 13 }}>Total</td>
                <td style={{ padding: '10px 14px', fontWeight: 800, fontSize: 14, color: '#FF9500' }}>{formatCur(frais.reduce((s, f) => s + f.montant, 0))}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}

/* ── Planning ── */
function TabPlanning({ headers }) {
  const today = new Date();
  // Generate a 7-day window starting from Monday of current week
  const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Demo planning
  const PLANNING = [
    { date: days[0].toISOString().split('T')[0], heure: '08:00 – 17:00', mission: 'Rénovation façade — Immeuble Leblanc', adresse: '24 rue Victor Hugo, 75015', type: 'chantier', color: '#007AFF' },
    { date: days[1].toISOString().split('T')[0], heure: '08:00 – 12:00', mission: 'Rénovation façade — Immeuble Leblanc', adresse: '24 rue Victor Hugo, 75015', type: 'chantier', color: '#007AFF' },
    { date: days[1].toISOString().split('T')[0], heure: '14:00 – 17:00', mission: 'Réunion hebdomadaire', adresse: 'Agence Bernard Martin BTP', type: 'reunion', color: '#FF9500' },
    { date: days[2].toISOString().split('T')[0], heure: '08:00 – 17:00', mission: 'Pose carrelage — Appartement Dupont', adresse: '8 av. des Fleurs, 92100', type: 'chantier', color: '#007AFF' },
    { date: days[3].toISOString().split('T')[0], heure: '09:00 – 12:00', mission: 'Visite médicale du travail', adresse: 'Service de santé au travail', type: 'admin', color: '#AF52DE' },
    { date: days[4].toISOString().split('T')[0], heure: '08:00 – 17:00', mission: 'Pose carrelage — Appartement Dupont', adresse: '8 av. des Fleurs, 92100', type: 'chantier', color: '#007AFF' },
  ];

  const todayStr = today.toISOString().split('T')[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Planning de la semaine</h3>

        {/* Week grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
          {days.map((d, i) => {
            const ds = d.toISOString().split('T')[0];
            const isToday = ds === todayStr;
            const events = PLANNING.filter(p => p.date === ds);
            return (
              <div key={i} style={{ minHeight: 120 }}>
                <div style={{ textAlign: 'center', marginBottom: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.4 }}>{JOURS[i]}</div>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: isToday ? '#007AFF' : 'transparent', color: isToday ? '#fff' : '#1C1C1E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: isToday ? 800 : 400, fontSize: 14, margin: '4px auto 0' }}>
                    {d.getDate()}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {events.map((ev, j) => (
                    <div key={j} title={`${ev.heure} — ${ev.mission}\n${ev.adresse}`} style={{ background: `${ev.color}18`, border: `1px solid ${ev.color}40`, borderRadius: 6, padding: '4px 6px', cursor: 'default' }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: ev.color }}>{ev.heure}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#1C1C1E', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{ev.mission}</div>
                    </div>
                  ))}
                  {events.length === 0 && i < 5 && (
                    <div style={{ fontSize: 10, color: '#C7C7CC', textAlign: 'center', paddingTop: 8 }}>—</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Liste détaillée */}
      <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700 }}>Détail de la semaine</h3>
        {PLANNING.filter(p => p.date >= days[0].toISOString().split('T')[0]).map((ev, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid #F2F2F7' }}>
            <div style={{ width: 4, borderRadius: 2, background: ev.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{ev.mission}</div>
              <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 2 }}>{new Date(ev.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} · {ev.heure}</div>
              {ev.adresse && <div style={{ fontSize: 12, color: '#8E8E93', marginTop: 2 }}>📍 {ev.adresse}</div>}
            </div>
            <span style={{ padding: '2px 9px', borderRadius: 10, fontSize: 10, fontWeight: 700, background: `${ev.color}18`, color: ev.color, alignSelf: 'flex-start', flexShrink: 0, textTransform: 'capitalize' }}>{ev.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Fiches de paie ── */
function TabFichesPaie({ user }) {
  const FICHES = [
    { id: 'BP-2025-03-002', periode: 'Mars 2025', brut: 2400, net: 1857.60, date: '2025-03-31', statut: 'payé' },
    { id: 'BP-2025-02-002', periode: 'Février 2025', brut: 2400, net: 1857.60, date: '2025-02-28', statut: 'payé' },
    { id: 'BP-2025-01-002', periode: 'Janvier 2025', brut: 2400, net: 1857.60, date: '2025-01-31', statut: 'payé' },
  ];

  return (
    <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
      <div style={{ padding: '13px 18px', borderBottom: '1px solid #F2F2F7', fontWeight: 700, fontSize: 15 }}>Mes fiches de paie</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F2F2F7' }}>
            {['Période', 'Salaire brut', 'Net à payer', 'Date de paiement', 'Statut', ''].map(h => (
              <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FICHES.map(f => (
            <tr key={f.id} style={{ borderBottom: '1px solid #F2F2F7' }}>
              <td style={{ padding: '12px 16px', fontWeight: 600 }}>{f.periode}</td>
              <td style={{ padding: '12px 16px' }}>{formatCur(f.brut)}</td>
              <td style={{ padding: '12px 16px', fontWeight: 700, color: '#34C759', fontSize: 15 }}>{formatCur(f.net)}</td>
              <td style={{ padding: '12px 16px', color: '#6E6E73' }}>{formatDate(f.date)}</td>
              <td style={{ padding: '12px 16px' }}>
                <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#D1F2E0', color: '#1A7F43' }}>✓ Payé</span>
              </td>
              <td style={{ padding: '12px 16px' }}>
                <a href={`/documents/bulletin/${f.id}`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#007AFF', textDecoration: 'none', fontWeight: 600, fontSize: 12 }}>
                  <IconDownload size={13} /> Ouvrir
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Congés ── */
function TabConges({ conges, setConges, headers }) {
  const [form, setForm] = useState({ dateDebut: '', dateFin: '', type: 'conge_paye', motif: '' });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch(`${API}/rh/conges`, {
        method: 'POST', headers,
        body: JSON.stringify({ ...form, employeId: 1 }),
      });
      const d = await r.json();
      setConges(prev => [d.conge, ...prev]);
      setForm({ dateDebut: '', dateFin: '', type: 'conge_paye', motif: '' });
    } catch (err) { console.error(err); }
    setSaving(false);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px' }}>Demander des congés</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div><label style={lbl}>Date de début *</label><input type="date" value={form.dateDebut} onChange={e => setForm(p => ({ ...p, dateDebut: e.target.value }))} style={inp} required /></div>
            <div><label style={lbl}>Date de fin *</label><input type="date" value={form.dateFin} onChange={e => setForm(p => ({ ...p, dateFin: e.target.value }))} style={inp} required /></div>
            <div>
              <label style={lbl}>Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={inp}>
                <option value="conge_paye">Congé payé</option>
                <option value="rtt">RTT</option>
                <option value="sans_solde">Sans solde</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Motif (optionnel)</label>
            <input value={form.motif} onChange={e => setForm(p => ({ ...p, motif: e.target.value }))} placeholder="Vacances, raison familiale…" style={inp} />
          </div>
          <button type="submit" disabled={saving} style={{ padding: '9px 22px', background: '#007AFF', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
            {saving ? 'Envoi…' : 'Envoyer la demande'}
          </button>
        </form>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
        <div style={{ padding: '13px 18px', borderBottom: '1px solid #F2F2F7', fontWeight: 700, fontSize: 15 }}>Mes demandes de congés</div>
        {conges.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#8E8E93' }}>Aucune demande</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F2F2F7' }}>
                {['Période', 'Jours', 'Type', 'Statut'].map(h => (
                  <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#8E8E93', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {conges.map((c, i) => (
                <tr key={c.id || i} style={{ borderBottom: '1px solid #F2F2F7' }}>
                  <td style={{ padding: '12px 16px' }}>{formatDate(c.dateDebut)} → {formatDate(c.dateFin)}</td>
                  <td style={{ padding: '12px 16px' }}>{c.nbJours}j</td>
                  <td style={{ padding: '12px 16px', color: '#6E6E73', textTransform: 'capitalize' }}>{c.type?.replace('_', ' ')}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                      background: c.statut === 'approuvé' ? '#D1F2E0' : c.statut === 'refusé' ? '#FFE5E5' : '#FFF3CD',
                      color: c.statut === 'approuvé' ? '#1A7F43' : c.statut === 'refusé' ? '#C0392B' : '#856404',
                    }}>
                      {c.statut === 'approuvé' ? '✓ Approuvé' : c.statut === 'refusé' ? '✗ Refusé' : '⏳ En attente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 };
const inp = { width: '100%', padding: '9px 12px', border: '1px solid var(--border-light)', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: 'var(--card)', color: 'var(--text)' };

/* ── Mon profil ── */
function TabProfil({ user }) {
  const [profil, setProfil] = useState({
    nom: user?.nom || '',
    prenom: '',
    email: user?.email || '',
    telephone: '',
    adresse: '',
    codePostal: '',
    ville: '',
    // Entreprise
    nomEntreprise: 'Bernard Martin BTP',
    siret: '123 456 789 00012',
    metier: 'Maçonnerie / Gros oeuvre',
    tva: 'FR12123456789',
    // Carte Pro BTP
    carteProBTPNumero: 'BTP-2024-00782',
    carteProBTPExpiration: '2026-12-31',
    carteProBTPPhotoRecto: null,
    carteProBTPPhotoVerso: null,
    // Photo
    photoUrl: null,
    photoEnLigne: false,
    // Logo
    logoUrl: null,
  });
  const [saved, setSaved] = useState(false);
  const photoRef = useRef(null);
  const logoRef = useRef(null);
  const btpRectoRef = useRef(null);
  const btpVersoRef = useRef(null);

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfil(p => ({ ...p, photoUrl: url }));
  }

  function handleLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setProfil(p => ({ ...p, logoUrl: url }));
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      await api.put('/users/profil', {
        nom: profil.nom,
        telephone: profil.telephone,
        adresse: profil.adresse,
        ville: profil.ville,
        metier: profil.metier,
        siret: profil.siret,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Erreur sauvegarde profil:', err);
    }
  }

  const initials = profil.nom?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'A';
  const carteExpDate = new Date(profil.carteProBTPExpiration);
  const carteValide = carteExpDate > new Date();
  const carteJoursRestants = Math.ceil((carteExpDate - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Photo de profil */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700 }}>Photo de profil</h3>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div
              onClick={() => photoRef.current?.click()}
              style={{ width: 96, height: 96, borderRadius: '50%', background: profil.photoUrl ? 'transparent' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 32, color: '#fff', cursor: 'pointer', overflow: 'hidden', border: '3px solid var(--border)', position: 'relative' }}
              title="Cliquer pour changer la photo"
            >
              {profil.photoUrl
                ? <img src={profil.photoUrl} alt="profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.45)', color: '#fff', fontSize: 10, fontWeight: 700, textAlign: 'center', padding: '4px 0' }}>Modifier</div>
            </div>
            <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />
            <button type="button" onClick={() => photoRef.current?.click()} style={{ fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Changer la photo
            </button>
          </div>

          {/* Toggle + message */}
          <div style={{ flex: 1 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 10 }}>
              <div
                onClick={() => setProfil(p => ({ ...p, photoEnLigne: !p.photoEnLigne }))}
                style={{ width: 44, height: 26, borderRadius: 13, background: profil.photoEnLigne ? '#34C759' : 'var(--border)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
              >
                <div style={{ position: 'absolute', top: 3, left: profil.photoEnLigne ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Mettre en ligne ma photo</span>
            </label>
            {!profil.photoEnLigne && (
              <div style={{ background: '#FFF3CD', border: '1px solid #FFD60A40', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#856404', lineHeight: 1.5 }}>
                Votre photo ne sera pas visible sur le site tant que cette option est désactivée. Les clients ne pourront pas voir votre photo de profil.
              </div>
            )}
            {profil.photoEnLigne && (
              <div style={{ background: '#D1F2E0', border: '1px solid #34C75940', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#1A7F43', lineHeight: 1.5 }}>
                Votre photo est visible sur le site et sera affichée aux clients qui consultent votre profil.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700 }}>Informations personnelles</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={lbl}>Nom *</label>
            <input value={profil.nom} onChange={e => setProfil(p => ({ ...p, nom: e.target.value }))} style={inp} required />
          </div>
          <div>
            <label style={lbl}>Prénom</label>
            <input value={profil.prenom} onChange={e => setProfil(p => ({ ...p, prenom: e.target.value }))} style={inp} />
          </div>
          <div>
            <label style={lbl}>Email *</label>
            <input type="email" value={profil.email} onChange={e => setProfil(p => ({ ...p, email: e.target.value }))} style={inp} required />
          </div>
          <div>
            <label style={lbl}>Téléphone</label>
            <input type="tel" value={profil.telephone} onChange={e => setProfil(p => ({ ...p, telephone: e.target.value }))} placeholder="06 12 34 56 78" style={inp} />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={lbl}>Adresse</label>
            <input value={profil.adresse} onChange={e => setProfil(p => ({ ...p, adresse: e.target.value }))} placeholder="12 rue de la Paix" style={inp} />
          </div>
          <div>
            <label style={lbl}>Code postal</label>
            <input value={profil.codePostal} onChange={e => setProfil(p => ({ ...p, codePostal: e.target.value }))} placeholder="75001" style={inp} />
          </div>
          <div>
            <label style={lbl}>Ville</label>
            <input value={profil.ville} onChange={e => setProfil(p => ({ ...p, ville: e.target.value }))} placeholder="Paris" style={inp} />
          </div>
        </div>
      </div>

      {/* Informations entreprise */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700 }}>Informations entreprise</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Logo */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 20, marginBottom: 4 }}>
            <div
              onClick={() => logoRef.current?.click()}
              style={{ width: 72, height: 72, borderRadius: 14, background: profil.logoUrl ? 'transparent' : 'var(--bg)', border: '2px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', fontSize: 24, flexShrink: 0 }}
              title="Cliquer pour ajouter le logo"
            >
              {profil.logoUrl ? <img src={profil.logoUrl} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : '🏢'}
            </div>
            <input ref={logoRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoChange} />
            <div>
              <button type="button" onClick={() => logoRef.current?.click()} style={{ fontSize: 13, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                {profil.logoUrl ? 'Changer le logo' : 'Ajouter le logo'}
              </button>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Le logo apparaîtra sur vos devis et factures</div>
            </div>
          </div>
          <div>
            <label style={lbl}>Nom de l'entreprise *</label>
            <input value={profil.nomEntreprise} onChange={e => setProfil(p => ({ ...p, nomEntreprise: e.target.value }))} style={inp} required />
          </div>
          <div>
            <label style={lbl}>SIRET</label>
            <input value={profil.siret} onChange={e => setProfil(p => ({ ...p, siret: e.target.value }))} placeholder="123 456 789 00012" style={inp} />
          </div>
          <div>
            <label style={lbl}>Métier / Spécialité</label>
            <input value={profil.metier} onChange={e => setProfil(p => ({ ...p, metier: e.target.value }))} style={inp} />
          </div>
          <div>
            <label style={lbl}>N° TVA intracommunautaire</label>
            <input value={profil.tva} onChange={e => setProfil(p => ({ ...p, tva: e.target.value }))} style={inp} />
          </div>
        </div>
      </div>

      {/* Carte Pro BTP */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Carte Pro BTP</h3>
          <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: carteValide ? '#D1F2E0' : '#FFE5E5', color: carteValide ? '#1A7F43' : '#C0392B' }}>
            {carteValide ? `Valide · ${carteJoursRestants}j restants` : 'Expirée'}
          </span>
        </div>

        {/* Photo de la carte physique */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Photo de votre carte physique</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { side: 'Recto', key: 'carteProBTPPhotoRecto', ref: btpRectoRef },
              { side: 'Verso', key: 'carteProBTPPhotoVerso', ref: btpVersoRef },
            ].map(({ side, key, ref }) => (
              <div key={side}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>{side}</div>
                <div
                  onClick={() => ref.current?.click()}
                  style={{ height: 130, borderRadius: 12, border: `2px dashed ${profil[key] ? '#FF9500' : 'var(--border)'}`, background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#FF9500'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = profil[key] ? '#FF9500' : 'var(--border)'}
                >
                  {profil[key] ? (
                    <>
                      <img src={profil[key]} alt={`carte BTP ${side}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
                        <span style={{ color: '#fff', fontSize: 12, fontWeight: 700, opacity: 0, transition: 'opacity 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '0'}>Modifier</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center' }}>Cliquer pour ajouter</div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}>JPG, PNG — max 5 Mo</div>
                    </>
                  )}
                </div>
                <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files[0]; if (f) setProfil(p => ({ ...p, [key]: URL.createObjectURL(f) })); }} />
              </div>
            ))}
          </div>
          {(!profil.carteProBTPPhotoRecto || !profil.carteProBTPPhotoVerso) && (
            <div style={{ marginTop: 10, padding: '8px 12px', background: '#FFF3CD', borderRadius: 8, fontSize: 12, color: '#856404' }}>
              ⚠️ Ajoutez les deux faces de votre carte — elles peuvent être demandées par les clients et sur les chantiers.
            </div>
          )}
        </div>

        {/* Visual digital card */}
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Informations de la carte</div>
        <div style={{ background: 'linear-gradient(135deg, #FF6B00 0%, #FF9500 50%, #FFCC00 100%)', borderRadius: 14, padding: '20px 24px', color: '#fff', marginBottom: 18, position: 'relative', overflow: 'hidden', maxWidth: 380 }}>
          <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: 60, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, opacity: 0.85, textTransform: 'uppercase', marginBottom: 14 }}>Carte Professionnelle BTP</div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: 1, marginBottom: 8 }}>{profil.carteProBTPNumero || '— — —'}</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>{profil.nom} {profil.prenom}</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>{profil.metier}</div>
          <div style={{ marginTop: 14, fontSize: 11, opacity: 0.8 }}>
            Expire le : <strong>{new Date(profil.carteProBTPExpiration).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</strong>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={lbl}>Numéro de carte</label>
            <input value={profil.carteProBTPNumero} onChange={e => setProfil(p => ({ ...p, carteProBTPNumero: e.target.value }))} placeholder="BTP-XXXX-XXXXX" style={inp} />
          </div>
          <div>
            <label style={lbl}>Date d'expiration</label>
            <input type="date" value={profil.carteProBTPExpiration} onChange={e => setProfil(p => ({ ...p, carteProBTPExpiration: e.target.value }))} style={inp} />
          </div>
        </div>
        {!carteValide && (
          <div style={{ marginTop: 12, background: '#FFE5E5', border: '1px solid #FF3B3040', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#C0392B' }}>
            Votre Carte Pro BTP est expirée. Renouvelez-la auprès de votre organisme paritaire (CIBTP) dès que possible — elle est obligatoire sur les chantiers.
          </div>
        )}
        {carteValide && carteJoursRestants <= 90 && (
          <div style={{ marginTop: 12, background: '#FFF3CD', border: '1px solid #FFD60A40', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#856404' }}>
            Votre carte expire dans moins de 3 mois. Pensez à anticiper le renouvellement auprès de la CIBTP.
          </div>
        )}
      </div>

      {/* Save */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
        {saved && (
          <span style={{ fontSize: 14, fontWeight: 600, color: '#34C759', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Profil enregistré
          </span>
        )}
        <button type="submit" className="btn-primary">
          Enregistrer les modifications
        </button>
      </div>
    </form>
  );
}

function TabMessagerie({ user }) {
  const [conversations, setConversations] = React.useState([]);
  const [conv, setConv] = React.useState(null);
  const [messages, setMessages] = React.useState([]);
  const [texte, setTexte] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const bottomRef = React.useRef(null);
  const inputRef = React.useRef(null);

  const AVATAR_COLORS = ['#5B5BD6', '#0891B2', '#059669', '#D97706', '#DC2626', '#7C3AED'];
  function avatarColor(name = '') {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
  }
  function formatTime(iso) {
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return 'Hier ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  React.useEffect(() => {
    api.get('/artisan/conversations')
      .then(({ data }) => {
        const convs = data.conversations || [];
        setConversations(convs);
        if (convs.length > 0) setConv(convs[0]);
      })
      .catch(() => {});
  }, []);

  const loadMessages = React.useCallback(async (missionId) => {
    try {
      const { data } = await api.get(`/artisan/messages/${missionId}`);
      setMessages(data.messages || []);
    } catch { setMessages([]); }
  }, []);

  React.useEffect(() => {
    if (!conv) return;
    loadMessages(conv.missionId);
    inputRef.current?.focus();
  }, [conv, loadMessages]);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function envoyer(e) {
    e.preventDefault();
    if (!texte.trim() || !conv || sending) return;
    const draft = texte.trim();
    setTexte('');
    setSending(true);
    try {
      await api.post(`/artisan/messages/${conv.missionId}`, { texte: draft, nomAuteur: user?.nom });
      await loadMessages(conv.missionId);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyer(e); }
  }

  return (
    <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 200px)', minHeight: 400 }}>
      {/* Conversations */}
      <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        <p style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Conversations</p>
        {conversations.length === 0 && (
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', padding: '12px 0' }}>Aucune mission assignée</p>
        )}
        {conversations.map(c => (
          <button key={c.missionId} onClick={() => setConv(c)} style={{
            display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 12,
            border: `1px solid ${conv?.missionId === c.missionId ? 'rgba(91,91,214,0.4)' : 'var(--border)'}`,
            background: conv?.missionId === c.missionId ? 'rgba(91,91,214,0.1)' : 'var(--card)',
            cursor: 'pointer', textAlign: 'left', width: '100%',
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: avatarColor(c.client), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>
              {c.client?.charAt(0)}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 600, fontSize: '0.8125rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.client}</p>
              <p style={{ fontSize: '0.6875rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.titre}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Chat */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        {!conv ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Sélectionnez une conversation
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: avatarColor(conv.client), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {conv.client?.charAt(0)}
              </div>
              <div>
                <p style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.9375rem' }}>{conv.client}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{conv.titre}</p>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {messages.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Démarrez la conversation
                </div>
              ) : messages.map((msg, idx) => {
                const isMe = msg.auteur === 'artisan';
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 6 }}>
                    {!isMe && (
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: avatarColor(msg.nomAuteur || ''), color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.6875rem', flexShrink: 0 }}>
                        {(msg.nomAuteur || '?').charAt(0)}
                      </div>
                    )}
                    <div style={{
                      maxWidth: '68%',
                      background: isMe ? 'var(--primary)' : 'var(--bg)',
                      color: isMe ? '#fff' : 'var(--text)',
                      borderRadius: isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                      padding: '8px 12px', fontSize: '0.875rem',
                    }}>
                      {!isMe && <p style={{ fontSize: '0.6875rem', fontWeight: 600, marginBottom: 3, color: avatarColor(msg.nomAuteur || '') }}>{msg.nomAuteur}</p>}
                      <p style={{ lineHeight: 1.5 }}>{msg.texte}</p>
                      <p style={{ fontSize: '0.625rem', marginTop: 4, opacity: 0.6, textAlign: 'right' }}>{formatTime(msg.date)}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={envoyer} style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
              <input
                ref={inputRef}
                value={texte}
                onChange={e => setTexte(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message à ${conv.client}…`}
                className="input"
                style={{ flex: 1, borderRadius: 20 }}
              />
              <button type="submit" disabled={sending || !texte.trim()} className="btn-primary" style={{ padding: '8px 16px', borderRadius: 20, flexShrink: 0 }}>
                Envoyer
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
