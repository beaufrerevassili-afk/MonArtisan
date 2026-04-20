import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import DS from '../../design/ds';
import {
  getFichesSalaries, setFichesSalaries, FICHE_SALARIE_VIDE,
  CORPS_METIER_BTP, HABILITATIONS_REQUISES, verifierHabilitation, getProfilEntreprise
} from '../../utils/profilEntreprise';

const CARD = { background: '#fff', border: `1px solid ${DS.border}`, borderRadius: 14, padding: 20 };
const BTN = { padding: '8px 18px', background: DS.gold, color: '#fff', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: DS.font };
const BTN_O = { ...BTN, background: 'transparent', color: DS.text, border: `1px solid ${DS.border}` };
const INP = { width: '100%', padding: '10px 12px', border: `1px solid ${DS.border}`, borderRadius: 8, fontSize: 13, fontFamily: DS.font, outline: 'none', boxSizing: 'border-box' };
const LBL = { fontSize: 11, fontWeight: 700, color: DS.muted, display: 'block', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' };
const SECTION_TITLE = { fontSize: 15, fontWeight: 800, color: DS.text, margin: 0 };

export default function Employes() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [fiches, setFiches] = useState(getFichesSalaries);
  const [vue, setVue] = useState('liste'); // 'liste' | 'matrice' | 'fiche'
  const [selectedId, setSelectedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ prenom: '', nom: '', poste: '', email: '', telephone: '' });

  useEffect(() => { setFichesSalaries(fiches); }, [fiches]);

  const profil = getProfilEntreprise(user);
  const metiersEntreprise = profil.metiers || [];
  const fichesActives = fiches.filter(f => f.actif);
  const selected = fiches.find(f => f.id === selectedId);

  // ── Ajouter un salarié ──
  function ajouterSalarie() {
    if (!addForm.nom || !addForm.prenom) return;
    const newFiche = {
      ...FICHE_SALARIE_VIDE,
      id: 's' + Date.now(),
      nom: addForm.nom, prenom: addForm.prenom, poste: addForm.poste,
      email: addForm.email, telephone: addForm.telephone,
      dateEntree: new Date().toISOString().slice(0, 10),
    };
    setFiches(prev => [...prev, newFiche]);
    setAddForm({ prenom: '', nom: '', poste: '', email: '', telephone: '' });
    setShowAdd(false);
    addToast(`${addForm.prenom} ${addForm.nom} ajouté à l'équipe`, 'success');
  }

  // ── Modifier une fiche ──
  function updateFiche(id, updates) {
    setFiches(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  }

  // ── Supprimer (offboarding) ──
  function retirerSalarie(id) {
    if (!window.confirm('Retirer ce salarié de l\'équipe ? Sa fiche sera archivée.')) return;
    setFiches(prev => prev.map(f => f.id === id ? { ...f, actif: false } : f));
    setSelectedId(null);
    addToast('Salarié retiré de l\'équipe', 'warning');
  }

  // ══════════════════════════════════════
  //  VUE FICHE DÉTAILLÉE
  // ══════════════════════════════════════
  if (selectedId && selected) {
    const hab = selected.habilitations || [];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 800 }}>
        <button onClick={() => setSelectedId(null)} style={{ ...BTN_O, alignSelf: 'flex-start', fontSize: 12 }}>← Retour à l'équipe</button>

        {/* Header fiche */}
        <div style={{ ...CARD, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: selected.isPatron ? DS.gold : DS.border, color: selected.isPatron ? '#fff' : DS.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800 }}>
            {selected.prenom?.[0]}{selected.nom?.[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{selected.prenom} {selected.nom}</h2>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: DS.subtle }}>{selected.poste} {selected.isPatron && <span style={{ fontSize: 10, background: DS.goldLight, color: DS.gold, padding: '2px 8px', borderRadius: 4, fontWeight: 700, marginLeft: 6 }}>PATRON</span>}</p>
          </div>
          {!selected.isPatron && <button onClick={() => retirerSalarie(selected.id)} style={{ ...BTN_O, color: DS.red, borderColor: DS.red, fontSize: 11 }}>Retirer</button>}
        </div>

        {/* Infos personnelles */}
        <div style={CARD}>
          <p style={SECTION_TITLE}>Informations</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 12 }}>
            <div><label style={LBL}>Prénom</label><input value={selected.prenom} onChange={e => updateFiche(selected.id, { prenom: e.target.value })} style={INP} /></div>
            <div><label style={LBL}>Nom</label><input value={selected.nom} onChange={e => updateFiche(selected.id, { nom: e.target.value })} style={INP} /></div>
            <div><label style={LBL}>Poste</label><input value={selected.poste} onChange={e => updateFiche(selected.id, { poste: e.target.value })} style={INP} /></div>
            <div><label style={LBL}>Téléphone</label><input value={selected.telephone} onChange={e => updateFiche(selected.id, { telephone: e.target.value })} style={INP} /></div>
            <div><label style={LBL}>Email</label><input value={selected.email} onChange={e => updateFiche(selected.id, { email: e.target.value })} style={INP} /></div>
            <div><label style={LBL}>Date d'entrée</label><input type="date" value={selected.dateEntree} onChange={e => updateFiche(selected.id, { dateEntree: e.target.value })} style={INP} /></div>
          </div>
        </div>

        {/* Compétences métier */}
        <div style={CARD}>
          <p style={SECTION_TITLE}>Compétences métier</p>
          <p style={{ fontSize: 11, color: DS.subtle, marginTop: 4 }}>Cochez les corps de métier que {selected.prenom} sait exercer.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {CORPS_METIER_BTP.map(m => {
              const has = (selected.competences || []).includes(m);
              return (
                <button key={m} onClick={() => {
                  const comps = has ? selected.competences.filter(c => c !== m) : [...(selected.competences || []), m];
                  updateFiche(selected.id, { competences: comps });
                }} style={{ padding: '6px 14px', borderRadius: 8, border: has ? 'none' : `1px solid ${DS.border}`, background: has ? DS.gold : 'transparent', color: has ? '#fff' : DS.muted, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                  {m}
                </button>
              );
            })}
          </div>
        </div>

        {/* Habilitations */}
        <div style={CARD}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={SECTION_TITLE}>Habilitations & Certifications</p>
            <button onClick={() => updateFiche(selected.id, { habilitations: [...hab, { type: '', numero: '', organisme: '', dateObtention: '', dateExpiration: '' }] })} style={{ ...BTN_O, fontSize: 11 }}>+ Ajouter</button>
          </div>
          {hab.length === 0 && <p style={{ fontSize: 12, color: DS.subtle, marginTop: 8 }}>Aucune habilitation renseignée.</p>}
          {hab.map((h, i) => {
            const jours = h.dateExpiration ? Math.round((new Date(h.dateExpiration) - new Date()) / 86400000) : null;
            const expired = jours !== null && jours < 0;
            const soon = jours !== null && jours >= 0 && jours < 30;
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginTop: 10, padding: 10, background: expired ? '#FEF2F2' : soon ? '#FFFBEB' : DS.bgSoft, borderRadius: 8, border: expired ? '1px solid #DC2626' : soon ? '1px solid #D97706' : `1px solid ${DS.border}` }}>
                <div><label style={LBL}>Type</label><input value={h.type} onChange={e => { const u = [...hab]; u[i] = { ...u[i], type: e.target.value }; updateFiche(selected.id, { habilitations: u }); }} style={INP} placeholder="Ex: Habilitation electrique" /></div>
                <div><label style={LBL}>Numéro</label><input value={h.numero} onChange={e => { const u = [...hab]; u[i] = { ...u[i], numero: e.target.value }; updateFiche(selected.id, { habilitations: u }); }} style={INP} /></div>
                <div><label style={LBL}>Organisme</label><input value={h.organisme} onChange={e => { const u = [...hab]; u[i] = { ...u[i], organisme: e.target.value }; updateFiche(selected.id, { habilitations: u }); }} style={INP} /></div>
                <div><label style={LBL}>Expiration</label><input type="date" value={h.dateExpiration} onChange={e => { const u = [...hab]; u[i] = { ...u[i], dateExpiration: e.target.value }; updateFiche(selected.id, { habilitations: u }); }} style={INP} />
                  {expired && <span style={{ fontSize: 10, color: DS.red, fontWeight: 700 }}>EXPIREE</span>}
                  {soon && <span style={{ fontSize: 10, color: '#D97706', fontWeight: 700 }}>Expire dans {jours}j</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button onClick={() => { const u = hab.filter((_, j) => j !== i); updateFiche(selected.id, { habilitations: u }); }} style={{ ...BTN_O, color: DS.red, borderColor: DS.red, fontSize: 11, padding: '6px 12px' }}>Supprimer</button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carte BTP + Visite médicale */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={CARD}>
            <p style={SECTION_TITLE}>Carte BTP</p>
            <div style={{ marginTop: 10 }}>
              <label style={LBL}>Numéro</label><input value={selected.carteBTP?.numero || ''} onChange={e => updateFiche(selected.id, { carteBTP: { ...selected.carteBTP, numero: e.target.value } })} style={INP} />
            </div>
            <div style={{ marginTop: 8 }}>
              <label style={LBL}>Expiration</label><input type="date" value={selected.carteBTP?.dateExpiration || ''} onChange={e => updateFiche(selected.id, { carteBTP: { ...selected.carteBTP, dateExpiration: e.target.value } })} style={INP} />
            </div>
          </div>
          <div style={CARD}>
            <p style={SECTION_TITLE}>Visite médicale</p>
            <div style={{ marginTop: 10 }}>
              <label style={LBL}>Dernière visite</label><input type="date" value={selected.visiteMedicale?.derniere || ''} onChange={e => updateFiche(selected.id, { visiteMedicale: { ...selected.visiteMedicale, derniere: e.target.value } })} style={INP} />
            </div>
            <div style={{ marginTop: 8 }}>
              <label style={LBL}>Prochaine visite</label><input type="date" value={selected.visiteMedicale?.prochaine || ''} onChange={e => updateFiche(selected.id, { visiteMedicale: { ...selected.visiteMedicale, prochaine: e.target.value } })} style={INP} />
            </div>
          </div>
        </div>

        <button onClick={() => { addToast('Fiche enregistrée', 'success'); setSelectedId(null); }} style={{ ...BTN, alignSelf: 'flex-start', padding: '12px 28px' }}>Enregistrer</button>
      </div>
    );
  }

  // ══════════════════════════════════════
  //  VUE PRINCIPALE (liste + matrice)
  // ══════════════════════════════════════
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Mon équipe</h1>
          <p style={{ fontSize: 13, color: DS.subtle, marginTop: 4 }}>{fichesActives.length} salarié{fichesActives.length > 1 ? 's' : ''} actif{fichesActives.length > 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setVue('liste')} style={vue === 'liste' ? BTN : BTN_O}>Liste</button>
          <button onClick={() => setVue('matrice')} style={vue === 'matrice' ? BTN : BTN_O}>Matrice</button>
          <button onClick={() => setShowAdd(true)} style={{ ...BTN, background: '#16A34A' }}>+ Ajouter</button>
        </div>
      </div>

      {/* Formulaire ajout */}
      {showAdd && (
        <div style={{ ...CARD, borderLeft: `4px solid ${DS.gold}` }}>
          <p style={{ ...SECTION_TITLE, marginBottom: 12 }}>Ajouter un salarié</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            <div><label style={LBL}>Prénom *</label><input value={addForm.prenom} onChange={e => setAddForm(f => ({ ...f, prenom: e.target.value }))} style={INP} /></div>
            <div><label style={LBL}>Nom *</label><input value={addForm.nom} onChange={e => setAddForm(f => ({ ...f, nom: e.target.value }))} style={INP} /></div>
            <div><label style={LBL}>Poste</label><input value={addForm.poste} onChange={e => setAddForm(f => ({ ...f, poste: e.target.value }))} style={INP} placeholder="Ex: Electricien" /></div>
            <div><label style={LBL}>Email</label><input value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} style={INP} placeholder="Pour invitation Freample" /></div>
            <div><label style={LBL}>Téléphone</label><input value={addForm.telephone} onChange={e => setAddForm(f => ({ ...f, telephone: e.target.value }))} style={INP} /></div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button onClick={ajouterSalarie} disabled={!addForm.nom || !addForm.prenom} style={{ ...BTN, opacity: !addForm.nom || !addForm.prenom ? 0.5 : 1 }}>Ajouter à l'équipe</button>
            <button onClick={() => setShowAdd(false)} style={BTN_O}>Annuler</button>
          </div>
        </div>
      )}

      {/* ── VUE LISTE ── */}
      {vue === 'liste' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {fichesActives.map(f => {
            const habAlerts = (f.habilitations || []).filter(h => h.dateExpiration && new Date(h.dateExpiration) < new Date()).length;
            return (
              <div key={f.id} onClick={() => setSelectedId(f.id)}
                style={{ ...CARD, cursor: 'pointer', transition: 'border-color .15s', display: 'flex', flexDirection: 'column', gap: 8 }}
                onMouseEnter={e => e.currentTarget.style.borderColor = DS.gold}
                onMouseLeave={e => e.currentTarget.style.borderColor = DS.border}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: f.isPatron ? DS.gold : DS.bgMuted, color: f.isPatron ? '#fff' : DS.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
                    {f.prenom?.[0]}{f.nom?.[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{f.prenom} {f.nom}</div>
                    <div style={{ fontSize: 12, color: DS.subtle }}>{f.poste} {f.isPatron && <span style={{ fontSize: 9, background: DS.goldLight, color: DS.gold, padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>PATRON</span>}</div>
                  </div>
                  {habAlerts > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: DS.red, background: '#FEF2F2', padding: '2px 8px', borderRadius: 4 }}>{habAlerts} hab. expiree{habAlerts > 1 ? 's' : ''}</span>}
                </div>
                {/* Compétences */}
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {(f.competences || []).map(c => (
                    <span key={c} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: DS.goldLight, color: DS.gold }}>{c}</span>
                  ))}
                  {(f.competences || []).length === 0 && <span style={{ fontSize: 10, color: DS.subtle }}>Aucune compétence renseignée</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── VUE MATRICE ── */}
      {vue === 'matrice' && (
        <div style={{ ...CARD, padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: DS.bgSoft }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, position: 'sticky', left: 0, background: DS.bgSoft, minWidth: 140, borderRight: `1px solid ${DS.border}` }}>Salarié</th>
                  {CORPS_METIER_BTP.filter(m => metiersEntreprise.length === 0 || metiersEntreprise.includes(m) || fichesActives.some(f => (f.competences || []).includes(m))).map(m => (
                    <th key={m} style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 600, fontSize: 11, minWidth: 80, borderRight: `1px solid ${DS.borderLight}`, color: metiersEntreprise.includes(m) ? DS.gold : DS.muted }}>{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fichesActives.map(f => (
                  <tr key={f.id} onClick={() => setSelectedId(f.id)} style={{ cursor: 'pointer', borderBottom: `1px solid ${DS.borderLight}` }}>
                    <td style={{ padding: '8px 14px', fontWeight: 600, position: 'sticky', left: 0, background: '#fff', borderRight: `1px solid ${DS.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {f.prenom} {f.nom}
                      {f.isPatron && <span style={{ fontSize: 9, background: DS.goldLight, color: DS.gold, padding: '1px 5px', borderRadius: 3, fontWeight: 700 }}>P</span>}
                    </td>
                    {CORPS_METIER_BTP.filter(m => metiersEntreprise.length === 0 || metiersEntreprise.includes(m) || fichesActives.some(ff => (ff.competences || []).includes(m))).map(m => {
                      const has = (f.competences || []).includes(m);
                      const habCheck = has ? verifierHabilitation(f, m) : null;
                      return (
                        <td key={m} style={{ padding: '8px', textAlign: 'center', borderRight: `1px solid ${DS.borderLight}` }}>
                          {has ? (
                            habCheck?.requis && !habCheck?.possede ? <span title={habCheck.message} style={{ color: DS.red, fontWeight: 700 }}>⚠</span>
                            : habCheck?.expire ? <span title={habCheck.message} style={{ color: DS.red, fontWeight: 700 }}>✓!</span>
                            : <span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span>
                          ) : (
                            <span style={{ color: DS.borderLight }}>—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {/* Ligne totaux */}
                <tr style={{ background: DS.bgSoft, fontWeight: 700 }}>
                  <td style={{ padding: '8px 14px', position: 'sticky', left: 0, background: DS.bgSoft, borderRight: `1px solid ${DS.border}` }}>Total</td>
                  {CORPS_METIER_BTP.filter(m => metiersEntreprise.length === 0 || metiersEntreprise.includes(m) || fichesActives.some(f => (f.competences || []).includes(m))).map(m => {
                    const count = fichesActives.filter(f => (f.competences || []).includes(m)).length;
                    return <td key={m} style={{ padding: '8px', textAlign: 'center', borderRight: `1px solid ${DS.borderLight}`, color: count === 0 ? DS.red : count === 1 ? '#D97706' : '#16A34A' }}>{count}</td>;
                  })}
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ padding: '10px 14px', background: DS.bgSoft, borderTop: `1px solid ${DS.border}`, fontSize: 11, color: DS.subtle, display: 'flex', gap: 12 }}>
            <span><span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span> Compétent</span>
            <span><span style={{ color: DS.red, fontWeight: 700 }}>⚠</span> Habilitation manquante</span>
            <span><span style={{ color: DS.red, fontWeight: 700 }}>✓!</span> Habilitation expirée</span>
            <span><span style={{ color: DS.borderLight }}>—</span> Pas compétent</span>
          </div>
        </div>
      )}
    </div>
  );
}
