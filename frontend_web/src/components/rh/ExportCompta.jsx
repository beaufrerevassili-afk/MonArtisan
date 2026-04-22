import React, { useState, useEffect } from 'react';
import DS from '../../design/luxe';
import api from '../../services/api';
import { isDemo as _isDemo, demoGet, demoSet } from '../../utils/storage';

const CARD = { background:'#fff', border:'1px solid #E8E6E1', borderRadius:14, padding:20 };
const BTN = { padding:'8px 18px', background:'#0A0A0A', color:'#fff', border:'none', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:DS.font };
const BTN_O = { ...BTN, background:'transparent', color:'#0A0A0A', border:'1px solid #E8E6E1' };

// Plan comptable BTP simplifié
const COMPTES = {
  '706000': 'Prestations de services',
  '411000': 'Clients',
  '401000': 'Fournisseurs',
  '512000': 'Banque',
  '445710': 'TVA collectée',
  '445660': 'TVA déductible',
  '601000': 'Achats matières premières',
  '604000': 'Achats études et prestations',
  '611000': 'Sous-traitance générale',
  '621000': 'Personnel intérimaire',
  '625100': 'Déplacements',
  '625600': 'Missions',
  '641000': 'Rémunérations du personnel',
  '645000': 'Charges sociales',
  '681100': 'Dotation amortissements',
};

// Écritures démo (en prod viendrait de toutes les transactions)
const ECRITURES_DEMO = [
  { date:'01/04/2026', journal:'VE', piece:'FAC-2026-001', compte:'411000', libelle:'Client Dupont — Rénovation cuisine', debit:10200, credit:0 },
  { date:'01/04/2026', journal:'VE', piece:'FAC-2026-001', compte:'706000', libelle:'Prestation rénovation cuisine', debit:0, credit:8500 },
  { date:'01/04/2026', journal:'VE', piece:'FAC-2026-001', compte:'445710', libelle:'TVA collectée 20%', debit:0, credit:1700 },
  { date:'05/04/2026', journal:'HA', piece:'FA-F001', compte:'601000', libelle:'Leroy Merlin — Matériaux cuisine', debit:1200, credit:0 },
  { date:'05/04/2026', journal:'HA', piece:'FA-F001', compte:'445660', libelle:'TVA déductible 20%', debit:240, credit:0 },
  { date:'05/04/2026', journal:'HA', piece:'FA-F001', compte:'401000', libelle:'Fournisseur Leroy Merlin', debit:0, credit:1440 },
  { date:'10/04/2026', journal:'BQ', piece:'RE-001', compte:'512000', libelle:'Encaissement Dupont', debit:10200, credit:0 },
  { date:'10/04/2026', journal:'BQ', piece:'RE-001', compte:'411000', libelle:'Règlement client Dupont', debit:0, credit:10200 },
  { date:'15/04/2026', journal:'BQ', piece:'PA-001', compte:'401000', libelle:'Paiement Leroy Merlin', debit:1440, credit:0 },
  { date:'15/04/2026', journal:'BQ', piece:'PA-001', compte:'512000', libelle:'Virement fournisseur', debit:0, credit:1440 },
  { date:'30/04/2026', journal:'OD', piece:'SAL-04', compte:'641000', libelle:'Salaires bruts avril', debit:10700, credit:0 },
  { date:'30/04/2026', journal:'OD', piece:'SAL-04', compte:'645000', libelle:'Charges sociales avril', debit:4815, credit:0 },
  { date:'30/04/2026', journal:'OD', piece:'SAL-04', compte:'512000', libelle:'Virement salaires nets', debit:0, credit:8346 },
  { date:'30/04/2026', journal:'OD', piece:'SAL-04', compte:'401000', libelle:'Organismes sociaux', debit:0, credit:7169 },
  { date:'30/04/2026', journal:'VE', piece:'FAC-2026-002', compte:'411000', libelle:'Copropriété Les Oliviers — Installation élec.', debit:6960, credit:0 },
  { date:'30/04/2026', journal:'VE', piece:'FAC-2026-002', compte:'706000', libelle:'Prestation installation électrique', debit:0, credit:5800 },
  { date:'30/04/2026', journal:'VE', piece:'FAC-2026-002', compte:'445710', libelle:'TVA collectée 20%', debit:0, credit:1160 },
];

const STORAGE = 'freample_ecritures';

export default function ExportCompta() {
  const isDemo = _isDemo();
  const [ecritures, setEcritures] = useState(() => demoGet(STORAGE, isDemo ? ECRITURES_DEMO : []));
  const periode = '2026-04';
  useEffect(() => { demoSet(STORAGE, ecritures); }, [ecritures]);
  // Charger écritures réelles depuis l'API
  useEffect(() => {
    Promise.all([api.get('/finance/factures'), api.get('/finance/devis')]).then(([fac, dev]) => {
      const ecr = [];
      (fac.data?.factures || []).forEach((f, i) => {
        if (f.totalTTC) {
          const d = f.dateEmission || f.creeLe || '01/04/2026';
          ecr.push({ date:d, journal:'VE', piece:f.numero||`FAC-${i}`, compte:'411000', libelle:`Client — ${f.client?.nom||'Client'}`, debit:f.totalTTC, credit:0 });
          ecr.push({ date:d, journal:'VE', piece:f.numero||`FAC-${i}`, compte:'706000', libelle:`Prestation`, debit:0, credit:f.totalHT||f.totalTTC*0.8 });
          ecr.push({ date:d, journal:'VE', piece:f.numero||`FAC-${i}`, compte:'445710', libelle:`TVA collectée`, debit:0, credit:f.totalTTC-(f.totalHT||f.totalTTC*0.8) });
        }
      });
      if (ecr.length > 0) setEcritures(ecr);
    }).catch(() => {});
  }, []);

  const totalDebit = ecritures.reduce((s, e) => s + e.debit, 0);
  const totalCredit = ecritures.reduce((s, e) => s + e.credit, 0);
  const tvaCollectee = ecritures.filter(e => e.compte === '445710').reduce((s, e) => s + e.credit, 0);
  const tvaDeductible = ecritures.filter(e => e.compte === '445660').reduce((s, e) => s + e.debit, 0);
  const tvaNette = tvaCollectee - tvaDeductible;

  // Export FEC (Fichier des Écritures Comptables — format légal)
  const exportFEC = () => {
    // En-tête FEC conforme (Art. L47 A-I du Livre des Procédures Fiscales)
    const headers = ['JournalCode', 'JournalLib', 'EcritureNum', 'EcritureDate', 'CompteNum', 'CompteLib', 'CompAuxNum', 'CompAuxLib', 'PieceRef', 'PieceDate', 'EcritureLib', 'Debit', 'Credit', 'EcritureLet', 'DateLet', 'ValidDate', 'Montantdevise', 'Idevise'];
    const journalLibs = { VE: 'Ventes', HA: 'Achats', BQ: 'Banque', OD: 'Opérations diverses' };
    let num = 1;
    const rows = ecritures.map(e => {
      const parts = e.date.split('/');
      const dateISO = `${parts[2]}${parts[1]}${parts[0]}`;
      return [e.journal, journalLibs[e.journal] || '', String(num++), dateISO, e.compte, COMPTES[e.compte] || '', '', '', e.piece, dateISO, e.libelle, e.debit.toFixed(2).replace('.', ','), e.credit.toFixed(2).replace('.', ','), '', '', dateISO, '', ''].join('\t');
    });
    const fec = headers.join('\t') + '\n' + rows.join('\n');
    const blob = new Blob([fec], { type: 'text/tab-separated-values;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `FEC_${periode.replace('-', '')}.txt`; a.click();
  };

  // Export pour Sage / EBP (format CSV simplifié)
  const exportCSV = () => {
    const rows = [['Date', 'Journal', 'Pièce', 'Compte', 'Libellé', 'Débit', 'Crédit']];
    ecritures.forEach(e => rows.push([e.date, e.journal, e.piece, e.compte, e.libelle, e.debit || '', e.credit || '']));
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `ecritures_${periode}.csv`; a.click();
  };

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px' }}>Export comptable</h2>
      <p style={{ fontSize: 12, color: '#555', marginBottom: 16 }}>Écritures comptables, FEC légal et déclaration TVA</p>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 16 }}>
        {[
          { l: 'Écritures', v: ecritures.length, c: '#2563EB' },
          { l: 'TVA collectée', v: `${tvaCollectee.toLocaleString()}€`, c: '#DC2626' },
          { l: 'TVA déductible', v: `${tvaDeductible.toLocaleString()}€`, c: '#16A34A' },
          { l: 'TVA nette à reverser', v: `${tvaNette.toLocaleString()}€`, c: DS.gold },
        ].map(k => (
          <div key={k.l} style={{ ...CARD, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: k.c, borderRadius: '14px 14px 0 0' }} />
            <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', marginBottom: 4 }}>{k.l}</div>
            <div style={{ fontSize: 22, fontWeight: 300 }}>{k.v}</div>
          </div>
        ))}
      </div>

      {/* Déclaration TVA */}
      <div style={{ ...CARD, marginBottom: 16, borderLeft: '4px solid ' + DS.gold }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Déclaration TVA — {periode}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div style={{ background: '#FEF2F2', padding: 12, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 300, color: '#DC2626' }}>{tvaCollectee.toLocaleString()}€</div>
            <div style={{ fontSize: 10, color: '#555' }}>TVA collectée (ventes)</div>
          </div>
          <div style={{ background: '#F0FDF4', padding: 12, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 300, color: '#16A34A' }}>{tvaDeductible.toLocaleString()}€</div>
            <div style={{ fontSize: 10, color: '#555' }}>TVA déductible (achats)</div>
          </div>
          <div style={{ background: '#0A0A0A', padding: 12, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 300, color: DS.gold }}>{tvaNette.toLocaleString()}€</div>
            <div style={{ fontSize: 10, color: '#ccc' }}>TVA nette à reverser</div>
          </div>
        </div>
      </div>

      {/* Exports */}
      <div style={{ ...CARD, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Exports</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={exportFEC} style={{ ...BTN, background: '#DC2626' }}>FEC légal (Art. L47 A-I LPF)</button>
          <button onClick={exportCSV} style={{ ...BTN, background: '#2563EB' }}>CSV pour Sage / EBP</button>
          <button onClick={() => window.print()} style={BTN_O}>Imprimer le journal</button>
        </div>
        <div style={{ fontSize: 10, color: '#555', marginTop: 8 }}>Le FEC est le format obligatoire pour le contrôle fiscal (Fichier des Écritures Comptables). Le CSV est compatible Sage, EBP, Ciel et la plupart des logiciels comptables.</div>
      </div>

      {/* Journal des écritures */}
      <div style={{ ...CARD, padding: 0 }}>
        <div style={{ padding: '12px 16px', borderBottom: '2px solid #E8E6E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Journal des écritures — {periode}</span>
          <span style={{ fontSize: 11, color: '#555' }}>{ecritures.length} écritures · Équilibre : {totalDebit === totalCredit ? '✓' : '✗'} ({totalDebit.toLocaleString()}€)</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F2F2F7' }}>
              <th style={{ padding: '8px 10px', fontSize: 10, fontWeight: 700, color: '#555', textAlign: 'left', borderBottom: '2px solid #E8E6E1' }}>Date</th>
              <th style={{ padding: '8px 10px', fontSize: 10, fontWeight: 700, color: '#555', textAlign: 'left', borderBottom: '2px solid #E8E6E1' }}>Jnl</th>
              <th style={{ padding: '8px 10px', fontSize: 10, fontWeight: 700, color: '#555', textAlign: 'left', borderBottom: '2px solid #E8E6E1' }}>Pièce</th>
              <th style={{ padding: '8px 10px', fontSize: 10, fontWeight: 700, color: '#555', textAlign: 'left', borderBottom: '2px solid #E8E6E1' }}>Compte</th>
              <th style={{ padding: '8px 10px', fontSize: 10, fontWeight: 700, color: '#555', textAlign: 'left', borderBottom: '2px solid #E8E6E1' }}>Libellé</th>
              <th style={{ padding: '8px 10px', fontSize: 10, fontWeight: 700, color: '#555', textAlign: 'right', borderBottom: '2px solid #E8E6E1' }}>Débit</th>
              <th style={{ padding: '8px 10px', fontSize: 10, fontWeight: 700, color: '#555', textAlign: 'right', borderBottom: '2px solid #E8E6E1' }}>Crédit</th>
            </tr>
          </thead>
          <tbody>
            {ecritures.map((e, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : '#FAFAF8' }}>
                <td style={{ padding: '6px 10px', fontSize: 11, borderBottom: '1px solid #E8E6E1' }}>{e.date}</td>
                <td style={{ padding: '6px 10px', fontSize: 11, borderBottom: '1px solid #E8E6E1', fontWeight: 600 }}>{e.journal}</td>
                <td style={{ padding: '6px 10px', fontSize: 11, borderBottom: '1px solid #E8E6E1' }}>{e.piece}</td>
                <td style={{ padding: '6px 10px', fontSize: 11, borderBottom: '1px solid #E8E6E1', fontWeight: 600, color: '#2563EB' }}>{e.compte}</td>
                <td style={{ padding: '6px 10px', fontSize: 11, borderBottom: '1px solid #E8E6E1' }}>{e.libelle}</td>
                <td style={{ padding: '6px 10px', fontSize: 11, borderBottom: '1px solid #E8E6E1', textAlign: 'right', color: e.debit > 0 ? '#DC2626' : '#ccc' }}>{e.debit > 0 ? e.debit.toLocaleString() : ''}</td>
                <td style={{ padding: '6px 10px', fontSize: 11, borderBottom: '1px solid #E8E6E1', textAlign: 'right', color: e.credit > 0 ? '#16A34A' : '#ccc' }}>{e.credit > 0 ? e.credit.toLocaleString() : ''}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: '#0A0A0A' }}>
              <td colSpan={5} style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700, color: '#fff', borderBottom: 'none' }}>TOTAUX</td>
              <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700, color: '#FF6B6B', textAlign: 'right', borderBottom: 'none' }}>{totalDebit.toLocaleString()}</td>
              <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700, color: '#6BCB77', textAlign: 'right', borderBottom: 'none' }}>{totalCredit.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ═══ GRAND LIVRE ═══ */}
      {(() => {
        // Group ecritures by account number
        const compteMap = {};
        ecritures.forEach(e => {
          if (!compteMap[e.compte]) compteMap[e.compte] = [];
          compteMap[e.compte].push(e);
        });
        const comptesSorted = Object.keys(compteMap).sort();
        return (
          <div style={{ ...CARD, marginTop: 16 }}>
            <div style={{ padding: '0 0 12px', borderBottom: '2px solid #E8E6E1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 800 }}>Grand Livre — {periode}</span>
              <span style={{ fontSize: 11, color: '#555' }}>{comptesSorted.length} comptes</span>
            </div>
            {comptesSorted.map(compte => {
              const entries = compteMap[compte];
              let runningBalance = 0;
              const totalDebitCompte = entries.reduce((s, e) => s + e.debit, 0);
              const totalCreditCompte = entries.reduce((s, e) => s + e.credit, 0);
              return (
                <div key={compte} style={{ marginTop: 16, paddingBottom: 12, borderBottom: '1px solid #E8E6E1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#2563EB' }}>{compte}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, marginLeft: 10, color: '#333' }}>{COMPTES[compte] || 'Compte inconnu'}</span>
                    </div>
                    <span style={{ fontSize: 11, color: '#555' }}>Solde : <strong style={{ color: (totalDebitCompte - totalCreditCompte) >= 0 ? '#DC2626' : '#16A34A' }}>{Math.abs(totalDebitCompte - totalCreditCompte).toLocaleString()}€ {(totalDebitCompte - totalCreditCompte) >= 0 ? 'D' : 'C'}</strong></span>
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F2F2F7' }}>
                        {['Date', 'Pièce', 'Libellé', 'Débit', 'Crédit', 'Solde'].map(h => (
                          <th key={h} style={{ padding: '5px 8px', fontSize: 9, fontWeight: 700, color: '#555', textAlign: h === 'Débit' || h === 'Crédit' || h === 'Solde' ? 'right' : 'left', borderBottom: '1px solid #E8E6E1' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Opening balance row */}
                      <tr style={{ background: '#FAFAF8' }}>
                        <td colSpan={3} style={{ padding: '4px 8px', fontSize: 10, fontStyle: 'italic', color: '#8E8E93' }}>Solde d'ouverture</td>
                        <td style={{ padding: '4px 8px', fontSize: 10, textAlign: 'right' }}></td>
                        <td style={{ padding: '4px 8px', fontSize: 10, textAlign: 'right' }}></td>
                        <td style={{ padding: '4px 8px', fontSize: 10, textAlign: 'right', fontWeight: 600 }}>0</td>
                      </tr>
                      {entries.map((e, i) => {
                        runningBalance += e.debit - e.credit;
                        return (
                          <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : '#FAFAF8' }}>
                            <td style={{ padding: '4px 8px', fontSize: 10, borderBottom: '1px solid #F2F2F7' }}>{e.date}</td>
                            <td style={{ padding: '4px 8px', fontSize: 10, borderBottom: '1px solid #F2F2F7' }}>{e.piece}</td>
                            <td style={{ padding: '4px 8px', fontSize: 10, borderBottom: '1px solid #F2F2F7' }}>{e.libelle}</td>
                            <td style={{ padding: '4px 8px', fontSize: 10, borderBottom: '1px solid #F2F2F7', textAlign: 'right', color: e.debit > 0 ? '#DC2626' : '#ccc' }}>{e.debit > 0 ? e.debit.toLocaleString() : ''}</td>
                            <td style={{ padding: '4px 8px', fontSize: 10, borderBottom: '1px solid #F2F2F7', textAlign: 'right', color: e.credit > 0 ? '#16A34A' : '#ccc' }}>{e.credit > 0 ? e.credit.toLocaleString() : ''}</td>
                            <td style={{ padding: '4px 8px', fontSize: 10, borderBottom: '1px solid #F2F2F7', textAlign: 'right', fontWeight: 600, color: runningBalance >= 0 ? '#DC2626' : '#16A34A' }}>{Math.abs(runningBalance).toLocaleString()} {runningBalance >= 0 ? 'D' : 'C'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: '#F8F7F4' }}>
                        <td colSpan={3} style={{ padding: '6px 8px', fontSize: 10, fontWeight: 700 }}>Total {compte}</td>
                        <td style={{ padding: '6px 8px', fontSize: 10, fontWeight: 700, textAlign: 'right', color: '#DC2626' }}>{totalDebitCompte.toLocaleString()}</td>
                        <td style={{ padding: '6px 8px', fontSize: 10, fontWeight: 700, textAlign: 'right', color: '#16A34A' }}>{totalCreditCompte.toLocaleString()}</td>
                        <td style={{ padding: '6px 8px', fontSize: 10, fontWeight: 700, textAlign: 'right' }}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* ═══ BALANCE GÉNÉRALE (Trial Balance) ═══ */}
      {(() => {
        const compteMap = {};
        ecritures.forEach(e => {
          if (!compteMap[e.compte]) compteMap[e.compte] = { debit: 0, credit: 0 };
          compteMap[e.compte].debit += e.debit;
          compteMap[e.compte].credit += e.credit;
        });
        const comptesSorted = Object.keys(compteMap).sort();
        const grandTotalDebit = comptesSorted.reduce((s, c) => s + compteMap[c].debit, 0);
        const grandTotalCredit = comptesSorted.reduce((s, c) => s + compteMap[c].credit, 0);
        const isBalanced = Math.abs(grandTotalDebit - grandTotalCredit) < 0.01;

        const exportBalanceCSV = () => {
          const rows = [['N° Compte', 'Libellé', 'Total Débit', 'Total Crédit', 'Solde Débiteur', 'Solde Créditeur']];
          comptesSorted.forEach(c => {
            const d = compteMap[c].debit;
            const cr = compteMap[c].credit;
            const solde = d - cr;
            rows.push([c, COMPTES[c] || '', d.toFixed(2), cr.toFixed(2), solde > 0 ? solde.toFixed(2) : '0.00', solde < 0 ? Math.abs(solde).toFixed(2) : '0.00']);
          });
          rows.push(['', 'TOTAUX', grandTotalDebit.toFixed(2), grandTotalCredit.toFixed(2),
            comptesSorted.reduce((s, c) => { const sol = compteMap[c].debit - compteMap[c].credit; return s + (sol > 0 ? sol : 0); }, 0).toFixed(2),
            comptesSorted.reduce((s, c) => { const sol = compteMap[c].debit - compteMap[c].credit; return s + (sol < 0 ? Math.abs(sol) : 0); }, 0).toFixed(2)
          ]);
          const csv = rows.map(r => r.join(';')).join('\n');
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
          const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
          a.download = `balance_generale_${periode}.csv`; a.click();
        };

        return (
          <div style={{ ...CARD, marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <span style={{ fontSize: 16, fontWeight: 800 }}>Balance Générale — {periode}</span>
                <span style={{ marginLeft: 10, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: isBalanced ? '#F0FDF4' : '#FEF2F2', color: isBalanced ? '#16A34A' : '#DC2626' }}>{isBalanced ? 'Équilibrée' : 'Déséquilibrée'}</span>
              </div>
              <button onClick={exportBalanceCSV} style={{ ...BTN, background: '#16A34A', fontSize: 11, padding: '6px 14px' }}>Exporter CSV</button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#F2F2F7' }}>
                    {['N° Compte', 'Libellé', 'Total Débit', 'Total Crédit', 'Solde Débiteur', 'Solde Créditeur'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', fontSize: 10, fontWeight: 700, color: '#555', textAlign: h === 'N° Compte' || h === 'Libellé' ? 'left' : 'right', borderBottom: '2px solid #E8E6E1' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comptesSorted.map((c, i) => {
                    const d = compteMap[c].debit;
                    const cr = compteMap[c].credit;
                    const solde = d - cr;
                    const rowBalanced = Math.abs(solde) < 0.01;
                    return (
                      <tr key={c} style={{ background: rowBalanced ? '#F0FDF4' : i % 2 === 0 ? 'transparent' : '#FAFAF8' }}>
                        <td style={{ padding: '6px 10px', fontSize: 11, fontWeight: 700, color: '#2563EB', borderBottom: '1px solid #E8E6E1' }}>{c}</td>
                        <td style={{ padding: '6px 10px', fontSize: 11, borderBottom: '1px solid #E8E6E1' }}>{COMPTES[c] || 'Compte inconnu'}</td>
                        <td style={{ padding: '6px 10px', fontSize: 11, textAlign: 'right', color: '#DC2626', borderBottom: '1px solid #E8E6E1' }}>{d > 0 ? d.toLocaleString() : '—'}</td>
                        <td style={{ padding: '6px 10px', fontSize: 11, textAlign: 'right', color: '#16A34A', borderBottom: '1px solid #E8E6E1' }}>{cr > 0 ? cr.toLocaleString() : '—'}</td>
                        <td style={{ padding: '6px 10px', fontSize: 11, textAlign: 'right', fontWeight: 600, color: '#DC2626', borderBottom: '1px solid #E8E6E1' }}>{solde > 0 ? solde.toLocaleString() : '—'}</td>
                        <td style={{ padding: '6px 10px', fontSize: 11, textAlign: 'right', fontWeight: 600, color: '#16A34A', borderBottom: '1px solid #E8E6E1' }}>{solde < 0 ? Math.abs(solde).toLocaleString() : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: isBalanced ? '#166534' : '#991B1B' }}>
                    <td colSpan={2} style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700, color: '#fff' }}>TOTAUX</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700, color: '#FF6B6B', textAlign: 'right' }}>{grandTotalDebit.toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700, color: '#6BCB77', textAlign: 'right' }}>{grandTotalCredit.toLocaleString()}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700, color: '#FF6B6B', textAlign: 'right' }}>
                      {comptesSorted.reduce((s, c) => { const sol = compteMap[c].debit - compteMap[c].credit; return s + (sol > 0 ? sol : 0); }, 0).toLocaleString()}
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 700, color: '#6BCB77', textAlign: 'right' }}>
                      {comptesSorted.reduce((s, c) => { const sol = compteMap[c].debit - compteMap[c].credit; return s + (sol < 0 ? Math.abs(sol) : 0); }, 0).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      })()}

      {/* ═══ BALANCE ÂGÉE CLIENTS (Aged Receivables) ═══ */}
      {(() => {
        const now = new Date();
        // Parse client invoices from account 411000 (debit = invoice, credit = payment)
        const clientEntries = ecritures.filter(e => e.compte === '411000');
        // Group by piece to find unpaid invoices
        const invoiceMap = {};
        clientEntries.forEach(e => {
          if (!invoiceMap[e.piece]) invoiceMap[e.piece] = { piece: e.piece, libelle: e.libelle, date: e.date, debit: 0, credit: 0 };
          invoiceMap[e.piece].debit += e.debit;
          invoiceMap[e.piece].credit += e.credit;
        });
        const creances = Object.values(invoiceMap)
          .map(inv => {
            const montant = inv.debit - inv.credit;
            if (montant <= 0) return null; // fully paid
            const parts = inv.date.split('/');
            const dateObj = new Date(parts[2], parts[1] - 1, parts[0]);
            const ageDays = Math.floor((now - dateObj) / 86400000);
            let categorie = '0-30j';
            let catColor = '#16A34A';
            if (ageDays > 90) { categorie = '90j+'; catColor = '#DC2626'; }
            else if (ageDays > 60) { categorie = '61-90j'; catColor = '#D97706'; }
            else if (ageDays > 30) { categorie = '31-60j'; catColor = '#F59E0B'; }
            return { ...inv, montant, ageDays, categorie, catColor, client: inv.libelle.replace('Client — ', '').replace('Règlement client ', '') };
          })
          .filter(Boolean);

        const brackets = [
          { label: '0-30j', color: '#16A34A', total: creances.filter(c => c.categorie === '0-30j').reduce((s, c) => s + c.montant, 0) },
          { label: '31-60j', color: '#F59E0B', total: creances.filter(c => c.categorie === '31-60j').reduce((s, c) => s + c.montant, 0) },
          { label: '61-90j', color: '#D97706', total: creances.filter(c => c.categorie === '61-90j').reduce((s, c) => s + c.montant, 0) },
          { label: '90j+', color: '#DC2626', total: creances.filter(c => c.categorie === '90j+').reduce((s, c) => s + c.montant, 0) },
        ];
        const totalCreances = brackets.reduce((s, b) => s + b.total, 0);

        return (
          <div style={{ ...CARD, marginTop: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>Âge des créances clients — Balance âgée</div>

            {/* Summary bar */}
            {totalCreances > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', height: 28, borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
                  {brackets.filter(b => b.total > 0).map(b => (
                    <div key={b.label} style={{ width: `${(b.total / totalCreances) * 100}%`, background: b.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700, minWidth: 40 }}>
                      {b.label}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {brackets.map(b => (
                    <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: b.color }} />
                      <span style={{ fontWeight: 600 }}>{b.label}</span>
                      <span style={{ color: '#555' }}>{b.total.toLocaleString()}€</span>
                    </div>
                  ))}
                  <div style={{ fontSize: 11, fontWeight: 700, marginLeft: 'auto' }}>Total : {totalCreances.toLocaleString()}€</div>
                </div>
              </div>
            )}

            {creances.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: '#8E8E93', fontSize: 12 }}>Aucune créance client en cours. Toutes les factures sont réglées.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#F2F2F7' }}>
                      {['Client', 'Facture', 'Date', 'Montant', 'Âge (jours)', 'Catégorie'].map(h => (
                        <th key={h} style={{ padding: '8px 10px', fontSize: 10, fontWeight: 700, color: '#555', textAlign: h === 'Montant' || h === 'Âge (jours)' ? 'right' : 'left', borderBottom: '2px solid #E8E6E1' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {creances.map((c, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : '#FAFAF8' }}>
                        <td style={{ padding: '6px 10px', fontSize: 11, fontWeight: 600, borderBottom: '1px solid #E8E6E1' }}>{c.client}</td>
                        <td style={{ padding: '6px 10px', fontSize: 11, borderBottom: '1px solid #E8E6E1' }}>{c.piece}</td>
                        <td style={{ padding: '6px 10px', fontSize: 11, borderBottom: '1px solid #E8E6E1' }}>{c.date}</td>
                        <td style={{ padding: '6px 10px', fontSize: 11, fontWeight: 700, textAlign: 'right', borderBottom: '1px solid #E8E6E1' }}>{c.montant.toLocaleString()}€</td>
                        <td style={{ padding: '6px 10px', fontSize: 11, textAlign: 'right', borderBottom: '1px solid #E8E6E1' }}>{c.ageDays}j</td>
                        <td style={{ padding: '6px 10px', fontSize: 11, borderBottom: '1px solid #E8E6E1' }}>
                          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: c.catColor + '18', color: c.catColor }}>{c.categorie}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })()}

      {/* Plan comptable */}
      <div style={{ ...CARD, marginTop: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Plan comptable BTP utilisé</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {Object.entries(COMPTES).map(([num, lib]) => (
            <div key={num} style={{ fontSize: 11, padding: '3px 0', display: 'flex', gap: 8 }}>
              <span style={{ fontWeight: 700, color: '#2563EB', width: 50 }}>{num}</span>
              <span style={{ color: '#555' }}>{lib}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
