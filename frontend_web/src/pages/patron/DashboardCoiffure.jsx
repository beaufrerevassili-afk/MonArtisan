import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const C = '#E535AB'; // accent coiffure
const C_BG = '#FFF0F8';
const C_SOFT = '#FCE7F3';

/* ── Demo data ──────────────────────────────────────────── */
const RDV_TODAY = [
  { id: 1, heure: '09:00', client: 'Marie Lefebvre',   prestation: 'Coupe + Brushing',      duree: 60,  montant: 55,  employe: 'Camille M.', statut: 'confirme' },
  { id: 2, heure: '10:15', client: 'Sophie Bernard',   prestation: 'Coloration racines',     duree: 90,  montant: 85,  employe: 'Camille M.', statut: 'confirme' },
  { id: 3, heure: '11:30', client: 'Laura Dupont',     prestation: 'Balayage + Soin',        duree: 120, montant: 130, employe: 'Camille M.', statut: 'confirme' },
  { id: 4, heure: '14:00', client: 'Julie Martin',     prestation: 'Coupe femme',            duree: 45,  montant: 42,  employe: 'Emma L.',    statut: 'attente'  },
  { id: 5, heure: '15:00', client: 'Céline Rousseau',  prestation: 'Épilation sourcils',     duree: 20,  montant: 15,  employe: 'Emma L.',    statut: 'confirme' },
  { id: 6, heure: '16:00', client: 'Nina Petit',       prestation: 'Lissage brésilien',      duree: 180, montant: 210, employe: 'Camille M.', statut: 'confirme' },
];

const SERVICES = [
  { id: 1, nom: 'Coupe femme',          duree: 45,  prix: 42,  categorie: 'Coupes'    },
  { id: 2, nom: 'Coupe homme',          duree: 30,  prix: 28,  categorie: 'Coupes'    },
  { id: 3, nom: 'Coupe + Brushing',     duree: 60,  prix: 55,  categorie: 'Coupes'    },
  { id: 4, nom: 'Coloration racines',   duree: 90,  prix: 85,  categorie: 'Colorations'},
  { id: 5, nom: 'Balayage',             duree: 120, prix: 120, categorie: 'Colorations'},
  { id: 6, nom: 'Mèches',              duree: 90,  prix: 95,  categorie: 'Colorations'},
  { id: 7, nom: 'Lissage brésilien',    duree: 180, prix: 210, categorie: 'Soins'     },
  { id: 8, nom: 'Soin profond',         duree: 30,  prix: 35,  categorie: 'Soins'     },
  { id: 9, nom: 'Épilation sourcils',   duree: 20,  prix: 15,  categorie: 'Beauté'    },
  { id: 10, nom: 'Manucure simple',     duree: 45,  prix: 30,  categorie: 'Beauté'    },
];

const CLIENTS = [
  { id: 1, nom: 'Marie Lefebvre',  visites: 12, dernierRdv: '2024-03-18', depense: 620,  fidelite: 'vip'    },
  { id: 2, nom: 'Sophie Bernard',  visites: 8,  dernierRdv: '2024-03-10', depense: 480,  fidelite: 'fidele' },
  { id: 3, nom: 'Laura Dupont',    visites: 5,  dernierRdv: '2024-02-28', depense: 310,  fidelite: 'regulier'},
  { id: 4, nom: 'Julie Martin',    visites: 3,  dernierRdv: '2024-02-14', depense: 145,  fidelite: 'nouveau' },
  { id: 5, nom: 'Céline Rousseau', visites: 15, dernierRdv: '2024-03-20', depense: 890,  fidelite: 'vip'    },
  { id: 6, nom: 'Nina Petit',      visites: 7,  dernierRdv: '2024-03-15', depense: 420,  fidelite: 'fidele' },
];

const EQUIPE = [
  { id: 1, nom: 'Camille Moreau', poste: 'Coiffeuse senior', rdvAujourd: 4, caJour: 480, dispo: true  },
  { id: 2, nom: 'Emma Laurent',   poste: 'Coiffeuse',        rdvAujourd: 2, caJour: 115, dispo: true  },
  { id: 3, nom: 'Léa Dubois',     poste: 'Esthéticienne',    rdvAujourd: 0, caJour: 0,   dispo: false },
];

const MOIS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
const STATS_MENSUEL = [
  { rdv: 142, ca: 7200,  nouveaux: 8  },
  { rdv: 158, ca: 8100,  nouveaux: 11 },
  { rdv: 134, ca: 6800,  nouveaux: 6  },
  { rdv: 171, ca: 9200,  nouveaux: 14 },
  { rdv: 165, ca: 8700,  nouveaux: 10 },
  { rdv: 148, ca: 7900,  nouveaux: 9  },
  { rdv: 139, ca: 7100,  nouveaux: 7  },
  { rdv: 112, ca: 5900,  nouveaux: 5  },
  { rdv: 168, ca: 8900,  nouveaux: 13 },
  { rdv: 175, ca: 9400,  nouveaux: 15 },
  { rdv: 160, ca: 8400,  nouveaux: 11 },
  { rdv: 143, ca: 7600,  nouveaux: 9  },
];

/* ── Helpers ─────────────────────────────────────────────── */
function Badge({ label, color, bg }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 10px', borderRadius:99, fontSize:11, fontWeight:700, background:bg, color, whiteSpace:'nowrap' }}>
      {label}
    </span>
  );
}

function KpiCard({ icon, label, value, sub, color }) {
  return (
    <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:14, padding:'18px 20px', display:'flex', flexDirection:'column', gap:6 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:20 }}>{icon}</span>
        <span style={{ fontSize:12, color:'#888', fontWeight:500 }}>{label}</span>
      </div>
      <div style={{ fontSize:26, fontWeight:800, color: color || '#1C1C1E', letterSpacing:'-0.04em' }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:'#aaa' }}>{sub}</div>}
    </div>
  );
}

const TABS = ['Accueil', 'Agenda', 'Services & Tarifs', 'Clients', 'Équipe', 'Statistiques'];

export default function DashboardCoiffure() {
  const { user } = useAuth();
  const [tab, setTab] = useState('Accueil');
  const [editService, setEditService] = useState(null);
  const [services, setServices] = useState(SERVICES);

  const ca_today = RDV_TODAY.filter(r => r.statut === 'confirme').reduce((s, r) => s + r.montant, 0);
  const rdv_confirmed = RDV_TODAY.filter(r => r.statut === 'confirme').length;

  return (
    <div style={{ padding:'24px 28px', maxWidth:1200, fontFamily:"'Inter',system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <span style={{ fontSize:22 }}>✂️</span>
            <h1 style={{ fontSize:22, fontWeight:800, color:'#1C1C1E', letterSpacing:'-0.04em', margin:0 }}>
              Espace Coiffure
            </h1>
            <span style={{ background:C_BG, color:C, border:`1px solid ${C}30`, borderRadius:99, fontSize:11, fontWeight:700, padding:'3px 10px' }}>PRO</span>
          </div>
          <p style={{ color:'#888', fontSize:13, margin:0 }}>Bonjour {user?.nom?.split(' ')[0]} — {new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })}</p>
        </div>
        <button style={{ background:C, color:'#fff', border:'none', borderRadius:10, padding:'10px 18px', fontWeight:700, fontSize:13, cursor:'pointer' }}>
          + Nouveau RDV
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:24, borderBottom:'1px solid #E8E8EC', flexWrap:'wrap' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:'9px 16px', background:'none', border:'none', borderBottom: tab===t ? `2px solid ${C}` : '2px solid transparent',
            color: tab===t ? C : '#888', fontWeight: tab===t ? 700 : 500, fontSize:13, cursor:'pointer', marginBottom:-1, transition:'color .15s',
          }}>{t}</button>
        ))}
      </div>

      {/* ── Accueil ── */}
      {tab === 'Accueil' && (
        <div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:14, marginBottom:28 }}>
            <KpiCard icon="📅" label="RDV aujourd'hui" value={`${RDV_TODAY.length}`} sub={`${rdv_confirmed} confirmés`} color={C} />
            <KpiCard icon="💰" label="CA estimé / jour" value={`${ca_today} €`} sub="Prestations confirmées" />
            <KpiCard icon="👥" label="Clients actifs" value="52" sub="Ce mois-ci" />
            <KpiCard icon="⭐" label="Note moyenne" value="4.8" sub="128 avis" color="#FF9500" />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:18, alignItems:'start' }}>
            {/* RDV du jour */}
            <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:14, overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid #F2F2F7', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span style={{ fontWeight:700, fontSize:14, color:'#1C1C1E' }}>Rendez-vous du jour</span>
                <span style={{ fontSize:12, color:'#888' }}>{RDV_TODAY.length} RDV</span>
              </div>
              {RDV_TODAY.map(rdv => (
                <div key={rdv.id} style={{ padding:'12px 18px', borderBottom:'1px solid #F9F9FB', display:'flex', alignItems:'center', gap:14 }}>
                  <div style={{ minWidth:46, textAlign:'center' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C }}>{rdv.heure}</div>
                    <div style={{ fontSize:10, color:'#bbb' }}>{rdv.duree} min</div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'#1C1C1E' }}>{rdv.client}</div>
                    <div style={{ fontSize:11, color:'#888' }}>{rdv.prestation} · {rdv.employe}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:13, fontWeight:700 }}>{rdv.montant} €</div>
                    <Badge
                      label={rdv.statut === 'confirme' ? 'Confirmé' : 'En attente'}
                      color={rdv.statut === 'confirme' ? '#34C759' : '#FF9500'}
                      bg={rdv.statut === 'confirme' ? '#E8FFF0' : '#FFF7E8'}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Équipe du jour */}
            <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:14, overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid #F2F2F7' }}>
                <span style={{ fontWeight:700, fontSize:14, color:'#1C1C1E' }}>Équipe présente</span>
              </div>
              {EQUIPE.map(e => (
                <div key={e.id} style={{ padding:'12px 18px', borderBottom:'1px solid #F9F9FB' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:'#1C1C1E' }}>{e.nom}</div>
                      <div style={{ fontSize:11, color:'#888' }}>{e.poste}</div>
                    </div>
                    <span style={{ width:8, height:8, borderRadius:'50%', background: e.dispo ? '#34C759' : '#FF3B30', display:'inline-block' }} />
                  </div>
                  {e.dispo && (
                    <div style={{ display:'flex', gap:12, fontSize:11, color:'#888' }}>
                      <span>{e.rdvAujourd} RDV</span>
                      <span>{e.caJour} € CA</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Agenda ── */}
      {tab === 'Agenda' && (
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
            <h2 style={{ fontSize:16, fontWeight:700, margin:0 }}>Agenda de la semaine</h2>
            <div style={{ display:'flex', gap:8 }}>
              <button style={{ padding:'7px 14px', border:'1px solid #E8E8EC', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:12 }}>← Sem. précédente</button>
              <button style={{ padding:'7px 14px', border:'1px solid #E8E8EC', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:12 }}>Aujourd'hui</button>
              <button style={{ padding:'7px 14px', border:'1px solid #E8E8EC', borderRadius:8, background:'#fff', cursor:'pointer', fontSize:12 }}>Sem. suivante →</button>
            </div>
          </div>

          {/* Plages horaires */}
          <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:14, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'60px repeat(5,1fr)', borderBottom:'1px solid #F2F2F7' }}>
              <div style={{ padding:'10px', background:'#FAFAFA' }} />
              {['Lun 18', 'Mar 19', 'Mer 20', 'Jeu 21', 'Ven 22'].map(d => (
                <div key={d} style={{ padding:'10px', textAlign:'center', fontSize:12, fontWeight:600, color:'#1C1C1E', background:'#FAFAFA', borderLeft:'1px solid #F2F2F7' }}>{d}</div>
              ))}
            </div>
            {['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'].map((h, hi) => (
              <div key={h} style={{ display:'grid', gridTemplateColumns:'60px repeat(5,1fr)', borderBottom:'1px solid #F9F9FB' }}>
                <div style={{ padding:'8px 10px', fontSize:11, color:'#bbb', background:'#FAFAFA', borderRight:'1px solid #F2F2F7' }}>{h}</div>
                {[0,1,2,3,4].map(di => {
                  const rdv = hi === 0 && di === 0 ? RDV_TODAY[0] :
                               hi === 1 && di === 0 ? RDV_TODAY[1] :
                               hi === 2 && di === 0 ? RDV_TODAY[2] : null;
                  return (
                    <div key={di} style={{ minHeight:48, borderLeft:'1px solid #F2F2F7', padding:'4px 6px', position:'relative' }}>
                      {rdv && (
                        <div style={{ background:C_BG, border:`1px solid ${C}40`, borderRadius:6, padding:'4px 8px', fontSize:11, color:C, fontWeight:600, cursor:'pointer' }}>
                          {rdv.client}<br/><span style={{ fontWeight:400, color:'#888' }}>{rdv.prestation}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <p style={{ color:'#bbb', fontSize:12, marginTop:12, textAlign:'center' }}>Cliquez sur un créneau pour ajouter un rendez-vous</p>
        </div>
      )}

      {/* ── Services & Tarifs ── */}
      {tab === 'Services & Tarifs' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <h2 style={{ fontSize:16, fontWeight:700, margin:0 }}>Mes services et prestations</h2>
            <button style={{ background:C, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontWeight:700, fontSize:12, cursor:'pointer' }}>
              + Ajouter un service
            </button>
          </div>

          {['Coupes','Colorations','Soins','Beauté'].map(cat => (
            <div key={cat} style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:1.5, marginBottom:10 }}>{cat}</div>
              <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:12, overflow:'hidden' }}>
                {services.filter(s => s.categorie === cat).map((s, i, arr) => (
                  <div key={s.id} style={{ display:'flex', alignItems:'center', padding:'13px 18px', borderBottom: i < arr.length-1 ? '1px solid #F9F9FB' : 'none' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#1C1C1E' }}>{s.nom}</div>
                      <div style={{ fontSize:11, color:'#888' }}>{s.duree} min</div>
                    </div>
                    <div style={{ fontSize:15, fontWeight:700, color:C, marginRight:16 }}>{s.prix} €</div>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={() => setEditService(s)} style={{ padding:'5px 12px', border:'1px solid #E8E8EC', borderRadius:6, background:'none', cursor:'pointer', fontSize:11, fontWeight:600 }}>Modifier</button>
                      <button style={{ padding:'5px 12px', border:'1px solid #FFE5E5', borderRadius:6, background:'none', cursor:'pointer', fontSize:11, fontWeight:600, color:'#FF3B30' }}>Supprimer</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {editService && (
            <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }} onClick={() => setEditService(null)}>
              <div style={{ background:'#fff', borderRadius:16, padding:28, width:380, boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
                <h3 style={{ margin:'0 0 20px', fontSize:16, fontWeight:700 }}>Modifier le service</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                  <div>
                    <label style={{ fontSize:12, color:'#888', fontWeight:600 }}>Nom du service</label>
                    <input defaultValue={editService.nom} style={{ width:'100%', marginTop:6, padding:'9px 12px', border:'1px solid #E8E8EC', borderRadius:8, fontSize:13, boxSizing:'border-box' }} />
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div>
                      <label style={{ fontSize:12, color:'#888', fontWeight:600 }}>Durée (min)</label>
                      <input type="number" defaultValue={editService.duree} style={{ width:'100%', marginTop:6, padding:'9px 12px', border:'1px solid #E8E8EC', borderRadius:8, fontSize:13, boxSizing:'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize:12, color:'#888', fontWeight:600 }}>Prix (€)</label>
                      <input type="number" defaultValue={editService.prix} style={{ width:'100%', marginTop:6, padding:'9px 12px', border:'1px solid #E8E8EC', borderRadius:8, fontSize:13, boxSizing:'border-box' }} />
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
                    <button onClick={() => setEditService(null)} style={{ padding:'9px 18px', border:'1px solid #E8E8EC', borderRadius:8, background:'none', cursor:'pointer', fontWeight:600 }}>Annuler</button>
                    <button onClick={() => setEditService(null)} style={{ padding:'9px 18px', background:C, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700 }}>Enregistrer</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Clients ── */}
      {tab === 'Clients' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <h2 style={{ fontSize:16, fontWeight:700, margin:0 }}>Portefeuille clients</h2>
            <input placeholder="Rechercher un client…" style={{ padding:'8px 14px', border:'1px solid #E8E8EC', borderRadius:8, fontSize:13, width:220, outline:'none' }} />
          </div>

          <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:14, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', padding:'10px 18px', borderBottom:'1px solid #F2F2F7', fontSize:11, fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:0.8 }}>
              <span>Client</span><span>Visites</span><span>Dernier RDV</span><span>Dépenses</span><span>Fidélité</span>
            </div>
            {CLIENTS.map((c, i) => {
              const fidConfig = {
                vip:     { label:'VIP',      color:'#E535AB', bg:'#FFF0F8' },
                fidele:  { label:'Fidèle',   color:'#5B5BD6', bg:'#EEF2FF' },
                regulier:{ label:'Régulier', color:'#FF9500', bg:'#FFF7E8' },
                nouveau: { label:'Nouveau',  color:'#34C759', bg:'#E8FFF0' },
              }[c.fidelite];
              return (
                <div key={c.id} style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr 1fr 1fr', padding:'13px 18px', borderBottom:'1px solid #F9F9FB', alignItems:'center', background: i%2===0 ? '#fff' : '#FAFAFA' }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'#1C1C1E' }}>{c.nom}</div>
                  </div>
                  <span style={{ fontSize:13, color:'#555' }}>{c.visites}</span>
                  <span style={{ fontSize:13, color:'#555' }}>{new Date(c.dernierRdv).toLocaleDateString('fr-FR', { day:'2-digit', month:'short' })}</span>
                  <span style={{ fontSize:13, fontWeight:600 }}>{c.depense} €</span>
                  <Badge label={fidConfig.label} color={fidConfig.color} bg={fidConfig.bg} />
                </div>
              );
            })}
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

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
            {EQUIPE.map(e => (
              <div key={e.id} style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:14, padding:'20px 22px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                  <div style={{ width:48, height:48, borderRadius:'50%', background:C_BG, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, color:C, fontWeight:800 }}>
                    {e.nom.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700, color:'#1C1C1E' }}>{e.nom}</div>
                    <div style={{ fontSize:12, color:'#888' }}>{e.poste}</div>
                  </div>
                  <span style={{ marginLeft:'auto', width:8, height:8, borderRadius:'50%', background: e.dispo ? '#34C759' : '#FF3B30', display:'inline-block' }} title={e.dispo ? 'Présent' : 'Absent'} />
                </div>
                {e.dispo ? (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                    <div style={{ background:'#F9F9FB', borderRadius:10, padding:'10px 14px', textAlign:'center' }}>
                      <div style={{ fontSize:18, fontWeight:800, color:C }}>{e.rdvAujourd}</div>
                      <div style={{ fontSize:11, color:'#888' }}>RDV aujourd'hui</div>
                    </div>
                    <div style={{ background:'#F9F9FB', borderRadius:10, padding:'10px 14px', textAlign:'center' }}>
                      <div style={{ fontSize:18, fontWeight:800, color:'#34C759' }}>{e.caJour} €</div>
                      <div style={{ fontSize:11, color:'#888' }}>CA du jour</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ background:'#FFF5F5', borderRadius:10, padding:'10px 14px', textAlign:'center' }}>
                    <span style={{ fontSize:12, color:'#FF3B30', fontWeight:600 }}>Absent aujourd'hui</span>
                  </div>
                )}
                <div style={{ display:'flex', gap:8, marginTop:14 }}>
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
          <h2 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Statistiques annuelles</h2>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:14, marginBottom:28 }}>
            <KpiCard icon="💰" label="CA annuel" value="96 300 €" sub="+12% vs année passée" color={C} />
            <KpiCard icon="📅" label="RDV réalisés" value="1 815" sub="Moyenne 151/mois" />
            <KpiCard icon="👥" label="Clients distincts" value="284" sub="Ce mois-ci" />
            <KpiCard icon="🔄" label="Taux de retour" value="76 %" sub="Clients fidèles" color="#34C759" />
          </div>

          {/* Graphique CA mensuel */}
          <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:14, padding:'20px 24px', marginBottom:20 }}>
            <div style={{ marginBottom:16, fontWeight:700, fontSize:14, color:'#1C1C1E' }}>CA mensuel (€)</div>
            <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:140 }}>
              {STATS_MENSUEL.map((m, i) => {
                const max = Math.max(...STATS_MENSUEL.map(x => x.ca));
                const pct = (m.ca / max) * 100;
                return (
                  <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                    <div style={{ width:'100%', background:C_BG, borderRadius:'4px 4px 0 0', height: `${pct}%`, minHeight:4, position:'relative', transition:'height .3s', border:`1px solid ${C}30` }}>
                      <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background:`linear-gradient(180deg,${C}60,${C}20)`, borderRadius:'4px 4px 0 0' }} />
                    </div>
                    <span style={{ fontSize:9, color:'#bbb' }}>{MOIS[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top prestations */}
          <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:14, padding:'20px 24px' }}>
            <div style={{ marginBottom:16, fontWeight:700, fontSize:14 }}>Top prestations</div>
            {[
              { nom:'Balayage', pct:28, ca:26964 },
              { nom:'Coloration racines', pct:22, ca:21186 },
              { nom:'Coupe + Brushing', pct:19, ca:18297 },
              { nom:'Lissage brésilien', pct:15, ca:14445 },
              { nom:'Coupe femme', pct:16, ca:15408 },
            ].map((p, i) => (
              <div key={i} style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:12 }}>
                  <span style={{ fontWeight:600 }}>{p.nom}</span>
                  <span style={{ color:C, fontWeight:700 }}>{p.ca.toLocaleString('fr-FR')} €</span>
                </div>
                <div style={{ height:6, background:'#F2F2F7', borderRadius:3, overflow:'hidden' }}>
                  <div style={{ width:`${p.pct}%`, height:'100%', background:C, borderRadius:3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
