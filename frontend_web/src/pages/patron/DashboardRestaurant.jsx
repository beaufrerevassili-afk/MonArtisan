import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const C = '#FF6000'; // accent restaurant
const C_BG = '#FFF3E8';
const C_SOFT = '#FFE8D2';

/* ── Demo data ──────────────────────────────────────────── */
const RESERVATIONS = [
  { id: 1, heure: '12:00', nom: 'Famille Dupont',   couverts: 4, table: 'T3',  statut: 'confirme',  note: 'Allergie aux noix' },
  { id: 2, heure: '12:30', nom: 'Martin & Leblanc', couverts: 2, table: 'T1',  statut: 'confirme',  note: '' },
  { id: 3, heure: '13:00', nom: 'Équipe Renault',   couverts: 8, table: 'T7',  statut: 'confirme',  note: 'Menu d\'entreprise' },
  { id: 4, heure: '13:15', nom: 'Mme Garcia',       couverts: 3, table: 'T2',  statut: 'attente',   note: '' },
  { id: 5, heure: '19:30', nom: 'Anniversaire Roy', couverts: 6, table: 'T5',  statut: 'confirme',  note: 'Gâteau d\'anniversaire' },
  { id: 6, heure: '20:00', nom: 'M. et Mme Chen',   couverts: 2, table: 'T1',  statut: 'confirme',  note: 'Table romantique' },
  { id: 7, heure: '20:30', nom: 'Groupe Leclerc',   couverts: 10, table: 'T8', statut: 'confirme',  note: '' },
  { id: 8, heure: '21:00', nom: 'Mme Fontaine',     couverts: 2, table: 'T4',  statut: 'annule',    note: '' },
];

const TABLES = [
  { id:'T1',  places:2,  zone:'Fenêtre',   statut:'occupee',  reservation:'Martin & Leblanc' },
  { id:'T2',  places:4,  zone:'Centre',    statut:'libre',    reservation:'' },
  { id:'T3',  places:4,  zone:'Terrasse',  statut:'reservee', reservation:'Famille Dupont (12h)' },
  { id:'T4',  places:2,  zone:'Intérieur', statut:'libre',    reservation:'' },
  { id:'T5',  places:6,  zone:'Salle',     statut:'reservee', reservation:'Anniversaire Roy (19h30)' },
  { id:'T6',  places:4,  zone:'Terrasse',  statut:'libre',    reservation:'' },
  { id:'T7',  places:8,  zone:'Salle',     statut:'reservee', reservation:'Équipe Renault (13h)' },
  { id:'T8',  places:10, zone:'Salle',     statut:'libre',    reservation:'' },
  { id:'T9',  places:2,  zone:'Bar',       statut:'occupee',  reservation:'Clients bar' },
  { id:'T10', places:4,  zone:'Centre',    statut:'libre',    reservation:'' },
];

const CARTE = [
  { id:1, nom:'Soupe à l\'oignon',    categorie:'Entrées', prix:9,   dispo:true  },
  { id:2, nom:'Salade niçoise',       categorie:'Entrées', prix:12,  dispo:true  },
  { id:3, nom:'Foie gras maison',     categorie:'Entrées', prix:18,  dispo:false },
  { id:4, nom:'Entrecôte grillée',    categorie:'Plats',   prix:28,  dispo:true  },
  { id:5, nom:'Magret de canard',     categorie:'Plats',   prix:26,  dispo:true  },
  { id:6, nom:'Filet de bar',         categorie:'Plats',   prix:24,  dispo:true  },
  { id:7, nom:'Risotto aux cèpes',    categorie:'Plats',   prix:19,  dispo:true  },
  { id:8, nom:'Crème brûlée',         categorie:'Desserts',prix:8,   dispo:true  },
  { id:9, nom:'Tarte tatin',          categorie:'Desserts',prix:9,   dispo:true  },
  { id:10,nom:'Moelleux chocolat',    categorie:'Desserts',prix:8,   dispo:false },
];

const EQUIPE = [
  { id:1, nom:'Antoine Rousseau', poste:'Chef de cuisine',  present:true,  service:'Midi + Soir' },
  { id:2, nom:'Yasmine Benali',   poste:'Sous-chef',        present:true,  service:'Midi + Soir' },
  { id:3, nom:'Hugo Martin',      poste:'Serveur',          present:true,  service:'Midi' },
  { id:4, nom:'Chloé Bernard',    poste:'Serveuse',         present:true,  service:'Soir' },
  { id:5, nom:'Kevin Petit',      poste:'Barman',           present:false, service:'Soir' },
];

const TABS = ['Accueil', 'Réservations', 'Plan de salle', 'Ma carte', 'Équipe', 'Statistiques'];

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
      <div style={{ fontSize:26, fontWeight:800, color: color||'#1C1C1E', letterSpacing:'-0.04em' }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:'#aaa' }}>{sub}</div>}
    </div>
  );
}

export default function DashboardRestaurant() {
  const { user } = useAuth();
  const [tab, setTab] = useState('Accueil');
  const [carte, setCarte] = useState(CARTE);

  const couverts_today = RESERVATIONS.filter(r => r.statut === 'confirme').reduce((s, r) => s + r.couverts, 0);
  const tables_libres = TABLES.filter(t => t.statut === 'libre').length;

  return (
    <div style={{ padding:'24px 28px', maxWidth:1200, fontFamily:"'Inter',system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom:24, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
            <span style={{ fontSize:22 }}>🍽️</span>
            <h1 style={{ fontSize:22, fontWeight:800, color:'#1C1C1E', letterSpacing:'-0.04em', margin:0 }}>Espace Restaurant</h1>
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
            <KpiCard icon="👥" label="Couverts aujourd'hui" value={String(couverts_today)} sub={`${RESERVATIONS.filter(r=>r.statut==='confirme').length} réservations`} color={C} />
            <KpiCard icon="🪑" label="Tables disponibles" value={`${tables_libres}/${TABLES.length}`} sub="En ce moment" />
            <KpiCard icon="💰" label="CA estimé / jour" value="1 840 €" sub="Basé sur les réservations" />
            <KpiCard icon="⭐" label="Note Google" value="4.6" sub="312 avis" color="#FF9500" />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'3fr 2fr', gap:18, alignItems:'start' }}>
            {/* Réservations du jour */}
            <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:14, overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid #F2F2F7', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ fontWeight:700, fontSize:14 }}>Réservations du jour</span>
                <span style={{ fontSize:12, color:'#888' }}>{RESERVATIONS.length} réservations</span>
              </div>
              {RESERVATIONS.slice(0, 6).map(r => {
                const sc = { confirme:{ c:'#34C759', bg:'#E8FFF0', l:'Confirmé' }, attente:{ c:'#FF9500', bg:'#FFF7E8', l:'En attente' }, annule:{ c:'#FF3B30', bg:'#FFF0F0', l:'Annulé' } }[r.statut];
                return (
                  <div key={r.id} style={{ padding:'11px 18px', borderBottom:'1px solid #F9F9FB', display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ minWidth:44, textAlign:'center' }}>
                      <div style={{ fontSize:13, fontWeight:700, color:C }}>{r.heure}</div>
                      <div style={{ fontSize:10, color:'#bbb' }}>{r.table}</div>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#1C1C1E' }}>{r.nom}</div>
                      <div style={{ fontSize:11, color:'#888' }}>{r.couverts} couverts{r.note ? ` · ${r.note}` : ''}</div>
                    </div>
                    <Badge label={sc.l} color={sc.c} bg={sc.bg} />
                  </div>
                );
              })}
              {RESERVATIONS.length > 6 && (
                <div style={{ padding:'10px 18px', textAlign:'center', fontSize:12, color:C, fontWeight:600, cursor:'pointer' }} onClick={() => setTab('Réservations')}>
                  Voir toutes les réservations →
                </div>
              )}
            </div>

            {/* Plan de salle simplifié */}
            <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:14, overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', borderBottom:'1px solid #F2F2F7' }}>
                <span style={{ fontWeight:700, fontSize:14 }}>État des tables</span>
              </div>
              <div style={{ padding:'14px 18px', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                {TABLES.map(t => {
                  const bc = { occupee:'#FF3B30', reservee:C, libre:'#34C759' }[t.statut];
                  const bg = { occupee:'#FFF0F0', reservee:C_BG, libre:'#E8FFF0' }[t.statut];
                  return (
                    <div key={t.id} title={t.reservation || t.statut} style={{ background:bg, border:`1.5px solid ${bc}40`, borderRadius:8, padding:'6px', textAlign:'center', cursor:'pointer' }}>
                      <div style={{ fontSize:10, fontWeight:700, color:bc }}>{t.id}</div>
                      <div style={{ fontSize:9, color:'#888' }}>{t.places}p</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding:'8px 18px 14px', display:'flex', gap:10, flexWrap:'wrap' }}>
                {[['#34C759','Libre'],['#FF6000','Réservée'],['#FF3B30','Occupée']].map(([c,l]) => (
                  <div key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:10, color:'#888' }}>
                    <span style={{ width:8, height:8, borderRadius:2, background:c, display:'inline-block' }} />
                    {l}
                  </div>
                ))}
              </div>
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
                <option>Aujourd'hui</option><option>Demain</option><option>Cette semaine</option>
              </select>
              <button style={{ background:C, color:'#fff', border:'none', borderRadius:8, padding:'8px 14px', fontWeight:700, fontSize:12, cursor:'pointer' }}>+ Ajouter</button>
            </div>
          </div>
          <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:14, overflow:'hidden' }}>
            <div style={{ display:'grid', gridTemplateColumns:'80px 2fr 80px 60px 120px 1fr', padding:'10px 18px', borderBottom:'1px solid #F2F2F7', fontSize:11, fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:0.8 }}>
              <span>Heure</span><span>Nom</span><span>Couverts</span><span>Table</span><span>Statut</span><span>Note</span>
            </div>
            {RESERVATIONS.map((r, i) => {
              const sc = { confirme:{ c:'#34C759', bg:'#E8FFF0', l:'Confirmé' }, attente:{ c:'#FF9500', bg:'#FFF7E8', l:'En attente' }, annule:{ c:'#FF3B30', bg:'#FFF0F0', l:'Annulé' } }[r.statut];
              return (
                <div key={r.id} style={{ display:'grid', gridTemplateColumns:'80px 2fr 80px 60px 120px 1fr', padding:'12px 18px', borderBottom:'1px solid #F9F9FB', alignItems:'center', background:i%2===0?'#fff':'#FAFAFA' }}>
                  <span style={{ fontSize:13, fontWeight:700, color:C }}>{r.heure}</span>
                  <span style={{ fontSize:13, fontWeight:600, color:'#1C1C1E' }}>{r.nom}</span>
                  <span style={{ fontSize:13 }}>{r.couverts}</span>
                  <span style={{ fontSize:12, color:'#888', fontWeight:600 }}>{r.table}</span>
                  <Badge label={sc.l} color={sc.c} bg={sc.bg} />
                  <span style={{ fontSize:11, color:'#888' }}>{r.note || '—'}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Plan de salle ── */}
      {tab === 'Plan de salle' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <h2 style={{ fontSize:16, fontWeight:700, margin:0 }}>Plan de salle</h2>
            <div style={{ display:'flex', gap:10 }}>
              {[['#34C759','Libre'],['#FF6000','Réservée'],['#FF3B30','Occupée']].map(([c,l]) => (
                <div key={l} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'#555' }}>
                  <span style={{ width:10, height:10, borderRadius:3, background:c, display:'inline-block' }} />
                  {l}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:16, padding:28 }}>
            {/* Zones */}
            {[
              { zone:'Terrasse', tables: TABLES.filter(t => t.zone==='Terrasse') },
              { zone:'Fenêtre',  tables: TABLES.filter(t => t.zone==='Fenêtre')  },
              { zone:'Salle',    tables: TABLES.filter(t => t.zone==='Salle')    },
              { zone:'Centre',   tables: TABLES.filter(t => t.zone==='Centre')   },
              { zone:'Bar',      tables: TABLES.filter(t => t.zone==='Bar')      },
              { zone:'Intérieur',tables: TABLES.filter(t => t.zone==='Intérieur')},
            ].filter(z => z.tables.length > 0).map(z => (
              <div key={z.zone} style={{ marginBottom:24 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:1.5, marginBottom:12 }}>{z.zone}</div>
                <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                  {z.tables.map(t => {
                    const bc = { occupee:'#FF3B30', reservee:C, libre:'#34C759' }[t.statut];
                    const bg = { occupee:'#FFF0F0', reservee:C_BG, libre:'#E8FFF0' }[t.statut];
                    return (
                      <div key={t.id} style={{ background:bg, border:`2px solid ${bc}50`, borderRadius:12, padding:'16px 18px', minWidth:130, cursor:'pointer', transition:'transform .15s' }}
                        onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                        onMouseLeave={e=>e.currentTarget.style.transform='none'}
                      >
                        <div style={{ fontSize:16, fontWeight:800, color:bc, marginBottom:4 }}>{t.id}</div>
                        <div style={{ fontSize:12, color:'#555', marginBottom:6 }}>{t.places} places</div>
                        {t.reservation ? (
                          <div style={{ fontSize:11, color:bc, fontWeight:600 }}>{t.reservation}</div>
                        ) : (
                          <div style={{ fontSize:11, color:'#34C759', fontWeight:600 }}>Disponible</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Ma carte ── */}
      {tab === 'Ma carte' && (
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:18 }}>
            <h2 style={{ fontSize:16, fontWeight:700, margin:0 }}>Ma carte</h2>
            <button style={{ background:C, color:'#fff', border:'none', borderRadius:8, padding:'8px 16px', fontWeight:700, fontSize:12, cursor:'pointer' }}>
              + Ajouter un plat
            </button>
          </div>
          {['Entrées','Plats','Desserts'].map(cat => (
            <div key={cat} style={{ marginBottom:20 }}>
              <div style={{ fontSize:11, fontWeight:700, color:'#888', textTransform:'uppercase', letterSpacing:1.5, marginBottom:10 }}>{cat}</div>
              <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:12, overflow:'hidden' }}>
                {carte.filter(p => p.categorie === cat).map((p, i, arr) => (
                  <div key={p.id} style={{ display:'flex', alignItems:'center', padding:'13px 18px', borderBottom: i < arr.length-1 ? '1px solid #F9F9FB' : 'none' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:'#1C1C1E', display:'flex', alignItems:'center', gap:8 }}>
                        {p.nom}
                        {!p.dispo && <Badge label="Indisponible" color="#FF3B30" bg="#FFF0F0" />}
                      </div>
                    </div>
                    <div style={{ fontSize:15, fontWeight:700, color:C, marginRight:16 }}>{p.prix} €</div>
                    <button
                      onClick={() => setCarte(c => c.map(x => x.id === p.id ? {...x, dispo:!x.dispo} : x))}
                      style={{ padding:'5px 12px', border:'1px solid #E8E8EC', borderRadius:6, background:'none', cursor:'pointer', fontSize:11, fontWeight:600, marginRight:6 }}
                    >
                      {p.dispo ? '🔴 Indispo' : '🟢 Dispo'}
                    </button>
                    <button style={{ padding:'5px 12px', border:'1px solid #E8E8EC', borderRadius:6, background:'none', cursor:'pointer', fontSize:11, fontWeight:600 }}>Modifier</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
                <div style={{ background:'#F9F9FB', borderRadius:10, padding:'10px 14px', fontSize:12, color:'#555' }}>
                  <strong>Service :</strong> {e.service}
                </div>
                <div style={{ display:'flex', gap:8, marginTop:12 }}>
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
          <h2 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Statistiques du restaurant</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:14, marginBottom:28 }}>
            <KpiCard icon="💰" label="CA mensuel" value="48 200 €" sub="+8% vs mois dernier" color={C} />
            <KpiCard icon="👥" label="Couverts / mois" value="1 240" sub="Moy. 41 couverts/jour" />
            <KpiCard icon="🪑" label="Taux remplissage" value="78 %" sub="Midi + Soir" color="#5B5BD6" />
            <KpiCard icon="⭐" label="Ticket moyen" value="38 €" sub="Par couvert" color="#34C759" />
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18 }}>
            <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:14, padding:'20px 24px' }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Réservations par service</div>
              {[['Déjeuner (12h-14h30)', 58, '#5B5BD6'],['Dîner (19h-22h)', 42, C]].map(([l,v,c]) => (
                <div key={l} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:12 }}>
                    <span style={{ fontWeight:600 }}>{l}</span><span style={{ color:c, fontWeight:700 }}>{v}%</span>
                  </div>
                  <div style={{ height:8, background:'#F2F2F7', borderRadius:4 }}>
                    <div style={{ width:`${v}%`, height:'100%', background:c, borderRadius:4 }} />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background:'#fff', border:'1px solid #E8E8EC', borderRadius:14, padding:'20px 24px' }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:16 }}>Top plats commandés</div>
              {[
                { nom:'Entrecôte grillée', commandes:142, ca:3976 },
                { nom:'Magret de canard',  commandes:118, ca:3068 },
                { nom:'Tarte tatin',       commandes:203, ca:1827 },
                { nom:'Filet de bar',      commandes:89,  ca:2136 },
              ].map((p, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom: i < 3 ? '1px solid #F2F2F7' : 'none' }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600, color:'#1C1C1E' }}>{p.nom}</div>
                    <div style={{ fontSize:11, color:'#888' }}>{p.commandes} commandes</div>
                  </div>
                  <div style={{ fontSize:13, fontWeight:700, color:C }}>{p.ca.toLocaleString('fr-FR')} €</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
