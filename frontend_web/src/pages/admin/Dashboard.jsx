import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { IconUser, IconTeam, IconMissions, IconCheck, IconX, IconAlert, IconShield } from '../../components/ui/Icons';

const ROLE_MAP = {
  super_admin: { cls: 'badge badge-purple', label: 'Super Admin' },
  patron:      { cls: 'badge badge-blue',   label: 'Patron'      },
  artisan:     { cls: 'badge badge-green',  label: 'Artisan'     },
  client:      { cls: 'badge badge-gray',   label: 'Client'      },
};

export default function DashboardAdmin() {
  const [data, setData]         = useState(null);
  const [enAttente, setEnAttente] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/admin'),
      api.get('/admin/artisans-en-attente'),
    ]).then(([d, a]) => {
      setData(d.data);
      setEnAttente(a.data.artisans);
    }).finally(() => setLoading(false));
  }, []);

  async function validerArtisan(id, decision) {
    await api.put(`/admin/valider-artisan/${id}`, { decision });
    const { data: a } = await api.get('/admin/artisans-en-attente');
    setEnAttente(a.artisans);
  }

  async function suspendreCompte(id) {
    await api.put(`/admin/suspendre/${id}`);
    const { data: d } = await api.get('/dashboard/admin');
    setData(d);
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner" style={{ width: 28, height: 28 }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div>
        <h1>Administration</h1>
        <p style={{ marginTop: 4 }}>Gestion de la plateforme et des utilisateurs</p>
      </div>

      {/* KPIs globaux */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        <KpiCard label="Utilisateurs" valeur={data?.statistiques_globales?.utilisateurs_total || 0} Icon={IconUser}     color="blue"   />
        <KpiCard label="Clients"      valeur={data?.statistiques_globales?.par_role?.clients  || 0} Icon={IconTeam}     color="blue"   />
        <KpiCard label="Artisans"     valeur={data?.statistiques_globales?.par_role?.artisans || 0} Icon={IconShield}   color="green"  />
        <KpiCard label="Missions actives" valeur={data?.statistiques_globales?.missions_actives || 0} Icon={IconMissions} color="blue" />
      </div>

      {/* Artisans en attente */}
      {enAttente.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <h2>Artisans en attente de validation</h2>
            <span className="badge badge-yellow">{enAttente.length}</span>
          </div>
          <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{ background: 'var(--warning-light)', padding: '10px 20px', borderBottom: '1px solid rgba(255,149,0,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <IconAlert size={14} color="var(--warning)" />
              <span style={{ fontSize: '0.8125rem', color: '#7A5C00', fontWeight: 500 }}>
                {enAttente.length} compte(s) artisan en attente de vérification et validation
              </span>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Artisan</th>
                  <th>Email</th>
                  <th>Inscrit le</th>
                  <th>Documents vérification</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enAttente.map(u => {
                  const docs = u.documents || {};
                  const docsReqIds = ['piece_identite','kbis','rc_pro','attestation_urssaf','diplome','rib'];
                  const docsLabels = { piece_identite: 'CNI', kbis: 'Kbis', rc_pro: 'RC Pro', attestation_urssaf: 'URSSAF', diplome: 'Diplôme', rib: 'RIB' };
                  const nbReqDocs = docsReqIds.filter(id => docs[id]).length;
                  const dossierComplet = nbReqDocs === 6;
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar avatar-sm">{u.nom?.charAt(0)?.toUpperCase()}</div>
                          <div>
                            <span style={{ fontWeight: 500, display: 'block' }}>{u.nom}</span>
                            {u.metier && <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{u.metier}{u.ville ? ` · ${u.ville}` : ''}</span>}
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>{u.email}</td>
                      <td style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>{u.creeLe?.slice(0, 10)}</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {docsReqIds.map(id => (
                            <span key={id} title={docs[id] ? `${docsLabels[id]} fourni` : `${docsLabels[id]} manquant`} style={{ fontSize: '0.6875rem', fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: docs[id] ? 'var(--success-light)' : 'var(--danger-light)', color: docs[id] ? '#1A7A3C' : 'var(--danger)' }}>
                              {docs[id] ? '✓' : '✗'} {docsLabels[id]}
                            </span>
                          ))}
                          <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: dossierComplet ? 'var(--success-light)' : 'var(--warning-light)', color: dossierComplet ? '#1A7A3C' : '#7A5C00' }}>
                            {nbReqDocs}/6
                          </span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn-secondary"
                            style={{ padding: '5px 12px', fontSize: '0.75rem', opacity: dossierComplet ? 1 : 0.45, cursor: dossierComplet ? 'pointer' : 'not-allowed' }}
                            title={dossierComplet ? 'Valider ce compte artisan' : 'Dossier incomplet — documents manquants'}
                            onClick={() => dossierComplet && validerArtisan(u.id, 'valide')}
                          >
                            <IconCheck size={12} /> Valider
                          </button>
                          <button className="btn-danger" style={{ padding: '5px 12px', fontSize: '0.75rem' }} onClick={() => validerArtisan(u.id, 'rejete')}>
                            <IconX size={12} /> Rejeter
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tous les utilisateurs */}
      <div>
        <h2 style={{ marginBottom: 16 }}>
          Tous les utilisateurs
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-tertiary)', marginLeft: 8 }}>
            ({data?.tous_utilisateurs?.length || 0})
          </span>
        </h2>
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data?.tous_utilisateurs || []).map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar avatar-sm">{u.nom?.charAt(0)?.toUpperCase()}</div>
                      <span style={{ fontWeight: 500 }}>{u.nom}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td><span className={ROLE_MAP[u.role]?.cls || 'badge badge-gray'}>{ROLE_MAP[u.role]?.label || u.role}</span></td>
                  <td>
                    <span className={`badge ${u.suspendu ? 'badge-red' : 'badge-green'}`}>
                      {u.suspendu ? 'Suspendu' : 'Actif'}
                    </span>
                  </td>
                  <td>
                    {u.role !== 'super_admin' && (
                      <button
                        className={u.suspendu ? 'btn-secondary' : 'btn-danger'}
                        style={{ padding: '5px 12px', fontSize: '0.75rem' }}
                        onClick={() => suspendreCompte(u.id)}
                      >
                        {u.suspendu ? <><IconCheck size={12} /> Réactiver</> : <><IconX size={12} /> Suspendre</>}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, valeur, Icon, color = 'blue' }) {
  const colors = {
    blue:  { bg: 'var(--primary-light)', fg: 'var(--primary)' },
    green: { bg: 'var(--success-light)', fg: '#1A7A3C'         },
  };
  const c = colors[color] || colors.blue;
  return (
    <div className="stat-card">
      <div style={{ width: 36, height: 36, borderRadius: 10, background: c.bg, color: c.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Icon size={17} />
      </div>
      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', lineHeight: 1 }}>{valeur}</p>
      <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: 6 }}>{label}</p>
    </div>
  );
}
