import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const C = '#0080FF'; // accent vacances/hôtel
const C_BG = '#E8F4FF';
const C_SOFT = '#D0E8FF';

/* ── Demo data ──────────────────────────────────────────── */
const RESERVATIONS = [
  { id:1, client:'Famille Martin',   chambre:'101', type:'Double',   arrivee:'2024-03-25', depart:'2024-03-28', nuits:3, montant:420, statut:'arrivee_aujourd' },
  { id:2, client:'M. Dupont',        chambre:'205', type:'Suite',    arrivee:'2024-03-25', depart:'2024-03-27', nuits:2, montant:380, statut:'arrivee_aujourd' },
  { id:3, client:'Mme Garcia',       chambre:'108', type:'Simple',   arrivee:'2024-03-25', depart:'2024-03-26', nuits:1, montant:110, statut:'arrivee_aujourd' },
  { id:4, client:'Groupe Leclerc',   chambre:'302', type:'Triple',   arrivee:'2024-03-26', depart:'2024-03-30', nuits:4, montant:720, statut:'a_venir'         },
  { id:5, client:'Mme Laurent',      chambre:'104', type:'Double',   arrivee:'2024-03-23', depart:'2024-03-25', nuits:2, montant:280, statut:'depart_aujourd'  },
  { id:6, client:'M. et Mme Chen',   chambre:'210', type:'Suite',    arrivee:'2024-03-22', depart:'2024-03-25', nuits:3, montant:570, statut:'depart_aujourd'  },
];

const CHAMBRES = [
  { num:'101', type:'Double',   etage:1, vue:'Jardin',    tarif:140, statut:'occupee',   propre:true,  client:'Famille Martin (→28 mars)' },
  { num:'102', type:'Double',   etage:1, vue:'Rue',       tarif:120, statut:'libre',     propre:true,  client:'' },
  { num:'103', type:'Simple',   etage:1, vue:'Rue',       tarif:90,  statut:'nettoyage', propre:false, client:'' },
  { num:'104', type:'Double',   etage:1, vue:'Jardin',    tarif:140, statut:'depart',    propre:false, client:'Mme Laurent (départ ce matin)' },
  { num:'105', type:'Familiale',etage:1, vue:'Jardin',    tarif:190, statut:'libre',     propre:true,  client:'' },
  { num:'201', type:'Double',   etage:2, vue:'Mer',       tarif:180, statut:'occupee',   propre:true,  client:'Groupe conf. (→27 mars)' },
  { num:'202', type:'Simple',   etage:2, vue:'Rue',       tarif:90,  statut:'libre',     propre:true,  client:'' },
  { num:'203', type:'Double',   etage:2, vue:'Mer',       tarif:180, statut:'maintenance',propre:false,client:'' },
  { num:'205', type:'Suite',    etage:2, vue:'Mer',       tarif:240, statut:'occupee',   propre:true,  client:'M. Dupont (→27 mars)' },
  { num:'210', type:'Suite',    etage:2, vue:'Panoramique',tarif:280,statut:'depart',    propre:false, client:'M. et Mme Chen (départ)' },
  { num:'301', type:'Triple',   etage:3, vue:'Mer',       tarif:220, statut:'libre',     propre:true,  client:'' },
  { num:'302', type:'Triple',   etage:3, vue:'Mer',       tarif:220, statut:'libre',     propre:true,  client:'' },
];

const EQUIPE = [
  { id:1, nom:'Isabelle Garnier', poste:'Directrice',      present:true,  shift:'Matin' },
  { id:2, nom:'Thomas Lefevre',   poste:'Réceptionniste',  present:true,  shift:'Matin' },
  { id:3, nom:'Clara Martin',     poste:'Réceptionniste',  present:false, shift:'Soir'  },
  { id:4, nom:'Marie Petit',      poste:'Gouvernante',     present:true,  shift:'Matin' },
  { id:5, nom:'Ahmed Benali',     poste:'Valet',           present:true,  shift:'Journée'},
  { id:6, nom:'Paul Rousseau',    poste:'Restauration',    present:true,  shift:'Matin' },
];

const TABS = ['Accueil', 'Réservations', 'Chambres', 'Check-in / Check-out', 'Équipe', 'Statistiques'];

function Badge({ label, color, bg }) {
  return <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:bg, color, whiteSpace:'nowrap' }}>{label}</span>;
}
function KpiCard({ icon, label, value, sub, color }) {
  return (
    <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:14, padding:'18px 20px', display:'flex', flexDirection:'column', gap:6 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:20 }}>{icon}</span>
        <span style={{ fontSize:12, color:'#888', fontWeight:500 }}>{label}</span>
      </div>
      <div style={{ fontSize:26, fontWeight:800, color:color||'#1C1C1E', letterSpacing:'-0.04em' }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:'#aaa' }}>{sub}</div>}
    </div>
  );
}

const statutChambre = {
  occupee:    { label:'Occupée',     color:'#FF3B30', bg:'#FFF0F0' },
  libre:      { label:'Libre',       color:'#34C759', bg:'#E8FFF0' },
  nettoyage:  { label:'Nettoyage',   color:'#FF9500', bg:'#FFF7E8' },
  maintenance:{ label:'Maintenance', color:'#888',    bg:'#F2F2F7' },
  depart:     { label:'Départ',      color:C,         bg:C_BG      },
};

export default function DashboardHotel() {
  const { user } = useAuth();
  const [tab, setTab] = useState('Accueil');
  const [chambres, setChambres] = useState(CHAMBRES);

  const arrivees = RESERVATIONS.filter(r => r.statut === 'arrivee_aujourd').length;
  const departs  = RESERVATIONS.filter(r => r.statut === 'depart_aujourd').length;
  const occupees = chambres.filter(c => c.statut === 'occupee').length;
  const libres   = chambres.filter(c => c.statut === 'libre' && c.propre).length;

  function marquerPropre(num) {
    setChambres(ch => ch.map(c => c.num === num ? { ...c, propre:true, statut: c.statut === 'depart' ? 'libre' : (c.statut === 'nettoyage' ? 'libre' : c.statut) } : c));
  }

  return (
    <div style={{ padding:'24px 28px', maxWidth:1280, fontFamily:"'Inter',system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <span style={{ fontSize:22 }}>🏨</span>
            <h1 style={{ fontSize:22, fontWeight:800, color:'#1C1C1E', letterSpacing:'-0.04em', margin:0 }}>Espace Hôtel & Vacances</h1>
            <span style={{ background:C_BG, color:C, border:`1px solid ${C}30`, borderRadius:99, fontSize:11, fontWeight:700, padding:'3px 10px' }}>PRO</span>
          </div>
          <p style={{ color:'#888', fontSize:13, margin:0 }}>Bonjour {user?.nom?.split(' ')[0]} — {new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })}</p>
        </div>
        <button style={{ background:C, color:'#fff', border:'none', borderRadius:10, padding:'10px 18px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
          + Nouvelle réservation
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:24, borderBottom:'1px solid #E8E8EC', flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'9px 16px', background:'none', border:'none', borderBottom: tab===t ? `2px solid ${C}` : '2px solid transparent',
            color: tab===t ? C : '#888', fontWeight: tab===t ? 700 : 500, fontSize:13, cursor:'pointer', marginBottom:-1,
          }}>{t}</button>
        ))}
      </div>

      {/* ── Accueil ── */}
      {tab === 'Accueil' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:14, marginBottom:28 }}>
            <KpiCard icon="🛬" label="Arrivées aujourd'hui" value={String(arrivees)} sub="Check-in à effectuer" color={C} />
            <KpiCard icon="🛫" label="Départs aujourd'hui" value={String(departs)} sub="Check-out à effectuer" color="#FF9500" />
            <KpiCard icon="🏠" label="Taux d'occupation" value={`${Math.round(occupees/chambres.length*100)}%`} sub={`${occupees}/${chambres.length} chambres`} color="#5B5BD6" />
            <KpiCard icon="🟢" label="Disponibles" value={String(libres)} sub="Propres et libres" color="#34C759" />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, alignItems:'start' }}>
            {/* Arrivées */}
            <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:14, overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid #F2F2F7', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:16 }}>🛬</span>
                <span style={{ fontWeight:700, fontSize:14 }}>Arrivées du jour</span>
                <span style={{ marginLeft:'auto', background:C_BG, color:C, borderRadius:99, fontSize:11, fontWeight:700, padding:'2px 9px' }}>{arrivees}</span>
              </div>
              {RESERVATIONS.filter(r => r.statut === 'arrivee_aujourd').map(r => (
                <div key={r.id} style={{ padding:'12px 18px', borderBottom:'1px solid #F9F9FB', display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#1C1C1E' }}>{r.client}</div>
                    <div style={{ fontSize:11, color:'#888' }}>Ch. {r.chambre} · {r.type} · {r.nuits} nuit{r.nuits>1?'s':''}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>{r.montant} €</div>
                    <button style={{ padding:'4px 10px', background:C, color:'#fff', border:'none', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer' }}>Check-in</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Départs */}
            <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:14, overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid #F2F2F7', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:16 }}>🛫</span>
                <span style={{ fontWeight:700, fontSize:14 }}>Départs du jour</span>
                <span style={{ marginLeft:'auto', background:'#FFF7E8', color:'#FF9500', borderRadius:99, fontSize:11, fontWeight:700, padding:'2px 9px' }}>{departs}</span>
              </div>
              {RESERVATIONS.filter(r => r.statut === 'depart_aujourd').map(r => (
                <div key={r.id} style={{ padding:'12px 18px', borderBottom:'1px solid #F9F9FB', display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#1C1C1E' }}>{r.client}</div>
                    <div style={{ fontSize:11, color:'#888' }}>Ch. {r.chambre} · {r.type} · {r.nuits} nuit{r.nuits>1?'s':''}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>{r.montant} €</div>
                    <button style={{ padding:'4px 10px', background:'#FF9500', color:'#fff', border:'none', borderRadius:6, fontSize:11, fontWeight:700, cursor:'pointer' }}>Check-out</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vue rapide chambres */}
          <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:14, overflow:'hidden', marginTop:18 }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid #F2F2F7' }}>
              <span style={{ fontWeight:700, fontSize:14 }}>Vue rapide des chambres</span>
            </div>
            <div style={{ padding:18, display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(90px,1fr))', gap:8 }}>
              {chambres.map(c => {
                const s = statutChambre[c.statut] || { label:c.statut, color:'#888', bg:'#F2F2F7' };
                return (
                  <div key={c.num} title={c.client || s.label} style={{ background:s.bg, border:`1.5px solid ${s.color}40`, borderRadius:10, padding:'10px 6px', textAlign:'center', cursor:'pointer' }}>
                    <div style={{ fontSize:14, fontWeight:800, color:s.color }}>{c.num}</div>
                    <div style={{ fontSize:10, color:'#888', marginTop:2 }}>{c.type}</div>
                    <div style={{ fontSize:9, color:s.color, fontWeight:600, marginTop:3 }}>{s.label}</div>
                    {!c.propre && <div style={{ fontSize:8, color:'#FF9500', marginTop:2 }}>🧹</div>}
                  </div>
                );
              })}
            </div>
            <div style={{ padding:'8px 18px 14px', display:'flex', gap:16, flexWrap:'wrap' }}>
              {Object.entries(statutChambre).map(([k, v]) => (
                <div key={k} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#888' }}>
                  <span style={{ width:8, height:8, borderRadius:2, background:v.color, display:'inline-block' }} />
                  {v.label} ({chambres.filter(c=>c.statut===k).length})
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Réservations ── */}
      {tab === 'Réservations' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <h2 style={{ fontSize:16, fontWeight:700, margin:0 }}>Toutes les réservations</h2>
            <div style={{ display:'flex', gap:8 }}>
              <select style={{ padding:'7px 12px', border:'1px solid #E8E8EC', borderRadius:8, fontSize:12, background:'#fff' }}>
                <option>Aujourd'hui</option><option>Cette semaine</option><option>Ce mois</option>
              </select>
              <button style={{ background:C, color:'#fff', border:'none', borderRadius:8, padding:'8px 14px', fontWeight:700, fontSize:12, cursor:'pointer' }}>+ Ajouter</button>
            </div>
          </div>
          <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:14, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 70px 80px 100px 100px 100px 100px', padding:'10px 18px', borderBottom:'1px solid #F2F2F7', fontSize:11, fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:0.8 }}>
              <span>Client</span><span>Ch.</span><span>Type</span><span>Arrivée</span><span>Départ</span><span>Montant</span><span>Statut</span>
            </div>
            {RESERVATIONS.map((r, i) => {
              const sc = {
                arrivee_aujourd: { l:'Arrivée auj.', c:C,         bg:C_BG      },
                depart_aujourd:  { l:'Départ auj.',  c:'#FF9500', bg:'#FFF7E8' },
                a_venir:         { l:'À venir',      c:'#5B5BD6', bg:'#EEF2FF' },
                en_cours:        { l:'En cours',     c:'#34C759', bg:'#E8FFF0' },
              }[r.statut] || { l:r.statut, c:'#888', bg:'#F2F2F7' };
              return (
                <div key={r.id} style={{ display:'grid', gridTemplateColumns:'2fr 70px 80px 100px 100px 100px 100px', padding:'12px 18px', borderBottom:'1px solid #F9F9FB', alignItems:'center', background:i%2===0?'#fff':'#FAFAFA' }}>
                  <span style={{ fontSize:13, fontWeight:600, color:'#1C1C1E' }}>{r.client}</span>
                  <span style={{ fontSize:13, fontWeight:700, color:C }}>{r.chambre}</span>
                  <span style={{ fontSize:12, color:'#555' }}>{r.type}</span>
                  <span style={{ fontSize:12 }}>{new Date(r.arrivee).toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })}</span>
                  <span style={{ fontSize:12 }}>{new Date(r.depart).toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })}</span>
                  <span style={{ fontSize:13, fontWeight:700 }}>{r.montant} €</span>
                  <Badge label={sc.l} color={sc.c} bg={sc.bg} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Chambres ── */}
      {tab === 'Chambres' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <h2 style={{ fontSize:16, fontWeight:700, margin:0 }}>Gestion des chambres</h2>
            <div style={{ display:'flex', gap:10 }}>
              {Object.entries(statutChambre).map(([k,v]) => (
                <div key={k} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#555' }}>
                  <span style={{ width:8, height:8, borderRadius:2, background:v.color, display:'inline-block' }} />
                  {v.label}
                </div>
              ))}
            </div>
          </div>

          {[1,2,3].map(etage => (
            <div key={etage} style={{ marginBottom:24 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:1.5, marginBottom:12 }}>Étage {etage}</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:12 }}>
                {chambres.filter(c => c.etage === etage).map(c => {
                  const s = statutChambre[c.statut] || { label:c.statut, color:'#888', bg:'#F2F2F7' };
                  return (
                    <div key={c.num} style={{ background:'#fff', border:`1.5px solid ${s.color}40`, borderRadius:12, padding:'16px 18px' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                        <div style={{ fontSize:20, fontWeight:800, color:s.color }}>#{c.num}</div>
                        <Badge label={s.label} color={s.color} bg={s.bg} />
                      </div>
                      <div style={{ fontSize:12, color:'#555', marginBottom:4 }}>{c.type} · Vue {c.vue}</div>
                      <div style={{ fontSize:13, fontWeight:700, color:'#1C1C1E', marginBottom:8 }}>{c.tarif} € / nuit</div>
                      {c.client && <div style={{ fontSize:11, color:'#888', marginBottom:8, background:'#F9F9FB', borderRadius:6, padding:'5px 8px' }}>{c.client}</div>}
                      {!c.propre && (
                        <button onClick={() => marquerPropre(c.num)} style={{ width:'100%', padding:'7px', background:'#FFF7E8', border:'1px solid #FF9500', borderRadius:8, color:'#FF9500', fontSize:12, fontWeight:700, cursor:'pointer' }}>
                          🧹 Marquer propre
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Check-in / Check-out ── */}
      {tab === 'Check-in / Check-out' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24 }}>
            {/* Check-in */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <span style={{ fontSize:18 }}>🛬</span>
                <h2 style={{ fontSize:15, fontWeight:700, margin:0, color:'#1C1C1E' }}>Check-in ({arrivees})</h2>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {RESERVATIONS.filter(r => r.statut === 'arrivee_aujourd').map(r => (
                  <div key={r.id} style={{ background:'#fff', border:`1.5px solid ${C}30`, borderRadius:14, padding:'16px 18px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:'#1C1C1E' }}>{r.client}</div>
                        <div style={{ fontSize:12, color:'#888', marginTop:3 }}>Chambre {r.chambre} — {r.type}</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:14, fontWeight:800, color:C }}>{r.montant} €</div>
                        <div style={{ fontSize:11, color:'#888' }}>{r.nuits} nuit{r.nuits>1?'s':''}</div>
                      </div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12, fontSize:11, color:'#888' }}>
                      <div><strong>Arrivée :</strong> {new Date(r.arrivee).toLocaleDateString('fr-FR')}</div>
                      <div><strong>Départ :</strong> {new Date(r.depart).toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button style={{ flex:1, padding:'9px', background:C, color:'#fff', border:'none', borderRadius:9, fontWeight:700, fontSize:12, cursor:'pointer' }}>
                        ✓ Effectuer le check-in
                      </button>
                      <button style={{ padding:'9px 14px', border:'1px solid #E8E8EC', borderRadius:9, background:'none', cursor:'pointer', fontSize:12 }}>
                        Détails
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Check-out */}
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
                <span style={{ fontSize:18 }}>🛫</span>
                <h2 style={{ fontSize:15, fontWeight:700, margin:0, color:'#1C1C1E' }}>Check-out ({departs})</h2>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {RESERVATIONS.filter(r => r.statut === 'depart_aujourd').map(r => (
                  <div key={r.id} style={{ background:'#fff', border:'1.5px solid #FF950030', borderRadius:14, padding:'16px 18px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:'#1C1C1E' }}>{r.client}</div>
                        <div style={{ fontSize:12, color:'#888', marginTop:3 }}>Chambre {r.chambre} — {r.type}</div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:14, fontWeight:800, color:'#FF9500' }}>{r.montant} €</div>
                        <div style={{ fontSize:11, color:'#888' }}>{r.nuits} nuit{r.nuits>1?'s':''}</div>
                      </div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12, fontSize:11, color:'#888' }}>
                      <div><strong>Arrivée :</strong> {new Date(r.arrivee).toLocaleDateString('fr-FR')}</div>
                      <div><strong>Départ :</strong> {new Date(r.depart).toLocaleDateString('fr-FR')}</div>
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <button style={{ flex:1, padding:'9px', background:'#FF9500', color:'#fff', border:'none', borderRadius:9, fontWeight:700, fontSize:12, cursor:'pointer' }}>
                        ✓ Effectuer le check-out
                      </button>
                      <button style={{ padding:'9px 14px', border:'1px solid #E8E8EC', borderRadius:9, background:'none', cursor:'pointer', fontSize:12 }}>
                        Facture
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Équipe ── */}
      {tab === 'Équipe' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <h2 style={{ fontSize:16, fontWeight:700, margin:0 }}>Mon équipe</h2>
            <button style={{ background:C, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontWeight:700, fontSize:12, cursor:'pointer' }}>
              + Ajouter un employé
            </button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:16 }}>
            {EQUIPE.map(e => (
              <div key={e.id} style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:14, padding:'20px 22px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
                  <div style={{ width:46, height:46, borderRadius:'50%', background:C_BG, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:C, fontWeight:800 }}>
                    {e.nom.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#1C1C1E' }}>{e.nom}</div>
                    <div style={{ fontSize:12, color:'#888' }}>{e.poste}</div>
                  </div>
                  <span style={{ marginLeft:'auto', width:8, height:8, borderRadius:'50%', background: e.present ? '#34C759' : '#FF3B30', display:'inline-block' }} />
                </div>
                <div style={{ background:'#F9F9FB', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#555', marginBottom:12 }}>
                  <strong>Shift :</strong> {e.shift}
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button style={{ flex:1, padding:'7px', border:'1px solid #E8E8EC', borderRadius:8, background:'none', cursor:'pointer', fontSize:12, fontWeight:600 }}>Planning</button>
                  <button style={{ flex:1, padding:'7px', border:'1px solid #E8E8EC', borderRadius:8, background:'none', cursor:'pointer', fontSize:12, fontWeight:600 }}>Fiche</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Statistiques ── */}
      {tab === 'Statistiques' && (
        <div>
          <h2 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Statistiques de l'établissement</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:14, marginBottom:28 }}>
            <KpiCard icon="💰" label="CA mensuel" value="62 400 €" sub="+15% vs mois dernier" color={C} />
            <KpiCard icon="🏠" label="Taux occupation" value="78 %" sub="Moy. mensuelle" color="#5B5BD6" />
            <KpiCard icon="🌙" label="Nuitées vendues" value="428" sub="Ce mois-ci" />
            <KpiCard icon="💵" label="RevPAR" value="145 €" sub="Revenu par chambre dispo" color="#34C759" />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
            <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:14, padding:'20px 24px' }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Taux d'occupation mensuel (%)</div>
              <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:120 }}>
                {[65,72,58,81,78,84,91,88,75,79,82,70].map((v, i) => (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ width:'100%', borderRadius:'4px 4px 0 0', height:`${v}%`, minHeight:4, background:`linear-gradient(180deg,${C}60,${C}20)`, border:`1px solid ${C}30` }} />
                    <span style={{ fontSize:8, color:'#bbb' }}>{['J','F','M','A','M','J','J','A','S','O','N','D'][i]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:14, padding:'20px 24px' }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Réservations par canal</div>
              {[
                { canal:'Direct / Téléphone', pct:35, color:'#34C759' },
                { canal:'Booking.com',         pct:28, color:'#003580' },
                { canal:'Airbnb',              pct:22, color:'#FF5A5F' },
                { canal:'Site web',            pct:15, color:C },
              ].map((p, i) => (
                <div key={i} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:12 }}>
                    <span style={{ fontWeight:600 }}>{p.canal}</span>
                    <span style={{ color:p.color, fontWeight:700 }}>{p.pct}%</span>
                  </div>
                  <div style={{ height:6, background:'#F2F2F7', borderRadius:3 }}>
                    <div style={{ width:`${p.pct}%`, height:'100%', background:p.color, borderRadius:3 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
