import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import DevisFormulaire from '../../components/DevisFormulaire';
import GanttPlanning from '../../components/chantier/GanttPlanning';
import {
  IconBuilding, IconCalendar, IconAlert, IconCheck, IconPlus, IconX,
  IconRefresh, IconDocument, IconUser, IconTrendUp,
} from '../../components/ui/Icons';
import { API_URL } from '../../services/api';
import { calculerDistanceEntreAdresses } from '../../utils/geocodage';
import { verifierHabilitation } from '../../utils/profilEntreprise';
import { calculerIndemniteTrajet } from '../../utils/calculPaie';
import ChantierDetail from '../../components/chantier/ChantierDetail';

// Adresse dépôt — en prod, viendrait du profil entreprise
const ADRESSE_DEPOT = localStorage.getItem('freample_depot') || '45 boulevard de la Libération, 13001 Marseille';

/* ── Helpers ── */
function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function formatCur(n) {
  return Number(n || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}
function progressColor(pct) {
  if (pct >= 80) return '#34C759';
  if (pct < 30) return '#FF9500';
  return '#5B5BD6';
}
function jours(a, b) {
  if (!a || !b) return null;
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

/* ── Status maps ── */
const STATUT_MAP = {
  en_attente: { bg: '#FFF3CD', color: '#856404', label: 'En attente' },
  assignee:   { bg: '#E3F2FD', color: '#1565C0', label: 'Assignée' },
  en_cours:   { bg: '#D1ECF1', color: '#0C5460', label: 'En cours' },
  planifie:   { bg: '#FFF3CD', color: '#856404', label: 'Planifié' },
  terminee:   { bg: '#D1F2E0', color: '#1A7F43', label: 'Terminée' },
  termine:    { bg: '#D1F2E0', color: '#1A7F43', label: 'Terminé' },
  en_pause:   { bg: '#F2F2F7', color: '#6E6E73', label: 'En pause' },
  annulee:    { bg: '#FFE5E5', color: '#C0392B', label: 'Annulée' },
};
function statutBadge(s) {
  const x = STATUT_MAP[s] || { bg: '#F2F2F7', color: '#6E6E73', label: s };
  return <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: x.bg, color: x.color }}>{x.label}</span>;
}

const PRIO_MAP = {
  urgente: { bg: '#FFE5E5', color: '#C0392B', label: 'Urgente' },
  haute:   { bg: '#FFF3CD', color: '#856404', label: 'Haute' },
};
function prioBadge(p) {
  if (!p || !PRIO_MAP[p]) return null;
  const x = PRIO_MAP[p];
  return <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: x.bg, color: x.color, marginLeft: 6 }}>{x.label}</span>;
}

/* ── Maintenance alert helpers ── */
function ctExpired(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}
function ctSoon(dateStr) {
  if (!dateStr) return false;
  const diff = (new Date(dateStr) - new Date()) / 86400000;
  return diff >= 0 && diff <= 60;
}
function vidangeAlert(v, km) {
  if (!v || !v.prochainKm || !km) return false;
  return km >= v.prochainKm - 2000;
}

/* ── Demo data (unifié depuis demoData.js) ── */
const DEMO_ITEMS = [
  { id: 'ch1', titre: 'Rénovation cuisine — Mme Dupont', description: 'Rénovation complète cuisine 12m² : plomberie, électricité, carrelage, peinture.', adresse: '12 rue de la Liberté, 13001 Marseille', client: 'Mme Dupont', statut: 'en_cours', priorite: 'haute', budgetPrevu: 8500, budgetReel: 7200, caDevis: 8500, avancement: 65, dateDebut: '2026-04-01', dateFin: '2026-04-25', equipe: ['Pierre Martin', 'Sophie Duval', 'Lucas Garcia'], vehicule: { id: 1, immatriculation: 'AB-123-CD', modele: 'Renault Trafic' }, notes: '', source: 'marketplace' },
  { id: 'ch2', titre: 'Mise aux normes électriques — Copropriété Les Oliviers', description: 'Tableau électrique + câblage complet appartement T4.', adresse: '5 rue Pasteur, 13006 Marseille', client: 'Copropriété Les Oliviers', statut: 'planifie', priorite: null, budgetPrevu: 4800, budgetReel: null, caDevis: 5200, avancement: 0, dateDebut: '2026-04-28', dateFin: '2026-05-10', equipe: ['Claire Bernard'], vehicule: null, notes: '', source: 'direct' },
  { id: 'ch3', titre: 'Peinture parties communes — Syndic Voltaire', description: 'Peinture cage d\'escalier 4 étages + hall d\'entrée.', adresse: '15 bd Voltaire, 13005 Marseille', client: 'Syndic Voltaire', statut: 'en_cours', priorite: null, budgetPrevu: 6200, budgetReel: null, caDevis: 6200, avancement: 40, dateDebut: '2026-04-07', dateFin: '2026-04-18', equipe: ['Luc Moreau', 'Pierre Martin'], vehicule: { id: 2, immatriculation: 'EF-456-GH', modele: 'Citroën Berlingo' }, notes: '', source: 'direct' },
  { id: 'ch4', titre: 'Salle de bain complète — M. Rousseau', description: 'Douche à l\'italienne, meuble vasque, carrelage sol et murs.', adresse: '24 rue Paradis, 13006 Marseille', client: 'M. Rousseau', statut: 'terminee', priorite: null, budgetPrevu: 5500, budgetReel: 5500, caDevis: 5500, avancement: 100, dateDebut: '2026-03-10', dateFin: '2026-03-28', equipe: ['Sophie Duval', 'Lucas Garcia'], vehicule: null, notes: '', source: 'marketplace' },
  { id: 'ch5', titre: 'Extension garage — M. Leblanc', description: 'Construction extension garage 20m² : fondations, murs, toiture, enduit.', adresse: '8 bd Longchamp, 13001 Marseille', client: 'M. Leblanc', statut: 'en_attente', priorite: 'urgente', budgetPrevu: 15000, budgetReel: null, caDevis: null, avancement: 0, dateDebut: null, dateFin: null, equipe: [], vehicule: null, notes: 'En attente de devis', source: 'marketplace' },
];

const DEMO_EMPLOYES = [
  { id: 'e1', nom: 'Martin', prenom: 'Pierre', metier: 'Maçonnerie', habilitations: ['CACES R489', 'Travail en hauteur'], disponible: true },
  { id: 'e2', nom: 'Duval', prenom: 'Sophie', metier: 'Plomberie', habilitations: ['Habilitation électrique B1'], disponible: true },
  { id: 'e3', nom: 'Garcia', prenom: 'Lucas', metier: 'Carrelage', habilitations: ['Travail en hauteur'], disponible: true },
  { id: 'e4', nom: 'Moreau', prenom: 'Luc', metier: 'Peinture', habilitations: [], disponible: true },
  { id: 'e5', nom: 'Bernard', prenom: 'Claire', metier: 'Électricité', habilitations: ['Habilitation électrique B2', 'BR', 'HC'], disponible: true },
];

const DEMO_VEHICULES = [
  { id: 1, immatriculation: 'AB-123-CD', modele: 'Renault Trafic', type: 'Fourgon', capacite: '900 kg', kilometrage: 87400, couleur: '#5B5BD6', statut: 'en_mission', chantier: 'Rénovation cuisine — Mme Dupont', vidange: { date: '2024-11-10', km: 85000, prochainKm: 95000, intervalleKm: 10000 }, controleTechnique: { date: '2024-09-15', prochaineDate: '2026-09-15' }, assurance: { expiration: '2026-12-31' } },
  { id: 2, immatriculation: 'EF-456-GH', modele: 'Citroën Berlingo', type: 'Fourgonnette', capacite: '700 kg', kilometrage: 52100, couleur: '#34C759', statut: 'en_mission', chantier: 'Peinture — Syndic Voltaire', vidange: { date: '2025-01-20', km: 50000, prochainKm: 60000, intervalleKm: 10000 }, controleTechnique: { date: '2025-04-08', prochaineDate: '2027-04-08' }, assurance: { expiration: '2026-08-31' } },
  { id: 3, immatriculation: 'IJ-789-KL', modele: 'Peugeot Expert', type: 'Fourgon', capacite: '850 kg', kilometrage: 134200, couleur: '#FF9500', statut: 'disponible', chantier: null, vidange: { date: '2025-09-05', km: 130000, prochainKm: 140000, intervalleKm: 10000 }, controleTechnique: { date: '2025-11-22', prochaineDate: '2027-11-22' }, assurance: { expiration: '2026-11-30' } },
];

const DEMO_DEPENSES = [
  { id: 1, date: '2025-03-10', categorie: 'matériaux', description: 'Achat parpaings 20×20×50 (palette)', fournisseur: 'Point.P', montant: 1240 },
  { id: 2, date: '2025-03-12', categorie: 'équipement', description: 'Location nacelle 2 jours', fournisseur: 'Kiloutou', montant: 860 },
  { id: 3, date: '2025-03-15', categorie: 'main-d\'oeuvre', description: 'Intérimaire 3 jours', fournisseur: 'Manpower', montant: 720 },
  { id: 4, date: '2025-03-18', categorie: 'sous-traitance', description: 'Électricité — mise en conformité', fournisseur: 'Élec Pro 75', montant: 1800 },
  { id: 5, date: '2025-03-20', categorie: 'carburant', description: 'Carburant véhicule chantier', fournisseur: 'Total', montant: 95 },
];

const MAIN_TABS = ['Chantiers', 'Planning', 'Flotte'];
const JOURS_SEMAINE = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const STATUT_FILTERS = ['Tous', 'en_attente', 'planifie', 'assignee', 'en_cours', 'terminee', 'annulee'];
const STATUT_FILTER_LABELS = { Tous: 'Tous', en_attente: 'En attente', planifie: 'Planifié', assignee: 'Assignée', en_cours: 'En cours', terminee: 'Terminée', annulee: 'Annulée' };

const lbl = { display: 'block', fontSize: 12, fontWeight: 600, color: '#6E6E73', marginBottom: 4 };
const inp = { width: '100%', padding: '9px 12px', border: '1px solid #E5E5EA', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' };

/* ════════════════════════════════════════ */
export default function ChantiersEtMissions() {
  const { token } = useAuth();
  const isDemo = localStorage.getItem('token')?.endsWith('.dev');
  const [tab, setTab] = useState('Chantiers');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailChantier, setDetailChantier] = useState(null); // id du chantier ouvert en vue détail
  const [editModal, setEditModal] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  async function fetchItems() {
    setLoading(true);
    try {
      const [rm, rc] = await Promise.all([
        fetch(`${API_URL}/patron/missions`, { headers }),
        fetch(`${API_URL}/patron/chantiers`, { headers }),
      ]);
      const dm = await rm.json();
      const dc = await rc.json();
      const missions = (dm.missions || []).map(m => ({ ...m, titre: m.titre || m.nom }));
      const chantiers = (dc.chantiers || []).map(c => ({ ...c, titre: c.nom || c.titre, statut: c.statut === 'planifie' ? 'planifie' : c.statut === 'termine' ? 'terminee' : c.statut }));
      const all = [...missions, ...chantiers];
      setItems(all.length > 0 ? all : (isDemo ? DEMO_ITEMS : []));
    } catch {
      setItems(isDemo ? DEMO_ITEMS : []);
    }
    setLoading(false);
  }

  useEffect(() => { fetchItems(); }, []);

  async function changerStatut(id, statut) {
    try { await fetch(`${API_URL}/patron/missions/${id}/statut`, { method: 'PUT', headers, body: JSON.stringify({ statut }) }); } catch {}
    setItems(prev => prev.map(m => m.id === id ? { ...m, statut } : m));
    setSelectedItem(prev => prev?.id === id ? { ...prev, statut } : prev);
  }

  /* ── Vue d'ensemble ── */
  function TabOverview() {
    const en_cours = items.filter(i => ['en_cours', 'assignee'].includes(i.statut));
    const en_attente = items.filter(i => i.statut === 'en_attente');
    const termines = items.filter(i => ['terminee', 'termine'].includes(i.statut));
    const alertesBudget = items.filter(i => i.budgetReel && i.budgetPrevu && i.budgetReel > i.budgetPrevu * 1.1);
    const alertesRetard = items.filter(i => ['en_cours', 'assignee'].includes(i.statut) && i.dateFin && new Date(i.dateFin) < new Date());
    const alertesVehicules = (isDemo ? DEMO_VEHICULES : []).filter(v => ctExpired(v.controleTechnique?.prochaineDate) || ctSoon(v.controleTechnique?.prochaineDate) || vidangeAlert(v.vidange, v.kilometrage));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
          {[
            { label: 'Total', value: items.length, color: '#5B5BD6' },
            { label: 'En attente', value: en_attente.length, color: '#856404' },
            { label: 'En cours', value: en_cours.length, color: '#0C5460' },
            { label: 'Terminés', value: termines.length, color: '#1A7F43' },
            { label: 'Alertes budget', value: alertesBudget.length, color: '#C0392B' },
            { label: 'Alertes flotte', value: alertesVehicules.length, color: alertesVehicules.length > 0 ? '#FF9500' : '#636363' },
          ].map(k => (
            <div key={k.label} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: k.color, marginBottom: 8 }} />
              <div style={{ fontSize: 28, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 5 }}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {(alertesBudget.length > 0 || alertesRetard.length > 0 || alertesVehicules.length > 0) && (
          <div style={{ background: '#FFE5E5', border: '1px solid rgba(255,59,48,0.3)', borderRadius: 12, padding: '14px 18px' }}>
            <div style={{ fontWeight: 700, color: '#C0392B', fontSize: 14, marginBottom: 8 }}>Alertes</div>
            {alertesBudget.map(c => (
              <div key={c.id} onClick={() => { setSelectedItem(c); setTab('Chantiers'); }} style={{ fontSize: 13, color: '#C0392B', marginBottom: 4, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                <span>⚠ {c.titre} — Budget dépassé ({formatCur(c.budgetReel)} vs {formatCur(c.budgetPrevu)})</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>Voir →</span>
              </div>
            ))}
            {alertesRetard.map(c => (
              <div key={c.id} onClick={() => { setSelectedItem(c); setTab('Chantiers'); }} style={{ fontSize: 13, color: '#C0392B', marginBottom: 4, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                <span>⚠ {c.titre} — Date dépassée (prévu : {formatDate(c.dateFin)})</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>Voir →</span>
              </div>
            ))}
            {alertesVehicules.map(v => (
              <div key={v.id} onClick={() => setTab('Flotte')} style={{ fontSize: 13, color: '#856404', marginBottom: 4, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                <span>{v.modele} ({v.immatriculation}) — {ctExpired(v.controleTechnique?.prochaineDate) ? 'Contrôle technique dépassé' : ctSoon(v.controleTechnique?.prochaineDate) ? 'CT bientôt expiré' : 'Vidange proche'}</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>Voir →</span>
              </div>
            ))}
          </div>
        )}

        {/* Active items grid */}
        {en_cours.length > 0 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>En cours ({en_cours.length})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {en_cours.map(c => <ItemCard key={c.id} item={c} onClick={() => { setSelectedItem(c); setTab('Chantiers'); }} onOpenDetail={id => setDetailChantier(id)} />)}
            </div>
          </div>
        )}
        {en_attente.length > 0 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>En attente ({en_attente.length})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {en_attente.map(c => <ItemCard key={c.id} item={c} onClick={() => { setSelectedItem(c); setTab('Chantiers'); }} onOpenDetail={id => setDetailChantier(id)} />)}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── Missions & Chantiers list ── */
  function TabListe() {
    const [filtre, setFiltre] = useState('Tous');
    const [search, setSearch] = useState('');
    const [devisMode, setDevisMode] = useState(false);
    const [devisEnvoye, setDevisEnvoye] = useState(false);

    const filtered = items.filter(m => {
      const matchStatut = filtre === 'Tous' || m.statut === filtre;
      const matchSearch = !search || m.titre?.toLowerCase().includes(search.toLowerCase()) || m.client?.toLowerCase().includes(search.toLowerCase());
      return matchStatut && matchSearch;
    });

    function openItem(m) {
      if (selectedItem?.id === m.id) { setSelectedItem(null); return; }
      setSelectedItem(m);
      setDevisMode(false);
      setDevisEnvoye(false);
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Search + filters */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…" style={{ flex: 1, minWidth: 200, padding: '8px 14px', border: '1px solid #E5E5EA', borderRadius: 10, fontSize: 14, outline: 'none' }} />
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {STATUT_FILTERS.map(s => (
              <button key={s} onClick={() => setFiltre(s)} style={{ padding: '6px 14px', border: 'none', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 600, background: filtre === s ? '#1C1C1E' : '#F2F2F7', color: filtre === s ? '#fff' : '#6E6E73', transition: 'all 0.15s' }}>
                {STATUT_FILTER_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Cards + detail panel side by side on wide screens */}
        <div style={{ display: 'grid', gridTemplateColumns: selectedItem ? '1fr 420px' : '1fr', gap: 16, alignItems: 'start' }}>
          {/* Card grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {filtered.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#636363', background: '#fff', borderRadius: 14 }}>
                Aucun élément pour ce filtre
              </div>
            ) : filtered.map(m => (
              <ItemCard key={m.id} item={m} onClick={() => openItem(m)} isSelected={selectedItem?.id === m.id} onOpenDetail={id => setDetailChantier(id)} />
            ))}
          </div>

          {/* Detail panel */}
          {selectedItem && (
            <DetailPanel
              item={selectedItem}
              onClose={() => setSelectedItem(null)}
              onCancelRequest={() => setConfirmCancel(selectedItem.id)}
              onAccept={() => changerStatut(selectedItem.id, 'en_cours')}
              devisMode={devisMode}
              setDevisMode={setDevisMode}
              devisEnvoye={devisEnvoye}
              onDevisSoumis={() => setDevisEnvoye(true)}
              onUpdate={fetchItems}
              headers={headers}
            />
          )}
        </div>
      </div>
    );
  }

  /* ── Planning semaine (qui fait quoi où) ── */
  function VueSemaine() {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=dim, 1=lun
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const [weekOffset, setWeekOffset] = useState(0);
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset + weekOffset * 7);

    const weekDays = JOURS_SEMAINE.map((nom, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return { nom, date: d, dateStr: d.toISOString().slice(0, 10), isToday: d.toDateString() === today.toDateString() };
    });

    const activeItems = items.filter(m => m.dateDebut && m.statut !== 'terminee' && m.statut !== 'annulee');

    // Pour chaque chantier, déterminer s'il est actif chaque jour de la semaine
    function isChantierActiveOnDay(item, dayStr) {
      const d = new Date(dayStr);
      const debut = new Date(item.dateDebut);
      const fin = item.dateFin ? new Date(item.dateFin) : new Date(debut.getTime() + 30 * 86400000);
      return d >= debut && d <= fin;
    }

    // Ouvriers par chantier
    function getEquipe(item) {
      if (!item.equipe || item.equipe.length === 0) return [];
      return item.equipe.map(nom => {
        const emp = (isDemo ? DEMO_EMPLOYES : []).find(e => `${e.prenom} ${e.nom}`.toLowerCase().includes(nom.toLowerCase()) || nom.toLowerCase().includes(e.nom.toLowerCase()));
        return emp ? { id: emp.id, nom: `${emp.prenom} ${emp.nom[0]}.`, metier: emp.metier, disponible: emp.disponible } : { id: nom, nom: nom.split(' ').map((n,i) => i === 0 ? n : n[0]+'.').join(' '), metier: '', disponible: true };
      });
    }

    const weekLabel = `${weekDays[0].date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} — ${weekDays[5].date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;


    // Build conflict map per day (employees & vehicles)
    const conflictsPerDay = {};
    const vehicleConflictsPerDay = {};
    weekDays.forEach(d => {
      const empThisDay = {};
      const vehThisDay = {};
      activeItems.forEach(item => {
        if (!isChantierActiveOnDay(item, d.dateStr)) return;
        const equipeList = getEquipe(item);
        equipeList.forEach(e => {
          if (!empThisDay[e.nom]) empThisDay[e.nom] = [];
          empThisDay[e.nom].push(item.titre);
        });
        if (item.vehicule) {
          const vKey = String(item.vehicule.id || item.vehicule.immatriculation);
          if (!vehThisDay[vKey]) vehThisDay[vKey] = [];
          vehThisDay[vKey].push(item.titre);
        }
      });
      conflictsPerDay[d.dateStr] = Object.entries(empThisDay).filter(([, ch]) => ch.length > 1).map(([nom]) => nom);
      vehicleConflictsPerDay[d.dateStr] = Object.entries(vehThisDay).filter(([, ch]) => ch.length > 1).map(([vKey]) => vKey);
    });
    return (
      <div style={{ background: 'var(--card)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-sm)', marginBottom: 20 }}>
        {/* Header semaine */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '2px solid var(--border-light)' }}>
          <button onClick={() => setWeekOffset(w => w - 1)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Semaine prec.</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{weekLabel}</div>
            {weekOffset !== 0 && <button onClick={() => setWeekOffset(0)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>Revenir a cette semaine</button>}
          </div>
          <button onClick={() => setWeekOffset(w => w + 1)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Semaine suiv.</button>
        </div>

        {/* Grille */}
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: 800 }}>
            {/* En-tête jours */}
            <div style={{ display: 'grid', gridTemplateColumns: '180px repeat(6, 1fr)', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ padding: '8px 12px', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', borderRight: '1px solid var(--border-light)' }}>Chantier</div>
              {weekDays.map(d => (
                <div key={d.dateStr} style={{ padding: '8px 6px', textAlign: 'center', fontSize: 11, fontWeight: d.isToday ? 800 : 600, color: d.isToday ? 'var(--primary)' : 'var(--text-secondary)', background: d.isToday ? 'var(--primary-light, rgba(91,91,214,0.06))' : 'transparent', borderRight: '1px solid var(--border-light)' }}>
                  <div>{d.nom}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: d.isToday ? 'var(--primary)' : 'var(--text)' }}>{d.date.getDate()}</div>
                </div>
              ))}
            </div>

            {/* Lignes par chantier */}
            {activeItems.length === 0 && (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 13 }}>Aucun chantier actif cette semaine</div>
            )}
            {activeItems.map((item, idx) => {
              const equipe = getEquipe(item);
              const x = STATUT_MAP[item.statut] || {};
              return (
                <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '180px repeat(6, 1fr)', borderBottom: '1px solid var(--border-light)', background: idx % 2 === 0 ? 'var(--card)' : 'var(--bg)' }}>
                  {/* Nom chantier */}
                  <div style={{ padding: '10px 12px', borderRight: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.titre}>
                      {item.titre?.split('—')[0]?.trim() || item.titre}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>{item.client}</div>
                    {equipe.length === 0 && <div style={{ fontSize: 10, color: '#DC2626', fontWeight: 600, marginTop: 2 }}>Aucun ouvrier</div>}
                  </div>

                  {/* Cases jours */}
                  {weekDays.map(d => {
                    const active = isChantierActiveOnDay(item, d.dateStr);
                    const isSamedi = d.nom === 'Samedi';
                    const hasVehicleConflict = active && item.vehicule && vehicleConflictsPerDay[d.dateStr]?.includes(String(item.vehicule.id || item.vehicule.immatriculation));
                    return (
                      <div key={d.dateStr} style={{ padding: '6px 4px', borderRight: '1px solid var(--border-light)', minHeight: 50, background: !active ? (isSamedi ? 'var(--bg)' : 'transparent') : d.isToday ? 'rgba(91,91,214,0.04)' : 'transparent', display: 'flex', flexDirection: 'column', gap: 2, justifyContent: 'center' }}>
                        {active && equipe.length > 0 && equipe.map(e => {
                          const isConflict = conflictsPerDay[d.dateStr]?.includes(e.nom);
                          return (
                          <div key={e.id} style={{ fontSize: 10, fontWeight: 600, padding: '3px 6px', borderRadius: 4, background: isConflict ? '#FFF3E0' : e.disponible ? (x.color || 'var(--primary)') + '18' : '#FEF2F2', color: isConflict ? '#E65100' : e.disponible ? (x.color || 'var(--primary)') : '#DC2626', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', border: isConflict ? '1px solid #FF9800' : 'none' }} title={isConflict ? `${e.nom} — CONFLIT : assigné sur plusieurs chantiers` : `${e.nom} — ${e.metier}`}>
                            {isConflict && <span style={{ marginRight: 3, fontWeight: 800 }}>!</span>}{e.nom}
                          </div>
                          );
                        })}
                        {active && hasVehicleConflict && (
                          <div style={{ fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 3, background: '#FFEBEE', color: '#C62828', border: '1px solid #EF5350', textAlign: 'center' }} title="Véhicule assigné sur plusieurs chantiers">
                            !! Véhicule
                          </div>
                        )}
                        {active && equipe.length === 0 && (
                          <div style={{ fontSize: 10, color: '#DC2626', fontWeight: 600, textAlign: 'center' }}>—</div>
                        )}
                        {!active && <div style={{ fontSize: 9, color: 'var(--text-tertiary)', textAlign: 'center', opacity: 0.4 }}>—</div>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Légende */}
        <div style={{ padding: '8px 16px', background: 'var(--bg)', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-tertiary)', flexWrap: 'wrap' }}>
          <span>Ouvriers assignés par chantier et par jour</span>
          <span style={{ color: '#DC2626' }}>Rouge = indisponible</span>
          <span style={{ color: '#E65100' }}>Orange ! = conflit ouvrier</span>
          <span style={{ color: '#C62828' }}>!! Véhicule = conflit véhicule</span>
          <span>Naviguer : semaine prec. / suiv.</span>
        </div>
      </div>
    );
  }

  /* ── Gantt tab (drag & drop) ── */
  function TabGantt() {
    const today = new Date();
    const ganttItems = items.filter(m => m.dateDebut);
    const dates = ganttItems.map(m => new Date(m.dateDebut)).concat(ganttItems.filter(m => m.dateFin).map(m => new Date(m.dateFin)));
    const minDate = dates.length ? new Date(Math.min(...dates)) : new Date();
    const maxDate = dates.length ? new Date(Math.max(...dates)) : new Date(Date.now() + 30 * 86400000);
    const totalDays = Math.max(jours(minDate.toISOString(), maxDate.toISOString()) || 30, 30) + 5;
    const rowRef = useRef(null);
    const dragRef = useRef(null); // { itemId, startX, origDebut, origFin, durDays }

    function dateToOffset(dateStr) {
      return jours(minDate.toISOString(), dateStr) || 0;
    }
    function offsetToDate(offset) {
      const d = new Date(minDate);
      d.setDate(d.getDate() + Math.round(offset));
      return d.toISOString().slice(0, 10);
    }

    function getRowWidth() {
      return rowRef.current?.getBoundingClientRect().width || 600;
    }

    function onBarMouseDown(e, item) {
      e.preventDefault();
      const dur = item.dateFin ? jours(item.dateDebut, item.dateFin) : 14;
      dragRef.current = { itemId: item.id, startX: e.clientX, origDebut: item.dateDebut, durDays: dur };

      function onMove(ev) {
        const dx = ev.clientX - dragRef.current.startX;
        const rowWidth = getRowWidth();
        const dayDelta = Math.round((dx / rowWidth) * totalDays);
        const origOffset = dateToOffset(dragRef.current.origDebut);
        const newOffset = Math.max(0, origOffset + dayDelta);
        const newDebut = offsetToDate(newOffset);
        const newFin = offsetToDate(newOffset + dragRef.current.durDays);
        setItems(prev => prev.map(it =>
          it.id === dragRef.current.itemId
            ? { ...it, dateDebut: newDebut, dateFin: newFin }
            : it
        ));
      }
      function onUp() {
        dragRef.current = null;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }

    const todayPct = (jours(minDate.toISOString(), today.toISOString()) / totalDays) * 100;

    return (
      <div style={{ background: 'var(--card)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
        <div style={{ minWidth: 700 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', borderBottom: '2px solid var(--border-light)' }}>
            <div style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5, borderRight: '1px solid var(--border-light)' }}>Mission / Chantier</div>
            <div style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Planning — <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Glisser les barres pour déplacer</span>
            </div>
          </div>
          {ganttItems.map((item, i) => {
            const startOff = dateToOffset(item.dateDebut);
            const endOff = item.dateFin ? dateToOffset(item.dateFin) : startOff + 14;
            const leftPct = (startOff / totalDays) * 100;
            const widthPct = Math.max(((endOff - startOff) / totalDays) * 100, 1.5);
            const x = STATUT_MAP[item.statut] || {};
            const barColor = x.color || '#5B5BD6';
            return (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '220px 1fr', borderBottom: '1px solid var(--border-light)', background: i % 2 === 0 ? 'var(--card)' : 'var(--bg)', alignItems: 'center' }}>
                <div style={{ padding: '10px 16px', borderRight: '1px solid var(--border-light)' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.titre}>{item.titre}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                    {item.dateDebut} {item.dateFin ? `→ ${item.dateFin}` : ''}
                  </div>
                </div>
                <div ref={i === 0 ? rowRef : null} style={{ padding: '8px 12px', position: 'relative', height: 48, display: 'flex', alignItems: 'center', userSelect: 'none' }}>
                  {todayPct >= 0 && todayPct <= 100 && (
                    <div style={{ position: 'absolute', left: `${todayPct}%`, top: 0, bottom: 0, width: 1.5, background: '#FF3B30', zIndex: 2, pointerEvents: 'none' }} />
                  )}
                  <div
                    onMouseDown={e => onBarMouseDown(e, item)}
                    style={{
                      position: 'absolute', left: `${leftPct}%`, width: `${widthPct}%`,
                      height: 28, borderRadius: 6, background: barColor, opacity: 0.85,
                      cursor: 'grab', zIndex: 3, display: 'flex', alignItems: 'center',
                      paddingLeft: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      transition: dragRef.current ? 'none' : 'left 0.05s',
                    }}
                  >
                    {item.avancement > 0 && (
                      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${item.avancement}%`, background: 'rgba(0,0,0,0.18)', borderRadius: 6 }} />
                    )}
                    <span style={{ fontSize: 10, color: '#fff', fontWeight: 700, position: 'relative', zIndex: 1, whiteSpace: 'nowrap' }}>
                      {item.avancement > 0 ? `${item.avancement}%` : ''}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: '8px 16px', background: 'var(--bg)', borderTop: '1px solid var(--border-light)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {Object.entries(STATUT_MAP).filter(([, v]) => v).slice(0, 5).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-tertiary)' }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: v.color }} />
              {v.label}
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#FF3B30' }}>
            <div style={{ width: 12, height: 2, background: '#FF3B30' }} /> Aujourd'hui
          </div>
        </div>
      </div>
    );
  }

  /* ── Dépenses tab ── */
  function TabDepenses() {
    const [itemId, setItemId] = useState(items[0]?.id || '');
    const [depenses, setDepenses] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [caDevis, setCaDevis] = useState('');
    const [showCaEdit, setShowCaEdit] = useState(false);
    const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], categorie: 'matériaux', montant: '', description: '', fournisseur: '' });
    const [saving, setSaving] = useState(false);

    const item = items.find(c => String(c.id) === String(itemId));
    const CATS = ['matériaux', 'main-d\'oeuvre', 'équipement', 'sous-traitance', 'carburant', 'divers'];
    const CAT_COLORS = { 'matériaux': '#5B5BD6', 'main-d\'oeuvre': '#34C759', 'équipement': '#FF9500', 'sous-traitance': '#AF52DE', 'carburant': '#FF3B30', 'divers': '#636363' };

    useEffect(() => {
      if (!itemId) return;
      fetch(`${API_URL}/patron/chantiers/${itemId}/depenses`, { headers })
        .then(r => r.json()).then(d => setDepenses(d.depenses || (isDemo ? DEMO_DEPENSES : []))).catch(() => setDepenses(isDemo ? DEMO_DEPENSES : []));
      const it = items.find(x => String(x.id) === String(itemId));
      if (it?.caDevis) setCaDevis(String(it.caDevis));
    }, [itemId]);

    const totalDepenses = depenses.reduce((s, d) => s + Number(d.montant || 0), 0);
    const parCategorie = depenses.reduce((acc, d) => { acc[d.categorie] = (acc[d.categorie] || 0) + Number(d.montant); return acc; }, {});
    const caVal = Number(caDevis) || 0;
    const margeEuros = caVal - totalDepenses;
    const margePct = caVal > 0 ? (margeEuros / caVal) * 100 : null;
    const margeColor = margePct === null ? '#636363' : margePct >= 25 ? '#34C759' : margePct >= 10 ? '#FF9500' : '#FF3B30';

    async function handleAdd(e) {
      e.preventDefault();
      setSaving(true);
      try {
        await fetch(`${API_URL}/patron/chantiers/${itemId}/depenses`, { method: 'POST', headers, body: JSON.stringify(form) });
      } catch {}
      setDepenses(prev => [{ ...form, id: Date.now(), montant: Number(form.montant) }, ...prev]);
      setShowForm(false);
      setForm({ date: new Date().toISOString().split('T')[0], categorie: 'matériaux', montant: '', description: '', fournisseur: '' });
      setSaving(false);
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#6E6E73' }}>Mission / Chantier :</label>
          <select value={itemId} onChange={e => setItemId(e.target.value)} style={{ flex: 1, maxWidth: 340, padding: '8px 12px', border: '1px solid #E5E5EA', borderRadius: 10, fontSize: 13, outline: 'none' }}>
            {items.map(c => <option key={c.id} value={c.id}>{c.titre}</option>)}
          </select>
          <button onClick={() => setShowForm(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            <IconPlus size={13} /> Ajouter une dépense
          </button>
        </div>

        {/* Marge header */}
        {item && (
          <div style={{ background: 'linear-gradient(135deg, #1C1C1E, #2C2C2E)', borderRadius: 16, padding: '22px 26px', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 800 }}>{item.titre}</div>
                <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>{item.client} — Analyse de marge</div>
              </div>
              {statutBadge(item.statut)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>CA devis/facture HT</div>
                {showCaEdit ? (
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <input type="number" value={caDevis} onChange={e => setCaDevis(e.target.value)} style={{ width: 100, padding: '4px 8px', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 700 }} />
                    <button onClick={() => setShowCaEdit(false)} style={{ background: '#34C759', border: 'none', borderRadius: 6, color: '#fff', padding: '4px 10px', cursor: 'pointer', fontWeight: 700 }}>OK</button>
                  </div>
                ) : (
                  <div onClick={() => setShowCaEdit(true)} style={{ fontSize: 20, fontWeight: 800, marginTop: 4, cursor: 'pointer' }} title="Cliquer pour modifier">
                    {caVal > 0 ? formatCur(caVal) : <span style={{ opacity: 0.5, fontSize: 13 }}>Cliquer pour saisir</span>}
                  </div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>Total dépenses</div>
                <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, color: totalDepenses > caVal * 0.9 ? '#FF6B6B' : '#fff' }}>{formatCur(totalDepenses)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>Marge brute</div>
                <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4, color: margeColor }}>{margePct !== null ? `${margePct.toFixed(1)}%` : '—'}</div>
                {margeEuros !== 0 && <div style={{ fontSize: 12, opacity: 0.8 }}>{formatCur(margeEuros)}</div>}
              </div>
            </div>
          </div>
        )}

        {/* Add form */}
        {showForm && (
          <form onSubmit={handleAdd} style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Nouvelle dépense</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={lbl}>Date</label><input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inp} /></div>
              <div><label style={lbl}>Catégorie</label>
                <select value={form.categorie} onChange={e => setForm(p => ({ ...p, categorie: e.target.value }))} style={inp}>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div><label style={lbl}>Montant TTC (€)</label><input type="number" step="0.01" value={form.montant} onChange={e => setForm(p => ({ ...p, montant: e.target.value }))} required style={inp} /></div>
              <div><label style={lbl}>Fournisseur</label><input value={form.fournisseur} onChange={e => setForm(p => ({ ...p, fournisseur: e.target.value }))} style={inp} /></div>
              <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Description</label><input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} required style={inp} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '8px 18px', border: '1px solid #E5E5EA', borderRadius: 10, background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Annuler</button>
              <button type="submit" disabled={saving} style={{ padding: '8px 18px', border: 'none', borderRadius: 10, background: '#5B5BD6', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>{saving ? '…' : 'Ajouter'}</button>
            </div>
          </form>
        )}

        {/* Répartition par catégorie */}
        {depenses.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 14, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Répartition</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(parCategorie).sort((a, b) => b[1] - a[1]).map(([cat, mt]) => (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                    <span style={{ fontWeight: 600, color: CAT_COLORS[cat] || '#636363' }}>{cat}</span>
                    <span style={{ fontWeight: 700 }}>{formatCur(mt)} <span style={{ color: '#636363', fontWeight: 400 }}>({totalDepenses > 0 ? ((mt / totalDepenses) * 100).toFixed(0) : 0}%)</span></span>
                  </div>
                  <div style={{ background: '#F2F2F7', borderRadius: 6, height: 7, overflow: 'hidden' }}>
                    <div style={{ width: `${totalDepenses > 0 ? (mt / totalDepenses) * 100 : 0}%`, height: '100%', background: CAT_COLORS[cat] || '#636363', borderRadius: 6, transition: 'width 0.5s' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dépenses list */}
        <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F2F2F7' }}>
                {['Date', 'Catégorie', 'Description', 'Fournisseur', 'Montant'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {depenses.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 30, textAlign: 'center', color: '#636363' }}>Aucune dépense</td></tr>
              ) : depenses.map((d, i) => (
                <tr key={d.id || i} style={{ borderBottom: '1px solid #F2F2F7', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '10px 14px', color: '#6E6E73' }}>{formatDate(d.date)}</td>
                  <td style={{ padding: '10px 14px' }}><span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${CAT_COLORS[d.categorie] || '#636363'}18`, color: CAT_COLORS[d.categorie] || '#636363' }}>{d.categorie}</span></td>
                  <td style={{ padding: '10px 14px', fontWeight: 500 }}>{d.description}</td>
                  <td style={{ padding: '10px 14px', color: '#6E6E73' }}>{d.fournisseur || '—'}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'right' }}>{formatCur(d.montant)}</td>
                </tr>
              ))}
              {depenses.length > 0 && (
                <tr style={{ background: '#F8F9FA', borderTop: '2px solid #E5E5EA' }}>
                  <td colSpan={4} style={{ padding: '10px 14px', fontWeight: 700, fontSize: 13 }}>Total</td>
                  <td style={{ padding: '10px 14px', fontWeight: 800, fontSize: 14, color: '#5B5BD6', textAlign: 'right' }}>{formatCur(totalDepenses)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  /* ── Rentabilité tab ── */
  function TabRentabilite() {
    const itemsWithData = items.map(it => {
      const budget = Number(it.budgetPrevu) || 0;
      const reel = Number(it.budgetReel) || 0;
      const ca = Number(it.caDevis) || 0;
      const marge = ca > 0 ? ca - reel : budget > 0 ? budget - reel : null;
      const margePct = ca > 0 && marge !== null ? (marge / ca) * 100 : null;
      return { ...it, budget, reel, ca, marge, margePct };
    });

    const totalCA = itemsWithData.reduce((s, i) => s + i.ca, 0);
    const totalReel = itemsWithData.reduce((s, i) => s + i.reel, 0);
    const totalMarge = totalCA - totalReel;
    const totalMargePct = totalCA > 0 ? (totalMarge / totalCA) * 100 : null;

    function margeColor(pct) {
      if (pct === null) return '#636363';
      if (pct >= 25) return '#34C759';
      if (pct >= 10) return '#FF9500';
      return '#FF3B30';
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* KPI summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
          {[
            { label: 'CA total devis', val: `${totalCA.toLocaleString('fr-FR')} €`, color: 'var(--primary)' },
            { label: 'Dépenses réelles', val: `${totalReel.toLocaleString('fr-FR')} €`, color: '#FF9500' },
            { label: 'Marge brute', val: `${totalMarge.toLocaleString('fr-FR')} €`, color: margeColor(totalMargePct) },
            { label: 'Taux de marge', val: totalMargePct !== null ? `${totalMargePct.toFixed(1)} %` : '—', color: margeColor(totalMargePct) },
          ].map(k => (
            <div key={k.label} className="stat-card">
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500, marginBottom: 6 }}>{k.label}</p>
              <p style={{ fontSize: '1.375rem', fontWeight: 700, color: k.color, letterSpacing: '-0.02em' }}>{k.val}</p>
            </div>
          ))}
        </div>

        {/* Per-chantier table */}
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-light)' }}>
            <h2 className="section-title">Rentabilité par chantier</h2>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Chantier</th>
                <th>CA devis</th>
                <th>Budget prévu</th>
                <th>Dépenses réelles</th>
                <th>Marge €</th>
                <th>Marge %</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {itemsWithData.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><p className="empty-state-text">Aucun chantier</p></div></td></tr>
              ) : itemsWithData.map(it => (
                <tr key={it.id}>
                  <td style={{ fontWeight: 500, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.titre}</td>
                  <td>{it.ca > 0 ? `${it.ca.toLocaleString('fr-FR')} €` : '—'}</td>
                  <td>{it.budget > 0 ? `${it.budget.toLocaleString('fr-FR')} €` : '—'}</td>
                  <td>{it.reel > 0 ? `${it.reel.toLocaleString('fr-FR')} €` : '—'}</td>
                  <td style={{ fontWeight: 600, color: it.marge !== null ? margeColor(it.margePct) : 'var(--text-tertiary)' }}>
                    {it.marge !== null ? `${it.marge.toLocaleString('fr-FR')} €` : '—'}
                  </td>
                  <td>
                    {it.margePct !== null ? (
                      <span style={{ background: margeColor(it.margePct) + '22', color: margeColor(it.margePct), borderRadius: 6, padding: '2px 8px', fontWeight: 600, fontSize: '0.8125rem' }}>
                        {it.margePct.toFixed(1)} %
                      </span>
                    ) : '—'}
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                      {it.statut?.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
          Les dépenses réelles se saisissent dans l'onglet "Dépenses". Le CA correspond au montant du devis signé.
        </p>
      </div>
    );
  }

  /* ── Ajouter tab ── */
  function TabAjouter() {
    const [form, setForm] = useState({ titre: '', client: '', adresse: '', budgetPrevu: '', dateDebut: '', dateFin: '', statut: 'en_attente', description: '' });
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);
    const [distanceInfo, setDistanceInfo] = useState(null);
    const [calcDistance, setCalcDistance] = useState(false);

    // Calcul automatique de la distance quand l'adresse change
    async function calculerDistance(adresse) {
      if (!adresse || adresse.length < 8) { setDistanceInfo(null); return; }
      setCalcDistance(true);
      const result = await calculerDistanceEntreAdresses(ADRESSE_DEPOT, adresse);
      if (result) {
        const trajet = calculerIndemniteTrajet(result.distanceKm);
        setDistanceInfo({ km: result.distanceKm, depart: result.depart, arrivee: result.arrivee, ...trajet });
      } else {
        setDistanceInfo({ km: null, erreur: 'Adresse non trouvée' });
      }
      setCalcDistance(false);
    }

    async function handleSubmit(e) {
      e.preventDefault();
      setSaving(true);
      const payload = { ...form, distanceDepot: distanceInfo?.km || null, source: 'manual' };
      try {
        await fetch(`${API_URL}/patron/missions`, { method: 'POST', headers, body: JSON.stringify(payload) });
      } catch {}
      await fetchItems();
      setSaving(false);
      setDone(true);
    }

    if (done) return (
      <div style={{ background: '#fff', borderRadius: 14, padding: 40, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#D1F2E0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 20, color: '#1A7F43', fontWeight: 700 }}>OK</div>
        <p style={{ fontWeight: 700, fontSize: 16 }}>Mission / Chantier ajouté !</p>
        <button onClick={() => { setDone(false); setTab('Chantiers'); }} style={{ marginTop: 14, padding: '10px 24px', border: 'none', borderRadius: 10, background: '#5B5BD6', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Voir la liste</button>
      </div>
    );

    const manualCount = items.filter(i => i.source === 'manual' || !i.source).length;
    const isBlocked = manualCount >= 5;

    return (
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 14, padding: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Nouveau chantier / mission</h3>
          <span style={{ fontSize: 12, fontWeight: 600, color: isBlocked ? '#C0392B' : '#A68B4B', background: isBlocked ? '#FFE5E5' : '#FFF7E0', padding: '4px 12px', borderRadius: 20 }}>{manualCount}/5 chantiers manuels</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Titre *</label><input value={form.titre} onChange={e => setForm(p => ({ ...p, titre: e.target.value }))} placeholder="Rénovation appartement Dupont" required style={inp} /></div>
          <div><label style={lbl}>Client</label><input value={form.client} onChange={e => setForm(p => ({ ...p, client: e.target.value }))} placeholder="Jean Dupont" style={inp} /></div>
          <div>
            <label style={lbl}>Adresse du chantier</label>
            <div style={{ display:'flex', gap:6 }}>
              <input value={form.adresse} onChange={e => setForm(p => ({ ...p, adresse: e.target.value }))} onBlur={() => calculerDistance(form.adresse)} placeholder="12 rue des Fleurs, Marseille" style={{ ...inp, flex:1 }} />
              <button type="button" onClick={() => calculerDistance(form.adresse)} disabled={calcDistance} style={{ padding:'8px 14px', border:'none', borderRadius:8, background:'#5B5BD6', color:'#fff', cursor:'pointer', fontSize:11, fontWeight:600, whiteSpace:'nowrap', opacity:calcDistance?0.5:1 }}>{calcDistance ? '...' : 'Calculer'}</button>
            </div>
            {distanceInfo && distanceInfo.km !== null && (
              <div style={{ marginTop:6, padding:'8px 12px', background:'#F0FDF4', border:'1px solid #16A34A25', borderRadius:8, fontSize:11, display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
                <span><strong>{distanceInfo.km} km</strong> depuis le dépôt</span>
                <span style={{ color:'#555' }}>Zone : {distanceInfo.zone}</span>
                <span style={{ fontWeight:700, color:'#2563EB' }}>Indemnité : {distanceInfo.indemnite}€/jour</span>
                {distanceInfo.grandDeplacement && <span style={{ fontWeight:700, color:'#DC2626' }}>Grand déplacement</span>}
                <span style={{ fontSize:10, color:'#888' }}>via api-adresse.data.gouv.fr</span>
              </div>
            )}
            {distanceInfo && distanceInfo.erreur && (
              <div style={{ marginTop:6, padding:'6px 12px', background:'#FEF2F2', border:'1px solid #DC262625', borderRadius:8, fontSize:11, color:'#DC2626' }}>{distanceInfo.erreur}</div>
            )}
          </div>
          <div><label style={lbl}>Budget prévu (€)</label><input type="number" value={form.budgetPrevu} onChange={e => setForm(p => ({ ...p, budgetPrevu: e.target.value }))} style={inp} /></div>
          <div>
            <label style={lbl}>Statut initial</label>
            <select value={form.statut} onChange={e => setForm(p => ({ ...p, statut: e.target.value }))} style={inp}>
              <option value="en_attente">En attente</option>
              <option value="planifie">Planifié</option>
              <option value="en_cours">En cours</option>
            </select>
          </div>
          <div><label style={lbl}>Date début</label><input type="date" value={form.dateDebut} onChange={e => setForm(p => ({ ...p, dateDebut: e.target.value }))} style={inp} /></div>
          <div><label style={lbl}>Date fin prévue</label><input type="date" value={form.dateFin} onChange={e => setForm(p => ({ ...p, dateFin: e.target.value }))} style={inp} /></div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={lbl}>Équipe assignée</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(isDemo ? DEMO_EMPLOYES : []).map(e => {
                const selected = (form.equipe || []).includes(`${e.prenom} ${e.nom}`);
                return <button key={e.id} type="button" onClick={() => {
                  const nom = `${e.prenom} ${e.nom}`;
                  setForm(p => ({ ...p, equipe: selected ? (p.equipe || []).filter(x => x !== nom) : [...(p.equipe || []), nom] }));
                }} style={{ padding: '6px 12px', fontSize: 12, fontWeight: 600, border: `1px solid ${selected ? '#5B5BD6' : '#E5E5EA'}`, background: selected ? '#EEF2FF' : 'transparent', color: selected ? '#5B5BD6' : '#6E6E73', cursor: 'pointer', borderRadius: 8 }}>
                  {selected ? '✓ ' : ''}{e.prenom} {e.nom} ({e.metier})
                </button>;
              })}
            </div>
          </div>
          <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Description / Notes</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} /></div>
        </div>
        {isBlocked ? (
          <div style={{ background: '#FFF7E0', border: '1px solid #A68B4B40', padding: '16px', marginTop: 12, textAlign: 'center', borderRadius: 10 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#A68B4B', marginBottom: 6 }}>Limite de 5 chantiers manuels atteinte</div>
            <div style={{ fontSize: 12, color: '#6E6E73', marginBottom: 12 }}>Trouvez vos prochains clients directement sur Freample et gérez un nombre illimité de chantiers.</div>
            <button type="button" onClick={() => { window.location.href = '/patron/projets'; }} style={{ padding: '10px 24px', background: '#A68B4B', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Voir les projets disponibles</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setTab('Chantiers')} style={{ padding: '9px 20px', border: '1px solid #E5E5EA', borderRadius: 10, background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Annuler</button>
            <button type="submit" disabled={saving} style={{ padding: '9px 24px', border: 'none', borderRadius: 10, background: '#5B5BD6', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}>{saving ? 'Enregistrement…' : 'Créer'}</button>
          </div>
        )}
      </form>
    );
  }

  /* ── Main render ── */
  const tabContent = {
    'Chantiers': <><VueSemaine /><TabListe /></>,
    'Planning': <GanttPlanning items={items} employes={isDemo ? DEMO_EMPLOYES : []} onOpenDetail={(id) => { setSelectedItem(id); setDetailChantier(id); }} />,
    'Flotte': <FlotteView />,
    'Ajouter': <TabAjouter />,
  };

  return (
    <div style={{ padding: 28, maxWidth: 1280, margin: '0 auto' }}>
      {/* Confirm cancel overlay */}
      {confirmCancel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 380, width: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#FFF3CD', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 16, color: '#856404', fontWeight: 700 }}>!</div>
            <h3 style={{ margin: '0 0 10px', fontSize: 17, fontWeight: 700 }}>Annuler la mission ?</h3>
            <p style={{ fontSize: 14, color: '#6E6E73', marginBottom: 22, lineHeight: 1.6 }}>
              Voulez-vous vraiment annuler <strong>"{items.find(m => m.id === confirmCancel)?.titre}"</strong> ?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmCancel(null)} style={{ flex: 1, padding: '11px 0', border: '1px solid #E5E5EA', borderRadius: 10, background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Non, garder</button>
              <button onClick={() => { changerStatut(confirmCancel, 'annulee'); setConfirmCancel(null); setSelectedItem(null); }} style={{ flex: 1, padding: '11px 0', border: 'none', borderRadius: 10, background: '#FF3B30', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>Oui, annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editModal && <EditModal item={editModal} onClose={() => setEditModal(null)} onSave={fetchItems} headers={headers} />}

      {/* ── Vue détail chantier ── */}
      {detailChantier ? (
        <ChantierDetail
          chantier={items.find(x => x.id === detailChantier)}
          employes={isDemo ? DEMO_EMPLOYES : []}
          vehicules={isDemo ? DEMO_VEHICULES : []}
          depenses={(isDemo ? DEMO_DEPENSES : []).filter(d => !d.chantierId || d.chantierId === detailChantier)}
          onBack={() => setDetailChantier(null)}
          onUpdate={(updated) => setItems(prev => prev.map(x => x.id === updated.id ? updated : x))}
          showToast={(msg) => {}}
        />
      ) : (<>
        <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0 }}>Chantiers</h1>
            <p style={{ color: '#6E6E73', marginTop: 4, fontSize: 14 }}>Planning · Suivi · Flotte</p>
          </div>
          <button onClick={() => setTab('Ajouter')} style={{ padding: '9px 18px', border: 'none', borderRadius: 10, background: '#5B5BD6', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>+ Nouveau chantier</button>
        </div>

        <div style={{ display: 'flex', gap: 4, background: '#F2F2F7', borderRadius: 12, padding: 4, marginBottom: 24, flexWrap: 'wrap' }}>
          {MAIN_TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 16px', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
              background: tab === t ? '#fff' : 'transparent',
              color: tab === t ? '#1C1C1E' : '#6E6E73',
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.10)' : 'none',
            }}>{t}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#636363' }}>Chargement…</div>
        ) : tabContent[tab]}
      </>)}
    </div>
  );
}

/* ════════ ItemCard ════════ */
function ItemCard({ item, onClick, isSelected, onOpenDetail }) {
  const color = progressColor(item.avancement || 0);
  const ecart = item.budgetReel && item.budgetPrevu ? ((item.budgetReel - item.budgetPrevu) / item.budgetPrevu * 100) : 0;

  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 14, padding: 18, boxShadow: isSelected ? '0 0 0 2px #5B5BD6, 0 4px 16px rgba(0,122,255,0.15)' : '0 1px 4px rgba(0,0,0,0.08)',
      cursor: 'pointer', transition: 'all 0.15s', border: isSelected ? '1px solid #5B5BD6' : '1px solid transparent',
    }}
      onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; } }}
      onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'none'; } }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#1C1C1E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.titre}>{item.titre}</div>
          {item.client && <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 2 }}>{item.client}</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          {statutBadge(item.statut)}
          {item.priorite && prioBadge(item.priorite)}
        </div>
      </div>

      {/* Progress bar */}
      {item.avancement > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
            <span style={{ color: '#6E6E73' }}>Avancement</span>
            <span style={{ fontWeight: 700, color }}>{item.avancement}%</span>
          </div>
          <div style={{ background: '#F2F2F7', borderRadius: 6, height: 7, overflow: 'hidden' }}>
            <div style={{ width: `${item.avancement}%`, height: '100%', background: color, borderRadius: 6, transition: 'width 0.4s' }} />
          </div>
        </div>
      )}

      {/* Budget */}
      {item.budgetPrevu && (
        <div style={{ display: 'grid', gridTemplateColumns: item.budgetReel ? '1fr 1fr' : '1fr', gap: 8, background: '#FAFAFA', borderRadius: 8, padding: '8px 10px', marginBottom: 10, fontSize: 12 }}>
          <div>
            <div style={{ color: '#636363', fontSize: 11 }}>Budget prévu</div>
            <div style={{ fontWeight: 600 }}>{formatCur(item.budgetPrevu)}</div>
          </div>
          {item.budgetReel && (
            <div>
              <div style={{ color: '#636363', fontSize: 11 }}>Réel {ecart !== 0 && <span style={{ color: ecart > 10 ? '#C0392B' : '#856404' }}>({ecart > 0 ? '+' : ''}{ecart.toFixed(0)}%)</span>}</div>
              <div style={{ fontWeight: 600, color: ecart > 10 ? '#C0392B' : ecart > 0 ? '#856404' : '#1A7F43' }}>{formatCur(item.budgetReel)}</div>
            </div>
          )}
        </div>
      )}

      {/* Équipe */}
      {item.equipe?.length > 0 ? (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
          {item.equipe.map((nom, i) => (
            <span key={i} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', background: '#F2F2F7', color: '#636363', borderRadius: 4 }}>
              {nom.split(' ').map((n, j) => j === 0 ? n : n[0] + '.').join(' ')}
            </span>
          ))}
          <button onClick={e => { e.stopPropagation(); onOpenDetail?.(item.id); }}
            style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', background: '#EFF6FF', color: '#2563EB', border: '1px solid #2563EB40', borderRadius: 4, cursor: 'pointer' }}>
            + Sous-traiter
          </button>
        </div>
      ) : (
        <InlineSousTraiter item={item} onOpenDetail={onOpenDetail} />
      )}

      {/* Marge */}
      {item.caDevis && item.budgetReel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: '#FAFAFA', borderRadius: 8, marginBottom: 10, fontSize: 12 }}>
          <span style={{ color: '#636363' }}>Marge</span>
          {(() => {
            const marge = item.caDevis - item.budgetReel;
            const pct = item.caDevis > 0 ? Math.round(marge / item.caDevis * 100) : 0;
            return <span style={{ fontWeight: 700, color: pct >= 20 ? '#1A7F43' : pct >= 10 ? '#856404' : '#C0392B' }}>{marge.toLocaleString()}€ ({pct}%)</span>;
          })()}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#636363', alignItems: 'center' }}>
        <span>{formatDate(item.dateDebut)}{item.dateFin ? ` → ${formatDate(item.dateFin)}` : ''}</span>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {item.equipe?.length > 0 && <span>{item.equipe.length} ouvrier{item.equipe.length > 1 ? 's' : ''}</span>}
          {onOpenDetail && <button onClick={e => { e.stopPropagation(); onOpenDetail(item.id); }} style={{ padding: '4px 12px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Ouvrir</button>}
        </div>
      </div>
    </div>
  );
}

/* ════════ DetailPanel ════════ */
function DetailPanel({ item, onClose, onCancelRequest, onAccept, devisMode, setDevisMode, devisEnvoye, onDevisSoumis, onUpdate, headers }) {
  const isDemo = localStorage.getItem('token')?.endsWith('.dev');
  const [panelTab, setPanelTab] = useState('infos');
  const [equipeIds, setEquipeIds] = useState(
    (isDemo ? DEMO_EMPLOYES : []).filter(e => (item.equipe || []).some(n => n.toLowerCase().includes(e.nom.toLowerCase()))).map(e => e.id)
  );
  const [filtreMetier, setFiltreMetier] = useState('');
  const [vehiculeId, setVehiculeId] = useState(item.vehicule?.id || '');
  const [notes, setNotes] = useState(item.notes || '');
  const [saving, setSaving] = useState(false);
  const [avancement, setAvancement] = useState(item.avancement || 0);
  const [messages, setMessages] = useState([
    { id: 1, from: 'patron', text: 'Bonjour, les travaux démarrent lundi 9h.', ts: '09:14' },
    { id: 2, from: 'client', text: 'Parfait, nous serons présents. Merci !', ts: '09:32' },
    { id: 3, from: 'patron', text: 'N\'oubliez pas de libérer l\'accès cave.', ts: '10:05' },
  ]);
  const [msgInput, setMsgInput] = useState('');

  const isEnAttente = item.statut === 'en_attente';
  const _employes = isDemo ? DEMO_EMPLOYES : [];
  const metiers = [...new Set(_employes.map(e => e.metier))];
  const employes = filtreMetier
    ? [..._employes.filter(e => e.metier === filtreMetier), ..._employes.filter(e => e.metier !== filtreMetier)]
    : _employes;

  function toggleEmploye(id) {
    setEquipeIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function getEquipeNoms() {
    return _employes.filter(e => equipeIds.includes(e.id)).map(e => `${e.prenom} ${e.nom}`);
  }

  async function handleSave() {
    setSaving(true);
    const vehicule = (isDemo ? DEMO_VEHICULES : []).find(v => String(v.id) === String(vehiculeId)) || null;
    const payload = { equipe: getEquipeNoms(), vehicule, notes, avancement };
    try { await fetch(`${API_URL}/patron/missions/${item.id}`, { method: 'PUT', headers, body: JSON.stringify(payload) }); } catch {}
    await onUpdate();
    setSaving(false);
  }

  return (
    <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.12)', overflow: 'hidden', position: 'sticky', top: 24 }}>
      {/* Header */}
      <div style={{ padding: '18px 20px', background: 'linear-gradient(135deg, #1C1C1E, #2C2C2E)', color: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.3, marginBottom: 4 }}>{item.titre}</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>{item.client}{item.adresse ? ` · ${item.adresse}` : ''}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, color: '#fff', width: 28, height: 28, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 10 }}>✕</button>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          {statutBadge(item.statut)}
          {item.priorite && prioBadge(item.priorite)}
        </div>
      </div>

      {/* Panel tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #F2F2F7', background: '#FAFAFA' }}>
        {[{ key: 'infos', label: 'Détails' }, { key: 'equipe', label: 'Équipe' }, { key: 'vehicule', label: 'Véhicule' }, { key: 'notes', label: 'Notes' }, { key: 'messages', label: '💬' }].map(t => (
          <button key={t.key} onClick={() => setPanelTab(t.key)} style={{ flex: 1, padding: '10px 0', border: 'none', borderBottom: panelTab === t.key ? '2px solid #5B5BD6' : '2px solid transparent', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: panelTab === t.key ? '#5B5BD6' : '#636363', transition: 'all 0.15s' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: 20, maxHeight: 520, overflowY: 'auto' }}>
        {/* ─ Détails tab ─ */}
        {panelTab === 'infos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { label: 'Statut', value: STATUT_MAP[item.statut]?.label || item.statut },
                { label: 'Client', value: item.client || '—' },
                { label: 'Adresse', value: item.adresse || '—' },
                { label: 'Budget prévu', value: item.budgetPrevu ? formatCur(item.budgetPrevu) : '—' },
                { label: 'Début', value: formatDate(item.dateDebut) },
                { label: 'Fin prévue', value: formatDate(item.dateFin) },
              ].map(f => (
                <div key={f.label} style={{ background: '#F8F9FA', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 10, color: '#636363', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 }}>{f.label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1C1E' }}>{f.value}</div>
                </div>
              ))}
            </div>

            {item.description && (
              <div style={{ background: '#F8F9FA', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 10, color: '#636363', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Description</div>
                <div style={{ fontSize: 13, color: '#3C3C43', lineHeight: 1.6 }}>{item.description}</div>
              </div>
            )}

            {/* Avancement slider for en_cours */}
            {['en_cours', 'assignee'].includes(item.statut) && (
              <div style={{ background: '#F8F9FA', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: '#636363', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Avancement</div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: progressColor(avancement) }}>{avancement}%</span>
                </div>
                <input type="range" min={0} max={100} step={5} value={avancement} onChange={e => setAvancement(Number(e.target.value))} style={{ width: '100%', marginBottom: 6 }} />
                <div style={{ background: '#E5E5EA', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                  <div style={{ width: `${avancement}%`, height: '100%', background: progressColor(avancement), borderRadius: 6, transition: 'width 0.3s' }} />
                </div>
              </div>
            )}

            {/* Patron actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {isEnAttente && !devisMode && (
                <>
                  <button onClick={onAccept} style={{ padding: '11px 0', border: 'none', borderRadius: 10, background: '#34C759', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                    Accepter la mission
                  </button>
                  <button onClick={() => setDevisMode(true)} style={{ padding: '11px 0', border: '2px solid #5B5BD6', borderRadius: 10, background: '#fff', color: '#5B5BD6', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                    Proposer un devis
                  </button>
                </>
              )}
              {devisEnvoye && (
                <div style={{ padding: '12px 16px', background: '#D1F2E0', borderRadius: 10, color: '#1A7F43', fontWeight: 700, fontSize: 13, textAlign: 'center' }}>
                  Devis envoyé — le client peut comparer les offres reçues
                </div>
              )}
              {/* Bouton terminer → PV de réception */}
              {item.statut === 'en_cours' && (item.avancement >= 80 || true) && (
                <button onClick={() => {
                  // Passer le chantier en réception
                  const updated = items.map(c => c.id === item.id ? { ...c, statut: 'reception', avancement: 100 } : c);
                  setItems(updated);
                  localStorage.setItem('freample_chantiers_custom', JSON.stringify(updated));
                  // Créer le PV dans localStorage
                  const profilPatron = (() => { try { return JSON.parse(localStorage.getItem('freample_profil_patron') || '{}'); } catch { return {}; } })();
                  const devisLie = (() => { try { return JSON.parse(localStorage.getItem('freample_devis') || '[]').find(d => d.projetId === item.projetId || d.chantierId === item.id); } catch { return null; } })();
                  const pv = {
                    id: 'pv_' + Date.now(), chantierId: item.id, projetId: item.projetId,
                    dateReception: new Date().toISOString().slice(0, 10), dateSignature: null,
                    maitreOuvrage: { nom: item.client || '', adresse: item.adresse || '' },
                    entreprise: { nom: profilPatron.nom || '', siret: profilPatron.siret || '', adresse: profilPatron.adresse || '', decennale: profilPatron.decennale || '' },
                    chantier: { adresse: item.adresse || '', description: item.titre || '', dateDebut: item.dateDebut || '', dateFin: new Date().toISOString().slice(0, 10) },
                    devisRef: devisLie?.numero || '', montantTTC: devisLie?.montantTTC || item.caDevis || item.budgetPrevu || 0,
                    lignes: devisLie?.lignes || [],
                    sansReserve: null, reserves: [], statut: 'en_attente_signature',
                  };
                  const pvs = (() => { try { return JSON.parse(localStorage.getItem('freample_pv_receptions') || '[]'); } catch { return []; } })();
                  pvs.push(pv);
                  localStorage.setItem('freample_pv_receptions', JSON.stringify(pvs));
                  // Notif client
                  const notifs = (() => { try { return JSON.parse(localStorage.getItem('freample_notifs_client') || '[]'); } catch { return []; } })();
                  notifs.push({ id: Date.now(), date: new Date().toISOString(), type: 'pv_reception', titre: 'Travaux terminés — PV de réception à signer', message: `L'entreprise a terminé les travaux "${item.titre}". Signez le PV de réception pour libérer le paiement.`, lu: false });
                  localStorage.setItem('freample_notifs_client', JSON.stringify(notifs));
                  // Mettre à jour le projet marketplace
                  try {
                    const projets = JSON.parse(localStorage.getItem('freample_projets') || '[]');
                    const updProjets = projets.map(p => p.id === item.projetId ? { ...p, statut: 'reception' } : p);
                    localStorage.setItem('freample_projets', JSON.stringify(updProjets));
                  } catch {}
                }} style={{ padding: '12px 0', border: 'none', borderRadius: 10, background: '#16A34A', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14, fontFamily: 'inherit' }}>
                  Terminer le chantier → Envoyer le PV de réception
                </button>
              )}
              {item.statut === 'reception' && (
                <div style={{ padding: '12px 16px', background: '#EFF6FF', borderRadius: 10, color: '#2563EB', fontWeight: 700, fontSize: 13, textAlign: 'center' }}>
                  PV de réception envoyé — en attente de signature du client
                </div>
              )}
              {!['terminee', 'termine', 'annulee', 'reception'].includes(item.statut) && (
                <button onClick={onCancelRequest} style={{ padding: '10px 0', border: '1px solid #FFE5E5', borderRadius: 10, background: '#FFF5F5', color: '#C0392B', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  Annuler la mission
                </button>
              )}
            </div>

            {/* DevisFormulaire inline */}
            {devisMode && !devisEnvoye && (
              <div style={{ marginTop: 4 }}>
                <DevisFormulaire
                  clientNom={item.client}
                  missionTitre={item.titre}
                  compact={true}
                  onAnnuler={() => setDevisMode(false)}
                  onSoumettre={onDevisSoumis}
                />
              </div>
            )}
          </div>
        )}

        {/* ─ Équipe tab ─ */}
        {panelTab === 'equipe' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <button onClick={() => setFiltreMetier('')} style={{ padding: '4px 12px', border: `1.5px solid ${!filtreMetier ? '#5B5BD6' : '#E5E5EA'}`, borderRadius: 20, fontSize: 11, fontWeight: 600, background: !filtreMetier ? '#EBF5FF' : '#fff', color: !filtreMetier ? '#5B5BD6' : '#6E6E73', cursor: 'pointer' }}>Tous</button>
              {metiers.map(m => (
                <button key={m} onClick={() => setFiltreMetier(m)} style={{ padding: '4px 12px', border: `1.5px solid ${filtreMetier === m ? '#5B5BD6' : '#E5E5EA'}`, borderRadius: 20, fontSize: 11, fontWeight: 600, background: filtreMetier === m ? '#EBF5FF' : '#fff', color: filtreMetier === m ? '#5B5BD6' : '#6E6E73', cursor: 'pointer' }}>{m}</button>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {employes.map(emp => {
                const selected = equipeIds.includes(emp.id);
                const isMatch = !filtreMetier || emp.metier === filtreMetier;
                // Vérification compétences depuis fiches salariés
                const chantierMetier = item?.metier || '';
                const fichesSalaries = (() => { try { return JSON.parse(localStorage.getItem('freample_fiches_salaries') || '[]'); } catch { return []; } })();
                const fiche = fichesSalaries.find(f => f.actif && (`${f.prenom} ${f.nom}`).toLowerCase().includes(emp.nom?.toLowerCase() || ''));
                const hasCompetence = !chantierMetier || !fiche || (fiche.competences || []).some(c => c.toLowerCase().includes(chantierMetier.toLowerCase()) || chantierMetier.toLowerCase().includes(c.toLowerCase()));
                // Vérifier habilitation requise
                let habWarning = null;
                if (fiche && chantierMetier) {
                  const check = verifierHabilitation(fiche, chantierMetier);
                  if (check.requis && !check.possede) habWarning = check.message;
                  else if (check.expire) habWarning = check.message;
                }
                return (
                  <div key={emp.id} onClick={() => toggleEmploye(emp.id)} style={{ border: `2px solid ${selected ? '#5B5BD6' : isMatch && filtreMetier ? '#34C75940' : '#F2F2F7'}`, borderRadius: 12, padding: '10px 14px', cursor: 'pointer', background: selected ? '#EBF5FF' : '#fff', transition: 'all 0.15s', opacity: emp.disponible ? 1 : 0.55 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{emp.prenom} {emp.nom}</div>
                        <div style={{ fontSize: 11, color: '#5B5BD6', fontWeight: 600 }}>{emp.metier}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end' }}>
                        {selected && <span style={{ fontSize: 10, background: '#5B5BD6', color: '#fff', padding: '1px 7px', borderRadius: 20, fontWeight: 700 }}>Assigné</span>}
                        {!emp.disponible && <span style={{ fontSize: 10, background: '#FF9500', color: '#fff', padding: '1px 7px', borderRadius: 20 }}>Indispo.</span>}
                        {selected && !hasCompetence && <span style={{ fontSize: 9, background: '#FEF2F2', color: '#DC2626', padding: '1px 7px', borderRadius: 20, fontWeight: 600 }}>Competence manquante</span>}
                        {selected && habWarning && <span style={{ fontSize: 9, background: '#FEF2F2', color: '#DC2626', padding: '1px 7px', borderRadius: 20, fontWeight: 600 }}>Hab. {habWarning.includes('expiree') ? 'expiree' : 'manquante'}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
                      {emp.habilitations.map(h => <span key={h} style={{ fontSize: 9, background: '#F2F2F7', color: '#6E6E73', padding: '2px 6px', borderRadius: 20 }}>{h}</span>)}
                      {fiche && (fiche.competences || []).map(c => <span key={c} style={{ fontSize: 9, background: '#F5EFE0', color: '#A68B4B', padding: '2px 6px', borderRadius: 20 }}>{c}</span>)}
                    </div>
                  </div>
                );
              })}
            </div>
            {equipeIds.length > 0 && (
              <div style={{ padding: '10px 14px', background: '#F0FDF4', borderRadius: 10, fontSize: 12, color: '#1A7F43', fontWeight: 600 }}>
                Équipe sélectionnée : {getEquipeNoms().join(', ')}
              </div>
            )}
            <button onClick={handleSave} disabled={saving} style={{ padding: '10px 0', border: 'none', borderRadius: 10, background: '#5B5BD6', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>{saving ? 'Enregistrement…' : 'Sauvegarder l\'équipe'}</button>
          </div>
        )}

        {/* ─ Véhicule tab ─ */}
        {panelTab === 'vehicule' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={lbl}>Assigner un véhicule</label>
              <select value={vehiculeId} onChange={e => setVehiculeId(e.target.value)} style={{ ...inp, fontSize: 13 }}>
                <option value="">— Aucun —</option>
                {(isDemo ? DEMO_VEHICULES : []).filter(v => v.statut !== 'maintenance').map(v => (
                  <option key={v.id} value={v.id} disabled={v.statut === 'en_mission' && String(v.id) !== String(vehiculeId)}>
                    {v.immatriculation} — {v.modele} {v.statut === 'en_mission' && String(v.id) !== String(vehiculeId) ? '(en mission)' : ''}
                  </option>
                ))}
              </select>
            </div>
            {vehiculeId && (() => {
              const v = (isDemo ? DEMO_VEHICULES : []).find(x => String(x.id) === String(vehiculeId));
              if (!v) return null;
              return (
                <div style={{ background: '#F8F9FA', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{v.modele}</div>
                  <div style={{ fontSize: 12, color: '#6E6E73' }}>{v.immatriculation} · {v.type} · {v.capacite}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
                    <div style={{ background: '#fff', borderRadius: 8, padding: '8px 10px', fontSize: 12 }}>
                      <div style={{ color: '#636363', fontWeight: 600, fontSize: 10, marginBottom: 3 }}>KILOMÉTRAGE</div>
                      <div style={{ fontWeight: 700 }}>{v.kilometrage?.toLocaleString('fr-FR')} km</div>
                    </div>
                    <div style={{ background: vidangeAlert(v.vidange, v.kilometrage) ? '#FFF3CD' : '#fff', borderRadius: 8, padding: '8px 10px', fontSize: 12 }}>
                      <div style={{ color: '#636363', fontWeight: 600, fontSize: 10, marginBottom: 3 }}>PROCHAINE VIDANGE</div>
                      <div style={{ fontWeight: 700, color: vidangeAlert(v.vidange, v.kilometrage) ? '#856404' : '#1C1C1E' }}>{v.vidange?.prochainKm?.toLocaleString('fr-FR')} km</div>
                    </div>
                  </div>
                </div>
              );
            })()}
            <button onClick={handleSave} disabled={saving} style={{ padding: '10px 0', border: 'none', borderRadius: 10, background: '#5B5BD6', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>{saving ? '…' : 'Sauvegarder le véhicule'}</button>
          </div>
        )}

        {/* ─ Notes tab ─ */}
        {panelTab === 'notes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes internes, instructions chantier…" rows={8} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, fontSize: 13 }} />
            <button onClick={handleSave} disabled={saving} style={{ padding: '10px 0', border: 'none', borderRadius: 10, background: '#5B5BD6', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>{saving ? '…' : 'Sauvegarder les notes'}</button>
          </div>
        )}

        {/* ─ Messages tab ─ */}
        {panelTab === 'messages' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: 380 }}>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 10 }}>
              {messages.map(m => (
                <div key={m.id} style={{ display: 'flex', flexDirection: m.from === 'patron' ? 'row-reverse' : 'row', gap: 8 }}>
                  <div style={{
                    maxWidth: '78%', padding: '9px 13px',
                    background: m.from === 'patron' ? '#5B5BD6' : '#F2F2F7',
                    color: m.from === 'patron' ? '#fff' : '#1C1C1E',
                    borderRadius: m.from === 'patron' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    fontSize: 13, lineHeight: 1.5,
                  }}>
                    <p style={{ margin: 0 }}>{m.text}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 10, opacity: 0.65, textAlign: m.from === 'patron' ? 'right' : 'left' }}>{m.ts}</p>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <p style={{ textAlign: 'center', color: '#636363', fontSize: 13, marginTop: 40 }}>Aucun message — commencez la conversation</p>
              )}
            </div>
            <form
              onSubmit={e => {
                e.preventDefault();
                if (!msgInput.trim()) return;
                const now = new Date();
                setMessages(prev => [...prev, { id: Date.now(), from: 'patron', text: msgInput.trim(), ts: `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}` }]);
                setMsgInput('');
              }}
              style={{ display: 'flex', gap: 8, paddingTop: 10, borderTop: '1px solid #F2F2F7' }}
            >
              <input
                type="text"
                value={msgInput}
                onChange={e => setMsgInput(e.target.value)}
                placeholder={`Message à ${item.client}…`}
                style={{ ...inp, flex: 1, fontSize: 13, padding: '8px 12px' }}
              />
              <button type="submit" style={{ padding: '8px 16px', background: '#5B5BD6', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13, flexShrink: 0 }}>
                ➤
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════ EditModal ════════ */
function EditModal({ item, onClose, onSave, headers }) {
  const [ef, setEf] = useState({ ...item });
  const [saving, setSaving] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`${API_URL}/patron/chantiers/${ef.id}`, { method: 'PUT', headers, body: JSON.stringify(ef) });
    } catch {}
    await onSave();
    setSaving(false);
    onClose();
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: 28 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Modifier</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#636363' }}>✕</button>
        </div>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Titre *</label><input value={ef.titre || ef.nom || ''} onChange={e => setEf(p => ({ ...p, titre: e.target.value, nom: e.target.value }))} required style={inp} /></div>
            <div><label style={lbl}>Client</label><input value={ef.client || ''} onChange={e => setEf(p => ({ ...p, client: e.target.value }))} style={inp} /></div>
            <div><label style={lbl}>Adresse</label><input value={ef.adresse || ''} onChange={e => setEf(p => ({ ...p, adresse: e.target.value }))} style={inp} /></div>
            <div>
              <label style={lbl}>Statut</label>
              <select value={ef.statut || 'en_attente'} onChange={e => setEf(p => ({ ...p, statut: e.target.value }))} style={inp}>
                <option value="en_attente">En attente</option>
                <option value="planifie">Planifié</option>
                <option value="assignee">Assignée</option>
                <option value="en_cours">En cours</option>
                <option value="terminee">Terminée</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Avancement — {ef.avancement || 0}%</label>
              <input type="range" min={0} max={100} step={5} value={ef.avancement || 0} onChange={e => setEf(p => ({ ...p, avancement: Number(e.target.value) }))} style={{ width: '100%', marginTop: 8 }} />
            </div>
            <div><label style={lbl}>Budget prévu (€)</label><input type="number" value={ef.budgetPrevu || ''} onChange={e => setEf(p => ({ ...p, budgetPrevu: e.target.value }))} style={inp} /></div>
            <div><label style={lbl}>CA devis TTC (€)</label><input type="number" value={ef.caDevis || ''} onChange={e => setEf(p => ({ ...p, caDevis: e.target.value }))} style={inp} /></div>
            <div><label style={lbl}>Date début</label><input type="date" value={ef.dateDebut || ''} onChange={e => setEf(p => ({ ...p, dateDebut: e.target.value }))} style={inp} /></div>
            <div><label style={lbl}>Date fin prévue</label><input type="date" value={ef.dateFin || ''} onChange={e => setEf(p => ({ ...p, dateFin: e.target.value }))} style={inp} /></div>
            <div style={{ gridColumn: '1/-1' }}><label style={lbl}>Description</label><textarea value={ef.description || ''} onChange={e => setEf(p => ({ ...p, description: e.target.value }))} rows={3} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 20px', border: '1px solid #E5E5EA', borderRadius: 10, background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Fermer</button>
            <button type="submit" disabled={saving} style={{ padding: '9px 22px', border: 'none', borderRadius: 10, background: '#5B5BD6', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>{saving ? '…' : 'Sauvegarder'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ════════ FlotteView — vehicle maintenance tracking ════════ */

/* ── Fuel tracking helpers ── */
function getCarburantEntries(vehiculeId) {
  try {
    const s = localStorage.getItem(`freample_carburant_${vehiculeId}`);
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}
function saveCarburantEntries(vehiculeId, entries) {
  localStorage.setItem(`freample_carburant_${vehiculeId}`, JSON.stringify(entries));
}
function calculerConsoReelle(entries) {
  if (!entries || entries.length < 2) return null;
  const sorted = [...entries].sort((a, b) => a.kilometrage - b.kilometrage);
  let totalLitres = 0;
  let totalKm = 0;
  for (let i = 1; i < sorted.length; i++) {
    const diff = sorted[i].kilometrage - sorted[i - 1].kilometrage;
    if (diff > 0) {
      totalLitres += sorted[i].litres;
      totalKm += diff;
    }
  }
  if (totalKm === 0) return null;
  return (totalLitres / totalKm) * 100;
}
function consoConstructeur(typeVehicule) {
  if (!typeVehicule) return 8;
  const t = typeVehicule.toLowerCase();
  if (t.includes('fourgonnette') || t.includes('berlingo')) return 7;
  return 8; // fourgon and others default
}
function ecartConsoColor(consoReelle, consoRef) {
  if (!consoReelle || !consoRef) return null;
  const ecart = ((consoReelle - consoRef) / consoRef) * 100;
  if (ecart <= 20) return { color: '#1A7F43', bg: '#D1F2E0', label: 'Normal' };
  if (ecart <= 40) return { color: '#856404', bg: '#FFF3CD', label: 'Élevée' };
  return { color: '#C0392B', bg: '#FFE5E5', label: 'Anormale' };
}
function calculerCoutKm(consoReelle, dernierPrixLitre, assuranceAnnuelle, kmMoyenJour) {
  if (!consoReelle || !dernierPrixLitre) return null;
  const coutCarburant = (dernierPrixLitre * consoReelle) / 100;
  const coutAssurance = (assuranceAnnuelle && kmMoyenJour) ? (assuranceAnnuelle / 365 / kmMoyenJour) : 0;
  return coutCarburant + coutAssurance;
}

const FORM_VEHICULE_VIDE = { immatriculation: '', modele: '', type: 'Fourgon', capacite: '', kilometrage: '', vidangeKm: '', vidangeIntervalleKm: 10000, ctDate: '', assuranceExp: '', statut: 'disponible' };

function FlotteView() {
  const isDemo = localStorage.getItem('token')?.endsWith('.dev');
  const [vehicules, setVehicules] = useState(() => {
    try { const s = localStorage.getItem('flotte_vehicules'); return s ? JSON.parse(s) : (isDemo ? DEMO_VEHICULES : []); }
    catch { return isDemo ? DEMO_VEHICULES : []; }
  });

  useEffect(() => {
    localStorage.setItem('flotte_vehicules', JSON.stringify(vehicules));
  }, [vehicules]);
  const [selected, setSelected] = useState(null);
  const [kmEdit, setKmEdit] = useState({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState(FORM_VEHICULE_VIDE);
  const [fuelOpen, setFuelOpen] = useState({});
  const [fuelForm, setFuelForm] = useState({});
  const [fuelRefresh, setFuelRefresh] = useState(0);
  const [chantierAssign, setChantierAssign] = useState({});

  const alertes = vehicules.filter(v =>
    ctExpired(v.controleTechnique?.prochaineDate) ||
    ctSoon(v.controleTechnique?.prochaineDate) ||
    vidangeAlert(v.vidange, v.kilometrage)
  );

  const COULEURS_AUTO = ['#5B5BD6', '#34C759', '#FF9500', '#AF52DE', '#FF3B30', '#00C7BE', '#FF6B35', '#5856D6'];

  function handleAddVehicule(e) {
    e.preventDefault();
    const km = Number(addForm.kilometrage) || 0;
    const vidangeKm = Number(addForm.vidangeKm) || 0;
    const intervalle = Number(addForm.vidangeIntervalleKm) || 10000;
    const newV = {
      id: Date.now(),
      immatriculation: addForm.immatriculation,
      modele: addForm.modele,
      type: addForm.type,
      capacite: addForm.capacite,
      kilometrage: km,
      couleur: COULEURS_AUTO[vehicules.length % COULEURS_AUTO.length],
      statut: addForm.statut,
      chantier: null,
      vidange: { date: '', km: vidangeKm, prochainKm: vidangeKm + intervalle, intervalleKm: intervalle },
      controleTechnique: { date: '', prochaineDate: addForm.ctDate || '' },
      assurance: { expiration: addForm.assuranceExp || '' },
    };
    setVehicules(prev => [...prev, newV]);
    setAddForm(FORM_VEHICULE_VIDE);
    setShowAddForm(false);
  }

  const STATUT_VEHICULE = {
    disponible:  { bg: '#D1F2E0', color: '#1A7F43', label: 'Disponible' },
    en_mission:  { bg: '#E3F2FD', color: '#1565C0', label: 'En mission' },
    maintenance: { bg: '#FFE5E5', color: '#C0392B', label: 'En maintenance' },
  };

  function updateKm(id) {
    const newKm = Number(kmEdit[id]);
    if (!newKm) return;
    setVehicules(prev => prev.map(v => v.id === id ? { ...v, kilometrage: newKm } : v));
    setKmEdit(p => ({ ...p, [id]: '' }));
  }

  function handleAddFuel(vehiculeId) {
    const f = fuelForm[vehiculeId];
    if (!f || !f.date || !f.litres || !f.montant || !f.kilometrage) return;
    const entry = { id: Date.now(), date: f.date, litres: Number(f.litres), montant: Number(f.montant), kilometrage: Number(f.kilometrage) };
    const entries = getCarburantEntries(vehiculeId);
    entries.push(entry);
    saveCarburantEntries(vehiculeId, entries);
    setFuelForm(p => ({ ...p, [vehiculeId]: { date: '', litres: '', montant: '', kilometrage: '' } }));
    setFuelRefresh(r => r + 1);
  }

  function handleAssignChantier(vehiculeId, chantierName) {
    setVehicules(prev => prev.map(v => v.id === vehiculeId ? { ...v, chantierAssigne: chantierName || null } : v));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={() => setShowAddForm(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: showAddForm ? '#F2F2F7' : '#5B5BD6', color: showAddForm ? '#1C1C1E' : '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
          {showAddForm ? '✕ Annuler' : '+ Ajouter un véhicule'}
        </button>
      </div>

      {/* Add vehicle form */}
      {showAddForm && (
        <form onSubmit={handleAddVehicule} style={{ background: '#fff', borderRadius: 14, padding: 22, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>Nouveau véhicule</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div>
              <label style={lbl}>Immatriculation *</label>
              <input value={addForm.immatriculation} onChange={e => setAddForm(p => ({ ...p, immatriculation: e.target.value.toUpperCase() }))} placeholder="AB-123-CD" required style={inp} />
            </div>
            <div>
              <label style={lbl}>Modèle *</label>
              <input value={addForm.modele} onChange={e => setAddForm(p => ({ ...p, modele: e.target.value }))} placeholder="Renault Trafic" required style={inp} />
            </div>
            <div>
              <label style={lbl}>Type</label>
              <select value={addForm.type} onChange={e => setAddForm(p => ({ ...p, type: e.target.value }))} style={inp}>
                {['Fourgon', 'Fourgonnette', 'Fourgon grand volume', 'Camionnette', 'Camion', 'Pick-up'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Charge utile</label>
              <input value={addForm.capacite} onChange={e => setAddForm(p => ({ ...p, capacite: e.target.value }))} placeholder="900 kg" style={inp} />
            </div>
            <div>
              <label style={lbl}>Kilométrage actuel</label>
              <input type="number" value={addForm.kilometrage} onChange={e => setAddForm(p => ({ ...p, kilometrage: e.target.value }))} placeholder="50000" style={inp} />
            </div>
            <div>
              <label style={lbl}>Km dernière vidange</label>
              <input type="number" value={addForm.vidangeKm} onChange={e => setAddForm(p => ({ ...p, vidangeKm: e.target.value }))} placeholder="48000" style={inp} />
            </div>
            <div>
              <label style={lbl}>Intervalle vidange (km)</label>
              <input type="number" value={addForm.vidangeIntervalleKm} onChange={e => setAddForm(p => ({ ...p, vidangeIntervalleKm: e.target.value }))} placeholder="10000" style={inp} />
            </div>
            <div>
              <label style={lbl}>Prochain contrôle technique</label>
              <input type="date" value={addForm.ctDate} onChange={e => setAddForm(p => ({ ...p, ctDate: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Expiration assurance</label>
              <input type="date" value={addForm.assuranceExp} onChange={e => setAddForm(p => ({ ...p, assuranceExp: e.target.value }))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Statut initial</label>
              <select value={addForm.statut} onChange={e => setAddForm(p => ({ ...p, statut: e.target.value }))} style={inp}>
                <option value="disponible">Disponible</option>
                <option value="en_mission">En mission</option>
                <option value="maintenance">En maintenance</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowAddForm(false)} style={{ padding: '9px 20px', border: '1px solid #E5E5EA', borderRadius: 10, background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Annuler</button>
            <button type="submit" style={{ padding: '9px 22px', border: 'none', borderRadius: 10, background: '#34C759', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>Ajouter à la flotte</button>
          </div>
        </form>
      )}

      {/* Header KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total véhicules', value: vehicules.length, color: '#5B5BD6' },
          { label: 'En mission', value: vehicules.filter(v => v.statut === 'en_mission').length, color: '#1565C0' },
          { label: 'Disponibles', value: vehicules.filter(v => v.statut === 'disponible').length, color: '#1A7F43' },
          { label: 'Alertes maintenance', value: alertes.length, color: alertes.length > 0 ? '#C0392B' : '#636363' },
        ].map(k => (
          <div key={k.label} style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: k.color }}>{k.value}</div>
            <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 4 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Alertes */}
      {alertes.length > 0 && (
        <div style={{ background: '#FFF3CD', border: '1px solid #FFCA2C', borderRadius: 12, padding: '14px 18px' }}>
          <div style={{ fontWeight: 700, color: '#856404', fontSize: 14, marginBottom: 8 }}>Alertes maintenance</div>
          {alertes.map(v => {
            const msgs = [];
            if (ctExpired(v.controleTechnique?.prochaineDate)) msgs.push(`CT expiré le ${formatDate(v.controleTechnique.prochaineDate)}`);
            else if (ctSoon(v.controleTechnique?.prochaineDate)) msgs.push(`CT expire le ${formatDate(v.controleTechnique.prochaineDate)}`);
            if (vidangeAlert(v.vidange, v.kilometrage)) msgs.push(`Vidange dans ${(v.vidange.prochainKm - v.kilometrage).toLocaleString('fr-FR')} km`);
            return (
              <div key={v.id} onClick={() => setSelected(v.id === selected ? null : v.id)} style={{ fontSize: 13, color: '#856404', marginBottom: 4, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                <span>⚠ <strong>{v.modele}</strong> ({v.immatriculation}) — {msgs.join(' · ')}</span>
                <span style={{ fontSize: 11, fontWeight: 700 }}>Voir →</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Vehicle cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
        {vehicules.map(v => {
          const stv = STATUT_VEHICULE[v.statut] || STATUT_VEHICULE.disponible;
          const hasCtAlert = ctExpired(v.controleTechnique?.prochaineDate);
          const hasCtWarn = ctSoon(v.controleTechnique?.prochaineDate);
          const hasVidangeWarn = vidangeAlert(v.vidange, v.kilometrage);
          const isOpen = selected === v.id;

          /* Fuel calculations */
          const fuelEntries = getCarburantEntries(v.id);
          const consoReelle = calculerConsoReelle(fuelEntries);
          const consoRef = consoConstructeur(v.type);
          const ecartInfo = ecartConsoColor(consoReelle, consoRef);
          const dernierPrixLitre = fuelEntries.length > 0 ? fuelEntries[fuelEntries.length - 1].montant / fuelEntries[fuelEntries.length - 1].litres : null;
          const assuranceAnnuelle = 1200; // default annual insurance estimate
          const kmMoyenJour = 80; // default average daily km
          const coutKm = calculerCoutKm(consoReelle, dernierPrixLitre, assuranceAnnuelle, kmMoyenJour);
          const isFuelOpen = fuelOpen[v.id];
          const ff = fuelForm[v.id] || { date: '', litres: '', montant: '', kilometrage: '' };
          const last5Fuel = [...fuelEntries].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

          return (
            <div key={v.id} style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden', border: (hasCtAlert || hasVidangeWarn) ? '2px solid #FF9500' : '1px solid transparent' }}>
              {/* Card header */}
              <div style={{ padding: '16px 18px', borderBottom: '1px solid #F2F2F7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#1C1C1E' }}>{v.modele}</div>
                    <div style={{ fontSize: 13, color: '#6E6E73', marginTop: 1 }}>
                      <span style={{ fontWeight: 700, letterSpacing: 1, color: '#1C1C1E' }}>{v.immatriculation}</span> · {v.type}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: stv.bg, color: stv.color }}>{stv.label}</span>
                  </div>
                </div>
                {v.chantier && (
                  <div style={{ fontSize: 12, color: '#6E6E73', background: '#F2F2F7', borderRadius: 8, padding: '5px 10px', display: 'inline-block' }}>
                    Mission : {v.chantier}
                  </div>
                )}
                {v.chantierAssigne && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#1565C0', background: '#E3F2FD', borderRadius: 8, padding: '4px 10px', display: 'inline-block', marginLeft: v.chantier ? 6 : 0, marginTop: v.chantier ? 0 : 4 }}>
                    Chantier : {v.chantierAssigne}
                  </div>
                )}
              </div>

              {/* Consumption KPI row */}
              <div style={{ padding: '10px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, borderBottom: '1px solid #F2F2F7' }}>
                <div style={{ background: '#FAFAFA', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 8, color: '#636363', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 }}>Conso constructeur</div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#5B5BD6' }}>{consoRef}</div>
                  <div style={{ fontSize: 8, color: '#636363' }}>L/100km</div>
                </div>
                <div style={{ background: consoReelle && ecartInfo ? ecartInfo.bg : '#FAFAFA', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 8, color: consoReelle && ecartInfo ? ecartInfo.color : '#636363', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 }}>Conso réelle</div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: consoReelle && ecartInfo ? ecartInfo.color : '#636363' }}>{consoReelle ? consoReelle.toFixed(1) : '—'}</div>
                  <div style={{ fontSize: 8, color: consoReelle && ecartInfo ? ecartInfo.color : '#636363' }}>L/100km</div>
                </div>
                <div style={{ background: consoReelle && ecartInfo ? ecartInfo.bg : '#FAFAFA', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 8, color: consoReelle && ecartInfo ? ecartInfo.color : '#636363', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 }}>Ecart</div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: consoReelle && ecartInfo ? ecartInfo.color : '#636363' }}>
                    {consoReelle ? `${(((consoReelle - consoRef) / consoRef) * 100).toFixed(0)}%` : '—'}
                  </div>
                  <div style={{ fontSize: 8, color: consoReelle && ecartInfo ? ecartInfo.color : '#636363' }}>{ecartInfo ? ecartInfo.label : ''}</div>
                </div>
                <div style={{ background: '#FAFAFA', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                  <div style={{ fontSize: 8, color: '#636363', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 3 }}>Coût / km</div>
                  <div style={{ fontWeight: 800, fontSize: 13, color: '#1C1C1E' }}>{coutKm ? coutKm.toFixed(2).replace('.', ',') : '—'}</div>
                  <div style={{ fontSize: 8, color: '#636363' }}>{coutKm ? '€/km' : ''}</div>
                </div>
              </div>
              {/* Alert if consumption is abnormal (red) */}
              {consoReelle && ecartInfo && ecartInfo.color === '#C0392B' && (
                <div style={{ padding: '8px 18px', background: '#FFE5E5', fontSize: 11, color: '#C0392B', fontWeight: 600 }}>
                  Consommation anormale — vérifier pneus, conduite ou mécanique
                </div>
              )}

              {/* Maintenance grid */}
              <div style={{ padding: '14px 18px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                {/* Kilométrage */}
                <div style={{ background: '#FAFAFA', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 9, color: '#636363', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Kilométrage</div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{v.kilometrage?.toLocaleString('fr-FR')}</div>
                  <div style={{ fontSize: 9, color: '#636363', marginTop: 2 }}>km</div>
                </div>

                {/* Vidange */}
                <div style={{ background: hasVidangeWarn ? '#FFF3CD' : '#FAFAFA', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 9, color: hasVidangeWarn ? '#856404' : '#636363', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Vidange</div>
                  <div style={{ fontWeight: 800, fontSize: 11, color: hasVidangeWarn ? '#856404' : '#1C1C1E' }}>
                    {v.vidange?.prochainKm?.toLocaleString('fr-FR')} km
                  </div>
                  <div style={{ fontSize: 9, color: hasVidangeWarn ? '#856404' : '#636363', marginTop: 2 }}>
                    {hasVidangeWarn ? `⚠ dans ${(v.vidange.prochainKm - v.kilometrage).toLocaleString('fr-FR')} km` : `dans ${(v.vidange?.prochainKm - v.kilometrage).toLocaleString('fr-FR')} km`}
                  </div>
                </div>

                {/* CT */}
                <div style={{ background: hasCtAlert ? '#FFE5E5' : hasCtWarn ? '#FFF3CD' : '#FAFAFA', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 9, color: hasCtAlert ? '#C0392B' : hasCtWarn ? '#856404' : '#636363', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Contrôle Technique</div>
                  <div style={{ fontWeight: 800, fontSize: 11, color: hasCtAlert ? '#C0392B' : hasCtWarn ? '#856404' : '#1C1C1E' }}>
                    {formatDate(v.controleTechnique?.prochaineDate)}
                  </div>
                  <div style={{ fontSize: 9, color: hasCtAlert ? '#C0392B' : hasCtWarn ? '#856404' : '#636363', marginTop: 2 }}>
                    {hasCtAlert ? '⛔ Expiré' : hasCtWarn ? '⚠ Bientôt' : 'Valide'}
                  </div>
                </div>
              </div>

              {/* Assurance & actions */}
              <div style={{ padding: '0 18px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 11, color: '#636363' }}>
                  Assurance : {formatDate(v.assurance?.expiration)}
                  {v.assurance?.expiration && new Date(v.assurance.expiration) < new Date(Date.now() + 60 * 86400000) && (
                    <span style={{ color: '#856404', fontWeight: 700 }}> ⚠</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setFuelOpen(p => ({ ...p, [v.id]: !p[v.id] }))} style={{ padding: '5px 12px', border: '1px solid #E5E5EA', borderRadius: 8, background: isFuelOpen ? '#F2F2F7' : '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#FF9500' }}>
                    {isFuelOpen ? '✕ Carburant' : '⛽ Carburant'}
                  </button>
                  <button onClick={() => setSelected(isOpen ? null : v.id)} style={{ padding: '5px 12px', border: '1px solid #E5E5EA', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: '#5B5BD6' }}>
                    {isOpen ? 'Fermer' : 'Mettre à jour'}
                  </button>
                </div>
              </div>

              {/* Fuel history expandable section */}
              {isFuelOpen && (
                <div style={{ borderTop: '1px solid #F2F2F7', padding: '14px 18px', background: '#FFFBF0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#856404', marginBottom: 2 }}>Historique carburant</div>

                  {/* Add fuel entry form */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 6, alignItems: 'flex-end' }}>
                    <div>
                      <label style={{ ...lbl, fontSize: 10 }}>Date</label>
                      <input type="date" value={ff.date} onChange={e => setFuelForm(p => ({ ...p, [v.id]: { ...ff, date: e.target.value } }))} style={{ ...inp, fontSize: 11, padding: '6px 8px' }} />
                    </div>
                    <div>
                      <label style={{ ...lbl, fontSize: 10 }}>Litres</label>
                      <input type="number" step="0.1" value={ff.litres} onChange={e => setFuelForm(p => ({ ...p, [v.id]: { ...ff, litres: e.target.value } }))} placeholder="45" style={{ ...inp, fontSize: 11, padding: '6px 8px' }} />
                    </div>
                    <div>
                      <label style={{ ...lbl, fontSize: 10 }}>Montant (€)</label>
                      <input type="number" step="0.01" value={ff.montant} onChange={e => setFuelForm(p => ({ ...p, [v.id]: { ...ff, montant: e.target.value } }))} placeholder="85,00" style={{ ...inp, fontSize: 11, padding: '6px 8px' }} />
                    </div>
                    <div>
                      <label style={{ ...lbl, fontSize: 10 }}>Km compteur</label>
                      <input type="number" value={ff.kilometrage} onChange={e => setFuelForm(p => ({ ...p, [v.id]: { ...ff, kilometrage: e.target.value } }))} placeholder={String(v.kilometrage)} style={{ ...inp, fontSize: 11, padding: '6px 8px' }} />
                    </div>
                    <button onClick={() => handleAddFuel(v.id)} style={{ padding: '6px 12px', border: 'none', borderRadius: 8, background: '#FF9500', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 11, flexShrink: 0, marginBottom: 1 }}>+</button>
                  </div>

                  {/* Last 5 entries */}
                  {last5Fuel.length > 0 ? (
                    <div style={{ fontSize: 11, color: '#1C1C1E' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 4, padding: '4px 0', borderBottom: '1px solid #E5E5EA', fontWeight: 700, fontSize: 10, color: '#636363', textTransform: 'uppercase' }}>
                        <span>Date</span><span>Litres</span><span>Montant</span><span>Km</span><span>L/100km</span>
                      </div>
                      {last5Fuel.map((entry, idx) => {
                        const sorted = [...fuelEntries].sort((a, b) => a.kilometrage - b.kilometrage);
                        const pos = sorted.findIndex(e => e.id === entry.id);
                        let consoEntry = null;
                        if (pos > 0) {
                          const diff = entry.kilometrage - sorted[pos - 1].kilometrage;
                          if (diff > 0) consoEntry = ((entry.litres / diff) * 100).toFixed(1);
                        }
                        return (
                          <div key={entry.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 4, padding: '4px 0', borderBottom: '1px solid #F2F2F7', fontSize: 11 }}>
                            <span>{formatDate(entry.date)}</span>
                            <span>{entry.litres.toFixed(1)} L</span>
                            <span>{entry.montant.toFixed(2)} €</span>
                            <span>{entry.kilometrage.toLocaleString('fr-FR')}</span>
                            <span style={{ fontWeight: 600 }}>{consoEntry ? `${consoEntry}` : '—'}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: '#636363', fontStyle: 'italic' }}>Aucun plein enregistré</div>
                  )}
                </div>
              )}

              {/* Expanded update form */}
              {isOpen && (
                <div style={{ borderTop: '1px solid #F2F2F7', padding: '14px 18px', background: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1C1C1E', marginBottom: 4 }}>Mettre à jour</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ ...lbl, fontSize: 11 }}>Kilométrage actuel</label>
                      <input type="number" value={kmEdit[v.id] || ''} onChange={e => setKmEdit(p => ({ ...p, [v.id]: e.target.value }))} placeholder={String(v.kilometrage)} style={{ ...inp, fontSize: 13, padding: '7px 10px' }} />
                    </div>
                    <button onClick={() => updateKm(v.id)} style={{ padding: '8px 14px', border: 'none', borderRadius: 10, background: '#5B5BD6', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 12, flexShrink: 0, marginBottom: 1 }}>Enregistrer</button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <div>
                      <label style={{ ...lbl, fontSize: 11 }}>Date dernière vidange</label>
                      <input type="date" defaultValue={v.vidange?.date} onChange={e => setVehicules(prev => prev.map(x => x.id === v.id ? { ...x, vidange: { ...x.vidange, date: e.target.value } } : x))} style={{ ...inp, fontSize: 12, padding: '7px 10px' }} />
                    </div>
                    <div>
                      <label style={{ ...lbl, fontSize: 11 }}>Km dernière vidange</label>
                      <input type="number" defaultValue={v.vidange?.km} onChange={e => setVehicules(prev => prev.map(x => x.id === v.id ? { ...x, vidange: { ...x.vidange, km: Number(e.target.value), prochainKm: Number(e.target.value) + x.vidange.intervalleKm } } : x))} style={{ ...inp, fontSize: 12, padding: '7px 10px' }} />
                    </div>
                    <div>
                      <label style={{ ...lbl, fontSize: 11 }}>Date contrôle technique</label>
                      <input type="date" defaultValue={v.controleTechnique?.prochaineDate} onChange={e => setVehicules(prev => prev.map(x => x.id === v.id ? { ...x, controleTechnique: { ...x.controleTechnique, prochaineDate: e.target.value } } : x))} style={{ ...inp, fontSize: 12, padding: '7px 10px' }} />
                    </div>
                    <div>
                      <label style={{ ...lbl, fontSize: 11 }}>Statut véhicule</label>
                      <select defaultValue={v.statut} onChange={e => setVehicules(prev => prev.map(x => x.id === v.id ? { ...x, statut: e.target.value } : x))} style={{ ...inp, fontSize: 12, padding: '7px 10px' }}>
                        <option value="disponible">Disponible</option>
                        <option value="en_mission">En mission</option>
                        <option value="maintenance">En maintenance</option>
                      </select>
                    </div>
                  </div>

                  {/* Chantier assignment */}
                  <div style={{ borderTop: '1px solid #E5E5EA', paddingTop: 10, marginTop: 4 }}>
                    <label style={{ ...lbl, fontSize: 11 }}>Chantier assigné</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                      <input
                        value={chantierAssign[v.id] !== undefined ? chantierAssign[v.id] : (v.chantierAssigne || '')}
                        onChange={e => setChantierAssign(p => ({ ...p, [v.id]: e.target.value }))}
                        placeholder="Nom du chantier..."
                        style={{ ...inp, fontSize: 12, padding: '7px 10px', flex: 1 }}
                      />
                      <button onClick={() => { handleAssignChantier(v.id, chantierAssign[v.id] !== undefined ? chantierAssign[v.id] : (v.chantierAssigne || '')); setChantierAssign(p => ({ ...p, [v.id]: undefined })); }} style={{ padding: '8px 14px', border: 'none', borderRadius: 10, background: '#34C759', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 12, flexShrink: 0, marginBottom: 1 }}>Assigner</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════ Sous-traitance inline (directement sur la carte chantier) ════════ */
function InlineSousTraiter({ item, onOpenDetail }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ metier: '', budget: '', description: '' });
  const [sent, setSent] = useState(false);

  const METIERS = ['Plomberie','Electricite','Peinture','Maconnerie','Carrelage','Menuiserie','Couverture','Chauffage','Serrurerie','Platrerie','Isolation','Charpente'];

  const publier = () => {
    if (!form.metier) return;
    try {
      const all = JSON.parse(localStorage.getItem('freample_soustraitance') || '[]');
      const patronProfil = JSON.parse(localStorage.getItem('freample_profil_patron') || '{}');
      all.push({
        id: Date.now(), chantierId: item.id, chantierTitre: item.titre || item.metier || 'Chantier',
        patronNom: patronProfil.nom || 'Patron', metier: form.metier,
        description: form.description || `Besoin d'un ${form.metier} pour le chantier ${item.titre}`,
        budget: Number(form.budget) || 0,
        ville: item.ville || item.adresse || '', dateDebut: item.dateDebut || '', dateFin: item.dateFin || '',
        statut: 'ouverte', reponses: [], date: new Date().toISOString().slice(0, 10),
      });
      localStorage.setItem('freample_soustraitance', JSON.stringify(all));
      setSent(true);
    } catch {}
  };

  if (sent) {
    return (
      <div style={{ marginBottom: 10, padding: '10px 12px', background: '#F0FDF4', borderRadius: 8, border: '1px solid #16A34A40' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#16A34A' }}>Demande publiée</div>
        <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>Les auto-entrepreneurs {form.metier} de votre zone seront notifiés.</div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 10 }}>
      {!open ? (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', background: '#FEF2F2', borderRadius: 8, border: '1px solid #DC262620' }}>
          <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 600, flex: 1 }}>Aucun ouvrier assigné</span>
          <button onClick={e => { e.stopPropagation(); setOpen(true); }}
            style={{ fontSize: 10, fontWeight: 700, padding: '5px 12px', background: '#A68B4B', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Sous-traiter
          </button>
          <button onClick={e => { e.stopPropagation(); onOpenDetail?.(item.id); }}
            style={{ fontSize: 10, fontWeight: 600, padding: '5px 12px', background: 'transparent', color: '#555', border: '1px solid #E5E5EA', borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Assigner mon équipe
          </button>
        </div>
      ) : (
        <div onClick={e => e.stopPropagation()} style={{ padding: '12px', background: '#FAFAF8', borderRadius: 10, border: '1px solid #E8E6E1' }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Chercher un sous-traitant</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            <select value={form.metier} onChange={e => setForm(f => ({ ...f, metier: e.target.value }))}
              style={{ flex: 2, minWidth: 120, padding: '8px 10px', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 12, outline: 'none' }}>
              <option value="">Métier recherché *</option>
              {METIERS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
              placeholder="Budget HT" style={{ flex: 1, minWidth: 80, padding: '8px 10px', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 12, outline: 'none' }} />
          </div>
          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            placeholder="Description du besoin (optionnel)" style={{ width: '100%', padding: '8px 10px', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 12, outline: 'none', boxSizing: 'border-box', marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={publier} disabled={!form.metier}
              style={{ padding: '8px 16px', background: form.metier ? '#A68B4B' : '#C7C7CC', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: form.metier ? 'pointer' : 'not-allowed' }}>
              Publier la demande
            </button>
            <button onClick={() => setOpen(false)}
              style={{ padding: '8px 12px', background: 'transparent', color: '#555', border: '1px solid #E5E5EA', borderRadius: 8, fontSize: 12, cursor: 'pointer' }}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
