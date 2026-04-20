import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const C = '#E535AB';
const C_BG = '#FFF0F8';
const C_SOFT = '#FCE7F3';

// RDV statuses: 'a_venir' | 'paiement_bloque' | 'en_cours' | 'termine' | 'annule'
const RDV_DEMO = [
  { id:1, heure:'09:00', client:'Marie Lefebvre', telephone:'06 12 34 56 78', email:'marie.lefebvre@gmail.com', prestation:'Coupe + Brushing', duree:60, montant:55, employe:'Camille M.', statut:'termine', code:'FRP-2841', facture:true },
  { id:2, heure:'10:15', client:'Sophie Bernard', telephone:'06 23 45 67 89', email:'sophie.b@gmail.com', prestation:'Coloration racines', duree:90, montant:85, employe:'Camille M.', statut:'en_cours', code:'FRP-3952', facture:false },
  { id:3, heure:'11:30', client:'Laura Dupont', telephone:'07 34 56 78 90', email:'laura.d@gmail.com', prestation:'Balayage + Soin', duree:120, montant:130, employe:'Camille M.', statut:'paiement_bloque', code:'FRP-4063', facture:false },
  { id:4, heure:'14:00', client:'Julie Martin', telephone:'06 45 67 89 01', email:'julie.m@gmail.com', prestation:'Coupe femme', duree:45, montant:42, employe:'Emma L.', statut:'a_venir', code:'FRP-5174', facture:false },
  { id:5, heure:'15:00', client:'Céline Rousseau', telephone:'06 56 78 90 12', email:'celine.r@gmail.com', prestation:'Épilation sourcils', duree:20, montant:15, employe:'Emma L.', statut:'a_venir', code:'FRP-6285', facture:false },
  { id:6, heure:'16:00', client:'Nina Petit', telephone:'07 67 89 01 23', email:'nina.p@gmail.com', prestation:'Lissage brésilien', duree:180, montant:210, employe:'Camille M.', statut:'a_venir', code:'FRP-7396', facture:false },
  { id:7, heure:'09:30', client:'Amélie Garnier', telephone:'06 78 90 12 34', email:'amelie.g@gmail.com', prestation:'Coupe + Brushing', duree:60, montant:55, employe:'Camille M.', statut:'a_venir', code:'FRP-8407', facture:false, demain:true },
  { id:8, heure:'11:00', client:'Lucie Fontaine', telephone:'07 89 01 23 45', email:'lucie.f@gmail.com', prestation:'Balayage', duree:120, montant:120, employe:'Emma L.', statut:'a_venir', code:'FRP-9518', facture:false, demain:true },
];

const SERVICES_DEMO = [
  { id:1, categorie:'Coupes',      nom:'Coupe femme',        duree:45,  prix:42,  actif:true },
  { id:2, categorie:'Coupes',      nom:'Coupe homme',        duree:30,  prix:28,  actif:true },
  { id:3, categorie:'Coupes',      nom:'Coupe + Brushing',   duree:60,  prix:55,  actif:true },
  { id:4, categorie:'Colorations', nom:'Coloration racines', duree:90,  prix:85,  actif:true },
  { id:5, categorie:'Colorations', nom:'Balayage',           duree:120, prix:120, actif:true },
  { id:6, categorie:'Colorations', nom:'Mèches',             duree:90,  prix:95,  actif:true },
  { id:7, categorie:'Soins',       nom:'Lissage brésilien',  duree:180, prix:210, actif:true },
  { id:8, categorie:'Soins',       nom:'Soin profond',       duree:30,  prix:35,  actif:true },
  { id:9, categorie:'Beauté',      nom:'Épilation sourcils', duree:20,  prix:15,  actif:true },
  { id:10,categorie:'Beauté',      nom:'Manucure simple',    duree:45,  prix:30,  actif:false },
];

const CLIENTS_DEMO = [
  { id:1, nom:'Marie Lefebvre',  email:'marie.lefebvre@gmail.com', telephone:'06 12 34 56 78', visites:12, dernierRdv:'2026-03-18', depense:620,  fidelite:'vip',      preferences:'Cheveux longs, allergique coloration chimique' },
  { id:2, nom:'Sophie Bernard',  email:'sophie.b@gmail.com',       telephone:'06 23 45 67 89', visites:8,  dernierRdv:'2026-03-10', depense:480,  fidelite:'fidele',   preferences:'Couleur naturelle, balayage mel/miel' },
  { id:3, nom:'Laura Dupont',    email:'laura.d@gmail.com',         telephone:'07 34 56 78 90', visites:5,  dernierRdv:'2026-02-28', depense:310,  fidelite:'regulier', preferences:'' },
  { id:4, nom:'Julie Martin',    email:'julie.m@gmail.com',         telephone:'06 45 67 89 01', visites:3,  dernierRdv:'2026-02-14', depense:145,  fidelite:'nouveau',  preferences:'Première visite' },
  { id:5, nom:'Céline Rousseau', email:'celine.r@gmail.com',        telephone:'06 56 78 90 12', visites:15, dernierRdv:'2026-03-20', depense:890,  fidelite:'vip',      preferences:'Régulière tous les mois, prefère Camille' },
  { id:6, nom:'Nina Petit',      email:'nina.p@gmail.com',          telephone:'07 67 89 01 23', visites:7,  dernierRdv:'2026-03-15', depense:420,  fidelite:'fidele',   preferences:'Lissage brésilien 2x/an' },
];

const EQUIPE_DEMO = [
  { id:1, nom:'Camille Moreau', poste:'Coiffeuse senior', rdvAujourd:4, caJour:480, dispo:true,  couleur:'#E535AB' },
  { id:2, nom:'Emma Laurent',   poste:'Coiffeuse',        rdvAujourd:2, caJour:115, dispo:true,  couleur:'#7C3AED' },
  { id:3, nom:'Léa Dubois',     poste:'Esthéticienne',    rdvAujourd:0, caJour:0,   dispo:false, couleur:'#0891B2' },
];

const TRANSACTIONS_DEMO = [
  { id:'T001', date:'2026-04-03', client:'Marie Lefebvre',   prestation:'Coupe + Brushing',  montant:55,  statut:'libere',  type:'paiement' },
  { id:'T002', date:'2026-04-03', client:'Sophie Bernard',   prestation:'Coloration racines', montant:85,  statut:'bloque',  type:'paiement' },
  { id:'T003', date:'2026-04-03', client:'Laura Dupont',     prestation:'Balayage + Soin',    montant:130, statut:'bloque',  type:'paiement' },
  { id:'T004', date:'2026-04-02', client:'Amélie Garnier',   prestation:'Coupe femme',        montant:42,  statut:'libere',  type:'paiement' },
  { id:'T005', date:'2026-04-02', client:'Lucie Fontaine',   prestation:'Balayage',           montant:120, statut:'libere',  type:'paiement' },
  { id:'T006', date:'2026-04-01', client:'Céline Rousseau',  prestation:'Lissage brésilien',  montant:210, statut:'libere',  type:'paiement' },
  { id:'VIRT1',date:'2026-03-31', client:'',                 prestation:'Virement mensuel',   montant:850, statut:'vire',    type:'virement' },
];

const CARD_STYLE = { background:'#fff', borderRadius:14, padding:'20px 24px', border:'1px solid #E8E6E1', boxShadow:'0 1px 4px rgba(0,0,0,.06)' };
const SECTION_HDR = { fontSize:13, fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:12 };
const BTN_PRIMARY = { background:C, color:'#fff', border:'none', borderRadius:10, padding:'10px 20px', fontWeight:700, cursor:'pointer', fontFamily:'inherit', fontSize:'0.875rem' };
const MODAL_OVERLAY = { position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 };
const MODAL_BOX = { background:'#fff', borderRadius:18, padding:'28px 32px', width:'100%', maxWidth:480, boxShadow:'0 24px 64px rgba(0,0,0,.18)', maxHeight:'90vh', overflowY:'auto' };

function KpiCard({ label, value, sub, accent }) {
  return (
    <div style={{ ...CARD_STYLE, flex:1, minWidth:0 }}>
      <div style={{ fontSize:12, fontWeight:600, color:'#888', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>{label}</div>
      <div style={{ fontSize:26, fontWeight:800, color: accent || '#1C1C1E', lineHeight:1.1 }}>{value}</div>
      {sub && <div style={{ fontSize:12, color:'#888', marginTop:4 }}>{sub}</div>}
    </div>
  );
}

function StatutBadge({ statut }) {
  const map = {
    a_venir:         { label:'À venir',      bg:'#F3F4F6', color:'#6B7280' },
    paiement_bloque: { label:'Paiement reçu', bg:'#FEF3C7', color:'#D97706' },
    en_cours:        { label:'En cours',      bg:'#DBEAFE', color:'#2563EB' },
    termine:         { label:'Terminé',       bg:'#D1FAE5', color:'#065F46' },
    annule:          { label:'Annulé',        bg:'#FEE2E2', color:'#DC2626' },
  };
  const s = map[statut] || map.a_venir;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, background:s.bg, color:s.color, borderRadius:8, padding:'3px 10px', fontSize:12, fontWeight:700 }}>
      <span style={{ width:7, height:7, borderRadius:'50%', background:s.color, display:'inline-block' }} />
      {s.label}
    </span>
  );
}

function FakeQRCode({ code }) {
  const cells = 11;
  const seed = code.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const grid = Array.from({ length: cells * cells }, (_, i) => {
    const row = Math.floor(i / cells), col = i % cells;
    if ((row < 3 && col < 3) || (row < 3 && col >= cells - 3) || (row >= cells - 3 && col < 3)) return 1;
    return ((row * 13 + col * 7 + seed) % 3 === 0) ? 1 : 0;
  });
  return (
    <div style={{ display:'inline-grid', gridTemplateColumns:`repeat(${cells}, 1fr)`, gap:1, padding:12, background:'#fff', borderRadius:8, border:'2px solid #E8E6E1' }}>
      {grid.map((c, i) => (
        <div key={i} style={{ width:8, height:8, background: c ? '#1C1C1E' : '#fff', borderRadius:1 }} />
      ))}
    </div>
  );
}

function initials(name) {
  return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
}

function fideliteLabel(f) {
  const map = { vip:'VIP', fidele:'Fidèle', regulier:'Régulier', nouveau:'Nouveau' };
  return map[f] || f;
}

function fideliteColor(f) {
  const map = { vip:C, fidele:'#7C3AED', regulier:'#0891B2', nouveau:'#6B7280' };
  return map[f] || '#888';
}

const COIFFURE_TAB_MAP = { rdv:'rdv', services:'services', clients:'clients', equipe:'equipe', paiements:'paiements', parametres:'parametres', rapports:'rapports' };

export default function DashboardCoiffure() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const onglet = searchParams.get('onglet');
  const [tab, setTab] = useState(COIFFURE_TAB_MAP[onglet] || 'accueil');
  const [rdvList, setRdvList] = useState(RDV_DEMO);

  useEffect(() => {
    const o = searchParams.get('onglet');
    if (o && COIFFURE_TAB_MAP[o]) setTab(COIFFURE_TAB_MAP[o]);
    else if (!o) setTab('accueil');
  }, [searchParams]);
  const [services, setServices] = useState(SERVICES_DEMO);
  const [clients, setClients] = useState(CLIENTS_DEMO);
  const [equipe, setEquipe] = useState(EQUIPE_DEMO);
  const [transactions, setTransactions] = useState(TRANSACTIONS_DEMO);

  const [qrModal, setQrModal] = useState(null);
  const [finModal, setFinModal] = useState(null);
  const [factureModal, setFactureModal] = useState(null);
  const [clientModal, setClientModal] = useState(null);
  const [serviceModal, setServiceModal] = useState(null);
  const [equipeModal, setEquipeModal] = useState(false);
  const [virementModal, setVirementModal] = useState(false);
  const [toast, setToast] = useState(null);

  function showToast(msg, type) {
    setToast({ msg, type: type || 'success' });
    setTimeout(() => setToast(null), 3000);
  }

  function commencerPrestation(rdvId, codeEntered) {
    const rdv = rdvList.find(r => r.id === rdvId);
    if (codeEntered.trim().toUpperCase() === rdv.code) {
      setRdvList(prev => prev.map(r => r.id === rdvId ? { ...r, statut:'en_cours' } : r));
      setQrModal(null);
      showToast('Prestation démarrée ! Paiement sécurisé sur la plateforme.', 'success');
    } else {
      showToast('Code incorrect. Veuillez réessayer.', 'error');
    }
  }

  function finirPrestation(rdvId) {
    const rdv = rdvList.find(r => r.id === rdvId);
    setRdvList(prev => prev.map(r => r.id === rdvId ? { ...r, statut:'termine', facture:true } : r));
    if (rdv) {
      setTransactions(prev => prev.map(t =>
        t.client === rdv.client && t.statut === 'bloque' ? { ...t, statut:'libere' } : t
      ));
    }
    setFinModal(null);
    setFactureModal(rdvId);
  }

  const todayRdv = rdvList.filter(r => !r.demain);
  const caTodayVal = todayRdv.filter(r => r.statut === 'termine').reduce((s, r) => s + r.montant, 0);
  const argentBloqueVal = todayRdv.filter(r => r.statut === 'paiement_bloque' || r.statut === 'en_cours').reduce((s, r) => s + r.montant, 0);
  const prochainRdv = todayRdv.find(r => r.statut === 'a_venir' || r.statut === 'paiement_bloque');

  function QRModal() {
    const rdv = rdvList.find(r => r.id === qrModal);
    const [qrTab, setQrTab] = useState('qr');
    const [codeInput, setCodeInput] = useState('');
    if (!rdv) return null;
    return (
      <div style={MODAL_OVERLAY} onClick={() => setQrModal(null)}>
        <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize:18, fontWeight:800, color:'#1C1C1E', marginBottom:4 }}>Démarrer la prestation</div>
          <div style={{ fontSize:14, color:'#888', marginBottom:20 }}>{rdv.client} — {rdv.prestation}</div>
          <div style={{ display:'flex', gap:4, background:C_SOFT, borderRadius:10, padding:4, marginBottom:24 }}>
            {['qr','code'].map(t => (
              <button key={t} onClick={() => setQrTab(t)} style={{
                flex:1, padding:'8px 0', borderRadius:8, border:'none', cursor:'pointer', fontFamily:'inherit',
                fontWeight:700, fontSize:13, background: qrTab === t ? C : 'transparent', color: qrTab === t ? '#fff' : '#888',
                transition:'all .15s',
              }}>
                {t === 'qr' ? 'QR Code' : 'Code manuel'}
              </button>
            ))}
          </div>
          {qrTab === 'qr' && (
            <div style={{ textAlign:'center' }}>
              <FakeQRCode code={rdv.code} />
              <div style={{ marginTop:16, fontSize:13, color:'#888' }}>Demandez au client de montrer son QR code</div>
              <div style={{ marginTop:8, fontSize:12, color:'#aaa' }}>Code attendu : <strong>{rdv.code}</strong></div>
            </div>
          )}
          {qrTab === 'code' && (
            <div>
              <div style={{ fontSize:12, color:'#888', marginBottom:6 }}>Code attendu : <strong style={{ color:C }}>{rdv.code}</strong></div>
              <input
                value={codeInput}
                onChange={e => setCodeInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && commencerPrestation(rdv.id, codeInput)}
                placeholder="Code client (ex: FRP-XXXX)"
                style={{ width:'100%', padding:'12px 14px', borderRadius:10, border:'1.5px solid #E8E6E1', fontSize:15, fontFamily:'inherit', letterSpacing:'0.05em', boxSizing:'border-box', marginBottom:16 }}
              />
              <button style={{ ...BTN_PRIMARY, width:'100%', padding:'13px 0', fontSize:15 }} onClick={() => commencerPrestation(rdv.id, codeInput)}>
                Valider
              </button>
            </div>
          )}
          <button style={{ marginTop:16, width:'100%', padding:'10px 0', borderRadius:10, border:'1.5px solid #E8E6E1', background:'transparent', cursor:'pointer', fontFamily:'inherit', fontWeight:600, color:'#888' }} onClick={() => setQrModal(null)}>
            Annuler
          </button>
        </div>
      </div>
    );
  }

  function FinModal() {
    const rdv = rdvList.find(r => r.id === finModal);
    if (!rdv) return null;
    return (
      <div style={MODAL_OVERLAY} onClick={() => setFinModal(null)}>
        <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize:18, fontWeight:800, color:'#1C1C1E', marginBottom:4 }}>Fin de prestation</div>
          <div style={{ fontSize:14, color:'#888', marginBottom:20 }}>Confirmez la fin de la prestation pour libérer le paiement.</div>
          <div style={{ background:C_SOFT, borderRadius:12, padding:'16px 18px', marginBottom:24 }}>
            <div style={{ fontWeight:700, fontSize:15, color:'#1C1C1E' }}>{rdv.client}</div>
            <div style={{ fontSize:13, color:'#888', marginTop:2 }}>{rdv.prestation}</div>
            <div style={{ fontSize:22, fontWeight:800, color:C, marginTop:8 }}>{rdv.montant}€</div>
          </div>
          <button style={{ ...BTN_PRIMARY, width:'100%', padding:'13px 0', fontSize:15, background:'#10B981', marginBottom:10 }} onClick={() => finirPrestation(rdv.id)}>
            Libérer le paiement de {rdv.montant}€
          </button>
          <button style={{ width:'100%', padding:'10px 0', borderRadius:10, border:'1.5px solid #E8E6E1', background:'transparent', cursor:'pointer', fontFamily:'inherit', fontWeight:600, color:'#888' }} onClick={() => setFinModal(null)}>
            Annuler
          </button>
        </div>
      </div>
    );
  }

  function FactureModal() {
    const rdv = rdvList.find(r => r.id === factureModal);
    if (!rdv) return null;
    return (
      <div style={MODAL_OVERLAY} onClick={() => setFactureModal(null)}>
        <div style={{ ...MODAL_BOX, maxWidth:520 }} onClick={e => e.stopPropagation()}>
          <div style={{ textAlign:'center', marginBottom:20 }}>
            <div style={{ width:56, height:56, borderRadius:14, background:C_SOFT, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:26, marginBottom:8 }}>✂️</div>
            <div style={{ fontSize:20, fontWeight:800, color:'#1C1C1E' }}>Salon de Coiffure</div>
            <div style={{ fontSize:13, color:'#888' }}>12 rue de la Paix, 75001 Paris</div>
          </div>
          <div style={{ borderTop:'1px solid #E8E6E1', borderBottom:'1px solid #E8E6E1', padding:'16px 0', margin:'0 0 20px' }}>
            {[
              ['Client', rdv.client],
              ['Email', rdv.email],
              ['Date', '03/04/2026'],
              ['Prestation', rdv.prestation],
              ['Durée', `${rdv.duree} min`],
              ['Coiffeur(se)', rdv.employe],
            ].map(([k, v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:13, color:'#888' }}>{k}</span>
                <span style={{ fontSize:13, fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <span style={{ fontSize:16, fontWeight:700 }}>Total</span>
            <span style={{ fontSize:24, fontWeight:900, color:C }}>{rdv.montant}€</span>
          </div>
          <div style={{ background:'#D1FAE5', borderRadius:10, padding:'10px 14px', marginBottom:20, fontSize:13, color:'#065F46', fontWeight:600 }}>
            ✓ Envoyé automatiquement à {rdv.email}
          </div>
          <div style={{ display:'flex', gap:10, marginBottom:10 }}>
            <button style={{ ...BTN_PRIMARY, flex:1 }} onClick={() => { showToast('Téléchargement en cours...'); setFactureModal(null); }}>
              Télécharger PDF
            </button>
            <button style={{ ...BTN_PRIMARY, flex:1, background:'#3B82F6' }} onClick={() => { showToast('Facture envoyée par email !'); setFactureModal(null); }}>
              Envoyer par e-mail
            </button>
          </div>
          <button style={{ width:'100%', padding:'10px 0', borderRadius:10, border:'1.5px solid #E8E6E1', background:'transparent', cursor:'pointer', fontFamily:'inherit', fontWeight:600, color:'#888' }} onClick={() => setFactureModal(null)}>
            Fermer
          </button>
        </div>
      </div>
    );
  }

  function ClientDetailModal() {
    const [notes, setNotes] = useState(clientModal ? clientModal.preferences : '');
    if (!clientModal) return null;
    const histRdv = rdvList.filter(r => r.client === clientModal.nom).slice(0, 5);
    return (
      <div style={MODAL_OVERLAY} onClick={() => setClientModal(null)}>
        <div style={{ ...MODAL_BOX, maxWidth:520 }} onClick={e => e.stopPropagation()}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
            <div style={{ width:52, height:52, borderRadius:'50%', background:C_SOFT, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, color:C, flexShrink:0 }}>
              {initials(clientModal.nom)}
            </div>
            <div>
              <div style={{ fontSize:18, fontWeight:800 }}>{clientModal.nom}</div>
              <span style={{ background:fideliteColor(clientModal.fidelite)+'22', color:fideliteColor(clientModal.fidelite), borderRadius:6, padding:'2px 10px', fontSize:12, fontWeight:700 }}>{fideliteLabel(clientModal.fidelite)}</span>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
            {[
              ['Téléphone', clientModal.telephone],
              ['Email', clientModal.email],
              ['Visites', clientModal.visites],
              ['Total dépensé', clientModal.depense + '€'],
            ].map(([k, v]) => (
              <div key={k} style={{ background:C_BG, borderRadius:10, padding:'12px 14px' }}>
                <div style={{ fontSize:11, color:'#888', marginBottom:2 }}>{k}</div>
                <div style={{ fontWeight:700, fontSize:13, wordBreak:'break-all' }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom:20 }}>
            <div style={SECTION_HDR}>Notes & Préférences</div>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Aucune note..."
              style={{ width:'100%', minHeight:70, padding:'10px 12px', borderRadius:10, border:'1.5px solid #E8E6E1', fontSize:13, fontFamily:'inherit', resize:'vertical', boxSizing:'border-box' }}
            />
          </div>
          {histRdv.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <div style={SECTION_HDR}>Derniers rendez-vous</div>
              {histRdv.map(r => (
                <div key={r.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #F3F4F6' }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600 }}>{r.prestation}</div>
                    <div style={{ fontSize:12, color:'#888' }}>{r.heure} — {r.employe}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span style={{ fontWeight:700, color:C }}>{r.montant}€</span>
                    <StatutBadge statut={r.statut} />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display:'flex', gap:10 }}>
            <button style={{ ...BTN_PRIMARY, flex:1 }} onClick={() => { setClients(prev => prev.map(c => c.id === clientModal.id ? { ...c, preferences:notes } : c)); showToast('Notes sauvegardées !'); setClientModal(null); }}>
              Sauvegarder
            </button>
            <button style={{ flex:1, padding:'10px 0', borderRadius:10, border:'1.5px solid #E8E6E1', background:'transparent', cursor:'pointer', fontFamily:'inherit', fontWeight:600, color:'#888' }} onClick={() => setClientModal(null)}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  function ServiceFormModal() {
    const isNew = serviceModal === 'new';
    const [form, setForm] = useState(isNew ? { nom:'', categorie:'Coupes', duree:30, prix:0, actif:true } : { ...serviceModal });
    const cats = ['Coupes', 'Colorations', 'Soins', 'Beauté'];
    function save() {
      if (!form.nom.trim()) { showToast('Le nom est requis.', 'error'); return; }
      if (isNew) {
        setServices(prev => [...prev, { ...form, id: Date.now() }]);
        showToast('Service ajouté !');
      } else {
        setServices(prev => prev.map(s => s.id === form.id ? form : s));
        showToast('Service mis à jour !');
      }
      setServiceModal(null);
    }
    return (
      <div style={MODAL_OVERLAY} onClick={() => setServiceModal(null)}>
        <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize:18, fontWeight:800, marginBottom:20 }}>{isNew ? 'Nouveau service' : 'Modifier le service'}</div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:4 }}>Nom</label>
            <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom:e.target.value }))} placeholder="Nom du service" style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #E8E6E1', fontSize:14, fontFamily:'inherit', boxSizing:'border-box' }} />
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:4 }}>Catégorie</label>
            <select value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie:e.target.value }))} style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #E8E6E1', fontSize:14, fontFamily:'inherit', boxSizing:'border-box' }}>
              {cats.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:4 }}>Durée : {form.duree} min</label>
            <input type="range" min={10} max={240} step={5} value={form.duree} onChange={e => setForm(f => ({ ...f, duree:+e.target.value }))} style={{ width:'100%' }} />
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:4 }}>Prix (€)</label>
            <input type="number" value={form.prix} onChange={e => setForm(f => ({ ...f, prix:+e.target.value }))} style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #E8E6E1', fontSize:14, fontFamily:'inherit', boxSizing:'border-box' }} />
          </div>
          <div style={{ marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
            <input type="checkbox" id="actif-svc" checked={form.actif} onChange={e => setForm(f => ({ ...f, actif:e.target.checked }))} style={{ width:18, height:18 }} />
            <label htmlFor="actif-svc" style={{ fontSize:14, fontWeight:600 }}>Actif</label>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button style={{ ...BTN_PRIMARY, flex:1 }} onClick={save}>Enregistrer</button>
            <button style={{ flex:1, padding:'10px 0', borderRadius:10, border:'1.5px solid #E8E6E1', background:'transparent', cursor:'pointer', fontFamily:'inherit', fontWeight:600, color:'#888' }} onClick={() => setServiceModal(null)}>Annuler</button>
          </div>
        </div>
      </div>
    );
  }

  function EquipeFormModal() {
    const [form, setForm] = useState({ nom:'', poste:'', couleur:C });
    function save() {
      if (!form.nom.trim()) { showToast('Le nom est requis.', 'error'); return; }
      setEquipe(prev => [...prev, { ...form, id: Date.now(), rdvAujourd:0, caJour:0, dispo:true }]);
      showToast('Employé ajouté !');
      setEquipeModal(false);
    }
    return (
      <div style={MODAL_OVERLAY} onClick={() => setEquipeModal(false)}>
        <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize:18, fontWeight:800, marginBottom:20 }}>Ajouter un employé</div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:4 }}>Nom complet</label>
            <input value={form.nom} onChange={e => setForm(f => ({ ...f, nom:e.target.value }))} placeholder="Prénom Nom" style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #E8E6E1', fontSize:14, fontFamily:'inherit', boxSizing:'border-box' }} />
          </div>
          <div style={{ marginBottom:14 }}>
            <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:4 }}>Poste</label>
            <input value={form.poste} onChange={e => setForm(f => ({ ...f, poste:e.target.value }))} placeholder="ex: Coiffeuse, Esthéticienne" style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #E8E6E1', fontSize:14, fontFamily:'inherit', boxSizing:'border-box' }} />
          </div>
          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:4 }}>Couleur agenda</label>
            <input type="color" value={form.couleur} onChange={e => setForm(f => ({ ...f, couleur:e.target.value }))} style={{ width:48, height:36, borderRadius:8, border:'none', cursor:'pointer' }} />
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button style={{ ...BTN_PRIMARY, flex:1 }} onClick={save}>Ajouter</button>
            <button style={{ flex:1, padding:'10px 0', borderRadius:10, border:'1.5px solid #E8E6E1', background:'transparent', cursor:'pointer', fontFamily:'inherit', fontWeight:600, color:'#888' }} onClick={() => setEquipeModal(false)}>Annuler</button>
          </div>
        </div>
      </div>
    );
  }

  function VirementModal() {
    const [iban, setIban] = useState('FR76 3000 4028 3798 7654 3210 943');
    const [montant, setMontant] = useState(595);
    const [done, setDone] = useState(false);
    function confirm() {
      setTransactions(prev => [...prev, { id:'VIRT-' + Date.now(), date:'2026-04-03', client:'', prestation:'Virement demandé', montant, statut:'vire', type:'virement' }]);
      setDone(true);
      setTimeout(() => { setVirementModal(false); setDone(false); showToast('Virement demandé avec succès !'); }, 1800);
    }
    return (
      <div style={MODAL_OVERLAY} onClick={() => setVirementModal(false)}>
        <div style={MODAL_BOX} onClick={e => e.stopPropagation()}>
          <div style={{ fontSize:18, fontWeight:800, marginBottom:20 }}>Demander un virement</div>
          {done ? (
            <div style={{ textAlign:'center', padding:'30px 0' }}>
              <div style={{ fontSize:48 }}>✅</div>
              <div style={{ fontSize:16, fontWeight:700, marginTop:12 }}>Virement envoyé !</div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:4 }}>IBAN</label>
                <input value={iban} onChange={e => setIban(e.target.value)} style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #E8E6E1', fontSize:13, fontFamily:'inherit', boxSizing:'border-box' }} />
              </div>
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:4 }}>Montant (€)</label>
                <input type="number" value={montant} onChange={e => setMontant(+e.target.value)} style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #E8E6E1', fontSize:14, fontFamily:'inherit', boxSizing:'border-box' }} />
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button style={{ ...BTN_PRIMARY, flex:1, background:'#10B981' }} onClick={confirm}>Confirmer le virement</button>
                <button style={{ flex:1, padding:'10px 0', borderRadius:10, border:'1.5px solid #E8E6E1', background:'transparent', cursor:'pointer', fontFamily:'inherit', fontWeight:600, color:'#888' }} onClick={() => setVirementModal(false)}>Annuler</button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ==================== TAB ACCUEIL ====================
  function TabAccueil() {
    const [codeRapide, setCodeRapide] = useState('');

    function validerCodeRapide() {
      const rdv = rdvList.find(r => r.code === codeRapide.trim().toUpperCase() && r.statut === 'paiement_bloque');
      if (rdv) {
        commencerPrestation(rdv.id, codeRapide);
        setCodeRapide('');
      } else {
        showToast('Code introuvable ou prestation déjà démarrée.', 'error');
      }
    }

    return (
      <div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
          <KpiCard label="CA aujourd'hui" value={`${caTodayVal}€`} sub="Prestations terminées" accent={C} />
          <KpiCard label="Argent bloqué" value={`${argentBloqueVal}€`} sub="En attente de validation" accent="#F59E0B" />
          <KpiCard label="RDV aujourd'hui" value={todayRdv.length} sub={`${todayRdv.filter(r => r.statut === 'termine').length} terminé(s)`} />
          <KpiCard label="Prochain RDV" value={prochainRdv ? prochainRdv.heure : '—'} sub={prochainRdv ? prochainRdv.client : 'Pas de RDV à venir'} />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
          <div style={{ ...CARD_STYLE, background:'linear-gradient(135deg, #fff 0%, #FFF0F8 100%)' }}>
            <div style={{ fontSize:16, fontWeight:800, color:'#1C1C1E', marginBottom:4 }}>Validation rapide ▶</div>
            <div style={{ fontSize:13, color:'#888', marginBottom:16 }}>Entrez le code client pour démarrer la prestation — aucun TPE nécessaire</div>
            <div style={{ display:'flex', gap:10 }}>
              <input
                value={codeRapide}
                onChange={e => setCodeRapide(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && validerCodeRapide()}
                placeholder="FRP-XXXX"
                style={{ flex:1, padding:'11px 14px', borderRadius:10, border:'1.5px solid #E8E6E1', fontSize:15, fontFamily:'inherit', letterSpacing:'0.05em' }}
              />
              <button style={{ ...BTN_PRIMARY, padding:'11px 20px', fontSize:15 }} onClick={validerCodeRapide}>Valider</button>
            </div>
          </div>

          <div style={CARD_STYLE}>
            <div style={SECTION_HDR}>Alertes</div>
            {rdvList.filter(r => r.statut === 'paiement_bloque').length === 0 && rdvList.filter(r => r.statut === 'en_cours').length === 0 && (
              <div style={{ fontSize:13, color:'#888' }}>Aucune alerte pour le moment.</div>
            )}
            {rdvList.filter(r => r.statut === 'paiement_bloque').map(r => (
              <div key={r.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:'#FEF3C7', borderRadius:10, marginBottom:8 }}>
                <span>💳</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#92400E' }}>{r.client} — {r.montant}€</div>
                  <div style={{ fontSize:12, color:'#B45309' }}>Paiement reçu, en attente de démarrage</div>
                </div>
                <button style={{ ...BTN_PRIMARY, padding:'5px 12px', fontSize:12, background:'#F59E0B' }} onClick={() => setQrModal(r.id)}>
                  Démarrer
                </button>
              </div>
            ))}
            {rdvList.filter(r => r.statut === 'en_cours').map(r => (
              <div key={r.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', background:'#DBEAFE', borderRadius:10, marginBottom:8 }}>
                <span>⏳</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'#1D4ED8' }}>{r.client} — {r.prestation}</div>
                  <div style={{ fontSize:12, color:'#2563EB' }}>En cours depuis {r.heure}</div>
                </div>
                <button style={{ ...BTN_PRIMARY, padding:'5px 12px', fontSize:12, background:'#10B981' }} onClick={() => setFinModal(r.id)}>
                  Fin
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={CARD_STYLE}>
          <div style={SECTION_HDR}>RDV du jour</div>
          {todayRdv.length === 0 && <div style={{ fontSize:13, color:'#888' }}>Aucun rendez-vous aujourd'hui.</div>}
          {todayRdv.map((r, idx) => {
            const dotColor = { a_venir:'#9CA3AF', paiement_bloque:'#F59E0B', en_cours:'#3B82F6', termine:'#10B981', annule:'#EF4444' }[r.statut] || '#9CA3AF';
            return (
              <div key={r.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 0', borderBottom: idx < todayRdv.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <span style={{ fontWeight:800, fontSize:15, color:'#1C1C1E', minWidth:42 }}>{r.heure}</span>
                <div style={{ width:10, height:10, borderRadius:'50%', background:dotColor, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{r.client}</div>
                  <div style={{ fontSize:12, color:'#888' }}>{r.prestation} · {r.duree}min · {r.employe}</div>
                </div>
                <div style={{ fontWeight:800, color:C, fontSize:14 }}>{r.montant}€</div>
                <StatutBadge statut={r.statut} />
                {r.statut === 'paiement_bloque' && (
                  <button style={{ ...BTN_PRIMARY, padding:'6px 14px', fontSize:12, background:'#F59E0B' }} onClick={() => setQrModal(r.id)}>
                    ▶ Commencer
                  </button>
                )}
                {r.statut === 'en_cours' && (
                  <button style={{ ...BTN_PRIMARY, padding:'6px 14px', fontSize:12, background:'#10B981' }} onClick={() => setFinModal(r.id)}>
                    ⏹ Fin
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==================== TAB RENDEZ-VOUS ====================
  function TabRendezVous() {
    const [filtre, setFiltre] = useState('tous');
    const [jour, setJour] = useState('aujourd');

    const filtres = [
      { id:'tous', label:'Tous' },
      { id:'a_venir', label:'À venir' },
      { id:'paiement_bloque', label:'Paiement reçu' },
      { id:'en_cours', label:'En cours' },
      { id:'termine', label:'Terminés' },
      { id:'annule', label:'Annulés' },
    ];

    const rdvJour = jour === 'demain' ? rdvList.filter(r => r.demain) : rdvList.filter(r => !r.demain);
    const rdvFiltered = filtre === 'tous' ? rdvJour : rdvJour.filter(r => r.statut === filtre);

    return (
      <div>
        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
          {[{ id:'aujourd', label:"Aujourd'hui" }, { id:'demain', label:'Demain' }].map(d => (
            <button key={d.id} onClick={() => setJour(d.id)} style={{
              padding:'8px 18px', borderRadius:10, border: jour === d.id ? 'none' : '1.5px solid #E8E6E1', cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:13,
              background: jour === d.id ? C : '#fff', color: jour === d.id ? '#fff' : '#888',
            }}>
              {d.label}
            </button>
          ))}
        </div>

        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:20 }}>
          {filtres.map(f => (
            <button key={f.id} onClick={() => setFiltre(f.id)} style={{ padding:'6px 14px', borderRadius:20, border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:13, background: filtre === f.id ? C : C_SOFT, color: filtre === f.id ? '#fff' : '#888', transition:'all .15s' }}>
              {f.label}
            </button>
          ))}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {rdvFiltered.length === 0 && (
            <div style={{ ...CARD_STYLE, textAlign:'center', color:'#888', padding:40 }}>Aucun rendez-vous pour ce filtre.</div>
          )}
          {rdvFiltered.map(r => (
            <div key={r.id} style={{ ...CARD_STYLE, display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
              <div style={{ fontWeight:800, fontSize:18, color:C, minWidth:48 }}>{r.heure}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:15 }}>{r.client}</div>
                <div style={{ fontSize:13, color:'#888', marginTop:2 }}>
                  {r.prestation} · <span style={{ background:C_SOFT, color:C, borderRadius:6, padding:'1px 8px', fontSize:12, fontWeight:700 }}>{r.duree}min</span>
                </div>
                <div style={{ fontSize:12, color:'#aaa', marginTop:3 }}>👤 {r.employe}</div>
              </div>
              <div style={{ fontWeight:900, fontSize:20, color:'#1C1C1E' }}>{r.montant}€</div>
              <StatutBadge statut={r.statut} />
              {r.statut === 'paiement_bloque' && (
                <button style={{ ...BTN_PRIMARY, background:'#F59E0B', fontSize:13 }} onClick={() => setQrModal(r.id)}>
                  💳 Paiement reçu — Démarrer
                </button>
              )}
              {r.statut === 'en_cours' && (
                <button style={{ ...BTN_PRIMARY, background:'#10B981', fontSize:13 }} onClick={() => setFinModal(r.id)}>
                  ⏹ Fin de prestation
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==================== TAB PAIEMENTS ====================
  function TabPaiements() {
    const [filtreTx, setFiltreTx] = useState('tous');

    const caTotal = transactions.filter(t => t.type === 'paiement').reduce((s, t) => s + t.montant, 0);
    const bloque = transactions.filter(t => t.statut === 'bloque').reduce((s, t) => s + t.montant, 0);
    const vire = transactions.filter(t => t.type === 'virement').reduce((s, t) => s + t.montant, 0);
    const txFiltred = filtreTx === 'tous' ? transactions : transactions.filter(t => t.type === filtreTx);

    const statusTxColor = { libere:'#10B981', bloque:'#F59E0B', vire:'#3B82F6' };
    const statusTxLabel = { libere:'Libéré', bloque:'Bloqué', vire:'Viré' };

    const days7 = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    const chartData = [162, 85, 210, 130, 55, 302, 0];
    const maxBar = Math.max(...chartData, 1);

    return (
      <div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginBottom:24 }}>
          <KpiCard label="CA total (mois)" value={`${caTotal}€`} sub="Paiements reçus" accent={C} />
          <KpiCard label="Argent bloqué" value={`${bloque}€`} sub="Sur la plateforme" accent="#F59E0B" />
          <KpiCard label="Disponible pour virement" value={`${caTotal - vire}€`} sub="Solde plateforme" accent="#10B981" />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1.5fr 1fr', gap:16, marginBottom:24 }}>
          <div style={CARD_STYLE}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <div style={{ ...SECTION_HDR, marginBottom:0 }}>Transactions</div>
              <button style={{ ...BTN_PRIMARY, padding:'7px 16px', fontSize:13, background:'#10B981' }} onClick={() => setVirementModal(true)}>
                Demander un virement
              </button>
            </div>
            <div style={{ display:'flex', gap:6, marginBottom:16 }}>
              {[{ id:'tous', l:'Tous' }, { id:'paiement', l:'Paiements' }, { id:'virement', l:'Virements' }].map(f => (
                <button key={f.id} onClick={() => setFiltreTx(f.id)} style={{ padding:'5px 14px', borderRadius:20, border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:12, background: filtreTx === f.id ? C : C_SOFT, color: filtreTx === f.id ? '#fff' : '#888' }}>
                  {f.l}
                </button>
              ))}
            </div>
            {txFiltred.map(t => (
              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:'1px solid #F3F4F6' }}>
                <div style={{ width:36, height:36, borderRadius:10, background: t.type === 'virement' ? '#DBEAFE' : C_SOFT, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>
                  {t.type === 'virement' ? '🏦' : '💳'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.client || t.prestation}</div>
                  <div style={{ fontSize:12, color:'#888' }}>{t.prestation} · {t.date}</div>
                </div>
                <div style={{ fontWeight:800, fontSize:14 }}>{t.montant}€</div>
                <span style={{ background:statusTxColor[t.statut] + '22', color:statusTxColor[t.statut], borderRadius:8, padding:'3px 10px', fontSize:12, fontWeight:700 }}>{statusTxLabel[t.statut]}</span>
              </div>
            ))}
          </div>

          <div style={CARD_STYLE}>
            <div style={SECTION_HDR}>CA 7 derniers jours</div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:8, height:180, paddingBottom:8 }}>
              {chartData.map((val, i) => (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <div style={{ fontSize:10, color:'#888', fontWeight:600 }}>{val ? `${val}€` : ''}</div>
                  <div style={{ width:'100%', height:`${(val / maxBar) * 130}px`, background: val ? C : '#F3F4F6', borderRadius:'4px 4px 0 0', minHeight:4 }} />
                  <div style={{ fontSize:11, color:'#888', fontWeight:600 }}>{days7[i]}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== TAB CLIENTS ====================
  function TabClients() {
    const [search, setSearch] = useState('');
    const [filtreFid, setFiltreFid] = useState('tous');

    const fids = ['tous', 'vip', 'fidele', 'regulier', 'nouveau'];
    const fidLabels = { tous:'Tous', vip:'VIP', fidele:'Fidèle', regulier:'Régulier', nouveau:'Nouveau' };

    const filtered = clients
      .filter(c => filtreFid === 'tous' || c.fidelite === filtreFid)
      .filter(c => !search || c.nom.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

    const avatarColors = ['#E535AB', '#7C3AED', '#0891B2', '#10B981', '#F59E0B', '#EF4444'];

    return (
      <div>
        <div style={{ marginBottom:16 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un client..."
            style={{ width:'100%', padding:'10px 14px', borderRadius:10, border:'1.5px solid #E8E6E1', fontSize:14, fontFamily:'inherit', boxSizing:'border-box' }}
          />
        </div>

        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:20 }}>
          {fids.map(f => (
            <button key={f} onClick={() => setFiltreFid(f)} style={{ padding:'6px 16px', borderRadius:20, border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:600, fontSize:13, background: filtreFid === f ? C : C_SOFT, color: filtreFid === f ? '#fff' : '#888' }}>
              {fidLabels[f]}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign:'center', color:'#888', padding:40 }}>Aucun client trouvé.</div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:14 }}>
          {filtered.map((c, idx) => (
            <div key={c.id} style={{ ...CARD_STYLE, cursor:'pointer' }} onClick={() => setClientModal(c)}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                <div style={{ width:48, height:48, borderRadius:'50%', background:avatarColors[idx % avatarColors.length] + '22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:800, color:avatarColors[idx % avatarColors.length], flexShrink:0 }}>
                  {initials(c.nom)}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:14, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.nom}</div>
                  <span style={{ background:fideliteColor(c.fidelite) + '22', color:fideliteColor(c.fidelite), borderRadius:6, padding:'2px 8px', fontSize:11, fontWeight:700 }}>{fideliteLabel(c.fidelite)}</span>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                <div style={{ background:C_BG, borderRadius:8, padding:'8px 10px' }}>
                  <div style={{ fontSize:11, color:'#888' }}>Visites</div>
                  <div style={{ fontWeight:800, fontSize:16 }}>{c.visites}</div>
                </div>
                <div style={{ background:C_BG, borderRadius:8, padding:'8px 10px' }}>
                  <div style={{ fontSize:11, color:'#888' }}>Dépensé</div>
                  <div style={{ fontWeight:800, fontSize:16, color:C }}>{c.depense}€</div>
                </div>
              </div>
              <div style={{ fontSize:12, color:'#aaa', marginBottom:12 }}>Dernier RDV : {c.dernierRdv}</div>
              <button style={{ width:'100%', padding:'8px 0', borderRadius:10, border:`1.5px solid ${C}`, background:'transparent', color:C, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
                Voir historique
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==================== TAB SERVICES ====================
  function TabServices() {
    const cats = [...new Set(services.map(s => s.categorie))];

    function toggleActif(id) {
      setServices(prev => prev.map(s => s.id === id ? { ...s, actif: !s.actif } : s));
    }
    function deleteService(id) {
      setServices(prev => prev.filter(s => s.id !== id));
    }

    return (
      <div>
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:20 }}>
          <button style={BTN_PRIMARY} onClick={() => setServiceModal('new')}>+ Ajouter un service</button>
        </div>

        {cats.map(cat => (
          <div key={cat} style={{ ...CARD_STYLE, marginBottom:16 }}>
            <div style={SECTION_HDR}>{cat}</div>
            {services.filter(s => s.categorie === cat).map((s, idx, arr) => (
              <div key={s.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: idx < arr.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14, color: s.actif ? '#1C1C1E' : '#aaa' }}>{s.nom}</div>
                </div>
                <span style={{ background:C_SOFT, color:C, borderRadius:8, padding:'3px 10px', fontSize:12, fontWeight:700 }}>{s.duree}min</span>
                <span style={{ fontWeight:800, fontSize:15, minWidth:48, textAlign:'right' }}>{s.prix}€</span>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:12, color: s.actif ? '#10B981' : '#aaa', fontWeight:600, minWidth:44 }}>{s.actif ? 'Actif' : 'Inactif'}</span>
                  <div onClick={() => toggleActif(s.id)} style={{ width:40, height:22, borderRadius:11, background: s.actif ? C : '#E5E7EB', cursor:'pointer', position:'relative', transition:'background .2s' }}>
                    <div style={{ width:18, height:18, borderRadius:'50%', background:'#fff', position:'absolute', top:2, left: s.actif ? 20 : 2, transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,.2)' }} />
                  </div>
                </div>
                <button onClick={() => setServiceModal(s)} style={{ padding:'5px 12px', borderRadius:8, border:`1.5px solid ${C}`, background:'transparent', color:C, fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                  Modifier
                </button>
                <button onClick={() => deleteService(s.id)} style={{ padding:'5px 10px', borderRadius:8, border:'1.5px solid #EF4444', background:'transparent', color:'#EF4444', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // ==================== TAB EQUIPE ====================
  function TabEquipe() {
    function toggleDispo(id) {
      setEquipe(prev => prev.map(e => e.id === id ? { ...e, dispo: !e.dispo } : e));
    }

    return (
      <div>
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:20 }}>
          <button style={BTN_PRIMARY} onClick={() => setEquipeModal(true)}>+ Ajouter un employé</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:14 }}>
          {equipe.map(e => (
            <div key={e.id} style={CARD_STYLE}>
              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:e.couleur + '22', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:800, color:e.couleur, flexShrink:0 }}>
                  {initials(e.nom)}
                </div>
                <div>
                  <div style={{ fontWeight:800, fontSize:15 }}>{e.nom}</div>
                  <div style={{ fontSize:12, color:'#888' }}>{e.poste}</div>
                </div>
              </div>

              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <span style={{ fontSize:13, fontWeight:600, color: e.dispo ? '#10B981' : '#aaa' }}>
                  {e.dispo ? '🟢 Disponible' : '🔴 Absent'}
                </span>
                <div onClick={() => toggleDispo(e.id)} style={{ width:44, height:24, borderRadius:12, background: e.dispo ? '#10B981' : '#E5E7EB', cursor:'pointer', position:'relative', transition:'background .2s' }}>
                  <div style={{ width:20, height:20, borderRadius:'50%', background:'#fff', position:'absolute', top:2, left: e.dispo ? 22 : 2, transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,.2)' }} />
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                <div style={{ background:C_BG, borderRadius:8, padding:'8px 10px' }}>
                  <div style={{ fontSize:11, color:'#888' }}>RDV aujourd'hui</div>
                  <div style={{ fontWeight:800, fontSize:18 }}>{e.rdvAujourd}</div>
                </div>
                <div style={{ background:C_BG, borderRadius:8, padding:'8px 10px' }}>
                  <div style={{ fontSize:11, color:'#888' }}>CA du jour</div>
                  <div style={{ fontWeight:800, fontSize:18, color:C }}>{e.caJour}€</div>
                </div>
              </div>

              <button onClick={() => setTab('rdv')} style={{ width:'100%', padding:'8px 0', borderRadius:10, border:'1.5px solid #E8E6E1', background:'transparent', color:'#888', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
                Voir planning
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==================== TAB PARAMETRES ====================
  function TabParametres() {
    const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    const [horaires, setHoraires] = useState([
      { ouvert:true,  open:'09:00', close:'19:00' },
      { ouvert:true,  open:'09:00', close:'19:00' },
      { ouvert:true,  open:'09:00', close:'19:00' },
      { ouvert:true,  open:'09:00', close:'19:00' },
      { ouvert:true,  open:'09:00', close:'19:00' },
      { ouvert:true,  open:'10:00', close:'17:00' },
      { ouvert:false, open:'10:00', close:'16:00' },
    ]);
    const [conges, setConges] = useState([{ debut:'2026-08-01', fin:'2026-08-15', raison:'Congés annuels' }]);
    const [newConge, setNewConge] = useState({ debut:'', fin:'', raison:'' });
    const [notifs, setNotifs] = useState({ rappelRdv:true, rappelPaiement:true, nouveauRdv:true });
    const [salon, setSalon] = useState({ nom:'Salon Camille', adresse:'12 rue de la Paix, 75001 Paris', telephone:'01 23 45 67 89', email:'contact@saloncamille.fr' });
    const [saved, setSaved] = useState(false);

    function save() {
      setSaved(true);
      showToast('Paramètres sauvegardés !');
      setTimeout(() => setSaved(false), 2000);
    }

    return (
      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
        <div style={CARD_STYLE}>
          <div style={SECTION_HDR}>Horaires du salon</div>
          {joursSemaine.map((jour, i) => (
            <div key={jour} style={{ display:'flex', alignItems:'center', gap:14, padding:'10px 0', borderBottom: i < 6 ? '1px solid #F3F4F6' : 'none', flexWrap:'wrap' }}>
              <div style={{ width:90, fontWeight:600, fontSize:14 }}>{jour}</div>
              <div onClick={() => setHoraires(h => h.map((hr, idx) => idx === i ? { ...hr, ouvert: !hr.ouvert } : hr))} style={{ width:40, height:22, borderRadius:11, background: horaires[i].ouvert ? C : '#E5E7EB', cursor:'pointer', position:'relative', transition:'background .2s' }}>
                <div style={{ width:18, height:18, borderRadius:'50%', background:'#fff', position:'absolute', top:2, left: horaires[i].ouvert ? 20 : 2, transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,.2)' }} />
              </div>
              <span style={{ fontSize:13, color: horaires[i].ouvert ? '#10B981' : '#aaa', fontWeight:600, width:52 }}>
                {horaires[i].ouvert ? 'Ouvert' : 'Fermé'}
              </span>
              {horaires[i].ouvert && (
                <>
                  <input type="time" value={horaires[i].open} onChange={e => setHoraires(h => h.map((hr, idx) => idx === i ? { ...hr, open:e.target.value } : hr))} style={{ padding:'6px 10px', borderRadius:8, border:'1.5px solid #E8E6E1', fontFamily:'inherit', fontSize:13 }} />
                  <span style={{ color:'#888' }}>–</span>
                  <input type="time" value={horaires[i].close} onChange={e => setHoraires(h => h.map((hr, idx) => idx === i ? { ...hr, close:e.target.value } : hr))} style={{ padding:'6px 10px', borderRadius:8, border:'1.5px solid #E8E6E1', fontFamily:'inherit', fontSize:13 }} />
                </>
              )}
            </div>
          ))}
        </div>

        <div style={CARD_STYLE}>
          <div style={SECTION_HDR}>Congés & Fermetures</div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:16, alignItems:'center' }}>
            <input type="date" value={newConge.debut} onChange={e => setNewConge(c => ({ ...c, debut:e.target.value }))} style={{ padding:'8px 10px', borderRadius:8, border:'1.5px solid #E8E6E1', fontFamily:'inherit', fontSize:13 }} />
            <span style={{ color:'#888' }}>→</span>
            <input type="date" value={newConge.fin} onChange={e => setNewConge(c => ({ ...c, fin:e.target.value }))} style={{ padding:'8px 10px', borderRadius:8, border:'1.5px solid #E8E6E1', fontFamily:'inherit', fontSize:13 }} />
            <input value={newConge.raison} onChange={e => setNewConge(c => ({ ...c, raison:e.target.value }))} placeholder="Raison (ex: Congés)" style={{ flex:1, minWidth:160, padding:'8px 12px', borderRadius:8, border:'1.5px solid #E8E6E1', fontFamily:'inherit', fontSize:13 }} />
            <button style={{ ...BTN_PRIMARY, padding:'8px 16px' }} onClick={() => { if (newConge.debut && newConge.fin) { setConges(c => [...c, newConge]); setNewConge({ debut:'', fin:'', raison:'' }); } }}>Ajouter</button>
          </div>
          {conges.map((c, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', background:C_BG, borderRadius:10, marginBottom:6 }}>
              <span style={{ fontSize:16 }}>🏖️</span>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:13 }}>{c.raison || 'Fermeture'}</div>
                <div style={{ fontSize:12, color:'#888' }}>{c.debut} → {c.fin}</div>
              </div>
              <button onClick={() => setConges(g => g.filter((_, idx) => idx !== i))} style={{ padding:'4px 10px', borderRadius:8, border:'1.5px solid #EF4444', background:'transparent', color:'#EF4444', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>✕</button>
            </div>
          ))}
        </div>

        <div style={CARD_STYLE}>
          <div style={SECTION_HDR}>Notifications</div>
          {[
            { key:'rappelRdv', label:'Rappel RDV (24h avant)', desc:'Email automatique au client' },
            { key:'rappelPaiement', label:'Rappel paiement', desc:'Notification si paiement en attente' },
            { key:'nouveauRdv', label:'Nouveau rendez-vous', desc:"Notification lors d'une prise de RDV" },
          ].map((n, idx, arr) => (
            <div key={n.key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom: idx < arr.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
              <div>
                <div style={{ fontWeight:600, fontSize:14 }}>{n.label}</div>
                <div style={{ fontSize:12, color:'#888' }}>{n.desc}</div>
              </div>
              <div onClick={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key] }))} style={{ width:44, height:24, borderRadius:12, background: notifs[n.key] ? C : '#E5E7EB', cursor:'pointer', position:'relative', transition:'background .2s' }}>
                <div style={{ width:20, height:20, borderRadius:'50%', background:'#fff', position:'absolute', top:2, left: notifs[n.key] ? 22 : 2, transition:'left .2s', boxShadow:'0 1px 3px rgba(0,0,0,.2)' }} />
              </div>
            </div>
          ))}
        </div>

        <div style={CARD_STYLE}>
          <div style={SECTION_HDR}>Informations du salon</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:20 }}>
            {[
              { key:'nom', label:'Nom du salon', placeholder:'Salon de coiffure' },
              { key:'adresse', label:'Adresse', placeholder:'12 rue de la Paix...' },
              { key:'telephone', label:'Téléphone', placeholder:'01 23 45 67 89' },
              { key:'email', label:'Email', placeholder:'contact@salon.fr' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize:13, fontWeight:600, display:'block', marginBottom:4 }}>{f.label}</label>
                <input value={salon[f.key]} onChange={e => setSalon(s => ({ ...s, [f.key]:e.target.value }))} placeholder={f.placeholder} style={{ width:'100%', padding:'10px 12px', borderRadius:10, border:'1.5px solid #E8E6E1', fontSize:14, fontFamily:'inherit', boxSizing:'border-box' }} />
              </div>
            ))}
          </div>
          <button style={{ ...BTN_PRIMARY, padding:'12px 32px', fontSize:15, background: saved ? '#10B981' : C }} onClick={save}>
            {saved ? '✓ Sauvegardé' : 'Enregistrer les modifications'}
          </button>
        </div>
      </div>
    );
  }

  // ==================== TAB RAPPORTS ====================
  function TabRapports() {
    const [periode, setPeriode] = useState('mois');

    const periods = [{ id:'mois', l:'Ce mois' }, { id:'3mois', l:'3 mois' }, { id:'6mois', l:'6 mois' }, { id:'annee', l:'Année' }];

    const kpis = {
      mois:   { ca:2340, rdv:38, nouveaux:5,  annul:3  },
      '3mois':{ ca:6820, rdv:112, nouveaux:14, annul:8  },
      '6mois':{ ca:13450, rdv:224, nouveaux:28, annul:15 },
      annee:  { ca:28900, rdv:440, nouveaux:52, annul:30 },
    };

    const weeklyData = {
      mois:   [410, 520, 390, 620, 400],
      '3mois':  [1200, 1500, 900, 1800, 1420],
      '6mois':  [2100, 2400, 1900, 2600, 2450],
      annee:    [5000, 6200, 4800, 7100, 5800],
    };

    const cats = [
      { nom:'Coupes',      pct:35, montant:819,  color:'#E535AB' },
      { nom:'Colorations', pct:42, montant:982,  color:'#7C3AED' },
      { nom:'Soins',       pct:15, montant:351,  color:'#0891B2' },
      { nom:'Beauté',      pct:8,  montant:188,  color:'#10B981' },
    ];

    const topServices = [
      { nom:'Lissage brésilien',  visites:4,  ca:840 },
      { nom:'Balayage',           visites:7,  ca:840 },
      { nom:'Coloration racines', visites:8,  ca:680 },
      { nom:'Coupe + Brushing',   visites:11, ca:605 },
      { nom:'Coupe femme',        visites:10, ca:420 },
    ];

    const wd = weeklyData[periode] || weeklyData['mois'];
    const maxW = Math.max(...wd, 1);
    const k = kpis[periode] || kpis['mois'];

    return (
      <div>
        <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap', alignItems:'center' }}>
          {periods.map(p => (
            <button key={p.id} onClick={() => setPeriode(p.id)} style={{ padding:'9px 20px', borderRadius:10, border: periode === p.id ? 'none' : '1.5px solid #E8E6E1', cursor:'pointer', fontFamily:'inherit', fontWeight:700, fontSize:13, background: periode === p.id ? C : '#fff', color: periode === p.id ? '#fff' : '#888' }}>
              {p.l}
            </button>
          ))}
          <div style={{ flex:1 }} />
          <button style={{ ...BTN_PRIMARY, background:'#3B82F6', padding:'9px 18px', fontSize:13 }} onClick={() => showToast('Export CSV en cours...')}>Exporter CSV</button>
          <button style={{ ...BTN_PRIMARY, background:'#6B7280', padding:'9px 18px', fontSize:13 }} onClick={() => window.print()}>Exporter PDF</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:24 }}>
          <KpiCard label="CA total" value={`${k.ca.toLocaleString('fr-FR')}€`} sub="Période sélectionnée" accent={C} />
          <KpiCard label="Rendez-vous" value={k.rdv} sub="Prestations réalisées" />
          <KpiCard label="Nouveaux clients" value={k.nouveaux} sub="Premières visites" accent="#10B981" />
          <KpiCard label="Taux annulation" value={`${Math.round(k.annul / k.rdv * 100)}%`} sub={`${k.annul} annulations`} accent="#F59E0B" />
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1.2fr 1fr', gap:16, marginBottom:20 }}>
          <div style={CARD_STYLE}>
            <div style={SECTION_HDR}>CA par semaine</div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:12, height:170, paddingBottom:8 }}>
              {wd.map((val, i) => (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                  <div style={{ fontSize:11, color:'#888', fontWeight:600 }}>{val}€</div>
                  <div style={{ width:'100%', height:`${(val / maxW) * 120}px`, background:C, borderRadius:'6px 6px 0 0', opacity:0.75 + (i * 0.05), minHeight:4 }} />
                  <div style={{ fontSize:12, color:'#888', fontWeight:600 }}>S{i + 1}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={CARD_STYLE}>
            <div style={SECTION_HDR}>CA par catégorie</div>
            {cats.map(c => (
              <div key={c.nom} style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>{c.nom}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:c.color }}>{c.pct}% — {c.montant}€</span>
                </div>
                <div style={{ height:10, background:'#F3F4F6', borderRadius:6, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${c.pct}%`, background:c.color, borderRadius:6, transition:'width .4s' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={CARD_STYLE}>
          <div style={SECTION_HDR}>Top services par revenus</div>
          <div style={{ display:'grid', gridTemplateColumns:'24px 1fr 80px 100px 1fr', gap:12, padding:'8px 0', borderBottom:'2px solid #F3F4F6', marginBottom:8 }}>
            {['#', 'Service', 'Visites', 'CA total', ''].map((h, i) => (
              <div key={i} style={{ fontSize:12, fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:'0.05em' }}>{h}</div>
            ))}
          </div>
          {topServices.map((s, i) => (
            <div key={s.nom} style={{ display:'grid', gridTemplateColumns:'24px 1fr 80px 100px 1fr', gap:12, padding:'10px 0', borderBottom:'1px solid #F3F4F6', alignItems:'center' }}>
              <div style={{ fontWeight:800, fontSize:15, color:C }}>{i + 1}</div>
              <div style={{ fontWeight:700, fontSize:14 }}>{s.nom}</div>
              <div style={{ fontSize:14 }}>{s.visites}</div>
              <div style={{ fontWeight:800, fontSize:15 }}>{s.ca}€</div>
              <div style={{ height:8, background:'#F3F4F6', borderRadius:4, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${(s.ca / topServices[0].ca) * 100}%`, background:C, borderRadius:4 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const TABS = [
    { id:'accueil',    label:'Accueil',    emoji:'🏠' },
    { id:'rdv',        label:'Rendez-vous', emoji:'📅', badge: rdvList.filter(r => r.statut === 'paiement_bloque').length },
    { id:'paiements',  label:'Paiements',   emoji:'💳' },
    { id:'clients',    label:'Clients',     emoji:'👥' },
    { id:'services',   label:'Services',    emoji:'✂️' },
    { id:'equipe',     label:'Équipe',      emoji:'👤' },
    { id:'parametres', label:'Paramètres',  emoji:'⚙️' },
    { id:'rapports',   label:'Rapports',    emoji:'📊' },
  ];

  return (
    <div style={{ fontFamily:'inherit', minHeight:'100vh', background:C_BG, padding:24 }}>
      {toast && (
        <div style={{
          position:'fixed', bottom:28, right:28, zIndex:2000,
          background: toast.type === 'error' ? '#EF4444' : '#10B981',
          color:'#fff', borderRadius:12, padding:'12px 20px', fontWeight:700, fontSize:14,
          boxShadow:'0 8px 32px rgba(0,0,0,.18)', display:'flex', alignItems:'center', gap:10,
        }}>
          {toast.type === 'error' ? '⚠️' : '✓'} {toast.msg}
        </div>
      )}

      <div style={{ display:'flex', gap:2, background:'#fff', borderRadius:14, padding:6, marginBottom:24, overflowX:'auto', border:'1px solid #E8E6E1', boxShadow:'0 1px 4px rgba(0,0,0,.05)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            position:'relative', padding:'9px 16px', borderRadius:10, border:'none', cursor:'pointer',
            whiteSpace:'nowrap', fontSize:'0.8125rem', fontWeight: tab === t.id ? 700 : 500, fontFamily:'inherit',
            background: tab === t.id ? C : 'transparent',
            color: tab === t.id ? '#fff' : '#888',
            transition:'all .15s',
          }}>
            {t.emoji} {t.label}
            {t.badge > 0 && (
              <span style={{ position:'absolute', top:4, right:4, width:16, height:16, borderRadius:'50%', background:'#F59E0B', color:'#fff', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'accueil'    && <TabAccueil />}
      {tab === 'rdv'        && <TabRendezVous />}
      {tab === 'paiements'  && <TabPaiements />}
      {tab === 'clients'    && <TabClients />}
      {tab === 'services'   && <TabServices />}
      {tab === 'equipe'     && <TabEquipe />}
      {tab === 'parametres' && <TabParametres />}
      {tab === 'rapports'   && <TabRapports />}

      {qrModal      && <QRModal />}
      {finModal     && <FinModal />}
      {factureModal && <FactureModal />}
      {clientModal  && <ClientDetailModal />}
      {serviceModal && <ServiceFormModal />}
      {equipeModal  && <EquipeFormModal />}
      {virementModal && <VirementModal />}
    </div>
  );
}
