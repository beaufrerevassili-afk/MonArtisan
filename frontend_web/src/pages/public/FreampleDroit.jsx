import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../../components/public/PublicNavbar';
import RecrutementBanner from '../../components/public/RecrutementBanner';
import { useFadeUp, useScaleIn, StaggerChildren } from '../../utils/scrollAnimations';
import { genererDocument } from '../../data/documentsJuridiques';

const L = {
  bg:'#FAFAF8', white:'#FFFFFF', noir:'#0A0A0A', cream:'#F5F2EC',
  text:'#1A1A1A', textSec:'#6B6B6B', textLight:'#A0A0A0',
  gold:'#C9A96E', goldLight:'#F5EFE0', goldDark:'#8B7240',
  border:'#E8E6E1', green:'#16A34A', greenBg:'#F0FDF4',
  blue:'#2563EB', blueBg:'#EFF6FF', red:'#DC2626',
  font:"'Inter',-apple-system,'Helvetica Neue',Arial,sans-serif",
  serif:"'Cormorant Garamond','Georgia',serif",
};

const DOMAINES = [
  { id:'immo', icon:'🏠', label:'Droit immobilier', desc:'Baux, copropriété, vices cachés, permis de construire, expulsions' },
  { id:'entreprise', icon:'🏢', label:'Droit des sociétés', desc:'Création SCI/SAS/SARL, statuts, pactes d\'associés, cession' },
  { id:'travail', icon:'👷', label:'Droit du travail', desc:'Contrats, licenciement, prud\'hommes, harcèlement, rupture conventionnelle' },
  { id:'famille', icon:'👨‍👩‍👧', label:'Droit de la famille', desc:'Divorce, garde, succession, donation, testament' },
  { id:'fiscal', icon:'💰', label:'Droit fiscal', desc:'Optimisation, contrôle fiscal, redressement, TVA, impôt sur les sociétés' },
  { id:'commercial', icon:'📋', label:'Droit commercial', desc:'CGV, litiges fournisseurs, recouvrement de créances, concurrence' },
];

const DOCUMENTS = [
  { id:'statuts_sci', icon:'🏛️', label:'Statuts de SCI', cat:'Société', temps:'10 min', prix:'Gratuit', desc:'Statuts complets conformes, clause d\'agrément, objet social, apports.', lien:'/immo' },
  { id:'statuts_sas', icon:'🏢', label:'Statuts de SAS/SASU', cat:'Société', temps:'15 min', prix:'Gratuit', desc:'Statuts avec répartition des pouvoirs, clauses personnalisables.' },
  { id:'bail_habitation', icon:'📝', label:'Bail d\'habitation', cat:'Immobilier', temps:'8 min', prix:'Gratuit', desc:'Bail conforme loi ELAN/ALUR, meublé ou vide, clauses obligatoires.', lien:'/immo' },
  { id:'bail_commercial', icon:'🏪', label:'Bail commercial', cat:'Immobilier', temps:'12 min', prix:'Gratuit', desc:'Bail 3-6-9, clauses de révision, destination, cession.' },
  { id:'contrat_travail', icon:'👷', label:'Contrat de travail', cat:'RH', temps:'10 min', prix:'Gratuit', desc:'CDI, CDD, temps partiel. Clauses de non-concurrence, période d\'essai.' },
  { id:'cgv', icon:'📋', label:'CGV / CGU', cat:'Commercial', temps:'8 min', prix:'Gratuit', desc:'Conditions générales de vente ou d\'utilisation conformes RGPD.' },
  { id:'mise_demeure', icon:'⚠️', label:'Mise en demeure', cat:'Contentieux', temps:'3 min', prix:'Gratuit', desc:'Lettre de relance formelle avant procédure judiciaire.', lien:'/immo' },
  { id:'pv_ag', icon:'📊', label:'PV d\'Assemblée Générale', cat:'Société', temps:'5 min', prix:'Gratuit', desc:'PV d\'AG ordinaire ou extraordinaire, résolutions, votes.' },
  { id:'rupture_conv', icon:'🤝', label:'Rupture conventionnelle', cat:'RH', temps:'8 min', prix:'Gratuit', desc:'Convention de rupture, indemnités, formulaire Cerfa.' },
  { id:'donation', icon:'🎁', label:'Acte de donation', cat:'Famille', temps:'10 min', prix:'Gratuit', desc:'Donation de parts sociales, immobilière, avec ou sans réserve d\'usufruit.' },
  { id:'cession_parts', icon:'🔄', label:'Cession de parts', cat:'Société', temps:'10 min', prix:'Gratuit', desc:'Acte de cession, agrément, enregistrement, fiscalité.' },
  { id:'nda', icon:'🔒', label:'Accord de confidentialité', cat:'Commercial', temps:'5 min', prix:'Gratuit', desc:'NDA bilatéral ou unilatéral, périmètre, durée, sanctions.' },
];

const AVOCATS = [
  { id:1, nom:'Me Sophie Durand', specialite:'Droit immobilier', ville:'Nice', note:4.9, avis:127, prix:150, dispo:'Disponible', photo:null },
  { id:2, nom:'Me Marc Lefèvre', specialite:'Droit des sociétés', ville:'Paris', note:4.8, avis:89, prix:200, dispo:'Disponible', photo:null },
  { id:3, nom:'Me Karine Benali', specialite:'Droit du travail', ville:'Lyon', note:4.7, avis:156, prix:120, dispo:'RDV sous 48h', photo:null },
  { id:4, nom:'Me Jean-Pierre Martin', specialite:'Droit fiscal', ville:'Paris', note:5.0, avis:64, prix:250, dispo:'Disponible', photo:null },
  { id:5, nom:'Me Alice Moreau', specialite:'Droit de la famille', ville:'Marseille', note:4.6, avis:203, prix:130, dispo:'RDV sous 48h', photo:null },
  { id:6, nom:'Me Thomas Roche', specialite:'Droit commercial', ville:'Bordeaux', note:4.8, avis:78, prix:180, dispo:'Disponible', photo:null },
];

export default function FreampleDroit() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('accueil');
  const [docFilter, setDocFilter] = useState('Tous');
  const [avocatFilter, setAvocatFilter] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedAvocat, setSelectedAvocat] = useState(null);
  const [docForm, setDocForm] = useState({});
  const [docGenere, setDocGenere] = useState(null);
  const s1=useScaleIn(),s2=useScaleIn(0.15),s3=useScaleIn(0.15);
  const r1=useFadeUp(),r2=useFadeUp(0.1);

  const docCats = ['Tous',...new Set(DOCUMENTS.map(d=>d.cat))];
  const filteredDocs = docFilter==='Tous' ? DOCUMENTS : DOCUMENTS.filter(d=>d.cat===docFilter);
  const filteredAvocats = avocatFilter ? AVOCATS.filter(a=>a.specialite.toLowerCase().includes(avocatFilter.toLowerCase())||a.ville.toLowerCase().includes(avocatFilter.toLowerCase())) : AVOCATS;

  return (
    <div style={{ minHeight:'100vh', background:L.bg, fontFamily:L.font, color:L.text }}>
      <RecrutementBanner />
      <PublicNavbar />

      {/* Sous-nav Apple */}
      <div style={{ position:'sticky', top:58, zIndex:190, background:'rgba(255,255,255,0.95)', backdropFilter:'blur(20px)', borderBottom:`1px solid ${L.border}`, display:'flex', justifyContent:'center', gap:0, padding:'0 24px' }}>
        {[
          { id:'accueil', label:'Freample Droit' },
          { id:'documents', label:'Générateur de documents' },
          { id:'avocats', label:'Trouver un avocat' },
        ].map(item => (
          <button key={item.id} onClick={()=>setTab(item.id)}
            style={{ padding:'12px 24px', background:'none', border:'none', borderBottom:`2px solid ${tab===item.id?L.noir:'transparent'}`, fontSize:13, fontWeight:tab===item.id?700:400, color:tab===item.id?L.text:L.textSec, cursor:'pointer', fontFamily:L.font, transition:'all .15s' }}
            onMouseEnter={e=>{if(tab!==item.id)e.currentTarget.style.color=L.text;}}
            onMouseLeave={e=>{if(tab!==item.id)e.currentTarget.style.color=L.textSec;}}>
            {item.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════
          ACCUEIL
         ═══════════════════════════════════════════ */}
      {tab==='accueil' && <>
        {/* Hero */}
        <section style={{ background:L.noir, padding:'clamp(80px,14vh,130px) 32px clamp(60px,10vh,100px)', textAlign:'center', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', inset:0, backgroundImage:'url(https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1600&q=80)', backgroundSize:'cover', backgroundPosition:'center', opacity:0.18 }} />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.92) 100%)' }} />
          <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:48, height:1, background:L.gold }} />
          <div style={{ maxWidth:700, margin:'0 auto', position:'relative', zIndex:1 }}>
            <div ref={s1}>
              <div style={{ display:'inline-flex', padding:'6px 18px', background:'rgba(201,169,110,0.12)', border:`1px solid ${L.gold}40`, fontSize:11, fontWeight:600, color:L.gold, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:20 }}>En cours de développement</div>
              <h1 style={{ fontFamily:L.serif, fontSize:'clamp(36px,7vw,68px)', fontWeight:300, fontStyle:'italic', color:'#fff', lineHeight:1.02, letterSpacing:'-0.02em', margin:'0 0 16px' }}>
                Le droit, <span style={{ fontWeight:700, fontStyle:'normal' }}>simplifié</span>
              </h1>
            </div>
            <p ref={r1} style={{ fontSize:16, color:'rgba(255,255,255,0.4)', lineHeight:1.6, margin:'0 auto 36px', maxWidth:480, fontWeight:300 }}>
              Générez vos documents juridiques en ligne. Consultez un avocat en visio. Protégez votre entreprise et votre patrimoine.
            </p>
            <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={()=>setTab('documents')} style={{ padding:'16px 40px', background:L.white, color:L.noir, border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.06em', textTransform:'uppercase', transition:'all .3s' }}
                onMouseEnter={e=>{e.currentTarget.style.background=L.gold;e.currentTarget.style.color='#fff';}} onMouseLeave={e=>{e.currentTarget.style.background=L.white;e.currentTarget.style.color=L.noir;}}>
                Créer un document
              </button>
              <button onClick={()=>setTab('avocats')} style={{ padding:'16px 32px', background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.2)', fontSize:13, fontWeight:400, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.06em', textTransform:'uppercase', transition:'all .3s' }}
                onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.5)'} onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'}>
                Consulter un avocat
              </button>
            </div>
          </div>
        </section>

        {/* Domaines */}
        <section style={{ padding:'clamp(56px,8vh,88px) 32px', maxWidth:1000, margin:'0 auto' }}>
          <div ref={s2} style={{ textAlign:'center', marginBottom:48 }}>
            <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:12 }}>Domaines</div>
            <h2 style={{ fontFamily:L.serif, fontSize:'clamp(26px,4vw,42px)', fontWeight:300, fontStyle:'italic', margin:0 }}>
              Tous les domaines du <span style={{ fontWeight:700, fontStyle:'normal' }}>droit</span>
            </h2>
          </div>
          <StaggerChildren style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:1, background:L.border }}>
            {DOMAINES.map(d => (
              <div key={d.id} onClick={()=>{setAvocatFilter(d.label.split(' ').pop());setTab('avocats');}}
                style={{ background:L.white, padding:'32px 24px', cursor:'pointer', transition:'background .2s' }}
                onMouseEnter={e=>e.currentTarget.style.background=L.cream} onMouseLeave={e=>e.currentTarget.style.background=L.white}>
                <div style={{ fontSize:28, marginBottom:14 }}>{d.icon}</div>
                <h3 style={{ fontSize:15, fontWeight:700, color:L.text, marginBottom:6 }}>{d.label}</h3>
                <p style={{ fontSize:13, color:L.textSec, lineHeight:1.6, margin:0 }}>{d.desc}</p>
              </div>
            ))}
          </StaggerChildren>
        </section>

        {/* Comment ça marche */}
        <section style={{ background:L.white, borderTop:`1px solid ${L.border}`, padding:'clamp(56px,8vh,88px) 32px' }}>
          <div ref={s3} style={{ maxWidth:800, margin:'0 auto', textAlign:'center' }}>
            <h2 style={{ fontFamily:L.serif, fontSize:'clamp(24px,3.5vw,36px)', fontWeight:300, fontStyle:'italic', margin:'0 0 40px' }}>
              Simple, rapide, <span style={{ fontWeight:700, fontStyle:'normal' }}>fiable</span>
            </h2>
            <StaggerChildren style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:32 }}>
              {[
                { step:'1', icon:'📝', title:'Choisissez', desc:'Sélectionnez le document ou le domaine juridique qui vous concerne.' },
                { step:'2', icon:'✍️', title:'Répondez', desc:'Remplissez un questionnaire simple. Pas de jargon, que des questions claires.' },
                { step:'3', icon:'📄', title:'Obtenez', desc:'Votre document est généré instantanément, conforme et prêt à signer.' },
                { step:'4', icon:'⚖️', title:'Consultez', desc:'Besoin d\'un avis ? Un avocat spécialisé vous répond sous 48h.' },
              ].map(s => (
                <div key={s.step}>
                  <div style={{ width:48, height:48, margin:'0 auto 14px', background:L.cream, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{s.icon}</div>
                  <div style={{ fontSize:11, fontWeight:700, color:L.gold, marginBottom:6, letterSpacing:'0.1em' }}>ÉTAPE {s.step}</div>
                  <h3 style={{ fontSize:15, fontWeight:700, margin:'0 0 6px' }}>{s.title}</h3>
                  <p style={{ fontSize:13, color:L.textSec, lineHeight:1.55, margin:0 }}>{s.desc}</p>
                </div>
              ))}
            </StaggerChildren>
          </div>
        </section>

        {/* Lien écosystème */}
        <section style={{ background:L.noir, padding:'clamp(56px,8vh,80px) 32px', textAlign:'center' }}>
          <div style={{ maxWidth:600, margin:'0 auto' }}>
            <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.25em', marginBottom:14 }}>Écosystème Freample</div>
            <h2 style={{ fontFamily:L.serif, fontSize:'clamp(22px,3.5vw,32px)', fontWeight:300, fontStyle:'italic', color:'#fff', margin:'0 0 12px' }}>
              Connecté à vos <span style={{ fontWeight:700, fontStyle:'normal' }}>autres services</span>
            </h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.4)', lineHeight:1.6, marginBottom:28 }}>
              Impayé sur Freample Immo → mise en demeure auto. Création de SCI → statuts générés. Litige artisan → avocat spécialisé.
            </p>
            <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap' }}>
              <button onClick={()=>navigate('/immo')} style={{ padding:'10px 24px', background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', fontSize:12, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase' }}>Freample Immo</button>
              <button onClick={()=>navigate('/btp')} style={{ padding:'10px 24px', background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', fontSize:12, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase' }}>Freample Artisans</button>
              <button onClick={()=>navigate('/com')} style={{ padding:'10px 24px', background:'transparent', color:'#fff', border:'1px solid rgba(255,255,255,0.15)', fontSize:12, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase' }}>Freample Com</button>
            </div>
          </div>
        </section>
      </>}

      {/* ═══════════════════════════════════════════
          GÉNÉRATEUR DE DOCUMENTS
         ═══════════════════════════════════════════ */}
      {tab==='documents' && <>
        <section style={{ maxWidth:1000, margin:'0 auto', padding:'clamp(28px,4vh,48px) clamp(20px,3vw,40px)' }}>
          <div style={{ textAlign:'center', marginBottom:24 }}>
            <h2 style={{ fontFamily:L.serif, fontSize:'clamp(24px,3.5vw,36px)', fontWeight:300, fontStyle:'italic', margin:'0 0 8px' }}>
              Générer un <span style={{ fontWeight:700, fontStyle:'normal' }}>document juridique</span>
            </h2>
            <p style={{ fontSize:14, color:L.textSec }}>Répondez à quelques questions, obtenez votre document conforme instantanément.</p>
          </div>

          {/* Filtres catégories */}
          <div style={{ display:'flex', gap:6, justifyContent:'center', marginBottom:24, flexWrap:'wrap' }}>
            {docCats.map(c=>(
              <button key={c} onClick={()=>setDocFilter(c)}
                style={{ padding:'7px 18px', border:`1px solid ${docFilter===c?L.noir:L.border}`, background:docFilter===c?L.noir:'transparent', color:docFilter===c?'#fff':L.textSec, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, transition:'all .15s' }}>
                {c}
              </button>
            ))}
          </div>

          {/* Grille documents */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:12 }}>
            {filteredDocs.map(d=>(
              <div key={d.id} onClick={()=>setSelectedDoc(d)}
                style={{ background:L.white, border:`1px solid ${L.border}`, padding:'20px', cursor:'pointer', transition:'all .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=L.gold;e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.04)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=L.border;e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none';}}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <span style={{ fontSize:28 }}>{d.icon}</span>
                  <div style={{ display:'flex', gap:4 }}>
                    <span style={{ fontSize:10, fontWeight:600, color:L.green, background:L.greenBg, padding:'2px 8px' }}>{d.prix}</span>
                    <span style={{ fontSize:10, fontWeight:600, color:L.blue, background:L.blueBg, padding:'2px 8px' }}>{d.temps}</span>
                  </div>
                </div>
                <h3 style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>{d.label}</h3>
                <div style={{ fontSize:11, color:L.gold, fontWeight:600, marginBottom:6 }}>{d.cat}</div>
                <p style={{ fontSize:12, color:L.textSec, lineHeight:1.5, margin:0 }}>{d.desc}</p>
                <div style={{ marginTop:10, fontSize:12, fontWeight:600, color:L.gold }}>Générer →</div>
              </div>
            ))}
          </div>
        </section>
      </>}

      {/* ═══════════════════════════════════════════
          TROUVER UN AVOCAT
         ═══════════════════════════════════════════ */}
      {tab==='avocats' && <>
        <section style={{ maxWidth:900, margin:'0 auto', padding:'clamp(28px,4vh,48px) clamp(20px,3vw,40px)' }}>
          <div style={{ textAlign:'center', marginBottom:24 }}>
            <h2 style={{ fontFamily:L.serif, fontSize:'clamp(24px,3.5vw,36px)', fontWeight:300, fontStyle:'italic', margin:'0 0 8px' }}>
              Consulter un <span style={{ fontWeight:700, fontStyle:'normal' }}>avocat</span>
            </h2>
            <p style={{ fontSize:14, color:L.textSec }}>Consultation en visio ou en cabinet. Réponse sous 48h.</p>
          </div>

          {/* Recherche */}
          <div style={{ display:'flex', gap:8, marginBottom:24, maxWidth:500, margin:'0 auto 24px' }}>
            <input value={avocatFilter} onChange={e=>setAvocatFilter(e.target.value)} placeholder="Spécialité, ville..." style={{ flex:1, padding:'12px 16px', border:`1px solid ${L.border}`, fontSize:14, fontFamily:L.font, outline:'none', background:L.white }} />
            {avocatFilter && <button onClick={()=>setAvocatFilter('')} style={{ padding:'0 14px', background:'none', border:`1px solid ${L.border}`, cursor:'pointer', color:L.textSec, fontFamily:L.font }}>✕</button>}
          </div>

          {/* Liste avocats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:12 }}>
            {filteredAvocats.map(a=>(
              <div key={a.id} onClick={()=>setSelectedAvocat(a)}
                style={{ background:L.white, border:`1px solid ${L.border}`, padding:'20px', cursor:'pointer', transition:'all .2s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=L.gold;e.currentTarget.style.transform='translateY(-2px)';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=L.border;e.currentTarget.style.transform='none';}}>
                <div style={{ display:'flex', gap:14, marginBottom:12 }}>
                  <div style={{ width:48, height:48, background:L.cream, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:800, color:L.goldDark, flexShrink:0 }}>
                    {a.nom.split(' ').pop()[0]}
                  </div>
                  <div>
                    <div style={{ fontSize:14, fontWeight:700 }}>{a.nom}</div>
                    <div style={{ fontSize:12, color:L.gold, fontWeight:600 }}>{a.specialite}</div>
                    <div style={{ fontSize:11, color:L.textSec }}>📍 {a.ville}</div>
                  </div>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                    <span style={{ color:'#F59E0B' }}>★</span>
                    <span style={{ fontWeight:700 }}>{a.note}</span>
                    <span style={{ color:L.textLight }}>({a.avis} avis)</span>
                  </div>
                  <span style={{ fontWeight:700, color:L.gold }}>{a.prix}€<span style={{ fontWeight:400, color:L.textLight }}>/consult.</span></span>
                </div>
                <div style={{ marginTop:8, fontSize:11, fontWeight:600, color:a.dispo==='Disponible'?L.green:L.blue }}>{a.dispo}</div>
              </div>
            ))}
          </div>
          {filteredAvocats.length===0 && <div style={{ textAlign:'center', padding:40, color:L.textLight }}>Aucun avocat trouvé — modifiez votre recherche</div>}
        </section>
      </>}

      {/* Footer */}
      <footer style={{ padding:'28px 32px', textAlign:'center', borderTop:`1px solid ${L.border}` }}>
        <nav style={{ display:'flex', justifyContent:'center', gap:24, marginBottom:14, flexWrap:'wrap' }}>
          {[{label:'Accueil',href:'/'},{label:'Freample Immo',href:'/immo'},{label:'Freample Artisans',href:'/btp'},{label:'Freample Com',href:'/com'}].map(l=>(
            <a key={l.label} href={l.href} style={{ fontSize:12, color:L.textSec, textDecoration:'none', transition:'color .15s' }} onMouseEnter={e=>e.currentTarget.style.color=L.gold} onMouseLeave={e=>e.currentTarget.style.color=L.textSec}>{l.label}</a>
          ))}
        </nav>
        <p style={{ fontSize:11, color:L.textLight, letterSpacing:'0.08em', textTransform:'uppercase', margin:0 }}>© 2026 Freample Droit</p>
      </footer>

      {/* ═══ MODAL DOCUMENT ═══ */}
      {selectedDoc && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={()=>{setSelectedDoc(null);setDocForm({});setDocGenere(null);}}>
          <div style={{ background:L.white, width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto', padding:'28px 24px' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:600, color:L.gold, textTransform:'uppercase', letterSpacing:'0.15em', marginBottom:6 }}>Générateur</div>
                <h3 style={{ fontSize:18, fontWeight:800, margin:0 }}>{selectedDoc.icon} {selectedDoc.label}</h3>
              </div>
              <button onClick={()=>{setSelectedDoc(null);setDocForm({});setDocGenere(null);}} style={{ background:'none', border:`1px solid ${L.border}`, width:32, height:32, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:14, color:L.textLight }}>✕</button>
            </div>

            <p style={{ fontSize:13, color:L.textSec, marginBottom:16, lineHeight:1.5 }}>{selectedDoc.desc}</p>

            {/* Questionnaire dynamique */}
            <div style={{ fontSize:12, fontWeight:700, color:L.gold, textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Remplissez le questionnaire</div>
            {selectedDoc.cat==='Société' && <>
              <div style={{ marginBottom:10 }}><label style={{ fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4 }}>Dénomination sociale</label><input value={docForm.denomination||''} onChange={e=>setDocForm(f=>({...f,denomination:e.target.value}))} style={{ width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box' }} placeholder="Ex: SCI Riviera" /></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                <div><label style={{ fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4 }}>Forme juridique</label><select value={docForm.forme||''} onChange={e=>setDocForm(f=>({...f,forme:e.target.value}))} style={{ width:'100%', padding:'10px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box' }}><option value="">Choisir</option><option>SCI</option><option>SAS</option><option>SASU</option><option>SARL</option><option>EURL</option></select></div>
                <div><label style={{ fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4 }}>Capital social (€)</label><input type="number" value={docForm.capital||''} onChange={e=>setDocForm(f=>({...f,capital:e.target.value}))} style={{ width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box' }} /></div>
              </div>
              <div style={{ marginBottom:10 }}><label style={{ fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4 }}>Siège social</label><input value={docForm.siege||''} onChange={e=>setDocForm(f=>({...f,siege:e.target.value}))} style={{ width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box' }} placeholder="Adresse complète" /></div>
              <div style={{ marginBottom:10 }}><label style={{ fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4 }}>Objet social</label><textarea value={docForm.objet||''} onChange={e=>setDocForm(f=>({...f,objet:e.target.value}))} rows={2} style={{ width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box', resize:'vertical' }} placeholder="Acquisition, gestion, administration..." /></div>
              <div style={{ marginBottom:10 }}><label style={{ fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4 }}>Gérant(s)</label><input value={docForm.gerant||''} onChange={e=>setDocForm(f=>({...f,gerant:e.target.value}))} style={{ width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box' }} placeholder="Nom du gérant" /></div>
            </>}
            {selectedDoc.cat==='Immobilier' && <>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                <div><label style={{ fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4 }}>Nom du bailleur</label><input value={docForm.bailleur||''} onChange={e=>setDocForm(f=>({...f,bailleur:e.target.value}))} style={{ width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box' }} /></div>
                <div><label style={{ fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4 }}>Nom du locataire</label><input value={docForm.locataire||''} onChange={e=>setDocForm(f=>({...f,locataire:e.target.value}))} style={{ width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box' }} /></div>
              </div>
              <div style={{ marginBottom:10 }}><label style={{ fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4 }}>Adresse du bien</label><input value={docForm.adresse||''} onChange={e=>setDocForm(f=>({...f,adresse:e.target.value}))} style={{ width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box' }} /></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:10 }}>
                <div><label style={{ fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4 }}>Loyer (€)</label><input type="number" value={docForm.loyer||''} onChange={e=>setDocForm(f=>({...f,loyer:e.target.value}))} style={{ width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box' }} /></div>
                <div><label style={{ fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4 }}>Charges (€)</label><input type="number" value={docForm.charges||''} onChange={e=>setDocForm(f=>({...f,charges:e.target.value}))} style={{ width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box' }} /></div>
                <div><label style={{ fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4 }}>Dépôt (€)</label><input type="number" value={docForm.depot||''} onChange={e=>setDocForm(f=>({...f,depot:e.target.value}))} style={{ width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box' }} /></div>
              </div>
            </>}
            {(selectedDoc.cat==='RH'||selectedDoc.cat==='Commercial'||selectedDoc.cat==='Contentieux'||selectedDoc.cat==='Famille') && <>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                <div><label style={{ fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4 }}>Partie 1 (vous)</label><input value={docForm.partie1||''} onChange={e=>setDocForm(f=>({...f,partie1:e.target.value}))} style={{ width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box' }} placeholder="Nom / Société" /></div>
                <div><label style={{ fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4 }}>Partie 2</label><input value={docForm.partie2||''} onChange={e=>setDocForm(f=>({...f,partie2:e.target.value}))} style={{ width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box' }} placeholder="Nom / Société" /></div>
              </div>
              <div style={{ marginBottom:10 }}><label style={{ fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4 }}>Détails / contexte</label><textarea value={docForm.details||''} onChange={e=>setDocForm(f=>({...f,details:e.target.value}))} rows={3} style={{ width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box', resize:'vertical' }} placeholder="Décrivez votre situation..." /></div>
            </>}

            {!docGenere ? (
              <div style={{ display:'flex', gap:8, marginTop:16 }}>
                <button onClick={()=>{
                  const texte = genererDocument(selectedDoc.id, docForm);
                  setDocGenere(texte);
                }} style={{ flex:1, padding:'14px', background:L.noir, color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase', transition:'background .2s' }}
                  onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>
                  Générer le document
                </button>
                {selectedDoc.lien && <button onClick={()=>navigate(selectedDoc.lien)} style={{ padding:'14px 20px', background:'transparent', color:L.text, border:`1px solid ${L.border}`, fontSize:12, cursor:'pointer', fontFamily:L.font }}>
                  Vers {selectedDoc.lien==='/immo'?'Immo':'Artisans'}
                </button>}
              </div>
            ) : (
              <>
                <div style={{ fontSize:12, fontWeight:700, color:L.green, textTransform:'uppercase', letterSpacing:'0.06em', marginTop:16, marginBottom:8 }}>✓ Document généré</div>
                <textarea value={docGenere} onChange={e=>setDocGenere(e.target.value)}
                  style={{ width:'100%', minHeight:300, padding:'16px', border:`1px solid ${L.border}`, fontSize:12, fontFamily:'monospace', lineHeight:1.7, color:L.text, background:L.cream, outline:'none', boxSizing:'border-box', resize:'vertical' }} />
                <div style={{ fontSize:11, color:L.textLight, marginTop:6, marginBottom:12 }}>Vous pouvez modifier le texte directement ci-dessus avant d'imprimer.</div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>window.print()} style={{ flex:1, padding:'12px', background:L.noir, color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase', transition:'background .2s' }}
                    onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>
                    🖨️ Imprimer / PDF
                  </button>
                  <button onClick={()=>{
                    const blob = new Blob([docGenere], {type:'text/plain'});
                    const a = document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`${selectedDoc.label.replace(/\s/g,'_')}_${new Date().toISOString().slice(0,10)}.txt`; a.click();
                    showToast('Document téléchargé');
                  }} style={{ padding:'12px 20px', background:'transparent', color:L.text, border:`1px solid ${L.border}`, fontSize:12, fontWeight:500, cursor:'pointer', fontFamily:L.font }}>
                    📥 Télécharger .txt
                  </button>
                  <button onClick={()=>setDocGenere(null)} style={{ padding:'12px 16px', background:'transparent', color:L.textSec, border:`1px solid ${L.border}`, fontSize:12, cursor:'pointer', fontFamily:L.font }}>
                    ← Modifier les données
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══ MODAL AVOCAT ═══ */}
      {selectedAvocat && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={()=>setSelectedAvocat(null)}>
          <div style={{ background:L.white, width:'100%', maxWidth:480, maxHeight:'90vh', overflowY:'auto', padding:'28px 24px' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', gap:16, marginBottom:20 }}>
              <div style={{ width:64, height:64, background:L.cream, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:800, color:L.goldDark, flexShrink:0 }}>
                {selectedAvocat.nom.split(' ').pop()[0]}
              </div>
              <div>
                <h3 style={{ fontSize:18, fontWeight:800, margin:'0 0 4px' }}>{selectedAvocat.nom}</h3>
                <div style={{ fontSize:13, color:L.gold, fontWeight:600 }}>{selectedAvocat.specialite}</div>
                <div style={{ fontSize:12, color:L.textSec }}>📍 {selectedAvocat.ville} · {selectedAvocat.dispo}</div>
                <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:4, fontSize:12 }}>
                  <span style={{ color:'#F59E0B' }}>★</span> <span style={{ fontWeight:700 }}>{selectedAvocat.note}</span> <span style={{ color:L.textLight }}>({selectedAvocat.avis} avis)</span>
                </div>
              </div>
            </div>

            <div style={{ display:'flex', gap:0, border:`1px solid ${L.border}`, marginBottom:20 }}>
              {[{l:'Consultation',v:`${selectedAvocat.prix}€`},{l:'Durée',v:'30 min'},{l:'Mode',v:'Visio / Cabinet'}].map((item,i,arr)=>(
                <div key={item.l} style={{ flex:1, padding:'12px', textAlign:'center', borderRight:i<arr.length-1?`1px solid ${L.border}`:'none' }}>
                  <div style={{ fontSize:10, color:L.textLight, textTransform:'uppercase', marginBottom:4 }}>{item.l}</div>
                  <div style={{ fontSize:14, fontWeight:700 }}>{item.v}</div>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>{showToast('Demande de RDV envoyée — réponse sous 48h');setSelectedAvocat(null);}}
                style={{ flex:1, padding:'14px', background:L.noir, color:'#fff', border:'none', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.04em', textTransform:'uppercase', transition:'background .2s' }}
                onMouseEnter={e=>e.currentTarget.style.background=L.gold} onMouseLeave={e=>e.currentTarget.style.background=L.noir}>
                Prendre RDV
              </button>
              <a href={`https://wa.me/33769387193?text=Bonjour, je souhaite consulter ${selectedAvocat.nom} en ${selectedAvocat.specialite}`} target="_blank" rel="noopener noreferrer"
                style={{ padding:'14px 20px', background:'transparent', color:L.text, border:`1px solid ${L.border}`, fontSize:12, cursor:'pointer', fontFamily:L.font, textDecoration:'none', display:'flex', alignItems:'center' }}>
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function showToast(msg) { /* utiliser un state toast si besoin */ alert(msg); }
}
