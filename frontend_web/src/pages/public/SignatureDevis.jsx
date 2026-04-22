import React, { useState, useEffect } from 'react';
import { isDemo as _isDemo, demoGet, demoSet } from '../../utils/storage';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { IconCheck, IconX } from '../../components/ui/Icons';
import { secureToken, secureTempPassword, sha256, expiresInHours } from '../../utils/security';

const L = {
  gold: '#A68B4B', goldLight: '#F5EFE0', border: '#E8E6E1', bg: '#FAFAF8',
  text: '#1A1A1A', muted: '#333', subtle: '#555', green: '#16A34A', greenBg: '#F0FDF4',
  red: '#DC2626', redBg: '#FEF2F2', blue: '#2563EB', blueBg: '#EFF6FF', orange: '#D97706',
};

function fmtDate(iso) { return iso ? new Date(iso).toLocaleDateString('fr-FR') : '—'; }
function fmtE(n) { return Number(n || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }); }
function calcLine(l) { const ht = (Number(l.quantite) || 0) * (Number(l.prixUnitaire) || 0) * (1 - (Number(l.remise) || 0) / 100); return { ht, tvaAmt: ht * (Number(l.tva) || 0) / 100 }; }

export default function SignatureDevis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [devis, setDevis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [action, setAction] = useState(null); // 'sign_pay' | 'modif' | 'refuse' | null
  const [nomSignataire, setNomSignataire] = useState('');
  const [acceptCGU, setAcceptCGU] = useState(false);
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [paymentMode, setPaymentMode] = useState('cb'); // 'cb' | 'sepa'
  const [cbNum, setCbNum] = useState('4242 4242 4242 4242');
  const [cbExp, setCbExp] = useState('12/28');
  const [cbCvv, setCbCvv] = useState('123');
  const [iban, setIban] = useState('FR76 3000 1007 9412 3456 7890 185');
  const [modifMsg, setModifMsg] = useState('');
  const [refuseMsg, setRefuseMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false); // final state: signed + paid + account created
  const [magicLink, setMagicLink] = useState('');

  useEffect(() => {
    const all = demoGet('freample_devis', []);
    const d = all.find(x => String(x.id) === String(id));
    if (!d) { setError('Devis introuvable ou lien invalide'); setLoading(false); return; }
    setDevis(d);
    setNomSignataire(d.client || '');
    setEmail(d.clientEmail || '');
    setTel(d.clientTel || '');
    if (d.statut === 'signe' || d.statut === 'signé') { setDone(true); }
    setLoading(false);
  }, [id]);

  // Tout-en-un : signature + paiement + création compte auto
  async function signerEtPayer() {
    if (!nomSignataire.trim()) { setError('Saisissez votre nom.'); return; }
    if (!email.trim() || !email.includes('@')) { setError('Saisissez un email valide.'); return; }
    if (!acceptCGU) { setError('Vous devez accepter les CGU et le paiement.'); return; }
    if (paymentMode === 'cb' && (!cbNum || !cbExp || !cbCvv)) { setError('Remplissez les infos de carte bancaire.'); return; }
    if (paymentMode === 'sepa' && !iban.trim()) { setError('Saisissez un IBAN.'); return; }
    setError('');
    setSubmitting(true);

    // Exécution asynchrone (avec hashing du mot de passe via Web Crypto)
    await new Promise(resolve => setTimeout(resolve, 1500));
    {
      const all = demoGet('freample_devis', []);
      const idx = all.findIndex(x => String(x.id) === String(id));
      if (idx < 0) { setSubmitting(false); return; }
      const d = all[idx];
      const now = new Date().toISOString();
      const premierePct = d.echeancier?.[0]?.pct || 30;
      const montantAcompte = Math.round((d.montantTTC || 0) * premierePct / 100 * 100) / 100;

      // 1. Mise à jour devis : signé + payé
      all[idx] = {
        ...d, statut: 'signe', signatureNom: nomSignataire, signeLe: now,
        clientEmail: email, clientTel: tel, acomptePaye: true, acompteMontant: montantAcompte,
        modePaiement: paymentMode,
      };
      demoSet('freample_devis', all);

      // 2. Création facture d'acompte directement en séquestre (payée)
      const factures = demoGet('freample_factures', []);
      const numFact = `FAC-${new Date().getFullYear()}-${String(factures.length + 1).padStart(3, '0')}`;
      factures.push({
        id: Date.now(), numero: numFact, devisId: d.id, projetId: d.projetId,
        type: 'acompte', client: d.client, clientEmail: email,
        objet: `Acompte ${premierePct}% — ${d.objet}`,
        montant: montantAcompte, montantTTC: montantAcompte,
        statut: 'sequestre', source: d.source || 'manuel', date: now.slice(0, 10),
        payeLe: now, modePaiement: paymentMode,
        aeNom: d.aeNom, emetteur: d.emetteur,
        commission: Math.max(1, Math.round(montantAcompte * 0.01 * 100) / 100),
      });
      demoSet('freample_factures', factures);

      // 3. Création chantier (directement en cours puisque payé)
      const chantiers = demoGet('freample_chantiers_custom', []);
      const chantierId = Date.now() + 1;
      chantiers.push({
        id: chantierId,
        titre: d.objet || 'Nouveau chantier',
        metier: d.lots?.[0] || 'BTP',
        client: d.client, clientEmail: email, clientTel: tel,
        adresse: d.adresseChantier || d.clientAdresse || '',
        ville: (d.adresseChantier || d.clientAdresse || '').split(',').pop()?.trim() || '',
        dateDebut: d.dateDebut || now.slice(0, 10),
        dateFin: '',
        statut: 'en_cours',
        budget: d.montantTTC || 0,
        devisId: d.id, projetId: d.projetId,
        equipe: [], vehicules: [],
        creeParDevis: true, dateCreation: now,
        avancement: 0,
      });
      demoSet('freample_chantiers_custom', chantiers);

      // 4. Création compte auto client (si pas déjà existant)
      const DEMO_EMAILS = ['freamplecom@gmail.com','demo-client@freample.fr','demo-entreprise@freample.fr','demo-sci@freample.fr','demo-patron@freample.fr','demo-ae@freample.fr','demo-employe@freample.fr','demo-artisan@freample.fr'];
      let magicToken = '';
      let createdAccount = false;
      if (!DEMO_EMAILS.includes(email)) {
        const autoComptes = demoGet('freample_clients_auto', []);
        let compte = autoComptes.find(c => c.email === email);
        const tokenExpire = expiresInHours(24); // Magic link valable 24h (au lieu de "30 jours" non appliqué)
        if (!compte) {
          // Token cryptographiquement sécurisé (256 bits d'entropie)
          magicToken = secureToken(32);
          const mdpClair = secureTempPassword(12);
          // Hasher le mot de passe avant stockage (ne jamais stocker en clair)
          const mdpHash = await sha256(mdpClair);
          compte = {
            id: 10000 + autoComptes.length + 1,
            email, nom: nomSignataire, tel,
            motDePasseHash: mdpHash,    // Hash SHA-256, pas le mdp en clair
            magicToken,
            magicTokenExpire: tokenExpire,
            magicTokenUsed: false,
            mdpDefinitif: false,        // doit le changer à la 1ere connexion
            profilComplet: false,
            cree: now, devisOrigine: d.id, chantierId,
          };
          autoComptes.push(compte);
          demoSet('freample_clients_auto', autoComptes);
          createdAccount = true;

          // 5. Email simulé avec lien magique
          const emails = demoGet('freample_emails_envoyes', []);
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
          const lien = `${baseUrl}/setup-compte/${magicToken}`;
          emails.push({
            id: Date.now() + 10, to: email, date: now,
            sujet: `Votre chantier Freample — accès à votre espace`,
            contenu: `Bonjour ${nomSignataire},\n\nVotre devis ${d.numero} a été signé et l'acompte de ${fmtE(montantAcompte)} a été reçu. Les travaux peuvent démarrer.\n\nUn compte Freample a été créé pour vous permettre de suivre l'avancement de votre chantier. Cliquez sur le lien suivant pour définir votre mot de passe et accéder à votre espace :\n\n${lien}\n\nCe lien est valable 24 heures.\n\nCordialement,\nL'équipe Freample`,
            devisId: d.id,
            magicLink: lien,
          });
          demoSet('freample_emails_envoyes', emails);
          setMagicLink(lien);
        } else {
          // Compte existe déjà : régénération du magic token avec expiration fraîche
          magicToken = secureToken(32);
          compte.magicToken = magicToken;
          compte.magicTokenExpire = tokenExpire;
          compte.magicTokenUsed = false;
          const idx2 = autoComptes.findIndex(c => c.email === email);
          if (idx2 >= 0) { autoComptes[idx2] = compte; demoSet('freample_clients_auto', autoComptes); }
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
          setMagicLink(`${baseUrl}/setup-compte/${magicToken}`);
        }
      }

      // 6. Notifications patron
      const notifs = demoGet('freample_notifs_patron', []);
      notifs.push({
        id: Date.now() + 2, date: now, type: 'devis_signe_paye',
        titre: 'Devis signé et payé !', message: `${d.client} a signé le devis ${d.numero} et réglé l'acompte (${fmtE(montantAcompte)}). Vous pouvez démarrer les travaux.`,
        lien: `/patron/missions`, lu: false,
      });
      demoSet('freample_notifs_patron', notifs);

      setDevis(all[idx]);
      setSubmitting(false);
      setDone(true);
    }
  }

  function demanderModif() {
    if (!modifMsg.trim()) return;
    const all = demoGet('freample_devis', []);
    const idx = all.findIndex(x => String(x.id) === String(id));
    if (idx < 0) return;
    all[idx] = { ...all[idx], statut: 'modif_demandee', modifMessage: modifMsg, modifDate: new Date().toISOString() };
    demoSet('freample_devis', all);
    const notifs = demoGet('freample_notifs_patron', []);
    notifs.push({ id: Date.now(), date: new Date().toISOString(), type: 'devis_modif', titre: 'Modification demandée', message: `${all[idx].client} demande une modification : "${modifMsg.slice(0, 80)}..."`, lien: `/patron/devis-factures`, lu: false });
    demoSet('freample_notifs_patron', notifs);
    setDevis(all[idx]);
    setAction('modif_sent');
  }

  function refuserDevis() {
    const all = demoGet('freample_devis', []);
    const idx = all.findIndex(x => String(x.id) === String(id));
    if (idx < 0) return;
    all[idx] = { ...all[idx], statut: 'refuse', refuseMessage: refuseMsg, refuseDate: new Date().toISOString() };
    demoSet('freample_devis', all);
    const notifs = demoGet('freample_notifs_patron', []);
    notifs.push({ id: Date.now(), date: new Date().toISOString(), type: 'devis_refuse', titre: 'Devis refusé', message: `${all[idx].client} a refusé le devis ${all[idx].numero}${refuseMsg ? ` : "${refuseMsg}"` : ''}`, lien: `/patron/devis-factures`, lu: false });
    demoSet('freample_notifs_patron', notifs);
    setDevis(all[idx]);
    setAction('refuse_sent');
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: L.bg, fontFamily: 'Inter, sans-serif' }}><div style={{ color: L.subtle }}>Chargement...</div></div>;

  if (error && !devis) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: L.bg, padding: 20, fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, textAlign: 'center', maxWidth: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <IconX size={40} color={L.red} />
        <h2 style={{ marginTop: 16, color: L.text }}>Lien invalide</h2>
        <p style={{ color: L.subtle, fontSize: 14 }}>Ce devis est introuvable ou le lien a expiré.</p>
      </div>
    </div>
  );

  const d = devis;
  const totalHT = (d.lignes || []).reduce((s, l) => s + calcLine(l).ht, 0) || d.montantHT || 0;
  const totalTVA = (d.lignes || []).reduce((s, l) => s + calcLine(l).tvaAmt, 0) || d.tva || 0;
  const totalTTC = totalHT + totalTVA || d.montantTTC || 0;
  const isAE = d.isAE || d.aeNom;
  const premierePct = d.echeancier?.[0]?.pct || 30;
  const montantAcompte = Math.round(totalTTC * premierePct / 100 * 100) / 100;

  return (
    <div style={{ background: L.bg, minHeight: '100vh', padding: '24px 16px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 22, fontWeight: 900, color: L.gold, letterSpacing: '-0.03em' }}>Freample</div>
          <div style={{ fontSize: 12, color: L.subtle, marginTop: 4 }}>Devis electronique sécurise</div>
        </div>

        {/* État final : tout est fait */}
        {done && (
          <div style={{ background: L.greenBg, border: `2px solid ${L.green}`, borderRadius: 14, padding: 24, marginBottom: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>✓</div>
            <div style={{ fontWeight: 800, color: L.green, fontSize: 18 }}>Devis signé et acompte payé !</div>
            <div style={{ fontSize: 13, color: L.muted, marginTop: 8, lineHeight: 1.5 }}>
              Merci {d.signatureNom || nomSignataire}. L'acompte de <strong>{fmtE(d.acompteMontant || montantAcompte)}</strong> a été reçu par Freample (séquestre sécurisé).
              L'entreprise a été notifiée et peut démarrer les travaux.
            </div>
            {magicLink && (
              <div style={{ marginTop: 16, padding: 14, background: '#fff', borderRadius: 10, border: `1px solid ${L.border}`, textAlign: 'left' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: L.gold, marginBottom: 6 }}>📧 Email envoyé à {email}</div>
                <div style={{ fontSize: 12, color: L.muted, marginBottom: 8 }}>
                  Un compte Freample a été créé pour suivre votre chantier. Cliquez sur le lien ci-dessous pour définir votre mot de passe :
                </div>
                <button onClick={() => navigate(magicLink.replace(window.location.origin, ''))}
                  style={{ padding: '10px 20px', background: L.gold, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', width: '100%' }}>
                  Accéder à mon espace
                </button>
              </div>
            )}
          </div>
        )}

        {/* Banner statuts secondaires */}
        {action === 'modif_sent' && (
          <div style={{ background: L.blueBg, border: `1px solid ${L.blue}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: L.blue }}>Demande envoyée</div>
            <div style={{ fontSize: 13, color: L.subtle, marginTop: 4 }}>L'entreprise recevra votre demande et vous enverra une nouvelle version du devis.</div>
          </div>
        )}
        {action === 'refuse_sent' && (
          <div style={{ background: L.redBg, border: `1px solid ${L.red}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: L.red }}>Devis refusé</div>
            <div style={{ fontSize: 13, color: L.subtle, marginTop: 4 }}>L'entreprise a été notifiée.</div>
          </div>
        )}

        {/* Devis document */}
        <div style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 }}>
          {/* Emetteur / Numéro */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: L.text }}>{d.emetteur?.nom || d.aeNom || 'Entreprise'}</div>
              {d.emetteur?.forme && <div style={{ fontSize: 11, color: L.subtle }}>{d.emetteur.forme} — SIRET {d.emetteur?.siret || ''}</div>}
              {d.emetteur?.adresse && <div style={{ fontSize: 11, color: L.subtle }}>{d.emetteur.adresse}</div>}
              {d.emetteur?.decennale && <div style={{ fontSize: 11, color: L.subtle }}>Décennale {d.emetteur.decennale}</div>}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: L.gold }}>DEVIS</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: L.text, marginTop: 4 }}>{d.numero}</div>
              <div style={{ fontSize: 11, color: L.subtle, marginTop: 4 }}>Date : {fmtDate(d.date || d.creeLe)}</div>
              <div style={{ fontSize: 11, color: L.subtle }}>Validité : {d.validiteJours || 30} jours</div>
            </div>
          </div>

          {/* Client */}
          <div style={{ background: L.bg, borderRadius: 10, padding: '14px 18px', marginBottom: 18, maxWidth: 350 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: L.muted, textTransform: 'uppercase', marginBottom: 4 }}>Client</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{d.client}</div>
            {d.clientAdresse && <div style={{ fontSize: 12, color: L.subtle }}>{d.clientAdresse}</div>}
          </div>

          {/* Objet */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: L.muted, textTransform: 'uppercase', marginBottom: 4 }}>Objet</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{d.objet}</div>
          </div>

          {/* Lignes */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 16 }}>
            <thead>
              <tr style={{ background: L.goldLight }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700 }}>Description</th>
                <th style={{ padding: '8px 10px', textAlign: 'center', width: 50 }}>Qté</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', width: 80 }}>P.U. HT</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', width: 90 }}>Total HT</th>
              </tr>
            </thead>
            <tbody>
              {(d.lignes || []).map((l, i) => {
                const { ht } = calcLine(l);
                return (
                  <tr key={i} style={{ borderBottom: `1px solid ${L.border}` }}>
                    <td style={{ padding: '8px 10px' }}>{l.description}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>{l.quantite} {l.unite}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right' }}>{fmtE(l.prixUnitaire)}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>{fmtE(ht)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totaux */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ minWidth: 260, borderRadius: 10, overflow: 'hidden', border: `1px solid ${L.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', fontSize: 12 }}><span style={{ color: L.subtle }}>Total HT</span><span style={{ fontWeight: 600 }}>{fmtE(totalHT)}</span></div>
              {isAE ? (
                <div style={{ padding: '6px 14px', background: L.bg, fontSize: 10, color: L.gold, fontWeight: 600 }}>TVA non applicable, art. 293B du CGI</div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', background: L.bg, fontSize: 12 }}><span style={{ color: L.subtle }}>TVA</span><span style={{ fontWeight: 600 }}>{fmtE(totalTVA)}</span></div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 14px', background: L.gold, color: '#fff', fontSize: 15, fontWeight: 800 }}><span>Total TTC</span><span>{fmtE(totalTTC)}</span></div>
            </div>
          </div>

          {/* Signature si déjà fait */}
          {done && (
            <div style={{ marginTop: 18, padding: 14, background: L.greenBg, borderRadius: 10, border: `1px solid ${L.green}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <IconCheck size={16} color={L.green} />
                <span style={{ fontWeight: 700, color: L.green, fontSize: 13 }}>Accepté, signé et payé</span>
              </div>
              <div style={{ fontSize: 12, color: L.subtle }}>Signataire : <strong>{d.signatureNom}</strong> — {fmtDate(d.signeLe)} — Acompte {fmtE(d.acompteMontant || montantAcompte)}</div>
            </div>
          )}
        </div>

        {/* Actions (si devis pas encore traité) */}
        {!done && !action && d.statut !== 'refuse' && d.statut !== 'modif_demandee' && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 12px' }}>Votre décision</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => setAction('sign_pay')}
                style={{ padding: '16px 20px', background: L.green, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                Accepter, signer et payer l'acompte ({fmtE(montantAcompte)})
              </button>
              <button onClick={() => setAction('modif')}
                style={{ padding: '12px 20px', background: 'transparent', color: L.blue, border: `1px solid ${L.blue}`, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Demander une modification
              </button>
              <button onClick={() => setAction('refuse')}
                style={{ padding: '10px 20px', background: 'transparent', color: L.red, border: 'none', borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>
                Refuser le devis
              </button>
            </div>
          </div>
        )}

        {/* Formulaire combiné : signature + paiement + création compte */}
        {action === 'sign_pay' && !done && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px' }}>Signer et payer l'acompte</h2>
            <p style={{ fontSize: 13, color: L.subtle, margin: '0 0 16px' }}>
              Signature électronique + paiement sécurisé. Votre acompte est bloqué en séquestre Freample.
            </p>
            {error && <div style={{ background: L.redBg, border: `1px solid ${L.red}`, padding: 10, borderRadius: 8, color: L.red, fontSize: 13, marginBottom: 12 }}>{error}</div>}

            {/* Étape 1 : Infos */}
            <div style={{ marginBottom: 18, padding: 14, background: L.bg, borderRadius: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: L.muted, textTransform: 'uppercase', marginBottom: 10 }}>Vos informations</div>
              <label style={{ fontSize: 11, fontWeight: 600, color: L.subtle, display: 'block', marginBottom: 3 }}>Nom complet du signataire *</label>
              <input value={nomSignataire} onChange={e => setNomSignataire(e.target.value)} placeholder="Jean Dupont"
                style={{ width: '100%', padding: 11, border: `1px solid ${L.border}`, borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 10 }} />
              <label style={{ fontSize: 11, fontWeight: 600, color: L.subtle, display: 'block', marginBottom: 3 }}>Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votre@email.fr"
                style={{ width: '100%', padding: 11, border: `1px solid ${L.border}`, borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 10 }} />
              <label style={{ fontSize: 11, fontWeight: 600, color: L.subtle, display: 'block', marginBottom: 3 }}>Téléphone</label>
              <input value={tel} onChange={e => setTel(e.target.value)} placeholder="06 12 34 56 78"
                style={{ width: '100%', padding: 11, border: `1px solid ${L.border}`, borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>

            {/* Étape 2 : Paiement */}
            <div style={{ marginBottom: 18, padding: 14, background: L.bg, borderRadius: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: L.muted, textTransform: 'uppercase', marginBottom: 10 }}>Paiement de l'acompte ({premierePct}%) — {fmtE(montantAcompte)}</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <button onClick={() => setPaymentMode('cb')} style={{ flex: 1, padding: 10, background: paymentMode === 'cb' ? L.gold : 'transparent', color: paymentMode === 'cb' ? '#fff' : L.muted, border: `1px solid ${paymentMode === 'cb' ? L.gold : L.border}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Carte bancaire</button>
                <button onClick={() => setPaymentMode('sepa')} style={{ flex: 1, padding: 10, background: paymentMode === 'sepa' ? L.gold : 'transparent', color: paymentMode === 'sepa' ? '#fff' : L.muted, border: `1px solid ${paymentMode === 'sepa' ? L.gold : L.border}`, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>SEPA</button>
              </div>
              {paymentMode === 'cb' && (
                <>
                  <label style={{ fontSize: 11, fontWeight: 600, color: L.subtle, display: 'block', marginBottom: 3 }}>Numéro de carte</label>
                  <input value={cbNum} onChange={e => setCbNum(e.target.value)} placeholder="4242 4242 4242 4242"
                    style={{ width: '100%', padding: 11, border: `1px solid ${L.border}`, borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 10, fontFamily: 'monospace' }} />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: L.subtle, display: 'block', marginBottom: 3 }}>Expiration</label>
                      <input value={cbExp} onChange={e => setCbExp(e.target.value)} placeholder="MM/YY"
                        style={{ width: '100%', padding: 11, border: `1px solid ${L.border}`, borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }} />
                    </div>
                    <div style={{ width: 100 }}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: L.subtle, display: 'block', marginBottom: 3 }}>CVV</label>
                      <input value={cbCvv} onChange={e => setCbCvv(e.target.value)} placeholder="123"
                        style={{ width: '100%', padding: 11, border: `1px solid ${L.border}`, borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }} />
                    </div>
                  </div>
                </>
              )}
              {paymentMode === 'sepa' && (
                <>
                  <label style={{ fontSize: 11, fontWeight: 600, color: L.subtle, display: 'block', marginBottom: 3 }}>IBAN</label>
                  <input value={iban} onChange={e => setIban(e.target.value)} placeholder="FR76..."
                    style={{ width: '100%', padding: 11, border: `1px solid ${L.border}`, borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }} />
                </>
              )}
            </div>

            {/* Étape 3 : Consentement global */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 16, padding: 12, background: L.goldLight, borderRadius: 8 }}>
              <input type="checkbox" checked={acceptCGU} onChange={e => setAcceptCGU(e.target.checked)} style={{ marginTop: 3, width: 16, height: 16, cursor: 'pointer', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: L.muted, lineHeight: 1.5 }}>
                <strong>J'accepte</strong> les conditions générales du devis, je reconnais avoir reçu le devis avant exécution des travaux, j'autorise le prélèvement de <strong>{fmtE(montantAcompte)}</strong> sur mon moyen de paiement, et j'accepte les CGU Freample ainsi que la création automatique de mon compte pour suivre mon chantier.
              </span>
            </label>

            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setAction(null)}
                style={{ padding: '12px 18px', background: 'transparent', color: L.muted, border: `1px solid ${L.border}`, borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>
                Annuler
              </button>
              <button onClick={signerEtPayer} disabled={submitting || !nomSignataire.trim() || !email.trim() || !acceptCGU}
                style={{ flex: 1, padding: 14, background: submitting || !nomSignataire.trim() || !email.trim() || !acceptCGU ? '#C7C7CC' : L.green, color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: submitting || !nomSignataire.trim() || !email.trim() || !acceptCGU ? 'default' : 'pointer' }}>
                {submitting ? 'Traitement en cours...' : `Signer et payer ${fmtE(montantAcompte)}`}
              </button>
            </div>
            <p style={{ textAlign: 'center', fontSize: 10, color: L.subtle, marginTop: 10 }}>Paiement sécurisé · Séquestre Freample · Commission 1%</p>
          </div>
        )}

        {/* Formulaire demande modif */}
        {action === 'modif' && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 12px' }}>Demander une modification</h2>
            <textarea value={modifMsg} onChange={e => setModifMsg(e.target.value)} placeholder="Décrivez ce que vous souhaitez modifier..."
              style={{ width: '100%', minHeight: 100, padding: 12, border: `1px solid ${L.border}`, borderRadius: 10, fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 12, fontFamily: 'inherit', resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setAction(null)} style={{ padding: '11px 18px', background: 'transparent', color: L.muted, border: `1px solid ${L.border}`, borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>Annuler</button>
              <button onClick={demanderModif} disabled={!modifMsg.trim()}
                style={{ flex: 1, padding: 12, background: !modifMsg.trim() ? '#C7C7CC' : L.blue, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: !modifMsg.trim() ? 'default' : 'pointer' }}>
                Envoyer la demande
              </button>
            </div>
          </div>
        )}

        {/* Formulaire refus */}
        {action === 'refuse' && (
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 12px' }}>Refuser le devis</h2>
            <textarea value={refuseMsg} onChange={e => setRefuseMsg(e.target.value)} placeholder="Motif du refus (optionnel)..."
              style={{ width: '100%', minHeight: 80, padding: 12, border: `1px solid ${L.border}`, borderRadius: 10, fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 12, fontFamily: 'inherit', resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setAction(null)} style={{ padding: '11px 18px', background: 'transparent', color: L.muted, border: `1px solid ${L.border}`, borderRadius: 10, fontSize: 13, cursor: 'pointer' }}>Annuler</button>
              <button onClick={refuserDevis} style={{ flex: 1, padding: 12, background: L.red, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Confirmer le refus
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
