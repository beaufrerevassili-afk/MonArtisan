import React, { useState, useEffect } from 'react';
import { IconSettings, IconCheck, IconX, IconUser, IconShield, IconTeam } from '../../components/ui/Icons';

/* ── All app modules that can be toggled ── */
const MODULES = [
  { id: 'dashboard',    label: 'Tableau de bord',     desc: 'Vue synthétique KPIs et alertes',                        icon: '🏠', groupe: 'Général' },
  { id: 'missions',     label: 'Missions',             desc: 'Gestion et suivi des chantiers / interventions',         icon: '📋', groupe: 'Général' },
  { id: 'devis-pro',    label: 'Devis Pro',            desc: 'Création, envoi et suivi des devis clients',             icon: '📄', groupe: 'Commercial' },
  { id: 'chantiers',    label: 'Chantiers',            desc: 'Suivi avancement, dépenses et marges chantiers',         icon: '🏗️', groupe: 'Commercial' },
  { id: 'finance',      label: 'Finance',              desc: 'Facturation, trésorerie, bilan financier',               icon: '💰', groupe: 'Finance' },
  { id: 'rh',           label: 'Ressources Humaines',  desc: 'Employés, contrats, paie, congés, notes de frais',       icon: '👥', groupe: 'RH' },
  { id: 'paie',         label: 'Paie (sous-module RH)',desc: 'Bulletins de paie, masse salariale',                     icon: '💳', groupe: 'RH' },
  { id: 'qse',          label: 'QSE',                  desc: 'DUERP, habilitations, documents sécurité',               icon: '🛡️', groupe: 'QSE' },
  { id: 'urssaf',       label: 'URSSAF',               desc: 'Cotisations, DSN, déclarations sociales',                icon: '🏦', groupe: 'Finance' },
  { id: 'stock',        label: 'Stock',                desc: 'Gestion inventaire, alertes rupture',                    icon: '📦', groupe: 'Logistique' },
  { id: 'documents',    label: 'Documents',            desc: 'Banque de documents téléchargeables',                    icon: '📥', groupe: 'Général' },
];

/* ── Default role profiles ── */
const ROLES_DEFAUT = {
  patron: { label: 'Patron', color: '#007AFF', icon: '👑', description: 'Accès complet à toutes les fonctionnalités', modules: Object.fromEntries(MODULES.map(m => [m.id, true])) },
  rh:     { label: 'Responsable RH', color: '#34C759', icon: '👥', description: 'Gestion des ressources humaines uniquement', modules: { dashboard: true, rh: true, paie: true, qse: true, missions: false, 'devis-pro': false, chantiers: false, finance: false, urssaf: false, stock: false, documents: true } },
  comptable: { label: 'Comptable', color: '#FF9500', icon: '📊', description: 'Accès aux données financières', modules: { dashboard: true, finance: true, urssaf: true, 'devis-pro': true, rh: false, paie: true, missions: false, chantiers: false, qse: false, stock: false, documents: true } },
  chef_chantier: { label: 'Chef de chantier', color: '#AF52DE', icon: '🏗️', description: 'Gestion opérationnelle des chantiers', modules: { dashboard: true, missions: true, chantiers: true, stock: true, qse: true, rh: false, paie: false, 'devis-pro': false, finance: false, urssaf: false, documents: true } },
  commercial: { label: 'Commercial', color: '#FF3B30', icon: '📈', description: 'Devis et suivi commercial', modules: { dashboard: true, missions: true, 'devis-pro': true, chantiers: false, finance: false, rh: false, paie: false, qse: false, urssaf: false, stock: false, documents: true } },
};

/* ── Users demo ── */
const USERS_DEMO = [
  { id: 1, nom: 'Sophie Petit', email: 'sophie@bernardmartin.fr', role: 'rh', titre: 'Responsable RH' },
  { id: 2, nom: 'Henri Marchal', email: 'henri@bernardmartin.fr', role: 'comptable', titre: 'Comptable' },
  { id: 3, nom: 'Marc Bernard', email: 'marc@bernardmartin.fr', role: 'chef_chantier', titre: 'Chef de chantier' },
  { id: 4, nom: 'Isabelle Renaud', email: 'isabelle@bernardmartin.fr', role: 'commercial', titre: 'Commercial' },
];

const GROUPES = [...new Set(MODULES.map(m => m.groupe))];

export default function GestionLogiciel() {
  const [roles, setRoles] = useState(() => {
    try { const s = localStorage.getItem('gestion_roles'); return s ? JSON.parse(s) : JSON.parse(JSON.stringify(ROLES_DEFAUT)); }
    catch { return JSON.parse(JSON.stringify(ROLES_DEFAUT)); }
  });
  const [users, setUsers] = useState(() => {
    try { const s = localStorage.getItem('gestion_users'); return s ? JSON.parse(s) : USERS_DEMO; }
    catch { return USERS_DEMO; }
  });
  const [userCustomModules, setUserCustomModules] = useState(() => {
    try { const s = localStorage.getItem('gestion_custom_modules'); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  });
  const [selectedRole, setSelectedRole] = useState('rh');
  const [tab, setTab] = useState('roles');
  const [saved, setSaved] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [userForm, setUserForm] = useState({ nom: '', email: '', role: 'rh', titre: '' });
  const [editingUserId, setEditingUserId] = useState(null);

  useEffect(() => { localStorage.setItem('gestion_roles', JSON.stringify(roles)); }, [roles]);
  useEffect(() => { localStorage.setItem('gestion_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('gestion_custom_modules', JSON.stringify(userCustomModules)); }, [userCustomModules]);

  function getUserModules(user) {
    const roleDefaults = roles[user.role]?.modules || {};
    const overrides = userCustomModules[user.id] || {};
    return { ...roleDefaults, ...overrides };
  }

  function toggleUserModule(userId, moduleId, currentVal) {
    setUserCustomModules(prev => ({
      ...prev,
      [userId]: { ...(prev[userId] || {}), [moduleId]: !currentVal },
    }));
  }

  function resetUserToRole(userId) {
    setUserCustomModules(prev => { const n = { ...prev }; delete n[userId]; return n; });
  }

  function hasUserOverrides(userId) {
    return Object.keys(userCustomModules[userId] || {}).length > 0;
  }

  function toggleModule(roleId, moduleId) {
    setRoles(prev => ({
      ...prev,
      [roleId]: { ...prev[roleId], modules: { ...prev[roleId].modules, [moduleId]: !prev[roleId].modules[moduleId] } }
    }));
    setSaved(false);
  }

  function setAllModules(roleId, val) {
    setRoles(prev => ({
      ...prev,
      [roleId]: { ...prev[roleId], modules: Object.fromEntries(MODULES.map(m => [m.id, val])) }
    }));
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function addUser(e) {
    e.preventDefault();
    setUsers(prev => [...prev, { ...userForm, id: Date.now() }]);
    setUserForm({ nom: '', email: '', role: 'rh', titre: '' });
    setShowAddUser(false);
  }

  const role = roles[selectedRole];
  const nbModulesActifs = Object.values(role?.modules || {}).filter(Boolean).length;
  const nbTotal = MODULES.length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, color: 'var(--text)' }}>Gestion du logiciel</h1>
        <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: 14 }}>
          Configurez les accès aux fonctionnalités pour chaque profil d'utilisateur
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, background: 'var(--bg)', borderRadius: 12, padding: 4, marginBottom: 24, width: 'fit-content' }}>
        {[{ id: 'roles', label: '🔑 Profils & Droits' }, { id: 'utilisateurs', label: '👤 Utilisateurs' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 20px', border: 'none', borderRadius: 9, cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all 0.15s',
            background: tab === t.id ? 'var(--card)' : 'transparent',
            color: tab === t.id ? 'var(--text)' : 'var(--text-secondary)',
            boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ══ TAB ROLES ══ */}
      {tab === 'roles' && (
        <div style={{ display: 'flex', gap: 20 }}>
          {/* Left: role selector */}
          <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(roles).map(([id, r]) => (
              <button key={id} onClick={() => setSelectedRole(id)} style={{
                padding: '12px 16px', border: selectedRole === id ? `2px solid ${r.color}` : '1px solid var(--border)',
                borderRadius: 12, cursor: 'pointer', textAlign: 'left', background: selectedRole === id ? `${r.color}10` : 'var(--card)',
                transition: 'all 0.15s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {Object.values(r.modules).filter(Boolean).length}/{MODULES.length} modules
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Right: module permissions */}
          <div style={{ flex: 1 }}>
            <div style={{ background: 'var(--card)', borderRadius: 16, padding: 24, boxShadow: 'var(--shadow)' }}>
              {/* Role header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 28 }}>{role?.icon}</span>
                    <div>
                      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>{role?.label}</h2>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>{role?.description}</p>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{nbModulesActifs}/{nbTotal} modules actifs</span>
                  <button onClick={() => setAllModules(selectedRole, true)} style={{ padding: '6px 12px', background: '#34C75918', color: '#1A7F43', border: '1px solid #34C759', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Tout activer</button>
                  <button onClick={() => setAllModules(selectedRole, false)} style={{ padding: '6px 12px', background: '#FF3B3010', color: '#C0392B', border: '1px solid #FF3B30', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Tout désactiver</button>
                  <button onClick={handleSave} style={{ padding: '7px 18px', background: saved ? '#34C759' : 'var(--primary)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                    {saved ? '✓ Sauvegardé' : 'Sauvegarder'}
                  </button>
                </div>
              </div>

              {/* Modules by group */}
              {GROUPES.map(groupe => {
                const gModules = MODULES.filter(m => m.groupe === groupe);
                const nbActifs = gModules.filter(m => role?.modules[m.id]).length;
                return (
                  <div key={groupe} style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.6, margin: 0 }}>{groupe}</h3>
                      <span style={{ fontSize: 11, color: nbActifs === gModules.length ? '#1A7F43' : nbActifs === 0 ? '#C0392B' : '#856404', fontWeight: 600 }}>
                        {nbActifs}/{gModules.length}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {gModules.map(m => {
                        const actif = !!role?.modules[m.id];
                        const isPatron = selectedRole === 'patron';
                        return (
                          <div key={m.id} style={{
                            display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 12,
                            background: actif ? `${role?.color}08` : 'var(--bg)',
                            border: actif ? `1px solid ${role?.color}30` : '1px solid var(--border-light)',
                            opacity: isPatron ? 0.6 : 1,
                          }}>
                            <span style={{ fontSize: 22, flexShrink: 0 }}>{m.icon}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{m.label}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{m.desc}</div>
                            </div>
                            {isPatron ? (
                              <span style={{ fontSize: 12, color: '#34C759', fontWeight: 600 }}>Accès total (non modifiable)</span>
                            ) : (
                              <button
                                onClick={() => toggleModule(selectedRole, m.id)}
                                style={{
                                  width: 44, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer',
                                  background: actif ? role?.color : '#C7C7CC',
                                  position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                                }}
                              >
                                <div style={{
                                  position: 'absolute', width: 20, height: 20, borderRadius: '50%', background: '#fff',
                                  top: 3, left: actif ? 21 : 3, transition: 'left 0.2s',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                }} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ TAB UTILISATEURS ══ */}
      {tab === 'utilisateurs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{users.length} utilisateur{users.length > 1 ? 's' : ''} dans votre organisation</div>
            <button onClick={() => setShowAddUser(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
              + Inviter un utilisateur
            </button>
          </div>

          {showAddUser && (
            <form onSubmit={addUser} style={{ background: 'var(--card)', borderRadius: 14, padding: 22, boxShadow: 'var(--shadow)', border: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Inviter un nouvel utilisateur</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Nom complet *</label>
                  <input value={userForm.nom} onChange={e => setUserForm(p => ({ ...p, nom: e.target.value }))} placeholder="Prénom Nom" required style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Email *</label>
                  <input type="email" value={userForm.email} onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} placeholder="prenom@votre-entreprise.fr" required style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Profil d'accès</label>
                  <select value={userForm.role} onChange={e => setUserForm(p => ({ ...p, role: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}>
                    {Object.entries(roles).filter(([id]) => id !== 'patron').map(([id, r]) => (
                      <option key={id} value={id}>{r.icon} {r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Titre / Poste</label>
                  <input value={userForm.titre} onChange={e => setUserForm(p => ({ ...p, titre: e.target.value }))} placeholder="Ex : Responsable RH" style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--bg)', borderRadius: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
                <strong>Accès accordés avec le profil "{roles[userForm.role]?.label}" :</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {MODULES.filter(m => roles[userForm.role]?.modules[m.id]).map(m => (
                    <span key={m.id} style={{ fontSize: 11, padding: '2px 8px', background: '#D1F2E0', color: '#1A7F43', borderRadius: 8, fontWeight: 600 }}>{m.label}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
                <button type="button" onClick={() => setShowAddUser(false)} style={{ padding: '9px 18px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--card)', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
                <button type="submit" style={{ padding: '9px 22px', border: 'none', borderRadius: 10, background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Envoyer l'invitation</button>
              </div>
            </form>
          )}

          {/* Users list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {users.map(u => {
              const r = roles[u.role];
              const effectiveModules = getUserModules(u);
              const nbAcces = Object.values(effectiveModules).filter(Boolean).length;
              const isEditing = editingUserId === u.id;
              const hasOverrides = hasUserOverrides(u.id);
              return (
                <div key={u.id} style={{ background: 'var(--card)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden', border: isEditing ? `2px solid ${r?.color}` : '1px solid var(--border-light)' }}>
                  {/* User row */}
                  <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${r?.color}20`, color: r?.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                      {u.nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{u.nom}</div>
                        {hasOverrides && <span style={{ fontSize: 10, padding: '2px 7px', background: '#FF950018', color: '#E65100', border: '1px solid #FF950040', borderRadius: 20, fontWeight: 700 }}>Accès personnalisé</span>}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{u.email}{u.titre ? ` — ${u.titre}` : ''}</div>
                    </div>
                    <div style={{ textAlign: 'right', marginRight: 8 }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: `${r?.color}18`, border: `1px solid ${r?.color}40` }}>
                        <span style={{ fontSize: 14 }}>{r?.icon}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: r?.color }}>{r?.label}</span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{nbAcces}/{MODULES.length} modules</div>
                    </div>
                    <button
                      onClick={() => setEditingUserId(isEditing ? null : u.id)}
                      style={{ padding: '7px 14px', border: `1px solid ${isEditing ? r?.color : 'var(--border)'}`, borderRadius: 8, background: isEditing ? `${r?.color}15` : 'var(--bg)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: isEditing ? r?.color : 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {isEditing ? '✕ Fermer' : 'Modifier accès →'}
                    </button>
                  </div>

                  {/* Inline per-user access editor */}
                  {isEditing && (
                    <div style={{ borderTop: `1px solid ${r?.color}30`, background: 'var(--bg)', padding: '20px 24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Accès personnalisés — {u.nom}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
                            Base : profil <strong>{r?.label}</strong>. Les modifications s'appliquent uniquement à cet utilisateur.
                          </div>
                        </div>
                        {hasOverrides && (
                          <button onClick={() => resetUserToRole(u.id)} style={{ padding: '6px 14px', border: '1px solid #FF3B30', borderRadius: 8, background: 'transparent', color: '#FF3B30', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                            Réinitialiser au profil
                          </button>
                        )}
                      </div>

                      {GROUPES.map(groupe => {
                        const gModules = MODULES.filter(m => m.groupe === groupe);
                        return (
                          <div key={groupe} style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 }}>{groupe}</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 8 }}>
                              {gModules.map(m => {
                                const effective = !!effectiveModules[m.id];
                                const roleDefault = !!roles[u.role]?.modules[m.id];
                                const hasPersonal = userCustomModules[u.id]?.[m.id] !== undefined;
                                return (
                                  <div key={m.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10,
                                    background: effective ? `${r?.color}08` : 'var(--card)',
                                    border: `1px solid ${hasPersonal ? '#FF9500' : effective ? `${r?.color}30` : 'var(--border-light)'}`,
                                  }}>
                                    <span style={{ fontSize: 18, flexShrink: 0 }}>{m.icon}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{m.label}</div>
                                      {hasPersonal && (
                                        <div style={{ fontSize: 10, color: '#E65100', fontWeight: 600 }}>
                                          {effective !== roleDefault ? (effective ? '↑ Étendu vs profil' : '↓ Restreint vs profil') : 'Remplacé par valeur identique'}
                                        </div>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => toggleUserModule(u.id, m.id, effective)}
                                      style={{
                                        width: 40, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0,
                                        background: effective ? r?.color : '#C7C7CC',
                                        position: 'relative', transition: 'background 0.2s',
                                      }}>
                                      <div style={{
                                        position: 'absolute', width: 18, height: 18, borderRadius: '50%', background: '#fff',
                                        top: 3, left: effective ? 19 : 3, transition: 'left 0.2s',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                                      }} />
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
