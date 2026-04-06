import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { IconCheck, IconX, IconDownload, IconDocument } from '../../components/ui/Icons';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const PRINT_STYLE = `
@media print {
  body * { visibility: hidden !important; }
  #devis-print-area, #devis-print-area * { visibility: visible !important; }
  #devis-print-area { position: fixed; top: 0; left: 0; width: 100%; padding: 24px; background: #fff; }
  .no-print { display: none !important; }
}
`;

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatCurrency(n) {
  return Number(n || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

function calcLine(l) {
  const ht = (Number(l.quantite) || 0) * (Number(l.prixUnitaire) || 0);
  return { ht, tvaAmt: ht * (Number(l.tva) || 0) / 100 };
}

export default function SignatureDevis() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const sigToken = searchParams.get('token');
  const [devis, setDevis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [nomSignataire, setNomSignataire] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = PRINT_STYLE;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch(`${API}/patron/devis-pro/${id}`);
        if (!r.ok) throw new Error('Devis introuvable');
        const d = await r.json();
        setDevis(d);
        if (d.statut === 'signé') setSigned(true);
      } catch (e) {
        setError(e.message || 'Devis introuvable');
      }
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleSign() {
    if (!nomSignataire.trim()) { setError('Veuillez saisir votre nom complet.'); return; }
    if (!accepted) { setError('Vous devez accepter les termes du devis.'); return; }
    if (!sigToken) { setError('Lien de signature invalide ou expiré.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const r = await fetch(`${API}/patron/devis-pro/${id}/signer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nomSignataire, token: sigToken }),
      });
      if (!r.ok) throw new Error('Erreur lors de la signature');
      const updated = await r.json();
      setDevis(updated.devis || devis);
      setSigned(true);
    } catch (e) {
      setError(e.message);
    }
    setSubmitting(false);
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F2F2F7' }}>
      <div style={{ color: '#6E6E73', fontSize: 16 }}>Chargement du devis…</div>
    </div>
  );

  if (error && !devis) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#F2F2F7', gap: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, textAlign: 'center', maxWidth: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <IconX size={40} color="#FF3B30" />
        <h2 style={{ marginTop: 16, color: '#1C1C1E' }}>Devis introuvable</h2>
        <p style={{ color: '#6E6E73', fontSize: 14 }}>Ce lien est invalide ou le devis a été supprimé.</p>
      </div>
    </div>
  );

  const d = devis;
  const totalHT = (d.lignes || []).reduce((s, l) => s + calcLine(l).ht, 0);
  const totalTVA = (d.lignes || []).reduce((s, l) => s + calcLine(l).tvaAmt, 0);
  const totalTTC = totalHT + totalTVA;

  return (
    <div style={{ background: '#F2F2F7', minHeight: '100vh', padding: '32px 16px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Top bar */}
        <div className="no-print" style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#5B5BD6' }}>Bernard Martin BTP</div>
          <div style={{ fontSize: 14, color: '#6E6E73', marginTop: 4 }}>Devis en ligne · Signature électronique sécurisée</div>
        </div>

        {/* Already signed banner */}
        {signed && d.statut === 'signé' && (
          <div style={{
            background: '#D1F2E0', border: '1px solid #34C759', borderRadius: 14,
            padding: '18px 24px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14
          }}>
            <div style={{ background: '#34C759', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <IconCheck size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#1A7F43' }}>Devis signé avec succès !</div>
              <div style={{ fontSize: 13, color: '#2D6A4F', marginTop: 2 }}>
                Signé par <strong>{d.signatureNom}</strong> le {formatDate(d.signeLe)}.
                Vous pouvez télécharger une copie PDF ci-dessous.
              </div>
            </div>
          </div>
        )}

        {/* Devis document */}
        <div id="devis-print-area" style={{ background: '#fff', borderRadius: 16, padding: 40, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 24 }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 36 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#5B5BD6', marginBottom: 4 }}>Bernard Martin BTP</div>
              <div style={{ fontSize: 12, color: '#6E6E73', lineHeight: 1.7 }}>
                12 rue des Artisans, 69002 Lyon<br />
                Tél : 04 78 00 00 00 — contact@bernardmartin-btp.fr<br />
                SIRET : 123 456 789 00012 — TVA : FR12 123 456 789
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: '#1C1C1E' }}>DEVIS</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#5B5BD6', marginTop: 4 }}>{d.numero}</div>
              <div style={{ fontSize: 12, color: '#6E6E73', marginTop: 8 }}>Émis le : {formatDate(d.creeLe)}</div>
              <div style={{ fontSize: 12, color: '#6E6E73' }}>
                Valable jusqu'au : {formatDate(new Date(new Date(d.creeLe).getTime() + (d.validiteDays || 30) * 86400000).toISOString())}
              </div>
            </div>
          </div>

          {/* Client */}
          <div style={{ background: '#F8F9FA', borderRadius: 10, padding: '14px 18px', marginBottom: 24, maxWidth: 300 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Adressé à</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{d.client?.nom}</div>
            {d.client?.adresse && <div style={{ fontSize: 13, color: '#6E6E73', marginTop: 2 }}>{d.client.adresse}</div>}
            {d.client?.email && <div style={{ fontSize: 13, color: '#6E6E73' }}>{d.client.email}</div>}
          </div>

          {/* Objet */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Objet</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{d.objet}</div>
          </div>

          {/* Lines */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#1C1C1E', color: '#fff' }}>
                <th style={{ padding: '10px 12px', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Qté</th>
                <th style={{ padding: '10px 12px', textAlign: 'center' }}>Unité</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>P.U. HT</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>TVA</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Total HT</th>
              </tr>
            </thead>
            <tbody>
              {(d.lignes || []).map((l, i) => {
                const { ht } = calcLine(l);
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #F2F2F7', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                    <td style={{ padding: '10px 12px' }}>{l.description}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>{l.quantite}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center', color: '#6E6E73' }}>{l.unite}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>{Number(l.prixUnitaire).toFixed(2)} €</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', color: '#6E6E73' }}>{l.tva}%</td>
                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>{ht.toFixed(2)} €</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 28 }}>
            <div style={{ minWidth: 250, borderRadius: 10, overflow: 'hidden', border: '1px solid #E5E5EA' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', background: '#FAFAFA', fontSize: 13 }}>
                <span>Total HT</span><span>{formatCurrency(totalHT)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', fontSize: 13, color: '#6E6E73' }}>
                <span>TVA</span><span>{formatCurrency(totalTVA)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: '#5B5BD6', color: '#fff', fontSize: 16, fontWeight: 700 }}>
                <span>Total TTC</span><span>{formatCurrency(totalTTC)}</span>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div style={{ borderTop: '2px solid #F2F2F7', paddingTop: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#636363', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Conditions générales</div>
            <pre style={{ fontSize: 11, color: '#6E6E73', whiteSpace: 'pre-wrap', fontFamily: 'inherit', lineHeight: 1.6, margin: 0 }}>
              {d.conditions}
            </pre>
          </div>

          {/* Signature block */}
          {d.statut === 'signé' && (
            <div style={{ background: '#D1F2E0', borderRadius: 10, padding: '16px 20px', border: '1px solid #34C759', marginTop: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <IconCheck size={16} color="#34C759" />
                <span style={{ fontWeight: 700, color: '#1A7F43', fontSize: 14 }}>Accepté et signé électroniquement</span>
              </div>
              <div style={{ fontSize: 13, color: '#2D6A4F' }}>
                Signataire : <strong>{d.signatureNom}</strong> — Date : <strong>{formatDate(d.signeLe)}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Signature form OR download */}
        {!signed ? (
          <div className="no-print" style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 6px', color: '#1C1C1E' }}>Signer ce devis</h2>
            <p style={{ color: '#6E6E73', fontSize: 14, margin: '0 0 20px', lineHeight: 1.6 }}>
              En signant ce devis, vous acceptez les conditions générales ci-dessus et autorisez les travaux décrits.
            </p>

            {error && (
              <div style={{ background: '#FFE5E5', border: '1px solid #FF3B30', borderRadius: 10, padding: '10px 16px', marginBottom: 16, color: '#C0392B', fontSize: 14 }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#3C3C43', marginBottom: 6 }}>
                Nom complet du signataire *
              </label>
              <input
                value={nomSignataire}
                onChange={e => setNomSignataire(e.target.value)}
                placeholder="Ex. Jean Dupont"
                style={{ width: '100%', padding: '11px 14px', border: '1px solid #E5E5EA', borderRadius: 10, fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#3C3C43', marginBottom: 6 }}>
                Date de signature
              </label>
              <input
                type="text"
                value={new Date().toLocaleDateString('fr-FR')}
                readOnly
                style={{ padding: '10px 14px', border: '1px solid #E5E5EA', borderRadius: 10, fontSize: 14, background: '#F2F2F7', color: '#6E6E73', outline: 'none' }}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', marginBottom: 24 }}>
              <input
                type="checkbox"
                checked={accepted}
                onChange={e => setAccepted(e.target.checked)}
                style={{ marginTop: 2, width: 18, height: 18, accentColor: '#5B5BD6', cursor: 'pointer', flexShrink: 0 }}
              />
              <span style={{ fontSize: 14, color: '#3C3C43', lineHeight: 1.5 }}>
                J'ai lu et j'accepte les termes et conditions générales figurant dans ce devis. Je reconnais que cette
                signature électronique a la même valeur légale qu'une signature manuscrite.
              </span>
            </label>

            <button
              onClick={handleSign}
              disabled={submitting || !nomSignataire.trim() || !accepted}
              style={{
                width: '100%', padding: '14px', border: 'none', borderRadius: 12,
                background: submitting || !nomSignataire.trim() || !accepted ? '#C7C7CC' : '#34C759',
                color: '#fff', fontSize: 16, fontWeight: 700, cursor: submitting || !nomSignataire.trim() || !accepted ? 'default' : 'pointer',
                transition: 'background 0.2s'
              }}
            >
              {submitting ? 'Signature en cours…' : '✓ Signer et accepter le devis'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#636363', marginTop: 12 }}>
              Signature sécurisée · Les deux parties reçoivent une copie du devis signé
            </p>
          </div>
        ) : (
          <div className="no-print" style={{ background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: '#D1F2E0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <IconCheck size={30} color="#34C759" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1C1C1E', margin: '0 0 8px' }}>Devis signé !</h2>
            <p style={{ color: '#6E6E73', fontSize: 14, margin: '0 0 24px', lineHeight: 1.6 }}>
              Merci <strong>{d.signatureNom}</strong>. Votre acceptation a bien été enregistrée.<br />
              L'entreprise a été notifiée et vous contactera prochainement.
            </p>
            <button onClick={() => window.print()} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 24px',
              border: '1px solid #E5E5EA', borderRadius: 12, background: '#fff',
              cursor: 'pointer', fontSize: 15, fontWeight: 600, color: '#1C1C1E'
            }}>
              <IconDownload size={16} /> Télécharger le PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
