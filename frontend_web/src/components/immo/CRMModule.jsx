import React, { useState } from 'react';
import L from '../../design/luxe';

const BTN = { padding:'8px 18px', background:L.noir, color:'#fff', border:'none', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:L.font, letterSpacing:'0.03em', transition:'background .15s' };
const BTN_OUTLINE = { ...BTN, background:'transparent', color:L.text, border:`1px solid ${L.border}` };
const INP = { width:'100%', padding:'10px 12px', border:`1px solid ${L.border}`, fontSize:13, fontFamily:L.font, outline:'none', boxSizing:'border-box', background:L.white };
const LBL = { fontSize:11, fontWeight:600, color:L.textSec, display:'block', marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' };
const CARD = { background:L.white, border:`1px solid ${L.border}`, padding:'20px' };

const TYPES_CONTACT = ['prospect','client','vendeur','notaire','banquier','courtier','artisan','syndic'];
const SOURCES = ['prospection','pige','recommandation','site','portail','autre'];
const TYPES_INTERACTION = ['appel','email','sms','visite','estimation','mandat','note'];

const DEFAULT_CONTACTS = [
  { id:101, nom:'Durand', prenom:'Marie', email:'marie.durand@gmail.com', tel:'0612345678', type:'prospect', adresse:'12 rue de la Paix, Nice', tags:['investisseur','SCI'], notes:'Cherche T3 centre-ville', dateCreation:'2026-01-15', derniereInteraction:'2026-04-01', consentement:{email:true,sms:true,tel:true}, anniversaire:'1985-06-15', source:'prospection', interactions:[{id:1,date:'2026-04-01',type:'appel',note:'Intéressée par estimation Gambetta',duree:12},{id:2,date:'2026-03-20',type:'email',note:'Envoi dossier investissement',duree:0}], score:78 },
  { id:102, nom:'Martin', prenom:'Philippe', email:'p.martin@orange.fr', tel:'0698765432', type:'vendeur', adresse:'8 av Jean Médecin, Nice', tags:['urgent','succession'], notes:'Vend appartement succession', dateCreation:'2026-02-10', derniereInteraction:'2026-04-03', consentement:{email:true,sms:false,tel:true}, anniversaire:'1972-11-22', source:'pige', interactions:[{id:3,date:'2026-04-03',type:'visite',note:'Visite bien 45m² Médecin',duree:45},{id:4,date:'2026-03-15',type:'estimation',note:'Estimation réalisée: 195-210k€',duree:0}], score:92 },
  { id:103, nom:'Lefebvre', prenom:'Sophie', email:'sophie.lefebvre@outlook.com', tel:'0645678901', type:'client', adresse:'24 bd Gambetta, Paris 20e', tags:['primo-accédant'], notes:'Budget 250-300k, cherche 2P Paris Est', dateCreation:'2025-11-05', derniereInteraction:'2026-03-28', consentement:{email:true,sms:true,tel:false}, anniversaire:'1990-03-08', source:'site', interactions:[{id:5,date:'2026-03-28',type:'visite',note:'Visite T2 Ménilmontant - pas convaincu',duree:30}], score:65 },
  { id:104, nom:'Moreau', prenom:'Jean-Pierre', email:'jpmoreau@notaire.fr', tel:'0156789012', type:'notaire', adresse:'15 rue du Quatre Septembre, Paris 2e', tags:['partenaire'], notes:'Notaire associé, étude Moreau & Fils', dateCreation:'2025-06-20', derniereInteraction:'2026-04-02', consentement:{email:true,sms:false,tel:true}, anniversaire:'1968-09-30', source:'recommandation', interactions:[{id:6,date:'2026-04-02',type:'email',note:'Envoi dossier compromis Voltaire',duree:0}], score:95 },
  { id:105, nom:'Benali', prenom:'Karim', email:'k.benali@creditmutuel.fr', tel:'0678901234', type:'banquier', adresse:'Crédit Mutuel, 45 av de la République, Nice', tags:['financement','partenaire'], notes:'Conseiller pro, bon taux', dateCreation:'2025-09-12', derniereInteraction:'2026-03-25', consentement:{email:true,sms:true,tel:true}, anniversaire:'1982-01-17', source:'recommandation', interactions:[{id:7,date:'2026-03-25',type:'appel',note:'Simulation prêt client Lefebvre',duree:20}], score:88 },
  { id:106, nom:'Petit', prenom:'Catherine', email:'catherine.petit@free.fr', tel:'0634567890', type:'prospect', adresse:'3 rue Rossini, Nice', tags:['vendeur potentiel'], notes:'Propriétaire T4 Rossini, pas pressée', dateCreation:'2026-03-01', derniereInteraction:'2026-03-15', consentement:{email:true,sms:false,tel:true}, anniversaire:'1975-12-03', source:'prospection', interactions:[{id:8,date:'2026-03-15',type:'appel',note:'Rappeler dans 1 mois',duree:8}], score:42 },
  { id:107, nom:'Garcia', prenom:'Lucas', email:'lucas.garcia@gmail.com', tel:'0623456789', type:'client', adresse:'7 rue Lepic, Paris 18e', tags:['investisseur','LMNP'], notes:'Investisseur LMNP, cherche studio Paris', dateCreation:'2025-08-15', derniereInteraction:'2026-04-04', consentement:{email:true,sms:true,tel:true}, anniversaire:'1988-07-21', source:'portail', interactions:[{id:9,date:'2026-04-04',type:'visite',note:'Visite studio Montmartre OK',duree:25},{id:10,date:'2026-04-01',type:'email',note:'Envoi 3 biens correspondants',duree:0}], score:85 },
  { id:108, nom:'Roux', prenom:'Isabelle', email:'i.roux@syndic-roux.fr', tel:'0145678901', type:'syndic', adresse:'Syndic Roux, 22 rue de Rivoli, Paris 4e', tags:['copropriété'], notes:'Syndic immeuble Voltaire + Faubourg', dateCreation:'2025-10-01', derniereInteraction:'2026-02-28', consentement:{email:true,sms:false,tel:true}, anniversaire:null, source:'autre', interactions:[{id:11,date:'2026-02-28',type:'email',note:'Demande PV dernière AG',duree:0}], score:70 },
  { id:109, nom:'Dubois', prenom:'Antoine', email:'a.dubois@courtage.fr', tel:'0667890123', type:'courtier', adresse:'MonCourtier.fr, 5 place Masséna, Nice', tags:['partenaire','financement'], notes:'Courtier indépendant, taux compétitifs', dateCreation:'2026-01-20', derniereInteraction:'2026-04-05', consentement:{email:true,sms:true,tel:true}, anniversaire:'1979-04-12', source:'recommandation', interactions:[{id:12,date:'2026-04-05',type:'appel',note:'Dossier Garcia - taux obtenu 2.3%',duree:15}], score:90 },
  { id:110, nom:'Bernard', prenom:'Nathalie', email:'nathalie.b@gmail.com', tel:'0656789012', type:'prospect', adresse:'18 rue Pastorelli, Nice', tags:['location'], notes:'Cherche location T2 Nice centre', dateCreation:'2026-04-01', derniereInteraction:'2026-04-01', consentement:{email:true,sms:false,tel:false}, anniversaire:'1995-08-25', source:'site', interactions:[{id:13,date:'2026-04-01',type:'email',note:'Inscription via formulaire site',duree:0}], score:35 },
];

const CELEBRATION_TEMPLATES = [
  { id:'anniversaire', titre:'Joyeux anniversaire', message:'Cher(e) {prenom},\n\nToute l\'équipe Freample Immo vous souhaite un très joyeux anniversaire !\n\nCordialement' },
  { id:'fetes', titre:'Bonnes fêtes', message:'Cher(e) {prenom},\n\nNous vous souhaitons de très belles fêtes de fin d\'année.\n\nCordialement' },
  { id:'voeux', titre:'Meilleurs vœux', message:'Cher(e) {prenom},\n\nToute l\'équipe vous présente ses meilleurs vœux pour cette nouvelle année.\n\nCordialement' },
  { id:'anniversaire_client', titre:'Anniversaire collaboration', message:'Cher(e) {prenom},\n\nCela fait déjà {annees} an(s) que nous collaborons. Merci pour votre confiance !\n\nCordialement' },
];

export default function CRMModule({ data, setData, showToast, genId }) {
  const [sub, setSub] = useState('annuaire');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [selectedContact, setSelectedContact] = useState(null);

  const contacts = data.contacts || DEFAULT_CONTACTS;
  const ensureContacts = () => { if (!data.contacts) setData(d => ({ ...d, contacts: DEFAULT_CONTACTS })); };
  if (!data.contacts && contacts === DEFAULT_CONTACTS) ensureContacts();

  const filtered = contacts.filter(c => {
    if (filterType && c.type !== filterType) return false;
    if (search) {
      const s = search.toLowerCase();
      return (c.nom+' '+c.prenom+' '+c.email+' '+(c.adresse||'')+' '+(c.tags||[]).join(' ')).toLowerCase().includes(s);
    }
    return true;
  });

  const addContact = () => {
    const c = { id: genId(), nom: form.nom || '', prenom: form.prenom || '', email: form.email || '', tel: form.tel || '', type: form.type || 'prospect', adresse: form.adresse || '', tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [], notes: form.notes || '', dateCreation: new Date().toISOString().slice(0, 10), derniereInteraction: new Date().toISOString().slice(0, 10), consentement: { email: true, sms: false, tel: true }, anniversaire: form.anniversaire || null, source: form.source || 'autre', interactions: [], score: 50 };
    setData(d => ({ ...d, contacts: [...(d.contacts || DEFAULT_CONTACTS), c] }));
    setModal(null); setForm({}); showToast('Contact ajouté');
  };

  const updateContact = () => {
    setData(d => ({ ...d, contacts: (d.contacts || DEFAULT_CONTACTS).map(c => c.id === form.id ? { ...c, nom: form.nom, prenom: form.prenom, email: form.email, tel: form.tel, type: form.type, adresse: form.adresse, tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()) : (form.tags || []), notes: form.notes, anniversaire: form.anniversaire, source: form.source } : c) }));
    setModal(null); setForm({}); showToast('Contact mis à jour');
  };

  const deleteContact = (id) => {
    setData(d => ({ ...d, contacts: (d.contacts || []).filter(c => c.id !== id) }));
    setSelectedContact(null); showToast('Contact supprimé (droit à l\'oubli)');
  };

  const addInteraction = (contactId) => {
    const inter = { id: genId(), date: new Date().toISOString().slice(0, 10), type: form.interType || 'note', note: form.interNote || '', duree: Number(form.interDuree) || 0 };
    setData(d => ({ ...d, contacts: (d.contacts || []).map(c => c.id === contactId ? { ...c, interactions: [inter, ...c.interactions], derniereInteraction: inter.date } : c) }));
    setModal(null); setForm({}); showToast('Interaction ajoutée');
  };

  const toggleConsent = (contactId, field) => {
    setData(d => ({ ...d, contacts: (d.contacts || []).map(c => c.id === contactId ? { ...c, consentement: { ...c.consentement, [field]: !c.consentement[field] } } : c) }));
  };

  const exportCSV = () => {
    const rows = [['Nom', 'Prénom', 'Email', 'Téléphone', 'Type', 'Adresse', 'Source', 'Score', 'Date création']];
    contacts.forEach(c => rows.push([c.nom, c.prenom, c.email, c.tel, c.type, c.adresse, c.source, c.score, c.dateCreation]));
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'contacts_crm.csv'; a.click();
    showToast('Export CSV téléchargé');
  };

  const typeColors = { prospect: L.blue, client: L.green, vendeur: L.gold, notaire: '#7C3AED', banquier: L.orange, courtier: '#14B8A6', artisan: '#EC4899', syndic: L.textSec };

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const birthdaysThisMonth = contacts.filter(c => c.anniversaire && parseInt(c.anniversaire.split('-')[1]) === currentMonth);

  const allInteractions = contacts.flatMap(c => (c.interactions || []).map(i => ({ ...i, contactNom: c.nom + ' ' + c.prenom, contactId: c.id }))).sort((a, b) => b.date.localeCompare(a.date));

  const consentStats = {
    total: contacts.length,
    email: contacts.filter(c => c.consentement?.email).length,
    sms: contacts.filter(c => c.consentement?.sms).length,
    tel: contacts.filter(c => c.consentement?.tel).length,
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: `1px solid ${L.border}` }}>
        {[{ id: 'annuaire', label: 'Annuaire' }, { id: 'import', label: 'Import' }, { id: 'rgpd', label: 'RGPD' }, { id: 'historique', label: 'Historique' }, { id: 'celebrations', label: 'Célébrations' }].map(t => (
          <button key={t.id} onClick={() => setSub(t.id)} style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: `2px solid ${sub === t.id ? L.gold : 'transparent'}`, fontSize: 12, fontWeight: sub === t.id ? 700 : 400, color: sub === t.id ? L.text : L.textSec, cursor: 'pointer', fontFamily: L.font }}>{t.label}</button>
        ))}
      </div>

      {/* ══ ANNUAIRE ══ */}
      {sub === 'annuaire' && !selectedContact && <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Annuaire ({filtered.length})</h2>
          <button onClick={() => { setForm({ type: 'prospect', source: 'autre' }); setModal({ type: 'addContact' }); }} style={BTN} onMouseEnter={e => e.currentTarget.style.background = L.gold} onMouseLeave={e => e.currentTarget.style.background = L.noir}>+ Nouveau contact</button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom, email, adresse, tag..." style={{ ...INP, flex: 1 }} />
          <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...INP, width: 160 }}>
            <option value="">Tous les types</option>
            {TYPES_CONTACT.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
          <button onClick={exportCSV} style={{ ...BTN_OUTLINE, fontSize: 10, padding: '5px 12px' }}>📥 Export</button>
        </div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {TYPES_CONTACT.map(t => {
            const count = contacts.filter(c => c.type === t).length;
            return <span key={t} onClick={() => setFilterType(filterType === t ? '' : t)} style={{ padding: '4px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer', border: `1px solid ${filterType === t ? typeColors[t] : L.border}`, color: filterType === t ? typeColors[t] : L.textSec, background: filterType === t ? `${typeColors[t]}10` : 'transparent' }}>{t} ({count})</span>;
          })}
        </div>
        <div style={{ ...CARD, padding: 0 }}>
          {filtered.map((c, i) => (
            <div key={c.id} onClick={() => setSelectedContact(c)} style={{ padding: '12px 18px', borderBottom: i < filtered.length - 1 ? `1px solid ${L.border}` : 'none', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'background .1s' }} onMouseEnter={e => e.currentTarget.style.background = L.cream} onMouseLeave={e => e.currentTarget.style.background = L.white}>
              <div style={{ width: 36, height: 36, background: `${typeColors[c.type]}15`, border: `1px solid ${typeColors[c.type]}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: typeColors[c.type], flexShrink: 0 }}>{c.prenom?.[0]}{c.nom?.[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{c.prenom} {c.nom}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: typeColors[c.type], background: `${typeColors[c.type]}12`, padding: '2px 8px' }}>{c.type}</span>
                  {c.score >= 80 && <span style={{ fontSize: 10, fontWeight: 600, color: L.green, background: L.greenBg, padding: '2px 6px' }}>★ {c.score}</span>}
                </div>
                <div style={{ fontSize: 11, color: L.textSec }}>{c.email} · {c.tel}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: L.textLight }}>{c.derniereInteraction}</div>
                <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end', marginTop: 2 }}>
                  {(c.tags || []).slice(0, 2).map(t => <span key={t} style={{ fontSize: 9, padding: '1px 6px', background: L.cream, border: `1px solid ${L.border}`, color: L.textSec }}>{t}</span>)}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: L.textLight }}>Aucun contact trouvé</div>}
        </div>
      </>}

      {/* ══ FICHE CONTACT ══ */}
      {sub === 'annuaire' && selectedContact && (() => {
        const c = contacts.find(x => x.id === selectedContact.id) || selectedContact;
        return <>
          <button onClick={() => setSelectedContact(null)} style={{ ...BTN_OUTLINE, fontSize: 11, marginBottom: 12 }}>← Retour à l'annuaire</button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={CARD}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 4px' }}>{c.prenom} {c.nom}</h2>
                  <span style={{ fontSize: 11, fontWeight: 600, color: typeColors[c.type], background: `${typeColors[c.type]}12`, padding: '3px 10px' }}>{c.type}</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => { setForm({ ...c, tags: (c.tags || []).join(', ') }); setModal({ type: 'editContact' }); }} style={{ ...BTN_OUTLINE, fontSize: 10, padding: '4px 10px' }}>✎</button>
                  <button onClick={() => deleteContact(c.id)} style={{ ...BTN_OUTLINE, fontSize: 10, padding: '4px 10px', color: L.red, borderColor: L.red + '40' }}>✕</button>
                </div>
              </div>
              <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div>📧 {c.email}</div>
                <div>📱 {c.tel}</div>
                <div>📍 {c.adresse}</div>
                {c.anniversaire && <div>🎂 {new Date(c.anniversaire).toLocaleDateString('fr-FR')}</div>}
                <div>📌 Source: {c.source}</div>
                <div>📅 Client depuis: {c.dateCreation}</div>
              </div>
              {c.notes && <div style={{ background: L.cream, padding: '10px 14px', marginTop: 10, fontSize: 12, color: L.textSec, fontStyle: 'italic' }}>{c.notes}</div>}
              <div style={{ display: 'flex', gap: 3, marginTop: 10, flexWrap: 'wrap' }}>
                {(c.tags || []).map(t => <span key={t} style={{ fontSize: 10, padding: '3px 8px', background: L.cream, border: `1px solid ${L.border}` }}>{t}</span>)}
              </div>
            </div>
            <div style={CARD}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Actions rapides</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button onClick={() => { window.open(`tel:${c.tel}`); showToast('Appel lancé'); }} style={{ ...BTN, background: L.green, textAlign: 'left' }}>📞 Appeler</button>
                <button onClick={() => { window.open(`mailto:${c.email}`); showToast('Email préparé'); }} style={{ ...BTN, background: L.blue, textAlign: 'left' }}>📧 Envoyer un email</button>
                <button onClick={() => showToast('SMS envoyé (simulé)')} style={{ ...BTN, background: '#7C3AED', textAlign: 'left' }}>💬 Envoyer SMS</button>
                <button onClick={() => showToast('Transféré vers estimation')} style={{ ...BTN, background: L.gold, textAlign: 'left' }}>📊 Créer estimation</button>
                <button onClick={() => showToast('Transféré vers mandat')} style={{ ...BTN, background: L.orange, textAlign: 'left' }}>📝 Créer mandat</button>
              </div>
              <div style={{ marginTop: 16, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Score lead</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', border: `3px solid ${c.score >= 70 ? L.green : c.score >= 40 ? L.orange : L.red}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: c.score >= 70 ? L.green : c.score >= 40 ? L.orange : L.red }}>{c.score}</div>
                <div style={{ fontSize: 12, color: L.textSec }}>{c.score >= 70 ? 'Lead chaud' : c.score >= 40 ? 'Lead tiède' : 'Lead froid'}</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Historique des interactions ({(c.interactions || []).length})</h3>
            <button onClick={() => { setForm({}); setModal({ type: 'addInteraction', contactId: c.id }); }} style={BTN} onMouseEnter={e => e.currentTarget.style.background = L.gold} onMouseLeave={e => e.currentTarget.style.background = L.noir}>+ Interaction</button>
          </div>
          <div style={{ ...CARD, padding: 0 }}>
            {(c.interactions || []).map((inter, i) => (
              <div key={inter.id} style={{ padding: '10px 18px', borderBottom: i < c.interactions.length - 1 ? `1px solid ${L.border}` : 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: inter.type === 'appel' ? L.green : inter.type === 'email' ? L.blue : inter.type === 'visite' ? L.gold : L.textSec, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{inter.type.charAt(0).toUpperCase() + inter.type.slice(1)} {inter.duree > 0 ? `(${inter.duree} min)` : ''}</div>
                  <div style={{ fontSize: 12, color: L.textSec }}>{inter.note}</div>
                </div>
                <div style={{ fontSize: 11, color: L.textLight, flexShrink: 0 }}>{inter.date}</div>
              </div>
            ))}
            {(!c.interactions || c.interactions.length === 0) && <div style={{ padding: 24, textAlign: 'center', color: L.textLight }}>Aucune interaction</div>}
          </div>
        </>;
      })()}

      {/* ══ IMPORT ══ */}
      {sub === 'import' && <>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Import de contacts</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ ...CARD, textAlign: 'center', border: `2px dashed ${L.border}`, padding: 40, cursor: 'pointer' }} onClick={() => showToast('Import CSV simulé — 15 contacts importés')} onMouseEnter={e => e.currentTarget.style.borderColor = L.gold} onMouseLeave={e => e.currentTarget.style.borderColor = L.border}>
            <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.3 }}>📄</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Import CSV</div>
            <div style={{ fontSize: 12, color: L.textSec }}>Glissez un fichier CSV ou cliquez pour sélectionner</div>
            <div style={{ fontSize: 11, color: L.textLight, marginTop: 8 }}>Format: Nom, Prénom, Email, Téléphone, Type</div>
          </div>
          <div style={{ ...CARD, textAlign: 'center', padding: 40, cursor: 'pointer' }} onClick={() => showToast('Import mobile simulé — 8 contacts importés')} onMouseEnter={e => e.currentTarget.style.borderColor = L.gold} onMouseLeave={e => e.currentTarget.style.borderColor = L.border}>
            <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.3 }}>📱</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Import Mobile</div>
            <div style={{ fontSize: 12, color: L.textSec }}>Synchronisez vos contacts téléphone</div>
            <div style={{ fontSize: 11, color: L.textLight, marginTop: 8 }}>iOS & Android</div>
          </div>
        </div>
        <div style={{ ...CARD, marginTop: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Détection des doublons</div>
          <div style={{ fontSize: 13, color: L.textSec, marginBottom: 8 }}>Lors de l'import, Freample détecte automatiquement les doublons par email et téléphone.</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ padding: '10px 16px', background: L.greenBg, border: `1px solid ${L.green}30`, flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 200, color: L.green, fontFamily: L.serif }}>{contacts.length}</div>
              <div style={{ fontSize: 10, color: L.textSec }}>Contacts uniques</div>
            </div>
            <div style={{ padding: '10px 16px', background: L.orangeBg, border: `1px solid ${L.orange}30`, flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 200, color: L.orange, fontFamily: L.serif }}>0</div>
              <div style={{ fontSize: 10, color: L.textSec }}>Doublons détectés</div>
            </div>
          </div>
        </div>
      </>}

      {/* ══ RGPD ══ */}
      {sub === 'rgpd' && <>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Conformité RGPD</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { l: 'Contacts', v: consentStats.total, c: L.blue },
            { l: 'Consent. email', v: `${consentStats.email} (${Math.round(consentStats.email / consentStats.total * 100)}%)`, c: L.green },
            { l: 'Consent. SMS', v: `${consentStats.sms} (${Math.round(consentStats.sms / consentStats.total * 100)}%)`, c: L.orange },
            { l: 'Consent. tél.', v: `${consentStats.tel} (${Math.round(consentStats.tel / consentStats.total * 100)}%)`, c: '#7C3AED' },
          ].map(k => (
            <div key={k.l} style={{ ...CARD, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: k.c }} />
              <div style={{ fontSize: 10, color: L.textLight, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{k.l}</div>
              <div style={{ fontSize: 18, fontWeight: 200, fontFamily: L.serif }}>{k.v}</div>
            </div>
          ))}
        </div>
        <div style={{ ...CARD, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Gestion des consentements</div>
            <button onClick={exportCSV} style={{ ...BTN_OUTLINE, fontSize: 10, padding: '5px 12px' }}>📥 Export données</button>
          </div>
          <div style={{ fontSize: 11, color: L.textSec, marginBottom: 12 }}>Cliquez sur les icônes pour activer/désactiver le consentement de chaque contact.</div>
          {contacts.slice(0, 15).map((c, i) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: `1px solid ${L.border}` }}>
              <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>{c.prenom} {c.nom}</span>
              <span onClick={() => toggleConsent(c.id, 'email')} style={{ cursor: 'pointer', fontSize: 11, padding: '3px 8px', background: c.consentement?.email ? L.greenBg : L.redBg, color: c.consentement?.email ? L.green : L.red, fontWeight: 600 }}>📧 {c.consentement?.email ? 'Oui' : 'Non'}</span>
              <span onClick={() => toggleConsent(c.id, 'sms')} style={{ cursor: 'pointer', fontSize: 11, padding: '3px 8px', background: c.consentement?.sms ? L.greenBg : L.redBg, color: c.consentement?.sms ? L.green : L.red, fontWeight: 600 }}>💬 {c.consentement?.sms ? 'Oui' : 'Non'}</span>
              <span onClick={() => toggleConsent(c.id, 'tel')} style={{ cursor: 'pointer', fontSize: 11, padding: '3px 8px', background: c.consentement?.tel ? L.greenBg : L.redBg, color: c.consentement?.tel ? L.green : L.red, fontWeight: 600 }}>📞 {c.consentement?.tel ? 'Oui' : 'Non'}</span>
              <button onClick={() => deleteContact(c.id)} style={{ ...BTN_OUTLINE, fontSize: 9, padding: '2px 8px', color: L.red, borderColor: L.red + '40' }}>Droit à l'oubli</button>
            </div>
          ))}
        </div>
      </>}

      {/* ══ HISTORIQUE ══ */}
      {sub === 'historique' && <>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Historique des interactions</h2>
        <div style={{ ...CARD, padding: 0 }}>
          {allInteractions.slice(0, 30).map((inter, i) => (
            <div key={`${inter.contactId}-${inter.id}`} style={{ padding: '10px 18px', borderBottom: `1px solid ${L.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: inter.type === 'appel' ? L.green : inter.type === 'email' ? L.blue : inter.type === 'visite' ? L.gold : inter.type === 'estimation' ? L.orange : L.textSec, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13 }}><span style={{ fontWeight: 700 }}>{inter.contactNom}</span> — <span style={{ fontWeight: 600, color: typeColors[inter.type] || L.textSec }}>{inter.type}</span></div>
                <div style={{ fontSize: 12, color: L.textSec }}>{inter.note}</div>
              </div>
              <div style={{ fontSize: 11, color: L.textLight, flexShrink: 0 }}>{inter.date}</div>
            </div>
          ))}
          {allInteractions.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: L.textLight }}>Aucune interaction enregistrée</div>}
        </div>
      </>}

      {/* ══ CÉLÉBRATIONS ══ */}
      {sub === 'celebrations' && <>
        <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px' }}>Célébrations & Rappels</h2>
        <div style={{ ...CARD, marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🎂 Anniversaires ce mois ({birthdaysThisMonth.length})</div>
          {birthdaysThisMonth.length > 0 ? birthdaysThisMonth.map(c => {
            const day = parseInt(c.anniversaire.split('-')[2]);
            const isPast = day < today.getDate();
            return <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${L.border}` }}>
              <div>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{c.prenom} {c.nom}</span>
                <span style={{ fontSize: 12, color: L.textSec, marginLeft: 8 }}>{new Date(c.anniversaire).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</span>
                {isPast && <span style={{ fontSize: 10, color: L.textLight, marginLeft: 6 }}>(passé)</span>}
              </div>
              <button onClick={() => showToast(`Message d'anniversaire envoyé à ${c.prenom}`)} style={{ ...BTN, fontSize: 10, padding: '5px 12px', background: isPast ? L.textLight : L.gold }}>🎉 Envoyer message</button>
            </div>;
          }) : <div style={{ fontSize: 13, color: L.textLight }}>Aucun anniversaire ce mois-ci</div>}
        </div>
        <div style={{ ...CARD }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Modèles de messages</div>
          {CELEBRATION_TEMPLATES.map(tpl => (
            <div key={tpl.id} style={{ padding: '10px 0', borderBottom: `1px solid ${L.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{tpl.titre}</div>
                <div style={{ fontSize: 11, color: L.textSec }}>{tpl.message.slice(0, 60)}...</div>
              </div>
              <button onClick={() => showToast(`Modèle "${tpl.titre}" utilisé`)} style={{ ...BTN_OUTLINE, fontSize: 10, padding: '4px 10px' }}>Utiliser</button>
            </div>
          ))}
        </div>
      </>}

      {/* ══ MODALS ══ */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setModal(null)}>
          <div style={{ background: L.white, width: '100%', maxWidth: 500, maxHeight: '85vh', overflowY: 'auto', padding: '28px 24px' }} onClick={e => e.stopPropagation()}>
            {(modal.type === 'addContact' || modal.type === 'editContact') && <>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>{modal.type === 'addContact' ? 'Nouveau contact' : 'Modifier le contact'}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div><label style={LBL}>Nom *</label><input value={form.nom || ''} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} style={INP} /></div>
                <div><label style={LBL}>Prénom *</label><input value={form.prenom || ''} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} style={INP} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div><label style={LBL}>Email</label><input value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={INP} /></div>
                <div><label style={LBL}>Téléphone</label><input value={form.tel || ''} onChange={e => setForm(f => ({ ...f, tel: e.target.value }))} style={INP} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div><label style={LBL}>Type</label><select value={form.type || 'prospect'} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={INP}>{TYPES_CONTACT.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label style={LBL}>Source</label><select value={form.source || 'autre'} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} style={INP}>{SOURCES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
              </div>
              <div style={{ marginBottom: 10 }}><label style={LBL}>Adresse</label><input value={form.adresse || ''} onChange={e => setForm(f => ({ ...f, adresse: e.target.value }))} style={INP} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div><label style={LBL}>Tags (séparés par virgule)</label><input value={form.tags || ''} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} style={INP} placeholder="investisseur, SCI..." /></div>
                <div><label style={LBL}>Date de naissance</label><input type="date" value={form.anniversaire || ''} onChange={e => setForm(f => ({ ...f, anniversaire: e.target.value }))} style={INP} /></div>
              </div>
              <div style={{ marginBottom: 14 }}><label style={LBL}>Notes</label><textarea value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} style={{ ...INP, resize: 'vertical' }} /></div>
              <button onClick={modal.type === 'addContact' ? addContact : updateContact} style={{ ...BTN, width: '100%', padding: '12px' }} onMouseEnter={e => e.currentTarget.style.background = L.gold} onMouseLeave={e => e.currentTarget.style.background = L.noir}>{modal.type === 'addContact' ? 'Ajouter' : 'Enregistrer'}</button>
            </>}
            {modal.type === 'addInteraction' && <>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 16px' }}>Nouvelle interaction</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
                <div><label style={LBL}>Type</label><select value={form.interType || 'note'} onChange={e => setForm(f => ({ ...f, interType: e.target.value }))} style={INP}>{TYPES_INTERACTION.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label style={LBL}>Durée (min)</label><input type="number" value={form.interDuree || ''} onChange={e => setForm(f => ({ ...f, interDuree: e.target.value }))} style={INP} /></div>
              </div>
              <div style={{ marginBottom: 14 }}><label style={LBL}>Note</label><textarea value={form.interNote || ''} onChange={e => setForm(f => ({ ...f, interNote: e.target.value }))} rows={3} style={{ ...INP, resize: 'vertical' }} /></div>
              <button onClick={() => addInteraction(modal.contactId)} style={{ ...BTN, width: '100%', padding: '12px' }} onMouseEnter={e => e.currentTarget.style.background = L.gold} onMouseLeave={e => e.currentTarget.style.background = L.noir}>Ajouter</button>
            </>}
          </div>
        </div>
      )}
    </div>
  );
}
