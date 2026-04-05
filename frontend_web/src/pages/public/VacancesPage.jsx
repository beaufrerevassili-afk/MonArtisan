import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DS from '../../design/ds';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';

// ─── Data ──────────────────────────────────────────────────────────────────────

const TYPES = ['Tout', '🏠 Maison', '🏢 Appartement', '🏖️ Villa', "🛏️ Chambre d'hôtes", '🏨 Hôtel', '🏕️ Insolite'];

const PROPRIETES = [
  { id:'1', nom:'Villa Azur',            type:'🏖️ Villa',          ville:'Antibes',       region:"Côte d'Azur",    note:4.9, avis:184, prixNuit:280, capacite:'6 pers.', surface:'140 m²', dispo:true,  grad:'linear-gradient(140deg,#A0C8E8,#6090C0)', initials:'VA', tags:['Piscine','Vue mer','Climatisation'] },
  { id:'2', nom:'Chalet Mont Blanc',     type:'🏠 Maison',          ville:'Chamonix',      region:'Haute-Savoie',   note:4.8, avis:97,  prixNuit:195, capacite:'8 pers.', surface:'120 m²', dispo:true,  grad:'linear-gradient(140deg,#C0D0E0,#8090A8)', initials:'CM', tags:['Sauna','Ski','Parking'] },
  { id:'3', nom:'Appartement Marais',    type:'🏢 Appartement',     ville:'Paris 4e',      region:'Île-de-France',  note:4.7, avis:312, prixNuit:95,  capacite:'2 pers.', surface:'45 m²',  dispo:true,  grad:'linear-gradient(140deg,#E0C8A0,#C0A070)', initials:'AM', tags:['Wi-Fi','Balcon','Centre-ville'] },
  { id:'4', nom:'Mas Provençal',         type:'🏠 Maison',          ville:'Gordes',        region:'Luberon',        note:5.0, avis:56,  prixNuit:220, capacite:'4 pers.', surface:'95 m²',  dispo:true,  grad:'linear-gradient(140deg,#E8D0A0,#C8A860)', initials:'MP', tags:['Piscine','Jardin','Animaux OK'] },
  { id:'5', nom:'Chambre Vue Vignes',    type:"🛏️ Chambre d'hôtes", ville:'Saint-Émilion', region:'Gironde',        note:4.8, avis:73,  prixNuit:85,  capacite:'2 pers.', surface:'30 m²',  dispo:false, grad:'linear-gradient(140deg,#C0B090,#908060)', initials:'VV', tags:['Petit-déj.','Vignoble','Romantique'] },
  { id:'6', nom:'Cabane dans les Arbres',type:'🏕️ Insolite',        ville:'Périgueux',     region:'Dordogne',       note:4.9, avis:128, prixNuit:135, capacite:'2 pers.', surface:'25 m²',  dispo:true,  grad:'linear-gradient(140deg,#A0C0A0,#709870)', initials:'CA', tags:['Nature','Terrasse','Insolite'] },
];

// ─── Calendrier ────────────────────────────────────────────────────────────────

const MONTHS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const DAYS_FR   = ['Lu','Ma','Me','Je','Ve','Sa','Di'];

function isSameDay(a, b) {
  return a && b && a.getDate()===b.getDate() && a.getMonth()===b.getMonth() && a.getFullYear()===b.getFullYear();
}
function isPast(d) {
  const t = new Date(); t.setHours(0,0,0,0); return d < t;
}
function getMonthData(year, month) {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay    = new Date(year, month, 1).getDay();
  const startOffset = (firstDay + 6) % 7; // lundi = 0
  return { daysInMonth, startOffset };
}
function formatShortDate(d) {
  if (!d) return null;
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()].slice(0,3).toLowerCase()}.`;
}
function diffDays(a, b) {
  return Math.round((b - a) / 86400000);
}
function nextMonthOf(year, month) {
  return month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 };
}

function CalendarMonth({ year, month, startDate, endDate, hoverDate, onDateClick, onDateHover, showPrev, showNext, onPrev, onNext }) {
  const { daysInMonth, startOffset } = getMonthData(year, month);
  const rangeEnd = endDate || hoverDate;
  const today = new Date(); today.setHours(0,0,0,0);

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return (
    <div style={{ flex:1 }}>
      {/* En-tête mois */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
        <button onClick={onPrev} style={{ width:32, height:32, borderRadius:'50%', border:`1px solid ${DS.border}`, background:'none', cursor:showPrev?'pointer':'default', opacity:showPrev?1:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DS.ink} strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style={{ fontSize:15, fontWeight:700, color:DS.ink, letterSpacing:'-0.02em' }}>
          {MONTHS_FR[month]} {year}
        </div>
        <button onClick={onNext} style={{ width:32, height:32, borderRadius:'50%', border:`1px solid ${DS.border}`, background:'none', cursor:showNext?'pointer':'default', opacity:showNext?1:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={DS.ink} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      {/* Jours de semaine */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', marginBottom:6 }}>
        {DAYS_FR.map(d => (
          <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:600, color:DS.subtle, padding:'4px 0', letterSpacing:0.5 }}>{d}</div>
        ))}
      </div>

      {/* Grille jours */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)' }}>
        {cells.map((date, i) => {
          if (!date) return <div key={i} />;
          const past     = isPast(date);
          const isStart  = isSameDay(date, startDate);
          const isEnd    = isSameDay(date, endDate);
          const inRange  = startDate && rangeEnd && !isSameDay(date, startDate) && !isSameDay(date, rangeEnd) && date > startDate && date < rangeEnd;
          const isToday  = isSameDay(date, today);
          const selected = isStart || isEnd;

          // Arrondi pour le début et la fin de la range
          const rangeStyle = {};
          if (inRange) rangeStyle.background = DS.accentLight;
          if (isStart && (endDate || hoverDate)) { rangeStyle.background = DS.accentLight; rangeStyle.borderRadius = `${DS.r.full}px 0 0 ${DS.r.full}px`; }
          if (isEnd) { rangeStyle.background = DS.accentLight; rangeStyle.borderRadius = `0 ${DS.r.full}px ${DS.r.full}px 0`; }

          return (
            <div key={i} style={{ height:44, display:'flex', alignItems:'center', justifyContent:'center', ...rangeStyle }}>
              <div
                onClick={() => !past && onDateClick(date)}
                onMouseEnter={() => !past && onDateHover(date)}
                style={{
                  width:36, height:36, borderRadius:'50%',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:14, fontWeight: selected?700 : isToday?600 : 400,
                  background: selected ? DS.ink : 'transparent',
                  color: selected ? '#fff' : past ? DS.border : DS.ink,
                  cursor: past ? 'not-allowed' : 'pointer',
                  transition: 'background .12s',
                  position:'relative',
                }}
                onMouseOver={e => { if(!selected && !past) e.currentTarget.style.background = DS.bgSoft; }}
                onMouseOut={e => { if(!selected) e.currentTarget.style.background = 'transparent'; }}>
                {date.getDate()}
                {isToday && !selected && (
                  <span style={{ position:'absolute', bottom:3, left:'50%', transform:'translateX(-50%)', width:4, height:4, borderRadius:'50%', background:DS.accent }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DateRangePicker({ startDate, endDate, onSelect, onClose }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [hoverDate, setHoverDate] = useState(null);
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);

  const m2 = nextMonthOf(viewYear, viewMonth);
  const nights = tempStart && tempEnd ? diffDays(tempStart, tempEnd) : 0;

  const handleDateClick = (date) => {
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(date); setTempEnd(null);
    } else {
      if (date < tempStart) { setTempStart(date); setTempEnd(null); }
      else if (isSameDay(date, tempStart)) { setTempStart(null); }
      else { setTempEnd(date); }
    }
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const canGoBack = new Date(viewYear, viewMonth, 1) > new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div style={{ background:DS.bg, borderRadius:DS.r.xl, border:`1px solid ${DS.border}`, boxShadow:DS.shadow.xl, padding:'28px 32px', width:'100%', maxWidth:760, margin:'0 auto', boxSizing:'border-box' }}>
      {/* Deux mois */}
      <div style={{ display:'flex', gap:48, marginBottom:20 }}>
        <CalendarMonth
          year={viewYear} month={viewMonth}
          startDate={tempStart} endDate={tempEnd} hoverDate={hoverDate}
          onDateClick={handleDateClick} onDateHover={setHoverDate}
          showPrev={canGoBack} showNext={false}
          onPrev={prevMonth} onNext={() => {}}
        />
        <div style={{ width:1, background:DS.border, flexShrink:0 }} />
        <CalendarMonth
          year={m2.year} month={m2.month}
          startDate={tempStart} endDate={tempEnd} hoverDate={hoverDate}
          onDateClick={handleDateClick} onDateHover={setHoverDate}
          showPrev={false} showNext={true}
          onPrev={() => {}} onNext={nextMonth}
        />
      </div>

      {/* Footer */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:20, borderTop:`1px solid ${DS.border}` }}>
        <div style={{ fontSize:13, color:DS.muted }}>
          {tempStart && tempEnd
            ? <span><strong style={{ color:DS.ink }}>{nights} nuit{nights > 1 ? 's' : ''}</strong> · {formatShortDate(tempStart)} → {formatShortDate(tempEnd)}</span>
            : tempStart
            ? <span style={{ color:DS.muted }}>Sélectionnez la date de départ</span>
            : <span style={{ color:DS.muted }}>Sélectionnez vos dates</span>
          }
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={() => { setTempStart(null); setTempEnd(null); onSelect(null, null); }}
            style={{ padding:'9px 18px', background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:600, color:DS.muted, textDecoration:'underline', textUnderlineOffset:3 }}>
            Effacer les dates
          </button>
          <button
            onClick={() => { onSelect(tempStart, tempEnd); onClose(); }}
            disabled={!tempStart}
            style={{ padding:'10px 22px', background:tempStart?DS.ink:DS.bgMuted, border:'none', borderRadius:DS.r.full, fontSize:13, fontWeight:700, color:tempStart?'#fff':DS.subtle, cursor:tempStart?'pointer':'default', transition:'opacity .15s' }}>
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Voyageurs ─────────────────────────────────────────────────────────────────

const VOYAGEURS_INIT = { adultes:1, enfants:0, bebes:0, animaux:0 };

function Counter({ label, sublabel, value, onDec, onInc, min = 0 }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:`1px solid ${DS.border}` }}>
      <div>
        <div style={{ fontSize:14, fontWeight:600, color:DS.ink }}>{label}</div>
        {sublabel && <div style={{ fontSize:12, color:DS.muted, marginTop:2 }}>{sublabel}</div>}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <button onClick={onDec} disabled={value <= min}
          style={{ width:30, height:30, borderRadius:'50%', border:`1.5px solid ${value<=min?DS.border:DS.muted}`, background:'none', cursor:value<=min?'default':'pointer', color:value<=min?DS.border:DS.ink, fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}>
          −
        </button>
        <span style={{ fontSize:15, fontWeight:600, color:DS.ink, minWidth:16, textAlign:'center' }}>{value}</span>
        <button onClick={onInc}
          style={{ width:30, height:30, borderRadius:'50%', border:`1.5px solid ${DS.muted}`, background:'none', cursor:'pointer', color:DS.ink, fontSize:18, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}>
          +
        </button>
      </div>
    </div>
  );
}

// ─── Carte propriété ───────────────────────────────────────────────────────────

function PropertyCard({ prop, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick}
      style={{ background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.xl, overflow:'hidden', cursor:'pointer', transition:'all .2s', boxShadow:hov?DS.shadow.md:DS.shadow.xs, transform:hov?'translateY(-3px)':'none' }}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
      <div style={{ height:200, background:prop.grad, position:'relative' }}>
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.22))' }} />
        <div style={{ position:'absolute', top:12, left:12, padding:'5px 11px', background:'rgba(255,255,255,0.92)', backdropFilter:'blur(8px)', borderRadius:DS.r.full, fontSize:11, fontWeight:600, color:DS.ink }}>
          {prop.type}
        </div>
        {!prop.dispo && (
          <div style={{ position:'absolute', top:12, right:12, padding:'5px 11px', background:'rgba(10,10,10,0.72)', borderRadius:DS.r.full, fontSize:11, fontWeight:600, color:'#fff' }}>Indisponible</div>
        )}
        <div style={{ position:'absolute', bottom:14, left:18, fontSize:28, fontWeight:900, color:'rgba(255,255,255,0.85)', letterSpacing:'-0.04em' }}>{prop.initials}</div>
      </div>
      <div style={{ padding:'16px 18px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:4 }}>
          <div style={{ fontSize:15, fontWeight:700, color:DS.ink, letterSpacing:'-0.03em', lineHeight:1.3, flex:1, marginRight:8 }}>{prop.nom}</div>
          <div style={{ display:'flex', alignItems:'center', gap:3, flexShrink:0 }}>
            <span style={{ color:DS.gold, fontSize:11 }}>★</span>
            <span style={{ fontSize:12, fontWeight:700, color:DS.ink }}>{prop.note}</span>
          </div>
        </div>
        <div style={{ fontSize:12, color:DS.muted, marginBottom:10 }}>📍 {prop.ville} · {prop.region}</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:12 }}>
          {prop.tags.map(t => <span key={t} style={{ padding:'3px 8px', background:DS.surface, borderRadius:DS.r.full, fontSize:11, color:DS.ink2, fontWeight:500 }}>{t}</span>)}
        </div>
        <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBottom:3 }}>
          <span style={{ fontSize:22, fontWeight:900, color:DS.ink, letterSpacing:'-0.03em' }}>{prop.prixNuit}€</span>
          <span style={{ fontSize:12, color:DS.muted }}>/nuit</span>
        </div>
        <div style={{ fontSize:11.5, color:DS.subtle, marginBottom:14 }}>{prop.capacite} · {prop.surface} · {prop.avis} avis</div>
        <button
          style={{ width:'100%', padding:'11px', background:prop.dispo?DS.accent:DS.bgMuted, color:prop.dispo?'#fff':DS.subtle, border:'none', borderRadius:DS.r.full, fontWeight:700, fontSize:13, cursor:prop.dispo?'pointer':'default', transition:'background .15s', fontFamily:DS.font }}
          onMouseEnter={e=>{ if(prop.dispo) e.currentTarget.style.background=DS.accentHover; }}
          onMouseLeave={e=>{ if(prop.dispo) e.currentTarget.style.background=DS.accent; }}>
          {prop.dispo ? 'Voir & Réserver' : 'Indisponible'}
        </button>
      </div>
    </div>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────

export default function VacancesPage() {
  const navigate = useNavigate();
  const [type, setType] = useState('Tout');
  const [recherche, setRecherche] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [voyageurs, setVoyageurs] = useState(VOYAGEURS_INIT);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showVoyageurs, setShowVoyageurs] = useState(false);
  const calendarRef = useRef();
  const voyageursRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) setShowCalendar(false);
      if (voyageursRef.current && !voyageursRef.current.contains(e.target)) setShowVoyageurs(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const totalVoyageurs = voyageurs.adultes + voyageurs.enfants + voyageurs.bebes;
  const voyageursLabel = totalVoyageurs <= 1 && voyageurs.animaux === 0
    ? 'Voyageurs'
    : `${totalVoyageurs} voyageur${totalVoyageurs > 1 ? 's' : ''}${voyageurs.animaux > 0 ? `, ${voyageurs.animaux} animal${voyageurs.animaux > 1 ? 'ux' : ''}` : ''}`;

  const datesLabel = startDate && endDate
    ? `${formatShortDate(startDate)} – ${formatShortDate(endDate)}`
    : startDate
    ? `${formatShortDate(startDate)} – Départ`
    : null;

  const setV = (key, val) => setVoyageurs(v => ({ ...v, [key]: Math.max(0, val) }));

  const filtered = PROPRIETES.filter(p => {
    const tm = type === 'Tout' || p.type === type;
    const sm = !recherche || p.nom.toLowerCase().includes(recherche.toLowerCase()) || p.ville.toLowerCase().includes(recherche.toLowerCase()) || p.region.toLowerCase().includes(recherche.toLowerCase());
    return tm && sm;
  });

  const minPrice = Math.min(...filtered.map(p => p.prixNuit));

  const subNav = (
    <div style={{ display:'flex', padding:'0 clamp(16px,4vw,48px)', overflowX:'auto', scrollbarWidth:'none' }}>
      {TYPES.map(t => (
        <button key={t} onClick={() => setType(t)}
          style={{ padding:'11px 16px', background:'none', border:'none', borderBottom:`2px solid ${type===t?DS.accent:'transparent'}`, fontSize:12.5, fontWeight:type===t?700:400, color:type===t?DS.ink:DS.muted, cursor:'pointer', whiteSpace:'nowrap', marginBottom:-1, transition:'color .15s', fontFamily:DS.font }}>
          {t}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:DS.bg, fontFamily:DS.font, color:DS.ink }}>
      <RecrutementBanner secteur="vacances" />
      <PublicNavbar subNav={subNav} />

      {/* ── En-tête page : titre + boutons hôtes ── */}
      <div style={{ background:DS.bg, borderBottom:`1px solid ${DS.border}`, padding:'20px clamp(16px,4vw,48px) 0' }}>
        <div style={{ maxWidth:960, margin:'0 auto' }}>
          {/* Ligne titre + actions */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18, flexWrap:'wrap', gap:12 }}>
            <div>
              <h1 style={{ fontSize:'clamp(1.375rem,3vw,1.875rem)', fontWeight:900, color:DS.ink, letterSpacing:'-0.045em', margin:0, lineHeight:1.1 }}>
                Trouvez votre hébergement idéal
              </h1>
              <p style={{ fontSize:13, color:DS.muted, margin:'5px 0 0' }}>Villas, chalets, appartements, hôtels — toute la France</p>
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <button onClick={() => navigate('/register?role=patron&secteur=vacances')}
                style={{ padding:'9px 18px', background:DS.bgSoft, border:`1px solid ${DS.border}`, borderRadius:DS.r.full, fontSize:12.5, fontWeight:600, color:DS.ink, cursor:'pointer', transition:'all .15s', whiteSpace:'nowrap' }}
                onMouseEnter={e=>{ e.currentTarget.style.background=DS.bgMuted; e.currentTarget.style.borderColor=DS.ink; }}
                onMouseLeave={e=>{ e.currentTarget.style.background=DS.bgSoft; e.currentTarget.style.borderColor=DS.border; }}>
                🏠 Je suis hôte
              </button>
              <button onClick={() => navigate('/register?role=patron&secteur=hotel')}
                style={{ padding:'9px 18px', background:DS.accent, border:'none', borderRadius:DS.r.full, fontSize:12.5, fontWeight:700, color:'#fff', cursor:'pointer', transition:'background .15s', whiteSpace:'nowrap' }}
                onMouseEnter={e=>e.currentTarget.style.background=DS.accentHover}
                onMouseLeave={e=>e.currentTarget.style.background=DS.accent}>
                🏨 Je suis un hôtel
              </button>
            </div>
          </div>

          {/* ── Barre de recherche Airbnb ── */}
          <div style={{ position:'relative' }}>
            <div style={{ display:'flex', border:`1.5px solid ${DS.border}`, borderRadius:DS.r.full, background:DS.bg, boxShadow:DS.shadow.md, marginBottom:-1, overflow:'visible', transition:'box-shadow .2s' }}
              onFocusCapture={e=>e.currentTarget.style.boxShadow=DS.shadow.lg}
              onBlurCapture={e=>e.currentTarget.style.boxShadow=DS.shadow.md}>

              {/* Destination */}
              <div style={{ flex:1.5, display:'flex', flexDirection:'column', padding:'12px 22px', borderRight:`1px solid ${DS.border}` }}>
                <label style={{ fontSize:9, fontWeight:700, color:DS.muted, textTransform:'uppercase', letterSpacing:2, marginBottom:4 }}>Destination</label>
                <input value={recherche} onChange={e=>setRecherche(e.target.value)} placeholder="Antibes, Alpes, Paris…"
                  style={{ border:'none', outline:'none', fontSize:14, color:DS.ink, background:'none', fontFamily:DS.font, fontWeight:500 }} />
              </div>

              {/* Dates — clique ouvre le calendrier */}
              <div ref={calendarRef} style={{ flex:1.4, position:'relative' }}>
                <button onClick={() => { setShowCalendar(v => !v); setShowVoyageurs(false); }}
                  style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', padding:'12px 22px', background:showCalendar?DS.accentMuted:'none', border:'none', cursor:'pointer', textAlign:'left', fontFamily:DS.font, transition:'background .15s', borderRight:`1px solid ${DS.border}` }}>
                  <span style={{ fontSize:9, fontWeight:700, color:DS.muted, textTransform:'uppercase', letterSpacing:2, marginBottom:4 }}>Dates</span>
                  <span style={{ fontSize:14, color:datesLabel?DS.ink:DS.subtle, fontWeight:datesLabel?600:400 }}>
                    {datesLabel || 'Arrivée – Départ'}
                  </span>
                </button>

                {/* Popover calendrier */}
                {showCalendar && (
                  <div style={{ position:'absolute', top:'calc(100% + 14px)', left:'50%', transform:'translateX(-50%)', zIndex:500, width:'min(760px, 96vw)' }}>
                    <DateRangePicker
                      startDate={startDate} endDate={endDate}
                      onSelect={(s, e) => { setStartDate(s); setEndDate(e); }}
                      onClose={() => setShowCalendar(false)}
                    />
                  </div>
                )}
              </div>

              {/* Voyageurs */}
              <div ref={voyageursRef} style={{ flex:1.2, position:'relative' }}>
                <button onClick={() => { setShowVoyageurs(v => !v); setShowCalendar(false); }}
                  style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', padding:'12px 22px', background:showVoyageurs?DS.accentMuted:'none', border:'none', cursor:'pointer', textAlign:'left', fontFamily:DS.font, transition:'background .15s' }}>
                  <span style={{ fontSize:9, fontWeight:700, color:DS.muted, textTransform:'uppercase', letterSpacing:2, marginBottom:4 }}>Voyageurs</span>
                  <span style={{ fontSize:14, color:DS.ink, fontWeight:500 }}>{voyageursLabel}</span>
                </button>

                {showVoyageurs && (
                  <div style={{ position:'absolute', top:'calc(100% + 14px)', right:0, width:340, background:DS.bg, border:`1px solid ${DS.border}`, borderRadius:DS.r.xl, boxShadow:DS.shadow.xl, zIndex:400, padding:'16px 22px' }}>
                    <Counter label="Adultes"  sublabel="13 ans et plus"     value={voyageurs.adultes}  min={1} onDec={()=>setV('adultes', voyageurs.adultes-1)}  onInc={()=>setV('adultes', voyageurs.adultes+1)}  />
                    <Counter label="Enfants"  sublabel="De 2 à 12 ans"      value={voyageurs.enfants}         onDec={()=>setV('enfants', voyageurs.enfants-1)}  onInc={()=>setV('enfants', voyageurs.enfants+1)}  />
                    <Counter label="Bébés"    sublabel="Moins de 2 ans"     value={voyageurs.bebes}           onDec={()=>setV('bebes',   voyageurs.bebes-1)}    onInc={()=>setV('bebes',   voyageurs.bebes+1)}    />
                    <Counter label="Animaux"  sublabel="Chiens, chats…"     value={voyageurs.animaux}         onDec={()=>setV('animaux', voyageurs.animaux-1)} onInc={()=>setV('animaux', voyageurs.animaux+1)} />
                    <div style={{ paddingTop:12 }}>
                      <p style={{ fontSize:12, color:DS.muted, lineHeight:1.5, margin:'0 0 12px' }}>Les nourrissons ne comptent pas dans le nombre de voyageurs. Animaux : vérifiez auprès de l'hôte.</p>
                      <button onClick={() => setShowVoyageurs(false)}
                        style={{ width:'100%', padding:'10px', background:DS.ink, border:'none', borderRadius:DS.r.full, fontSize:13, fontWeight:700, color:'#fff', cursor:'pointer' }}>
                        Confirmer
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Bouton rechercher */}
              <button
                style={{ padding:'0 24px', background:DS.accent, border:'none', cursor:'pointer', color:'#fff', fontSize:13, fontWeight:700, transition:'background .15s', borderRadius:`0 ${DS.r.full}px ${DS.r.full}px 0`, flexShrink:0, display:'flex', alignItems:'center', gap:8 }}
                onMouseEnter={e=>e.currentTarget.style.background=DS.accentHover}
                onMouseLeave={e=>e.currentTarget.style.background=DS.accent}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div style={{ padding:'10px clamp(16px,4vw,48px)', borderBottom:`1px solid ${DS.border}`, display:'flex', alignItems:'center', gap:16, fontSize:12.5, color:DS.muted, flexWrap:'wrap' }}>
        <span style={{ color:DS.ink, fontWeight:600 }}>{filtered.length} logement{filtered.length>1?'s':''}</span>
        <span style={{ color:DS.border }}>·</span>
        <span>À partir de <strong style={{ color:DS.ink }}>{minPrice}€/nuit</strong></span>
        <span style={{ color:DS.border }}>·</span>
        <span style={{ display:'flex', alignItems:'center', gap:4 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={DS.green} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          Annulation gratuite
        </span>
        <span style={{ color:DS.border }}>·</span>
        <span style={{ display:'flex', alignItems:'center', gap:4 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={DS.green} strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          Paiement sécurisé
        </span>
      </div>

      {/* ── Grille propriétés ── */}
      <div style={{ padding:'clamp(24px,4vh,40px) clamp(16px,4vw,48px)', maxWidth:1200, margin:'0 auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding:'60px 40px', textAlign:'center' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:12 }}>🏠</div>
            <div style={{ fontWeight:600, color:DS.ink, marginBottom:6, fontSize:'1.0625rem' }}>Aucun logement trouvé</div>
            <div style={{ fontSize:'0.875rem', color:DS.muted, marginBottom:20 }}>Essayez d'autres dates ou une autre destination</div>
            <button onClick={() => { setType('Tout'); setRecherche(''); setStartDate(null); setEndDate(null); setVoyageurs(VOYAGEURS_INIT); }}
              style={{ background:'none', border:`1px solid ${DS.border}`, borderRadius:DS.r.full, padding:'9px 22px', color:DS.muted, cursor:'pointer', fontSize:'0.8125rem', fontFamily:DS.font }}>
              Réinitialiser la recherche
            </button>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:22 }}>
            {filtered.map(p => <PropertyCard key={p.id} prop={p} onClick={() => navigate(`/vacances/${p.id}`)} />)}
          </div>
        )}
      </div>
    </div>
  );
}
