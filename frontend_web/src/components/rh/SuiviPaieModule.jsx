import React, { useState, useMemo, useEffect, useCallback } from 'react';
import DS from '../../design/luxe';
import api from '../../services/api';
import { calculerIndemniteTrajet, PANIER_REPAS_BTP } from '../../utils/calculPaie';
import { calculerDistanceEntreAdresses } from '../../utils/geocodage';

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:20 };
const BTN = { padding:'8px 18px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const BTN_O = { ...BTN, background:'transparent', color:'#0A0A0A', border:'1px solid #E8E6E1' };
const INP = { width:'100%', padding:'10px 12px', border:'1px solid #E8E6E1', borderRadius:8, fontSize:13, fontFamily:DS.font, outline:'none', boxSizing:'border-box' };
const TH = { padding:'8px 10px', fontSize:10, fontWeight:700, color:'#555', textTransform:'uppercase', borderBottom:'2px solid #E8E6E1', textAlign:'left' };
const TD = { padding:'8px 10px', fontSize:12, borderBottom:'1px solid #E8E6E1' };
const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

// ══ Adresse dépôt entreprise (configurable) ══
const DEPOT_DEFAULT = '45 boulevard de la Libération, 13001 Marseille';

// ══ Chantiers avec adresses (simulé — en prod vient de ChantiersEtMissions) ══
const CHANTIERS_INIT = [
  { id:1, nom:'Rénovation Dupont', adresse:'12 rue de France, Marseille', distanceDepot:null },
  { id:2, nom:'Bureau Médecin', adresse:'8 avenue Jean Médecin, Marseille', distanceDepot:null },
  { id:3, nom:'Peinture Pastorelli', adresse:'24 rue Pastorelli, Marseille', distanceDepot:null },
  { id:4, nom:'Villa Rousseau', adresse:'15 chemin des Collines, La Ciotat', distanceDepot:null },
  { id:5, nom:'Résidence Garibaldi', adresse:'10 place Garibaldi, Marseille', distanceDepot:null },
  { id:6, nom:'Entrepôt Vitrolles', adresse:'Zone industrielle, Vitrolles', distanceDepot:null },
  { id:7, nom:'Maison Cassis', adresse:'8 rue de la République, Cassis', distanceDepot:null },
  { id:8, nom:'Chantier Aubagne', adresse:'12 boulevard du Jeu de Ballon, Aubagne', distanceDepot:null },
];

// ══ Salariés ══
const SALARIES = [
  { id:1, nom:'Jean Martin', poste:'Maçon', salaireBase:2800, tauxJournalier:133.33 },
  { id:2, nom:'Sophie Duval', poste:'Électricienne', salaireBase:2600, tauxJournalier:123.81 },
  { id:3, nom:'Marc Lambert', poste:'Plombier', salaireBase:2700, tauxJournalier:128.57 },
  { id:4, nom:'Lucas Garcia', poste:'Peintre', salaireBase:2400, tauxJournalier:114.29 },
];

// ══ Pointages du mois (simulé — en prod vient de PointageModule) ══
const POINTAGES_MOIS = [
  // Jean Martin — 5 chantiers différents
  { employeId:1, chantierId:1, date:'2026-04-01', heures:8, heuresSupp:0 },
  { employeId:1, chantierId:1, date:'2026-04-02', heures:8, heuresSupp:1 },
  { employeId:1, chantierId:1, date:'2026-04-03', heures:8, heuresSupp:0 },
  { employeId:1, chantierId:2, date:'2026-04-04', heures:7, heuresSupp:0 },
  { employeId:1, chantierId:7, date:'2026-04-07', heures:8, heuresSupp:0 },
  { employeId:1, chantierId:7, date:'2026-04-08', heures:8, heuresSupp:2 },
  { employeId:1, chantierId:8, date:'2026-04-09', heures:8, heuresSupp:0 },
  { employeId:1, chantierId:8, date:'2026-04-10', heures:8, heuresSupp:0 },
  { employeId:1, chantierId:5, date:'2026-04-11', heures:7, heuresSupp:0 },
  { employeId:1, chantierId:1, date:'2026-04-14', heures:8, heuresSupp:0 },
  { employeId:1, chantierId:1, date:'2026-04-15', heures:8, heuresSupp:0 },
  { employeId:1, chantierId:6, date:'2026-04-16', heures:8, heuresSupp:1 },
  { employeId:1, chantierId:6, date:'2026-04-17', heures:8, heuresSupp:0 },
  { employeId:1, chantierId:1, date:'2026-04-18', heures:8, heuresSupp:0 },
  { employeId:1, chantierId:4, date:'2026-04-21', heures:8, heuresSupp:0 },
  { employeId:1, chantierId:4, date:'2026-04-22', heures:8, heuresSupp:0 },
  { employeId:1, chantierId:1, date:'2026-04-23', heures:7, heuresSupp:0 },
  { employeId:1, chantierId:1, date:'2026-04-24', heures:8, heuresSupp:0 },
  { employeId:1, chantierId:3, date:'2026-04-25', heures:7, heuresSupp:0 },
  { employeId:1, chantierId:1, date:'2026-04-28', heures:8, heuresSupp:0 },
  { employeId:1, chantierId:1, date:'2026-04-29', heures:8, heuresSupp:0 },
  // Sophie Duval
  { employeId:2, chantierId:2, date:'2026-04-01', heures:8, heuresSupp:0 },
  { employeId:2, chantierId:2, date:'2026-04-02', heures:8, heuresSupp:0 },
  { employeId:2, chantierId:2, date:'2026-04-03', heures:8, heuresSupp:0 },
  { employeId:2, chantierId:2, date:'2026-04-04', heures:7, heuresSupp:0 },
  { employeId:2, chantierId:7, date:'2026-04-07', heures:8, heuresSupp:1 },
  { employeId:2, chantierId:7, date:'2026-04-08', heures:8, heuresSupp:0 },
  { employeId:2, chantierId:1, date:'2026-04-09', heures:8, heuresSupp:0 },
  { employeId:2, chantierId:1, date:'2026-04-10', heures:8, heuresSupp:0 },
  { employeId:2, chantierId:1, date:'2026-04-11', heures:7, heuresSupp:0 },
  { employeId:2, chantierId:5, date:'2026-04-14', heures:8, heuresSupp:0 },
  { employeId:2, chantierId:5, date:'2026-04-15', heures:8, heuresSupp:0 },
  { employeId:2, chantierId:3, date:'2026-04-16', heures:8, heuresSupp:0 },
  { employeId:2, chantierId:3, date:'2026-04-17', heures:7, heuresSupp:0 },
  { employeId:2, chantierId:6, date:'2026-04-18', heures:8, heuresSupp:2 },
  { employeId:2, chantierId:1, date:'2026-04-21', heures:8, heuresSupp:0 },
  { employeId:2, chantierId:1, date:'2026-04-22', heures:8, heuresSupp:0 },
  // Marc Lambert
  { employeId:3, chantierId:8, date:'2026-04-01', heures:8, heuresSupp:0 },
  { employeId:3, chantierId:8, date:'2026-04-02', heures:8, heuresSupp:0 },
  { employeId:3, chantierId:8, date:'2026-04-03', heures:8, heuresSupp:1 },
  { employeId:3, chantierId:8, date:'2026-04-04', heures:7, heuresSupp:0 },
  { employeId:3, chantierId:4, date:'2026-04-07', heures:8, heuresSupp:0 },
  { employeId:3, chantierId:4, date:'2026-04-08', heures:8, heuresSupp:0 },
  { employeId:3, chantierId:1, date:'2026-04-09', heures:8, heuresSupp:0 },
  { employeId:3, chantierId:1, date:'2026-04-10', heures:8, heuresSupp:0 },
  { employeId:3, chantierId:1, date:'2026-04-11', heures:7, heuresSupp:0 },
  // Lucas Garcia
  { employeId:4, chantierId:3, date:'2026-04-01', heures:8, heuresSupp:0 },
  { employeId:4, chantierId:3, date:'2026-04-02', heures:8, heuresSupp:0 },
  { employeId:4, chantierId:3, date:'2026-04-03', heures:8, heuresSupp:0 },
  { employeId:4, chantierId:3, date:'2026-04-04', heures:7, heuresSupp:0 },
  { employeId:4, chantierId:5, date:'2026-04-07', heures:8, heuresSupp:0 },
  { employeId:4, chantierId:5, date:'2026-04-08', heures:8, heuresSupp:0 },
  { employeId:4, chantierId:1, date:'2026-04-09', heures:8, heuresSupp:0 },
  { employeId:4, chantierId:1, date:'2026-04-10', heures:8, heuresSupp:0 },
];

const STORAGE_POINTAGES = 'freample_pointages_mois';
const STORAGE_DEPOT = 'freample_depot';
function loadPointages() {
  try {
    // Lire les pointages du module paie
    const paie = JSON.parse(localStorage.getItem(STORAGE_POINTAGES) || 'null');
    // Lire aussi les vrais pointages des salariés (freample_pointages)
    const reels = JSON.parse(localStorage.getItem('freample_pointages') || '[]');
    // Convertir les pointages réels au format paie (arrivée+départ = heures)
    const reelsConvertis = [];
    const dates = [...new Set(reels.map(p => p.date))];
    dates.forEach(date => {
      const arrivee = reels.find(p => p.date === date && p.type === 'arrivee');
      const depart = reels.find(p => p.date === date && p.type === 'depart');
      if (arrivee && depart) {
        const [ah, am] = (arrivee.heure || '08:00').split(':').map(Number);
        const [dh, dm] = (depart.heure || '17:00').split(':').map(Number);
        const heures = Math.max(0, (dh * 60 + dm - ah * 60 - am) / 60);
        reelsConvertis.push({ employeId: arrivee.employeId || 0, chantierId: arrivee.chantierId, date, heures: Math.round(heures), heuresSupp: Math.max(0, Math.round(heures) - 8) });
      }
    });
    // Fusionner : priorité aux pointages réels
    if (reelsConvertis.length > 0) {
      const base = paie || POINTAGES_MOIS;
      const existingDates = new Set(reelsConvertis.map(p => p.date));
      return [...base.filter(p => !existingDates.has(p.date)), ...reelsConvertis];
    }
    return paie || POINTAGES_MOIS;
  } catch { return POINTAGES_MOIS; }
}

export default function SuiviPaieModule() {
  const [depot, setDepot] = useState(localStorage.getItem(STORAGE_DEPOT)||DEPOT_DEFAULT);
  const [chantiers, setChantiers] = useState(CHANTIERS_INIT);
  const [salaries, setSalaries] = useState(SALARIES);
  const pointages = loadPointages();
  const [selectedSalarie, setSelectedSalarie] = useState(null);
  const [calcEnCours, setCalcEnCours] = useState(false);
  const [distancesCalculees, setDistancesCalculees] = useState(false);
  const moisActuel = `${MOIS[new Date().getMonth()]} ${new Date().getFullYear()}`;

  // Sauvegarder depot et pointages
  useEffect(() => { localStorage.setItem(STORAGE_DEPOT, depot); }, [depot]);
  useEffect(() => { localStorage.setItem(STORAGE_POINTAGES, JSON.stringify(pointages)); }, [pointages]);

  // Charger les vrais employés depuis l'API
  useEffect(() => {
    api.get('/rh/employes').then(({data}) => {
      if(data.employes?.length) setSalaries(data.employes.map(e=>({id:e.id, nom:`${e.prenom} ${e.nom}`, poste:e.poste, salaireBase:e.salaireBase||2800, tauxJournalier:(e.salaireBase||2800)/21})));
    }).catch(()=>{});
  }, []);

  // Calculer les distances automatiquement via API adresse.data.gouv.fr
  const calculerDistances = useCallback(async () => {
    if (!depot || depot.length < 5) return;
    setCalcEnCours(true);
    const updated = [...chantiers];
    for (let i = 0; i < updated.length; i++) {
      const result = await calculerDistanceEntreAdresses(depot, updated[i].adresse);
      updated[i] = { ...updated[i], distanceDepot: result ? result.distanceKm : updated[i].distanceDepot };
    }
    setChantiers(updated);
    setCalcEnCours(false);
    setDistancesCalculees(true);
  }, [depot]);

  // Calcul au premier chargement
  useEffect(() => { calculerDistances(); }, []);

  // Calcul automatique de la paie pour chaque salarié
  const paiesSalaries = useMemo(() => {
    return salaries.map(sal => {
      const salPts = pointages.filter(p => p.employeId === sal.id);
      let totalHeures = 0, totalHeuresSupp = 0, totalIndemnites = 0, totalPaniers = 0, totalGD = 0, nbGD = 0;
      const detailJours = [];
      const chantiersVisites = new Set();

      salPts.forEach(p => {
        const chantier = chantiers.find(c => c.id === p.chantierId);
        const dist = chantier?.distanceDepot || 0;
        const trajet = calculerIndemniteTrajet(dist);
        const tauxH = sal.salaireBase / 21 / 7;
        const montantHS = p.heuresSupp > 0 ? (Math.min(p.heuresSupp, 8) * tauxH * 1.25) + (Math.max(0, p.heuresSupp - 8) * tauxH * 1.50) : 0;
        const gd = trajet.grandDeplacement ? 75 : 0;

        totalHeures += p.heures;
        totalHeuresSupp += p.heuresSupp;
        totalIndemnites += trajet.indemnite;
        totalPaniers += PANIER_REPAS_BTP;
        totalGD += gd;
        if (trajet.grandDeplacement) nbGD++;
        chantiersVisites.add(p.chantierId);

        detailJours.push({
          date: p.date,
          chantier: chantier?.nom || '?',
          distance: dist,
          heures: p.heures,
          heuresSupp: p.heuresSupp,
          indemnite: trajet.indemnite,
          panier: PANIER_REPAS_BTP,
          montantHS: Math.round(montantHS * 100) / 100,
          grandDeplacement: gd,
          zone: trajet.zone,
        });
      });

      const montantHS = detailJours.reduce((s, d) => s + d.montantHS, 0);
      const totalBrut = sal.salaireBase + totalIndemnites + totalPaniers + montantHS + totalGD;

      return {
        ...sal,
        nbJours: salPts.length,
        totalHeures: Math.round(totalHeures * 100) / 100,
        totalHeuresSupp,
        totalIndemnites: Math.round(totalIndemnites * 100) / 100,
        totalPaniers: Math.round(totalPaniers * 100) / 100,
        totalHS: Math.round(montantHS * 100) / 100,
        totalGD,
        nbGD,
        nbChantiers: chantiersVisites.size,
        totalBrut: Math.round(totalBrut * 100) / 100,
        detailJours,
      };
    });
  }, [calculerDistances]);

  const totalMasse = paiesSalaries.reduce((s, p) => s + p.totalBrut, 0);

  const exportCSV = () => {
    const rows = [['Salarié', 'Poste', 'Jours', 'Heures', 'H.Supp', 'Chantiers', 'Indemnités trajet', 'Paniers', 'HS montant', 'Gd déplacement', 'Salaire base', 'TOTAL BRUT']];
    paiesSalaries.forEach(p => rows.push([p.nom, p.poste, p.nbJours, p.totalHeures, p.totalHeuresSupp, p.nbChantiers, p.totalIndemnites, p.totalPaniers, p.totalHS, p.totalGD, p.salaireBase, p.totalBrut]));
    rows.push(['', '', '', '', '', '', '', '', '', '', 'MASSE SALARIALE', totalMasse]);
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `paie_${moisActuel.replace(' ', '_')}.csv`; a.click();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Suivi de paie — {moisActuel}</h2>
          <p style={{ fontSize: 12, color: '#555', margin: '4px 0 0' }}>Calcul automatique basé sur les pointages et distances chantiers</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={exportCSV} style={BTN_O}>Export CSV</button>
          <button onClick={() => window.print()} style={BTN}>Imprimer</button>
        </div>
      </div>

      {/* Config dépôt */}
      <div style={{ ...CARD, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: distancesCalculees ? 10 : 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#555', whiteSpace: 'nowrap' }}>Adresse dépôt :</span>
          <input value={depot} onChange={e => setDepot(e.target.value)} style={{ ...INP, flex: 1 }} />
          <button onClick={calculerDistances} disabled={calcEnCours} style={{ ...BTN, opacity: calcEnCours ? 0.5 : 1, whiteSpace: 'nowrap' }}>
            {calcEnCours ? 'Calcul...' : 'Calculer distances'}
          </button>
        </div>
        {distancesCalculees && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {chantiers.map(c => (
              <span key={c.id} style={{ fontSize: 10, padding: '3px 8px', background: c.distanceDepot !== null ? '#F0FDF4' : '#FEF2F2', border: `1px solid ${c.distanceDepot !== null ? '#16A34A25' : '#DC262625'}`, borderRadius: 6 }}>
                {c.nom} : {c.distanceDepot !== null ? <strong>{c.distanceDepot} km</strong> : 'Erreur'}
              </span>
            ))}
            <span style={{ fontSize: 10, color: '#555', alignSelf: 'center' }}>via api-adresse.data.gouv.fr</span>
          </div>
        )}
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { l: 'Masse salariale', v: `${(totalMasse / 1000).toFixed(1)}k€`, c: DS.gold },
          { l: 'Salariés', v: SALARIES.length, c: '#2563EB' },
          { l: 'Indemnités trajet', v: `${paiesSalaries.reduce((s, p) => s + p.totalIndemnites, 0).toFixed(0)}€`, c: '#D97706' },
          { l: 'Heures supp', v: `${paiesSalaries.reduce((s, p) => s + p.totalHeuresSupp, 0)}h`, c: '#DC2626' },
        ].map(k => (
          <div key={k.l} style={{ ...CARD, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: k.c, borderRadius: '14px 14px 0 0' }} />
            <div style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', marginBottom: 4 }}>{k.l}</div>
            <div style={{ fontSize: 24, fontWeight: 300 }}>{k.v}</div>
          </div>
        ))}
      </div>

      {!selectedSalarie && <>
        {/* Tableau récap par salarié */}
        <div style={{ ...CARD, padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F2F2F7' }}>
                <th style={TH}>Salarié</th>
                <th style={{ ...TH, textAlign: 'right' }}>Jours</th>
                <th style={{ ...TH, textAlign: 'right' }}>Heures</th>
                <th style={{ ...TH, textAlign: 'right' }}>H.Supp</th>
                <th style={{ ...TH, textAlign: 'right' }}>Chantiers</th>
                <th style={{ ...TH, textAlign: 'right' }}>Trajet</th>
                <th style={{ ...TH, textAlign: 'right' }}>Paniers</th>
                <th style={{ ...TH, textAlign: 'right' }}>Base</th>
                <th style={{ ...TH, textAlign: 'right', color: DS.gold }}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {paiesSalaries.map(p => (
                <tr key={p.id} onClick={() => setSelectedSalarie(p.id)} style={{ cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = '#F8F7F4'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={TD}><div style={{ fontWeight: 600 }}>{p.nom}</div><div style={{ fontSize: 10, color: '#555' }}>{p.poste}</div></td>
                  <td style={{ ...TD, textAlign: 'right' }}>{p.nbJours}</td>
                  <td style={{ ...TD, textAlign: 'right' }}>{p.totalHeures}h</td>
                  <td style={{ ...TD, textAlign: 'right', color: p.totalHeuresSupp > 0 ? '#D97706' : '#555' }}>{p.totalHeuresSupp > 0 ? `+${p.totalHeuresSupp}h` : '—'}</td>
                  <td style={{ ...TD, textAlign: 'right' }}>{p.nbChantiers}</td>
                  <td style={{ ...TD, textAlign: 'right', color: '#2563EB', fontWeight: 600 }}>{p.totalIndemnites}€</td>
                  <td style={{ ...TD, textAlign: 'right' }}>{p.totalPaniers.toFixed(0)}€</td>
                  <td style={{ ...TD, textAlign: 'right' }}>{p.salaireBase}€</td>
                  <td style={{ ...TD, textAlign: 'right', fontWeight: 800, color: DS.gold, fontSize: 14 }}>{p.totalBrut.toFixed(0)}€</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: '#0A0A0A' }}>
                <td style={{ ...TD, color: '#fff', fontWeight: 700, borderBottom: 'none' }}>TOTAL</td>
                <td style={{ ...TD, textAlign: 'right', color: '#fff', borderBottom: 'none' }}>{paiesSalaries.reduce((s, p) => s + p.nbJours, 0)}</td>
                <td style={{ ...TD, textAlign: 'right', color: '#fff', borderBottom: 'none' }}>{paiesSalaries.reduce((s, p) => s + p.totalHeures, 0)}h</td>
                <td style={{ ...TD, textAlign: 'right', color: '#D97706', borderBottom: 'none' }}>{paiesSalaries.reduce((s, p) => s + p.totalHeuresSupp, 0)}h</td>
                <td style={{ ...TD, borderBottom: 'none' }} />
                <td style={{ ...TD, textAlign: 'right', color: '#93C5FD', borderBottom: 'none' }}>{paiesSalaries.reduce((s, p) => s + p.totalIndemnites, 0)}€</td>
                <td style={{ ...TD, textAlign: 'right', color: '#fff', borderBottom: 'none' }}>{paiesSalaries.reduce((s, p) => s + p.totalPaniers, 0).toFixed(0)}€</td>
                <td style={{ ...TD, textAlign: 'right', color: '#fff', borderBottom: 'none' }}>{paiesSalaries.reduce((s, p) => s + p.salaireBase, 0)}€</td>
                <td style={{ ...TD, textAlign: 'right', color: DS.gold, fontWeight: 800, fontSize: 16, borderBottom: 'none' }}>{totalMasse.toFixed(0)}€</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </>}

      {/* Détail par salarié */}
      {selectedSalarie && (() => {
        const p = paiesSalaries.find(s => s.id === selectedSalarie);
        if (!p) return null;
        return <>
          <button onClick={() => setSelectedSalarie(null)} style={{ ...BTN_O, marginBottom: 12, fontSize: 11 }}>← Retour</button>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>{p.nom} — {moisActuel}</h3>
              <p style={{ fontSize: 12, color: '#555', margin: '2px 0 0' }}>{p.poste} · Base {p.salaireBase}€ · {p.nbJours} jours · {p.nbChantiers} chantiers</p>
            </div>
            <div style={{ background: '#0A0A0A', borderRadius: 10, padding: '12px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: DS.gold, textTransform: 'uppercase' }}>Total brut</div>
              <div style={{ fontSize: 24, fontWeight: 300, color: '#fff' }}>{p.totalBrut.toFixed(2)} €</div>
            </div>
          </div>

          {/* Récap */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 16 }}>
            {[
              { l: 'Base', v: `${p.salaireBase}€`, c: '#333' },
              { l: 'Indemnités trajet', v: `+${p.totalIndemnites}€`, c: '#2563EB' },
              { l: 'Paniers repas', v: `+${p.totalPaniers.toFixed(0)}€`, c: '#16A34A' },
              { l: 'Heures supp', v: `+${p.totalHS.toFixed(0)}€`, c: '#D97706' },
              { l: 'Grand déplacement', v: `+${p.totalGD}€`, c: '#DC2626' },
            ].map(k => (
              <div key={k.l} style={{ background: '#F8F7F4', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 300, color: k.c }}>{k.v}</div>
                <div style={{ fontSize: 10, color: '#555' }}>{k.l}</div>
              </div>
            ))}
          </div>

          {/* Détail jour par jour */}
          <div style={{ ...CARD, padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F2F2F7' }}>
                  <th style={TH}>Date</th>
                  <th style={TH}>Chantier</th>
                  <th style={{ ...TH, textAlign: 'right' }}>Dist.</th>
                  <th style={{ ...TH, textAlign: 'right' }}>Heures</th>
                  <th style={{ ...TH, textAlign: 'right' }}>H.S.</th>
                  <th style={{ ...TH, textAlign: 'right' }}>Trajet</th>
                  <th style={{ ...TH, textAlign: 'right' }}>Panier</th>
                  <th style={{ ...TH, textAlign: 'right' }}>G.D.</th>
                </tr>
              </thead>
              <tbody>
                {p.detailJours.map((d, i) => (
                  <tr key={i} style={{ background: d.grandDeplacement > 0 ? '#FEF2F2' : 'transparent' }}>
                    <td style={TD}>{d.date.split('-').reverse().join('/')}</td>
                    <td style={{ ...TD, fontWeight: 500 }}>{d.chantier}</td>
                    <td style={{ ...TD, textAlign: 'right', fontSize: 11 }}>{d.distance} km</td>
                    <td style={{ ...TD, textAlign: 'right' }}>{d.heures}h</td>
                    <td style={{ ...TD, textAlign: 'right', color: d.heuresSupp > 0 ? '#D97706' : '#ccc' }}>{d.heuresSupp > 0 ? `+${d.heuresSupp}h` : '—'}</td>
                    <td style={{ ...TD, textAlign: 'right', color: '#2563EB', fontWeight: d.indemnite > 0 ? 600 : 400 }}>{d.indemnite > 0 ? `${d.indemnite}€` : '—'}</td>
                    <td style={{ ...TD, textAlign: 'right' }}>{d.panier.toFixed(0)}€</td>
                    <td style={{ ...TD, textAlign: 'right', color: '#DC2626', fontWeight: d.grandDeplacement > 0 ? 700 : 400 }}>{d.grandDeplacement > 0 ? `${d.grandDeplacement}€` : '—'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#F2F2F7', fontWeight: 700 }}>
                  <td style={{ ...TD, fontWeight: 700 }}>TOTAL</td>
                  <td style={TD}>{p.nbChantiers} chantiers</td>
                  <td style={TD} />
                  <td style={{ ...TD, textAlign: 'right' }}>{p.totalHeures}h</td>
                  <td style={{ ...TD, textAlign: 'right', color: '#D97706' }}>{p.totalHeuresSupp > 0 ? `+${p.totalHeuresSupp}h` : ''}</td>
                  <td style={{ ...TD, textAlign: 'right', color: '#2563EB', fontWeight: 700 }}>{p.totalIndemnites}€</td>
                  <td style={{ ...TD, textAlign: 'right' }}>{p.totalPaniers.toFixed(0)}€</td>
                  <td style={{ ...TD, textAlign: 'right', color: '#DC2626' }}>{p.totalGD > 0 ? `${p.totalGD}€` : ''}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </>;
      })()}
    </div>
  );
}
